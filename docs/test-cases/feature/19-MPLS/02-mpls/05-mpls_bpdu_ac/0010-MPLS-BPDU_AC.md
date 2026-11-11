# MPLS BPDU AC 测试用例合集

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本目录全部测试脚本。
> 同一目录的脚本共用公共拓扑、预置条件与判定口径；各用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | 支持tagged模式vpls配置bpdu ac | `0010-MPLS-BPDU_AC.test.ts` | P1 / 功能 | |
| 0020 | 支持raw模式vpls配置bpdu ac | `0020-MPLS-BPDU_AC.test.ts` | P1 / 功能 | |
| 0030 | 支持vpls bpdu ac和bundling ac同时使用 | `0030-MPLS-BPDU_AC.test.ts` | P1 / 功能 | |
| 0040 | 支持vpls bpdu ac和ethernet ac同时使用 | `0040-MPLS-BPDU_AC.test.ts` | P1 / 功能 | |
| 0050 | 支持tagged模式vpws配置bpdu ac | `0050-MPLS-BPDU_AC.test.ts` | P1 / 功能 | |
| 0060 | 支持raw模式vpws配置bpdu ac | `0060-MPLS-BPDU_AC.test.ts` | P1 / 功能 | |
| 0070 | 支持不指定targeted-peer模式的vpws配置bpdu ac | `0070-MPLS-BPDU_AC.test.ts` | P1 / 功能 | |
| 0080 | 支持在agg接口配置bpud ac | `0080-MPLS-BPDU_AC.test.ts` | P1 / 功能 | |

## 1. 基本信息（合集）

- 用例编号：`0010` ~ `0080`
- 用例标题：MPLS BPDU AC 测试用例合集
- 所属特性 / 分组：`19-MPLS` / `MPLS配置` / `BPDU AC`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 24 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本合集验证的要求 |
| --- | --- | --- |
| E530 配置指导（V7.5.1） | 19.2 | BPDU AC配置与回显 |
| E530 命令参考（V7.4.8） | MPLS配置 | 命令参数、回显与删除 |
| RFC 3031 / RFC 5036 | MPLS 标签与 LDP | 标签分发与 LSP 建立 |
| RFC 4762 / RFC 4364 | VPLS 与 L3VPN | VPLS 转发与 L3VPN 路由 |
| IEEE 802.1AX | 链路聚合 | 成员口选择与负载分担 |
| IEEE 802.1Q / IEEE 802.1D | 生成树 | 拓扑计算与端口角色 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | 支持BPDU AC特性 | 确认特性可用范围 |
| License / 单板 | 支持BPDU AC相关命令 | 确认功能授权与端口能力 |
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

适用用例：0010。

### 2.2 拓扑 2

```text
                   +--------+                   +--------+
                   |        |--PortA <=> PortA--|        |
 RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortD <=> RenixB
                   |        |--PortC <=> PortC--|        |
                   +--------+                   +--------+
```

适用用例：0020、0030、0040、0050、0060、0070、0080。

内置拓扑：`LinkConstraint.three_devices_topo_links_type_5`、`LinkConstraint.two_devices_topo_links_type_1`。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | `<PortA>`、`<PortB>`、`<PortD>` | 被测设备端口，执行前替换为实际接口名 |
| 测试仪 | `<RenixPortA>`、`<RenixPortB>` | 流量收发端口，按测试仪实际连接配置 |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| Router ID | 11.11.1.1 / 11.11.2.2 / 11.11.4.4 / 192.168.10.10 | 全局唯一 |
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

### 4.1 用例 0010：支持tagged模式vpls配置bpdu ac

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac/0010-MPLS-BPDU_AC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 固定等待 | — |
| 5 | 等待就绪 | DUTB |
| 6 | 等待就绪 | DUTB |
| 7 | 抓包 / 停流 | RenixPort.B |
| 8 | 流量发送 | RenixPort.A |
| 9 | 流量校验 | RenixPort.B |
| 10 | 清理 | DUTA |
| 11 | 清理 | DUTB |
| 12 | 清理 | DUTC |

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
mpls-vpls v1 bpdu-forward
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
mpls-vpls v1 bpdu-forward
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
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 60 秒。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.4.4.*?OPERATIONAL/`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Dot3、LLC，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
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

- 在 `RenixPort.B` 校验报文，报文层包括 Dot3、LLC，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
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
no mpls-vpls v1 bpdu-forward
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
no mpls-vpls v1 bpdu-forward
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.2 用例 0020：支持raw模式vpls配置bpdu ac

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac/0020-MPLS-BPDU_AC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTB |
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
interface <PortA>
no switchport
label-switching
ip address 11.11.9.1/24
enable-ldp
exit
interface <PortD>
mpls-vpls v1 bpdu-forward
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
interface <PortA>
no switchport
label-switching
ip address 11.11.9.2/24
enable-ldp
exit
interface <PortD>
mpls-vpls v1 bpdu-forward
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
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Dot3、LLC，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
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

- 在 `RenixPort.B` 校验报文，报文层包括 Dot3、LLC，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
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
no mpls-vpls v1 bpdu-forward
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
no mpls-vpls v1 bpdu-forward
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.3 用例 0030：支持vpls bpdu ac和bundling ac同时使用

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac/0030-MPLS-BPDU_AC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTB |
| 5 | 等待就绪 | DUTB |
| 6 | 抓包 / 停流 | RenixPort.B |
| 7 | 流量发送 | RenixPort.A |
| 8 | 流量校验 | RenixPort.B |
| 9 | 抓包 / 停流 | RenixPort.B |
| 10 | 流量发送 | RenixPort.A |
| 11 | 流量校验 | RenixPort.B |
| 12 | 清理 | DUTA |
| 13 | 清理 | DUTB |

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
mpls-vpls v1 bpdu-forward
mpls-vpls v1 vlan 2 bundling
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
mpls-vpls v1 bpdu-forward
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
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 60 秒。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Dot3、LLC，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
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

- 在 `RenixPort.B` 校验报文，报文层包括 Dot3、LLC，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
    port: RenixPort.B,
  })
```

</details>

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

**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
disable-ldp
exit
interface <PortD>
no mpls-vpls v1 bpdu-forward
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
interface <PortA>
switchport
disable-ldp
exit
interface <PortD>
no mpls-vpls v1 bpdu-forward
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

### 4.4 用例 0040：支持vpls bpdu ac和ethernet ac同时使用

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac/0040-MPLS-BPDU_AC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTB |
| 5 | 等待就绪 | DUTB |
| 6 | 抓包 / 停流 | RenixPort.B |
| 7 | 流量发送 | RenixPort.A |
| 8 | 流量校验 | RenixPort.B |
| 9 | 抓包 / 停流 | RenixPort.B |
| 10 | 流量发送 | RenixPort.A |
| 11 | 流量校验 | RenixPort.B |
| 12 | 清理 | DUTA |
| 13 | 清理 | DUTB |

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
mpls-vpls v1 bpdu-forward
mpls-vpls v1 ethernet
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
mpls-vpls v1 ethernet
mpls-vpls v1 bpdu-forward
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
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 60 秒。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Dot3、LLC，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
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

- 在 `RenixPort.B` 校验报文，报文层包括 Dot3、LLC，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
    port: RenixPort.B,
  })
```

</details>

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

**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
disable-ldp
exit
interface <PortD>
no mpls-vpls v1 bpdu-forward
no mpls-vpls v1
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
no mpls-vpls v1 bpdu-forward
no mpls-vpls v1
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.5 用例 0050：支持tagged模式vpws配置bpdu ac

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac/0050-MPLS-BPDU_AC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTB |
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
mpls-l2-circuit t1 bpdu-forward
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
mpls l2-circuit t1 200 192.168.11.10 tagged
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
mpls-l2-circuit t1 bpdu-forward
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
mpls l2-circuit t1 200 192.168.10.10 tagged
end
```

**触发与等待**

- 固定等待 25 秒；等待依据见脚本注释。
- DUTB：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 60 秒。
- DUTB：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Dot3、LLC，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
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

- 在 `RenixPort.B` 校验报文，报文层包括 Dot3、LLC，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
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
no mpls-l2-circuit t1 bpdu-forward
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
no mpls-l2-circuit t1 bpdu-forward
exit
no interface loopback 0
no router rip
no router ldp
no mpls l2-circuit t1
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.6 用例 0060：支持raw模式vpws配置bpdu ac

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac/0060-MPLS-BPDU_AC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTB |
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
mpls-l2-circuit t1 bpdu-forward
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
mpls-l2-circuit t1 bpdu-forward
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
- DUTB：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 60 秒。
- DUTB：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Dot3、LLC，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
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

- 在 `RenixPort.B` 校验报文，报文层包括 Dot3、LLC，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
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
no mpls-l2-circuit t1 bpdu-forward
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
no mpls-l2-circuit t1 bpdu-forward
exit
no interface loopback 0
no router rip
no router ldp
no mpls l2-circuit t1
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.7 用例 0070：支持不指定targeted-peer模式的vpws配置bpdu ac

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac/0070-MPLS-BPDU_AC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 固定等待 | — |
| 4 | 等待就绪 | DUTB |
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
mpls-l2-circuit t1 bpdu-forward
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
mpls l2-circuit t1 200 192.168.11.10
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
mpls-l2-circuit t1 bpdu-forward
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
mpls l2-circuit t1 200 192.168.10.10
end
```

**触发与等待**

- 固定等待 25 秒；等待依据见脚本注释。
- DUTB：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 60 秒。
- DUTB：轮询 `show ldp session`，回显应包含 `OPERATIONAL`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Dot3、LLC，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
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

- 在 `RenixPort.B` 校验报文，报文层包括 Dot3、LLC，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
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
no mpls-l2-circuit t1 bpdu-forward
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
no mpls-l2-circuit t1 bpdu-forward
exit
no interface loopback 0
no router rip
no router ldp
no mpls l2-circuit t1
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.8 用例 0080：支持在agg接口配置bpud ac

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac/0080-MPLS-BPDU_AC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTA |
| 3 | 配置 | DUTB |
| 4 | 配置 | DUTB |
| 5 | 固定等待 | — |
| 6 | 等待就绪 | DUTB |
| 7 | 等待就绪 | DUTB |
| 8 | 抓包 / 停流 | RenixPort.B |
| 9 | 流量发送 | RenixPort.A |
| 10 | 流量校验 | RenixPort.B |
| 11 | 清理 | DUTA |
| 12 | 清理 | DUTA |
| 13 | 清理 | DUTB |
| 14 | 清理 | DUTB |

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
interface <PortB>
static-channel-group 1
exit
interface <PortD>
static-channel-group 1
exit
interface agg1
mpls-vpls v1 bpdu-forward
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

DUTA：

```text
configure terminal
no mpls parser control-word exist
hash-field mpls
vpls inner-layer2 macsa
exit
hash-value global
port-channel select mpls
end
```

DUTB：

```text
configure terminal
no mpls parser control-word exist
hash-field mpls
vpls inner-layer2 macsa
exit
hash-value global
port-channel select mpls
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
interface <PortB>
static-channel-group 1
exit
interface <PortD>
static-channel-group 1
exit
interface agg1
mpls-vpls v1 bpdu-forward
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
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Dot3、LLC、Raw，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "00:02:00:02:00:02",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 })
      .setRaw({
        payload: Buffer.from("0000000000000000000000000000000000000000000000"),
      }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
    modifier_param: [
      {
        modifier_field: ModifierField.Dot3_MAC_SRC,
        count: 10,
        mode: ModifierMode.Increment,
        start_value: "00:02:00:02:00:02",
      },
    ],
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Dot3，期望计数为 5。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    expected_count: 5,
    packet: new PacketBuilder().setDot3({
      dst: "01:80:c2:00:00:00",
    }),
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
interface <PortB>
no static-channel-group
exit
interface <PortD>
no static-channel-group
exit
no interface loopback 0
no mpls vpls v1
no router rip
no router ldp
end
```

DUTA：

```text
configure terminal
mpls parser control-word exist
hash-value global
no port-channel select
exit
no hash-field mpls
end
```

DUTB：

```text
configure terminal
mpls parser control-word exist
hash-value global
no port-channel select
exit
no hash-field mpls
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
no static-channel-group
exit
interface <PortD>
no static-channel-group
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

