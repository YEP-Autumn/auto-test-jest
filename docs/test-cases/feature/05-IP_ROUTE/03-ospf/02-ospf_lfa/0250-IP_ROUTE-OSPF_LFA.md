# RFC 8518 Figure 3 中反向 MAX_METRIC 链路仍可作为 D1 的候选 LFA

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0250-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0250`
- 用例标题：RFC 8518 Figure 3 中反向 MAX_METRIC 链路仍可作为 D1 的候选 LFA
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P2 / 功能（观测型）
- 执行方式：自动化脚本 / 手工
- 预估耗时：约 2 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与最短路径计算 |
| RFC 5286 | 3.5、3.6 | 排除 MAX_METRIC 节点/链路后的 LFA 选择 |
| RFC 8518 | 5.1、Figure 3 | 反向 MAX_METRIC 链路仍可作为 LFA |
| RFC 6987 | OSPF Stub Router Advertisement | OSPF MAX_METRIC 取值 65535 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `default` | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | 每台设备 1～3 个三层接口 | 接口需支持 `no switchport` |
| 接口开销 | 支持 `ip ospf cost 65535` | 不支持时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
      S = DUTA --10-- N1 = DUTB --10-- D1 = DUTD
         |                                  |
        10（S->N2）                        10
         |                                  |
      N2 = DUTC ----------------------------+
         |
        10
         |
      D2 = DUTE
```

内置拓扑：`LinkConstraint.five_devices_topo_links_type_1`。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| S-N1 | 10.1.2.0/24 | S=10.1.2.1，N1=10.1.2.2 | 10 |
| N1-D1 | 10.2.4.0/24 | N1=10.2.4.1，D1=10.2.4.2 | 10 |
| S-N2 | 10.1.3.0/24 | S=10.1.3.1，N2=10.1.3.2 | S->N2 为 10，N2->S 为 65535 |
| N2-D1 | 10.3.4.0/24 | N2=10.3.4.1，D1=10.3.4.2 | 10 |
| N2-D2 | 10.3.5.0/24 | N2=10.3.5.1，D2=10.3.5.2 | 10 |
| Loopback0 | 主机路由 | S=10.255.0.1/32，N1=10.255.0.2/32，N2=10.255.0.3/32，D1=10.255.0.4/32，D2=10.255.0.5/32 | 1 |

N2 的 `<PortA>` 上配置 `ip ospf cost 65535`，模拟 N2->S 方向的 IGP MAX_METRIC；S 的出方向仍为 10。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Router ID | S=10.255.0.1、N1=10.255.0.2、N2=10.255.0.3、D1=10.255.0.4、D2=10.255.0.5 | 显式配置 |
| Area | 0 | 单区域 |
| Network Type | point-to-point | 排除广播网 DR/BDR 影响 |
| Hello / Dead | 10s / 40s | 设备默认值 |
| LFA | `fast-reroute per-prefix enable` | 在邻居 Full 后使能 |

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
ip ospf cost 10
exit
interface <PortB>
no switchport
ip address 10.1.3.1/24
ip ospf network point-to-point
ip ospf cost 10
exit
interface loopback0
ip address 10.255.0.1/32
exit
router ospf
router-id 10.255.0.1
network 10.1.2.0/24 area 0
network 10.1.3.0/24 area 0
network 10.255.0.1/32 area 0
exit
end
```

DUTB（N1）、DUTD（D1）、DUTE（D2）按第 2 节地址配置。DUTC（N2）的 `<PortA>` 额外配置 `ip ospf cost 65535`。全部邻居 `Full` 后，在各设备 OSPF 进程视图执行：

```text
fast-reroute per-prefix enable
```

### 4.2 观测与预期

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 邻居 | `show ip ospf neighbor` | 所有直连邻居均为 `Full` |
| MAX_METRIC 配置 | `show running-config interface <PortA>`（N2） | 含 `ip ospf cost 65535` |
| LFA 使能 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix : enabled` |
| LFA 计算 | `show ip ospf fast-reroute per-prefix` | `Calculation` 的 `runs` 大于 0 |
| 受保护前缀 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| D1 主路径 | `show ip route 10.255.0.4` | 至少包含 `10.1.2.2, via <接口>` |
| 连通性 | `ping 10.255.0.4`、`ping 10.255.0.5` | 均为 `0% packet loss` |

### 4.3 故障与恢复

1. 关闭 DUTA 的 `<PortA>`，模拟 S-N1 链路故障。
2. `show ip route 10.255.0.4` 应切换为 `10.1.3.2, via <接口>`，即经 N2 到达 D1。
3. `ping 10.255.0.4`、`ping 10.255.0.5` 均应为 `0% packet loss`。
4. 恢复 `<PortA>`，D1 主路径回到 `10.1.2.2`，`Protected by LFA` 恢复大于 0，ping 恢复 `0% packet loss`。

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
| 1 | 拓扑说明 | 本用例为 RFC 8518 Figure 3 原图，5 台设备、5 条链路 |
| 2 | 方向性 | OSPF 接口开销是出方向属性，N2 的 `<PortA>` 配置 65535 只影响 N2->S 方向 |
| 3 | 观测限制 | 若设备直接从 SPF 中排除反向 MAX_METRIC 链路，记录为“实现差异”，不判功能失败 |
| 4 | 主路径 | 由于 S->N1 与 S->N2 开销均为 10，S 到 D1 可能形成 ECMP；用例只要求主路径包含 N1，不排除 N2 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 记录邻居、LFA 计数、MAX_METRIC 配置、故障前后路由和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0250 | | | |
