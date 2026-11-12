# 链形组网无可用备份路径时，LFA 保护前缀数为 0 且链路故障后路由不可达

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0040-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0040`
- 用例标题：链形组网无可用备份路径时，LFA 保护前缀数为 0 且链路故障后路由不可达
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化脚本 / 手工
- 预估耗时：约 3 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与路由计算 |
| RFC 5286 | 1、2、3 | LFA 无环条件、链路/节点保护 |
| RFC 6571 | LFA 适用性 | LFA 覆盖范围与无备份路径场景 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `default` | 以 CLI 是否接受命令为准 |
| 端口形态 | 按拓扑需要 2~4 个三层接口 | 接口需支持 `no switchport` |
| 拓扑后端 | 能建立对应拓扑 | 邻居无法 Full 时标记 `Blocked` |
| 软件版本 | 接受本用例命令 | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
   +--------+                   +--------+                   +--------+
   |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB <=> PortB--|  DUTC  |
   +--------+                   +--------+                   +--------+
```

内置拓扑：`LinkConstraint.three_devices_topo_links_type_4`。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| A-B | 10.0.12.0/24 | A=10.0.12.1，B=10.0.12.2 | 1 |
| B-C | 10.0.23.0/24 | B=10.0.23.1，C=10.0.23.2 | 1 |
| Loopback0 | 主机路由 | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32 | 1 |

链形拓扑只有一条路径，A 到 C 不存在满足 RFC 5286 不等式的备份下一跳。

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

### 4.1 配置

DUTA：

```text
configure terminal
interface <PortA>
no switchport
ip address 10.0.12.1/24
ip ospf network point-to-point
exit
interface loopback0
ip address 1.1.1.1/32
exit
router ospf
network 10.0.12.0/24 area 0
network 1.1.1.1/32 area 0
fast-reroute per-prefix enable
exit
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
ip address 10.0.12.2/24
ip ospf network point-to-point
exit
interface <PortB>
no switchport
ip address 10.0.23.1/24
ip ospf network point-to-point
exit
interface loopback0
ip address 2.2.2.2/32
exit
router ospf
network 10.0.12.0/24 area 0
network 10.0.23.0/24 area 0
network 2.2.2.2/32 area 0
fast-reroute per-prefix enable
exit
end
```

DUTC：

```text
configure terminal
interface <PortB>
no switchport
ip address 10.0.23.2/24
ip ospf network point-to-point
exit
interface loopback0
ip address 3.3.3.3/32
exit
router ospf
network 10.0.23.0/24 area 0
network 3.3.3.3/32 area 0
fast-reroute per-prefix enable
exit
end
```

### 4.2 观测与预期

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 邻居状态 | `show ip ospf neighbor` | 状态包含 `Full` |
| LFA 使能 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix : enabled` |
| 无保护前缀 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 等于 0 |
| 主路径 | `show ip ospf route` | `3.3.3.3/32` 的下一跳为 `10.0.12.2` |
| 连通性 | `ping 3.3.3.3` | `0% packet loss` |

### 4.3 触发与故障后预期

DUTA：

```text
configure terminal
interface <PortA>
shutdown
end
```

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 路由撤销 | `show ip route 3.3.3.3` | `% Network not in table` |
| LFA 覆盖 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 等于 0 |

### 4.4 恢复与预期

DUTA：

```text
configure terminal
interface <PortA>
no shutdown
end
```

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 路由恢复 | `show ip route 3.3.3.3` | 下一跳包含 `via 10.0.12.2` |
| 连通性恢复 | `ping 3.3.3.3` | `0% packet loss` |

## 5. 清理与恢复

DUTA/DUTB/DUTC 按各自接口和 Loopback 对称执行，以 DUTA 为例：

```text
configure terminal
no router ospf
interface <PortA>
no shutdown
no ip ospf network
no ip address
switchport
exit
no interface loopback0
end
```

清理后检查：

```text
show running-config | include router ospf
show running-config | include fast-reroute
show ip ospf processes-count
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
| 0040 | | | |
