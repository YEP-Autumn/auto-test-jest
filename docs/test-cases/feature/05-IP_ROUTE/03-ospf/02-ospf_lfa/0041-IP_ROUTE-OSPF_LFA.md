# 存在物理备份路径但开销不满足无环不等式时，LFA 保护前缀数为 0 且故障后依赖重收敛恢复

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0041-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0041`
- 用例标题：存在物理备份路径但开销不满足无环不等式时，LFA 保护前缀数为 0 且故障后依赖重收敛恢复
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
- 预估耗时：约 3 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与路由计算 |
| RFC 5286 | 1、2、3 | LFA 无环不等式、链路/节点保护 |
| RFC 6571 | LFA 适用性 | 备份邻居开销不满足无环条件时不产生 LFA |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受命令为准 |
| 端口形态 | 四台设备各 2 个三层接口 | 接口需支持 `no switchport` |
| 拓扑后端 | 能建立四设备环形拓扑 | 邻居无法 Full 时标记 `Blocked` |
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
| A-B | 10.0.12.0/24 | A=10.0.12.1，B=10.0.12.2 | 1 / 1 |
| B-C | 10.0.23.0/24 | B=10.0.23.1，C=10.0.23.2 | 1 / 1 |
| C-D | 10.0.34.0/24 | C=10.0.34.1，D=10.0.34.2 | C 侧 1，D 侧 10 |
| D-A | 10.0.41.0/24 | D=10.0.41.1，A=10.0.41.2 | 1 / 1 |
| Loopback0 | 主机路由 | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32，D=4.4.4.4/32 | 1 |

以 A 为源节点 S、C 为目的节点、D 为候选备份邻居 N：

- A 到 C 的主路径为 A-B-C，开销 2；物理备份路径 A-D-C 存在，开销 12。
- D 到 C 的最短路径为 D-A-B-C，开销 3，小于 D-C 直连的 10。D 的备份路径会回到源节点 A。
- `D(D,C)=3`，`D(D,A)+D(A,C)=1+2=3`，`3 < 3` 不成立，D 不满足 RFC 5286 无环不等式，不能作为 LFA。

因此 A 的 `Protected by LFA` 应为 0；A-B 链路故障后，A 到 C 需要依赖 OSPF 重新收敛到 A-D-C。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Area | 0 | 单区域 |
| Network Type | point-to-point | 网络类型用例单独说明 |
| Hello / Dead | 10s / 40s | 设备默认值 |
| LFA | `fast-reroute per-prefix enable` | 在初始 OSPF 配置中使能 |

### 3.2 初始状态

- 接口处于默认二层状态；OSPF 进程、Loopback、L3 地址、接口开销和 LFA 配置为空。
- 拓扑后端已建立并启用四设备环形链路。
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
interface <PortD>
no switchport
no shutdown
ip address 10.0.41.2/24
ip ospf network point-to-point
exit
interface loopback0
ip address 1.1.1.1/32
no shutdown
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
interface <PortC>
no switchport
no shutdown
ip address 10.0.34.1/24
ip ospf network point-to-point
exit
interface loopback0
ip address 3.3.3.3/32
no shutdown
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
no shutdown
ip address 10.0.34.2/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface <PortD>
no switchport
no shutdown
ip address 10.0.41.1/24
ip ospf network point-to-point
exit
interface loopback0
ip address 4.4.4.4/32
no shutdown
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
| 1 | 邻居基线检查 | `show ip ospf neighbor` | 四台设备邻居均为 `Full` |
| 2 | A 的备份邻居检查 | DUTA `show ip ospf neighbor` | DUTA 看到 `2.2.2.2` 和 `4.4.4.4` 均为 `Full` |
| 3 | A 的主路径基线 | DUTA `show ip route 3.3.3.3` | 下一跳为 `10.0.12.2` |
| 4 | D 的回绕路径检查 | DUTD `show ip route 3.3.3.3` | 下一跳为 `10.0.41.2`，D 经 A 回绕 |
| 5 | LFA 计算基线 | `show ip ospf fast-reroute per-prefix` | `Calculation` 的 `runs` 大于 0 |
| 6 | LFA 使能检查 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix : enabled` |
| 7 | 区域内前缀基线 | `show ip ospf fast-reroute per-prefix` | `Intra-area prefixes` 大于 0 |
| 8 | 保护计数基线 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 等于 0 |
| 9 | 主路径明细基线 | `show ip ospf route` | `3.3.3.3/32` 的下一跳为 `10.0.12.2` |
| 10 | 连通性基线 | `ping 3.3.3.3` | `0% packet loss` |
| 11 | 注入 A-B 链路故障 | 见 4.3 | 依赖 OSPF 重收敛切换到 A-D-C |
| 12 | 恢复 A-B 链路 | 见 4.4 | 路由回切到 A-B-C，连通性恢复 |

### 4.3 触发与流量发送

本用例不发送测试仪流量，触发后通过重收敛前后的路由表和 ping 观测切换结果。

DUTA：

```text
configure terminal
interface <PortA>
shutdown
end
```

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| A-B 链路故障 | DUTA `<PortA>` 执行 `shutdown` | `3.3.3.3/32` 重收敛到下一跳 `10.0.41.1`（A-D-C）；`Protected by LFA` 保持为 0；收敛后 `ping 3.3.3.3` 为 `0% packet loss` |

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
| A-B 链路恢复 | DUTA `<PortA>` 执行 `no shutdown` | `3.3.3.3/32` 下一跳回到 `10.0.12.2`，`ping 3.3.3.3` 为 `0% packet loss` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 四台设备邻居均为 `Full`；DUTA 同时看到 `2.2.2.2` 和 `4.4.4.4` |
| LFA 汇总面 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix : enabled`；`Calculation` 的 `runs` 大于 0；`Intra-area prefixes` 大于 0；`Protected by LFA` 等于 0 |
| 表项面 | `show ip ospf route`、`show ip route 3.3.3.3` | DUTA 主路径下一跳为 `10.0.12.2`；DUTD 到 `3.3.3.3` 的下一跳为 `10.0.41.2`，证明 D 的备份路径回绕到 A |
| 路由表面 | `show ip route 3.3.3.3` | 故障前 `10.0.12.2`；故障后切换为 `10.0.41.1`（A-D-C）；恢复后回到 `10.0.12.2` |
| 转发面 | `ping 3.3.3.3` | 基线、重收敛后、恢复后均为 `0% packet loss` |

### 4.6 判定标准

- 4.2 步骤 1 至 10 全部满足：邻居均为 `Full`，DUTA 看到 `2.2.2.2` 和 `4.4.4.4`，DUTA 主路径下一跳为 `10.0.12.2`，DUTD 到 `3.3.3.3` 的下一跳为 `10.0.41.2`，LFA `Calculation` 的 `runs` 大于 0，LFA 使能，`Intra-area prefixes` 大于 0，`Protected by LFA` 等于 0，`ping 3.3.3.3` 丢包率为 0%。
- 4.3 触发后：`show ip route 3.3.3.3` 下一跳切换为 `10.0.41.1`，`Protected by LFA` 保持为 0，收敛后 `ping 3.3.3.3` 丢包率为 0%。
- 4.4 恢复后：`show ip route 3.3.3.3` 下一跳回到 `10.0.12.2`，`ping 3.3.3.3` 丢包率为 0%。
- 上述条件全部满足且第 5 章清理成功：结论为 `Pass`。
- 上述条件任一不满足：结论为 `Fail`。
- 设备不接受 LFA 命令、LFA 计算未运行、拓扑后端无法建立四设备环或测试环境不可用：结论为 `Blocked`，记录缺失项与现场。

## 5. 清理与恢复

DUTA/DUTB/DUTC/DUTD 按各自接口、开销和 Loopback 对称执行，以 DUTA 为例：

```text
configure terminal
no router ospf
interface <PortA>
no shutdown
no ip ospf network
no ip address
switchport
exit
interface <PortD>
no shutdown
no ip ospf network
no ip address
switchport
exit
no interface loopback0
end
```

DUTD 的 C-D 接口还需要执行 `no ip ospf cost`，恢复默认开销。

清理后检查：

```text
show running-config | include router ospf
show running-config | include fast-reroute
show running-config | include ip ospf cost
show ip ospf processes-count
```

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 版本差异 | 命令不可用时标记 `Blocked`，不将版本差异判为功能失败 |
| 2 | 清理要求 | 在全局配置视图执行 `no router ospf` 删除进程，再恢复接口二层状态和默认开销 |
| 3 | 观测限制 | 设备仅提供汇总保护计数，不提供逐前缀备份下一跳明细；通过 A、D 两侧路由回绕关系、保护计数和故障后重收敛共同判定 |
| 4 | 拓扑选择 | 该用例需要四设备环形拓扑，与 0040 的链形拓扑不兼容，因此单独建立用例实现 |

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
| 0041 | | | |
