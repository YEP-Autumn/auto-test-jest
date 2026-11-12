# 多条静态路由共用同一网关时，远端网络与主机路由均被安装且目的地址可达

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本的测试用例共用公共拓扑、预置条件与判定口径；各子用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0040 | 多条静态路由共用同一网关时，远端网络与主机路由均被安装且目的地址可达 | `0040-IP_ROUTE-BASIC.test.ts` | P1 / 功能 | |

## 1. 基本信息（用例）

- 用例编号：`0040`
- 用例标题：多条静态路由共用同一网关时，远端网络与主机路由均被安装且目的地址可达
- 所属特性 / 分组：`05-IP_ROUTE` / `IP单播路由配置` / `IP路由基础`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 18 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/05-IP_ROUTE/01-ip_unicast_route/01-ip_route_basic/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本文档验证的要求 |
| --- | --- | --- |
| 设备配置指导 5.1 | 5.1 | IP路由基础配置与回显 |
| 设备命令参考 6.1 | IP单播路由配置 | 命令参数、回显与删除 |
| RFC 1812 | IPv4 路由与转发 | 静态路由安装与下一跳解析 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `default` | 确认特性可用范围 |
| License / 单板 | 支持IP路由基础相关命令 | 确认功能授权与端口能力 |
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
 RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortD <=> RenixB
                   |        |--PortC <=> PortC--|        |
                   +--------+                   +--------+
```

适用用例：0040

内置拓扑：`LinkConstraint.two_devices_topo_links_type_1`。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | `<PortA>`、`<PortB>`、`<PortC>`、`<PortD>` | 被测设备端口，执行前替换为实际接口名 |
| 测试仪 | `<RenixPortA>`、`<RenixPortB>` | 流量收发端口，按测试仪实际连接配置 |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| VRF | vpn1 | 按业务实例规划 |
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

### 4.4 用例 0040：多条静态路由共用同一网关时，远端网络与主机路由均被安装且目的地址可达

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/05-IP_ROUTE/01-ip_unicast_route/01-ip_route_basic/0040-IP_ROUTE-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTB |
| 6 | 等待就绪 | DUTB |
| 7 | 等待就绪 | DUTA |
| 8 | 观测 | DUTA |
| 9 | 观测 | DUTA |
| 10 | 观测 | DUTA |
| 11 | 抓包 / 停流 | RenixPort.B |
| 12 | 流量发送 | RenixPort.A |
| 13 | 流量校验 | RenixPort.B |
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
interface <PortD>
no switchport
ip address 200.200.200.1/24
exit
ip route 10.10.12.0/24 1.1.1.2
ip route 192.168.0.2/32 1.1.1.2
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.2/24
exit
interface <PortD>
no switchport
ip address 10.10.12.1/24
exit
interface loopback0
ip address 192.168.0.2/32
exit
arp 10.10.12.100 0003.0003.0003
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortD>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortD>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show ip route`，回显应包含 `10.10.12.0/24`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 IP `10.10.12.100`，发送模式为 `STEP`，步数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:a0:0a:00:66",
        type: 0x0800,
      })
      .setIPv4({
        src: "200.200.200.100",
        dst: "10.10.12.100",
      }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  })
```

</details>

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、IPv4，目的 MAC `00:03:00:03:00:03`，目的 IP `10.10.12.100`，期望计数为 10。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:03:00:03:00:03",
        src: DeviceBRouteMac,
        type: 0x0800,
      })
      .setIPv4({
        src: "200.200.200.100",
        dst: "10.10.12.100",
      }),
    expected_count: 10,
  })
```

</details>

**观测与预期**

- DUTA：执行 `show ip route`，回显应包含以下内容：

  - `/S\s+10\.10\.12\.0/24\s+\[1/0\] via 1\.1\.1\.2/`
  - `/S\s+192\.168\.0\.2/32\s+\[1/0\] via 1\.1\.1\.2/`
- DUTA：执行 `ping 10.10.12.1`，回显应包含 ` 0% packet loss`。
- DUTA：执行 `ping 192.168.0.2`，回显应包含 ` 0% packet loss`。

**脚本注释中的预期现象**

- 流量发送验证: 远端网络路由命中的报文应从 DUTB PortD 转发到 RenixB

**清理**

DUTA：

```text
configure terminal
no ip route 10.10.12.0/24 1.1.1.2
no ip route 192.168.0.2/32 1.1.1.2
interface <PortA>
switchport
exit
interface <PortD>
switchport
end
```

DUTB：

```text
configure terminal
no interface loopback0
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no arp 10.10.12.100
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

## 5. 清理与恢复

各子用例的清理命令见第 4 节对应小节。用例执行完毕后，按设备执行以下检查，确认本文档新增对象均已删除。

```text
show running-config
show ip route
show ip bgp
show ip ospf neighbor
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

