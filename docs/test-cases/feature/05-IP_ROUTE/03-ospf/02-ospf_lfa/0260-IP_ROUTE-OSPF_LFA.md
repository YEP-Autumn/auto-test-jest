# RFC 5286 Figure 7 等价拓扑中 LFA 候选 N 的路径经区域穿越回到 S

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0260-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0260`
- 用例标题：RFC 5286 Figure 7 等价拓扑中 LFA 候选 N 的路径经区域穿越回到 S
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P2 / 功能（观测型）
- 执行方式：自动化脚本 / 手工
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
| 设备 profile | `default` | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | 每台设备 2～4 个三层接口 | 接口需支持 `no switchport` |
| DUT 数量 | 8 台（9 台拓扑中留 1 台备用） | 设备不足时标记 `Blocked` |
| 多区域 | 支持 `area 0/1/2` 与 ABR/ASBR | 不支持时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
   DUTB ---- DUTA ---- DUTG ---- DUTH
               | \               |
               |  \              |
               |   DUTE -------- + ---- DUTK
               |     |  \                 |
             DUTC ---+   \                |
              |  \        \               |
            DUTD  +--------+--------------+
```

内置拓扑：`LinkConstraint.nine_devices_topo_links_type_4`（RFC 5286 Figure 7 的 9 台等价裁剪）。

角色映射：

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
| LFA | `fast-reroute per-prefix enable` | 在邻居 Full 后使能 |

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

DUTB～DUTH 按第 2 节地址、区域和开销配置。DUTK（ASBR）额外配置：

```text
interface loopback1
ip address 198.51.100.1/32
exit
router ospf
redistribute connected metric 20 metric-type 2
exit
```

全部邻居 `Full` 后，在各设备 OSPF 进程视图执行 `fast-reroute per-prefix enable`。

### 4.2 观测与预期

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 邻居 | `show ip ospf neighbor` | 各区域直连邻居均为 `Full` |
| 外部路由 | `show ip ospf route`（DUTA） | 存在 `E2 198.51.100.1/32` |
| S 的路径 | `show ip route 198.51.100.1` | 下一跳 `10.1.7.2`（经 E） |
| N 的路径 | `show ip route 198.51.100.1`（DUTB） | 下一跳 `10.2.3.2`（经 A） |
| A 的路径 | `show ip route 198.51.100.1`（DUTC） | 下一跳 `10.3.4.2`（经 area 2 的 F） |
| B 的路径 | `show ip route 198.51.100.1`（DUTE） | 下一跳 `10.1.5.2`（经 area 1 的 S） |
| F 的路径 | `show ip route 198.51.100.1`（DUTD） | 下一跳 `10.4.5.2`（经 B） |
| LFA 计算 | `show ip ospf fast-reroute per-prefix` | `Calculation` 的 `runs` 大于 0 |
| 受保护前缀 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| 连通性 | `ping 198.51.100.1` | `0% packet loss` |

### 4.3 故障与恢复

1. 关闭 DUTA 的 `<PortB>`，模拟 S-E 链路故障。
2. S 的主路径失效，收敛后 `show ip route 198.51.100.1` 应经 `10.1.5.2`（B）或 `10.1.2.2`（N）绕行。
3. `ping 198.51.100.1` 应为 `0% packet loss`。
4. 恢复 `<PortB>`，主路径回到 `10.1.7.2`，`Protected by LFA` 恢复大于 0。
5. 执行过程中记录故障瞬间是否出现短暂环路或丢包；本用例以最终收敛结果和区域穿越路径为主要判据。

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
| 1 | 拓扑说明 | 本用例使用 9 台等价裁剪（DUTA~DUTH + DUTK，DUTK 作为 ASBR），保留 S→N→A→F→B→S 的区域穿越核心路径；RFC 原图约 11～12 台 |
| 2 | 区域设计 | A、B 同时属于 area 1、area 2 和 backbone；ASBR 同时属于 area 1 和 area 2 |
| 3 | 观测重点 | 重点记录 A 经 area 2、B 经 area 1 的区域选择差异，以及 S 的 LFA 候选 N 的路径回到 S 的现象 |
| 4 | 判定原则 | 本用例为观测型；不要求毫秒级丢包指标，不把故障瞬间的微环判为功能失败 |
| 5 | 标准约束 | RFC 5286 6.3 明确此类场景不应使用 LFA；设备行为差异记录为观测项 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 记录各节点到外部前缀的下一跳、区域选择、LFA 计数、故障前后路由和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0260 | | | |
