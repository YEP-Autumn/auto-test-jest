# OSPF LFA 大拓扑用例设计（9～12 台 DUT）

> 目的：在保留现有 4 设备快速回归用例的前提下，为 RFC 5286 / 6571 / 8518 的原图规模拓扑设计可执行用例。
> 本文是脚本编写前的设计文档；每个脚本完成后，再按“一个脚本一个文档”的规则补正式用例文档。
> 关联目录：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

## 1. 框架准备情况

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| 最多 12 台 DUT | 已扩展 | `DutIdx` / `DutName` 支持 `A~L` |
| DUT 端口 | 已扩展 | `Port.A~F`，`PortName` 支持最多 6 个端口 |
| 12 设备拓扑 | 已加入 | `twelve_devices_topo_links_type_1` |
| E~L 便捷方法 | 已加入 | `ExecConfigDutE~L`、`ReadyCheckDutE~L` 等 |
| 拓扑后端 | 已确认支持 | 支持任意 DUT 之间建链 |
| 隧道 / virtual-link | 已确认支持 GRE | GRE over Loopback 可承载 OSPF；`tunnel enable` 仅支持物理接口 |

当前 `Config.dut_list` 已配置 12 台设备；其中 DUTA~DUTD 为 e530，已扩展到 6 个端口，DUTB/DUTC/DUTD 可满足需要 5 口的用例。设备镜像已更换为支持 OSPF LFA 的版本。

> 设备备注：初版 0160 使用 `172.16.9.131`（S3708P）作为第 9 台设备时无法建立 OSPF 邻接，相关 9 设备拓扑已改用 DUTL（`172.16.9.140`，S8232）。`172.16.9.131` 的端口映射仍需单独核对。

## 2. 端口需求与设备数量

| 用例 | RFC 图示 | DUT 数 | 单节点最大端口数 | 备注 |
| --- | --- | --- | --- | --- |
| 0160 | RFC 6571 Figure 1 | 9 | 4 | 4 口即可 |
| 0170 | RFC 6571 Figure 2 原图 | 4 | 3 | 4 口即可 |
| 0190 | RFC 6571 Figure 3 原图 | 6 | 5 | A1/A2 需要 5 口；对应 DUTC/DUTD（6 口） |
| 0200 | RFC 6571 Figure 4 Square | 9 | 5 | C2/A1/A2 需要 5 口；对应 DUTB/DUTC/DUTD（6 口） |
| 0210 | RFC 6571 Figure 5 Extended U | 9 | 5 | C2/A1/A2 对应 DUTB/DUTC/DUTD（6 口）；另需隧道/virtual-link |
| 0220 | RFC 8518 Figure 2 | 6 | 3 | 4 口即可 |
| 0230 | RFC 8518 §4.2 | 5～6 | 4 | 双 ASBR 多归外部前缀 |
| 0240 | RFC 8518 Figure 1 | 7 | 4 | 4 口即可 |
| 0250 | RFC 8518 Figure 3 | 5 | 3 | MAX_METRIC 观测型 |
| 0260 | RFC 5286 Figure 7 | 9～11 | 4～5 | 9 台做等价裁剪，11 台可一比一 |

> 结论：当前 e530 的 DUTA~DUTD 已具备 6 口，0190/0200/0210 的一比一拓扑在端口上已满足；0210 仍取决于隧道/virtual-link 能力。

## 3. 通用设计约定

### 3.1 地址规划

为支持 9～12 台设备，新增用例统一使用可扩展地址：

```text
链路：10.<节点编号x>.<节点编号y>.0/24
  x/y = 1~12，对应 DUT A=1, B=2, ..., L=12
  低编号端用 .1，高编号端用 .2
Loopback0：10.255.0.<节点编号>/32
MHP/外部前缀：192.0.2.1/32 或 192.0.2.0/24
```

示例：A-B 链路为 `10.1.2.0/24`，A 侧 `10.1.2.1/24`，B 侧 `10.1.2.2/24`。

### 3.2 LFA 配置时序

大拓扑同样采用：

1. 先配置 OSPF，不使能 LFA；
2. 等待所有目标邻居 `Full`；
3. 确认关键目的路由已出现；
4. 再执行 `fast-reroute per-prefix enable`；
5. 等待 `Calculation` 的 `runs` 大于 0，再断言保护计数或逐前缀明细。

这样可以避开设备“邻接建立前使能 LFA 后保护表不刷新”的问题。

### 3.3 观测面

| 观测面 | 命令 | 用途 |
| --- | --- | --- |
| 邻居 | `show ip ospf neighbor` | 确认所有邻接 Full |
| 路由 | `show ip ospf route`、`show ip route <prefix>` | 主备下一跳、ECMP、故障切换 |
| LFA 汇总 | `show ip ospf fast-reroute per-prefix` | `Intra-area prefixes`、`Protected by LFA`、`Calculation runs` |
| LFA 明细 | `show ip ospf fast-reroute per-prefix` | 存在受保护前缀时的 `Prefix / Type / Primary nbr / Backup nbr` |
| 连通性 | `ping` | 收敛后 0% 丢包 |
| 恢复 | 恢复接口后重新查询 | 邻居、路由、保护计数恢复 |

### 3.4 判定原则

- 每脚本至少覆盖“协议状态面 + 表项面 + 转发面”三个观测面。
- LFA 保护计数只作为汇总判据；关键前缀尽量结合逐前缀明细或故障前后路由变化。
- MHP 逐前缀条目在部分场景不稳定，必须把“主备路径切换 + 故障后可达性”作为必检项，逐前缀条目作为观测项。
- 设备数不足、端口不足或隧道能力不足时，结论标记 `Blocked`，不把环境问题判为功能失败。

## 4. 用例设计

### 4.1 0160 — RFC 6571 Figure 1 Example 1

**设备映射（9 台）**

| DUT | 角色 |
| --- | --- |
| A | S |
| B | A |
| C | B |
| D | C |
| E | D |
| F | E |
| G | F |
| H | G |
| I | H |

**链路与开销**

| 链路 | 开销 |
| --- | --- |
| S-A | 7 |
| S-C | 10 |
| S-F | 5 |
| A-B | 7 |
| B-G | 1 |
| C-H | 1 |
| C-E | 6 |
| D-G | 10 |
| D-H | 10 |
| H-F | 10 |

> 说明：RFC 6571 Figure 1 原图共 10 条链路，没有 A-C 和 E-F 直连。

**测试重点**

- S 到 D 的主路径经 C（S-C-H-D），LFA 经 A 或 F。
- 邻居 Full 后使能 LFA，S 的 `Protected by LFA` 大于 0。
- 关闭 S-C，`ping D` 仍为 0% 丢包，路由切换到 S-A-B-G-D 或 S-F-H-D。
- 恢复 S-C 后回主路径，保护计数恢复。
- 同时校验 A 和 F 对 D 的 LFA 覆盖，验证 RFC 6571 “多个邻居可作为 LFA”。

**端口**：C 需要 4 口，其余不超过 3 口。

### 4.2 0170 — RFC 6571 Figure 2 Triangle 原图

**设备映射（4 台）**

| DUT | 角色 |
| --- | --- |
| A | C1 |
| B | C2 |
| C | E1 |
| D | E2 |

**链路与开销**

| 链路 | 开销 |
| --- | --- |
| C1-C2 | 1 |
| C1-E1 | 1 |
| C2-E1 | 1 |
| C1-E2 | 1 |
| C2-E2 | 1 |

**MHP P**

在 C1、C2 上配置相同的 `192.0.2.1/32` loopback，并发布到 OSPF，作为多归前缀 P。

**测试重点**

- E1 到 P 形成经 C1/C2 的 ECMP，`Protected by LFA` 大于 0。
- E1 到 E2 的 LFA 分别经 C1/C2 的另一个邻居。
- 关闭 E1-C1，E1 到 P/E2 仍可达，路由切换到 C2。
- 恢复后 ECMP 和 LFA 计数恢复。
- 用逐前缀明细记录 P 的 `Primary nbr / Backup nbr`。

**端口**：每台最多 3 口，4 口满足。

### 4.3 0190 — RFC 6571 Figure 3 Full Mesh 原图

**设备映射（6 台）**

| DUT | 角色 |
| --- | --- |
| A | C1 |
| B | C2 |
| C | A1 |
| D | A2 |
| E | E1 |
| F | E2 |

**链路与开销（全部 1）**

```text
C1-C2, C1-A1, C1-A2, C2-A1, C2-A2,
A1-A2,
A1-E1, A1-E2, A2-E1, A2-E2
```

**MHP P**：C1、C2 上配置相同 `192.0.2.1/32` loopback。

**测试重点**

- E1 到 P、E2、A1/A2 均存在 LFA。
- E1 到 P 或 E2 形成经 A1/A2 的 ECMP，关闭 E1-A1 后经 A2 恢复。
- A1 到 C1 的 LFA 经 A2-C2，验证 Full Mesh 的节点保护。
- 检查 `Protected by LFA` 随链路故障下降、恢复后回升。

**端口要求**：A1/A2 各需要 5 口（C1、C2、对端 A、E1、E2）。当前映射为 DUTC/DUTD，二者均已扩展到 6 口，满足要求。

### 4.4 0200 — RFC 6571 Figure 4 Square

**设备映射（9 台）**

| DUT | 角色 |
| --- | --- |
| A | C1 |
| B | C2 |
| C | A1 |
| D | A2 |
| E | A3 |
| F | A4 |
| G | E1 |
| H | E2 |
| I | E3 |

**链路与开销（全部 1）**

```text
C1-C2,
C1-A1, C1-A2, C2-A1, C2-A2, A1-A2,
A1-E1, A2-E1, A1-E2, A2-E2,
C2-A3, C2-A4, A3-A4,
A3-E3, A4-E3
```

**MHP P**：C1、C2 上配置相同 `192.0.2.1/32` loopback。

**测试重点**

- E1 到 P、E2、A3、E3 的 LFA 覆盖。
- E1 到 P 的主路径经 C1/A1/A2，关闭 E1-A1 后经 A2 恢复。
- 关闭 C2-C1，E3 仍经 A4/C2 或 A3 可达。
- 记录 C1 到 A1 的 LFA 缺失现象（RFC 6571 3.3.4：C1 对 A1 没有 LFA），作为负向观测项。
- 校验 `Protected by LFA` 在故障和恢复过程中的变化。

**端口要求**：C2、A1、A2 各需要 5 口。当前映射为 DUTB/DUTC/DUTD，三者均已扩展到 6 口，满足要求。

### 4.5 0210 — RFC 6571 Figure 5 Extended U

**拓扑**：与 0200 相同的 9 台设备、相同链路，但 **C1-C2 不作为 access 区域内的直连链路**。

**额外要求**

- C1 与 C2 之间需要一条隧道或 OSPF virtual-link，承载等价于 `c` 的路径。
- 候选实现：GRE tunnel over loopback、OSPF virtual-link 跨 transit area。
- 先做能力探测：
  - 是否支持 `interface tunnel` / GRE；
  - 是否支持 `area <id> virtual-link <router-id>`；
  - 隧道接口是否可作为 OSPF 接口并参与 LFA 计算。
- 若均不支持，标记 `Blocked`，保留设计文档，不强行用直连链路替代。

**测试重点**

- C1/C2 通过隧道形成逻辑邻居，access 区域不出现 C1-C2 直连。
- E1/E2/E3 的 LFA 覆盖与 0200 相同。
- 关闭 A1-E1，流量经 A2 和隧道路径恢复。
- 记录隧道开销对 LFA 无环条件的影响。

### 4.6 0220 — RFC 8518 Figure 2 MHP 原图

**设备映射（6 台）**

| DUT | 角色 |
| --- | --- |
| A | S |
| B | N1 |
| C | N2 |
| D | B |
| E | E |
| F | F |

**链路与开销**

| 链路 | 开销 |
| --- | --- |
| S-N2 | 4 |
| N2-B | 4 |
| S-B | 3 |
| S-N1 | 10 |
| N1-E | 5 |
| B-F | 1 |
| E-F | 16 |

**MHP P**

- E、F 上配置相同 `192.0.2.1/32` loopback，作为 P 的两个发布者。
- 按 RFC 文字保证 P 从 S 经 E、F 的路径等价：
  - E-P 开销取 5，使 S-N1-E-P = 10+5+5 = 20；
  - F-P 开销取 16，使 S-B-F-P = 3+1+16 = 20。
- 若设备不支持在 loopback 上配置 OSPF 开销，则用静态路由重分发并在路由表/LFA 明细中判定，不做 ping。

**测试重点**

- S 到 P 形成经 N1 和 B 的两条等价主路径。
- 关闭 S-B，P 仍经 N1 可达；关闭 S-N1，P 仍经 B 可达。
- 逐前缀明细记录 P 的两个主下一跳及各自 LFA。
- 验证“不同 ECMP 主下一跳应分别继承 LFA”。

**端口**：每台最多 3 口。

### 4.7 0230 — RFC 8518 §4.2 双 ASBR 多归外部前缀

**建议设备数**：5～6 台，优先复用 0220 的 6 台拓扑。

**拓扑**

- S、N1、N2、B、E、F 六台设备。
- E、F 作为两个 ASBR，分别用 `redistribute connected` 或 `redistribute static` 发布同一个外部前缀 `192.0.2.0/24`。
- 外部前缀使用 Type-2、相同 metric（如 20），满足 RFC 8518 4.2.1 的“同类型、同 cost”前置条件。

**测试重点**

- S 的 OSPF 路由表出现 `E2 192.0.2.0/24`。
- 主 ASBR 路径故障后，备用 ASBR 路径仍可达。
- 若两个 ASBR 到 S 的 cost 相同，检查是否形成 ECMP；若不同，检查是否按 RFC 8518 4.2.1 选择备用 ASBR。
- 关闭 S-B 或 S-N1，观察外部前缀的下一跳切换。
- 记录 `show ip ospf route` 中的 E2 条目和 `show ip route` 的下一跳。

**注意**：本用例验证的是“备用 ASBR 可达性与选择”，不是完整的 Type-1/Type-2 全部规则；Type-1 与 Type-2 的差异可在后续拆成独立子用例。

### 4.8 0240 — RFC 8518 Figure 1 同主下一跳 MHP

**设备映射（7 台）**

| DUT | 角色 |
| --- | --- |
| A | S |
| B | A |
| C | B |
| D | C |
| E | E |
| F | M |
| G | F |

**链路与开销**

| 链路 | 开销 |
| --- | --- |
| S-A | 8 |
| S-C | 5 |
| S-E | 5 |
| A-B | 5 |
| B-F | 5 |
| C-E | 5 |
| E-M | 4 |
| M-F | 1 |
| E-P | 10 |
| F-P | 5 |

> 说明：RFC 8518 Figure 1 中没有 A-E 直连；S 到 E 为直连 5，S 到 F 经 E-M-F 为 10，因此 E、F 两个发布者共享主下一跳 E。

**MHP P**：E、F 上配置相同 `192.0.2.1/32` loopback。

**测试重点**

- S 到 E、F 的主下一跳均收敛到 E，验证共享同一主下一跳的 MHP。
- P 的两个发布者共享主下一跳时，S 应优先继承节点保护更好的 LFA。
- 关闭主下一跳链路，P 仍可达，记录实际备份下一跳。
- 逐前缀明细记录 P 的 `Primary nbr / Backup nbr`。
- 对照 RFC 8518 3.1：共享主下一跳的 MHP 不应只按单一最优发布者做简化计算。

**端口**：E 需要 4 口，其余不超过 3 口。

### 4.9 0250 — RFC 8518 Figure 3 IGP MAX_METRIC

**设备映射（5 台）**

| DUT | 角色 |
| --- | --- |
| A | S |
| B | N1 |
| C | N2 |
| D | D1 |
| E | D2 |

**链路与开销**

| 链路 | 开销 |
| --- | --- |
| S-N1 | 10 |
| N1-D1 | 10 |
| S-N2 | 10 |
| N2-S 反向 | MAX_METRIC（OSPF 65535） |
| N2-D1 | 10 |
| N2-D2 | 10 |

**测试重点**

- S 到 D1 的主路径经 N1，N2 是候选 LFA。
- N2 到 S 的反向开销为 MAX_METRIC；按 RFC 8518 5.1，该链路仍可能作为 D1 的 LFA，因为 S 到 D2 的主流量仍使用它。
- 分别记录：
  - `Protected by LFA` 是否包含 D1；
  - 关闭 S-N1 后，S 到 D1 是否切换到 N2；
  - N2 的 LFA 状态和逐前缀明细。
- 若设备直接排除 MAX_METRIC 反向链路，记录为“实现差异”，不判失败；用例结论标记 `Blocked` 或 `Pass with observation`。

**端口**：N2 最多 3 口。

### 4.10 0260 — RFC 5286 Appendix A / Figure 7

**原图规模**：约 10～11 台设备，包含多区域 ABR/ASBR 和区域穿越。

**方案 A：11 台一比一**

- 按 Figure 7 节点 F/C/N/A/S/B/G/E/H/X/ASBR 建图。
- 验证 S 认为 N 是到 ASBR 的 LFA，但 N 经 A 进入 area 2，A 又经 F/B 绕回 S，形成区域穿越环路。
- 断言：S 的 LFA 计算若仅基于本地 area 1 会误判；实际转发应通过路由收敛避免持久环路。
- 需要在 11 台设备上配置 area 0/1/2，并让 ASBR 同时属于多个区域。

**方案 B：9 台等价裁剪（推荐先做）**

保留核心环路 `S → N → A → F → B → S`，加上 area1 的 `S-E-X-ASBR` 路径：

| DUT | 角色 | 区域 |
| --- | --- | --- |
| A | S | area 1 |
| B | N | area 1 |
| C | A（ABR） | area 1 + area 2 + backbone |
| D | F（area 2 转接） | area 2 |
| E | B（ABR） | area 1 + area 2 + backbone |
| G | E | area 1 |
| H | X | area 1 |
| K | ASBR | area 1 + area 2 |

**核心链路**

```text
S-N 40, N-A 5, S-E 5, E-X 5, X-ASBR 5, B-S 5,
A-ASBR 35（area 1）,
A-F 5, F-B 5, B-ASBR 22（area 2）,
A-B 100（backbone）
```

> 实现备注：ASBR 初版放在 DUTF（`172.16.9.113`），其两条同矩阵（110）链路分属 area 1/area 2，被拓扑后端放入同一广播域后邻居停在 `Init`。现已把 ASBR 改到 DUTK（`172.16.9.120`，106 矩阵），避免同矩阵跨区域。

**测试重点**

- ASBR 在 area 1 和 area 2 同时宣告。
- A（ABR）经 area 2 到 ASBR 的开销小于 area 1。
- B（ABR）经 area 1 到 ASBR 的开销小于 area 2。
- S 的 LFA 候选 N 经 A 进入 area 2，再经 F/B 回到 S。
- 观察设备是否仅基于本地 area 拓扑选择 LFA；记录实际环路风险和收敛后的可达性。
- 结论重点记录“LFA 基于本地区域拓扑不足”的现象，不要求毫秒级丢包指标。

**端口**：核心节点最多 4 口；11 台版本需要按原图重新核算。

## 5. 实施与验证状态

| 用例 | 设备数 | 拓扑定义 | 状态 | 实测耗时 |
| --- | --- | --- | --- | --- |
| 0160 | 9 | `nine_devices_topo_links_type_1` | 通过 | 131.7 s |
| 0170 | 4 | `four_devices_topo_links_type_5` | 通过 | 117.5 s |
| 0190 | 6 | `six_devices_topo_links_type_4` | 通过 | 119.7 s |
| 0200 | 9 | `nine_devices_topo_links_type_2` | 通过 | 145.9 s |
| 0210 | 9 | `nine_devices_topo_links_type_3` + GRE | 通过 | 188.8 s |
| 0220 | 6 | `six_devices_topo_links_type_3` | 通过 | 114.6 s |
| 0230 | 6 | `six_devices_topo_links_type_3` | 通过 | 130.4 s |
| 0240 | 7 | `seven_devices_topo_links_type_1` | 通过 | 110.6 s |
| 0250 | 5 | `five_devices_topo_links_type_1` | 通过 | 115.9 s |
| 0260 | 9 | `nine_devices_topo_links_type_4` | 通过 | 137.6 s |

> 0190 的远端 MHP 在 DUTE 上只安装单条最优路径，脚本已改为按可达性和下一跳切换判定，不强制 ECMP。
> 0210 使用 GRE over Loopback 模拟 C1/C2 逻辑链路；`tunnel enable` 仅支持物理接口，tunnel 接口无需配置。
> 0260 初版 ASBR 放在 DUTF/113（110 矩阵）或 DUTL/140（110 矩阵）时，多区域邻居会停在 `Init`；改到 DUTK/120（106 矩阵）后通过。拓扑后端对多矩阵/多区域的链路下发存在偶发不稳定，失败时优先复跑确认。

## 6. 阻塞条件

| 条件 | 处理 |
| --- | --- |
| DUT 数少于用例要求 | `Blocked`，脚本可先写但不在默认回归执行 |
| 节点端口数不足 | 使用简化拓扑或 `Blocked`；不改变 RFC 判定条件 |
| 隧道/virtual-link 不支持 | `0210` 标记 `Blocked` |
| MAX_METRIC 行为不支持 | `0250` 记录实现差异，结论按观测型处理 |
| MHP 逐前缀条目不稳定 | 必检项退化为路由切换和 ping，逐前缀明细作为观测项 |
| 设备 LFA 命令缺失 | `Blocked`，不判功能失败 |
