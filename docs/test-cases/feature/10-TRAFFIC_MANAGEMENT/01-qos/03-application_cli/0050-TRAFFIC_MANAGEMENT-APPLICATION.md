# 接口 trust

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本的测试用例共用公共拓扑、预置条件与判定口径；各子用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0050 | 接口 trust | `0050-TRAFFIC_MANAGEMENT-APPLICATION.test.ts` | P1 / CLI | |

## 1. 基本信息（用例）

- 用例编号：`0050`
- 用例标题：接口 trust
- 所属特性 / 分组：`10-TRAFFIC_MANAGEMENT` / `QoS配置` / `QoS 应用`
- 级别 / 类型：P1 / CLI
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 18 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/10-TRAFFIC_MANAGEMENT/01-qos/03-application_cli/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本文档验证的要求 |
| --- | --- | --- |
| E530 配置指导（V7.5.1） | 10.1 | QoS 应用配置与回显 |
| E530 命令参考（V7.4.8） | QoS配置 | 命令参数、回显与删除 |
| IEEE 802.1Q-2018 | VLAN 标记、成员与转发 | VLAN、PVID、Trunk 与子接口处理 |
| RFC 2474 / RFC 2475 | DSCP 与区分服务 | 分类、标记、限速与调度 |
| E530 命令参考（V7.4.8） | ACL 命令 | ACL 规则、动作与回显 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | 支持QoS 应用特性 | 确认特性可用范围 |
| License / 单板 | 支持QoS 应用相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 4 个可配置接口 | 确认接口类型与数量 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

脚本未在注释中给出 ASCII 拓扑；执行时按脚本使用的端口占位符与内置拓扑完成连线。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | `<PortA>`、`<PortB>`、`<PortC>`、`<PortD>` | 被测设备端口，执行前替换为实际接口名 |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| VLAN | 100 | 按拓扑规划 |
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

### 4.5 用例 0050：接口 trust

- 级别 / 类型：P1 / CLI
- 预估耗时：约 2 分钟
- 脚本：`test/feature/10-TRAFFIC_MANAGEMENT/01-qos/03-application_cli/0050-TRAFFIC_MANAGEMENT-APPLICATION.test.ts`

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
interface <PortA>
trust dscp
end
configure terminal
interface <PortB>
trust cos stag-cos
end
configure terminal
interface <PortC>
trust cos ctag-cos
end
configure terminal
interface <PortD>
trust port
end
```

**观测与预期**

- DUTA：执行 `show running-config`，回显应包含以下内容：

  - `trust dscp`
  - `trust cos stag-cos`
  - `trust cos ctag-cos`
  - `trust port`

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no trust
end
configure terminal
interface <PortB>
no trust
end
configure terminal
interface <PortC>
no trust
end
configure terminal
interface <PortD>
no trust
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
| 0050 | | | |

