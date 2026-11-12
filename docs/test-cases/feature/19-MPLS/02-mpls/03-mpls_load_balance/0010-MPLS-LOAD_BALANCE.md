# 测试MPLS AC入口支持agg接口对MPLS内层src mac进行负载均衡

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本的测试用例共用公共拓扑、预置条件与判定口径；各子用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | 测试MPLS AC入口支持agg接口对MPLS内层src mac进行负载均衡 | `0010-MPLS-LOAD_BALANCE.test.ts` | P1 / 功能 | |

## 1. 基本信息（用例）

- 用例编号：`0010`
- 用例标题：测试MPLS AC入口支持agg接口对MPLS内层src mac进行负载均衡
- 所属特性 / 分组：`19-MPLS` / `MPLS配置` / `MPLS 负载分担`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 54 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/19-MPLS/02-mpls/03-mpls_load_balance/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本文档验证的要求 |
| --- | --- | --- |
| 设备配置指导 19.2 | 19.2 | MPLS 负载分担配置与回显 |
| 设备命令参考 19.2 | MPLS配置 | 命令参数、回显与删除 |
| IEEE 802.1Q-2018 | VLAN 标记、成员与转发 | VLAN、PVID、Trunk 与子接口处理 |
| RFC 3031 / RFC 5036 | MPLS 标签与 LDP | 标签分发与 LSP 建立 |
| RFC 4762 / RFC 4364 | VPLS 与 L3VPN | VPLS 转发与 L3VPN 路由 |
| IEEE 802.1AX | 链路聚合 | 成员口选择与负载分担 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `mpls` | 确认特性可用范围 |
| License / 单板 | 支持MPLS 负载分担相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 4 个可配置接口 | 确认接口类型与数量 |
| 测试仪端口 | RenixPort.A / RenixPort.B | 确认流量收发端口可用 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

脚本注释中给出的拓扑如下。执行前按对应拓扑完成设备与测试仪连线。

### 2.1 拓扑 1

```text
                   +--------+                   +--------+
 RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
                   |        |--PortC <=> PortC--|        |    |
                   +--------+                   +--------+    |
                                                              |
                                                +--------+    |
                              RenixB <=> PortD--|  DUTC  |--PortB
                                                +--------+
```

适用用例：0010

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| Router ID | 11.11.1.1 / 11.11.2.2 / 11.11.4.4 | 全局唯一 |
| 定时器 | 设备默认值 | 用例另有说明时以用例配置为准 |
| MTU | 1500 | 邻居建立前确认一致 |
| 收敛等待 | 优先使用就绪检查 | 固定等待见各子用例 |

### 3.2 初始状态

- 设备接口处于默认二层或三层状态；本文档涉及的 VLAN、VRF、协议进程、静态路由、隧道、ACL、QoS 对象均为空。
- 测试仪端口已连接并可用，收发端口与脚本中的 `RenixPort` 对应。
- 设备已具备 console、telnet 或 ssh 登录方式，可进入全局配置模式。
- 脚本中标记为 `test.skip` 的用例不执行；其设计内容保留在第 4 节。
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

### 4.1 用例 0010：测试MPLS AC入口支持agg接口对MPLS内层src mac进行负载均衡

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/03-mpls_load_balance/0010-MPLS-LOAD_BALANCE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTA |
| 3 | 配置 | DUTA |
| 4 | 配置 | DUTB |
| 5 | 配置 | DUTC |
| 6 | 固定等待 | — |
| 7 | 等待就绪 | DUTB |
| 8 | 等待就绪 | DUTB |
| 9 | 等待就绪 | DUTA |
| 10 | 等待就绪 | DUTC |
| 11 | 流量发送 | RenixPort.A |
| 12 | 自定义校验 | DUTA |
| 13 | 清理 | DUTA |
| 14 | 清理 | DUTA |
| 15 | 清理 | DUTB |
| 16 | 清理 | DUTC |

**配置**

DUTA：

```text
clear counters
```

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
interface agg1
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

DUTA：

```text
configure terminal
hash-field mpls
l2 macsa
ip disable
exit
hash-value global
port-channel select mpls
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
static-channel-group 1
exit
interface <PortC>
no switchport
static-channel-group 1
exit
interface agg1
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

- 固定等待 30 秒；等待依据见脚本注释。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 60 秒。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.4.4.*?OPERATIONAL/`；超时 30 秒。
- DUTA：轮询 `show ldp vpls`，回显应包含 `Up     ethernet`；超时 60 秒。
- DUTC：轮询 `show ldp vpls`，回显应包含 `Up     ethernet`；超时 60 秒。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、VLAN、IPv4，目的 MAC `00:00:01:00:00:ee`，VLAN 2，目的 IP `2.2.2.2`，发送模式为 `STEP`，步数为 1200。

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
    modifier_param: [
      {
        modifier_field: ModifierField.EthernetII_MAC_SRC,
        count: 1200,
        mode: ModifierMode.Increment,
        start_value: "00:00:00:30:00:ee",
        step: 1,
      },
    ],
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 1200,
      },
    },
  })
```

</details>

- DUTA：执行自定义校验动作：读取端口统计中的 `Transmitted` 计数，比较成员链路的转发计数以确认负载分担。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
async (dut) => {
    try {
      let portA_output = await dut.exec(`show interface ${Port.A}`);
      let portC_output = await dut.exec(`show interface ${Port.C}`);

      console.log(portA_output);
      console.log(portC_output);

      // Parse transmitted unicast counts from Port A and Port C outputs
      const matchA = portA_output.match(/Transmitted\s+(\d+)\s+unicast/i);
      const matchC = portC_output.match(/Transmitted\s+(\d+)\s+unicast/i);
      if (!matchA || !matchC) {
        return false;
      }
      const unicastA = parseInt(matchA[1], 10);
      const unicastC = parseInt(matchC[1], 10);
      return unicastA > 500 && unicastC > 500;
    } catch (err) {
      console.error("ExecCustomDutA error:", err);
      return false;
    }
  }
```

</details>

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no static-channel-group
switchport
exit
interface <PortC>
no static-channel-group
switchport
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

DUTA：

```text
configure terminal
hash-value global
no port-channel select
exit
no hash-field mpls
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
no static-channel-group
switchport
exit
interface <PortC>
no static-channel-group
switchport
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
| 2 | 脚本跳过项 | 0170、0180 在脚本中标记为 `test.skip`，当前不执行 |
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

