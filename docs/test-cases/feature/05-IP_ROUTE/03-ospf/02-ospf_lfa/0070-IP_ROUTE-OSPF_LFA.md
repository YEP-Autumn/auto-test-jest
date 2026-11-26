# 链路开销变化触发 OSPF 重新计算后，LFA 保护状态保持可用

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0070-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0070`
- 用例标题：链路开销变化触发 OSPF 重新计算后，LFA 保护状态保持可用
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
- 预估耗时：约 4 分钟
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

拓扑名称 / 来源：`four_devices_topo_links_type_3`（内置拓扑）。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| A-B | 10.0.12.0/24 | A=10.0.12.1，B=10.0.12.2 | 1 |
| B-C | 10.0.23.0/24 | B=10.0.23.1，C=10.0.23.2 | 1 |
| C-D | 10.0.34.0/24 | C=10.0.34.1，D=10.0.34.2 | 1 |
| D-A | 10.0.41.0/24 | D=10.0.41.1，A=10.0.41.2 | 10 |
| Loopback0 | 主机路由 | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32，D=4.4.4.4/32 | 1 |

A 到 C 的主路径为 A-B-C（开销 2），备份路径为 A-D-C（开销 11）。对邻居 D 满足 `D(D,C)=1 < D(D,A)=10 + D(A,C)=2`，因此 D 是合法 LFA。

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
ip ospf cost 1
exit
interface <PortD>
no switchport
ip address 10.0.41.2/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface loopback0
ip address 1.1.1.1/32
exit
router ospf
network 10.0.12.0/24 area 0
network 10.0.41.0/24 area 0
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
ip address 10.0.23.2/24
ip ospf network point-to-point
exit
interface <PortC>
no switchport
ip address 10.0.34.1/24
ip ospf network point-to-point
exit
interface loopback0
ip address 3.3.3.3/32
exit
router ospf
network 10.0.23.0/24 area 0
network 10.0.34.0/24 area 0
network 3.3.3.3/32 area 0
fast-reroute per-prefix enable
exit
end
```

DUTD：

```text
configure terminal
interface <PortC>
no switchport
ip address 10.0.34.2/24
ip ospf network point-to-point
exit
interface <PortD>
no switchport
ip address 10.0.41.1/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface loopback0
ip address 4.4.4.4/32
exit
router ospf
network 10.0.34.0/24 area 0
network 10.0.41.0/24 area 0
network 4.4.4.4/32 area 0
fast-reroute per-prefix enable
exit
end
```

### 4.2 基线检查与执行顺序

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 基线检查 | 四台 DUT 执行 `show ip ospf neighbor`；DUTA 执行 `show ip ospf route`、`show ip ospf fast-reroute per-prefix` | 邻居 `Full`；`3.3.3.3/32` 下一跳为 `10.0.12.2`；`Protected by LFA` 大于或等于 1 |
| 2 | 开销变更 | DUTA `<PortA>` 配置 `ip ospf cost 100` | OSPF 重新计算，主路径切换为 A-D-C |
| 3 | 等待切换 | DUTA 执行 `show ip route 3.3.3.3` | 主下一跳包含 `10.0.41.1, via`，并出现 `repair path: 10.0.12.2 via` |
| 4 | LFA 复核 | DUTA 执行 `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于或等于 1 |
| 5 | 转发检查 | DUTA 执行 `ping 3.3.3.3` | `0% packet loss` |
| 6 | 开销恢复 | DUTA `<PortA>` 配置 `ip ospf cost 1` | 主路径回到 A-B-C |
| 7 | 回切检查 | DUTA 执行 `show ip route 3.3.3.3` | 主下一跳包含 `10.0.12.2, via`，并出现 `repair path: 10.0.41.1 via` |

### 4.3 触发与流量发送

本用例不使用测试仪，触发方式为接口开销变更。

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 开销变更 | DUTA `<PortA>` 配置 `ip ospf cost 100` | OSPF 重新计算，主路径由 A-B-C 切换为 A-D-C |
| 等待切换 | DUTA 执行 `show ip route 3.3.3.3` | 主下一跳为 `10.0.41.1, via`，`repair path: 10.0.12.2 via` |
| LFA 更新 | DUTA 执行 `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于或等于 1 |
| 转发检查 | DUTA 执行 `ping 3.3.3.3` | `0% packet loss` |

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 开销恢复 | DUTA `<PortA>` 配置 `ip ospf cost 1` | 主路径回到 A-B-C |
| 路由回切 | DUTA 执行 `show ip route 3.3.3.3` | 主下一跳为 `10.0.12.2, via`，`repair path: 10.0.41.1 via` |
| LFA 复核 | DUTA 执行 `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于或等于 1 |
| 连通性 | DUTA 执行 `ping 3.3.3.3` | `0% packet loss` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | 四台 DUT 执行 `show ip ospf neighbor` | 直连邻居均为 `Full` |
| 表项面 | DUTA 执行 `show ip route 3.3.3.3`、`show ip ospf route` | 基线主下一跳 `10.0.12.2`；开销变更后 `10.0.41.1` 且 repair path 为 `10.0.12.2`；恢复后回到 `10.0.12.2`，repair path 为 `10.0.41.1` |
| 计数 / 告警面 | DUTA 执行 `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于或等于 1 |
| 转发面 | DUTA 执行 `ping 3.3.3.3` | 丢包率 = 0% |
| 恢复 / 资源面 | 开销恢复后的路由与 LFA 回显 | 主路径回到 A-B-C，`Protected by LFA` 大于或等于 1 |

### 4.6 判定标准

- 步骤 1：四台 DUT 的 `show ip ospf neighbor` 均包含 `Full`；DUTA 的 `show ip ospf route` 中 `3.3.3.3/32` 下一跳为 `via 10.0.12.2`；`Protected by LFA` 大于或等于 1。
- 步骤 2：DUTA `<PortA>` 开销改为 100 后，`show ip route 3.3.3.3` 的主下一跳为 `10.0.41.1, via`，且存在 `repair path: 10.0.12.2 via`；`show ip ospf route` 中 `3.3.3.3/32` 下一跳为 `via 10.0.41.1`。
- 步骤 3：`show ip ospf fast-reroute per-prefix` 的 `Protected by LFA` 大于或等于 1。
- 步骤 4：`ping 3.3.3.3` 丢包率 = 0%。
- 步骤 5：恢复开销 1 后，主下一跳回到 `10.0.12.2, via`，`repair path` 回到 `10.0.41.1 via`，`Protected by LFA` 大于或等于 1，`ping 3.3.3.3` 丢包率 = 0%。
- Pass：步骤 1 至 5 全部满足，且第 5 章清理后无残留 OSPF 与 LFA 配置。
- Fail：步骤 1 至 5 任一必检项不满足，或清理失败。
- Blocked：邻居无法进入 `Full`、设备不接受 LFA 命令，或拓扑后端无法建立对应拓扑。

## 5. 清理与恢复

以 DUTA 为例，DUTB/DUTC/DUTD 按各自接口和 Loopback 对称执行：

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
interface <PortD>
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
show ip ospf neighbor
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
| 实际观测 | 需记录邻居、LFA 计数、故障前后路由下一跳和 ping 结果 |
| 证据 | 回显 / 抓包文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0070` | | | |
