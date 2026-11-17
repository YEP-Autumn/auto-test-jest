# RFC 6571 Figure 5 Extended U 中 C1/C2 通过隧道形成逻辑邻居并保持 LFA 覆盖

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0210-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0210`
- 用例标题：RFC 6571 Figure 5 Extended U 中 C1/C2 通过隧道形成逻辑邻居并保持 LFA 覆盖
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P2 / 功能
- 执行方式：自动化脚本 / 手工
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
| 设备 profile | `default` | 以 CLI 是否接受 LFA 命令为准 |
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

内置拓扑：`LinkConstraint.nine_devices_topo_links_type_3`（Square 去掉 C1-C2 直连）。

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
| Tunnel0 | 10.100.0.0/24 | C1=10.100.0.1，C2=10.100.0.2 | 1 |
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

DUTB（C2）按第 2 节地址配置，并配置目的地址为 `10.255.0.1` 的隧道。DUTC～DUTL 按第 2 节地址配置。全部邻居 `Full` 后，在各设备 OSPF 进程视图执行 `fast-reroute per-prefix enable`。

### 4.2 观测与预期

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 物理邻居 | `show ip ospf neighbor` | 所有物理直连邻居均为 `Full` |
| 隧道邻居 | `show ip ospf neighbor`（DUTA/DUTB） | 分别出现 `10.255.0.2` / `10.255.0.1` 的 `Full` |
| 隧道连通性 | `ping 10.100.0.2`（DUTA） | `0% packet loss` |
| E1 到 P 的 ECMP | `show ip route 192.0.2.1`（DUTG） | 同时出现 `10.3.7.1, via` 和 `10.4.7.1, via` |
| LFA 计算 | `show ip ospf fast-reroute per-prefix` | `Calculation` 的 `runs` 大于 0 |
| 受保护前缀 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| 连通性 | `ping 192.0.2.1` | `0% packet loss` |

### 4.3 故障与恢复

1. 关闭 DUTG 的 `<PortA>`，模拟 E1-A1 链路故障。
2. `show ip route 192.0.2.1` 应切换为 `10.4.7.1, via`，即经 A2 到达 P。
3. `ping 192.0.2.1` 应为 `0% packet loss`。
4. 恢复 `<PortA>`，ECMP 和 `Protected by LFA` 恢复。
5. 记录隧道开销对 LFA 无环条件的影响；若设备不支持隧道承载 OSPF，标记 `Blocked`。

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
| 5 | 判定原则 | 隧道无法承载 OSPF 时标记 `Blocked`，不强行用直连链路替代 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 记录隧道邻居、ECMP 下一跳、LFA 计数、故障前后路由和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0210 | | | |
