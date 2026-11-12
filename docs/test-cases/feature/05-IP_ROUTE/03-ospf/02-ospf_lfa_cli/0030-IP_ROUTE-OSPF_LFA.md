# 当前版本不支持 unnumbered 接口时，ip unnumbered 命令被明确拒绝

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0030-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0030`
- 用例标题：当前版本不支持 unnumbered 接口时，ip unnumbered 命令被明确拒绝
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P2 / CLI 负向
- 执行方式：自动化脚本 / 手工
- 预估耗时：约 1 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa_cli/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与路由计算 |
| RFC 5286 | 1、2、3 | LFA 无环条件、链路/节点保护 |
| RFC 6571 | LFA 适用性 | LFA 覆盖范围与无备份路径场景 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | 支持 OSPFv2 逐前缀 LFA | 以 CLI 是否接受命令为准 |
| 端口形态 | 按拓扑需要 2~4 个三层接口 | 接口需支持 `no switchport` |
| 拓扑后端 | 能建立对应拓扑 | 邻居无法 Full 时标记 `Blocked` |
| 软件版本 | 接受本用例命令 | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

单设备执行，无需拓扑后端。

| 设备 | 接口 | 用途 |
| --- | --- | --- |
| DUTA | `<PortA>` | 验证 unnumbered 命令不可用 |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Area | 0 | 多区域用例按拓扑使用 Area 1 |
| Network Type | point-to-point | 网络类型用例单独说明 |
| Hello / Dead | 10s / 40s | 设备默认值 |
| LFA | `fast-reroute per-prefix enable` | 功能用例均使能 |

### 3.2 初始状态

- 接口处于默认二层状态；OSPF 进程、Loopback、L3 地址和 LFA 配置为空。
- 拓扑后端已建立并启用对应链路。
- 现场保留：默认清理。

## 4. 测试步骤与预期结果

### 4.1 执行

```text
configure terminal
interface <PortA>
no switchport
ip unnumbered ?
ip unnumbered loopback0
end
```

### 4.2 观测与预期

| 观测项 | 预期 |
| --- | --- |
| 帮助回显 | `% Unrecognized command` 或 `% Invalid input detected` |
| 命令回显 | 命令被拒绝，不产生配置 |
| 配置残留 | `show running-config \| include ip unnumbered` 无输出 |
| 用例结论 | 当前版本 `Blocked / Not Supported` |

## 5. 清理与恢复

```text
configure terminal
interface <PortA>
switchport
end
```

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 版本差异 | 命令不可用时标记 `Blocked`，不将版本差异判为功能失败 |
| 2 | 清理要求 | 在全局配置视图执行 `no router ospf` 删除进程，再恢复接口二层状态 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 记录邻居、LFA 计数、路由下一跳和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0030 | | | |
