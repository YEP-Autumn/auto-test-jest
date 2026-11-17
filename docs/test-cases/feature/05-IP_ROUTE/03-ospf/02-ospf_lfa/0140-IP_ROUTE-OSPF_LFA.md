# RFC 6571 Full Mesh 拓扑中所有目的前缀均有 LFA，单链路故障后仍可达

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0140-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0140`
- 用例标题：RFC 6571 Full Mesh 拓扑中所有目的前缀均有 LFA，单链路故障后仍可达
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化脚本 / 手工
- 预估耗时：约 6 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与最短路径计算 |
| RFC 5286 | 3.1、3.2、3.4 | 基本无环条件、节点保护、ECMP 与 LFA 共存 |
| RFC 6571 | 3.2、Figure 3 | Full Mesh 拓扑的链路保护和节点保护覆盖 |
| RFC 6571 | 3.8 | Full Mesh 的逐前缀 LFA 与逐链路 LFA 覆盖相同 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `default` | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | 每台设备 3 个三层接口 | 接口需支持 `no switchport` |
| 拓扑后端 | 四设备全互联拓扑可建立 | 邻居无法 Full 时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

四台设备两两全互联，共 6 条链路，全部开销 1：

```text
   A-B: DUTA PortA <=> DUTB PortA
   A-C: DUTA PortB <=> DUTC PortA
   A-D: DUTA PortC <=> DUTD PortA
   B-C: DUTB PortB <=> DUTC PortB
   B-D: DUTB PortC <=> DUTD PortB
   C-D: DUTC PortC <=> DUTD PortC
```

内置拓扑：`LinkConstraint.four_devices_topo_links_type_4`。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| A-B | 10.0.12.0/24 | A=10.0.12.1，B=10.0.12.2 | 1 |
| A-C | 10.0.13.0/24 | A=10.0.13.1，C=10.0.13.2 | 1 |
| A-D | 10.0.14.0/24 | A=10.0.14.1，D=10.0.14.2 | 1 |
| B-C | 10.0.23.0/24 | B=10.0.23.1，C=10.0.23.2 | 1 |
| B-D | 10.0.24.0/24 | B=10.0.24.1，D=10.0.24.2 | 1 |
| C-D | 10.0.34.0/24 | C=10.0.34.1，D=10.0.34.2 | 1 |
| Loopback0 | 主机路由 | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32，D=4.4.4.4/32 | 1 |

全互联拓扑中，A 到 B、C、D 都存在直连主路径和至少一条绕行路径。任一单条链路故障后，目的前缀仍可通过另外两台设备绕行。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
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
ip address 10.0.13.1/24
ip ospf network point-to-point
ip ospf cost 1
exit
interface <PortC>
no switchport
ip address 10.0.14.1/24
ip ospf network point-to-point
ip ospf cost 1
exit
interface loopback0
ip address 1.1.1.1/32
exit
router ospf
network 10.0.12.0/24 area 0
network 10.0.13.0/24 area 0
network 10.0.14.0/24 area 0
network 1.1.1.1/32 area 0
exit
end
```

DUTB、DUTC、DUTD 按 2 节地址与开销对称配置。全部邻居 `Full` 后，在各设备 OSPF 进程视图执行：

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
| A 到 B | `show ip ospf route` | `2.2.2.2/32` 经 `via 10.0.12.2` |
| A 到 C | `show ip ospf route` | `3.3.3.3/32` 经 `via 10.0.13.2` |
| A 到 D | `show ip ospf route` | `4.4.4.4/32` 经 `via 10.0.14.2` |
| 连通性 | `ping 2.2.2.2`、`ping 3.3.3.3`、`ping 4.4.4.4` | 均为 `0% packet loss` |

### 4.3 故障与恢复

1. 关闭 DUTA 的 `<PortB>`，模拟 A-C 直连链路故障。
2. `show ip route 3.3.3.3` 应出现 `10.0.12.2` 或 `10.0.14.2` 的下一跳；`show ip ospf route` 中 `3.3.3.3/32` 应经 A-B-C 或 A-D-C 到达。
3. `ping 3.3.3.3`、`ping 2.2.2.2`、`ping 4.4.4.4` 均应为 `0% packet loss`。
4. 恢复 `<PortB>`，路由回到 `via 10.0.13.2`，`Protected by LFA` 恢复大于 0，ping 恢复 `0% packet loss`。

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
| 1 | 拓扑扩展 | 为覆盖 RFC 6571 Figure 3，本次在 `LinkConstraint` 中新增 `four_devices_topo_links_type_4` 四设备全互联拓扑 |
| 2 | 观测限制 | 设备只提供汇总保护计数，不提供逐前缀备份下一跳明细；通过路由表、保护计数和 ping 联合判定 |
| 3 | 配置时序 | 本用例在初始 OSPF 配置中使能 LFA，邻居 Full 后检查保护计数与路由收敛 |
| 4 | 版本差异 | LFA 命令不可用时标记 `Blocked`，不将版本差异判为功能失败 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 记录邻居、LFA 计数、故障前后下一跳和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0140 | | | |
