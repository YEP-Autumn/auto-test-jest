# 安全性 访问控制列表配置测试用例合集

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本目录全部测试脚本。
> 同一目录的脚本共用公共拓扑、预置条件与判定口径；各用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | IPv4 ACL（普通）满参数 rule 组合 | `0010-SECURITY-IPV4_ACL.test.ts` | P1 / CLI | |
| 0020 | IPv4 ACL basic 满参数 rule 组合 | `0020-SECURITY-IPV4_ACL_BASIC.test.ts` | P1 / CLI | |
| 0040 | MAC ACL 满参数 rule 组合 | `0040-SECURITY-MAC_ACL.test.ts` | P1 / CLI | |
| 0050 | MAC ACL basic 满参数 rule 组合 | `0050-SECURITY-MAC_ACL_BASIC.test.ts` | P1 / CLI | |
| 0060 | MPLS ACL 满参数 rule 组合 | `0060-SECURITY-MPLS_ACL.test.ts` | P1 / CLI | |
| 0070 | MPLS ACL extend 满参数 rule 组合 | `0070-SECURITY-MPLS_ACL_EXTEND.test.ts` | P1 / CLI | |
| 0080 | ARP ACL 满参数 rule 组合 | `0080-SECURITY-ARP_ACL.test.ts` | P1 / CLI | |
| 0090 | control-plane ACL 满参数 exception 组合 | `0090-SECURITY-CONTROL_PLANE_ACL.test.ts` | P1 / CLI | |
| 0100 | user-define（UDF）ACL 满参数 rule 组合 | `0100-SECURITY-UDF_ACL.test.ts` | P1 / CLI | |
| 0110.1 | 含 log 的 ACL 规则可配置并能在 show running-config 显示 | `0110-SECURITY-ACL_LOG.test.ts` | P1 / CLI | |
| 0110.2 | 反复创建并删除含 log 规则的 ACL 不应耗尽 log 表项（当前固件会泄漏） | `0110-SECURITY-ACL_LOG.test.ts` | P1 / CLI | |

## 1. 基本信息（合集）

- 用例编号：`0010` ~ `0110`
- 用例标题：安全性 访问控制列表配置测试用例合集
- 所属特性 / 分组：`07-SECURITY` / `访问控制列表配置`
- 级别 / 类型：P1 / CLI
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 22 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/07-SECURITY/04-access_control_list_cli/`；设计模板见 [test-case-template.md](../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本合集验证的要求 |
| --- | --- | --- |
| E530 配置指导（V7.5.1） | 7.4 | 访问控制列表配置与回显 |
| E530 命令参考（V7.4.8） | 访问控制列表配置 | 命令参数、回显与删除 |
| IEEE 802.1Q-2018 | VLAN 标记、成员与转发 | VLAN、PVID、Trunk 与子接口处理 |
| RFC 3031 / RFC 5036 | MPLS 标签与 LDP | 标签分发与 LSP 建立 |
| RFC 4762 / RFC 4364 | VPLS 与 L3VPN | VPLS 转发与 L3VPN 路由 |
| RFC 826 | ARP 请求与应答 | ARP 学习与代理 |
| E530 命令参考（V7.4.8） | ACL 命令 | ACL 规则、动作与回显 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | 支持访问控制列表配置特性 | 确认特性可用范围 |
| License / 单板 | 支持访问控制列表配置相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 2 个可配置接口 | 确认接口类型与数量 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

本合集未使用设备端口占位符与测试仪端口；按脚本中的设备登录信息执行。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | 无 | 脚本未使用设备端口占位符 |

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
- 设备已具备 console、telnet 或 ssh 登录方式，可进入全局配置模式。
- 脚本中标记为 `test.failing` 的用例用于固化已知缺陷，按第 6 节说明判定。
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

### 4.1 用例 0010：IPv4 ACL（普通）满参数 rule 组合

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/07-SECURITY/04-access_control_list_cli/0010-SECURITY-IPV4_ACL.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 观测 | DUTA |
| 3 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
end
configure terminal
ip access-list TC_IP_PLAIN
10 deny tcp any any
20 permit tcp host 10.1.1.1 src-port range 1024 2048 10.2.2.0 0.0.0.255 dst-port eq 80 established ip-precedence 5 ecn 1 non-fragment routed-packet options packet-length range 64 1500 time-range TC_TR_MAX
30 permit tcp 10.0.0.0 0.0.0.255 src-port gt 1024 any dst-port lt 1024 match-all ack syn dscp 10 ecn 2 first-fragment routed-packet options packet-length eq 500 time-range TC_TR_MAX
40 permit tcp 10.3.0.0 0.0.0.255 src-port eq 53 any dst-port range 1024 2048 ip-precedence 7 small-fragment
50 deny udp 192.168.0.0 0.0.255.255 src-port range 1 100 any dst-port range 1 65535 ip-precedence 7 small-fragment
60 permit udp any src-port eq 53 any dst-port range 53 53 dscp 12 ecn 3 non-or-first-fragment options packet-length gt 100 time-range TC_TR_MAX
70 permit icmp any any icmp-type 8 icmp-code 0 ip-precedence 5 ecn 1 non-first-fragment time-range TC_TR_MAX
80 deny icmp 10.1.1.0 0.0.0.255 any icmp-type 3 ip-precedence 3 options
90 permit igmp any any host-query ip-precedence 5 ecn 0 options packet-length lt 100 time-range TC_TR_MAX
100 deny igmp 10.2.0.0 0.0.0.255 any ip-precedence 4 ecn 1
110 permit gre any any key 1 mask 0xffff ip-precedence 5 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX
120 deny nvgre any any vsid 100 mask 0xffffff ip-precedence 5 ecn 2 routed-packet
130 permit 50 any any dscp 20 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX
140 deny 89 10.0.0.0 0.0.0.255 10.1.0.0 0.0.255.255 ip-precedence 5 ecn 1
150 permit any 10.0.0.0 0.0.0.255 any ip-precedence 5 ecn 0 non-fragment routed-packet options time-range TC_TR_MAX
160 deny any 10.5.0.0 0.0.0.255 any dscp 63 ecn 3 first-fragment routed-packet options
end
```

**观测与预期**

- DUTA：执行 `show running-config`，回显应包含以下内容：

  - `ip access-list TC_IP_PLAIN`
  - `20 permit tcp host 10.1.1.1 src-port range 1024 2048 10.2.2.0 0.0.0.255 dst-port eq 80 established ip-precedence 5 ecn 1 non-fragment routed-packet options packet-length range 64 1500 time-range TC_TR_MAX`
  - `30 permit tcp 10.0.0.0 0.0.0.255 src-port gt 1024 any dst-port lt 1024 match-all ack syn dscp 10 ecn 2 first-fragment routed-packet options packet-length eq 500 time-range TC_TR_MAX`
  - `60 permit udp any src-port eq 53 any dst-port range 53 53 dscp 12 ecn 3 non-or-first-fragment options packet-length gt 100 time-range TC_TR_MAX`
  - `90 permit igmp any any host-query ip-precedence 5 ecn 0 options packet-length lt 100 time-range TC_TR_MAX`
  - `110 permit gre any any key 1 mask 0x0000ffff ip-precedence 5 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX`
  - `10 deny tcp any any`
  - `40 permit tcp 10.3.0.0 0.0.0.255 src-port eq 53 any dst-port range 1024 2048 ip-precedence 7 small-fragment`
  - `50 deny udp 192.168.0.0 0.0.255.255 src-port range 1 100 any dst-port range 1 65535 ip-precedence 7 small-fragment`
  - `70 permit icmp any any icmp-type 8 icmp-code 0 ip-precedence 5 ecn 1 non-first-fragment time-range TC_TR_MAX`
  - `80 deny icmp 10.1.1.0 0.0.0.255 any icmp-type 3 ip-precedence 3 options`
  - `100 deny igmp 10.2.0.0 0.0.0.255 any ip-precedence 4 ecn 1`
  - `120 deny nvgre any any vsid 100 mask 0xffffff ip-precedence 5 ecn 2 routed-packet`
  - `130 permit 50 any any dscp 20 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX`
  - `140 deny 89 10.0.0.0 0.0.0.255 10.1.0.0 0.0.255.255 ip-precedence 5 ecn 1`
  - `150 permit any 10.0.0.0 0.0.0.255 any ip-precedence 5 ecn 0 non-fragment routed-packet options time-range TC_TR_MAX`
  - `160 deny any 10.5.0.0 0.0.0.255 any dscp 63 ecn 3 first-fragment routed-packet options`

**清理**

DUTA：

```text
configure terminal
no ip access-list TC_IP_PLAIN
no time-range TC_TR_MAX
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.2 用例 0020：IPv4 ACL basic 满参数 rule 组合

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/07-SECURITY/04-access_control_list_cli/0020-SECURITY-IPV4_ACL_BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 观测 | DUTA |
| 3 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
end
configure terminal
ip access-list TC_IP_BASIC basic
1 permit tcp any src-port eq 1024 any dst-port eq 80 dscp 10 ecn 1 time-range TC_TR_MAX
2 permit udp host 10.1.1.1 src-port eq 53 host 10.2.2.2 dst-port eq 53 dscp 5 ecn 2 time-range TC_TR_MAX
3 permit any 10.0.0.0 0.0.0.255 any dscp 10 ecn 1 time-range TC_TR_MAX
4 deny tcp 10.0.0.0 0.0.0.255 src-port eq 80 any dst-port eq 80 dscp 3 ecn 3
5 deny udp 10.9.0.0 0.0.0.255 src-port eq 80 any dst-port eq 80 dscp 1 ecn 0
end
```

**观测与预期**

- DUTA：执行 `show running-config`，回显应包含以下内容：

  - `ip access-list TC_IP_BASIC basic`
  - `1 permit tcp any src-port eq 1024 any dst-port eq 80 dscp 10 ecn 1 time-range TC_TR_MAX`
  - `2 permit udp host 10.1.1.1 src-port eq 53 host 10.2.2.2 dst-port eq 53 dscp 5 ecn 2 time-range TC_TR_MAX`
  - `5 deny udp 10.9.0.0 0.0.0.255 src-port eq 80 any dst-port eq 80 dscp 1 ecn 0`
  - `3 permit any 10.0.0.0 0.0.0.255 any dscp 10 ecn 1 time-range TC_TR_MAX`
  - `4 deny tcp 10.0.0.0 0.0.0.255 src-port eq 80 any dst-port eq 80 dscp 3 ecn 3`

**清理**

DUTA：

```text
configure terminal
no ip access-list TC_IP_BASIC basic
no time-range TC_TR_MAX
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.3 用例 0040：MAC ACL 满参数 rule 组合

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/07-SECURITY/04-access_control_list_cli/0040-SECURITY-MAC_ACL.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 观测 | DUTA |
| 3 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
end
configure terminal
mac access-list TC_MAC
10 permit src-mac host 0011.2233.4455 dest-mac 0011.2233.4466 0000.0000.ffff vlan 100 cos 5 inner-vlan 200 inner-cos 6 protocol arp arp-op-code 1 time-range TC_TR_MAX
20 deny src-mac 0011.2233.4455 0000.0000.ffff dest-mac any vlan 100 cos 5 inner-vlan 200 inner-cos 6 protocol rarp time-range TC_TR_MAX
30 permit src-mac any dest-mac any untag-vlan protocol arp time-range TC_TR_MAX
40 permit src-mac any dest-mac any vlan 100 cos 5 inner-vlan 200 inner-cos 6
50 deny src-mac any dest-mac any vlan 200 cos 2
60 permit src-mac any inner-vlan 200 inner-cos 6
70 deny src-mac any
end
```

**观测与预期**

- DUTA：执行 `show running-config`，回显应包含以下内容：

  - `mac access-list TC_MAC`
  - `10 permit src-mac host 0011.2233.4455 dest-mac 0011.2233.0000 0000.0000.ffff vlan 100 cos 5 inner-vlan 200 inner-cos 6 protocol arp arp-op-code 1 time-range TC_TR_MAX`
  - `30 permit src-mac any dest-mac any untag-vlan protocol arp time-range TC_TR_MAX`
  - `50 deny src-mac any dest-mac any vlan 200 cos 2`
  - `20 deny src-mac 0011.2233.0000 0000.0000.ffff dest-mac any vlan 100 cos 5 inner-vlan 200 inner-cos 6 protocol rarp time-range TC_TR_MAX`
  - `40 permit src-mac any dest-mac any vlan 100 cos 5 inner-vlan 200 inner-cos 6`
  - `60 permit src-mac any dest-mac any inner-vlan 200 inner-cos 6`
  - `70 deny src-mac any dest-mac any`

**清理**

DUTA：

```text
configure terminal
no mac access-list TC_MAC
no time-range TC_TR_MAX
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.4 用例 0050：MAC ACL basic 满参数 rule 组合

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/07-SECURITY/04-access_control_list_cli/0050-SECURITY-MAC_ACL_BASIC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 观测 | DUTA |
| 3 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
end
configure terminal
mac access-list TC_MAC_BASIC basic
1 permit src-mac host 0011.2233.4455 dest-mac 0011.2233.4466 0000.0000.ffff vlan 100 cos 5 protocol arp time-range TC_TR_MAX
2 deny src-mac any dest-mac any untag-vlan protocol rarp time-range TC_TR_MAX
3 permit src-mac any dest-mac any protocol arp time-range TC_TR_MAX
4 deny src-mac any dest-mac any vlan 10 cos 3 time-range TC_TR_MAX
end
```

**观测与预期**

- DUTA：执行 `show running-config`，回显应包含以下内容：

  - `mac access-list TC_MAC_BASIC basic`
  - `1 permit src-mac host 0011.2233.4455 dest-mac 0011.2233.0000 0000.0000.ffff vlan 100 cos 5 protocol arp time-range TC_TR_MAX`
  - `2 deny src-mac any dest-mac any untag-vlan protocol rarp time-range TC_TR_MAX`
  - `4 deny src-mac any dest-mac any vlan 10 cos 3 time-range TC_TR_MAX`
  - `3 permit src-mac any dest-mac any protocol arp time-range TC_TR_MAX`

**清理**

DUTA：

```text
configure terminal
no mac access-list TC_MAC_BASIC basic
no time-range TC_TR_MAX
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.5 用例 0060：MPLS ACL 满参数 rule 组合

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/07-SECURITY/04-access_control_list_cli/0060-SECURITY-MPLS_ACL.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 观测 | DUTA |
| 3 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
end
configure terminal
mpls access-list TC_MPLS
10 permit topmost-label 100 exp 5 ttl 10 next-label 200 exp 3 ttl 8 next-label 300 exp 2 ttl 4 stack-bottom time-range TC_TR_MAX
20 deny topmost-label any exp 0 ttl 255
30 permit topmost-label 500 exp 1 ttl 20
40 deny topmost-label any stack-bottom
end
```

**观测与预期**

- DUTA：执行 `show running-config`，回显应包含以下内容：

  - `mpls access-list TC_MPLS`
  - `10 permit topmost-label 100 exp 5 ttl 10 next-label 200 exp 3 ttl 8 next-label 300 exp 2 ttl 4 stack-bottom time-range TC_TR_MAX`
  - `20 deny topmost-label any exp 0 ttl 255`
  - `40 deny topmost-label any stack-bottom`
  - `30 permit topmost-label 500 exp 1 ttl 20`

**清理**

DUTA：

```text
configure terminal
no mpls access-list TC_MPLS
no time-range TC_TR_MAX
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.6 用例 0070：MPLS ACL extend 满参数 rule 组合

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/07-SECURITY/04-access_control_list_cli/0070-SECURITY-MPLS_ACL_EXTEND.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 观测 | DUTA |
| 3 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
end
configure terminal
mpls access-list TC_MPLS_EXT extend
10 permit topmost-label 100 exp 5 ttl 10 next-label 200 exp 3 ttl 8 next-label 300 exp 2 ttl 4 stack-bottom time-range TC_TR_MAX
20 permit src-mac host 0011.2233.4455 dest-mac host 0011.2233.4466 vlan 10 cos 3 inner-vlan 20 inner-cos 4 time-range TC_TR_MAX
30 deny src-mac any dest-mac any vlan 10 cos 3
end
```

**观测与预期**

- DUTA：执行 `show running-config`，回显应包含以下内容：

  - `mpls access-list TC_MPLS_EXT extend`
  - `10 permit topmost-label 100 exp 5 ttl 10 next-label 200 exp 3 ttl 8 next-label 300 exp 2 ttl 4 stack-bottom time-range TC_TR_MAX`
  - `20 permit src-mac host 0011.2233.4455 dest-mac host 0011.2233.4466 vlan 10 cos 3 inner-vlan 20 inner-cos 4 time-range TC_TR_MAX`
  - `30 deny src-mac any dest-mac any vlan 10 cos 3`

**清理**

DUTA：

```text
configure terminal
no mpls access-list TC_MPLS_EXT extend
no time-range TC_TR_MAX
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.7 用例 0080：ARP ACL 满参数 rule 组合

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/07-SECURITY/04-access_control_list_cli/0080-SECURITY-ARP_ACL.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 观测 | DUTA |
| 3 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
arp access-list TC_ARP
10 permit request ip host 192.168.1.1 mac 0011.2233.4455 0000.0000.ffff
20 deny response ip 10.0.0.0 0.0.0.255 mac any
30 permit ip any mac any
40 deny ip 10.9.0.0 0.0.0.255 mac host 0011.2233.4466
end
```

**观测与预期**

- DUTA：执行 `show running-config`，回显应包含以下内容：

  - `arp access-list TC_ARP`
  - `10 permit request ip host 192.168.1.1 mac 0011.2233.4455 0000.0000.ffff`
  - `20 deny response ip 10.0.0.0 0.0.0.255 mac any`
  - `40 deny ip 10.9.0.0 0.0.0.255 mac host 0011.2233.4466`
  - `30 permit ip any mac any`

**清理**

DUTA：

```text
configure terminal
no arp access-list TC_ARP
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.8 用例 0090：control-plane ACL 满参数 exception 组合

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/07-SECURITY/04-access_control_list_cli/0090-SECURITY-CONTROL_PLANE_ACL.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 观测 | DUTA |
| 3 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
end
configure terminal
control-plane access-list TC_CP
10 permit exception any
20 deny exception ipda untag-vlan
30 permit exception ipda vlan 10 cos 3
40 permit exception ipda untag-vlan ipv4 any any any time-range TC_TR_MAX
50 permit exception ipda vlan 100 cos 5 ipv4 icmp any any icmp-type 8 icmp-code 0 time-range TC_TR_MAX
60 permit exception ipda vlan 100 cos 5 ipv4 udp any any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX
70 permit exception ipda vlan 100 cos 5 ipv4 gre any any time-range TC_TR_MAX
80 permit exception ipda untag-vlan ipv6 any any any time-range TC_TR_MAX
90 permit exception ipda untag-vlan ipv6 udp any any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX
100 permit exception tcp vlan 100 cos 5 ipv4 tcp 10.0.0.0 0.0.0.255 any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX
110 permit exception fwd-to-cpu vlan 100 cos 5 ipv4 tcp any any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX
120 permit exception slow-protocol efm time-range TC_TR_MAX
130 permit exception slow-protocol lacp time-range TC_TR_MAX
140 permit exception slow-protocol sub-type 1 time-range TC_TR_MAX
150 permit exception dhcp time-range TC_TR_MAX
160 permit exception dhcp dhcp 10.0.0.0 0.0.0.255 any client time-range TC_TR_MAX
170 permit exception dhcp dhcpv6 any any reply time-range TC_TR_MAX
180 permit exception rip time-range TC_TR_MAX
190 permit exception rip rip 10.0.0.0 0.0.0.255 any time-range TC_TR_MAX
200 permit exception rip ripng any any time-range TC_TR_MAX
210 permit exception ospf ospfv2 any any time-range TC_TR_MAX
220 permit exception ospf ospfv3 any any time-range TC_TR_MAX
230 permit exception pim pim any any time-range TC_TR_MAX
240 permit exception pim pimv6 any any time-range TC_TR_MAX
250 permit exception bgp bgp any any time-range TC_TR_MAX
260 permit exception bgp bgp4plus any any time-range TC_TR_MAX
270 permit exception vrrp vrrp any any time-range TC_TR_MAX
280 permit exception vrrp vrrp6 any any time-range TC_TR_MAX
290 permit exception arp vlan 100 cos 5 arp-op-code 1 sender-ip host 192.168.1.1 time-range TC_TR_MAX
300 permit exception arp untag-vlan garp time-range TC_TR_MAX
310 permit exception arp untag-vlan arp-reply time-range TC_TR_MAX
320 permit exception arp untag-vlan rarp-request time-range TC_TR_MAX
330 permit exception igmp vlan 100 cos 5 igmp 10.0.0.0 0.0.0.255 any host-query time-range TC_TR_MAX
340 permit exception igmp untag-vlan igmp any any igmp-type 1 time-range TC_TR_MAX
350 permit exception igmp untag-vlan mld any any mld-query time-range TC_TR_MAX
360 permit exception bpdu time-range TC_TR_MAX
370 permit exception ldp time-range TC_TR_MAX
380 permit exception ptp time-range TC_TR_MAX
390 permit exception rsvp time-range TC_TR_MAX
400 permit exception icmp-redirect time-range TC_TR_MAX
410 permit exception mcast-rpf-fail time-range TC_TR_MAX
420 permit exception macsa-mismatch time-range TC_TR_MAX
430 permit exception vlan-security-discard time-range TC_TR_MAX
440 permit exception port-security-discard time-range TC_TR_MAX
450 permit exception ip-option time-range TC_TR_MAX
460 permit exception udld time-range TC_TR_MAX
470 permit exception dot1x-mac-bypass time-range TC_TR_MAX
480 permit exception l2protocol-tunnel time-range TC_TR_MAX
end
```

**观测与预期**

- DUTA：执行 `show running-config`，回显应包含以下内容：

  - `control-plane access-list TC_CP`
  - `40 permit exception ipda untag-vlan ipv4 any any any time-range TC_TR_MAX`
  - `60 permit exception ipda vlan 100 cos 5 ipv4 udp any any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX`
  - `160 permit exception dhcp dhcp 10.0.0.0 0.0.0.255 any client time-range TC_TR_MAX`
  - `280 permit exception vrrp vrrp6 any any time-range TC_TR_MAX`
  - `480 permit exception l2protocol-tunnel time-range TC_TR_MAX`
  - `10 permit exception any`
  - `20 deny exception ipda untag-vlan`
  - `30 permit exception ipda vlan 10 cos 3`
  - `50 permit exception ipda vlan 100 cos 5 ipv4 icmp any any icmp-type 8 icmp-code 0 time-range TC_TR_MAX`
  - `70 permit exception ipda vlan 100 cos 5 ipv4 gre any any time-range TC_TR_MAX`
  - `80 permit exception ipda untag-vlan ipv6 any any any time-range TC_TR_MAX`
  - `90 permit exception ipda untag-vlan ipv6 udp any any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX`
  - `100 permit exception tcp vlan 100 cos 5 ipv4 tcp 10.0.0.0 0.0.0.255 any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX`
  - `110 permit exception fwd-to-cpu vlan 100 cos 5 ipv4 tcp any any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX`
  - `120 permit exception slow-protocol efm time-range TC_TR_MAX`
  - `130 permit exception slow-protocol lacp time-range TC_TR_MAX`
  - `140 permit exception slow-protocol sub-type 1 time-range TC_TR_MAX`
  - `150 permit exception dhcp time-range TC_TR_MAX`
  - `170 permit exception dhcp dhcpv6 any any reply time-range TC_TR_MAX`
  - `180 permit exception rip time-range TC_TR_MAX`
  - `190 permit exception rip rip 10.0.0.0 0.0.0.255 any time-range TC_TR_MAX`
  - `200 permit exception rip ripng any any time-range TC_TR_MAX`
  - `210 permit exception ospf ospfv2 any any time-range TC_TR_MAX`
  - `220 permit exception ospf ospfv3 any any time-range TC_TR_MAX`
  - `230 permit exception pim pim any any time-range TC_TR_MAX`
  - `240 permit exception pim pimv6 any any time-range TC_TR_MAX`
  - `250 permit exception bgp bgp any any time-range TC_TR_MAX`
  - `260 permit exception bgp bgp4plus any any time-range TC_TR_MAX`
  - `270 permit exception vrrp vrrp any any time-range TC_TR_MAX`
  - `290 permit exception arp vlan 100 cos 5 arp-op-code 1 sender-ip host 192.168.1.1 time-range TC_TR_MAX`
  - `300 permit exception arp untag-vlan garp time-range TC_TR_MAX`
  - `310 permit exception arp untag-vlan arp-reply time-range TC_TR_MAX`
  - `320 permit exception arp untag-vlan rarp-request time-range TC_TR_MAX`
  - `330 permit exception igmp vlan 100 cos 5 igmp 10.0.0.0 0.0.0.255 any host-query time-range TC_TR_MAX`
  - `340 permit exception igmp untag-vlan igmp any any igmp-type 1 time-range TC_TR_MAX`
  - `350 permit exception igmp untag-vlan mld any any mld-query time-range TC_TR_MAX`
  - `360 permit exception bpdu time-range TC_TR_MAX`
  - `370 permit exception ldp time-range TC_TR_MAX`
  - `380 permit exception ptp time-range TC_TR_MAX`
  - `390 permit exception rsvp time-range TC_TR_MAX`
  - `400 permit exception icmp-redirect time-range TC_TR_MAX`
  - `410 permit exception mcast-rpf-fail time-range TC_TR_MAX`
  - `420 permit exception macsa-mismatch time-range TC_TR_MAX`
  - `430 permit exception vlan-security-discard time-range TC_TR_MAX`
  - `440 permit exception port-security-discard time-range TC_TR_MAX`
  - `450 permit exception ip-option time-range TC_TR_MAX`
  - `460 permit exception udld time-range TC_TR_MAX`
  - `470 permit exception dot1x-mac-bypass time-range TC_TR_MAX`

**清理**

DUTA：

```text
configure terminal
no control-plane access-list TC_CP
no time-range TC_TR_MAX
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.9 用例 0100：user-define（UDF）ACL 满参数 rule 组合

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/07-SECURITY/04-access_control_list_cli/0100-SECURITY-UDF_ACL.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 观测 | DUTA |
| 3 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
end
configure terminal
user-define access-list TC_UDF
10 permit l2-head 0x0800 0xffff 12 time-range TC_TR_MAX
20 deny ipv4-head 0x4500 0xffff 0 time-range TC_TR_MAX
30 permit l4-head 0x0050 0xffff 0 time-range TC_TR_MAX
40 deny l2-head 0x0806 0xffff 12
50 permit l2-head 0x0800 0xffff 12 ipv4-head 0x4500 0xffff 0 time-range TC_TR_MAX
60 permit l2-head 0x0800 0xffff 12 ipv4-head 0x4500 0xffff 0 l4-head 0x0050 0xffff 0 time-range TC_TR_MAX
70 deny l2-head 0x0000 0xffff 0 ipv4-head 0x0000 0xffff 0
end
```

**观测与预期**

- DUTA：执行 `show running-config`，回显应包含以下内容：

  - `user-define access-list TC_UDF`
  - `10 permit l2-head 0x00000800 0x0000ffff 12 time-range TC_TR_MAX`
  - `50 permit l2-head 0x00000800 0x0000ffff 12 ipv4-head 0x00004500 0x0000ffff 0 time-range TC_TR_MAX`
  - `60 permit l2-head 0x00000800 0x0000ffff 12 ipv4-head 0x00004500 0x0000ffff 0 l4-head 0x00000050 0x0000ffff 0 time-range TC_TR_MAX`
  - `20 deny ipv4-head 0x00004500 0x0000ffff 0 time-range TC_TR_MAX`
  - `30 permit l4-head 0x00000050 0x0000ffff 0 time-range TC_TR_MAX`
  - `40 deny l2-head 0x00000806 0x0000ffff 12`
  - `70 deny l2-head 0x00000000 0x0000ffff 0 ipv4-head 0x00000000 0x0000ffff 0`

**清理**

DUTA：

```text
configure terminal
no user-define access-list TC_UDF
no time-range TC_TR_MAX
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.10 用例 0110.1：含 log 的 ACL 规则可配置并能在 show running-config 显示

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/07-SECURITY/04-access_control_list_cli/0110-SECURITY-ACL_LOG.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 自定义校验 | DUTA |

**触发与等待**

- DUTA：执行自定义校验动作：检查是否出现 `acl log entry is full`。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
async (dut) => {
    await dut.safeExec("end");
    await dut.safeExec("configure terminal");
    await dut.safeExec("no ip access-list ACL_LOG_FUNC");
    await dut.safeExec("ip access-list ACL_LOG_FUNC");
    const out = await dut.safeExec("10 permit tcp any any log");
    full = /acl log entry is full/i.test(out);
    await dut.safeExec("end");
    run = await dut.safeExec("show running-config");
    await dut.safeExec("configure terminal");
    await dut.safeExec("no ip access-list ACL_LOG_FUNC");
    await dut.safeExec("end");
    return true;
  }
```

</details>

**清理**

脚本未注册清理动作；执行后按第 5 节恢复初始状态。

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.11 用例 0110.2：反复创建并删除含 log 规则的 ACL 不应耗尽 log 表项（当前固件会泄漏）

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/07-SECURITY/04-access_control_list_cli/0110-SECURITY-ACL_LOG.test.ts`
- 执行状态：脚本中标记为 `test.failing`，用于固化已知缺陷

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 自定义校验 | DUTA |

**触发与等待**

- DUTA：执行自定义校验动作：检查是否出现 `acl log entry is full`。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
async (dut) => {
      for (let i = 1; i <= 140; i++) {
        const name = `ACL_LEAK_${i}`;
        await dut.safeExec("end");
        await dut.safeExec("configure terminal");
        await dut.safeExec(`ip access-list ${name}`);
        const out = await dut.safeExec("10 permit tcp any any log");
        await dut.safeExec("end");
        await dut.safeExec("configure terminal");
        await dut.safeExec(`no ip access-list ${name}`);
        await dut.safeExec("end");

        if (
          /acl log entry is full/i.test(out) ||
          /(?:^|\r?\n)\s*%\s/.test(out)
        ) {
          failedAt = i;
          console.error(
            `[ACL-LOG] 第 ${i} 次创建 log 规则失败：${out.trim().split("\n").slice(-1)[0]}`,
          );
          break;
        }
        capacity = i;
      }
      console.log(
        `[ACL-LOG] create+delete 成功次数(容量)=${capacity}，失败于第 ${failedAt} 次；` +
          `failedAt=-1 表示无泄漏。`,
      );
      return true;
    }
```

</details>

**清理**

脚本未注册清理动作；执行后按第 5 节恢复初始状态。

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

## 5. 清理与恢复

各用例的清理命令见第 4 节对应小节。合集执行完毕后，按设备执行以下检查，确认本合集新增对象均已删除。

```text
show running-config
show access-list
show time-range
```

清理顺序：业务路由 → 接口、隧道与 loopback → 协议进程 → VRF → 接口回二层。清理完成后重新执行上述命令，确认无本合集对象残留。

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 标准裁剪 | 设备支持可选特性时执行对应测试点；能力未覆盖时标记 `Blocked` 并注明原因 |
| 2 | 已知缺陷 | 0110.2 使用 `test.failing` 固化缺陷；固件修复后应改为普通 `test` |
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
| 0020 | | | |
| 0040 | | | |
| 0050 | | | |
| 0060 | | | |
| 0070 | | | |
| 0080 | | | |
| 0090 | | | |
| 0100 | | | |
| 0110.1 | | | |
| 0110.2 | | | |

