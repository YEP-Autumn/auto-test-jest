# RFC 5286 Figure 1 反例中 N1-D 开销 30 不满足无环不等式，S 到 D 的 Loopback 不再受 LFA 保护

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0120-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0120`
- 用例标题：RFC 5286 Figure 1 反例中 N1-D 开销 30 不满足无环不等式，S 到 D 的 Loopback 不再受 LFA 保护
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化脚本 / 手工
- 预估耗时：约 5 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与最短路径计算 |
| RFC 5286 | Figure 1、3.1 | Inequality 1 不成立时不得选择该邻居作为 LFA |
| RFC 5286 | 3.5、3.6 | 备份路径开销过大时 LFA 覆盖范围下降 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `default` | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | 每台设备 2 个三层接口 | 接口需支持 `no switchport` |
| 拓扑后端 | 四设备环形拓扑可建立 | 邻居无法 Full 时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
   +--------+  5   +--------+
   |  DUTA  |------|  DUTB  |
   |   S    |      |   E    |
   +--------+      +--------+
       | 8              | 4
       |                |
   +--------+  30  +--------+
   |  DUTD  |------|  DUTC  |
   |   N1   |      |   D    |
   +--------+      +--------+
```

内置拓扑：`LinkConstraint.four_devices_topo_links_type_3`。

| 设备 | 角色 | 接口 | 地址 | 开销 | 连接对端 |
| --- | --- | --- | --- | --- | --- |
| DUTA | S | PortA | 10.0.12.1/24 | 5 | DUTB PortA |
| DUTA | S | PortD | 10.0.41.2/24 | 8 | DUTD PortD |
| DUTB | E | PortA | 10.0.12.2/24 | 5 | DUTA PortA |
| DUTB | E | PortB | 10.0.23.1/24 | 4 | DUTC PortB |
| DUTC | D | PortB | 10.0.23.2/24 | 4 | DUTB PortB |
| DUTC | D | PortC | 10.0.34.1/24 | 30 | DUTD PortC |
| DUTD | N1 | PortC | 10.0.34.2/24 | 30 | DUTC PortC |
| DUTD | N1 | PortD | 10.0.41.1/24 | 8 | DUTA PortD |
| 各设备 | — | loopback0 | A=1.1.1.1/32、B=2.2.2.2/32、C=3.3.3.3/32、D=4.4.4.4/32 | 1 | — |

S 到 D 的主路径仍为 S-E-D（5 + 4 = 9），但 N1 经 S 绕行到 D 的开销为 `8 + 9 = 17`，小于 N1-D 直接开销 30。RFC 5286 Inequality 1 不成立：

```text
D_opt(N1,D)=30 < D_opt(N1,S)=8 + D_opt(S,D)=9 = 17   // 为假
```

因此 N1 不能作为 S 到 D 的 LFA，S 到 D 的 Loopback 前缀不再受保护。受保护前缀总数只剩 1 个：C-D 直连网段 `10.0.34.0/24` 对 N1 是直连前缀，仍可作为该直连前缀的 LFA。这与 RFC 5286 Figure 1 正文中“N1-D 开销增加到 30 后 N1 不再是 LFA”的描述一致。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
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

DUTA、DUTB、DUTC、DUTD 的配置与 0110 相同，唯一差异是 DUTC `<PortC>` 和 DUTD `<PortC>` 的 OSPF 开销为 30：

```text
interface <PortC>
no switchport
ip address 10.0.34.1/24
ip ospf network point-to-point
ip ospf cost 30
exit
```

全部邻居 `Full` 后，在各设备 OSPF 进程视图执行：

```text
fast-reroute per-prefix enable
```

### 4.2 观测与预期

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 邻居 | `show ip ospf neighbor` | 所有邻居 `Full` |
| LFA 使能 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix : enabled` |
| 区域内前缀 | `show ip ospf fast-reroute per-prefix` | `Intra-area prefixes` 大于 0 |
| 受保护前缀 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA : 1`（仅剩 C-D 直连网段，S 到 D 的 Loopback 不受保护） |
| 主路径 | `show ip ospf route` | `3.3.3.3/32` 经 `via 10.0.12.2` |
| 连通性 | `ping 3.3.3.3` | `0% packet loss` |

先等待 `Intra-area prefixes` 大于 0 且 `Calculation` 的 `runs` 大于 0，再断言 `Protected by LFA : 1`，避免把“LFA 计算尚未执行/被延迟”误判为“无 LFA”。该 1 个受保护前缀是 N1 直连的 C-D 网段；S 到 D 的 Loopback 已不再被 N1 保护。

### 4.3 故障与恢复

1. 关闭 DUTA 的 `<PortA>`。
2. 由于没有预计算 LFA，只能等待 OSPF 重新收敛；`show ip route 3.3.3.3` 应出现 `10.0.41.1, via <接口>`，`show ip ospf route` 中下一跳应变为 `via 10.0.41.1`。
3. 链路故障后 A 只剩 D 一条路径，本用例通过路由切换和 ping 判定收敛结果；故障后的全局保护计数不作为必检项。
4. `ping 3.3.3.3` 收敛后应为 `0% packet loss`。
5. 恢复 `<PortA>`，路由回到 `via 10.0.12.2`，ping 保持 `0% packet loss`。恢复后不再强制断言全局保护计数为 0，因为其他前缀可能仍存在合法 LFA；本用例的判定重点是故障前 S 到 D 的前缀没有备份。

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
| 1 | 配置时序 | 本用例在初始 OSPF 配置中使能 LFA，邻居 Full 后检查保护计数与路由收敛 |
| 2 | 判定重点 | 基线 `Protected by LFA : 1` 必须结合 `Intra-area prefixes > 0` 和 0110 的 `5` 对比判定；该 1 个前缀是 N1 直连的 C-D 网段，不代表 S 到 D 的 Loopback 仍有 LFA |
| 3 | 版本差异 | LFA 命令不可用时标记 `Blocked`，不将版本差异判为功能失败 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 记录邻居、LFA 计数、故障前后下一跳和 ping 结果 |
| 证据 | 回显文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0120 | | | |
