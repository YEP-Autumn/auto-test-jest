# 主路径不变时，LFA 备份下一跳随候选路径开销变化在 D/E 之间切换

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0270-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0270`
- 用例标题：主路径不变时，LFA 备份下一跳随候选路径开销变化在 D/E 之间切换
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
- 预估耗时：约 5 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居建立、主路径与备份路径计算 |
| RFC 5286 | 1、2、3 | LFA 无环条件、备份下一跳选择 |
| RFC 6571 | LFA 适用性 | 拓扑/开销变化后 LFA 的重新计算 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受命令为准 |
| 端口形态 | 5 台 DUT，A~E | A~D 需要 2~3 个三层接口，E 需要 2 个三层接口 |
| 拓扑后端 | 能建立 `five_devices_topo_links_type_2` | 邻居无法 Full 时标记 `Blocked` |
| 软件版本 | `show ip route` 输出 `repair path` | 无该回显时标记 `Blocked` |
| LFA 命令 | 支持 `fast-reroute per-prefix enable` | 命令不可用时标记 `Blocked` |

## 2. 组网与拓扑

```text
+--------+                   +--------+
|  DUTB  |--PortB <=> PortA--|  DUTC  |
+---+----+                   +---+----+
    |                            |
  PortA                        PortB
    |                            |
  PortA                        PortB
    |                            |
+---+----+                   +---+----+
|  DUTA  |--PortB <=> PortA--|  DUTD  |
+---+----+                   +--------+
    |
  PortC
    |                          PortC
    |                            |
+---+----+                       |
|  DUTE  |--PortB <=> PortC------+
+--------+
```

拓扑名称 / 来源：`five_devices_topo_links_type_2`（内置拓扑）。

| 链路 | 网段 | 端点地址 | 出方向开销 |
| --- | --- | --- | --- |
| A-B | 10.0.12.0/24 | A=10.0.12.1，B=10.0.12.2 | A 1 |
| B-C | 10.0.23.0/24 | B=10.0.23.1，C=10.0.23.2 | B 1 |
| A-D | 10.0.14.0/24 | A=10.0.14.1，D=10.0.14.2 | A 10，D 10 |
| D-C | 10.0.34.0/24 | D=10.0.34.1，C=10.0.34.2 | D 10，C 10 |
| A-E | 10.0.15.0/24 | A=10.0.15.1，E=10.0.15.2 | A 20，E 20 |
| E-C | 10.0.35.0/24 | E=10.0.35.1，C=10.0.35.2 | E 20，C 20 |
| Loopback0 | 主机路由 | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32，D=4.4.4.4/32，E=5.5.5.5/32 | 1 |

LFA 条件（目的 `3.3.3.3/32`，主下一跳节点为 B）：

- 主路径 A-B-C，开销 2。
- D：`D(D,C)=10 < D(D,A)=10 + D(A,C)=2`，合法 LFA，总开销 20；D 直接到 C，属于 node 保护。
- E：`D(E,C)=20 < D(E,A)=20 + D(A,C)=2`，合法 LFA，总开销 40；E 直接到 C，属于 node 保护。
- 初始选择开销更低的 D。

将 D→C 出方向开销提高到 100 后：

- `D(D,C)=100`，不再满足无环条件，D 失去 LFA 资格；
- 主路径仍为 A-B-C，E 成为唯一合法 LFA。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Area | 0 | 全部链路和 Loopback 均在 Area 0 |
| Network Type | point-to-point | 全部互联接口 |
| Router ID | A=1.1.1.1 ～ E=5.5.5.5 | 与 Loopback0 一致 |
| Hello / Dead | 10s / 40s | 设备默认值 |
| LFA | `fast-reroute per-prefix enable` | A~E 全部使能 |

### 3.2 初始状态

- 接口处于默认二层状态；OSPF 进程、Loopback、L3 地址、LFA 配置为空。
- 拓扑后端已建立并启用 `five_devices_topo_links_type_2`。
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
ip ospf cost 1
exit
interface <PortB>
no switchport
ip address 10.0.14.1/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface <PortC>
no switchport
ip address 10.0.15.1/24
ip ospf network point-to-point
ip ospf cost 20
exit
interface loopback0
ip address 1.1.1.1/32
exit
router ospf
router-id 1.1.1.1
network 10.0.12.0/24 area 0
network 10.0.14.0/24 area 0
network 10.0.15.0/24 area 0
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
ip ospf cost 1
exit
interface loopback0
ip address 2.2.2.2/32
exit
router ospf
router-id 2.2.2.2
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
interface <PortA>
no switchport
ip address 10.0.23.2/24
ip ospf network point-to-point
exit
interface <PortB>
no switchport
ip address 10.0.34.2/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface <PortC>
no switchport
ip address 10.0.35.2/24
ip ospf network point-to-point
ip ospf cost 20
exit
interface loopback0
ip address 3.3.3.3/32
exit
router ospf
router-id 3.3.3.3
network 10.0.23.0/24 area 0
network 10.0.34.0/24 area 0
network 10.0.35.0/24 area 0
network 3.3.3.3/32 area 0
fast-reroute per-prefix enable
exit
end
```

DUTD：

```text
configure terminal
interface <PortA>
no switchport
ip address 10.0.14.2/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface <PortB>
no switchport
ip address 10.0.34.1/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface loopback0
ip address 4.4.4.4/32
exit
router ospf
router-id 4.4.4.4
network 10.0.14.0/24 area 0
network 10.0.34.0/24 area 0
network 4.4.4.4/32 area 0
fast-reroute per-prefix enable
exit
end
```

DUTE：

```text
configure terminal
interface <PortA>
no switchport
ip address 10.0.15.2/24
ip ospf network point-to-point
ip ospf cost 20
exit
interface <PortB>
no switchport
ip address 10.0.35.1/24
ip ospf network point-to-point
ip ospf cost 20
exit
interface loopback0
ip address 5.5.5.5/32
exit
router ospf
router-id 5.5.5.5
network 10.0.15.0/24 area 0
network 10.0.35.0/24 area 0
network 5.5.5.5/32 area 0
fast-reroute per-prefix enable
exit
end
```

### 4.2 基线检查与执行顺序

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 基线检查 | `show ip ospf neighbor`、`show ip ospf route` | A~E 邻居 `Full`；`show ip ospf route` 出现 `3.3.3.3/32` |
| 2 | 查询初始主备 | `show ip route 3.3.3.3` | 主下一跳 `10.0.12.2`，`repair path: 10.0.14.2` |
| 3 | 查询初始 LFA 明细 | `show ip ospf fast-reroute per-prefix` | `3.3.3.3/32` 的 `Backup nbr` 为 `10.0.14.2` |
| 4 | 触发开销变化 | DUTD 的 D-C 接口配置 `ip ospf cost 100` | 见 4.3 |
| 5 | 等待 LFA 明细更新 | `show ip ospf fast-reroute per-prefix` | `3.3.3.3/32` 的 `Backup nbr` 变为 `10.0.15.2` |
| 6 | 等待 RIB 更新 | `show ip route 3.3.3.3` | 主下一跳仍为 `10.0.12.2`，`repair path` 切换为 `10.0.15.2` |
| 7 | 转发检查 | `ping 3.3.3.3` | `0% packet loss` |
| 8 | 恢复开销 | DUTD 的 D-C 接口恢复 `ip ospf cost 10` | 见 4.4 |
| 9 | 恢复后复查 | `show ip route 3.3.3.3` | `repair path` 回到 `10.0.14.2`，主下一跳始终不变 |

### 4.3 触发与流量发送

本用例不使用测试仪流量，触发方式为接口开销变更。

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 触发 1 | 在 DUTD 的 D-C 接口配置 `ip ospf cost 100` | D 不再满足无环条件，LFA 重新计算 |
| 等待控制面 | `show ip ospf fast-reroute per-prefix` | `3.3.3.3/32` 的 `Backup nbr` 变为 `10.0.15.2` |
| 等待 RIB | `show ip route 3.3.3.3` | 主下一跳仍为 `10.0.12.2`，`repair path` 切换为 `10.0.15.2` |
| 转发检查 | `ping 3.3.3.3` | `0% packet loss` |

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 开销恢复 | 在 DUTD 的 D-C 接口恢复 `ip ospf cost 10` | LFA 恢复为 D |
| 控制面复查 | `show ip ospf fast-reroute per-prefix` | `3.3.3.3/32` 的 `Backup nbr` 回到 `10.0.14.2` |
| RIB 复查 | `show ip route 3.3.3.3` | `repair path` 回到 `10.0.14.2`，主下一跳始终为 `10.0.12.2` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | A~E 邻居 `Full` |
| 表项面（OSPF 路由） | `show ip ospf route` | 存在 `3.3.3.3/32`，主路径经 B |
| 表项面（LFA 明细） | `show ip ospf fast-reroute per-prefix` | `3.3.3.3/32` 的 `Type / Backup nbr / Cost` 随开销变化 |
| 表项面（RIB） | `show ip route 3.3.3.3` | 主下一跳保持 `10.0.12.2`，`repair path` 与 LFA 明细同步变化 |
| 转发面 | `ping 3.3.3.3` | 丢包率 = 0% |
| 恢复 / 资源面 | 恢复 `ip ospf cost 10` 后复查 LFA 明细与 RIB | `Backup nbr` 与 `repair path` 回到 `10.0.14.2` |

### 4.6 判定标准

- 步骤 1：A~E 邻居状态为 `Full`，`show ip ospf route` 中存在 `3.3.3.3/32`。
- 步骤 2：`show ip route 3.3.3.3` 主下一跳 = `10.0.12.2`，`repair path` = `10.0.14.2`。
- 步骤 3：LFA 明细中 `3.3.3.3/32` 的 `Backup nbr` = `10.0.14.2`。
- 步骤 4 至 6：D-C 开销改为 100 并收敛后，LFA 明细的 `Backup nbr` = `10.0.15.2`，RIB 主下一跳仍为 `10.0.12.2`，`repair path` = `10.0.15.2`。
- 步骤 7：`ping 3.3.3.3` 丢包率 = 0%。
- 步骤 8 至 9：恢复 D-C 开销为 10 后，LFA 明细的 `Backup nbr` 与 `repair path` 均回到 `10.0.14.2`，主下一跳保持 `10.0.12.2`。
- `Pass`：上述必检项全部满足，且第 5 章清理检查通过。
- `Fail`：主下一跳、LFA 明细或 RIB `repair path` 任一不满足，或清理后仍存在 OSPF、LFA 配置残留。
- `Blocked`：`show ip route` 无 `repair path` 回显，或设备不支持 `fast-reroute per-prefix enable`。

## 5. 清理与恢复

以 DUTA 为例，其余设备按各自接口和 Loopback 对称执行。仅对实际配置过 `ip ospf cost` 的接口执行 `no ip ospf cost`；DUTB/DUTC 的 PortA 未配置 cost，不应执行该命令，否则会返回 `% Parameter is not configured`。

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
interface <PortB>
no shutdown
no ip ospf cost
no ip ospf network
no ip address
switchport
exit
interface <PortC>
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
| 1 | 版本差异 | 命令或 `repair path` 回显不可用时标记 `Blocked` |
| 2 | 开销语义 | OSPF 开销按出方向生效，候选链路两端需分别配置以形成预期的有向路径 |
| 3 | 复测记录 | 初次执行曾出现控制面已切到 E、RIB `repair path` 仍为 D 的现象；复测已正常，控制面与 `repair path` 同步更新。历史记录见 `OSPF_LFA_RESEARCH.md` §6.1 |
| 4 | 清理要求 | 先删除 OSPF 进程，再恢复接口二层状态，并确认 Loopback、LFA 配置无残留 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | 2026-11-24 |
| 结论 | `Pass` |
| 实际观测 | 初始 `3.3.3.3/32` 为 `link+node 2.2.2.2 10.0.14.2`，`repair path: 10.0.14.2`；D-C 开销改为 100 后变为 `link+node 2.2.2.2 10.0.15.2`，`repair path: 10.0.15.2`；恢复开销后回到 D。主下一跳始终为 `10.0.12.2`，ping 0% 丢包 |
| 证据 | `/tmp/opencode/ospf_lfa_0270_0280_retest2.log` |
| 关联缺陷 / 需求 | 初次执行曾出现 RIB `repair path` 未刷新，复测已通过 |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0270` | `Pass` | 控制面和 RIB repair path 均随 LFA 从 D 切到 E，并恢复回 D | `/tmp/opencode/ospf_lfa_0270_0280_retest2.log` |
