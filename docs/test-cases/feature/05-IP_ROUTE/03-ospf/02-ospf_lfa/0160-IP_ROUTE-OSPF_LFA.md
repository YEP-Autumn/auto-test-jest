# RFC 6571 Figure 1 原图中 S 到 D 的主路径故障后由 A 或 F 作为 LFA 恢复

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0160-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0160`
- 用例标题：RFC 6571 Figure 1 原图中 S 到 D 的主路径故障后由 A 或 F 作为 LFA 恢复
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
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
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态 | 每台设备 1～3 个三层接口 | 接口需支持 `no switchport` |
| DUT 数量 | 9 台 | 设备不足时标记 `Blocked` |
| 软件版本 | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
                        D = DUTE
                       /        \
                  10 /            \ 10
                    /              \
                G = DUTH          H = DUTI ---------.
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

拓扑名称 / 来源：`nine_devices_topo_links_type_1`（内置拓扑）。

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

DUTB～DUTI 按第 2 节地址与开销配置。DUTA～DUTI 分别在各自 `router ospf` 视图使能 `fast-reroute per-prefix enable`。全部邻居 `Full` 后，等待保护表刷新，再执行 4.2 基线检查。

### 4.2 基线检查与执行顺序

执行顺序：4.2 基线检查 → 4.3 触发与流量发送 → 4.4 恢复。

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 检查邻居 | `show ip ospf neighbor` | 所有直连邻居均为 `Full`；S 的邻居 `10.255.0.2`、`10.255.0.4`、`10.255.0.6` 均为 `Full` |
| 2 | 检查 LFA 状态 | `show ip ospf fast-reroute per-prefix`（DUTA） | `Fast-reroute per-prefix : enabled`，`Calculation` 的 `runs` 大于 0，`Protected by LFA` 大于 0 |
| 3 | 检查 S 到 D 的主路径 | `show ip route 10.255.0.5` | 下一跳为 `10.1.4.2`（经 C） |
| 4 | 检查基线连通性 | `ping 10.255.0.5` | `0% packet loss` |

### 4.3 触发与流量发送

关闭 DUTA 的 `<PortB>`，模拟 S-C 链路故障：

```text
configure terminal
interface <PortB>
shutdown
end
```

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 故障 1 | DUTA 的 `<PortB>` 执行 `shutdown` | S-C 邻居断开，S 到 D 的流量切换到 A 或 F |
| 路由切换 | 等待 `show ip route 10.255.0.5` 刷新 | 下一跳切换为 `10.1.2.2`（A）或 `10.1.6.2`（F） |
| 故障期间连通性 | `ping 10.255.0.5`、`ping 10.255.0.9` | 均为 `0% packet loss` |

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 链路恢复 | DUTA 的 `<PortB>` 执行 `no shutdown` | S-C 邻居重新为 `Full` |
| 主路径回切 | `show ip route 10.255.0.5` | 下一跳回到 `10.1.4.2` |
| 保护恢复 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| 恢复后连通性 | `ping 10.255.0.5` | `0% packet loss` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 故障前所有直连邻居 `Full`；恢复后 S-C 邻居重新 `Full` |
| 表项面 | `show ip route 10.255.0.5` | 主路径经 C；故障后改经 A 或 F；恢复后回到经 C |
| 保护表面 | `show ip ospf fast-reroute per-prefix`（DUTA） | `Calculation` 的 `runs` 大于 0；`Protected by LFA` 故障前和恢复后均大于 0 |
| 转发面 | `ping 10.255.0.5`、`ping 10.255.0.9` | 故障前、故障期间和恢复后均为 `0% packet loss` |
| 恢复 / 资源面 | `show ip ospf neighbor`、`show ip route` | 恢复后邻居、主路径和保护计数回到基线 |

### 4.6 判定标准

- 4.2 步骤 1 至 4：所有直连邻居为 `Full`；`Fast-reroute per-prefix : enabled`，`Calculation` 的 `runs` 大于 0 且 `Protected by LFA` 大于 0；`10.255.0.5` 的下一跳为 `10.1.4.2`；`ping 10.255.0.5` 为 `0% packet loss`。
- 4.3 步骤 1 至 3：`10.255.0.5` 的下一跳切换为 `10.1.2.2` 或 `10.1.6.2`；`ping 10.255.0.5`、`ping 10.255.0.9` 均为 `0% packet loss`。
- 4.4 步骤 1 至 4：`10.255.0.5` 的下一跳回到 `10.1.4.2`；`Protected by LFA` 大于 0；`ping 10.255.0.5` 为 `0% packet loss`。
- 上述必检项全部满足，且清理后无 `router ospf`、`fast-reroute` 残留 → `Pass`。
- 上述任一必检项不满足，或清理失败 → `Fail`。
- LFA 命令不可用、9 台设备或 10 条链路无法建立、邻居无法 `Full` → `Blocked`，记录缺失项。

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
| 2 | 与设计文档差异 | 设计文档早期版本误加了 A-C、E-F 两条链路；本用例按 RFC 原图实现，最终以本文和实现为准 |
| 3 | 主备路径 | 主路径 S-C-H-D 开销 21；A、F 两条 LFA 路径开销均为 25 |
| 4 | 故障后下一跳 | 故障后 A、F 两条路径等开销，用例允许任一下一跳，不限定唯一邻居 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | `Pass` / `Fail` / `Blocked` |
| 实际观测 | 记录邻居、LFA 计数、故障前后路由和 ping 结果 |
| 证据 | 回显 / 抓包文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0160` | | | |
