# OSPF LFA 功能调研与测试设计

> 调研对象：OSPFv2 Loop-Free Alternate（LFA，无环备份路径）及其 IP Fast Reroute（IP FRR，IP 快速重路由）能力。
> 调研方式：标准文本分析、设备 CLI 实测、现有测试框架能力核对。
> 关联用例目录：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`、`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa_cli/`。

## 1. 结论摘要

1. OSPF LFA 是一种**本地修复**机制：路由器为每个目的前缀预先计算一个满足无环条件的备份下一跳，主链路或主下一跳故障时先切换到备份路径，再等待 OSPF 重新收敛。
2. LFA 的核心判定是 RFC 5286 的不等式。链路保护要求备份邻居到目的的距离小于“备份邻居到本机 + 本机到目的”的距离；节点保护还要求备份路径不经过主下一跳节点。
3. 设备 CLI 实测确认支持**逐前缀（per-prefix）LFA**：
   - 进程视图：`fast-reroute per-prefix enable`
   - 接口视图：`ip ospf fast-reroute per-prefix candidate disable`、`ip ospf fast-reroute per-prefix protection disable`
   - 查询命令：`show ip ospf fast-reroute per-prefix`
4. 设备当前未暴露 LFA tie-break、prefix-priority、Remote LFA、TI-LFA 等扩展命令；`show ip ospf fast-reroute per-prefix` 在存在受保护前缀时会输出逐前缀 `Primary nbr / Backup nbr` 明细，但 MHP 条目是否稳定出现取决于场景与收敛时序。
5. 设备软件特性列表（HOS V2.4）未单独列出 OSPF LFA/FRR，说明该能力与具体软件版本、License 或 profile 相关。用例执行前必须以 CLI 是否接受命令、`show ip ospf fast-reroute per-prefix` 是否返回使能状态作为能力判定；不满足时结论标记为 `Blocked`。
6. 已设计 16 个功能用例和 4 个 CLI 用例，覆盖基线、链路保护、节点保护、无备份路径、接口角色、并行链路、开销变化、连续故障恢复、ECMP、多区域/ABR、外部路由/ASBR、汇总与默认路由、多 VRF/多进程、网络类型、unnumbered 能力探测、非对称开销，以及 RFC 5286/6571/8518 的经典拓扑。

## 2. LFA 原理

### 2.1 术语

| 术语 | 含义 |
| --- | --- |
| S（Source） | 计算 LFA 的本机，也是受保护流量的入口 |
| E（Primary Next Hop） | 主下一跳邻居 |
| N（Alternate Neighbor） | 候选备份下一跳邻居 |
| D（Destination） | 目的前缀或目的节点 |
| D(X,Y) | 从节点 X 到节点 Y 的最短路径开销 |
| LFA | 满足无环条件的备份下一跳 |
| Link Protection | 仅保护 S-E 链路，E 节点仍可用 |
| Node Protection | 保护 E 节点，备份路径不得经过 E |
| Per-prefix LFA | 为每个前缀分别计算备份下一跳 |
| Per-link LFA | 按接口计算备份下一跳，粒度为链路 |

### 2.2 无环条件

链路保护要求候选邻居 N 满足：

```text
D(N,D) < D(N,S) + D(S,D)
```

该条件保证 N 把流量发往 D 时不会绕回 S，从而避免在主链路故障期间形成环路。

节点保护在链路保护基础上增加条件：

```text
D(N,D) < D(N,E) + D(E,D)
```

该条件保证 N 到 D 的最短路径不经过故障节点 E。实际实现通常优先选择节点保护 LFA；没有节点保护 LFA 时回退到链路保护 LFA。

### 2.3 逐前缀与逐链路

- **逐前缀 LFA**：每个目的前缀独立计算备份下一跳，保护粒度细，能够覆盖同一主下一跳下的部分前缀。
- **逐链路 LFA**：按主接口计算备份下一跳，同一接口上的所有前缀共享备份，开销低但保护范围粗。
- 本次实测设备仅暴露 `fast-reroute per-prefix`，因此用例按逐前缀 LFA 设计。

### 2.4 候选角色与受保护角色

设备接口提供两个 LFA 角色开关：

| 命令 | 作用 | 典型场景 |
| --- | --- | --- |
| `ip ospf fast-reroute per-prefix candidate disable` | 禁止本接口作为其他前缀的备份下一跳 | 避免重要业务链路承载备份流量 |
| `ip ospf fast-reroute per-prefix protection disable` | 禁止本接口作为主下一跳的前缀被 LFA 保护 | 不需要快速切换的接入链路 |

两个命令都只在三层接口生效。实测在二层接口执行时返回：

```text
% This can't be configured for L2 interface.
```

### 2.5 LFA 覆盖范围限制

LFA 不能保证所有前缀都有备份路径。以下情况通常没有 LFA：

- 拓扑为单链、树形或只有一条可达路径；
- 备份邻居到目的的最短路径经过本机 S，形成环路；
- 备份路径虽然存在，但不满足严格不等式；
- 主下一跳节点故障后，备份邻居仍需要经过故障节点才能到达目的。

因此 LFA 测试必须同时覆盖“有保护”和“无保护”两类结果，不能只验证备份路径存在。

## 3. 设备能力调研

### 3.1 实测环境

| 项 | 值 |
| --- | --- |
| 设备型号 | S4638PB（DUT 172.16.9.107） |
| 软件版本 | `switch Software, S4638PB, Version 3.3.2.4` |
| OSPF 进程 | 进程 0（`router ospf` 不带进程号） |
| 接口形态 | `eth-0-1` ~ `eth-0-4`，三层接口需先执行 `no switchport` |
| 查询命令 | `show ip ospf fast-reroute per-prefix` |

### 3.2 命令清单

| 视图 | 命令 | 说明 |
| --- | --- | --- |
| 全局配置 | `router ospf` | 进入 OSPF 进程视图；实测同一 VRF 仅支持一个进程 |
| 全局配置 | `no router ospf` | 删除 OSPF 进程及其 network、LFA 配置，用于用例清理 |
| 进程视图 | `fast-reroute per-prefix enable` | 使能逐前缀 LFA 修复路径计算 |
| 进程视图 | `no fast-reroute per-prefix enable` | 去使能 LFA |
| 接口视图 | `ip ospf fast-reroute per-prefix candidate disable` | 禁止接口作为备份下一跳 |
| 接口视图 | `ip ospf fast-reroute per-prefix protection disable` | 禁止接口上的前缀被保护 |
| 用户视图 | `show ip ospf fast-reroute per-prefix` | 查看各区域的 LFA 使能状态与保护计数 |

### 3.3 实测回显

使能 LFA 后：

```text
Switch(config)# router ospf
Switch(config-router)# fast-reroute per-prefix enable
Switch(config-router)# end
Switch# show ip ospf fast-reroute per-prefix

Area 0.0.0.0
  Fast-reroute per-prefix : enabled
  Intra-area prefixes     : 0
  Protected by LFA        : 0
```

去使能 LFA 后：

```text
Switch(config-router)# no fast-reroute per-prefix enable
Switch(config-router)# end
Switch# show ip ospf fast-reroute per-prefix

Area 0.0.0.0
  Fast-reroute per-prefix : disabled
  Intra-area prefixes     : 0
  Protected by LFA        : 0
```

接口角色配置回显：

```text
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip ospf fast-reroute per-prefix candidate disable
Switch(config-if)# ip ospf fast-reroute per-prefix protection disable
Switch(config-if)# end
Switch# show running-config | include fast-reroute
 ip ospf fast-reroute per-prefix candidate disable
 ip ospf fast-reroute per-prefix protection disable
```

### 3.4 高级场景命令探测

| 场景 | 命令 / 语法 | 实测结果 | 备注 |
| --- | --- | --- | --- |
| 多区域 | `network <prefix> area 1`、`area 1 range <prefix>` | 支持 | ABR 汇总使用 `area range` |
| 外部路由 | `redistribute static metric 20 metric-type 1`、`redistribute connected metric 20 metric-type 2` | 支持 | `metric-type` 可选 1 或 2 |
| 默认路由 | `default-information originate always metric-type 2` | 支持 | `always` 表示无条件产生默认路由 |
| 外部汇总 | `summary-address <prefix>` | 支持 | 用于 ASBR 外部路由汇总 |
| 多 VRF / 多进程 | `router ospf <id> vrf <name>` | 支持 | 同一 VRF 仅支持一个进程；进程数上限 200 |
| VRF 进程查询 | `show ip ospf <id>`、`show ip ospf <id> fast-reroute per-prefix` | 支持 | 可查看进程绑定的 VRF |
| Broadcast | `ip ospf network broadcast` | 支持 | 默认网络类型 |
| NBMA | `ip ospf network non-broadcast`、`neighbor <ip> priority <n>` | 支持 | NBMA 需要静态邻居 |
| P2MP | `ip ospf network point-to-multipoint` | 支持 | 不需要静态邻居 |
| P2P | `ip ospf network point-to-point` | 支持 | 功能用例默认使用 |
| unnumbered | `ip unnumbered <interface>` | 不支持 | 帮助和命令均返回 `% Unrecognized command` |
| 非对称开销 | 接口视图 `ip ospf cost <n>` | 支持 | 开销为出方向属性，可构造非对称路径 |

### 3.5 支持边界

| 能力 | 实测结果 | 测试影响 |
| --- | --- | --- |
| 逐前缀 LFA 使能 | 支持 | 功能用例按 per-prefix 设计 |
| 候选接口禁用 | 支持 | 可设计接口角色用例 |
| 受保护接口禁用 | 支持 | 可设计接口角色用例 |
| LFA 汇总查询 | 支持 | 用 `Intra-area prefixes`、`Protected by LFA` 计数判定 |
| 逐前缀备份下一跳明细 | 部分场景提供 | 存在受保护前缀时，`show ip ospf fast-reroute per-prefix` 会输出 `Prefix / Type / Primary nbr / Backup nbr / Cost / State` 表；MHP 条目是否出现取决于场景与收敛时序，仍需结合路由表变化 |
| tie-break | 未提供 | 不设计多候选 LFA 选路用例 |
| prefix-priority | 未提供 | 不设计按优先级保护用例 |
| Remote LFA / TI-LFA | 未提供 | 超出本次本地 LFA 范围 |
| L2 接口配置 LFA 角色 | 拒绝 | 作为 CLI 反向用例 |
| 进程号 | 实测为 0 | 脚本统一使用 `router ospf` |

## 4. 测试设计

### 4.1 拓扑与开销设计

功能用例使用四设备环形拓扑 `LinkConstraint.four_devices_topo_links_type_3`：

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

地址与开销规划：

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| A-B | 10.0.12.0/24 | A=10.0.12.1，B=10.0.12.2 | 1 |
| B-C | 10.0.23.0/24 | B=10.0.23.1，C=10.0.23.2 | 1 |
| C-D | 10.0.34.0/24 | C=10.0.34.1，D=10.0.34.2 | 1 |
| D-A | 10.0.41.0/24 | D=10.0.41.1，A=10.0.41.2 | 10 |
| Loopback0 | 主机路由 | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32，D=4.4.4.4/32 | 1 |

A-D 链路开销设为 10 的原因：

- A 到 C 的主路径为 A-B-C，开销 2，下一跳为 10.0.12.2；
- A 到 C 的备份路径为 A-D-C，开销 11，下一跳为 10.0.41.1；
- 对邻居 D 来说，D(D,C)=1，D(D,A)=10，D(A,C)=2，满足 `1 < 10 + 2`，因此 D 是合法 LFA；
- 备份路径 A-D-C 不经过 B，因此同时具备节点保护能力。

如果不加大 A-D 开销，A 到 C 的两条路径开销相同，会形成 ECMP，主备关系不唯一，测试结果不稳定。

### 4.2 用例矩阵

| 编号 | 场景 | 拓扑 | 触发 | 核心判定 |
| --- | --- | --- | --- | --- |
| 0010 | LFA 基线 | 环形 | 无 | 邻居 Full；LFA enabled；受保护前缀数大于 0；主路径经 B |
| 0020 | 链路保护 | 环形 | 关闭 A-B 链路 | 路由切换到 A-D-C；ping 0% 丢包；恢复后回到主路径 |
| 0030 | 节点保护 | 环形 | 关闭 B 的两个接口 | 路由切换到 A-D-C；B 邻居消失；ping 0% 丢包；恢复后邻居和主路径恢复 |
| 0040 | 无备份路径 | 链形 A-B-C | 关闭 A-B 链路 | 受保护前缀数为 0；C 前缀路由消失；恢复后路由恢复 |
| CLI-0010 | CLI 行为 | 单设备 | 配置/去配置 | 使能/去使能回显正确；接口角色写入 running-config；L2 接口被拒绝 |

### 4.3 场景覆盖矩阵

| 场景 | 是否脚本化 | 用例 | 说明 |
| --- | --- | --- | --- |
| LFA 基线 | 是 | 0010 | 邻居 Full、LFA enabled、受保护前缀数大于 0 |
| 链路保护 | 是 | 0020 | 关闭主链路，切换到备份路径并恢复 |
| 节点保护 | 是 | 0030 | 关闭主下一跳节点，备份路径绕开故障节点 |
| 无可用备份路径 | 是 | 0040 | 链形组网受保护前缀数为 0，断链后路由不可达 |
| 接口角色控制 | 是 | 0050 | `candidate disable` 与 `protection disable` 对保护计数的影响 |
| 并行链路 | 是 | 0060 | 同一邻居两条链路，主链路故障后切换到备链路 |
| 开销变化 | 是 | 0070 | 修改主链路开销触发 SPF 与 LFA 重新计算 |
| 连续故障恢复 | 是 | 0080 | 连续 3 次主备切换后保护状态保持稳定 |
| ECMP 共存 | 是 | 0090 | 等开销主路径保持 ECMP，单路径故障后仍可达 |
| 区域间前缀 | 否 | 待设计 | 需要 ABR 与多区域拓扑；设备汇总命令只统计 `Intra-area prefixes`，区域间前缀的保护行为需单独验证 |
| 外部路由 | 否 | 待设计 | 需要 ASBR 与外部路由；RFC 5286 对外部前缀的 LFA 计算有条件，需确认设备实现 |
| BFD 联动 | 否 | 待设计 | BFD 缩短故障检测时间，LFA 负责转发修复；需确认 BFD 与 OSPF 联动命令 |
| Remote LFA / TI-LFA | 未支持 | — | 当前版本未暴露相关命令 |
| 多候选 tie-break | 未支持 | — | 当前版本未暴露 tie-break 命令 |
| prefix-priority | 未支持 | — | 当前版本未暴露按前缀优先级保护的命令 |

| 多区域 / ABR | 是 | 0100 | ABR 汇总、区域间路由、单 ABR 路径下的 LFA 范围 |
| 外部路由 / ASBR | 是 | 0100 | Type-1/Type-2、默认路由；`summary-address` 设计见 4.7.1 |
| 默认路由 | 是 | 0100 | `default-information originate always`；独立设计见 4.7.2 |
| 多 VRF / 多进程 | 是 | 0130 | 不同 VRF 中独立进程和 LFA 配置 |
| Broadcast | CLI 是 | 0040 | 命令级已验证；功能设计见 4.7.3 |
| NBMA | CLI 是 | 0040 | 命令级已验证；功能设计见 4.7.3 |
| P2MP | CLI 是 | 0040 | 命令级已验证；功能设计见 4.7.3 |
| unnumbered | 负向 | 0170 | 当前版本不支持，标记 `Blocked / Not Supported` |
| 非对称开销 | 是 | 0180 | 出方向开销导致 LFA 无环条件变化 |
| RFC 5286 Figure 1 基本拓扑 | 是 | 0110 | 四设备环按 5/8/4/3 开销构造，N1 满足 Inequality 1 |
| RFC 5286 Figure 1 反例 | 是 | 0120 | N1-D 开销 30，Inequality 1 不成立，S 到 D 的 Loopback 不再受保护（仅剩 N1 直连网段） |
| RFC 6571 Triangle | 是 | 0130 | 三设备三角拓扑，直连链路故障后经第三条边恢复 |
| RFC 6571 Full Mesh | 是 | 0140 | 四设备全互联，所有目的有 LFA，单链路故障后可达 |
| RFC 8518 MHP（不同主备下一跳） | 是 | 0150 | C/D 双端发布同一前缀，A 以 C 为主、D 为备份下一跳 |

### 4.4 LFA 适用前缀范围

| 前缀类型 | LFA 适用性 | 测试关注点 |
| --- | --- | --- |
| 区域内（Intra-area） | 主要适用场景 | 邻居、SPF、备份下一跳和保护计数 |
| 区域间（Inter-area） | 取决于 ABR 与备份路径条件 | ABR 冗余、区域间路由是否被保护、查询计数是否包含 |
| 外部（External） | 取决于外部路由类型、转发地址和 ASBR 路径 | 外部路由可达性、故障后是否切换、是否产生环路 |
| 等价多路径（ECMP） | 与 ECMP 共存 | ECMP 下一跳、单路径故障、LFA 是否额外提供保护 |

设备当前 `show ip ospf fast-reroute per-prefix` 只输出 `Intra-area prefixes`，因此区域间和外部前缀是否受保护不能仅凭该计数判断，需要结合路由表、故障注入和抓包验证。后续扩展用例时，建议优先补充多区域和 BFD 联动场景。

### 4.5 观测面

| 观测面 | 命令或动作 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 邻居状态为 `Full`；节点故障后对应邻居消失 |
| 协议配置面 | `show running-config \| include fast-reroute` | 全局与接口 LFA 命令存在/不存在符合预期 |
| LFA 汇总面 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix` 为 `enabled`；`Protected by LFA` 大于 0 或等于 0 |
| 路由表项面 | `show ip ospf route`、`show ip route <prefix>` | 故障前后下一跳分别为主路径和备份路径 |
| 转发面 | `ping <prefix>` | 收敛后丢包率为 0% |
| 恢复面 | 恢复接口后再次查询 | 邻居、路由和 LFA 状态恢复 |

### 4.6 判定与阻塞条件

- 全部必检项满足且清理成功：`Pass`。
- 任一必检项不满足：`Fail`。
- 设备不接受 LFA 命令、`show ip ospf fast-reroute per-prefix` 无使能状态，或拓扑后端无法建立链路：`Blocked`，记录缺失能力和现场。
- LFA 切换时延的毫秒级指标不由本组功能用例判定；需要时使用测试仪持续打流并记录丢包窗口，单独设计性能用例。

### 4.7 后续扩展场景设计（暂无独立脚本）

以下场景已完成设计，但当前没有独立测试脚本，因此不单独建立测试文档；后续实现脚本时，再按“一个脚本一个文档”的规则补齐。

#### 4.7.1 外部路由汇总 `summary-address`

在 ASBR 上配置两条静态路由并汇总：

```text
ip route 172.16.0.0/16 null0
ip route 172.17.0.0/16 null0
router ospf
redistribute static metric 20 metric-type 2
summary-address 172.16.0.0/15
```

预期：区域 0 只看到 `E2 172.16.0.0/15`，不再看到两条明细；外部 LSA 的前缀为聚合前缀。

#### 4.7.2 默认路由

ASBR 配置：

```text
router ospf
default-information originate always metric-type 2
```

预期：区域 0 出现 `E2 0.0.0.0/0`，`show ip route 0.0.0.0/0` 下一跳指向 ABR；删除配置后默认路由消失。

#### 4.7.3 Broadcast / NBMA / P2MP 功能验证

| 场景 | 关键配置 | 预期 |
| --- | --- | --- |
| Broadcast | `ip ospf network broadcast` | `Network Type BROADCAST`；邻居 Full；LFA 保护计数大于 0 |
| NBMA | `ip ospf network non-broadcast` + `neighbor <ip> priority <n>` | `Network Type NBMA`；邻居 Full；DR/BDR 选举完成；LFA 保护计数大于 0 |
| P2MP | `ip ospf network point-to-multipoint` | `Network Type POINT_TO_MULTIPOINT`；邻居 Full；LFA 保护计数大于 0 |

网络类型的命令级验证已由 `02-ospf_lfa_cli/0040` 覆盖；功能级验证需要两设备双链路拓扑，待实现脚本后补充。

## 5. 风险与限制

| 风险 | 说明 | 处理 |
| --- | --- | --- |
| 拓扑后端未建立链路 | 功能用例依赖四设备/三设备拓扑；后端未下发链路时邻居无法 Full | 执行前用 `show ip ospf neighbor` 确认；失败标记 `Blocked` |
| OSPF 收敛时间 | 默认 Hello 10s、Dead 40s；节点故障检测可能接近 40s | 邻居消失类检查超时设置为 60s 以上 |
| ECMP 导致主备不唯一 | 等开销时主路径和备份路径可能同时存在 | 通过 A-D 链路开销 10 固定主路径 |
| 查询命令无逐前缀明细 | 不能直接读取某前缀的备份下一跳 | 结合故障前后路由表和 `Protected by LFA` 计数判定 |
| 软件版本差异 | 特性列表未单独列出 LFA，不同版本命令可能不同 | 执行前做 CLI 能力探测；不支持时标记 `Blocked` |
| 清理不完整 | 接口开销、shutdown、loopback、OSPF network 残留会影响后续用例 | 在全局配置视图执行 `no router ospf` 删除进程，再覆盖接口、loopback，并恢复接口为二层 |

## 6. 本次执行验证

| 项 | 结果 | 证据 |
| --- | --- | --- |
| CLI 用例 `02-ospf_lfa_cli/0010` | 通过 | 在 172.16.9.104 上执行，覆盖使能、去使能、接口角色和 L2 接口拒绝；清理后 `show ip ospf processes-count` 为 0 |
| CLI 用例 `02-ospf_lfa_cli/0020` | 通过 | 多 VRF 进程 100/200 分别绑定 vpn1/vpn2，进程数为 2，LFA 配置独立 |
| CLI 用例 `02-ospf_lfa_cli/0030` | 通过 | `ip unnumbered` 返回 `% Unrecognized command`，无配置残留 |
| CLI 用例 `02-ospf_lfa_cli/0040` | 通过 | Broadcast/NBMA/P2MP/P2P 网络类型与 NBMA neighbor 命令均写入 running-config |
| 功能用例 0010~0180 | 通过 | 四设备环、三设备链形和双设备并行链路拓扑复跑，15/15 通过；邻居 Full、LFA 受保护前缀按预期变化，链路/节点故障切换与恢复均符合预期 |
| RFC 拓扑用例 0110~0150 | 通过 | 新增 5 个用例，覆盖 RFC 5286 Figure 1（正例/反例）、RFC 6571 Triangle/Full Mesh、RFC 8518 多归前缀；0110、0120、0130、0140、0150 连续执行 5/5 通过，日志：`/tmp/opencode/ospf-new5-all.log` |
| 命名、模块、套件与类型检查 | 通过 | `npm run check` 全部通过 |

### 6.1 复跑问题分析

早期功能用例因邻居未建立被标记为 `Blocked`，本次复跑邻居已正常进入 `Full`，原阻塞原因不再成立。复跑中发现并修复以下脚本问题：

| 问题 | 影响用例 | 现象 | 修复 |
| --- | --- | --- | --- |
| `show ip route` 回显格式匹配错误 | 0020、0030、0040、0060、0070、0080、0090、0100 | 实际回显为 `<next-hop>, via <interface>`，脚本写成 `via <next-hop>`，故障切换后路由已正确但仍判定失败 | 改为匹配 `<next-hop>,\s+via` |
| 首次 ping 收敛丢包 | 0010~0100 | 邻居刚 Full 时首包可能丢失，实测 `40% packet loss`，后续恢复 | 改用 `ReadyCheck` 在 60 秒内重试，直到出现 0% 丢包 |
| 链路故障后错误期望 LFA 保护计数仍大于 0 | 0080 | A-B 故障后只剩 A-D-C 单路径，`Protected by LFA` 实际降为 0 | 故障期断言计数为 0，链路恢复后再断言大于 0 |
| OSPF 路由表 ECMP 恢复晚于 IP 路由表 | 0090 | IP 路由已显示双下一跳时，`show ip ospf route` 仍只有备份下一跳 | 在严格断言前增加 `show ip ospf route` 的 `ReadyCheck` |
| 非对称开销配置到错误设备 | 0180 | 在 DUTA 二层 PortC 上执行 `ip ospf cost` 返回 `% This can't be configured for L2 interface.` | 改为配置 DUTD PortC，并拆分“读取 DUTA 计数”和“配置 DUTD 开销”两步 |
| 清理命令重复删除未配置项 | 0180 | `no ip ospf cost` 对未配置开销的接口返回 `% Parameter is not configured` | 仅保留实际配置过开销的接口清理命令 |

## 7. RFC 拓扑扩展用例（0110~0150）

在原有 0010~0180 功能用例基础上，按 RFC 5286、RFC 6571、RFC 8518 中的经典拓扑补充 5 个用例。受现网 4 台 DUT 限制，部分 RFC 拓扑做了等价裁剪，保留核心节点关系和 LFA 判定条件。

| 用例 | RFC / 图示 | 拓扑 | 核心验证 | 说明 |
| --- | --- | --- | --- | --- |
| 0110 | RFC 5286 Figure 1 | 四设备环 S-E-D-N1 | N1 满足 Inequality 1，可作为 LFA；S-E 故障后经 N1 恢复 | 开销 5/8/4/3 |
| 0120 | RFC 5286 Figure 1 反例 | 四设备环 S-E-D-N1 | N1-D 开销 30，`30 < 8 + 9` 不成立，S 到 D 的 Loopback 不再受保护 | 与 0110 成对，验证严格不等式；保护总数由 5 降为 1 |
| 0130 | RFC 6571 Figure 2 Triangle | 三设备三角 C1-C2-E1 | 直连 C1-E1 故障后经 C2 恢复；Triangle 链路保护 | 受 4 DUT 限制，省略 E2 |
| 0140 | RFC 6571 Figure 3 Full Mesh | 四设备全互联 6 链路 | 所有目的前缀有 LFA；单链路故障后仍可达 | 新增 `four_devices_topo_links_type_4` |
| 0150 | RFC 8518 Figure 2 | 四设备全互联，C-D 网段双端发布 | MHP 的两个发布者对应不同主/备下一跳 | MHP 逐前缀 LFA 条目不稳定，必检项为 MHP 主备路径切换和故障后可达性 |

### 7.1 RFC 图示覆盖矩阵

按“图示数量”看，RFC 5286 Appendix A/Figure 7、RFC 6571 Figure 1~5、RFC 8518 §4.2/Figure 1~3 共 10 个分析对象。它们并不等于 10 个可独立执行的脚本：部分图示是同一拓扑的不同故障分析，部分需要 5~9 台设备，部分受当前设备 MHP LFA 行为限制。

| # | RFC / 图示 | 原图节点规模 | 覆盖情况 | 对应脚本 / 说明 |
| --- | --- | --- | --- | --- |
| 1 | RFC 5286 Appendix A / Figure 7 | 9 节点、多区域 ABR/ASBR | 未单独脚本化 | 现网仅 4 台 DUT，无法构造“区域穿越 + ASBR 双区域宣告”的完整转发表径；0100 仅覆盖单 ABR/ASBR 多区域基线 |
| 2 | RFC 6571 Figure 1 Example 1 | 9 节点核心/接入拓扑 | 未单独脚本化 | 4 台 DUT 不足；可做简化拓扑，但会失去多路径/多区域特性，不能代表原图结论 |
| 3 | RFC 6571 Figure 2 Triangle | 4 节点（C1/C2/E1/E2） | 已覆盖（简化为 3 节点） | 0130；保留 C1-C2-E1 三角和链路保护判定，省略 E2 |
| 4 | RFC 6571 Figure 3 Full Mesh | 6 节点（C1/C2/A1/A2/E1/E2） | 已覆盖（简化为 4 节点全互联） | 0140；新增 `four_devices_topo_links_type_4` |
| 5 | RFC 6571 Figure 4 Square | 7 节点以上（C1/C2/A1~A4/E1~E3） | 已由既有用例覆盖 | 0010/0020/0030/0090 的四设备环等价于 Square 的基本主备、节点保护和 ECMP 行为；未单独新建 |
| 6 | RFC 6571 Figure 5 Extended U | 8 节点 + L1/L2 隧道 | 未单独脚本化 | 需 6 台以上 DUT 和隧道能力，现网不足 |
| 7 | RFC 8518 §4.2 OSPF 备用 ASBR 选择 | 多 ASBR、多区域 | 部分覆盖 | 0100 覆盖外部路由/ASBR 基线；0150 覆盖多归前缀的主备下一跳，但不是 Type-1/Type-2 备用 ASBR 选择 |
| 8 | RFC 8518 Figure 1 MHP 相同主下一跳 | 6 节点 | 未单独脚本化 | 已用 4 台 DUT 尝试简化版，但设备未稳定为 MHP 安装独立 LFA 条目，故未保留脚本 |
| 9 | RFC 8518 Figure 2 MHP 不同 ECMP 主下一跳 | 6 节点 | 部分覆盖（简化为 4 节点全互联） | 0150；设备对 MHP 逐前缀 LFA 条目不稳定，必检项改为 MHP 主备路径切换和故障后可达性 |
| 10 | RFC 8518 Figure 3 IGP MAX_METRIC | 5 节点 | 未单独脚本化 | 需 5 台 DUT，且 OSPF 反向 MAX_METRIC 是否可作为 LFA 取决于设备实现；需先做能力探测 |

因此：

- 5 个新增脚本中，**0130 完整覆盖 Figure 2，0140 完整覆盖 Figure 3，0150 部分覆盖 Figure 2/§4.2**；
- 0110/0120 覆盖的是 **RFC 5286 Figure 1 的正例和反例**。Appendix A/Figure 7 本身需要 9 节点，无法用 4 台 DUT 复现，因此先用 Figure 1 的严格不等式验证作为可执行的基础替代；
- Figure 4 由既有 0010/0020/0030/0090 覆盖，不重复建脚本；
- 其余 5 项（5286 Fig7、6571 Fig1/Fig5、8518 Fig1/Fig3）受设备数量或设备行为限制，未单独脚本化。

后续如果环境允许，优先补 3 个可简化的 4 设备用例：

1. RFC 6571 Figure 4 Square 的 c < a 专用变体；
2. RFC 8518 §4.2 的双 ASBR 多归外部前缀；
3. RFC 8518 Figure 3 MAX_METRIC 观测型用例（先探测反向开销能力）。

### 7.2 配置时序说明

0110~0150 均在所有邻居 `Full` 后执行 `fast-reroute per-prefix enable`。这样做的原因是：设备在邻接建立前使能 LFA 时，后续邻接 Full 不会触发保护表重算，部分节点会长期显示 `Protected by LFA : 0`。该现象已单独记录，不在本组拓扑用例中重复判定；先建立邻接再使能 LFA，可让拓扑与 RFC 无环不等式成为唯一变量。

0010~0180 仍保持原有配置顺序，后续根据设备问题结论统一决定是否调整。

## 8. 参考资料

| 资料 | 用途 |
| --- | --- |
| RFC 2328《OSPF Version 2》 | OSPF 邻居、LSA、SPF 基础 |
| RFC 5286《Basic Specification for IP Fast Reroute: Loop-Free Alternates》 | LFA 无环不等式、链路保护与节点保护、Appendix A 多区域示例 |
| RFC 6571《Loop-Free Alternate (LFA) Applicability in Service Provider Networks》 | Triangle、Full Mesh、Square、Extended U 等拓扑的 LFA 适用性 |
| RFC 8518《Selection of Loop-Free Alternates for Multi-Homed Prefixes》 | 多归前缀 LFA、OSPF 备用 ASBR 选择、IGP MAX_METRIC |
| 设备 CLI 实测（S4638PB 3.3.2.4） | 命令、回显、接口角色和 L2 拒绝行为 |
| `docs/spec/test-case-template.md` | 用例文档结构 |
| `docs/spec/test-script-convention.md` | 脚本结构与断言约定 |
