# RFC 5286 Figure 7 等价拓扑中 LFA 候选 N 的路径经区域穿越回到 S

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0260-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0260`
- 用例标题：RFC 5286 Figure 7 等价拓扑中 LFA 候选 N 的路径经区域穿越回到 S
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P2 / 功能（观测型）
- 执行方式：自动化工具 / 手工
- 预估耗时：约 3 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | 多区域、ABR、ASBR、Type-3/Type-5 LSA | 多区域 OSPF 路由计算 |
| RFC 5286 | 6.3、Appendix A、Figure 7 | 本地区域拓扑不足以判断 LFA 的场景 |
| RFC 8518 | 2、4.2 | ASBR 相关的备用路径选择 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | 每台设备 2～4 个三层接口 | 接口需支持 `no switchport` |
| DUT 数量 | 8 台（DUTA~DUTH） | 设备不足时标记 `Blocked` |
| 多区域 | 支持 `area 0/1/2` 与 ABR/ASBR | 不支持时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
   DUTB ---- DUTA ---- DUTF ---- DUTG
               | \               |
               |  \              |
               |   DUTE -------- + ---- DUTH
               |     |  \                 |
             DUTC ---+   \                |
              |  \        \               |
            DUTD  +--------+--------------+
```

拓扑名称 / 来源：`nine_devices_topo_links_type_4`（RFC 5286 Figure 7 的 8 台等价裁剪，DUTA~DUTH）。

角色映射：

| DUT | 角色 | 区域 |
| --- | --- | --- |
| A | S | area 1 |
| B | N | area 1 |
| C | A（ABR） | area 1 + area 2 + backbone |
| D | F（area 2 转接） | area 2 |
| E | B（ABR） | area 1 + area 2 + backbone |
| F | E | area 1 |
| G | X | area 1 |
| H | ASBR | area 1 + area 2 |

| 链路 | 区域 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- | --- |
| S-N | area 1 | 10.1.2.0/24 | S=10.1.2.1，N=10.1.2.2 | 40 |
| N-A | area 1 | 10.2.3.0/24 | N=10.2.3.1，A=10.2.3.2 | 5 |
| A-ASBR | area 1 | 10.3.6.0/24 | A=10.3.6.1，ASBR=10.3.6.2 | 35 |
| S-E | area 1 | 10.1.7.0/24 | S=10.1.7.1，E=10.1.7.2 | 5 |
| E-X | area 1 | 10.7.8.0/24 | E=10.7.8.1，X=10.7.8.2 | 5 |
| X-ASBR | area 1 | 10.8.6.0/24 | X=10.8.6.1，ASBR=10.8.6.2 | 5 |
| B-S | area 1 | 10.1.5.0/24 | B=10.1.5.1，S=10.1.5.2 | 5 |
| A-F | area 2 | 10.3.4.0/24 | A=10.3.4.1，F=10.3.4.2 | 5 |
| F-B | area 2 | 10.4.5.0/24 | F=10.4.5.1，B=10.4.5.2 | 5 |
| B-ASBR | area 2 | 10.5.6.0/24 | B=10.5.6.1，ASBR=10.5.6.2 | 22 |
| A-B | backbone | 10.3.5.0/24 | A=10.3.5.1，B=10.3.5.2 | 100 |
| Loopback0 | 各区域 | 主机路由 | 10.255.0.1/32 ～ 10.255.0.8/32 | 1 |
| 外部前缀 | Type-2 | 主机路由 | 198.51.100.1/32，ASBR 发布 | metric 20 |

关键路径：

| 节点 | 到 ASBR 的区域和开销 | 下一跳 |
| --- | --- | --- |
| S | area 1，15 | E |
| N | area 1，40 | A |
| A（ABR） | area 2，32（< area 1 的 35） | F |
| B（ABR） | area 1，20（< area 2 的 22） | S |
| F（area 2） | area 2，27 | B |

因此 A 的流量会离开 area 1，经 area 2 到达 B，再由 B 回到 area 1 的 S，形成 RFC 5286 描述的“区域穿越”路径。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Router ID | 10.255.0.1 ～ 10.255.0.8 | 显式配置 |
| Area | 0 / 1 / 2 | A、B、ASBR 为多区域设备 |
| Network Type | point-to-point | 排除广播网 DR/BDR 影响 |
| 外部路由 | `redistribute connected metric 20 metric-type 2` | ASBR 发布 198.51.100.1/32 |
| LFA | `fast-reroute per-prefix enable` | 在初始 OSPF 配置中使能 |

### 3.2 初始状态

- 接口处于默认二层状态；OSPF 进程、Loopback、L3 地址和 LFA 配置为空。
- 拓扑后端已建立并启用对应链路。
- 现场保留：默认清理。

## 4. 测试步骤与预期结果

### 4.1 配置

DUTA（S）示例：

```text
configure terminal
interface <PortA>
no switchport
ip address 10.1.2.1/24
ip ospf network point-to-point
ip ospf cost 40
exit
interface <PortB>
no switchport
ip address 10.1.7.1/24
ip ospf network point-to-point
ip ospf cost 5
exit
interface <PortC>
no switchport
ip address 10.1.5.2/24
ip ospf network point-to-point
ip ospf cost 5
exit
interface loopback0
ip address 10.255.0.1/32
exit
router ospf
router-id 10.255.0.1
network 10.1.2.0/24 area 1
network 10.1.7.0/24 area 1
network 10.1.5.0/24 area 1
network 10.255.0.1/32 area 1
exit
end
```

DUTB～DUTG 按第 2 节地址、区域和开销配置。DUTH（ASBR）额外配置：

```text
interface loopback1
ip address 198.51.100.1/32
exit
router ospf
redistribute connected metric 20 metric-type 2
exit
```

全部邻居 `Full` 后，在各设备 OSPF 进程视图执行 `fast-reroute per-prefix enable`。

### 4.2 基线检查与执行顺序

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 配置生效 | `show running-config \| include router ospf`、`show running-config \| include redistribute`、`show running-config \| include fast-reroute` | 各设备存在 OSPF 进程，ASBR 存在外部分布配置，各设备存在 LFA 配置 |
| 2 | 邻居基线 | `show ip ospf neighbor` | 各区域直连邻居均为 `Full` |
| 3 | 外部路由存在 | `show ip ospf route`（DUTA） | 存在 `E2 198.51.100.1/32` |
| 4 | S 的路径 | `show ip route 198.51.100.1` | 下一跳 `10.1.7.2`（经 E） |
| 5 | N 的路径 | `show ip route 198.51.100.1`（DUTB） | 下一跳 `10.2.3.2`（经 A） |
| 6 | A 的路径 | `show ip route 198.51.100.1`（DUTC） | 下一跳 `10.3.4.2`（经 area 2 的 F） |
| 7 | B 的路径 | `show ip route 198.51.100.1`（DUTE） | 下一跳 `10.1.5.2`（经 area 1 的 S） |
| 8 | F 的路径 | `show ip route 198.51.100.1`（DUTD） | 下一跳 `10.4.5.2`（经 B） |
| 9 | LFA 计算 | `show ip ospf fast-reroute per-prefix` | `Calculation` 的 `runs` 大于 0 |
| 10 | 受保护前缀 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| 11 | 连通性基线 | `ping 198.51.100.1` | `0% packet loss` |
| 12 | 触发故障 | 关闭 DUTA 的 `<PortB>` | 见 4.3 |
| 13 | 恢复链路 | 恢复 DUTA 的 `<PortB>` | 见 4.4 |

### 4.3 触发与流量发送

本用例不使用测试仪流量，触发方式为链路故障注入。

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 故障 1 | 关闭 DUTA 的 `<PortB>`，模拟 S-E 链路故障 | `10.1.7.2` 邻居断开，S 到外部前缀的主路径失效 |
| 路由检查 | `show ip route 198.51.100.1` | 收敛后经 `10.1.5.2`（B）或 `10.1.2.2`（N）绕行 |
| 转发检查 | `ping 198.51.100.1` | `0% packet loss` |

执行过程中记录故障瞬间是否出现短暂环路或丢包；本用例以最终收敛结果和区域穿越路径为主要判据。

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 链路恢复 | 在 DUTA 的 `<PortB>` 执行 `no shutdown` | `10.1.7.2` 邻居恢复 `Full` |
| 主路径回切 | `show ip route 198.51.100.1` | 主路径回到 `10.1.7.2` |
| 保护计数恢复 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| 转发恢复 | `ping 198.51.100.1` | `0% packet loss` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 各区域直连邻居 `Full`；故障期间 `10.1.7.2` 邻居断开 |
| 表项面（区域选择） | `show ip route 198.51.100.1`（各节点） | A 经 area 2 的 F（`10.3.4.2`），B 经 area 1 的 S（`10.1.5.2`），F 经 B（`10.4.5.2`） |
| 表项面（OSPF 路由） | `show ip ospf route` | 存在 `E2 198.51.100.1/32` |
| 计数 / 告警面 | `show ip ospf fast-reroute per-prefix` | `runs` 大于 0，`Protected by LFA` 大于 0 |
| 转发面 | `ping 198.51.100.1` | 基线、故障后、恢复后丢包率均为 0% |
| 过程观测 | 抓包或日志 | 记录故障瞬间的短暂环路或丢包，作为观测项 |
| 恢复 / 资源面 | 恢复 `<PortB>` 后复查邻居、路由与保护计数 | 主路径回到 `10.1.7.2`，保护计数恢复 |

### 4.6 判定标准

- 步骤 1 至 11：配置项存在；各区域邻居状态为 `Full`；`show ip ospf route` 存在 `E2 198.51.100.1/32`；S、N、A、B、F 的下一跳依次为 `10.1.7.2`、`10.2.3.2`、`10.3.4.2`、`10.1.5.2`、`10.4.5.2`；`runs` 大于 0；`Protected by LFA` 大于 0；丢包率 = 0%。
- 步骤 12：关闭 `<PortB>` 后，S 的下一跳收敛为 `10.1.5.2` 或 `10.1.2.2`，丢包率 = 0%。
- 步骤 13：恢复 `<PortB>` 后，S 的下一跳回到 `10.1.7.2`，`Protected by LFA` 大于 0，丢包率 = 0%。
- 区域穿越：A 经 area 2 到达 ASBR、B 经 area 1 回到 S 的区域选择关系应保持不变。
- `Pass`：上述必检项全部满足，且第 5 章清理检查通过。
- `Fail`：任一必检项不满足，或清理后仍存在 OSPF、外部分布与 LFA 配置残留。
- `Blocked`：设备不支持多区域 OSPF 与 `fast-reroute per-prefix enable`，或邻居无法达到 `Full`。
- 观测型说明：故障瞬间的短暂环路或丢包记录为观测项，不作为 `Fail` 判据；判定以最终收敛结果和区域穿越路径为准。

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
interface <PortB/PortC/PortD>
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
show running-config | include redistribute
show running-config | include fast-reroute
show ip ospf processes-count
```

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 拓扑说明 | 本用例使用 8 台等价裁剪（DUTA~DUTH，DUTH 作为 ASBR），保留 S→N→A→F→B→S 的区域穿越核心路径；RFC 原图约 11～12 台 |
| 2 | 区域设计 | A、B 同时属于 area 1、area 2 和 backbone；ASBR 同时属于 area 1 和 area 2 |
| 3 | 观测重点 | 重点记录 A 经 area 2、B 经 area 1 的区域选择差异，以及 S 的 LFA 候选 N 的路径回到 S 的现象 |
| 4 | 判定原则 | 本用例为观测型；判据采用最终收敛结果与区域穿越路径，故障瞬间的微环记录为观测项 |
| 5 | 标准约束 | RFC 5286 6.3 明确此类场景不应使用 LFA；设备行为差异记录为观测项 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | `Pass` / `Fail` / `Blocked` |
| 实际观测 | 记录各节点到外部前缀的下一跳、区域选择、LFA 计数、故障前后路由和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0260` | `Pass` / `Fail` / `Blocked` | | |
