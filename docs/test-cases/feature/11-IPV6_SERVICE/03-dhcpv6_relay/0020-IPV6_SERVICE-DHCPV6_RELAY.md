# DHCPv6 中继通过 Prefix Delegation 学习客户端路由

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖脚本 `0020-IPV6_SERVICE-DHCPV6_RELAY.test.ts` 中的测试用例。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0020 | DHCPv6 中继通过 Prefix Delegation 学习客户端路由 | `0020-IPV6_SERVICE-DHCPV6_RELAY.test.ts` | P0 / 功能 | |

## 1. 基本信息

- 用例编号：`0020`
- 用例标题：DHCPv6 中继通过 Prefix Delegation 学习客户端路由
- 所属特性 / 分组：`11-IPV6_SERVICE` / `DHCPv6 Relay配置`
- 级别 / 类型：P0 / 功能
- 执行方式：手工 / 自动化脚本
- 适用版本：支持 `service dhcpv6 enable`、`dhcpv6 relay` 与 `dhcpv6 relay pd route` 的软件版本
- 预估耗时：约 5 分钟
- 关联：`test/feature/11-IPV6_SERVICE/03-dhcpv6_relay/`；设计模板见 [test-case-template.md](../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 8415 | 19.1.1 | 中继代理将携带 IA_PD 的客户端报文封装为 Relay-Forward |
| RFC 8415 | 19.1.2 | 中继代理解析 Relay-Reply，并转发携带 IAPREFIX 的 Reply |
| RFC 8415 | 19.2 | 中继代理在客户端与服务器之间转发报文，并维护中继统计 |
| RFC 8415 | 21.21、21.22 | IA_PD 与 IAPREFIX 选项的封装、解析及前缀租期处理 |
| RFC 8200 | 4、8 | IPv6 报文的源地址、目的地址、下一报头与跳数限制处理 |
| RFC 4861 | 7 | 中继代理通过静态邻居表项向客户端与服务器发送单播报文 |
| 设备配置指导 11.3 | 11.3 | DHCPv6 Relay 与 `dhcpv6 relay pd route` 配置 |
| 设备命令参考 5.3 | 5.3 | `show dhcpv6 relay pd client`、`clear dhcpv6 relay pd route` 等命令 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备能力 / 版本 | 支持 DHCPv6 Relay 与 PD 路由学习 | 确认 `dhcpv6 relay pd route` 命令可用 |
| License / 单板 | 无额外 License 要求 | 确认三层接口与 IPv6 转发能力可用 |
| 端口形态 | 2 个三层物理接口 | 分别作为客户端侧接口与服务器侧接口 |
| 规格 | 服务器组数量不少于 1，PD 表项不少于 1 | 确认服务器组与 PD 客户端表项可创建 |
| 测试仪 / 抓包 | 支持 IPv6 报文发送、抓包与字段匹配 | 需构造携带 IA_PD 与 IAPREFIX 的 DHCPv6 报文 |
| 软件版本 | 接受本用例命令 | 不支持时标记 `Blocked` |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。

## 2. 组网与拓扑

```text
                            +------------------------------+
                            |             DUTA             |
  StreamPort.A <=> PortA ---| 2001:1001::1/64              |
  (DHCPv6 Client)           | dhcpv6-server 1              |
                            | dhcpv6 relay pd route        |
                            |                              |
                            | 2001:1000::2/64 --- PortB <=>|<=> StreamPort.B
                            +------------------------------+    (DHCPv6 Server)
```

- 拓扑名称 / 来源：`LinkConstraint.one_device_topo_links_type_1`
- 拓扑来源 / 端口需求：`StreamPort.A` 连接 DUTA `PortA`，DUTA `PortB` 连接 `StreamPort.B`

| 设备 | 协议角色 | 接口 | 地址 / ID | 优先级 / 开销 | 连接对端 |
| --- | --- | --- | --- | --- | --- |
| DUTA | DHCPv6 Relay | PortA | 2001:1001::1/64 | 不涉及 | StreamPort.A |
| DUTA | DHCPv6 Relay | PortB | 2001:1000::2/64 | 不涉及 | StreamPort.B |
| StreamPort.A | DHCPv6 Client | 测试仪端口 A | 2001:1001::100，MAC 0000.0011.2233 | 不涉及 | DUTA PortA |
| StreamPort.B | DHCPv6 Server | 测试仪端口 B | 2001:1000::1，MAC 0000.0011.2244 | 不涉及 | DUTA PortB |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| 客户端地址 | `2001:1001::100` | 作为 Relay-Forward 的 peer-address |
| 客户端 DUID | `00030001020000000011` | DUID-LL，硬件类型 1，MAC 为客户端 MAC |
| 事务 ID | `0x123456` | 客户端与服务器报文使用同一事务 ID |
| 中继 link-address | `2001:1001::1` | 客户端侧接口的全局地址 |
| 服务器地址 / 服务器组 | `2001:1000::1` / 组 `1` | 中继转发目的地址 |
| PD IAID | `2` | 客户端请求前缀使用的 IAID |
| PD 前缀 / 长度 | `2003:100:700:7000::/64` | 服务器下发的 IA_PREFIX |
| PD 租期 | preferred 100s / valid 112s | 服务器下发的 IAPREFIX 租期 |
| 路由管理距离 / 度量 | 254 / 0 | 设备默认 `dhcpv6 relay pd route distance` |
| Remote-ID 选项 | 不启用 | 保证 Relay-Forward 负载可逐字节校验 |
| 邻居表项 | 静态 | 客户端与服务器均使用静态邻居，避免 NDP 学习影响报文时序 |
| MTU | 1500 | 报文长度小于 MTU，不触发分片 |

### 3.2 初始状态

- DUTA 的 `PortA` 与 `PortB` 处于二层默认态；VLAN、三层接口、IPv6 地址、静态邻居与 DHCPv6 配置均为空。
- DUTA 未启用 `service dhcpv6`，未配置 DHCPv6 服务器组，未启用 DHCPv6 Relay 与 PD 路由学习。
- `show dhcpv6 relay pd client` 中无历史 PD 客户端表项，`show ipv6 route` 中无 `2003:100:700:7000::/64`。
- StreamPort.A 与 StreamPort.B 已连接并可用，测试仪端口未发送其它 DHCPv6 报文。
- 现场保留：默认清理；需要保留现场时设置 `PRESERVE_SCENE=1` 并记录拓扑与配置。
- 需要预先存在的配置：无。

### 3.3 流量参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| 流量发送方式 | 测试仪 | 构造携带 IA_PD 的 Solicit 与携带 IAPREFIX 的 Relay-Reply |
| 发送 / 接收端口 | 发送 A、接收 B；发送 B、接收 A | 对应客户端侧与服务器侧 |
| 报文特征 | 客户端报文：UDP 546→547，目的 `ff02::1:2`；服务器报文：UDP 547→547，目的 `2001:1000::2` | 通过 IPv6、UDP 与 DHCPv6 负载匹配 |
| 发送模式 | 定量发送（STEP） | 每个方向发送 1 个报文 |
| 发送数量 / 时长 | 1 包 | 避免重传导致计数不确定 |
| 接收判定方式 | 抓包过滤 + DHCPv6 负载逐字节匹配 | 抓包在发送前启动，发送后停止并读取 |
| 丢包数 / 时延判据 | 每个方向匹配报文数 = 1 | 允许设备产生其它协议报文，但 DHCPv6 报文必须精确匹配 |
| 控制报文处理 | 使用 IPv6 目的地址、UDP 端口与 DHCPv6 负载匹配 | 避免将 DAD、RA、NS/NA 等控制报文计入 |

## 4. 测试步骤与预期结果

### 4.1 配置

DUTA：

```text
configure terminal
ipv6 enable
service dhcpv6 enable
dhcpv6 relay
dhcpv6 relay pd route
dhcpv6-server 1 2001:1000::1
interface <PortA>
no switchport
ipv6 address 2001:1001::1/64
dhcpv6-server 1
no shutdown
exit
interface <PortB>
no switchport
ipv6 address 2001:1000::2/64
no shutdown
exit
ipv6 neighbor 2001:1000::1 0000.0011.2244
ipv6 neighbor 2001:1001::100 0000.0011.2233
end
```

### 4.2 基线检查与执行顺序

| 顺序 | 动作 | 命令 / 触发方式 | 预期 |
| --- | --- | --- | --- |
| 1 | 配置生效 | `show services` | `dhcpv6` 状态为 `enable` |
| 2 | PD 路由学习配置检查 | `show running-config \| include dhcpv6` | 存在 `dhcpv6 relay pd route` |
| 3 | 中继接口检查 | `show dhcpv6 relay interfaces` | 服务状态为 `enabled`，客户端侧接口属于组 `1` |
| 4 | 清除统计与 PD 路由 | `clear dhcpv6 relay statistics`、`clear dhcpv6 relay pd route` | 命令执行成功，计数与历史 PD 路由清零 |
| 5 | 启动服务器侧抓包 | `startCapture(StreamPort.B)` | 抓包启动成功 |
| 6 | 客户端发送 IA_PD Solicit | `StreamPort.A` 发送 1 个携带 IA_PD 的 Solicit | 发送完成 |
| 7 | 服务器侧校验 | `StreamPort.B` 抓包匹配 Relay-Forward | 匹配报文数 = 1 |
| 8 | 启动客户端侧抓包 | `startCapture(StreamPort.A)` | 抓包启动成功 |
| 9 | 服务器发送 IA_PREFIX Relay-Reply | `StreamPort.B` 发送 1 个携带 IAPREFIX 的 Relay-Reply | 发送完成 |
| 10 | 客户端侧校验 | `StreamPort.A` 抓包匹配 Reply | 匹配报文数 = 1 |
| 11 | 等待 PD 客户端表 | `show dhcpv6 relay pd client` | 出现 `2003:100:700:7000::/64` 表项 |
| 12 | 校验 PD 客户端表 | `show dhcpv6 relay pd client` | 接口、DUID、客户端地址、IAID、前缀、租期与 `route status : success` 均匹配 |
| 13 | 校验学习路由 | `show ipv6 route` | 出现 `S Dr 2003:100:700:7000::/64 [254/0]`，下一跳为 `2001:1001::100`，出接口为客户端侧接口 |
| 14 | 中继统计校验 | `show dhcpv6 relay statistics` | 客户端与服务器中继计数均增加，错误计数为 0 |
| 15 | 清理 | 执行第 5 章清理命令 | 配置、PD 客户端表与路由恢复初始状态 |

### 4.3 触发与流量发送

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| PD 客户端请求 | StreamPort.A 发送 DHCPv6 Solicit：Ethernet 目的 `33:33:00:01:00:02`，IPv6 源 `2001:1001::100`、目的 `ff02::1:2`、Hop Limit 1，UDP 546→547，IA_PD IAID 为 `2` | DUTA 接收并生成 Relay-Forward |
| PD 服务器响应 | StreamPort.B 发送 DHCPv6 Relay-Reply：Ethernet 目的为 DUTA 路由 MAC，IPv6 源 `2001:1000::1`、目的 `2001:1000::2`，UDP 547→547，IAPREFIX 为 `2003:100:700:7000::/64` | DUTA 将 Reply 转发给客户端，并学习 PD 路由 |

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 删除接口中继配置 | `no dhcpv6-server` | 接口不再属于服务器组 |
| 删除服务器组 | `no dhcpv6-server 1` | 组 `1` 不存在 |
| 关闭 PD 路由学习 | `no dhcpv6 relay pd route` | 不再根据 IA_PD 学习客户端路由 |
| 清除 PD 路由 | `clear dhcpv6 relay pd route` | PD 客户端表与学习路由释放 |
| 关闭中继与 DHCPv6 服务 | `no dhcpv6 relay`、`service dhcpv6 disable` | DHCPv6 Relay 与 DHCPv6 服务关闭 |
| 恢复三层接口 | `no ipv6 address ...`、`switchport` | 接口恢复二层默认态 |
| 删除静态邻居 | `no ipv6 neighbor ...` | 静态邻居表项释放 |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议报文面 | StreamPort.B 抓包并解析 Relay-Forward | 目的地址为 `2001:1000::1`，UDP 547→547；负载包含 Interface-ID（option 18，值 1），option 9 中封装原始 IA_PD Solicit |
| 协议报文面 | StreamPort.A 抓包并解析 Reply | 目的地址为 `2001:1001::100`，UDP 547→546；负载包含 IA_PD 与 IAPREFIX `2003:100:700:7000::/64` |
| 表项面 | `show dhcpv6 relay pd client` | 接口为客户端侧接口，DUID 为 `00030001020000000011`，客户端地址为 `2001:1001::100`，IA ID 为 `0002`，IA Prefix 为 `2003:100:700:7000::/64`，prefered/max lifetime 为 `100/112`，`route status` 为 `success` |
| 转发 / 表项面 | `show ipv6 route` | 存在 `S Dr 2003:100:700:7000::/64 [254/0]`，下一跳为 `2001:1001::100`，出接口为客户端侧接口 |
| 计数 / 告警面 | `show dhcpv6 relay statistics` | `Client relayed packets` 与 `Server relayed packets` 均增加；`Client error packets` 与 `Server error packets` 均为 0 |
| 恢复 / 资源面 | 清理后执行 `show dhcpv6 relay pd client`、`show ipv6 route`、`show ipv6 neighbors` | 无 PD 客户端表项、无学习路由、无静态邻居残留 |

### 4.6 判定标准

- 步骤 1：`show services` 中 `dhcpv6` 状态 = `enable`。
- 步骤 2：`show running-config` 中存在 `dhcpv6 relay pd route`。
- 步骤 3：`show dhcpv6 relay interfaces` 中服务状态 = `enabled`，且客户端侧接口属于组 `1`。
- 步骤 7：StreamPort.B 匹配 Relay-Forward 的报文数 = 1，且 IPv6 目的地址、UDP 端口与 DHCPv6 负载全部匹配。
- 步骤 10：StreamPort.A 匹配 Reply 的报文数 = 1，且 IPv6 目的地址、UDP 端口与 DHCPv6 负载全部匹配。
- 步骤 11 至 12：`show dhcpv6 relay pd client` 中出现前缀 `2003:100:700:7000::/64`，且接口、DUID、客户端地址、IA ID、租期与 `route status : success` 全部匹配。
- 步骤 13：`show ipv6 route` 中存在 `S Dr 2003:100:700:7000::/64 [254/0]`，下一跳为 `2001:1001::100`，出接口为客户端侧接口。
- 步骤 14：`Client relayed packets` ≥ 1，`Server relayed packets` ≥ 1，`Client error packets` = 0，`Server error packets` = 0。
- 步骤 15：清理后无本用例残留配置、PD 客户端表、学习路由与静态邻居。
- 全部必检项满足且清理成功：结论为 `Pass`。
- 任一必检项不满足或清理失败：结论为 `Fail`。
- 环境、能力或测试仪不足：结论为 `Blocked`，记录缺失项。

## 5. 清理与恢复

```text
configure terminal
no ipv6 neighbor 2001:1000::1
no ipv6 neighbor 2001:1001::100
interface <PortA>
no dhcpv6-server
no ipv6 address 2001:1001::1/64
switchport
exit
interface <PortB>
no ipv6 address 2001:1000::2/64
switchport
exit
no dhcpv6-server 1
no dhcpv6 relay
no dhcpv6 relay pd route
service dhcpv6 disable
no ipv6 enable
end
clear dhcpv6 relay pd route
```

清理后检查：

```text
show running-config | include dhcpv6
show dhcpv6-server
show dhcpv6 relay interfaces
show dhcpv6 relay pd client
show ipv6 route
show ipv6 neighbors
```

预期：`show dhcpv6-server` 中无组 `1`，`show dhcpv6 relay interfaces` 中无客户端侧接口，`show dhcpv6 relay pd client` 中无 PD 客户端表项，`show ipv6 route` 中无 `2003:100:700:7000::/64`，`show ipv6 neighbors` 中无 `2001:1001::100` 与 `2001:1000::1` 的静态表项。

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 标准裁剪 | 设备不支持 `dhcpv6 relay pd route` 时，本条用例标记 `Blocked` |
| 2 | 已知差异 | 设备默认在 Relay-Forward 中附加 Interface-ID（option 18，值 1），脚本已按该行为构造期望负载；设备版本变化导致选项值不同时，应按实际抓包调整期望负载并记录差异 |
| 3 | 后端限制 | 当前 Renix HTTP 后端把 RAW payload 的 thrift STRING 按 UTF-8 下发，无法透传 `0x80` 以上字节。用例改用客户端侧全局地址与 ASCII 范围内的 PD 前缀，保证负载可下发；后端支持二进制 RAW 后可恢复链路本地地址 |
| 4 | 统计 / 抓包限制 | 抓包按 IPv6 目的地址、UDP 端口与 DHCPv6 负载匹配，DAD、RA、NS/NA 等控制报文不计入 |
| 5 | 已知问题 | 失败时记录设备型号、软件版本、`show dhcpv6 relay pd client`、`show ipv6 route` 回显与抓包文件 |
| 6 | 异常处理 | 用例失败时保存回显、抓包文件与日志，并记录失败步骤 |
| 7 | 清理要求 | 仅删除本用例实际配置的参数，并在关闭 PD 路由学习后执行 `clear dhcpv6 relay pd route` |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | `Pass` / `Fail` / `Blocked` |
| 实际观测 | 步骤 7：Relay-Forward 匹配数 = （预期 1）；步骤 10：Reply 匹配数 = （预期 1）；步骤 11 至 12：PD 前缀 = （预期 `2003:100:700:7000::/64`）；步骤 13：路由 = （预期 `S Dr` 且下一跳 `2001:1001::100`）；步骤 14：中继统计 = （预期客户端与服务器计数均 ≥ 1） |
| 证据 | 回显 / 抓包文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0020` | `Pass` / `Fail` / `Blocked` | | |
