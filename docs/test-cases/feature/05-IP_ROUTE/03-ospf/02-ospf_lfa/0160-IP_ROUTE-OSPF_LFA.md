# RFC 6571 Figure 1 原图中 S 到 D 的主路径故障后由 A 或 F 作为 LFA 恢复

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0160-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0160`
- 用例标题：RFC 6571 Figure 1 原图中 S 到 D 的主路径故障后由 A 或 F 作为 LFA 恢复
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化脚本 / 手工
- 预估耗时：约 3 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与最短路径计算 |
| RFC 5286 | 3.1、3.2 | 链路保护 LFA 与无环条件 |
| RFC 6571 | 3.1、Figure 1 | Example 1 原图的 LFA 适用性 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `default` | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | 每台设备 1～3 个三层接口 | 接口需支持 `no switchport` |
| DUT 数量 | 9 台 | 设备不足时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
                        D = DUTE
                       /        \
                  10 /            \ 10
                    /              \
                G = DUTH          H = DUTL ---------.
                   |                |                |
                 1 |              1 |                |
                   |                |                |
                B = DUTC          C = DUTD           | 10
                   |                |\               |
                   |                | \              |
                   |                |  \ 6           |
                   |                |   \            |
                 7 |             10 |    E = DUTG    F = DUTF
                   |                |   /           /
                   |                |  / 6        / 5
                   |                | /          /
                   |                |/          /
                A = DUTB ---------- S = DUTA --/
                                    7
```

内置拓扑：`LinkConstraint.nine_devices_topo_links_type_1`。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| S-A | 10.1.2.0/24 | S=10.1.2.1，A=10.1.2.2 | 7 |
| S-C | 10.1.4.0/24 | S=10.1.4.1，C=10.1.4.2 | 10 |
| S-F | 10.1.6.0/24 | S=10.1.6.1，F=10.1.6.2 | 5 |
| A-B | 10.2.3.0/24 | A=10.2.3.1，B=10.2.3.2 | 7 |
| B-G | 10.3.7.0/24 | B=10.3.7.1，G=10.3.7.2 | 1 |
| C-H | 10.4.8.0/24 | C=10.4.8.1，H=10.4.8.2 | 1 |
| C-E | 10.4.9.0/24 | C=10.4.9.1，E=10.4.9.2 | 6 |
| D-G | 10.5.7.0/24 | D=10.5.7.1，G=10.5.7.2 | 10 |
| D-H | 10.5.8.0/24 | D=10.5.8.1，H=10.5.8.2 | 10 |
| H-F | 10.8.6.0/24 | H=10.8.6.1，F=10.8.6.2 | 10 |
| Loopback0 | 主机路由 | 10.255.0.1/32 ～ 10.255.0.9/32 | 1 |

S 到 D 的主路径为 S-C-H-D，总开销 10+1+10=21；A、F 均可作为 LFA：

- S-A-B-G-D：7+7+1+10=25；
- S-F-H-D：5+10+10=25。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Router ID | 10.255.0.1 ～ 10.255.0.9 | 显式配置 |
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
ip address 10.1.2.1/24
ip ospf network point-to-point
ip ospf cost 7
exit
interface <PortB>
no switchport
ip address 10.1.4.1/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface <PortC>
no switchport
ip address 10.1.6.1/24
ip ospf network point-to-point
ip ospf cost 5
exit
interface loopback0
ip address 10.255.0.1/32
exit
router ospf
router-id 10.255.0.1
network 10.1.2.0/24 area 0
network 10.1.4.0/24 area 0
network 10.1.6.0/24 area 0
network 10.255.0.1/32 area 0
exit
end
```

DUTB～DUTL 按第 2 节地址与开销配置。全部邻居 `Full` 后，在各设备 OSPF 进程视图执行 `fast-reroute per-prefix enable`。

### 4.2 观测与预期

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 邻居 | `show ip ospf neighbor` | 所有直连邻居均为 `Full` |
| LFA 使能 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix : enabled` |
| LFA 计算 | `show ip ospf fast-reroute per-prefix` | `Calculation` 的 `runs` 大于 0 |
| 受保护前缀 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| S 到 D 主路径 | `show ip route 10.255.0.5` | 下一跳为 `10.1.4.2`（经 C） |
| 连通性 | `ping 10.255.0.5` | `0% packet loss` |

### 4.3 故障与恢复

1. 关闭 DUTA 的 `<PortB>`，模拟 S-C 链路故障。
2. `show ip route 10.255.0.5` 应切换为经 `10.1.2.2`（A）或 `10.1.6.2`（F）的下一跳。
3. `ping 10.255.0.5`、`ping 10.255.0.9` 均应为 `0% packet loss`。
4. 恢复 `<PortB>`，主路径回到 `10.1.4.2`，`Protected by LFA` 恢复大于 0，ping 恢复 `0% packet loss`。

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
| 1 | 拓扑说明 | 本用例为 RFC 6571 Figure 1 原图，9 台设备、10 条链路 |
| 2 | 与设计文档差异 | 设计文档早期版本误加了 A-C、E-F 两条链路；本脚本按 RFC 原图实现，最终以本文和脚本为准 |
| 3 | 主备路径 | 主路径 S-C-H-D 开销 21；A、F 两条 LFA 路径开销均为 25 |
| 4 | 故障后下一跳 | 故障后 A、F 两条路径等开销，脚本允许任一下一跳，不限定唯一邻居 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 记录邻居、LFA 计数、故障前后路由和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0160 | | | |
