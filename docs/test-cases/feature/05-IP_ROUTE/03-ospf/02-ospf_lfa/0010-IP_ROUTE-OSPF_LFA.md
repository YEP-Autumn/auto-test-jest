# IP路由 OSPF LFA 测试用例合集

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本目录全部测试脚本。
> 同一目录的脚本共用公共拓扑、预置条件与判定口径；各用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | 测试 OSPF LFA 功能 | `0010-IP_ROUTE-OSPF_LFA.test.ts` | P1 / 功能 | |

## 1. 基本信息（合集）

- 用例编号：`0010`
- 用例标题：IP路由 OSPF LFA 测试用例合集
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 2 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本合集验证的要求 |
| --- | --- | --- |
| E530 配置指导（V7.5.1） | 5.3 | OSPF LFA配置与回显 |
| E530 命令参考（V7.4.8） | OSPF配置 | 命令参数、回显与删除 |
| RFC 2328 | Hello、邻居状态机、LSA | OSPF 邻居建立与路由计算 |
| RFC 5286 | LFA 备份路径 | 无环备份下一跳计算 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | 支持OSPF LFA特性 | 确认特性可用范围 |
| License / 单板 | 支持OSPF LFA相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 4 个可配置接口 | 确认接口类型与数量 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

脚本注释中给出的拓扑如下。执行前按对应拓扑完成设备与测试仪连线。

### 2.1 拓扑 1

```text
   +--------+                   +--------+
   |  DUTA  |--PortA <=> PortA--|  DUTB  |
   +--------+                   +--------+
       |                            |
     PortD                        PortB
       |                            |
     PortD                        PortB
       |                            |
   +--------+                   +--------+
   |  DUTD  |--PortC <=> PortC--|  DUTC  |
   +--------+                   +--------+
```

适用用例：0010。

内置拓扑：`LinkConstraint.four_devices_topo_links_type_3`。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | `<PortA>`、`<PortB>`、`<PortC>`、`<PortD>` | 被测设备端口，执行前替换为实际接口名 |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF Area | 0 | 按拓扑规划 |
| 定时器 | 设备默认值 | 用例另有说明时以用例配置为准 |
| MTU | 1500 | 邻居建立前确认一致 |
| 收敛等待 | 优先使用就绪检查 | 固定等待见各用例 |

### 3.2 初始状态

- 设备接口处于默认二层或三层状态；本合集涉及的 VLAN、VRF、协议进程、静态路由、隧道、ACL、QoS 对象均为空。
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

### 4.1 用例 0010：测试 OSPF LFA 功能

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/0010-IP_ROUTE-OSPF_LFA.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 配置 | DUTD |
| 5 | 固定等待 | — |
| 6 | 清理 | DUTA |
| 7 | 清理 | DUTB |
| 8 | 清理 | DUTC |
| 9 | 清理 | DUTD |

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
ip address 4.4.4.2/24
exit
router ospf
network 1.1.1.0/24 area 0
network 4.4.4.0/24 area 0
exit
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
router ospf
network 1.1.1.0/24 area 0
network 2.2.2.0/24 area 0
exit
end
```

DUTC：

```text
configure terminal
interface <PortB>
no switchport
ip address 2.2.2.2/24
exit
interface <PortC>
no switchport
ip address 3.3.3.1/24
exit
router ospf
network 2.2.2.0/24 area 0
network 3.3.3.0/24 area 0
exit
end
```

DUTD：

```text
configure terminal
interface <PortC>
no switchport
ip address 3.3.3.2/24
exit
interface <PortD>
no switchport
ip address 4.4.4.1/24
exit
router ospf
network 3.3.3.0/24 area 0
network 4.4.4.0/24 area 0
exit
end
```

**触发与等待**

- 固定等待 20 秒；等待依据见脚本注释。
**观测与预期**

脚本在配置后固定等待，未注册显式回显校验。手工执行时应确认命令均被接受，并按用例标题描述检查协议邻居、路由表或业务表项。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
exit
interface <PortD>
switchport
exit
no router ospf
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
no router ospf
end
```

DUTC：

```text
configure terminal
interface <PortB>
switchport
exit
interface <PortC>
switchport
exit
no router ospf
end
```

DUTD：

```text
configure terminal
interface <PortC>
switchport
exit
interface <PortD>
switchport
exit
no router ospf
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

