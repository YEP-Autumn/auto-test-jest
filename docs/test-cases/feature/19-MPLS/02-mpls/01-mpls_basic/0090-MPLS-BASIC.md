# 测试MPLS L3VPN 多跳 PING功能

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本的测试用例共用公共拓扑、预置条件与判定口径；各子用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0090 | 测试MPLS L3VPN 多跳 PING功能 | `0090-MPLS-BASIC.test.ts` | P1 / 功能 | |

## 1. 基本信息（用例）

- 用例编号：`0090`
- 用例标题：测试MPLS L3VPN 多跳 PING功能
- 所属特性 / 分组：`19-MPLS` / `MPLS配置` / `MPLS 基础`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 35 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/19-MPLS/02-mpls/01-mpls_basic/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本文档验证的要求 |
| --- | --- | --- |
| 设备配置指导 19.2 | 19.2 | MPLS 基础配置与回显 |
| 设备命令参考 19.2 | MPLS配置 | 命令参数、回显与删除 |
| IEEE 802.1Q-2018 | VLAN 标记、成员与转发 | VLAN、PVID、Trunk 与子接口处理 |
| RFC 3031 / RFC 5036 | MPLS 标签与 LDP | 标签分发与 LSP 建立 |
| RFC 4762 / RFC 4364 | VPLS 与 L3VPN | VPLS 转发与 L3VPN 路由 |
| RFC 826 | ARP 请求与应答 | ARP 学习与代理 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `mpls` | 确认特性可用范围 |
| License / 单板 | 支持MPLS 基础相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 3 个可配置接口 | 确认接口类型与数量 |
| 测试仪端口 | RenixPort.A / RenixPort.B | 确认流量收发端口可用 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

脚本注释中给出的拓扑如下。执行前按对应拓扑完成设备与测试仪连线。

### 2.3 拓扑 3

```text
                   +--------+                   +--------+
                   |        |--PortA <=> PortA--|        |
 RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortB
                   |        |--PortC <=> PortC--|        |    |
                   +--------+                   +--------+    |
                                                              |
                                                +--------+    |
                              RenixB <=> PortD--|  DUTC  |--PortB
                                                +--------+
```

适用用例：0090

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| BGP AS | 1 | 以各子用例配置为准 |
| BGP 邻居 AS | 1 | 与对端一致 |
| Router ID | 1.1.1.1 / 2.2.2.2 / 3.3.3.3 / 192.168.10.10 | 全局唯一 |
| OSPF Area | 0 | 按拓扑规划 |
| VLAN | 2 | 按拓扑规划 |
| VRF | vpn1 | 按业务实例规划 |
| 定时器 | 设备默认值 | 用例另有说明时以用例配置为准 |
| MTU | 1500 | 邻居建立前确认一致 |
| 收敛等待 | 优先使用就绪检查 | 固定等待见各子用例 |

### 3.2 初始状态

- 设备接口处于默认二层或三层状态；本文档涉及的 VLAN、VRF、协议进程、静态路由、隧道、ACL、QoS 对象均为空。
- 测试仪端口已连接并可用，收发端口与脚本中的 `RenixPort` 对应。
- 设备已具备 console、telnet 或 ssh 登录方式，可进入全局配置模式。
- 现场保留：默认清理；保留位置：...

## 4. 测试步骤与预期结果

本文档各子用例的公共执行顺序如下。

| 步骤 | 设备 | 动作 | 预期 |
| --- | --- | --- | --- |
| 1 | 全部 DUT | 执行基线检查命令 | 初始状态符合 3.2 |
| 2 | 各 DUT | 按 4.N 的配置块下发命令 | 命令均被接受，无 `% Invalid input` 等报错 |
| 3 | 各 DUT / 测试仪 | 按 4.N 的触发与等待执行 | 就绪条件满足 |
| 4 | 各 DUT / 测试仪 | 按 4.N 的观测与预期校验 | 全部预期满足 |
| 5 | 各 DUT | 按 4.N 的清理块恢复 | 无本用例残留 |

> 命令中的 `<PortA>` 至 `<PortD>` 为逻辑端口名，执行前替换为实际接口名。
> 观测面说明见 `test-case-template.md` 附录 A；判定标准与常用定时器见附录 B。

### 4.9 用例 0090：测试MPLS L3VPN 多跳 PING功能

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0090-MPLS-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 固定等待 | — |
| 5 | 等待就绪 | DUTB |
| 6 | 等待就绪 | DUTB |
| 7 | 固定等待 | — |
| 8 | 清理 | DUTB |
| 9 | 固定等待 | — |
| 10 | 等待就绪 | DUTB |
| 11 | 等待就绪 | DUTB |
| 12 | 配置 | DUTB |
| 13 | 固定等待 | — |
| 14 | 等待就绪 | DUTB |
| 15 | 等待就绪 | DUTB |
| 16 | 观测 | DUTA |
| 17 | 观测 | DUTC |
| 18 | 清理 | DUTA |
| 19 | 清理 | DUTB |
| 20 | 清理 | DUTC |

**配置**

DUTA：

```text
configure terminal
ip vrf vpn1
rd 1:1
route-target both 1:1
exit
interface <PortA>
no switchport
label-switching
ip address 1.1.1.1/24
enable-ldp
exit
interface <PortD>
no switchport
ip vrf forwarding vpn1
ip address 20.2.2.2/24
exit
interface loopback0
ip address 5.5.5.5/32
exit
router ospf
router-id 5.5.5.5
network 1.1.1.0/24 area 0
network 5.5.5.5/32 area 0
exit
router bgp 1
neighbor 6.6.6.6 remote-as 1
neighbor 6.6.6.6 update-source loopback0
address-family vpnv4 unicast
neighbor 6.6.6.6 activate
neighbor 6.6.6.6 send-community both
exit-address-family
address-family ipv4 vrf vpn1
redistribute connected
exit-address-family
exit
router ldp
router-id 5.5.5.5
targeted-peer 7.7.7.7
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
label-switching
ip address 1.1.1.2/24
enable-ldp
exit
interface <PortB>
no switchport
label-switching
ip address 2.2.2.2/24
enable-ldp
exit
interface loopback0
ip address 6.6.6.6/32
exit
router ospf
network 1.1.1.0/24 area 0
network 2.2.2.0/24 area 0
network 6.6.6.6/32 area 0
exit
router bgp 1
neighbor 5.5.5.5 remote-as 1
neighbor 5.5.5.5 update-source loopback0
neighbor 7.7.7.7 remote-as 1
neighbor 7.7.7.7 update-source loopback0
address-family vpnv4 unicast
neighbor 5.5.5.5 activate
neighbor 5.5.5.5 route-reflector-client
neighbor 5.5.5.5 send-community both
neighbor 7.7.7.7 activate
neighbor 7.7.7.7 route-reflector-client
neighbor 7.7.7.7 send-community both
exit
exit
router ldp
router-id 6.6.6.6
end
```

DUTC：

```text
configure terminal
ip vrf vpn1
rd 1:1
route-target both 1:1
exit
interface <PortB>
no switchport
label-switching
ip address 2.2.2.1/24
enable-ldp
exit
interface <PortD>
no switchport
ip vrf forwarding vpn1
ip address 30.3.3.3/24
exit
interface loopback0
ip address 7.7.7.7/32
exit
router ospf
router-id 7.7.7.7
network 2.2.2.0/24 area 0
network 7.7.7.7/32 area 0
exit
router bgp 1
neighbor 6.6.6.6 remote-as 1
neighbor 6.6.6.6 update-source loopback0
address-family vpnv4 unicast
neighbor 6.6.6.6 activate
neighbor 6.6.6.6 send-community both
exit-address-family
address-family ipv4 vrf vpn1
redistribute connected
exit-address-family
exit
router ldp
router-id 7.7.7.7
targeted-peer 5.5.5.5
end
```

DUTB：

```text
clear ldp session *
```

**触发与等待**

- 固定等待 20 秒；等待依据见脚本注释。
- DUTB：轮询 `show ip ospf neighbor`，回显应匹配正则 `/5.5.5.5.*?Full/`；超时 80 秒。
- DUTB：轮询 `show ip ospf neighbor`，回显应匹配正则 `/7.7.7.7.*?Full/`；超时 60 秒。
- 固定等待 5 秒；等待依据见脚本注释。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTB：轮询 `show ip bgp neighbors 5.5.5.5`，回显应包含 `BGP state = Established`；超时 60 秒。
- DUTB：轮询 `show ip bgp neighbors 7.7.7.7`，回显应包含 `BGP state = Established`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/5.5.5.5.*?OPERATIONAL/`；超时 90 秒。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/7.7.7.7.*?OPERATIONAL/`；超时 60 秒。
**观测与预期**

- DUTA：执行 `ping vrf vpn1 -a 20.2.2.2 30.3.3.3`，回显应包含 ` 0% packet loss`。
- DUTC：执行 `ping vrf vpn1 -a 30.3.3.3 20.2.2.2`，回显应包含 ` 0% packet loss`。

**脚本注释中的预期现象**

- 验证ping连通性

**清理**

DUTB：

```text
clear ip bgp *
```

DUTA：

```text
configure terminal
no ip vrf vpn1
interface <PortA>
switchport
disable-ldp
exit
interface <PortD>
switchport
exit
no interface loopback 0
no router ospf
no router bgp 1
no router ldp
end
```

DUTB：

```text
configure terminal
interface <PortA>
switchport
disable-ldp
exit
interface <PortB>
disable-ldp
switchport
exit
no interface loopback 0
no router ospf
no router bgp 1
no router ldp
exit
```

DUTC：

```text
configure terminal
no ip vrf vpn1
interface <PortB>
switchport
disable-ldp
exit
interface <PortD>
switchport
exit
no interface loopback 0
no router ospf
no router bgp 1
no router ldp
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

## 5. 清理与恢复

各子用例的清理命令见第 4 节对应小节。用例执行完毕后，按设备执行以下检查，确认本文档新增对象均已删除。

```text
show running-config
show mpls
show ldp session
show ip route
```

清理顺序：业务路由 → 接口、隧道与 loopback → 协议进程 → VRF → 接口回二层。清理完成后重新执行上述命令，确认无本文档对象残留。

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 标准裁剪 | 设备支持可选特性时执行对应测试点；能力未覆盖时标记 `Blocked` 并注明原因 |
| 2 | 脚本与文档一致性 | 本文以当前脚本为事实来源；脚本修改后应同步更新本文 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 按用例编号记录实际回显或抓包结果 |
| 证据 | 回显文件 / 抓包文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0090 | | | |

