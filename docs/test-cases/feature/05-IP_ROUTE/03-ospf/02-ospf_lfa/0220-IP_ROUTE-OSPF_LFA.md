# RFC 8518 Figure 2 原图中 MHP 的两个 ECMP 主下一跳在单路径故障后保持可达

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0220-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0220`
- 用例标题：RFC 8518 Figure 2 原图中 MHP 的两个 ECMP 主下一跳在单路径故障后保持可达
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化脚本 / 手工
- 预估耗时：约 7 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与最短路径计算 |
| RFC 5286 | 3.4、6.1 | ECMP 与 MHP 的 LFA 计算 |
| RFC 8518 | 2、3、Figure 2 | 不同 ECMP 主下一跳应分别继承各自 LFA |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `default` | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | 每台设备 2～3 个三层接口 | 接口需支持 `no switchport` |
| 拓扑后端 | 六设备拓扑可建立 | 邻居无法 Full 时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
           S
         / | \
        /  |  \
      N1   N2  B
       \   /    \
        E------ F
```

内置拓扑：`LinkConstraint.six_devices_topo_links_type_3`。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| S-N2 | 10.1.3.0/24 | S=10.1.3.1，N2=10.1.3.2 | 4 |
| S-B | 10.1.4.0/24 | S=10.1.4.1，B=10.1.4.2 | 3 |
| S-N1 | 10.1.2.0/24 | S=10.1.2.1，N1=10.1.2.2 | 10 |
| N1-E | 10.2.5.0/24 | N1=10.2.5.1，E=10.2.5.2 | 5 |
| N2-B | 10.3.4.0/24 | N2=10.3.4.1，B=10.3.4.2 | 4 |
| B-F | 10.4.6.0/24 | B=10.4.6.1，F=10.4.6.2 | 1 |
| E-F | 10.5.6.0/24 | E=10.5.6.1，F=10.5.6.2 | 16 |
| Loopback0 | 主机路由 | S=10.255.0.1，N1=10.255.0.2，N2=10.255.0.3，B=10.255.0.4，E=10.255.0.5，F=10.255.0.6 | 1 |
| MHP P | 主机路由 | 192.0.2.1/32，E/F 双端发布，E 侧 cost 5，F 侧 cost 16 | — |

S 到 P 的两条路径：

```text
S-N1-E-P：10 + 5 + 5 = 20
S-B-F-P： 3 + 1 + 16 = 20
```

因此 P 在 S 上形成经 N1 和 B 的 ECMP。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Router ID | S=10.255.0.1、N1=10.255.0.2、N2=10.255.0.3、B=10.255.0.4、E=10.255.0.5、F=10.255.0.6 | 显式配置 |
| Area | 0 | 单区域 |
| Network Type | point-to-point | 排除广播网 DR/BDR 影响 |
| Hello / Dead | 10s / 40s | 设备默认值 |
| LFA | `fast-reroute per-prefix enable` | 在初始 OSPF 配置中使能 |

### 3.2 初始状态

- 接口处于默认二层状态；OSPF 进程、Loopback、L3 地址和 LFA 配置为空。
- 拓扑后端已建立并启用对应链路。
- 现场保留：默认清理。

## 4. 测试步骤与预期结果

### 4.1 配置

DUTA（S）：

```text
configure terminal
interface <PortA>
no switchport
ip address 10.1.3.1/24
ip ospf network point-to-point
ip ospf cost 4
exit
interface <PortB>
no switchport
ip address 10.1.4.1/24
ip ospf network point-to-point
ip ospf cost 3
exit
interface <PortC>
no switchport
ip address 10.1.2.1/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface loopback0
ip address 10.255.0.1/32
exit
router ospf
router-id 10.255.0.1
network 10.1.3.0/24 area 0
network 10.1.4.0/24 area 0
network 10.1.2.0/24 area 0
network 10.255.0.1/32 area 0
exit
end
```

DUTB～DUTF 按 2 节地址和开销配置。E、F 额外配置：

```text
interface loopback1
ip address 192.0.2.1/32
ip ospf cost 5        # E 侧
exit
```

F 侧 `loopback1` 的 `ip ospf cost` 为 16。全部邻居 `Full` 后，在各设备 OSPF 进程视图执行：

```text
fast-reroute per-prefix enable
```

### 4.2 观测与预期

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 邻居 | `show ip ospf neighbor` | 所有邻居 `Full` |
| LFA 使能 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix : enabled` |
| LFA 计算 | `show ip ospf fast-reroute per-prefix` | `Calculation` 的 `runs` 大于 0 |
| 受保护前缀 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| MHP ECMP | `show ip ospf route` | `192.0.2.1/32` 同时经 `via 10.1.2.2` 和 `via 10.1.4.2` |
| 连通性 | `ping 192.0.2.1` | `0% packet loss` |

### 4.3 故障与恢复

1. 关闭 DUTA 的 `<PortB>`，模拟 S-B 主路径故障。
2. `show ip route 192.0.2.1` 应出现 `10.1.2.2, via <接口>`；`show ip ospf route` 中 `192.0.2.1/32` 应只保留 `via 10.1.2.2`。
3. `ping 192.0.2.1` 应为 `0% packet loss`。
4. 恢复 `<PortB>`，MHP 重新形成 ECMP，`Protected by LFA` 恢复大于 0，ping 恢复 `0% packet loss`。

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
interface <PortB/PortC>
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

无 loopback1 的设备跳过最后一条。清理后检查：

```text
show running-config | include router ospf
show running-config | include fast-reroute
show ip ospf processes-count
```

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 拓扑说明 | 本用例为 RFC 8518 Figure 2 的 6 设备原图，保留 S、N1、N2、B、E、F 全部节点和链路 |
| 2 | MHP 说明 | `192.0.2.1/32` 在 E、F 上重复配置，属于 anycast/MHP；必须显式配置 Router ID |
| 3 | 开销说明 | E 侧 P 的 cost 取 5，F 侧取 16，使 S 到 P 经 E/F 的路径都等于 20，符合 RFC 文字描述 |
| 4 | 配置时序 | LFA 已在初始配置中使能，邻居 Full 后检查保护计数 |
| 5 | 观测限制 | MHP 逐前缀 LFA 条目可能不稳定；必检项为 ECMP、保护计数和故障后可达性 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 记录邻居、LFA 计数、MHP 的 ECMP 下一跳、故障前后路由和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0220 | | | |
