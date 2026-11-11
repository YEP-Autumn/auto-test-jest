# 以太网 VLAN子接口测试用例合集

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本目录全部测试脚本。
> 同一目录的脚本共用公共拓扑、预置条件与判定口径；各用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | 测试设备支持创建VLAN子接口 | `0010-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0020 | 设备支持查看和清除子接口统计信息 | `0020-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0030 | 测试设备支持创建AGG VLAN子接口 | `0030-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0040 | 测试设备能够通过VLAN子接口telnet | `0040-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0050 | 测试设备能够通过VLAN子接口ssh | `0050-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0060 | 测试设备支持配置VLAN子接口MTU | `0060-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0070 | 设备支持在子接口配置DHCP Client | `0070-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0080 | 设备支持在子接口配置DHCP Relay | `0080-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0090 | 设备支持在子接口配置DHCP Server | `0090-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0100 | 支持配置静态路由指定下一跳为VLAN子接口邻居 | `0100-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0110 | 支持通过VLAN子接口建立RIP邻居连接 | `0110-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0120 | 支持通过VLAN子接口建立OSPF邻居连接 | `0120-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0130 | 支持通过VLAN子接口建立BGP邻居连接 | `0130-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0140 | 支持通过VLAN子接口建立ISIS邻居连接 | `0140-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0150 | 支持在VLAN子接口上配置PBR | `0150-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0160 | 支持在VLAN子接口上配置IGMP | `0160-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0170 | 支持在VLAN子接口上配置PIM-SM | `0170-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0180 | 支持在VLAN子接口上配置PIM-DM | `0180-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0190 | 支持在VLAN子接口上配置ACL | `0190-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0200 | 支持在VLAN子接口上配置IPv6地址 | `0200-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0210 | 支持在VLAN子接口上配置DHCPv6 Relay | `0210-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0220 | 支持配置IPv6静态路由指定下一跳为VLAN子接口邻居 | `0220-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0230 | 支持通过VLAN子接口建立OSPFv3邻居连接 | `0230-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0240 | 支持通过VLAN子接口建立RIPng邻居连接 | `0240-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0250 | 支持在VLAN子接口上配置IPv6 PBR | `0250-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0260 | 支持在VLAN子接口上配置MLD | `0260-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0270 | 支持在VLAN子接口上配置PIMv6-SM | `0270-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0280 | 支持在VLAN子接口上配置VRF | `0280-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0290 | 支持配置VRRP指定VLAN子接口 | `0290-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0300 | 支持配置BFD指定VLAN子接口 | `0300-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0310 | 设备支持通过VLAN子接口配置MPLS VPLS | `0310-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |
| 0320 | 设备支持通过VLAN子接口配置MPLS L3VPN | `0320-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |

## 1. 基本信息（合集）

- 用例编号：`0010` ~ `0320`
- 用例标题：以太网 VLAN子接口测试用例合集
- 所属特性 / 分组：`03-ETHERNET` / `三层接口配置` / `VLAN子接口`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 78 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本合集验证的要求 |
| --- | --- | --- |
| E530 配置指导（V7.5.1） | 3.3 | VLAN子接口配置与回显 |
| E530 命令参考（V7.4.8） | 三层接口配置 | 命令参数、回显与删除 |
| IEEE 802.1Q-2018 | VLAN 标记、成员与转发 | VLAN、PVID、Trunk 与子接口处理 |
| RFC 2131 / RFC 2132 | DHCP 报文与选项 | DHCP Client、Relay、Server 交互 |
| RFC 5340 | OSPFv3 邻居与路由 | OSPFv3 邻居建立与路由计算 |
| RFC 2328 | Hello、邻居状态机、LSA | OSPF 邻居建立与路由计算 |
| RFC 4271 | BGP 会话与 Update | BGP 邻居建立与路由发布 |
| ISO/IEC 10589 | IS-IS 邻接与 LSP | IS-IS 邻居建立与路由计算 |
| RFC 2080 | RIPng 报文与路由 | RIPng 邻居与路由学习 |
| RFC 2453 | RIPv2 报文与路由 | RIP 邻居与路由学习 |
| RFC 3376 | IGMP 查询与报告 | 组播组成员管理 |
| RFC 3810 | MLD 查询与报告 | IPv6 组播组成员管理 |
| RFC 7761 | PIM-SM 加入与注册 | 组播路由建立 |
| RFC 8200 | IPv6 报文与地址 | IPv6 地址、邻居与转发 |
| RFC 5798 | VRRP 通告与选举 | VRRP 主备选举与切换 |
| RFC 5880 | BFD 控制报文 | BFD 会话建立与故障检测 |
| RFC 3031 / RFC 5036 | MPLS 标签与 LDP | 标签分发与 LSP 建立 |
| RFC 4762 / RFC 4364 | VPLS 与 L3VPN | VPLS 转发与 L3VPN 路由 |
| IEEE 802.1AX | 链路聚合 | 成员口选择与负载分担 |
| E530 命令参考（V7.4.8） | ACL 命令 | ACL 规则、动作与回显 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | 支持VLAN子接口特性 | 确认特性可用范围 |
| License / 单板 | 支持VLAN子接口相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 3 个可配置接口 | 确认接口类型与数量 |
| 测试仪端口 | RenixPort.A / RenixPort.B | 确认流量收发端口可用 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

脚本注释中给出的拓扑如下。执行前按对应拓扑完成设备与测试仪连线。

### 2.1 拓扑 1

```text
  +--------+                   +--------+
  |        |--PortA <=> PortA--|        |
  |  DUTA  |                   |  DUTB  |
  |        |--PortB <=> PortB--|        |
  +--------+                   +--------+
```

适用用例：0010、0200、0280、0290、0300。

### 2.2 拓扑 2

```text
                   +--------+
 RenixA <=> PortA--|  DUTA  |--PortB <=> RenixB
                   +--------+
```

适用用例：0020、0060、0100、0150、0160、0190、0210、0220、0250、0260。

### 2.3 拓扑 3

```text
                   +--------+                   +--------+
                   |        |--PortA <=> PortA--|        |
 RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortD <=> RenixB
                   |        |--PortC <=> PortC--|        |
                   +--------+                   +--------+
```

适用用例：0030、0040、0050、0070、0090、0110、0120、0130、0140、0170、0180、0230、0240、0270。

### 2.4 拓扑 4

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

适用用例：0080、0310。

### 2.5 拓扑 5

```text
   +--------+                   +--------+
   |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
   +--------+                   +--------+    |
                                              |
   +--------+                   +--------+    |
   |  DUTD  |--PortA <=> PortA--|  DUTC  |--PortB
   +--------+                   +--------+
```

适用用例：0320。

内置拓扑：`LinkConstraint.two_devices_topo_links_type_2`、`LinkConstraint.one_device_topo_links_type_1`、`LinkConstraint.two_devices_topo_links_type_1`、`LinkConstraint.three_devices_topo_links_type_1`、`LinkConstraint.four_devices_topo_links_type_1`。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | `<PortA>`、`<PortB>`、`<PortC>`、`<PortD>` | 被测设备端口，执行前替换为实际接口名 |
| 测试仪 | `<RenixPortA>`、`<RenixPortB>` | 流量收发端口，按测试仪实际连接配置 |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| BGP AS | 100 / 1 | 以各用例配置为准 |
| BGP 邻居 AS | 100 / 1 | 与对端一致 |
| Router ID | 1.1.1.1 / 1.1.1.2 / 2.2.2.2 / 11.11.1.1 | 全局唯一 |
| OSPF Area | 0 | 按拓扑规划 |
| VRF | test / vpn1 | 按业务实例规划 |
| 定时器 | 设备默认值 | 用例另有说明时以用例配置为准 |
| MTU | 1500 | 邻居建立前确认一致 |
| 收敛等待 | 优先使用就绪检查 | 固定等待见各用例 |

### 3.2 初始状态

- 设备接口处于默认二层或三层状态；本合集涉及的 VLAN、VRF、协议进程、静态路由、隧道、ACL、QoS 对象均为空。
- 测试仪端口已连接并可用，收发端口与脚本中的 `RenixPort` 对应。
- 设备已具备 console、telnet 或 ssh 登录方式，可进入全局配置模式。
- 脚本中标记为 `test.skip` 的用例不执行；其设计内容保留在第 4 节。
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

### 4.1 用例 0010：测试设备支持创建VLAN子接口

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0010-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTB |
| 5 | 固定等待 | — |
| 6 | 观测 | DUTA |
| 7 | 观测 | DUTB |
| 8 | 清理 | DUTA |
| 9 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.2/24
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTB：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 固定等待 2 秒；等待依据见脚本注释。
**观测与预期**

- DUTA：执行 `ping 1.1.1.2`，回显应包含 ` 0% packet loss`。
- DUTB：执行 `ping 1.1.1.1`，回显应包含 ` 0% packet loss`。

**清理**

DUTA：

```text
configure terminal
no interface <PortA>.1
interface <PortA>
switchport
end
```

DUTB：

```text
configure terminal
no interface <PortA>.1
interface <PortA>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.2 用例 0020：设备支持查看和清除子接口统计信息

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0020-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 固定等待 | — |
| 4 | 抓包 / 停流 | RenixPort.B |
| 5 | 流量发送 | RenixPort.A |
| 6 | 流量校验 | RenixPort.B |
| 7 | 观测 | DUTA |
| 8 | 观测 | DUTA |
| 9 | 清理 | DUTA |

**配置**

DUTA：

```text
clear counters
configure terminal
interface <PortA>
no switchport
exit
interface <PortB>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
statistic enable both
exit
interface <PortB>.1
dot1q termination vid 200
ip address 2.2.2.1/24
statistic enable both
exit
arp 2.2.2.2 2.2.2
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 固定等待 2 秒；等待依据见脚本注释。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，VLAN 100，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ dst: "2.2.2.2", src: "1.2.3.4" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `2.2.2`，VLAN 200，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "2.2.2",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({ dst: "2.2.2.2", src: "1.2.3.4" }),
    expected_count: 10,
  })
```

</details>

**观测与预期**

- DUTA：执行 `show interface <PortA>.1`，回显应包含 `10 packets input`。
- DUTA：执行 `show interface <PortB>.1`，回显应包含 `10 packets output`。

**清理**

DUTA：

```text
configure terminal
no interface <PortA>.1
no interface <PortB>.1
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
no arp 2.2.2.2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.3 用例 0030：测试设备支持创建AGG VLAN子接口

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0030-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTB |
| 5 | 固定等待 | — |
| 6 | 观测 | DUTA |
| 7 | 观测 | DUTB |
| 8 | 清理 | DUTA |
| 9 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
static-channel-group 1
exit
interface <PortC>
no switchport
static-channel-group 1
exit
interface agg 1.1
dot1q termination vid 100
ip address 1.1.1.1/24
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
static-channel-group 1
exit
interface <PortC>
no switchport
static-channel-group 1
exit
interface agg 1.1
dot1q termination vid 100
ip address 1.1.1.2/24
end
```

**触发与等待**

- DUTA：轮询 `show interface agg 1.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTB：轮询 `show interface agg 1.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 固定等待 2 秒；等待依据见脚本注释。
**观测与预期**

- DUTA：执行 `ping 1.1.1.2`，回显应包含 ` 0% packet loss`。
- DUTB：执行 `ping 1.1.1.1`，回显应包含 ` 0% packet loss`。

**清理**

DUTA：

```text
configure terminal
no interface agg 1.1
interface <PortA>
no static-channel-group
switchport
exit
interface <PortC>
no static-channel-group
switchport
end
```

DUTB：

```text
configure terminal
no interface agg 1.1
interface <PortA>
no static-channel-group
switchport
exit
interface <PortC>
no static-channel-group
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.4 用例 0040：测试设备能够通过VLAN子接口telnet

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0040-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTB |
| 5 | 固定等待 | — |
| 6 | 配置 | DUTA |
| 7 | 配置 | DUTB |
| 8 | 清理 | DUTA |
| 9 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.2/24
end
```

DUTA：

```text
telnet 1.1.1.2
exit
```

DUTB：

```text
telnet 1.1.1.1
exit
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTB：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 固定等待 2 秒；等待依据见脚本注释。
**清理**

DUTA：

```text
configure terminal
no interface <PortA>.1
interface <PortA>
switchport
end
```

DUTB：

```text
configure terminal
no interface <PortA>.1
interface <PortA>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.5 用例 0050：测试设备能够通过VLAN子接口ssh

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0050-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTB |
| 5 | 固定等待 | — |
| 6 | 配置 | DUTA |
| 7 | 配置 | DUTB |
| 8 | 清理 | DUTA |
| 9 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
username test privilege 4 password test
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
end
```

DUTB：

```text
configure terminal
username test privilege 4 password test
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.2/24
end
```

DUTA：

```text
ssh -l test 1.1.1.2
test
exit
```

DUTB：

```text
ssh -l test 1.1.1.1
test
exit
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTB：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 固定等待 2 秒；等待依据见脚本注释。
**清理**

DUTA：

```text
configure terminal
no username test
no interface <PortA>.1
interface <PortA>
switchport
end
```

DUTB：

```text
configure terminal
no username test
no interface <PortA>.1
interface <PortA>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.6 用例 0060：测试设备支持配置VLAN子接口MTU

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0060-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTA |
| 6 | 固定等待 | — |
| 7 | 抓包 / 停流 | RenixPort.B |
| 8 | 流量发送 | RenixPort.A |
| 9 | 流量校验 | RenixPort.B |
| 10 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortB>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
exit
interface <PortB>.1
dot1q termination vid 200
ip address 2.2.2.1/24
mtu 500
exit
arp 2.2.2.2 a.b.c
ip route 10.10.10.0/24 2.2.2.2
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTA：轮询 `show interface <PortB>`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTA：轮询 `show interface <PortB>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 固定等待 3 秒；等待依据见脚本注释。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，VLAN 100，目的 IP `10.10.10.100`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:44:55:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({
        src: "100.100.100.1",
        dst: "10.10.10.100",
      }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: { step_count: 10 },
      fixed_len: 1000,
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `a.b.c`，VLAN 200，目的 IP `10.10.10.100`，期望计数为 20。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "a.b.c",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({
        src: "100.100.100.1",
        dst: "10.10.10.100",
      }),
    /** 超过mtu的报文会上cpu后被分片 */
    expected_count: 20,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
no interface <PortA>.1
no interface <PortB>.1
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
no arp 2.2.2.2
no ip route 10.10.10.0/24
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.7 用例 0070：设备支持在子接口配置DHCP Client

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0070-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 观测 | DUTB |
| 5 | 观测 | DUTA |
| 6 | 清理 | DUTA |
| 7 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
service dhcp enable
dhcp server
dhcp pool pool1
network 5.5.5.0/24
gateway 5.5.5.1
exit
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
dhcp server enable
ip address 5.5.5.1/24
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address dhcp
end
```

**触发与等待**

- 固定等待 30 秒；等待依据见脚本注释。
**观测与预期**

- DUTB：执行 `show dhcp client verbose`，回显应包含 `DHCP server: 5.5.5.1`。
- DUTA：执行 `show dhcp server binding all`，回显应包含 `5.5.5.2`。

**清理**

DUTA：

```text
configure terminal
service dhcp disable
no dhcp server
no dhcp pool pool1
no interface <PortA>.1
interface <PortA>
switchport
end
```

DUTB：

```text
configure terminal
no interface <PortA>.1
interface <PortA>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.8 用例 0080：设备支持在子接口配置DHCP Relay

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0080-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 固定等待 | — |
| 5 | 观测 | DUTC |
| 6 | 清理 | DUTA |
| 7 | 清理 | DUTB |
| 8 | 清理 | DUTC |

**配置**

DUTA：

```text
configure terminal
service dhcp enable
dhcp server
dhcp pool pool1
network 5.5.5.0/24
exit
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
dhcp server enable
ip address 4.4.4.1/24
exit
ip route 5.5.5.0/24 4.4.4.2
end
```

DUTB：

```text
configure terminal
service dhcp enable
dhcp-server 1 4.4.4.1
dhcp relay
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 4.4.4.2/24
exit
interface <PortB>
no switchport
exit
interface <PortB>.1
dot1q termination vid 200
dhcp relay information trusted
dhcp-server 1
ip address 5.5.5.2/24
end
```

DUTC：

```text
configure terminal
interface <PortB>
no switchport
exit
interface <PortB>.1
dot1q termination vid 200
ip address dhcp
end
```

**触发与等待**

- 固定等待 30 秒；等待依据见脚本注释。
**观测与预期**

- DUTC：执行 `show dhcp client verbose`，回显应包含 `DHCP server: 4.4.4.1`。

**清理**

DUTA：

```text
configure terminal
service dhcp disable
no dhcp server
no dhcp pool pool1
no interface <PortA>.1
interface <PortA>
switchport
no ip route 5.5.5.0/24
end
```

DUTB：

```text
configure terminal
service dhcp disable
no dhcp-server 1
no dhcp relay
no interface <PortA>.1
interface <PortA>
switchport
no interface <PortB>.1
interface <PortB>
switchport
end
```

DUTC：

```text
configure terminal
no interface <PortB>.1
interface <PortB>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.9 用例 0090：设备支持在子接口配置DHCP Server

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0090-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 观测 | DUTA |
| 5 | 观测 | DUTB |
| 6 | 清理 | DUTA |
| 7 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address dhcp
end
```

DUTB：

```text
configure terminal
service dhcp enable
dhcp server
dhcp pool pool1
network 5.5.5.0/24
gateway 5.5.5.1
exit
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
dhcp server enable
ip address 5.5.5.1/24
end
```

**触发与等待**

- 固定等待 30 秒；等待依据见脚本注释。
**观测与预期**

- DUTA：执行 `show dhcp client verbose`，回显应包含 `DHCP server: 5.5.5.1`。
- DUTB：执行 `show dhcp server binding all`，回显应包含 `5.5.5.2`。

**清理**

DUTA：

```text
configure terminal
no interface <PortA>.1
interface <PortA>
switchport
end
```

DUTB：

```text
configure terminal
service dhcp disable
no dhcp server
no dhcp pool pool1
no interface <PortA>.1
interface <PortA>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.10 用例 0100：支持配置静态路由指定下一跳为VLAN子接口邻居

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0100-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTA |
| 6 | 固定等待 | — |
| 7 | 抓包 / 停流 | RenixPort.B |
| 8 | 流量发送 | RenixPort.A |
| 9 | 流量校验 | RenixPort.B |
| 10 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortB>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
exit
interface <PortB>.1
dot1q termination vid 200
ip address 2.2.2.1/24
exit
arp 2.2.2.2 a.b.c
ip route 10.10.10.10/24 2.2.2.2
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTA：轮询 `show interface <PortB>`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTA：轮询 `show interface <PortB>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 固定等待 3 秒；等待依据见脚本注释。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，VLAN 100，目的 IP `10.10.10.100`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:44:55:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
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

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `a.b.c`，VLAN 200，目的 IP `10.10.10.100`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "a.b.c",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x0800 })
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
no interface <PortA>.1
no interface <PortB>.1
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
no arp 2.2.2.2
no ip route 10.10.10.0/24
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.11 用例 0110：支持通过VLAN子接口建立RIP邻居连接

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0110-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 固定等待 | — |
| 5 | 抓包 / 停流 | RenixPort.B |
| 6 | 流量发送 | RenixPort.A |
| 7 | 流量校验 | RenixPort.B |
| 8 | 清理 | DUTA |
| 9 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 200
ip address 2.2.2.1/24
exit
router rip
network 1.1.1.0/24
network 2.2.2.0/24
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.2/24
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 300
ip address 3.3.3.1/24
exit
router rip
network 1.1.1.0/24
network 3.3.3.0/24
redistribute static
exit
arp 3.3.3.3 0003.0003.0003
ip route 10.10.10.0/24 3.3.3.3
end
```

**触发与等待**

- DUTA：轮询 `show ip route`，回显应包含 `10.10.10.0/24`；超时 60 秒。
- 固定等待 3 秒；等待依据见脚本注释。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，VLAN 100，目的 IP `10.10.10.100`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `3.3.3`，VLAN 300，目的 IP `10.10.10.100`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "3.3.3",
        src: DeviceBRouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 300, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
    expected_count: 10,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no router rip
end
```

DUTB：

```text
configure terminal
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no router rip
no ip route 10.10.10.0/24
no arp 3.3.3.3
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.12 用例 0120：支持通过VLAN子接口建立OSPF邻居连接

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0120-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTA |
| 6 | 固定等待 | — |
| 7 | 抓包 / 停流 | RenixPort.B |
| 8 | 流量发送 | RenixPort.A |
| 9 | 流量校验 | RenixPort.B |
| 10 | 清理 | DUTA |
| 11 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 200
ip address 2.2.2.1/24
exit
router ospf
router-id 1.1.1.1
network 1.1.1.0/24 area 0
network 2.2.2.0/24 area 0
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.2/24
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 300
ip address 3.3.3.1/24
exit
router ospf
router-id 1.1.1.2
network 1.1.1.0/24 area 0
network 3.3.3.0/24 area 0
redistribute static
exit
arp 3.3.3.3 0003.0003.0003
ip route 10.10.10.0/24 3.3.3.3
end
```

**触发与等待**

- 固定等待 40 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip ospf neighbor`，回显应匹配正则 `/1.1.1.2.*?Full/`；超时 30 秒。
- DUTA：轮询 `show ip route`，回显应包含 `10.10.10.0/24`；超时 30 秒。
- 固定等待 3 秒；等待依据见脚本注释。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，VLAN 100，目的 IP `10.10.10.100`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `3.3.3`，VLAN 300，目的 IP `10.10.10.100`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "3.3.3",
        src: DeviceBRouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 300, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
    expected_count: 10,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no router ospf
end
```

DUTB：

```text
configure terminal
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no router ospf
no ip route 10.10.10.0/24
no arp 3.3.3.3
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.13 用例 0130：支持通过VLAN子接口建立BGP邻居连接

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0130-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTA |
| 6 | 固定等待 | — |
| 7 | 抓包 / 停流 | RenixPort.B |
| 8 | 流量发送 | RenixPort.A |
| 9 | 流量校验 | RenixPort.B |
| 10 | 清理 | DUTA |
| 11 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 200
ip address 2.2.2.1/24
exit
router bgp 100
neighbor 1.1.1.2 remote-as 100
neighbor 1.1.1.2 activate
network 1.1.1.0/24
network 2.2.2.0/24
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.2/24
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 300
ip address 3.3.3.1/24
exit
router bgp 100
neighbor 1.1.1.1 remote-as 100
neighbor 1.1.1.1 activate
network 1.1.1.0/24
network 3.3.3.0/24
redistribute static
exit
arp 3.3.3.3 0003.0003.0003
ip route 10.10.10.0/24 3.3.3.3
end
```

**触发与等待**

- 固定等待 40 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip bgp neighbors`，回显应包含 `BGP state = Established`；超时 30 秒。
- DUTA：轮询 `show ip route`，回显应包含 `10.10.10.0/24`；超时 30 秒。
- 固定等待 3 秒；等待依据见脚本注释。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，VLAN 100，目的 IP `10.10.10.100`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `3.3.3`，VLAN 300，目的 IP `10.10.10.100`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "3.3.3",
        src: DeviceBRouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 300, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
    expected_count: 10,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no router bgp 100
end
```

DUTB：

```text
configure terminal
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no router bgp 100
no ip route 10.10.10.0/24
no arp 3.3.3.3
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.14 用例 0140：支持通过VLAN子接口建立ISIS邻居连接

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0140-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTA |
| 5 | 抓包 / 停流 | RenixPort.B |
| 6 | 流量发送 | RenixPort.A |
| 7 | 流量校验 | RenixPort.B |
| 8 | 清理 | DUTA |
| 9 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
ip router isis
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 200
ip address 2.2.2.1/24
exit
router isis
net 49.0001.0000.0000.0006.00
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.2/24
ip router isis
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 300
ip address 3.3.3.1/24
exit
router isis
net 49.0001.0000.0000.0007.00
redistribute static
exit
arp 3.3.3.3 0003.0003.0003
ip route 10.10.10.0/24 3.3.3.3
end
```

**触发与等待**

- 固定等待 20 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip route`，回显应包含 `10.10.10.0/24`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，VLAN 100，目的 IP `10.10.10.100`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `3.3.3`，VLAN 300，目的 IP `10.10.10.100`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "3.3.3",
        src: DeviceBRouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 300, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
    expected_count: 10,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no router isis
end
```

DUTB：

```text
configure terminal
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no router isis
no ip route 10.10.10.0/24
no arp 3.3.3.3
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.15 用例 0150：支持在VLAN子接口上配置PBR

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0150-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 等待就绪 | DUTA |
| 4 | 抓包 / 停流 | RenixPort.B |
| 5 | 流量发送 | RenixPort.A |
| 6 | 流量校验 | RenixPort.B |
| 7 | 抓包 / 停流 | RenixPort.B |
| 8 | 流量发送 | RenixPort.A |
| 9 | 流量校验 | RenixPort.B |
| 10 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
ip access-list test
10 permit any host 1.2.3.4 any
exit
route-map rm permit 10
match ip address test
set ip next-hop 2.2.2.2
exit
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
ip policy route-map rm
exit
interface <PortB>
no switchport
exit
interface <PortB>.1
dot1q termination vid 200
ip address 2.2.2.1/24
exit
arp 2.2.2.2 2.2.2
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTA：轮询 `show interface <PortB>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，VLAN 100，目的 IP `10.10.10.100`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `2.2.2`，VLAN 200，目的 IP `10.10.10.100`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "2.2.2",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，VLAN 100，目的 IP `10.10.10.100`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.5" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `2.2.2`，VLAN 200，目的 IP `10.10.10.100`，期望计数为 0。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "2.2.2",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.5" }),
    expected_count: 0,
  })
```

</details>

**脚本注释中的预期现象**

- 1. 测试源mac为1.2.3.4的报文可以被路由转发

**清理**

DUTA：

```text
configure terminal
no ip access-list test
no route-map rm
no interface <PortA>.1
no interface <PortB>.1
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
no arp 2.2.2.2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.16 用例 0160：支持在VLAN子接口上配置IGMP

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0160-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 观测 | DUTA |
| 4 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 10.10.10.10/24
ip pim sparse-mode
exit
interface <PortB>
no switchport
exit
interface <PortB>.1
dot1q termination vid 200
ip address 10.10.11.10/24
ip pim sparse-mode
exit
interface <PortA>.1
ip igmp last-member-query-count 3
ip igmp last-member-query-interval 2000
ip igmp limit 1000
ip igmp query-max-response-time 12
ip igmp query-interval 120
ip igmp robustness-variable 3
ip igmp static-group 228.1.1.1
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
**观测与预期**

- DUTA：执行 `show ip igmp interface eth-0-1.1`，回显应包含 `IGMP Enabled`。

**清理**

DUTA：

```text
configure terminal
no interface <PortA>.1
no interface <PortB>.1
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.17 用例 0170：支持在VLAN子接口上配置PIM-SM

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0170-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTA |
| 4 | 配置 | DUTB |
| 5 | 等待就绪 | DUTA |
| 6 | 观测 | DUTA |
| 7 | 观测 | DUTB |
| 8 | 清理 | DUTA |
| 9 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 100
ip address 11.1.1.1/24
ip pim sparse-mode
exit
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 200
ip address 12.1.1.1/24
ip pim sparse-mode
end
```

DUTB：

```text
configure terminal
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 100
ip address 22.1.1.2/24
ip pim sparse-mode
exit
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 200
ip address 12.1.1.2/24
ip pim sparse-mode
end
```

DUTA：

```text
configure terminal
ip route 22.1.1.0/24 12.1.1.2
ip pim rp-address 11.1.1.1
end
```

DUTB：

```text
configure terminal
ip route 11.1.1.0/24 12.1.1.1
ip pim rp-address 11.1.1.1
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
**观测与预期**

- DUTA：执行 `show ip pim sparse-mode rp mapping`，回显应包含 `RP: 11.1.1.1`。
- DUTB：执行 `show ip pim sparse-mode rp mapping`，回显应包含 `RP: 11.1.1.1`。

**清理**

DUTA：

```text
configure terminal
no interface <PortD>.1
no interface <PortA>.1
interface <PortD>
switchport
exit
interface <PortA>
switchport
exit
no ip route 22.1.1.0/24
no ip pim rp-address 11.1.1.1
end
```

DUTB：

```text
configure terminal
no interface <PortD>.1
no interface <PortA>.1
interface <PortD>
switchport
exit
interface <PortA>
switchport
exit
no ip route 11.1.1.0/24
no ip pim rp-address 11.1.1.1
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.18 用例 0180：支持在VLAN子接口上配置PIM-DM

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0180-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTA |
| 4 | 配置 | DUTB |
| 5 | 等待就绪 | DUTA |
| 6 | 等待就绪 | DUTA |
| 7 | 观测 | DUTA |
| 8 | 观测 | DUTA |
| 9 | 固定等待 | — |
| 10 | 等待就绪 | DUTA |
| 11 | 等待就绪 | DUTB |
| 12 | 清理 | DUTA |
| 13 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 100
ip address 11.1.1.1/24
ip pim dense-mode
exit
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 200
ip address 12.1.1.1/24
ip pim dense-mode
end
```

DUTB：

```text
configure terminal
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 100
ip address 22.1.1.2/24
ip pim dense-mode
exit
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 200
ip address 12.1.1.2/24
ip pim dense-mode
end
```

DUTA：

```text
configure terminal
ip route 22.1.1.0/24 12.1.1.2
end
```

DUTB：

```text
configure terminal
ip route 11.1.1.0/24 12.1.1.1
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTA：轮询 `show interface <PortD>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 固定等待 30 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip pim dense-mode neighbor`，回显应匹配正则 `/12.1.1.2.*?<PortA>.1/`；超时 10 秒。
- DUTB：轮询 `show ip pim dense-mode neighbor`，回显应匹配正则 `/12.1.1.1.*?<PortA>.1/`；超时 10 秒。
**观测与预期**

- DUTA：执行 `show ip pim dense-mode interface`，回显应匹配正则 `/11.1.1.1 *?<PortD>.1/`。
- DUTA：执行 `show ip pim dense-mode interface`，回显应匹配正则 `/12.1.1.1 *?<PortA>.1/`。

**清理**

DUTA：

```text
configure terminal
no interface <PortD>.1
no interface <PortA>.1
interface <PortD>
switchport
exit
interface <PortA>
switchport
exit
no ip route 22.1.1.0/24
no ip pim rp-address 11.1.1.1
end
```

DUTB：

```text
configure terminal
no interface <PortD>.1
no interface <PortA>.1
interface <PortD>
switchport
exit
interface <PortA>
switchport
exit
no ip route 11.1.1.0/24
no ip pim rp-address 11.1.1.1
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.19 用例 0190：支持在VLAN子接口上配置ACL

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0190-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 等待就绪 | DUTA |
| 4 | 抓包 / 停流 | RenixPort.B |
| 5 | 流量发送 | RenixPort.A |
| 6 | 流量校验 | RenixPort.B |
| 7 | 抓包 / 停流 | RenixPort.B |
| 8 | 流量发送 | RenixPort.A |
| 9 | 流量校验 | RenixPort.B |
| 10 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
ip access-list test
10 deny any host 1.2.3.4 any
exit
class-map cm
match access-group test
exit
policy-map pm
class cm
exit
exit
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
service-policy input pm
exit
interface <PortB>
no switchport
exit
interface <PortB>.1
dot1q termination vid 200
ip address 2.2.2.1/24
exit
arp 2.2.2.2 2.2.2
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTA：轮询 `show interface <PortB>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，VLAN 100，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ dst: "2.2.2.2", src: "1.2.3.4" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `2.2.2`，VLAN 200，目的 IP `2.2.2.2`，期望计数为 0。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "2.2.2",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({ dst: "2.2.2.2", src: "1.2.3.4" }),
    expected_count: 0,
  })
```

</details>

- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，VLAN 100，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ dst: "2.2.2.2", src: "1.2.3.5" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `2.2.2`，VLAN 200，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "2.2.2",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({ dst: "2.2.2.2", src: "1.2.3.5" }),
    expected_count: 10,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
no policy-map pm
no class-map cm
no ip access-list test
no interface <PortA>.1
no interface <PortB>.1
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
no arp 2.2.2.2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.20 用例 0200：支持在VLAN子接口上配置IPv6地址

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0200-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTB |
| 5 | 固定等待 | — |
| 6 | 观测 | DUTA |
| 7 | 观测 | DUTB |
| 8 | 清理 | DUTA |
| 9 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
ipv6 enable
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
ipv6 address 2001::1/64
end
```

DUTB：

```text
configure terminal
ipv6 enable
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
ipv6 address 2001::2/64
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTB：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 固定等待 3 秒；等待依据见脚本注释。
**观测与预期**

- DUTA：执行 `ping ipv6 2001::2`，回显应包含 `5 packets transmitted, 5 received, 0% packet loss`。
- DUTB：执行 `ping ipv6 2001::1`，回显应包含 `5 packets transmitted, 5 received, 0% packet loss`。

**清理**

DUTA：

```text
configure terminal
no ipv6 enable
no interface <PortA>.1
interface <PortA>
switchport
end
```

DUTB：

```text
configure terminal
no ipv6 enable
no interface <PortA>.1
interface <PortA>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.21 用例 0210：支持在VLAN子接口上配置DHCPv6 Relay

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0210-ETHERNET-VLAN_SUBIF.test.ts`
- 执行状态：脚本中标记为 `test.skip`，当前不执行

该用例在脚本中以 `test.skip` 占位，尚未编写配置与校验步骤。执行前应补充配置、观测与清理内容。

### 4.22 用例 0220：支持配置IPv6静态路由指定下一跳为VLAN子接口邻居

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0220-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTA |
| 6 | 固定等待 | — |
| 7 | 抓包 / 停流 | RenixPort.B |
| 8 | 流量发送 | RenixPort.A |
| 9 | 流量校验 | RenixPort.B |
| 10 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
ipv6 enable
interface <PortA>
no switchport
exit
interface <PortB>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ipv6 address 2001::1/64
exit
interface <PortB>.1
dot1q termination vid 200
ipv6 address 3001::1/64
exit
ipv6 neighbor 3001::2 a.b.c
ipv6 route 4000::0/64 3001::2
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTA：轮询 `show interface <PortB>`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTA：轮询 `show interface <PortB>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 固定等待 3 秒；等待依据见脚本注释。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv6，VLAN 100，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:44:55:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x86dd })
      .setIPv6({
        src: "2001::100",
        dst: "4000::1234",
      }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: { step_count: 10 },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv6，目的 MAC `a.b.c`，VLAN 200，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "a.b.c",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x86dd })
      .setIPv6({
        src: "2001::100",
        dst: "4000::1234",
      }),
    expected_count: 10,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
no interface <PortA>.1
no interface <PortB>.1
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
no ipv6 neighbor 3001::2
no ipv6 route 4000::0/64
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.23 用例 0230：支持通过VLAN子接口建立OSPFv3邻居连接

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0230-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTA |
| 6 | 抓包 / 停流 | RenixPort.B |
| 7 | 流量发送 | RenixPort.A |
| 8 | 流量校验 | RenixPort.B |
| 9 | 清理 | DUTA |
| 10 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
ipv6 enable
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ipv6 address 2001::1/64
ipv6 router ospf area 0
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 200
ipv6 address 1001::1/64
exit
router ipv6 ospf
router-id 1.1.1.1
end
```

DUTB：

```text
configure terminal
ipv6 enable
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
 ipv6 address 2001::2/64
ipv6 router ospf area 0
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 300
ipv6 address 3001::1/64
exit
router ipv6 ospf
router-id 2.2.2.2
redistribute static
exit
ipv6 neighbor 3001::2 0000.3001.0002
ipv6 route 4000::/64 3001::2
end
```

**触发与等待**

- 固定等待 40 秒；等待依据见脚本注释。
- DUTA：轮询 `show ipv6 ospf neighbor`，回显应匹配正则 `/2.2.2.2.*?Full/`；超时 30 秒。
- DUTA：轮询 `show ipv6 route`，回显应包含 `O E2    4000::/64`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv6，VLAN 200，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x86dd })
      .setIPv6({ dst: "4000::123", src: "1001::100" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv6，目的 MAC `0000.3001.0002`，VLAN 300，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "0000.3001.0002",
        src: DeviceBRouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 300, type: 0x86dd })
      .setIPv6({ dst: "4000::123", src: "1001::100" }),
    expected_count: 10,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
no ipv6 enable
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no router ipv6 ospf
end
```

DUTB：

```text
configure terminal
no ipv6 enable
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no router ipv6 ospf
no ipv6 route 4000::/64
no ipv6 neighbor 3001::2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.24 用例 0240：支持通过VLAN子接口建立RIPng邻居连接

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0240-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTA |
| 5 | 抓包 / 停流 | RenixPort.B |
| 6 | 流量发送 | RenixPort.A |
| 7 | 流量校验 | RenixPort.B |
| 8 | 清理 | DUTA |
| 9 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
ipv6 enable
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ipv6 address 2001::1/64
ipv6 router rip
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 200
ipv6 address 1001::1/64
exit
router ipv6 rip
end
```

DUTB：

```text
configure terminal
ipv6 enable
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
 ipv6 address 2001::2/64
ipv6 router rip
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 300
ipv6 address 3001::1/64
exit
router ipv6 rip
redistribute static
exit
ipv6 neighbor 3001::2 0000.3001.0002
ipv6 route 4000::/64 3001::2
end
```

**触发与等待**

- 固定等待 15 秒；等待依据见脚本注释。
- DUTA：轮询 `show ipv6 route`，回显应包含 `R       4000::/64`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv6，VLAN 200，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x86dd })
      .setIPv6({ dst: "4000::123", src: "1001::100" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv6，目的 MAC `0000.3001.0002`，VLAN 300，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "0000.3001.0002",
        src: DeviceBRouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 300, type: 0x86dd })
      .setIPv6({ dst: "4000::123", src: "1001::100" }),
    expected_count: 10,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
no ipv6 enable
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no router ipv6 rip
end
```

DUTB：

```text
configure terminal
no ipv6 enable
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no router ipv6 rip
no ipv6 route 4000::/64
no ipv6 neighbor 3001::2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.25 用例 0250：支持在VLAN子接口上配置IPv6 PBR

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0250-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 等待就绪 | DUTA |
| 4 | 抓包 / 停流 | RenixPort.B |
| 5 | 流量发送 | RenixPort.A |
| 6 | 流量校验 | RenixPort.B |
| 7 | 抓包 / 停流 | RenixPort.B |
| 8 | 流量发送 | RenixPort.A |
| 9 | 流量校验 | RenixPort.B |
| 10 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
ipv6 enable
ipv6 access-list test
permit any any host 6789::100
exit
route-map rm permit 10
match ipv6 address test
set ipv6 next-hop 3001::2
exit
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ipv6 address 2001::1/24
ip policy route-map rm
exit
interface <PortB>
no switchport
exit
interface <PortB>.1
dot1q termination vid 200
ipv6 address 3001::1/24
exit
ipv6 neighbor 3001::2 1.2.3
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTA：轮询 `show interface <PortB>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv6，VLAN 100，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x86dd })
      .setIPv6({ dst: "6789::100", src: "2001::100" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv6，目的 MAC `1.2.3`，VLAN 200，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "1.2.3",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x86dd })
      .setIPv6({ dst: "6789::100", src: "2001::100" }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv6，VLAN 100，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x86dd })
      .setIPv6({ dst: "6789::101", src: "2001::100" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv6，目的 MAC `1.2.3`，VLAN 200，期望计数为 0。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "1.2.3",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x86dd })
      .setIPv6({ dst: "6789::101", src: "2001::100" }),
    expected_count: 0,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
no ipv6 enable
no ipv6 access-list test
no route-map rm
no interface <PortA>.1
no interface <PortB>.1
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
no ipv6 neighbor 3001::2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.26 用例 0260：支持在VLAN子接口上配置MLD

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0260-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTA |
| 3 | 等待就绪 | DUTA |
| 4 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
ipv6 enable
ipv6 mld limit 2000
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ipv6 address 2001:1::1/64
ipv6 pim sparse-mode
exit
interface <PortB>
no switchport
exit
interface <PortB>.1
dot1q termination vid 200
ipv6 address 3001:1::1/64
ipv6 pim sparse-mode
exit
end
```

DUTA：

```text
configure terminal
interface <PortA>.1
ipv6 mld last-member-query-count 3
ipv6 mld last-member-query-interval 2000
ipv6 mld limit 1000
ipv6 mld proxy-service
ipv6 mld query-max-response-time 12
ipv6 mld query-interval 120
ipv6 mld robustness-variable 3
ipv6 mld version 2
ipv6 mld static-group ff0e::1234
exit
interface <PortB>.1
ipv6 mld mroute-proxy <PortA>.1
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
**清理**

DUTA：

```text
configure terminal
no ipv6 enable
no ipv6 mld limit
no interface <PortA>.1
no interface <PortB>.1
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.27 用例 0270：支持在VLAN子接口上配置PIMv6-SM

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0270-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 固定等待 | — |
| 5 | 观测 | DUTA |
| 6 | 观测 | DUTB |
| 7 | 观测 | DUTA |
| 8 | 观测 | DUTB |
| 9 | 清理 | DUTA |
| 10 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
ipv6 enable
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ipv6 address 2001:9::1/64
ipv6 pim sparse-mode
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 200
ipv6 address 2001:1::1/64
ipv6 pim sparse-mode
exit
ipv6 pim rp-address 2001:1::1
ipv6 route 2001:2::/64 2001:9::2
end
```

DUTB：

```text
configure terminal
ipv6 enable
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ipv6 address 2001:9::2/64
ipv6 pim sparse-mode
exit
interface <PortD>
no switchport
exit
interface <PortD>.1
dot1q termination vid 200
ipv6 address 2001:2::1/64
ipv6 pim sparse-mode
exit
ipv6 pim rp-address 2001:1::1
ipv6 route 2001:1::/64 2001:9::1
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 固定等待 5 秒；等待依据见脚本注释。
**观测与预期**

- DUTA：执行 `show ipv6 pim sparse-mode rp mapping`，回显应包含 `RP: 2001:1::1`。
- DUTB：执行 `show ipv6 pim sparse-mode rp mapping`，回显应包含 `RP: 2001:1::1`。
- DUTA：执行 `show ipv6 pim sparse-mode interface`，回显应包含 `<PortA>.1`。
- DUTB：执行 `show ipv6 pim sparse-mode interface`，回显应包含 `<PortA>.1`。

**清理**

DUTA：

```text
configure terminal
no ipv6 enable
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no ipv6 pim rp-address 2001:1::1
no ipv6 route 2001:2::/64
end
```

DUTB：

```text
configure terminal
no ipv6 enable
no interface <PortA>.1
no interface <PortD>.1
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no ipv6 pim rp-address 2001:1::1
no ipv6 route 2001:1::/64
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.28 用例 0280：支持在VLAN子接口上配置VRF

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0280-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTB |
| 5 | 固定等待 | — |
| 6 | 观测 | DUTA |
| 7 | 观测 | DUTB |
| 8 | 清理 | DUTA |
| 9 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
ip vrf test
exit
interface <PortA>
no switchport
exit
interface <PortA>.1
ip vrf forwarding test
dot1q termination vid 100
ip address 1.1.1.1/24
exit
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.2/24
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- DUTB：轮询 `show interface <PortA>.1`，回显应包含 `Interface current state: UP`；超时 10 秒。
- 固定等待 2 秒；等待依据见脚本注释。
**观测与预期**

- DUTA：执行 `ping vrf test 1.1.1.2`，回显应包含 ` 0% packet loss`。
- DUTB：执行 `ping 1.1.1.1`，回显应包含 ` 0% packet loss`。

**清理**

DUTA：

```text
configure terminal
no ip vrf test
no interface <PortA>.1
interface <PortA>
switchport
end
```

DUTB：

```text
configure terminal
no interface <PortA>.1
interface <PortA>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.29 用例 0290：支持配置VRRP指定VLAN子接口

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0290-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTB |
| 5 | 清理 | DUTA |
| 6 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
exit
router vrrp 1
interface <PortA>.1
priority 200
virtual-ip 1.1.1.100
advertisement-interval 5
enable
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.2/24
exit
router vrrp 1
interface <PortA>.1
priority 120
virtual-ip 1.1.1.100
advertisement-interval 5
enable
end
```

**触发与等待**

- DUTA：轮询 `show vrrp`，回显应包含 `State               : Master`；超时 20 秒。
- DUTB：轮询 `show vrrp`，回显应包含 `State               : Backup`；超时 10 秒。
**清理**

DUTA：

```text
configure terminal
router vrrp 1
disable
exit
no router vrrp 1
no interface <PortA>.1
interface <PortA>
switchport
end
```

DUTB：

```text
configure terminal
router vrrp 1
disable
exit
no router vrrp 1
no interface <PortA>.1
interface <PortA>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.30 用例 0300：支持配置BFD指定VLAN子接口

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0300-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTB |
| 5 | 清理 | DUTA |
| 6 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.1/24
exit
bfd test peer-ip 1.1.1.2 interface eth-0-1.1 auto
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 1.1.1.2/24
exit
bfd test peer-ip 1.1.1.1 interface eth-0-1.1 auto
end
```

**触发与等待**

- DUTA：轮询 `show bfd session detail`，回显应包含 `Session State : Up`；超时 20 秒。
- DUTB：轮询 `show bfd session detail`，回显应包含 `Session State : Up`；超时 10 秒。
**清理**

DUTA：

```text
configure terminal
no bfd test
no interface <PortA>.1
interface <PortA>
switchport
end
```

DUTB：

```text
configure terminal
no bfd test
no interface <PortA>.1
interface <PortA>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.31 用例 0310：设备支持通过VLAN子接口配置MPLS VPLS

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0310-ETHERNET-VLAN_SUBIF.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 固定等待 | — |
| 5 | 等待就绪 | DUTA |
| 6 | 等待就绪 | DUTC |
| 7 | 固定等待 | — |
| 8 | 等待就绪 | DUTA |
| 9 | 等待就绪 | DUTA |
| 10 | 固定等待 | — |
| 11 | 抓包 / 停流 | RenixPort.B |
| 12 | 流量发送 | RenixPort.A |
| 13 | 流量校验 | RenixPort.B |
| 14 | 清理 | DUTA |
| 15 | 清理 | DUTB |
| 16 | 清理 | DUTC |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 11.11.9.1/24
label-switching
enable-ldp
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 vlan 2
exit
interface loopback0
ip address 11.11.1.1/32
exit
mpls vpls v1 100
vpls-peer 11.11.4.4 raw
exit
router ospf
network 11.11.9.0/24 area 0
redistribute connected
exit
router ldp
router-id 11.11.1.1
targeted-peer 11.11.4.4
transport-address 11.11.1.1
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip address 11.11.9.2/24
label-switching
enable-ldp
exit
interface <PortB>
no switchport
exit
interface <PortB>.1
dot1q termination vid 200
ip address 11.11.13.2/24
label-switching
enable-ldp
exit
interface loopback0
ip address 11.11.2.2/32
exit
router ospf
network 11.11.9.0/24 area 0
network 11.11.13.0/24 area 0
redistribute connected
exit
router ldp
router-id 11.11.2.2
end
```

DUTC：

```text
configure terminal
interface <PortB>
no switchport
exit
interface <PortB>.1
dot1q termination vid 200
ip address 11.11.13.4/24
label-switching
enable-ldp
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 vlan 2
exit
interface loopback0
ip address 11.11.4.4/32
exit
mpls vpls v1 100
vpls-peer 11.11.1.1 raw
exit
router ospf
network 11.11.13.0/24 area 0
redistribute connected
exit
router ldp
router-id 11.11.4.4
targeted-peer 11.11.1.1
transport-address 11.11.4.4
end
```

**触发与等待**

- 固定等待 45 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp vpls`，回显应包含 `Up     ethernet`；超时 60 秒。
- DUTC：轮询 `show ldp vpls`，回显应包含 `Up     ethernet`；超时 60 秒。
- 固定等待 30 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.2.2.*?OPERATIONAL/`；超时 45 秒。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.4.4.*?OPERATIONAL/`；超时 45 秒。
- 固定等待 5 秒；等待依据见脚本注释。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `2.2.2`，VLAN 2，目的 IP `2.3.4.5`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "1.1.1", dst: "2.2.2", type: 0x8100 })
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({ src: "1.2.3.4", dst: "2.3.4.5" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `2.2.2`，VLAN 2，目的 IP `2.3.4.5`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({ src: "1.1.1", dst: "2.2.2", type: 0x8100 })
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({ src: "1.2.3.4", dst: "2.3.4.5" }),
    expected_count: 10,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
no interface <PortA>.1
interface <PortA>
switchport
exit
interface <PortD>
no mpls-vpls v1 vlan 2
switchport mode access
exit
no interface loopback 0
no mpls vpls v1
no router ospf
no router ldp
end
```

DUTB：

```text
configure terminal
no interface <PortA>.1
no interface <PortB>.1
interface <PortB>
switchport
exit
interface <PortA>
switchport
exit
no interface loopback 0
no router ospf
no router ldp
end
```

DUTC：

```text
configure terminal
no interface <PortB>.1
interface <PortB>
switchport
exit
interface <PortD>
no mpls-vpls v1 vlan 2
switchport mode access
exit
no interface loopback 0
no mpls vpls v1
no router ospf
no router ldp
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.32 用例 0320：设备支持通过VLAN子接口配置MPLS L3VPN

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/0320-ETHERNET-VLAN_SUBIF.test.ts`

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
| 8 | 固定等待 | — |
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTD |
| 11 | 等待就绪 | DUTB |
| 12 | 等待就绪 | DUTC |
| 13 | 观测 | DUTA |
| 14 | 观测 | DUTD |
| 15 | 清理 | DUTA |
| 16 | 清理 | DUTB |
| 17 | 清理 | DUTC |
| 18 | 清理 | DUTD |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
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
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 100
ip vrf forwarding vpn1
ip address 2.2.2.2/24
exit
interface loopback0
ip address 5.5.5.5/32
exit
interface <PortB>
no switchport
exit
interface <PortB>.1
dot1q termination vid 200
ip address 1.1.1.1/24
label-switching
enable-ldp
exit
router ospf
router-id 5.5.5.5
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
neighbor 6.6.6.6 remote-as 1
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
exit
interface <PortB>.1
dot1q termination vid 200
ip address 1.1.1.2/24
label-switching
enable-ldp
exit
interface <PortA>
no switchport
exit
interface <PortA>.1
dot1q termination vid 300
ip vrf forwarding vpn1
ip address 3.3.3.3/24
exit
interface loopback0
ip address 6.6.6.6/32
exit
router ospf
router-id 6.6.6.6
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
neighbor 5.5.5.5 remote-as 1
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
exit
interface <PortA>.1
dot1q termination vid 300
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

**触发与等待**

- 固定等待 40 秒；等待依据见脚本注释。
- DUTB：轮询 `show ip ospf neighbor`，回显应匹配正则 `/6.6.6.6.*?Full/`；超时 30 秒。
- DUTC：轮询 `show ip ospf neighbor`，回显应匹配正则 `/5.5.5.5.*?Full/`；超时 30 秒。
- 固定等待 45 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip route`，回显应匹配正则 `/R.*?7.7.7.7/32/`；超时 60 秒。
- DUTD：轮询 `show ip route`，回显应匹配正则 `/R.*?4.4.4.4/32/`；超时 60 秒。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/6.6.6.6.*?OPERATIONAL/`；超时 45 秒。
- DUTC：轮询 `show ldp session`，回显应匹配正则 `/5.5.5.5.*?OPERATIONAL/`；超时 45 秒。
**观测与预期**

- DUTA：执行 `ping 7.7.7.7`，回显应包含 ` 0% packet loss`。
- DUTD：执行 `ping 4.4.4.4`，回显应包含 ` 0% packet loss`。

**清理**

DUTA：

```text
configure terminal
no interface <PortA>.1
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
no interface <PortA>.1
no interface <PortB>.1
no ip vrf vpn1
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
no interface loopback 0
no router ospf
no router rip
no router bgp 1
no router ldp
end
```

DUTC：

```text
configure terminal
no interface <PortA>.1
no interface <PortB>.1
no ip vrf vpn1
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
no interface loopback 0
no router ospf
no router rip
no router bgp 1
no router ldp
end
```

DUTD：

```text
configure terminal
no interface <PortA>.1
interface <PortA>
switchport
exit
no interface loopback0
no router rip
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

## 5. 清理与恢复

各用例的清理命令见第 4 节对应小节。合集执行完毕后，按设备执行以下检查，确认本合集新增对象均已删除。

```text
show running-config
show interface
show vlan
show mac address-table
```

清理顺序：业务路由 → 接口、隧道与 loopback → 协议进程 → VRF → 接口回二层。清理完成后重新执行上述命令，确认无本合集对象残留。

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 标准裁剪 | 设备支持可选特性时执行对应测试点；能力未覆盖时标记 `Blocked` 并注明原因 |
| 2 | 脚本跳过项 | 0210 在脚本中标记为 `test.skip`，当前不执行 |
| 3 | 脚本与文档一致性 | 本文以当前脚本为事实来源；脚本修改后应同步更新本文 |

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
| 0260 | | | |
| 0270 | | | |
| 0280 | | | |
| 0290 | | | |
| 0300 | | | |
| 0310 | | | |
| 0320 | | | |

