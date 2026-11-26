# RFC 8518 多归前缀具有不同主备下一跳时，主路径故障后切换到备份路径并恢复可达

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0150-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0150`
- 用例标题：RFC 8518 多归前缀具有不同主备下一跳时，主路径故障后切换到备份路径并恢复可达
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
- 预估耗时：约 6 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与最短路径计算 |
| RFC 5286 | 6.1 | 多归前缀（MHP）的 LFA 计算 |
| RFC 8518 | 2、3、Figure 2 | MHP 的 LFA 不等式；不同前缀发布者对应不同下一跳时应保留独立备份 |
| RFC 8518 | 4.2 | OSPF 外部/多归前缀的备用下一跳选择规则 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | 每台设备 3 个三层接口 | 接口需支持 `no switchport` |
| 拓扑后端 | 四设备全互联拓扑可建立 | 邻居无法 Full 时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

四台设备两两全互联，A-C 链路开销为 2，其余链路开销为 1。C 与 D 之间的链路网段为 `172.16.1.0/24`，由 C、D 两端同时发布，因此该网段是一个多归前缀（MHP）。

```text
   A-B: DUTA PortA <=> DUTB PortA
   A-C: DUTA PortB <=> DUTC PortA
   A-D: DUTA PortC <=> DUTD PortA
   B-C: DUTB PortB <=> DUTC PortB
   B-D: DUTB PortC <=> DUTD PortB
   C-D: DUTC PortC <=> DUTD PortC（172.16.1.0/24）
```

拓扑名称 / 来源：`four_devices_topo_links_type_4`（内置拓扑）。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| A-B | 10.0.12.0/24 | A=10.0.12.1，B=10.0.12.2 | 1 |
| A-C | 10.0.13.0/24 | A=10.0.13.1，C=10.0.13.2 | 2 |
| A-D | 10.0.14.0/24 | A=10.0.14.1，D=10.0.14.2 | 1 |
| B-C | 10.0.23.0/24 | B=10.0.23.1，C=10.0.23.2 | 1 |
| B-D | 10.0.24.0/24 | B=10.0.24.1，D=10.0.24.2 | 1 |
| C-D | 172.16.1.0/24 | C=172.16.1.1，D=172.16.1.2 | 1 |
| Loopback0 | 主机路由 | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32，D=4.4.4.4/32 | 1 |

A 到 `172.16.1.1` 的最优下一跳可能随收敛顺序为 B（`10.0.12.2`）、C（`10.0.13.2`）或 D（`10.0.14.2`）。MHP 的两个发布者对应不同的主/备下一跳。按 RFC 8518 Figure 2 的“不同前缀发布者对应不同下一跳”思路，A 应为该 MHP 保留独立的备份下一跳。

实测当前版本对 MHP 的逐前缀备份条目不稳定：部分运行会在 `show ip ospf fast-reroute per-prefix` 中给出 MHP 的独立条目，部分运行只保留其他前缀的保护计数。因此本用例把“MHP 主路径 + A-B 故障后可达性”作为必检项，把逐前缀 MHP 条目作为观测项记录。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Router ID | A=1.1.1.1、B=2.2.2.2、C=3.3.3.3、D=4.4.4.4 | 与 Loopback0 一致 |
| Area | 0 | 单区域 |
| Network Type | point-to-point | 排除广播网 DR/BDR 影响 |
| Hello / Dead | 10s / 40s | 设备默认值 |
| LFA | `fast-reroute per-prefix enable` | 在初始 OSPF 配置中使能 |

### 3.2 初始状态

- 接口处于默认二层状态；OSPF 进程、Loopback、L3 地址和 LFA 配置为空。
- 拓扑后端已建立并启用对应链路。
- 现场保留：默认清理。

## 4. 测试步骤与预期结果

### 4.1 配置

DUTC：

```text
configure terminal
interface <PortA>
no switchport
ip address 10.0.13.2/24
ip ospf network point-to-point
ip ospf cost 1
exit
interface <PortB>
no switchport
ip address 10.0.23.2/24
ip ospf network point-to-point
ip ospf cost 1
exit
interface <PortC>
no switchport
ip address 172.16.1.1/24
ip ospf network point-to-point
ip ospf cost 1
exit
interface loopback0
ip address 3.3.3.3/32
exit
router ospf
router-id 3.3.3.3
network 10.0.13.0/24 area 0
network 10.0.23.0/24 area 0
network 172.16.1.0/24 area 0
network 3.3.3.3/32 area 0
exit
end
```

DUTD 的 `<PortC>` 配置 `172.16.1.2/24` 并发布 `172.16.1.0/24`；DUTA、DUTB 按第 2 节地址配置其余链路。各设备在 `router ospf` 视图显式配置与 Loopback0 一致的 `router-id`，并使能 `fast-reroute per-prefix enable`；全部邻居 `Full` 后，等待保护表刷新，再执行 4.2 基线检查。

### 4.2 基线检查与执行顺序

执行顺序：4.2 基线检查 → 4.3 触发与流量发送 → 4.4 恢复。

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 检查邻居 | `show ip ospf neighbor` | 每台设备 3 个邻居均为 `Full` |
| 2 | 检查 LFA 状态 | `show ip ospf fast-reroute per-prefix`（DUTA） | `Fast-reroute per-prefix : enabled`，`Intra-area prefixes` 大于 0，`Protected by LFA` 大于 0 |
| 3 | 检查 MHP 主路径 | `show ip ospf route` | `172.16.1.0/24` 经 `10.0.12.2`、`10.0.13.2` 或 `10.0.14.2`，记录实际下一跳 |
| 4 | 检查逐前缀 MHP 条目（观测项） | `show ip ospf fast-reroute per-prefix` | 若出现 `172.16.1.0/24`，记录其 `Backup nbr`；该条目不影响判定 |
| 5 | 检查基线连通性 | `ping 172.16.1.1` | `0% packet loss` |

### 4.3 触发与流量发送

关闭 DUTA 的 `<PortA>`，模拟共享主下一跳 A-B 链路故障：

```text
configure terminal
interface <PortA>
shutdown
end
```

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 故障 1 | DUTA 的 `<PortA>` 执行 `shutdown` | A-B 邻居断开，MHP 的共享主下一跳失效 |
| MHP 路由切换 | 等待 `show ip route 172.16.1.1` 刷新 | 下一跳为 `10.0.13.2` 或 `10.0.14.2`；`show ip ospf route` 中 `172.16.1.0/24` 改经 C 或 D 到达 |
| 故障期间连通性 | `ping 172.16.1.1`、`ping 3.3.3.3`、`ping 4.4.4.4` | 均为 `0% packet loss` |

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 链路恢复 | DUTA 的 `<PortA>` 执行 `no shutdown` | A-B 邻居重新为 `Full` |
| MHP 主路径恢复 | `show ip ospf route` | `172.16.1.0/24` 恢复合法下一跳：`10.0.12.2`、`10.0.13.2` 或 `10.0.14.2` |
| 保护恢复 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| 恢复后连通性 | `ping 172.16.1.1` | `0% packet loss` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 故障前 3 个邻居均为 `Full`；恢复后 A-B 邻居重新为 `Full` |
| 表项面 | `show ip ospf route` | `172.16.1.0/24` 存在；故障后改经 C 或 D，恢复后为 `10.0.12.2`、`10.0.13.2` 或 `10.0.14.2` |
| 保护表面 | `show ip ospf fast-reroute per-prefix`（DUTA） | `Protected by LFA` 故障前大于 0，恢复后大于 0；MHP 逐前缀条目仅作记录 |
| 转发面 | `show ip route 172.16.1.1`、`ping` | 故障前后均有有效下一跳；3 个 ping 均为 `0% packet loss` |
| 恢复 / 资源面 | `show ip ospf neighbor`、`show ip ospf route` | 恢复后邻居、MHP 主路径和保护计数回到基线 |

### 4.6 判定标准

- 4.2 步骤 1 至 3、5：每台设备 3 个邻居均为 `Full`；`Fast-reroute per-prefix : enabled`，`Intra-area prefixes` 大于 0 且 `Protected by LFA` 大于 0；`172.16.1.0/24` 经 `10.0.12.2`、`10.0.13.2` 或 `10.0.14.2`；`ping 172.16.1.1` 为 `0% packet loss`。步骤 4 的 MHP 逐前缀条目仅记录，不计入判定。
- 4.3 步骤 1 至 3：`172.16.1.1` 的下一跳切换为 `10.0.13.2` 或 `10.0.14.2`；`172.16.1.0/24` 改经 C 或 D；3 个 ping 均为 `0% packet loss`。
- 4.4 步骤 1 至 4：`172.16.1.0/24` 恢复 `10.0.12.2`、`10.0.13.2` 或 `10.0.14.2` 的合法下一跳；`Protected by LFA` 大于 0；`ping 172.16.1.1` 为 `0% packet loss`。
- 若形成 MHP ECMP，`show ip ospf route` 出现双下一跳且 `ping 172.16.1.1` 为 `0% packet loss`，判为满足主路径要求。
- 上述必检项全部满足，且清理后无 `router ospf`、`fast-reroute` 残留 → `Pass`。
- 上述任一必检项不满足，或清理失败 → `Fail`。
- LFA 命令不可用、四设备全互联拓扑无法建立、邻居无法 `Full` 或接口数量不足 → `Blocked`，记录缺失项。

## 5. 清理与恢复

各设备执行：

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
```

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 拓扑裁剪 | RFC 8518 Figure 2 使用 6 个节点；受四设备环境限制，本用例用四设备全互联构造“MHP 两个发布者对应不同下一跳”的核心条件 |
| 2 | 拓扑设计 | A-C 开销设为 2，构造 MHP 两个发布者对应不同下一跳的场景；现场最优下一跳可能随收敛顺序变化 |
| 3 | 设备实测差异 | 若现场形成 MHP ECMP，MHP 可能不再单独出现在 LFA 表中；此时以 `show ip ospf route` 双下一跳和故障后可达性作为补充判据 |
| 4 | 观测限制 | 设备在存在受保护前缀时提供逐前缀 `Type`、`Primary nbr`、`Backup nbr` 明细；MHP 条目是否出现取决于当前实现和收敛时序，本用例仅作观测记录 |
| 5 | 配置时序 | 本用例在初始 OSPF 配置中使能 LFA，邻居 Full 后检查保护计数与路由收敛 |
| 6 | 版本差异 | LFA 命令不可用时标记 `Blocked`，将版本差异记录为环境限制 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | `Pass` / `Fail` / `Blocked` |
| 实际观测 | 记录邻居、LFA 计数、MHP 的主/备下一跳、故障前后路由和 ping 结果 |
| 证据 | 回显 / 抓包文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0150` | | | |
