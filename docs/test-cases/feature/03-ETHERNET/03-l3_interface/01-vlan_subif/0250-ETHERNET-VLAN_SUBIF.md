# 支持在VLAN子接口上配置IPv6 PBR

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本的测试用例共用公共拓扑、预置条件与判定口径；各子用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0250 | 支持在VLAN子接口上配置IPv6 PBR | `0250-ETHERNET-VLAN_SUBIF.test.ts` | P1 / 功能 | |

## 1. 基本信息（用例）

- 用例编号：`0250`
- 用例标题：支持在VLAN子接口上配置IPv6 PBR
- 所属特性 / 分组：`03-ETHERNET` / `三层接口配置` / `VLAN子接口`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 78 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/03-ETHERNET/03-l3_interface/01-vlan_subif/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本文档验证的要求 |
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

### 2.2 拓扑 2

```text
                   +--------+
 RenixA <=> PortA--|  DUTA  |--PortB <=> RenixB
                   +--------+
```

适用用例：0250

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| BGP AS | 100 / 1 | 以各子用例配置为准 |
| BGP 邻居 AS | 100 / 1 | 与对端一致 |
| Router ID | 1.1.1.1 / 1.1.1.2 / 2.2.2.2 / 11.11.1.1 | 全局唯一 |
| OSPF Area | 0 | 按拓扑规划 |
| VRF | test / vpn1 | 按业务实例规划 |
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
| 0250 | | | |

