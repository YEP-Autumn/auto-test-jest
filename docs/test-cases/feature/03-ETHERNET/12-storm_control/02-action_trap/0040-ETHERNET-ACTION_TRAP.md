# 接口配置 Sotrm Control trap action后，multicast level 限速恢复后将触发SNMP Storm Control Falling Trap

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本的测试用例共用公共拓扑、预置条件与判定口径；各子用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0040 | 接口配置 Sotrm Control trap action后，multicast level 限速恢复后将触发SNMP Storm Control Falling Trap | `0040-ETHERNET-ACTION_TRAP.test.ts` | P1 / 功能 | |

## 1. 基本信息（用例）

- 用例编号：`0040`
- 用例标题：接口配置 Sotrm Control trap action后，multicast level 限速恢复后将触发SNMP Storm Control Falling Trap
- 所属特性 / 分组：`03-ETHERNET` / `风暴控制配置` / `trap 动作`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 36 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/03-ETHERNET/12-storm_control/02-action_trap/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本文档验证的要求 |
| --- | --- | --- |
| E530 配置指导（V7.5.1） | 3.12 | trap 动作配置与回显 |
| E530 命令参考（V7.4.8） | 风暴控制配置 | 命令参数、回显与删除 |
| IEEE 802.3 | 以太网帧与速率控制 | 广播、组播、未知单播风暴控制 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | 支持trap 动作特性 | 确认特性可用范围 |
| License / 单板 | 支持trap 动作相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 2 个可配置接口 | 确认接口类型与数量 |
| 测试仪端口 | RenixPort.A / RenixPort.B | 确认流量收发端口可用 |
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

适用用例：0040

内置拓扑：`LinkConstraint.one_device_topo_links_type_1`。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | `<PortA>`、`<PortB>` | 被测设备端口，执行前替换为实际接口名 |
| 测试仪 | `<RenixPortA>`、`<RenixPortB>` | 流量收发端口，按测试仪实际连接配置 |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| 接口地址 / VLAN / VNI | 见第 4 节各子用例配置 | 按拓扑规划 |
| 协议进程 / 实例 | 见第 4 节各子用例配置 | 同一用例内保持一致 |
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

### 4.4 用例 0040：接口配置 Sotrm Control trap action后，multicast level 限速恢复后将触发SNMP Storm Control Falling Trap

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/03-ETHERNET/12-storm_control/02-action_trap/0040-ETHERNET-ACTION_TRAP.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 等待就绪 | DUTA |
| 3 | 等待就绪 | DUTA |
| 4 | 流量发送 | RenixPort.A |
| 5 | 抓包 / 停流 | RenixPort.B |
| 6 | 固定等待 | — |
| 7 | 流量校验 | RenixPort.B |
| 8 | 流量校验 | RenixPort.B |
| 9 | 流量校验 | RenixPort.B |
| 10 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
snmp-server enable
snmp-server community public read-only
snmp-server usm-user admin authentication md5 admin123
snmp-server notify notif1 tag trap1 trap
snmp-server target-address targ1 param parm1 1.1.1.2 taglist trap1
snmp-server target-params parm1 user admin security-model v3 message-processing v3 auth
snmp-server trap target-address 1.1.1.2 community public
storm-control event timer interval 2000
interface <PortA>
storm-control multicast level 0.01
storm-control action trap
exit
interface <PortB>
no switchport
ip address 1.1.1.1/24
quit
arp 1.1.1.2 1.1.12
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortB>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
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

- 在 `RenixPort.B` 启动抓包。
- 固定等待 5 秒；等待依据见脚本注释。
- 在 `RenixPort.B` 校验报文，报文层包括 SNMP，SNMP 版本为 0，OID 包括 `1.3.6.1.4.1.64197.5.1.4`，期望计数为 1。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder().setSNMP({
      version: 0,
      varbinds: [{ oid: "1.3.6.1.4.1.64197.5.1.4" }],
    }),
    expected_count: 1,
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 SNMP，SNMP 版本为 1，OID 包括 `1.3.6.1.2.1.1.3.0`、`1.3.6.1.6.3.1.1.4.1.0`，期望计数为 1。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder().setSNMP({
      version: 1,
      varbinds: [
        { oid: "1.3.6.1.2.1.1.3.0" },
        {
          oid: "1.3.6.1.6.3.1.1.4.1.0",
          value: "1.3.6.1.4.1.64197.5.2.2",
        },
      ],
    }),
    expected_count: 1,
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 SNMP，SNMP 版本为 3，OID 包括 `1.3.6.1.2.1.1.3.0`、`1.3.6.1.6.3.1.1.4.1.0`，期望计数为 1。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder().setSNMP({
      version: 3,
      varbinds: [
        { oid: "1.3.6.1.2.1.1.3.0" },
        {
          oid: "1.3.6.1.6.3.1.1.4.1.0",
          value: "1.3.6.1.4.1.64197.5.2.2",
        },
      ],
    }),
    expected_count: 1,
  })
```

</details>

**清理**

DUTA：

```text
configure terminal
no storm-control event timer interval
no snmp-server enable
no snmp-server community public
no snmp-server usm-user admin
no snmp-server notify notif1
no snmp-server trap target-address 1.1.1.2 community public
no snmp-server target-params parm1
no snmp-server target-address targ1
no arp 1.1.1.2
interface <PortA>
no storm-control multicast
no storm-control action
exit
interface <PortB>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

## 5. 清理与恢复

各子用例的清理命令见第 4 节对应小节。用例执行完毕后，按设备执行以下检查，确认本文档新增对象均已删除。

```text
show running-config
show interface
show vlan
show mac address-table
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
| 0040 | | | |

