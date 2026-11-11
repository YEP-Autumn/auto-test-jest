# MPLS AC VLAN 范围测试用例合集

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本目录全部测试脚本。
> 同一目录的脚本共用公共拓扑、预置条件与判定口径；各用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | mpls ac支持配置vlan range | `0010-MPLS-AC_VLAN_RANGE.test.ts` | P1 / 功能 | |
| 0020 | vlan range ac bunlding可以和 vlan ac 同时使用 | `0020-MPLS-AC_VLAN_RANGE.test.ts` | P1 / 功能 | |
| 0030 | vlan range ac可以和vlan mapping同时使用 | `0030-MPLS-AC_VLAN_RANGE.test.ts` | P1 / 功能 | |
| 0040 | vlan range ac可以和qinq flex mode模式同时使用 | `0040-MPLS-AC_VLAN_RANGE.test.ts` | P1 / 功能 | |
| 0050.1 | 一个接口只能配置一个mpls vlan range ac | `0050-MPLS-AC_VLAN_RANGE.test.ts` | P1 / 功能 | |
| 0050.2 | 同一个接口上dot1q-tunnel type flex raw vlan group不能和 mpls vlan range ac同时使用 | `0050-MPLS-AC_VLAN_RANGE.test.ts` | P1 / 功能 | |
| 0050.3 | 接口配置mpls vlan range ac后, 不能向dot1q-tunnel type flex 的vlan mapping table中添加 raw vlan group条目 | `0050-MPLS-AC_VLAN_RANGE.test.ts` | P1 / 功能 | |
| 0060 | vlan range ac在使用时，无法删除和修改raw vlan group | `0060-MPLS-AC_VLAN_RANGE.test.ts` | P1 / 功能 | |
| 0070 | mpls ac支持配置vlan range + cvid | `0070-MPLS-AC_VLAN_RANGE.test.ts` | P1 / 功能 | |

## 1. 基本信息（合集）

- 用例编号：`0010` ~ `0070`
- 用例标题：MPLS AC VLAN 范围测试用例合集
- 所属特性 / 分组：`19-MPLS` / `MPLS配置` / `AC VLAN 范围`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 23 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本合集验证的要求 |
| --- | --- | --- |
| E530 配置指导（V7.5.1） | 19.2 | AC VLAN 范围配置与回显 |
| E530 命令参考（V7.4.8） | MPLS配置 | 命令参数、回显与删除 |
| IEEE 802.1Q-2018 | VLAN 标记、成员与转发 | VLAN、PVID、Trunk 与子接口处理 |
| RFC 3031 / RFC 5036 | MPLS 标签与 LDP | 标签分发与 LSP 建立 |
| RFC 4762 / RFC 4364 | VPLS 与 L3VPN | VPLS 转发与 L3VPN 路由 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | 支持AC VLAN 范围特性 | 确认特性可用范围 |
| License / 单板 | 支持AC VLAN 范围相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 3 个可配置接口 | 确认接口类型与数量 |
| 测试仪端口 | RenixPort.A / RenixPort.B / RenixPort.C | 确认流量收发端口可用 |
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

适用用例：0010、0020、0070。

### 2.2 拓扑 2

```text
                   +--------+                   +--------+
 RenixA <=> PortD--|        |                   |        |
                   |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
 RenixC <=> PortB--|        |                   |        |    |
                   +--------+                   +--------+    |
                                                              |
                                                +--------+    |
                              RenixB <=> PortD--|  DUTC  |--PortB
                                                +--------+
```

适用用例：0030、0040。

内置拓扑：`LinkConstraint.three_devices_topo_links_type_5`、`LinkConstraint.three_devices_topo_links_type_2`。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | `<PortA>`、`<PortB>`、`<PortD>` | 被测设备端口，执行前替换为实际接口名 |
| 测试仪 | `<RenixPortA>`、`<RenixPortB>`、`<RenixPortC>` | 流量收发端口，按测试仪实际连接配置 |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| Router ID | 11.11.1.1 / 11.11.2.2 / 11.11.4.4 | 全局唯一 |
| VLAN | 2-500 | 按拓扑规划 |
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

### 4.1 用例 0010：mpls ac支持配置vlan range

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/0010-MPLS-AC_VLAN_RANGE.test.ts`

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
| 10 | 等待就绪 | DUTC |
| 11 | 等待就绪 | DUTC |
| 12 | 抓包 / 停流 | RenixPort.B |
| 13 | 流量发送 | RenixPort.A |
| 14 | 流量校验 | RenixPort.B |
| 15 | 抓包 / 停流 | RenixPort.B |
| 16 | 流量发送 | RenixPort.A |
| 17 | 流量校验 | RenixPort.B |
| 18 | 抓包 / 停流 | RenixPort.B |
| 19 | 流量发送 | RenixPort.A |
| 20 | 流量校验 | RenixPort.B |
| 21 | 清理 | DUTA |
| 22 | 清理 | DUTB |
| 23 | 清理 | DUTC |

**配置**

DUTA：

```text
configure terminal
raw vlan group 1 flex-vlan 30-40,50-60
interface <PortA>
no switchport
label-switching
ip address 11.11.9.1/24
enable-ldp
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 flex-vlan-range-group 1
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
raw vlan group 1 flex-vlan 100-200
interface <PortB>
no switchport
label-switching
ip address 11.11.13.4/24
enable-ldp
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 flex-vlan-range-group 1
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

- 固定等待 45 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp vpls`，回显应包含 `Up     vlan`；超时 60 秒。
- DUTC：轮询 `show ldp vpls`，回显应包含 `Up     vlan`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.2.2.*?OPERATIONAL/`；超时 45 秒。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.4.4.*?OPERATIONAL/`；超时 45 秒。
- DUTC：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 45 秒。
- DUTC：轮询 `show ldp session`，回显应匹配正则 `/11.11.2.2.*?OPERATIONAL/`；超时 45 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 35，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 35, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 35，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 35, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 55，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 55, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 55，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 55, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 45，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 45, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 45，目的 IP `2.2.2.2`，期望计数为 0。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 45, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 0,
  })
```

</details>

**脚本注释中的预期现象**

- RenixA发送vlan 30~40,50~60的报文, RenixB可以收到携带vlan的报文
- RenixA发送vlan 30~40,50~60以外的报文, RenixB不能收到

**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
disable-ldp
exit
interface <PortD>
no mpls-vpls v1 flex-vlan-range-group 1
switchport mode access
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
no raw vlan group 1
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
no mpls-vpls v1 flex-vlan-range-group 1
switchport mode access
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
no raw vlan group 1
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.2 用例 0020：vlan range ac bunlding可以和 vlan ac 同时使用

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/0020-MPLS-AC_VLAN_RANGE.test.ts`

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
| 10 | 等待就绪 | DUTC |
| 11 | 等待就绪 | DUTC |
| 12 | 抓包 / 停流 | RenixPort.B |
| 13 | 流量发送 | RenixPort.A |
| 14 | 流量校验 | RenixPort.B |
| 15 | 抓包 / 停流 | RenixPort.B |
| 16 | 流量发送 | RenixPort.A |
| 17 | 流量校验 | RenixPort.B |
| 18 | 抓包 / 停流 | RenixPort.B |
| 19 | 流量发送 | RenixPort.A |
| 20 | 流量校验 | RenixPort.B |
| 21 | 抓包 / 停流 | RenixPort.B |
| 22 | 流量发送 | RenixPort.A |
| 23 | 流量校验 | RenixPort.B |
| 24 | 清理 | DUTA |
| 25 | 清理 | DUTB |
| 26 | 清理 | DUTC |

**配置**

DUTA：

```text
configure terminal
raw vlan group 1 flex-vlan 30-40,50-60
interface <PortA>
no switchport
label-switching
ip address 11.11.9.1/24
enable-ldp
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 vlan 2 bundling
mpls-vpls v1 flex-vlan-range-group 1 bundling
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

- 固定等待 45 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp vpls`，回显应包含 `Up     vlan`；超时 60 秒。
- DUTC：轮询 `show ldp vpls`，回显应包含 `Up     vlan`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.2.2.*?OPERATIONAL/`；超时 45 秒。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.4.4.*?OPERATIONAL/`；超时 45 秒。
- DUTC：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 45 秒。
- DUTC：轮询 `show ldp session`，回显应匹配正则 `/11.11.2.2.*?OPERATIONAL/`；超时 45 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 2，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 2，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 35，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 35, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 2，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 55，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 55, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 2，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 45，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 45, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 2，目的 IP `2.2.2.2`，期望计数为 0。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 0,
  })
```

</details>

**脚本注释中的预期现象**

- RenixA发送vlan 2的报文, RenixB可以收到vlan 2的报文
- RenixA发送vlan 30~40,50~60的报文, RenixB可以收到vlan 2的报文
- RenixA发送vlan 30~40,50~60以外的报文, RenixB不能收到

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
no mpls-vpls v1 flex-vlan-range-group 1
switchport mode access
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
no raw vlan group 1
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

### 4.3 用例 0030：vlan range ac可以和vlan mapping同时使用

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/0030-MPLS-AC_VLAN_RANGE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 配置 | DUTA |
| 5 | 固定等待 | — |
| 6 | 等待就绪 | DUTA |
| 7 | 等待就绪 | DUTC |
| 8 | 固定等待 | — |
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTA |
| 11 | 等待就绪 | DUTC |
| 12 | 等待就绪 | DUTC |
| 13 | 抓包 / 停流 | RenixPort.B |
| 14 | 流量发送 | RenixPort.A |
| 15 | 流量校验 | RenixPort.B |
| 16 | 抓包 / 停流 | RenixPort.C |
| 17 | 流量发送 | RenixPort.A |
| 18 | 流量校验 | RenixPort.C |
| 19 | 抓包 / 停流 | RenixPort.C |
| 20 | 流量发送 | RenixPort.A |
| 21 | 流量校验 | RenixPort.C |
| 22 | 抓包 / 停流 | RenixPort.A |
| 23 | 流量发送 | RenixPort.C |
| 24 | 流量校验 | RenixPort.A |
| 25 | 抓包 / 停流 | RenixPort.A |
| 26 | 流量发送 | RenixPort.C |
| 27 | 流量校验 | RenixPort.A |
| 28 | 清理 | DUTA |
| 29 | 清理 | DUTB |
| 30 | 清理 | DUTC |

**配置**

DUTA：

```text
configure terminal
raw vlan group 1 flex-vlan 30-40,50-60
interface <PortA>
no switchport
label-switching
ip address 11.11.9.1/24
enable-ldp
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 flex-vlan-range-group 1
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

DUTA：

```text
configure terminal
vlan database
vlan 2-500
ethernet evc 1
dot1q mapped-vlan 333
exit
ethernet evc 2
dot1q mapped-vlan 444
exit
vlan mapping table vm
raw-vlan 123 evc 1
raw-vlan 100 200 evc 2
exit
interface <PortD>
switchport trunk vlan-translation
switchport trunk vlan-translation mapping table vm
switchport trunk allowed vlan add 333,444
exit
interface <PortB>
switchport mode trunk
switchport trunk allowed vlan add 333,444
end
```

**触发与等待**

- 固定等待 45 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp vpls`，回显应包含 `Up     vlan`；超时 60 秒。
- DUTC：轮询 `show ldp vpls`，回显应包含 `Up     vlan`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.2.2.*?OPERATIONAL/`；超时 45 秒。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.4.4.*?OPERATIONAL/`；超时 45 秒。
- DUTC：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 45 秒。
- DUTC：轮询 `show ldp session`，回显应匹配正则 `/11.11.2.2.*?OPERATIONAL/`；超时 45 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 33，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 33, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 2，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.C` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 123，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 123, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.C` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 333，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 333, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.C` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 200，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x8100 })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.C` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 444，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 444, type: 0x8100 })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.A` 启动抓包。
- 从 `RenixPort.C` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 333，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 333, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.A` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 123，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 123, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.A` 启动抓包。
- 从 `RenixPort.C` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 444，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 444, type: 0x8100 })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.A` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 200，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x8100 })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

**脚本注释中的预期现象**

- RenixA发送vlan 30~40,50~60的报文, RenixB可以收到vlan 2的报文
- RenixA发送vlan 123的报文, RenixC可以收到vlan 333的报文
- RenixA发送vlan 100/200的报文, RenixC可以收到vlan 100/444的报文
- RenixC发送vlan 333的报文, RenixA可以收到vlan 123的报文
- RenixC发送vlan 444的报文, RenixA可以收到vlan 100/200的报文

**清理**

DUTA：

```text
configure terminal
vlan database
no vlan 2-500
interface <PortA>
switchport
disable-ldp
exit
interface <PortD>
no mpls-vpls v1 flex-vlan-range-group 1
switchport mode access
exit
interface <PortB>
switchport mode access
exit
no vlan mapping table vm
no ethernet evc 1
no ethernet evc 2
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
no raw vlan group 1
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

### 4.4 用例 0040：vlan range ac可以和qinq flex mode模式同时使用

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/0040-MPLS-AC_VLAN_RANGE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 配置 | DUTA |
| 5 | 固定等待 | — |
| 6 | 等待就绪 | DUTA |
| 7 | 等待就绪 | DUTC |
| 8 | 固定等待 | — |
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTA |
| 11 | 等待就绪 | DUTC |
| 12 | 等待就绪 | DUTC |
| 13 | 抓包 / 停流 | RenixPort.B |
| 14 | 流量发送 | RenixPort.A |
| 15 | 流量校验 | RenixPort.B |
| 16 | 抓包 / 停流 | RenixPort.C |
| 17 | 流量发送 | RenixPort.A |
| 18 | 流量校验 | RenixPort.C |
| 19 | 抓包 / 停流 | RenixPort.C |
| 20 | 流量发送 | RenixPort.A |
| 21 | 流量校验 | RenixPort.C |
| 22 | 抓包 / 停流 | RenixPort.C |
| 23 | 流量发送 | RenixPort.A |
| 24 | 流量校验 | RenixPort.C |
| 25 | 抓包 / 停流 | RenixPort.C |
| 26 | 流量发送 | RenixPort.A |
| 27 | 流量校验 | RenixPort.C |
| 28 | 抓包 / 停流 | RenixPort.C |
| 29 | 流量发送 | RenixPort.A |
| 30 | 流量校验 | RenixPort.C |
| 31 | 抓包 / 停流 | RenixPort.A |
| 32 | 流量发送 | RenixPort.C |
| 33 | 流量校验 | RenixPort.A |
| 34 | 抓包 / 停流 | RenixPort.A |
| 35 | 流量发送 | RenixPort.C |
| 36 | 流量校验 | RenixPort.A |
| 37 | 清理 | DUTA |
| 38 | 清理 | DUTB |
| 39 | 清理 | DUTC |

**配置**

DUTA：

```text
configure terminal
raw vlan group 1 flex-vlan 30-40,50-60
interface <PortA>
no switchport
label-switching
ip address 11.11.9.1/24
enable-ldp
exit
interface <PortD>
switchport mode dot1q-tunnel
switchport dot1q-tunnel type flex
mpls-vpls v1 flex-vlan-range-group 1
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

DUTA：

```text
configure terminal
vlan database
vlan 2-500
exit
ethernet evc 1
dot1q mapped-vlan 400
exit
ethernet evc 2
dot1q mapped-vlan 401
exit
ethernet evc 3
dot1q mapped-vlan 402
exit
ethernet evc 4
dot1q mapped-vlan 403
exit
ethernet evc 6
dot1q mapped-vlan 500
exit
vlan mapping table vm
raw-vlan-translate 200 evc 1
raw-vlan-translate 201 202 evc 2
raw-vlan 203 evc 3
raw-vlan untagged evc 4
raw-vlan out-of-range evc 6
raw-vlan 100 200 egress-vlan untagged
raw-vlan 200 300 egress-vlan 123
exit
interface <PortD>
switchport dot1q-tunnel vlan mapping table vm
switchport dot1q-tunnel allowed vlan add 200,300,400-404,500
exit
interface <PortB>
switchport mode trunk
switchport trunk allowed vlan add 200,300,400-404,500
end
```

**触发与等待**

- 固定等待 45 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp vpls`，回显应包含 `Up     ethernet`；超时 60 秒。
- DUTC：轮询 `show ldp vpls`，回显应包含 `Up     ethernet`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.2.2.*?OPERATIONAL/`；超时 45 秒。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.4.4.*?OPERATIONAL/`；超时 45 秒。
- DUTC：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 45 秒。
- DUTC：轮询 `show ldp session`，回显应匹配正则 `/11.11.2.2.*?OPERATIONAL/`；超时 45 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 33，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 33, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 2，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.C` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 200，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.C` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 400，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 400, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.C` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 202，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 202, type: 0x8100 })
      .setVLAN({ vlan: 201, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.C` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 401，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 401, type: 0x8100 })
      .setVLAN({ vlan: 201, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.C` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 203，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 203, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.C` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 402，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 402, type: 0x8100 })
      .setVLAN({ vlan: 203, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.C` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `00:00:01:00:00:ee`，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x0800,
      })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.C` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 403，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 403, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.C` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 44，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 44, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.C` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 500，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 500, type: 0x8100 })
      .setVLAN({ vlan: 44, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.A` 启动抓包。
- 从 `RenixPort.C` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ec`，VLAN 200，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ec",
        src: "00:00:a0:0a:00:6c",
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x8100 })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.A` 校验报文，报文层包括 Ethernet、IPv4，目的 MAC `00:00:01:00:00:ec`，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ec",
        src: "00:00:a0:0a:00:6c",
        type: 0x0800,
      })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.A` 启动抓包。
- 从 `RenixPort.C` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ec`，VLAN 300，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ec",
        src: "00:00:a0:0a:00:6c",
        type: 0x8100,
      })
      .setVLAN({ vlan: 300, type: 0x8100 })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.A` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ec`，VLAN 123，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ec",
        src: "00:00:a0:0a:00:6c",
        type: 0x8100,
      })
      .setVLAN({ vlan: 123, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

**脚本注释中的预期现象**

- RenixA 发送 vlan 30-40 或 50-60 之间的报文时, RenixB能够收到报文
- RenixA 发送 vlan 200的报文时, RenixC能够收到vlan 400的报文
- RenixA 发送 vlan 201 202的报文时, RenixC能够收到vlan 201 401的报文
- RenixA 发送 vlan 203的报文时, RenixC能够收到vlan 203 402的报文
- RenixA 发送 vlan 不带vlan的报文时, RenixC能够收到vlan 403的报文
- RenixA 发送 vlan 其他vlan的报文时, RenixC能够收到 报文原vlan + 外层 vlan 500的报文 (需要portB和portD都配置允许该vlan通行)

**清理**

DUTA：

```text
configure terminal
vlan database
no vlan 2-500
exit
interface <PortA>
switchport
disable-ldp
exit
interface <PortD>
no mpls-vpls v1 flex-vlan-range-group 1
switchport mode access
exit
interface <PortB>
switchport mode access
exit
no vlan mapping table vm
no ethernet evc 1
no ethernet evc 2
no ethernet evc 3
no ethernet evc 4
no ethernet evc 6
no raw vlan group 1
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
no raw vlan group 1
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

### 4.5 用例 0050.1：一个接口只能配置一个mpls vlan range ac

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/0050-MPLS-AC_VLAN_RANGE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 观测 | DUTA |
| 3 | 配置 | DUTA |
| 4 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
raw vlan group 1 flex-vlan 10-20
raw vlan group 2 flex-vlan 20-30
interface <PortA>
switchport mode trunk
mpls-vpls v1 flex-vlan-range-group 1
```

DUTA：

```text
end
```

**观测与预期**

- DUTA：执行 `mpls-vpls v2 flex-vlan-range-group 2`，回显应包含 `Vlan range only can config one vpls ac on same interface`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no mpls-vpls v1 flex-vlan-range-group 1
switchport mode access
exit
no raw vlan group 1
no raw vlan group 2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.6 用例 0050.2：同一个接口上dot1q-tunnel type flex raw vlan group不能和 mpls vlan range ac同时使用

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/0050-MPLS-AC_VLAN_RANGE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 观测 | DUTA |
| 3 | 配置 | DUTA |
| 4 | 配置 | DUTA |
| 5 | 观测 | DUTA |
| 6 | 配置 | DUTA |
| 7 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
raw vlan group 1 flex-vlan 10-20
raw vlan group 2 flex-vlan 20-30
ethernet evc 1
dot1q mapped-vlan 100
exit
vlan mapping table vm1
raw-vlan group 1 evc 1
exit
interface <PortA>
switchport mode dot1q-tunnel
switchport dot1q-tunnel type flex
switchport dot1q-tunnel vlan mapping table vm1
```

DUTA：

```text
no switchport dot1q-tunnel vlan mapping table
```

DUTA：

```text
mpls-vpls v1 flex-vlan-range-group 2
```

DUTA：

```text
end
```

**观测与预期**

- DUTA：执行 `mpls-vpls v1 flex-vlan-range-group 2`，回显应包含 `Vlan range already in use with vlan mapping`。
- DUTA：执行 `switchport dot1q-tunnel vlan mapping table vm1`，回显应包含 `VLAN range conflict with mpls ac vlan`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no mpls-vpls v1 flex-vlan-range-group 2
switchport mode access
exit
no vlan mapping table vm1
no ethernet evc 1
no raw vlan group 1
no raw vlan group 2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.7 用例 0050.3：接口配置mpls vlan range ac后, 不能向dot1q-tunnel type flex 的vlan mapping table中添加 raw vlan group条目

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/0050-MPLS-AC_VLAN_RANGE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTA |
| 3 | 观测 | DUTA |
| 4 | 配置 | DUTA |
| 5 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
raw vlan group 1 flex-vlan 10-20
raw vlan group 2 flex-vlan 20-30
ethernet evc 1
dot1q mapped-vlan 100
exit
vlan mapping table vm1
exit
interface <PortA>
switchport mode dot1q-tunnel
switchport dot1q-tunnel type flex
switchport dot1q-tunnel vlan mapping table vm1
mpls-vpls v1 flex-vlan-range-group 1
end
```

DUTA：

```text
configure terminal
vlan mapping table vm1
```

DUTA：

```text
end
```

**观测与预期**

- DUTA：执行 `raw-vlan group 2 evc 1`，回显应包含 `VLAN range conflict with mpls ac vlan`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no mpls-vpls v1 flex-vlan-range-group 1
switchport mode access
exit
no vlan mapping table vm1
no ethernet evc 1
no raw vlan group 1
no raw vlan group 2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.8 用例 0060：vlan range ac在使用时，无法删除和修改raw vlan group

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/0060-MPLS-AC_VLAN_RANGE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTA |
| 3 | 观测 | DUTA |
| 4 | 观测 | DUTA |
| 5 | 配置 | DUTA |
| 6 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
raw vlan group 1 flex-vlan 10-20
interface <PortA>
switchport mode trunk
mpls-vpls v1 flex-vlan-range-group 1
end
```

DUTA：

```text
configure terminal
```

DUTA：

```text
end
```

**观测与预期**

- DUTA：执行 `raw vlan group 1 flex-vlan 30-40`，回显应包含 `Group mpls ac used`。
- DUTA：执行 `no raw vlan group 1`，回显应包含 `Group mpls ac used`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no mpls-vpls v1 flex-vlan-range-group 1
switchport mode access
exit
no raw vlan group 1
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.9 用例 0070：mpls ac支持配置vlan range + cvid

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/0070-MPLS-AC_VLAN_RANGE.test.ts`

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
| 10 | 等待就绪 | DUTC |
| 11 | 等待就绪 | DUTC |
| 12 | 抓包 / 停流 | RenixPort.B |
| 13 | 流量发送 | RenixPort.A |
| 14 | 流量校验 | RenixPort.B |
| 15 | 抓包 / 停流 | RenixPort.B |
| 16 | 流量发送 | RenixPort.A |
| 17 | 流量校验 | RenixPort.B |
| 18 | 抓包 / 停流 | RenixPort.B |
| 19 | 流量发送 | RenixPort.A |
| 20 | 流量校验 | RenixPort.B |
| 21 | 清理 | DUTA |
| 22 | 清理 | DUTB |
| 23 | 清理 | DUTC |

**配置**

DUTA：

```text
configure terminal
raw vlan group 1 flex-vlan 30-40,50-60
interface <PortA>
no switchport
label-switching
ip address 11.11.9.1/24
enable-ldp
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 flex-vlan-range-group 1 cvlan 100
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
raw vlan group 1 flex-vlan 100-200
interface <PortB>
no switchport
label-switching
ip address 11.11.13.4/24
enable-ldp
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 flex-vlan-range-group 1 cvlan 100
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

- 固定等待 45 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp vpls`，回显应包含 `Up     vlan`；超时 60 秒。
- DUTC：轮询 `show ldp vpls`，回显应包含 `Up     vlan`；超时 60 秒。
- 固定等待 10 秒；等待依据见脚本注释。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.2.2.*?OPERATIONAL/`；超时 45 秒。
- DUTA：轮询 `show ldp session`，回显应匹配正则 `/11.11.4.4.*?OPERATIONAL/`；超时 45 秒。
- DUTC：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 45 秒。
- DUTC：轮询 `show ldp session`，回显应匹配正则 `/11.11.2.2.*?OPERATIONAL/`；超时 45 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 35，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 35 })
      .setVLAN({ vlan: 100 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 35，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 35 })
      .setVLAN({ vlan: 100 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 55，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 55 })
      .setVLAN({ vlan: 100 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 55，目的 IP `2.2.2.2`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 55 })
      .setVLAN({ vlan: 100 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  })
```

</details>

- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 45，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 45 })
      .setVLAN({ vlan: 100 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 45，目的 IP `2.2.2.2`，期望计数为 0。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 45 })
      .setVLAN({ vlan: 100 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 0,
  })
```

</details>

**脚本注释中的预期现象**

- RenixA发送svlan 30~40,50~60 cvlan 为 100 的报文, RenixB可以收到携带vlan的报文
- RenixA发送svlan 30~40,50~60以外 和 cvlan 为 100的报文, RenixB不能收到

**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
disable-ldp
exit
interface <PortD>
no mpls-vpls v1 flex-vlan-range-group 1
switchport mode access
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
no raw vlan group 1
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
no mpls-vpls v1 flex-vlan-range-group 1
switchport mode access
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
no raw vlan group 1
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
| 0050.1 | | | |
| 0050.2 | | | |
| 0050.3 | | | |
| 0060 | | | |
| 0070 | | | |

