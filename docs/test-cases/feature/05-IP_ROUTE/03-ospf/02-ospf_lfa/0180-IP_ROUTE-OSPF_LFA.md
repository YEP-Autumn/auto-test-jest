# 非对称开销导致 LFA 无环条件不满足时，受保护前缀数下降并可恢复

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0180-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0180`
- 用例标题：非对称开销导致 LFA 无环条件不满足时，受保护前缀数下降并可恢复
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
- 预估耗时：约 5 分钟
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
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受命令为准 |
| 端口形态 | 按拓扑需要 2～4 个三层接口 | 接口需支持 `no switchport` |
| 拓扑后端 | 能建立对应拓扑 | 邻居无法 Full 时标记 `Blocked` |
| 软件版本 | 接受本用例命令 | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

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

拓扑名称 / 来源：`four_devices_topo_links_type_3`（内置拓扑）。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| A-B | 10.0.12.0/24 | A=10.0.12.1，B=10.0.12.2 | 1 |
| B-C | 10.0.23.0/24 | B=10.0.23.1，C=10.0.23.2 | 1 |
| C-D | 10.0.34.0/24 | C=10.0.34.1，D=10.0.34.2 | 1 |
| D-A | 10.0.41.0/24 | D=10.0.41.1，A=10.0.41.2 | 10 |
| Loopback0 | 主机路由 | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32，D=4.4.4.4/32 | 1 |

A 到 C 的主路径为 A-B-C（开销 2），备份路径为 A-D-C（开销 11）。对邻居 D 满足 `D(D,C)=1 < D(D,A)=10 + D(A,C)=2`，因此 D 是合法 LFA。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Router ID | A=1.1.1.1、B=2.2.2.2、C=3.3.3.3、D=4.4.4.4 | 与 Loopback0 一致 |
| Area | 0 | 全部链路和 Loopback 均在 Area 0 |
| Network Type | point-to-point | 全部互联接口 |
| Hello / Dead | 10s / 40s | 设备默认值 |
| LFA | `fast-reroute per-prefix enable` | A～D 全部使能 |

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
interface <PortD>
no switchport
ip address 10.0.41.2/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface loopback0
ip address 1.1.1.1/32
exit
router ospf
network 10.0.12.0/24 area 0
network 10.0.41.0/24 area 0
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
interface <PortC>
no switchport
ip address 10.0.34.1/24
ip ospf network point-to-point
exit
interface loopback0
ip address 3.3.3.3/32
exit
router ospf
network 10.0.23.0/24 area 0
network 10.0.34.0/24 area 0
network 3.3.3.3/32 area 0
fast-reroute per-prefix enable
exit
end
```

DUTD：

```text
configure terminal
interface <PortC>
no switchport
ip address 10.0.34.2/24
ip ospf network point-to-point
exit
interface <PortD>
no switchport
ip address 10.0.41.1/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface loopback0
ip address 4.4.4.4/32
exit
router ospf
network 10.0.34.0/24 area 0
network 10.0.41.0/24 area 0
network 4.4.4.4/32 area 0
fast-reroute per-prefix enable
exit
end
```

### 4.2 基线检查与执行顺序

执行顺序：4.2 基线检查 → 4.3 触发与流量发送 → 4.4 恢复。

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 检查邻居 | `show ip ospf neighbor` | 四台设备的直连邻居均为 `Full` |
| 2 | 检查 OSPF 路由 | `show ip ospf route` | 存在 `3.3.3.3/32` |
| 3 | 检查 LFA 保护计数 | `show ip ospf fast-reroute per-prefix`（DUTA） | `Protected by LFA` 大于 0，记录基线值 N |
| 4 | 检查主路径与 repair path | `show ip route 3.3.3.3` | 主下一跳为 `10.0.12.2`，存在 `repair path: 10.0.41.1 via ...` |

### 4.3 触发与流量发送

在 DUTD 上把 PortC 出方向开销改为 100：

```text
configure terminal
interface <PortC>
ip ospf cost 100
end
```

接口开销是出方向属性：DUTD 到 C 的方向变为高开销，C 到 DUTD 仍为默认开销，形成非对称开销。DUTD 到 C Loopback 的最短路径会绕回 DUTA，D 邻居不再满足 LFA 无环条件。

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 非对称开销注入 | DUTD 的 `<PortC>` 执行 `ip ospf cost 100` | D 邻居不再满足 LFA 无环条件 |
| 保护计数下降 | 等待 `show ip ospf fast-reroute per-prefix` 刷新 | `Protected by LFA` 小于基线值 N |
| repair path 移除 | 等待 `show ip route 3.3.3.3` 刷新 | 不再出现 `repair path:` |
| 主路径保持 | `show ip route 3.3.3.3` | 主下一跳始终为 `10.0.12.2`，不因 LFA 有无而变化 |

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 恢复开销 | DUTD 的 `<PortC>` 执行 `ip ospf cost 1` | D 邻居重新满足 LFA 无环条件 |
| 保护计数恢复 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 恢复到不小于基线值 N |
| repair path 恢复 | `show ip route 3.3.3.3` | `repair path: 10.0.41.1 via ...` 重新出现 |
| 主路径保持 | `show ip route 3.3.3.3` | 主下一跳始终为 `10.0.12.2` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 四台设备的直连邻居均为 `Full`，非对称开销不导致邻居断开 |
| 表项面 | `show ip ospf route`、`show ip route 3.3.3.3` | `3.3.3.3/32` 存在，主下一跳始终为 `10.0.12.2` |
| 保护表面 | `show ip ospf fast-reroute per-prefix`（DUTA） | `Protected by LFA` 随开销变化先下降、后恢复到不小于基线值 |
| 转发面 | `show ip route 3.3.3.3` | 故障前后均有有效主下一跳 `10.0.12.2`，不因 LFA 有无而变化 |
| 恢复 / 资源面 | `show ip ospf fast-reroute per-prefix`、`show ip route 3.3.3.3` | 恢复后保护计数不小于基线值，`repair path` 重新出现 |

### 4.6 判定标准

- 4.2 步骤 1 至 4：直连邻居均为 `Full`；`Fast-reroute per-prefix : enabled`，`3.3.3.3/32` 存在；`Protected by LFA` 大于 0，记录基线值 N；主下一跳为 `10.0.12.2` 且存在 `repair path: 10.0.41.1 via ...`。
- 4.3 步骤 1 至 4：`Protected by LFA` 小于 N；`show ip route 3.3.3.3` 不再出现 `repair path:`；主下一跳仍为 `10.0.12.2`。
- 4.4 步骤 1 至 4：`Protected by LFA` 恢复到不小于 N；`repair path: 10.0.41.1 via ...` 重新出现；主下一跳仍为 `10.0.12.2`。
- 上述必检项全部满足，且清理后无 `router ospf`、`fast-reroute` 残留 → `Pass`。
- 上述任一必检项不满足，或清理失败 → `Fail`。
- LFA 命令或 `repair path` 回显不可用、四设备环形拓扑无法建立、邻居无法 `Full` → `Blocked`，记录缺失项。

## 5. 清理与恢复

以 DUTA 为例，DUTB/DUTC/DUTD 按各自接口和 Loopback 对称执行：

```text
configure terminal
no router ospf
interface <PortA>
no shutdown
no ip ospf cost
no ip ospf network
no ip address
switchport
exit
interface <PortD>
no shutdown
no ip ospf cost
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
show ip ospf neighbor
```

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 版本差异 | 命令不可用时标记 `Blocked`，将版本差异记录为环境限制 |
| 2 | 清理要求 | 在全局配置视图执行 `no router ospf` 删除进程，再恢复接口二层状态 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | 2026-11-24 |
| 结论 | Pass |
| 实际观测 | LFA 失效后 `Protected by LFA` 从 4 降到 1，`show ip route 3.3.3.3` 不再出现 `repair path:`；恢复开销后计数回到 5，`repair path: 10.0.41.1 via ...` 重新出现，主下一跳始终为 `10.0.12.2` |
| 证据 | `/tmp/opencode/ospf_lfa_0180_transitions.log` |
| 关联缺陷 / 需求 | 验证 LFA→无LFA、无LFA→有LFA 的 RIB 更新正常 |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0180 | Pass | LFA 有无切换时 repair path 正确移除/恢复 | `/tmp/opencode/ospf_lfa_0180_transitions.log` |
