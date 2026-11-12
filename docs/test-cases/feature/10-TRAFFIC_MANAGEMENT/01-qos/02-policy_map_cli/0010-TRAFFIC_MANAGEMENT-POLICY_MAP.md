# policy-map type qos 全部标记/动作变体

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本的测试用例共用公共拓扑、预置条件与判定口径；各子用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | policy-map type qos 全部标记/动作变体 | `0010-TRAFFIC_MANAGEMENT-POLICY_MAP.test.ts` | P1 / CLI | |

## 1. 基本信息（用例）

- 用例编号：`0010`
- 用例标题：policy-map type qos 全部标记/动作变体
- 所属特性 / 分组：`10-TRAFFIC_MANAGEMENT` / `QoS配置` / `policy-map`
- 级别 / 类型：P1 / CLI
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 12 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/10-TRAFFIC_MANAGEMENT/01-qos/02-policy_map_cli/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本文档验证的要求 |
| --- | --- | --- |
| 设备配置指导 10.1 | 10.1 | policy-map配置与回显 |
| 设备命令参考 10.1 | QoS配置 | 命令参数、回显与删除 |
| RFC 2474 / RFC 2475 | DSCP 与区分服务 | 分类、标记、限速与调度 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `default` | 确认特性可用范围 |
| License / 单板 | 支持policy-map相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 2 个可配置接口 | 确认接口类型与数量 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

本文档未使用设备端口占位符与测试仪端口；按脚本中的设备登录信息执行。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | 无 | 脚本未使用设备端口占位符 |

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

### 4.1 用例 0010：policy-map type qos 全部标记/动作变体

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/10-TRAFFIC_MANAGEMENT/01-qos/02-policy_map_cli/0010-TRAFFIC_MANAGEMENT-POLICY_MAP.test.ts`

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
table-map TC_TM_C
map from 0 to 1
map from 1 2 3 4 5 6 7 to 7
default copy
end
configure terminal
table-map TC_TM_D
map from 0 to 8
map from 1 2 3 4 5 6 7 to 16
default copy
end
configure terminal
class-map type qos TC_Q_0
match cos 0
end
configure terminal
class-map type qos TC_Q_1
match cos 1
end
configure terminal
class-map type qos TC_Q_2
match cos 2
end
configure terminal
class-map type qos TC_Q_3
match cos 3
end
configure terminal
class-map type qos TC_Q_4
match cos 4
end
configure terminal
class-map type qos TC_Q_5
match cos 5
end
configure terminal
class-map type qos TC_Q_6
match cos 6
end
configure terminal
class-map type qos TC_Q_7
match cos 7
end
configure terminal
class-map type qos TC_Q_D1
match dscp af11
end
configure terminal
class-map type qos TC_Q_D2
match dscp af12
end
configure terminal
class-map type qos TC_Q_D3
match dscp af13
end
configure terminal
class-map type qos TC_Q_D4
match dscp af21
end
configure terminal
class-map type qos TC_Q_D5
match dscp af22
end
configure terminal
class-map type qos TC_Q_D6
match dscp af23
end
configure terminal
class-map type qos TC_Q_D7
match dscp af31
end
configure terminal
class-map type qos TC_Q_D8
match dscp af32
end
configure terminal
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
end
```

**观测与预期**

- DUTA：执行 `show running-config`，回显应包含以下内容：

  - `policy-map type qos TC_PM_QOS`
  - `class type qos TC_Q_0`
  - `set cos 5`
  - `set cos inner 5`
  - `class type qos TC_Q_1`
  - `set dscp af11`
  - `class type qos TC_Q_2`
  - `set cos cos table TC_TM_C`
  - `class type qos TC_Q_4`
  - `set dscp dscp table TC_TM_D`
  - `class type qos TC_Q_5`
  - `set dscp cos table TC_TM_C`
  - `class type qos TC_Q_6`
  - `set traffic-class 2`
  - `class type qos TC_Q_7`
  - `set priority 5`
  - `class type qos TC_Q_D1`
  - `set color yellow`
  - `set color red`
  - `class type qos TC_Q_D4`
  - `statistics enable`
  - `class type qos TC_Q_D5`
  - `policer color-blind cir 1000`
  - `class type qos TC_Q_D6`
  - `policer pps color-aware cir 1000`
  - `class type qos TC_Q_D7`
  - `aggregate-policer TC_AGG`
  - `class type qos TC_Q_D8`
  - `set traffic-class 4`
  - `class type qos class-default`

**清理**

DUTA：

```text
configure terminal
no policy-map TC_PM_QOS
no class-map TC_Q_0
no class-map TC_Q_1
no class-map TC_Q_2
no class-map TC_Q_3
no class-map TC_Q_4
no class-map TC_Q_5
no class-map TC_Q_6
no class-map TC_Q_7
no class-map TC_Q_D1
no class-map TC_Q_D2
no class-map TC_Q_D3
no class-map TC_Q_D4
no class-map TC_Q_D5
no class-map TC_Q_D6
no class-map TC_Q_D7
no class-map TC_Q_D8
no qos aggregate-policer TC_AGG
no table-map TC_TM_C
no table-map TC_TM_D
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

## 5. 清理与恢复

各子用例的清理命令见第 4 节对应小节。用例执行完毕后，按设备执行以下检查，确认本文档新增对象均已删除。

```text
show running-config
show class-map
show policy-map
show interface
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
| 0010 | | | |

