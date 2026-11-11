# MPLS 基础测试用例合集

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本目录全部测试脚本。
> 同一目录的脚本共用公共拓扑、预置条件与判定口径；各用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | 配置LDP功能 | `0010-MPLS-BASIC.test.ts` | P1 / 功能 | |
| 0020 | 配置静态VPWS | `0020-MPLS-BASIC.test.ts` | P1 / 功能 | |
| 0030 | 使用LDP配置VPWS | `0030-MPLS-BASIC.test.ts` | P1 / 功能 | |
| 0040 | 配置静态MPLS LSP | `0040-MPLS-BASIC.test.ts` | P1 / 功能 | |
| 0050 | 配置MPLS VPLS (三设备) | `0050-MPLS-BASIC.test.ts` | P1 / 功能 | |
| 0060 | 配置MPLS VPLS (两设备) | `0060-MPLS-BASIC.test.ts` | P1 / 功能 | |
| 0070 | 配置MPLS L3VPN | `0070-MPLS-BASIC.test.ts` | P1 / 功能 | |
| 0080 | 测试MPLS L3VPN PING功能 | `0080-MPLS-BASIC.test.ts` | P1 / 功能 | |
| 0090 | 测试MPLS L3VPN 多跳 PING功能 | `0090-MPLS-BASIC.test.ts` | P1 / 功能 | |
| 0100 | 测试MPLS L3VPN PING功能 (explicit-null) | `0100-MPLS-BASIC.test.ts` | P1 / 功能 | |
| 0110 | 测试MPLS L3VPN 多跳 PING功能 (explicit-null) | `0110-MPLS-BASIC.test.ts` | P1 / 功能 | |
| 0120 | 测试MPLS L3VPN 收到未知邻居报文能触发arp (bugid: 2751) | `0120-MPLS-BASIC.test.ts` | P1 / 功能 | |
| 0130 | 测试MPLS vlan subif L3VPN PING功能 | `0130-MPLS-BASIC.test.ts` | P1 / 功能 | |
| 0140 | 使用 VLAN Interface 配置MPLS VPLS | `0140-MPLS-BASIC.test.ts` | P1 / 功能 | |

## 1. 基本信息（合集）

- 用例编号：`0010` ~ `0140`
- 用例标题：MPLS 基础测试用例合集
- 所属特性 / 分组：`19-MPLS` / `MPLS配置` / `MPLS 基础`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 35 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/19-MPLS/02-mpls/01-mpls_basic/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本合集验证的要求 |
| --- | --- | --- |
| E530 配置指导（V7.5.1） | 19.2 | MPLS 基础配置与回显 |
| E530 命令参考（V7.4.8） | MPLS配置 | 命令参数、回显与删除 |
| IEEE 802.1Q-2018 | VLAN 标记、成员与转发 | VLAN、PVID、Trunk 与子接口处理 |
| RFC 3031 / RFC 5036 | MPLS 标签与 LDP | 标签分发与 LSP 建立 |
| RFC 4762 / RFC 4364 | VPLS 与 L3VPN | VPLS 转发与 L3VPN 路由 |
| RFC 826 | ARP 请求与应答 | ARP 学习与代理 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | 支持MPLS 基础特性 | 确认特性可用范围 |
| License / 单板 | 支持MPLS 基础相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 3 个可配置接口 | 确认接口类型与数量 |
| 测试仪端口 | RenixPort.A / RenixPort.B | 确认流量收发端口可用 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

脚本注释中给出的拓扑如下。执行前按对应拓扑完成设备与测试仪连线。

### 2.1 拓扑 1

```text
+--------+                   +--------+                   +--------+
|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB <=> PortB--|  DUTC  |
+--------+                   +--------+                   +--------+
```

适用用例：0010。

### 2.2 拓扑 2

```text
                   +--------+                   +--------+
                   |        |--PortA <=> PortA--|        |
 RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortD <=> RenixB
                   |        |--PortC <=> PortC--|        |
                   +--------+                   +--------+
```

适用用例：0020、0030、0060、0080、0100、0120、0130、0140。

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

适用用例：0040、0090、0110。

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

适用用例：0050。

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

适用用例：0070。

内置拓扑：`LinkConstraint.three_devices_topo_links_type_4`、`LinkConstraint.two_devices_topo_links_type_1`、`LinkConstraint.three_devices_topo_links_type_1`、`LinkConstraint.three_devices_topo_links_type_5`、`LinkConstraint.four_devices_topo_links_type_1`。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | `<PortA>`、`<PortB>`、`<PortD>` | 被测设备端口，执行前替换为实际接口名 |
| 测试仪 | `<RenixPortA>`、`<RenixPortB>` | 流量收发端口，按测试仪实际连接配置 |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| BGP AS | 1 | 以各用例配置为准 |
| BGP 邻居 AS | 1 | 与对端一致 |
| Router ID | 1.1.1.1 / 2.2.2.2 / 3.3.3.3 / 192.168.10.10 | 全局唯一 |
| OSPF Area | 0 | 按拓扑规划 |
| VLAN | 2 | 按拓扑规划 |
| VRF | vpn1 | 按业务实例规划 |
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

### 4.1 用例 0010：配置LDP功能

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0010-MPLS-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 固定等待 | — |
| 5 | 等待就绪 | DUTB |
| 6 | 等待就绪 | DUTB |
| 7 | 清理 | DUTA |
| 8 | 清理 | DUTB |
| 9 | 清理 | DUTC |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
label-switching
ip address 11.11.17.1/24
enable-ldp
exit
interface loopback0
ip address 1.1.1.1/32
exit
router rip
network 0.0.0.0/0
exit
router ldp
router-id 1.1.1.1
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
label-switching
ip address 11.11.17.2/24
enable-ldp
exit
interface <PortB>
no switchport
label-switching
ip address 11.11.9.1/24
enable-ldp
exit
interface loopback0
ip address 2.2.2.2/32
exit
router rip
network 0.0.0.0/0
exit
router ldp
router-id 2.2.2.2
end
```

DUTC：

```text
configure terminal
interface <PortB>
no switchport
label-switching
ip address 11.11.9.2/24
enable-ldp
exit
interface loopback0
ip address 3.3.3.3/32
exit
router rip
network 0.0.0.0/0
exit
router ldp
router-id 3.3.3.3
end
```

**触发与等待**

- 固定等待 25 秒；等待依据见脚本注释。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/1.1.1.1.*?OPERATIONAL/`；超时 60 秒。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/3.3.3.3.*?OPERATIONAL/`；超时 30 秒。
**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
disable-ldp
exit
no interface loopback0
no router ldp
no router rip
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
switchport
disable-ldp
exit
no interface loopback0
no router ldp
no router rip
end
```

DUTC：

```text
configure terminal
interface <PortB>
switchport
disable-ldp
exit
no interface loopback0
no router ldp
no router rip
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.2 用例 0020：配置静态VPWS

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0020-MPLS-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 观测 | DUTB |
| 5 | 观测 | DUTB |
| 6 | 抓包 / 停流 | RenixPort.B |
| 7 | 流量发送 | RenixPort.A |
| 8 | 流量校验 | RenixPort.B |
| 9 | 清理 | DUTA |
| 10 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
label-switching
ip address 8.8.8.1/24
exit
interface <PortD>
mpls-l2-circuit t2 ethernet
exit
interface loopback0
ip address 192.168.10.10/32
exit
mpls ftn-entry 192.168.11.0/24 111 8.8.8.2
mpls l2-circuit t2 201 192.168.11.10 raw manual
mpls l2-circuit-fib-entry t2 44 33
mpls ilm-entry pop 222
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
label-switching
ip address 8.8.8.2/24
exit
interface <PortD>
mpls-l2-circuit t2 ethernet
exit
interface loopback0
ip address 192.168.11.10/32
exit
mpls ftn-entry 192.168.10.0/24 222 8.8.8.1
mpls l2-circuit t2 201 192.168.10.10 raw manual
mpls l2-circuit-fib-entry t2 33 44
mpls ilm-entry pop 111
end
```

**触发与等待**

- 固定等待 5 秒；等待依据见脚本注释。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `1.1.1`，目的 IP `1.1.1.1`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({ dst: "1.1.1", src: "2.2.2" })
      .setIPv4({ dst: "1.1.1.1", src: "2.2.2.2" }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、IPv4，目的 MAC `1.1.1`，目的 IP `1.1.1.1`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setEthernet({ dst: "1.1.1", src: "2.2.2" })
      .setIPv4({ dst: "1.1.1.1", src: "2.2.2.2" }),
    port: RenixPort.B,
  })
```

</details>

**观测与预期**

- DUTB：执行 `show mpls l2-circuit`，回显应匹配正则 `/t2.*?201/`。
- DUTB：执行 `show mpls vc-table`，回显应匹配正则 `/201.*?33/44/`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
exit
interface <PortD>
no mpls-l2-circuit t2
exit
no interface loopback0
no mpls ftn-entry 192.168.11.0/24 8.8.8.2
no mpls l2-circuit t2
no mpls ilm-entry 222
end
```

DUTB：

```text
configure terminal
interface <PortA>
switchport
exit
interface <PortD>
no mpls-l2-circuit t2
exit
no interface loopback0
no mpls l2-circuit t2
no mpls ftn-entry 192.168.10.0/24 8.8.8.1
no mpls ilm-entry 111
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.3 用例 0030：使用LDP配置VPWS

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0030-MPLS-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTB |
| 6 | 观测 | DUTB |
| 7 | 观测 | DUTB |
| 8 | 抓包 / 停流 | RenixPort.B |
| 9 | 流量发送 | RenixPort.A |
| 10 | 流量校验 | RenixPort.B |
| 11 | 清理 | DUTA |
| 12 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
label-switching
ip address 8.8.8.1/24
enable-ldp
exit
interface <PortD>
mpls-l2-circuit t1 ethernet
exit
interface loopback0
ip address 192.168.10.10/32
exit
router rip
network 0.0.0.0/0
exit
router ldp
router-id 192.168.10.10
targeted-peer 192.168.11.10
exit
mpls l2-circuit t1 200 192.168.11.10 raw
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
label-switching
ip address 8.8.8.2/24
enable-ldp
exit
interface <PortD>
mpls-l2-circuit t1 ethernet
exit
interface loopback0
ip address 192.168.11.10/32
exit
router rip
network 0.0.0.0/0
exit
router ldp
router-id 192.168.11.10
targeted-peer 192.168.10.10
exit
mpls l2-circuit t1 200 192.168.10.10 raw
end
```

**触发与等待**

- 固定等待 25 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 60 秒。
- DUTB：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 60 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `1.1.1`，目的 IP `1.1.1.1`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({ dst: "1.1.1", src: "2.2.2" })
      .setIPv4({ dst: "1.1.1.1", src: "2.2.2.2" }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、IPv4，目的 MAC `1.1.1`，目的 IP `1.1.1.1`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setEthernet({ dst: "1.1.1", src: "2.2.2" })
      .setIPv4({ dst: "1.1.1.1", src: "2.2.2.2" }),
    port: RenixPort.B,
  })
```

</details>

**观测与预期**

- DUTB：执行 `show mpls l2-circuit`，回显应匹配正则 `/t1.*?200 /`。
- DUTB：执行 `show mpls vc-table`，回显应匹配正则 `/200.*?192.168.10.10.*?Active/`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
disable-ldp
exit
interface <PortD>
no mpls-l2-circuit t1
exit
no interface loopback 0
no router rip
no router ldp
no mpls l2-circuit t1
end
```

DUTB：

```text
configure terminal
interface <PortA>
switchport
disable-ldp
exit
interface <PortD>
no mpls-l2-circuit t1
exit
no interface loopback 0
no router rip
no router ldp
no mpls l2-circuit t1
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.4 用例 0040：配置静态MPLS LSP

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0040-MPLS-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 固定等待 | — |
| 5 | 抓包 / 停流 | RenixPort.B |
| 6 | 流量发送 | RenixPort.A |
| 7 | 流量校验 | RenixPort.B |
| 8 | 观测 | DUTA |
| 9 | 观测 | DUTB |
| 10 | 观测 | DUTC |
| 11 | 清理 | DUTA |
| 12 | 清理 | DUTB |
| 13 | 清理 | DUTC |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
label-switching
ip address 11.11.9.1/24
exit
interface <PortD>
no switchport
label-switching
ip address 10.10.10.1/24
exit
mpls ftn-entry 172.22.4.0/24 100 11.11.9.2
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
label-switching
ip address 11.11.9.2/24
exit
interface <PortB>
no switchport
label-switching
ip address 11.11.17.2/24
exit
mpls ilm-entry swap 100 11.11.17.3 200
end
```

DUTC：

```text
configure terminal
interface <PortB>
no switchport
label-switching
ip address 11.11.17.3/24
exit
interface <PortD>
no switchport
label-switching
ip address 20.20.20.1/24
exit
mpls ilm-entry php 200 20.20.20.2
arp 20.20.20.2 0002.0002.0002
end
```

**触发与等待**

- 固定等待 5 秒；等待依据见脚本注释。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 IP `172.22.4.200`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({ dst: DeviceARouteMac, src: "2.2.2" })
      .setIPv4({ dst: "172.22.4.200", src: "2.2.2.2" }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、IPv4，目的 MAC `2.2.2`，目的 IP `172.22.4.200`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setEthernet({ dst: "2.2.2", src: DeviceCRouteMac })
      .setIPv4({ dst: "172.22.4.200", src: "2.2.2.2" }),
    port: RenixPort.B,
  })
```

</details>

**观测与预期**

- DUTA：执行 `show mpls ftn-database`，回显应匹配正则 `/172.22.4.0/24(.*?)100(.*?)11.11.9.2/`。
- DUTB：执行 `show mpls ilm-database`，回显应匹配正则 `/0.0.0.0/0(.*?)100/200(.*?)11.11.17.3/`。
- DUTC：执行 `show mpls ilm-database`，回显应匹配正则 `/0.0.0.0/0(.*?)200/3(.*?)20.20.20.2/`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no mpls ftn-entry 172.22.4.0/24 11.11.9.2
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
no mpls ilm-entry 100
end
```

DUTC：

```text
configure terminal
interface <PortB>
switchport
exit
interface <PortD>
switchport
exit
no mpls ilm-entry 200
no arp 20.20.20.2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.5 用例 0050：配置MPLS VPLS (三设备)

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0050-MPLS-BASIC.test.ts`

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
interface <PortA>
no switchport
label-switching
ip address 11.11.9.1/24
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
router rip
network 11.11.0.0/16
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
interface <PortB>
no switchport
label-switching
ip address 11.11.13.2/24
enable-ldp
exit
interface <PortA>
no switchport
label-switching
ip address 11.11.9.2/24
enable-ldp
exit
interface loopback0
ip address 11.11.2.2/32
exit
router rip
network 11.11.0.0/16
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
label-switching
ip address 11.11.13.4/24
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
router rip
network 11.11.0.0/16
exit
router ldp
router-id 11.11.4.4
targeted-peer 11.11.1.1
transport-address 11.11.4.4
end
```

**触发与等待**

- 固定等待 25 秒；等待依据见脚本注释。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 60 秒。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.4.4.*?OPERATIONAL/`；超时 30 秒。
- 固定等待 5 秒；等待依据见脚本注释。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `1.1.1`，VLAN 2，目的 IP `1.1.1.1`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({ dst: "1.1.1", src: "2.2.2" })
      .setVLAN({ vlan: 2 })
      .setIPv4({ dst: "1.1.1.1", src: "2.2.2.2" }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `1.1.1`，VLAN 2，目的 IP `1.1.1.1`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setEthernet({ dst: "1.1.1", src: "2.2.2" })
      .setVLAN({ vlan: 2 })
      .setIPv4({ dst: "1.1.1.1", src: "2.2.2.2" }),
    port: RenixPort.B,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
disable-ldp
exit
interface <PortD>
no mpls-vpls v1 vlan 2
switchport mode access
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
end
```

DUTB：

```text
configure terminal
interface <PortB>
switchport
disable-ldp
exit
interface <PortA>
switchport
disable-ldp
exit
no interface loopback 0
no router rip
no router ldp
end
```

DUTC：

```text
configure terminal
interface <PortB>
switchport
disable-ldp
exit
interface <PortD>
no mpls-vpls v1 vlan 2
switchport mode access
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.6 用例 0060：配置MPLS VPLS (两设备)

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0060-MPLS-BASIC.test.ts`

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
label-switching
ip address 11.11.9.1/24
enable-ldp
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 vlan 2 bundling
mpls-vpls v1 vlan 3 bundling
exit
interface loopback0
ip address 11.11.1.1/32
exit
mpls vpls v1 100
vpls-peer 11.11.4.4 tagged
exit
router rip
network 11.11.0.0/16
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
label-switching
ip address 11.11.9.2/24
enable-ldp
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 vlan 2 bundling
mpls-vpls v1 vlan 3 bundling
exit
interface loopback0
ip address 11.11.4.4/32
exit
mpls vpls v1 100
vpls-peer 11.11.1.1 tagged
exit
router rip
network 11.11.0.0/16
exit
router ldp
router-id 11.11.4.4
targeted-peer 11.11.1.1
transport-address 11.11.4.4
end
```

**触发与等待**

- 固定等待 25 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.4.4.*?OPERATIONAL/`；超时 60 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `1.1.1`，VLAN 2，目的 IP `1.1.1.1`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({ dst: "1.1.1", src: "2.2.2" })
      .setVLAN({ vlan: 2 })
      .setIPv4({ dst: "1.1.1.1", src: "2.2.2.2" }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `1.1.1`，VLAN 2，目的 IP `1.1.1.1`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setEthernet({ dst: "1.1.1", src: "2.2.2" })
      .setVLAN({ vlan: 2 })
      .setIPv4({ dst: "1.1.1.1", src: "2.2.2.2" }),
    port: RenixPort.B,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
disable-ldp
exit
interface <PortD>
no mpls-vpls v1 vlan 2
no mpls-vpls v1 vlan 3
switchport mode access
exit
no interface loopback 0
no mpls vpls v1
no router rip
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
interface <PortD>
no mpls-vpls v1 vlan 2
no mpls-vpls v1 vlan 3
switchport mode access
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.7 用例 0070：配置MPLS L3VPN

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0070-MPLS-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 配置 | DUTD |
| 5 | 固定等待 | — |
| 6 | 等待就绪 | DUTB |
| 7 | 固定等待 | — |
| 8 | 清理 | DUTB |
| 9 | 固定等待 | — |
| 10 | 等待就绪 | DUTB |
| 11 | 配置 | DUTB |
| 12 | 固定等待 | — |
| 13 | 等待就绪 | DUTB |
| 14 | 等待就绪 | DUTA |
| 15 | 等待就绪 | DUTD |
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
clear ldp session *
```

**触发与等待**

- 固定等待 20 秒；等待依据见脚本注释。
- DUTB：轮询 `show ip ospf neighbor`，回显应包含 `Full`；超时 80 秒。
- 固定等待 5 秒；等待依据见脚本注释。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTB：轮询 `show ip bgp neighbors`，回显应包含 `BGP state = Established`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTB：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 90 秒。
- DUTA：轮询 `show ip route`，回显应匹配正则 `/R.*?7.7.7.7/32/`；超时 60 秒。
- DUTD：轮询 `show ip route`，回显应匹配正则 `/R.*?4.4.4.4/32/`；超时 60 秒。
**观测与预期**

- DUTA：执行 `ping 7.7.7.7`，回显应包含 ` 0% packet loss`。
- DUTD：执行 `ping 4.4.4.4`，回显应包含 ` 0% packet loss`。

**清理**

DUTB：

```text
clear ip bgp *
```

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

### 4.8 用例 0080：测试MPLS L3VPN PING功能

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0080-MPLS-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTA |
| 5 | 固定等待 | — |
| 6 | 清理 | DUTA |
| 7 | 固定等待 | — |
| 8 | 等待就绪 | DUTA |
| 9 | 配置 | DUTA |
| 10 | 固定等待 | — |
| 11 | 等待就绪 | DUTA |
| 12 | 观测 | DUTA |
| 13 | 观测 | DUTB |
| 14 | 清理 | DUTA |
| 15 | 清理 | DUTB |

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
ip address 2.2.2.2/24
exit
interface loopback0
ip address 5.5.5.5/32
exit
router ospf
redistribute connected
network 1.1.1.0/24 area 0
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
label-switching
ip address 1.1.1.2/24
enable-ldp
exit
interface <PortD>
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
router bgp 1
neighbor 5.5.5.5 remote-as 1
neighbor 5.5.5.5 update-source loopback0
address-family vpnv4 unicast
neighbor 5.5.5.5 activate
neighbor 5.5.5.5 send-community both
exit-address-family
address-family ipv4 vrf vpn1
redistribute connected
exit-address-family
exit
router ldp
router-id 6.6.6.6
end
```

DUTA：

```text
clear ldp session *
```

**触发与等待**

- 固定等待 20 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip ospf neighbor`，回显应包含 `Full`；超时 80 秒。
- 固定等待 5 秒；等待依据见脚本注释。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip bgp neighbors`，回显应包含 `BGP state = Established`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 90 秒。
**观测与预期**

- DUTA：执行 `ping vrf vpn1 -a 2.2.2.2 3.3.3.3`，回显应包含 ` 0% packet loss`。
- DUTB：执行 `ping vrf vpn1 -a 3.3.3.3 2.2.2.2`，回显应包含 ` 0% packet loss`。

**脚本注释中的预期现象**

- 验证ping连通性

**清理**

DUTA：

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

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

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

### 4.10 用例 0100：测试MPLS L3VPN PING功能 (explicit-null)

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0100-MPLS-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTA |
| 5 | 固定等待 | — |
| 6 | 清理 | DUTA |
| 7 | 固定等待 | — |
| 8 | 等待就绪 | DUTA |
| 9 | 配置 | DUTA |
| 10 | 固定等待 | — |
| 11 | 等待就绪 | DUTA |
| 12 | 观测 | DUTA |
| 13 | 观测 | DUTB |
| 14 | 清理 | DUTA |
| 15 | 清理 | DUTB |

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
ip address 2.2.2.2/24
exit
interface loopback0
ip address 5.5.5.5/32
exit
router ospf
redistribute connected
network 1.1.1.0/24 area 0
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
explicit-null
router-id 5.5.5.5
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
label-switching
ip address 1.1.1.2/24
enable-ldp
exit
interface <PortD>
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
router bgp 1
neighbor 5.5.5.5 remote-as 1
neighbor 5.5.5.5 update-source loopback0
address-family vpnv4 unicast
neighbor 5.5.5.5 activate
neighbor 5.5.5.5 send-community both
exit-address-family
address-family ipv4 vrf vpn1
redistribute connected
exit-address-family
exit
router ldp
explicit-null
router-id 6.6.6.6
end
```

DUTA：

```text
clear ldp session *
```

**触发与等待**

- 固定等待 20 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip ospf neighbor`，回显应包含 `Full`；超时 80 秒。
- 固定等待 5 秒；等待依据见脚本注释。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip bgp neighbors`，回显应包含 `BGP state = Established`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 90 秒。
**观测与预期**

- DUTA：执行 `ping vrf vpn1 -a 2.2.2.2 3.3.3.3`，回显应包含 ` 0% packet loss`。
- DUTB：执行 `ping vrf vpn1 -a 3.3.3.3 2.2.2.2`，回显应包含 ` 0% packet loss`。

**脚本注释中的预期现象**

- 验证ping连通性

**清理**

DUTA：

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

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.11 用例 0110：测试MPLS L3VPN 多跳 PING功能 (explicit-null)

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0110-MPLS-BASIC.test.ts`

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
explicit-null
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
explicit-null
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
explicit-null
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

### 4.12 用例 0120：测试MPLS L3VPN 收到未知邻居报文能触发arp (bugid: 2751)

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0120-MPLS-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTA |
| 5 | 固定等待 | — |
| 6 | 清理 | DUTA |
| 7 | 固定等待 | — |
| 8 | 等待就绪 | DUTA |
| 9 | 配置 | DUTA |
| 10 | 固定等待 | — |
| 11 | 等待就绪 | DUTA |
| 12 | 抓包 / 停流 | RenixPort.B |
| 13 | 配置 | DUTA |
| 14 | 流量校验 | RenixPort.B |
| 15 | 清理 | DUTA |
| 16 | 清理 | DUTB |

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
ip address 2.2.2.2/24
exit
interface loopback0
ip address 5.5.5.5/32
exit
router ospf
redistribute connected
network 1.1.1.0/24 area 0
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
label-switching
ip address 1.1.1.2/24
enable-ldp
exit
interface <PortD>
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
router bgp 1
neighbor 5.5.5.5 remote-as 1
neighbor 5.5.5.5 update-source loopback0
address-family vpnv4 unicast
neighbor 5.5.5.5 activate
neighbor 5.5.5.5 send-community both
exit-address-family
address-family ipv4 vrf vpn1
redistribute connected
exit-address-family
exit
router ldp
router-id 6.6.6.6
end
```

DUTA：

```text
clear ldp session *
```

DUTA：

```text
ping vrf vpn1 -a 2.2.2.2 3.3.3.100
```

**触发与等待**

- 固定等待 20 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip ospf neighbor`，回显应包含 `Full`；超时 80 秒。
- 固定等待 5 秒；等待依据见脚本注释。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip bgp neighbors`，回显应包含 `BGP state = Established`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 90 秒。
- 在 `RenixPort.B` 启动抓包。
- 在 `RenixPort.B` 校验报文，报文层包括 ARP。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: GreaterThan(1),
    packet: new PacketBuilder().setARP({ pdst: "3.3.3.100" }),
    port: RenixPort.B,
  })
```

</details>

**脚本注释中的预期现象**

- 验证ping连通性

**清理**

DUTA：

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

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.13 用例 0130：测试MPLS vlan subif L3VPN PING功能

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0130-MPLS-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTA |
| 5 | 固定等待 | — |
| 6 | 清理 | DUTA |
| 7 | 固定等待 | — |
| 8 | 等待就绪 | DUTA |
| 9 | 配置 | DUTA |
| 10 | 固定等待 | — |
| 11 | 等待就绪 | DUTA |
| 12 | 观测 | DUTA |
| 13 | 观测 | DUTB |
| 14 | 清理 | DUTA |
| 15 | 清理 | DUTB |

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
exit
interface <PortA>.1
dot1q termination vid 200
label-switching
ip address 1.1.1.1/24
enable-ldp
exit
interface <PortD>
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
dot1q termination vid 200
label-switching
ip address 1.1.1.2/24
enable-ldp
exit
interface <PortD>
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
router bgp 1
neighbor 5.5.5.5 remote-as 1
neighbor 5.5.5.5 update-source loopback0
address-family vpnv4 unicast
neighbor 5.5.5.5 activate
neighbor 5.5.5.5 send-community both
exit-address-family
address-family ipv4 vrf vpn1
redistribute connected
exit-address-family
exit
router ldp
router-id 6.6.6.6
end
```

DUTA：

```text
clear ldp session *
```

**触发与等待**

- 固定等待 20 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip ospf neighbor`，回显应包含 `Full`；超时 80 秒。
- 固定等待 5 秒；等待依据见脚本注释。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ip bgp neighbors`，回显应包含 `BGP state = Established`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 90 秒。
**观测与预期**

- DUTA：执行 `ping vrf vpn1 -a 2.2.2.2 3.3.3.3`，回显应包含 ` 0% packet loss`。
- DUTB：执行 `ping vrf vpn1 -a 3.3.3.3 2.2.2.2`，回显应包含 ` 0% packet loss`。

**脚本注释中的预期现象**

- 验证ping连通性

**清理**

DUTA：

```text
clear ip bgp *
```

DUTA：

```text
configure terminal
no ip vrf vpn1
no interface <PortA>.1
interface <PortA>
switchport
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
no ip vrf vpn1
no interface <PortA>.1
interface <PortA>
switchport
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

### 4.14 用例 0140：使用 VLAN Interface 配置MPLS VPLS

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/01-mpls_basic/0140-MPLS-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTB |
| 6 | 抓包 / 停流 | RenixPort.B |
| 7 | 流量发送 | RenixPort.A |
| 8 | 流量校验 | RenixPort.B |
| 9 | 清理 | DUTA |
| 10 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
vlan database
vlan 2
exit
interface <PortA>
switchport access vlan 2
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 vlan 2
exit
interface vlan 2
label-switching
ip address 11.11.9.1/24
enable-ldp
exit
interface loopback0
ip address 11.11.1.1/32
exit
mpls vpls v1 100
vpls-peer 11.11.4.4 raw
exit
router rip
network 11.11.0.0/16
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
vlan database
vlan 2
exit
interface <PortA>
switchport access vlan 2
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 vlan 2
exit
interface vlan 2
label-switching
ip address 11.11.9.2/24
enable-ldp
exit
interface loopback0
ip address 11.11.4.4/32
exit
mpls vpls v1 100
vpls-peer 11.11.1.1 raw
exit
router rip
network 11.11.0.0/16
exit
router ldp
router-id 11.11.4.4
targeted-peer 11.11.1.1
transport-address 11.11.4.4
end
```

**触发与等待**

- 固定等待 25 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.4.4.*?OPERATIONAL/`；超时 60 秒。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 60 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `1.1.1`，VLAN 2，目的 IP `1.1.1.1`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({ dst: "1.1.1", src: "2.2.2" })
      .setVLAN({ vlan: 2 })
      .setIPv4({ dst: "1.1.1.1", src: "2.2.2.2" }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `1.1.1`，VLAN 2，目的 IP `1.1.1.1`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setEthernet({ dst: "1.1.1", src: "2.2.2" })
      .setVLAN({ vlan: 2 })
      .setIPv4({ dst: "1.1.1.1", src: "2.2.2.2" }),
    port: RenixPort.B,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
vlan database
no vlan 2
exit
interface <PortA>
no switchport access vlan
exit
interface <PortD>
no mpls-vpls v1 vlan 2
switchport mode access
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
end
```

DUTB：

```text
configure terminal
vlan database
no vlan 2
exit
interface <PortA>
no switchport access vlan
exit
interface <PortD>
no mpls-vpls v1 vlan 2
switchport mode access
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

## 5. 清理与恢复

各用例的清理命令见第 4 节对应小节。合集执行完毕后，按设备执行以下检查，确认本合集新增对象均已删除。

```text
show running-config
show mpls
show ldp session
show ip route
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

