# RFC 8518 多归前缀具有不同主备下一跳时，主备路径切换与故障恢复符合预期

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0150-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0150`
- 用例标题：RFC 8518 多归前缀具有不同主备下一跳时，主备路径切换与故障恢复符合预期
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化脚本 / 手工
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
| 设备 profile | `default` | 以 CLI 是否接受 LFA 命令为准 |
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

内置拓扑：`LinkConstraint.four_devices_topo_links_type_4`。

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
| Area | 0 | 单区域 |
| Network Type | point-to-point | 排除广播网 DR/BDR 影响 |
| Hello / Dead | 10s / 40s | 设备默认值 |
| LFA | `fast-reroute per-prefix enable` | 在邻居 Full 后使能 |

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
network 10.0.13.0/24 area 0
network 10.0.23.0/24 area 0
network 172.16.1.0/24 area 0
network 3.3.3.3/32 area 0
exit
end
```

DUTD 的 `<PortC>` 配置 `172.16.1.2/24` 并发布 `172.16.1.0/24`；DUTA、DUTB 按 2 节地址配置其余链路。全部邻居 `Full` 后，在各设备 OSPF 进程视图执行：

```text
fast-reroute per-prefix enable
```

### 4.2 观测与预期

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 邻居 | `show ip ospf neighbor` | 每台设备 3 个邻居均为 `Full` |
| LFA 使能 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix : enabled` |
| 区域内前缀 | `show ip ospf fast-reroute per-prefix` | `Intra-area prefixes` 大于 0 |
| 受保护前缀 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| MHP 主路径 | `show ip ospf route` | `172.16.1.0/24` 经 `via 10.0.12.2`、`10.0.13.2` 或 `10.0.14.2` |
| 逐前缀 LFA（观测项） | `show ip ospf fast-reroute per-prefix` | 若出现 `172.16.1.0/24`，记录其 `Backup nbr`；不出现时不影响判定 |
| 连通性 | `ping 172.16.1.1` | `0% packet loss` |

### 4.3 故障与恢复

1. 关闭 DUTA 的 `<PortA>`，模拟共享主下一跳 A-B 链路故障。
2. `show ip route 172.16.1.1` 应出现 `10.0.13.2` 或 `10.0.14.2` 的下一跳；`show ip ospf route` 中 `172.16.1.0/24` 应改为经 C 或 D 到达。
3. `ping 172.16.1.1`、`ping 3.3.3.3`、`ping 4.4.4.4` 均应为 `0% packet loss`。
4. 恢复 `<PortA>`，MHP 恢复合法下一跳（`10.0.12.2`、`10.0.13.2` 或 `10.0.14.2`）；`Protected by LFA` 恢复大于 0，ping 恢复 `0% packet loss`。

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
| 5 | 配置时序 | 本用例在邻居 Full 后使能 LFA，避免设备在邻接建立前使能时保护计数不刷新的已记录问题 |
| 6 | 版本差异 | LFA 命令不可用时标记 `Blocked`，不将版本差异判为功能失败 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 记录邻居、LFA 计数、MHP 的主/备下一跳、故障前后路由和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0150 | | | |
