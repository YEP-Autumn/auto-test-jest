# IPv4 ACL basic 满参数 rule 下发与回显

> 变体用例：全部用例共用一套组网（两台设备组成的堆叠系统，不打流），差异只在「下发哪套配置 + 校验哪些回显行」。
> 判定方式统一：配置在 master（slot 1）下发，进 standby（slot 2）看 `show running-config` 确认已同步。
> 覆盖对象：ACL（IPv4 / MAC / MPLS / ARP / control-plane / UDF）、time-range、class-map、policy-map、
> table-map，以及这些对象的绑定与应用。

## 0. 用例清单

| 序号 | 测试内容 | 备注 | 结果 |
| --- | --- | --- | --- |
| 0020 | IPv4 ACL basic 满参数 rule 下发与回显 | `01-access-list-ipv4-cli/0020` | |

## 1. 基本信息（用例）

- 用例编号：`0020`
- 用例标题：IPv4 ACL basic 满参数 rule 下发与回显
- 所属特性 / 分组：`misc/stack/70-acl-qos`
- 级别 / 类型：P1 / CLI
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 2~5 分钟/条
- 关联：`test/misc/stack/70-acl-qos/**`

### 1.1 标准依据

| 依据 | 条款 | 本文档验证的要求 |
| --- | --- | --- |
| XXX 配置指导（V0.0.1） | ACL / QoS 章节 | ACL、class-map、policy-map、table-map 配置 |
| XXX 命令参考（V0.0.1） | ACL / QoS 命令 | 命令参数、回显与删除 |
| 堆叠配置指导 | 配置同步 | master 配置同步到 standby |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备形态 | 两台设备组成堆叠，master = slot 1，standby = slot 2 | 确认堆叠配置同步能力 |
| 软件版本 | 支持本文档所列 ACL / QoS 命令 | 确认命令覆盖范围 |
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

本用例的判定方式如下，因此每条用例只写「配置」+「回显差异」。观测面参考 `test-case-template.md` 附录 A；判定标准参考附录 B。通用判定如下：

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
   master 本地回显未单独校验。堆叠自身的组网/配置不在本文档范围内（脚本已省略）。
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
