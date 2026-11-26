# LFA 保护随绕开主下一跳节点的备份路径出现由 link 升级为 link+node

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0280-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0280`
- 用例标题：LFA 保护随绕开主下一跳节点的备份路径出现由 link 升级为 link+node
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
- 预估耗时：约 6 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | 邻居建立与主路径计算 |
| RFC 5286 | 1、2、3 | 链路保护与节点保护的判定 |
| RFC 6571 | LFA 适用性 | 拓扑变化后 LFA 类型和备份下一跳的重新计算 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受命令为准 |
| 端口形态 | 5 台 DUT，A~E | A 需要 3 个三层接口，B 需要 3 个，C/D/E 各 2 个 |
| 拓扑后端 | 能建立 `five_devices_topo_links_type_3` | 邻居无法 Full 时标记 `Blocked` |
| 软件版本 | `show ip ospf fast-reroute per-prefix` 输出 `Type` 列 | 无 `Type` 列时标记 `Blocked` |
| 软件版本 | `show ip route` 输出 `repair path` | 无该回显时标记 `Blocked` |

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
|  DUTA  |--PortC <=> PortA--|  DUTE  |
+---+----+                   +--------+
    |
  PortB
    |
  PortA
    |
+---+----+
|  DUTD  |--PortB <=> PortC--+
+--------+                (DUTB)
```

拓扑名称 / 来源：`five_devices_topo_links_type_3`（内置拓扑）。

| 链路 | 网段 | 端点地址 | 出方向开销 |
| --- | --- | --- | --- |
| A-B | 10.0.12.0/24 | A=10.0.12.1，B=10.0.12.2 | A 1 |
| B-C | 10.0.23.0/24 | B=10.0.23.1，C=10.0.23.2 | B 1 |
| A-D | 10.0.14.0/24 | A=10.0.14.1，D=10.0.14.2 | A 10，D 10 |
| D-B | 10.0.24.0/24 | D=10.0.24.1，B=10.0.24.2 | D 10，B 10 |
| A-E | 10.0.15.0/24 | A=10.0.15.1，E=10.0.15.2 | A 5，E 5 |
| E-C | 10.0.35.0/24 | E=10.0.35.1，C=10.0.35.2 | E 5，C 5 |
| Loopback0 | 主机路由 | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32，D=4.4.4.4/32，E=5.5.5.5/32 | 1 |

LFA 条件（目的 `3.3.3.3/32`，主下一跳节点为 B）：

- 主路径 A-B-C，开销 2。
- D：`D(D,C)=10+1=11 < D(D,A)=10 + D(A,C)=2`，合法 LFA；D 到 C 的路径为 D-B-C，仍经过主下一跳节点 B，属于 **link** 保护。
- E（E-C 打开后）：`D(E,C)=5 < D(E,A)=5 + D(A,C)=2`，合法 LFA；E 到 C 的路径为 E-C，绕开 B，属于 **link+node** 保护。
- E 的总开销为 10，小于 D 的 21，因此 E-C 打开后优先选择 E。

初始状态将 E 的 E-C 接口 `shutdown`，确保只有 D 可以作为 LFA。

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
- 拓扑后端已建立并启用 `five_devices_topo_links_type_3`。
- DUTE 的 E-C 接口初始为 `shutdown`。
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
ip ospf cost 5
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
interface <PortC>
no switchport
ip address 10.0.24.2/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface loopback0
ip address 2.2.2.2/32
exit
router ospf
router-id 2.2.2.2
network 10.0.12.0/24 area 0
network 10.0.23.0/24 area 0
network 10.0.24.0/24 area 0
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
ip address 10.0.35.2/24
ip ospf network point-to-point
ip ospf cost 5
exit
interface loopback0
ip address 3.3.3.3/32
exit
router ospf
router-id 3.3.3.3
network 10.0.23.0/24 area 0
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
ip address 10.0.24.1/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface loopback0
ip address 4.4.4.4/32
exit
router ospf
router-id 4.4.4.4
network 10.0.14.0/24 area 0
network 10.0.24.0/24 area 0
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
ip ospf cost 5
exit
interface <PortB>
no switchport
ip address 10.0.35.1/24
ip ospf network point-to-point
ip ospf cost 5
shutdown
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
| 1 | 基线检查 | `show ip ospf neighbor`、`show ip ospf route` | 除 C-E 外 A~E 邻居 `Full`（C-E 因 E 侧 `shutdown` 不存在）；DUTA 的 `show ip ospf route` 出现 `3.3.3.3/32` |
| 2 | 查询初始 LFA 明细 | `show ip ospf fast-reroute per-prefix` | `3.3.3.3/32` 为 `link 2.2.2.2 10.0.14.2` |
| 3 | 查询初始 RIB | `show ip route 3.3.3.3` | 主下一跳 `10.0.12.2`，`repair path: 10.0.14.2` |
| 4 | 触发备份路径变化 | DUTE 的 E-C 接口执行 `no shutdown` | 见 4.3 |
| 5 | 等待 LFA 明细升级 | `show ip ospf fast-reroute per-prefix` | `3.3.3.3/32` 变为 `link+node 2.2.2.2 10.0.15.2` |
| 6 | 等待 RIB 更新 | `show ip route 3.3.3.3` | 主下一跳仍为 `10.0.12.2`，`repair path` 切换为 `10.0.15.2` |
| 7 | 转发检查 | `ping 3.3.3.3` | `0% packet loss` |
| 8 | 恢复初始状态 | DUTE 的 E-C 接口执行 `shutdown` | 见 4.4 |
| 9 | 等待 LFA 明细回退 | `show ip ospf fast-reroute per-prefix` | `3.3.3.3/32` 回到 `link 2.2.2.2 10.0.14.2` |
| 10 | 恢复后复查 | `show ip route 3.3.3.3` | `repair path` 回到 `10.0.14.2`，主下一跳始终不变 |

### 4.3 触发与流量发送

本用例不使用测试仪流量，触发方式为链路启停。

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 触发 1 | 在 DUTE 的 E-C 接口执行 `no shutdown` | C-E 邻居建立并达到 `Full`，LFA 重新计算 |
| 等待控制面 | `show ip ospf fast-reroute per-prefix` | `3.3.3.3/32` 变为 `link+node 2.2.2.2 10.0.15.2` |
| 等待 RIB | `show ip route 3.3.3.3` | 主下一跳仍为 `10.0.12.2`，`repair path` 切换为 `10.0.15.2` |
| 转发检查 | `ping 3.3.3.3` | `0% packet loss` |

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 链路恢复初始态 | 在 DUTE 的 E-C 接口执行 `shutdown` | C-E 邻居断开，LFA 回退 |
| 控制面复查 | `show ip ospf fast-reroute per-prefix` | `3.3.3.3/32` 回到 `link 2.2.2.2 10.0.14.2` |
| RIB 复查 | `show ip route 3.3.3.3` | `repair path` 回到 `10.0.14.2`，主下一跳始终为 `10.0.12.2` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | A~E 邻居 `Full`；C-E 随 E 侧接口启停出现或消失 |
| 表项面（LFA 明细） | `show ip ospf fast-reroute per-prefix` | `3.3.3.3/32` 的 `Type / Backup nbr` 从 `link / 10.0.14.2` 变为 `link+node / 10.0.15.2` |
| 表项面（OSPF 路由） | `show ip ospf route` | 存在 `3.3.3.3/32`，主路径经 B |
| 表项面（RIB） | `show ip route 3.3.3.3` | 主下一跳保持 `10.0.12.2`，`repair path` 随 LFA 更新 |
| 转发面 | `ping 3.3.3.3` | 丢包率 = 0% |
| 恢复 / 资源面 | 再次 `shutdown` E-C 后复查 LFA 明细与 RIB | `Type / Backup nbr` 与 `repair path` 回到初始值 |

### 4.6 判定标准

- 步骤 1：A~E 邻居按拓扑为 `Full`，C-E 因 E 侧 `shutdown` 不存在；`show ip ospf route` 中存在 `3.3.3.3/32`。
- 步骤 2：LFA 明细中 `3.3.3.3/32` 为 `link 2.2.2.2 10.0.14.2`。
- 步骤 3：`show ip route 3.3.3.3` 主下一跳 = `10.0.12.2`，`repair path` = `10.0.14.2`。
- 步骤 4 至 6：E-C 接口 `no shutdown` 且 C-E 邻居达到 `Full` 后，LFA 明细为 `link+node 2.2.2.2 10.0.15.2`，RIB 主下一跳仍为 `10.0.12.2`，`repair path` = `10.0.15.2`。
- 步骤 7：`ping 3.3.3.3` 丢包率 = 0%。
- 步骤 8 至 10：E-C 接口再次 `shutdown` 后，LFA 明细回到 `link 2.2.2.2 10.0.14.2`，`repair path` 回到 `10.0.14.2`，主下一跳保持 `10.0.12.2`。
- `Pass`：上述必检项全部满足，且第 5 章清理检查通过。
- `Fail`：`Type`、`Backup nbr` 或 RIB `repair path` 任一不满足，或清理后仍存在 OSPF、LFA 配置残留。
- `Blocked`：`show ip ospf fast-reroute per-prefix` 无 `Type` 列，或 `show ip route` 无 `repair path` 回显。

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

DUTE 需确保 E-C 接口先执行 `no shutdown`，再恢复二层状态。清理后检查：

```text
show running-config | include router ospf
show running-config | include fast-reroute
show ip ospf processes-count
show ip ospf neighbor
```

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 版本差异 | `Type` 列或 `repair path` 回显不可用时标记 `Blocked` |
| 2 | 保护类型语义 | D 的备份路径经过主下一跳节点 B，只能提供 link 保护；E 的路径绕开 B，才可提供 link+node 保护 |
| 3 | 复测记录 | 初次执行曾出现控制面 Type/Backup 已升级、RIB `repair path` 仍为 D 的现象；复测已正常，`Type`、`Backup nbr` 与 `repair path` 同步更新。历史记录见 `OSPF_LFA_RESEARCH.md` §6.1 |
| 4 | 清理要求 | 先删除 OSPF 进程，再恢复 E-C 接口和二层状态，确认 Loopback、LFA 配置无残留 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | `Pass` / `Fail` / `Blocked` |
| 实际观测 | 记录 LFA 明细中主备下一跳和 repair path、故障前后路由和 ping 结果 |
| 证据 | 回显 / 抓包文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0280` | | | |
