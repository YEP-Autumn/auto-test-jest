# IP路由 OSPF LFA CLI 测试用例

> 本文依据 `docs/spec/test-case-template.md` 编写。
> 本用例只验证 CLI 配置与回显，不建立 OSPF 邻居，不依赖测试仪和拓扑后端。
> 功能原理与设备能力见 [`../02-ospf_lfa/OSPF_LFA_RESEARCH.md`](../02-ospf_lfa/OSPF_LFA_RESEARCH.md)。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | OSPF LFA 的全局使能、接口角色配置与 L2 接口拒绝行为符合预期 | `0010-IP_ROUTE-OSPF_LFA.test.ts` | P2 / CLI | |

## 1. 基本信息

- 用例编号：`0010`
- 用例标题：OSPF LFA 的全局使能、接口角色配置与 L2 接口拒绝行为符合预期
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P2 / CLI
- 执行方式：自动化脚本 / 手工
- 预估耗时：约 1 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa_cli/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 5286 | 1、2 | LFA 使能与接口角色配置 |
| 设备 CLI 实测 | `fast-reroute per-prefix enable`、`ip ospf fast-reroute per-prefix candidate\|protection disable` | 命令、回显与错误提示 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `default` | 以 CLI 是否接受命令为准 |
| 接口 | 至少 2 个可配置接口 | PortA 配为三层，PortB 保持二层用于反向校验 |
| 软件版本 | 接受 LFA 相关命令 | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

单设备直连执行，无需拓扑后端。

| 设备 | 接口 | 配置 | 用途 |
| --- | --- | --- | --- |
| DUTA | `<PortA>` | `no switchport`，10.0.0.1/24 | 三层接口，用于 LFA 全局与接口角色配置 |
| DUTA | `<PortB>` | 保持默认二层 | 验证 L2 接口拒绝 LFA 角色命令 |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 实测同一 VRF 仅支持一个进程 |
| Area | 0 | `network 10.0.0.0/24 area 0` |
| Network Type | point-to-point | 与功能用例保持一致 |
| 邻居 | 不要求 | CLI 用例只验证配置与回显 |

### 3.2 初始状态

- `<PortA>`、`<PortB>` 处于默认二层状态。
- 无 OSPF network、Loopback 和 LFA 配置。
- 现场保留：默认清理。

## 4. 测试步骤与预期结果

### 4.1 基线检查

| 步骤 | 动作 | 预期 |
| --- | --- | --- |
| 1 | 查询 `show running-config \| include fast-reroute` | 无输出 |
| 2 | 查询 `show ip ospf fast-reroute per-prefix` | 无 OSPF 接口时不输出使能状态 |

### 4.2 配置全局 LFA

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 10.0.0.1/24
ip ospf network point-to-point
exit
router ospf
network 10.0.0.0/24 area 0
fast-reroute per-prefix enable
exit
end
```

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 全局配置 | `show running-config \| include fast-reroute` | 包含 `fast-reroute per-prefix enable` |
| LFA 状态 | `show ip ospf fast-reroute per-prefix` | `Area 0.0.0.0`、`Fast-reroute per-prefix : enabled` |

### 4.3 配置接口角色

DUTA：

```text
configure terminal
interface <PortA>
ip ospf fast-reroute per-prefix candidate disable
ip ospf fast-reroute per-prefix protection disable
end
```

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 候选角色 | `show running-config \| include fast-reroute` | 包含 `ip ospf fast-reroute per-prefix candidate disable` |
| 受保护角色 | `show running-config \| include fast-reroute` | 包含 `ip ospf fast-reroute per-prefix protection disable` |

### 4.4 L2 接口反向校验

DUTA：

```text
configure terminal
interface <PortB>
ip ospf fast-reroute per-prefix candidate disable
```

| 观测项 | 预期 |
| --- | --- |
| 命令结果 | 返回 `% This can't be configured for L2 interface.` |
| 配置结果 | `show running-config` 不包含该接口的 LFA 角色配置 |

### 4.5 去使能 LFA

DUTA：

```text
configure terminal
router ospf
no fast-reroute per-prefix enable
end
```

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| LFA 状态 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix : disabled` |
| 全局配置 | `show running-config \| include fast-reroute` | 不包含 `fast-reroute per-prefix enable` |

## 5. 清理与恢复

DUTA：

```text
configure terminal
no router ospf
interface <PortA>
no ip ospf fast-reroute per-prefix candidate disable
no ip ospf fast-reroute per-prefix protection disable
no ip ospf network
no ip address
switchport
exit
end
```

清理后检查：

```text
show running-config | include fast-reroute
show running-config | include ospf
show ip ospf neighbor
```

预期：无 LFA、OSPF network、L3 地址残留；`<PortA>` 恢复二层。

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 无邻居依赖 | 本用例不验证备份路径计算，只验证命令与回显 |
| 2 | 版本差异 | 命令不支持时标记 `Blocked` |
| 3 | 接口状态 | LFA 角色命令要求接口为三层，二层接口返回明确错误 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 记录全局与接口命令回显、L2 接口错误提示 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0010 | | | |
