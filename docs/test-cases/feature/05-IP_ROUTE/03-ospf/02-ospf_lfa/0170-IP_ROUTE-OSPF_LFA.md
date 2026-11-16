# RFC 6571 Triangle 原图中 MHP 和链路保护在单链路故障后保持可达

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0170-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0170`
- 用例标题：RFC 6571 Triangle 原图中 MHP 和链路保护在单链路故障后保持可达
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化脚本 / 手工
- 预估耗时：约 6 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与最短路径计算 |
| RFC 5286 | 3.1、3.2、6.1 | 链路保护 LFA、节点保护、MHP |
| RFC 6571 | 3.1、Figure 2 | Triangle 原图的 LFA 适用性 |
| RFC 8518 | 2、3 | 多归前缀的 LFA 选择 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `default` | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | 每台设备 2～3 个三层接口 | 接口需支持 `no switchport` |
| 拓扑后端 | 四设备 Triangle 拓扑可建立 | 邻居无法 Full 时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
       C1 = DUTA ---- DUTB = C2
         | \          / |
         |   \      /   |
         |     \  /     |
         |     /  \     |
         |   /      \   |
         | /          \ |
       E1 = DUTC ---- DUTD = E2
```

内置拓扑：`LinkConstraint.four_devices_topo_links_type_5`。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| C1-C2 | 10.1.2.0/24 | C1=10.1.2.1，C2=10.1.2.2 | 1 |
| C1-E1 | 10.1.3.0/24 | C1=10.1.3.1，E1=10.1.3.2 | 1 |
| C2-E1 | 10.2.3.0/24 | C2=10.2.3.1，E1=10.2.3.2 | 1 |
| C1-E2 | 10.1.4.0/24 | C1=10.1.4.1，E2=10.1.4.2 | 1 |
| C2-E2 | 10.2.4.0/24 | C2=10.2.4.1，E2=10.2.4.2 | 1 |
| Loopback0 | 主机路由 | C1=10.255.0.1/32，C2=10.255.0.2/32，E1=10.255.0.3/32，E2=10.255.0.4/32 | 1 |
| MHP P | 主机路由 | 192.0.2.1/32，C1/C2 双端发布 | 1 |

C1、C2 上配置相同的 `192.0.2.1/32` 作为 anycast/MHP。必须显式配置 OSPF `router-id`，否则最高 loopback 地址相同会导致 Router ID 冲突。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Router ID | C1=10.255.0.1、C2=10.255.0.2、E1=10.255.0.3、E2=10.255.0.4 | 显式配置 |
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

DUTA（C1）：

```text
configure terminal
interface <PortA>
no switchport
ip address 10.1.2.1/24
ip ospf network point-to-point
ip ospf cost 1
exit
interface <PortB>
no switchport
ip address 10.1.3.1/24
ip ospf network point-to-point
ip ospf cost 1
exit
interface <PortC>
no switchport
ip address 10.1.4.1/24
ip ospf network point-to-point
ip ospf cost 1
exit
interface loopback0
ip address 10.255.0.1/32
exit
interface loopback1
ip address 192.0.2.1/32
exit
router ospf
router-id 10.255.0.1
network 10.1.2.0/24 area 0
network 10.1.3.0/24 area 0
network 10.1.4.0/24 area 0
network 10.255.0.1/32 area 0
network 192.0.2.1/32 area 0
exit
end
```

DUTB（C2）按 2 节地址与开销对称配置，并配置相同的 `192.0.2.1/32` loopback1；DUTC（E1）、DUTD（E2）按 2 节地址配置两条上游链路。全部邻居 `Full` 后，在各设备 OSPF 进程视图执行：

```text
fast-reroute per-prefix enable
```

### 4.2 观测与预期

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 邻居 | `show ip ospf neighbor` | E1/E2 的两个上游邻居均为 `Full` |
| LFA 使能 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix : enabled` |
| LFA 计算 | `show ip ospf fast-reroute per-prefix` | `Calculation` 的 `runs` 大于 0 |
| 受保护前缀 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| MHP ECMP | `show ip ospf route` | `192.0.2.1/32` 同时经 `via 10.1.3.1` 和 `via 10.2.3.1` |
| E1 到 E2 | `show ip ospf route` | `10.255.0.4/32` 同时经 `via 10.1.3.1` 和 `via 10.2.3.1` |
| 连通性 | `ping 192.0.2.1`、`ping 10.255.0.4` | 均为 `0% packet loss` |

### 4.3 故障与恢复

1. 关闭 DUTC 的 `<PortA>`，模拟 E1-C1 链路故障。
2. `show ip route 192.0.2.1` 应出现 `10.2.3.1, via <接口>`；`show ip ospf route` 中 `192.0.2.1/32` 应只保留 `via 10.2.3.1`。
3. `ping 192.0.2.1`、`ping 10.255.0.4` 均应为 `0% packet loss`。
4. 恢复 `<PortA>`，MHP 重新形成 ECMP，`Protected by LFA` 恢复大于 0，ping 恢复 `0% packet loss`。

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
interface <PortB/PortC>
no shutdown
no ip ospf cost
no ip ospf network
no ip address
switchport
exit
no interface loopback0
no interface loopback1
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
| 1 | 拓扑说明 | 本用例为 RFC 6571 Figure 2 原图的 4 设备版本，保留 C1/C2/E1/E2 和 C1-C2、C1/E1、C2/E1、C1/E2、C2/E2 全部 5 条链路 |
| 2 | MHP 说明 | `192.0.2.1/32` 在 C1、C2 上重复配置，属于 anycast/MHP；必须显式配置 Router ID |
| 3 | 配置时序 | 邻居 Full 后再使能 LFA，避免设备保护表不刷新的已知问题 |
| 4 | 观测限制 | MHP 逐前缀 LFA 条目可能不稳定；必检项为 ECMP、保护计数和故障后可达性 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 记录邻居、LFA 计数、MHP 的 ECMP 下一跳、故障前后路由和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0170 | | | |
