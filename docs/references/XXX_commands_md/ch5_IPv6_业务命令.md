# 5 IPv6 业务命令

## 5.1 隧道命令

### 5.1.1 `interface`

**功能**：使用该命令来创建一个Tunnel 接口。
  使用该命令的no 形式删除该Tunnel 接口。

**语法**：

```
interface tunnel TUNNEL-ID
no interface tunnel TUNNEL-ID
```

| 参数 | 说明 |
| --- | --- |
| TUNNEL-ID | 隧道id 0-1023 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

如果要通过IPv4 网络来连接两个隔离的IPv6 网络，首先要创建Tunnel 接口。配置其
  他属性之后，此Tunnel 接口可用。使能IPv6 后就可以转发IPv6 报文。

**示例**：

```
下面的例子显示了如何创建一个Tunnel 接口:

Switch# configure terminal
Switch(config)# interface tunnel 1
```

**相关命令**：show interface tunnel

### 5.1.2 `tunnel mode`

**功能**：使用该命令配置隧道模式。
  使用该命令的no 形式恢复隧道模式默认值。

**语法**：

```
tunnel mode tunnel mode ( erspan ( ecmp-dst-gre | ) | gre | ipv6ip ) ( 6to4 | isatap | )
no tunnel mode
```

| 参数 | 说明 |
| --- | --- |
| 6to4 | 指定6to4 隧道模式，这种隧道地址一般带有 2002::/16 的前缀 |
| isatap | 指定ISATAP 隧道模式，这种隧道一般用于一个站点内，其地址格式一般为::5efe:A.B.C.D |
| gre | 当配置tunnel 的 destination 为一个的时候，对应的tunnel 模式 |
| ecmp-dst-gre | 当配置tunnel 的 destination 为多个的时候，对应的tunnel 模式 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

当没有指定”6to4”或”isatap”关键字的时候为手工隧道模式。 用户可以根据网络拓扑和
  应用来选择隧道模式。手动隧道为点到点模式，6to4 隧道和ISATAP 隧道为点到多点模
  式。在一个节点中，如果要创建多个自动模式隧道，那么他们的隧道源必须不一样。
  如果要从6to4 隧道切换为ISATAP 隧道，并且此时系统已经配置了6to4 中继的路由，
  则该切换不允许，必须先删除相关的6to4 中继路由。

**示例**：

```
下面的例子显示了如何配置隧道模式为6to4:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel mode ipv6ip 6to4
```

**相关命令**：tunnel source、tunnel destination

### 5.1.3 `tunnel source`

**功能**：使用该命令来配置隧道的源地址，使用该命令的no 形式删除隧道的源地址。

**语法**：

```
tunnel source ( IP_ADDR | IFNAME )
no tunnel source
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 指定隧道的源地址为IPv4 地址格式 IPv4 地址 |
| IFNAME | 指定隧道的源地址从接口 IPv4 地址中获得，如果接口上有多个地址，则只取主 IP 地址。 支持物理端口，聚合端口， 环回端口，VLAN 端口 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

每个隧道必须指定一个隧道源。如果隧道源是接口方式配置的，则从接口的主IP 地址
  中获取地址。

**示例**：

```
下面的例子显示了如何设置隧道源:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel source 3.3.3.3
```

**相关命令**：tunnel mode ipv6ip、tunnel destination

### 5.1.4 `tunnel destination`

**功能**：使用该命令来配置隧道的目的地址。
  使用该命令的no 形式删除隧道的目的地址。

**语法**：

```
tunnel destination IP_ADDR
no tunnel destination
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 指定tunnel 接口的目的 IPv4 地址 IPv4 地址 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

只有手工隧道才需要配置隧道目的地址。

**示例**：

```
下面的例子显示了如何配置隧道的目的地址:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel destination 4.4.4.4
```

**相关命令**：tunnel source、tunnel mode ipv6ip

### 5.1.5 `tunnel enable`

**功能**：使用该命令设置使能解封装隧道报文的接口。使用该命令的no 形式恢复默认设置。

**语法**：

```
tunnel ( enable | disable )
```

| 参数 | 说明 |
| --- | --- |
| enable | 使能隧道报文解封装 |
| disable | 去使能隧道报文解封装 |

**命令模式**：端口配置模式

**默认配置**：不会对收到的隧道报文解封装。

**使用说明**：

无

**示例**：

```
下面的例子显示了如何设置隧道报文解封装接口:

Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# tunnel enable
```

**相关命令**：interface

### 5.1.6 `tunnel ecmp-destination`

**功能**：使用该命令来配置隧道的ECMP 目的地址。
  使用该命令的no 形式删除隧道的目的地址。

**语法**：

```
tunnel ecmp-destination IP_ADDR
no tunnel ecmp-destination IP_ADDR
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 指定tunnel 接口的ECMP 目的IPv4 地址 IPv4 地址 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

只有手工隧道才需要配置隧道目的地址。

**示例**：

```
下面的例子显示了如何配置隧道的ECMP 目的地址:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel ecmp-destination 1.1.1.1
Switch(config-if)# tunnel ecmp-destination 2.2.2.2
```

**相关命令**：tunnel source、tunnel mode (ecmp-dst-gre | ) | gre)

### 5.1.7 `tunnel gre key`

**功能**：使用此命令配置Tunnel 的gre key。
  使用此命令的no 格式删除此配置。

**语法**：

```
tunnel gre key KEY_VALUE
no tunnel gre key
```

| 参数 | 说明 |
| --- | --- |
| KEY_VALUE | gre key 值 1-4294967295 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示了如何配置隧道的GRE key:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel gre key 100
```

**相关命令**：show running-config interface tunnel

### 5.1.8 `tunnel extend-header`

**功能**：使用此命令配置使用tunnel extend header 计算哈希值。
  使用此命令的no 格式删除此配置。

**语法**：

```
tunnel extend-header
no tunnel extend-header
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
使用tunnel 的extend header 做哈希实现目的端负载均衡:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel extend-header
Switch(config-if)# tunnel extend-header dst-load-balance
```

**相关命令**：show running-config interface tunnel

### 5.1.9 `tunnel extend-header id`

**功能**：使用此命令配置Tunnel 扩展头的ID 值。
  使用此命令的no 格式恢复默认配置。

**语法**：

```
tunnel extend-header id ID_VALUE
no tunnel extend-header id ID_VALUE
```

| 参数 | 说明 |
| --- | --- |
| ID_VALUE | Tunnel 扩展头的ID 值 1-1023 |

**命令模式**：端口配置模式

**使用说明**：

无

**示例**：

```
下面的例子将tunnel extern header 的值设为30:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel extend-header id 30
```

**相关命令**：show running-config interface tunne

### 5.1.10 `tunnel dscp`

**功能**：使用该命令设置外层IPv4 头的DSCP 值。
  使用该命令的no 形式恢复从内层IPv6 头获取DSCP 的方式。

**语法**：

```
tunnel dscp DSCP
no tunnel dscp
```

| 参数 | 说明 |
| --- | --- |
| DSCP | 设置外层IPv4 头的DSCP 值 0-63 |

**命令模式**：端口配置模式

**默认配置**：默认从内层IPv6 头获取DSCP 值。

**使用说明**：

无

**示例**：

```
下面的例子显示了如何设置外层IPv4 头的DSCP 值为40:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel dscp 40
```

**相关命令**：interface

### 5.1.11 `tunnel ttl`

**功能**：使用该命令设置外层IPv4 头的TTL 值。
  使用该命令的no 形式恢复.

**语法**：

```
tunnel ttl TTL
no tunnel TTL
```

| 参数 | 说明 |
| --- | --- |
| TTL | 设置外层IPv4 头的TTL 值 1-254 |

**命令模式**：端口配置模式

**默认配置**：默认254。

**使用说明**：

无

**示例**：

```
下面的例子显示了如何设置外层IPv4 头的TTL 值为254:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel ttl 254
```

**相关命令**：interface

### 5.1.12 `ipv6 mtu`

**功能**：使用该命令静态配置tunnel 接口上的MTU 值。
  使用该命令的no 形式恢复默认值。

**语法**：

```
ipv6 mtu MTU
no ipv6 mtu
```

| 参数 | 说明 |
| --- | --- |
| MTU | 设置tunnel 接口的MTU 值 1280-9500 |

**命令模式**：端口配置模式

**使用说明**：

系统不支持路径发现PMTU。该命令目前只能应用在tunnel 接口上。

**示例**：

```
下面的例子显示了如何将tunnel 接口的MTU 值设置为1280:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# ipv6 mtu 1280
```

**相关命令**：tunnel ttl

### 5.1.13 `show interface tunnel`

**功能**：使用该命令来显示tunnel 接口的信息。

**语法**：

```
show interface tunnel TUNNEL-ID
```

| 参数 | 说明 |
| --- | --- |
| TUNNEL-ID | 隧道id 0-1023 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了tunnel 接口的信息:
Switch# show interface tunnel1
Interface tunnel1
  Interface current state: UP
  Hardware is Tunnel
  Index 8193 , Metric 1 , Encapsulation TUNNEL
  VRF binding: not bound
  Tunnel protocol/transport IPv6/IP, Status Valid
  Tunnel source 1.1.1.1(eth-0-1), destination 2.2.2.2

  Tunnel DSCP inherit,  Tunnel TTL 64
  Tunnel transport MTU 1480 bytes
```

**相关命令**：show ipv6 interface tunnel

### 5.1.14 `show resource tunnel`

**功能**：使用该命令来显示tunnel 资源的使用信息。

**语法**：

```
show resource tunnel
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了tunnel 资源的使用信息:
Switch# show resource tunnel
Tunnel
Resource                         Used          Capability
=============================================================
Peers                            1             8
```

**相关命令**：无、、5.2 NDP 配置命令


## 5.2 NDP 配置命令

### 5.2.1 `ipv6 neighbor`

**功能**：使用该命令配置一条静态邻居。
  使用该命令的no 格式删掉静态邻居。

**语法**：

```
ipv6 neighbor ( vrf NAME | ) IPV6_ADDR MAC ( IFNAME | )
no ipv6 neighbor ( vrf NAME | ) IPV6_ADDR ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| vrf NAME | vrf 实例名不超过31 个字符的字符串 |
| IPV6_ADDR | IPv6 地址。格式为 |
| X:X::X:X | IPv6 地址 |
| MAC | MAC 地址。格式为 |
| HHHH.HHHH.HHHH | MAC 地址 |
| IFNAME | 接口名支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |

**命令模式**：全局配置模式

**默认配置**：默认情况下，系统没有任何静态邻居表项。

**使用说明**：

使用此命令配置静态邻居表项。如果ipv6 地址是一个链路本地地址，必须同时指定接
  口。
  此命令的的no 格式可以删除配置的静态邻居，对动态表项不起作用。

**示例**：

```
这个例子添加了一条静态邻居表项:

Switch# configure terminal
Switch(config)# ipv6 neighbor 2001::1 0000.0000.0001
Switch(config)# ipv6 neighbor vrf a fe80::1 0000.0000.0002 eth-0-1
```

**相关命令**：show ipv6 neighbors

### 5.2.2 `clear ipv6 neighbors`

**功能**：使用该命令清除动态邻居表项。

**语法**：

```
clear ipv6 neighbors ( vrf NAME | ) ( interface IFNAME | )
clear ipv6 neighbors ( vrf NAME | ) IPV6_ADDR ( interface IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| vrf NAME | vrf 实例名不超过31 个字符的字符串 |
| interface IFNAME | 清除指定接口的邻居表项支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |
| IPV6_ADDR | IPv6 地址。格式为 X:X::X:X。清除指定地址的邻居表项 IPv6 地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用此命令清除动态邻居表项。
  可以根据接口或地址来清除。
  如果地址是链路本地地址，必须同时指定出口。

**示例**：

```
这个例子清除了所有动态邻居表项:
Switch# clear ipv6 neighbors
```

**相关命令**：show ipv6 neighbors

### 5.2.3 `ipv6 hop-limit`

**功能**：使用该命令设置ipv6 报文的跳数限制。
  使用该命令的no 格式恢复默认设置。

**语法**：

```
ipv6 hop-limit HOP_LIMIT
no ipv6 hop-limit
```

| 参数 | 说明 |
| --- | --- |
| hop-limit HOP_LIMIT | 跳数值。 1-255 |

**命令模式**：全局配置模式

**默认配置**：默认值是64。

**使用说明**：

该配置影响所有本设备发出的IPv6 报文的跳数字段。
  除非上层应用（例如：OSPF）规定了报文的跳数。

**示例**：

```
这个例子配置了跳数限制:
Switch# configure terminal
Switch(config)# ipv6 hop-limit 255
```

**相关命令**：无

### 5.2.4 `ipv6 nd ra hop-limit`

**功能**：使用该命令设置RA 报文中的“Current hop limit”字段。
  使用该命令的no 格式恢复默认值。

**语法**：

```
ipv6 nd ra hop-limit HOP_LIMIT
no ipv6 nd ra hop-limit
```

| 参数 | 说明 |
| --- | --- |
| hop-limit HOP_LIMIT | 设置RA 报文的“Current hop limit”。 0-255 |

**命令模式**：端口配置模式

**默认配置**：默认值是0。

**使用说明**：

无

**示例**：

```
这个例子配置了RA 报文的Current hop limit 字段:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 nd ra hop-limit 255
```

**相关命令**：无

### 5.2.5 `ipv6 nd dad attempts`

**功能**：使用该命令配置重复地址探测（DAD）次数。
  使用该命令的no 格式恢复默认值。

**语法**：

```
ipv6 nd dad attempts DAD_ATTEMPTS
no ipv6 nd dad attempts
```

| 参数 | 说明 |
| --- | --- |
| DAD_ATTEMPTS | 设置探测次数。 0-600 |

**命令模式**：端口配置模式

**默认配置**：默认值是1。

**使用说明**：

使用该命令配置重复地址探测（DAD）次数。
  0 表示不探测。

**示例**：

```
这个例子配置了重复地址探测次数:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 nd dad attempts 3
```

**相关命令**：无

### 5.2.6 `ipv6 nd ns-interval`

**功能**：使用该命令配置NS 报文间隔。
  
  使用该命令的no 格式恢复默认值。

**语法**：

```
ipv6 nd ns-interval NS_INTERVAL
no ipv6 nd ns-interval
```

| 参数 | 说明 |
| --- | --- |
| NS_INTERVAL | 设置NS 报文的间隔。 1000-3600000 毫秒 |

**命令模式**：端口配置模式

**默认配置**：默认值是1000。

**使用说明**：

该配置影响重复地址检测和邻居发现过程中，NS 报文的间隔。

**示例**：

```
这个例子配置了NS 报文的间隔:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 nd ns-interval 2000
```

**相关命令**：无

### 5.2.7 `ipv6 nd ra suppress`

**功能**：使用该命令配置RA 抑制。
  使用该命令的no 格式取消抑制。

**语法**：

```
ipv6 nd ra suppress
no ipv6 nd ra suppress
```

**命令模式**：端口配置模式

**默认配置**：默认情况下RA 抑制是使能的。

**使用说明**：

使能RA 抑制的时候系统不会发送任何RA 报文。即使收到RS 也不会回复。

**示例**：

```
这个例子使能了RA 抑制:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 nd ra suppress
这个例子去使能了RA 抑制:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no ipv6 nd ra suppress
```

**相关命令**：ipv6 nd ra interval、ipv6 nd ra lifetime

### 5.2.8 `ipv6 nd ra mtu suppress`

**功能**：使用该命令配置RA 报文mtu option 抑制。
  使用该命令的no 格式取消抑制。

**语法**：

```
ipv6 nd ra mtu suppress
no ipv6 nd ra mtu suppress
```

**命令模式**：端口配置模式

**默认配置**：默认情况下RA 报文mtu option 不抑制。

**使用说明**：

使能RA 报文mtu 抑制的时候，RA 报文中不带mtu option。

**示例**：

```
这个例子使能了RA 报文MTU option 抑制:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 nd ra mtu suppress
这个例子去使能了RA 报文MTU option 抑制:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no ipv6 nd ra mtu suppress
```

**相关命令**：无

### 5.2.9 `ipv6 nd ra interval`

**功能**：使用该命令配置RA 报文间隔。
  使用该命令的no 格式恢复默认值。

**语法**：

```
ipv6 nd ra interval MAX ( MIN | )
no ipv6 nd ra interval
```

| 参数 | 说明 |
| --- | --- |
| MAX | 最大报文间隔。单位是秒。 4-1800 秒 |
| MIN | 最小报文间隔。单位是秒。 3-1350 秒 |

**命令模式**：端口配置模式

**默认配置**：默认情况下最大间隔是600 秒。最小间隔是最大间隔乘以0.33。

**使用说明**：

最大值的范围是4-1800 秒。
  最小值的范围是4-0.74*最大值
  最小值如果不配，当最大值大于等于9 的时候取0.33*最大值，小于9 的时候就取最大
  值。

**示例**：

```
这个例子配置了RA 报文的间隔:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 nd ra interval 300
```

**相关命令**：ipv6 nd ra suppress、ipv6 nd ra lifetime

### 5.2.10 `ipv6 nd ra lifetime`

**功能**：使用该命令配置RA 报文的life time。
  使用该命令的no 格式恢复默认值。

**语法**：

```
ipv6 nd ra lifetime LIFE_TIME
no ipv6 nd ra lifetime
```

| 参数 | 说明 |
| --- | --- |
| LIFE_TIME | 配置RA 报文的life time。 0-9000 秒。 |

**命令模式**：端口配置模式

**默认配置**：默认情况下，life time 是最大RA 报文间隔的三倍。

**使用说明**：

无

**示例**：

```
这个例子配置RA 报文的life time:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 nd ra lifetime 1000
```

**相关命令**：ipv6 nd ra suppress、ipv6 nd ra interval

### 5.2.11 `ipv6 nd reachable-time`

**功能**：使用该命令配置邻居处于reachable 状态的时间。
  使用该命令的no 格式恢复默认值。

**语法**：

```
ipv6 nd reachable-time REACHABLE_TIME
no ipv6 nd reachable-time
```

| 参数 | 说明 |
| --- | --- |
| REACHABLE_TIME | 配置邻居处于Reachable 的时间。 0-3600000 毫秒 |

**命令模式**：端口配置模式

**默认配置**：默认值是30000

**使用说明**：

配置0 表示使用默认值30000
  Reachable 时间到期以后，表项的状态将迁移到stale

**示例**：

```
这个例子配置了reachable 时间:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 nd reachable-time 3600000
```

**相关命令**：无

### 5.2.12 `ipv6 nd managed-config-flag`

**功能**：使用该命令配置报文的“Managed address configuration”标志位。
  使用该命令的no 格式恢复默认值。

**语法**：

```
ipv6 nd managed-config-flag
no ipv6 nd managed-config-flag
```

**命令模式**：端口配置模式

**默认配置**：默认情况“Managed address configuration”标记不置位。

**使用说明**：

无

**示例**：

```
这个例子配置了“Managed address configuration”标志:

Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 nd managed-config-flag
```

**相关命令**：ipv6 nd other-config-flag

### 5.2.13 `ipv6 nd other-config-flag`

**功能**：使用该命令配置报文的“Other address configuration”标志位。
  使用该命令的no 格式恢复默认值。

**语法**：

```
ipv6 nd other-config-flag
no ipv6 nd other-config-flag
```

**命令模式**：端口配置模式

**默认配置**：默认情况“Other address configuration”标记不置位。

**使用说明**：

无

**示例**：

```
这个例子配置了“Other address configuration”标志:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 nd other-config-flag
```

**相关命令**：ipv6 nd managed-config-flag

### 5.2.14 `ipv6 nd prefix`

**功能**：使用该命令配置RA 报文发布的前缀信息。
  使用该命令的no 格式删除前缀信息。

**语法**：

```
ipv6 nd prefix IPv6_PREFIX ( VALID_TIME | infinite ) ( PERFERRED_TIME | infinite ) ( { off-
link | no-autoconfig } | )
no ipv6 nd prefix IPv6_PREFIX
ipv6 nd prefix default ( VALID_TIME | infinite ) ( PERFERRED_TIME | infinite ) ( { off-link |
no-autoconfig } | )
no ipv6 nd prefix default
```

| 参数 | 说明 |
| --- | --- |
| IPv6_PREFIX | 设置IPv6 路由前缀。格式是X:X::X:X/M IPv6 地址和掩码长度 |
| VALID_TIME | 配置Valid lifetime。 0-4294967295 秒 |
| PERFERRED_TIME | 配置Preferred lifetime。 0-4294967295 秒 |

**命令模式**：端口配置模式

**默认配置**：valid life 的范围是0-4294967295。 Infinity 表示4294967295（0xFFFFFFFF） 默认值是2592000 秒（30 天）。 preferred life 的范围是0-4294967295。Infinity 表示4294967295（0xFFFFFFFF） 默认值是604800 秒（7 天）。

**使用说明**：

无

**示例**：

```
这个例子配置了一个前缀:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 nd prefix 2001::1/64 3000 3000
```

**相关命令**：show ipv6 interface IFNAME prefix

### 5.2.15 `show ipv6 interface IFNAME prefix`

**功能**：使用该命令显示指定接口上RA 报文发布的前缀信息。

**语法**：

```
show ipv6 interface IFNAME prefix
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 指定需要显示的接口名支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
显示结果如下:
Switch# show ipv6 interface eth-0-1 prefix
```

**相关命令**：ipv6 nd prefix

### 5.2.16 `show ipv6 neighbors`

**功能**：使用该命令显示邻居表项。

**语法**：

```
show ipv6 neighbors ( dynamic | static | interface IFNAME | IPV6_ADDR | statistics | )
```

| 参数 | 说明 |
| --- | --- |
| interface IFNAME | 指定需要显示的接口名支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |
| IPV6_ADDR | 指定需要显示的IPv6 地址。格式为X:X::X:X IPv6 地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

邻居表项可以全局显示。也可以根据接口或地址来显示。
  动态和静态表项可以分开显示、

**示例**：

```
显示结果如下:
Switch# show ipv6 neighbors
IPv6 address                            Age      Link-Layer Addr State Interface
2001::2                                     7        40f2.fd60.ac00  REACH eth-0-9
fe80::42f2:fdff:fe60:ac00               6        40f2.fd60.ac00  STALE eth-0-9
```

**相关命令**：ipv6 neighbor

### 5.2.17 `debug ipv6 nd`

**功能**：使用该命令打开ND 模块的调试信息。
  使用该命令的no 格式关闭调试信息。

**语法**：

```
debug ipv6 nd ( packet | events | error | dump | info | all )
no debug ipv6 nd ( packet | events | error | dump | info | all )
```

| 参数 | 说明 |
| --- | --- |
| packet | 调试IPv6 ND 的数据包信息 |
| events | 调试IPv6 ND 事件信息 |
| error | 调试IPv6 ND 错误信息 |
| dump | 以十六进制调试IPv6 ND 的数据包信息 |
| info | 调试IPv6 ND 提示信息 |
| all | 上面提到的所有调试信息 |

**命令模式**：特权模式

**默认配置**：默认调试信息不打开。

**使用说明**：

无

**示例**：

```
这个例子打开了ND 模块的调试信息:
Switch# debug ipv6 nd all
Switch# terminal monitor
```

**相关命令**：无、5.3 DHCPv6 Relay 命令


## 5.3 DHCPv6 Relay 命令

### 5.3.1 `dhcpv6 relay`

**功能**：在全局配置模式下，使用dhcpv6 relay 命令来启用DHCPv6 relay 服务。
  使用此命令的no 格式关闭该项功能。

**语法**：

```
dhcpv6 relay
no dhcpv6 relay
```

**命令模式**：全局配置模式

**默认配置**：默认情况下此功能未打开。

**使用说明**：

在启用DHCPv6 relay 服务前，必需先使用dhcpv6 service 命令使能DHCPv6 功能，
  DHCPv6 relay 功能要在系统使能DHCPv6 功能后才生效。

**示例**：

```
启用dhcpv6 relay 服务:
Switch# configure terminal
Switch(config)# dhcpv6 relay
```

**相关命令**：service dhcpv6

### 5.3.2 `dhcpv6-server (global)`

**功能**：在全局模式下使用dhcpv6-server 命令创建DHCPv6 服务器组。
  使用此命令的no 格式，删除一个DHCPv6 服务器组。

**语法**：

```
dhcpv6-server NUMBER IPV6_ADDR interface IFNAME
no dhcpv6-server NUMBER ( IPV6_ADDR ( interface IFNAME | ) | )
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | DHCP 服务器组的序号，范围为1 到16 1-16 |
| IPV6_ADDR | 加入服务器组中的DHCP 服务器的IP 地址列表。一个服务器组下DHCP 服务器个数的范围为1 到8 IPv6 地址 |
| IFNAME | 支持的端口名称支持物理端口，聚合端口， VLAN 端口 |

**命令模式**：全局配置模式

**默认配置**：默认情况下没有配置DHCPv6 服务器。

**使用说明**：

该命令用于配置远程DHCPv6 服务器。

**示例**：

```
配置DHCPv6 服务器组:
Switch# configure terminal
Switch(config)# dhcpv6-server 1 2001:1::1
Switch(config)# dhcpv6-server 1 fe80::1 interface vlan1
```

**相关命令**：service dhcpv6、、dhcpv6-server (interface)

### 5.3.3 `dhcpv6-server (interface)`

**功能**：在端口配置模式下，使用dhcpv6-server 命令将一个接口添加到一个DHCPv6 服务器组
  中去。
  使用此命令的no 格式，将这个接口从DHCPv6 服务器组中删除。

**语法**：

```
dhcpv6-server NUMBER
no dhcpv6-server
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | DHCPv6 服务器组的序号。 1-16 |

**命令模式**：端口配置模式

**默认配置**：默认情况下，接口没有加到任何DHCPv6 服务器组。

**使用说明**：

该命令用于在接口启用全局模式下配置的DHCPv6 服务器组。

**示例**：

```
在接口启用DHCPv6 服务器组1:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# dhcpv6-server 1
```

**相关命令**：service dhcpv6

### 5.3.4 `dhcpv6 relay remote-id option`

**功能**：在全局模式下，使用dhcpv6 relay remote-id optin 命令启用remote-id 选项。
  使用此命令的no 格式取消该选项的启用。

**语法**：

```
dhcpv6 relay remote-id option
no dhcpv6 relay remote-id option
```

**命令模式**：全局配置模式

**默认配置**：Remote-id 选项没有被启用。

**使用说明**：

无

**示例**：

```
配置DHCPv6 中继启用remote-id 选项:
Switch# configure terminal
Switch(config)# dhcpv6 relay remote-id option
```

**相关命令**：dhcpv6 relay remote-id format

### 5.3.5 `dhcpv6 relay remote-id format`

**功能**：在全局模式下，使用dhcpv6 relay remote-id format 命令，配置remote-id 的格式。使
  用此命令的no 格式恢复默认格式。

**语法**：

```
dhcpv6 relay remote-id format { vlan | ifname | duid }
no dhcpv6 relay remote-id format
```

| 参数 | 说明 |
| --- | --- |
| vlan |  |
| Vlan ID |  |
| ifname | 接收客户端报文的接口名称 - |
| duid | 中继的DUID |

**命令模式**：全局配置模式

**默认配置**：默认的格式为 “duid:ifname:”.

**使用说明**：

Remote-id 的格式可以是vlan id，接口名称，duid 三种关键字的组合，可以设置需要
  显示在remote-id 中的关键字。

**示例**：

```
配置remote-id 的格式:
Switch# configure terminal
Switch(config)# dhcpv6 relay remote-id format vlan
```

**相关命令**：dhcpv6 relay remote-id option

### 5.3.6 `dhcpv6 relay pd route`

**功能**：在全局模式下，使用dhcpv6 relay pd route 启用中继通过prefix-delegation 学习路由。
  使用此命令的no 格式关闭该功能。

**语法**：

```
dhcpv6 relay pd route
no dhcpv6 relay pd route
```

**命令模式**：全局配置模式

**默认配置**：默认情况下，中继不会学习路由。

**使用说明**：

DHCPv6 中继可以通过prefix-delegation 学习路由。这种路由不会影响手动配置的静态
  路由。

**示例**：

```
使能中继学习路由:
Switch# configure terminal
Switch(config)# dhcpv6 relay pd route
```

**相关命令**：clear dhcpv6 relay pd route、dhcpv6 relay pd route distance

### 5.3.7 `dhcpv6 relay pd route distance`

**功能**：在全局模式下，使用dhcpv6 relay pd route distance 命令配置中继学习到的路由的默认
  管理距离。使用此命令的no 格式恢复为默认配置。

**语法**：

```
dhcpv6 relay pd route distance DISTANCE
no dhcpv6 relay pd route distance
```

| 参数 | 说明 |
| --- | --- |
| DISTANCE | 中继学习到的路由的默认管理距离 1-255 |

**命令模式**：全局配置模式

**默认配置**：默认情况下，中继学习的路由的管理距离是254。

**使用说明**：

该命令配置DHCPv6 中继添加路由的管理距离。

**示例**：

```
配置DHCPv6 中继添加路由时使用的管理距离:
Switch# configure terminal
Switch(config)# dhcpv6 relay pd route distance 233
```

**相关命令**：dhcpv6 relay pd route

### 5.3.8 `service dhcpv6`

**功能**：在全局模式下，使用命令service dhcpv6 使能DHCP v6 中继代理功能。
  使用此命令的no 格式关闭DHCPv6 中继代理功能。

**语法**：

```
service dhcpv6 enable
service dhcpv6 disable
```

**命令模式**：全局配置模式

**默认配置**：默认情况下，未使能DHCPv6 功能。

**使用说明**：

只有在用service dhcpv6 命令总开关使能了DHCPv6 服务， DHCPv6 relay 等DHCPv6
  功能才会生效。

**示例**：

```
配置全局使能DHCPv6 功能:
Switch# configure terminal
Switch(config)# service dhcpv6 enable
```

**相关命令**：dhcpv6 relay

### 5.3.9 `debug dhcpv6 relay`

**功能**：使用此命令可以打开DHCPv6 relay 的模块的调试功能。
  在原命令之前加上关键字“no”，关闭调试功能。

**语法**：

```
debug dhcpv6 relay ( events | error | dump | packet | all )
no debug dhcpv6 relay ( events | error | dump | packet | all )
```

| 参数 | 说明 |
| --- | --- |
| events | 调试dhcpv6 relay 事件信息 |
| error | 调试dhcpv6 relay 错误信息 |
| packet | 调试dhcpv6 relay 的数据包信息 |
| dump | 以十六进制调试dhcpv6 relay 的数据包信息 |
| all | 上面提到的所有调试信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用“terminal monitor”打印消息

**示例**：

```
使用如下命令，打开dhcpv6 relay 的所有调试信息:

Switch# debug dhcpv6 relay all
```

**相关命令**：terminal monitor、show logging buffer

### 5.3.10 `show dhcpv6-server`

**功能**：在特权模式下，使用show dhcpv6-server 命令查看DHCPv6 服务器组的配置信息。

**语法**：

```
show dhcpv6-server
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于显示全局模式下使用dhcpv6-server 命令配置的所有DHCPv6 服务器组。

**示例**：

```
在特权模式下使用 show dhcpv6-server 命令:
Switch# show dhcpv6-server
DHCPv6 server group information:
============================================================
group 1 ipv6 address list:
[1] 2001:1::1
```

**相关命令**：dhcpv6-server (global)

### 5.3.11 `show dhcpv6 relay interfaces`

**功能**：在特权模式下，使用show dhcpv6 relay interfaces 命令显示DHCPv6 服务器组下的接
  口属性。

**语法**：

```
show dhcpv6 relay interfaces
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于显示属于DHCPv6 中继的接口信息。

**示例**：

```
在特权模式下使用show dhcpv6 relay interfaces 命令:
Switch# show dhcpv6 relay interfaces
List of DHCPv6 relay enabled interface(s):
DHCPv6 relay service status: enabled
Interface Name          DHCPv6 server group
============================================================
eth-0-1                   1
```

**相关命令**：show dhcpv6-server

### 5.3.12 `show dhcpv6 relay pd client`

**功能**：在特权模式下，使用show dhcpv6 relay pd client 命令显示DHCPv6 中继通过prefix-
  delegation 学到的路由信息。

**语法**：

```
show dhcpv6 relay pd client
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在特权模式下使用show dhcpv6 relay pd client 命令:
Switch# show dhcpv6 relay pd client
DHCPv6 prefix-delegation client information:
============================================================
Interface  : vlan2
Client DUID  : 0001000117e9357b606da182030
Client IPv6 address  : fe80::626d:a1ff:fe82:300
    IA ID  : a18230
        IA Prefix :  2002:2:10::/64
            prefered/max lifetime : 280/300
            expired time :  2012-09-17 11:43:59
============================================================
```

**相关命令**：dhcpv6 relay pd route、dhcpv6 relay pd route distance

### 5.3.13 `show dhcpv6 relay statistics`

**功能**：在特权模式下，使用show dhcpv6 relay statistics 命令显示交换机中继的DHCPv6 报文
  统计信息。

**语法**：

```
show dhcpv6 relay statistics
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于显示交换机处理的DHCPv6 统计的详情。

**示例**：

```
在特权模式下使用show dhcpv6 relay statistics 命令:
Switch# show dhcpv6 relay statistics
DHCPv6 relay packet statistics:
============================================================
Client relayed packets:  48
Server relayed packets:  48
Client error packets:    0
Server error packets:    0
```

**相关命令**：clear dhcpv6 relay statistics

### 5.3.14 `clear dhcpv6 relay statistics`

**功能**：在特权模式下，使用clear dhcpv6 relay statistics 命令清除交换机中继的DHCPv6 报文
  统计信息。

**语法**：

```
clear dhcpv6 relay statistics
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于清除交换机处理的DHCPv6 统计的详情。

**示例**：

```
在特权模式下使用clear dhcpv6 relay statistics 命令:
Switch# clear dhcpv6 relay statistics
```

**相关命令**：show dhcpv6 relay statistics

### 5.3.15 `clear dhcpv6 relay pd route`

**功能**：在特权模式下，使用clear dhcpv6 relay pd route 命令清除交换机中继学习到的路由。

**语法**：

```
clear dhcpv6 relay pd route ( prefix PREFIX | ) ( interface IFNAME | ) ( IPV6_ADDR | )
```

| 参数 | 说明 |
| --- | --- |
| PREFIX | DHCPv6 服务器分配给客户端的前缀 IPv6 地址和掩码长度，格式为 X:X::X:X/M |
| IPV6_ADDR | DHCPv6 客户端的IPv6 地址 IPv6 地址 |
| IFNAME | 支持的端口名称支持物理端口，聚合端口， VLAN 端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

若该命令不带参数，则删除所有DHCPv6 中继学到的路由。

**示例**：

```
在特权模式下使用clear dhcpv6 relay pd route 命令:
Switch# clear dhcpv6 relay pd route interface eth-0-1
```

**相关命令**：dhcpv6 relay pd route、show dhcpv6 relay pd client、、6 IP 路由命令、6.1 IP 单播路由命令

