# ACL / QoS 测试用例

> 变体合集：全部用例共用一套组网（两台设备组成的堆叠系统，不打流），差异只在「下发哪套配置 + 校验哪些回显行」。
> 判定方式统一：配置在 master（slot 1）下发，进 standby（slot 2）看 `show running-config` 确认已同步。
> 覆盖对象：ACL（IPv4 / MAC / MPLS / ARP / control-plane / UDF）、time-range、class-map、policy-map、
> table-map，以及这些对象的绑定与应用。

## 0. 用例清单

| 序号 | 测试内容 | 备注 | 结果 |
| --- | --- | --- | --- |
| **IPv4 ACL** | | | |
| 0010 | IPv4 ACL 普通（plain）满参数 rule 下发与回显 | `01-access-list-ipv4-cli/0010` | |
| 0020 | IPv4 ACL basic 满参数 rule 下发与回显 | `01-access-list-ipv4-cli/0020` | |
| 0030 | IPv4 ACL extend 满参数 rule 下发与回显（含 L2 匹配字段） | `01-access-list-ipv4-cli/0030` | |
| **MAC ACL** | | | |
| 0040 | MAC ACL 满参数 rule 下发与回显 | `02-access-list-mac-cli/0010` | |
| 0050 | MAC ACL basic 满参数 rule 下发与回显 | `02-access-list-mac-cli/0020` | |
| **MPLS ACL** | | | |
| 0060 | MPLS ACL 满参数 label 栈匹配下发与回显 | `03-access-list-mpls-cli/0010` | 不支持 |
| 0070 | MPLS ACL extend 满参数（MPLS + 以太网字段）下发与回显 | `03-access-list-mpls-cli/0020` | 不支持 |
| **ARP ACL** | | | |
| 0080 | ARP ACL 满参数 rule 下发与回显 | `04-access-list-arp-cli/0010` | |
| **control-plane ACL** | | | |
| 0090 | control-plane ACL exception 全类型下发与回显 | `05-access-list-control-plane-cli/0010` | |
| **user-define ACL** | | | |
| 0100 | user-define（UDF）ACL 满参数 rule 下发与回显 | `06-access-list-user-define-cli/0010` | |
| **time-range** | | | |
| 0110 | time-range 绝对时间与周期时间范围下发与回显 | `07-time-range-cli/0010` | |
| **class-map** | | | |
| 0120 | class-map type qos 多种 match 条件下发与回显 | `08-class-map-cli/0010` | |
| 0130 | class-map type traffic-class 匹配项下发与回显 | `08-class-map-cli/0020` | |
| 0140 | class-map type control-plane 匹配项下发与回显 | `08-class-map-cli/0030` | |
| 0150 | class-map match-all 传统形式下发与回显 | `08-class-map-cli/0040` | |
| **policy-map** | | | |
| 0160 | policy-map type qos 全部标记与动作变体下发与回显 | `09-policy-map-cli/0010` | |
| 0170 | policy-map type qos policer 全参数与 aggregate-policer 下发与回显 | `09-policy-map-cli/0020` | |
| 0180 | policy-map type traffic-class 队列与调度动作下发与回显 | `09-policy-map-cli/0030` | |
| 0190 | policy-map type control-plane 动作下发与回显 | `09-policy-map-cli/0040` | |
| 0200 | table-map 映射表参数下发与回显 | `09-policy-map-cli/0050` | |
| 0210 | policy-map type performance-monitor 创建与 class 下发与回显 | `09-policy-map-cli/0060` | 不支持 |
| **应用与绑定** | | | |
| 0220 | ACL 绑定接口（input / output）下发与回显 | `10-application-cli/0010` | |
| 0230 | policy-map 绑定接口（service-policy type qos input）下发与回显 | `10-application-cli/0020` | |
| 0240 | 接口 qos policer（input / output）下发与回显 | `10-application-cli/0030` | |
| 0250 | 全局 ACL 应用（http server acl / snmp-server access-group / acl-statistics）下发与回显 | `10-application-cli/0040` | 不支持 |
| 0260 | 接口 trust 模式（dscp / cos stag-cos / cos ctag-cos / port）下发与回显 | `10-application-cli/0050` | |
| 0270 | 接口 qos shape rate（含 pir / ecn-percentage）下发与回显 | `10-application-cli/0051` | |
| 0280 | 接口 service-policy type traffic-class 下发与回显 | `10-application-cli/0052` | |
| 0290 | port-group / vlan-group 引用 ACL 下发与回显 | `10-application-cli/0060` | |
| 0300 | port-group / vlan-group 应用 service-policy 下发与回显 | `10-application-cli/0070` | |
| **组合场景** | | | |
| 0310 | IPv4 ACL + class-map + policy-map + 接口 service-policy 全链路下发与回显 | `11-combination-cli/0010` | |
| 0320 | MAC ACL 被 class-map match access-group 引用下发与回显 | `11-combination-cli/0020` | |
| 0330 | control-plane ACL + class-map + policy-map 全链路下发与回显 | `11-combination-cli/0030` | |
| 0340 | time-range 被 IPv4 ACL 与 UDF ACL 共同引用下发与回显 | `11-combination-cli/0040` | |

约定：

- 序号 4 位、步长 10，全文按分组顺序连续编号。本合集的 34 条用例分布在 11 个子目录，
  子目录内的脚本编号各自从 `0010` 起，因此**文档编号按全集顺序编**，与脚本的映射由「备注」与
  每条用例标题下一行的「脚本」给出（`备注` 列 = `<子目录>/<脚本编号>`）。
- 「结果」在设计与评审阶段留空，执行后回填 `Pass` / `Fail` / `Blocked` / `不支持`（见第 7 节）；
  设备不支持的项已预先标注 `不支持`（0060、0070、0210、0250）。

## 1. 基本信息（合集）

- 用例编号：`0010` ~ `0340`
- 用例标题：ACL / QoS 配置下发与堆叠同步校验
- 所属特性 / 分组：`misc/stack/70-acl-qos`
- 级别 / 类型：P1 / CLI
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 2~5 分钟/条
- 关联：`test/misc/stack/70-acl-qos/**`

### 1.1 标准依据

| 依据 | 条款 | 本合集验证的要求 |
| --- | --- | --- |
| XXX 配置指导（V0.0.1） | ACL / QoS 章节 | ACL、class-map、policy-map、table-map 配置 |
| XXX 命令参考（V0.0.1） | ACL / QoS 命令 | 命令参数、回显与删除 |
| 堆叠配置指导 | 配置同步 | master 配置同步到 standby |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备形态 | 两台设备组成堆叠，master = slot 1，standby = slot 2 | 确认堆叠配置同步能力 |
| 软件版本 | 支持本合集所列 ACL / QoS 命令 | 确认命令覆盖范围 |
| 接口 | `PortA` ~ `PortD` 存在 | 确认接口数量与可用性 |
| 规格 | ACL / class-map / policy-map 条目数满足用例要求 | 确认条目数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。软件版本不支持的命令，对应测试点标记「不支持」；规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑（公共）

```
                 DUTA
  +-----------------------------+
  | PortA  PortB  PortC  PortD  |
  +--+------+------+------+-----+
     |      |      |      |
  TesterA TesterB TesterC TesterD
```

- 被测设备：DUTA 实际由**两台设备组成堆叠**（master = slot 1，standby = slot 2）。
  这些脚本**省略了堆叠的组网与配置**（堆叠搭建、成员口连线、堆叠优先级等均不在用例范围内），
  起测前必须已组好堆叠并同步完成。
- 拓扑图只画堆叠系统的对外以太口；`PortA` / `PortB` / `PortC` / `PortD` 是堆叠系统的逻辑口名
  （可落在任一成员设备上），在其下发的接口配置随堆叠同步到 standby。
- 全部用例**只下发配置并校验回显**，不打流、不抓包；TesterA~TesterD 不下挂也不影响执行，
  只有在需要登录设备时才占用管理口。

## 3. 预置条件（公共）

### 3.1 公共配置与参数

| 项目 | 要求 |
| --- | --- |
| 设备登录 | 已登录 DUTA，可进入全局配置模式（`configure terminal`） |
| 配置模式 | 第 4 节各用例的配置块**均在全局配置模式下一次敲入**；块内的 `interface <x>` / `vlan database` 等进入子模式，退出子模式的命令块内已写全 |
| 堆叠环境 | DUTA = slot 1（master）+ slot 2（standby）已组堆叠并同步完成；用例用 `stack connect slot 2` 进入 standby 的 shell，再查 `show running-config` 确认 standby 已同步 master 的配置 |
| VLAN | 用到 VLAN 的用例（0290、0300）需要 `vlan 100`；未用到 VLAN 的用例不预置 |
| time-range | 用到 `time-range` 的用例（0010~0030、0040、0060、0090、0100、0340）自带 `time-range TC_TR_MAX`，不共用 |

### 3.2 初始状态

- master 与 standby 两侧 `show running-config` 均无本特性历史残留；用例之间对象名不重复（`time-range` / ACL / class-map 等重名会互相干扰）。
- `PortA`~`PortD` 存在且未被其它用例改动；用例结束后按第 5 节恢复。
- 现场保留：需要 / 默认清理；保留位置：...

## 4. 测试步骤与预期结果

所有用例的判定方式相同，因此每条用例只写「配置」+「回显差异」。观测面参考 `test-case-template.md` 附录 A；判定标准参考附录 B。通用判定如下：

| 步骤 | 设备 | 动作 / 命令 | 预期 |
| --- | --- | --- | --- |
| 1 | DUTA（master / slot 1） | 在全局配置模式下逐条下发本用例「配置」中的命令 | 每条命令都被接受，无 `% Invalid input` / `% Incomplete command` / `% Ambiguous command` 报错 |
| 2 | DUTA（master） | `stack connect slot 2` | 成功进入 standby 的 shell，无报错（该命令与第 4 步的 `exit` 不保证有成功回显，判定以「能否继续敲命令」为准） |
| 3 | DUTA（standby / slot 2） | `show running-config` | 回显包含本用例配置的每一条（即 master 的配置已同步到 standby）；有「回显差异」的按差异后的形式出现 |
| 4 | DUTA（standby） | `exit` | 退出 standby shell，回到 master |
| 5 | DUTA（master） | 按第 5 节删除本用例创建的对象 | 再查 `show running-config`，对应对象与规则消失，无残留 |

判定口径：

- **判定实质是「堆叠配置同步」**：配置只在 master 上下发，回显是在 standby（slot 2）上查的；
  master 本地的回显不单独查（脚本未做），若需双重确认可在第 1 步后补一次 master 侧 `show running-config`。
- **用「包含」判定，不用「顺序」判定**：回显中各对象的排列顺序由设备决定，不要求与下发顺序一致。
- **规范化不算失败**：掩码补零、大小写、关键字补齐等设备侧规范化由各用例的「回显差异」表列出，
  表外的行要求与下发内容逐字一致。
- 只要出现一条配置被拒绝或被静默改写（且不在「回显差异」表内），本用例判 `Fail`。

### 4.1 分组：IPv4 ACL

#### 4.1.1 用例 0010：IPv4 ACL 普通（plain）满参数 rule 下发与回显

`P1 / CLI · 约 3 分钟 · 脚本 test/misc/stack/70-acl-qos/01-access-list-ipv4-cli/0010-ACL_QOS.test.ts`

**配置**

```
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
exit
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
exit
```

**回显差异**

| 下发 | 回显 | 说明 |
| --- | --- | --- |
| `110 permit gre any any key 1 mask 0xffff …` | `110 permit gre any any key 1 mask 0x0000ffff …` | 掩码补零到 8 位十六进制 |

覆盖点：`tcp/udp/icmp/igmp/gre/nvgre/协议号 50/协议号 89/any` 九种协议形式，
`src-port/dst-port` 的 `eq/gt/lt/range`，`ip-precedence/dscp/ecn`，分片标志
（`non-fragment/first-fragment/small-fragment/non-first-fragment/non-or-first-fragment`），
`routed-packet`、`options`、`packet-length`、`established`、`match-all ack syn`、`vsid`、`key/mask`、`time-range`。

#### 4.1.2 用例 0020：IPv4 ACL basic 满参数 rule 下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/01-access-list-ipv4-cli/0020-ACL_QOS.test.ts`

**配置**

```
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
exit
ip access-list TC_IP_BASIC basic
1 permit tcp any src-port eq 1024 any dst-port eq 80 dscp 10 ecn 1 time-range TC_TR_MAX
2 permit udp host 10.1.1.1 src-port eq 53 host 10.2.2.2 dst-port eq 53 dscp 5 ecn 2 time-range TC_TR_MAX
3 permit any 10.0.0.0 0.0.0.255 any dscp 10 ecn 1 time-range TC_TR_MAX
4 deny tcp 10.0.0.0 0.0.0.255 src-port eq 80 any dst-port eq 80 dscp 3 ecn 3
5 deny udp 10.9.0.0 0.0.0.255 src-port eq 80 any dst-port eq 80 dscp 1 ecn 0
exit
```

**回显差异**：无，5 条 rule 逐字回显（序号 1~5 保留）。

#### 4.1.3 用例 0030：IPv4 ACL extend 满参数 rule 下发与回显（含 L2 匹配字段）

`P1 / CLI · 约 3 分钟 · 脚本 test/misc/stack/70-acl-qos/01-access-list-ipv4-cli/0030-ACL_QOS.test.ts`

**配置**

```
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
exit
ip access-list TC_IP_EXT extend
10 deny tcp any any
20 permit tcp host 10.1.1.1 src-port range 1024 2048 10.2.2.0 0.0.0.255 dst-port eq 80 established ip-precedence 5 ecn 1 non-fragment routed-packet options packet-length range 64 1500 time-range TC_TR_MAX
30 permit tcp 10.0.0.0 0.0.0.255 src-port gt 1024 any dst-port lt 1024 match-all ack syn dscp 10 ecn 2 first-fragment routed-packet options packet-length eq 500 time-range TC_TR_MAX
40 permit udp 10.3.0.0 0.0.0.255 src-port range 1 100 any dst-port range 1 65535 dscp 12 ecn 3 non-or-first-fragment options packet-length gt 100 time-range TC_TR_MAX
50 permit icmp any any icmp-type 8 icmp-code 0 ip-precedence 5 ecn 1 non-first-fragment time-range TC_TR_MAX
60 deny icmp 10.1.0.0 0.0.0.255 any icmp-type 3 ip-precedence 3 options
70 permit igmp any any host-query ip-precedence 5 ecn 0 options time-range TC_TR_MAX
80 deny igmp 10.2.0.0 0.0.0.255 any ip-precedence 4 ecn 1
90 permit gre any any key 1 mask 0xffff ip-precedence 5 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX
100 deny nvgre any any vsid 100 mask 0xffffff ip-precedence 5 ecn 2 routed-packet
110 permit 50 any any dscp 20 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX
120 deny 89 10.0.0.0 0.0.0.255 10.1.0.0 0.0.255.255 ip-precedence 5 ecn 1
130 permit any any any dscp 10 ecn 0 non-fragment routed-packet options time-range TC_TR_MAX
140 permit src-mac host 0011.2233.4455 dest-mac host 0011.2233.4466 vlan 10 cos 3 inner-vlan 20 inner-cos 4 arp-packet arp-op-code 1 sender-ip 1.1.1.0 0.0.0.255 target-ip any time-range TC_TR_MAX
150 deny src-mac any dest-mac any untag-vlan packet-length range 64 1500 time-range TC_TR_MAX
160 permit src-mac any vlan 10 cos 3 arp-packet sender-ip host 1.1.1.1
170 deny src-mac any vlan 30
exit
```

**回显差异**

| 下发 | 回显 | 说明 |
| --- | --- | --- |
| `90 … key 1 mask 0xffff …` | `90 … key 1 mask 0x0000ffff …` | 掩码补零 |
| `160 permit src-mac any vlan 10 …` | `160 permit src-mac any dest-mac any vlan 10 …` | 省略 `dest-mac` 时回显补默认值 `any` |
| `170 deny src-mac any vlan 30` | `170 deny src-mac any dest-mac any vlan 30` | 同上 |

覆盖点：extend 形式下 IPv4 字段与 L2 字段（`src-mac/dest-mac/vlan/cos/inner-vlan/inner-cos/untag-vlan`）
混用，`arp-packet`、`arp-op-code`、`sender-ip`、`target-ip`。

### 4.2 分组：MAC ACL

#### 4.2.1 用例 0040：MAC ACL 满参数 rule 下发与回显

`P1 / CLI · 约 3 分钟 · 脚本 test/misc/stack/70-acl-qos/02-access-list-mac-cli/0010-ACL_QOS.test.ts`

**配置**

```
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
exit
mac access-list TC_MAC
10 permit src-mac host 0011.2233.4455 dest-mac 0011.2233.4466 0000.0000.ffff vlan 100 cos 5 inner-vlan 200 inner-cos 6 protocol arp arp-op-code 1 time-range TC_TR_MAX
20 deny src-mac 0011.2233.4455 0000.0000.ffff dest-mac any vlan 100 cos 5 inner-vlan 200 inner-cos 6 protocol rarp time-range TC_TR_MAX
30 permit src-mac any dest-mac any untag-vlan protocol arp time-range TC_TR_MAX
40 permit src-mac any dest-mac any vlan 100 cos 5 inner-vlan 200 inner-cos 6
50 deny src-mac any dest-mac any vlan 200 cos 2
60 permit src-mac any inner-vlan 200 inner-cos 6
70 deny src-mac any
exit
```

**回显差异**

| 下发 | 回显 | 说明 |
| --- | --- | --- |
| `10 … dest-mac 0011.2233.4466 0000.0000.ffff …` | `10 … dest-mac 0011.2233.0000 0000.0000.ffff …` | 显式「地址 + 掩码」形式中，被掩码覆盖的字节回显为 0 |
| `20 … src-mac 0011.2233.4455 0000.0000.ffff …` | `20 … src-mac 0011.2233.0000 0000.0000.ffff …` | 同上 |
| `70 deny src-mac any` | `70 deny src-mac any dest-mac any` | 省略 `dest-mac` 时补 `any` |
| `60 permit src-mac any inner-vlan 200 inner-cos 6` | `60 permit src-mac any dest-mac any inner-vlan 200 inner-cos 6` | 同上 |

注意：`10` 号的 `src-mac host 0011.2233.4455` 回显**仍保留 `host` 形式**，与 `dest-mac` 的显式掩码写法不同。

#### 4.2.2 用例 0050：MAC ACL basic 满参数 rule 下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/02-access-list-mac-cli/0020-ACL_QOS.test.ts`

**配置**

```
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
exit
mac access-list TC_MAC_BASIC basic
1 permit src-mac host 0011.2233.4455 dest-mac 0011.2233.4466 0000.0000.ffff vlan 100 cos 5 protocol arp time-range TC_TR_MAX
2 deny src-mac any dest-mac any untag-vlan protocol rarp time-range TC_TR_MAX
3 permit src-mac any dest-mac any protocol arp time-range TC_TR_MAX
4 deny src-mac any dest-mac any vlan 10 cos 3 time-range TC_TR_MAX
exit
```

**回显差异**：`1` 号的 `src-mac host 0011.2233.4455` **保留 `host` 形式**；
`dest-mac 0011.2233.4466 0000.0000.ffff` → `dest-mac 0011.2233.0000 0000.0000.ffff`（掩码覆盖的字节回显为 0，同 0040）。
其余 3 条逐字回显。

### 4.3 分组：MPLS ACL

#### 4.3.1 用例 0060：MPLS ACL 满参数 label 栈匹配下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/03-access-list-mpls-cli/0010-ACL_QOS.test.ts`

**配置**

```
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
exit
mpls access-list TC_MPLS
10 permit topmost-label 100 exp 5 ttl 10 next-label 200 exp 3 ttl 8 next-label 300 exp 2 ttl 4 stack-bottom time-range TC_TR_MAX
20 deny topmost-label any exp 0 ttl 255
30 permit topmost-label 500 exp 1 ttl 20
40 deny topmost-label any stack-bottom
exit
```

**回显差异**：无，4 条 rule 逐字回显。

#### 4.3.2 用例 0070：MPLS ACL extend 满参数（MPLS + 以太网字段）下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/03-access-list-mpls-cli/0020-ACL_QOS.test.ts`

**配置**

```
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
exit
mpls access-list TC_MPLS_EXT extend
10 permit topmost-label 100 exp 5 ttl 10 next-label 200 exp 3 ttl 8 next-label 300 exp 2 ttl 4 stack-bottom time-range TC_TR_MAX
20 permit src-mac host 0011.2233.4455 dest-mac host 0011.2233.4466 vlan 10 cos 3 inner-vlan 20 inner-cos 4 time-range TC_TR_MAX
30 deny src-mac any dest-mac any vlan 10 cos 3
exit
```

**回显差异**：无，3 条 rule 逐字回显（`src-mac host` / `dest-mac host` 在此形式下保留 `host` 关键字）。

### 4.4 分组：ARP ACL

#### 4.4.1 用例 0080：ARP ACL 满参数 rule 下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/04-access-list-arp-cli/0010-ACL_QOS.test.ts`

**配置**

```
arp access-list TC_ARP
10 permit request ip host 192.168.1.1 mac 0011.2233.4455 0000.0000.ffff
20 deny response ip 10.0.0.0 0.0.0.255 mac any
30 permit ip any mac any
40 deny ip 10.9.0.0 0.0.0.255 mac host 0011.2233.4466
```

**回显差异**：无，4 条 rule 逐字回显（`host` 与显式掩码两种 MAC 写法都原样保留）。

### 4.5 分组：control-plane ACL

#### 4.5.1 用例 0090：control-plane ACL exception 全类型下发与回显

`P1 / CLI · 约 5 分钟 · 脚本 test/misc/stack/70-acl-qos/05-access-list-control-plane-cli/0010-ACL_QOS.test.ts`

**配置**

```
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
exit
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
exit
```

**回显差异**：无，48 条 rule 逐字回显。

覆盖点：`any / ipda / tcp / fwd-to-cpu` 四种上层分类 × `untag-vlan/vlan+cos` × `ipv4/ipv6`，
以及 30 种 exception 子类型（`slow-protocol efm/lacp/sub-type`、`dhcp/dhcpv6`、`rip/ripng`、
`ospfv2/ospfv3`、`pim/pimv6`、`bgp/bgp4plus`、`vrrp/vrrp6`、`arp/garp/arp-reply/rarp-request`、
`igmp/mld`、`bpdu`、`ldp`、`ptp`、`rsvp`、`icmp-redirect`、`mcast-rpf-fail`、`macsa-mismatch`、
`vlan-security-discard`、`port-security-discard`、`ip-option`、`udld`、`dot1x-mac-bypass`、`l2protocol-tunnel`）。

### 4.6 分组：user-define ACL

#### 4.6.1 用例 0100：user-define（UDF）ACL 满参数 rule 下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/06-access-list-user-define-cli/0010-ACL_QOS.test.ts`

**配置**

```
time-range TC_TR_MAX
periodic 08:00 daily to 18:00
exit
user-define access-list TC_UDF
10 permit l2-head 0x0800 0xffff 12 time-range TC_TR_MAX
20 deny ipv4-head 0x4500 0xffff 0 time-range TC_TR_MAX
30 permit l4-head 0x0050 0xffff 0 time-range TC_TR_MAX
40 deny l2-head 0x0806 0xffff 12
50 permit l2-head 0x0800 0xffff 12 ipv4-head 0x4500 0xffff 0 time-range TC_TR_MAX
60 permit l2-head 0x0800 0xffff 12 ipv4-head 0x4500 0xffff 0 l4-head 0x0050 0xffff 0 time-range TC_TR_MAX
70 deny l2-head 0x0000 0xffff 0 ipv4-head 0x0000 0xffff 0
exit
```

**回显差异**

| 下发 | 回显 | 说明 |
| --- | --- | --- |
| `0x0800` / `0x4500` / `0x0806` / `0x0000` | `0x00000800` / `0x00004500` / `0x00000806` / `0x00000000` | 值补零到 32 位 |
| `0xffff` | `0x0000ffff` | 掩码补零到 32 位 |
| `0x0050` | `0x00000050` | 值补零 |

覆盖点：`l2-head / ipv4-head / l4-head` 单用与三者串联，`<值> <掩码> <偏移>` 三元组。

### 4.7 分组：time-range

#### 4.7.1 用例 0110：time-range 绝对时间与周期时间范围下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/07-time-range-cli/0010-ACL_QOS.test.ts`

**配置**

```
time-range TC_TR_ABS
absolute start 00:00:00 jan 1 2024 end 23:59:59 dec 31 2030
exit
time-range TC_TR_DAILY
periodic 08:00 daily to 18:00
exit
time-range TC_TR_WEEK
periodic 08:00 monday to 18:00 friday
exit
time-range TC_TR_WEEKDAYS
periodic 09:00 weekdays to 17:00
exit
time-range TC_TR_WEEKEND
periodic 09:00 weekend to 17:00
exit
```

**回显差异**

| 下发 | 回显 | 说明 |
| --- | --- | --- |
| `absolute start 00:00:00 jan 1 2024 end 23:59:59 dec 31 2030` | `absolute start 00:00:00 Jan 01 2024 end 23:59:59 Dec 31 2030` | 月份/星期首字母大写，日补齐两位 |
| `periodic 08:00 monday to 18:00 friday` | `periodic 08:00 Mon to 18:00 Fri` | 星期缩写为 3 字母 |

覆盖点：绝对时间（`absolute start … end …`）、每日周期、跨周周期、`weekdays` / `weekend` 关键字。

### 4.8 分组：class-map

#### 4.8.1 用例 0120：class-map type qos 多种 match 条件下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/08-class-map-cli/0010-ACL_QOS.test.ts`

**配置**

```
ip access-list TC_ACL_CM
10 permit tcp any any
exit
class-map type qos TC_CM_QOS_ACL
match access-group TC_ACL_CM
exit
class-map type qos TC_CM_QOS_COS
match cos 3
exit
class-map type qos TC_CM_QOS_COS_IN
match cos inner 5
exit
class-map type qos TC_CM_QOS_DSCP
match dscp af11
exit
```

**回显差异**：无，4 个 class-map 及其 `match` 行逐字回显。

#### 4.8.2 用例 0130：class-map type traffic-class 匹配项下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/08-class-map-cli/0020-ACL_QOS.test.ts`

**配置**

```
class-map type traffic-class TC_CM_TC
match traffic-class 1
exit
class-map type traffic-class TC_CM_TCALL
match traffic-class-all 3
exit
```

**回显差异**

| 下发 | 回显 | 说明 |
| --- | --- | --- |
| `match traffic-class-all 3` | `match traffic-class 3` | `-all` 变体被规范化掉（等价语义，但关键字丢失，见第 6 节待确认项） |

#### 4.8.3 用例 0140：class-map type control-plane 匹配项下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/08-class-map-cli/0030-ACL_QOS.test.ts`

**配置**

```
control-plane access-list TC_ACL_CP2
10 permit exception any
exit
class-map type control-plane TC_CM_CP
match access-group TC_ACL_CP2
exit
```

**回显差异**：无。

#### 4.8.4 用例 0150：class-map match-all 传统形式下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/08-class-map-cli/0040-ACL_QOS.test.ts`

**配置**

```
ip access-list TC_ACL_L
10 permit tcp any any
exit
class-map match-all TC_CM_LEGACY
match access-group TC_ACL_L
exit
```

**回显差异**：无（`match-all` 保留在回显中）。

### 4.9 分组：policy-map

#### 4.9.1 用例 0160：policy-map type qos 全部标记与动作变体下发与回显

`P1 / CLI · 约 5 分钟 · 脚本 test/misc/stack/70-acl-qos/09-policy-map-cli/0010-ACL_QOS.test.ts`

**配置**

```
table-map TC_TM_C
map from 0 to 1
map from 1 2 3 4 5 6 7 to 7
default copy
exit
table-map TC_TM_D
map from 0 to 8
map from 1 2 3 4 5 6 7 to 16
default copy
exit
class-map type qos TC_Q_0
match cos 0
exit
class-map type qos TC_Q_1
match cos 1
exit
class-map type qos TC_Q_2
match cos 2
exit
class-map type qos TC_Q_3
match cos 3
exit
class-map type qos TC_Q_4
match cos 4
exit
class-map type qos TC_Q_5
match cos 5
exit
class-map type qos TC_Q_6
match cos 6
exit
class-map type qos TC_Q_7
match cos 7
exit
class-map type qos TC_Q_D1
match dscp af11
exit
class-map type qos TC_Q_D2
match dscp af12
exit
class-map type qos TC_Q_D3
match dscp af13
exit
class-map type qos TC_Q_D4
match dscp af21
exit
class-map type qos TC_Q_D5
match dscp af22
exit
class-map type qos TC_Q_D6
match dscp af23
exit
class-map type qos TC_Q_D7
match dscp af31
exit
class-map type qos TC_Q_D8
match dscp af32
exit
qos aggregate-policer TC_AGG color-blind cir 2000 cbs 20000 statistics
policy-map type qos TC_PM_QOS
class type qos TC_Q_0
set cos 5
set cos inner 5
quit
class type qos TC_Q_1
set dscp af11
quit
class type qos TC_Q_2
set cos cos table TC_TM_C
quit
class type qos TC_Q_4
set dscp dscp table TC_TM_D
quit
class type qos TC_Q_5
set dscp cos table TC_TM_C
quit
class type qos TC_Q_6
set traffic-class 2
quit
class type qos TC_Q_7
set priority 5
quit
class type qos TC_Q_D1
quit
class type qos TC_Q_D2
set color yellow
quit
class type qos TC_Q_D3
set color red
quit
class type qos TC_Q_D4
statistics enable
quit
class type qos TC_Q_D5
policer color-blind cir 1000 cbs 10000 eir 2000 ebs 20000 conform transmit set-traffic-class 1 exceed transmit violate drop statistics
quit
class type qos TC_Q_D6
policer pps color-aware cir 1000 cbs 100 eir 2000 ebs 200 conform drop exceed drop violate drop statistics
quit
class type qos TC_Q_D7
aggregate-policer TC_AGG
quit
class type qos TC_Q_D8
set traffic-class-all 4
quit
class type qos class-default
set cos 3
quit
exit
```

**回显差异**

| 下发 | 回显 | 说明 |
| --- | --- | --- |
| `set traffic-class-all 4` | `set traffic-class 4` | `-all` 变体被规范化掉 |
| `class type qos TC_Q_3` | 不回显 | `TC_Q_3` 只创建了 class-map，未进 policy-map |
| `class type qos TC_Q_D1` | 不回显 | 该 class 内只有一条动作行，且在脚本中被屏蔽（原计划的 `set exp 3` 未下发），因此只有空 class，见第 6 节 |

判定范围：policy-map 的 `set cos` / `set cos inner` / `set dscp` / `set cos cos table` /
`set dscp dscp table` / `set dscp cos table` / `set traffic-class` / `set priority` /
`set color` / `statistics enable` / `aggregate-policer` / `policer`（4 种形态）/ `class-default`。

#### 4.9.2 用例 0170：policy-map type qos policer 全参数与 aggregate-policer 下发与回显

`P1 / CLI · 约 3 分钟 · 脚本 test/misc/stack/70-acl-qos/09-policy-map-cli/0020-ACL_QOS.test.ts`

**配置**

```
qos aggregate-policer TC_AGG color-blind cir 2000 cbs 20000 statistics
class-map type qos TC_CM_AGG
match cos 2
exit
class-map type qos TC_CM_POL
match cos 4
exit
class-map type qos TC_CM_PPS
match cos 5
exit
policy-map type qos TC_PM_AGG
class type qos TC_CM_AGG
aggregate-policer TC_AGG
set traffic-class 2
quit
class type qos TC_CM_POL
policer color-aware cir 1000 cbs 10000 eir 2000 ebs 20000 conform transmit exceed drop violate drop statistics
quit
class type qos TC_CM_PPS
policer pps color-blind cir 1000 cbs 100 conform transmit set-traffic-class 3 exceed drop violate drop statistics
quit
exit
```

**回显差异**：无（`policer` 行整行回显）。

#### 4.9.3 用例 0180：policy-map type traffic-class 队列与调度动作下发与回显

`P1 / CLI · 约 3 分钟 · 脚本 test/misc/stack/70-acl-qos/09-policy-map-cli/0030-ACL_QOS.test.ts`

**配置**

```
class-map type traffic-class TC_TC_1
match traffic-class 1
exit
class-map type traffic-class TC_TC_2
match traffic-class 2
exit
class-map type traffic-class TC_TC_3
match traffic-class 3
exit
class-map type traffic-class TC_TC_4
match traffic-class 4
exit
class-map type traffic-class TC_TC_5
match traffic-class 5
exit
class-map type traffic-class TC_TC_6
match traffic-class 6
exit
class-map type traffic-class TC_TC_7
match traffic-class 7
exit
class-map type traffic-class TC_TC_8
match traffic-class-all 0
exit
policy-map type traffic-class TC_PM_TC
class type traffic-class TC_TC_1
priority level 1
quit
class type traffic-class TC_TC_2
bandwidth percentage 10
quit
class type traffic-class TC_TC_3
queue-limit 100
quit
class type traffic-class TC_TC_4
queue-limit 100 ecn-threshold 80
quit
class type traffic-class TC_TC_5
queue-limit maximum
quit
class type traffic-class TC_TC_6
queue-limit maximum ecn-threshold maximum
quit
class type traffic-class TC_TC_7
queue-limit dynamic 1
quit
class type traffic-class TC_TC_8
random-detect maximum-threshold 100
quit
exit
```

**回显差异**：无（`priority level` / `bandwidth percentage` / 4 种 `queue-limit` 形式 /
`random-detect maximum-threshold` 均整行回显）。
注意 `queue-limit 100 ecn-threshold 80` 与 `queue-limit maximum ecn-threshold maximum` 在脚本中
只校验到 `queue-limit` 前缀，`ecn-threshold` 需人工确认（见第 6 节）。

#### 4.9.4 用例 0190：policy-map type control-plane 动作下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/09-policy-map-cli/0040-ACL_QOS.test.ts`

**配置**

```
control-plane access-list TC_ACL_PMCP
10 permit exception any
exit
class-map type control-plane TC_CM_PMCP
match access-group TC_ACL_PMCP
exit
policy-map type control-plane TC_PM_CP
class type control-plane TC_CM_PMCP
policer cir 100 statistics
policer cir 100 cbs 1000 statistics
statistics enable
quit
exit
```

**回显差异**：无。注意同一 class 内连续下发两条 `policer`，回显只保留一条（**后一条覆盖前一条**），
判定以「`policer cir 100` 存在且 `statistics enable` 存在」为准。

#### 4.9.5 用例 0200：table-map 映射表参数下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/09-policy-map-cli/0050-ACL_QOS.test.ts`

**配置**

```
table-map TC_TM
map from 1 to 2
map from 3 4 5 6 7 8 to 9
map from 10 11 12 13 14 15 16 17 to 63
default copy
exit
table-map TC_TM2
map from 20 to 21
default 7
exit
table-map TC_TM3
default ignore
exit
```

**回显差异**

| 下发 | 回显 | 说明 |
| --- | --- | --- |
| `map from 3 4 5 6 7 8 to 9` | `map from 3 to 9` | 多个源值只保留第一个（见第 6 节待确认项） |

覆盖点：`map from … to …` 单源/多源、`default copy` / `default <值>` / `default ignore` 三种默认动作。

#### 4.9.6 用例 0210：policy-map type performance-monitor 创建与 class 下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/09-policy-map-cli/0060-ACL_QOS.test.ts`

**配置**

```
class-map type qos TC_PMF_C
match cos 0
exit
policy-map type performance-monitor TC_PM_PERF
class type qos TC_PMF_C
exit
```

**回显差异**：无（判定以 `policy-map type performance-monitor TC_PM_PERF` 出现即可）。

### 4.10 分组：应用与绑定

#### 4.10.1 用例 0220：ACL 绑定接口（input / output）下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/10-application-cli/0010-ACL_QOS.test.ts`

**配置**

```
ip access-list TC_ACL_IF
10 permit tcp any any
20 deny udp any any
exit
interface PortA
access-group input TC_ACL_IF
access-group output TC_ACL_IF
exit
```

**回显差异**：无（`access-group input TC_ACL_IF` 与 `access-group output TC_ACL_IF` 均出现在
`interface PortA` 段内）。

#### 4.10.2 用例 0230：policy-map 绑定接口（service-policy type qos input）下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/10-application-cli/0020-ACL_QOS.test.ts`

**配置**

```
ip access-list TC_ACL_SP
10 permit tcp any any
exit
class-map type qos TC_CM_SP
match access-group TC_ACL_SP
exit
policy-map type qos TC_PM_SP
class type qos TC_CM_SP
set dscp cs1
quit
exit
interface PortA
service-policy type qos input TC_PM_SP
exit
```

**回显差异**：无（`service-policy type qos input TC_PM_SP` 出现在 `interface PortA` 段内）。

#### 4.10.3 用例 0240：接口 qos policer（input / output）下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/10-application-cli/0030-ACL_QOS.test.ts`

**配置**

```
interface PortA
qos policer input color-blind cir 1000 cbs 10000 statistics
qos policer output color-blind cir 1000 cbs 10000 statistics
exit
```

**回显差异**：无（两条 `qos policer` 整行回显）。

#### 4.10.4 用例 0250：全局 ACL 应用（http server acl / snmp-server access-group / acl-statistics）下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/10-application-cli/0040-ACL_QOS.test.ts`

**配置**

```
ip access-list TC_ACL_G
10 permit tcp any any
exit
http server acl TC_ACL_G
snmp-server access-group TC_ACL_G in
acl-statistics exclude-drop enable
```

**回显差异**：无（三条全局命令逐字回显在全局配置段）。

#### 4.10.5 用例 0260：接口 trust 模式（dscp / cos stag-cos / cos ctag-cos / port）下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/10-application-cli/0050-ACL_QOS.test.ts`

**配置**

```
interface PortA
trust dscp
exit
interface PortB
trust cos stag-cos
exit
interface PortC
trust cos ctag-cos
exit
interface PortD
trust port
exit
```

**回显差异**：无（4 种 `trust` 形式分别回显在 4 个接口段内）。

#### 4.10.6 用例 0270：接口 qos shape rate（含 pir / ecn-percentage）下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/10-application-cli/0051-ACL_QOS.test.ts`

**配置**

```
interface PortA
qos shape rate 1000
exit
interface PortB
qos shape rate pir 1000
exit
interface PortC
qos shape rate 1000 ecn-percentage 60
exit
interface PortD
qos shape rate pir 1000 ecn-percentage 60
exit
```

**回显差异**

| 下发 | 回显 | 说明 |
| --- | --- | --- |
| `qos shape rate 1000` | `qos shape rate pir 1000` | 不带 `pir` 时回显补 `pir` 关键字 |
| `qos shape rate 1000 ecn-percentage 60` | `qos shape rate pir 1000 ecn-percentage 60` | 同上 |

#### 4.10.7 用例 0280：接口 service-policy type traffic-class 下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/10-application-cli/0052-ACL_QOS.test.ts`

**配置**

```
class-map type traffic-class TC_IF_TC
match traffic-class 1
exit
policy-map type traffic-class TC_IF_PM
class type traffic-class TC_IF_TC
priority level 1
quit
exit
interface PortA
service-policy type traffic-class TC_IF_PM
exit
```

**回显差异**：无（`service-policy type traffic-class TC_IF_PM` 出现在 `interface PortA` 段内）。

#### 4.10.8 用例 0290：port-group / vlan-group 引用 ACL 下发与回显

`P1 / CLI · 约 3 分钟 · 脚本 test/misc/stack/70-acl-qos/10-application-cli/0060-ACL_QOS.test.ts`

**配置**

```
ip access-list TC_G_ACL
10 permit tcp any any
exit
port-group TC_PG
member interface PortA
member interface PortB
access-group input TC_G_ACL
exit
vlan database
vlan 100
exit
vlan-group TC_VG
member vlan 100
access-group input TC_G_ACL
exit
```

**回显差异**：无（`port-group TC_PG` / `vlan-group TC_VG` 段内各含 `member` 与
`access-group input TC_G_ACL`）。

#### 4.10.9 用例 0300：port-group / vlan-group 应用 service-policy 下发与回显

`P1 / CLI · 约 3 分钟 · 脚本 test/misc/stack/70-acl-qos/10-application-cli/0070-acl-qos.test.ts`

**配置**

```
ip access-list TC_G_ACL
10 permit tcp any any
exit
class-map match-all TC_G_CM
match access-group TC_G_ACL
exit
policy-map acl
class TC_G_CM
statistics enable
quit
exit
port-group TC_PG
member interface PortA
member interface PortB
service-policy input acl
exit
vlan database
vlan 100
exit
vlan-group TC_VG
member vlan 100
service-policy input acl
exit
```

**回显差异**：无（两个 group 段内各含 `member` 与 `service-policy input acl`；
policy-map 名为 `acl`，全小写，回显同样保留小写）。

### 4.11 分组：组合场景

#### 4.11.1 用例 0310：IPv4 ACL + class-map + policy-map + 接口 service-policy 全链路下发与回显

`P1 / CLI · 约 3 分钟 · 脚本 test/misc/stack/70-acl-qos/11-combination-cli/0010-ACL_QOS.test.ts`

**配置**

```
ip access-list TC_C_IP
10 permit tcp any any
20 deny udp any any
30 permit icmp any any
exit
class-map type qos TC_C_CM_ACL
match access-group TC_C_IP
exit
class-map type qos TC_C_CM_COS
match cos 3
exit
policy-map type qos TC_C_PM
class type qos TC_C_CM_ACL
set dscp af11
policer color-blind cir 1000 cbs 10000 statistics
quit
class type qos TC_C_CM_COS
set cos 5
statistics enable
quit
exit
interface PortA
access-group input TC_C_IP
service-policy type qos input TC_C_PM
exit
```

**回显差异**：无。判定要求以下对象同时存在且互相引用正确：
ACL `TC_C_IP` 与其 3 条 rule、`class-map type qos TC_C_CM_ACL` 的 `match access-group TC_C_IP`、
`policy-map type qos TC_C_PM` 内两个 class 的 `set` / `policer` / `statistics enable`、
以及 `interface PortA` 下的 `access-group input` 与 `service-policy type qos input`。

#### 4.11.2 用例 0320：MAC ACL 被 class-map match access-group 引用下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/11-combination-cli/0020-ACL_QOS.test.ts`

**配置**

```
mac access-list TC_C_MAC
10 permit src-mac any vlan 10
exit
class-map type qos TC_C_CM_MAC
match access-group TC_C_MAC
exit
```

**回显差异**

| 下发 | 回显 | 说明 |
| --- | --- | --- |
| `10 permit src-mac any vlan 10` | `10 permit src-mac any dest-mac any vlan 10` | 省略 `dest-mac` 时补 `any` |

#### 4.11.3 用例 0330：control-plane ACL + class-map + policy-map 全链路下发与回显

`P1 / CLI · 约 3 分钟 · 脚本 test/misc/stack/70-acl-qos/11-combination-cli/0030-ACL_QOS.test.ts`

**配置**

```
control-plane access-list TC_C_CPACL
10 permit exception any
20 permit exception tcp untag-vlan ipv4 tcp any any dst-port eq 22
exit
class-map type control-plane TC_C_CM_CP
match access-group TC_C_CPACL
exit
policy-map type control-plane TC_C_PM_CP
class type control-plane TC_C_CM_CP
policer cir 100 statistics
quit
exit
```

**回显差异**：无。

#### 4.11.4 用例 0340：time-range 被 IPv4 ACL 与 UDF ACL 共同引用下发与回显

`P1 / CLI · 约 2 分钟 · 脚本 test/misc/stack/70-acl-qos/11-combination-cli/0040-ACL_QOS.test.ts`

**配置**

```
time-range TC_C_TR
periodic 08:00 daily to 18:00
exit
ip access-list TC_C_TRACL
10 permit tcp any any time-range TC_C_TR
exit
user-define access-list TC_C_UDF
10 permit l2-head 0x0800 0xffff 12 time-range TC_C_TR
exit
```

**回显差异**

| 下发 | 回显 | 说明 |
| --- | --- | --- |
| `10 permit l2-head 0x0800 0xffff 12 time-range TC_C_TR` | `10 permit l2-head 0x00000800 0x0000ffff 12 time-range TC_C_TR` | UDF 的「值 / 掩码」补零到 32 位 |

判定要求：同一个 `time-range TC_C_TR` 被两条不同的 ACL（IPv4 ACL 与 UDF ACL）引用，
两处 `time-range TC_C_TR` 均出现在回显中。

## 5. 清理与恢复

公共清理：在 master（slot 1）上逐条用例执行完后删除本用例创建的对象，并确认 `show running-config` 中不再出现。
脚本清理后未再进 standby 复查，如需确认删除已同步到 standby，可再执行 `stack connect slot 2` + `show running-config`。

| 用例 | 清理命令（全局配置模式） |
| --- | --- |
| 0010 / 0020 / 0030 | `no ip access-list <名称>`、`no time-range TC_TR_MAX` |
| 0040 / 0050 | `no mac access-list <名称>`、`no time-range TC_TR_MAX` |
| 0060 / 0070 | `no mpls access-list <名称>`、`no time-range TC_TR_MAX` |
| 0080 | `no arp access-list TC_ARP` |
| 0090 | `no control-plane access-list TC_CP`、`no time-range TC_TR_MAX` |
| 0100 | `no user-define access-list TC_UDF`、`no time-range TC_TR_MAX` |
| 0110 | `no time-range TC_TR_ABS` / `TC_TR_DAILY` / `TC_TR_WEEK` / `TC_TR_WEEKDAYS` / `TC_TR_WEEKEND` |
| 0120 | `no class-map TC_CM_QOS_ACL` / `TC_CM_QOS_COS` / `TC_CM_QOS_COS_IN` / `TC_CM_QOS_DSCP`、`no ip access-list TC_ACL_CM` |
| 0130 / 0140 / 0150 | `no class-map <名称>`，0140 另加 `no control-plane access-list TC_ACL_CP2`，0150 另加 `no ip access-list TC_ACL_L` |
| 0160 | `no policy-map TC_PM_QOS`、`no class-map TC_Q_0`~`TC_Q_7` 与 `TC_Q_D1`~`TC_Q_D8`、`no qos aggregate-policer TC_AGG`、`no table-map TC_TM_C` / `TC_TM_D` |
| 0170 | `no policy-map TC_PM_AGG`、`no class-map TC_CM_AGG` / `TC_CM_POL` / `TC_CM_PPS`、`no qos aggregate-policer TC_AGG` |
| 0180 | `no policy-map TC_PM_TC`、`no class-map TC_TC_1`~`TC_TC_8` |
| 0190 | `no policy-map TC_PM_CP`、`no class-map TC_CM_PMCP`、`no control-plane access-list TC_ACL_PMCP` |
| 0200 | `no table-map TC_TM` / `TC_TM2` / `TC_TM3` |
| 0210 | `no policy-map TC_PM_PERF`、`no class-map TC_PMF_C` |
| 0220 | `no access-group input` / `no access-group output`（`interface PortA` 下）、`no ip access-list TC_ACL_IF` |
| 0230 | `no service-policy type qos input`（`interface PortA` 下）、`no policy-map TC_PM_SP`、`no class-map TC_CM_SP`、`no ip access-list TC_ACL_SP` |
| 0240 | `no qos policer input` / `no qos policer output`（`interface PortA` 下） |
| 0250 | `no http server acl`、`no snmp-server access-group`、`no acl-statistics exclude-drop enable`、`no ip access-list TC_ACL_G` |
| 0260 / 0270 | 各接口下 `no trust` / `no qos shape rate` |
| 0280 | `no service-policy type traffic-class`（`interface PortA` 下）、`no policy-map TC_IF_PM`、`no class-map TC_IF_TC` |
| 0290 | `no vlan-group TC_VG`、`vlan database` 下 `no vlan 100`、`no port-group TC_PG`、`no ip access-list TC_G_ACL` |
| 0300 | 同 0290，另加 `no policy-map acl`、`no class-map TC_G_CM` |
| 0310 | `interface PortA` 下 `no access-group input` / `no service-policy type qos input`、`no policy-map TC_C_PM`、`no class-map TC_C_CM_ACL` / `TC_C_CM_COS`、`no ip access-list TC_C_IP` |
| 0320 | `no class-map TC_C_CM_MAC`、`no mac access-list TC_C_MAC` |
| 0330 | `no policy-map TC_C_PM_CP`、`no class-map TC_C_CM_CP`、`no control-plane access-list TC_C_CPACL` |
| 0340 | `no ip access-list TC_C_TRACL`、`no user-define access-list TC_C_UDF`、`no time-range TC_C_TR` |

删除顺序：**先删引用方（policy-map → class-map → ACL / time-range）**，再删被引用对象；
若设备拒绝删除被引用的对象，先解绑（`no access-group …` / `no service-policy …`）再删。

## 6. 备注 / 标准裁剪

标准裁剪：被测版本不支持的特性见第 7 条，结果记「不支持」，不按 Fail 处理。

1. **本套用例实际验证的是「堆叠配置同步」**：脚本用 `stack connect slot 2` 进 standby 再查
   `show running-config`，因此**没有堆叠环境（只有单机）时无法按本文档执行**；且判定只看 standby 侧，
   master 本地回显未单独校验。堆叠自身的组网/配置不在本合集范围内（脚本已省略）。
2. **本套用例只覆盖配置面**：验证「命令可下发、回显正确、可删除」，不验证转发行为（报文是否被
   permit/deny、限速是否生效、标记是否写入报文、队列调度是否生效）。数据面用例另行设计。
3. **回显顺序不固定**，判定一律用「包含」，且不要求多条期望之间有序。
4. 以下回显与下发**不一致**，需与特性负责人确认是否为设计预期（目前脚本已按回显值断言）：
   - MAC ACL 中形如 `dest-mac 0011.2233.4466 0000.0000.ffff` 的「显式掩码」写法，回显会把被掩码覆盖的
     低 2 字节清零成 `0011.2233.0000 0000.0000.ffff`；而 `host` 写法（`src-mac host 0011.2233.4455`）原样保留。
     语义上两者等价，但「配置与回显不同」容易让执行人误判为失败，需在文档/工具中注明（用例 0040、0050）。
   - `match traffic-class-all 3` 回显为 `match traffic-class 3`（用例 0130）；
     `set traffic-class-all 4` 回显为 `set traffic-class 4`（用例 0160）。
   - `qos shape rate 1000` 回显为 `qos shape rate pir 1000`（用例 0270）。
   - `table-map` 的 `map from 3 4 5 6 7 8 to 9` 回显为 `map from 3 to 9`，多源值被截断（用例 0200）。
5. **下发后未纳入判定的内容**（脚本未断言，执行时需人工确认）：
   - 用例 0160 中 `class type qos TC_Q_D1` 为空 class：原脚本该 class 内的 `set exp 3` 被注释掉，未下发也未断言。
   - 用例 0160 的 table-map 段与 class-map 段（`TC_TM_C` / `TC_TM_D` / `TC_Q_0`~`TC_Q_D8`）只作为引用存在，判定集中在 policy-map 段。
   - 用例 0090 的 48 条 exception rule 已全部断言；但 `exception` 子类型的组合行为（同一 rule 内多个 exception 共存）未覆盖。
   - 用例 0110 的 `weekdays` / `weekend` 两个 time-range 只下发未断言。
   - 用例 0170 的 `policer pps color-blind …` 行未断言（只断言了 `policer color-aware cir 1000` 前缀）；用例 0240 / 0310 的 `policer` 同样只校验到 `cir` 前缀，`cbs/eir/ebs/conform/exceed/violate` 未逐项断言。
   - 用例 0200 的 `map from 10 11 … 17 to 63` 与 `map from 20 to 21` 未断言。
   - 用例 0180 的 `queue-limit … ecn-threshold` 只校验到 `queue-limit` 前缀，`ecn-threshold` 未断言。
   - 用例 0140 / 0150 / 0210 / 0260 / 0270 / 0280 / 0330 只断言了「关键对象已绑定 / 已存在」（如 `access-group input …`、`trust …`、`service-policy …`），
     其前置的 ACL / class-map / policy-map 创建行靠「下发无报错」保证；用例 0310 的两个 class 中只断言了 ACL class。
6. 用例 0090 的 48 条 rule 与第 3 节的公共预置共用 `time-range TC_TR_MAX`，先跑其它用例时注意
   不要提前删除该 time-range。

7. 第 0 节「结果」列已标注 `不支持` 的 4 条用例（0060、0070、0210、0250）为**被测版本不支持的特性**：

   | 文档序号 | 脚本 | 不支持的操作 |
   | --- | --- | --- |
   | 0060 | `03-access-list-mpls-cli/0010` | `mpls access-list`（MPLS ACL） |
   | 0070 | `03-access-list-mpls-cli/0020` | `mpls access-list … extend`（MPLS ACL 匹配以太网字段） |
   | 0210 | `09-policy-map-cli/0060` | `policy-map type performance-monitor` |
   | 0250 | `10-application-cli/0040` | 全局 ACL 应用（`http server acl` / `snmp-server access-group` / `acl-statistics`） |

   这 4 条按「预期下发被拒绝（`% Invalid input` 或不识别该命令）」执行，确认不支持后结果记 `不支持`，
   不再沿用例内「回显差异」判定；其余 30 条照常执行。

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 执行环境（设备版本 / 拓扑） | |
| 结论 | Pass / Fail / Blocked / 不支持 |
| 失败用例与步骤 | |
| 实际观测 | 实际 vs 预期 |
| 证据 | 日志、截图、配置回显 |
| 关联缺陷 / 需求 | |

结论回填到第 0 节清单的「结果」列（`Pass` / `Fail` / `Blocked` / `不支持`）。
