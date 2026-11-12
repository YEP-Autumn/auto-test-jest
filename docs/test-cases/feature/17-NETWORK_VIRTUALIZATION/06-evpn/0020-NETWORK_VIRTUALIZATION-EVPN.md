# 测试 bgp evpn vxlan loopback ping功能, 两台交换机使用loopback接口通过vxlan隧道互通

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本的测试用例共用公共拓扑、预置条件与判定口径；各子用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0020 | 测试 bgp evpn vxlan loopback ping功能, 两台交换机使用loopback接口通过vxlan隧道互通 | `0020-NETWORK_VIRTUALIZATION-EVPN.test.ts` | P1 / 功能 | |

## 1. 基本信息（用例）

- 用例编号：`0020`
- 用例标题：测试 bgp evpn vxlan loopback ping功能, 两台交换机使用loopback接口通过vxlan隧道互通
- 所属特性 / 分组：`17-NETWORK_VIRTUALIZATION` / `EVPN配置`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 9 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/17-NETWORK_VIRTUALIZATION/06-evpn/`；设计模板见 [test-case-template.md](../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本文档验证的要求 |
| --- | --- | --- |
| 设备配置指导 17.6 | 17.6 | EVPN配置与回显 |
| 设备命令参考 17.3 | EVPN配置 | 命令参数、回显与删除 |
| RFC 4271 | BGP 会话与 Update | BGP 邻居建立与路由发布 |
| RFC 7432 / RFC 8365 / RFC 7348 | EVPN 路由与 VXLAN 封装 | EVPN 路由学习与 VXLAN 隧道转发 |
| RFC 826 | ARP 请求与应答 | ARP 学习与代理 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `default` | 确认特性可用范围 |
| License / 单板 | 支持EVPN配置相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 3 个可配置接口 | 确认接口类型与数量 |
| 测试仪端口 | RenixPort.A / RenixPort.B | 确认流量收发端口可用 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

脚本注释中给出的拓扑如下。执行前按对应拓扑完成设备与测试仪连线。

### 2.1 拓扑 1

```text
                   +--------+                   +--------+
 RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
                   +--------+                   +--------+    |
                                                              |
                                                +--------+    |
                              RenixB <=> PortD--|  DUTC  |--PortB
                                                +--------+
```

适用用例：0020

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| BGP AS | 100 | 以各子用例配置为准 |
| BGP 邻居 AS | 100 | 与对端一致 |
| Router ID | 10.1.1.1 / 10.2.2.2 / 10.3.3.3 | 全局唯一 |
| VLAN | 10 / 20 | 按拓扑规划 |
| VNI | 1000 / 10 / 20 | 按业务实例规划 |
| VRF | v1 / v2 / evpn | 按业务实例规划 |
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

### 4.1 用例 0020：测试 bgp evpn vxlan loopback ping功能, 两台交换机使用loopback接口通过vxlan隧道互通

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/17-NETWORK_VIRTUALIZATION/06-evpn/0020-NETWORK_VIRTUALIZATION-EVPN.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 配置 | DUTB |
| 5 | 固定等待 | — |
| 6 | 观测 | DUTA |
| 7 | 清理 | DUTA |
| 8 | 清理 | DUTB |
| 9 | 清理 | DUTC |

**配置**

DUTA：

```text
configure terminal
ip vrf v1
rd 1000:1
route-target both 100:1000 evpn
vxlan vni 1000
exit
interface <PortA>
no switchport
vxlan uplink enable
ip address 100.100.100.1/24
exit
interface <PortD>
no switchport
ip vrf forwarding v1
ip address 1.1.1.1/24
exit
interface loopback0
ip vrf forwarding v1
ip address 10.1.1.1/32
exit
interface loopback1
ip address 11.1.1.1/32
exit
interface nve0
source <PortA>
member vni 1000 associate-vrf
exit
evpn
exit
router bgp 100
neighbor 100.100.101.1 remote-as 100
address-family ipv4
neighbor 100.100.101.1 activate
exit
address-family l2vpn evpn
neighbor 100.100.101.1 activate
neighbor 100.100.101.1 send-community both
exit
address-family ipv4 vrf v1
advertise l2vpn evpn
redistribute connected
exit
exit
ip route 100.100.101.0/24 100.100.100.2
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
ip address 100.100.100.2/24
exit
interface <PortB>
no switchport
ip address 100.100.101.2/24
exit
ip route 11.1.1.1/32 100.100.100.1
ip route 11.1.1.2/32 100.100.101.1
end
```

DUTC：

```text
configure terminal
ip vrf v2
rd 1000:2
route-target both 100:1000 evpn
vxlan vni 1000
exit
interface <PortB>
no switchport
vxlan uplink enable
ip address 100.100.101.1/24
exit
interface <PortD>
no switchport
ip vrf forwarding v2
ip address 2.2.2.1/24
exit
interface loopback0
ip vrf forwarding v2
ip address 10.1.1.2/32
exit
interface nve0
source <PortB>
member vni 1000 associate-vrf
exit
evpn
exit
router bgp 100
neighbor 100.100.100.1 remote-as 100
address-family ipv4
neighbor 100.100.100.1 activate
exit
address-family l2vpn evpn
neighbor 100.100.100.1 activate
neighbor 100.100.100.1 send-community both
exit
address-family ipv4 vrf v2
advertise l2vpn evpn
redistribute connected
exit
exit
ip route 100.100.100.0/24 100.100.101.2
end
```

DUTB：

```text
clear bgp *
```

**触发与等待**

- 固定等待 25 秒；等待依据见脚本注释。
**观测与预期**

- DUTA：执行 `ping vrf v1 10.1.1.2`，回显应包含 ` 0% packet loss`。

**清理**

DUTA：

```text
configure terminal
no ip vrf v1
no router bgp 100
no ip route 100.100.101.0/24
no evpn
no interface loopback0
no interface loopback1
no interface nve0
interface <PortA>
switchport
vxlan uplink disable
exit
interface <PortD>
switchport
exit
end
```

DUTB：

```text
configure terminal
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
no ip route 11.1.1.1/32
no ip route 11.1.1.2/32
end
```

DUTC：

```text
configure terminal
no ip vrf v2
no router bgp 100
no ip route 100.100.100.0/24
no evpn
no interface nve0
no interface loopback0
interface <PortB>
switchport
vxlan uplink disable
exit
interface <PortD>
switchport
exit
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

## 5. 清理与恢复

各子用例的清理命令见第 4 节对应小节。用例执行完毕后，按设备执行以下检查，确认本文档新增对象均已删除。

```text
show running-config
show ip route
show bgp evpn summary
show overlay tunnel
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
| 0020 | | | |

