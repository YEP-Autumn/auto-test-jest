# 一个接口只能配置一个mpls vlan range ac 等 3 个子用例

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本的测试用例共用公共拓扑、预置条件与判定口径；各子用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0050.1 | 一个接口只能配置一个mpls vlan range ac | `0050-MPLS-AC_VLAN_RANGE.test.ts` | P1 / 功能 | |
| 0050.2 | 同一个接口上dot1q-tunnel type flex raw vlan group不能和 mpls vlan range ac同时使用 | `0050-MPLS-AC_VLAN_RANGE.test.ts` | P1 / 功能 | |
| 0050.3 | 接口配置mpls vlan range ac后, 不能向dot1q-tunnel type flex 的vlan mapping table中添加 raw vlan group条目 | `0050-MPLS-AC_VLAN_RANGE.test.ts` | P1 / 功能 | |

## 1. 基本信息（用例）

- 用例编号：`0050.1`、`0050.2`、`0050.3`
- 用例标题：一个接口只能配置一个mpls vlan range ac 等 3 个子用例
- 所属特性 / 分组：`19-MPLS` / `MPLS配置` / `AC VLAN 范围`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 23 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本文档验证的要求 |
| --- | --- | --- |
| 设备配置指导 19.2 | 19.2 | AC VLAN 范围配置与回显 |
| 设备命令参考 19.2 | MPLS配置 | 命令参数、回显与删除 |
| IEEE 802.1Q-2018 | VLAN 标记、成员与转发 | VLAN、PVID、Trunk 与子接口处理 |
| RFC 3031 / RFC 5036 | MPLS 标签与 LDP | 标签分发与 LSP 建立 |
| RFC 4762 / RFC 4364 | VPLS 与 L3VPN | VPLS 转发与 L3VPN 路由 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `mpls` | 确认特性可用范围 |
| License / 单板 | 支持AC VLAN 范围相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 3 个可配置接口 | 确认接口类型与数量 |
| 测试仪端口 | RenixPort.A / RenixPort.B / RenixPort.C | 确认流量收发端口可用 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

脚本注释中给出的拓扑如下。执行前按对应拓扑完成设备与测试仪连线。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| Router ID | 11.11.1.1 / 11.11.2.2 / 11.11.4.4 | 全局唯一 |
| VLAN | 2-500 | 按拓扑规划 |
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

### 4.5 用例 0050.1：一个接口只能配置一个mpls vlan range ac

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/0050-MPLS-AC_VLAN_RANGE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 观测 | DUTA |
| 3 | 配置 | DUTA |
| 4 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
raw vlan group 1 flex-vlan 10-20
raw vlan group 2 flex-vlan 20-30
interface <PortA>
switchport mode trunk
mpls-vpls v1 flex-vlan-range-group 1
```

DUTA：

```text
end
```

**观测与预期**

- DUTA：执行 `mpls-vpls v2 flex-vlan-range-group 2`，回显应包含 `Vlan range only can config one vpls ac on same interface`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no mpls-vpls v1 flex-vlan-range-group 1
switchport mode access
exit
no raw vlan group 1
no raw vlan group 2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.6 用例 0050.2：同一个接口上dot1q-tunnel type flex raw vlan group不能和 mpls vlan range ac同时使用

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/0050-MPLS-AC_VLAN_RANGE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 观测 | DUTA |
| 3 | 配置 | DUTA |
| 4 | 配置 | DUTA |
| 5 | 观测 | DUTA |
| 6 | 配置 | DUTA |
| 7 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
raw vlan group 1 flex-vlan 10-20
raw vlan group 2 flex-vlan 20-30
ethernet evc 1
dot1q mapped-vlan 100
exit
vlan mapping table vm1
raw-vlan group 1 evc 1
exit
interface <PortA>
switchport mode dot1q-tunnel
switchport dot1q-tunnel type flex
switchport dot1q-tunnel vlan mapping table vm1
```

DUTA：

```text
no switchport dot1q-tunnel vlan mapping table
```

DUTA：

```text
mpls-vpls v1 flex-vlan-range-group 2
```

DUTA：

```text
end
```

**观测与预期**

- DUTA：执行 `mpls-vpls v1 flex-vlan-range-group 2`，回显应包含 `Vlan range already in use with vlan mapping`。
- DUTA：执行 `switchport dot1q-tunnel vlan mapping table vm1`，回显应包含 `VLAN range conflict with mpls ac vlan`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no mpls-vpls v1 flex-vlan-range-group 2
switchport mode access
exit
no vlan mapping table vm1
no ethernet evc 1
no raw vlan group 1
no raw vlan group 2
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

### 4.7 用例 0050.3：接口配置mpls vlan range ac后, 不能向dot1q-tunnel type flex 的vlan mapping table中添加 raw vlan group条目

- 级别 / 类型：P1 / 功能
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/04-mpls_ac_vlan_range/0050-MPLS-AC_VLAN_RANGE.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTA |
| 3 | 观测 | DUTA |
| 4 | 配置 | DUTA |
| 5 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
raw vlan group 1 flex-vlan 10-20
raw vlan group 2 flex-vlan 20-30
ethernet evc 1
dot1q mapped-vlan 100
exit
vlan mapping table vm1
exit
interface <PortA>
switchport mode dot1q-tunnel
switchport dot1q-tunnel type flex
switchport dot1q-tunnel vlan mapping table vm1
mpls-vpls v1 flex-vlan-range-group 1
end
```

DUTA：

```text
configure terminal
vlan mapping table vm1
```

DUTA：

```text
end
```

**观测与预期**

- DUTA：执行 `raw-vlan group 2 evc 1`，回显应包含 `VLAN range conflict with mpls ac vlan`。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no mpls-vpls v1 flex-vlan-range-group 1
switchport mode access
exit
no vlan mapping table vm1
no ethernet evc 1
no raw vlan group 1
no raw vlan group 2
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
| 0050.1 | | | |
| 0050.2 | | | |
| 0050.3 | | | |

