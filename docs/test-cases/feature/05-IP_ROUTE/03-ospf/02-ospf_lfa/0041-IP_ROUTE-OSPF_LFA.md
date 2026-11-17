# 存在物理备份路径但开销不满足无环不等式时，LFA 保护前缀数为 0 且故障后依赖重收敛恢复

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0041-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0041`
- 用例标题：存在物理备份路径但开销不满足无环不等式时，LFA 保护前缀数为 0 且故障后依赖重收敛恢复
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化脚本 / 手工
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
| 设备 profile | `default` | 以 CLI 是否接受命令为准 |
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

内置拓扑：`LinkConstraint.four_devices_topo_links_type_3`。

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

### 4.2 观测与预期

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 邻居状态 | `show ip ospf neighbor` | 四台设备邻居均为 `Full` |
| A 的备份邻居 | `show ip ospf neighbor` | A 看到 `2.2.2.2` 和 `4.4.4.4` 均为 `Full` |
| A 的主路径 | `show ip route 3.3.3.3` | 下一跳为 `10.0.12.2` |
| D 的回绕路径 | `show ip route 3.3.3.3` | D 到 C 的下一跳为 `10.0.41.2`，说明 D 经 A 回绕 |
| LFA 计算 | `show ip ospf fast-reroute per-prefix` | `Calculation` 的 `runs` 大于 0 |
| LFA 使能 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix : enabled` |
| 区域内前缀 | `show ip ospf fast-reroute per-prefix` | `Intra-area prefixes` 大于 0 |
| 无保护前缀 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 等于 0 |
| 主路径明细 | `show ip ospf route` | `3.3.3.3/32` 的下一跳为 `10.0.12.2` |
| 连通性 | `ping 3.3.3.3` | `0% packet loss` |

### 4.3 触发与故障后预期

DUTA：

```text
configure terminal
interface <PortA>
shutdown
end
```

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 重收敛路径 | `show ip route 3.3.3.3` | 下一跳切换为 `10.0.41.1`（A-D-C） |
| 连通性 | `ping 3.3.3.3` | 收敛后 `0% packet loss` |
| LFA 覆盖 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 等于 0 |

### 4.4 恢复与预期

DUTA：

```text
configure terminal
interface <PortA>
no shutdown
end
```

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 路由恢复 | `show ip route 3.3.3.3` | 下一跳回到 `10.0.12.2` |
| 连通性恢复 | `ping 3.3.3.3` | `0% packet loss` |

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
| 3 | 观测限制 | 设备只提供汇总保护计数，不提供逐前缀备份下一跳明细；通过 A、D 两侧路由回绕关系、保护计数和故障后重收敛共同判定 |
| 4 | 拓扑选择 | 该用例需要四设备环形拓扑，与 0040 的链形拓扑不兼容，因此单独建立脚本 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 记录邻居、LFA 计数、路由下一跳和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0041 | | | |
