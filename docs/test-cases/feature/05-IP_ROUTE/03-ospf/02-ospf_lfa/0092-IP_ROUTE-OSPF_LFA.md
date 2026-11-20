# 6 设备双 ECMP 主路径下，每个成员分别使用独立的第三方 LFA 备份路径

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0092-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0092`
- 用例标题：6 设备双 ECMP 主路径下，每个成员分别使用独立的第三方 LFA 备份路径
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能 + 性能
- 执行方式：自动化脚本 + 测试仪
- 预估耗时：约 5 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款                        | 本用例验证的要求                                        |
| ---------- | --------------------------- | ------------------------------------------------------- |
| RFC 2328   | Hello、邻居状态机、LSA、SPF | OSPF 邻居与等开销多路径计算                             |
| RFC 5286   | 3.1、3.2、3.4               | LFA 链路保护、节点保护，以及 ECMP 与 LFA 共存的转发行为 |
| RFC 6571   | LFA 适用性                  | 等价路径场景下每个 ECMP 主下一跳分别继承独立的 LFA      |

### 1.2 能力前提

| 项           | 要求                                                         | 说明                                                         |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 设备 profile | `default`                                                    | 以 CLI 是否接受 LFA 命令为准                                 |
| DUT 数量     | 6 台                                                         | 设备不足时标记 `Blocked`                                     |
| 端口形态     | DUTA 5 口；DUTB/DUTC/DUTD 各 3 口以内；DUTE/DUTF 各 3 口以内 | A/B/C/D 每台 6 口，E/F 每台 4 口；接口需支持 `no switchport` |
| 拓扑后端     | 能建立六设备双主路径 + 双备份路径拓扑                        | 邻居无法 Full 时标记 `Blocked`                               |
| 测试仪       | 支持 burst 发送、UDP 源端口修改与抓包计数                    | 用不同五元组覆盖两个 ECMP 成员                               |
| 软件版本     | 支持 `fast-reroute per-prefix` 与 candidate disable          | 能按 ECMP 主下一跳分别输出 LFA 备份下一跳                    |

## 2. 组网与拓扑

```text
                                          +--------+
                           StreamPort.A----+  DUTA  |
                                          +--------+
                                               |
                          |--------------------+--------------------|
                          |                                         |
             |------------+------------|                  |---------+------------|
             |PortA                    |PortB             |PortC                  |PortD
             |                         |                  |                       |
        +----+---+                +----+---+         +----+---+              +----+---+
        |  DUTD  |PortB<=>PortC---|  DUTB  |         |  DUTC  |PortC<=>PortB--|  DUTE  |
        +--------+                +--------+         +--------+              +--------+
                                       |                  |
                                    PortB              PortB
                                    PortA              PortB
                                       |                  |
                                  +----+------------------+---+
                                  |            DUTF           |
                                  +--------------+-------------+
                                                 |
                                                 |
                                                 |
                                        StreamPort.B
```

注意：DUTA PortE 接 StreamPort.A；DUTD/DUTE 不直接连接 DUTF。DUTF 只连接 DUTB、DUTC 和测试仪，共使用 3 个端口。

内置拓扑：`LinkConstraint.six_devices_topo_links_type_5`。

| 链路                      | 网段            | 端点地址                                                                           | 开销 |
| ------------------------- | --------------- | ---------------------------------------------------------------------------------- | ---- |
| StreamPort.A ↔ DUTA PortE | 198.51.100.0/24 | A 侧 198.51.100.1，测试仪 198.51.100.2                                             | 1    |
| A-B                       | 10.0.12.0/24    | A=10.0.12.1，B=10.0.12.2                                                           | 1    |
| A-C                       | 10.0.13.0/24    | A=10.0.13.1，C=10.0.13.2                                                           | 1    |
| A-D                       | 10.0.14.0/24    | A=10.0.14.1，D=10.0.14.2                                                           | 1    |
| A-E                       | 10.0.15.0/24    | A=10.0.15.1，E=10.0.15.2                                                           | 1    |
| B-F                       | 10.0.26.0/24    | B=10.0.26.1，F=10.0.26.2                                                           | 1    |
| C-F                       | 10.0.36.0/24    | C=10.0.36.1，F=10.0.36.2                                                           | 1    |
| D-B                       | 10.0.24.0/24    | D=10.0.24.1，B=10.0.24.2                                                           | 1    |
| E-C                       | 10.0.35.0/24    | E=10.0.35.1，C=10.0.35.2                                                           | 1    |
| DUTF PortC ↔ StreamPort.B | 203.0.113.0/24  | F 侧 203.0.113.1，测试仪 203.0.113.2                                               | 1    |
| Loopback0                 | 主机路由        | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32，D=4.4.4.4/32，E=5.5.5.5/32，F=6.6.6.6/32 | 1    |

角色说明：

| 节点 | 角色                              |
| ---- | --------------------------------- |
| DUTA | 流量入口，LFA 计算点（S）         |
| DUTB | ECMP 主下一跳 1（B 成员）         |
| DUTC | ECMP 主下一跳 2（C 成员）         |
| DUTD | B/C 成员的独立 LFA 备份下一跳     |
| DUTE | B/C 成员的独立 LFA 备份下一跳     |
| DUTF | 目的路由器，发布 `203.0.113.0/24` |

端口占用与设备可用端口核对：

| 设备 | 使用端口                          | 已用 / 可用 |
| ---- | --------------------------------- | ----------- |
| DUTA | PortA、PortB、PortC、PortD、PortE | 5 / 6       |
| DUTB | PortA、PortB、PortC               | 3 / 6       |
| DUTC | PortA、PortB、PortC               | 3 / 6       |
| DUTD | PortA、PortB                      | 2 / 6       |
| DUTE | PortA、PortB                      | 2 / 4       |
| DUTF | PortA、PortB、PortC               | 3 / 4       |

其中 DUTA PortE、DUTF PortC 分别连接 `StreamPort.A`、`StreamPort.B`。按“A/B/C/D 每台 6 口、其他设备每台 4 口”的约束，本拓扑不需要额外扩容。

### 2.1 路径与开销

DUTA 到 `203.0.113.0/24` 的主路径：

```text
经 DUTB：A-B-F，开销 1 + 1 = 2
经 DUTC：A-C-F，开销 1 + 1 = 2
```

两条路径等开销，形成两个 ECMP 成员。

备份路径：

```text
B 成员的 LFA：A-E-C-F，开销 1 + 1 + 1 = 3
C 成员的 LFA：A-D-B-F，开销 1 + 1 + 1 = 3
```

DUTD 到目的的最短路径为 `D-B-F`，因此 DUTD 是 B 成员的**链路保护** LFA，但不满足针对 B 的节点保护条件；DUTD 对 C 成员是节点保护 LFA。DUTE 的情况对称：

| 主下一跳 | 候选 DUTD（10.0.14.2） | 候选 DUTE（10.0.15.2） | 节点保护优先时的预期备份 |
| -------- | ---------------------- | ---------------------- | ------------------------ |
| DUTB     | 链路保护，非节点保护   | 节点保护               | DUTE                     |
| DUTC     | 节点保护               | 链路保护，非节点保护   | DUTD                     |

判定接受两种独立配对：

- 节点保护优先：DUTB -> DUTE，DUTC -> DUTD；
- 链路保护候选优先：DUTB -> DUTD，DUTC -> DUTE。

两种情况下两个成员都拥有互不相同的第三方备份下一跳；不允许两个成员使用同一个备份，也不允许使用另一个 ECMP 成员作为备份。

### 2.2 为什么需要 candidate disable

如果不做额外配置，另一个 ECMP 成员本身也是合法的节点保护 LFA：

- 对 DUTB 来说，DUTC 到目的的开销为 1，是比 DUTE 更优的备份；
- 对 DUTC 来说，DUTB 到目的的开销为 1，是比 DUTD 更优的备份。

这样两个成员会互为备份，无法验证“每个成员各有一条独立第三方修复路径”。因此在 DUTA 连接 DUTB、DUTC 的两个接口上配置：

```text
interface <PortA>
ip ospf fast-reroute per-prefix candidate disable
interface <PortB>
ip ospf fast-reroute per-prefix candidate disable
```

该命令只禁止这两个接口作为其他前缀的备份下一跳，不影响它们作为当前前缀的主下一跳。配置后：

- DUTB 的备份候选只剩 DUTD 和 DUTE，其中 DUTE 满足节点保护；
- DUTC 的备份候选只剩 DUTD 和 DUTE，其中 DUTD 满足节点保护。

如果设备遵循 RFC 5286 推荐的“节点保护优先”，则 DUTB 选择 DUTE、DUTC 选择 DUTD；如果设备只按候选开销或本地 tie-break 选择链路保护 LFA，则可能得到 DUTB -> DUTD、DUTC -> DUTE。本用例判定只要求两个成员使用不同的第三方备份下一跳，两种结果均判为通过，实际组合记录在执行结果中。

## 3. 预置条件

### 3.1 协议基线参数

| 参数         | 取值                                                             | 说明                                         |
| ------------ | ---------------------------------------------------------------- | -------------------------------------------- |
| OSPF 进程    | 0（`router ospf`）                                               | 同一 VRF 仅支持一个进程                      |
| Router ID    | A=1.1.1.1，B=2.2.2.2，C=3.3.3.3，D=4.4.4.4，E=5.5.5.5，F=6.6.6.6 | 显式配置，保证 LFA 明细的 Primary nbr 可预测 |
| Area         | 0                                                                | 单区域                                       |
| Network Type | point-to-point                                                   | 避免广播网络 DR/BDR 影响切换时间             |
| Hello / Dead | 10s / 40s                                                        | 设备默认值                                   |
| LFA          | `fast-reroute per-prefix enable`                                 | 在初始 OSPF 配置中使能                       |
| BFD          | 不使能                                                           | 故障由 DUTA 本地接口 `shutdown` 触发         |

### 3.2 流量参数

| 参数     | 取值                                 | 说明                                 |
| -------- | ------------------------------------ | ------------------------------------ |
| 发送端口 | `StreamPort.A`                       | 接入 DUTA PortE                      |
| 接收端口 | `StreamPort.B`                       | 从 DUTF PortC 收包                   |
| 报文     | IPv4/UDP，198.51.100.2 → 203.0.113.2 | 目的地址属于 ECMP 前缀               |
| 流数量   | 每个周期 6000 条不同 UDP 源端口      | 避免单条五元组只哈希到一个 ECMP 成员 |
| 包间隔   | 1ms                                  | 每个 burst 1 帧，burst 间隔 1ms      |
| 发送数量 | 每个周期 6000 个                     | 发送时长约 6~8s                      |
| 丢包判据 | 单成员故障周期接收匹配数 > 5950      | 即单周期丢包少于 50 个               |
| 丢包判据 | 双成员同时故障周期接收匹配数 > 5900  | 叠加故障，判据放宽到丢包少于 100 个  |

### 3.3 初始状态

- 接口处于默认二层状态；OSPF 进程、Loopback、L3 地址、静态 ARP 和 LFA 配置为空。
- 拓扑后端已建立六设备拓扑及两个测试仪接入链路。
- 现场保留：默认清理。

## 4. 测试步骤与预期结果

### 4.1 配置

DUTA～DUTF 按第 2 节地址规划配置 OSPF 点对点接口、Loopback、显式 Router ID 和 `fast-reroute per-prefix enable`。DUTA 额外配置测试仪接入口 `198.51.100.1/24`；DUTF 额外配置测试仪出口 `203.0.113.1/24` 和静态 ARP `203.0.113.2 0002.0002.0002`。

所有邻居进入 `Full` 后，在 DUTA 的两个主接口上配置 candidate disable，触发 LFA 重新计算：

```text
configure terminal
interface <PortA>
ip ospf fast-reroute per-prefix candidate disable
exit
interface <PortB>
ip ospf fast-reroute per-prefix candidate disable
end
```

### 4.2 基线观测

| 观测项       | 命令                                   | 预期                                                                      |
| ------------ | -------------------------------------- | ------------------------------------------------------------------------- |
| 邻居状态     | `show ip ospf neighbor`                | 六台设备所有直连邻居均为 `Full`                                           |
| ECMP 下一跳  | `show ip route 203.0.113.2`            | 同时出现 `10.0.12.2, via` 和 `10.0.13.2, via`                             |
| OSPF 路由    | `show ip ospf route`                   | `203.0.113.0/24` 同时有 `via 10.0.12.2` 和 `via 10.0.13.2`                |
| LFA 明细行 1 | `show ip ospf fast-reroute per-prefix` | `203.0.113.0/24`，Primary `2.2.2.2`，Backup 为 `10.0.14.2` 或 `10.0.15.2` |
| LFA 明细行 2 | `show ip ospf fast-reroute per-prefix` | `203.0.113.0/24`，Primary `3.3.3.3`，Backup 为另一个 DUTD/DUTE 地址       |
| 互备反向检查 | `show ip ospf fast-reroute per-prefix` | 不出现 `2.2.2.2 -> 10.0.13.2` 或 `3.3.3.3 -> 10.0.12.2`                   |
| 连通性       | `ping 6.6.6.6`                         | `0% packet loss`                                                          |

节点保护优先时的 LFA 明细回显形态如下（`Type` 可能为 `link` 或 `link+node`，以实际协商结果为准）：

```text
  Prefix               Type      Primary nbr      Backup nbr       Cost
  203.0.113.0/24       link+node 2.2.2.2          10.0.15.2        3
  203.0.113.0/24       link+node 3.3.3.3          10.0.14.2        3
```

两行必须同时出现，且两个成员的备份下一跳必须分别是 DUTE 和 DUTD 中不同的一个，不能是另一个 ECMP 成员，也不能是同一个备份下一跳。

### 4.3 故障周期 1：DUTB 成员故障

1. 在 `StreamPort.B` 启动抓包。
2. `StreamPort.A` 以 1ms 间隔发送 6000 个 IPv4 报文，UDP 源端口逐包递增。
3. 发送开始约 4s 后关闭 DUTA `<PortA>`，模拟 A-B 主路径故障。
4. 等待 `show ip route 203.0.113.2` 只保留 `10.0.13.2, via`，且不再出现 `10.0.12.2, via`。
5. `ping 6.6.6.6` 应为 `0% packet loss`。
6. 停止发送和抓包，统计接收匹配数。

| 观测项         | 预期                               |
| -------------- | ---------------------------------- |
| 切换后路由     | 只剩 `10.0.13.2`（A-C-F）          |
| 切换后连通性   | `ping 6.6.6.6` 为 `0% packet loss` |
| 接收匹配报文数 | 大于 5950                          |

随后恢复 `<PortA>`，等待 ECMP 两条下一跳和两条独立 LFA 明细恢复。

### 4.4 故障周期 2：DUTC 成员故障

1. 在 `StreamPort.B` 启动抓包。
2. `StreamPort.A` 再次以 1ms 间隔发送 6000 个 IPv4 报文，UDP 源端口逐包递增。
3. 发送开始约 4s 后关闭 DUTA `<PortB>`，模拟 A-C 主路径故障。
4. 等待 `show ip route 203.0.113.2` 只保留 `10.0.12.2, via`，且不再出现 `10.0.13.2, via`。
5. `ping 6.6.6.6` 应为 `0% packet loss`。
6. 停止发送和抓包，统计接收匹配数。

| 观测项         | 预期                               |
| -------------- | ---------------------------------- |
| 切换后路由     | 只剩 `10.0.12.2`（A-B-F）          |
| 切换后连通性   | `ping 6.6.6.6` 为 `0% packet loss` |
| 接收匹配报文数 | 大于 5950                          |

随后恢复 `<PortB>`，等待 ECMP 与两条独立 LFA 明细恢复。

### 4.5 故障周期 3：两个 ECMP 成员同时故障

1. 在 `StreamPort.B` 启动抓包。
2. `StreamPort.A` 发送 6000 个 IPv4 报文，UDP 源端口逐包递增。
3. 发送开始约 4s 后在同一配置过程中关闭 DUTA `<PortA>` 和 `<PortB>`，两个 ECMP 主下一跳同时失效。
4. 等待 `show ip route 203.0.113.2` 出现 `10.0.14.2, via` 和 `10.0.15.2, via`，即分别经 DUTD（A-D-B-F）和 DUTE（A-E-C-F）的两条独立 LFA 路径。
5. `ping 6.6.6.6` 应为 `0% packet loss`。
6. 停止发送和抓包，统计接收匹配数。

| 观测项         | 预期                                                     |
| -------------- | -------------------------------------------------------- |
| 切换后路由     | 同时出现 `10.0.14.2`（A-D-B-F）和 `10.0.15.2`（A-E-C-F） |
| 切换后连通性   | `ping 6.6.6.6` 为 `0% packet loss`                       |
| 接收匹配报文数 | 大于 5900                                                |

### 4.6 最终恢复

恢复 DUTA `<PortA>` 和 `<PortB>`，等待 ECMP 两条主下一跳和两条独立 LFA 明细全部恢复，确认 `ping 6.6.6.6` 为 `0% packet loss`。

## 5. 清理与恢复

六台设备删除 OSPF 进程、Loopback、接口地址和静态 ARP，DUTA 额外删除 candidate disable，所有接口恢复二层状态。

DUTA 清理示例：

```text
configure terminal
no router ospf
interface <PortA>
no shutdown
no ip ospf fast-reroute per-prefix candidate disable
no ip ospf network
no ip address
switchport
exit
interface <PortB>
no shutdown
no ip ospf fast-reroute per-prefix candidate disable
no ip ospf network
no ip address
switchport
exit
interface <PortC>
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
interface <PortE>
no shutdown
no ip address
switchport
exit
no interface loopback0
end
```

DUTB～DUTF 按各自实际配置的接口、地址和 ARP 对称清理。清理后检查：

```text
show running-config | include router ospf
show running-config | include fast-reroute
show ip ospf processes-count
```

## 6. 备注 / 标准裁剪

| #   | 项                | 说明                                                                                                                             |
| --- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 与 0091 的区别    | 0091 使用四设备环，两个 ECMP 成员互为 LFA；本用例使用六设备拓扑，为每个成员提供不属于 ECMP 组的独立第三方备份路径                |
| 2   | candidate disable | 两个主接口禁用候选角色，避免另一个 ECMP 成员以更低开销抢走 LFA；该配置不改变主下一跳选择                                         |
| 3   | LFA 选路差异      | 判定接受两种独立配对：节点保护优先（B->E、C->D）或链路保护候选优先（B->D、C->E）；只要求两个成员备份不同且都不是另一个 ECMP 成员 |
| 4   | 同时故障判据      | 两个主下一跳同时故障属于叠加故障，流量判据放宽到单周期丢包少于 100 个                                                            |
| 5   | 拓扑依赖          | 需要 6 台 DUT 和 `six_devices_topo_links_type_5` 定义的 8 条设备间链路；拓扑后端无法建立时标记 `Blocked`                         |
| 6   | 回显差异          | `Type` 列可能为 `link` 或 `link+node`；脚本只匹配前缀、Primary nbr 和 Backup nbr，不强制匹配保护类型                             |

## 7. 执行与结果记录

| 项                | 内容                                                                              |
| ----------------- | --------------------------------------------------------------------------------- |
| 执行时间 / 执行人 | 待执行 / -                                                                        |
| 结论              | 待执行                                                                            |
| 实际观测          | 流量已调整为每周期 6000 包；待记录 LFA 明细两行、三次故障后的路由、ping 结果和每周期接收匹配数 |
| 证据              | -                                                                                 |
| 关联缺陷 / 需求   |                                                                                   |

逐条结果：

| 用例编号 | 结论   | 实际观测                                                                 | 证据 |
| -------- | ------ | ------------------------------------------------------------------------ | ---- |
| 0092     | 待执行 | 每周期 6000 包，需验证单成员/双成员故障时的丢包判据                      | -    |
