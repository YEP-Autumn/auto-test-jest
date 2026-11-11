# 以太网 shutdown 动作测试用例合集

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本目录全部测试脚本。
> 同一目录的脚本共用公共拓扑、预置条件与判定口径；各用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | 接口配置 Sotrm Control shtudown action后, unicast level 到达限速将导致接口errdisable | `0010-ETHERNET-ACTION_SHUTDOWN.test.ts` | P1 / 功能 | |
| 0020 | 接口配置 Sotrm Control shtudown action后，multicast level 到达限速将导致接口errdisable | `0020-ETHERNET-ACTION_SHUTDOWN.test.ts` | P1 / 功能 | |
| 0030 | 接口配置 Sotrm Control shtudown action后，broadcast level 到达限速将导致接口errdisable | `0030-ETHERNET-ACTION_SHUTDOWN.test.ts` | P1 / 功能 | |
| 0040 | 接口配置 Sotrm Control shtudown action后，unicast pps 到达限速将导致接口errdisable | `0040-ETHERNET-ACTION_SHUTDOWN.test.ts` | P1 / 功能 | |
| 0050 | 接口配置 Sotrm Control shtudown action后，multicast pps到达限速将导致接口errdisable | `0050-ETHERNET-ACTION_SHUTDOWN.test.ts` | P1 / 功能 | |
| 0060 | 接口配置 Sotrm Control shtudown action后，broadcast pps到达限速将导致接口errdisable | `0060-ETHERNET-ACTION_SHUTDOWN.test.ts` | P1 / 功能 | |
| 0070 | 开启storm control action shutdown时，如果接口已经处于风暴控制状态，则直接将接口errdisable | `0070-ETHERNET-ACTION_SHUTDOWN.test.ts` | P1 / 功能 | |
| 0080 | 关闭storm control action shutdown时，恢复接口因为storm control 的errdisable | `0080-ETHERNET-ACTION_SHUTDOWN.test.ts` | P1 / 功能 | |

## 1. 基本信息（合集）

- 用例编号：`0010` ~ `0080`
- 用例标题：以太网 shutdown 动作测试用例合集
- 所属特性 / 分组：`03-ETHERNET` / `风暴控制配置` / `shutdown 动作`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 24 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/03-ETHERNET/12-storm_control/01-action_shutdown/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本合集验证的要求 |
| --- | --- | --- |
| E530 配置指导（V7.5.1） | 3.12 | shutdown 动作配置与回显 |
| E530 命令参考（V7.4.8） | 风暴控制配置 | 命令参数、回显与删除 |
| IEEE 802.3 | 以太网帧与速率控制 | 广播、组播、未知单播风暴控制 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | 支持shutdown 动作特性 | 确认特性可用范围 |
| License / 单板 | 支持shutdown 动作相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 2 个可配置接口 | 确认接口类型与数量 |
| 测试仪端口 | RenixPort.A | 确认流量收发端口可用 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

脚本注释中给出的拓扑如下。执行前按对应拓扑完成设备与测试仪连线。

### 2.1 拓扑 1

```text
                   +--------+
 RenixA <=> PortA--|  DUTA  |--PortB <=> RenixB
                   +--------+
```

适用用例：0010、0020、0030、0040、0050、0060、0070、0080。

内置拓扑：`LinkConstraint.one_device_topo_links_type_1`。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | `<PortA>` | 被测设备端口，执行前替换为实际接口名 |
| 测试仪 | `<RenixPortA>` | 流量收发端口，按测试仪实际连接配置 |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| 接口地址 / VLAN / VNI | 见第 4 节各用例配置 | 按拓扑规划 |
| 协议进程 / 实例 | 见第 4 节各用例配置 | 同一用例内保持一致 |
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

### 4.1 用例 0010：接口配置 Sotrm Control shtudown action后, unicast level 到达限速将导致接口errdisable

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/12-storm_control/01-action_shutdown/0010-ETHERNET-ACTION_SHUTDOWN.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 流量发送 | RenixPort.A |
| 4 | 观测 | DUTA |
| 5 | 流量发送 | RenixPort.A |
| 6 | 观测 | DUTA |
| 7 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
storm-control unicast level 0.01
storm-control action shutdown
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `ff:ff:ff:ff:ff:ff`，目的 IP `255.255.255.255`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "ff:ff:ff:ff:ff:ff" })
      .setIPv4({ src: "1.1.1.1", dst: "255.255.255.255" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `0.0.2`，目的 IP `2.2.2.2`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "0.0.2" })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

**观测与预期**

- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。
- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no storm-control unicast
no storm-control action
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.2 用例 0020：接口配置 Sotrm Control shtudown action后，multicast level 到达限速将导致接口errdisable

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/12-storm_control/01-action_shutdown/0020-ETHERNET-ACTION_SHUTDOWN.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 流量发送 | RenixPort.A |
| 4 | 观测 | DUTA |
| 5 | 流量发送 | RenixPort.A |
| 6 | 观测 | DUTA |
| 7 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
storm-control multicast level 0.01
storm-control action shutdown
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `0.0.2`，目的 IP `2.2.2.2`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "0.0.2" })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `01:00:5e:00:00:01`，目的 IP `224.0.0.1`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "01:00:5e:00:00:01" })
      .setIPv4({ src: "1.1.1.1", dst: "224.0.0.1" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

**观测与预期**

- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。
- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no storm-control multicast
no storm-control action
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.3 用例 0030：接口配置 Sotrm Control shtudown action后，broadcast level 到达限速将导致接口errdisable

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/12-storm_control/01-action_shutdown/0030-ETHERNET-ACTION_SHUTDOWN.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 流量发送 | RenixPort.A |
| 4 | 观测 | DUTA |
| 5 | 流量发送 | RenixPort.A |
| 6 | 观测 | DUTA |
| 7 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
storm-control broadcast level 0.01
storm-control action shutdown
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `0.0.2`，目的 IP `2.2.2.2`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "0.0.2" })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `ff:ff:ff:ff:ff:ff`，目的 IP `255.255.255.255`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "ff:ff:ff:ff:ff:ff" })
      .setIPv4({ src: "1.1.1.1", dst: "255.255.255.255" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

**观测与预期**

- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。
- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no storm-control broadcast
no storm-control action
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.4 用例 0040：接口配置 Sotrm Control shtudown action后，unicast pps 到达限速将导致接口errdisable

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/12-storm_control/01-action_shutdown/0040-ETHERNET-ACTION_SHUTDOWN.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 流量发送 | RenixPort.A |
| 4 | 观测 | DUTA |
| 5 | 流量发送 | RenixPort.A |
| 6 | 观测 | DUTA |
| 7 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
storm-control unicast pps 1
storm-control action shutdown
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `ff:ff:ff:ff:ff:ff`，目的 IP `255.255.255.255`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "ff:ff:ff:ff:ff:ff" })
      .setIPv4({ src: "1.1.1.1", dst: "255.255.255.255" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `0.0.2`，目的 IP `2.2.2.2`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "0.0.2" })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

**观测与预期**

- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。
- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no storm-control unicast
no storm-control action
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.5 用例 0050：接口配置 Sotrm Control shtudown action后，multicast pps到达限速将导致接口errdisable

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/12-storm_control/01-action_shutdown/0050-ETHERNET-ACTION_SHUTDOWN.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 流量发送 | RenixPort.A |
| 4 | 观测 | DUTA |
| 5 | 流量发送 | RenixPort.A |
| 6 | 观测 | DUTA |
| 7 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
storm-control multicast pps 1
storm-control action shutdown
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `0.0.2`，目的 IP `2.2.2.2`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "0.0.2" })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `01:00:5e:00:00:01`，目的 IP `224.0.0.1`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "01:00:5e:00:00:01" })
      .setIPv4({ src: "1.1.1.1", dst: "224.0.0.1" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

**观测与预期**

- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。
- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no storm-control multicast
no storm-control action
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.6 用例 0060：接口配置 Sotrm Control shtudown action后，broadcast pps到达限速将导致接口errdisable

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/12-storm_control/01-action_shutdown/0060-ETHERNET-ACTION_SHUTDOWN.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 流量发送 | RenixPort.A |
| 4 | 观测 | DUTA |
| 5 | 流量发送 | RenixPort.A |
| 6 | 观测 | DUTA |
| 7 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
storm-control broadcast pps 1
storm-control action shutdown
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `0.0.2`，目的 IP `2.2.2.2`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "0.0.2" })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `ff:ff:ff:ff:ff:ff`，目的 IP `255.255.255.255`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "ff:ff:ff:ff:ff:ff" })
      .setIPv4({ src: "1.1.1.1", dst: "255.255.255.255" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

**观测与预期**

- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。
- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no storm-control broadcast
no storm-control action
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.7 用例 0070：开启storm control action shutdown时，如果接口已经处于风暴控制状态，则直接将接口errdisable

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/12-storm_control/01-action_shutdown/0070-ETHERNET-ACTION_SHUTDOWN.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 流量发送 | RenixPort.A |
| 4 | 观测 | DUTA |
| 5 | 观测 | DUTA |
| 6 | 配置 | DUTA |
| 7 | 观测 | DUTA |
| 8 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
storm-control event timer interval 8000
interface <PortA>
storm-control unicast level 0.01
end
```

DUTA：

```text
configure terminal
interface <PortA>
storm-control action shutdown
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `0.0.2`，目的 IP `2.2.2.2`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "0.0.2" })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

**观测与预期**

- DUTA：执行 `show storm-control`，回显应包含 `OCCUR`。
- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。
- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。

**清理**

DUTA：

```text
configure terminal
no storm-control event timer interval
interface <PortA>
no storm-control unicast
no storm-control action
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.8 用例 0080：关闭storm control action shutdown时，恢复接口因为storm control 的errdisable

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/12-storm_control/01-action_shutdown/0080-ETHERNET-ACTION_SHUTDOWN.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 流量发送 | RenixPort.A |
| 4 | 观测 | DUTA |
| 5 | 观测 | DUTA |
| 6 | 配置 | DUTA |
| 7 | 观测 | DUTA |
| 8 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
storm-control event timer interval 8000
interface <PortA>
storm-control unicast level 0.01
storm-control action shutdown
end
```

DUTA：

```text
configure terminal
interface <PortA>
no storm-control action
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 MAC `0.0.2`，目的 IP `2.2.2.2`，发送模式为 `BURST`，步数为 1，突发计数为 1000000。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "0.0.2" })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  })
```

</details>

**观测与预期**

- DUTA：执行 `show storm-control`，回显应包含 `OCCUR`。
- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。
- DUTA：执行 `show interface <PortA>`，回显应包含 `Error Disabled`。

**清理**

DUTA：

```text
configure terminal
no storm-control event timer interval
interface <PortA>
no storm-control unicast
no storm-control action
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

