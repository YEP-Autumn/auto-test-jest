# RFC 6571 Figure 5 Extended U 中 C1/C2 通过隧道形成逻辑邻居并保持 LFA 覆盖

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0210-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0210`
- 用例标题：RFC 6571 Figure 5 Extended U 中 C1/C2 通过隧道形成逻辑邻居并保持 LFA 覆盖
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P2 / 功能
- 执行方式：自动化工具 / 手工
- 预估耗时：约 3 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | 隧道接口上的 OSPF 邻居与最短路径计算 |
| RFC 2784 / 2890 | GRE | 隧道封装与解封装 |
| RFC 5286 | 3.1、3.2、6.1 | 链路保护、MHP |
| RFC 6571 | 3.4、Figure 5 | Extended U 原图的 LFA 适用性 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | C2、A1、A2 各 5 个三层接口，其余 2～3 个 | DUTB/DUTC/DUTD 为 6 口 e530 |
| DUT 数量 | 9 台 | 设备不足时标记 `Blocked` |
| 隧道能力 | 支持 `interface tunnel`、`tunnel mode gre`、`tunnel source/destination` | 不支持时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
                              P
                             / \
                           x/   \x+e
                           /     \
                          C1<...>C2        <...> = GRE tunnel
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

拓扑名称 / 来源：`nine_devices_topo_links_type_3`（Square 去掉 C1-C2 直连）。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
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
| Tunnel1 | 10.100.0.0/24 | C1=10.100.0.1，C2=10.100.0.2 | 1 |
| Loopback0 | 主机路由 | 10.255.0.1/32 ～ 10.255.0.9/32 | 1 |
| MHP P | 主机路由 | 192.0.2.1/32，C1/C2 双端发布 | 1 |

C1、C2 之间没有 L1 直连链路，使用 GRE 隧道模拟 L2 逻辑路径：

```text
interface tunnel 1
tunnel mode gre
tunnel source loopback0
tunnel destination <对端 Loopback0>
ip address 10.100.0.1/24
ip ospf network point-to-point
ip ospf cost 1
```

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Router ID | 10.255.0.1 ～ 10.255.0.9 | 显式配置 |
| Area | 0 | 单区域 |
| Network Type | point-to-point | 物理接口和隧道接口均配置 |
| Hello / Dead | 10s / 40s | 设备默认值 |
| 隧道 | GRE，源/目的为 Loopback0 | 隧道接口参与 OSPF |
| LFA | `fast-reroute per-prefix enable` | 在初始 OSPF 配置中使能 |

### 3.2 初始状态

- 接口处于默认二层状态；OSPF 进程、Loopback、L3 地址、隧道和 LFA 配置为空。
- 拓扑后端已建立并启用对应链路。
- 现场保留：默认清理。

## 4. 测试步骤与预期结果

### 4.1 配置

DUTA（C1）：

```text
configure terminal
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
interface tunnel 1
tunnel mode gre
tunnel source loopback0
tunnel destination 10.255.0.2
ip address 10.100.0.1/24
ip ospf network point-to-point
ip ospf cost 1
exit
router ospf
router-id 10.255.0.1
network 10.1.3.0/24 area 0
network 10.1.4.0/24 area 0
network 10.100.0.0/24 area 0
network 10.255.0.1/32 area 0
network 192.0.2.1/32 area 0
exit
end
```

DUTB（C2）按第 2 节地址配置，并配置目的地址为 `10.255.0.1` 的隧道。DUTC～DUTI 按第 2 节地址配置。各设备在 `router ospf` 视图使能 `fast-reroute per-prefix enable`；全部邻居 `Full` 后，等待保护表刷新，再执行 4.2 基线检查。

### 4.2 基线检查与执行顺序

执行顺序：4.2 基线检查 → 4.3 触发与流量发送 → 4.4 恢复。

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 检查物理邻居 | `show ip ospf neighbor` | 所有物理直连邻居均为 `Full` |
| 2 | 检查隧道邻居 | `show ip ospf neighbor`（DUTA、DUTB） | DUTA 出现 `10.255.0.2` 的 `Full`，DUTB 出现 `10.255.0.1` 的 `Full` |
| 3 | 检查隧道连通性 | `ping 10.100.0.2`（DUTA） | `0% packet loss` |
| 4 | 检查 E1 到 P 的 ECMP | `show ip route 192.0.2.1`（DUTG） | 同时出现 `10.3.7.1, via` 和 `10.4.7.1, via` |
| 5 | 检查 LFA 状态 | `show ip ospf fast-reroute per-prefix`（DUTG） | `Calculation` 的 `runs` 大于 0，`Protected by LFA` 大于 0 |
| 6 | 检查基线连通性 | `ping 192.0.2.1` | `0% packet loss` |

### 4.3 触发与流量发送

关闭 DUTG 的 `<PortA>`，模拟 E1-A1 链路故障：

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

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 链路恢复 | DUTG 的 `<PortA>` 执行 `no shutdown` | E1-A1 邻居重新为 `Full` |
| ECMP 恢复 | `show ip route 192.0.2.1` | 同时出现 `10.3.7.1, via` 和 `10.4.7.1, via` |
| 保护恢复 | `show ip ospf fast-reroute per-prefix`（DUTG） | `Protected by LFA` 大于 0 |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 物理邻居均为 `Full`；DUTA 与 DUTB 通过 Tunnel1 互为 `Full` 邻居 |
| 表项面 | `show ip route 192.0.2.1`、`show ip ospf route` | 基线时 E1 形成 `10.3.7.1` 与 `10.4.7.1` 的 ECMP；故障后仅保留 `10.4.7.1` |
| 保护表面 | `show ip ospf fast-reroute per-prefix`（DUTG） | `Calculation` 的 `runs` 大于 0；`Protected by LFA` 基线和恢复后均大于 0 |
| 转发面 | `ping 10.100.0.2`、`ping 192.0.2.1` | 隧道连通性和 MHP 连通性均为 `0% packet loss` |
| 恢复 / 资源面 | `show ip route 192.0.2.1`、`show ip ospf neighbor` | 恢复后 ECMP、保护计数和 E1-A1 邻居回到基线 |

### 4.6 判定标准

- 4.2 步骤 1 至 6：物理邻居均为 `Full`；DUTA 与 DUTB 的隧道邻居互为 `Full`；`ping 10.100.0.2` 为 `0% packet loss`；E1 到 `192.0.2.1` 形成 `10.3.7.1` 与 `10.4.7.1` 的 ECMP；`Fast-reroute per-prefix : enabled`，`Calculation` 的 `runs` 大于 0 且 `Protected by LFA` 大于 0；`ping 192.0.2.1` 为 `0% packet loss`。
- 4.3 步骤 1 至 3：E1 到 `192.0.2.1` 的下一跳切换为 `10.4.7.1`；`ping 192.0.2.1` 为 `0% packet loss`。
- 4.4 步骤 1 至 3：E1-A1 邻居重新 `Full`；E1 恢复 `10.3.7.1` 与 `10.4.7.1` 的 ECMP；DUTG 的 `Protected by LFA` 大于 0。
- 上述必检项全部满足，且清理后无 `router ospf`、`interface tunnel`、`fast-reroute`、`loopback1` 残留 → `Pass`。
- 上述任一必检项不满足，或清理失败 → `Fail`。
- LFA 命令不可用、隧道接口无法承载 OSPF、9 台设备或所需端口不足、Square 去掉 C1-C2 直连的拓扑无法建立、邻居无法 `Full` → `Blocked`，记录缺失项。
- 隧道开销对 LFA 无环条件的影响作为观测记录，不计入 `Pass` / `Fail` 判定。

## 5. 清理与恢复

各设备执行：

```text
configure terminal
no router ospf
no interface tunnel 1
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
show running-config | include interface tunnel
show running-config | include fast-reroute
show ip ospf processes-count
```

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 拓扑说明 | 本用例为 RFC 6571 Figure 5 Extended U，使用 9 台设备，C1-C2 无直连 |
| 2 | 隧道实现 | 用 GRE over Loopback 模拟 C1/C2 之间的 L2 逻辑路径，隧道开销 1 |
| 3 | 端口要求 | C2、A1、A2 各需 5 口，分别映射到 DUTB/DUTC/DUTD（6 口 e530） |
| 4 | 隧道命令 | `tunnel enable` 仅支持物理接口，tunnel 接口上不需要配置；GRE 隧道可直接承载 OSPF |
| 5 | 判定原则 | 隧道无法承载 OSPF 时标记 `Blocked`，保持拓扑与配置不变并记录缺失项 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 记录隧道邻居、ECMP 下一跳、LFA 计数、故障前后路由和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0210 | | | |
