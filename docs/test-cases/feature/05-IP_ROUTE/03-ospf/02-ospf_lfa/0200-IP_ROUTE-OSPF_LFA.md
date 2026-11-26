# RFC 6571 Figure 4 Square 原图中 E1 到 MHP 的 ECMP 和单链路故障恢复

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0200-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0200`
- 用例标题：RFC 6571 Figure 4 Square 原图中 E1 到 MHP 的 ECMP 和单链路故障恢复
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
- 预估耗时：约 3 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与最短路径计算 |
| RFC 5286 | 3.1、3.2、6.1 | 链路保护、MHP |
| RFC 6571 | 3.3、Figure 4 | Square 原图的 LFA 适用性 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | C2、A1、A2 各 5 个三层接口，其余 2～3 个 | DUTB/DUTC/DUTD 为 6 口 e530 |
| DUT 数量 | 9 台 | 设备不足时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
                              P
                             / \
                           x/   \x+e
                           /     \
                          C1--c--C2
                           |\    | \
                           | \   |  +-------+
                       d/u |  \  |           \
                           |   +-|-----+      \
                           |     |      \      \
                          A1--a--A2     A3--a--A4
                           |\   /|       |    /
                           | \ / |       |   /
                        d/u|  \  |d/u    |  /
                           | / \ |       | /
                           |/   \|       |/
                          E1     E2      E3
```

拓扑名称 / 来源：`nine_devices_topo_links_type_2`（内置拓扑）。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| C1-C2 | 10.1.2.0/24 | C1=10.1.2.1，C2=10.1.2.2 | 1 |
| C1-A1 | 10.1.3.0/24 | C1=10.1.3.1，A1=10.1.3.2 | 1 |
| C1-A2 | 10.1.4.0/24 | C1=10.1.4.1，A2=10.1.4.2 | 1 |
| C2-A1 | 10.2.3.0/24 | C2=10.2.3.1，A1=10.2.3.2 | 1 |
| C2-A2 | 10.2.4.0/24 | C2=10.2.4.1，A2=10.2.4.2 | 1 |
| C2-A3 | 10.2.5.0/24 | C2=10.2.5.1，A3=10.2.5.2 | 1 |
| C2-A4 | 10.2.6.0/24 | C2=10.2.6.1，A4=10.2.6.2 | 1 |
| A1-A2 | 10.3.4.0/24 | A1=10.3.4.1，A2=10.3.4.2 | 1 |
| A1-E1 | 10.3.7.0/24 | A1=10.3.7.1，E1=10.3.7.2 | 1 |
| A1-E2 | 10.3.8.0/24 | A1=10.3.8.1，E2=10.3.8.2 | 1 |
| A2-E1 | 10.4.7.0/24 | A2=10.4.7.1，E1=10.4.7.2 | 1 |
| A2-E2 | 10.4.8.0/24 | A2=10.4.8.1，E2=10.4.8.2 | 1 |
| A3-A4 | 10.5.6.0/24 | A3=10.5.6.1，A4=10.5.6.2 | 1 |
| A3-E3 | 10.5.9.0/24 | A3=10.5.9.1，E3=10.5.9.2 | 1 |
| A4-E3 | 10.6.9.0/24 | A4=10.6.9.1，E3=10.6.9.2 | 1 |
| Loopback0 | 主机路由 | 10.255.0.1/32 ～ 10.255.0.9/32 | 1 |
| MHP P | 主机路由 | 192.0.2.1/32，C1/C2 双端发布 | 1 |

全部链路开销为 1。C1、C2 上配置相同的 `192.0.2.1/32` 作为 anycast/MHP，必须显式配置 OSPF `router-id`。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Router ID | 10.255.0.1 ～ 10.255.0.9 | 显式配置 |
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

DUTA（C1）：

```text
configure terminal
interface <PortA>
no switchport
ip address 10.1.2.1/24
ip ospf network point-to-point
ip ospf cost 1
exit
interface <PortB>
no switchport
ip address 10.1.3.1/24
ip ospf network point-to-point
ip ospf cost 1
exit
interface <PortC>
no switchport
ip address 10.1.4.1/24
ip ospf network point-to-point
ip ospf cost 1
exit
interface loopback0
ip address 10.255.0.1/32
exit
interface loopback1
ip address 192.0.2.1/32
exit
router ospf
router-id 10.255.0.1
network 10.1.2.0/24 area 0
network 10.1.3.0/24 area 0
network 10.1.4.0/24 area 0
network 10.255.0.1/32 area 0
network 192.0.2.1/32 area 0
exit
end
```

DUTB～DUTI 按第 2 节地址配置；DUTB（C2）同样配置 `192.0.2.1/32` 的 loopback1。各设备在 `router ospf` 视图使能 `fast-reroute per-prefix enable`；全部邻居 `Full` 后，等待保护表刷新，再执行 4.2 基线检查。

### 4.2 基线检查与执行顺序

执行顺序：4.2 基线检查 → 4.3.1 → 4.4.1 → 4.3.2 → 4.4.2。

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 检查邻居 | `show ip ospf neighbor` | 所有直连邻居均为 `Full` |
| 2 | 检查 E1 到 P 的 ECMP | `show ip route 192.0.2.1`（DUTG） | 同时出现 `10.3.7.1, via` 和 `10.4.7.1, via` |
| 3 | 检查 LFA 状态 | `show ip ospf fast-reroute per-prefix`（DUTG） | `Fast-reroute per-prefix : enabled`，`Calculation` 的 `runs` 大于 0，`Protected by LFA` 大于 0 |
| 4 | 检查基线连通性 | `ping 192.0.2.1` | `0% packet loss` |

### 4.3 触发与流量发送

#### 4.3.1 周期 1：E1-A1 链路故障

关闭 DUTG 的 `<PortA>`：

```text
configure terminal
interface <PortA>
shutdown
end
```

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 故障 1 | DUTG 的 `<PortA>` 执行 `shutdown` | E1-A1 邻居断开，E1 到 P 的流量切换到 A2 |
| 路由切换 | 等待 `show ip route 192.0.2.1` 刷新 | 下一跳为 `10.4.7.1, via` |
| 故障期间连通性 | `ping 192.0.2.1` | `0% packet loss` |

#### 4.3.2 周期 2：C1-C2 链路故障

本周期在 4.4.1 完成周期 1 恢复后执行。关闭 DUTA 的 `<PortA>`：

```text
configure terminal
interface <PortA>
shutdown
end
```

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 故障 2 | DUTA 的 `<PortA>` 执行 `shutdown` | C1-C2 邻居断开，远端 E3 到 P 的路由保持不变，仍经 A3 或 A4 |
| 路由保持 | 等待 `show ip route 192.0.2.1` 刷新（DUTI） | 路由仍存在，下一跳为 `10.5.9.1` 或 `10.6.9.1` |
| 故障期间连通性 | `ping 192.0.2.1`（DUTI） | `0% packet loss` |

### 4.4 恢复

#### 4.4.1 周期 1 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 链路恢复 | DUTG 的 `<PortA>` 执行 `no shutdown` | E1-A1 邻居重新为 `Full` |
| ECMP 恢复 | `show ip route 192.0.2.1` | 同时出现 `10.3.7.1, via` 和 `10.4.7.1, via` |

#### 4.4.2 周期 2 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 链路恢复 | DUTA 的 `<PortA>` 执行 `no shutdown` | C1-C2 邻居重新为 `Full` |
| 保护恢复 | `show ip ospf fast-reroute per-prefix`（DUTA） | `Protected by LFA` 大于 0 |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 基线时所有直连邻居 `Full`；两个故障周期分别导致 E1-A1、C1-C2 邻居断开并在恢复后重新 `Full` |
| 表项面 | `show ip route 192.0.2.1` | 基线时 E1 形成 `10.3.7.1` 与 `10.4.7.1` 的 ECMP；周期 1 故障后仅保留 `10.4.7.1`；周期 2 故障后 E3 仍有 `10.5.9.1` 或 `10.6.9.1` 下一跳 |
| 保护表面 | `show ip ospf fast-reroute per-prefix`（基线 DUTG，周期 2 恢复 DUTA） | `Calculation` 的 `runs` 大于 0；`Protected by LFA` 基线和周期 2 恢复后均大于 0 |
| 转发面 | `ping 192.0.2.1` | 基线、两个故障周期内均为 `0% packet loss` |
| 恢复 / 资源面 | `show ip route 192.0.2.1`、`show ip ospf fast-reroute per-prefix` | 周期 1 恢复后 ECMP 恢复；周期 2 恢复后保护计数大于 0 |

### 4.6 判定标准

- 4.2 步骤 1 至 4：所有直连邻居为 `Full`；`192.0.2.1` 在 E1 形成 `10.3.7.1` 与 `10.4.7.1` 的 ECMP；`Fast-reroute per-prefix : enabled`，`Calculation` 的 `runs` 大于 0 且 `Protected by LFA` 大于 0；`ping 192.0.2.1` 为 `0% packet loss`。
- 4.3.1 步骤 1 至 3：E1 到 `192.0.2.1` 的下一跳切换为 `10.4.7.1`；`ping 192.0.2.1` 为 `0% packet loss`。
- 4.4.1 步骤 1 至 2：E1-A1 邻居重新 `Full`；E1 恢复 `10.3.7.1` 与 `10.4.7.1` 的 ECMP。
- 4.3.2 步骤 1 至 3：DUTI 到 `192.0.2.1` 的路由存在且下一跳为 `10.5.9.1` 或 `10.6.9.1`；`ping 192.0.2.1` 为 `0% packet loss`。
- 4.4.2 步骤 1 至 2：C1-C2 邻居重新 `Full`；DUTA 的 `Protected by LFA` 大于 0。
- 上述必检项全部满足，且清理后无 `router ospf`、`fast-reroute`、`loopback1` 残留 → `Pass`。
- 上述任一必检项不满足，或清理失败 → `Fail`。
- LFA 命令不可用、9 台设备或所需端口不足、Square 拓扑无法建立、邻居无法 `Full` → `Blocked`，记录缺失项。

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
interface <PortB/PortC/PortD/PortE>
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
show running-config | include fast-reroute
show ip ospf processes-count
```

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 拓扑说明 | 本用例为 RFC 6571 Figure 4 Square 原图，9 台设备、15 条链路 |
| 2 | 端口要求 | C2、A1、A2 各需 5 口，分别映射到 DUTB/DUTC/DUTD（6 口 e530） |
| 3 | 负向观测 | RFC 6571 3.3.4 指出 C1 对 A1 没有 LFA；本用例不把该条目作为必检项，记录实际输出即可 |
| 4 | MHP 说明 | `192.0.2.1/32` 在 C1、C2 上重复配置，属于 anycast/MHP |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | `Pass` / `Fail` / `Blocked` |
| 实际观测 | 记录邻居、ECMP 下一跳、LFA 计数、故障前后路由和 ping 结果 |
| 证据 | 回显 / 抓包文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0200` | | | |
