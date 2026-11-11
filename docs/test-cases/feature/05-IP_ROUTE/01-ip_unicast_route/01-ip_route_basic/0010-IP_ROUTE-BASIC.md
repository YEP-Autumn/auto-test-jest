# IP路由基础测试用例合集

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本目录全部测试脚本。
> 同一目录的脚本共用公共拓扑、预置条件与判定口径；各用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | 测试静态路由 | `0010-IP_ROUTE-BASIC.test.ts` | P1 / 功能 | |
| 0020 | 测试VRF | `0020-IP_ROUTE-BASIC.test.ts` | P1 / 功能 | |
| 0030 | 配置默认静态路由后，未匹配明细路由的流量经默认网关转发且路由表显示默认路由 | `0030-IP_ROUTE-BASIC.test.ts` | P1 / 功能 | |
| 0040 | 多条静态路由共用同一网关时，远端网络与主机路由均被安装且目的地址可达 | `0040-IP_ROUTE-BASIC.test.ts` | P1 / 功能 | |
| 0050 | 同一目的网络配置管理距离不同的静态路由时，优选管理距离较小的路由 | `0050-IP_ROUTE-BASIC.test.ts` | P1 / 功能 | |
| 0060 | 同一目的网络配置两条等价静态路由时，两个下一跳均被优选形成多路径 | `0060-IP_ROUTE-BASIC.test.ts` | P1 / 功能 | |
| 0070 | 删除静态路由后，路由表中对应条目消失且目的网络恢复不可达 | `0070-IP_ROUTE-BASIC.test.ts` | P1 / 功能 | |

## 1. 基本信息（合集）

- 用例编号：`0010` ~ `0070`
- 用例标题：IP路由基础测试用例合集
- 所属特性 / 分组：`05-IP_ROUTE` / `IP单播路由配置` / `IP路由基础`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 18 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/05-IP_ROUTE/01-ip_unicast_route/01-ip_route_basic/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本合集验证的要求 |
| --- | --- | --- |
| E530 配置指导（V7.5.1） | 5.1 | IP路由基础配置与回显 |
| E530 命令参考（V7.4.8） | IP单播路由配置 | 命令参数、回显与删除 |
| RFC 1812 | IPv4 路由与转发 | 静态路由安装与下一跳解析 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | 支持IP路由基础特性 | 确认特性可用范围 |
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

适用用例：0010、0020、0030、0040、0050、0060、0070。

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

### 4.1 用例 0010：测试静态路由

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/05-IP_ROUTE/01-ip_unicast_route/01-ip_route_basic/0010-IP_ROUTE-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTB |
| 6 | 等待就绪 | DUTB |
| 7 | 观测 | DUTA |
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
ip address 1.1.1.1/24
exit
interface <PortD>
no switchport
ip address 200.200.200.1/24
exit
ip route 2.2.2.0/24 1.1.1.2
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
ip address 2.2.2.1/24
exit
arp 2.2.2.100 0003.0003.0003
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortD>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortD>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 IP `2.2.2.100`，发送模式为 `STEP`，步数为 10。

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
        dst: "2.2.2.100",
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

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、IPv4，目的 MAC `00:03:00:03:00:03`，目的 IP `2.2.2.100`，期望计数为 10。

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
        dst: "2.2.2.100",
      }),
    expected_count: 10,
  })
```

</details>

**观测与预期**

- DUTA：执行 `ping 2.2.2.1`，回显应包含 ` 0% packet loss`。

**脚本注释中的预期现象**

- 流量发送验证: 命中静态路由的报文应从 DUTB PortD 转发到 RenixB

**清理**

DUTA：

```text
configure terminal
no ip route 2.2.2.0/24 1.1.1.2
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
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no arp 2.2.2.100
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.2 用例 0020：测试VRF

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/01-ip_unicast_route/01-ip_route_basic/0020-IP_ROUTE-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTB |
| 5 | 等待就绪 | DUTB |
| 6 | 观测 | DUTA |
| 7 | 清理 | DUTA |
| 8 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
ip vrf vpn1
exit
interface <PortA>
no switchport
ip vrf forwarding vpn1
ip address 1.1.1.1/24
exit
ip route vrf vpn1 2.2.2.0/24 1.1.1.2
end
```

DUTB：

```text
configure terminal
ip vrf vpn1
exit
interface <PortA>
no switchport
ip vrf forwarding vpn1
ip address 1.1.1.2/24
exit
interface <PortB>
no switchport
ip vrf forwarding vpn1
ip address 2.2.2.1/24
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortB>`，回显应包含 `Interface current state: UP`；超时 30 秒。
**观测与预期**

- DUTA：执行 `ping vrf vpn1 2.2.2.1`，回显应包含 ` 0% packet loss`。

**清理**

DUTA：

```text
configure terminal
no ip route vrf vpn1 2.2.2.0/24 1.1.1.2
no ip vrf vpn1
interface <PortA>
switchport
exit
end
```

DUTB：

```text
configure terminal
no ip vrf vpn1
interface <PortA>
switchport
exit
interface <PortB>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.3 用例 0030：配置默认静态路由后，未匹配明细路由的流量经默认网关转发且路由表显示默认路由

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/05-IP_ROUTE/01-ip_unicast_route/01-ip_route_basic/0030-IP_ROUTE-BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 等待就绪 | DUTA |
| 4 | 等待就绪 | DUTA |
| 5 | 等待就绪 | DUTB |
| 6 | 等待就绪 | DUTB |
| 7 | 等待就绪 | DUTB |
| 8 | 等待就绪 | DUTA |
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
ip route 0.0.0.0/0 1.1.1.2
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.2/24
exit
interface <PortB>
no switchport
ip address 2.2.2.1/24
exit
interface <PortD>
no switchport
ip address 100.100.100.1/24
exit
arp 100.100.100.100 0003.0003.0003
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortD>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortB>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortD>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show ip route`，回显应包含 `0.0.0.0/0`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 IP `100.100.100.100`，发送模式为 `STEP`，步数为 10。

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
        dst: "100.100.100.100",
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

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、IPv4，目的 MAC `00:03:00:03:00:03`，目的 IP `100.100.100.100`，期望计数为 10。

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
        dst: "100.100.100.100",
      }),
    expected_count: 10,
  })
```

</details>

**观测与预期**

- DUTA：执行 `show ip route`，回显应包含以下内容：

  - `/Gateway of last resort is 1\.1\.1\.2/`
  - `/S\*\s+0\.0\.0\.0/0\s+\[1/0\] via 1\.1\.1\.2/`
- DUTA：执行 `ping 2.2.2.1`，回显应包含 ` 0% packet loss`。

**脚本注释中的预期现象**

- 流量发送验证: 未匹配明细路由的报文经默认路由从 DUTB PortD 转发到 RenixB

**清理**

DUTA：

```text
configure terminal
no ip route 0.0.0.0/0 1.1.1.2
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
interface <PortA>
switchport
exit
interface <PortB>
switchport
exit
interface <PortD>
switchport
exit
no arp 100.100.100.100
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

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

### 4.5 用例 0050：同一目的网络配置管理距离不同的静态路由时，优选管理距离较小的路由

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/01-ip_unicast_route/01-ip_route_basic/0050-IP_ROUTE-BASIC.test.ts`

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
| 9 | 清理 | DUTA |
| 10 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.1/24
exit
interface <PortC>
no switchport
ip address 3.3.3.1/24
exit
ip route 2.2.2.0/24 1.1.1.2 10
ip route 2.2.2.0/24 3.3.3.2 20
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.2/24
exit
interface <PortC>
no switchport
ip address 3.3.3.2/24
exit
interface loopback0
ip address 2.2.2.2/32
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show ip route`，回显应匹配正则 `/S\s+2\.2\.2\.0/24\s+\[10/0\] via 1\.1\.1\.2/`；超时 30 秒。
**观测与预期**

- DUTA：执行 `ping 2.2.2.2`，回显应包含 ` 0% packet loss`。

**清理**

DUTA：

```text
configure terminal
no ip route 2.2.2.0/24 1.1.1.2 10
no ip route 2.2.2.0/24 3.3.3.2 20
interface <PortA>
switchport
exit
interface <PortC>
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
interface <PortC>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.6 用例 0060：同一目的网络配置两条等价静态路由时，两个下一跳均被优选形成多路径

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/01-ip_unicast_route/01-ip_route_basic/0060-IP_ROUTE-BASIC.test.ts`

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
| 10 | 清理 | DUTA |
| 11 | 清理 | DUTB |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.1/24
exit
interface <PortC>
no switchport
ip address 3.3.3.1/24
exit
ip route 2.2.2.0/24 1.1.1.2
ip route 2.2.2.0/24 3.3.3.2
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
ip address 1.1.1.2/24
exit
interface <PortC>
no switchport
ip address 3.3.3.2/24
exit
interface loopback0
ip address 2.2.2.2/32
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortC>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show ip route`，回显应包含 `2.2.2.0/24`；超时 30 秒。
**观测与预期**

- DUTA：执行 `show ip route`，回显应包含以下内容：

  - `via 1.1.1.2`
  - `via 3.3.3.2`
- DUTA：执行 `ping 2.2.2.2`，回显应包含 ` 0% packet loss`。

**清理**

DUTA：

```text
configure terminal
no ip route 2.2.2.0/24 1.1.1.2
no ip route 2.2.2.0/24 3.3.3.2
interface <PortA>
switchport
exit
interface <PortC>
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
interface <PortC>
switchport
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.7 用例 0070：删除静态路由后，路由表中对应条目消失且目的网络恢复不可达

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟
- 脚本：`test/feature/05-IP_ROUTE/01-ip_unicast_route/01-ip_route_basic/0070-IP_ROUTE-BASIC.test.ts`

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
| 9 | 抓包 / 停流 | RenixPort.B |
| 10 | 流量发送 | RenixPort.A |
| 11 | 流量校验 | RenixPort.B |
| 12 | 配置 | DUTA |
| 13 | 等待就绪 | DUTA |
| 14 | 固定等待 | — |
| 15 | 抓包 / 停流 | RenixPort.B |
| 16 | 流量发送 | RenixPort.A |
| 17 | 流量校验 | RenixPort.B |
| 18 | 自定义校验 | DUTA |
| 19 | 清理 | DUTB |

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
ip route 2.2.2.0/24 1.1.1.2
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
ip address 2.2.2.1/24
exit
arp 2.2.2.100 0003.0003.0003
end
```

DUTA：

```text
configure terminal
no ip route 2.2.2.0/24 1.1.1.2
end
```

**触发与等待**

- DUTA：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show interface <PortD>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortA>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTB：轮询 `show interface <PortD>`，回显应包含 `Interface current state: UP`；超时 30 秒。
- DUTA：轮询 `show ip route`，回显应匹配正则 `/S\s+2\.2\.2\.0/24\s+\[1/0\] via 1\.1\.1\.2/`；超时 30 秒。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 IP `2.2.2.100`，发送模式为 `STEP`，步数为 10。

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
        dst: "2.2.2.100",
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

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、IPv4，目的 MAC `00:03:00:03:00:03`，目的 IP `2.2.2.100`，期望计数为 10。

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
        dst: "2.2.2.100",
      }),
    expected_count: 10,
  })
```

</details>

- DUTA：轮询 `show ip route`，回显应包含 `2.2.2.0/24`；超时 30 秒。
- 固定等待 1 秒；等待依据见脚本注释。
- 在 `RenixPort.B` 启动抓包。
- 从 `RenixPort.A` 发送报文，报文层包括 Ethernet、IPv4，目的 IP `2.2.2.100`，发送模式为 `STEP`，步数为 10。

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
        dst: "2.2.2.100",
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

- 在 `RenixPort.B` 校验报文，报文层包括 Ethernet、IPv4，目的 MAC `00:03:00:03:00:03`，目的 IP `2.2.2.100`，期望计数为 0。

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
        dst: "2.2.2.100",
      }),
    expected_count: 0,
  })
```

</details>

- DUTA：执行批量配置动作，并按脚本中的断言检查配置结果。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
async (dut) => {
    await dut.safeExec("configure terminal");
    await dut.safeExec("no ip route 2.2.2.0/24 1.1.1.2");
    await dut.safeExec(`interface ${Port.A}`);
    await dut.safeExec("switchport");
    await dut.safeExec("exit");
    await dut.safeExec(`interface ${Port.D}`);
    await dut.safeExec("switchport");
    await dut.safeExec("end");
    return true;
  }
```

</details>

**观测与预期**

- DUTA：执行 `ping 2.2.2.1`，回显应包含 ` 0% packet loss`。

**脚本注释中的预期现象**

- 流量发送验证: 删除前报文应命中静态路由并从 DUTB PortD 转发到 RenixB
- 流量发送验证: 删除后报文不再命中静态路由，RenixB 不应收到报文

**清理**

DUTB：

```text
configure terminal
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no arp 2.2.2.100
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

## 5. 清理与恢复

各用例的清理命令见第 4 节对应小节。合集执行完毕后，按设备执行以下检查，确认本合集新增对象均已删除。

```text
show running-config
show ip route
show ip bgp
show ip ospf neighbor
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

