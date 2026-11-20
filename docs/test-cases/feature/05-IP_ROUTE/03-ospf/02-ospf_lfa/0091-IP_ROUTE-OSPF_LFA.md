# ECMP 的每个成员分别使用各自的 LFA 备份路径，单成员故障时 1 包/ms 丢包少于 50 个

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0091-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0091`
- 用例标题：ECMP 的每个成员分别使用各自的 LFA 备份路径，单成员故障时 1 包/ms 丢包少于 50 个
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 功能 + 性能
- 执行方式：自动化脚本 + 测试仪
- 预估耗时：约 4 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款                        | 本用例验证的要求                                       |
| ---------- | --------------------------- | ------------------------------------------------------ |
| RFC 2328   | Hello、邻居状态机、LSA、SPF | OSPF 邻居与等开销多路径计算                            |
| RFC 5286   | 3.1、3.4                    | 逐前缀 LFA 的无环条件，以及 ECMP 与 LFA 共存的转发行为 |
| RFC 6571   | LFA 适用性                  | 等价路径场景下每个 ECMP 主下一跳应分别继承自己的 LFA   |

### 1.2 能力前提

| 项           | 要求                                      | 说明                                             |
| ------------ | ----------------------------------------- | ------------------------------------------------ |
| 设备 profile | `default`                                 | 以 CLI 是否接受 LFA 命令为准                     |
| 端口形态     | 每台 DUT 至少 2 个三层接口                | 接口需支持 `no switchport`                       |
| 拓扑后端     | 能建立四设备环及两个测试仪接入链路        | 邻居无法 Full 时标记 `Blocked`                   |
| 测试仪       | 支持 burst 发送、UDP 源端口修改与抓包计数 | 用不同五元组让流量覆盖两个 ECMP 成员             |
| 软件版本     | 支持 `fast-reroute per-prefix enable`     | 且逐前缀明细能按 ECMP 主下一跳分别输出备份下一跳 |

## 2. 组网与拓扑

```text
   StreamPort.A -- DUTA PortB
   DUTA PortA   <=> DUTB PortA
   DUTB PortB   <=> DUTC PortB
   DUTC PortC   <=> DUTD PortC
   DUTD PortD   <=> DUTA PortD
   DUTC PortA   -- StreamPort.B
```

内置拓扑：`LinkConstraint.four_devices_topo_links_type_6`。

| 链路                      | 网段            | 端点地址                                               | 开销  |
| ------------------------- | --------------- | ------------------------------------------------------ | ----- |
| StreamPort.A ↔ DUTA PortB | 198.51.100.0/24 | A 侧 198.51.100.1，测试仪 198.51.100.2                 | 1     |
| A-B                       | 10.0.12.0/24    | A=10.0.12.1，B=10.0.12.2                               | 1 / 1 |
| B-C                       | 10.0.23.0/24    | B=10.0.23.1，C=10.0.23.2                               | 1 / 1 |
| C-D                       | 10.0.34.0/24    | C=10.0.34.1，D=10.0.34.2                               | 1 / 1 |
| D-A                       | 10.0.41.0/24    | D=10.0.41.1，A=10.0.41.2                               | 1 / 1 |
| DUTC PortA ↔ StreamPort.B | 203.0.113.0/24  | C 侧 203.0.113.1，测试仪 203.0.113.2                   | 1     |
| Loopback0                 | 主机路由        | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32，D=4.4.4.4/32 | 1     |

全部链路开销相同，DUTA 到 `203.0.113.0/24` 形成两条等价主路径：

```text
经 DUTB：A-B-C
经 DUTD：A-D-C
```

因此该前缀在 DUTA 上形成一个包含两个主下一跳的 ECMP 组。对 DUTA 来说：

- 主下一跳 DUTB（Router ID `2.2.2.2`）的 LFA 备份是 DUTD，备份下一跳为 `10.0.41.1`；
- 主下一跳 DUTD（Router ID `4.4.4.4`）的 LFA 备份是 DUTB，备份下一跳为 `10.0.12.2`。

两个备份下一跳互不相同，分别对应修复路径 `A-D-C` 和 `A-B-C`。以 DUTB 为主下一跳时，DUTD 到目的的开销为 1，DUTD 到 DUTA 的开销为 1，DUTA 到目的的开销为 2，满足 `1 < 1 + 2`，且 DUTD 到目的的最短路径不经过 DUTB，因此同时满足链路保护和节点保护条件。

## 3. 预置条件

### 3.1 协议基线参数

| 参数         | 取值                             | 说明                                                   |
| ------------ | -------------------------------- | ------------------------------------------------------ |
| OSPF 进程    | 0（`router ospf`）               | 同一 VRF 仅支持一个进程                                |
| Area         | 0                                | 单区域                                                 |
| Network Type | point-to-point                   | 避免广播网络 DR/BDR 影响切换时间                       |
| Hello / Dead | 10s / 40s                        | 设备默认值                                             |
| LFA          | `fast-reroute per-prefix enable` | 在初始 OSPF 配置中使能                                 |
| BFD          | 不使能                           | 故障由 DUTA 本地接口 `shutdown` 触发，无需额外检测协议 |

### 3.2 流量参数

| 参数     | 取值                                 | 说明                                      |
| -------- | ------------------------------------ | ----------------------------------------- |
| 发送端口 | `StreamPort.A`                       | 接入 DUTA PortB                           |
| 接收端口 | `StreamPort.B`                       | 从 DUTC PortA 收包                        |
| 报文     | IPv4/UDP，198.51.100.2 → 203.0.113.2 | 目的地址属于 ECMP 前缀                    |
| 流数量   | 每个周期 6000 条不同 UDP 源端口      | 避免单条五元组只哈希到一个 ECMP 成员      |
| 包间隔   | 1ms                                  | 每个 burst 1 帧，burst 间隔 1ms           |
| 发送数量 | 每个故障周期 6000 个                 | 发送时长约 6~8s                           |
| 丢包判据 | 每个周期接收匹配数 > 5950            | 即单周期丢包少于 50 个，切换中断小于 50ms |

### 3.3 初始状态

- 接口处于默认二层状态；OSPF 进程、Loopback、L3 地址、静态 ARP 和 LFA 配置为空。
- 拓扑后端已建立四设备环及两个测试仪接入链路。
- 现场保留：默认清理。

## 4. 测试步骤与预期结果

### 4.1 配置

DUTA/DUTB/DUTC/DUTD 按拓扑配置 OSPF 点对点接口、Loopback 和 `fast-reroute per-prefix enable`；DUTA 增加测试仪接入口 `198.51.100.1/24`，DUTC 增加测试仪出口 `203.0.113.1/24` 和静态 ARP `203.0.113.2 0002.0002.0002`。

### 4.2 基线观测

| 观测项       | 命令                                   | 预期                                                       |
| ------------ | -------------------------------------- | ---------------------------------------------------------- |
| 邻居状态     | `show ip ospf neighbor`                | 四台设备邻居均为 `Full`                                    |
| ECMP 下一跳  | `show ip route 203.0.113.2`            | 同时出现 `10.0.12.2, via` 和 `10.0.41.1, via`              |
| OSPF 路由    | `show ip ospf route`                   | `203.0.113.0/24` 同时有 `via 10.0.12.2` 和 `via 10.0.41.1` |
| LFA 明细行 1 | `show ip ospf fast-reroute per-prefix` | `203.0.113.0/24`，Primary `2.2.2.2`，Backup `10.0.41.1`    |
| LFA 明细行 2 | `show ip ospf fast-reroute per-prefix` | `203.0.113.0/24`，Primary `4.4.4.4`，Backup `10.0.12.2`    |
| 连通性       | `ping 3.3.3.3`                         | `0% packet loss`                                           |

LFA 明细的回显形态如下（`Type` 可能为 `link` 或 `link+node`，以实际协商结果为准）：

```text
  Prefix               Type      Primary nbr      Backup nbr       Cost
  203.0.113.0/24       link+node 2.2.2.2          10.0.41.1        3
  203.0.113.0/24       link+node 4.4.4.4          10.0.12.2        3
```

两行必须同时出现，且每行的 `Primary nbr` 与 `Backup nbr` 不同，才能证明“每个 ECMP 成员都有各自的 LFA 修复路径”。

### 4.3 故障周期 1：DUTB 成员故障

1. 在 `StreamPort.B` 启动抓包。
2. `StreamPort.A` 以 1ms 间隔发送 6000 个 IPv4 报文，UDP 源端口逐包递增。
3. 发送开始约 4s 后关闭 DUTA 的 `<PortA>`，模拟 A-B 主路径故障。
4. 等待 `show ip route 203.0.113.2` 只保留 `10.0.41.1, via`，且不再出现 `10.0.12.2, via`。
5. `ping 3.3.3.3` 应为 `0% packet loss`。
6. 停止发送和抓包，统计接收匹配数。

| 观测项         | 预期                               |
| -------------- | ---------------------------------- |
| 切换后路由     | 只剩 `10.0.41.1`（A-D-C）          |
| 切换后连通性   | `ping 3.3.3.3` 为 `0% packet loss` |
| 接收匹配报文数 | 大于 5950                          |

### 4.4 恢复并验证 ECMP 与 LFA 明细

恢复 DUTA `<PortA>`，等待 `10.0.12.2` 和 `10.0.41.1` 两条下一跳重新出现，同时等待 LFA 明细中两行 Primary/Backup 组合恢复。确认 `ping 3.3.3.3` 为 `0% packet loss`。

### 4.5 故障周期 2：DUTD 成员故障

1. 在 `StreamPort.B` 启动抓包。
2. `StreamPort.A` 再次以 1ms 间隔发送 6000 个 IPv4 报文，UDP 源端口逐包递增。
3. 发送开始约 4s 后关闭 DUTA 的 `<PortD>`，模拟 A-D 主路径故障。
4. 等待 `show ip route 203.0.113.2` 只保留 `10.0.12.2, via`，且不再出现 `10.0.41.1, via`。
5. `ping 3.3.3.3` 应为 `0% packet loss`。
6. 停止发送和抓包，统计接收匹配数。

| 观测项         | 预期                               |
| -------------- | ---------------------------------- |
| 切换后路由     | 只剩 `10.0.12.2`（A-B-C）          |
| 切换后连通性   | `ping 3.3.3.3` 为 `0% packet loss` |
| 接收匹配报文数 | 大于 5950                          |

### 4.6 最终恢复

恢复 DUTA `<PortD>`，等待 ECMP 两条下一跳和 LFA 明细两行全部恢复，确认 `ping 3.3.3.3` 为 `0% packet loss`。

## 5. 清理与恢复

四台设备删除 OSPF 进程、Loopback、接口地址和静态 ARP，并将测试仪接入接口恢复二层状态。

关键清理命令以 DUTA 为例：

```text
configure terminal
no router ospf
interface <PortA>
no shutdown
no ip ospf network
no ip address
switchport
exit
interface <PortB>
no shutdown
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

DUTB/DUTC/DUTD 按各自实际配置的接口、地址和 ARP 对称清理。清理后检查：

```text
show running-config | include router ospf
show running-config | include fast-reroute
show ip ospf processes-count
```

## 6. 备注 / 标准裁剪

| #   | 项         | 说明                                                                                                 |
| --- | ---------- | ---------------------------------------------------------------------------------------------------- |
| 1   | 互备关系   | 本场景中两个 ECMP 成员互为对方的 LFA：B 成员故障切到 D，D 成员故障切到 B                             |
| 2   | 判定核心   | 必检项是 LFA 明细同时存在两行不同 Primary/Backup 组合，不能只检查 `Protected by LFA` 计数大于 0      |
| 3   | 流量设计   | 单条五元组可能只走一个 ECMP 成员，因此逐包修改 UDP 源端口，保证两个成员都被覆盖                      |
| 4   | 不需要 BFD | 故障点是 DUTA 本地接口，接口 `shutdown` 可直接触发 LFA 切换；BFD 联动已由 0042、0060、0080 覆盖      |
| 5   | 回显差异   | `Type` 列可能为 `link` 或 `link+node`；脚本只匹配前缀、Primary nbr 和 Backup nbr，不强制匹配保护类型 |
| 6   | 版本差异   | 若设备无法按 ECMP 主下一跳分别输出 LFA 明细，则记录为版本能力差异；当前基线设备实测可输出两行        |

## 7. 执行与结果记录

| 项                | 内容                                                                              |
| ----------------- | --------------------------------------------------------------------------------- |
| 执行时间 / 执行人 | 待执行 / -                                                                        |
| 结论              | 待执行                                                                            |
| 实际观测          | 流量已调整为每周期 6000 包；待记录 LFA 明细两行、两次故障后的路由、ping 结果和每周期接收匹配数 |
| 证据              | -                                                                                 |
| 关联缺陷 / 需求   |                                                                                   |

逐条结果：

| 用例编号 | 结论   | 实际观测                                                     | 证据 |
| -------- | ------ | ------------------------------------------------------------ | ---- |
| 0091     | 待执行 | 每周期 6000 包，需验证单成员故障时丢包少于 50 个             | -    |
