# 链形组网无可用备份路径时，LFA 保护前缀数为 0 且链路故障后路由不可达

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0040-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0040`
- 用例标题：链形组网无可用备份路径时，LFA 保护前缀数为 0 且链路故障后路由不可达
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
- 预估耗时：约 3 分钟
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
no shutdown
ip address 10.0.12.1/24
ip ospf network point-to-point
exit
interface loopback0
ip address 1.1.1.1/32
no shutdown
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
no shutdown
ip address 10.0.12.2/24
ip ospf network point-to-point
exit
interface <PortB>
no switchport
no shutdown
ip address 10.0.23.1/24
ip ospf network point-to-point
exit
interface loopback0
ip address 2.2.2.2/32
no shutdown
exit
router ospf
network 10.0.12.0/24 area 0
network 10.0.23.0/24 area 0
network 2.2.2.2/32 area 0
fast-reroute per-prefix enable
exit
end
```

DUTC：

```text
configure terminal
interface <PortB>
no switchport
no shutdown
ip address 10.0.23.2/24
ip ospf network point-to-point
exit
interface loopback0
ip address 3.3.3.3/32
no shutdown
exit
router ospf
network 10.0.23.0/24 area 0
network 3.3.3.3/32 area 0
fast-reroute per-prefix enable
exit
end
```

### 4.2 基线检查与执行顺序

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 邻居基线检查 | `show ip ospf neighbor` | DUTA 与 DUTB、DUTC 的邻居状态均为 `Full` |
| 2 | LFA 使能检查 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix : enabled` |
| 3 | 保护计数基线 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 等于 0 |
| 4 | 主路径基线 | `show ip ospf route` | `3.3.3.3/32` 的下一跳为 `10.0.12.2` |
| 5 | 连通性基线 | `ping 3.3.3.3` | `0% packet loss` |
| 6 | 注入 A-B 链路故障 | 见 4.3 | 目标前缀撤销，无 LFA 备份路径接管 |
| 7 | 恢复 A-B 链路 | 见 4.4 | 路由与连通性恢复 |

### 4.3 触发与流量发送

本用例不发送测试仪流量，触发后通过路由表和 ping 观测故障结果。

DUTA：

```text
configure terminal
interface <PortA>
shutdown
end
```

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| A-B 链路故障 | DUTA `<PortA>` 执行 `shutdown` | `3.3.3.3/32` 从路由表撤销；`Protected by LFA` 保持为 0 |

### 4.4 恢复

DUTA：

```text
configure terminal
interface <PortA>
no shutdown
end
```

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| A-B 链路恢复 | DUTA `<PortA>` 执行 `no shutdown` | `3.3.3.3/32` 重新出现，下一跳为 `10.0.12.2`，连通性恢复 |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 故障前邻居为 `Full`；故障后邻居 `10.0.12.2` 中断；恢复后邻居重新为 `Full` |
| LFA 汇总面 | `show ip ospf fast-reroute per-prefix` | 故障前后 `Fast-reroute per-prefix : enabled`，`Protected by LFA` 始终等于 0 |
| 表项面 | `show ip ospf route` | 故障前和恢复后存在 `3.3.3.3/32`，下一跳为 `10.0.12.2`；故障期间前缀撤销 |
| 路由表面 | `show ip route 3.3.3.3` | 故障期间回显 `% Network not in table`；恢复后下一跳包含 `via 10.0.12.2` |
| 转发面 | `ping 3.3.3.3` | 故障前和恢复后 `0% packet loss`；故障期间目标前缀无路由，报文不可达 |

### 4.6 判定标准

- 4.2 步骤 1 至 5 全部满足：邻居 `Full`，LFA 使能，`Protected by LFA` 等于 0，主路径下一跳为 `10.0.12.2`，`ping 3.3.3.3` 丢包率为 0%。
- 4.3 触发后：`show ip route 3.3.3.3` 回显 `% Network not in table`，`show ip ospf fast-reroute per-prefix` 的 `Protected by LFA` 等于 0。
- 4.4 恢复后：`show ip route 3.3.3.3` 下一跳包含 `via 10.0.12.2`，`ping 3.3.3.3` 丢包率为 0%。
- 上述条件全部满足且第 5 章清理成功：结论为 `Pass`。
- 上述条件任一不满足：结论为 `Fail`。
- 设备不接受 LFA 命令、拓扑后端无法建立链形邻居或测试环境不可用：结论为 `Blocked`，记录缺失项与现场。

## 5. 清理与恢复

DUTA/DUTB/DUTC 按各自接口和 Loopback 对称执行，以 DUTA 为例：

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
| 实际观测 | 记录邻居、LFA 计数、路由下一跳和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0040 | | | |
