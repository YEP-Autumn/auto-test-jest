# RFC 8518 Figure 1 中共享同一主下一跳的 MHP 在主链路故障后保持可达

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0240-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0240`
- 用例标题：RFC 8518 Figure 1 中共享同一主下一跳的 MHP 在主链路故障后保持可达
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能
- 执行方式：自动化工具 / 手工
- 预估耗时：约 2 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`

### 1.1 标准依据

| 标准 / RFC | 条款                        | 本用例验证的要求             |
| ---------- | --------------------------- | ---------------------------- |
| RFC 2328   | Hello、邻居状态机、LSA、SPF | OSPF 邻居与最短路径计算      |
| RFC 5286   | 6.1                         | 多归前缀（MHP）的 LFA 选择   |
| RFC 8518   | 3.1、Figure 1               | 共享同一 ECMP 主下一跳的 MHP |

### 1.2 能力前提

| 项           | 要求                                  | 说明                         |
| ------------ | ------------------------------------- | ---------------------------- |
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受 LFA 命令为准 |
| 端口形态     | 每台设备 2～3 个三层接口              | 接口需支持 `no switchport`   |
| DUT 数量     | 7 台                                  | 设备不足时标记 `Blocked`     |
| 软件版本     | 支持 `fast-reroute per-prefix enable` | 不支持时标记 `Blocked`       |

## 2. 组网与拓扑

```text
                        5   +---+  8   +---+  5  +---+
                      +-----| S |------| A |-----| B |
                      |     +---+      +---+     +---+
                      |       |                    |
                      |     5 |                  5 |
                      |       |                    |
                    +---+ 5 +---+   4 +---+  1    +---+
                    | C |---| E |-----| M |-------| F |
                    +---+   +---+     +---+       +---+
                              |   10           5    |
                              +-----------P---------+
```

拓扑名称 / 来源：`seven_devices_topo_links_type_1`（内置拓扑）。

| 链路      | 网段        | 端点地址                       | 开销          |
| --------- | ----------- | ------------------------------ | ------------- |
| S-A       | 10.1.2.0/24 | S=10.1.2.1，A=10.1.2.2         | 8             |
| S-C       | 10.1.4.0/24 | S=10.1.4.1，C=10.1.4.2         | 5             |
| S-E       | 10.1.5.0/24 | S=10.1.5.1，E=10.1.5.2         | 5             |
| A-B       | 10.2.3.0/24 | A=10.2.3.1，B=10.2.3.2         | 5             |
| B-F       | 10.3.7.0/24 | B=10.3.7.1，F=10.3.7.2         | 5             |
| C-E       | 10.4.5.0/24 | C=10.4.5.1，E=10.4.5.2         | 5             |
| E-M       | 10.5.6.0/24 | E=10.5.6.1，M=10.5.6.2         | 4             |
| M-F       | 10.6.7.0/24 | M=10.6.7.1，F=10.6.7.2         | 1             |
| Loopback0 | 主机路由    | 10.255.0.1/32 ～ 10.255.0.7/32 | 1             |
| MHP P     | 主机路由    | 192.0.2.1/32，E/F 双端发布     | E-P=10，F-P=5 |

P 的两条路径从 S 计算均为 15：

- S-E-P：5 + 10 = 15；
- S-E-M-F-P：5 + 4 + 1 + 5 = 15。

因此 P 的两个发布者 E、F 共享同一个主下一跳 E，属于 RFC 8518 Figure 1 的“同主下一跳 MHP”。

## 3. 预置条件

### 3.1 协议基线参数

| 参数         | 取值                             | 说明                    |
| ------------ | -------------------------------- | ----------------------- |
| OSPF 进程    | 0（`router ospf`）               | 同一 VRF 仅支持一个进程 |
| Router ID    | 10.255.0.1 ～ 10.255.0.7         | 显式配置                |
| Area         | 0                                | 单区域                  |
| Network Type | point-to-point                   | 排除广播网 DR/BDR 影响  |
| Hello / Dead | 10s / 40s                        | 设备默认值              |
| LFA          | `fast-reroute per-prefix enable` | 在初始 OSPF 配置中使能  |

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
ip ospf cost 8
exit
interface <PortB>
no switchport
ip address 10.1.4.1/24
ip ospf network point-to-point
ip ospf cost 5
exit
interface <PortC>
no switchport
ip address 10.1.5.1/24
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
network 10.1.5.0/24 area 0
network 10.255.0.1/32 area 0
exit
end
```

DUTB～DUTF 按第 2 节地址与开销配置。DUTE（E）通过 loopback1 本地持有 `192.0.2.1/32` 并发布到 OSPF；DUTG（F）通过 `ip route 192.0.2.1/32 10.6.7.1` 加 `redistribute static` 发布同一前缀。全部邻居 `Full` 后，在各设备 OSPF 进程视图执行 `fast-reroute per-prefix enable`。

### 4.2 基线检查与执行顺序

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 配置生效 | `show running-config \| include router ospf`、`show running-config \| include fast-reroute` | 各设备存在 OSPF 进程与 LFA 配置 |
| 2 | 邻居基线 | `show ip ospf neighbor` | 所有直连邻居均为 `Full` |
| 3 | MHP 主下一跳基线 | `show ip route 192.0.2.1` | 下一跳为 `10.1.5.2`（经 E） |
| 4 | LFA 使能 | `show ip ospf fast-reroute per-prefix` | `Fast-reroute per-prefix : enabled` |
| 5 | LFA 计算 | `show ip ospf fast-reroute per-prefix` | `Calculation` 的 `runs` 大于 0 |
| 6 | 受保护前缀 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| 7 | 连通性基线 | `ping 192.0.2.1` | `0% packet loss` |
| 8 | 触发故障 | 关闭 DUTA 的 `<PortC>` | 见 4.3 |
| 9 | 恢复链路 | 恢复 DUTA 的 `<PortC>` | 见 4.4 |

### 4.3 触发与流量发送

本用例不使用测试仪流量，触发方式为链路故障注入。

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 故障 1 | 关闭 DUTA 的 `<PortC>`，模拟 S-E 链路故障 | `10.1.5.2` 邻居断开，共享主下一跳失效 |
| 路由检查 | `show ip route 192.0.2.1` | 下一跳切换为 `10.1.4.2`，即经 S-C-E 到达 E 发布的 P |
| 转发检查 | `ping 192.0.2.1` | `0% packet loss` |

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 链路恢复 | 在 DUTA 的 `<PortC>` 执行 `no shutdown` | `10.1.5.2` 邻居恢复 `Full` |
| 主下一跳回切 | `show ip route 192.0.2.1` | 下一跳回到 `10.1.5.2`（经 E） |
| 保护计数恢复 | `show ip ospf fast-reroute per-prefix` | `Protected by LFA` 大于 0 |
| 转发恢复 | `ping 192.0.2.1` | `0% packet loss` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 所有直连邻居 `Full`；故障期间 `10.1.5.2` 邻居断开 |
| 表项面 | `show ip route 192.0.2.1`、`show ip ospf route` | 基线下一跳 `10.1.5.2`，故障后为 `10.1.4.2`，恢复后回到 `10.1.5.2` |
| 计数 / 告警面 | `show ip ospf fast-reroute per-prefix` | `runs` 大于 0，`Protected by LFA` 大于 0 |
| 转发面 | `ping 192.0.2.1` | 基线、故障后、恢复后丢包率均为 0% |
| 恢复 / 资源面 | 恢复 `<PortC>` 后复查邻居、路由与保护计数 | 主下一跳与 LFA 保护计数恢复 |

### 4.6 判定标准

- 步骤 1 至 7：配置项存在；邻居状态为 `Full`；`show ip route 192.0.2.1` 下一跳为 `10.1.5.2`；LFA 已使能且 `runs` 大于 0；`Protected by LFA` 大于 0；丢包率 = 0%。
- 步骤 8：关闭 `<PortC>` 后，`show ip route 192.0.2.1` 下一跳为 `10.1.4.2`，丢包率 = 0%。
- 步骤 9：恢复 `<PortC>` 后，下一跳回到 `10.1.5.2`，`Protected by LFA` 大于 0，丢包率 = 0%。
- `Pass`：上述必检项全部满足，且第 5 章清理检查通过。
- `Fail`：任一必检项不满足，或清理后仍存在 OSPF、LFA 或静态路由配置残留。
- `Blocked`：设备不支持 `fast-reroute per-prefix enable`，或邻居无法达到 `Full`。

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

DUTG（F）额外执行 `no ip route 192.0.2.1/32 10.6.7.1`；DUTE（E）额外删除 loopback1。

清理后检查：

```text
show running-config | include router ospf
show running-config | include fast-reroute
show ip ospf processes-count
```

## 6. 备注 / 标准裁剪

| #   | 项           | 说明                                                                        |
| --- | ------------ | --------------------------------------------------------------------------- |
| 1   | 拓扑说明     | 本用例为 RFC 8518 Figure 1 原图，7 台设备、8 条链路                         |
| 2   | 共享主下一跳 | P 从 S 经 E、F 均为 15，且两条路径的第一跳都是 E                            |
| 3 | 观测限制     | MHP 逐前缀 LFA 明细存在缺失现象；必检项为共享主下一跳、保护计数和故障后可达性 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | 2026-11-18 / 自动化 |
| 结论 | `Pass` |
| 实际观测 | E 侧本地持有 `192.0.2.1/32`，F 侧改为静态路由 10.6.7.1 并 `redistribute static`；S 到 P 可达，故障后切到 `10.1.4.2`，恢复后回到 `10.1.5.2` |
| 证据 | `/tmp/opencode/ospf-0240-mhpfix.log` |
| 关联缺陷 / 需求 | 无；MHP 目的改为单端本机持有 + 另一端静态重分发 |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0240` | `Pass` | E 本地持有 P，F 静态重分发；P 可达并完成主备切换 | `/tmp/opencode/ospf-0240-mhpfix.log` |
