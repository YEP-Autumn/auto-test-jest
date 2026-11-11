# IP路由 BGP多实例测试用例合集

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本目录全部测试脚本。
> 同一目录的脚本共用公共拓扑、预置条件与判定口径；各用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | 设备支持创建和删除多个BGP实例 | `0010-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0020 | 设备支持使用相同的AS号创建多个BGP实例 | `0020-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0030 | 测试BGP多实例支持建立EBGP | `0030-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0040 | 测试BGP多实例支持建立IBGP | `0040-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0050 | 测试BGP多实例和同一设备建立连接 | `0050-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0060 | 测试BGP多实例状态相互独立 | `0060-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0070 | 测试BGP多实例 Network 通告路由 只在自身实例中生效 | `0070-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0080 | 测试BGP多实例 接收的路由只出现在自身的路由表中 | `0080-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0090 | 测试BGP多实例路由引入功能只在自身实例生效 | `0090-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0100 | 测试BGP多实例配置router-id | `0100-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0110 | 测试BGP多实例路由同步到主路由表 | `0110-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0120 | 测试BGP多实例配置邻居route-map功能 | `0120-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0130 | 测试BGP多实例Local-Preference功能 | `0130-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0140 | 测试BGP多实例Next-hop功能 | `0140-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0150 | 测试BGP多实例配置邻居default-originate功能 | `0150-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0160 | 测试BGP多实例绑定VRF | `0160-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0170 | 测试BGP多实例IPv4 Unicast地址族 | `0170-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0180 | 测试BGP多实例IPv6 Unicast地址族 | `0180-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0190 | 测试BGP多实例VPNv4地址族 | `0190-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0200 | 测试bgp多实例 ebgp underlay 叠加 ibgp evpn路由 | `0200-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0210 | 测试BGP多实例配置BFD检测 | `0210-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0220 | 测试BGP多实例配置 VXLAN L2 EVPN | `0220-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0230 | 测试BGP多实例配置 VXLAN L3 EVPN | `0230-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0240 | 测试BGP多实例配置 ipv4 地址族路由重分布 | `0240-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |
| 0250 | 测试BGP多实例配置 ipv6 地址族路由重分布 | `0250-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts` | P1 / 功能 | |

## 1. 基本信息（合集）

- 用例编号：`0010` ~ `0250`
- 用例标题：IP路由 BGP多实例测试用例合集
- 所属特性 / 分组：`05-IP_ROUTE` / `BGP配置` / `BGP多实例`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 51 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本合集验证的要求 |
| --- | --- | --- |
| E530 配置指导（V7.5.1） | 5.7 | BGP多实例配置与回显 |
| E530 命令参考（V7.4.8） | BGP配置 | 命令参数、回显与删除 |
| RFC 4271 | BGP 会话与 Update | BGP 邻居建立与路由发布 |
| RFC 7432 / RFC 8365 / RFC 7348 | EVPN 路由与 VXLAN 封装 | EVPN 路由学习与 VXLAN 隧道转发 |
| RFC 8200 | IPv6 报文与地址 | IPv6 地址、邻居与转发 |
| RFC 5880 | BFD 控制报文 | BFD 会话建立与故障检测 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | 支持BGP多实例特性 | 确认特性可用范围 |
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

适用用例：0010、0020、0030、0040、0050、0060、0070、0080、0090、0100、0110、0120、0130、0160、0170、0180、0210。

### 2.2 拓扑 2

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

适用用例：0140、0150、0200。

### 2.3 拓扑 3

```text
   +--------+                   +--------+
   |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
   +--------+                   +--------+    |
                                              |
   +--------+                   +--------+    |
   |  DUTD  |--PortA <=> PortA--|  DUTC  |--PortB
   +--------+                   +--------+
```

适用用例：0190、0230。

### 2.4 拓扑 4

```text
                   +--------+                   +--------+
 RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
                   +--------+                   +--------+    |
                                                              |
                                                +--------+    |
                              RenixB <=> PortD--|  DUTC  |--PortB
                                                +--------+
```

适用用例：0220。

### 2.5 拓扑 5

```text
  +--------+                   +--------+
  |        |--PortA <=> PortA--|        |
  |  DUTA  |                   |  DUTB  |
  |        |--PortB <=> PortB--|        |
  +--------+                   +--------+
```

适用用例：0240、0250。

内置拓扑：`LinkConstraint.two_devices_topo_links_type_1`、`LinkConstraint.three_devices_topo_links_type_1`、`LinkConstraint.four_devices_topo_links_type_1`、`LinkConstraint.three_devices_topo_links_type_5`、`LinkConstraint.two_devices_topo_links_type_2`。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | `<PortA>`、`<PortB>`、`<PortC>`、`<PortD>` | 被测设备端口，执行前替换为实际接口名 |
| 测试仪 | `<RenixPortA>`、`<RenixPortB>` | 流量收发端口，按测试仪实际连接配置 |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| BGP AS | 100 / 200 / 1000 / 2000 / 300 / 1 / 2 / 65001 / 64512 / 65000 / 65002 | 以各用例配置为准 |
| BGP 邻居 AS | 100 / 200 / 1000 / 2000 / 300 / 2 / 65000 / 64512 / 65001 / 65002 | 与对端一致 |
| Router ID | 10.1.1.1 / 10.1.1.2 / 20.1.1.1 / 20.1.1.2 | 全局唯一 |
| OSPF Area | 0 | 按拓扑规划 |
| VLAN | 10 / 20 | 按拓扑规划 |
| VNI | 1000 / 10 / 20 | 按业务实例规划 |
| VRF | vpn1 / vpn2 / v1 / evpn | 按业务实例规划 |
| 定时器 | 设备默认值 | 用例另有说明时以用例配置为准 |
| MTU | 1500 | 邻居建立前确认一致 |
| 收敛等待 | 优先使用就绪检查 | 固定等待见各用例 |

### 3.2 初始状态

- 设备接口处于默认二层或三层状态；本合集涉及的 VLAN、VRF、协议进程、静态路由、隧道、ACL、QoS 对象均为空。
- 测试仪端口已连接并可用，收发端口与脚本中的 `RenixPort` 对应。
- 设备已具备 console、telnet 或 ssh 登录方式，可进入全局配置模式。
- 现场保留：默认清理；保留位置：...

## 4. 测试步骤与预期结果

本合集各用例的公共执行顺序如下。

| 步骤 | 设备 | 动作 | 预期 |
| --- | --- | --- | --- |
| 1 | 全部 DUT | 执行基线检查命令 | 初始状态符合 3.2 |
| 2 | 各 DUT | 按 4.N 的配置块下发命令 | 命令均被接受，无 `% Invalid input` 等报错 |
| 3 | 各 DUT / 测试仪 | 按 4.N 的触发与等待执行 | 就绪条件满足 |
| 4 | 各 DUT / 测试仪 | 按 4.N 的观测与预期校验 | 全部预期满足 |
| 5 | 各 DUT | 按 4.N 的清理块恢复 | 无本用例残留 |

> 命令中的 `<PortA>` 至 `<PortD>` 为逻辑端口名，执行前替换为实际接口名。
> 观测面说明见 `test-case-template.md` 附录 A；判定标准与常用定时器见附录 B。

### 4.1 用例 0010：设备支持创建和删除多个BGP实例

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0010-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTA |
| 11 | 清理 | DUTA |
| 12 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.1/24
exit
interface <PortC>
no switchport
ip address 2.2.2.1/24
exit
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
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
- DUTA：轮询 `show ip bgp view test1 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test2 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
**清理**

DUTA：

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

### 4.2 用例 0020：设备支持使用相同的AS号创建多个BGP实例

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0020-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTA |
| 11 | 清理 | DUTA |
| 12 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.1/24
exit
interface <PortC>
no switchport
ip address 2.2.2.1/24
exit
router bgp 200 view test1
neighbor 1.1.1.2 remote-as 200
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
router bgp 200 view test1
neighbor 1.1.1.1 remote-as 200
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
- DUTA：轮询 `show ip bgp view test1 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test2 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
exit
interface <PortC>
switchport
exit
no router bgp 200 view test1
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
no router bgp 200 view test1
no router bgp 200 view test2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.3 用例 0030：测试BGP多实例支持建立EBGP

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0030-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTA |
| 11 | 清理 | DUTA |
| 12 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.1/24
exit
interface <PortC>
no switchport
ip address 2.2.2.1/24
exit
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 1000
exit
router bgp 200 view test2
neighbor 2.2.2.2 remote-as 2000
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
router bgp 1000 view test1
neighbor 1.1.1.1 remote-as 100
exit
router bgp 2000 view test2
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
- DUTA：轮询 `show ip bgp view test1 neighbors`，回显应包含 `BGP state = Established`；超时 60 秒。
- DUTA：轮询 `show ip bgp view test2 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
**清理**

DUTA：

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

DUTB：

```text
configure terminal
interface <PortA>
switchport
exit
interface <PortC>
switchport
exit
no router bgp 1000 view test1
no router bgp 2000 view test2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.4 用例 0040：测试BGP多实例支持建立IBGP

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0040-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTA |
| 11 | 清理 | DUTA |
| 12 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.1/24
exit
interface <PortC>
no switchport
ip address 2.2.2.1/24
exit
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
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
- DUTA：轮询 `show ip bgp view test1 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test2 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
**清理**

DUTA：

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

### 4.5 用例 0050：测试BGP多实例和同一设备建立连接

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0050-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTA |
| 11 | 清理 | DUTA |
| 12 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.1/24
exit
interface <PortC>
no switchport
ip address 2.2.2.1/24
exit
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
exit
router bgp 200 view test2
neighbor 2.2.2.2 remote-as 100
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
router bgp 100
neighbor 1.1.1.1 remote-as 100
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
- DUTA：轮询 `show ip bgp view test1 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test2 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
**清理**

DUTA：

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

DUTB：

```text
configure terminal
interface <PortA>
switchport
exit
interface <PortC>
switchport
exit
no router bgp 100
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.6 用例 0060：测试BGP多实例状态相互独立

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0060-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTA |
| 11 | 配置 | DUTB |
| 12 | 等待就绪 | DUTA |
| 13 | 等待就绪 | DUTA |
| 14 | 清理 | DUTA |
| 15 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.1/24
exit
interface <PortC>
no switchport
ip address 2.2.2.1/24
exit
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
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

DUTB：

```text
configure terminal
router bgp 100 view test1
neighbor 1.1.1.1 shutdown
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test1 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test2 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test1 neighbors`，回显应包含 `BGP state = Idle`；超时 10 秒。
- DUTA：轮询 `show ip bgp view test2 neighbors`，回显应包含 `BGP state = Established`；超时 10 秒。
**清理**

DUTA：

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

### 4.7 用例 0070：测试BGP多实例 Network 通告路由 只在自身实例中生效

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0070-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 14 | 清理 | DUTA |
| 15 | 清理 | DUTB |

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
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
network 10.10.10.0/24
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
- DUTA：轮询 `show ip bgp view test1`，回显应匹配正则 `/\*> 10.10.10.0\/24/`；超时 30 秒。
**观测与预期**

- DUTA：执行 `show ip bgp view test2`，回显应匹配正则 `/\*> 10.10.10.0\/24/`。

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

### 4.8 用例 0080：测试BGP多实例 接收的路由只出现在自身的路由表中

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0080-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 12 | 等待就绪 | DUTB |
| 13 | 观测 | DUTB |
| 14 | 清理 | DUTA |
| 15 | 清理 | DUTB |

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
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
network 10.10.10.0/24
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
- DUTB：轮询 `show ip bgp view test1`，回显应匹配正则 `/\*>i10.10.10.0\/24/`；超时 30 秒。
**观测与预期**

- DUTB：执行 `show ip bgp view test2`，回显应匹配正则 `/\*>i10.10.10.0\/24/`。

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

### 4.10 用例 0100：测试BGP多实例配置router-id

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0100-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTA |
| 11 | 等待就绪 | DUTA |
| 12 | 等待就绪 | DUTA |
| 13 | 等待就绪 | DUTB |
| 14 | 等待就绪 | DUTB |
| 15 | 清理 | DUTA |
| 16 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.1/24
exit
interface <PortC>
no switchport
ip address 2.2.2.1/24
exit
router bgp 100 view test1
bgp router-id 10.1.1.1
neighbor 1.1.1.2 remote-as 100
exit
router bgp 200 view test2
bgp router-id 10.1.1.2
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
bgp router-id 20.1.1.1
neighbor 1.1.1.1 remote-as 100
exit
router bgp 200 view test2
bgp router-id 20.1.1.2
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
- DUTA：轮询 `show ip bgp view test1 neighbors`，回显应包含 `Established`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test2 neighbors`，回显应包含 `Established`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test1 neighbors`，回显应包含 `remote router ID 20.1.1.1`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test2 neighbors`，回显应包含 `remote router ID 20.1.1.2`；超时 30 秒。
- DUTB：轮询 `show ip bgp view test1 neighbors`，回显应包含 `remote router ID 10.1.1.1`；超时 30 秒。
- DUTB：轮询 `show ip bgp view test2 neighbors`，回显应包含 `remote router ID 10.1.1.2`；超时 30 秒。
**清理**

DUTA：

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

### 4.11 用例 0110：测试BGP多实例路由同步到主路由表

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0110-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 12 | 等待就绪 | DUTB |
| 13 | 等待就绪 | DUTB |
| 14 | 配置 | DUTA |
| 15 | 等待就绪 | DUTB |
| 16 | 等待就绪 | DUTB |
| 17 | 清理 | DUTA |
| 18 | 清理 | DUTB |

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
interface <PortD>
no switchport
ip address 11.11.11.1/24
exit
arp 10.10.10.10 10.10.10
ip route 100.100.100.0/24 10.10.10.10
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
redistribute static
exit
router bgp 200 view test2
network 11.11.11.0/24
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

DUTA：

```text
configure terminal
router bgp 100 view test1
no redistribute static
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show ip bgp view test1 neighbors`，回显应包含 `Established`；超时 60 秒。
- DUTB：轮询 `show ip bgp view test2 neighbors`，回显应包含 `Established`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTB：轮询 `show ip route`，回显应包含 `100.100.100.0/24`；超时 120 秒。
- DUTB：轮询 `show ip route`，回显应包含 `11.11.11.0/24`；超时 30 秒。
- DUTB：轮询 `show ip route`，回显应包含 `100.100.100.0/24`；超时 30 秒。
- DUTB：轮询 `show ip route`，回显应包含 `11.11.11.0/24`；超时 30 秒。
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
interface <PortD>
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

### 4.12 用例 0120：测试BGP多实例配置邻居route-map功能

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0120-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 12 | 等待就绪 | DUTB |
| 13 | 等待就绪 | DUTB |
| 14 | 清理 | DUTA |
| 15 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
ip prefix-list ipprefix seq 5 permit any
route-map rm permit 10
match ip address prefix-list ipprefix
set ip next-hop 1.2.3.4
exit
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
interface <PortD>
no switchport
ip address 11.11.11.1/24
exit
arp 10.10.10.10 10.10.10
ip route 100.100.100.0/24 10.10.10.10
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
neighbor 1.1.1.2 route-map rm out
redistribute static
exit
router bgp 200 view test2
network 11.11.11.0/24
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
- DUTB：轮询 `show ip route`，回显应匹配正则 `/B.*?11.11.11.0\/24/`；超时 60 秒。
- DUTB：轮询 `show ip bgp view test1`，回显应匹配正则 `/i100.100.100.0\/24 1.2.3.4/`；超时 60 秒。
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
interface <PortD>
switchport
exit
no arp 10.10.10.10
no ip route 100.100.100.0/24
no router bgp 100 view test1
no router bgp 200 view test2
no route-map rm
no ip prefix-list ipprefix
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

### 4.13 用例 0130：测试BGP多实例Local-Preference功能

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0130-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 12 | 等待就绪 | DUTB |
| 13 | 等待就绪 | DUTB |
| 14 | 清理 | DUTA |
| 15 | 清理 | DUTB |

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
interface <PortD>
no switchport
ip address 11.11.11.1/24
exit
arp 10.10.10.10 10.10.10
ip route 100.100.100.0/24 10.10.10.10
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
bgp default local-preference 33333
redistribute static
exit
router bgp 200 view test2
bgp default local-preference 44444
network 11.11.11.0/24
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
- DUTB：轮询 `show ip bgp view test1`，回显应包含 `33333`；超时 60 秒。
- DUTB：轮询 `show ip bgp view test2`，回显应包含 `44444`；超时 60 秒。
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
interface <PortD>
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

### 4.14 用例 0140：测试BGP多实例Next-hop功能

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0140-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTA |
| 6 | 等待就绪 | DUTB |
| 7 | 等待就绪 | DUTB |
| 8 | 等待就绪 | DUTB |
| 9 | 配置 | DUTB |
| 10 | 配置 | DUTB |
| 11 | 等待就绪 | DUTB |
| 12 | 等待就绪 | DUTB |
| 13 | 固定等待 | — |
| 14 | 等待就绪 | DUTA |
| 15 | 清理 | DUTA |
| 16 | 清理 | DUTB |
| 17 | 清理 | DUTC |

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
interface <PortD>
no switchport
ip address 11.11.11.1/24
exit
arp 10.10.10.10 10.10.10
ip route 100.100.100.0/24 10.10.10.10
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
redistribute static
exit
router bgp 200 view test2
network 11.11.11.0/24
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
interface <PortB>
no switchport
ip address 3.3.3.2/24
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
neighbor 2.2.2.1 next-hop-self
neighbor 3.3.3.1 remote-as 300
exit
end
```

DUTC：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.2.3.4/24
exit
interface <PortB>
no switchport
ip address 3.3.3.1/24
exit
router bgp 300 view test3
neighbor 3.3.3.2 remote-as 200
redistribute connected
end
```

DUTB：

```text
clear bgp view test1 *
```

DUTB：

```text
clear bgp view test2 *
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortB>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show ip bgp view test1 neighbors`，回显应包含 `Established`；超时 60 秒。
- DUTB：轮询 `show ip bgp view test2 neighbors`，回显应包含 `Established`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip route`，回显应匹配正则 `/B.*?1.2.3.0\/24 \[200\/0\] via 2.2.2.2/`；超时 60 秒。
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
interface <PortD>
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
interface <PortB>
switchport
exit
interface <PortC>
switchport
exit
no router bgp 100 view test1
no router bgp 200 view test2
end
```

DUTC：

```text
configure terminal
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
no router bgp 300 view test3
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.15 用例 0150：测试BGP多实例配置邻居default-originate功能

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0150-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTA |
| 6 | 等待就绪 | DUTB |
| 7 | 等待就绪 | DUTB |
| 8 | 等待就绪 | DUTB |
| 9 | 配置 | DUTB |
| 10 | 配置 | DUTB |
| 11 | 等待就绪 | DUTB |
| 12 | 等待就绪 | DUTB |
| 13 | 固定等待 | — |
| 14 | 等待就绪 | DUTA |
| 15 | 清理 | DUTA |
| 16 | 清理 | DUTB |
| 17 | 清理 | DUTC |

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
interface <PortD>
no switchport
ip address 11.11.11.1/24
exit
arp 10.10.10.10 10.10.10
ip route 100.100.100.0/24 10.10.10.10
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
redistribute static
exit
router bgp 200 view test2
network 11.11.11.0/24
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
interface <PortB>
no switchport
ip address 3.3.3.2/24
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
neighbor 2.2.2.1 default-originate
neighbor 3.3.3.1 remote-as 300
exit
end
```

DUTC：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.2.3.4/24
exit
interface <PortB>
no switchport
ip address 3.3.3.1/24
exit
router bgp 300 view test3
neighbor 3.3.3.2 remote-as 200
redistribute connected
end
```

DUTB：

```text
clear bgp view test1 *
```

DUTB：

```text
clear bgp view test2 *
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortB>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show ip bgp view test1 neighbors`，回显应包含 `Established`；超时 60 秒。
- DUTB：轮询 `show ip bgp view test2 neighbors`，回显应包含 `Established`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip route`，回显应匹配正则 `/B\*.*?0.0.0.0\/0 \[200\/0\] via 2.2.2.2/`；超时 60 秒。
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
interface <PortD>
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
interface <PortB>
switchport
exit
interface <PortC>
switchport
exit
no router bgp 100 view test1
no router bgp 200 view test2
end
```

DUTC：

```text
configure terminal
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
no router bgp 300 view test3
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.16 用例 0160：测试BGP多实例绑定VRF

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0160-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTA |
| 11 | 等待就绪 | DUTB |
| 12 | 等待就绪 | DUTB |
| 13 | 配置 | DUTA |
| 14 | 固定等待 | — |
| 15 | 等待就绪 | DUTB |
| 16 | 等待就绪 | DUTB |
| 17 | 清理 | DUTA |
| 18 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
ip vrf vpn1
rd 1:1
exit
ip vrf vpn2
rd 2:2
exit
interface <PortA>
no switchport
ip vrf forwarding vpn1
ip address 1.1.1.1/24
exit
interface <PortC>
no switchport
ip vrf forwarding vpn2
ip address 2.2.2.1/24
exit
router bgp 100 view test1
address-family ipv4 vrf vpn1
neighbor 1.1.1.2 remote-as 100
exit
router bgp 200 view test2
address-family ipv4 vrf vpn2
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

DUTA：

```text
configure terminal
router bgp 100 view test1
no address-family ipv4 vrf vpn1
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show ip bgp vpnv4 vrf vpn1 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
- DUTA：轮询 `show ip bgp vpnv4 vrf vpn2 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
- DUTB：轮询 `show ip bgp view test1 neighbors`，回显应包含 `Established`；超时 30 秒。
- DUTB：轮询 `show ip bgp view test2 neighbors`，回显应包含 `Established`；超时 30 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTB：轮询 `show ip bgp view test1 neighbors`，回显应包含 `Active`；超时 30 秒。
- DUTB：轮询 `show ip bgp view test2 neighbors`，回显应包含 `Established`；超时 30 秒。
**清理**

DUTA：

```text
configure terminal
interface <PortA>
no ip address
no ip vrf forwarding
switchport
exit
interface <PortC>
no ip address
no ip vrf forwarding
switchport
exit
no router bgp 100 view test1
no router bgp 200 view test2
no ip vrf vpn1
no ip vrf vpn2
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

### 4.17 用例 0170：测试BGP多实例IPv4 Unicast地址族

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0170-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTA |
| 11 | 等待就绪 | DUTB |
| 12 | 等待就绪 | DUTB |
| 13 | 配置 | DUTA |
| 14 | 固定等待 | — |
| 15 | 等待就绪 | DUTB |
| 16 | 等待就绪 | DUTB |
| 17 | 清理 | DUTA |
| 18 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.1/24
exit
interface <PortC>
no switchport
ip address 2.2.2.1/24
exit
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
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

DUTA：

```text
configure terminal
router bgp 100 view test1
no neighbor 1.1.1.2
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test1 neighbors`，回显应包含 `Established`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test2 neighbors`，回显应包含 `Established`；超时 30 秒。
- DUTB：轮询 `show ip bgp view test1 neighbors`，回显应包含 `Established`；超时 30 秒。
- DUTB：轮询 `show ip bgp view test2 neighbors`，回显应包含 `Established`；超时 30 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTB：轮询 `show ip bgp view test1 neighbors`，回显应包含 `Active`；超时 30 秒。
- DUTB：轮询 `show ip bgp view test2 neighbors`，回显应包含 `Established`；超时 30 秒。
**清理**

DUTA：

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

### 4.18 用例 0180：测试BGP多实例IPv6 Unicast地址族

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0180-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTA |
| 11 | 等待就绪 | DUTB |
| 12 | 等待就绪 | DUTB |
| 13 | 配置 | DUTA |
| 14 | 固定等待 | — |
| 15 | 等待就绪 | DUTB |
| 16 | 等待就绪 | DUTB |
| 17 | 清理 | DUTA |
| 18 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
ipv6 enable
interface <PortA>
no switchport
ipv6 address 1000::1/64
exit
interface <PortC>
no switchport
ipv6 address 2000::1/64
exit
router bgp 100 view test1
bgp router-id 1.2.3.4
neighbor 1000::2 remote-as 100
exit
router bgp 200 view test2
bgp router-id 4.3.2.1
neighbor 2000::2 remote-as 200
end
```

DUTB：

```text
configure terminal
ipv6 enable
interface <PortA>
no switchport
ipv6 address 1000::2/24
exit
interface <PortC>
no switchport
ipv6 address 2000::2/24
exit
router bgp 100 view test1
bgp router-id 2.3.4.5
neighbor 1000::1 remote-as 100
exit
router bgp 200 view test2
bgp router-id 5.4.3.2
neighbor 2000::1 remote-as 200
end
```

DUTA：

```text
clear bgp ipv6 view test1 *
```

DUTA：

```text
clear bgp ipv6 view test2 *
```

DUTA：

```text
configure terminal
router bgp 100 view test1
no neighbor 1000::2
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show bgp ipv6 neighbors 1000::2`，回显应包含 `Established`；超时 60 秒。
- DUTA：轮询 `show bgp ipv6 neighbors 2000::2`，回显应包含 `Established`；超时 30 秒。
- DUTB：轮询 `show bgp ipv6 neighbors 1000::1`，回显应包含 `Established`；超时 30 秒。
- DUTB：轮询 `show bgp ipv6 neighbors 2000::1`，回显应包含 `Established`；超时 30 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTB：轮询 `show bgp ipv6 neighbors 1000::1`，回显应包含 `Active`；超时 30 秒。
- DUTB：轮询 `show bgp ipv6 neighbors 2000::1`，回显应包含 `Established`；超时 30 秒。
**清理**

DUTA：

```text
configure terminal
no ipv6 enable
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

DUTB：

```text
configure terminal
no ipv6 enable
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

### 4.19 用例 0190：测试BGP多实例VPNv4地址族

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0190-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 配置 | DUTD |
| 5 | 固定等待 | — |
| 6 | 等待就绪 | DUTB |
| 7 | 等待就绪 | DUTC |
| 8 | 配置 | DUTB |
| 9 | 配置 | DUTC |
| 10 | 配置 | DUTB |
| 11 | 配置 | DUTC |
| 12 | 等待就绪 | DUTA |
| 13 | 等待就绪 | DUTD |
| 14 | 等待就绪 | DUTB |
| 15 | 等待就绪 | DUTC |
| 16 | 观测 | DUTA |
| 17 | 观测 | DUTD |
| 18 | 清理 | DUTA |
| 19 | 清理 | DUTB |
| 20 | 清理 | DUTC |
| 21 | 清理 | DUTD |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 2.2.2.1/24
exit
interface loopback0
ip address 4.4.4.4/32
exit
router rip
network 2.2.2.0/24
redistribute connected
end
```

DUTB：

```text
configure terminal
ip vrf vpn1
rd 1:1
route-target both 1:1
exit
interface <PortB>
no switchport
label-switching
ip address 1.1.1.1/24
enable-ldp
exit
interface <PortA>
no switchport
ip vrf forwarding vpn1
ip address 2.2.2.2/24
exit
interface loopback0
ip address 5.5.5.5/32
exit
router ospf
redistribute connected
network 1.1.1.0/24 area 0
exit
router rip
address-family ipv4 vrf vpn1
network 2.2.2.0/24
redistribute bgp
exit-address-family
exit
router bgp 1
exit
router bgp 2 view test
neighbor 6.6.6.6 remote-as 2
neighbor 6.6.6.6 update-source loopback0
address-family vpnv4 unicast
neighbor 6.6.6.6 activate
neighbor 6.6.6.6 send-community both
exit-address-family
address-family ipv4 vrf vpn1
redistribute connected
redistribute rip
exit-address-family
exit
router ldp
router-id 5.5.5.5
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
ip address 1.1.1.2/24
enable-ldp
exit
interface <PortA>
no switchport
ip vrf forwarding vpn1
ip address 3.3.3.3/24
exit
interface loopback0
ip address 6.6.6.6/32
exit
router ospf
redistribute connected
network 1.1.1.0/24 area 0
exit
router rip
address-family ipv4 vrf vpn1
network 3.3.3.0/24
redistribute bgp
exit-address-family
exit
router bgp 1
exit
router bgp 2 view test
neighbor 5.5.5.5 remote-as 2
neighbor 5.5.5.5 update-source loopback0
address-family vpnv4 unicast
neighbor 5.5.5.5 activate
neighbor 5.5.5.5 send-community both
exit-address-family
address-family ipv4 vrf vpn1
redistribute connected
redistribute rip
exit-address-family
exit
router ldp
router-id 6.6.6.6
end
```

DUTD：

```text
configure terminal
interface <PortA>
no switchport
ip address 3.3.3.4/24
exit
interface loopback0
ip address 7.7.7.7/32
exit
router rip
network 3.3.3.0/24
redistribute connected
end
```

DUTB：

```text
clear bgp view test *
```

DUTC：

```text
clear bgp view test *
```

DUTB：

```text
clear ldp session *
```

DUTC：

```text
clear ldp session *
```

**触发与等待**

- 固定等待 30 秒；等待依据见脚本注释。
- DUTB：轮询 `show ip route`，回显应包含 `O E2     6.6.6.6/32`；超时 60 秒。
- DUTC：轮询 `show ip route`，回显应包含 `O E2     5.5.5.5/32`；超时 60 秒。
- DUTA：轮询 `show ip route`，回显应匹配正则 `/R.*?7.7.7.7/32/`；超时 120 秒。
- DUTD：轮询 `show ip route`，回显应匹配正则 `/R.*?4.4.4.4/32/`；超时 120 秒。
- DUTB：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 120 秒。
- DUTC：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 120 秒。
**观测与预期**

- DUTA：执行 `ping 7.7.7.7`，回显应包含 ` 0% packet loss`。
- DUTD：执行 `ping 4.4.4.4`，回显应包含 ` 0% packet loss`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
exit
no interface loopback0
no router rip
end
```

DUTB：

```text
configure terminal
no ip vrf vpn1
interface <PortB>
switchport
disable-ldp
exit
interface <PortA>
switchport
exit
no interface loopback 0
no router ospf
no router rip
no router bgp 1
no router bgp 2 view test
no router ldp
end
```

DUTC：

```text
configure terminal
no ip vrf vpn1
interface <PortB>
switchport
disable-ldp
exit
interface <PortA>
switchport
exit
no interface loopback 0
no router ospf
no router rip
no router bgp 1
no router bgp 2 view test
no router ldp
end
```

DUTD：

```text
configure terminal
interface <PortA>
switchport
exit
no interface loopback0
no router rip
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.20 用例 0200：测试bgp多实例 ebgp underlay 叠加 ibgp evpn路由

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0200-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTA |
| 6 | 等待就绪 | DUTB |
| 7 | 等待就绪 | DUTB |
| 8 | 等待就绪 | DUTB |
| 9 | 等待就绪 | DUTC |
| 10 | 配置 | DUTA |
| 11 | 配置 | DUTB |
| 12 | 配置 | DUTC |
| 13 | 等待就绪 | DUTA |
| 14 | 等待就绪 | DUTB |
| 15 | 配置 | DUTA |
| 16 | 配置 | DUTC |
| 17 | 等待就绪 | DUTA |
| 18 | 等待就绪 | DUTC |
| 19 | 固定等待 | — |
| 20 | 观测 | DUTA |
| 21 | 观测 | DUTC |
| 22 | 清理 | DUTA |
| 23 | 清理 | DUTB |
| 24 | 清理 | DUTC |

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
ip address 1.1.1.1/24
exit
interface loopback0
ip address 10.10.10.10/32
exit
interface loopback1
ip vrf forwarding v1
ip address 10.1.1.1/32
exit
interface nve0
source eth-0-1
member vni 1000 associate-vrf
exit
evpn
exit
router bgp 65001
neighbor 1.1.1.2 remote-as 65000
network 1.1.1.0 mask 255.255.255.0
network 10.10.10.10 mask 255.255.255.255
exit
router bgp 64512 view 64512
neighbor 11.11.11.11 remote-as 64512
neighbor 11.11.11.11 update-source loopback0
address-family l2vpn evpn
neighbor 11.11.11.11 activate
neighbor 11.11.11.11 send-community both
exit-address-family
address-family ipv4 vrf v1
advertise l2vpn evpn
redistribute connected
exit-address-family
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.2/24
exit
interface <PortB>
no switchport
ip address 2.2.2.2/24
exit
router bgp 65000
neighbor 1.1.1.1 remote-as 65001
neighbor 2.2.2.1 remote-as 65002
end
```

DUTC：

```text
configure terminal
ip vrf v1
rd 1000:2
route-target both 100:1000 evpn
vxlan vni 1000
exit
interface <PortB>
no switchport
vxlan uplink enable
ip address 2.2.2.1/24
exit
interface loopback0
ip address 11.11.11.11/32
exit
interface loopback1
ip vrf forwarding v1
ip address 11.1.1.1/32
exit
interface nve0
source eth-0-2
member vni 1000 associate-vrf
exit
evpn
exit
router bgp 65002
neighbor 2.2.2.2 remote-as 65000
network 2.2.2.0 mask 255.255.255.0
network 11.11.11.11 mask 255.255.255.255
exit
router bgp 64512 view 64512
neighbor 10.10.10.10 remote-as 64512
neighbor 10.10.10.10 update-source loopback0
address-family l2vpn evpn
neighbor 10.10.10.10 activate
neighbor 10.10.10.10 send-community both
exit-address-family
address-family ipv4 vrf v1
advertise l2vpn evpn
redistribute connected
end
```

DUTA：

```text
clear ip bgp *
```

DUTB：

```text
clear ip bgp *
```

DUTC：

```text
clear ip bgp *
```

DUTA：

```text
clear bgp view 64512 *
```

DUTC：

```text
clear bgp view 64512 *
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortB>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTC：轮询 `show interface <PortB>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show ip route`，回显应匹配正则 `/B.*?11.11.11.11/32/`；超时 60 秒。
- DUTB：轮询 `show ip route`，回显应匹配正则 `/B.*?10.10.10.10/32/`；超时 60 秒。
- DUTA：轮询 `show ip route vrf v1`，回显应匹配正则 `/B.*?11.1.1.1/32/`；超时 60 秒。
- DUTC：轮询 `show ip route vrf v1`，回显应匹配正则 `/B.*?10.1.1.1/32/`；超时 60 秒。
- 固定等待 3 秒；等待依据见脚本注释。
**观测与预期**

- DUTA：执行 `ping vrf v1 11.1.1.1`，回显应包含 ` 0% packet loss`。
- DUTC：执行 `ping vrf v1 10.1.1.1`，回显应包含 ` 0% packet loss`。

**清理**

DUTA：

```text
configure terminal
no ip vrf v1
interface <PortA>
switchport
vxlan uplink disable
exit
no evpn
no interface nve 0
no interface loopback 0
no interface loopback 1
no router bgp 65001
no router bgp 64512 view 64512
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
no router bgp 65000
end
```

DUTC：

```text
configure terminal
no ip vrf v1
interface <PortB>
switchport
vxlan uplink disable
exit
no evpn
no interface nve 0
no interface loopback 0
no interface loopback 1
no router bgp 65002
no router bgp 64512 view 64512
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.21 用例 0210：测试BGP多实例配置BFD检测

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0210-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

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
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTA |
| 11 | 等待就绪 | DUTA |
| 12 | 等待就绪 | DUTB |
| 13 | 配置 | DUTB |
| 14 | 观测 | DUTA |
| 15 | 观测 | DUTA |
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
interface <PortC>
no switchport
ip address 2.2.2.1/24
exit
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
neighbor 1.1.1.2 fall-over bfd
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
neighbor 1.1.1.1 fall-over bfd
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

DUTB：

```text
configure terminal
router bgp 100 view test1
no neighbor 1.1.1.1 fall-over bfd
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test1 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test2 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
- DUTA：轮询 `show bfd session detail`，回显应包含 `Session State : Up`；超时 30 秒。
- DUTB：轮询 `show bfd session detail`，回显应包含 `Session State : Up`；超时 30 秒。
**观测与预期**

- DUTA：执行 `show ip bgp neighbors 1.1.1.2`，回显应包含 `BGP state = Idle`。
- DUTA：执行 `show ip bgp neighbors 2.2.2.2`，回显应包含 `BGP state = Established`。

**清理**

DUTA：

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

### 4.22 用例 0220：测试BGP多实例配置 VXLAN L2 EVPN

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0220-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 配置 | DUTB |
| 5 | 固定等待 | — |
| 6 | 等待就绪 | DUTA |
| 7 | 等待就绪 | DUTA |
| 8 | 抓包 / 停流 | RenixPort.B |
| 9 | 流量发送 | RenixPort.A |
| 10 | 流量校验 | RenixPort.B |
| 11 | 清理 | DUTA |
| 12 | 清理 | DUTB |
| 13 | 清理 | DUTC |

**配置**

DUTA：

```text
configure terminal
vlan database
vlan 10
vlan 10 overlay enable
exit
interface <PortA>
no switchport
vxlan uplink enable
ip address 192.168.1.1/24
exit
interface <PortD>
switchport mode trunk
switchport trunk allowed vlan add 10
exit
interface loopback0
ip address 10.1.1.1/32
exit
interface nve0
source loopback0
member vni 10
exit
overlay
vlan 10 vni 10
exit
evpn
vni 10
rd 10:1
route-target both 10:10
exit
router bgp 100 view test1
bgp router-id 10.1.1.1
neighbor 10.2.2.2 remote-as 100
neighbor 10.2.2.2 update-source loopback0
address-family ipv4
neighbor 10.2.2.2 activate
exit-address-family
address-family l2vpn evpn
neighbor 10.2.2.2 activate
neighbor 10.2.2.2 send-community both
exit-address-family
exit
ip route 10.2.2.2/32 192.168.1.2
ip route 10.3.3.3/32 192.168.1.2
end
```

DUTB：

```text
configure terminal
vlan database
vlan 10,20
vlan 10 overlay enable
vlan 20 overlay enable
exit
ip vrf evpn
exit
interface <PortA>
no switchport
vxlan uplink enable
ip address 192.168.1.2/24
exit
interface <PortB>
no switchport
vxlan uplink enable
ip address 192.168.2.1/24
exit
interface vlan10
ip address 192.168.10.1/24
exit
interface vlan20
ip address 192.168.20.1/24
exit
interface loopback0
ip address 10.2.2.2/32
exit
interface nve0
source loopback0
member vni 10
member vni 20
exit
overlay
vlan 10 vni 10
vlan 20 vni 20
exit
evpn
vni 10
rd 10:2
route-target both 10:10
vni 20
rd 20:2
route-target both 20:20
exit
exit
router bgp 100 view test1
bgp router-id 10.2.2.2
neighbor 10.1.1.1 remote-as 100
neighbor 10.1.1.1 update-source loopback0
neighbor 10.3.3.3 remote-as 100
neighbor 10.3.3.3 update-source loopback0
address-family ipv4
neighbor 10.1.1.1 activate
neighbor 10.3.3.3 activate
exit-address-family
address-family l2vpn evpn
neighbor 10.1.1.1 activate
neighbor 10.1.1.1 route-reflector-client
neighbor 10.1.1.1 send-community both
neighbor 10.3.3.3 activate
neighbor 10.3.3.3 route-reflector-client
neighbor 10.3.3.3 send-community both
exit-address-family
exit
ip route 10.1.1.1/32 192.168.1.1
ip route 10.3.3.3/32 192.168.2.2
end
```

DUTC：

```text
configure terminal
vlan database
vlan 10,20
vlan 10 overlay enable
vlan 20 overlay enable
exit
interface <PortB>
no switchport
vxlan uplink enable
ip address 192.168.2.2/24
exit
interface <PortD>
switchport mode trunk
switchport trunk allowed vlan add 10,20
exit
interface loopback0
ip address 10.3.3.3/32
exit
interface nve0
source loopback0
member vni 10
member vni 20
exit
overlay
vlan 10 vni 10
vlan 20 vni 20
exit
evpn
vni 10
rd 10:3
route-target both 10:10
vni 20
rd 20:3
route-target both 20:20
exit
exit
router bgp 100 view test1
bgp router-id 10.3.3.3
neighbor 10.2.2.2 remote-as 100
neighbor 10.2.2.2 update-source loopback0
address-family ipv4
neighbor 10.2.2.2 activate
exit-address-family
address-family l2vpn evpn
neighbor 10.2.2.2 activate
neighbor 10.2.2.2 send-community both
exit-address-family
exit
ip route 10.1.1.1/32 192.168.2.1
ip route 10.2.2.2/32 192.168.2.1
end
```

DUTB：

```text
clear bgp view test1 *
```

**触发与等待**

- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show overlay`，回显应匹配正则 `/10.*?10.2.2.2/`；超时 30 秒。
- DUTA：轮询 `show overlay`，回显应匹配正则 `/10.*?10.3.3.3/`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:00:44:55:77`，VLAN 10，目的 IP `10.10.10.100`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:00:44:55:77",
        src: "00:00:00:44:55:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 10, type: 0x0800 })
      .setIPv4({
        src: "100.100.100.1",
        dst: "10.10.10.100",
      }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: { step_count: 10 },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、IPv4，目的 MAC `00:00:00:44:55:77`，目的 IP `10.10.10.100`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:00:44:55:77",
        src: "00:00:00:44:55:66",
      })
      .setIPv4({
        src: "100.100.100.1",
        dst: "10.10.10.100",
      }),
    expected_count: 10,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
no evpn
no router bgp 100 view test1
no interface nve0
no interface loopback0
overlay
no vlan 10 vni
exit
vlan database
no vlan 10
exit
interface <PortA>
switchport
vxlan uplink disable
exit
interface <PortD>
switchport mode access
exit
no ip route 10.2.2.2/32
no ip route 10.3.3.3/32
end
```

DUTB：

```text
configure terminal
no ip vrf evpn
no evpn
no interface loopback0
no interface nve0
no router bgp 100 view test1
overlay
no vlan 10 vni
no vlan 20 vni
exit
vlan database
no vlan 10,20
exit
interface <PortA>
switchport
vxlan uplink disable
exit
interface <PortB>
switchport
vxlan uplink disable
exit
no ip route 10.1.1.1/32
no ip route 10.3.3.3/32
end
```

DUTC：

```text
configure terminal
no evpn
no router bgp 100 view test1
no interface loopback0
no interface nve0
overlay
no vlan 10 vni
no vlan 20 vni
exit
vlan database
no vlan 10,20
exit
interface <PortB>
switchport
vxlan uplink disable
exit
interface <PortD>
switchport mode access
exit
no ip route 10.1.1.1/32
no ip route 10.2.2.2/32
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.23 用例 0230：测试BGP多实例配置 VXLAN L3 EVPN

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0230-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 配置 | DUTD |
| 5 | 配置 | DUTB |
| 6 | 固定等待 | — |
| 7 | 观测 | DUTA |
| 8 | 固定等待 | — |
| 9 | 观测 | DUTB |
| 10 | 等待就绪 | DUTD |
| 11 | 清理 | DUTA |
| 12 | 清理 | DUTB |
| 13 | 清理 | DUTC |
| 14 | 清理 | DUTD |

**配置**

DUTA：

```text
configure terminal
vlan database
vlan 10
exit
interface vlan 10
ip address 192.168.10.100/24
interface <PortA>
switchport mode trunk
switchport trunk allowed vlan add 10
end
```

DUTB：

```text
configure terminal
vlan database
vlan 10
vlan 10 overlay enable
exit
ip vrf evpn
rd 1000:1
route-target import 1000:1000 evpn
vxlan vni 1000
exit
interface <PortB>
no switchport
vxlan uplink enable
ip address 192.168.1.1/24
exit
interface <PortA>
switchport mode trunk
switchport trunk allowed vlan add 10
exit
interface vlan10
ip vrf forwarding evpn
overlay distributed-gateway enable
overlay host-collect enable
ip address 192.168.10.1/24
exit
interface loopback0
ip address 10.1.1.1/32
exit
interface nve0
source loopback0
member vni 10
member vni 1000 associate-vrf
exit
overlay
vlan 10 vni 10
exit
evpn
vni 10
rd 10:1
route-target both 10:10
route-target export 1000:1000
exit
exit
router bgp 100 view test1
bgp router-id 10.1.1.1
neighbor 10.2.2.2 remote-as 100
neighbor 10.2.2.2 update-source loopback0
address-family ipv4
neighbor 10.2.2.2 activate
exit-address-family
address-family l2vpn evpn
neighbor 10.2.2.2 activate
neighbor 10.2.2.2 send-community both
exit-address-family
exit
ip route 10.2.2.2/32 192.168.1.2
ip route 10.3.3.3/32 192.168.1.2
end
```

DUTC：

```text
configure terminal
interface <PortB>
no switchport
vxlan uplink enable
ip address 192.168.1.2/24
exit
interface <PortA>
no switchport
vxlan uplink enable
ip address 192.168.2.1/24
exit
interface loopback0
ip address 10.2.2.2/32
exit
evpn
exit
router bgp 100 view test1
bgp router-id 10.2.2.2
neighbor 10.1.1.1 remote-as 100
neighbor 10.1.1.1 update-source loopback0
neighbor 10.3.3.3 remote-as 100
neighbor 10.3.3.3 update-source loopback0
address-family ipv4
neighbor 10.1.1.1 activate
neighbor 10.3.3.3 activate
exit-address-family
address-family l2vpn evpn
retain route-target all
neighbor 10.1.1.1 activate
neighbor 10.1.1.1 route-reflector-client
neighbor 10.1.1.1 send-community both
neighbor 10.3.3.3 activate
neighbor 10.3.3.3 route-reflector-client
neighbor 10.3.3.3 send-community both
exit-address-family
exit
ip route 10.1.1.1/32 192.168.1.1
ip route 10.3.3.3/32 192.168.2.2
end
```

DUTD：

```text
configure terminal
vlan database
vlan 10,20
vlan 10 overlay enable
vlan 20 overlay enable
exit
ip vrf evpn
rd 1000:3
route-target import 1000:1000 evpn
vxlan vni 1000
exit
interface <PortA>
no switchport
vxlan uplink enable
ip address 192.168.2.2/24
exit
interface <PortD>
switchport mode trunk
switchport trunk allowed vlan add 10,20
exit
interface vlan10
ip vrf forwarding evpn
overlay distributed-gateway enable
overlay host-collect enable
ip address 192.168.10.1/24
exit
interface vlan20
ip vrf forwarding evpn
overlay distributed-gateway enable
overlay host-collect enable
ip address 192.168.20.1/24
exit
interface loopback0
ip address 10.3.3.3/32
exit
interface nve0
source loopback0
member vni 10
member vni 20
member vni 1000 associate-vrf
exit
overlay
vlan 10 vni 10
vlan 20 vni 20
exit
evpn
vni 10
rd 10:3
route-target both 10:10
route-target export 1000:1000
vni 20
rd 20:3
route-target both 20:20
route-target export 1000:1000
exit
exit
router bgp 100 view test1
bgp router-id 10.3.3.3
neighbor 10.2.2.2 remote-as 100
neighbor 10.2.2.2 update-source loopback0
address-family ipv4
neighbor 10.2.2.2 activate
exit-address-family
address-family l2vpn evpn
neighbor 10.2.2.2 activate
neighbor 10.2.2.2 send-community both
exit-address-family
exit
ip route 10.1.1.1/32 192.168.2.1
ip route 10.2.2.2/32 192.168.2.1
end
```

DUTB：

```text
clear bgp view test1 *
```

**触发与等待**

- 固定等待 25 秒；等待依据见脚本注释。
- 固定等待 5 秒；等待依据见脚本注释。
- DUTD：轮询 `show ip route vrf evpn`，回显应匹配正则 `/B.*?192.168.10.100/32/`；超时 60 秒。
**观测与预期**

- DUTA：执行 `ping 192.168.10.1`，回显应包含 ` 0% packet loss`。
- DUTB：执行 `show ip arp vrf evpn`，回显应匹配正则 `/192.168.10.100.*?<DeviceARouteMac>/`。

**清理**

DUTA：

```text
configure terminal
vlan database
no vlan 10
exit
interface <PortA>
switchport mode access
end
```

DUTB：

```text
configure terminal
no router bgp 100 view test1
no evpn
no ip vrf evpn
no ip route 10.2.2.2/32
no ip route 10.3.3.3/32
no interface loopback0
no interface nve0
overlay
no vlan 10 vni
exit
vlan database
no vlan 10
exit
interface <PortB>
switchport
vxlan uplink disable
exit
interface <PortA>
switchport mode access
exit
end
```

DUTC：

```text
configure terminal
no router bgp 100 view test1
no evpn
no interface loopback0
interface <PortB>
switchport
vxlan uplink disable
exit
interface <PortA>
switchport
vxlan uplink disable
exit
no ip route 10.1.1.1/32
no ip route 10.3.3.3/32
end
```

DUTD：

```text
configure terminal
no router bgp 100 view test1
no evpn
no ip vrf evpn
no interface loopback0
no interface nve0
no ip route 10.1.1.1/32
no ip route 10.2.2.2/32
overlay
no vlan 10 vni
no vlan 20 vni
vlan database
no vlan 10,20
exit
interface <PortA>
switchport
vxlan uplink disable
exit
interface <PortD>
switchport mode access
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.24 用例 0240：测试BGP多实例配置 ipv4 地址族路由重分布

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0240-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTA |
| 5 | 配置 | DUTA |
| 6 | 配置 | DUTA |
| 7 | 固定等待 | — |
| 8 | 等待就绪 | DUTA |
| 9 | 等待就绪 | DUTA |
| 10 | 配置 | DUTB |
| 11 | 固定等待 | — |
| 12 | 观测 | DUTA |
| 13 | 观测 | DUTA |
| 14 | 观测 | DUTA |
| 15 | 观测 | DUTA |
| 16 | 配置 | DUTB |
| 17 | 固定等待 | — |
| 18 | 观测 | DUTA |
| 19 | 观测 | DUTA |
| 20 | 观测 | DUTA |
| 21 | 观测 | DUTA |
| 22 | 配置 | DUTB |
| 23 | 固定等待 | — |
| 24 | 观测 | DUTA |
| 25 | 观测 | DUTA |
| 26 | 观测 | DUTA |
| 27 | 观测 | DUTA |
| 28 | 配置 | DUTB |
| 29 | 固定等待 | — |
| 30 | 观测 | DUTA |
| 31 | 观测 | DUTA |
| 32 | 观测 | DUTA |
| 33 | 观测 | DUTA |
| 34 | 清理 | DUTA |
| 35 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
router-id 1.1.1.1
interface <PortA>
no switchport
ip address 1.1.1.1/24
exit
interface <PortB>
no switchport
ip address 2.2.2.1/24
exit
router bgp 100 view test1
neighbor 1.1.1.2 remote-as 100
exit
router bgp 200 view test2
neighbor 2.2.2.2 remote-as 200
end
```

DUTB：

```text
configure terminal
router-id 2.2.2.2
interface <PortA>
no switchport
ip address 1.1.1.2/24
exit
interface <PortB>
no switchport
ip address 2.2.2.2/24
exit
interface <PortD>
no switchport
ip address 10.10.10.1/24
exit
ip route 100.100.100.0/24 10.10.10.2
router bgp 100 view test1
neighbor 1.1.1.1 remote-as 100
neighbor 1.1.1.1 as-origination-interval 1
neighbor 1.1.1.1 advertisement-interval 0
exit
router bgp 200 view test2
neighbor 2.2.2.1 remote-as 200
neighbor 2.2.2.1 as-origination-interval 1
neighbor 2.2.2.1 advertisement-interval 0
end
```

DUTA：

```text
clear ip bgp view test1 *
```

DUTA：

```text
clear ip bgp view test2 *
```

DUTB：

```text
configure terminal
router bgp 100 view test1
redistribute connected
end
```

DUTB：

```text
configure terminal
router bgp 200 view test2
redistribute connected
end
```

DUTB：

```text
configure terminal
router bgp 100 view test1
no redistribute connected
end
```

DUTB：

```text
configure terminal
router bgp 200 view test2
no redistribute connected
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortB>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip bgp view test1 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
- DUTA：轮询 `show ip bgp view test2 neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
- 固定等待 2 秒；等待依据见脚本注释。
- 固定等待 2 秒；等待依据见脚本注释。
- 固定等待 2 秒；等待依据见脚本注释。
- 固定等待 2 秒；等待依据见脚本注释。
**观测与预期**

- DUTA：执行 `show ip bgp view test1`，回显应包含 `i1.1.1.0/24`。
- DUTA：执行 `show ip bgp view test1`，回显应包含 `i2.2.2.0/24`。
- DUTA：执行 `show ip bgp view test2`，回显应包含 `i1.1.1.0/24`。
- DUTA：执行 `show ip bgp view test2`，回显应包含 `i2.2.2.0/24`。
- DUTA：执行 `show ip bgp view test1`，回显应包含 `i1.1.1.0/24`。
- DUTA：执行 `show ip bgp view test1`，回显应包含 `i2.2.2.0/24`。
- DUTA：执行 `show ip bgp view test2`，回显应包含 `i1.1.1.0/24`。
- DUTA：执行 `show ip bgp view test2`，回显应包含 `i2.2.2.0/24`。
- DUTA：执行 `show ip bgp view test1`，回显应包含 `i1.1.1.0/24`。
- DUTA：执行 `show ip bgp view test1`，回显应包含 `i2.2.2.0/24`。
- DUTA：执行 `show ip bgp view test2`，回显应包含 `i1.1.1.0/24`。
- DUTA：执行 `show ip bgp view test2`，回显应包含 `i2.2.2.0/24`。
- DUTA：执行 `show ip bgp view test1`，回显应包含 `i1.1.1.0/24`。
- DUTA：执行 `show ip bgp view test1`，回显应包含 `i2.2.2.0/24`。
- DUTA：执行 `show ip bgp view test2`，回显应包含 `i1.1.1.0/24`。
- DUTA：执行 `show ip bgp view test2`，回显应包含 `i2.2.2.0/24`。

**清理**

DUTA：

```text
configure terminal
no router bgp 100 view test1
no router bgp 200 view test2
no router-id
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
interface <PortC>
switchport
exit
```

DUTB：

```text
configure terminal
no router bgp 100 view test1
no router bgp 200 view test2
no ip route 100.100.100.0/24
no router-id
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
interface <PortD>
switchport
exit
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.25 用例 0250：测试BGP多实例配置 ipv6 地址族路由重分布

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0250-IP_ROUTE-BGP_MULTIPLE_INSTANCE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTA |
| 5 | 固定等待 | — |
| 6 | 观测 | DUTA |
| 7 | 观测 | DUTA |
| 8 | 配置 | DUTA |
| 9 | 配置 | DUTA |
| 10 | 固定等待 | — |
| 11 | 等待就绪 | DUTA |
| 12 | 等待就绪 | DUTA |
| 13 | 配置 | DUTB |
| 14 | 固定等待 | — |
| 15 | 观测 | DUTA |
| 16 | 观测 | DUTA |
| 17 | 观测 | DUTA |
| 18 | 观测 | DUTA |
| 19 | 配置 | DUTB |
| 20 | 固定等待 | — |
| 21 | 观测 | DUTA |
| 22 | 观测 | DUTA |
| 23 | 观测 | DUTA |
| 24 | 观测 | DUTA |
| 25 | 配置 | DUTB |
| 26 | 固定等待 | — |
| 27 | 观测 | DUTA |
| 28 | 观测 | DUTA |
| 29 | 观测 | DUTA |
| 30 | 观测 | DUTA |
| 31 | 配置 | DUTB |
| 32 | 固定等待 | — |
| 33 | 观测 | DUTA |
| 34 | 观测 | DUTA |
| 35 | 观测 | DUTA |
| 36 | 观测 | DUTA |
| 37 | 清理 | DUTA |
| 38 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
ipv6 enable
router-id 1.1.1.1
interface <PortA>
no switchport
ipv6 address 1::1/64
exit
interface <PortB>
no switchport
ipv6 address 2::1/64
exit
router bgp 100 view test1
neighbor 1::2 remote-as 100
exit
router bgp 200 view test2
neighbor 2::2 remote-as 200
end
```

DUTB：

```text
configure terminal
ipv6 enable
router-id 2.2.2.2
interface <PortA>
no switchport
ipv6 address 1::2/64
exit
interface <PortB>
no switchport
ipv6 address 2::2/64
exit
interface <PortD>
no switchport
ip address 10.10.10.1/24
exit
ip route 100.100.100.0/24 10.10.10.2
router bgp 100 view test1
neighbor 1::1 remote-as 100
neighbor 1::1 as-origination-interval 1
neighbor 1::1 advertisement-interval 0
exit
router bgp 200 view test2
neighbor 2::1 remote-as 200
neighbor 2::1 as-origination-interval 1
neighbor 2::1 advertisement-interval 0
end
```

DUTA：

```text
clear bgp ipv6 view test1 *
```

DUTA：

```text
clear bgp ipv6 view test2 *
```

DUTB：

```text
configure terminal
router bgp 100 view test1
address-family ipv6
redistribute connected
end
```

DUTB：

```text
configure terminal
router bgp 200 view test2
address-family ipv6
redistribute connected
end
```

DUTB：

```text
configure terminal
router bgp 100 view test1
address-family ipv6
no redistribute connected
end
```

DUTB：

```text
configure terminal
router bgp 200 view test2
address-family ipv6
no redistribute connected
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortB>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- 固定等待 5 秒；等待依据见脚本注释。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show bgp ipv6 neighbors 1::2`，回显应包含 `BGP state = Established`；超时 30 秒。
- DUTA：轮询 `show bgp ipv6 neighbors 2::2`，回显应包含 `BGP state = Established`；超时 30 秒。
- 固定等待 2 秒；等待依据见脚本注释。
- 固定等待 2 秒；等待依据见脚本注释。
- 固定等待 2 秒；等待依据见脚本注释。
- 固定等待 2 秒；等待依据见脚本注释。
**观测与预期**

- DUTA：执行 `ping ipv6 1::2`，回显应包含 ` 0% packet loss`。
- DUTA：执行 `ping ipv6 2::2`，回显应包含 ` 0% packet loss`。
- DUTA：执行 `show bgp ipv6 view test1`，回显应包含 `i1::/64`。
- DUTA：执行 `show bgp ipv6 view test1`，回显应包含 `i2::/64`。
- DUTA：执行 `show bgp ipv6 view test2`，回显应包含 `i1::/64`。
- DUTA：执行 `show bgp ipv6 view test2`，回显应包含 `i2::/64`。
- DUTA：执行 `show bgp ipv6 view test1`，回显应包含 `i1::/64`。
- DUTA：执行 `show bgp ipv6 view test1`，回显应包含 `i2::/64`。
- DUTA：执行 `show bgp ipv6 view test2`，回显应包含 `i1::/64`。
- DUTA：执行 `show bgp ipv6 view test2`，回显应包含 `i2::/64`。
- DUTA：执行 `show bgp ipv6 view test1`，回显应包含 `i1::/64`。
- DUTA：执行 `show bgp ipv6 view test1`，回显应包含 `i2::/64`。
- DUTA：执行 `show bgp ipv6 view test2`，回显应包含 `i1::/64`。
- DUTA：执行 `show bgp ipv6 view test2`，回显应包含 `i2::/64`。
- DUTA：执行 `show bgp ipv6 view test1`，回显应包含 `i1::/64`。
- DUTA：执行 `show bgp ipv6 view test1`，回显应包含 `i2::/64`。
- DUTA：执行 `show bgp ipv6 view test2`，回显应包含 `i1::/64`。
- DUTA：执行 `show bgp ipv6 view test2`，回显应包含 `i2::/64`。

**清理**

DUTA：

```text
configure terminal
no router bgp 100 view test1
no router bgp 200 view test2
no ipv6 enable
no router-id
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
interface <PortC>
switchport
exit
```

DUTB：

```text
configure terminal
no router bgp 100 view test1
no router bgp 200 view test2
no ip route 100.100.100.0/24
no ipv6 enable
no router-id
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
interface <PortD>
switchport
exit
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

## 5. 清理与恢复

各用例的清理命令见第 4 节对应小节。合集执行完毕后，按设备执行以下检查，确认本合集新增对象均已删除。

```text
show running-config
show ip route
show ip bgp
show ip ospf neighbor
```

清理顺序：业务路由 → 接口、隧道与 loopback → 协议进程 → VRF → 接口回二层。清理完成后重新执行上述命令，确认无本合集对象残留。

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
| 0010 | | | |
| 0020 | | | |
| 0030 | | | |
| 0040 | | | |
| 0050 | | | |
| 0060 | | | |
| 0070 | | | |
| 0080 | | | |
| 0090 | | | |
| 0100 | | | |
| 0110 | | | |
| 0120 | | | |
| 0130 | | | |
| 0140 | | | |
| 0150 | | | |
| 0160 | | | |
| 0170 | | | |
| 0180 | | | |
| 0190 | | | |
| 0200 | | | |
| 0210 | | | |
| 0220 | | | |
| 0230 | | | |
| 0240 | | | |
| 0250 | | | |

