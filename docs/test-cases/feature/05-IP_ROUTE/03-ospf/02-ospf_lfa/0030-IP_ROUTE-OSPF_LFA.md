# B 节点故障后，OSPF LFA 通过 A-D-C 路径绕开故障节点并恢复

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0030-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0030`
- 用例标题：B 节点故障后，OSPF LFA 通过 A-D-C 路径绕开故障节点并恢复
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
| 1 | 邻居基线检查 | `show ip ospf neighbor` | DUTA 与 DUTB、DUTD 的邻居状态均为 `Full` |
| 2 | LFA 覆盖基线 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| 3 | 主路径基线 | `show ip ospf route` | `3.3.3.3/32` 的下一跳为 `10.0.12.2` |
| 4 | 连通性基线 | `ping 3.3.3.3` | `0% packet loss` |
| 5 | 注入 B 节点故障 | 见 4.3 | 路由绕开 B 节点，切换到 A-D-C 路径 |
| 6 | 恢复 B 节点 | 见 4.4 | 邻居、主路径和连通性恢复 |

### 4.3 触发与流量发送

本用例不发送测试仪流量，触发后通过邻居、路由和 ping 观测切换结果。

DUTB：

```text
configure terminal
interface <PortA>
shutdown
exit
interface <PortB>
shutdown
end
```

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| B 节点故障 | DUTB `<PortA>` 与 `<PortB>` 执行 `shutdown` | DUTA 的邻居 `10.0.12.2` 中断，`3.3.3.3/32` 切换为经 `10.0.41.1` 的 A-D-C 路径 |

### 4.4 恢复

DUTB：

```text
configure terminal
interface <PortA>
no shutdown
exit
interface <PortB>
no shutdown
end
```

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| B 节点恢复 | DUTB `<PortA>` 与 `<PortB>` 执行 `no shutdown` | 邻居 `10.0.12.2` 重新建立，`3.3.3.3/32` 回切到经 `10.0.12.2` 的主路径 |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 故障前邻居为 `Full`；故障后不再包含 `10.0.12.2`；恢复后重新包含 `10.0.12.2` |
| 协议配置面 | `show ip ospf fast-reroute per-prefix` | 故障前 `Fast-reroute per-prefix : enabled` 且 `Protected by LFA` 大于 0；恢复后 `Protected by LFA` 大于 0 |
| 表项面 | `show ip ospf route` | `3.3.3.3/32` 的下一跳依次为 `10.0.12.2`（故障前）、`10.0.41.1`（故障中）、`10.0.12.2`（恢复后） |
| 路由表面 | `show ip route 3.3.3.3` | 故障中下一跳包含 `via 10.0.41.1`；恢复后下一跳包含 `via 10.0.12.2` |
| 转发面 | `ping 3.3.3.3` | 故障前、故障中、恢复后均为 `0% packet loss` |

### 4.6 判定标准

- 4.2 步骤 1 至 4 全部满足：邻居 `Full`，`Protected by LFA` 大于 0，主路径下一跳为 `10.0.12.2`，`ping 3.3.3.3` 丢包率为 0%。
- 4.3 触发后：`show ip ospf neighbor` 不再包含 `10.0.12.2`；`show ip route 3.3.3.3` 下一跳包含 `via 10.0.41.1`；`show ip ospf route` 中 `3.3.3.3/32` 的下一跳为 `10.0.41.1`；`ping 3.3.3.3` 丢包率为 0%。
- 4.4 恢复后：邻居重新包含 `10.0.12.2`；`show ip route 3.3.3.3` 下一跳包含 `via 10.0.12.2`；`ping 3.3.3.3` 丢包率为 0%。
- 上述条件全部满足且第 5 章清理成功：结论为 `Pass`。
- 上述条件任一不满足：结论为 `Fail`。
- 设备不接受 LFA 命令、拓扑后端无法建立邻居或测试环境不可用：结论为 `Blocked`，记录缺失项与现场。

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
| 实际观测 | 记录邻居、LFA 计数、路由下一跳和 ping 结果 |
| 证据 | 回显 / 抓包文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0030` | | | |
