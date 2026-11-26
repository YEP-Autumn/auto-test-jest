# 并行链路主链路故障后 LFA 切换到备份链路，1 包/ms 流量丢包少于 50 个

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0060-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）

## 1. 基本信息

- 用例编号：`0060`
- 用例标题：并行链路主链路故障后 LFA 切换到备份链路，1 包/ms 流量丢包少于 50 个
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 性能
- 执行方式：自动化工具 + 测试仪
- 预估耗时：约 3 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款                        | 本用例验证的要求                 |
| ---------- | --------------------------- | -------------------------------- |
| RFC 2328   | Hello、邻居状态机、LSA、SPF | OSPF 邻居与路由计算              |
| RFC 5286   | 1、2、3                     | LFA 无环条件、链路保护与切换 |
| RFC 6571   | LFA 适用性                  | LFA 对单链路故障的覆盖范围       |

### 1.2 能力前提

| 项           | 要求                                   | 说明                                                        |
| ------------ | -------------------------------------- | ----------------------------------------------------------- |
| 设备能力 / 版本 | 按实际执行环境填写 | 以 CLI 是否接受命令为准                                     |
| 端口形态     | 每台 DUT 至少 3 个三层接口             | 两个 OSPF 接口 + 一个测试仪接入接口，需支持 `no switchport` |
| 拓扑后端     | 能建立两设备双链路及两个测试仪接入链路 | 邻居无法 Full 时标记 `Blocked`                              |
| 测试仪       | 支持 burst 发送与抓包计数              | burst 内按帧速率发送，burst 间按时间间隔                    |
| 软件版本     | 接受本用例命令                         | 不支持时标记 `Blocked`                                      |

## 2. 组网与拓扑

```text
   逻辑端口 A <=> DUTA PortD
   DUTA PortA   <=> DUTB PortA
   DUTA PortC   <=> DUTB PortC
   DUTB PortD   <=> 逻辑端口 B
```

拓扑名称 / 来源：`two_devices_topo_links_type_1`（内置拓扑）。

| 链路                      | 网段            | 端点地址                               | 开销    |
| ------------------------- | --------------- | -------------------------------------- | ------- |
| 逻辑端口 A ↔ DUTA PortD | 198.51.100.0/24 | A 侧 198.51.100.1，测试仪 198.51.100.2 | 1       |
| A-B 主链路                | 10.0.12.0/24    | A=10.0.12.1，B=10.0.12.2               | 1 / 1   |
| A-B 备链路                | 10.0.21.0/24    | A=10.0.21.1，B=10.0.21.2               | 10 / 10 |
| DUTB PortD ↔ 逻辑端口 B | 203.0.113.0/24  | B 侧 203.0.113.1，测试仪 203.0.113.2   | 1       |
| Loopback0                 | 主机路由        | A=1.1.1.1/32，B=2.2.2.2/32             | 1       |

A 到 203.0.113.0/24 的主路径经 A-B 主链路，LFA 备份下一跳为同一邻居 B 的备链路：

- 主路径开销：`A-B` 1 + B 侧网段 1 = 2。
- 备份路径开销：`A-B` 10 + B 侧网段 1 = 11。
- B 到该前缀为直连，`D(B,prefix)=1`；`D(B,A)=1`，`D(A,prefix)=2`，`1 < 3` 成立，B 通过备链路可作为 LFA。
- 主备链路都指向同一邻居 B，区别在出接口和下一跳地址，这是本用例与 0042 环网绕行场景的核心差异。

## 3. 预置条件

### 3.1 协议基线参数

| 参数         | 取值                                        | 说明                                        |
| ------------ | ------------------------------------------- | ------------------------------------------- |
| OSPF 进程    | 0（`router ospf`）                          | 同一 VRF 仅支持一个进程                     |
| Area         | 0                                           | 单区域                                      |
| Network Type | point-to-point                              | 避免广播网络 DR/BDR 影响切换时间            |
| Hello / Dead | 10s / 40s                                   | 设备默认值                                  |
| LFA          | `fast-reroute per-prefix enable`            | 在初始 OSPF 配置中使能                      |
| OSPF BFD     | `ip ospf bfd`                               | 在两条 OSPF 点对点接口使能 BFD 与 OSPF 联动 |
| BFD 检测     | `bfd interval mintx 3 minrx 3 multiplier 3` | 收发包间隔 3ms，检测倍数 3，故障检测约 9ms  |

### 3.2 初始状态

- 接口处于默认二层状态；OSPF 进程、Loopback、L3 地址、接口开销、静态 ARP 和 LFA 配置为空。
- 拓扑后端已建立并启用两设备双链路及两个测试仪接入链路。
- 现场保留：默认清理。

### 3.3 流量参数

| 参数     | 取值                                                  | 说明                                  |
| -------- | ----------------------------------------------------- | ------------------------------------- |
| 发送端口 | 逻辑端口 A                                        | 接入 DUTA PortD                       |
| 接收端口 | 逻辑端口 B                                        | 从 DUTB PortD 收包                    |
| 报文     | IPv4/UDP，198.51.100.2 → 203.0.113.2，UDP 1234 → 5678 | 目的地址属于 LFA 受保护前缀           |
| 包间隔   | 1ms                                                   | 每个 burst 1 帧，burst 间隔 1ms       |
| 发送数量 | 5000 个（5000 个 burst × 1 帧）                       | 发送时长约 6~8s（含测试仪开销）       |
| 发送模式 | Burst，每 burst 1 个包，burst 间隔 1ms                | burst 内按 5000 帧/秒发送，burst 间 gap 1ms，等效约 1000 帧/秒 |
| 丢包判据 | 接收数 > 4950                                         | 发送 5000，丢包少于 50 个             |

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
ip ospf cost 1
bfd interval mintx 3 minrx 3 multiplier 3
ip ospf bfd
exit
interface <PortC>
no switchport
no shutdown
ip address 10.0.21.1/24
ip ospf network point-to-point
ip ospf cost 10
bfd interval mintx 3 minrx 3 multiplier 3
ip ospf bfd
exit
interface <PortD>
no switchport
no shutdown
ip address 198.51.100.1/24
exit
interface loopback0
ip address 1.1.1.1/32
no shutdown
exit
router ospf
network 10.0.12.0/24 area 0
network 10.0.21.0/24 area 0
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
ip ospf cost 1
bfd interval mintx 3 minrx 3 multiplier 3
ip ospf bfd
exit
interface <PortC>
no switchport
no shutdown
ip address 10.0.21.2/24
ip ospf network point-to-point
ip ospf cost 10
bfd interval mintx 3 minrx 3 multiplier 3
ip ospf bfd
exit
interface <PortD>
no switchport
no shutdown
ip address 203.0.113.1/24
exit
interface loopback0
ip address 2.2.2.2/32
no shutdown
exit
arp 203.0.113.2 0002.0002.0002
router ospf
network 10.0.12.0/24 area 0
network 10.0.21.0/24 area 0
network 203.0.113.0/24 area 0
network 2.2.2.2/32 area 0
fast-reroute per-prefix enable
exit
end
```

### 4.2 基线检查与执行顺序

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 邻居基线检查 | `show ip ospf neighbor` | 两台设备邻居均为 `Full` |
| 2 | 主路径基线 | `show ip route 203.0.113.2` | 下一跳为 `10.0.12.2` |
| 3 | LFA 保护基线 | `show ip ospf fast-reroute per-prefix` | 目标前缀 `203.0.113.0/24` 出现在明细表，且备份下一跳为 `10.0.21.2` |
| 4 | 连通性基线 | `ping 2.2.2.2` | `0% packet loss` |
| 5 | 启动流量发送与抓包 | 见 4.3 | 发送 5000 个报文，接收端开始计数 |
| 6 | 注入 A-B 主链路故障 | 见 4.3 | LFA 切换到备链路，丢包少于 50 个 |
| 7 | 恢复 A-B 主链路 | 见 4.4 | 路由回切到 `10.0.12.2` |

### 4.3 触发与流量发送

1. 在逻辑端口 B 启动抓包。
2. 逻辑端口 A 以 1ms 间隔发送 5000 个 IPv4 报文，发送不等待完成。
3. 发送开始约 4s 后，在 DUTA 上关闭 `<PortA>`，模拟 A-B 主链路故障；BFD（3ms × 3）在约 9ms 内检测邻居中断并触发 LFA 切换。
4. 等待 A 到 `203.0.113.2` 的路由切换到 `10.0.21.2`（备链路）。
5. 等待剩余报文发送完成，停止发送并停止抓包。
6. 统计 逻辑端口 B 收到的匹配报文数。

| 触发 / 观测项 | 操作或方法 | 预期 |
| --- | --- | --- |
| A-B 主链路故障 | DUTA `<PortA>` 执行 `shutdown` | BFD 检测邻居中断，LFA 切换到备链路 |
| 发送报文数 | 逻辑端口 A 发送统计 | 5000 个 |
| 接收匹配报文数 | 逻辑端口 B 抓包统计 | 大于 4950 个 |
| 丢包数 | `5000 - 接收数` | 小于 50 个 |
| 切换中断时间 | 按 1 包/ms 折算 | 小于 50ms |
| 切换后路由 | `show ip route 203.0.113.2` | 下一跳为 `10.0.21.2`（备链路） |
| 切换后连通性 | `ping 2.2.2.2` | `0% packet loss` |

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
| A-B 主链路恢复 | DUTA `<PortA>` 执行 `no shutdown` | `203.0.113.2` 下一跳回到 `10.0.12.2`，`ping 2.2.2.2` 为 `0% packet loss` |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议状态面 | `show ip ospf neighbor` | 故障前两台设备邻居均为 `Full`；故障后 A-B 邻居中断；恢复后邻居重新为 `Full` |
| BFD 会话面 | `show bfd session detail` | 故障前两条 OSPF BFD 会话均为 `Session State : Up` |
| LFA 明细面 | `show ip ospf fast-reroute per-prefix` | `203.0.113.0/24` 出现在明细表，备份下一跳为 `10.0.21.2` |
| 表项面 | `show ip route 203.0.113.2` | 故障前 `10.0.12.2`；故障后 `10.0.21.2`；恢复后 `10.0.12.2` |
| 转发面 | 逻辑端口 B 抓包统计、`ping 2.2.2.2` | 发送 5000 个，接收匹配大于 4950 个，丢包小于 50 个；`ping 2.2.2.2` 丢包率为 0% |
| 恢复 / 资源面 | 恢复后再次查询路由 | `203.0.113.2` 下一跳回到 `10.0.12.2` |

### 4.6 判定标准

- 4.2 步骤 1 至 4 全部满足：邻居 `Full`，主路径下一跳为 `10.0.12.2`，`203.0.113.0/24` 的备份下一跳为 `10.0.21.2`，`ping 2.2.2.2` 丢包率为 0%。
- 4.3 流量发送满足：发送 5000 个，接收匹配大于 4950 个，丢包小于 50 个，折算切换中断时间小于 50ms；切换后 `203.0.113.2` 下一跳为 `10.0.21.2`，`ping 2.2.2.2` 丢包率为 0%。
- 4.4 恢复后 `203.0.113.2` 下一跳回到 `10.0.12.2`，`ping 2.2.2.2` 丢包率为 0%。
- 上述条件全部满足且第 5 章清理成功：结论为 `Pass`。
- 上述条件任一不满足：结论为 `Fail`。
- 设备不支持 LFA 或 OSPF BFD、拓扑后端无法建立两设备双链路，或测试仪无法达到 1000 包/秒：结论为 `Blocked`，记录缺失项与现场。

## 5. 清理与恢复

DUTA：

```text
configure terminal
no router ospf
interface <PortA>
no shutdown
no ip ospf bfd
no bfd interval
no ip ospf cost
no ip ospf network
no ip address
switchport
exit
interface <PortC>
no shutdown
no ip ospf bfd
no bfd interval
no ip ospf cost
no ip ospf network
no ip address
switchport
exit
interface <PortD>
no shutdown
no ip address
switchport
exit
no interface loopback0
end
```

DUTB 按相同接口和 Loopback 对称执行，并删除静态 ARP：

```text
configure terminal
no router ospf
interface <PortA>
no shutdown
no ip ospf bfd
no bfd interval
no ip ospf cost
no ip ospf network
no ip address
switchport
exit
interface <PortC>
no shutdown
no ip ospf bfd
no bfd interval
no ip ospf cost
no ip ospf network
no ip address
switchport
exit
interface <PortD>
no shutdown
no ip address
switchport
exit
no arp 203.0.113.2
no interface loopback0
end
```

清理后检查：

```text
show running-config | include router ospf
show running-config | include fast-reroute
show running-config | include ip ospf cost
show running-config | include arp 203.0.113.2
show ip ospf processes-count
```

## 6. 备注 / 标准裁剪

| #   | 项             | 说明                                                                                                                    |
| --- | -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | 丢包换算       | 1 包/ms 时，50 个包对应 50ms 中断；判据为丢包数小于 50                                                                  |
| 2   | 统计口径       | 以发送总数 5000 减去接收匹配数计算丢包；接收数大于 4950 即通过                                                          |
| 3   | 抓包匹配       | 仅匹配 IPv4/UDP 五元组，不依赖出口 MAC；DUTB 通过静态 ARP 将报文送到测试仪 B                                            |
| 4   | 拓扑选择       | 使用带两个测试仪端口的两设备双链路拓扑 `two_devices_topo_links_type_1`，备链路使用 PortC                                |
| 5   | 与 0042 的差异 | 0042 是四设备环、LFA 备份为不同邻居 D；本用例是同一邻居 B 的不同接口，验证并行链路 LFA                                  |
| 6   | BFD 作用       | 本用例按 0042 基线使能 BFD（3ms × 3）；无 BFD 的纯本地 shutdown 场景由 0062 单独验证（约 3ms） |
| 7   | 版本差异       | 测试仪无法达到 1000 包/秒时标记 `Blocked`，不将测试仪能力缺失判为功能失败                                         |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | `Pass` / `Fail` / `Blocked` |
| 实际观测 | 记录发送/接收包数、丢包数、切换后路由和 ping 结果 |
| 证据 | 回显 / 抓包文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0060` | | | |
