# RFC 6571 Triangle 原图中 MHP 和链路保护在单链路故障后保持可达

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0170-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0170`
- 用例标题：RFC 6571 Triangle 原图中 MHP 和链路保护在单链路故障后保持可达
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
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
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受 LFA 命令为准 |
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

拓扑名称 / 来源：`four_devices_topo_links_type_5`（内置拓扑）。

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
| LFA | `fast-reroute per-prefix enable` | 在初始 OSPF 配置中使能 |

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

DUTB（C2）按第 2 节地址与开销对称配置，并配置相同的 `192.0.2.1/32` loopback1；DUTC（E1）、DUTD（E2）按第 2 节地址配置两条上游链路。各设备在 `router ospf` 视图使能 `fast-reroute per-prefix enable`；全部邻居 `Full` 后，等待保护表刷新，再执行 4.2 基线检查。

### 4.2 基线检查与执行顺序

执行顺序：4.2 基线检查 → 4.3 触发与流量发送 → 4.4 恢复。

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 检查邻居 | `show ip ospf neighbor` | 所有直连邻居均为 `Full`；E1 的上游邻居 `10.255.0.1`、`10.255.0.2` 均为 `Full` |
| 2 | 检查 LFA 状态 | `show ip ospf fast-reroute per-prefix`（DUTC） | `Fast-reroute per-prefix : enabled`，`Calculation` 的 `runs` 大于 0，`Protected by LFA` 大于 0 |
| 3 | 检查 MHP ECMP | `show ip ospf route` | `192.0.2.1/32` 同时经 `via 10.1.3.1` 和 `via 10.2.3.1` |
| 4 | 检查 E1 到 E2 的 ECMP | `show ip ospf route` | `10.255.0.4/32` 同时经 `via 10.1.3.1` 和 `via 10.2.3.1` |
| 5 | 检查基线连通性 | `ping 192.0.2.1`、`ping 10.255.0.4` | 均为 `0% packet loss` |

> 同步说明：E1 的 `show ip ospf route` 先等待 `10.255.0.4/32` 出现，再做精确匹配；两个下一跳必须在同一路由块内，避免 SPF 收敛竞态和跨路由误匹配。

### 4.3 触发与流量发送

关闭 DUTC 的 `<PortA>`，模拟 E1-C1 链路故障：

```text
configure terminal
interface <PortA>
shutdown
end
```

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 故障 1 | DUTC 的 `<PortA>` 执行 `shutdown` | E1-C1 邻居断开，E1 到 MHP 的流量切换到 C2 |
| 路由切换 | 等待 `show ip route 192.0.2.1` 刷新 | 下一跳为 `10.2.3.1, via <接口>`；`show ip ospf route` 中 `192.0.2.1/32` 仅保留 `via 10.2.3.1` |
| 故障期间连通性 | `ping 192.0.2.1`、`ping 10.255.0.4` | 均为 `0% packet loss` |

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 链路恢复 | DUTC 的 `<PortA>` 执行 `no shutdown` | E1-C1 邻居重新为 `Full` |
| MHP ECMP 恢复 | `show ip ospf route` | `192.0.2.1/32` 重新同时经 `via 10.1.3.1` 和 `via 10.2.3.1` |
| 保护恢复 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| 恢复后连通性 | `ping 192.0.2.1` | `0% packet loss` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 故障前所有直连邻居 `Full`；恢复后 E1-C1 邻居重新 `Full` |
| 表项面 | `show ip ospf route` | 基线与恢复后 `192.0.2.1/32` 和 `10.255.0.4/32` 均为 `10.1.3.1` 与 `10.2.3.1` 的双下一跳；故障后 `192.0.2.1/32` 仅保留 `10.2.3.1` |
| 保护表面 | `show ip ospf fast-reroute per-prefix`（DUTC） | `Calculation` 的 `runs` 大于 0；`Protected by LFA` 故障前和恢复后均大于 0 |
| 转发面 | `ping 192.0.2.1`、`ping 10.255.0.4` | 故障前、故障期间和恢复后均为 `0% packet loss` |
| 恢复 / 资源面 | `show ip ospf neighbor`、`show ip ospf route` | 恢复后邻居和 MHP ECMP 回到基线 |

### 4.6 判定标准

- 4.2 步骤 1 至 5：所有直连邻居为 `Full`；`Fast-reroute per-prefix : enabled`，`Calculation` 的 `runs` 大于 0 且 `Protected by LFA` 大于 0；`192.0.2.1/32` 和 `10.255.0.4/32` 均形成 `10.1.3.1` 与 `10.2.3.1` 的双下一跳；2 个 ping 均为 `0% packet loss`。
- 4.3 步骤 1 至 3：`192.0.2.1/32` 仅保留 `10.2.3.1` 下一跳；`ping 192.0.2.1`、`ping 10.255.0.4` 均为 `0% packet loss`。
- 4.4 步骤 1 至 4：`192.0.2.1/32` 重新形成 `10.1.3.1` 与 `10.2.3.1` 的 ECMP；`Protected by LFA` 大于 0；`ping 192.0.2.1` 为 `0% packet loss`。
- 上述必检项全部满足，且清理后无 `router ospf`、`fast-reroute`、`loopback1` 残留 → `Pass`。
- 上述任一必检项不满足，或清理失败 → `Fail`。
- LFA 命令不可用、四设备 Triangle 拓扑无法建立或邻居无法 `Full` → `Blocked`，记录缺失项。

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
| 3 | 配置时序 | LFA 已在初始配置中使能，邻居 Full 后检查保护计数 |
| 4 | 观测限制 | MHP 逐前缀 LFA 条目可能不稳定；必检项为 ECMP、保护计数和故障后可达性 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | `Pass` / `Fail` / `Blocked` |
| 实际观测 | 记录邻居、LFA 计数、ECMP 下一跳、故障前后路由和 ping 结果 |
| 证据 | 回显 / 抓包文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0170` | | | |
