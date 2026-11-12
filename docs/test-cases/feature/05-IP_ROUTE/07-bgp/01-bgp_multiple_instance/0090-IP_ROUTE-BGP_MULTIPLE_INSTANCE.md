# 测试BGP多实例路由引入功能只在自身实例生效

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本的测试用例共用公共拓扑、预置条件与判定口径；各子用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0090 | 测试BGP多实例路由引入功能只在自身实例生效 | `0090-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |

## 1. 基本信息（用例）

- 用例编号：`0090`
- 用例标题：测试BGP多实例路由引入功能只在自身实例生效
- 所属特性 / 分组：`05-IP_ROUTE` / `BGP配置` / `BGP多实例`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 51 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本文档验证的要求 |
| --- | --- | --- |
| 设备配置指导 5.7 | 5.7 | BGP多实例配置与回显 |
| 设备命令参考 6.7 | BGP配置 | 命令参数、回显与删除 |
| RFC 4271 | BGP 会话与 Update | BGP 邻居建立与路由发布 |
| RFC 7432 / RFC 8365 / RFC 7348 | EVPN 路由与 VXLAN 封装 | EVPN 路由学习与 VXLAN 隧道转发 |
| RFC 8200 | IPv6 报文与地址 | IPv6 地址、邻居与转发 |
| RFC 5880 | BFD 控制报文 | BFD 会话建立与故障检测 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `default` | 确认特性可用范围 |
| License / 单板 | 支持BGP多实例相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 4 个可配置接口 | 确认接口类型与数量 |
| 测试仪端口 | RenixPort.A / RenixPort.B | 确认流量收发端口可用 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

脚本注释中给出的拓扑如下。执行前按对应拓扑完成设备与测试仪连线。

### 2.1 拓扑 1

```text
                   +--------+                   +--------+
                   |        |--PortA <=> PortA--|        |
 RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortD <=> RenixB
                   |        |--PortC <=> PortC--|        |
                   +--------+                   +--------+
```

适用用例：0090

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| BGP AS | 100 / 200 / 1000 / 2000 / 300 / 1 / 2 / 65001 / 64512 / 65000 / 65002 | 以各子用例配置为准 |
| BGP 邻居 AS | 100 / 200 / 1000 / 2000 / 300 / 2 / 65000 / 64512 / 65001 / 65002 | 与对端一致 |
| Router ID | 10.1.1.1 / 10.1.1.2 / 20.1.1.1 / 20.1.1.2 | 全局唯一 |
| OSPF Area | 0 | 按拓扑规划 |
| VLAN | 10 / 20 | 按拓扑规划 |
| VNI | 1000 / 10 / 20 | 按业务实例规划 |
| VRF | vpn1 / vpn2 / v1 / evpn | 按业务实例规划 |
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

### 4.9 用例 0090：测试BGP多实例路由引入功能只在自身实例生效

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0090-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTB |
| 6 | 等待就绪 | DUTB |
| 7 | 配置 | DUTA |
| 8 | 配置 | DUTA |
| 9 | 等待就绪 | DUTB |
| 10 | 等待就绪 | DUTB |
| 11 | 固定等待 | — |
| 12 | 等待就绪 | DUTA |
| 13 | 观测 | DUTA |
| 14 | 等待就绪 | DUTB |
| 15 | 观测 | DUTB |
| 16 | 清理 | DUTA |
| 17 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.1/24
exit
interface <PortB>
no switchport
ip address 10.10.10.1/24
exit
interface <PortC>
no switchport
ip address 2.2.2.1/24
exit
arp 10.10.10.10 10.10.10
ip route 100.100.100.0/24 10.10.10.10
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
redistribute static
exit
router bgp 200 view test2
neighbor 2.2.2.2 remote-as 200
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.2/24
exit
interface <PortC>
no switchport
ip address 2.2.2.2/24
exit
router bgp 100 view test1
neighbor 1.1.1.1 remote-as 100
exit
router bgp 200 view test2
neighbor 2.2.2.1 remote-as 200
end
```

DUTA：

```text
clear bgp view test1 *
```

DUTA：

```text
clear bgp view test2 *
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show ip bgp view test1 neighbors`，回显应包含 `Established`；超时 60 秒。
- DUTB：轮询 `show ip bgp view test2 neighbors`，回显应包含 `Established`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip bgp view test1`，回显应匹配正则 `/\*> 100.100.100.0\/24/`；超时 30 秒。
- DUTB：轮询 `show ip bgp view test1`，回显应匹配正则 `/\*>i100.100.100.0\/24/`；超时 30 秒。
**观测与预期**

- DUTA：执行 `show ip bgp view test2`，回显应匹配正则 `/\*> 100.100.100.0\/24/`。
- DUTB：执行 `show ip bgp view test2`，回显应匹配正则 `/\*>i100.100.100.0\/24/`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
interface <PortC>
switchport
exit
no arp 10.10.10.10
no ip route 100.100.100.0/24
no router bgp 100 view test1
no router bgp 200 view test2
end
```

DUTB：

```text
configure terminal
interface <PortA>
switchport
exit
interface <PortC>
switchport
exit
no router bgp 100 view test1
no router bgp 200 view test2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

## 5. 清理与恢复

各子用例的清理命令见第 4 节对应小节。用例执行完毕后，按设备执行以下检查，确认本文档新增对象均已删除。

```text
show running-config
show ip route
show ip bgp
show ip ospf neighbor
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

