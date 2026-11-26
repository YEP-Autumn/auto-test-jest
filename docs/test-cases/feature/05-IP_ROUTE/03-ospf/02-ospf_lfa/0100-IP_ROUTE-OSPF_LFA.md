# 多区域 ABR 汇总、外部 Type-1/Type-2 与默认路由在 LFA 使能后正确发布

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0100-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0100`
- 用例标题：多区域 ABR 汇总、外部 Type-1/Type-2 与默认路由在 LFA 使能后正确发布
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
- 预估耗时：约 6 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与路由计算 |
| RFC 5286 | 1、2、3 | LFA 无环条件、链路/节点保护 |
| RFC 6571 | LFA 适用性 | LFA 覆盖范围与无备份路径场景 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受命令为准 |
| 端口形态 | 按拓扑需要 2~4 个三层接口 | 接口需支持 `no switchport` |
| 拓扑后端 | 能建立对应拓扑 | 邻居无法 Full 时标记 `Blocked` |
| 软件版本 | 接受本用例命令 | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
   +--------+                   +--------+                   +--------+
   |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB <=> PortB--|  DUTC  |
   +--------+                   +--------+                   +--------+
```

拓扑名称 / 来源：`three_devices_topo_links_type_4`（内置拓扑）。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| A-B | 10.0.12.0/24 | A=10.0.12.1，B=10.0.12.2 | 1 |
| B-C | 10.0.23.0/24 | B=10.0.23.1，C=10.0.23.2 | 1 |
| Loopback0 | 主机路由 | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32 | 1 |

链形拓扑只有一条路径，A 到 C 不存在满足 RFC 5286 不等式的备份下一跳。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Area | 0 | 多区域用例按拓扑使用 Area 1 |
| Network Type | point-to-point | 网络类型用例单独说明 |
| Hello / Dead | 10s / 40s | 设备默认值 |
| LFA | `fast-reroute per-prefix enable` | 功能用例均使能 |

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
exit
interface loopback0
ip address 1.1.1.1/32
exit
router ospf
network 10.0.12.0/24 area 0
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
exit
interface loopback0
ip address 2.2.2.2/32
exit
router ospf
network 10.0.12.0/24 area 0
network 10.0.23.0/24 area 1
network 2.2.2.2/32 area 0
area 1 range 3.3.0.0/16
fast-reroute per-prefix enable
exit
end
```

DUTC：

```text
configure terminal
interface <PortB>
no switchport
ip address 10.0.23.2/24
ip ospf network point-to-point
exit
interface loopback0
ip address 3.3.3.3/32
exit
interface loopback1
ip address 172.16.1.1/32
exit
ip route 172.17.0.0/16 null0
router ospf
network 10.0.23.0/24 area 1
network 3.3.3.3/32 area 1
redistribute connected metric 20 metric-type 2
redistribute static metric 20 metric-type 1
default-information originate always metric-type 2
fast-reroute per-prefix enable
exit
end
```

### 4.2 基线检查与执行顺序

| 顺序 | 观测项 | 命令 | 预期 |
| --- | --- | --- | --- |
| 1 | 邻居 | `show ip ospf neighbor` | A/B、B/C 邻居 `Full` |
| 2 | 区域间汇总 | `show ip ospf route` | 存在 `IA 3.3.0.0/16` |
| 3 | Type-1 外部路由 | `show ip ospf route` | 存在 `E1 172.17.0.0/16` |
| 4 | Type-2 外部路由 | `show ip ospf route` | 存在 `E2 172.16.1.1/32` |
| 5 | 默认路由 | `show ip ospf route` | 存在 `E2 0.0.0.0/0` |
| 6 | LFA 汇总 | `show ip ospf fast-reroute per-prefix` | `Area 0.0.0.0`；`Fast-reroute per-prefix : enabled`；`Intra-area prefixes` 大于 0 |
| 7 | 无虚假保护 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA : 0`（单 ABR/ASBR 路径没有备份） |
| 8 | 连通性 | `ping 3.3.3.3` | `0% packet loss` |

基线检查通过后，按 4.3 关闭 A-B 链路，按 4.4 恢复 A-B 链路。

### 4.3 触发与流量发送

本用例不使用测试仪，触发方式为链路故障注入。

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 链路故障 | 关闭 DUTA 的 `<PortA>` | `show ip route 3.3.0.0/16` 返回 `% Network not in table` |
| 外部路由撤销 | 执行 `show ip route 172.17.0.0/16` | 返回 `% Network not in table` |
| 默认路由撤销 | 执行 `show ip route 0.0.0.0/0` | 返回 `% Network not in table` |

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 链路恢复 | DUTA `<PortA>` 执行 `no shutdown` | 区域间、外部和默认路由重新出现 |
| 区域间路由 | `show ip route 3.3.0.0/16` | 下一跳为 `10.0.12.2, via` |
| 默认路由 | `show ip route 0.0.0.0/0` | 存在 `0.0.0.0/0` |
| 连通性 | `ping 3.3.3.3` | `0% packet loss` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | A/B、B/C 邻居 `Full` |
| 表项面 | `show ip route`、`show ip ospf route` | 区域间、外部和默认路由存在，故障后撤销，恢复后重新出现 |
| 计数 / 告警面 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA : 0`，且 `Intra-area prefixes` 大于 0 |
| 转发面 | `ping 3.3.3.3` | 丢包率 = 0% |
| 恢复 / 资源面 | 恢复后的路由回显 | 区域间、外部和默认路由恢复 |

### 4.6 判定标准

- 步骤 1：`show ip ospf neighbor` 中 A/B、B/C 邻居均为 `Full`。
- 步骤 2：`show ip ospf route` 同时存在 `IA 3.3.0.0/16`、`E1 172.17.0.0/16`、`E2 172.16.1.1/32` 和 `E2 0.0.0.0/0`。
- 步骤 3：`show ip ospf fast-reroute per-prefix` 显示 `Area 0.0.0.0`、`Fast-reroute per-prefix : enabled`、`Intra-area prefixes` 大于 0，且 `Protected by LFA : 0`。
- 步骤 4：`ping 3.3.3.3` 丢包率 = 0%。
- 步骤 5：关闭 `<PortA>` 后，`show ip route 3.3.0.0/16`、`show ip route 172.17.0.0/16`、`show ip route 0.0.0.0/0` 均返回 `% Network not in table`。
- 步骤 6：恢复 `<PortA>` 后，`show ip route 3.3.0.0/16` 的下一跳为 `10.0.12.2, via`；`show ip route 0.0.0.0/0` 中存在 `0.0.0.0/0`；区域间、外部和默认路由重新出现；`ping 3.3.3.3` 丢包率 = 0%。
- Pass：步骤 1 至 6 全部满足，且第 5 章清理成功。
- Fail：步骤 1 至 6 任一必检项不满足，或清理失败。
- Blocked：邻居无法进入 `Full`、设备不接受 LFA 命令，或拓扑后端无法建立三设备链形拓扑。

## 5. 清理与恢复

DUTA/DUTB/DUTC 按各自接口、Loopback 和静态路由对称执行，以 DUTA 为例：

```text
configure terminal
no router ospf
interface <PortA>
no shutdown
no ip ospf network
no ip address
switchport
exit
no interface loopback0
end
```

DUTC 额外执行：

```text
configure terminal
no ip route 172.17.0.0/16 null0
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
| 1 | 版本差异 | 命令不可用时标记 `Blocked`，不将版本差异判为功能失败 |
| 2 | 清理要求 | 在全局配置视图执行 `no router ospf` 删除进程，再恢复接口二层状态 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | `Pass` / `Fail` / `Blocked` |
| 实际观测 | 需记录邻居、LFA 计数、区域间/外部/默认路由和 ping 结果 |
| 证据 | 回显 / 抓包文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0100` | | | |
