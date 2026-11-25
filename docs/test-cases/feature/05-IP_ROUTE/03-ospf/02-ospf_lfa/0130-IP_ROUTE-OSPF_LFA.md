# RFC 6571 Triangle 拓扑中直连链路故障后可通过第三条边恢复

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0130-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0130`
- 用例标题：RFC 6571 Triangle 拓扑中直连链路故障后可通过第三条边恢复
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
- 预估耗时：约 5 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与最短路径计算 |
| RFC 5286 | 3.1、3.2 | 链路/节点保护 LFA 的基本无环条件 |
| RFC 6571 | 3.1、Figure 2 | Triangle 拓扑的 LFA 适用性；链路保护覆盖所有重要路由 |
| RFC 6571 | 3.8 | Triangle 的逐前缀 LFA 与逐链路 LFA 覆盖相同 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | 每台设备 2 个三层接口 | 接口需支持 `no switchport` |
| 拓扑后端 | 三设备三角拓扑可建立 | 邻居无法 Full 时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

链路矩阵（行 -> 列，值为本端端口-对端端口）：

| 本端 | DUTB | DUTC |
| --- | --- | --- |
| DUTA | PortA-PortA | PortB-PortB |
| DUTB | — | PortB-PortA |

```text
       DUTA -------- DUTB
         \          /
          \        /
           \      /
            DUTC
```

每条边都是一对一的点对点链路。

拓扑名称 / 来源：`three_devices_topo_links_type_3`（内置拓扑）。拓扑中 A PortC <=> C PortC 的并行链路保持二层默认状态，不参与 OSPF。

| 设备 | 角色 | 接口 | 地址 | 开销 | 连接对端 |
| --- | --- | --- | --- | --- | --- |
| DUTA | C1 | PortA | 10.0.12.1/24 | 1 | DUTB PortA |
| DUTA | C1 | PortB | 10.0.13.1/24 | 1 | DUTC PortB |
| DUTB | C2 | PortA | 10.0.12.2/24 | 1 | DUTA PortA |
| DUTB | C2 | PortB | 10.0.23.1/24 | 1 | DUTC PortA |
| DUTC | E1 | PortB | 10.0.13.2/24 | 1 | DUTA PortB |
| DUTC | E1 | PortA | 10.0.23.2/24 | 1 | DUTB PortB |
| 各设备 | — | loopback0 | A=1.1.1.1/32、B=2.2.2.2/32、C=3.3.3.3/32 | 1 | — |

A 到 C 的主路径为直连 A-C（开销 1），备份路径为 A-B-C（开销 2）。邻居 B 满足 RFC 5286 Inequality 1：

```text
D_opt(B,C)=1 < D_opt(B,A)=1 + D_opt(A,C)=1 = 2
```

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Area | 0 | 单区域 |
| Network Type | point-to-point | 排除广播网 DR/BDR 影响 |
| Hello / Dead | 10s / 40s | 设备默认值 |
| LFA | `fast-reroute per-prefix enable` | 在初始 OSPF 配置中使能 |

### 3.2 初始状态

- 接口处于默认二层状态；OSPF 进程、Loopback、L3 地址和 LFA 配置为空。
- 拓扑后端已建立并启用对应链路。
- 现场保留：默认清理。

## 4. 测试步骤与预期结果

### 4.1 配置

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 10.0.12.1/24
ip ospf network point-to-point
ip ospf cost 1
exit
interface <PortB>
no switchport
ip address 10.0.13.1/24
ip ospf network point-to-point
ip ospf cost 1
exit
interface loopback0
ip address 1.1.1.1/32
exit
router ospf
network 10.0.12.0/24 area 0
network 10.0.13.0/24 area 0
network 1.1.1.1/32 area 0
exit
end
```

DUTB、DUTC 按第 2 节地址与开销对称配置，并在各设备 OSPF 进程视图使能：

```text
fast-reroute per-prefix enable
```

### 4.2 基线检查与执行顺序

| 顺序 | 观测项 | 命令 | 预期 |
| --- | --- | --- | --- |
| 1 | 邻居 | `show ip ospf neighbor` | A-B、A-C、B-C 邻居 `Full` |
| 2 | LFA 使能 | `show ip ospf fast-reroute per-prefix` | `Area 0.0.0.0`；`Fast-reroute per-prefix : enabled` |
| 3 | 区域内前缀 | `show ip ospf fast-reroute per-prefix` | `Intra-area prefixes` 大于 0 |
| 4 | 受保护前缀 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| 5 | 主路径 | `show ip ospf route` | `3.3.3.3/32` 经 `via 10.0.13.2` |
| 6 | 连通性 | `ping 3.3.3.3` | `0% packet loss` |

基线检查通过后，按 4.3 关闭 A-C 链路，按 4.4 恢复 A-C 链路。

### 4.3 触发与流量发送

本用例不使用测试仪，触发方式为链路故障注入。

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 直连链路故障 | 关闭 DUTA 的 `<PortB>`，模拟 A-C 直连链路故障 | `show ip route 3.3.3.3` 出现 `10.0.12.2, via <接口>` |
| OSPF 路由切换 | 执行 `show ip ospf route` | `3.3.3.3/32` 切换为 `via 10.0.12.2` |
| 连通性 | 执行 `ping 3.3.3.3` | `0% packet loss` |

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 直连链路恢复 | DUTA `<PortB>` 执行 `no shutdown` | 路由回到 `via 10.0.13.2` |
| LFA 复核 | 执行 `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| 连通性 | 执行 `ping 3.3.3.3` | `0% packet loss` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | A-B、A-C、B-C 邻居 `Full` |
| 表项面 | `show ip route 3.3.3.3`、`show ip ospf route` | 故障前经 `10.0.13.2`，故障后经 `10.0.12.2` |
| 计数 / 告警面 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0，恢复后重新大于 0 |
| 转发面 | `ping 3.3.3.3` | 丢包率 = 0% |
| 恢复 / 资源面 | 恢复后的路由与 LFA 计数 | 主路径与保护计数恢复 |

### 4.6 判定标准

- 步骤 1：`show ip ospf neighbor` 中 A-B、A-C、B-C 邻居均为 `Full`。
- 步骤 2：`show ip ospf fast-reroute per-prefix` 显示 `Area 0.0.0.0` 和 `Fast-reroute per-prefix : enabled`，`Intra-area prefixes` 大于 0，`Protected by LFA` 大于 0。
- 步骤 3：`show ip ospf route` 中 `3.3.3.3/32` 的下一跳为 `via 10.0.13.2`；`ping 3.3.3.3` 丢包率 = 0%。
- 步骤 4：关闭 `<PortB>` 后，`show ip route 3.3.3.3` 出现 `10.0.12.2, via <接口>`，`show ip ospf route` 中 `3.3.3.3/32` 切换为 `via 10.0.12.2`。
- 步骤 5：故障期间 `ping 3.3.3.3` 丢包率 = 0%。
- 步骤 6：恢复 `<PortB>` 后，路由回到 `via 10.0.13.2`，`Protected by LFA` 大于 0，`ping 3.3.3.3` 丢包率 = 0%。
- Pass：步骤 1 至 6 全部满足，且第 5 章清理成功。
- Fail：步骤 1 至 6 任一必检项不满足，或清理失败。
- Blocked：邻居无法进入 `Full`、设备不支持 `fast-reroute per-prefix enable`，或拓扑后端无法建立三设备三角拓扑。

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
interface <PortB>
no shutdown
no ip ospf cost
no ip ospf network
no ip address
switchport
exit
no interface loopback0
end
```

拓扑中的 A PortC 与 C PortC 未配置，不需要额外清理。清理后检查：

```text
show running-config | include router ospf
show running-config | include fast-reroute
show ip ospf processes-count
```

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 拓扑裁剪 | RFC 6571 Figure 2 含 C1、C2、E1、E2 四类节点；受四设备环境限制，本用例用 C1、C2、E1 三个节点构成最小 Triangle，覆盖直连主链路与第三条边备份的核心行为 |
| 2 | 配置时序 | 本用例在初始 OSPF 配置中使能 LFA，邻居 Full 后检查保护计数与路由收敛 |
| 3 | 版本差异 | LFA 命令不可用时标记 `Blocked`，不将版本差异判为功能失败 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | 待执行 / - |
| 结论 | `待执行` |
| 实际观测 | 待执行；需记录邻居、LFA 计数、故障前后下一跳和 ping 结果 |
| 证据 | - |
| 关联缺陷 / 需求 | - |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0130` | `待执行` | 待执行；需记录邻居、LFA 计数、故障前后下一跳和 ping 结果 | - |
