# mpls ac支持配置vlan range + cvid

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本的测试用例共用公共拓扑、预置条件与判定口径；各子用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0070 | mpls ac支持配置vlan range + cvid | `0070-MPLS-AC_VLAN_RANGE.test.ts` | P1 / 功能 | |

## 1. 基本信息（用例）

- 用例编号：`0070`
- 用例标题：mpls ac支持配置vlan range + cvid
- 所属特性 / 分组：`19-MPLS` / `MPLS配置` / `AC VLAN 范围`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 23 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本文档验证的要求 |
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

适用用例：0070

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| Router ID | 11.11.1.1 / 11.11.2.2 / 11.11.4.4 | 全局唯一 |
| VLAN | 2-500 | 按拓扑规划 |
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
| 0070 | | | |

