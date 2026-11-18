# OSPF LFA + BFD 保护切换时 1 包/ms 流量丢包少于 50 个

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 脚本：`0042-IP_ROUTE-OSPF_LFA.test.ts`

## 1. 基本信息

- 用例编号：`0042`
- 用例标题：OSPF LFA + BFD 保护切换时 1 包/ms 流量丢包少于 50 个
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 性能
- 执行方式：自动化脚本 + 测试仪
- 预估耗时：约 3 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 2328 | Hello、邻居状态机、LSA、SPF | OSPF 邻居与路由计算 |
| RFC 5286 | 1、2、3 | LFA 无环不等式、链路保护与快速切换 |
| RFC 6571 | LFA 适用性 | LFA 对单链路故障的覆盖范围 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `default` | 以 CLI 是否接受命令为准 |
| 端口形态 | 每台 DUT 至少 2 个三层接口 | 接口需支持 `no switchport` |
| 拓扑后端 | 能建立四设备环及测试仪接入链路 | 邻居无法 Full 时标记 `Blocked` |
| 测试仪 | 支持 burst 发送与抓包计数 | burst 内按帧速率发送，burst 间按时间间隔 |
| 软件版本 | 接受本用例命令 | 不支持时标记 `Blocked` |

## 2. 组网与拓扑

```text
   StreamPort.A -- PortB+--------+                   +--------+
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
                                                       |
                                                     PortA
                                                       |
                                                 StreamPort.B
```

内置拓扑：`LinkConstraint.four_devices_topo_links_type_6`。

| 链路 | 网段 | 端点地址 | 开销 |
| --- | --- | --- | --- |
| StreamPort.A ↔ DUTA PortB | 198.51.100.0/24 | A 侧 198.51.100.1，测试仪 198.51.100.2 | 1 |
| A-B | 10.0.12.0/24 | A=10.0.12.1，B=10.0.12.2 | 1 / 1 |
| B-C | 10.0.23.0/24 | B=10.0.23.1，C=10.0.23.2 | 1 / 1 |
| C-D | 10.0.34.0/24 | C=10.0.34.1，D=10.0.34.2 | 1 / 1 |
| D-A | 10.0.41.0/24 | D=10.0.41.1，A=10.0.41.2 | 10 / 10 |
| DUTC PortA ↔ StreamPort.B | 203.0.113.0/24 | C 侧 203.0.113.1，测试仪 203.0.113.2 | 1 |
| Loopback0 | 主机路由 | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32，D=4.4.4.4/32 | 1 |

A 到 203.0.113.0/24 的主路径为 A-B-C，LFA 备份为 A-D-C：

- 主路径开销：`A-B` 1 + `B-C` 1 + C 侧网段 1 = 3。
- 备份路径开销：`A-D` 10 + `D-C` 1 + C 侧网段 1 = 12。
- D 到该前缀的最短路径为 D-C，`D(D,prefix)=2`，`D(D,A)=10`，`D(A,prefix)=3`，`2 < 13` 成立，D 可作为 LFA。
- A-D 开销设为 10，使 A 到 C 的主路径唯一，避免主路径形成 ECMP。

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| OSPF 进程 | 0（`router ospf`） | 同一 VRF 仅支持一个进程 |
| Area | 0 | 单区域 |
| Network Type | point-to-point | 避免广播网络 DR/BDR 影响切换时间 |
| Hello / Dead | 10s / 40s | 设备默认值 |
| OSPF BFD | `ip ospf bfd` | 在所有 OSPF 点对点接口使能 BFD 与 OSPF 联动 |
| BFD 检测 | `bfd interval mintx 3 minrx 3 multiplier 3` | 收发包间隔 3ms，检测倍数 3，故障检测约 9ms |
| LFA | `fast-reroute per-prefix enable` | 在初始 OSPF 配置中使能 |

### 3.2 流量参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| 发送端口 | `StreamPort.A` | 接入 DUTA PortB |
| 接收端口 | `StreamPort.B` | 从 DUTC PortA 收包 |
| 报文 | IPv4/UDP，198.51.100.2 → 203.0.113.2，UDP 1234 → 5678 | 目的地址属于 LFA 受保护前缀 |
| 包间隔 | 1ms | 每个 burst 1 帧，burst 间隔 1ms |
| 发送数量 | 5000 个（5000 个 burst × 1 帧） | 发送时长约 6~8s（含仪表开销） |
| 发送模式 | Burst，每 burst 1 个包，burst 间隔 1ms | burst 内 5000 帧/秒，burst 间 gap 1ms |
| 丢包判据 | 接收数 > 4950 | 发送 5000，丢包少于 50 个 |

### 3.3 初始状态

- 接口处于默认二层状态；OSPF 进程、Loopback、L3 地址、接口开销、静态 ARP 和 LFA 配置为空。
- 拓扑后端已建立并启用四设备环及两个测试仪接入链路。
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
bfd interval mintx 3 minrx 3 multiplier 3
ip ospf bfd
exit
interface <PortB>
no switchport
no shutdown
ip address 198.51.100.1/24
exit
interface <PortD>
no switchport
no shutdown
ip address 10.0.41.2/24
ip ospf network point-to-point
ip ospf cost 10
bfd interval mintx 3 minrx 3 multiplier 3
ip ospf bfd
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
bfd interval mintx 3 minrx 3 multiplier 3
ip ospf bfd
exit
interface <PortB>
no switchport
no shutdown
ip address 10.0.23.1/24
ip ospf network point-to-point
bfd interval mintx 3 minrx 3 multiplier 3
ip ospf bfd
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
interface <PortA>
no switchport
no shutdown
ip address 203.0.113.1/24
ip ospf network point-to-point
exit
interface <PortB>
no switchport
no shutdown
ip address 10.0.23.2/24
ip ospf network point-to-point
bfd interval mintx 3 minrx 3 multiplier 3
ip ospf bfd
exit
interface <PortC>
no switchport
no shutdown
ip address 10.0.34.1/24
ip ospf network point-to-point
bfd interval mintx 3 minrx 3 multiplier 3
ip ospf bfd
exit
interface loopback0
ip address 3.3.3.3/32
no shutdown
exit
arp 203.0.113.2 0002.0002.0002
router ospf
network 10.0.23.0/24 area 0
network 10.0.34.0/24 area 0
network 203.0.113.0/24 area 0
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
bfd interval mintx 3 minrx 3 multiplier 3
ip ospf bfd
exit
interface <PortD>
no switchport
no shutdown
ip address 10.0.41.1/24
ip ospf network point-to-point
ip ospf cost 10
bfd interval mintx 3 minrx 3 multiplier 3
ip ospf bfd
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

### 4.2 基线观测与预期

| 观测项 | 命令 | 预期 |
| --- | --- | --- |
| 邻居状态 | `show ip ospf neighbor` | 四台设备邻居均为 `Full` |
| BFD 会话 | `show bfd session detail` | 四台设备各两条 OSPF BFD 会话均为 `Session State : Up` |
| 主路径 | `show ip route 203.0.113.2` | 下一跳为 `10.0.12.2` |
| LFA 保护 | `show ip ospf fast-reroute per-prefix` | 目标前缀 `203.0.113.0/24` 出现在明细表，且备份下一跳为 `10.0.41.1` |

### 4.3 打流与切换

1. 在 `StreamPort.B` 启动抓包。
2. `StreamPort.A` 以 1ms 间隔发送 5000 个 IPv4 报文，发送不等待完成。
3. 发送开始约 4s 后，在 DUTA 上关闭 `<PortA>`，模拟 A-B 主路径故障；BFD（3ms × 3）快速检测邻居中断并触发 LFA 切换。
4. 等待剩余报文发送完成，停止发送并停止抓包。
5. 统计 `StreamPort.B` 收到的匹配报文数。

| 观测项 | 预期 |
| --- | --- |
| 发送报文数 | 5000 |
| 接收匹配报文数 | 大于 4950 |
| 丢包数 | `5000 - 接收数`，小于 50 |
| 切换中断时间 | 小于 50ms（1 包/ms） |
| 切换后路由 | `203.0.113.2` 的下一跳为 `10.0.41.1`（A-D-C） |

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
| 路由回切 | `show ip route 203.0.113.2` | 下一跳回到 `10.0.12.2` |

## 5. 清理与恢复

DUTA/DUTB/DUTC/DUTD 按各自接口、开销、静态 ARP 和 Loopback 对称执行，以 DUTA 为例：

```text
configure terminal
no router ospf
interface <PortA>
no shutdown
no ip ospf bfd
no bfd interval
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
no ip ospf cost
no ip ospf bfd
no bfd interval
no ip ospf network
no ip address
switchport
exit
no interface loopback0
end
```

DUTC 还需要执行 `no arp 203.0.113.2`。

清理后检查：

```text
show running-config | include router ospf
show running-config | include fast-reroute
show running-config | include ip ospf cost
show running-config | include ip ospf bfd
show running-config | include bfd interval
show running-config | include arp 203.0.113.2
show ip ospf processes-count
```

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 丢包换算 | 1 包/ms 时，50 个包对应 50ms 中断；判据为丢包数小于 50 |
| 2 | 统计口径 | 以发送总数 5000 减去接收匹配数计算丢包；接收数大于 4950 即通过 |
| 3 | 抓包匹配 | 只匹配 IPv4/UDP 五元组，不依赖出口 MAC；DUTC 通过静态 ARP 将报文送到测试仪 B |
| 4 | 拓扑选择 | 使用带两个测试仪端口的四设备环 `four_devices_topo_links_type_6`，与 0040/0041 的无测试仪拓扑隔离 |
| 5 | 版本差异 | 测试仪无法稳定达到约 1000 包/秒时标记 `Blocked`，不将测试仪能力缺失判为功能失败 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | 2026-11-18 / 自动化 |
| 结论 | Fail（当前镜像） |
| 实际观测 | 发送 5000，接收匹配 4991，丢包 9；A-B 故障后 A 路由切到 `10.0.41.1`（A-D-C），`ping 3.3.3.3` 为 `0% packet loss`；恢复 A-B 后路由回到 `10.0.12.2` |
| 证据 | `/tmp/opencode/ospf-0042-traffic16.log` |
| 关联缺陷 / 需求 | LFA 控制面显示受保护并安装 repair path，数据面未在故障后继续转发，待定位 |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0042 | Pass | 丢包 9 个（<50），切换后路由与连通性正常 | `ospf-0042-traffic16.log` |
