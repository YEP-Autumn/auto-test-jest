# 测试在trunk接口下 vpls vlan bundling ac和vpws vlan ac 和 vpws bpdu-forwad ac可以同时配置

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本的测试用例共用公共拓扑、预置条件与判定口径；各子用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0080 | 测试在trunk接口下 vpls vlan bundling ac和vpws vlan ac 和 vpws bpdu-forwad ac可以同时配置 | `0080-MPLS-BPDU_AC.test.ts` | P1 / CLI | |

## 1. 基本信息（用例）

- 用例编号：`0080`
- 用例标题：测试在trunk接口下 vpls vlan bundling ac和vpws vlan ac 和 vpws bpdu-forwad ac可以同时配置
- 所属特性 / 分组：`19-MPLS` / `MPLS配置` / `BPDU AC`
- 级别 / 类型：P1 / CLI
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 18 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac_cli/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本文档验证的要求 |
| --- | --- | --- |
| E530 配置指导（V7.5.1） | 19.2 | BPDU AC配置与回显 |
| E530 命令参考（V7.4.8） | MPLS配置 | 命令参数、回显与删除 |
| IEEE 802.1Q-2018 | VLAN 标记、成员与转发 | VLAN、PVID、Trunk 与子接口处理 |
| RFC 3031 / RFC 5036 | MPLS 标签与 LDP | 标签分发与 LSP 建立 |
| RFC 4762 / RFC 4364 | VPLS 与 L3VPN | VPLS 转发与 L3VPN 路由 |
| IEEE 802.1Q / IEEE 802.1D | 生成树 | 拓扑计算与端口角色 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | 支持BPDU AC特性 | 确认特性可用范围 |
| License / 单板 | 支持BPDU AC相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 2 个可配置接口 | 确认接口类型与数量 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

脚本未在注释中给出 ASCII 拓扑；执行时按脚本使用的端口占位符与内置拓扑完成连线。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | `<PortA>` | 被测设备端口，执行前替换为实际接口名 |

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

### 4.8 用例 0080：测试在trunk接口下 vpls vlan bundling ac和vpws vlan ac 和 vpws bpdu-forwad ac可以同时配置

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac_cli/0080-MPLS-BPDU_AC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 清理 | DUTA |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
switchport mode trunk
mpls-vpls v1 vlan 2 bundling
mpls-l2-circuit t1 vlan 100
mpls-l2-circuit t2 bpdu-forward
end
```

**观测与预期**

脚本仅下发配置，未注册显式回显校验。手工执行时应确认命令均被接受，并执行 `show running-config` 核对本用例配置。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no mpls-vpls v1 vlan 2
no mpls-l2-circuit t1 vlan 100
no mpls-l2-circuit t2 bpdu-forward
switchport mode access
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
| 0080 | | | |

