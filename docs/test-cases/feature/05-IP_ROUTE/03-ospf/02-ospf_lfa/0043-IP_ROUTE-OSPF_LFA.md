# BGP 路由递归到 OSPF LFA 受保护前缀时 1 包/ms 流量丢包少于 50 个

> 本文依据 `docs/spec/test-case-template.md` 编写；文档中的子用例与用例编号一一对应。
> 自动化实现：`0043-IP_ROUTE-OSPF_LFA.test.ts`（可选，手工执行时省略）
>
> **当前结论**：在当前软件版本上，递归 BGP 路由的 FIB 表项不会继承 OSPF LFA 的预安装备份路径，实测丢包约 2300 个（约 2.3s），未达到 50ms。脚本以 `test.failing` 固化该差距，固件修复后应改回 `test(...)`。

## 1. 基本信息

- 用例编号：`0043`
- 用例标题：BGP 路由递归到 OSPF LFA 受保护前缀时 1 包/ms 流量丢包少于 50 个
- 所属特性 / 分组：`05-IP_ROUTE` / `OSPF配置` / `OSPF LFA`
- 级别 / 类型：P1 / 性能
- 执行方式：自动化工具 + 测试仪
- 预估耗时：约 3 分钟
- 关联：`test/feature/05-IP_ROUTE/03-ospf/02-ospf_lfa/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款       | 本用例验证的要求                   |
| ---------- | ---------- | ---------------------------------- |
| RFC 4271   | 4、5、9    | BGP 会话建立、路由通告与下一跳属性 |
| RFC 2328   | 10、11、16 | OSPF 邻居、LSA 与最短路径计算      |
| RFC 5286   | 1、2、3    | LFA 无环不等式、链路保护与快速切换 |
| RFC 6571   | 3          | LFA 对单链路故障的覆盖范围         |

### 1.2 能力前提

| 项              | 要求                                                                | 说明                                                       |
| --------------- | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| 设备能力 / 版本 | 按实际执行环境填写                                                  | 以 CLI 是否接受 BGP、OSPF LFA、BFD 命令为准                |
| 端口形态        | 每台 DUT 至少 2 个三层接口                                          | 接口需支持 `no switchport`                                 |
| 拓扑后端        | 能建立四设备环及测试仪接入链路                                      | 邻居无法 `Full` 或 BGP 无法 `Established` 时标记 `Blocked` |
| BGP 能力        | 支持 iBGP 多跳、`update-source loopback`、出方向 next-hop route-map | 用于通过 Loopback 建立 BGP 会话并控制下一跳                |
| 测试仪          | 支持 burst 发送与抓包计数                                           | burst 内按帧速率发送，burst 间按时间间隔                   |
| 软件版本        | 接受本用例命令                                                      | 不支持时标记 `Blocked`                                     |

## 2. 组网与拓扑

```text
                        +--------+                   +--------+
 StreamPort.A <=> PortB-|  DUTA  |--PortA <=> PortA--|  DUTB  |
                        +---+----+                   +---+----+
                            |                            |
                          PortD                        PortB
                            |                            |
                          PortD                        PortB
                            |                            |
                        +---+----+                   +---+----+
                        |  DUTD  |--PortC <=> PortC--|  DUTC  |
                        +--------+                   +---+----+
                                                         |
                                                       PortA
                                                         |
                                                    StreamPort.B
```

拓扑名称 / 来源：`four_devices_topo_links_type_6`（内置拓扑）。

| 链路                    | 网段            | 端点地址                                               | 开销    |
| ----------------------- | --------------- | ------------------------------------------------------ | ------- |
| 逻辑端口 A ↔ DUTA PortB | 198.51.100.0/24 | A 侧 198.51.100.1，测试仪 198.51.100.2                 | 1       |
| A-B                     | 10.0.12.0/24    | A=10.0.12.1，B=10.0.12.2                               | 1 / 1   |
| B-C                     | 10.0.23.0/24    | B=10.0.23.1，C=10.0.23.2                               | 1 / 1   |
| C-D                     | 10.0.34.0/24    | C=10.0.34.1，D=10.0.34.2                               | 1 / 1   |
| D-A                     | 10.0.41.0/24    | D=10.0.41.1，A=10.0.41.2                               | 10 / 10 |
| DUTC PortA ↔ 逻辑端口 B | 203.0.113.0/24  | C 侧 203.0.113.1，测试仪 203.0.113.2                   | 1       |
| Loopback0               | 主机路由        | A=1.1.1.1/32，B=2.2.2.2/32，C=3.3.3.3/32，D=4.4.4.4/32 | 1       |

协议角色：

- DUTA：AS 65002，OSPF 路由器，iBGP 发言者。
- DUTB：AS 65002，OSPF 路由器，iBGP 发言者；作为 BGP 前缀的中间转发节点。
- DUTC：AS 65002，OSPF 路由器，iBGP 发言者；起源 `203.0.113.0/24`。
- DUTD：AS 65002，OSPF 路由器，iBGP 发言者；作为 LFA 备份路径和 BGP 前缀的中间转发节点。

依赖关系与路径计算：

- DUTC 通过 iBGP 向 A/B/D 通告 `203.0.113.0/24`。
- DUTC 对 A 设置下一跳为 `10.0.23.2`，对 B 设置下一跳为 `10.0.23.2`，对 D 设置下一跳为 `10.0.34.1`，由出方向 route-map 实现。
- DUTA 的 BGP 路由 `203.0.113.0/24` 递归到 OSPF 路由 `10.0.23.0/24`。该 OSPF 前缀即本用例中被 LFA 保护的前缀。
- `10.0.23.0/24` 的主路径为 A-B-C，开销 `1 + 1 = 2`。
- `10.0.23.0/24` 的 LFA 备份路径为 A-D-C，开销 `10 + 1 = 11`。
- LFA 无环条件：`D(D, 10.0.23.0/24) = 1`，`D(D, A) = 3`（D-C-B-A），`D(A, 10.0.23.0/24) = 2`，`1 < 3 + 2` 成立，DUTD 可作为 LFA。
- B/D 也运行 iBGP 并收到 `203.0.113.0/24`，下一跳分别为直连的 `10.0.23.2` 和 `10.0.34.1`，因此中间节点具备目的网段路由，不会因缺少 BGP 前缀而丢包。
- BGP 会话通过 Loopback 建立。A-B 主链路故障时，BGP 报文与业务报文一起由 OSPF LFA 快速切换到 A-D-C，因此 BGP 会话不需要重新建立，BGP 路由也不需要重新收敛。

## 3. 预置条件

### 3.1 协议基线参数

| 参数         | 取值                                        | 说明                                        |
| ------------ | ------------------------------------------- | ------------------------------------------- |
| OSPF 进程    | 0（`router ospf`）                          | 同一 VRF 仅支持一个进程                     |
| Area         | 0                                           | 单区域                                      |
| Network Type | point-to-point                              | 避免广播网络 DR/BDR 影响切换时间            |
| Hello / Dead | 10s / 40s                                   | 设备默认值                                  |
| OSPF BFD     | `ip ospf bfd`                               | 在所有 OSPF 点对点接口使能 BFD 与 OSPF 联动 |
| BFD 检测     | `bfd interval mintx 3 minrx 3 multiplier 3` | 收发包间隔 3ms，检测倍数 3，故障检测约 9ms  |
| LFA          | `fast-reroute per-prefix enable`            | 在初始 OSPF 配置中使能                      |
| BGP AS       | A/B/C/D 均为 65002                          | 单 AS iBGP                                  |
| BGP 邻居     | A/B/D 均对 `3.3.3.3`                        | 通过 Loopback0 建立                         |
| BGP 下一跳   | A/B 为 `10.0.23.2`，D 为 `10.0.34.1`        | 由 DUTC 出方向 route-map 设置               |
| BGP 扫描     | `bgp scan-time 5`                           | 缩短下一跳扫描周期，便于故障后快速刷新      |
| BGP 定时器   | Keepalive 60s / Hold 180s                   | 设备默认值；本用例不依赖 Hold 超时切换      |
| BGP 同步     | `no synchronization`                        | 避免同步检查影响路由安装                    |

### 3.2 初始状态

- 接口处于默认二层状态；OSPF 进程、BGP 进程、Loopback、L3 地址、接口开销、静态 ARP、route-map 和 LFA 配置为空。
- 拓扑后端已建立并启用四设备环及两个测试仪接入链路。
- 现场保留：默认清理。

### 3.3 流量参数

| 参数     | 取值                                                  | 说明                                                           |
| -------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| 发送端口 | 逻辑端口 A                                            | 接入 DUTA PortB                                                |
| 接收端口 | 逻辑端口 B                                            | 从 DUTC PortA 收包                                             |
| 报文     | IPv4/UDP，198.51.100.2 → 203.0.113.2，UDP 1234 → 5678 | 目的地址属于 BGP 通告前缀，且该 BGP 路由递归到 LFA 受保护前缀  |
| 包间隔   | 1ms                                                   | 每个 burst 1 帧，burst 间隔 1ms                                |
| 发送数量 | 5000 个（5000 个 burst × 1 帧）                       | 发送时长约 6~8s（含测试仪开销）                                |
| 发送模式 | Burst，每 burst 1 个包，burst 间隔 1ms                | burst 内按 5000 帧/秒发送，burst 间 gap 1ms，等效约 1000 帧/秒 |
| 预热流量 | 100 个报文                                            | 故障前先验证基线转发路径                                       |
| 丢包判据 | 接收数 > 4950                                         | 发送 5000，丢包少于 50 个                                      |

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
router bgp 65002
bgp router-id 1.1.1.1
bgp scan-time 5
neighbor 3.3.3.3 remote-as 65002
neighbor 3.3.3.3 update-source loopback0
address-family ipv4
no synchronization
neighbor 3.3.3.3 activate
exit-address-family
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
router bgp 65002
bgp router-id 2.2.2.2
bgp scan-time 5
neighbor 3.3.3.3 remote-as 65002
neighbor 3.3.3.3 update-source loopback0
address-family ipv4
no synchronization
neighbor 3.3.3.3 activate
exit-address-family
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
route-map NH_A permit 10
set ip next-hop 10.0.23.2
exit
route-map NH_B permit 10
set ip next-hop 10.0.23.2
exit
route-map NH_D permit 10
set ip next-hop 10.0.34.1
exit
router ospf
network 10.0.23.0/24 area 0
network 10.0.34.0/24 area 0
network 3.3.3.3/32 area 0
fast-reroute per-prefix enable
exit
router bgp 65002
bgp router-id 3.3.3.3
bgp scan-time 5
neighbor 1.1.1.1 remote-as 65002
neighbor 1.1.1.1 update-source loopback0
neighbor 2.2.2.2 remote-as 65002
neighbor 2.2.2.2 update-source loopback0
neighbor 4.4.4.4 remote-as 65002
neighbor 4.4.4.4 update-source loopback0
address-family ipv4
no synchronization
network 203.0.113.0 mask 255.255.255.0
neighbor 1.1.1.1 activate
neighbor 1.1.1.1 route-map NH_A out
neighbor 2.2.2.2 activate
neighbor 2.2.2.2 route-map NH_B out
neighbor 4.4.4.4 activate
neighbor 4.4.4.4 route-map NH_D out
exit-address-family
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
router bgp 65002
bgp router-id 4.4.4.4
bgp scan-time 5
neighbor 3.3.3.3 remote-as 65002
neighbor 3.3.3.3 update-source loopback0
address-family ipv4
no synchronization
neighbor 3.3.3.3 activate
exit-address-family
exit
end
```

> 注意：DUTC 的 `203.0.113.0/24` 只通过 BGP 通告，不加入 OSPF。B/D 通过 iBGP 学习该前缀，并由 DUTC 将下一跳设置为直连地址，确保中间节点具备目的网段路由。

### 4.2 基线检查与执行顺序

| 顺序 | 动作                   | 命令 / 触发方式                                        | 预期                                                                     |
| ---- | ---------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ |
| 1    | OSPF 邻居基线          | `show ip ospf neighbor`                                | 四台设备邻居均为 `Full`                                                  |
| 2    | BFD 会话基线           | `show bfd session detail`                              | 四台设备各两条 OSPF BFD 会话均为 `Session State : Up`                    |
| 3    | BGP 会话基线           | `show ip bgp neighbors 3.3.3.3`                        | A/B/D 均为 `BGP state = Established`                                     |
| 4    | A 的 BGP 路由基线      | `show ip bgp 203.0.113.0/24`                           | 路由存在，下一跳为 `10.0.23.2`                                           |
| 5    | B/D 的 BGP 路由基线    | `show ip bgp 203.0.113.0/24`                           | B 下一跳为 `10.0.23.2`，D 下一跳为 `10.0.34.1`                           |
| 6    | 递归主路径基线         | `show ip route 203.0.113.2`、`show ip route 10.0.23.2` | BGP 前缀已安装；`10.0.23.0/24` 下一跳为 `10.0.12.2`（A-B-C）             |
| 7    | LFA 保护基线           | `show ip ospf fast-reroute per-prefix`                 | `10.0.23.0/24` 出现在明细表，备份下一跳为 `10.0.41.1`                    |
| 8    | 预热流量               | 见 4.3                                                 | 发送 100 个，接收大于 90 个，确认故障前转发正常                          |
| 9    | 启动正式流量发送与抓包 | 见 4.3                                                 | 发送 5000 个报文，接收端开始计数                                         |
| 10   | 注入 A-B 主链路故障    | 见 4.3                                                 | BGP 下一跳保持 `10.0.23.2`，递归下一跳切换到 `10.0.41.1`，丢包少于 50 个 |
| 11   | 恢复 A-B 主链路        | 见 4.4                                                 | 递归下一跳回到 `10.0.12.2`                                               |

### 4.3 触发与流量发送

1. 在逻辑端口 B 启动抓包。
2. 先发送 100 个预热报文，确认故障前 BGP 转发路径正常。
3. 逻辑端口 A 以 1ms 间隔发送 5000 个 IPv4 报文，发送不等待完成。
4. 发送开始约 4s 后，在 DUTA 上关闭 `<PortA>`，模拟 A-B 主路径故障；BFD（3ms × 3）快速检测邻居中断并触发 LFA 切换。
5. 等待剩余报文发送完成，停止发送并停止抓包。
6. 统计逻辑端口 B 收到的匹配报文数。

| 触发 / 观测项    | 操作或方法                      | 预期                               |
| ---------------- | ------------------------------- | ---------------------------------- |
| A-B 主链路故障   | DUTA `<PortA>` 执行 `shutdown`  | BFD 检测邻居中断，LFA 切换生效     |
| 发送报文数       | 逻辑端口 A 发送统计             | 5000 个                            |
| 接收匹配报文数   | 逻辑端口 B 抓包统计             | 大于 4950 个                       |
| 丢包数           | `5000 - 接收数`                 | 小于 50 个                         |
| 切换中断时间     | 按 1 包/ms 折算                 | 小于 50ms                          |
| 故障后 BGP 会话  | `show ip bgp neighbors 3.3.3.3` | 仍为 `BGP state = Established`     |
| 故障后 BGP 路由  | `show ip bgp 203.0.113.0/24`    | 路由仍存在，下一跳仍为 `10.0.23.2` |
| 故障后递归下一跳 | `show ip route 10.0.23.2`       | `10.0.41.1`（A-D-C）               |

### 4.4 恢复

DUTA：

```text
configure terminal
interface <PortA>
no shutdown
end
```

| 恢复动作       | 命令                              | 预期                                                             |
| -------------- | --------------------------------- | ---------------------------------------------------------------- |
| A-B 主链路恢复 | DUTA `<PortA>` 执行 `no shutdown` | `10.0.23.2` 的下一跳回到 `10.0.12.2`；BGP 会话保持 `Established` |

### 4.5 观测面

| 观测面        | 命令 / 方法                                              | 判定                                                                                                            |
| ------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 协议状态面    | `show ip ospf neighbor`、`show ip bgp neighbors 3.3.3.3` | 故障前 OSPF 邻居 `Full`、BGP 会话 `Established`；故障后 BGP 会话仍为 `Established`；恢复后 OSPF 邻居重新 `Full` |
| BFD 会话面    | `show bfd session detail`                                | 故障前各条 OSPF BFD 会话为 `Session State : Up`                                                                 |
| BGP 表项面    | `show ip bgp 203.0.113.0/24`                             | 故障前后路由均存在，A 的下一跳均为 `10.0.23.2`，说明 BGP 未重新收敛                                             |
| LFA 明细面    | `show ip ospf fast-reroute per-prefix`                   | `10.0.23.0/24` 出现在明细表，备份下一跳为 `10.0.41.1`                                                           |
| 表项面        | `show ip route 203.0.113.2`、`show ip route 10.0.23.2`   | 故障前递归下一跳为 `10.0.12.2`；故障后为 `10.0.41.1`；恢复后回到 `10.0.12.2`                                    |
| 转发面        | 逻辑端口 B 抓包统计                                      | 发送 5000 个，接收匹配大于 4950 个，丢包小于 50 个                                                              |
| 恢复 / 资源面 | 恢复后再次查询路由和 BGP 会话                            | `10.0.23.2` 的下一跳回到 `10.0.12.2`，BGP 会话保持 `Established`                                                |

### 4.6 判定标准

- 4.2 步骤 1 至 7 全部满足：OSPF 邻居 `Full`，BFD 会话 `Up`，BGP 会话 `Established`，A 的 BGP 下一跳为 `10.0.23.2`，B/D 的 BGP 路由存在，`10.0.23.2` 的递归下一跳为 `10.0.12.2`，`10.0.23.0/24` 的 LFA 备份下一跳为 `10.0.41.1`。
- 4.2 步骤 8 预热满足：发送 100 个，接收大于 90 个。
- 4.3 流量发送满足：发送 5000 个，接收匹配大于 4950 个，丢包小于 50 个，折算切换中断时间小于 50ms。
- 4.3 故障后 BGP 会话仍为 `Established`，`show ip bgp 203.0.113.0/24` 中路由仍存在且 A 的下一跳仍为 `10.0.23.2`；`10.0.23.2` 的递归下一跳为 `10.0.41.1`。
- 4.4 恢复后 `10.0.23.2` 的下一跳回到 `10.0.12.2`，BGP 会话保持 `Established`。
- 上述条件全部满足且第 5 章清理成功：结论为 `Pass`。
- 上述条件任一不满足：结论为 `Fail`。
- 设备不支持 BGP、OSPF LFA 或 OSPF BFD，拓扑后端无法建立四设备环，或测试仪无法稳定达到约 1000 包/秒：结论为 `Blocked`，记录缺失项与现场。

## 5. 清理与恢复

DUTA/DUTB/DUTC/DUTD 按各自接口、开销、静态 ARP、route-map 和 Loopback 对称执行，以 DUTA 为例：

```text
configure terminal
no router bgp 65002
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

DUTB/DUTD 还需要执行 `no router bgp 65002`。DUTC 还需要执行 `no router bgp 65002`、`no route-map NH_A`、`no route-map NH_B`、`no route-map NH_D` 和 `no arp 203.0.113.2`。

清理后检查：

```text
show running-config | include router bgp
show running-config | include router ospf
show running-config | include fast-reroute
show running-config | include route-map
show running-config | include ip ospf cost
show running-config | include ip ospf bfd
show running-config | include bfd interval
show running-config | include arp 203.0.113.2
show ip ospf processes-count
```

## 6. 备注 / 标准裁剪

| #   | 项           | 说明                                                                                                                                                                                                           |
| --- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 保护层次     | 本用例验证的是 BGP 路由递归到 OSPF LFA 前缀后的**转发面**保护，不是 BGP 自身重新收敛或 BGP PIC                                                                                                                 |
| 2   | 下一跳不变   | 故障前后 `show ip bgp` 中 A 的下一跳均为 `10.0.23.2`，用于证明 BGP 路由未撤销、未重新计算                                                                                                                      |
| 3   | BGP 会话保持 | BGP 会话也通过 Loopback 建立，故障期间由 OSPF LFA 一并保护，不应依赖 Hold 定时器超时后再重建                                                                                                                   |
| 4   | 中间节点路由 | B/D 也运行 iBGP 并收到 `203.0.113.0/24`；否则中间节点缺少目的网段路由，会在 BGP 前缀处丢包                                                                                                                     |
| 5   | 已知限制     | 当前软件版本中，递归 BGP 路由的 FIB 表项不会继承 OSPF LFA 的预安装备份路径。实测丢包约 2312 个（约 2.31s），与 OSPF/BGP 重新收敛时间相当。静态递归路由同样不继承 LFA，说明是递归 FIB 的通用限制，不是 BGP 特有 |
| 6   | 丢包换算     | 1 包/ms 时，50 个包对应 50ms 中断；判据为丢包数小于 50                                                                                                                                                         |
| 7   | 统计口径     | 以发送总数 5000 减去接收匹配数计算丢包；接收数大于 4950 即通过                                                                                                                                                 |
| 8   | 拓扑选择     | 使用带两个测试仪端口的四设备环 `four_devices_topo_links_type_6`，与 0042 的纯 OSPF 用例共用拓扑                                                                                                                |
| 9   | 版本差异     | 测试仪无法稳定达到约 1000 包/秒时标记 `Blocked`，不将测试仪能力缺失判为功能失败                                                                                                                                |

## 7. 执行与结果记录

| 项                | 内容                                                                                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 执行时间 / 执行人 | 2026-11-26 / 自动化执行                                                                                                                                                                                                      |
| 结论              | `Fail`（已知限制，脚本以 `test.failing` 固化）                                                                                                                                                                               |
| 实际观测          | 预热 100 个报文全部收到；正式流量发送 5000 个，接收 2688 个，丢包 2312 个，折算中断约 2.31s；故障后 BGP 会话保持 `Established`，A 的 BGP 下一跳保持 `10.0.23.2`；`show ip route 10.0.23.2` 从 `10.0.12.2` 切换到 `10.0.41.1` |
| 证据              | `/tmp/opencode/0043-final2.log`；`test-report/` 下对应 HTML 报告                                                                                                                                                             |
| 关联缺陷 / 需求   | 递归 BGP 路由的 FIB 表项未继承 OSPF LFA 预安装备份路径                                                                                                                                                                       |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论   | 实际观测                                                        | 证据                            |
| -------- | ------ | --------------------------------------------------------------- | ------------------------------- |
| `0043`   | `Fail` | 丢包 2312 个（约 2.31s），未达到 50ms；BGP 会话与下一跳保持稳定 | `/tmp/opencode/0043-final2.log` |
