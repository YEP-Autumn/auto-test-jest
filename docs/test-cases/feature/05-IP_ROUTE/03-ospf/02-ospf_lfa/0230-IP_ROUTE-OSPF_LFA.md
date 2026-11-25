# 双 ASBR 发布同一外部前缀时，主路径故障后流量切换到备用 ASBR

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0230-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0230`
- 用例标题：双 ASBR 发布同一外部前缀时，主路径故障后流量切换到备用 ASBR
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
- 预估耗时：约 2 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | 12.4、AS-External-LSA | Type-2 外部路由的泛洪与选择 |
| RFC 5286 | 6.1、6.3 | 多归前缀与 AS 外部路由的 LFA 适用性限制 |
| RFC 8518 | 2、4.2、4.2.1 | 多个 ASBR 发布同一外部前缀时的备份选择 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | 每台设备 2～3 个三层接口 | 接口需支持 `no switchport` |
| 外部路由 | 支持 `redistribute connected metric ... metric-type 2` | 不支持时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
            S = DUTA
          / | \
         /  |  \
   N1=DUTB N2=DUTC B=DUTD
        \   /    \
         E = DUTE ---- DUTF = F
```

拓扑名称 / 来源：`six_devices_topo_links_type_3`（内置拓扑）。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| S-N2 | 10.1.3.0/24 | S=10.1.3.1，N2=10.1.3.2 | 4 |
| S-B | 10.1.4.0/24 | S=10.1.4.1，B=10.1.4.2 | 3 |
| S-N1 | 10.1.2.0/24 | S=10.1.2.1，N1=10.1.2.2 | 10 |
| N1-E | 10.2.5.0/24 | N1=10.2.5.1，E=10.2.5.2 | 5 |
| N2-B | 10.3.4.0/24 | N2=10.3.4.1，B=10.3.4.2 | 4 |
| B-F | 10.4.6.0/24 | B=10.4.6.1，F=10.4.6.2 | 1 |
| E-F | 10.5.6.0/24 | E=10.5.6.1，F=10.5.6.2 | 16 |
| Loopback0 | 主机路由 | 10.255.0.1/32 ～ 10.255.0.6/32 | 1 |
| 外部前缀 | 主机路由 | E、F 双端 `198.51.100.1/32` | Type-2，metric 20 |

E、F 上配置相同的 `198.51.100.1/32` loopback1，并通过 `redistribute connected metric 20 metric-type 2` 作为同一外部前缀发布；两个 ASBR 的外部类型与外部 cost 相同。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Router ID | 10.255.0.1 ～ 10.255.0.6 | 显式配置 |
| Area | 0 | 单区域 |
| Network Type | point-to-point | 排除广播网 DR/BDR 影响 |
| Hello / Dead | 10s / 40s | 设备默认值 |
| 外部路由 | `redistribute connected metric 20 metric-type 2` | E、F 均为 ASBR |
| LFA | `fast-reroute per-prefix enable` | 在初始 OSPF 配置中使能 |

### 3.2 初始状态

- 接口处于默认二层状态；OSPF 进程、Loopback、L3 地址和外部分布配置为空。
- 拓扑后端已建立并启用对应链路。
- 现场保留：默认清理。

## 4. 测试步骤与预期结果

### 4.1 配置

DUTA（S）：

```text
configure terminal
interface <PortA>
no switchport
ip address 10.1.3.1/24
ip ospf network point-to-point
ip ospf cost 4
exit
interface <PortB>
no switchport
ip address 10.1.4.1/24
ip ospf network point-to-point
ip ospf cost 3
exit
interface <PortC>
no switchport
ip address 10.1.2.1/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface loopback0
ip address 10.255.0.1/32
exit
router ospf
router-id 10.255.0.1
network 10.1.3.0/24 area 0
network 10.1.4.0/24 area 0
network 10.1.2.0/24 area 0
network 10.255.0.1/32 area 0
exit
end
```

DUTB、DUTC、DUTD 按第 2 节地址配置。DUTE（E）、DUTF（F）额外配置：

```text
interface loopback1
ip address 198.51.100.1/32
exit
router ospf
redistribute connected metric 20 metric-type 2
exit
```

全部邻居 `Full` 后，在各设备 OSPF 进程视图执行 `fast-reroute per-prefix enable`。

### 4.2 基线检查与执行顺序

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 配置生效 | `show running-config \| include router ospf`、`show running-config \| include redistribute`、`show running-config \| include fast-reroute` | 各设备存在 OSPF 进程，E、F 存在外部分布配置，各设备存在 LFA 配置 |
| 2 | 邻居基线 | `show ip ospf neighbor` | 所有直连邻居均为 `Full` |
| 3 | 外部路由存在 | `show ip ospf route` | 存在 `E2 198.51.100.1/32` |
| 4 | 主 ASBR 基线 | `show ip route 198.51.100.1` | 下一跳为 `10.1.4.2`（经 B/F） |
| 5 | LFA 计算 | `show ip ospf fast-reroute per-prefix` | `Calculation` 的 `runs` 大于 0 |
| 6 | 连通性基线 | `ping 198.51.100.1` | `0% packet loss` |
| 7 | 触发周期 1 | 关闭 DUTA 的 `<PortB>` | 见 4.3.1 |
| 8 | 触发周期 2 | 在周期 1 未恢复时再关闭 DUTA 的 `<PortA>` | 见 4.3.2 |
| 9 | 恢复链路 | 恢复 DUTA 的 `<PortA>`、`<PortB>` | 见 4.4 |

### 4.3 触发与流量发送

本用例不使用测试仪流量，触发方式为两周期链路故障注入。

#### 4.3.1 周期 1：S-B 链路故障

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 故障 1 | 关闭 DUTA 的 `<PortB>`，模拟 S-B 链路故障 | `10.1.4.2` 邻居断开，外部前缀切换到 N2 方向 |
| 路由检查 | `show ip route 198.51.100.1` | 下一跳切换为 `10.1.3.2`，即经 N2-B-F 到达 F |
| 转发检查 | `ping 198.51.100.1` | `0% packet loss` |

#### 4.3.2 周期 2：S-N2 链路故障

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 故障 2 | 再关闭 DUTA 的 `<PortA>`，模拟 S-N2 链路故障 | F 侧路径不可用，外部前缀切换到 E 方向 |
| 路由检查 | `show ip route 198.51.100.1` | 下一跳切换为 `10.1.2.2`，即经 N1-E 到达 E |
| 表项检查 | `show ip ospf route` | 仍存在 `E2 198.51.100.1/32` |
| 转发检查 | `ping 198.51.100.1` | `0% packet loss` |

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 链路恢复 | 在 DUTA 的 `<PortA>`、`<PortB>` 执行 `no shutdown` | 两个直连邻居恢复 `Full` |
| 外部前缀回切 | `show ip route 198.51.100.1` | 下一跳回到 `10.1.4.2` |
| 外部路由复查 | `show ip ospf route` | 存在 `E2 198.51.100.1/32` |
| 转发恢复 | `ping 198.51.100.1` | `0% packet loss` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 各周期直连邻居按链路状态为 `Full` 或断开 |
| 表项面 | `show ip ospf route`、`show ip route 198.51.100.1` | 始终存在 `E2 198.51.100.1/32`；下一跳按周期依次为 `10.1.4.2`、`10.1.3.2`、`10.1.2.2` |
| 计数 / 告警面 | `show ip ospf fast-reroute per-prefix` | `Calculation` 的 `runs` 大于 0 |
| 转发面 | `ping 198.51.100.1` | 基线、两个故障周期和恢复后丢包率均为 0% |
| 恢复 / 资源面 | 恢复链路后复查邻居与路由 | 下一跳回到 `10.1.4.2`，外部路由条目保留 |

### 4.6 判定标准

- 步骤 1 至 6：配置项存在；邻居状态为 `Full`；`show ip ospf route` 存在 `E2 198.51.100.1/32`；`show ip route 198.51.100.1` 下一跳为 `10.1.4.2`；`runs` 大于 0；丢包率 = 0%。
- 步骤 7：关闭 `<PortB>` 后，下一跳变为 `10.1.3.2`，丢包率 = 0%。
- 步骤 8：再关闭 `<PortA>` 后，下一跳变为 `10.1.2.2`，`E2 198.51.100.1/32` 仍存在，丢包率 = 0%。
- 步骤 9：恢复 `<PortA>`、`<PortB>` 后，下一跳回到 `10.1.4.2`，丢包率 = 0%，且第 5 章清理检查通过。
- `Pass`：上述必检项全部满足，且清理后无 OSPF、外部分布与 LFA 配置残留。
- `Fail`：任一必检项不满足，或清理后仍存在协议或外部分布配置残留。
- `Blocked`：设备不支持 `redistribute connected metric ... metric-type 2` 或 `fast-reroute per-prefix enable`，或邻居无法达到 `Full`。

## 5. 清理与恢复

各设备执行：

```text
configure terminal
no router ospf
interface <PortA>
no shutdown
no ip ospf cost
no ip ospf network
no ip address
switchport
exit
interface <PortB/PortC>
no shutdown
no ip ospf cost
no ip ospf network
no ip address
switchport
exit
no interface loopback0
no interface loopback1
end
```

清理后检查：

```text
show running-config | include router ospf
show running-config | include redistribute
show running-config | include fast-reroute
show ip ospf processes-count
```

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 拓扑说明 | 复用 RFC 8518 Figure 2 的 6 设备拓扑，E、F 作为双 ASBR |
| 2 | 外部前缀 | 两端配置相同的 `198.51.100.1/32`，通过 `redistribute connected` 生成 Type-2 外部路由 |
| 3 | 选择规则 | 外部 cost 相同时，按到 ASBR 的内部开销选择；故障后由路由收敛切换到备用 ASBR |
| 4 | 观测限制 | 本用例不把 AS 外部路由的 `Protected by LFA` 作为必检项，RFC 5286 6.3 已说明该场景不应使用 LFA |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | `Pass` / `Fail` / `Blocked` |
| 实际观测 | 记录邻居、外部路由条目、故障前后下一跳和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0230` | `Pass` / `Fail` / `Blocked` | | |
