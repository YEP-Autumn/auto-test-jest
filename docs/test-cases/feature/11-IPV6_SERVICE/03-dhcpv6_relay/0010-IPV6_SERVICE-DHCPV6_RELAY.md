# DHCPv6 中继支持客户端与服务器之间的双向报文转发

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本文的测试用例共用公共拓扑、预置条件与判定口径。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | DHCPv6 中继支持客户端与服务器之间的双向报文转发 | `0010-IPV6_SERVICE-DHCPV6_RELAY.test.ts` | P0 / 功能 | |

## 1. 基本信息

- 用例编号：`0010`
- 用例标题：DHCPv6 中继支持客户端与服务器之间的双向报文转发
- 所属特性 / 分组：`11-IPV6_SERVICE` / `DHCPv6 Relay配置`
- 级别 / 类型：P0 / 功能
- 执行方式：手工 / 自动化脚本
- 适用版本：支持 `service dhcpv6 enable` 与 `dhcpv6 relay` 命令的软件版本
- 预估耗时：约 5 分钟
- 关联：`test/feature/11-IPV6_SERVICE/03-dhcpv6_relay/`；设计模板见 [test-case-template.md](../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本用例验证的要求 |
| --- | --- | --- |
| RFC 8415 | 19.1.1 | 中继代理将客户端报文封装为 Relay-Forward，并填写 link-address 与 peer-address |
| RFC 8415 | 19.1.2 | 中继代理解析服务器返回的 Relay-Reply，并将 option 9 中的原始 Reply 转发给客户端 |
| RFC 8415 | 19.2 | 中继代理在客户端与服务器之间转发报文，并维护中继统计 |
| RFC 8200 | 4、8 | IPv6 报文的源地址、目的地址、下一报头与跳数限制处理 |
| RFC 4861 | 7 | 中继代理通过静态邻居表项向客户端与服务器发送单播报文 |
| 设备配置指导 11.3 | 11.3 | DHCPv6 Relay 的全局配置、服务器组配置与接口配置 |
| 设备命令参考 5.3 | 5.3 | `dhcpv6 relay`、`dhcpv6-server`、`show dhcpv6 relay statistics` 等命令 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备能力 / 版本 | 支持 DHCPv6 Relay | 确认 `service dhcpv6 enable` 与 `dhcpv6 relay` 命令可用 |
| License / 单板 | 无额外 License 要求 | 确认三层接口与 IPv6 转发能力可用 |
| 端口形态 | 2 个三层物理接口 | 分别作为客户端侧接口与服务器侧接口 |
| 规格 | 服务器组数量不少于 1 | 确认 DHCPv6 服务器组可创建 |
| 测试仪 / 抓包 | 支持 IPv6 报文发送、抓包与字段匹配 | 需构造 DHCPv6 单播与组播报文，并逐字节校验 UDP 负载 |
| 软件版本 | 接受本用例命令 | 不支持时标记 `Blocked` |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。

## 2. 组网与拓扑

```text
                            +------------------------------+
                            |             DUTA             |
  StreamPort.A <=> PortA ---| 2001:1001::1/64              |
  (DHCPv6 Client)           | dhcpv6-server 1              |
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
| 客户端地址 | `2001:1001::100` | 客户端侧接口同网段全局地址，作为 Relay-Forward 的 peer-address |
| 客户端 DUID | `00030001020000000011` | DUID-LL，硬件类型 1，MAC 为客户端 MAC |
| 事务 ID | `0x123456` | 客户端与服务器报文使用同一事务 ID |
| 中继 link-address | `2001:1001::1` | 客户端侧接口的全局地址 |
| 服务器地址 / 服务器组 | `2001:1000::1` / 组 `1` | 中继转发目的地址 |
| 客户端分配地址 | `2001:1001::1000/64` | 服务器在 Reply 中下发的地址 |
| 地址租期 | preferred 100s / valid 112s | 服务器在 Reply 中下发的租期 |
| Remote-ID 选项 | 不启用 | 保证 Relay-Forward 负载可逐字节校验 |
| 邻居表项 | 静态 | 客户端与服务器均使用静态邻居，避免 NDP 学习影响报文时序 |
| MTU | 1500 | 报文长度小于 MTU，不触发分片 |

### 3.2 初始状态

- DUTA 的 `PortA` 与 `PortB` 处于二层默认态；VLAN、三层接口、IPv6 地址、静态邻居与 DHCPv6 配置均为空。
- DUTA 未启用 `service dhcpv6`，未配置 DHCPv6 服务器组，未启用 DHCPv6 Relay。
- StreamPort.A 与 StreamPort.B 已连接并可用，测试仪端口未发送其它 DHCPv6 报文。
- 现场保留：默认清理；需要保留现场时设置 `PRESERVE_SCENE=1` 并记录拓扑与配置。
- 需要预先存在的配置：无。

### 3.3 流量参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| 流量发送方式 | 测试仪 | 构造 DHCPv6 Solicit 与 Relay-Reply |
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
| 2 | 服务器组检查 | `show dhcpv6-server` | 组 `1` 包含 `2001:1000::1` |
| 3 | 中继接口检查 | `show dhcpv6 relay interfaces` | 服务状态为 `enabled`，客户端侧接口属于组 `1` |
| 4 | 清除统计 | `clear dhcpv6 relay statistics` | 命令执行成功，计数清零 |
| 5 | 启动服务器侧抓包 | `startCapture(StreamPort.B)` | 抓包启动成功 |
| 6 | 客户端发送 Solicit | `StreamPort.A` 发送 1 个 Solicit | 发送完成 |
| 7 | 服务器侧校验 | `StreamPort.B` 抓包匹配 Relay-Forward | 匹配报文数 = 1 |
| 8 | 启动客户端侧抓包 | `startCapture(StreamPort.A)` | 抓包启动成功 |
| 9 | 服务器发送 Relay-Reply | `StreamPort.B` 发送 1 个 Relay-Reply | 发送完成 |
| 10 | 客户端侧校验 | `StreamPort.A` 抓包匹配 Reply | 匹配报文数 = 1 |
| 11 | 中继统计校验 | `show dhcpv6 relay statistics` | 客户端与服务器中继计数均增加，错误计数为 0 |
| 12 | 清理 | 执行第 5 章清理命令 | 配置与表项恢复初始状态 |

### 4.3 触发与流量发送

| 触发 | 操作 | 预期 |
| --- | --- | --- |
| 客户端请求 | StreamPort.A 发送 DHCPv6 Solicit：Ethernet 目的 `33:33:00:01:00:02`，IPv6 源 `2001:1001::100`、目的 `ff02::1:2`、Hop Limit 1，UDP 546→547 | DUTA 接收并生成 Relay-Forward |
| 服务器响应 | StreamPort.B 发送 DHCPv6 Relay-Reply：Ethernet 目的为 DUTA 路由 MAC，IPv6 源 `2001:1000::1`、目的 `2001:1000::2`，UDP 547→547 | DUTA 解封装并将 Reply 转发给客户端 |

### 4.4 恢复

| 恢复动作 | 命令 | 预期 |
| --- | --- | --- |
| 删除接口中继配置 | `no dhcpv6-server` | 接口不再属于服务器组 |
| 删除服务器组 | `no dhcpv6-server 1` | 组 `1` 不存在 |
| 关闭中继与 DHCPv6 服务 | `no dhcpv6 relay`、`service dhcpv6 disable` | DHCPv6 Relay 与 DHCPv6 服务关闭 |
| 恢复三层接口 | `no ipv6 address ...`、`switchport` | 接口恢复二层默认态 |
| 删除静态邻居 | `no ipv6 neighbor ...` | 静态邻居表项释放 |

### 4.5 观测面

| 观测面 | 命令 / 方法 | 判定 |
| --- | --- | --- |
| 协议报文面 | StreamPort.B 抓包并解析 Relay-Forward | 目的地址为 `2001:1000::1`，UDP 547→547；负载为 `0x0c`，hop-count 为 0，link-address 为 `2001:1001::1`，peer-address 为 `2001:1001::100`，包含 Interface-ID（option 18，值 1），option 9 内容与 Solicit 完全一致 |
| 协议报文面 | StreamPort.A 抓包并解析 Reply | 目的地址为 `2001:1001::100`，UDP 547→546；负载为 `0x07`，事务 ID 为 `0x123456`，包含客户端 DUID、IA_NA 与 IAADDR `2001:1001::1000`（preferred 100s / valid 112s） |
| 协议状态面 | `show dhcpv6 relay interfaces` | 中继服务状态为 `enabled`，客户端侧接口属于服务器组 `1` |
| 表项面 | `show dhcpv6-server` | 组 `1` 包含服务器地址 `2001:1000::1` |
| 计数 / 告警面 | `show dhcpv6 relay statistics` | `Client relayed packets` 与 `Server relayed packets` 均增加；`Client error packets` 与 `Server error packets` 均为 0 |
| 恢复 / 资源面 | 清理后执行 `show running-config` 与 `show ipv6 neighbors` | 无本用例残留配置与静态邻居 |

### 4.6 判定标准

- 步骤 1：`show services` 中 `dhcpv6` 状态 = `enable`。
- 步骤 2：`show dhcpv6-server` 中组 `1` 包含 `2001:1000::1`。
- 步骤 3：`show dhcpv6 relay interfaces` 中服务状态 = `enabled`，且客户端侧接口属于组 `1`。
- 步骤 7：StreamPort.B 匹配 Relay-Forward 的报文数 = 1，且 IPv6 目的地址、UDP 端口与 DHCPv6 负载全部匹配。
- 步骤 10：StreamPort.A 匹配 Reply 的报文数 = 1，且 IPv6 目的地址、UDP 端口与 DHCPv6 负载全部匹配。
- 步骤 11：`Client relayed packets` ≥ 1，`Server relayed packets` ≥ 1，`Client error packets` = 0，`Server error packets` = 0。
- 步骤 12：清理后无本用例残留配置、静态邻居与服务器组。
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
service dhcpv6 disable
no ipv6 enable
end
```

清理后检查：

```text
show running-config | include dhcpv6
show dhcpv6-server
show dhcpv6 relay interfaces
show ipv6 neighbors
```

预期：`show dhcpv6-server` 中无组 `1`，`show dhcpv6 relay interfaces` 中无客户端侧接口，`show ipv6 neighbors` 中无 `2001:1001::100` 与 `2001:1000::1` 的静态表项。

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 标准裁剪 | 设备不支持 Remote-ID 时，本用例仍可执行；PD 路由学习由用例 `0020` 覆盖 |
| 2 | 已知差异 | 设备默认在 Relay-Forward 中附加 Interface-ID（option 18，值 1），脚本已按该行为构造期望负载；设备版本变化导致选项值不同时，应按实际抓包调整期望负载并记录差异 |
| 3 | 后端限制 | 当前 Renix HTTP 后端把 RAW payload 的 thrift STRING 按 UTF-8 下发，无法透传 `0x80` 以上字节。用例改用客户端侧全局地址，使 DHCPv6 负载全部位于 ASCII 范围；后端支持二进制 RAW 后可恢复链路本地地址 |
| 4 | 统计 / 抓包限制 | 抓包按 IPv6 目的地址、UDP 端口与 DHCPv6 负载匹配，DAD、RA、NS/NA 等控制报文不计入 |
| 5 | 已知问题 | 失败时记录设备型号、软件版本、`show dhcpv6 relay statistics` 回显与抓包文件 |
| 6 | 异常处理 | 用例失败时保存回显、抓包文件与日志，并记录失败步骤 |
| 7 | 清理要求 | 仅删除本用例实际配置的参数，避免对未配置对象执行 `no` 命令 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | `Pass` / `Fail` / `Blocked` |
| 实际观测 | 步骤 7：Relay-Forward 匹配数 = （预期 1）；步骤 10：Reply 匹配数 = （预期 1）；步骤 11：中继统计 = （预期客户端与服务器计数均 ≥ 1） |
| 证据 | 回显 / 抓包文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果（与用例编号一一对应）：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| `0010` | `Pass` / `Fail` / `Blocked` | | |
