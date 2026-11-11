# 6 IP 路由命令

## 6.1 IP 单播路由命令

### 6.1.1 `ip address`

**功能**：在接口模式下使用 ip address 命令，来设定接口的主IP 或者从IP 地址。使用相应的
  no 命令来移除这个IP 地址。

**语法**：

```
ip address ( ADDRESS WILDCARD-MASK | ADDRESS /PREFIX-LENGTH ) ( secondary | )
```

| 参数 | 说明 |
| --- | --- |
| ADDRESS | 接口IPv4 地址 IPv4 地址 |
| WILDCARD-MASK | 子网掩码 IPv4 地址格式的掩码 |
| PREFIX-LENGTH | 掩码长度 1-32 |
| secondary | (可选)指定这个IP 地址是从IP 地址，没有这个关键词的话就是主IP 地址 |

**命令模式**：端口配置模式

**默认配置**：接口上默认不配置IP 地址。

**使用说明**：

一个接口上可以有一个主IP 地址和多个从IP 地址。交换机产生的报文使用主IP 地址。
  因此，在同一网段的所有的交换机和接入服务器共享同一个网络号。
  
  主机可以使用ICMP 请求消息来决定其子网掩码。交换机会用ICMP 子网应答消息来回
  复这个请求。
  你可以使用no ip address 命令删除接口的IP 地址，从而禁用该端口上的IP 路由功能。
  如果系统检测到另外一个主机正在使用这个IP 地址，系统将会在控制台上输出错误消
  息。
  Secondary 这个关键字允许用户配置最多15 个从IP 地址。从IP 地址跟主IP 地址差不
  多，除非系统从来没有生成过使用从IP 地址以外的路由更新报文。在接口上发布IP 路
  由表的时候，IP 广播和ARP 请求将会被适当的进行处理。
  从IP 地址在很多情况下被使用， 下面是一些比较常用的应用场景：
  在一个特定的网段中，可能没有足够的主机地址。例如，你的每个逻辑子网只允许
  254 个主机，但是你在一个物理子网中需要300 个主机地址。使用从IP 地址就允许你
  在交换机或者接入服务器中，在一个物理子网内建立两个逻辑子网。
  许多比较古老的网络是建立在2 层桥接的基础上的。合理的使用从IP 地址可以有效的
  对一个基于路由的子网的传输起到帮助作用，在一个老的桥接网段中的交换机可以很
  容易的了解到在这个网段中的许多子网。
  在同一个网络的两个子网可能被另外一个网络所分割。但如果启用了子网的话，这种
  情况是不允许的。第一个网络会被延伸，或使用从IP 地址在第二个网络上分层。

**示例**：

```
下面的例子中，10.108.1.27 是主IP 地址，192.31.7.17 和192.31.8.17 是从IP 地址:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ip address 10.108.1.27 255.255.255.0
Switch(config-if)# ip address 192.31.7.17/24 secondary
Switch(config-if)# ip address 192.31.8.17 255.255.255.0 secondary
```

**相关命令**：无

### 6.1.2 `ip unnumbered`

**功能**：在接口模式下使用 ip unnumbered 命令，来借用其他接口的主地址。使用相应的no
  命令来移除这个IP 地址。

**语法**：

```
ip unnumbered IFNAME
no ip unnumbered
```

| 参数 | 说明 |
| --- | --- |
| IFAME | 被借用接口 |

**命令模式**：端口配置模式

**默认配置**：接口上默认不借用IP 地址。

**使用说明**：

无

**示例**：

```
下面的例子中，eth-0-1 借用了eth-0-2 的地址:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ip unnumbered eth-0-2
```

**相关命令**：无

### 6.1.3 `ip icmp error-interval`

**功能**：在全局模式使用ip icmp error-interval 命令来设定交换机产生ICMP 错误消息的间隔时
  间，使用相应的no 命令来返回默认值。

**语法**：

```
ip icmp error-interval INTERVAL
no ip icmp error-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 交换机产生ICMP 错误消息的间隔时间范围0-2147483647 毫秒 |

**命令模式**：全局配置模式

**默认配置**：默认1000 毫秒。

**使用说明**：

无

**示例**：

```
下面的例子中，用户设定了时间间隔为10 秒，这意味着每10 秒才会生成一个ICMP
错误消息:
Switch# configure terminal
Switch(config)# ip icmp error-interval 10000
```

**相关命令**：ip redirects、ip unreachables

### 6.1.4 `ip redirects`

**功能**：在接口模式下，使用ip redirects 命令，来启用交换机发送ICMP 重定向报文的功能。
  使用相应的no 命令让系统禁止发送。

**语法**：

```
ip redirects
no ip redirects
```

**命令模式**：端口配置模式

**默认配置**：默认IP 重定向是开启的。

**使用说明**：

无

**示例**：

```
下面的例子中，用户关闭了ICMP 重定向报文的发送:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip address 10.10.10.1/24
Switch(config-if)# no ip redirects
```

**相关命令**：ip unreachables、ip icmp error-interval

### 6.1.5 `ip unreachables`

**功能**：在接口模式下，使用ip unreachable 命令，来启用交换机发送ICMP 不可达报文的功能。
  使用相应的no 命令让系统禁止发送。

**语法**：

```
ip unreachables
no ip unreachables
```

**命令模式**：端口配置模式

**默认配置**：默认IP 不可达是开启的。

**使用说明**：

无

**示例**：

```
下面的例子中，用户关闭了ICMP 不可达报文的发送:

Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip address 10.10.10.1/24
Switch(config-if)# no ip unreachables
```

**相关命令**：ip redirects、ip icmp error-interval

### 6.1.6 `ip verify unicast reverse-path`

**功能**：接口模式下，使用ip verify unicast reverse-path 来启用URPF 检测功能，使用相应的
  no 命令返回默认值。

**语法**：

```
ip verify unicast reverse-path
no ip verify unicast reverse-path
```

**命令模式**：端口配置模式

**默认配置**：URPF 检测功能默认关闭。

**使用说明**：

无

**示例**：

```
下面的例子中，用户在eth-0-1 上启用了URPF 检测:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip address 10.10.10.1/24
Switch(config-if)# ip verify unicast reverse-path
```

**相关命令**：ip redirects、、ip icmp error-interval

### 6.1.7 `unicast reverse-path check-type (strict| loose (allow-default-route|))`

**功能**：接口模式下，使用该命令来配置URPF 检测的模式，使用相应的no 命令返回默认值。

**语法**：

```
unicast reverse-path check-type ( strict | loose ( allow-default-route | ) )
no unicast reverse-path check-type
```

**命令模式**：端口配置模式

**默认配置**：URPF 检测默认严格模式。

**使用说明**：

URPF 检测模式同时对ipv4 和ipv6 生效。

**示例**：

```
下面的例子中，用户在eth-0-1 上配置了URPF 检测模式为松散模式:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config)# unicast reverse-path check-type loose
```

**相关命令**：无

### 6.1.8 `router-id (global)`

**功能**：在全局模式下，使用router-id 命令，针对所有的路由协议，来使用一个固定的Router
  ID。使用相应的no 命令让交换机自动选择Router ID。

**语法**：

```
router-id IP-ADDRESS
no router-id
```

| 参数 | 说明 |
| --- | --- |
| IP-ADDRESS | 使用IP 地址格式的Router |
| ID | IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：Route ID 默认不定义。

**使用说明**：

每个交换机上，Router ID 的IP 地址格式是任意的，但是Router ID 必须要保证唯一。

**示例**：

```
下面的例子描述了如何指定一个Router ID:
Switch# configure terminal
Switch(config)# router-id 1.1.1.1
```

**相关命令**：router-id (router)

### 6.1.9 `ip route`

**功能**：在全局模式下，使用ip route 命令来建立静态路由，使用相应的no 命令来删除这个静
  态路由。

**语法**：

```
ip route ( PREFIX MASK | PREFIX/PREFIX-LENGTH ) ( NH-ADDRESS | vrf VRF-NAME NH-
ADDRESS | IFNAME | REMOTE-VTEP ) ( DISTANCE | ) ( bind bfd BFD-NAME | track
NUMBER | )
no ip route ( PREFIX MASK | PREFIX/PREFIX-LENGTH ) ( ( vrf VRF-NAME | ) NH-
ADDRESS | IFNULL | ) ( bind bfd | track | )

no ip route ( PREFIX MASK | PREFIX/PREFIX-LENGTH ) ( IFTUNNEL | REMOTE-VTEP )
```

| 参数 | 说明 |
| --- | --- |
| VRF-NAME | VRF 实例名长度不超过31 的字符串 |
| PREFIX | 目的地址 IPv4 地址 |
| MASK | 目的地址的子网掩码 IPv4 地址格式的掩码 |
| PREFIX-LENGTH | 子网前缀长度 1-32 |
| NH-ADDRESS | 下一跳的IP 地址 IPv4 地址 |
| IFNAME | 转发报文的接口 |
| IFTUNNEL | tunnel 口 |
| IFNULL | NULL0 口 |
| REMOTE-VTEP | overlay 隧道类型的下一跳 remote-vtep 的index |
| DISTANCE | (可选)管理距离，静态路由默认是1 1-255 |
| BFD-NAME | 指定bfd 名称长度不超过16 的字符串 |
| track NUMBER | 指定track ID 1-500 |

**命令模式**：全局配置模式

**默认配置**：静态路由默认不建立。

**使用说明**：

交换机无法动态的和目的地址建立路由时，使用静态路由是个不错的选择。

**示例**：

```
下面的例子中配置了一条静态路由:
Switch# configure terminal
Switch(config)# ip route 172.31.0.0 255.255.0.0 172.31.6.6
下面的例子中配置了一条静态黑洞路由:
Switch# configure terminal
Switch(config)# ip route 10.1.1.1/32 null 0
```

**相关命令**：show ip route

### 6.1.10 `show ip route`

**功能**：在特权模式下，使用show ip route 显示当前的路由表状态。

**语法**：

```
show ip route ( VRF NAME | ) ( IP-ADDRESS | PREFIX/PREFIX-LENGTH | PROTOCOL | )
```

| 参数 | 说明 |
| --- | --- |
| VRF NAME | VRF 实例名长度不超过31 的字符串 |
| IP-ADDRESS | (可选)选择显示哪个IP 地址的路由 IPv4 地址 |
| PREFIX | IP 路由前缀 IPv4 地址 |
| PREFIX-LENGTH | 路由前缀长度 1-32 |
| PROTOCOL | (可选) 路由协议名，或者关键字connected，static， 或者summary。如果你指定了一个路由协议，使用其中的一个关键字：bgp， ospf，或者rip |
| bgp/connected/isis/ospf/rip |  |
| /static |  |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

在路由被加入路由表后，你可以用show ip route，show ip route static 命令显示任何有
  效的动态和静态路由。

**示例**：

```
下面的例子显示了了show ip route 命令的输出结果:

Switch# show ip route
Codes: K - kernel, C - connected, S - static, R - RIP, B - BGP
       O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       [*] - [AD/Metric]
       * - candidate default
O       1.1.1.0/24 [110/2] via 10.10.1.1, eth-0-23, 00:34:17
O       2.2.2.0/24 [110/3] via 10.10.1.1, eth-0-23, 00:17:26
C       10.10.1.0/24 is directly connected, eth-0-23
C       10.10.1.23/32 is in local loopback, eth-0-23
O       10.10.2.0/24 [110/2] via 10.10.1.1, eth-0-23, 00:17:26
O       10.10.3.0/24 [110/3] via 10.10.1.1, eth-0-23, 00:17:26
```

**相关命令**：ip route、show ip route database

### 6.1.11 `show ip route database`

**功能**：在特权模式下，使用show ip route database 命令来显示路由信息表(RIB)。

**语法**：

```
show ip route database ( VRF NAME | ) ( PROTOCOL | )
```

| 参数 | 说明 |
| --- | --- |
| VRF NAME | VRF 实例名长度不超过31 的字符串 |
| PROTOCOL | (可选)路由协议名，或者关键字connected，static。 如果你指定了一个路由协议的话，使用这些关键字中的一个：bgp，ospf 和rip |
| bgp/connected/isis/ospf/rip |  |
| /static |  |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

在路由加入路由信息表(RIB)以后，你可以使用show ip route database，show ip route
  database static 命令来显示所有的路由。

**示例**：

```
下面的例子显示了使用show ip route database 命令的输出结果:
Switch# show ip route database
Codes: K - kernel, C - connected, S - static, R - RIP, B - BGP
       O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       [*] - [AD/Metric]
       > - selected route, * - FIB route, p - stale info
O    *> 1.1.1.0/24 [110/2] via 10.10.1.1, eth-0-23, 00:48:58
O    *> 2.2.2.0/24 [110/3] via 10.10.1.1, eth-0-23, 00:32:07
S        6.6.6.0/24 [1/0] via 3.3.3.3 inactive
C    *> 10.10.1.0/24 is directly connected, eth-0-23
C    *> 10.10.1.23/32 is in local loopback, eth-0-23
O    *> 10.10.2.0/24 [110/2] via 10.10.1.1, eth-0-23, 00:32:07
O    *> 10.10.3.0/24 [110/3] via 10.10.1.1, eth-0-23, 00:32:07
```

**相关命令**：ip route、show ip route

### 6.1.12 `show ip protocols`

**功能**：在特权模式下，使用show ip protocols 命令来显示当前处于活动状态的路由协议及其
  参数。

**语法**：

```
show ip protocols ( vrf NAME | ) ( PROTOCOL | )
```

| 参数 | 说明 |
| --- | --- |
| VRF NAME | VRF 实例名长度不超过31 的字符串 |
| PROTOCOL | (可选)路由协议名。如果你指定了一个路由协议的话， 使用这些关键字中的一个： bgp，ospf，isis 和rip |
| bgp/ospf/rip/isis |  |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

在调试路由问题的时候，show ip protocols 命令所显示的信息是很有用的。show ip
  protocols 输出的信息可以帮助你识别一个交换机是否传输了错误的路由信息。

**示例**：

```
下面是使用show ip protocols 命令的例子:
Switch# show ip protocols
Routing Protocol is "ospf 0"
  Redistributing:
  Routing for Networks:
    3.3.3.0/24
    10.10.1.0/24
    10.10.4.0/24
  Distance: (default is 110)
```

**相关命令**：show ip route

### 6.1.13 `show ip route summary`

**功能**：在特权模式下，用命令show ip route summary 来显示各种类型路由的汇总信息。

**语法**：

```
show ip route ( vrf NAME | ) summary
```

| 参数 | 说明 |
| --- | --- |
| VRF NAME | VRF 实例名长度不超过31 的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了使用命令show ip route summary 的输出结果:
Switch# show ip route summary
IP routing table name is Default-IP-Routing-Table(0)
IP routing table maximum-paths is 8
Route source    networks
connected       2
static           1
Total           3
```

**相关命令**：show ip route

### 6.1.14 `show ip route add-fib-fail`

**功能**：在特权模式下，使用show ip route add-fib-fail 命令，来显示由于硬件资源限制而无法
  进入FIB 表的路由。

**语法**：

```
show ip route add-fib-fail ( count | )
```

| 参数 | 说明 |
| --- | --- |
| count | 下fib 表失败的路由条目数 - |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

如果用命令行show ip route 可以看到该路由，而用命令行show ip route add-fib-fail
  也能看到该路由，说明该路由由于硬件资源限制无法进入路由转发表(FIB)，该路由将
  不能转发报文。您可以等到硬件资源空闲的时候，删除该路由然后重新配置，此时该
  路由可以重新转发报文。

**示例**：

```
下面是使用show ip route add-fib-fail 命令的一个例子:
Switch# show ip route add-fib-fail
======================================
VRF                 Route
default             1.1.1.1/32
default             1.1.1.0/24
test                2.2.2.2/32
test                2.2.2.0/24
```

**相关命令**：show ip route

### 6.1.15 `max-static-routes`

**功能**：在全局模式下使用命令max-static-routes 来配置系统最大可配置的静态路由条目数，
  使用该命令的no 形式恢复系统的静态路由配置数目默认值。

**语法**：

```
max-static-routes COUNT
no max-static-routes COUNT
```

| 参数 | 说明 |
| --- | --- |
| COUNT | 统最大可配置的静态路由条目数范围是1～65535，默认值 1024 条 |

**命令模式**：全局配置模式

**使用说明**：

用户可配置的最大静态路由条目不得小于当前已配置的静态路由条目数，不得大于系
  统的路由规格。

**示例**：

```
下面的例子显示了如何将系统的可配最大静态路由条目数改为10:
Switch# confi terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# max-static-routes 10
```

**相关命令**：show ip route summary

### 6.1.16 `show resource fib`

**功能**：使用该命令显示系统中路由占用的硬件资源统计。

**语法**：

```
show resource fib
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了使用命令show resource fib 后的结果:
Switch# show resource fib
RIBFIB
Resource                         Used          Capability
=============================================================
Indirect Routes                  3             8192
Host Routes                      1             4096
Static Routes                    0             1024

IPv6 Indirect routes             0             1536
IPv6 Host routes                 0             4096
IPv6 Static routes               0             1024
L3 Vlan interfaces               0             256
```

**相关命令**：show ip route summary

### 6.1.17 `ecmp load-balance-mode dynamic`

**功能**：使用该命令设置ECMP 的动态负载均衡模式。

**语法**：

```
ecmp load-balance-mode dynamic
no ecmp load-balance-mode dynamic
```

**命令模式**：全局配置模式

**默认配置**：静态负载

**使用说明**：

配置或取消ecmp 动态负载均衡模式时交换机路由信息必须为空。

**示例**：

```
下面的例子显示了如何配置ecmp 负载均衡模式为动态负载:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# ecmp load-balance-mode dynamic
```

**相关命令**：无

### 6.1.18 `ecmp load-balance-mode dynamic (efd-only|tcp-only)`

**功能**：使用该命令设置只对tcp 流或者只对efd 流做ECMP 的动态负载。

**语法**：

```
ecmp load-balance-mode dynamic ( efd-only | tcp-only )
no ecmp load-balance-mode dynamic
```

**命令模式**：全局配置模式

**默认配置**：可以对所有的流做ecmp 的动态负载

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置只对tcp 流做ecmp 的动态负载:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# ecmp load-balance-mode dynamic tcp-only
```

**相关命令**：无

### 6.1.19 `ecmp load-balance-mode static`

**功能**：使用该命令设置ECMP 的静态hash 负载均衡模式。

**语法**：

```
ecmp load-balance-mode static
```

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

配置该模式时交换机路由信息必须为空。

**示例**：

```
下面的例子显示了如何配置ecmp 负载均衡模式为静态负载:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# ecmp load-balance-mode static
```

**相关命令**：无

### 6.1.20 `ecmp load-balance-mode static self-healing`

**功能**：使用该命令设置ECMP 的self-healing 负载均衡模式。

**语法**：

```
ecmp load-balance-mode static self-healing
no ecmp load-balance-mode static self-healing
```

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置ecmp 负载均衡模式为self-healing 负载:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# ecmp load-balance-mode static self-healing
```

**相关命令**：无

### 6.1.21 `ecmp load-balance-mode round-robin`

**功能**：使用这个命令来设置对哪些前缀的路由做ECMP round-robin 负载。

**语法**：

```
ecmp load-balance-mode round-robin ( vrf NAME | ) A.B.C.D/M
no ecmp load-balance-mode round-robin ( vrf NAME | ) A.B.C.D/M
```

| 参数 | 说明 |
| --- | --- |
| VRF NAME | VRF 实例名长度不超过31 的字符串 |
| A.B.C.D/M | 目的IP 前缀(如10.0.0.0/8) A.B.C.D/M 格式的IPv4 地址和掩码长度 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

所有vrf 加起来最多可配置15 组

**示例**：

```
下面的例子显示了如何配置ecmp 负载均衡模式为round-robin 负载:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# ecmp load-balance-mode round-robin 1.1.1.0/24
```

**相关命令**：无

### 6.1.22 `ecmp bandwidth-based-load-balance`

**功能**：使用这个命令来设置基于带宽的ECMP 负载分担。

**语法**：

```
ecmp bandwidth-based-load-balance enable
no ecmp bandwidth-based-load-balance enable
```

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置ecmp 基于带宽的负载均衡:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# ecmp bandwidth-based-load-balance enable
```

**相关命令**：ecmp weighting-bandwidth

### 6.1.23 `ecmp weighting-bandwidth`

**功能**：使用这个命令来设置基于带宽的ECMP 负载分担的权重带宽。

**语法**：

```
ecmp weighting-bandwidth BANDWIDTH
no ecmp weighting-bandwidth
```

| 参数 | 说明 |
| --- | --- |
| BANDWIDTH | 端口ecmp 加权带宽 1-100000000 |

**命令模式**：端口配置模式

**默认配置**：默认ecmp 加权带宽值为1

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置ecmp 加权带宽为100:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# int eth-0-1
Switch(config-if)# ecmp weighting-bandwidth 100
```

**相关命令**：ecmp bandwidth-based-load-balance

### 6.1.24 `show ecmp information`

**功能**：使用该命令显示当前ECMP 的配置。

**语法**：

```
show ecmp information
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了本命令的输出信息:
Switch# show ecmp information
ECMP load balance enable mode: Static
```

**相关命令**：无、6.2 RIP 命令


## 6.2 RIP 命令

### 6.2.1 `default-information originate (RIP)`

**功能**：使用此命令在RIP 路由表中生成一条默认路由。
  使用此命令的no 形式删除这条默认路由。

**语法**：

```
default-information originate ( route-map | )
no default-information originate ( route-map | )
```

| 参数 | 说明 |
| --- | --- |
| route-map | 路由映射 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

该命令生成的默认路由不会下到FIB 表中，只会被RIP 邻居学到。

**示例**：

```
在RIP 路由表中生成一条默认路由:
Switch# configure terminal
Switch(config)# router rip
Switch(config-router)# version 2
Switch(config-router)# network 192.168.16.0/24
Switch(config-router)# default-information originate
```

**相关命令**：无

### 6.2.2 `default-metric (RIP)`

**功能**：配置RIP 路由的缺省度量值。使用此命令的no 形式恢复RIP 路由的默认值。

**语法**：

```
default-metric NUMBER-VALUE
no default-metric
```

| 参数 | 说明 |
| --- | --- |
| NUMBER-VALUE | 缺省度量值 1-16 |

**命令模式**：路由模式

**默认配置**：默认跳数为0。

**使用说明**：

该命令要和重发布命令一起使用，这可以使经过RIP 路由协议重发布出去的所有路由
  的度量值是一样的。

**示例**：

```
下面的例子中，在设备上同时启用了RIP 和OSPF 同时在RIP 中重发布OSPF，并将所
有从OSPF 引入的路由的度量值设为10:
Switch# configure terminal
Switch(config)# router rip
Switch(config-router)# default-metric 10
Switch(config-router)# redistribute ospf
```

**相关命令**：redistribute (RIP)

### 6.2.3 `distance (RIP)`

**功能**：此命令设置加入RIP 路由表路由的管理距离。
  使用此命令的no 形式恢复此项设置为默认值。

**语法**：

```
distance DISTANCE PREFIX/PREFIX-LENGTH ( ACCESSS-LIST-NAME | )
no distance
```

| 参数 | 说明 |
| --- | --- |
| DISTANCE | 管理距离管理值范围为1-255，管理距离为255 的路由无效 |
| PREFIX | 路由源的前缀，只对符合条件的源IP 发过来的路由修改管理距离 IPv4 地址 |
| PREFIX-LENGTH | 路由源的前缀长度 1-32 |
| ACCESSS-LIST-NAME | (可选)访问控制列表，只对符合条件的路由更新报文的路由修改管理距离不超过40 字符的字符串 |

**命令模式**：路由模式

**默认配置**：默认值是120。

**使用说明**：

管理距离表明了对一个路由源的信任度，它是从0 到255 之间的一个整数。一般情况
  下，值越高，信任等级越低。 如果管理距离为255，说明这个路由源不被信任，从这
  样的源来的所有路由都应该被忽略。
  当用户配置了管理距离，那么当路由准备加入路由表的时候，系统就会根据发布路由
  更新的交换机的IP 地址进行过滤，同时对符合条件的路由修改管理距离。举个例子，
  它可以用来过滤那些不在管理员控制范围内的不正确的路由。可选项访问控制列表通
  常用于过滤路由更新里的路由表项。

**示例**：

```
设置从20.20.0.0 的网段来的路由的管理距离值为200:
Switch# configure terminal
Switch(config)# router rip
Switch(config-router)# network 10.10.0.0/24
Switch(config-router)# network 20.20.0.0/24
Switch(config-router)# distance 200 20.20.0.0/24
```

**相关命令**：distance (OSPF)

### 6.2.4 `ip rip authentication`

**功能**：该命令用来使能RIPv2 的认证功能，您可以在接口模式下用这条命令设置MD5 认证使
  用的钥匙链或者明文认证使用的密码。使用此命令的no 形式删除指定的钥匙链或密码。

**语法**：

```
ip rip authentication ( key-chain NAME-OF-CHAIN | string STRING )
no ip rip authentication ( key-chain | string )
```

| 参数 | 说明 |
| --- | --- |
| key-chain NAME-OF- |  |
| CHAIN | RIP 进行认证所使用的key- |
| chain | Key chain 名字符串 |
| string STRING | RIP 进行认证所用的密码不超过16 字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：默认无验证

**使用说明**：

如果key-chain 后面没有跟任何的内容或者string 后面没有跟任何的内容，那么该接口
  上接收和发送报文不需要进行认证。key-chain 和string 不能同时出现，您在使用一种
  方式的认证方式之前，请确保另一种认证不被使用。

**示例**：

```
下面的例子描述了在rip 报文发送和接收的时候使用钥匙链trees:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip rip authentication key-chain trees
```

**相关命令**：ip rip authentication mode

### 6.2.5 `ip rip authentication mode`

**功能**：此命令设置RIPv2 的认证方式。使用此命令的no 形式恢复RIP 的认证方式为默认值。

**语法**：

```
ip rip authentication mode ( text | md5 )
no ip rip authentication mode
```

| 参数 | 说明 |
| --- | --- |
| text | 明文验证 |
| md5 | MD5 加密验证 |

**命令模式**：端口配置模式

**默认配置**：默认不进行验证。

**使用说明**：

RIP v1 版本不支持验证功能。

**示例**：

```
下面的例子描述了如何配置接口RIP 验证的类型为MD5:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip rip authentication mode md5
```

**相关命令**：ip rip authentication key-chain

### 6.2.6 `ip rip receive version`

**功能**：此命令设置端口可接收的RIP 报文的版本。
  使用此命令的no 形式恢复此设置为默认值。

**语法**：

```
ip rip receive version [ 1 | 2 ]
no ip rip receive version
```

**参数**：

```
设置端口只可接收RIPv1
的报文
-
设置端口只可接收RIPv2
的报文
-
```

**命令模式**：端口配置模式

**默认配置**：默认端口只接收V2 报文。

**使用说明**：

使用此命令改变RIP 接收报文的版本，该命令只能作用于3 层接口，您可以配置该接
  口同时接收RIPv1 和RIPv2 的报文。

**示例**：

```
下面的例子描述了如何设置接口RIP 接收报文的类型为v1 和v2:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip rip receive version 1 2
```

**相关命令**：version (RIP)

### 6.2.7 `ip rip receive-packet`

**功能**：此命令设置端口可接收RIP 报文。
  使用此命令的no 形式设置端口不可接收RIP 报文。

**语法**：

```
ip rip receive-packet
no ip rip receive-packet
```

**命令模式**：端口配置模式

**默认配置**：端口可接收RIP 报文。

**使用说明**：

使用此命令来启用或禁用接口接收RIP 报文的能力， 而不管该接口相对应的网络有没
  有被加到RIP 中。

**示例**：

```
下面的例子描述了如何设置端口可接收RIP 报文:

Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip rip receive-packet
```

**相关命令**：ip rip receive version

### 6.2.8 `ip rip send version`

**功能**：此命令设置端口发送RIP 报文的版本。
  使用此命令的no 形式恢复端口发送的RIP 报文的版本为默认值。

**语法**：

```
ip rip send version ( ( [ 1 | 2 ] ) | 1-compatible )
no ip rip send version
```

| 参数 | 说明 |
| --- | --- |
| 1-compatible | 接口发送v2 的报文兼容v1 的版本 |

**命令模式**：端口配置模式

**默认配置**：默认是v2 版本。

**使用说明**：

使用此命令改变RIP 发送报文的版本，该命令只能作用于3 层接口，您可以配置该接
  口既可以发送RIPv1 的报文，也可以发送RIPv2 的报文。

**示例**：

```
下面的例子描述了如何设置接口可以发送两种类型的RIP 报文:

Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip rip send version 1 2
```

**相关命令**：ip rip receive version

### 6.2.9 `ip rip send-packet`

**功能**：此命令设置端口可发送RIP 报文。
  使用此命令的no 形式设置端口不可发送RIP 报文。

**语法**：

```
ip rip send-packet
no ip rip send-packet
```

**命令模式**：端口配置模式

**默认配置**：端口可发送RIP 报文

**使用说明**：

使用此命令来启用或禁用接口发送RIP 报文的能力， 而不管该接口相对应的网络有没
  有被加到RIP 中。

**示例**：

```
下面的例子描述了如何设置此端口可发送RIP 报文:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip rip send-packet
```

**相关命令**：ip rip send version

### 6.2.10 `ip rip split-horizon`

**功能**：此命令设置端口防止形成路由环路的方式：毒性逆转或水平分割。
  使用此命令的no 形式恢复此设置为默认值。

**语法**：

```
ip rip split-horizon ( poisoned | )
no ip rip split-horizon
```

| 参数 | 说明 |
| --- | --- |
| poisoned | 采用毒性逆转的方式防止路由环路 |

**命令模式**：端口配置模式

**默认配置**：端口采用毒性逆转防止路由环路。

**使用说明**：

在一般情况下，不建议用ip rip split-horizon 命令改变默认的状态，除非您确定您的应
  用程序需要变更正确的宣告路由。

**示例**：

```
下面的例子显示了如何使能水平分割来防止路由环路:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip rip split-horizon
```

**相关命令**：无

### 6.2.11 `network (RIP)`

**功能**：使用此命令在指定网段使能RIP 协议。
  使用此命令的no 形式在指定网段上关闭RIP 协议。

**语法**：

```
network ( PREFIX / PREFIX-LENGTH )
no network ( PREFIX / PREFIX-LENGTH )
```

| 参数 | 说明 |
| --- | --- |
| PREFIX | 网段的前缀 IPv4 地址 |
| PREFIX-LENGTH | 前缀长度 1-32 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

系统对配置多少个RIP 网段并没有限制。RIP 协议只工作在那些使能了RIP 的网段相关
  的接口上。

**示例**：

```
下面的例子将在网段10.99.0.0/16 和192.168.7.0/24 使能RIP 路由协议:
Switch# configure terminal
Switch(config)# router rip
Switch(config-router)# network 10.99.0.0/16
Switch(config-router)# network 192.168.7.0/24
```

**相关命令**：router rip

### 6.2.12 `neighbor (RIP)`

**功能**：使用此命令定义一个用于交换路由信息的邻居路由器。
  使用此命令的no 形式删除该邻居路由器。

**语法**：

```
neighbor IP-ADDRESS
no neighbor IP-ADDRESS
```

| 参数 | 说明 |
| --- | --- |
| IP-ADDRESS | 与此路由器直接相连的路由器地址 IPv4 地址 |

**命令模式**：路由模式

**默认配置**：无邻居被指定

**使用说明**：

此命令用来配置NBMA(Non-Broadcast Multi-Access，非广播多点可达)网络中RIP 邻
  居的IP 地址，并使更新报文以单播形式发送到对端，而不采用正常的组播或广播的形
  式。通常情况下，要结合passive interface(被动接口)一起使用。您可以配置多个RIP 邻
  居。

**示例**：

```
下面的例子中，RIP 更新报文将会在网段10.108.0.0/16 相关的所有接口上发送，但是
接口eth-0-1 除外在这种情况下，我们可以使用neighbor 命令，系统将会发送路由更
新报文到指定的邻居:
Switch# configure terminal
Switch(config)# router rip
Switch(config-router)# network 10.108.0.0/16
Switch(config-router)# passive-interface eth-0-1
Switch(config-router)# neighbor 10.108.20.4
```

**相关命令**：router rip

### 6.2.13 `offset-list (RIP)`

**功能**：设置接口接收或发送RIP 路由时的附加度量值。使用此命令的no 形式删除路由附加值。

**语法**：

```
offset-list ACCESSS-LIST-NAME ( in | out ) METRIC-OFFSET ( IFNAME | )
no offset-list ( in | out ) ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| ACCESSS-LIST-NAME | 访问控制列表不超过40 字符的字符串 |
| in | 在进口方向应用 |
| out | 在出口方向应用 |
| METRIC-OFFSET | 应用到路由的附加度量值， 如果offset 是0 就不操作 0-16 |
| IFNAME | 应用offset list 接口的ID 支持 |
| physical/aggregation/loopb | ack/vlan/tunnel 端口 |

**命令模式**：路由模式

**默认配置**：默认不开启。

**使用说明**：

偏移量列表可以用来改变路由的度量值，以达到某些目的(如做备份链路或者负载均衡)。

**示例**：

```
下面的例子描述了在接口上设置Offset 列表21 以增加发送的路由的度量值:
Switch# configure terminal
Switch(config)# router rip
Switch(config-router)# offset-list 21 out 10
```

**相关命令**：无

### 6.2.14 `passive-interface (RIP)`

**功能**：使用此命令设置端口上禁止发送RIP 报文，使用此命令的no 形式使能发送RIP 报文。

**语法**：

```
passive-interface IFNAME
no passive-interface IFNAME
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口ID 支持 |
| physical/aggregation/loopb | ack/vlan/tunnel 端口 |

**命令模式**：路由模式

**默认配置**：默认不开启。

**使用说明**：

在RIP 协议中，路由器被分为两类：主动式和被动式。
  主动式路由器会定期在网络中广播路由更新信息，而被动式路由器只能被动接收来自
  主动式路由器的路由更新信息，以此来更新路由。而此命令就是设置路由器端口工作
  在被动模式下。当该接口上被禁止发送RIP 报文后，该接口所在的网段还是能被发布
  出去，而且同样也可以接收和处理RIP 路由更新报文。

**示例**：

```
下面的例子将eth-0-1 设置为被动接口:
Switch# configure terminal
Switch(config)# router rip
Switch(config-router)# network 10.108.0.0/16
Switch(config-router)# passive-interface eth-0-1
```

**相关命令**：router rip

### 6.2.15 `redistribute (RIP)`

**功能**：用此命令设置路由重发布。
  使用此命令的no 形式删除重发布的路由。

**语法**：

```
redistribute PROTOCOL { [ metric VALUE ] | route-map WORD }
no redistribute PROTOCOL
```

| 参数 | 说明 |
| --- | --- |
| PROTOCOL | (可选)可引入的源路由协议，包括OSPF, BGP, static，connected，isis |
| bgp/ospf/connected/isis/st |  |
| atic/isis |  |
| metric VALUE | (可选)当重发布其它路由到 RIP 中，如果没有指定度量值，那默认为0 1-16 |
| route-map | 路由映射 |
| WORD | 路由映射名字不超过20 字符的字符串 |

**命令模式**：路由模式

**默认配置**：默认不使能重发布，度量值的默认值为0。

**使用说明**：

redistribute 命令中指定的metric 值将会取代默认度量命令指定的度量值。

**示例**：

```
下面的例子设置重发布到RIP 的静态路由度量值为10:
Switch# configure terminal
Switch(config)# router rip
Switch(config-router)# network 10.108.0.0/16
Switch(config-router)# redistribute static metric 10
```

**相关命令**：default-metric

### 6.2.16 `router rip`

**功能**：使用此命令进入RIP 协议配置模式。使用此命令的no 形式删除RIP 进程

**语法**：

```
router rip
no router rip
```

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何进入RIP 的配置模式:
Switch# configure terminal
Switch(config)# router rip
```

**相关命令**：network (RIP)

### 6.2.17 `timers basic (RIP)`

**功能**：此命令用来配置RIP 各个定时器的值，可通过调节RIP 定时器来调整路由协议的性能，
  以满足网络需要。
  使用此命令的no 形式恢复设置为默认值。

**语法**：

```
timers basic UPDATE TIMEOUT INVALID
no timers basic
```

| 参数 | 说明 |
| --- | --- |
| UPDATE | 路由更新时间范围<5-2147483647>，默认30s |
| TIMEOUT | 路由老化时间，如果在老化时间内没有收到关于某条路由的更新报文，则该条路由在路由表中的度量值将会被设置为16，此时该条路由将不能用于转发报文范围<5-2147483647>，默认180s |
| INVALID | 路由的垃圾回收时间，定义了一条路由从度量值变为 16 开始，直到它从路由表里被删除所经过的时间。在垃圾回收时间内，RIP 以 16 作为度量值向外发送这条路由的更新，如果垃圾回收定时器超时，该路由仍没有得到更新，则该路由将从路由表中被彻底删除范围<5-2147483647>，默认120 |

**命令模式**：路由模式

**默认配置**：路由更新时间：30 秒； 路由老化时间：180 秒； 路由的垃圾回收时间：120 秒。

**使用说明**：

RIP 协议的这些时间参数时可调整的。由于RIP 是一个分布式的，异步的路由协议，因
  此，各个定时器的值在网络中的所有路由器上需要保持一致。同时，您也可以显示的
  指定地址族，这样，这些定时器的设置将只在该地址族内生效。

**示例**：

```
下面的例子设置RIP 路由的报文更新时间5 秒，当超过15 秒没有收到路由更新报文时，
路由将失效再过15 秒，路由将从RIP 路由表中删除:
Switch# configure terminal
Switch(config)# router rip
Switch(config-router)# timers basic 5 15 15
```

**相关命令**：无

### 6.2.18 `show ip rip database`

**功能**：此命令用来查看RIP 的数据库。

**语法**：

```
show ip rip database ( vrf WORD | )
```

| 参数 | 说明 |
| --- | --- |
| vrf WORD | VPN 转发实例不超过31 字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
用show ip rip database 命令显示RIP 数据库的内容:
Switch# show ip rip database
Codes: R - RIP, Rc - RIP connected, Rs - RIP static, K - Kernel,
       C - Connected, S - Static, O - OSPF, I - IS-IS, B - BGP
   Network        Next Hop        Metric From       If       Time
Rc 1.1.1.0/24                           0           eth-0-1
Rc 2.2.2.0/24                           0           eth-0-2
Rc 10.0.0.0/24                          0           vlan10
```

**相关命令**：show ip rip interface

### 6.2.19 `show ip rip interface`

**功能**：使用此命令显示接口的RIP 信息。

**语法**：

```
show ip rip interface ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口ID 支持 |
| physical/aggregation/loopb | ack/tunnel/vlan 端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
使用show ip rip interface 命令查看接口的RIP 信息:
Switch# show ip rip interface eth-0-1
eth-0-1 is up, line protocol is up
  Routing Protocol: RIP
    Receive RIP packets
    Send RIP packets
    Passive interface: Disabled
    Split horizon: Enabled with Poisoned Reversed
    IP interface address:
      1.1.1.1/24
```

**相关命令**：show ip rip database

### 6.2.20 `version (RIP)`

**功能**：使用此命令设置RIP 协议版本信息。
  使用此命令的no 形式设置RIP 版本为默认值。

**语法**：

```
version ( 1 | 2 )
no version
```

**参数**：

```
指定RIP v1
-
指定RIP v2
-
```

**命令模式**：路由模式

**默认配置**：默认系统只接收v2 的报文,只发送v2 的报文。

**使用说明**：

接口上指定RIP 的发送和接收的版本信息会覆盖路由模式下配置的RIP 版本信息。

**示例**：

```
指定RIP 路由中发送和接收的版本为v2:
Switch# configure terminal
Switch(config)# router rip
Switch(config-router)# version 2
```

**相关命令**：ip rip receive version、ip rip send version

### 6.2.21 `distribute-list`

**功能**：使用此命令过滤网络中路由更新，使用此命令的no 形式恢复默认设置。

**语法**：

```
distribute-list ( prefix | ) WORD ( in | out )
no distribute-list ( prefix | ) WORD ( in | out )
```

| 参数 | 说明 |
| --- | --- |
| prefix | 过滤列表 |
| WORD | 访问控制列表名字不超过40 字符的字符串 |
| in | 进口方向过滤 |
| out | 出口方向过滤 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子对所有的RIP 接收的路由进行过滤:
Switch# configure terminal
Switch(config)# router rip
Switch(config-router)# distribute-list prefix 1 in
```

**相关命令**：ip prefix-list

### 6.2.22 `address-family`

**功能**：此命令进入地址族模式。

**语法**：

```
address-family ipv4 vrf WORD
```

| 参数 | 说明 |
| --- | --- |
| WORD | VPN 实例不超过31 字符的字符串 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示如何进入地址族模式:
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router)address-family ipv4
```

**相关命令**：无

### 6.2.23 `show ip protocol rip`

**功能**：此命令显示RIP 协议的信息。

**语法**：

```
show ip protocol rip
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
使用show ip rip interface 命令显示RIP 的协议信息:
Switch# show ip protocol rip
Routing protocol is "rip"
  Sending updates every 30 seconds with +/-5 seconds
  Timeout after 180 seconds, Garbage collect after 120 seconds
  Outgoing update filter list for all interface is not set
  Incoming update filter list for all interface is not set
  Default redistribution metric is 0
  Redistributing:
    connected  metric default
  Default version control: send version 2, receive version 2
    Interface        Send          Recv   Key-chain
  Routing for Networks:
    10.10.11.0/24
  Routing Information Sources:
    Gateway          Distance  Last Update  Bad Packets  Bad Routes
  Number of routes (including connected): 0
  Distance: (default is 120)
```

**相关命令**：无

### 6.2.24 `debug rip`

**功能**：使用该命令来打开RIP 的调试开关，主要包括events 和packet 开关。使用此命令的
  no 形式关闭RIP 调试开关。

**语法**：

```
debug rip ( all | events | PACKET | )
no debug rip ( all | events | PACKET | )

no debug all ( rip | )
```

| 参数 | 说明 |
| --- | --- |
| all | 打开RIP 的所有调试开关 |
| events | 打开RIP 的事件调试开关 |
| PACKET | RIP 报文调试开关，包括 recv，send 以及detail |
| recv | 接收报文的调试开关 |
| send | 发送报文的调试开关 |
| detail | 接收或发送报文的详细信息调试开关 |

**命令模式**：特权模式

**默认配置**：调试功能关闭。

**使用说明**：

无

**示例**：

```
下面的例子显示了如何打开RIP 报文的调试开关:
Switch# debug rip packet
```

**相关命令**：show debugging rip

### 6.2.25 `show debugging rip`

**功能**：使用该命令来显示RIP 调试开关的状态信息。

**语法**：

```
show debugging rip
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了RIP 调试开关的状态信息:
Switch# show debuging rip
RIP debugging status:
  RIP packet debugging is on
```

**相关命令**：debug rip

### 6.2.26 `show ip rip database database-summary`

**功能**：使用该命令显示RIP 路由的统计值。

**语法**：

```
show ip rip database database-summary ( vrf NAME | )
```

| 参数 | 说明 |
| --- | --- |
| vrf NAME | VRF 实例名不超过31 字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了使用命令show ip rip database database-summary 的输出结果:
Switch# show ip rip database database-summary
Type                  Count
RIP connected       1
RIP                   1
Total                 2
```

**相关命令**：show ip rip database

### 6.2.27 `show resource rip`

**功能**：使用该命令显示RIP 路由占用的硬件资源统计。

**语法**：

```
show resource rip
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了使用命令 show resource rip 的输出结果:
Switch# show resource rip
RIP
Resource                 Used          Capability
================================================
Routes                    2             6144
```

**相关命令**：show ip rip database、6.3 OSPF 命令


## 6.3 OSPF 命令

### 6.3.1 `area authentication`

**功能**：启用OSPF 的区域验证，可以在OSPF 路由模式下使用 area authentication 命令。 使用
  该命令的no 形式删除OSPF 的区域验证功能。

**语法**：

```
area AREA-ID authentication ( message-digest | )
no area AREA-ID authentication
```

| 参数 | 说明 |
| --- | --- |
| AREA-ID | 区域标识符，指定了哪个区域被启用验证功能.。标识符可以是十进制的或者是 IP 地址 IP 地址或0-4294967295 的整数 |
| message-digest | (可选)为指定的区域ID 启用MD5 验证 |

**命令模式**：路由模式

**默认配置**：不使用验证功能。

**使用说明**：

RFC 1247 规定类型1 为明文验证，如果命令中没有该选项，默认不使用验证功能。
  一个区域的所有路由器之间身份验证类型必须是相同。网络上的所有OSPF 路由器的身
  份验证密码也必须是相同的， 在接口模式下使用 ip ospf authentication-key 来指定认
  证密码。
  如果要启用MD5 验证，你必须在接口模式下用ip ospf message-digest-key 指定keyid。

**示例**：

```
下面例子讲述了在OSPF 进程201 内如何配置区域0 和区域10.0.0.0 的OSPF 的验证:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip address 192.168.251.201/24
Switch(config-if)# ip ospf authentication-key adcdefgh
Switch(config)# interface eth-0-2
Switch(config-if)# no switchport
Switch(config-if)# ip address 10.56.0.201/16
Switch(config-if)# ip ospf authentication-key ijklmnop
Switch(config)# router ospf 201
Switch(config-router)# network 10.0.0.0 0.255.255.255 area 10.0.0.0
Switch(config-router)# network 192.168.0.0/16 area 0
Switch(config-router)# area 10.0.0.0 authentication
Switch(config-router)# area 0 authentication
```

**相关命令**：ip ospf authentication-key

### 6.3.2 `area default-cost`

**功能**：要指定一个发送到Stub 区域默认的汇总路由的开销，在路由模式下使用命令area
  default-cost。如果要删除配置， 只要用该命令的no 形式。

**语法**：

```
area AREA-ID default-cost COST
no area AREA-ID default-cost
```

| 参数 | 说明 |
| --- | --- |
| AREA-ID | 区域标识符，标识符可以是十进制的或者是IP 地址 IP 地址或0-4294967295 的整数 |
| COST | 默认开销值 0-16777214 |

**命令模式**：路由模式

**默认配置**：默认为1。

**使用说明**：

此命令只用在连接stub 区域的区域边缘路由器(ABR)上。
  有两种Stub 区域的路由配置命令：stub 和 default-cost 命令。
  配置Stub 区域后只学习类型为1(router-lsa)，2(network lsa)和3(summary lsa)的LSA。

**示例**：

```
下面例子讲述如何配置Stub 区域和如何配置Stub 区域的Cost 值:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip address 10.56.0.201/16
Switch(config)# router ospf 201
Switch(config-router)# network 10.0.0.0/8 area 10.0.0.0
Switch(config-router)# area 10.0.0.0 stub
Switch(config-router)# area 10.0.0.0 default-cost 20
```

**相关命令**：无

### 6.3.3 `area filter-list`

**功能**：使用此命令来过滤本区域内收到或发出的3 类LSA，该命令只能作用于ABR 上。
  使用关键字no 删除过滤列表对指定区域的应用。

**语法**：

```
area AREA-ID filter-list ( access ACCESSS-LIST-NAME | prefix PREFIX-LIST-NAME ) ( in |
out )
no area AREA-ID filter-list ( access ACCESSS-LIST-NAME | prefix PREFIX-LIST-NAME )
( in | out )
```

| 参数 | 说明 |
| --- | --- |
| AREA-ID | 区域标识符，标识符可以是十进制的或者是IP 地址 IP 地址或0-4294967295 的整数 |
| access | 表示后面所跟为接入列表 |
| ACCESSS-LIST-NAME | ACL 名字长度不超过20 个字符的字符串 |
| prefix | 表示后面所跟为前缀列表 |
| PREFIX-LIST-NAME | 前缀列表名字长度不超过20 个字符的字符串 |
| in | 对进入此区域的报文按指定的列表进行过滤 |
| out | 对出此区域的报文按指定的列表进行过滤 |

**命令模式**：路由模式

**默认配置**：默认无配置

**使用说明**：

当该特性的方向配置为in 时，所有从其他区域进入该区域的3 类LSA 将被过滤，包括
  ABR 上生成的3 类汇总LSA。所有不符合路由前缀列表的路由将被忽视。当该特性的
  方向配置为out 时，所有从该区域进入其他区域的3 类LSA 将被过滤。如果在该区域
  上配置汇总路由，那么只要有一条匹配的3 类LSA 被发送到其他区域，那么该汇总路
  由也将被发布到其他区域。如果一条匹配的3 类LSA 都没有，那么该汇总路由也不会
  被发送到其他区域。被前缀列表或ACL deny 掉的3 类LSA 将被隐式的忽略。

**示例**：

```
下面例子讲述如何使用Filter-List 来过滤从其他区域发到区域1 的LSA:
Switch# configure terminal
Switch(config)# router ospf 201
Switch(config-router)# area 1 filter-list prefix AREA_1 in
```

**相关命令**：area range

### 6.3.4 `area range`

**功能**：使用此命令在OSPF 区域边界上对路由进行合并和汇总，使用此命令的no 形式取消该
  项功能。

**语法**：

```
area AREA-ID range ( ADDRESS MASK | ADDRESS / PREFIX-LENGTH ) ( advertise | not-
advertise | )
no area AREA-ID range ( ADDRESS MASK | ADDRESS / PREFIX-LENGTH }
```

| 参数 | 说明 |
| --- | --- |
| AREA-ID | 区域标识符，标识符可以是十进制的或者是IP 地址 IP 地址或0-4294967295 的整数 |
| ADDRESS | 聚合路由的目的IPv4 地址 IPv4 地址 |
| PREFIX-LENGTH | 聚合路由的地址前缀长度 1-32 |
| advertise | 发布这条聚合路由 |
| not-advertise | 不发布这条聚合路由 |

**命令模式**：路由模式

**默认配置**：不对路由进行聚合。

**使用说明**：

area range 只能用在ABR 路由器上。 用来对当前区域进行路由聚合。聚合的结果是由
  ABR 把单一的汇总路由宣告给其他区域。一个区域可配置多条聚合网段，这样OSPF
  可对多个网段进行聚合。

**示例**：

```
下面的例子讲述了如何在ABR 路由器上对子网10.0.0.0 进行路由汇总以及对
192.168.110.0 网络内的所有主机路由进行汇总:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip address 192.168.110.201/24
Switch(config)# interface eth-0-2
Switch(config-if)# no switchport
Switch(config-if)# ip address 192.168.120.201/24
Switch(config)# interface eth-0-3
Switch(config-if)# no switchport
Switch(config-if)# ip address 10.0.0.0/8
Switch(config)# router ospf 201
Switch(config-router)# network 192.168.110.0/24 area 0

Switch(config-router)# area 10.0.0.0 range 10.0.0.0/8
Switch(config-router)# area 0 range 192.168.110.0 255.255.0.0
```

**相关命令**：无

### 6.3.5 `area stub`

**功能**：使用此命令设置指定区域为Stub(存根)区域，使用关键字no 取消对此区域为存根区域
  的设置。

**语法**：

```
area AREA-ID stub ( no-summary | )
no area AREA-ID stub ( no-summary | )
```

| 参数 | 说明 |
| --- | --- |
| AREA-ID | 区域标识符，标识符可以是十进制的或者是IP 地址 IP 地址或0-4294967295 的整数 |
| no-summary | (可选)如果指定了此项，则配置此区域为完全存根区域 |

**命令模式**：路由模式

**默认配置**：默认无Stub 区域

**使用说明**：

缺省情况下，没有区域被设置为Stub(存根)区域。Stub 区域的所有路由器都必须用
  area stub 进行设置。
  如果一个区域被配置为存根区域，则当5 类LSA 在整个AS 内进行洪泛时，不会被洪泛
  进此存根区域。典型的可以被配置为存根区域的是一个IP 子网，此时所有主机都通过
  路由器访问外网；把此IP 子网配置为存根区域，可以减少路由信息的流量并减少连接
  状态数据库的大小；存根区域中的ABR 会向存根区域发布汇总路由，以通告存根区域
  到达AS 内其它区域的路由；所以存根区域可以避免AS 外的路由变化对此存根区域的
  影响，但它并不能阻止AS 内的其他区域对它的影响。完全存根区域不仅能阻止5 类
  LSA 的进入，而且能阻止其他的3 类LSA 的进入；所以完全存根区域不仅避免了AS 外
  的路由变化对此存根区域的影响，而且避免了AS 内其它区域对它的影响。可以用关键
  
  字no-summary 将区域配置为完全存根区域，此时ABR 向存根区域只宣告一条缺省路
  由的3 类LSA。

**示例**：

```
下面例子讲述了如何配置Stub 区域以及设置默认的Cost 值:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip address 10.56.0.201/16
Switch(config)# router ospf 201
Switch(config-router)# network 10.0.0.0/8 area 10.0.0.0
Switch(config-router)# area 10.0.0.0 stub
Switch(config-router)# area 10.0.0.0 default-cost 20
```

**相关命令**：无

### 6.3.6 `area nssa`

**功能**：使用此命令设置指定区域为NSSA 区域，使用关键字no 取消对此区域为存根区域的设
  置。

**语法**：

```
area AREA-ID nssa ( translator-role ( candidate | never | always ) | ) ( no-summary | )
( no-redistribution | ) ( default-information-originate { metric METRIC_VALUE | metric-
type TYPE-VALUE | } | )
no area AREA-ID nssa ( translator-role | ) ( no-summary | ) ( no-redistribution | )
( default-information-originate | )
```

| 参数 | 说明 |
| --- | --- |
| AREA-ID | 区域标识符，标识符可以是十进制的或者是IP 地址 IP 地址或0-4294967295 的整数 |
| candidate | (可选)配置ABR 在NSSA 区域中的角色为候选转换路由器 |
| never | (可选)配置ABR 在NSSA 区域中的角色为非转换路由器 |
| always | (可选)配置ABR 在NSSA 区域中的角色为指定转换路由器 |
| no-summary | (可选)如果指定了此项，则禁止ABR 向此区域发送 |
| Summary LSAs |  |
| no-redistribution | (可选)如果指定了此项，则禁止向此区域引入外部路由 |
| default-information- |  |
| originate | (可选)如果指定了此项，则 ASBR 将产生默认的type 7 LSA 到NSSA 区域 |
| metric METRIC_VALUE | (可选)配置生成的默认路由的metric 值 0-16777214 |
| metric-type TYPE-VALUE | (可选)配置生成的默认路由的metric 类型 1-2 |

**命令模式**：路由模式

**默认配置**：默认无NSSA 区域

**使用说明**：

缺省情况下，没有区域被设置为NSSA 区域。NSSA 区域的所有路由器都必须用area
  nssa 进行设置。 NSSA 区域与STUB 区域有许多相似的地方，两者都不传播来自其它
  OSPF 区域的外部路由。差别在于NSSA 区域能够将外部路由引入并传播到整个OSPF
  自治域中，而STUB 区域不能引入外部路由。

**示例**：

```
下面例子讲述了如何配置NSSA 区域:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip address 10.56.0.201/16
Switch(config)# router ospf 201
Switch(config-router)# network 10.0.0.0/8 area 10.0.0.0
Switch(config-router)# area 10.0.0.0 nssa
```

**相关命令**：无

### 6.3.7 `auto-cost`

**功能**：使用此命令设置计算OSPF 链路开销时所依据的参考带宽，使用关键字no 把参考带宽
  设置为默认值。

**语法**：

```
auto-cost reference-bandwidth RATE
no auto-cost reference-bandwidth
```

| 参数 | 说明 |
| --- | --- |
| RATE | 带宽，以Mbps 为单位. 1-4294967 |

**命令模式**：路由模式

**默认配置**：100 Mbps

**使用说明**：

使用 ip ospf cost 命令设置的端口Cost 值将会覆盖用该命令计算出来的cost 值。计算
  链路开销的公式为：参考带宽/端口速率。

**示例**：

```
下面例子讲述了如何在链路上设置带宽为1G:
Switch# configure terminal
Switch(config)# router ospf 1
Switch(config-router)# auto-cost reference-bandwidth 1000
```

**相关命令**：ip ospf cost

### 6.3.8 `clear ip ospf`

**功能**：使用此命令重启OSPF 进程。

**语法**：

```
clear ip ospf ( PID | ) process
```

| 参数 | 说明 |
| --- | --- |
| PID | (可选)进程 ID 0-65535 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

<0-65535>：OSPF 进程编号；如果没有指定此项，则重启所有OSPF 进程。

**示例**：

```
下面例子讲述如何重启所有OSPF 进程:
Switch# clear ip ospf process
```

**相关命令**：无

### 6.3.9 `compatible rfc1583`

**功能**：使用此命令用来使能兼容RFC1583 的路由选择优先规则。使用关键字no 来禁用此规
  则。

**语法**：

```
compatible rfc1583
no compatible rfc1583
```

**命令模式**：路由模式

**默认配置**：不兼容RFC 1583。

**使用说明**：

为了减少路由环路，所有OSPF 域内的路由器的RFC1583 兼容模式需要设置成一样的。
  当有多个AS-External-LSA 发布了到相同目的地址的路由时，在如何选择最优路由的问
  题上，RFC1583 和RFC2328 所定义的优先规则是不相同的。如果到达同一个外部路径
  有多个最小距离项时，如果RFC1583Compatibility 设为disable，则选择OSPF 的区域
  标志最大的项；否则如果enable，就认为是ecmp 了。

**示例**：

```
下面的例子讲述了如何将路由器设置为RFC1583 兼容模式:
Switch# configure terminal
Switch(config)# router ospf 1
Switch(config-router)# compatible rfc1583
```

**相关命令**：无

### 6.3.10 `default-information originate (OSPF)`

**功能**：使用此命令用来将缺省路由引入OSPF 区域，使用关键字no 取消引入缺省路由。

**语法**：

```
default-information originate ( route-map WORD | always | metric METRIC-VALUE |
metric-type TYPE-VALUE | )
no default-information originate ( route-map WORD | always | metric | metric-type | )
```

| 参数 | 说明 |
| --- | --- |
| always | (可选) 在没有配置静态默认路由的情况下始终向OSPF 网络通告默认路由 |
| metric METRIC-VALUE | (可选)被用作生成默认路由的Metric。假如你没有指定相应的值，默认值是1。 0-16777214 |
| metric-type TYPE-VALUE | (可选) 外部链路的路由类型: 1—type 1 的5 类LSA 1-2 2—type 2 类型的5 类LSA |
| route-map WORD | 路由策略长度不超过20 个字符的字符串 |

**命令模式**：路由模式

**默认配置**：默认关闭

**使用说明**：

当你使用重发布命令(redistribute)或引入缺省路由命令(default-information-originate)
  时，路由器自动成为自治系统边界路由器(ASBR)。 ASBR 默认不会向OSPF 域生成默认
  路由，除非系统本身已经存在默认路由或者指定了always 关键字。

**示例**：

```
下面例子讲述了如何设置默认路由以及修改对应的Metric 值和类型:
Switch# configure terminal
Switch(config)# router ospf 109
Switch(config-router)# redistribute rip metric 100
Switch(config-router)# default-information originate metric 100 metric-type 1
```

**相关命令**：redistribute (OSPF)

### 6.3.11 `default-metric (OSPF)`

**功能**：使用此命令设置OSPF 引入外部路由时的开销，使用关键字no 恢复路由开销为默认值。

**语法**：

```
default-metric METRIC-VALUE
no default-metric
```

| 参数 | 说明 |
| --- | --- |
| METRIC-VALUE | 设置指定的路由开销 0-16777214 |

**命令模式**：路由模式

**默认配置**：对于引入的BGP 路由，默认为1 对于其他的，默认为20

**使用说明**：

default-metric 命令通常和redistribute 路由器配置命令一起使用来给所有重发布的路
  由配置相同的开销。

**示例**：

```
下面例子讲述了如何将RIP 路由引入到OSPF，并将引入时的路由开销设为10:
Switch# configure terminal
Switch(config)# router ospf
Switch(config-router)# default-metric 10
Switch(config-router)# redistribute rip
```

**相关命令**：redistribute (OSPF)

### 6.3.12 `distance (OSPF)`

**功能**：针对不同的路由类型去设置OSPF 的管理距离，使用no 命令恢复默认配置。

**语法**：

```
distance { DISTANCE | ospf [ external DIST1 ] [ inter-area DIST2 ] | [ intra-area DIST3 ] }
no distance { DISTANCE | ospf }
```

| 参数 | 说明 |
| --- | --- |
| DISTANCE | 管理距离，范围：1 到 255。(255 个距离值的路由在路由表中无效。) 1-255 |
| external DIST1 | (可选)对区域外路由设置管理距离，范围：1 到255 1-255 |
| inter-area DIST2 | (可选)对区域间路由设置管 1-255 理距离，范围1 到255 |
| intra-area DIST3 | (可选)对区域内路由设置管理距离，范围：1 到255 1-255 |

**命令模式**：路由模式

**默认配置**：DIST1: 110 DIST2: 110 DIST3: 110

**使用说明**：

默认情况下，区域内、区域间、区域外路由的管理距离都为110。
  管理距离表征的是对路由的可信度；管理距离越小，此种路由的可信度越高。
  当有不止一条的路由可以到达目标时，路由器根据路由的可信度，即根据管理
  距离选择采用何种路由。只在本地有效。

**示例**：

```
下面例子讲述了如何设置OSPF 的管理距离:
Switch# configure terminal
Switch(config)# router ospf
Switch(config-router)# distance 90
Switch(config-router)# redistribute rip
```

**相关命令**：无

### 6.3.13 `distribute-list (OSPF)`

**功能**：使用该命令对OSPF 接收的路由或要发布的5 类路由进行过滤。使用关键字no 取消过
  滤行为。

**语法**：

```
distribute-list prefix PREIFX-LIST-NAME ( in | out )
```

| 参数 | 说明 |
| --- | --- |
| PREFIX-LIST-NAME | prefix-list 名称长度不超过20 个字符的字符串 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

必须要指定一个prefix-list。

**示例**：

```
下面的例子讲述了OSPF 1 如何只接收20.0.0.0 个网段的路由:
Switch# configure terminal

Switch(config)# ip prefix-list plist permit 20.0.0.0/8

Switch(config)# router ospf
Switch(config-router)# network 20.0.0.0/8 area 0
Switch(config-router)# distribute-list prefix plist in
```

**相关命令**：无

### 6.3.14 `distribute-list (OSPF)`

**功能**：使用该命令对OSPF 接收的路由或要发布的5 类路由进行过滤。使用关键字no 取消过
  滤行为。

**语法**：

```
distribute-list ACCESSS-LIST-NAME ( in | out )
no distribute-list ACCESSS-LIST-NAME ( in | out )
```

| 参数 | 说明 |
| --- | --- |
| ACCESSS-LIST-NAME | ACL 名称长度不超过20 个字符的字符串 |
| in | 过滤接收到的路由 |
| out | 抑制某些被发布的路由 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

必须要指定一个ACL。

**示例**：

```
下面的例子讲述了OSPF 1 如何只接收20.0.0.0 和10.108.0.0 两个网段的路由:
Switch# configure terminal
Switch(config)# ip access-list acl1
Switch(config-ip-acl)# permit any 20.0.0.0 0.0.255.255 any
Switch(config-ip-acl)# permit any 10.108.0.0 0.0.255.255 any
Switch(config-ip-acl)# deny any any any
Switch(config)# router ospf 1
Switch(config-router)# network 10.108.0.0/16 area 1
Switch(config-router)# distribute-list acl1 in
```

**相关命令**：ip access-list

### 6.3.15 `ip ospf authentication`

**功能**：使用此命令设置端口的认证方式，使用关键字no 设置端口的认证方式为默认值。

**语法**：

```
ip ospf authentication ( message-digest | null | )
no ip ospf authentication
```

| 参数 | 说明 |
| --- | --- |
| message-digest | (可选)指定认证的方式 |
| null | (可选) 不采用认证，在不需要使用密码或者消息认证的场合比较有用 |

**命令模式**：端口配置模式

**默认配置**：默认端口不进行认证。

**使用说明**：

认证类型和认证密码必须是匹配的。如果你准备使用明文认证，那么除了要用命令ip
  ospf authentication 外，还需要在接口上指定ip ospf authentication-key；如果你准备
  使用MD5 认证，那么除了使用命令ip ospf authentication message-digest 外，还需要
  在接口上指定ip ospf message-digest-key。为了向前兼容，区域认证类型还是可以设
  置的，如果接口上没有设置认证类型，就将使用对应的区域认证类型。

**示例**：

```
下面例子讲述了如何使能认证:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ip ospf authentication message-digest
```

**相关命令**：area authentication、ip ospf authentication-key、ip ospf message-digest-key

### 6.3.16 `ip ospf authentication-key`

**功能**：使用此命令设置端口的认证密码，使用关键字no 取消端口的认证密码。

**语法**：

```
ip ospf authentication-key ( 8 | ) PASSWORD
no ip ospf authentication-key
```

| 参数 | 说明 |
| --- | --- |
| PASSWORD | 所设置的端口认证密码，长度为8 bytes 8 个字符的字符串 (8\|) 指定密码加密 |

**命令模式**：端口配置模式

**默认配置**：默认端口认证密码为空。

**使用说明**：

在同一网络内的邻居路由器接口密码必须一致。这个密码将会被附加到报文上被发送
  出去，不同的接口上使用的密码可以是不一样的。

**示例**：

```
下面例子讲述如何配置OSPF 接口密码:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip ospf authentication-key yourpass
下面例子讲述如何配置OSPF 密文接口密码:
Switch# configure terminal
Switch(config)# interface eth-0-2
Switch(config-if)# no switchport
Switch(config-if)# ip ospf authentication-key 8 91c38996a1aa5699
```

**相关命令**：area authentication、ip ospf authentication

### 6.3.17 `ip ospf cost`

**功能**：使用此命令设置端口发送报文的开销，使用关键字no 设置端口开销为默认值。

**语法**：

```
ip ospf cost INTERFACE-COST
no ip ospf cost
```

| 参数 | 说明 |
| --- | --- |
| INTERFACE-COST | 设置端口的发送报文的开销 1-65535 |

**命令模式**：端口配置模式

**默认配置**：端口的速率不一样，默认开销也可能不一样。

**使用说明**：

如果你不想使用默认的端口开销，可以用该命令来改变开销值。也可以使用reference
  bandwidth 来改变端口开销。

**示例**：

```
下面例子讲述了如何设置端口的开销为65:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip ospf cost 65
```

**相关命令**：auto-cost reference bandwidth

### 6.3.18 `ip ospf database-filter all out`

**功能**：使用此命令过滤OSPF 端口的链路状态通告报文，使用关键字no 恢复端口对链路状态
  通告报文的转发。

**语法**：

```
ip ospf database-filter all out
no ip ospf database-filter
```

**命令模式**：端口配置模式

**默认配置**：默认不开启，所有的LSA 都会被洪泛到该接口。

**使用说明**：

正常情况下，OSPF 会从所有的邻居接口洪泛LSA，除了接收报文的端口。这种机制在
  一定程度上保证了泛洪的鲁棒性。但是，过多的冗余报文将会消耗带宽，增加CPU 负
  担，进而造成网络的不稳定。为了避免这种情况的发生，可以使用该命令阻止LSA 报
  文从某个端口泛洪。

**示例**：

```
下面例子讲述如何阻止LSA 报文在广播网络，非广播网络和点对点网络上洪泛到接口
1:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip ospf database-filter all out
```

**相关命令**：无

### 6.3.19 `ip ospf dead-interval`

**功能**：邻居路由器失效时间。如果在该时间之后还没有收到邻居的任何hello 报文，则宣告邻
  居死亡。使用关键字no 恢复此时间段为默认值。

**语法**：

```
ip ospf dead-interval SECONDS
no ip ospf dead-interval
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 设置的时间间隔值，当前网络所有的节点这个值必须相同 1-65535 |

**命令模式**：端口配置模式

**默认配置**：SECONDS： 默认在宣告邻居死亡之前，端口等待的时间为40 秒

**使用说明**：

邻居路由器失效时间会在hello 报文中被通告。在同一OSPF 网络中的时间间隔必须一
  致。该值设置的越短，网络收敛时间也越短，但是会增加网络的不稳定性。

**示例**：

```
设置OSPF 的接口死亡时间间隔为 20 秒:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip ospf dead-interval 20
```

**相关命令**：ip ospf hello-interval、show ip ospf interface

### 6.3.20 `ip ospf hello-interval`

**功能**：使用此命令设置此端口发送Hello 报文的时间间隔，使用关键字no 设置此端口发送
  Hello 报文的时间间隔为默认值。

**语法**：

```
ip ospf hello-interval SECONDS
no ip ospf hello-interval
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | Hello interval 期间路由器必须接收到一个hello 报文，否则这个邻居就会在邻居表中被删除。网络上所有节点的hello interval 必须要配置成一样的。 1-65535 |

**命令模式**：端口配置模式

**默认配置**：10 seconds (以太网)； 30 seconds (非广播网)。

**使用说明**：

该值将会在hello 报文中被发送，同一网络内的路由器上设置的hello 时间间隔必须一
  致。该值设置的越短，网络拓扑变化将能被越快的检测到，但这样也会造成网络上流
  量增加。

**示例**：

```
下面的例子将端口发送Hello 报文的时间间隔设置为15 秒:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip ospf hello-interval 15
```

**相关命令**：ip ospf dead-interval

### 6.3.21 `ip ospf message-digest-key md5`

**功能**：使用此命令给此端口设定MD5 认证的认证密码，使用关键字no 取消端口的认证密码。

**语法**：

```
ip ospf message-digest-key KEY-ID md5 ( 8 | ) KEY
no ip ospf message-digest-key KEY-ID
```

| 参数 | 说明 |
| --- | --- |
| KEY-ID | key 标志，范围为1 到255 1-255 (8\|) 指定密码加密 |
| KEY | 认证密码，最大16 个字符 不超过16 个字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：MD5 认证默认不开启。

**使用说明**：

使用该验证类型时，所有接入同一网络/子网的路由器配置有一个共享的密码。对于每
  一个OSPF 路由协议包，该密码用于生成/检验加在OSPF 包最后的“信息摘要”。该信息
  摘要是根据OSPF 协议包和密码通过单向函数而得到的。一个接口上可能同时有多个密
  码被激活，这是为了平滑地过度到新密码。

**示例**：

```
下面例子讲述了如何创建Key 19 以密码8ry4222:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip ospf message-digest-key 10 md5 xvv560qle
Switch(config-if)# ip ospf message-digest-key 19 md5 8ry4222
下面例子讲述了如何创建Key 2 密文密码91c38996a1aa5699:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip ospf message-digest-key 2 md5 8 91c38996a1aa5699
```

**相关命令**：area authentication、service password-encryption、ip ospf authentication

### 6.3.22 `ip ospf mtu`

**功能**：使用此命令设定端口发送数据库描述(DD)报文时所填入的MTU 值，使用关键字no 恢
  复端口MTU 为默认值。

**语法**：

```
ip ospf mtu MTU-VALUE

no ip ospf mtu
```

| 参数 | 说明 |
| --- | --- |
| MTU-VALUE | MTU 值 576-65535 |

**命令模式**：端口配置模式

**默认配置**：由接口mtu 决定

**使用说明**：

当OSPF 组装报文的时候，默认会将接口的MTU 值填进去，该命令可以强制报文里使
  用用户配置的MTU 值。这个命令配置的MTU 值不会写进kernel。

**示例**：

```
下面例子讲述了如何配置接口发送OSPF DD 报文的MTU:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip ospf mtu 1280
```

**相关命令**：ip ospf mtu-ignore

### 6.3.23 `ip ospf mtu-ignore`

**功能**：使用此命令设置端口接收数据库描述报文时，忽略对MTU 字段的检测。
  使用关键字no 设置对数据库描述报文的MTU 字段进行检测。

**语法**：

```
ip ospf mtu-ignore
no ip ospf mtu-ignore
```

**命令模式**：端口配置模式

**默认配置**：默认接口启用MTU 的匹配功能。

**使用说明**：

OSPF 检查邻居是否使用相同的MTU 值。这个检查发生在互相交换数据库描述报文时，
  如果在接收到的DD 报文里的MTU 高于入接口上配置的 MTU，OSPF 邻接将无法建立。

**示例**：

```
下面例子讲述了如何设置在端口上接收到DD 报文时不对MTU 值进行检测:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip ospf mtu-ignore
```

**相关命令**：ip ospf mtu

### 6.3.24 `ip ospf priority`

**功能**：使用此命令设置路由器端口优先权，这个值被用来在网络中选举指定路由器。使用关
  键字no 恢复端口优先权为默认值。

**语法**：

```
ip ospf priority NUMBER-VALUE
no ip ospf priority
```

| 参数 | 说明 |
| --- | --- |
| NUMBER-VALUE | 指定路由的优先级 0-255 |

**命令模式**：端口配置模式

**默认配置**：优先级为1。

**使用说明**：

端口的默认优先权值为1。
  端口的优先权主要用来选举网络中的DR 和BDR；优先级高的会被选举为DR。
  如果优先级相等，则Router-ID 大的会被选举为DR；如果某一个端口的优先级被设置
  为0，则此端口不会参加DR 和BDR 的选举。.端口优先级只在多路访问的网络中起作
  用，也就是说，对点对点网络无效。

**示例**：

```
下面例子讲述了如何配置OSPF 的接口优先级为4:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip ospf priority 4
```

**相关命令**：ip ospf network、neighbor (OSPF)

### 6.3.25 `ip ospf retransmit-interval`

**功能**：使用此命令设置在邻接间交换LSA 报文时的重传时间间隔，使用关键字no 恢复在邻接
  间交换LSA 报文时的重传时间间隔为默认值。

**语法**：

```
ip ospf retransmit-interval SECONDS
no ip ospf retransmit-interval
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 重传时间间隔，以秒为单位。默认5 秒 1-65535 秒 |

**命令模式**：端口配置模式

**默认配置**：默认为5 秒。

**使用说明**：

当一个路由器发送LSA 报文到它的邻居时，它会缓存该报文直到收到邻居的确认报文。
  如果在重传时间间隔内没有收到确认报文，该LSA 将被重传。设置该值必须要谨慎，
  以免引起不必要的重传。通常，这个值要大于两个路由器之间的报文往返延迟。

**示例**：

```
下面例子讲述了如何设置接口的LSA 报文交换时候的重传时间为:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip ospf retransmit-interval 8
```

**相关命令**：无

### 6.3.26 `ip ospf transmit-delay`

**功能**：使用此命令设置端口发送一个LSA 报文的延迟时间，使用关键字no 恢复此时间为默认
  值。

**语法**：

```
ip ospf transmit-delay SECONDS
no ip ospf transmit-delay
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 延迟时间，以秒为单位。默认1 秒 1-65535 |

**命令模式**：端口配置模式

**默认配置**：默认为1 秒

**使用说明**：

LSA 在本路由器的链路状态数据库(LSDB)中会随时间老化(每秒钟加1)，但在网络的传
  输过程中却不会，所以有必要在发送之前在LSA 的老化时间上增加一定的延迟时间。
  此配置对低速率的网络尤其重要。

**示例**：

```
下面例子讲述如何设置LSA 报文的延迟时间:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip ospf transmit-delay 3
```

**相关命令**：无

### 6.3.27 `ip ospf network`

**功能**：使用此命令设置端口所接入的网络类型，使用关键字no 恢复端口所接入的网络类型为
  默认值。

**语法**：

```
ip ospf network ( broadcast | non-broadcast | point-to-multipoint [ non-broadcast ] |
point-to-point )
no ip ospf network
```

| 参数 | 说明 |
| --- | --- |
| broadcast | 广播网络(如以太网，FDDI) - |
| non-broadcast | NBMA 网络 |
| point-to-multipoint | 点对多点网络 |
| point-to-point | 点对点网络 |

**命令模式**：端口配置模式

**默认配置**：根据网络类型来决定

**使用说明**：

缺省情况下，接口的网络类型根据物理接口而定。以太网接口的网络类型为broadcast，
  串口的网络类型为p2p，ATM 接口的网络类型为nbma。如果在广播网络上有不支持
  组播地址的路由器，可以将接口的网络类型改为NBMA。也可以将接口的网络类型由
  NBMA 改为广播。这样，就不必再配置邻居路由器。
  一个 NBMA 类型的网络可以改为广播类型的条件是：任意两台路由器之间都有一条虚
  电路直接可达，或者说，这个网络是全连通的。如果网络不满足这个条件，必须将接
  口的网络类型改为点到多点。这样，两台不能直接可达的路由器之间可以通过一台与
  两者都直接可达的路由器来交换路由信息。接口的网络类型改为点到多点后，就不必
  再配置邻居路由器。如果同一网段内只有两台路由器运行OSPF 协议，也可以将接口
  的网络类型改为点到点。

**示例**：

```
下面的例子讲述了如何配置OSPF 的NBMA 网络:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip address 192.168.77.17/24
Switch(config-if)# ip ospf network non-bradcast
```

**相关命令**：Neighbor (OSPF)

### 6.3.28 `neighbor (OSPF)`

**功能**：使用此命令在非广播网络内设置与本路由器直接相连的路由器，即此路由器的邻居，
  使用关键字no 取消此关联。

**语法**：

```
neighbor IP_ADDR { priority NUMBER | poll-interval SECONDS }
neighbor IP_ADDR ( cost COST | )
no neighbor IP_ADDR { priority | poll-interval }
no neighbor IP_ADDR ( cost | )
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 邻居的IP 地址 IPv4 地址 |
| priority NUMBER | (可选)接口的优先级，默认值是0，这个参数对NBMA 0-255 接口有效，对点到多点接口无效 |
| poll-interval |  |
| cost |  |

**命令模式**：路由模式

**默认配置**：默认没有指定。

**使用说明**：

一般而言，OSPF 会使用Hello 协议自动发现，建立和维持邻居关系；
  但是在NBMA 和Point-to-Multipoint 网络中，有时候需要此命令手工配置邻居。
  就算是邻居路由器失效了，系统还是需要向该邻居发送hello 报文，但是发送报文的频
  率将会降低，此时发送的时间间隔就是轮询值(poll-interval)。一台路由器启动时，会
  向优先级大于0 的接口发送Hello 报文。当网段上选举出DR 和BDR 之后，它们就会
  向所有的邻居发送Hello 报文，建立邻接关系。

**示例**：

```
下面例子讲述了在非广播网络中的地址为192.168.3.4 的路由器，将其优先级配置为1，
轮询时间配置为180:
Switch# configure terminal
Switch(config)# router ospf
Switch(config-router)# neighbor 192.168.3.4 priority 1 poll-interval 180
```

**相关命令**：ip ospf priority

### 6.3.29 `network area (OSPF)`

**功能**：使用此命令配置将接口加入指定的OSPF 区域，使用该命令的no 形式将接口退出
  OSPF 域。

**语法**：

```
network { IP_ADDR WILDCARD-MASK | IP-ADDRESS/PREFIX-LENGTH } area AREA-ID
no network { IP-ADDRESS WILDCARD-MASK | IP-ADDRESS/PREFIX-LENGTH } area
AREA-ID
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 邻居IP 地址 IPv4 地址 |
| WILDCARD-MASK | 地址掩码 IPv4 掩码 |
| PREFIX-LENGTH | 掩码长度 1-32 |
| AREA-ID | 区域ID，可以用十进制或 IP 地址表示 IP 地址或0-4294967295 的整数 |

**命令模式**：路由模式

**默认配置**：默认不开启。

**使用说明**：

将IP 地址和地址掩码一起使用可以将1 个或多个接口加入指定的OSPF 域。

**示例**：

```
下面例子创建了OSPF 进程109，并且指定了4 个区域0，2，3 和10.9.50.0:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip address 10.108.20.1/24
Switch(config)# router ospf 109
Switch(config-router)# network 10.108.20.0/24  area 10.9.50.0
Switch(config-router)# network 10.108.0.0/16  area 2
Switch(config-router)# network 10.109.10.0/24  area 3
Switch(config-router)# network 0.0.0.0/0 area 0
```

**相关命令**：router ospf

### 6.3.30 `overflow database external`

**功能**：使用此命令用来配置OSPF 的LSDB 中External LSA 的最大条目数以及从溢出状态恢复
  的时间，使用关键字no 将配置恢复为默认值。

**语法**：

```
overflow database external MAXLSAS RECOVERTIME
no overflow database external
```

| 参数 | 说明 |
| --- | --- |
| MAXLSAS | LSA 条目数的最大值，请注意，这个值应该在AS 中所有路由器上都应该是相同的 0-2147483647 |
| RECOVERTIME | 恢复时间，如果LSA 的个数已经超出限制，那么会等待一个恢复时间，等这个时间到的时候，再看看是否可以重新添加新的lsa 0-65535 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

使用该命令来限制一个路由器可以接收的外部LSA 的数量。如果是在邻接建立过程中，
  收到的外部LSA 超过了此处所定义的数量，那么邻居状态将一直处于Loading 状态。

**示例**：

```
下面例子讲述了如何配置路由器可以接收的外部LSA 的最大数量:
Switch# configure terminal
Switch(config)# router ospf 200
Switch(config-router)# network 10.108.0.0/16 area 0
Switch(config-router)# overflow database external 5 3
```

**相关命令**：router ospf

### 6.3.31 `passive-interface (OSPF)`

**功能**：使用此命令抑制端口发送Hello 报文，使用关键字no 取消端口对发送Hello 报文的抑
  制。

**语法**：

```
passive-interface IFNAME
no passive-interface IFNAME
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名字支持 |
| physical/aggregation/loopb | ack/tunnel/vlan 端口 |

**命令模式**：路由模式

**默认配置**：默认不开启。

**使用说明**：

如果在接口上禁用路由更新报文的发送，那么此接口还是能正常接收和处理OSPF 报文
  的。

**示例**：

```
下面例子讲述了如何将端口1 设为被动接口:
Switch# configure terminal
Switch(config)# router ospf 200
Switch(config-router)# network 10.108.0.0/16 area 0
Switch(config-router)# passive-interface eth-0-1
```

**相关命令**：router ospf

### 6.3.32 `redistribute (OSPF)`

**功能**：此命令设置路由重发布，即把别的路由协议生成的路由引入到OSPF 路由域。使用该命
  令的no 形式取消路由重发布。

**语法**：

```
redistribute PROTOCOL [ route-map WORD ] [ tag TAG-VALUE ] [ metric METRIC-
VALUE ] [ metric-type TYPE-VALUE ]
no redistribute PROTOCOL [ metric METRIC -VALUE ] [ metric-type TYPE-VALUE ]
```

| 参数 | 说明 |
| --- | --- |
| route-map WORD | 路由策略长度不超过20 个字符的字符串 |
| PROTOCOL | (可选)路由协议名包含静态路由，直连路由， RIP，BGP 路由 |
| tag TAG-VALUE | 设置重发布进OSPF 路由的TAG 0-4294967295 |
| metric METRIC-VALUE | (可选)重发布路由时候的 Metric 值，默认20 0-16777214 |
| metric-type TYPE-VALUE | 对于OSPF，有两种类型的外部路由 1-2 |

**命令模式**：路由模式

**默认配置**：默认重发布不开启。 metric metric-value：默认值20。 metric-type type-value：类型2 的外部路由。

**使用说明**：

在该命令里配置的metric 值将覆盖用命令default metric 配置的值。
  外部路由是指到达自治系统外部的路由。
  Type-1 外部路由指接收的IGP 路由，如RIP 和STATIC。此类路由有较高的可靠性，所
  以外部路由开销的计算结果等于自治系统的内部路由开销，并可与OSPF 本身的路由
  
  开销相比较。也就是说，到达Type-1 外部路由的开销等于路由器到达对应ASBR 的开
  销加上ASBR 到达目的地址的开销。
  Type-2 外部路由指接收的EGP 路由。此类路由可靠性较低，所以OSPF 协议认为从
  ASBR 到达自治系统外部的路由开销要远远高于自治系统内部到达ASBR 的路由开销。
  因此在计算路由开销时主要考虑前者。也就是说，到达Type-2 外部路由的开销等于
  ASBR 到达目的地址的开销。

**示例**：

```
下面例子讲述了如何重发布静态路由并将其Metric 设置为10:
Switch# configure terminal
Switch(config)# router ospf 119
Switch(config-router)# network 10.108.0.0/16 area 100
Switch(config-router)# redistribute static metric 10
```

**相关命令**：default-metric

### 6.3.33 `router-id (OSPF)`

**功能**：使用此命令设置路由器标识为指定的值，使用关键字no 设置标识为默认值。

**语法**：

```
router-id IP_ADDR
no router-id
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | IP 地址 IPv4 地址 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

此参数是OSPF 协议中一个很重要的参数；在OSPF 协议中，路由器ID 号是一个32 比
  特无符号整数，是一台路由器在OSPF 自治系统中的唯一标识。用户可以自行指定路由
  
  器ID 号。如果用户没有指定路由器ID 号，则路由器会自动从已配置的接口的IP 地址
  中选一个作为本机的ID 号。在选择路由器ID 时，环回接口上的IP 地址优于普通接口
  上的IP 地址；若都是普通接口，则选择接口IP 最大的作为路由器ID。若路由器的所有
  接口上都未配置IP 地址，则必须在OSPF 视图下配置路由器ID 号，否则OSPF 将无法
  运行。 在手工设置路由器ID 号时，必须保证自治系统中任意两台路由器ID 号都不相
  同。为此，不妨选择某个接口的IP 地址作为本机ID 号。若在已经有邻居的路由器上用
  此命令更改了路由器ID，则该ID 必须重新启用OSPF 协议才能生效。

**示例**：

```
下面例子讲述了如何配置OSPF 的Route-id:
Switch# configure terminal
Switch(config)# router ospf 119
Switch(config-router)# router-id 10.1.1.1
```

**相关命令**：clear ip ospf、router ospf

### 6.3.34 `router ospf`

**功能**：使用此命令创建OSPF 进程并进入OSPF 配置模式，使用关键字no 关闭OSPF 进程。

**语法**：

```
router ospf [ PROCESS-ID [ vrf VPN-NAME ] ]
no router ospf [ PROCESS-ID ]
```

| 参数 | 说明 |
| --- | --- |
| PROCESS-ID | OSPF 进程编号；如果未指定，则进入0 号进程。使用关键字no 关闭OSPF 进程时，如果没有指定进程编号，则关闭OSPF 的0 号进程；否则只关闭指定的 OSPF 进程 1-65535 |
| vrf VPN-NAME | (可选)VPN 中的OSPF 的进程长度不超过31 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：默认无配置。

**使用说明**：

您可以在一台路由器上创建多个OSPF 进程，如果没有指定进程编号，则创建默认的0
  号进程。

**示例**：

```
下面例子讲述如何创建OSPF 进程号为109:
Switch# configure terminal
Switch(config)# router ospf 109
Switch(config-router)#
```

**相关命令**：network area

### 6.3.35 `ospf restart`

**功能**：使用该命令使能ospf 的GR 功能，使用关键字no 关闭该功能。

**语法**：

```
ospf restart ietf
no ospf restart ietf
```

**命令模式**：全局配置模式

**默认配置**：默认关闭

**使用说明**：

只支持IETF 标准的OSPF GR，并且不支持计划重启。

**示例**：

```
下面的例子使能了ospf GR 功能:
Switch# configure terminal
Switch(config)# ospf restart ietf
```

**相关命令**：无

### 6.3.36 `ospf restart helper`

**功能**：使用该命令使能ospf 的GR Helper 功能，使用关键字no 关闭该功能。

**语法**：

```
ospf restart helper enable
no ospf restart helper enable
```

**命令模式**：全局配置模式

**默认配置**：默认关闭

**使用说明**：

只支持IETF 标准的OSPF GR helper 功能。

**示例**：

```
下面的例子使能了ospf GR Helper 功能:
Switch# configure terminal
Switch(config)# ospf restart helper enable
```

**相关命令**：无

### 6.3.37 `ospf restart period`

**功能**：使用该命令配置ospf 的GR 间隔时间，使用关键字no 恢复默认值。

**语法**：

```
ospf restart grace-period SECONDS
no ospf restart grace-period
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 设备处于GR 状态的最长时间 1-1800 |

**命令模式**：全局配置模式

**默认配置**：120 seconds

**使用说明**：

无

**示例**：

```
下面的例子设置了ospf 的GR 重启间隔时间:
Switch# configure terminal
Switch(config)# ospf restart grace-period 200
```

**相关命令**：无

### 6.3.38 `summary-address (OSPF)`

**功能**：使用此命令对外部路由进行汇总，使用关键字no 取消汇总。

**语法**：

```
summary-address PREFIX/PREFIX-LENGTH ( not-advertise | tag TAG-VALUE | )
no summary-address PREFIX/PREFIX-LENGTH ( not-advertise | tag TAG-VALUE | )
```

| 参数 | 说明 |
| --- | --- |
| PREFIX | IP 路由的前缀 IPv4 地址 |
| PREFIX-LENGTH | 前缀长度 1-32 |
| not-advertise | (可选) 如果指定了此项，则对指定网络的外部路由不进行宣告 |
| tag TAG-VALUE | 路由标记，默认为0 0-4294967295 |

**命令模式**：路由模式

**默认配置**：缺省情况下，不对外部路由进行聚合。

**使用说明**：

从其他路由协议学到的路由可以在ASBR 上进行汇总，汇总路由里的metric 值选择的
  是所有被汇总的路由里值最大的一个。该命令可以用来帮助减少路由表的大小。配置
  summary-address 命令后，对处于聚合地址范围内的外部路由，本地路由器只向邻居
  路由器发布一条聚合后的路由。您可以使用命令area range 对OSPF 区域间的路由进
  行汇总。OSPF 不支持summary-address 0.0.0.0/0 这样的命令。

**示例**：

```
下面例子讲述了如何配置汇总路由，汇总路由10.1.0.0 包括了子网10.1.1.0， 10.1.2.0，
10.1.3.0 等等此时，只有10.1.0.0 这条汇总路由会被发布出去:
Switch# configure terminal
Switch(config)# router ospf
Switch(config-router)# summary-address 10.1.0.0/16
```

**相关命令**：area range

### 6.3.39 `show ip ospf`

**功能**：使用此命令查看指定OSPF 路由进程相关信息。

**语法**：

```
show ip ospf ( PROCESS-ID | )
```

| 参数 | 说明 |
| --- | --- |
| PROCESS-ID | OSPF 进程号,可以是任意有效整数，但是每个OSPF 进程的ID 必须是唯一的。 0-65535 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子讲述了如何查看OSPF 的进程信息:
Switch# show ip ospf
 Routing Process "ospf 100" with ID 11.11.11.11
 Process uptime is 0 minute
 Process bound to VRF default
 Conforms to RFC2328, and RFC1583 Compatibility flag is disabled
 Supports only single TOS(TOS0) routes
 Supports opaque LSA
 SPF schedule delay 5 secs, Hold time between two SPFs 10 secs
 Refresh timer 10 secs
 Number of incomming current DD exchange neighbors 0/5
 Number of outgoing current DD exchange neighbors 0/5
 Number of external LSA 0. Checksum 0x000000
 Number of opaque AS LSA 0. Checksum 0x000000
 Number of non-default external LSA 0
 External LSA database is unlimited.
 Number of LSA originated 1
 Number of LSA received 3
 Number of areas attached to this router: 1

    Area 1
        Number of interfaces in this area is 1(1)
        Number of fully adjacent neighbors in this area is 1
        Number of fully adjacent virtual neighbors through this area is 0
        Area has no authentication
        SPF algorithm last executed 00:00:38.995 ago
        SPF algorithm executed 1 times
        Number of LSA 4. Checksum 0x0235ff
```

**相关命令**：无

### 6.3.40 `show ip ospf border-routers`

**功能**：使用此命令查看指定OSPF 路由进程的ABR 和ASBR 信息。

**语法**：

```
show ip ospf border-routers
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示了查看ABR 路由器的输出结果:
Switch# show ip ospf border-routers
OSPF process 100 internal Routing Table
Codes: i - Intra-area route, I - Inter-area route
i 22.22.22.22 [1] via 172.10.1.2, eth-0-10, ABR, Area 1
```

**相关命令**：无

### 6.3.41 `show ip ospf database`

**功能**：使用此命令查看指定OSPF 路由进程的链路状态数据库信息。

**语法**：

```
show ip ospf ( PROCESS-ID | ) database database-summary
show ip ospf ( PROCESS-ID | ) database ( self-originate | max-age | adv-router IP_ADDR
| )
show ip ospf ( PROCESS-ID | ) database ( asbr-summary | external | network | router |
summary | nssa-external | opaque-link | opaque-area | opaque-as ) ( self-originate |
adv-router IP_ADDR | )
show ip ospf ( PROCESS-ID | ) database ( asbr-summary | external | network | router |
summary | nssa-external | opaque-link | opaque-area | opaque-as ) LINK-STATE-ID
( self-originate | adv-router A.B.C.D | ) ]
```

| 参数 | 说明 |
| --- | --- |
| PROCESS-ID | (可选) OSPF 进程号,可以是任意有效整数，但是每个 OSPF 进程的ID 必须是唯一的。 1-65535 |
| adv-router IP_ADDR | (可选) 查看指定OSPF 宣告路由器的LSA 信息 IPv4 地址 |
| LINK-STATE-ID | (可选) 查看自治系统边界路由器的汇总LSA 信息 IPv4 地址 |
| asbr-summary | (可选) 查看自治系统边界路由器的汇总LSA 信息 |
| external | (可选) 查看指定OSPF 路由进程的外部LSA 信息 |
| network | (可选) 查看指定OSPF 路由进程的网络LSA 信息 |
| router | (可选) 查看指定OSPF 路由进程的路由器LSA 有关信息 |
| self-originate | (可选) 查看路由器自生成 LSA 信息 |
| summary | (可选) 查看区域边界路由器- 汇总LSA 信息 |
| nssa-external | (可选) 查看指定OSPF 路由进程的type 7 LSA 有关信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子讲述了如何使用此命令来查看相关的信息:
Switch# show ip ospf database
                Router Link States (Area 3 [Stub])
Link ID         ADV Router      Age  Seq#       CkSum  Link count
10.0.0.1        10.0.0.1         546 0x80000089 0x4567 1
```

**相关命令**：无

### 6.3.42 `show ip ospf interface`

**功能**：使用此命令显示OSPF 接口的信息。

**语法**：

```
show ip ospf interface ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | (可选) 接口名字，未指定意为全选支持 |
| physical/aggregation/loopb | ack/tunnel/vlan 端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子讲述了如何显示OSPF 的接口信息:
Switch# show ip ospf interface eth-0-3
eth-0-3 is up, line protocol is up
  Internet Address 3.3.3.1/24, Area 3 [Stub], MTU 1500
  Process ID 0, Router ID 10.0.0.1, Network Type NBMA, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1
  Designated Router (ID) 10.0.0.1, Interface Address 3.3.3.1
  No backup designated router on this network
  Timer intervals configured, Hello 30, Dead 120, Wait 120, Retransmit 5
    Hello due in 00:00:17
  Neighbor Count is 1, Adjacent neighbor count is 0
  Crypt Sequence Number is 1218176990
  Hello received 0 sent 80, DD received 0 sent 0
  LS-Req received 0 sent 0, LS-Upd received 0 sent 0
  LS-Ack received 0 sent 0, Discarded 0
```

**相关命令**：无

### 6.3.43 `show ip ospf neighbor`

**功能**：使用此命令查看指定OSPF 路由进程的邻居信息。

**语法**：

```
show ip ospf neighbor [ IFNAME ] [ NEIGHBOR-ID ] [ detail ] [ all ]
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | (可选) 接口名字，未指定意为全选 |
| NEIGHBOR-ID | (可选) 邻居ID |
| detail | (可选) 查看邻居的详细信息 - |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子讲述如何查看OSPF 邻居的信息:
Switch# show ip ospf neighbor
Neighbor ID     Pri State         Dead Time Address          Interface
10.199.199.137    1 FULL/DR       0:00:31   192.168.80.37   eth-0-1
172.16.48.1        1 FULL/DROTHER 0:00:33   172.16.48.1     vlan1
172.16.48.200      1 FULL/DROTHER 0:00:33   172.16.48.200  vlan2
10.199.199.137     5 FULL/DR       0:00:33   172.16.48.189  eth-0-2
```

**相关命令**：无

### 6.3.44 `show ip ospf summary-address`

**功能**：使用该命令显示OSPF 的汇总路由信息。

**语法**：

```
show ip ospf summary-address
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

度量值为16777215 的路由不对外发布。

**示例**：

```
下面例子讲述了如何使用此命令:
Switch# show ip ospf summary-address
OSPF process 0:
10.0.0.0/8 Metric 20, Type 2, Tag 0
20.0.0.0/8 Metric 16777215, Type 0, Tag 0
```

**相关命令**：无

### 6.3.45 `show ip ospf route summary`

**功能**：使用此命令显示OSPF 路由的信息汇总。

**语法**：

```
show ip ospf ( PROCESS-ID | ) route summary
```

| 参数 | 说明 |
| --- | --- |
| PROCESS-ID | (可选) OSPF 进程ID 0-65535 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子讲述了如何使用此命令:
Switch# show ip ospf route summary
            OSPF Router with ID (10.10.10.10) (Process ID 0)

  Route Type                      Count
  (C)Connected                       1
  (D)Discard                         1
  (O)Intra area                      0
  (IA)Inter area                     0
  (E1)Ext type 1                     0
  (E2)Ext type 2                     0
  (N1)NSSA Ext type 1                0
  (N2)NSSA Ext type 2                0
  Total                              2
```

**相关命令**：无

### 6.3.46 `show ip protocols ospf`

**功能**：使用此命令查看OSPF 协议的参数设置信息。

**语法**：

```
show ip protocols ospf ( vrf WORD )
```

| 参数 | 说明 |
| --- | --- |
| vrf | VPN 转发实例 |
| WORD | VPN 路由转发名字长度不超过31 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子讲述了如何显示OSPF 协议的信息:
Switch# show ip protocols ospf
Routing Protocol is "ospf 0"

  Redistributing:
  Routing for Networks:
  Distance: (default is 110)
```

**相关命令**：无

### 6.3.47 `show ip ospf processes-count`

**功能**：使用此命令查看OSPF processes 当前配置数目和最大允许配置数目。

**语法**：

```
show ip ospf processes-count
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子讲述了如何显示OSPF processes 的当前配置数目和最大配置数目 :
DUT1# show ip ospf processes-count

 OSPF processes current count 0
 OSPF processes max count     200
```

**相关命令**：无

### 6.3.48 `timers spf`

**功能**：使用此命令设置收到拓扑变化报文而计算SPF 的时间,使用此命令的no 形式恢复默认。

**语法**：

```
timers spf SPF-START SPF-HOLD
no timers spf
```

| 参数 | 说明 |
| --- | --- |
| SPF-START | 接收到网络变化报文开始计算SPF 之前的延迟时间， 以秒为单位。 0-2147483647 |
| SPF-HOLD | 连续两次计算SPF 的时间间隔，以秒为单位。 0-2147483647 |

**命令模式**：路由模式

**默认配置**：spf-start：5 秒 spf-hold：10 秒

**使用说明**：

无

**示例**：

```
下面例子讲述了如何设置OSPF 的SPF 计算参数:
Switch# configure terminal
Switch(config)# router ospf 1
Switch(config-router)# router-id 10.10.10.2
Switch(config-router)#timers spf 5 10
Switch(config-router)# redistribute static
Switch(config-router)# network 10.21.21.0/24 area 0
Switch(config-router)# network 10.22.22.0/24 area 00
```

**相关命令**：无

### 6.3.49 `max-concurrent-dd`

**功能**：使用此命令设置能够同时处理的最大DD 报文的数目。
  
  使用关键字no 恢复为默认值。

**语法**：

```
max-concurrent-dd NUMBER-VALUE
no max-concurrent-dd
```

| 参数 | 说明 |
| --- | --- |
| NUMBER-VALUE | 可同时处理的DD 报文的最大数量。 1-65535 |

**命令模式**：路由模式

**使用说明**：

无

**示例**：

```
下面例子讲述了如何配置可同时处理的DD 报文的最大数量:
Switch# configure terminal
Switch(config)# router ospf 100
Switch(config-router)# router-id 10.10.10.2
Switch(config-router)# max-concurrent-dd 10
```

**相关命令**：无

### 6.3.50 `maximum-area`

**功能**：使用此命令设置此OSPF 域中可以配置的最大区域数目，使用关键字no 恢复为默认值。

**语法**：

```
maximum-area NUMBER-VALUE
no maximum-area
```

| 参数 | 说明 |
| --- | --- |
| NUMBER-VALUE | 配置最大的区域数目 1-4294967294 |

**命令模式**：路由模式

**使用说明**：

OSPF 协议为了减少网络中的路由信息流量，并且减少路由器中连接状态数据库的大小，
  对区域进行了划分；可使用此命令设置一个AS 中区域的最大数目。

**示例**：

```
下面例子讲述如何使用此命令:
Switch# configure terminal
Switch(config)# router ospf 100
Switch(config-router)# router-id 10.10.10.2
Switch(config-router)# maximum-area 100
```

**相关命令**：无

### 6.3.51 `refresh timer`

**功能**：使用此命令设置刷新链路状态数据库的时间间隔，使用关键字no 恢复刷新链路状态数
  据库的时间间隔为默认值。

**语法**：

```
refresh timer NUMBER-VALUE
no refresh timer
```

| 参数 | 说明 |
| --- | --- |
| NUMBER-VALUE | 刷新数据库时间间隔 10-1800 |

**命令模式**：路由模式

**默认配置**：10 秒

**使用说明**：

一般不建议用户去修改这个配置。

**示例**：

```
下面例子讲述了如何设置refresh timer:
Switch# configure terminal
Switch(config)# router ospf 100
Switch(config-router)# router-id 10.10.10.2
Switch(config-router)# refresh timer 100
```

**相关命令**：无

### 6.3.52 `ip ospf bfd`

**功能**：使用该命令在接口上使能BFD 和OSPF 联动。
  使用该命令的“no”格式在接口上去使能BFD 和OSPF 联动。

**语法**：

```
ip ospf bfd
no ip ospf bfd
```

**命令模式**：端口配置模式

**默认配置**：默认情况下BFD 和OSPF 联动不使能。

**使用说明**：

使用该命令在接口上使能BFD 和OSPF 联动。
  当OSPF 邻居建立，并且状态达到two-way 以后（不包含two-way），系统建立BFD 会
  话。
  当OSPF 邻居删除或者状态回到two-way 及以前（包含two-way），BFD 会话拆除。

**示例**：

```
这个例子在接口上使能了BFD 和OSPF 联动:
Switch# configure terminal
Switch(config-if)# ip ospf bfd
```

**相关命令**：无

### 6.3.53 `debug ospf`

**功能**：使用该命令打开所有的OSPF 调试开关。使用该命令的no 形式关闭OSPF 调试功能。

**语法**：

```
debug ospf ( all | )
no debug ospf ( all | )
```

| 参数 | 说明 |
| --- | --- |
| all | 打开所有的调试开关 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# debug ospf all
```

**相关命令**：无

### 6.3.54 `debug ospf bfd`

**功能**：使用该命令打开OSPF bfd 调试开关。使用该命令的no 形式关闭OSPF 调试功能。

**语法**：

```
debug ospf bfd
no debug ospf bfd
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# debug ospf bfd
```

**相关命令**：无

### 6.3.55 `debug ospf events`

**功能**：使用该命令打开OSPF 的事件调试开关,不加参数表示打开所有选项。使用该命令的no
  形式关闭OSPF 的事件调试功能。

**语法**：

```
debug ospf events ( abr | asbr | lsa | os | router | vlink | )
no debug ospf events ( abr | asbr | lsa | os | router | vlink | )
```

| 参数 | 说明 |
| --- | --- |
| abr | 打开ABR 调试开关 |
| asbr | 打开ASBR 调试开关 |
| lsa | 打开LSA 调试开关 |
| os | 打开OS 交互调试开关 |
| router | 打开路由器调试开关 |
| vlink | 打开虚链路调试开关 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# debug ospf events lsa
```

**相关命令**：无

### 6.3.56 `debug ospf ifsm`

**功能**：使用该命令打开OSPF 的接口状态机调试开关。使用该命令的no 形式关闭该功能的调
  试开关。

**语法**：

```
debug ospf ifsm ( status | events | timers | )

no debug ospf ifsm ( status | events | timers | )
```

| 参数 | 说明 |
| --- | --- |
| status | 状态调试开关 |
| events | 事件调试开关 |
| timers | 定时器调试开关 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# debug ospf ifsm timers
```

**相关命令**：无

### 6.3.57 `debug ospf nfsm`

**功能**：使用该命令打开OSPF 的邻居状态机调试开关。使用该命令的no 形式关闭该功能的调
  试开关。

**语法**：

```
debug ospf nfsm ( status | events | timers | )
no debug ospf nfsm ( status | events | timers | )
```

| 参数 | 说明 |
| --- | --- |
| status | 状态调试开关 |
| events | 事件调试开关 |
| timers | 定时器调试开关 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# debug ospf nfsm timers
```

**相关命令**：无

### 6.3.58 `debug ospf lsa`

**功能**：使用该命令打开OSPF 的链路状态通告(LSA)调试开关。使用该命令的no 形式关闭该功
  能的调试开关。

**语法**：

```
debug ospf lsa ( flooding | generate | install | maxage | refresh | )
no debug ospf lsa ( flooding | generate | install | maxage | refresh | )
```

| 参数 | 说明 |
| --- | --- |
| flooding | LSA 泛洪调试开关 |
| generate | LSA 生成调试开关 |
| install | LSA 安装调试开关 |
| maxage | LSA 老化调试开关 |
| refresh | LSA 刷新调试开关 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# debug ospf lsa install
```

**相关命令**：无

### 6.3.59 `debug ospf packet`

**功能**：使用该命令打开OSPF 的报文调试开关，使用该命令的no 形式关闭该功能的调试开关。

**语法**：

```
debug ospf packet PARAMETERS
no debug ospf packet PARAMETERS
PARAMETERS = dd | detail | hello | ls-ack | ls-request | ls-update | recv | send
```

| 参数 | 说明 |
| --- | --- |
| dd | 数据库描述报文调试开关 |
| detail | 报文详细信息调试开关 |
| hello | hello 报文调试开关 |
| ls-ack | 链路状态确认报文调试开关 - |
| ls-request | 链路状态请求报文调试开关 - |
| ls-update | 链路状态更新报文调试开关 - |
| recv | 打开报文接收的开关 |
| send | 打开报文发送的开关 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# debug ospf packet dd send detail
```

**相关命令**：无

### 6.3.60 `debug ospf route`

**功能**：使用该命令打开路由计算调试开关,未指定参数就打开所有选项。使用该命令的no 形
  式关闭该功能的调试开关。

**语法**：

```
debug ospf route ( ase | ia | install | spf | )
no debug ospf route ( ase | ia | install | spf | )
```

| 参数 | 说明 |
| --- | --- |
| ase | 外部路由计算调试开关 |
| ia | 域间路由计算调试开关 |
| install | 路由计算调试开关 |
| spf | SPF 计算调试开关 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# debug ospf route install
```

**相关命令**：无

### 6.3.61 `show debugging ospf`

**功能**：使用该命令查看OSPF 的调试开关状态。

**语法**：

```
show debugging ospf
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了OSPF 调试开关的状态信息:
Switch# show debugging ospf
OSPF debugging status:
  OSPF packet Hello send debugging is on
  OSPF packet Database Description send debugging is on
  OSPF packet Link State Request send debugging is on
  OSPF packet Link State Update send debugging is on
  OSPF packet Link State Acknowledgment send debugging is on
  OSPF route installation debugging is on
```

**相关命令**：无

### 6.3.62 `show resource ospf`

**功能**：使用该命令来显示OSPF 路由占用的硬件资源统计。

**语法**：

```
show resource ospf
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

只有在使用OSPF 之后，Capability 的数值才不为0。

**示例**：

```
下面的例子显示了使用命令show resource ospf 的输出结果:
Switch# show resource ospf
OSPF
Resource                 Used          Capability
================================================
Routes                   1              6144
```

**相关命令**：show ip ospf route summary

### 6.3.63 `min-lsa-interval`

**功能**：使用该命令来设置相同LSA 之间的时间间隔

**语法**：

```
min-lsa-interval SECONDS
no min-lsa-interval
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 发送相同LSA 的最小时间间隔 0-10 |

**命令模式**：路由模式

**默认配置**：默认时间间隔为5

**使用说明**：

只有在使用OSPF 之后，
  才能配置该值，
  范围为0-10

**示例**：

```
接下来的例子显示了如何配置MinLSInterval:
Switch# configure terminal
Switch(config)# router ospf
Switch(config-router)# min-lsa-interval 3
```

**相关命令**：无、6.4 Route-map 命令


## 6.4 Route-map 命令

### 6.4.1 `route-map`

**功能**：在全局配置模式下，使用route-map 的match 和set 命令，来定义各个路由协议间进
  行重分布的条件，或者启用BGP 协议的条件路由功能。删除route-map 的条目，使用
  相应的no 命令。

**语法**：

```
route-map MAP_TAG ( deny | permit | ) ( SEQUENCE-NUMBER | )
no route-map MAP_TAG ( deny | permit | ) ( SEQUENCE-NUMBER | )
```

| 参数 | 说明 |
| --- | --- |
| MAP_TAG | Route-map 的一个有意义的名字。路由重分布命令使用这个名字来引用这个 route-map。多个route- map 的序列可以共享同一个route-map 名。 Route- map 的名字长度不得超过 20，并且它的首字母必须是’a’-‘z’, ‘A’-‘Z’或者’0’-‘9’ |
| permit | (可选) 如果route-map 的 match 规则被匹配到了，并且指定了permit 关键字， 这个路由将会像set 动作所指定的规则那样进行重分布。如果没满足match 规则，也指定了permit 关键字，那将会去匹配策略表的下一个节点，如果所有的节点都没能匹配上那就不会重发布。 |
| deny | (可选) 如果route-map 的 match 规则被匹配到了，这个路由将不会被重分布 |
| SEQUENCE-NUMBER | (可选) route-map 的序列号，表示这个route-map 在同一个route-map 名中所处的位置。如果使用了相应的 no 命令，这个序列将会被删除 1-65535 |

**命令模式**：全局配置模式

**默认配置**：默认使用permit 关键字。

**使用说明**：

无

**示例**：

```
下面的例子描述了如何创建一个route-map 并进入route-map 配置模式:
Switch# configure terminal
Switch(config)# route-map rip-to-ospf permit
Switch(config-route-map)# match metric 1
Switch(config-route-map)# set metric 2
```

**相关命令**：match as-path、match community、match interface、match ip address、match local-preference、match metric、match origin、match route-type、match tag、set aggregator、set as-path、set atomic-aggregate、set comm-list、set community、set dampening、set extcommunity、set ip address、set local-preference、set metric、set metric-type、set origin、、set originator-id、set tag、set vpnv4、set weight

### 6.4.2 `match as-path`

**功能**：使用这个命令来匹配一个自治系统路径的ACL。
  使用no 参数来删除这个条目。
  match as-path 命令制定了自治系统匹配的路径。如果设置了这条命令的permit 规则，
  路由将会被set 规则所重分布或者被控制。反之， 如果match 规则被匹配到，但是配
  置的是deny 规则的话，路由将不会被重分布或者控制。如果没有任何match 规则被匹
  配的话，这个路由将不会被重分布。
  被route-map 策略所指定的路由可能跟路由协议所指定的不一样。设置这种策略会让
  报文发往不同的路径，如何转发则取决于他们的长度和内容。被策略所转发的报文会
  覆盖路由表指定要转发的报文。

**语法**：

```
match as-path LISTNAME
no match as-path
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | 指定自治系统路径的ACL 名不超过40 字符的字符串 |

**命令模式**：Route-map 模式

**默认配置**：默认match as-path 不设置。

**使用说明**：

这个命令只在BGP 协议中起作用。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map myroute deny 34
Switch(config-route-map)# match as-path myaccesslist
```

**相关命令**：match metric、match ip address、match community、set as-path、set community

### 6.4.3 `match community`

**功能**：使用这个命令来指定匹配的团体属性(community)号。
  使用相应的no 命令来删除这个条目。
  Community 是用来过滤路由和建立路由组用的。它们在大规模的路由上使用match 或
  者set 命令来启用策略。Community 表使用一组路由的共通属性来识别和过滤这组路
  由。
  match community 命令设置的match 值会覆盖全局值，如果有路由没有满足任何一个
  match 规则的话，这个路由将会被忽略。

**语法**：

```
match community WORD
no match community
```

| 参数 | 说明 |
| --- | --- |
| WORD | Community 表的名字不超过20 字符的字符串 |

**命令模式**：Route-map 模式

**默认配置**：默认match community 不设置。

**使用说明**：

这个命令只在BGP 协议中起作用。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map myroute permit 3
Switch(config-route-map)# match community mylist
```

**相关命令**：match ip address、match as-path、set as-path、set community、match metric

### 6.4.4 `match interface`

**功能**：使用这个命令来定义一个针对接口的match 规则。
  使用相应的no 命令来删除这个规则。匹配路由信息的出接口。

**语法**：

```
match interface IFNAME
no match interface
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 待匹配的接口名支持 |
| physical/aggregation/loopb | ack/tunnel/vlan 端口 |

**命令模式**：Route-map 模式

**默认配置**：默认match interface 不设置。

**使用说明**：

这个命令只在BGP 协议中起作用。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map mymap1 permit 10
Switch(config-route-map)# match interface eth-0-1
```

**相关命令**：match tag、match route-type external

### 6.4.5 `match ip address`

**功能**：使用这个命令来指定match 一个ACL 的规则。
  使用相应的no 命令来删除这个规则。
  match ip address 命令指定匹配了一个ACL， 如果指定了一个permit 的match 规则的
  话，路由将会被像set 规则指定的那样进行重发布或者进行控制。相反，如果制定了相
  应的deny 规则的话，满足条件的路由将不会被重发布或者控制。如果没有匹配到任何
  规则的话，路由将不会被接受或者转发。被策略指定的路由最好不要跟路由协议指定
  的路由一样。指定策略会导致报文根据他们的长度或者内容经过不同的路由转发。报
  文转发规则的优先级是策略转发大于普通的路由转发。

**语法**：

```
match ip address ACCESSSLISTID
no match ip address
```

| 参数 | 说明 |
| --- | --- |
| ACCESSSLISTID | 指定IPV4 ACL 名 |

**命令模式**：Route-map 模式

**默认配置**：默认match ip address 不设置。

**使用说明**：

这个命令对BGP，OSPF，RIP 和策略路由(PBR)有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map myroute permit 3
Switch(config-route-map)# match ip address List1
```

**相关命令**：match community、match as-path、set as-path、set community、match metric

### 6.4.6 `match ip address prefix-list`

**功能**：用这个命令来匹配前缀列表条目；使用相应的no 命令来删除这个规则。
  如果匹配了前缀并且指定是permit 的语法的话，路由将会被重发布或者被set 语法所
  受控。如果满足了match 条件但是制定了deny 语法的话，路由将不会被重发布或者被
  set 语法受控。如果没有满足match 条件，无论指定了permit 还是deny 语法，路由都
  不会被接收或者转发。
  被指定的路由不能跟路由协议相同，指定的策略让报文能够按照他们的长度及内容通
  过不同的路由进行转发。相对于路由表指定的路径来说，报文将会优先以配置的策略
  来进行转发。

**语法**：

```
match ip address prefix-list LISTNAME
no match ip address prefix-list [ LISTNAME ]
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | IP 前缀列表名不超过40 字符的字符串 |

**命令模式**：Route-map 模式

**默认配置**：默认match ip addressprefix-list 不设置。

**使用说明**：

这个命令对BGP，OSPF，RIP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# match ip address prefix-list mylist
```

**相关命令**：match community、match as-path、set as-path、set community、match metric

### 6.4.7 `match ip next-hop`

**功能**：使用这个命令来指定match 一个下一跳的IP 地址。
  使用相应的no 命令来删除这个规则。
  如果匹配了nexthop 地址并且指定是permit 的语法的话，路由将会被重发布或者被
  set 语法所受控。如果满足了match 条件但是制定了deny 语法的话，路由将不会被重
  发布或者被set 语法受控。如果没有满足match 条件，无论指定了permit 还是deny
  语法，路由都不会被接收或者转发。

**语法**：

```
match ip next-hop ACCESSSLISTID
no match ip next-hop [ ACCESSSLISTID ]
```

| 参数 | 说明 |
| --- | --- |
| ACCESSSLISTID | 指定IPV4 ACL 名不超过40 字符的字符串 |

**命令模式**：Route-map 模式

**默认配置**：默认match ip next-hop 不设置。

**使用说明**：

这个命令对BGP，OSPF，RIP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# match ip next-hop mylist
```

**相关命令**：match community、match as-path、set as-path、set community、match metric

### 6.4.8 `match ip next-hop prefix-list`

**功能**：用这个命令来匹配下一跳的前缀列表条目。
  使用相应的no 命令来删除这个规则。

**语法**：

```
match ip next-hop prefix-list LISTNAME
no match ip next-hop prefix-list [ LISTNAME ]
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | IP 前缀列表名 |

**命令模式**：Route-map 模式

**默认配置**：默认match ip next-hop prefix-list 不设置。

**使用说明**：

这个命令对BGP，OSPF，RIP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map mymap permit 3
Switch(config-route-map)# match ip next-hop prefix-list list1
```

**相关命令**：match metric、match interface、match ip next-hop

### 6.4.9 `match local-preference`

**功能**：使用这个命令来指定匹配路由本地优先级。使用相应的no 命令来删除这个规则。

**语法**：

```
match local-preference LOCAL-PREFERENCE
no match local-preference
```

| 参数 | 说明 |
| --- | --- |
| LOCAL-PREFERENCE | 指定优先级 0-4294967295 |

**命令模式**：Route-map 模式

**默认配置**：默认match local-preference 不设置。

**使用说明**：

这个命令对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map mymap permit 3
Switch(config-route-map)# match local-preference 100
```

**相关命令**：match community、match as-path、set as-path、set community、match ip next-hop

### 6.4.10 `match metric`

**功能**：使用这个命令来设置match metric 值。
  使用相应的no 命令来删除这个规则。
  如果路由匹配了metric 值并且指定是permit 的语法的话，路由将会被重发布或者被
  set 语法所受控。如果满足了match 条件但是制定了deny 语法的话，路由将不会被重
  发布或者被set 语法受控。如果没有满足match 条件，无论指定了permit 还是deny
  语法，路由都不会被接收或者转发。

**语法**：

```
match metric METRICVAL
no match metric
```

| 参数 | 说明 |
| --- | --- |
| METRICVAL | metric 值 0-4294967295 |

**命令模式**：Route-map 模式

**默认配置**：默认match metric 不设置。

**使用说明**：

这个命令对BGP，OSPF，RIP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map myroute permit 3
Switch(config-route-map)# match metric 2
```

**相关命令**：match community、match as-path、set as-path、set community、match ip next-hop

### 6.4.11 `match origin`

**功能**：使用这个命令来匹配BGP 中的起始(origin)属性。
  使用相应的no 命令来删除这个规则。
  Origin 属性定义了路径的起始信息。EGP 参数用路由表中的e 来表示，这表明这一条
  路由的起始信息是从外部网关协议(EGP)中学习到的。同样的，IGP 参数用路由表中的i
  来表示，它表示起始路径信息是通过内部网关协议(IGP)学习到的。
  在路由表中，不完整的(incomplete)会用?来表示，这就是说，这个路由的原始路径是
  通过不清楚或者其他别的方式来学习到的。比如，一个静态路由被重发布到BGP 的话，
  那它的原始路由就是不完整的。

**语法**：

```
match origin { egp | igp | incomplete }
no match origin
```

| 参数 | 说明 |
| --- | --- |
| egp | 从EGP 学到 |
| igp | 本地IGP |
| incomplete | 未知源 |

**命令模式**：Route-map 模式

**默认配置**：默认match origin 不设置。

**使用说明**：

这个命令只对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map myroute deny 34
Switch(config-route-map)# match origin egp
```

**相关命令**：无

### 6.4.12 `match route-type external`

**功能**：使用这个命令来匹配指定的外部路由类型。
  使用相应的no 命令来删除这个规则。
  使用match route-type external 命令来匹配指定的外部路由类型。自治系统外部LSA
  即是类型1 或者是类型2。 外部类型1 值匹配类型1 的外部路由，外部类型2 只匹配
  类型2 的外部路由。

**语法**：

```
match route-type external { type-1 | type-2 }
no match route-type external
```

| 参数 | 说明 |
| --- | --- |
| type-1 | 匹配OSPF 外部类型1 |
| metric |  |
| type-2 | 匹配OSPF 外部类型2 |
| metric |  |

**命令模式**：Route-map 模式

**默认配置**：默认match route-type 不设置。

**使用说明**：

这个命令仅对OSPF 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map mymap1 permit 10
Switch(config-route-map)# match route-type external type-1
```

**相关命令**：match tag

### 6.4.13 `match tag`

**功能**：使用这个命令来匹配指定的路由信息标记tag。
  使用相应的no 命令来删除这个规则。

**语法**：

```
match tag TAG
no match tag
```

| 参数 | 说明 |
| --- | --- |
| TAG | 指定tag 值 0-4294967295 |

**命令模式**：Route-map 模式

**默认配置**：默认match tag 不设置。

**使用说明**：

这个命令对OSPF，RIP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map mymap1 permit 10
Switch(config-route-map)# match tag 100
```

**相关命令**：match metric、match route-type external

### 6.4.14 `set aggregator`

**功能**：使用这个命令来设置route-map 和router ID 的AS 号。
  使用相应的no 命令来删除这个规则。
  自治系统(AS)是一个网络管理机构控制下的路由器和网络群组。他们被不同的区域所分
  离，被指派了一个独特的16 位的号码。使用set aggregator as 命令来指定这个AS 号
  码。
  为了使用set aggregator 命令，你必须首先要有一个match 规则。Match 和set 命令设
  置了路由协议间重发布路由的规则。Match 命令制定了在满足什么样的条件下才能进
  行重发布，而Set 命令则指定了满足条件后所执行的动作。
  如果报文没有满足任何定义的条件，他们将会被正常的路由所转发。

**语法**：

```
set aggregator as ASNUM IPADDRESS
no set aggregator
```

| 参数 | 说明 |
| --- | --- |
| ASNUM | 指定集合的AS 号 1-65535 |
| IPADDRESS | 指定集合的IP 地址 |

**命令模式**：Route-map 模式

**默认配置**：默认set aggregator 不设置。

**使用说明**：

这个命令仅对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map myroute permit 3
Switch(config-route-map)# set aggregator as 43 10.10.0.3
```

**相关命令**：无

### 6.4.15 `set as-path`

**功能**：使用这个命令来追加自治系统(AS)的路径。
  使用相应的no 命令来删除这个规则。
  使用set as-path 命令来指定一个AS 的路径。通过指定AS-Path 的长度，路由器可以
  影响路径的最佳路径选择。这个命令可以在在已有的AS-Path 中，再追加一个指定的
  AS-path。使用该命令你首先要有个match 规则，match 和set 规则同时作用来进行路
  由重分布。Match 命令指定向其他路由协议重发布路由的规则。Set 命令指定在当前
  route-map 下路由重分布的表现方式。
  如果报文没有匹配到任何条件，将会被通常的路由表转发。

**语法**：

```
set as-path prepend ASN [ …ASN ]
no set as-path
```

| 参数 | 说明 |
| --- | --- |
| ASN | 追加自治系统的AS-path 1-4294967295 |

**命令模式**：Route-map 模式

**默认配置**：默认set as-path 不设置。

**使用说明**：

这个命令仅对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map myroute permit 3
Switch(config-route-map)# set as-path prepend 8 24
```

**相关命令**：无

### 6.4.16 `set atomic-aggregate`

**功能**：使用这个命令来设置atomic aggregate 属性。
  使用相应的no 命令来删除这个规则。
  使用该命令你首先要有个match 规则，match 和set 规则同时作用来进行路由重分布。
  Match 命令指定向其他路由协议重发布路由的规则。Set 命令指定在当前route-map 下
  路由重分布的表现方式。
  如果报文没有匹配到任何条件，将会被通常的路由表转发。

**语法**：

```
set atomic-aggregate
no set atomic-aggregate
```

**命令模式**：Route-map 模式

**默认配置**：默认set atomic-aggregator 不设置。

**使用说明**：

这个命令对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set atomic-aggregate
```

**相关命令**：无

### 6.4.17 `set comm-list delete`

**功能**：使用这个命令来删除从进入或者外发更新时，满足条件的community。
  使用相应的no 命令来删除这个规则。

**语法**：

```
set comm-list { STANDARD_ID | EXPANDED_ID | WORD } delete
no set comm-list
```

| 参数 | 说明 |
| --- | --- |
| STANDARD_ID | 标准comminty 列表号 1-99 |
| EXPANDED_ID | 扩展community 列表号 100-199 |
| WORD | Community 列表名长度不超过20 个字符的字符串,首字母支持[a-zA-Z0- 9] |
| delete | 删除匹配条件的 |
| community |  |

**命令模式**：Route-map 模式

**默认配置**：默认set comm-list delete 不设置。

**使用说明**：

这个命令仅对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set comm-list 34 delete
```

**相关命令**：无

### 6.4.18 `set community`

**功能**：用这个命令来设置comminty 属性。
  使用相应的no 命令来删除这个规则。
  使用这个命令来设置community 属性和在某个特定的community 中的组目的地址，已
  经，根据这些community 来应用路由选择。使用该命令你首先要有个match 规则，
  match 和set 规则同时作用来进行路由重分布。Match 命令指定向其他路由协议重发布
  路由的规则。Set 命令指定在当前route-map 下路由重分布的表现方式。
  如果报文没有匹配到任何条件，将会被通常的路由表转发。

**语法**：

```
set community [ AA:NN | internet | local-AS | no-advertise | no-export ]
set community none
no set community
```

| 参数 | 说明 |
| --- | --- |
| AA:NN | AA:NN: 用这样的格式来描述community 号 AA = AS 号 NN = 指定的community 号 AA 范围1-65535 NN 范围1-65535 |
| internet | 指定Internet 这个 comminity(公认的 community) |
| local-AS | 指定不发往local AS 以外的AS (公认的community) |
| no-advertise | 指定不把这个路由对对等体宣告 (公认的community) |
| no-export | 指定不把这个路由对下一个 AS 宣告 (公认的 community) |
| none | 把通过这个route-map 的 community 属性删除 |

**命令模式**：Route-map 模式

**默认配置**：默认set community 不设置。

**使用说明**：

这个命令对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set community no-export no-advertise
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set community no-advertise
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set community 10:01 23:34 12:14 no-export
```

**相关命令**：无

### 6.4.19 `set dampening`

**功能**：使用这个命令来使能route-flap 惩罚，并且设置它的参数。
  使用相应的no 命令来删除这个规则。
  设置不可达的半衰期(half-life time)大于等于可达的半衰期。抑制门限值必须要比重用
  门限值大。

**语法**：

```
set dampening REACHTIME REUSE SUPPRESS MAXSUPPRESS [ UNREACHTIME ]

no set dampening
```

| 参数 | 说明 |
| --- | --- |
| REACHTIME | 用分来表示可达的半衰期。 时间衰减是当前值的一半， 默认15 分钟 1-45 |
| REUSE | 指定重用门限值。当被一种的路由的惩罚值衰减到重用门限值以下时，这个路由就不再被抑制。默认重用门限是750 1-20000 |
| SUPPRESS | 指定抑制门限值。当一个路由的惩罚值超过抑制门限的时候，这个路由就被抑制了。默认的抑制门限是 1-20000 |
| MAXSUPPRESS | 指定最大抑制时间。一个被惩罚的路由的最大抑制时间。默认值是半衰期的4 倍 (60 分钟) 1-255 |
| UNREACHTIME | 指定不可达半衰期的惩罚值，默认15 分钟 1-45 |

**命令模式**：Route-map 模式

**默认配置**：请参考命令语法中的描述。

**使用说明**：

这个命令仅对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map R1 permit 24
Switch(config-route-map)# set dampening 20 333 534 30
```

**相关命令**：无

### 6.4.20 `set extcommunity`

**功能**：使用这个命令来设置一个扩展的community 属性。
  使用相应的no 命令来删除这个规则。
  使用该命令你首先要有个match 规则，match 和set 规则同时作用来进行路由重分布。
  Match 命令指定向其他路由协议重发布路由的规则。Set 命令指定在当前route-map 下
  路由重分布的表现方式。
  如果报文没有匹配到任何条件，将会被通常的路由表转发。
  这个命令对BGP 有效。

**语法**：

```
set extcommunity { rt | soo } EXTCOMMNUMBER [ …EXTCOMMNUMBER ]
no set extcommunity { rt | soo }
```

| 参数 | 说明 |
| --- | --- |
| rt | 指定扩展community 的扩展对象 |
| soo | 指定扩展community 的 site-of-origin 属性 |
| EXTCOMMNUMBER | ASN:NN 或者IP-address nn：VPN 扩展comminty |
| ASN:NN | AS 号 ASN 范围1-65535 NN 范围1-65535 |
| IPADDRESS | 以IP 地址形式表示的AS 号格式为A.B.C.D 的IPv4 地址 |

**命令模式**：Route-map 模式

**默认配置**：默认set extcommunity 不设置。

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set extcommunity rt 06:01
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set extcommunity rt 0.0.0.6:01
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set extcommunity soo 06:01
Switch# configure terminal
Switch(config-route-map)# route-map rmap1 permit 3
Switch(config-route-map)# set extcommunity soo 0.0.0.6:01
```

**相关命令**：无

### 6.4.21 `set ip next-hop ip-group`

**功能**：使用这个命令来设置指定的下一跳ip 组的值。
  使用相应的no 命令来删除这个规则。

**语法**：

```
set ip next-hop ip-group NAME
no set ip next-hop ip-group
```

| 参数 | 说明 |
| --- | --- |
| NAME | A.B.C.D: 指定下一跳的IP 组名字不超过32 字符的字符串 |

**命令模式**：Route-map 模式

**默认配置**：默认set ip next-hop ip-group 不设置。

**使用说明**：

这个命令对策略路由有效。配置set ip next-hop ip-group 使系统优先使用策略路由，
  其次使用路由表。

**示例**：

```
下面的例子描述了如何设置下一跳IP 组:
Switch# configure terminal
Switch(config)# route-map mymap permit 3
Switch(config-route-map)# set ip next-hop ip-group aaa
```

**相关命令**：无

### 6.4.22 `set ip default next-hop ip-group`

**功能**：使用这个命令来设置指定的默认下一跳ip 组的值。
  使用相应的no 命令来删除这个规则。

**语法**：

```
set ip default next-hop ip-group NAME
no set ip default next-hop ip-group
```

| 参数 | 说明 |
| --- | --- |
| NAME | A.B.C.D: 指定下一跳的IP 组名字不超过32 字符的字符串 |

**命令模式**：Route-map 模式

**默认配置**：默认set ip default next-hop ip-group 不设置。

**使用说明**：

这个命令对策略路由有效。配置set ip default next-hop 使系统优先使用路由表，其次
  使用策略路由

**示例**：

```
下面的例子描述了如何设置默认下一跳IP 组:

Switch# configure terminal
Switch(config)# route-map mymap permit 3
Switch(config-route-map)# set ip default next-hop ip-group aaa
```

**相关命令**：无

### 6.4.23 `set ip next-hop`

**功能**：使用这个命令来设置指定的下一跳的值。
  使用相应的no 命令来删除这个规则。

**语法**：

```
set ip next-hop A.B.C.D ( track object_id | )
no set ip next-hop ( track | )
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | A.B.C.D: 指定下一跳的IP 地址格式为A.B.C.D 的IPv4 地址 |
| object_id | Track 对象的标识符 1-500 |

**命令模式**：Route-map 模式

**默认配置**：默认set ip next-hop 不设置。

**使用说明**：

这个命令对BGP，OSPF，RIP 和策略路由有效。配置set ip next-hop 使系统优先使用
  策略路由，其次使用路由表。配置命令带track 参数时会把nexthop 和track 绑定在一
  起，当track down 时，nexthop 会失效。使用带track 的no 命令会删除nexthop 与
  track 之间的绑定关系。

**示例**：

```
下面的例子描述了如何设置下一跳IP 地址:

Switch# configure terminal
Switch(config)# route-map mymap permit 3
Switch(config-route-map)# set ip next-hop 10.10.0.67
下面的例子描述了如何设置下一跳IP 地址，且和track 绑定:
Switch# configure terminal
Switch(config)# track 1 interface eth-0-1 linkstate
Switch(config-track)# quit
Switch(config)# route-map mymap permit 3
Switch(config-route-map)# set ip next-hop 10.10.0.67 track 1
```

**相关命令**：无

### 6.4.24 `set ip vrf next-hop`

**功能**：使用这个命令来设置指定下一跳以及所属的vrf。
  使用相应的no 命令来删除这个规则。

**语法**：

```
set ip vrf WORD next-hop A.B.C.D ( track object_id | )
no set ip next-hop ( track | )
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | A.B.C.D: 指定下一跳的IP 地址格式为A.B.C.D 的IPv4 地址 |
| object_id | Track 对象的标识符 1-500 |
| WORD | VPN 路由/转发实例名不超过15 个字符的字符串 |

**命令模式**：Route-map 模式

**默认配置**：默认set ip next-hop 不设置。

**使用说明**：

这个命令只对策略路由有效。配置set ip vrf next-hop 使系统优先使用策略路由，其次
  使用路由表。配置命令带track 参数时会把nexthop 和track 绑定在一起，当track
  
  down 时，nexthop 会失效。使用带track 的no 命令会删除nexthop 与track 之间的绑
  定关系。

**示例**：

```
下面的例子描述了如何设置下一跳IP 地址和vrf。:
Switch# configure terminal
Switch(config)# route-map mymap permit 3
Switch(config-route-map)# set ip vrf test next-hop 10.10.0.67
```

**相关命令**：无

### 6.4.25 `set ip default next-hop`

**功能**：使用这个命令来设置指定的下一跳的值。
  使用相应的no 命令来删除这个规则。

**语法**：

```
set ip default next-hop A.B.C.D ( track object_id | )
no set ip default next-hop ( track | )
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | A.B.C.D: 指定下一跳的IP 地址格式为A.B.C.D 的IPv4 地址 |
| object_id | Track 对象的标识符 1-500 |

**命令模式**：Route-map 模式

**默认配置**：默认set ip default next-hop 不设置。

**使用说明**：

这个命令对策略路由有效。配置set ip default next-hop 使系统优先使用路由表，其次
  使用策略路由。配置命令带track 参数时会把nexthop 和track 绑定在一起，当track
  
  down 时，nexthop 会失效。使用带track 的no 命令会删除nexthop 与track 之间的绑
  定关系。

**示例**：

```
下面的例子描述了如何设置默认下一跳IP 地址，且绑定track:
Switch# configure terminal
Switch(config)# track 1 interface eth-0-1 linkstate
Switch(config-track)# quit
Switch(config)# route-map mymap permit 4
Switch(config-route-map)# set ip default next-hop 10.10.0.68 track 1
下面的例子描述了如何把track 和默认下一跳IP 地址解绑:
Switch# configure terminal
Switch(config)# route-map mymap permit 4
Switch(config-route-map)# no set ip default next-hop track
```

**相关命令**：无

### 6.4.26 `set ip default vrf next-hop`

**功能**：使用这个命令来设置指定的下一跳的值和相应的vrf。
  使用相应的no 命令来删除这个规则。

**语法**：

```
set ip default vrf WORD next-hop A.B.C.D ( track object_id | )
no set ip default next-hop ( track | )
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | A.B.C.D: 指定下一跳的IP 地址格式为A.B.C.D 的IPv4 地址 |
| object_id | Track 对象的标识符 1-500 |
| WORD | VPN 路由/转发实例名不超过15 个字符的字符串 |

**命令模式**：Route-map 模式

**默认配置**：默认set ip default vrf next-hop 不设置。

**使用说明**：

这个命令对策略路由有效。配置set ip default vrf next-hop 使系统优先使用路由表，其
  次使用策略路由。配置命令带track 参数时会把nexthop 和track 绑定在一起，当track
  down 时，nexthop 会失效。使用带track 的no 命令会删除nexthop 与track 之间的绑
  定关系。

**示例**：

```
下面的例子描述了如何设置默认带vrf 的下一跳IP 地址，且绑定track:
Switch# configure terminal
Switch(config)# track 1 interface eth-0-1 linkstate
Switch(config-track)# quit
Switch(config)# route-map mymap permit 4
Switch(config-route-map)# set ip default vrf test next-hop 10.10.0.68 track 1
```

**相关命令**：无

### 6.4.27 `set local-preference`

**功能**：使用这个命令来设置本地优先级属性。
  使用相应的no 命令来删除这个规则。

**语法**：

```
set local-preference LOCAL-PREFERENCE
no set local-preference
```

| 参数 | 说明 |
| --- | --- |
| LOCAL-PREFERENCE | 指定优先级 0-4294967295 |

**命令模式**：Route-map 模式

**默认配置**：默认set local-preference 不设置。

**使用说明**：

这个命令仅对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map mymap permit 3
Switch(config-route-map)# set local-preference 100
```

**相关命令**：无

### 6.4.28 `set metric`

**功能**：使用这个命令来设置一个路由的metric 值。
  使用相应的no 命令来删除这个规则。
  这个命令用于设置一条路由的metric 值，以及关于一个关于AS 的首选路径影响的外
  部邻居。首选路径是一个比较有较低metric 值的路由。一个路由器比较在同一个AS
  中，邻居路径的metric 值。比较不同的AS 邻居的metric 值，使用bgp always-
  compare-med 命令。使用该命令你首先要有个match 规则，match 和set 规则同时作
  用来进行路由重分布。Match 命令指定向其他路由协议重发布路由的规则。Set 命令指
  定在当前route-map 下路由重分布的表现方式。
  如果报文没有匹配到任何条件，将会被通常的路由表转发。

**语法**：

```
set metric METRICVAL
no set metric
```

| 参数 | 说明 |
| --- | --- |
| METRICVAL | metric 值 0-4294967295 |

**命令模式**：Route-map 模式

**默认配置**：默认set metric 不设置。

**使用说明**：

这个命令仅对BGP，OSPF 和RIP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set metric 600
```

**相关命令**：无

### 6.4.29 `set metric-type`

**功能**：使用这个命令来设置目的路由协议的metric 类型。
  使用相应的no 命令来删除这个规则。
  当route-map 匹配的时候，这个命令设置在AS-external-LSA 中设置Type-1 或者
  Type-2 两种类型。

**语法**：

```
set metric-type { type1 | type2 }
no set metric-type
```

| 参数 | 说明 |
| --- | --- |
| type1 | 选择设置外部类型1 的 |
| metric |  |
| type2 | 选择设置外部类型2 的 |
| metric |  |

**命令模式**：Route-map 模式

**默认配置**：默认set metric-type 不设置。

**使用说明**：

这个命令仅对OSPF 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set metric-type 1
```

**相关命令**：无

### 6.4.30 `set origin`

**功能**：使用这个命令来设置BGP origin 代码。
  使用相应的no 命令来删除这个规则。
  Origin 属性定义了路径的起始信息。EGP 参数用路由表中的e 来表示，这表明这一条
  路由的起始信息是从外部网关协议(EGP)中学习到的。同样的，IGP 参数用路由表中的i
  来表示，它表示起始路径信息是通过内部网关协议(IGP)学习到的。，这个路由的原始路
  径是通过不清楚或者其他别的方式来学习到的。比如，一个静态路由被重发布到BGP
  的话，那它的原始路由就是不完整的。

**语法**：

```
set origin { egp | igp | incomplete }
no set origin
```

| 参数 | 说明 |
| --- | --- |
| egp | 指定一个远程EGP 系统 |
| igp | 一个本地的IGP 系统 |
| incomplete | 指定一个不明确的继承关系的系统 |

**命令模式**：Route-map 模式

**默认配置**：默认set origin 不设置。

**使用说明**：

这个命令仅对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set origin egp
```

**相关命令**：无

### 6.4.31 `set originator-id`

**功能**：使用这个命令来设置originator ID 属性。
  使用相应的no 命令来删除这个规则。
  使用该命令你首先要有个match 规则，match 和set 规则同时作用来进行路由重分布。
  Match 命令指定向其他路由协议重发布路由的规则。Set 命令指定在当前route-map 下
  路由重分布的表现方式。
  如果报文没有匹配到任何条件，将会被通常的路由表转发。

**语法**：

```
set originator-id IPADDRESS
no set originator-id
```

| 参数 | 说明 |
| --- | --- |
| IPADDRESS | 指定originator 的IP 地址格式为A.B.C.D 的IPv4 地址 |

**命令模式**：Route-map 模式

**默认配置**：默认set originator-id 不设置。

**使用说明**：

这个命令仅对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set originator-id 1.1.1.1
```

**相关命令**：无

### 6.4.32 `set tag`

**功能**：使用这个命令来设置一个指定的tag 值。
  使用相应的no 命令来删除这个规则。
  在这个命令中的tag，被另外一个路由协议(重分布时的BGP 或者其他IGP)所标签，原
  因是AS-external-LSA 在它的LSA 中有一个route-tag 区。并且，使用route-map 的话，
  ZebOS 会使用合适的tag 值对这个LSA 上打上标签。有时候，这个tag 会匹配route-
  mp，有时候，这个值会被其他应用程序所使用。

**语法**：

```
set tag TAGVALUE
no set tag
```

| 参数 | 说明 |
| --- | --- |
| TAGVALUE | 目的路由协议的tag 号 0-4294967295 |

**命令模式**：Route-map 模式

**默认配置**：默认set tag 不设置。

**使用说明**：

这个命令仅对OSPF 和RIP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set tag 6
```

**相关命令**：redistribute、default-information

### 6.4.33 `set vpnv4 next-hop`

**功能**：使用这个命令来设置一个VPNv4 下一跳地址。
  使用相应的no 命令来删除这个规则。

**语法**：

```
set vpnv4 next-hop IPADDRESS
no set vpnv4 next-hop
```

| 参数 | 说明 |
| --- | --- |
| IPADDRESS | 指定下一跳IP 地址格式为A.B.C.D 的IPv4 地址 |

**命令模式**：Route-map 模式

**默认配置**：默认set vpnv4 next-hop 不设置。

**使用说明**：

这个命令仅对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set vpnv4 next-hop 6.6.6.6
```

**相关命令**：无

### 6.4.34 `set weight`

**功能**：使用这个命令来设置路由表的应用权重(weight)。
  使用相应的no 命令来删除这个规则。
  Weight 值是用于帮助进行最优路径选择的。它在路由器本地被指定。当有多个路由器，
  他们的目的地都相同时，有比较高权重的路由器将会被优先选中。

**语法**：

```
set weight WEIGHT
no set weight
```

| 参数 | 说明 |
| --- | --- |
| WEIGHT | 指定权重值 0-4294967295 |

**命令模式**：Route-map 模式

**默认配置**：默认set weight 不设置。

**使用说明**：

这个命令仅对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set weight 60
```

**相关命令**：match as-path

### 6.4.35 `description`

**功能**：使用该命令为route-map 设置描述信息。
  
  使用关键词no 删除route-map 描述信息。

**语法**：

```
description LINE
no description LINE
```

| 参数 | 说明 |
| --- | --- |
| LINE | route-map 描述不超过80 个字符 |

**命令模式**：Route-map 模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如果为route-map 配置描述信息:
Switch(config)# route-map 1
Switch(config-route-map)# description teststring
```

**相关命令**：show route-map

### 6.4.36 `show route-map`

**功能**：使用这个命令来显示用户可读的route-map 信息。

**语法**：

```
show route-map ( NAME | )
```

| 参数 | 说明 |
| --- | --- |
| NAME | route-map 名不超过20 字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch1# show route-map
route-map abc, permit, sequence 10
  Match clauses:
    ip address acl1
  Set clauses:
    local-preference 200
route-map abc, permit, sequence 20
  Match clauses:
  Set clauses:
```

**相关命令**：route-map、6.5 Prefix-list 命令


## 6.5 Prefix-list 命令

### 6.5.1 `ip prefix-list`

**功能**：在全局配置模式下，使用命令ip prefix-list 创建地址前缀列表或添加表项。使用该命令
  的no 形式删除配置。

**语法**：

```
ip prefix-list WORD ( seq SEQUENCE-NUMBER | ) ( deny | permit ) ( any | A.B.C.D/M ( ge
GE-LENGTH | ) ( le LE-LENGTH | ) )
( any | A.B.C.D/M ( ge GE-LENGTH | ) ( le LE-LENGTH | ) )
no ip prefix-list WORD ( seq SEQUENCE-NUMBER | ) ( deny | permit ) ( any | A.B.C.D/M
( ge GE-LENGTH | ) ( le LE-LENGTH | ) )
no ip prefix-list WORD ( seq SEQUENCE-NUMBER | )
```

| 参数 | 说明 |
| --- | --- |
| WORD | 地址前缀列表表名不超过40 字符的字符串 |
| seq SEQUENCE- |  |
| NUMBER | 地址前缀列表表项序号.如果输入命令的时候没有指定序号，将添加默认序号。默认序号为5 的倍数，并且是剩下序号中大于当前已分配序号的最小的数 1-65535 |
| deny | 指定地址前缀列表的匹配模式为拒绝。在该模式下，如果过滤的IP 地址在定义的范围内，该IP 地址不能通过过滤从而不能进入下一表项的测试；否则，将进行下一表项的测试 |
| permit | 指定地址前缀列表的匹配模式为允许。在该模式下，如果过滤的IP 地址在定义的范围内，则通过过滤，进行相应的设置；否则，必须进行下一表项的测试 |
| A.B.C.D/M | 网络地址和掩码位数。掩码位数范围0~32 格式为A.B.C.D/M 的IPv4 地址和掩码长度 |
| ge GE-LENGTH | 指定地址匹配的最小前缀长度 1-32 |
| le LE-LENGTH | 指定地址匹配的最大前缀长度 1-32 |

**命令模式**：全局配置模式

**默认配置**：没有地址前缀列表被创建。

**使用说明**：

没有地址前缀列表被创建。
  
  地址前缀列表用于IP 地址过滤。同一个地址前缀列表可包含多个表项，一个表项包括
  地址和掩码位数。命令中的deny 和permit 关键字指定该匹配结果是拒绝或者允许。
  此时，多个表项之间是“或”的关系，即通过一个表项就可通过该地址前缀列表的过滤。
  没有通过任何一个表项的过滤就意味着没有通过该地址前缀列表的过滤。
  地址前缀范围包括两个部分，分别由mask-length 和[greater-equal-value，less-
  equal-value]决定。如果指定了这两部分，要被过滤的IP 地址必须匹配这两部分规定的
  前缀范围。具体的匹配公式如下：
  network/length < ge ge-length < le le-length <= 32
  例如，只指定ge-length，则匹配范围为[ge-length,32]；只指定le-length，则匹配范
  围为[network/length，le-length]；如果两者都指定，则匹配范围为[ge-length, le-
  length]。
  如果在输入命令中没有指定序号，则交换机会自动为表项添加默认序号。默认序号从5
  开始，并且每次递增5，例如，5、10、15。默认序号将从当前大于已分配的序号中选
  择，并且是其中的最小值。如果第一次设置的值是3，那么后面默认生成的序号就会是
  8，13，18。该命令的no 形式可以删除相应序号的地址前缀列表中的表项。地址前缀
  会自动从最低序号的表项开始匹配，一直到与某个表项匹配成功。一旦匹配成功，这
  个表项的permit 或deny 操作将会被应用到该网络。

**示例**：

```
配置匹配默认路由的拒绝表项:
Switch# configure terminal
Switch(config)# ip prefix-list abc deny 0.0.0.0/0
配置匹配10.0.0.0/8 的允许表项:
Switch# configure terminal
Switch(config)# ip prefix-list abc permit 10.0.0.0/8
配置匹配长度为[16,24],地址为192.168.0.0/16 的允许表项:
Switch# configure terminal
Switch(config)# ip prefix-list abc permit 192.168.0.0/16 le 24
配置匹配长度为[25,32],地址为192.168.0.0/16 的拒绝表项:
Switch# configure terminal
Switch(config)# ip prefix-list abc deny 192.168.0.0/16 ge 25
```

**相关命令**：ip prefix-list description、ip prefix-list sequence、show ip prefix-list、clear ip prefix-list

### 6.5.2 `ip prefix-list description`

**功能**：在全局配置模式下，使用命令ip prefix-list description 添加地址前缀列表描述。使用命
  令相关的no 形式删除该配置。

**语法**：

```
ip prefix-list WORD description LINE
no ip prefix-list WORD description
```

| 参数 | 说明 |
| --- | --- |
| WORD | 地址前缀列表表名不超过40 字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：地址前缀列表默认没有描述。

**使用说明**：

如果该地址前缀列表不存在，交换机将会自动创建。

**示例**：

```
配置地址前缀列表描述为Deny routes from router A:
Switch# configure terminal
Switch(config)# ip prefix-list abc description Deny routes from router A
```

**相关命令**：ip prefix-list、ip prefix-list sequence、show ip prefix-list、clear ip prefix-list

### 6.5.3 `ip prefix-list sequence-number`

**功能**：在全局配置模式下，使用命令ip prefix-list sequence-number 启用地址前缀列表序号。
  使用命令相关的no 形式关闭序号。

**语法**：

```
ip prefix-list sequence-number
no ip prefix-list sequence-numbe
```

**命令模式**：全局配置模式

**默认配置**：地址前缀列表默认使用序号。

**使用说明**：

该命令会使显示地址前缀列表配置的时候显示序号。

**示例**：

```
配置启用地址前缀列表序号:
Switch# configure terminal
Switch(config)# ip prefix-list sequence-number
```

**相关命令**：ip prefix-list、show ip prefix-list、clear ip prefix-list

### 6.5.4 `show ip prefix-list`

**功能**：使用命令show ip prefix-list 显示当前地址前缀列表配置。

**语法**：

```
show ip prefix-list ( summary | detail | ) ( WORD | )

show ip prefix-list WORD ( seq SEQUENCE-NUMBER | A.B.C.D/M ( longer | first-match | )
| )
```

| 参数 | 说明 |
| --- | --- |
| summary | 地址前缀列表统计摘要 |
| detail | 地址前缀列表详细统计 |
| WORD | 地址前缀列表表名不超过40 字符的字符串 |
| seq SEQUENCE- |  |
| NUMBER | 表项序号 1-65535 |
| A.B.C.D/M | 网络地址/掩码位数 e.g., 35.0.0.0/8 格式为A.B.C.D/M 的IPv4 地址和掩码长度 |
| longer | 只显示掩码位数大于M 的表项 |
| first-match | 只显示第一个匹配的表项 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

只有RIP 支持prefix 的引用统计。

**示例**：

```
显示地址前缀列表信息:
Switch# show ip prefix-list
ip prefix-list aa: 2 entries
  permit 1.1.1.0/24
  permit 1.2.3.0/24
```

**相关命令**：ip prefix-list、clear ip prefix-list

### 6.5.5 `clear ip prefix-list`

**功能**：使用clear ip prefix-list 清除地址前缀列表计数器的统计信息。

**语法**：

```
clear ip prefix-list ( WORD ( A.B.C.D/M | ) | )
```

| 参数 | 说明 |
| --- | --- |
| WORD | 地址前缀列表表名不超过40 字符的字符串 |
| A.B.C.D/M | 网络地址/掩码位数 e.g., 35.0.0.0/8 格式为A.B.C.D/M 的IPv4 地址和掩码长度 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
重置地址前缀列表计数器:
Switch# clear ip prefix-list abc
```

**相关命令**：ip prefix-list、、6.6 PBR 命令


## 6.6 PBR 命令

### 6.6.1 `ip policy route-map`

**功能**：默认情况下，PBR 不在设备上启用， 想要启用PBR 的话，你首先要配置一个有match
  和set 语句的route-map，然后， 你才可以在一个三层端口上启用PBR 功能。 所有进
  入这个端口上的报文， 都会去匹配这个route-map 制定的match 策略， 满足match
  策略的报文， 将会按照set 制定的规则进行相应的转发处理。

**语法**：

```
ip policy route-map MAP_NAME
no ip policy route-map
```

| 参数 | 说明 |
| --- | --- |
| MAP_NAME | 策略路由映射名不超过20 字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：禁用

**使用说明**：

这个命令可以在routed 端口，vlan 端口routed 汇聚端口上启用。

**示例**：

```
下面的例子表明了如何在设备接口上启用PBR:
Switch# configure terminal
switch (config)# ip access-list 1 extend
switch (config-ex-ip-acl)# 10 permit any any any
switch (config-route-map)#exit
switch (config)#route-map richard permit 10
switch (config-route-map)#match ip address 1
switch (config-route-map)#set ip next-hop 10.1.1.1
switch (config-route-map)#exit
switch (config)#interface eth-0-1
switch (config-if)#no switch port
switch (config-if)#no shutdown
switch (config-if)#ip policy route-map richrad
```

**相关命令**：route-map

### 6.6.2 `ip-group`

**功能**：使用这个命令来设置ip 组。
  使用相应的no 命令来删除这个规则。

**语法**：

```
ip-group NAME ( vrf WORD | ) ( load-share | )
no ip-group NAME
```

| 参数 | 说明 |
| --- | --- |
| MAP_NAME | ip 组名字不超过32 字符的字符串 |
| WORD | VPN 路由/转发实例名不超过31 个字符的字符串 |
| load-share | 负载分担模式 |

**命令模式**：全局配置模式

**默认配置**：默认set ip-group 不设置。

**使用说明**：

使用这个命令配置ip 组给策略路由使用。

**示例**：

```
下面的例子表明了如何配置ip 组:
Switch# configure terminal
switch (config)# ip-group aaa
```

**相关命令**：route-map

### 6.6.3 `ip-member`

**功能**：使用这个命令来设置ip 组成员。
  使用相应的no 命令来删除这个规则。

**语法**：

```
member ip A.B.C.D ( priority PRIORITY ) ( track object_id | )
no member ip A.B.C.D ( track | )
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | IP 成员地址格式为A.B.C.D 的IPv4 地址 |
| PRIORITY | 成员优先级 0-65535 |
| object_id | Track 对象的标识符 1-500 |

**命令模式**：IP 组配置模式

**默认配置**：默认set ip-member 不设置。

**使用说明**：

使用这个命令配置ip 组里的ip 成员。

**示例**：

```
下面的例子表明了如何配置ip 成员:
Switch# configure terminal
switch (config)# ip-group aaa
switch (config-ip-group)# member ip 1.1.1.1
```

**相关命令**：route-map

### 6.6.4 `show ip-group`

**功能**：使用这个命令来表示ip-group 配置的详细信息。

**语法**：

```
show ip-group ( NAME | )
```

| 参数 | 说明 |
| --- | --- |
| NAME | ip 组名字不超过20 字符的字符串 |

**命令模式**：特权模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
SWITCH# show ip -group
Switch# show ip-group
Group name: aaa    VRF: -    Mode: -
----------------------------------------------------------------------
Member ip              Priority         Track id         Track state
----------------------------------------------------------------------
 2.2.2.2               20               -                Disable
```

**相关命令**：无

### 6.6.5 `show ip policy route-map`

**功能**：使用这个命令来表示PBR 配置的详细信息。

**语法**：

```
show ip policy route-map
```

**命令模式**：特权模式

**默认配置**：禁用

**使用说明**：

如果PBR 没能成功加入到tcam 中，将会显示一条错误提示信息。

**示例**：

```
SWITCH# show ip policy route-map
Route-map                     interface
richard                        eth-0-1
                              eth-0-3
Failed entry: no
sally                          eth-0-2
Failed entry: yes
Please use Policy Based-Routing CLI: show pbr failed entry to gain more detail。
```

**相关命令**：route-map

### 6.6.6 `show resource pbr`

**功能**：使用这个命令来PBR 模块的资源使用情况。

**语法**：

```
show resource pbr
```

**命令模式**：特权模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
SWITCH# show resource pbr
Policy Based Routing
Resource                         Used          Capability
=============================================================
Policy Route Map                 0             32
Policy Based Routing ACE         0             64
```

**相关命令**：route-map、show ip policy route-map、6.7 BGP 命令


## 6.7 BGP 命令

### 6.7.1 `address-family`

**功能**：使用这个命令来进入IPv4, VPNv4 address-family 命令模式。

**语法**：

```
address-family ipv4 ( unicast | vrf NAME | )
address-family vpnv4 ( unicast )
```

| 参数 | 说明 |
| --- | --- |
| vpnv4 | 配置VPN-IPV4 前缀的会话，这个参数使用IPV4 风格的地址格式：A.B.C.D |
| unicast | 指定单播前缀 |
| vrf | VPN 路由/转发实例 |
| NAME | VPN 路由/转发实例名不超过31 个字符的字符串 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

使用address-family 命令，来进入路由模式，允许配置跟路由相关的参数。
  退出该模式使用相应的exit，或者exit-address-family 命令。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router)address-family ipv4
```

**相关命令**：exit-address-family、exit

### 6.7.2 `aggregate-address`

**功能**：使用这个命令来配置BGP 集合条目。
  使用相应的no 命令来删除这个配置。

**语法**：

```
( no ) aggregate-address IP_PREFIX { summary-only | as-set }
```

| 参数 | 说明 |
| --- | --- |
| IP_PREFIX | A.B.C.D/M 指定聚合的IP 前缀格式为A.B.C.D/M 的IPv4 地址和掩码长度 |
| summary-only | 从更新过程中，过滤更多的指定路由 |
| as-set | 生成AS set 路径信息 |

**命令模式**：路由模式

**默认配置**：Disabled

**使用说明**：

聚合用于将路由表的规模最小化。聚合通过一些特征，将不同的路由联合起来，并宣
  告为一条路由。如果更确定的BGP 路由在可选择的范围的话，aggregate-address 命令
  在BGP 路由表中创建了一个聚合条目。使用参数summary-only 只宣告前缀，对所有
  邻居抑制更确定的路由。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 100
Switch(config-router)# aggregate-address 10.0.0.0/8 as-set summary-only
```

**相关命令**：N/A

### 6.7.3 `bgp always-compare-med`

**功能**：使用这个命令来比较在不同AS 中的邻居间距离的Multi Exit Discriminator (MED)。
  使用相应的no 命令来删除这个配置。

**语法**：

```
( no ) bgp always-compare-med
```

**命令模式**：路由模式

**默认配置**：Disabled

**使用说明**：

Multi Exit Discriminator (MED) 用于BGP 的最佳路径选路。在BGP 的属性：weight，
  local preference，AS-path 和origin 的比较结果为相等以后，MED 将被进行比较。
  MED 只在相同的AS 的路径中进行比较。使用bgp always-compare-med 命令来允许
  在不同的AS 间比较MED。MED 参数在选择最佳路径以后才被使用。一个具有低MED
  的路径会被优先使用。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 100
Switch(config-router)# bgp always-compare-med
```

**相关命令**：bgp bestpath med、bgp bestpath as-path ignore

### 6.7.4 `bgp bestpath as-path ignore`

**功能**：使用这个命令来防止这个路由器被通过AS-path 原则选中。
  使用相应的no 命令来让这个路由器可以通过AS-path 原则选中。

**语法**：

```
( no ) bgp bestpath as-path ignore
```

**命令模式**：路由模式

**默认配置**：Disabled

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) bgp bestpath as-path ignore
```

**相关命令**：bgp always-compare-med, bgp bestpath med, bgp bestpath compare-routerid

### 6.7.5 `bgp bestpath compare-confed-aspath`

**功能**：使用这个命令来允许比较AS-path 的长度。
  使用相应的no 命令来反转这个选择，并且忽略在BGP 最佳路径选择中的AS 联合路径
  长度。

**语法**：

```
( no ) bgp bestpath compare-confed-aspath
```

**命令模式**：路由模式

**默认配置**：BGP 从eBGP 对等体中使用相等的eBGP 路径来接受路由，并选择接收到的第一条路由 为最优路径。

**使用说明**：

这个命令指定了，在BGP 最佳路径选择中，当AS 联合路径长度可用的时候，必须要
  使用这样一个规则。它只在bgp bestpath as-path ignore 命令没有被指定的时候生效。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) bgp bestpath compare-confed-aspath
```

**相关命令**：bgp bestpath as-path ignore

### 6.7.6 `bgp bestpath compare-routerid`

**功能**：使用这个命令来比较对等的eBGP 路径的router-id。
  使用相应的no 命令来删除这个配置。

**语法**：

```
( no ) bgp bestpath compare-routerid
```

**命令模式**：路由模式

**默认配置**：BGP 从eBGP 对等体中使用相等的eBGP 路径来接受路由，并选择接收到的第一条路由 为最优路径。

**使用说明**：

当对比对等体中相同的路由的时候，BGP 路由器并不考虑路由器上的router ID。默认
  情况下，它选择第一个接收到的路由。使用这个命令在选择过程中包括考虑route ID
  这样一个步骤，相同的路由将会被比较，并且拥有最小route ID 的路由将会被选择。
  Route-id 是路由器中最高的IP 地址，这个IP 地址优先会使用loopback 地址。Route-
  id 可以被bgp router-id 命令来手动设置。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) bgp bestpath compare-routerid
```

**相关命令**：show ip bgp、show ip bgp neighbors

### 6.7.7 `bgp bestpath med`

**功能**：使用这个命令来指定Multi Exit Discriminator (MED)属性的比较。
  使用相应的no 命令来防止BGP 在选路时把MED 作为考虑因素。

**语法**：

```
bgp bestpath med confed [ missing-as-worst ]
bgp bestpath med missing-as-worst [ confed ]
no bgp bestpath med confed [ missing-as-worst ]
no bgp bestpath med missing-as-worst [ confed ]
```

| 参数 | 说明 |
| --- | --- |
| confed | 在联合路径中比较MED |
| missing-as-worst | 把丢失的MED 作为优先选择的对象 |

**命令模式**：路由模式

**默认配置**：MED 值是0

**使用说明**：

使用这个命令来指定两个MED 属性：confed 和missing-as-worst。Confed 属性让
  MED 通过联合对等体中学到的路径来进行比较。MED 仅在路径中没有扩展的AS(不在
  联合中的AS)比较。如果路径中只要有一个扩展的AS，MED 比较就不会进行。
  Missing-as-worst 属性则将丢失的MED 作为路径中为无限大值来考虑，把丢失了MED
  的路径作为最差的路径来考虑。如果missing-as-worst 没有使能的话，丢失的MED 值
  是0，这样的话这条路径就会作为最佳路径来考虑。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) bgp bestpath med missing-as-worst
```

**相关命令**：bgp-always-compare-med, bgp bestpath as-path ignore, bgp deterministic-med

### 6.7.8 `bgp client-to-client reflection`

**功能**：使用这个命令来从BGP 路由反射客户端来回滚路由反射(route reflection, RR)。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp client-to-client reflection
no bgp client-to-client reflection
```

| 参数 | 说明 |
| --- | --- |
| reflection | 路由反射 |

**命令模式**：路由模式

**默认配置**：当路由器被配置为路由反射时，client-to-client 的反射将会被默认使能。

**使用说明**：

bgp client-to-client reflection 命令用于配置路由器为RR。当所有的内部网关协议(iBGP)
  的speaker 都没有全部两两互联的时候，会使用RR。如果客户端已经全互联了，那RR
  就不必要了，使用no bgp client-to-client reflection 命令来取消client-to-client 的反射。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) no bgp client-to-client reflection
```

**相关命令**：bgp cluster-id、neighbor route-reflector-client、show ip bgp

### 6.7.9 `bgp cluster-id`

**功能**：如果BGP 集群有一个以上的RR 的话，使用这个命令来配置cluster ID。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp cluster-id CLUSTERID
no bgp cluster-id
```

| 参数 | 说明 |
| --- | --- |
| CLUSTERID | 指定这个路由器的cluster ID，它会像一个RR 一样活动。可以是一个IP 地址， 或者是一个最大为4 字节的数值。 格式为A.B.C.D 的IPv4 地址或1-4294967295 之间的数字 |
| A.B.C.D | RR 的以IP 地址形式的 |
| cluster-id | IPv4 地址 1-4294967295 RR 的32bit cluster-id 1-4294967295 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

一个集群包括了RR 和它的客户端。通常，一个集群被它的唯一的RR 的route-id 所标
  识，但是为了增加冗余，有时候，一个集群可能会有一个以上的RR。所有在这样一个
  集群里面的RR 都被同一个cluster ID 所标识。bgp cluster-id 命令用于配置拥有一个以
  上RR 集群的32bit 的cluster ID。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) bgp cluster-id 1.1.1.1
```

**相关命令**：bgp client-to-client reflection, neighbor route-reflector-client, show ip bgp

### 6.7.10 `bgp confederation identifier`

**功能**：使用这个命令来指定一个Bgp confederation identifier.
  使用相应的no 命令来删除Bgp confederation identifier.

**语法**：

```
bgp confederation identifier ID
no bgp confederation identifier
```

| 参数 | 说明 |
| --- | --- |
| ID | 设置路由域的联合ASN 1-65535 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) bgp confederation identifier 1
```

**相关命令**：bgp confederation peer

### 6.7.11 `bgp confederation peers`

**功能**：使用这个命令来配置属于指定联合的自治系统(AS)。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp confederation peers .ASN
no bgp confederation peers ( .ASN | )
```

| 参数 | 说明 |
| --- | --- |
| ASN | 在同一个联合但不同sub- AS 下的eBGP 对等体的 |
| ASN | 1-65535 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

一个联合允许一个AS 被分成几个AS。AS 会被指定一个联合号。外部的路由器只能把
  整个联合看作一个AS。每个AS 在内部是全互联的，并且对这个联合来说，是内部可
  见的。使用bgp confederation peers 命令来定义联合对等体列表。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) bgp confederation peers 1234 21345
```

**相关命令**：bgp confederation identifier

### 6.7.12 `bgp dampening`

**功能**：使用这个命令来指定bgp dampening 的参数
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp dampening REACHTIME
bgp dampening REACHTIME REUSE
bgp dampening REACHTIME REUSE SUPPRESS MAXSUPPRESS ( UNREACHTIME | )
bgp dampening route-map ROUTEMAP
no bgp dampening REACHTIME
no bgp dampening REACHTIME REUSE
no bgp dampening REACHTIME REUSE SUPPRESS MAXSUPPRESS ( UNREACHTIME | )
no bgp dampening route-map ( ROUTEMAP | )
```

| 参数 | 说明 |
| --- | --- |
| REACHTIME | 指定可达半衰期(单位 min)。惩罚时间是当前值的一半。默认15min。 1-45 |
| REUSE | 指定重用门限值。当对一个抑制路由的惩罚，一直衰减到重用门限值以下时，这个路由就不再被抑制了。默认 1-20000 值是750。 |
| SUPPRESS | 指定抑制门限值。当对一个路由的惩罚超过这个抑制门限时，这个路由会被抑制。 默认值2000。 1-20000 |
| MAXSUPPRESS | 指定最大抑制时间。惩罚路由被抑制的最长时间。默认是4 倍的半衰期(60min)。 1-255 |
| UNREACHTIME | 指定不可达半衰期(单位 min)。 1-45 |
| ROUTEMAP | route-map WORD 指定惩罚规则的route-map。 不超过20 个字符的字符串 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

路由惩罚最大限度的减少了由于路由翻动(route flapping)导致的不稳定性。每次翻动都
  会在这个翻动的路由上增加一个惩罚。一旦当总的惩罚值达到抑制门限，这个路由的
  宣告就会被抑制。这个惩罚会根据配置的半衰期进行衰减。一旦惩罚比重用门限低的
  时候，路由的抑制就会被取消。
  一旦惩罚值低于重用门限的一半时，惩罚信息会被立即取消。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 100
Switch(config-router)# bgp dampening 20 800 2500 80 25
```

**相关命令**：N/A

### 6.7.13 `bgp default ipv4-unicast`

**功能**：使用这个命令来配置BGP 默认状态并且激活对等体的IPV4 单播默认状态。这将会影响
  BGP 的全局配置。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp default ipv4-unicast
no bgp default ipv4-unicast
```

**命令模式**：路由模式

**默认配置**：BGP 默认行为是IPV4 单播。

**使用说明**：

no bgp default ipv4-unicast 用于让BGP 默认的路由行为(与BGP 邻居交换IPV4 地址)
  失效。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) bgp default ipv4-unicast
```

**相关命令**：N/A

### 6.7.14 `bgp default local-preference`

**功能**：使用这个命令来改变默认的local-preference 值。
  使用相应的no 来返回默认设置。

**语法**：

```
bgp default local-preference PREF_VALUE

no default local-preference
```

| 参数 | 说明 |
| --- | --- |
| PREF_VALUE | 配置默认的local preference 值，默认100 0-4294967295 |

**命令模式**：路由模式

**使用说明**：

Local-preference 表示，当存在通往同一个目的的多条路径时，优先级比较高的那条路
  径。使用bgp default local-preference 命令来定义特定的路径优先级。这个优先级是
  针对本地AS 的所有路由器和接入服务器有效的。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) bgp default local-preference 2345555
```

**相关命令**：N/A

### 6.7.15 `bgp deterministic-med`

**功能**：当在同一个AS 中，从不同的对等体中选择宣告的路由时，使用这个命令来比较Multi
  Exit Discriminator (MED)参数。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp deterministic-med
no bgp deterministic-med
```

**命令模式**：路由模式

**默认配置**：Disabled

**使用说明**：

Multi Exit Discriminator (MED) 用于在BGP 中的最佳路径选择。在BGP 的属性：weight，
  local preference，AS-path 和origin 的比较结果为相等以后，MED 将被进行比较。在
  本地AS 的所有的路由器上，使能bgp deterministic-med 命令，用于获取一个比较结
  果。在使能这个命令以后，所有对同一前缀的路径，都会被组合在一起，并且根据他
  们的MED 值来安排。
  根据这个比较，就可以得出一个最佳路径。
  这个命令，在同一个AS 中，在选择被不同对等体宣告的路由时，根据MED 值来进行
  比较。当在不同的AS 上进行选路时要比较MED 的话，要使用bgp always-compare-
  med 命令。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) bgp deterministic-med
```

**相关命令**：show ip bgp, show ip bgp neighbors

### 6.7.16 `bgp enforce-first-as`

**功能**：使用这个命令来设置用来拒绝第一个AS-path 不是邻居配置的ASN 的update 消息。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp enforce-first-as
no bgp enforce-first-as
```

**命令模式**：路由模式

**默认配置**：Disabled

**使用说明**：

使能这个特性，将会增加BGP 网络的安全性，不允许接受未授权的系统发来的流量。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 100
Switch(config-router)# bgp enforce-first-as
```

**相关命令**：N/A

### 6.7.17 `bgp fast-external-failover`

**功能**：使用这个命令，如果使用BGP 的接口，连接down 的话，立即重置一个BGP 会话。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp fast-external-failover
no bgp fast-external-failover
```

**命令模式**：路由模式

**默认配置**：Enabled

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 100
Switch(config-router)# bgp fast-external-failover
```

**相关命令**：N/A

### 6.7.18 `bgp graceful-restart`

**功能**：使用这个命令全局使能GR helper 功能。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp graceful-restart
no bgp graceful-restart
```

**命令模式**：路由模式

**默认配置**：Disabled

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 100
Switch(config-router)# bgp graceful-restart
```

**相关命令**：N/A

### 6.7.19 `bgp graceful-restart stalepath-time`

**功能**：使用这个命令设置等待End of rib 标记的时间。
  使用相应的no 命令来恢复默认值。

**语法**：

```
bgp graceful-restart stalepath-time TIME
no bgp graceful-restart stalepath-time
```

| 参数 | 说明 |
| --- | --- |
| TIME | Stalepath time，以秒为单位，默认值360s 1-3600 |

**命令模式**：路由模式

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 100
Switch(config-router)# bgp graceful-restart stalepath-time 400
```

**相关命令**：N/A

### 6.7.20 `bgp log-neighbor-changes`

**功能**：使用这个命令，在没有打开debug bug 命令的条件下，用日志记录BGP 状态迁移信息。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp log-neighbor-changes
no bgp log-neighbor-changes
```

**命令模式**：路由模式

**默认配置**：Disabled

**使用说明**：

系统提供了另外一种方法用于记录邻居状态的实现，比如，debug bgp fsm，debug
  bgp events，等。然而，这些命令会对日志系统的性能造成很严重的影响：
  bgp log-neighbor-changes 命令，会记录如下事件
  1.接收到BGP 通告
  2.接收到错误的BGP 更新
  3.用户重置请求
  4.对等体超时
  5.对等体关闭会话
  6.接口震荡
  7.变换
  8.删除邻居
  9.成员被增加到对等体组中
  10.端口
  11.远端AS 变化
  12.修改RR 客户端配置
  13.软件修改配置

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 100
Switch(config-router)# bgp log-neighbor-changes
```

**相关命令**：N/A

### 6.7.21 `bgp router-id`

**功能**：使用这个命令来配置router-id。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp router-id ROUTERID

no bgp router-id ( ROUTERID | )
```

| 参数 | 说明 |
| --- | --- |
| ROUTERID | A.B.C.D 手动配置router-id 格式为A.B.C.D 的IPv4 地址 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：如果配置了环回口的话，route-id 将会设置为环回口地址，否则的话，最高的IP 地址 将会设置为router-id。

**使用说明**：

使用bgp router-id 命令来手动配置一个固定的route-id，作为BGP 的路由器标识。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) bgp router-id 1.1.2.3
```

**相关命令**：N/A

### 6.7.22 `bgp scan-time`

**功能**：使用用这个命令来设置BGP 路由下一跳的扫描间隔。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp scan-time TIME
no bgp scan-time
```

| 参数 | 说明 |
| --- | --- |
| TIME | bgp scan time，以秒为单位，默认值60s 0-60 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

使用这个命令来配置BGP 路由器的扫描间隔，这个间隔是路由器检查在数据表中路由
  的可靠性的周期。
  如果想要禁用BGP 扫描机能的话，将扫描间隔设置为0。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) bgp scan-time 10
```

**相关命令**：N/A

### 6.7.23 `clear ip bgp *`

**功能**：使用这个命令来重置所有对等体的BGP 连接。

**语法**：

```
clear ip bgp * ( IN | out | SOFT | )
clear ip bgp * ipv4 PREFIX ROUTES
clear ip bgp * vpnv4 unicast ROUTES
clear ip bgp * vrf NAME ROUTES
```

| 参数 | 说明 |
| --- | --- |
| ipv4 | 清除所有IPv4 地址族对等体 |
| vpnv4 | 清除所有VPNv4 地址族对等体 |
| ROUTES | (IN\|out\|SOFT) |
| IN | in (prefix-filter\|) |
| in | 表示入站的宣告路由将会被清除 |
| prefix-filter | 过滤特定的前缀 |
| out | 示出站的宣告路由将会被清除 |
| SOFT | soft (in\|out\|)表示入站/出站的宣告路由都将会被清除 |
| PREFIX | (unicast\|multicast) |
| unicast | 单播 |
| multicast | 组播 |
| vrf | 路由/转发实例 |
| NAME | 路由/转发实例名不超过31 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

BGP 的重置分硬重置和软重置两种，它们的区别就是：硬重置会导致BGP 邻居关系切
  断并重新建立；软重置不会切断邻居关系，只会重新刷新路由表。

**示例**：

```
Switch# clear ip bgp *
Switch# clear ip bgp * ipv4 unicast in prefix-filter
Switch# clear ip bgp * vpnv4 unicast in
```

**相关命令**：N/A

### 6.7.24 `clear ip bgp A.B.C.D`

**功能**：使用这个命令来通过指定的IP 地址重置IPV4 BGP 的连接。

**语法**：

```
clear ip bgp A.B.C.D ( in | out | SOFT )
clear ip bgp A.B.C.D ipv4 PREFIX ROUTES
clear ip bgp A.B.C.D vpnv4 unicast ROUTES
clear ip bgp A.B.C.D vrf NAME ROUTES
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | 要清除的BGP 路由的IP 地址格式为A.B.C.D 的IPv4 地址 |
| ipv4 | 清除所有IPv4 地址族对等体 |
| vpnv4 | 清除所有VPNv4 地址族对等体 |
| ROUTES | (IN\|out\|SOFT) |
| IN |  |
| in prefix-filter |  |
| in | 表示入站的宣告路由将会被清除 |
| prefix-filter | 过滤特定的前缀 |
| out | 示出站的宣告路由将会被清除 |
| SOFT | soft (in\|out\|)表示入站/出站的宣告路由都将会被清除 |
| PREFIX | (unicast\|multicast) |
| unicast | 单播 |
| multicast | 组播 |
| vrf | 路由/转发实例 |
| NAME | 路由/转发实例名不超过31 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# clear ip bgp 10.10.0.12 soft
Switch# clear ip bgp 10.10.0.10 vpnv4 unicast out
Switch# clear ip bgp 11.11.11.11 ipv4 multicast in prefix-filter
```

**相关命令**：N/A

### 6.7.25 `clear ip bgp dampening`

**功能**：使用这个命令来重置所有指定地址族的BGP 惩罚路由。

**语法**：

```
clear ip bgp dampening ( A.B.C.D | A.B.C.D/M | )
clear ip bgp ipv4 PREFIX dampening ( A.B.C.D | A.B.C.D/M | )
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | 指定想要清除的BGP 惩罚的IPV4 地址格式为A.B.C.D 的IPv4 地址 |
| A.B.C.D/M | 定想要清除的BGP 惩罚的带子网的IPV4 地址格式为A.B.C.D/M 的IPv4 地址和掩码长度 |
| ipv4 | 清除所有IPv4 地址族对等体 |
| PREFIX | (unicast\|multicast) |
| unicast | 单播 |
| multicast | 组播 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# clear ip bgp dampening 10.10.0.121
Switch# clear ip bgp ipv4 unicast dampening
```

**相关命令**：N/A

### 6.7.26 `clear ip bgp flap-statistics`

**功能**：使用这个命令来清除所有指定地址族的前缀的振荡次数和历史统计。

**语法**：

```
clear ip bgp flap-statistics ( A.B.C.D | A.B.C.D/M | )
clear ip bgp ipv4 PREFIX flap-statistics ( A.B.C.D | A.B.C.D/M | )
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | 指定想要清除的BGP 惩罚的IPV4 地址格式为A.B.C.D 的IPv4 地址 |
| A.B.C.D/M | 定想要清除的BGP 惩罚的带子网的IPV4 地址格式为A.B.C.D/M 的IPv4 地址和掩码长度 |
| ipv4 | 清除所有IPv4 地址族对等体 |
| PREFIX | (unicast\|multicast) |
| unicast | 单播 |
| multicast | 组播 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# clear ip bgp flap-statistics 10.10.0.121
Switch# clear ip bgp ipv4 unicast flap-statistics
```

**相关命令**：N/A

### 6.7.27 `clear ip bgp ASN`

**功能**：使用这个命令来重置一个指定AS 下的所有对等体的BGP 连接。

**语法**：

```
clear ip bgp ASN ( IN | out | SOFT | )
clear ip bgp ASN ipv4 PREFIX ROUTES
clear ip bgp ASN vpnv4 unicast ROUTES
```

| 参数 | 说明 |
| --- | --- |
| ASN | 指定要被删除的所有路由的 |
| ASN | 1-65535 |
| ipv4 | 清除所有IPv4 地址族对等体 |
| vpnv4 | 清除所有VPNv4 地址族对等体 |
| ROUTES | (IN\|out\|SOFT) |
| IN |  |
| in prefix-filter |  |
| in | 表示入站的宣告路由将会被- 清除 |
| out | 表示出站的宣告路由将会被清除 |
| prefix-filter | 过滤特定的前缀 |
| SOFT | soft (in\|out\|)表示入站/出站的宣告路由都将会被清除 |
| PREFIX | (unicast\|multicast) |
| unicast | 单播 |
| multicast | 组播 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# clear ip bgp 100
Switch# clear ip bgp 200 ipv4 unicast in prefix-filter
Switch# clear ip bgp 500 vpnv4 unicast in
```

**相关命令**：N/A

### 6.7.28 `clear ip bgp WORD`

**功能**：使用这个命令来重置一个指定AS 下的所有对等体的BGP 连接。

**语法**：

```
clear ip bgp WORD ( IN | out | SOFT | )
clear ip bgp WORD ipv4 PREFIX ROUTES
clear ip bgp WORD vpnv4 unicast ( in | out | SOFT | )
```

| 参数 | 说明 |
| --- | --- |
| WORD | 指定要被删除的所有路由的点分表达形式ASN <1-65535>.<0-65535> |
| ipv4 | 清除所有IPv4 地址族对等体 |
| vpnv4 | 清除所有VPNv4 地址族对等体 |
| ROUTES | (IN\|out\|SOFT) |
| IN |  |
| in prefix-filter |  |
| in | 表示入站的宣告路由将会被清除 |
| out | 表示出站的宣告路由将会被清除 |
| prefix-filter | 过滤特定的前缀 |
| SOFT | soft (in\|out\|)表示入站/出站的宣告路由都将会被清除 |
| PREFIX | (unicast\|multicast) |
| unicast | 单播 |
| multicast | 组播 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# clear ip bgp 1.1
Switch# clear ip bgp 1.1 ipv4 unicast in prefix-filter
Switch# clear ip bgp 65535.65535 vpnv4 unicast in
```

**相关命令**：N/A

### 6.7.29 `clear ip bgp external`

**功能**：使用这个命令来对所有外部对等体的BGP 连接进行重置。

**语法**：

```
clear ip bgp external ( In | out | SOFT | )
clear ip bgp external ipv4 PREFIX ROUTES
```

| 参数 | 说明 |
| --- | --- |
| external | 清除所有的外部对等体 |
| ROUTES | (IN\|out\|SOFT) |
| IN |  |
| in prefix-filter |  |
| in | 表示入站的宣告路由将会被清除 |
| out | 表示出站的宣告路由将会被清除 |
| SOFT | soft (in\|out\|)表示入站/出站的宣告路由都将会被清除 |
| ipv4 | 清除所有IPv4 地址族对等体 |
| PREFIX | (unicast\|multicast) |
| unicast | 单播 |
| multicast | 组播 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# clear ip bgp external out
Switch# clear ip bgp external ipv4 unicast in prefix-filter
```

**相关命令**：N/A

### 6.7.30 `clear ip bgp peer-group`

**功能**：使用这个命令来重置一个对等组下的所有成员的BGP 连接。

**语法**：

```
clear ip bgp peer-group WORD ( In | out | SOFT | )
clear ip bgp peer-group WORD ipv4 PREFIX ROUTES
```

| 参数 | 说明 |
| --- | --- |
| peer-group | 清除一个对等组的所有成员 - |
| WORD | 指定要清除的对等组的名字 不超过20 个字符的字符串 |
| ipv4 | 清除所有IPv4 地址族对等体 |
| ROUTES | (IN\|out\|SOFT) |
| prefix-filter | 过滤特定的前缀 |
| IN |  |
| in prefix-filter |  |
| in | 表示入站的宣告路由将会被清除 |
| prefix-filter | 过滤特定的前缀 |
| out | 表示出站的宣告路由将会被清除 |
| SOFT | soft (in\|out\|)表示入站/出站的宣告路由都将会被清除 |
| PREFIX | (unicast\|multicast) |
| unicast | 单播 |
| multicast | 组播 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

无

**示例**：

```
Switch# clear ip bgp peer-group Peer1 out
Switch# clear ip bgp peer-group mypeer ipv4 unicast in prefix-filter
```

**相关命令**：N/A

### 6.7.31 `clear ip bgp vrf`

**功能**：使用这个命令来重置指定的BPG 连接的VPN 路由/转发实例。

**语法**：

```
clear ip bgp ( A.B.C.D ) | * ) vrf WORD ( out | in | SOFT )
```

| 参数 | 说明 |
| --- | --- |
| WORD | 指定VRF 名不超过31 个字符的字符串 |
| A.B.C.D | 指定要清楚的BGP 路由的 IPV4 地址格式为A.B.C.D 的IPv4 地址 * 清除所有对等体 |
| out | 进行out 方向的软重置 |
| SOFT | soft (in\|out\|)表示入站/出站的宣告路由都将会被清除 |
| in | 进行in 方向的软重置 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

如果这个命令中，指定了邻居的地址的话，它将会把这个指定的连接给清除掉。如果
  没指定任何地址，这个命令将会清除所有的BGP 路由。

**示例**：

```
Switch# clear ip bgp 3.3.3.3 vrf VRF1 soft in
```

**相关命令**：N/A

### 6.7.32 `debug bgp`

**功能**：使用这个命令来使能所有的BGP 调试功能。
  使用相应的no 命令来删除这个配置。

**语法**：

```
debug bgp ( all | dampening | events | filters | fsm | keepalives | mpls | updates )
no debug bgp ( all | dampening | events | filters | fsm | keepalives | mpls | nsm | updates )
```

| 参数 | 说明 |
| --- | --- |
| all | 打开或者关闭所有BGP 调试开关。 |
| dampening | BGP 惩罚调试模式 |
| events | BGP 事件调试模式 |
| filters | BGP 过滤调试模式 |
| fsm | BGP 有限状态机(FSM)调试模式 |
| mpls | BGP MPLS 调试模式 |
| keepalives | BGP keepalive 信息调试模式 |
| updates | BGP 更新通告调试模式 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

不带任何参数使用这个命令的话会打开所有通常的BGP 调试开关。

**示例**：

```
Switch# debug bgp
Switch# debug bgp events
```

**相关命令**：N/A

### 6.7.33 `distance`

**功能**：使用这个命令来定义管理距离。
  使用相应的no 命令来删除这个配置。

**语法**：

```
distance ADMINDISTANCE IP_ADDR/IP_MASK_LEN
no distance ADMINDISTANCE IP_ADDR/IP_MASK_LEN
```

| 参数 | 说明 |
| --- | --- |
| ADMINDISTANCE | 指定管理距离 1-255 |
| IP_ADDR | IP 源地址前缀 IPv4 地址 |
| IP_MASK_LEN | IP 源地址前缀掩码长度 1-32 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

使用这个命令来试着BGP 的管理距离。这个距离标识了一个路由器的可靠性。
  这个值越高越不可靠。
  管理距离可以对外部，内部和本地的路由进行设置。外部路径是从AS 外部邻居学习到
  的路由。内部路由是在同一个AS 的另外一个路由器中学习到的路由。而本地路由则是
  本路由器从别的进程中通过重发布学习到的路由。
  如果管理距离被改变的话，将会在路由表中出现矛盾，并且阻塞路由。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) distance 34 10.10.0.0/24 mylist
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router) distance bgp 34 23 15
```

**相关命令**：N/A

### 6.7.34 `exit-address-family`

**功能**：使用这个命令来退出地址族模式。

**语法**：

```
exit-address-family
```

**命令模式**：地址族配置模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
下面的例子描述了exit-address-family 命令的使用:
Switch# configure terminal
Switch(config)# router bgp 100
Switch(config-router)# address-family ipv4 unicast
Switch(config-router-af)# exit-address-family
Switch(config-router)#
```

**相关命令**：address-family

### 6.7.35 `ip as-path access-list`

**功能**：使用这个命令定义一个BGP AS 路径的ACL。
  使用相应的no 命令来删除这个配置。

**语法**：

```
ip as-path access-list LISTNAME ( deny | permit ) LINE
no ip as-path access-list LISTNAME ( deny | permit ) LINE
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | 指定ACL 的名字不超过40 个字符的字符串，首字符必须是[a-zA- |
| Z0-9] |  |
| deny | (Optional) 匹配条件的 |
| deny ACL |  |
| permit | (Optional) 匹配条件的 |
| permit ACL |  |
| LINE | 指定一个匹配BGP AS- path 的正则表达式匹配BGP AS-path 的正则表达式 |

**命令模式**：全局配置模式

**默认配置**：N/A

**使用说明**：

命名联合表示一个基于正则表达式的过滤规则。如果这个正则表达式匹配了指定的用
  于代表某个路由的AS-path 的字符串的话，则会应用相应的permit 或者deny 条件。
  使用这个命令来全局的定义BGP ACL，使用neighbor router configuration 命令来应用
  一个指定的ACL。

**示例**：

```
Switch# configure terminal
Switch(config)# ip as-path access-list mylist deny ^65535$
```

**相关命令**：N/A

### 6.7.36 `ip community-list`

**功能**：使用这个命令来增加一个联合列表(community list)条目。
  使用相应的no 命令来删除这个配置。

**语法**：

```
ip community-list LISTNUM ( deny | permit ) COMMUNITY
no ip community-list LISTNUM ( deny | permit ) COMMUNITY
```

| 参数 | 说明 |
| --- | --- |
| LISTNUM | 指定联合列表的ID 1-99:标准联合列表 100-199:扩展的联合列表 1-199 |
| deny | 指定拒绝这个联合 |
| permit | 指定允许这个联合 |
| COMMUNITY | (AA:NN\|internet\|local- AS\|no-advertise\|no-export) |
| AA:NN | 指定一个对于联合号来说有效的值。这个值的格式是一个32bit 的值，AS 是高 16bit 而VAL 是低16bit。 AA 范围1-65535 NN 范围1-65535 |
| internet | 指定路由不被internet 宣告。 |
| local-AS | 指定路由被外部BGP 对等体宣告。 |
| no-advertise | 指定路由不被宣告到其他 BGP 对等体。 |
| no-export | 指定路由不被宣告到AS 边界以外。 |

**命令模式**：全局配置模式

**默认配置**：N/A

**使用说明**：

使用community-lists 来指定BGPcommunity 属性。community 属性用于实现策略路由。
  这是个可选的及物的属性，并且可以促进本地策略通过不同的AS 来传输。它包括了
  32bit 长度的联合值。
  有两种community-lists：扩展的和标准的。常规的community-list 用指定的格式(非正
  则表达式)来定义了community 属性。而扩展的community-list 则用正则表达式来定义
  community 属性。

**示例**：

```
Switch# configure terminal
Switch(config)# ip community-list 20 permit 7675:80 7675:90
```

**相关命令**：ip community-list standard、ip community-list expanded

### 6.7.37 `ip community-list expanded`

**功能**：使用这个命令来增加一个联合列表条目。
  使用相应的no 命令来删除这个配置。

**语法**：

```
ip community-list expanded WORD ( deny | permit ) LINE
no ip community-list expanded WORD ( deny | permit ) LINE
```

| 参数 | 说明 |
| --- | --- |
| expanded | 增加一个扩展联合列表条目 - |
| WORD | 扩展联合扩展联合列表名不超过20 个字符的字符串 |
| deny | 指定拒绝这个联合列表 |
| permit | 指定允许这个联合列表 |
| LINE | 指定使用正则表达式来描述联合列表正则表达式 |

**命令模式**：全局配置模式

**默认配置**：N/A

**使用说明**：

使用community-lists 来指定BGPcommunity 属性。community 属性用于实现策略路由。
  这是个可选的及物的属性，并且可以促进本地策略通过不同的AS 来传输。它包括了
  32bit 长度的联合值。
  有两种community-lists：扩展的和标准的。常规的community-list 用指定的格式(非正
  则表达式)来定义了community 属性。而扩展的community-list 则用正则表达式来定义
  community 属性。

**示例**：

```
Switch# configure terminal
Switch(config)# ip community-list expanded CLIST permit .*
```

**相关命令**：ip community-list、ip community-list standard

### 6.7.38 `ip community-list standard`

**功能**：使用这个命令来增加一个标准的联合列表条目。
  使用相应的no 命令来删除这个配置。

**语法**：

```
ip community-list standard WORD ( deny | permit ) COMMUNITY
no ip community-list standard WORD ( deny | permit ) COMMUNITY
```

| 参数 | 说明 |
| --- | --- |
| standard | 增加一个标准联合列表条目。 |
| WORD | 标准联合扩展联合列表名不超过20 个字符的字符串 |
| deny | 指定拒绝这个联合列表 |
| permit | 指定允许这个联合列表 |
| COMMUNITY | (AA:NN\|internet\|local- AS\|no-advertise\|no-export) |
| AA: NN | 指定一个对于联合号来说有效的值。这个值的格式是一个32bit 的值，AS 是高 16bit 而VAL 是低16bit。 AA 范围1-65535 NN 范围1-65535 |
| internet | 指定路由不被internet 宣告。 |
| local-AS | 指定路由贝贝外部BGP 对等体宣告。 |
| no-advertise | 指定路由不被宣告到其他 BGP 对等体。 |
| no-export | 指定路由不被宣告到AS 边界以外。 |

**命令模式**：全局配置模式

**默认配置**：N/A

**使用说明**：

使用community-lists 来指定BGP community 属性。community 属性用于实现策略路
  由。这是个可选的及物的属性，并且可以促进本地策略通过不同的AS 来传输。它包括
  了32bit 长度的联合值。
  有两种community-lists：扩展的和标准的。常规的community-list 用指定的格式(非正
  则表达式)来定义了community 属性。而扩展的community-list 则用正则表达式来定义
  community 属性。
  使用ip community-list standard 来增加一个标准的community-list 条目。标准的
  community-list 被编译成了二进制格式，并且直接和BGP 更新时的BGPcommunity 属
  性相比较。这个比较过程比扩展community-list 要快。任何不匹配标准联合值的联合
  值都被自动的作为扩展联合值来对待。

**示例**：

```
Switch# configure terminal
Switch(config)# ip community-list standard CLIST permit 7675:80 7675:90 no-export
```

**相关命令**：ip community-list、ip community-list expanded

### 6.7.39 `neighbor activate`

**功能**：使用这个命令来使能和启用一个邻居路由器的指定AF 路由信息交换功能。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID activate
no neighbor NEIGHBORID activate
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

在TCP 连接被邻居打开以后，这个命令被用于使能或者取消和邻居路由器之间指定AF
  信息交换。
  使能组播和VPNv4 地址前缀类型的交换，邻居要在地址族模式下使用neighbor
  activate 命令来激活。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 1.2.3.4 activate
```

**相关命令**：neighbor remote-as

### 6.7.40 `neighbor advertisement-interval`

**功能**：使用这个命令来设置BGP 路由更新的最小间隔。
  使用相应的no 参数来设置间隔为默认值。

**语法**：

```
neighbor NEIGHBORID advertisement-interval TIME
no neighbor NEIGHBORID advertisement-interval
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| TIME | 以秒为单位的宣告间隔值。 0-600 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

使用这个命令来设置BGP 路由更新发送的最小间隔。为了降低在internet 中的路由抖
  动，设定了一个最小的宣告间隔。所以BGP 路由只会在每个时间间隔被发送。bgp
  dampening 也可以被用于控制路由抖动的效果。对于本地始发路由，路由的发送间隔
  还受到as-origination-interval 控制，即同时受到as-origination-interval 和
  advertisement-interval 控制。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.0.3 advertisement-interval 45
```

**相关命令**：N/A

### 6.7.41 `neighbor as-origination-interval`

**功能**：使用这个命令来设置本地始发BGP 路由准备更新的最小间隔，即发送本地始发路由还
  受到advertise-interval 控制。
  使用相应的no 参数来设置间隔为默认值。

**语法**：

```
neighbor NEIGHBORID as-origination-interval TIME
no neighbor NEIGHBORID as-origination-interval TIME
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| TIME | 以秒为单位的宣告间隔值。 0-600 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

使用这个命令来设置本地始发BGP 路由准备更新发送的最小间隔。本地始发的bgp 路
  由受到as-origination-interval 控制，当as-origination-interval 超时，即允许发送本地
  始发bgp 路由，但是不会真正发送本地始发的bgp 路由，而是等到advertise-interval
  超时后才会发。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.0.3 advertisement-interval 45
```

**相关命令**：N/A

### 6.7.42 `neighbor allowas-in`

**功能**：使用这个命令来配置PE 路由，用于运行对所有的含有重复ASN(ASN)的前缀进行重宣
  告。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBOR allowas-in [ NUMBER ]
no neighbor NEIGHBOR allowas-in
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| NUMBER | 允许重复出现的ASN 次数，默认为1 1-10 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：Disabled

**使用说明**：

在一个hub-and-spoke 系统中，一个PE 路由器会重宣告所有包含重复ASN 的IP 前缀。
  使用neighbor allowas-in 命令在每个PE 路由器上配置两个VRF，来接受和重宣告前缀。
  其中的一个VRF 接受所有PE 路由器宣告的带ASN 的前缀，然后将它们宣告给邻居路
  由器。另外一个VRF 则从CE 路由器接受带ASN 的前缀并将它们重宣告给所有的在
  hub-and-spoke 系统中的PE 路由器。
  通过指定从1~10 的数字，来控制ASN 被宣告的次数。

**示例**：

```
Switch# configure terminal
Switch(config-router)# address-family ipv4 vrf VRF_A
Switch(config-router-af)# neighbor 10.10.0.1 allowas-in 3
```

**相关命令**：N/A

### 6.7.43 `neighbor attribute-unchanged`

**功能**：使用这个命令来向指定的邻居宣告没改变的BGP 属性。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID attribute-unchanged { as-path | next-hop | med }
no neighbor NEIGHBORID attribute-unchanged { as-path | next-hop | med }
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对不超过20 个字符的字符串等体上。 |
| as-path | AS 路径属性 |
| next-hop | 下一跳属性 |
| med | MED 值 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.0.75 attribute-unchanged as-path med
```

**相关命令**：N/A

### 6.7.44 `neighbor capability graceful-restart`

**功能**：使用这个命令来使能或者去使能GR helper 功能。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID capability graceful-restart ( | disable )
no neighbor NEIGHBORID capability graceful-restart ( | disable )
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 格式为A.B.C.D 的IPv4 地邻居的地址。 址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

基于neighbor 配置的GR helper 使能状态优先级高于全局配置。
  使用带disable 参数的no 命令会删除neighbor GR 去使能的配置。
  使用不带disable 参数的no 命令会删除neighbor GR 使能和去使能的配置。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.10.1 capability graceful-restart
```

**相关命令**：N/A

### 6.7.45 `neighbor capability orf prefix-list`

**功能**：使用这个命令来向邻居宣告ORF 的最大容量(capability)。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID capability orf prefix-list ( both | receive | send )
no neighbor NEIGHBORID capability orf prefix-list ( both | receive | send )
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| orf | 向邻居宣告ORF 容量 |
| both | 表示本地路由器既可以向他的对等体发送条目，又可以接受ORF 条目。 |
| receive | 只能接受ORF 条目。 |
| send | 只能发送ORF 条目。 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

出站路由过滤(ORF)发送和接受capability 用来减轻邻居间的更新交互。通过过滤更新，
  这个选项可以让生成和处理的更新最小化。
  本地路由在发送模式下宣告ORF capability，远端路由在接受模式下接受这个宣告并应
  用这个过滤规则。两个路由器交互更新来维持他们各自的ORF。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 1.1.1.1 capability orf prefix-list both
```

**相关命令**：N/A

### 6.7.46 `neighbor capability route-refresh`

**功能**：使用这个命令来使能路由刷新功能。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID capability route-refresh
no neighbor NEIGHBORID capability route-refresh
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

使用这个命令告知邻居本路由器支持路由刷新功能，一旦enbale，就可以通过动态的
  请求要求指定邻居发送Adj-RIB-Out。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.10.1 capability route-refresh
```

**相关命令**：N/A

### 6.7.47 `neighbor default-originate`

**功能**：使用这个命令来允许BGP 本地路由其来发送默认路由0.0.0.0 到一个邻居，作为它的默
  认路由。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID default-originate ( ROUTEMAP | )
no neighbor NEIGHBORID default-originate ( ROUTEMAP | )
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| ROUTEMAP |  |
| route-map WORD |  |
| route-map | 用于指定成为起始默认路由的标准的route-map |
| WORD | Route-map 名不超过20 个字符的字符串 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

每个路由器都应该有个默认的路由，它应用于向不是在本地IP 路由表中的网络发送数
  据包。确保每个路由器都有一个默认路由的方法是，在每个路由器上配置一个静态路
  由，用来设置默认的路由。另一种方法是，创建一个默认路由并把这个路由广播到
  BGP 邻居中。拥有默认路由的路由器，可以使用这个命令，来通过BGP 广播这个路由。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.10.1 default-originate route-map myroute
```

**相关命令**：N/A

### 6.7.48 `neighbor description`

**功能**：使用这个命令来将邻居和一个描述关联起来。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID description LINE
no neighbor NEIGHBORID description
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| LINE | 描述这个邻居不超过80 个字符的字符串 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 1.2.3.4 description Backup router for sales.
```

**相关命令**：N/A

### 6.7.49 `neighbor distribute-list`

**功能**：使用这个命令来过滤来自特定BGP 邻居的路由更新。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID distribute-list WORD ( in | out )
no neighbor NEIGHBORID distribute-list WORD ( in | out )
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来不超过20 个字符的字符串创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 |
| WORD | IP ACL 的名字不超过40 个字符的字符串 |
| in | 表示入站的宣告路由将会被过滤 |
| out | 表示出站的宣告路由将会被过滤 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

每个BGP 邻居只使用一个distribute-list。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 1.2.3.4 distribute-list mylist out
```

**相关命令**：N/A

### 6.7.50 `neighbor ebgp-multihop`

**功能**：使用这个命令来在不直连的网络上接受和与外部的对等体尝试BGP 连接。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID ebgp-multihop ( COUNT | )
no neighbor NEIGHBORID ebgp-multihop
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| COUNT | 最大条数。如果没有设置的话那就是255。 1-255 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

只有在到multihop 对等体的路由时默认路由的时候，才会启用multihop，这可以用来
  避免出现环路。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.10.34 remote-as 20
Switch(config-router)# neighbor 10.10.10.34 ebgp-multihop 5
```

**相关命令**：N/A

### 6.7.51 `neighbor filter-list`

**功能**：使用这个命令来建立一个BGP 过滤器。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID filter-list LISTNAME ( in | out )
no neighbor NEIGHBORID filter-list LISTNAME ( in | out )
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| in | 表示入站的宣告路由将会被过滤 |
| out | 表示出站的宣告路由将会被过滤 |
| LISTNAME | 访问控制列表名不超过40 个字符的字符串 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

这个命令指定了基于BGP AS-path 的ACL 过滤器。每个过滤器都是一个基于正则表达
  式的ACL。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.0.34 filter-list listname out
```

**相关命令**：N/A

### 6.7.52 `neighbor maximum-prefix`

**功能**：使用这个命令来控制可以被邻居接收到的前缀数量。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID maximum-prefix MAXIMUM
no neighbor NEIGHBORID maximum-prefix
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| MAXIMUM |  |
| MAXPREFIX | (THRESHOLD\|) (warning- only\|) |
| MAXPREFIX | 指定允许前缀的最大数量。 1-4294967295 |
| THRESHOLD | 指定阈值，1%-100%。 1-100 |
| warning-only | 在超过限制时只发送警告信息。 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

neighbor maximum-prefix 命令，允许配置BGP 路由器允许从邻居接收到的指定的前
  缀数量。当没有使用warning-only 选项的时候，如果接收到任何额外的前缀的话，那
  路由器将会结束对等状态。一个被结束的对等体，将会一直等到clear ip bgp 命令被执
  行后，才会启用。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.0.72 maximum-prefix 1244 warning-only
```

**相关命令**：N/A

### 6.7.53 `neighbor next-hop-self`

**功能**：使用这个命令来配置路由器作为一个BGP-speaking 邻居或者一个对等体组。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID next-hop-self
no neighbor NEIGHBORID next-hop-self
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

当BGP 路由器通过eBGP 得到路由，并且这些路由需要广播给一个iBGP 邻居时，发送
  的下一跳信息并不改变。使用这个命令，BGP 路由器可以改变发送给iBGP 对等体的下
  一跳信息，把下一跳信息设置为这个邻居进行通信的接口的IP 地址。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.0.72 remote-as 100
Switch(config-router)# neighbor 10.10.0.72 next-hop-self
```

**相关命令**：N/A

### 6.7.54 `neighbor override-capability`

**功能**：使用这个命令来覆盖一个capability 协商的结果。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID override-capability
no neighbor NEIGHBORID override-capability
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来不超过20 个字符的字符串创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 12
Switch(config-router)# neighbor 10.10.10.10 override-capability
```

**相关命令**：N/A

### 6.7.55 `neighbor passive`

**功能**：使用这个命令，来设定一个BGP 邻居组为被动模式。
  使用相应的no 命令来删除这个配置。

**语法**：

```
( no ) neighbor NEIGHBORID passive
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来不超过20 个字符的字符串创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 12
Switch(config-router)# neighbor 10.10.10.10 passive
```

**相关命令**：N/A

### 6.7.56 `neighbor peer-group (adding a neighbor)`

**功能**：使用这个命令，来向一个已经存在的对等体组中增加一个邻居。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor IPADDRESS peer-group TAG
no neighbor IPADDRESS peer-group
```

| 参数 | 说明 |
| --- | --- |
| IPADDRESS | A.B.C.D 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来不超过20 个字符的字符串创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

对邻居使用这个有同样更新策略的命令，将会把它加入到一个对等体组中。这个工具
  可以更新各种策略，比如分发和过滤器列表。对等组可以用任何neighbor 命令来简单
  的进行配置。任何对对等组的修改会对所有的成员产生影响。
  使用neighbor peer-group create 命令来创建一个对等组，然后使用这个命令来把邻居
  加入这个组。

**示例**：

```
下面是一个把邻居10.10.0.63 加入一个新的对等组group1 的例子:
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor group1 peer-group
Switch(config-router)# neighbor 10.10.0.63 peer-group group1
```

**相关命令**：N/A

### 6.7.57 `neighbor peer-group (creating a peer-group)`

**功能**：使用这个命令来创建一个对等组。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor TAG peer-group
no neighbor TAG peer-group
```

| 参数 | 说明 |
| --- | --- |
| TAG | 对等体组名 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

可以把具有相同更新策略的邻居放在一个对等体组里。对等组可以用任何neighbor 命
  令来简单的进行配置。任何对对等组的修改会对所有的成员产生影响。使用这个命令
  可以创建一个对等体组。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor group1 peer-group
```

**相关命令**：N/A

### 6.7.58 `neighbor prefix-list`

**功能**：使用这个命令在指定一个前缀列表的时候来分发BGP 邻居信息。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID prefix-list LISTNAME ( in | out )
no neighbor NEIGHBORID prefix-list LISTNAME ( in | out )
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参不超过20 个字符的字符串考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 |
| LISTNAME | AS-path 的ACL 号。 不超过40 个字符的字符串 |
| in | 指定ACL 应用到入站宣告上 |
| out | 指定ACL 应用到出站宣告上 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

使用这个命令来指定一个用于过滤BGP 宣告的前缀列表。如果有一个匹配到的话，就
  使用这个路由。一个空的前缀列表将会允许所有的前缀。如果一个前缀没有匹配任何
  前缀列表的条目的话，这个路由就会拒绝访问。当多个前缀列表的多个条目匹配了一
  个前缀的时候，有最小序列号的条目就会被选择为真正的匹配。
  路由器从前缀列表的最上面(序号1)开始搜索。一旦匹配到match 或者deny，下面的
  前缀列表就不需要继续往下搜索了。为了提高效率，最常用的匹配要列在最前面。
  neighbor distribute-list 命令对neighbor prefix-list 命令来说是可选的，并且，只有他
  们中的一个才可以被用于对任意方向的同一个邻居进行过滤。

**示例**：

```
Switch# configure terminal
Switch(config)# ip prefix-list list1 deny 30.0.0.0/24
Switch(config)# router bgp 12
Switch(config-router)# neighbor 10.10.10.10 prefix-list list1 in
```

**相关命令**：ip prefix-list

### 6.7.59 `neighbor remote-as`

**功能**：使用这个命令来配置一个跟另一个路由器建立的内部或者外部的BGP(iBGP 或者eBGP)
  的TCP 会话。

**语法**：

```
neighbor NEIGHBORID remote-as ASNUM
no neighbor NEIGHBORID remote-as ASNUM
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| ASNUM | 邻居ASN 1-4294967295 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

这个命令用来配置跟另外一个邻居的iBGP 和eBGP 的会话。一个对等组只在建立一个
  指定的对等组以后才会支持这个命令。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 11
Switch(config-router)# neighbor 10.10.0.73 remote-as 345
```

**相关命令**：N/A

### 6.7.60 `neighbor remove-private-AS`

**功能**：使用这个命令来将私有ASN 从出站更新中移除。
  使用相应的no 命令来删除这个配置并返回默认。

**语法**：

```
neighbor NEIGHBORID remove-private-AS
no neighbor NEIGHBORID remove-private-AS
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：Disabled

**使用说明**：

私有ASN 范围<64512-65535>。私有ASN 不会被宣告到Internet 上。这个命令只能和
  外部BGP 对等体一起使用。路由器只会在更新中包含私有ASN 的时候才会删除这个
  ASN。如果更新中既有私有的又有公有的ASN，系统作为error 处理。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.0.63 remove-private-AS
```

**相关命令**：N/A

### 6.7.61 `neighbor route-reflector-client`

**功能**：使用这个命令来配置路由器作为一个BGP 的RR，并且配置指定的邻居是他的客户端
  (client)。
  使用相应的no 命令来删除这个配置

**语法**：

```
neighbor NEIGHBORID route-reflector-client
no neighbor NEIGHBORID route-reflector-client
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

RR 是一个用来在AS 中的iBGP 对等体爆炸式增长的一个解决方案。通过RR，在AS 中
  iBGP 对等体的数量会减少。使用neighbor route-reflector-client 命令，来配置指定邻
  居作为它的client 以及本地路由作为它的RR。
  由于AS 可以有多个RR。一个RR 把另外一个RR 作为另外一个iBGP speaker 来对待。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.0.72 route-reflector-client
```

**相关命令**：N/A

### 6.7.62 `neighbor send-community`

**功能**：使用这个命令来指定一个应该被发给一个BGP 邻居的community 属性。
  使用相应的no 命令来删除这个条目。使用extended 和no 参数来删除扩展的联合。不
  使用任何参数的话就意为standard.

**语法**：

```
neighbor NEIGHBORID send-community ( both | extended | standard | )
no neighbor NEIGHBORID send-community ( both | extended | standard | )
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| both | 发送标准和扩展的 community 属性 |
| extended | 发送扩展community 属性 |
| standard | 发送标准community 属性 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：无

**使用说明**：

默认情况下，并不把BGP 的community 属性广播给对等体。但可以使用neighbor
  send-community 命令来启动这项功能，即发送BGP 的community 属性给它的对等体。
  路由策略可以基于邻居的地址，对等组的名字或者是AS 的路径信息。

**示例**：

```
Switch# configure terminal
Switch(config)# bgp config-type standard
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.0.72 send-community extended
```

**相关命令**：N/A

### 6.7.63 `neighbor shutdown`

**功能**：使用这个命令来关闭一个邻居。
  使用相应的no 命令来重新使能这个邻居。

**语法**：

```
neighbor NEIGHBORID shutdown
no neighbor NEIGHBORID shutdown
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 格式为A.B.C.D 的IPv4 地邻居的地址。 址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

这个命令关闭任何指定邻居的活动会话，并且清空相关的路由数据。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.0.72 shutdown
```

**相关命令**：N/A

### 6.7.64 `neighbor soft-reconfiguration inbound`

**功能**：使用这个命令来配置启动存储更新。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID soft-reconfiguration inbound
bo neighbor NEIGHBORID soft-reconfiguration inbound
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

如果在BGP 邻居中已经配置了一个策略(如路由映射或者重分配列表)，并且需要改变
  这个策略的话，那么为了使新策略生效，就需要清除BGP 会话。一旦清除了BGP 会话，
  缓存就会无效。这会对路由有瞬间的影响。使用soft-reconfiguration inbound 命令，
  就可以在不清除BGP 会话的情况下改变策略。软件重新配置的两种情况是入站和出站。
  在使用入站时，从邻居来的软件重新配置的更新存储在内存中，而不管入站策略是什
  么。需要注意的是，使用入站软件配置比不使用入站软件配置需要更多的内存。出站
  软件重新配置不需要任何附加的内存，并且总是启动的。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 12
Switch(config-router)# neighbor 10.10.10.10 soft-reconfiguration inbound
```

**相关命令**：N/A

### 6.7.65 `neighbor strict-capability-match`

**功能**：使用这个命令，如果capability 值无法完全的匹配远端对等体的话，就关闭BGP 连接。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID strict-capability-match
no neighbor NEIGHBORID strict-capability-match
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 12
Switch(config-router)# neighbor 10.10.10.10 strict-capability-match
```

**相关命令**：N/A

### 6.7.66 `neighbor timers`

**功能**：使用这个命令来对一个指定的BGP 邻居设定时钟。
  使用相应的no 命令来清除这个时钟。

**语法**：

```
neighbor NEIGHBORID timers KEEPALIVE HOLDTIME
no neighbor NEIGHBORID timers
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| KEEPALIVE | 路由器发送给邻居 keepalive 信息的间隔时间，默认60s。 1-65535 |
| HOLDTIME | 未接收到keepalive 信息， 路由器宣告邻居死亡的等待时间，默认180s。 3-65535 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

路由器发送keepalive 信息用于通告另外一个路由器，两者之间的BGP 连接仍然是活动
  的。Keepalive 间隔是每次发送keepalive 信息的间隔时间。Holdtime 是路由器等待
  keepalive 信息，宣告邻居死亡的超时时间。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 12
Switch(config-router)# neighbor 10.10.10.10 timers 60 120
```

**相关命令**：N/A

### 6.7.67 `neighbor unsuppress-map`

**功能**：使用这个命令来选择性的对特定的邻居抑制更明确的路由。

**语法**：

```
neighbor NEIGHBORID unsuppress-map WORD
no neighbor NEIGHBORID unsuppress-map WORD
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| WORD | route map 名 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

当aggregate-address 命令使用了summary-only 选项时，会抑制聚合的更明确的路由。
  它会抑制更明确的路由到达所有的邻居。可以使用非抑制的映射，有选择的让特定的
  路由到达特定的邻居。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router) neighbor 10.10.0.73 unsuppress-map mymap
Switch#configure terminal
Switch(config)#router bgp 10
Switch(config-router)address-family ipv4 unicast
Switch(config-router-af)neighbor 10.10.0.70 unsuppress-map mymap
```

**相关命令**：N/A

### 6.7.68 `neighbor update-source`

**功能**：使用这个命令，来允许内部BGP 会话使用任何对TCP 连接可选的接口。
  使用no neighbor update-source 命令恢复默认，使用最接近的接口。

**语法**：

```
neighbor NEIGHBORID update-source IFNAME
no neighbor NEIGHBORID update-source
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| IFNAME | 指定接口名支持 |
| physical/aggregation/loopb | ack/tunnel/vlan 端口 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

使用这个命令来与任在路由器上指定的接口结合使用。最常用的接口类型是loopback
  接口。使用loopback 接口可以停止BGP 对某个特定的interface 进行TCP 连接的依赖。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 10.10.0.72 update-source eth-0-1
```

**相关命令**：N/A

### 6.7.69 `neighbor weight`

**功能**：使用这个命令，来设置路由到另据的默认weight。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID weight WEIGHT
no neighbor NEIGHBORID weight
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (A.B.C.D\|TAG) |
| A.B.C.D | 以IP 地址格式来指定BGP 邻居的地址。 格式为A.B.C.D 的IPv4 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符的字符串 |
| WEIGHT | 指定邻居的权重值 0-65535 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

使用这个命令来指定所有从邻居学到的路由的weight 值。具有最高weight 值的路由，
  当网络上存在有其他路由的时候，有更高的优先级。
  不像local-preference 属性，weight 属性只跟本地路由器有关。
  使用set weight 命令将会覆盖使用本命令指定的weight 值。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 12
Switch(config-router)# neighbor 10.10.10.10 weight 60
```

**相关命令**：N/A

### 6.7.70 `neighbor fall-over bfd`

**功能**：使用这个命令，来为邻居建立BFD 会话。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor ( A.B.C.D | X:X::X:X | WORD ) fall-over bfd ( multihop | )
no neighbor ( A.B.C.D | WORD ) fall-over bfd ( multihop | )
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D\|X:X::X:X\|WORD | 以IP 地址格式或者以peer group 的形式来指定BGP 邻居的地址。 格式为A.B.C.D/X:X::X:X 的IPv4/IPv6 地址或peer group 的格式 |
| multihop | 以多跳方式来建立bfd |
| session |  |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

为bgp 邻居建立bfd 会话

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 12
Switch(config-router)# neighbor 10.10.10.10 fall-over bfd
```

**相关命令**：无

### 6.7.71 `network`

**功能**：使用这个命令来指定被BGP 路由进程宣告的网络。
  使用相应的no 命令来删除这个配置。

**语法**：

```
network A.B.C.D
network A.B.C.D route-map WORD
no network A.B.C.D
no network A.B.C.D route-map WORD
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | IP 前缀, 例 35.0.0.0 格式为A.B.C.D 的IPv4 地址 |
| WORD | Route-map 名不超过20 个字符的字符串 |

**命令模式**：路由模式  地址族配置模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
下面的例子举例说明说明了，把一个Class-A 的地址配置成一个网络路由Class-A 的网
络前缀掩码的长度8 将会被在内部获得，会是2.0.0.0/8:
Switch# configure terminal
Switch(config)#router bgp 1
Switch(config-router)#network 2.0.0.0

!
router bgp 1
no synchronization
network 2.0.0.0
!
```

**相关命令**：N/A

### 6.7.72 `network synchronization`

**功能**：使用这个命令，来保证被任何network 命令指定的完全相同的静态网络前缀，是本地
  的或者在被BGP RIB 介绍前是IGP 可达的。
  使用相应的no 命令来删除这个配置。

**语法**：

```
network synchronization
no network synchronization
```

**命令模式**：路由模式 地址族配置模式

**默认配置**：默认Network synchronization 不使能

**使用说明**：

N/A

**示例**：

```
下面的例子在路由模式下使能了BGP 静态网络路由的IGP 同步:
Switch# configure terminal
Switch(config)# router bgp 11
Switch(config-router)# network synchronization
```

**相关命令**：N/A

### 6.7.73 `synchronization`

**功能**：在配置模式或者地址族配置模式下，使用这个命令来使能iBGP 学习路由的IGP 同步。
  使用相应的no 命令来删除这个配置。

**语法**：

```
synchronization
no synchronization
```

**命令模式**：路由模式 地址族配置模式

**默认配置**：IGP 同步默认不使能。

**使用说明**：

当BGP 路由器无法宣告从iBGP 邻居学到的路由时，需要使用synchronization 功能，
  除非这些路由也会在IGP(如OSPF)中出现。在所有AS 中的路由器都不进行BGP 会话的
  时候，同步会被使能，并且AS 就作为其他AS 的传输者。no synchronization 命令在
  
  BGP 路由器可以不等待IGP 可达性出现的条件下宣告，从它的iBGP 邻居学习到的路由
  时使用。

**示例**：

```
下面示一个在IPv4 地址族模式下使能IGP synchronization 的例子:
Switch# configure terminal
Switch(config)# router bgp 11
Switch(config)# address-family ipv4 unicast
Switch(config-af)# network synchronization
```

**相关命令**：N/A

### 6.7.74 `router bgp`

**功能**：使用这个命令，来配置一个BGP 路由进程。
  使用相应的no 命令来删除这个配置。

**语法**：

```
router bgp ASN
no router bgp ASN
```

| 参数 | 说明 |
| --- | --- |
| ASN | 指定ASN 1-4294967295 |

**命令模式**：全局配置模式

**默认配置**：N/A

**使用说明**：

router bgp 命令会启用一个BGP 路由进程。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 12
Switch(config-router)#
```

**相关命令**：N/A

### 6.7.75 `show debugging bgp`

**功能**：使用这个命令来显示设置的BGP debugging 选项。

**语法**：

```
show debugging bgp
```

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

无

**示例**：

```
Switch# show debugging bgp
```

**相关命令**：N/A

### 6.7.76 `show ip bgp`

**功能**：使用这个命令来显示BGP 网络信息。

**语法**：

```
show ip bgp ( IPADDRESS | )
show ip bgp ipv4 PREFIX ( IPADDRESS | )
```

| 参数 | 说明 |
| --- | --- |
| IPADDRESS | A.B.C.D\|A.B.C.D/M 指定 IP 地址及长度格式为A.B.C.D 的IPv4 地址或格式为A.B.C.D/M 的 IPv4 地址和掩码长度 |
| ipv4 | 指定地址族。这决定了会被显示的路由表。 |
| PREFIX | (multicast\|unicast) |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |
| multicast | multicast 指定IPV4 组播地址族。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show ip bgp 10.10.1.34/24
```

**相关命令**：N/A

### 6.7.77 `show ip bgp attribute-info`

**功能**：使用这个命令来显示BGP 的配置属性信息。

**语法**：

```
show ip bgp attribute-info
```

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
这是一show ip bgp attribute-info 命令显示的例子:
Switch# show ip bgp attribute-info
```

**相关命令**：N/A

### 6.7.78 `show ip bgp cidr-only`

**功能**：使用这个命令来显示用非自然网络掩码的路由。

**语法**：

```
show ip bgp cidr-only
show ip bgp ipv4 PREFIX cidr-only
```

| 参数 | 说明 |
| --- | --- |
| ipv4 | 指定地址族。这决定了会被显示的路由表。 |
| PREFIX | (multicast\|unicast) |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |
| multicast | 指定IPV4 组播地址族。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
这是一个使用show ip bgp cidr-only 来显示的命令:
Switch# show ip bgp cidr-only
```

**相关命令**：N/A

### 6.7.79 `show ip bgp community`

**功能**：使用这个命令来显示匹配联合的路由。

**语法**：

```
show ip bgp community TYPE ( exact-match | )
show ip bgp ipv4 PREFIX community TYPE ( exact-match | )
```

| 参数 | 说明 |
| --- | --- |
| TYPE |  |
| AA:NN\|local-AS\|no- |  |
| advertise\|no-export |  |
| AA:NN | 指定一个对于联合号来说有效的值。这个值的格式是一个32bit 的值，AS 是高 16bit 而VAL 是低16bit。 AA 范围1-65535 NN 范围1-65535 |
| local-AS | 不向外发送本地AS(公认联合) |
| no-advertise | 不向任何对等体宣告 (公认联合) |
| no-export | 不像下一个AS 输出(公认联合) |
| exact-match | 指定显示精确匹配的联合 |
| PREFIX | (multicast\|unicast) |
| multicast | 指定IPV4 组播地址族。 |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show ip bgp community 10:23 exact-match
Switch# show ip bgp ipv4 multicast community 10:23 exact-match
```

**相关命令**：N/A

### 6.7.80 `show ip bgp community-info`

**功能**：使用这个命令来列出所有的BGP 联合体信息。

**语法**：

```
show ip bgp community-info
```

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show ip bgp community-info
```

**相关命令**：N/A

### 6.7.81 `show ip bgp community-list`

**功能**：使用这个命令来显示匹配community-list 的路由。

**语法**：

```
show ip bgp community-list LISTNAME ( exact-match | )
show ip bgp ipv4 PREFIX community-list LISTNAME ( exact-match | )
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | 指定community list 名不超过20 个字符的字符串 |
| exact-match | 只表示那些有相同指定联合的路由。 |
| ipv4 | 指定地址族。地址族的种类决定了显示的路由表 |
| PREFIX | (multicast\|unicast) |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |
| multicast | 指定IPV4 组播地址族。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show ip bgp community-list mylist exact-match
Switch# show ip bgp ipv4 unicast community-list mylist
```

**相关命令**：N/A

### 6.7.82 `show ip bgp dampening`

**功能**：使用这个命令来显示惩罚的详细信息。

**语法**：

```
show ip bgp dampening ( dampened-paths | flap-statistics | parameters )
show ip bgp ipv4 PREFIX dampening ( dampened-paths | flap-statistics | parameters )
```

| 参数 | 说明 |
| --- | --- |
| dampened-paths | 显示惩罚路径 |
| flap-statistics | 显示路由flap 统计 |
| parameters | 显示配置的惩罚参数的详细信息 |
| ipv4 | 指定地址族。这决定了会被显示的路由表。 |
| PREFIX | (multicast\|unicast) |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |
| multicast | 指定IPV4 组播地址族。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
使能bgp dampening 来在内存中保存dampened-path 信息 下面是一个显示所有惩罚
参数的一个例子:
Switch# show ip bgp dampening parameters
```

**相关命令**：N/A

### 6.7.83 `show ip bgp filter-list`

**功能**：使用这个命令来显示符合filter-list 的路由。

**语法**：

```
show ip bgp filter-list LISTNAME
show ip bgp ipv4 PREFIX filter-list LISTNAME
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | 指定ACL 名的正则表达式不超过20 个字符的字符串 |
| ipv4 | 指定地址族。地址族的种类决定了显示的路由表 |
| PREFIX | (multicast\|unicast) |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |
| multicast | 指定IPV4 组播地址族。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show ip bgp filter-list mylist
Switch# show ip bgp ipv4 unicast filter-list Switch
```

**相关命令**：N/A

### 6.7.84 `show ip bgp inconsistent-as`

**功能**：使用这个命令来显示与AS-path 不匹配的路由。

**语法**：

```
show ip bgp inconsistent-as
show ip bgp ipv4 PREFIX inconsistent-as
```

| 参数 | 说明 |
| --- | --- |
| ipv4 | 指定地址族。地址族的种类决定了显示的路由表 |
| PREFIX | (multicast\|unicast) |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |
| multicast | 指定IPV4 组播地址族。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show ip bgp inconsistent-as
Switch# show ip bgp ipv4 unicast inconsistent-as
```

**相关命令**：N/A

### 6.7.85 `show ip bgp neighbors`

**功能**：使用这个命令来表示TCP 和BGP 邻居连接的详细信息。

**语法**：

```
show ip bgp neighbors ( IPADDRESS ( advertised-routes | RECEIVED | received-routes |
routes ) | )
show ip bgp ipv4 PREFIX neighbors ( IPADDRESS ( advertised-routes | received |
received-routes | routes ) | )
```

| 参数 | 说明 |
| --- | --- |
| IPADDRESS | 指定IPV4 的IP 地址格式为A.B.C.D 的IPv4 地址 |
| advertised-routes | 表示宣告给BGP 邻居的路由 |
| received | 接受到的prefix-filter，显示所有接收到的路由(无论是接收的还是拒绝的) |
| prefix-filter | 表示prefix-list 的filter |
| received-routes | 表示从邻居接收到的路由。 表示所有从邻居接收到的路由，先配置BGP 软重置。 这样就能显示所有从邻居学习到的接收路由。 |
| routes | 显示从邻居学习到的路由 |
| PREFIX | (multicast\|unicast) |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |
| multicast | 指定IPV4 组播地址族。 |
| ipv4 | 指定地址族为IPv4 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
这是一个使用show ip bgp 命令来显示指定邻居的命令:
Switch# show ip bgp neighbors
```

**相关命令**：N/A

### 6.7.86 `show ip bgp paths`

**功能**：使用这个命令来显示BGP 路径信息。

**语法**：

```
show ip bgp paths
show ip bgp ipv4 PREFIX paths
```

| 参数 | 说明 |
| --- | --- |
| ipv4 | 指定地址族。这决定了会被显示的路由表。 |
| PREFIX | (multicast\|unicast) |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |
| multicast | 指定IPV4 组播地址族。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show ip bgp paths
```

**相关命令**：N/A

### 6.7.87 `show ip bgp prefix-list`

**功能**：使用这个命令来显示匹配prefix-list 的路由。

**语法**：

```
show ip bgp prefix-list LIST
show ip bgp ipv4 PREFIX prefix-list LIST
```

| 参数 | 说明 |
| --- | --- |
| LIST | 指定IP prefix list 的名字不超过40 个字符的字符串 |
| ipv4 | 指定地址族。这决定了会被显示的路由表。 |
| PREFIX | (multicast\|unicast) |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |
| multicast | 指定IPV4 组播地址族。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show ip bgp prefix-list mylist
```

**相关命令**：N/A

### 6.7.88 `show ip bgp quote-regexp`

**功能**：使用这个命令来显示匹配AS path 正则表达式的路由。

**语法**：

```
show ip bgp quote-regexp LINE
show ip bgp ipv4 PREFIX quote-regexp LINE
```

| 参数 | 说明 |
| --- | --- |
| LINE | 指定匹配BGP AS-path 的正则表达式用引号括起的正则表达式 |
| ipv4 | 指定地址族。这决定了会被显示的路由表。 |
| PREFIX | (multicast\|unicast) |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |
| multicast | 指定IPV4 组播地址族。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show ip bgp quote-regexp “Switch”
```

**相关命令**：N/A

### 6.7.89 `show ip bgp regexp`

**功能**：使用这个命令来显示匹配AS-path 正则表达式的路由。

**语法**：

```
show ip bgp regexp LINE
show ip bgp ipv4 PREFIX regexp LINE
```

| 参数 | 说明 |
| --- | --- |
| regexp | 显示匹配AS-path 正则表达式的路由 |
| LINE | 指定一个正则表达式来匹配 |
| BGP AS-path | 正则表达式 |
| ipv4 | 指定地址族。这决定了会被显示的路由表。 |
| PREFIX | (multicast\|unicast) |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |
| multicast | 指定IPV4 组播地址族。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show ip bgp regexp myexpression
```

**相关命令**：N/A

### 6.7.90 `show ip bgp scan`

**功能**：使用这个命令来显示BGP scan 状态

**语法**：

```
show ip bgp scan
```

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show ip bgp scan
```

**相关命令**：N/A

### 6.7.91 `show ip bgp summary`

**功能**：使用这个命令来显示BGP 邻居状态的汇总信息。

**语法**：

```
show ip bgp summary
show ip bgp ipv4 PREFIX summary
```

| 参数 | 说明 |
| --- | --- |
| ipv4 | 指定地址族。这决定了会被显示的路由表。 |
| PREFIX | (multicast\|unicast) |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |
| multicast | 指定IPV4 组播地址族。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
这是一个使用show ip bgp 命令显示的一个例子:
Switch# show ip bgp summary
```

**相关命令**：N/A

### 6.7.92 `show ip bgp vpnv4 all`

**功能**：使用这个命令来显示VPNv4 NLRI 的指定信息。

**语法**：

```
show ip bgp vpnv4 all TYPE
```

| 参数 | 说明 |
| --- | --- |
| all | 显示所有跟VPNv4 NLRIs 有关的信息 |
| TYPE | (A.B.C.D\|neighbors\|summ ary\|) |
| neighbors | 显示BGP 邻居路由信息 |
| summary | 显示BGP 邻居路由的摘要信息 |
| A.B.C.D | 指定在BGP 路由表中显示的信息格式为A.B.C.D 的IPv4 地址 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
这是一个使用show ip bgp vpnv4 all 来显示的一个例子:
Switch# show ip bgp vpnv4 all
```

**相关命令**：N/A

### 6.7.93 `show ip bgp vpnv4 rd`

**功能**：使用这个命令来显示VPNv4 NLRI 的指定信息。

**语法**：

```
show ip bgp vpnv4 rd WORD TYPE
```

| 参数 | 说明 |
| --- | --- |
| rd | 显示路由的标识信息 |
| WORD | VPN 路由标识不超过15 个字符的字符串 |
| TYPE | (A.B.C.D\|neighbors\|summ ary\|) |
| neighbors | 显示BGP 邻居路由信息 |
| summary | 显示BGP 邻居路由的摘要信息 |
| A.B.C.D | 指定在BGP 路由表中显示的信息格式为A.B.C.D 的IPv4 地址 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
这是一个使用show ip bgp vpnv4 rd 来显示VPNv4 指定信息的例子:
Switch# show ip bgp vpnv4 rd 123
```

**相关命令**：N/A

### 6.7.94 `show ip bgp vpnv4 vrf`

**功能**：使用这个命令来显示VPNv4 NLRI 指定信息

**语法**：

```
show ip bgp vpnv4 vrf WORD TYPE
```

| 参数 | 说明 |
| --- | --- |
| vrf | VPN 路由/转发 实例 |
| WORD | VPN 路由/转发实例名不超过31 个字符的字符串 |
| TYPE | (A.B.C.D\|neighbors\|summ ary\|) |
| neighbors | 显示BGP 邻居路由信息 |
| summary | 显示BGP 邻居路由的摘要信息 |
| A.B.C.D | 指定在BGP 路由表中显示的信息格式为A.B.C.D 的IPv4 地址 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
这是一个使用show ip bgp vpnv4 rd 命令来显示VPNv4 指定信息的例子:
Switch# show ip bgp vpnv4 vrf 123
```

**相关命令**：N/A

### 6.7.95 `timers`

**功能**：使用这个命令并且设定BGP keepalive 定时器和holdtime 定时器的值。
  使用相应的no 命令来删除这个配置并返回默认值。

**语法**：

```
timers bgp KEEPALIVE HOLDTIME
no timers bgp
```

| 参数 | 说明 |
| --- | --- |
| KEEPALIVE | keepalive 信息被送往邻居的频率。默认60s 0-65535 |
| HOLDTIME | 保活时间，在这个时间段内如果没有接收到keepalive 信息的话，认为邻居死亡。 默认180s 3-65535 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

这个命令在全局使用，用于设定/解除设定所有邻居的keepalive 和holdtime 值。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# timers bgp 40 120
```

**相关命令**：N/A

### 6.7.96 `neighbor bfd interval`

**功能**：使用该命令配置与邻居建立的bfd session 的收发包间隔时间。
  使用该命令的“no”格式删除这条配置。

**语法**：

```
neighbor ( A.B.C.D | X:X::X:X | WORD ) bfd interval { mintx TX_VAL | minrx RX_VAL |
multiplier MULTI_VAL }
no neighbor ( A.B.C.D | X:X::X:X | WORD ) bfd interval { mintx TX_VAL | minrx RX_VAL |
multiplier MULTI_VAL }
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D\|X:X::X:X\|WORD | 以IPv4/IPv6 地址格式或者 peer group 格式来指定 BGP 邻居的地址。 格式为A.B.C.D/X:X::X:X 的IPv4/IPv6 地址或者peer |
| group |  |
| TX_VAL | bfd session 支持最小的发包时间 3-1000 毫秒 |
| RX_VAL | bfd session 支持最小的收包时间 3-1000 毫秒 |
| MULTI_VAL | 检测倍数 2-15 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

为bgp 与邻居建立的bfd 会话修改收发包时间

**示例**：

```
为与ip 地址为1.1.1.1 的邻居建立的bfd 会话修改收发包时间:
Switch# configure terminal
Switch(config)# router bgp 100
Switch(config-router)# neighbor 1.1.1.1 bfd interval mintx 30 minrx 30 multiplier 5
```

**相关命令**：无

### 6.7.97 `max-paths`

**功能**：使用这个命令来改变最大等价路由条数。
  使用相应的no 来返回默认设置。

**语法**：

```
max-paths ( ebgp | ibgp ) PATHS
no max-paths ( ebgp | ibgp ) ( PATHS | )
```

| 参数 | 说明 |
| --- | --- |
| ebgp | 会话ebgp ecmp |
| ibgp | 会话ibgp ecmp |
| PATHS | BGP 最大的ecmp 条数 2-64 |

**命令模式**：路由模式

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置最大等价路由条数。:
Switch# configure terminal
Switch(config)# router bgp 100
Switch(config-router)# max-paths ebgp 2
```

**相关命令**：N/A

### 6.7.98 `neighbor peer-group listen`

**功能**：使用这个命令来创建一个对等组用来实现动态侦听网段功能。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor WORD peer-group listen ( external | internal | )
no neighbor TAG peer-group listen ( external | internal | )
```

| 参数 | 说明 |
| --- | --- |
| WORD | 对等体组名 |
| external | 指定这个用来做侦听网段的 peer group 的类型为外部邻居 |
| internal | 指定这个用来做侦听网段的 peer group 的类型为内部邻居 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

可以把具有相同更新策略的邻居放在一个对等体组里。对等组可以用任何neighbor 命
  令来简单的进行配置。任何对对等组的修改会对所有的成员产生影响。使用这个命令
  可以为动态网段侦听创建一个对等体组。创建时需要指定类型，默认是内部的。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor group1 peer-group listen external
```

**相关命令**：N/A

### 6.7.99 `neighbor listen-net`

**功能**：使用这个命对指定peer group 来创建一个侦听网段来实现动态侦听网段功能。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor WORD listen-net ( A.B.C.D/M | X:X::X:X/M )
no neighbor WORD listen-net ( A.B.C.D/M | X:X::X:X/M )
```

| 参数 | 说明 |
| --- | --- |
| WORD | 对等体组名 |
| A.B.C.D/M | 给这个peer group 指定 ipv4 的侦听网段 |
| X:X::X:X/M | 给这个peer group 指定 ipv6 的侦听网段 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

只有在侦听网段内的BGP 邻居才会被建立

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor group1 listen-net 12.1.1.0/24
```

**相关命令**：N/A

### 6.7.100 `neighbor listen-as`

**功能**：使用这个命对指定peer group 来创建一个侦听as 来实现动态侦听网段功能。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor WORD listen-as [ <1-4294967295> ]
no neighbor WORD listen-as [ <1-4294967295> ]
```

| 参数 | 说明 |
| --- | --- |
| WORD | 对等体组名 <1-4294967295> 给这个peer group 指定侦听的as 号 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

对于外部类型的侦听网段的peer group 来说，只有在listen-as 列表中的外部as 才能
  建立邻居

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor group1 listen-as 2
```

**相关命令**：N/A

### 6.7.101 `neighbor listen-as-segment`

**功能**：使用这个命对指定peer group 来创建一个侦听as segment 来实现动态侦听网段功能。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor WORD listen-as-segment <1-4294967295> <1-4294967295>
no neighbor WORD listen-as-segment <1-4294967295> <1-4294967295>
```

| 参数 | 说明 |
| --- | --- |
| WORD | 对等体组名 <1-4294967295> 给这个peer group 指定侦听的as 段的起始as 号 <1-4294967295> 给这个peer group 指定侦听的as 段的结束as 号 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：N/A

**使用说明**：

对于外部类型的侦听网段的peer group 来说，只有在listen-as-segment 范围中的外部
  as 才能建立邻居

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor group1 listen-as-segment 2 10
```

**相关命令**：N/A

### 6.7.102 `show ip bgp vpnv4 vrf peer-group`

**功能**：使用这个命令来显示vrf 下的 peer group 指定信息

**语法**：

```
show ip bgp vpnv4 vrf NAME peer-group ( WORD ( summary | ) | )
```

| 参数 | 说明 |
| --- | --- |
| vrf | VPN 路由/转发 实例 |
| NAME | VPN 路由/转发实例名不超过31 个字符的字符串 |
| WORD | 指定的peer-gorup 的名称不超过20 个字符的字符串 |
| summary | 指定peer group 中的邻居的摘要信息 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
这是一个使用show ip bgp vpnv4 vrf peer-group 命令来显示指定vrf 下的peer-group
信息的例子:
Switch# show ip bgp vpnv4 vrf vpn1 peer-group
```

**相关命令**：N/A、、6.8 ISIS 命令


## 6.8 ISIS 命令

### 6.8.1 `accept-lifetime`

**功能**：使用此命令指定一段时间里收到认证密匙是有效的。
  使用相应的no 命令来删除配置。

**语法**：

```
accept-lifetime HH:MM:SS DAY MONTH YEAR HH1:MM1:SS1 DAY1 MONTH1 YEAR1
accept-lifetime HH:MM:SS MONTH DAY YEAR infinite
accept-lifetime HH:MM:SS MONTH DAY YEAR duration <1-2147483646>
no accept-lifetime
```

| 参数 | 说明 |
| --- | --- |
| HH:MM:SS | 指定开始时间，时：分：秒 0-23:0-59:0-59 |
| DAY | 指定开始时间，日 1-31 |
| MONTH | 指定开始时间，月，如 |
| december |  |
| january, february, march, |  |
| april, may, june, july, |  |
| august, september, |  |
| october, november, |  |
| december |  |
| YEAR | 指定开始时间，年 1993-2035 |
| HH1:MM1:SS1 | 指定结束时间，时：分：秒 0-23:0-59:0-59 |
| DAY1 | 指定结束时间，日 1-31 |
| MONTH1 | 指定结束时间，月，如Jan january, february, march, |
| april, may, june, july, |  |
| august, september, |  |
| october, november, |  |
| december |  |
| YEAR1 | 指定结束时间，年 1993-2035 <1-2147483646> 持续的时间，单位：s 1-2147483646 |

**命令模式**：Key Chain 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何指定一段密钥有效的时间:
Switch# configure terminal
Switch(config)# key chain mychain
Switch(config-keychain)# key 1
Switch(config-keychain-key)# accept-lifetime 03:03:01 Dec 3 2004 04:04:02 Oct 6
```

**相关命令**：无

### 6.8.2 `address-family ipv6`

**功能**：使用此命令进入地址族模式(ipv6)。
  使用相应的no 命令来删除地址族模式(ipv6)下的配置。

**语法**：

```
address-family ipv6 ( unicast | )
no address-family ipv6 ( unicast | )
```

| 参数 | 说明 |
| --- | --- |
| unicast | 指定单播 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何进入isis 的ipv6 地址簇配置模式:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# address-family ipv6 unicast
Switch(config-router-af)#
```

**相关命令**：无

### 6.8.3 `adjacency-check`

**功能**：使用此命令来配置邻居检查IP 地址是否在同一网段，如果不在同一网段则无法建立起
  ISIS 邻居关系。
  使用相应的no 命令来关闭邻居检查。

**语法**：

```
adjacency-check
no adjacency-check
```

**命令模式**：路由模式 地址族配置模式

**默认配置**：使能

**使用说明**：

无

**示例**：

```
下面的例子显示了如何开启ISIS 邻居检查:

Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router-af)# adjacency-check
```

**相关命令**：无

### 6.8.4 `area-password`

**功能**：使用此命令来配置Level-1 区域的认证密码，在Level-1 区域接收或发送报文LSP 和
  SNP 时需要认证，在同一个区域的的密码必须保持一致。
  使用相应的no 命令来删除区域密码。

**语法**：

```
area-password PASSWORD
area-password WORD authenticate snp ( send-only | validate )
no area-password
```

| 参数 | 说明 |
| --- | --- |
| PASSWORD | 指定密码不超过254 字符的字符串 |
| authenticate | 指定针对Level-1 SNP 报文也进行认证 |
| snp | 时序报文SNP |
| send-only | 指定只将密码封装到Level- 1 SNP 报文中，但不会检查接收到的Level-1 SNP 报文中的密码。 |
| validate | 指定将密码封装到Level-1 SNP 报文中，并检查接收到的SNP 报文中的密码。 |

**命令模式**：路由模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置区域认证密码:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# area-password code1234

Switch(config-router)# no area-password
```

**相关命令**：无

### 6.8.5 `authentication key-chain`

**功能**：使用此命令为指定的实例级别设置用于认证的密匙。认证模式必须配置为md5.
  一个接口仅能应用一个认证密匙，也就是，配置的第二条authentication key-chain 命
  令将覆盖第一条authentication key-chain 命令。
  使用相应的no 命令来删除用于认证的密匙。

**语法**：

```
authentication key-chain WORD ( level-1 | level-2 | )
no authentication key-chain PASSWORD ( level-1 | level-2 | )
no authentication key-chain ( level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| WORD | 指定链名(有效认证密匙) Key chain 名字符串 |
| level-1 | 指定认证密匙应用于level- |
| level-2 | 指定认证密匙应用于level- |

**命令模式**：路由模式

**默认配置**：禁用

**使用说明**：

未指定level 时，对两个level 都有效。

**示例**：

```
下面的例子显示了如何在level-1 上配置认证密钥:
Switch# configure terminal
Switch(config)# router isis 1
Switch(config-router)# authentication key-chain code1234 level-1
```

**相关命令**：无

### 6.8.6 `authentication mode md5`

**功能**：使用此命令设置实例级别的认证方式。如果使用area-password 或domain-password
  配置明文认证方式，authentication mode 命令将覆盖这些命令。如果先配置了
  authentication mode 命令，随后试图使用的area-password 或domain-password 命令
  将会失败。想使用area-password 或domain-password 配置明文认证方式需要先使用
  no authentication mode 命令。认证方式和应用的级别也可以指定为单一的接口，而不
  必是每个实例，使用isis authentication mode 命令。
  使用相应的no 命令来删除认证模式。

**语法**：

```
authentication mode ( md5 | text ) ( level-1 | level-2 | )
no authentication mode ( md5 | text ) ( level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| md5 | 密文。MD5 消息摘要算法第五版 |
| text | 明文 |
| level-1 | 指定认证密匙应用于level- |
| level-2 | 指定认证密匙应用于level- |

**命令模式**：路由模式

**默认配置**：禁用

**使用说明**：

未指定level 时，对两个level 都有效。

**示例**：

```
下面的例子显示了如何在level-1 上配置认证模式为md5:
Switch# configure terminal
Switch(config)# router isis 1
Switch(config-router)# authentication mode md5 level-1
Switch(config-router)# no authentication mode md5 level-1
```

**相关命令**：无

### 6.8.7 `authentication send-only`

**功能**：使用此命令来配置认证仅发送选项。
  使用no authentication send-only 命令关闭仅发送选项。

**语法**：

```
authentication send-only ( level-1 | level-2 | )
no authentication send-only ( level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| level-1 | 指定认证密匙应用于level- |
| level-2 | 指定认证密匙应用于level- |

**命令模式**：路由模式

**默认配置**：禁用

**使用说明**：

未指定level 时，对两个level 都有效。

**示例**：

```
下面的例子显示了如何在level-1 上配置认证仅发送模式:
Switch# configure terminal
Switch(config)# router isis 1
Switch(config-router)# authentication send-only level-1
Switch(config-router)# no authentication send-only level-1
```

**相关命令**：无

### 6.8.8 `bfd all-interfaces`

**功能**：使用此命令在所有使能了ISIS 的接口上开启BFD 检测。
  在指定的接口上使用isis bfd disable 命令关闭指定接口的BFD 检查。
  使用相应的no 命令来关闭BFD 功能。

**语法**：

```
bfd all-interfaces
no bfd all-interfaces
```

**命令模式**：路由模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何在所有使能ISIS 的接口上使能BFD:
Switch# configure terminal
Switch(config)# router isis
Switch(config-router)# bfd all-interfaces
```

**相关命令**：无

### 6.8.9 `clear clns neighbors`

**功能**：使用此命令清除CLNS 邻接信息

**语法**：

```
clear clns neighbors
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何清除CLNS 邻接信息:
Switch# clear clns neighbors
```

**相关命令**：无

### 6.8.10 `clear clns is-neighbors`

**功能**：使用此命令清除IS CLNS 邻接信息

**语法**：

```
clear clns is-neighbors System-ID
```

| 参数 | 说明 |
| --- | --- |
| System-ID | 邻居系统ID ，格式为 |
| XXXX.XXXX.XXXX | X 为十六进制数字 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何清除IS CLNS 邻接信息:
Switch# clear clns is-neighbors 1234.789A.BCDF
```

**相关命令**：无

### 6.8.11 `clear ip isis route`

**功能**：使用此命令清除IS-IS IPv4 路由

**语法**：

```
clear ip isis ( INSTANCE | ) route ( redistribution | all )
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE | 路由区域名不超过20 字符的字符串 |
| redistribution | 清除ISIS 本地重分配路由 |
| all | 清除所有的ISIS 路由表 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何清除ISIS ipv4 路由:
Switch# clear ip isis route all
```

**相关命令**：无

### 6.8.12 `clear isis counter`

**功能**：使用此命令清除ISIS 计数。

**语法**：

```
clear isis counter
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何清除ISIS 计数:

Switch# clear isis counter
```

**相关命令**：无

### 6.8.13 `clear isis interface counter`

**功能**：清除指定接口的ISIS 计数。

**语法**：

```
clear isis interface counter ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名支持 |
| physical/aggregation/loopb | ack/vlan/tunnel 端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

未指定接口时，清除所有接口的计数

**示例**：

```
下面的例子显示了如何清除ISIS 接口计数信息:
Switch# clear isis interface counter
```

**相关命令**：无

### 6.8.14 `clear isis process`

**功能**：使用此命令 重启IS-IS 进程。

**语法**：

```
clear isis ( INSTANCE | ) process
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE | 路由区域名不超过20 字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

未指定路由区域时，重启所有区域的IS-IS 进程。

**示例**：

```
下面的例子显示了如何重启isis 进程:
Switch# clear isis process
```

**相关命令**：无

### 6.8.15 `debug isis`

**功能**：使用此命令来使能ISIS 的调试功能。
  使用相应的no 命令来删除配置。

**语法**：

```
debug isis ( all | )

debug isis ( authentication | bfd | checksum | events | hello ( interface IFNAME | System-
ID | ) | ifsm | local-updates | lsp | nfsm | nsm | pdu | protocol-errors | spf )
no debug isis ( all | )
no debug all
no debug all isis
undebug all
undebug isis ( all | )
undebug all isis
no debug isis ( authentication | bfd | checksum | events | hello ( interface IFNAME |
System-ID | ) | ifsm | local-updates | lsp | nfsm | nsm | pdu | protocol-errors | spf )
undebug isis ( authentication | bfd | checksum | events | hello ( interface IFNAME |
System-ID | ) | ifsm | local-updates | lsp | nfsm | nsm | pdu | protocol-errors | spf )
```

| 参数 | 说明 |
| --- | --- |
| all | 使能所有调试模式 |
| authentication | 认证 |
| checksum | 校验和 |
| bfd | 双向转发检测机制 |
| events | 内部事件 |
| hello | hello 处理 |
| interface | 指定接口 |
| IFNAME | 接口名支持 |
| physical/aggregation/loopb | ack/vlan/tunnel 端口 |
| System-ID | 系统标识符 |
| ifsm | 接口有限状态机 |
| local-updates | 本地升级 |
| lsp | 标签交换通道 |
| nfsm | 邻居有限状态机 |
| nsm | 网络安全模块信息 |
| pdu | 协议数据单元 |
| protocol-errors | 协议错误 |
| spf | 最短路径优先路由计算 |

**命令模式**：特权模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何开启ISIS 所有的debug 功能:
Switch# debug isis all
```

**相关命令**：无

### 6.8.16 `default-information originate`

**功能**：使用此命令配置生成默认路由。
  使用相应的no 命令来删除配置。

**语法**：

```
default-information originate
no default-information originate
```

| 参数 | 说明 |
| --- | --- |
| originate | 指定分配默认路由 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何在ipv4 和ipv6 下配置生成默认路由:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# default-information originate
Switch(config-router)# address-family ipv6
Switch(config-router-af)# default-information originate
```

**相关命令**：无

### 6.8.17 `distance`

**功能**：使用此命令为所有IPv4 路由配置管理距离。
  使用相应的no 命令来删除配置。

**语法**：

```
distance DISTANCE ( System-ID ( ACL | ) | )
no distance ( ( System-ID | System-ID ACL ) | )
```

| 参数 | 说明 |
| --- | --- |
| DISTANCE | distance 取值 1-255 |
| System-ID | 系统ID，格式为 |
| XXXX.XXXX.XXXX | X 为十六进制数字 |
| ACL | Access-list 名称不超过40 字符的字符串 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何为所有的isis ipv4 路由指定distance:
Switch# configure terminal
Switch(config)# router isis
Switch(config-router)# distance 40
```

**相关命令**：无

### 6.8.18 `domain-password`

**功能**：使用此命令为level-2 域配置认证密码并将认证信息添加到报文中。在Level-2 区域接
  收或发送报文LSP 和SNP 时需要认证，在level-2 域中密码必须一致。

**语法**：

```
domain-password PASSWORD
domain-password PASSWORD authenticate snp ( send-only | validate )
no domain-password
```

| 参数 | 说明 |
| --- | --- |
| PASSWORD | 密码不超过254 字符的字符串 |
| authenticate | 指定将密码封装到Level-2 SNP 报文中 |
| snp | 时序报文SNP |
| send-only | 指定只将密码封装到Level- 2 SNP 报文中，但不会检查接收到的Level-2 SNP 报文中的密码。可以在软件升级时使用以缓慢多渡。 |
| validate | 指定将密码封装到Level-2 - SNP 报文中，并检查接收到的SNP 报文中的密码。 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何为level-2 区域指定认证密码:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# domain-password mypasswd

Switch(config-router)# no domain-password
```

**相关命令**：无

### 6.8.19 `ignore-lsp-errors`

**功能**：使用此命令忽略LSP 校验和错误。
  使用相应的no 命令开启LSP 校验和检查。

**语法**：

```
ignore-lsp-errors
no ignore-lsp-errors
```

**命令模式**：路由模式

**默认配置**：检查LSP 校验和

**使用说明**：

无

**示例**：

```
下面的例子显示了如何忽略LSP 报文校验和错误:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# ignore-lsp-errors
```

**相关命令**：无

### 6.8.20 `ip route high-priority tag`

**功能**：使用此命令设置高优先级。
  使用相应的no 命令删除配置。

**语法**：

```
ip route high-priority tag TAG
no ip route high-priority tag
```

| 参数 | 说明 |
| --- | --- |
| TAG | 优先级值 1-4294967295 |

**命令模式**：路由模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何设置路由高优先级的tag 值:
Switch# configure terminal
Switch(config)# router isis A
Switch(config-router)# ip route high-priority tag 500
```

**相关命令**：无

### 6.8.21 `ip router isis`

**功能**：使用此命令在接口上使能IPv4 路由ISIS。
  使用相应的no 命令在接口上去使能。

**语法**：

```
ip router isis ( INSTANCE | )
no ip router isis ( INSTANCE | )
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE | 实例名不超过20 字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何在接口上使能ipv4 isis:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ip router isis bb
```

**相关命令**：无

### 6.8.22 `ipv6 router isis`

**功能**：使用此命令在接口上使能IPv6 路由ISIS。
  使用相应的no 命令在接口上去使能。

**语法**：

```
ipv6 router isis ( INSTANCE | )
no ipv6 router isis ( INSTANCE | )
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE | 实例名不超过20 字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何在接口上使能ipv6 isis:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 router isis bb
```

**相关命令**：无

### 6.8.23 `isis authentication key-chain`

**功能**：使用此命令在接口上配置用于认证的密匙。认证模式必须配置为md5 或text 才能配置
  认证密匙。一个接口仅能应用一个认证密匙。也就是，配置的第二个密匙将覆盖第一
  个。使用相应的no 命令在接口上删除配置。

**语法**：

```
isis authentication key-chain KEY_NAME ( level-1 | level-2 | )
no isis authentication key-chain ( level-1 | level-2 | )
no isis authentication key-chain KEY_NAME ( level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| KEY_NAME | 密钥名 Key chain 名字符串 |
| level-1 | 指定认证密匙应用于level- |
| level-2 | 指定认证密匙应用于level- |

**命令模式**：端口配置模式

**默认配置**：禁用。

**使用说明**：

使用该命令时，如果没有指定level-1 或者level-2，密匙将应用于认证模式为md5 的
  level(s)。

**示例**：

```
下面的例子显示了如何在ISIS 接口上配置要在报文中使用的密钥:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis authentication key-chain code1234 level-1
```

**相关命令**：无

### 6.8.24 `isis authentication mode md5`

**功能**：使用此命令在接口上配置MD5 认证模式。此命令将覆盖isis password 命令。如果已经
  配置isis authentication mode，再使用isis password 命令会失败。需要先使用no isis
  authentication mode 命令，才能使用isis password 命令配置明文认证模式。使用相应
  的no 命令在接口上删除配置。

**语法**：

```
isis authentication mode ( md5 | text ) ( level-1 | level-2 | )
no isis authentication mode ( md5 | text ) ( level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| md5 | 密文。MD5 消息摘要算法第五版 |
| text | 明文 |
| level-1 | 指定认证密匙应用于level- |
| level-2 | 指定认证密匙应用于level- |

**命令模式**：端口配置模式

**默认配置**：禁用

**使用说明**：

未指定level 时，对两个level 都有效。

**示例**：

```
下面的例子显示了如何在接口上使能md5 认证:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis authentication mode md5
```

**相关命令**：无

### 6.8.25 `isis authentication send-only`

**功能**：使用此命令在接口上配置认证仅发送选项。
  使用相应的no 命令在接口上删除配置。

**语法**：

```
isis authentication send-only ( level-1 | level-2 | )
no isis authentication send-only ( level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| level-1 | 指定认证密匙应用于level- |
| level-2 | 指定认证密匙应用于level- |

**命令模式**：端口配置模式

**默认配置**：禁用。

**使用说明**：

未指定level 时，对两个level 都有效。

**示例**：

```
下面的例子显示了如何在接口上配置认证仅发送选项:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis authentication send-only
```

**相关命令**：无

### 6.8.26 `isis bfd`

**功能**：使用此命令在接口上使能/禁用BFD 检查。
  使用相应的no 命令在接口上删除配置。

**语法**：

```
isis bfd ( disable | )
no isis bfd ( disable | )
```

| 参数 | 说明 |
| --- | --- |
| disable | 禁用BFD |

**命令模式**：端口配置模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何在接口上去使能bfd:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis bfd disable
```

**相关命令**：无

### 6.8.27 `isis circuit-type`

**功能**：使用此命令配置接口链路类型。
  
  如果指定了level-1 或level-2-only，设备仅发送指定level 的数据。使用相应的no 命
  令恢复默认的接口链路类型。

**语法**：

```
isis circuit-type ( level-1 | level-1-2 | level-2-only )
no isis circuit-type
```

| 参数 | 说明 |
| --- | --- |
| level-1 | 指定接口链路类型为level- 1，即本接口只能建立 level-1 的邻接关系 |
| level-1-2 | 指定接口链路类型为level- 1-2，即在本接口可同时创建level-1 和level-2 邻接关系 |
| level-2-only | 指定接口链路类型为level- 2，即本接口只能建立 level-2 的邻接关系 |

**命令模式**：端口配置模式

**默认配置**：默认接口链路类型为level-1-2，可同时建立level-1 和level-2 邻接关系

**使用说明**：

无

**示例**：

```
下面的例子显示了如何在接口上指定level 类型:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis circuit-type level-2-only
```

**相关命令**：无

### 6.8.28 `isis csnp-interval`

**功能**：使用此命令配置发送全时序协议数据单元(CSNP)的时间间隔(s)。
  默认为10s。这个配置仅对广播网接口有效，因为CSNP 是在广播网接口上发出的，在
  P2P 接口上只在邻接关系创建时发送。
  使用相应的no 命令恢复默认的时间间隔。

**语法**：

```
isis csnp-interval INTERVAL ( level-1 | level-2 | )
no isis csnp-interval ( level-1 | level-2 | )
no isis csnp-interval <1-65535> ( level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 指定时间间隔，单位s，默认10s 1-65535 |
| level-1 | 指定应用于level-1 |
| level-2 | 指定应用于level-2 |

**命令模式**：端口配置模式

**默认配置**：10s。对level-1 和level-2 都有效。

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置CSNP 报文的发送间隔:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis csnp-interval 20
```

**相关命令**：无

### 6.8.29 `isis hello`

**功能**：使用此命令在接口上配置发送Hello 报文时将报文填充到系统支持的接口MTU 大小。
  使用相应的no 命令禁止针对Hello 报文进行填充

**语法**：

```
isis hello padding
no isis hello padding
```

| 参数 | 说明 |
| --- | --- |
| padding | 指定发送Hello 报文 |

**命令模式**：端口配置模式

**默认配置**：启用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何在hello 报文里配置报文填充:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis hello padding
```

**相关命令**：无

### 6.8.30 `isis hello-interval`

**功能**：使用此命令配置Hello 报文发送时间间隔。hello-interval 设置与hello-multiplie 有关(见
  isis hello-multiplier 命令)。
  如果指定最小的邻居保持时间(1s)，Hello 报文发送间隔将除以hello-multiplie。例如：
  hello-multiplier 配置为4，发送间隔配置为最小，那么每250ms 发送一个Hello 报文。
  使用相应的no 命令恢复默认的发送时间间隔。

**语法**：

```
isis hello-interval INTERVAL ( level-1 | level-2 | )
isis hello-interval minimal ( level-1 | level-2 | )
no isis hello-interval ( level-1 | level-2 | )
no isis hello-interval <1-65535> ( level-1 | level-2 | )
no isis hello-interval minimal ( level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 发送Hello 报文的时间间隔，单位：s 1-65535 |
| minimal | 指定保持时间为1s |
| level-1 | 指定level-1 级别发送Hello 报文间隔 |
| level-2 | 指定level-2 级别发送Hello 报文间隔 |

**命令模式**：端口配置模式

**默认配置**：间隔10s，应用于level-1 和level-2。

**使用说明**：

未指定level 时，对两个level 都有效。

**示例**：

```
下面的例子显示了如何配置hello 报文的间隔时间:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis hello-interval 5 level-1
```

**相关命令**：isis hello-multiplier

### 6.8.31 `isis hello-multiplier`

**功能**：使用此命令配置Hello 报文发送时间间隔的倍数。邻居保持时间为Hello 报文发送时间
  间隔乘以倍数。
  使用相应的no 命令恢复默认的倍数。

**语法**：

```
isis hello-MULTIPLIER <2-100> ( level-1 | level-2 | )
no isis hello-multiplier ( level-1 | level-2 | )
no isis hello-multiplier <2-100> ( level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| MULTIPLIER | 指定一个Hello 报文发送间隔的倍数 2-100 |
| level-1 | 指定level-1 级别的Hello 报文 |
| level-2 | 指定level-2 级别的Hello 报文 |

**命令模式**：端口配置模式

**默认配置**：默认倍数为3。

**使用说明**：

未指定level 时，对两个level 都有效。

**示例**：

```
下面的例子显示了如何配置Hello 报文发送时间间隔的倍数:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis hello-multiplier 4
```

**相关命令**：无

### 6.8.32 `isis lsp-interval`

**功能**：使用此命令配置链路状态包(LSP)的发送时间间隔。
  配置此命令改变两个连续的LSP 报文的时延。当flooding 或其他时间触发发送LSP，
  LSP 被放在接口的队列里，并按这个时间间隔计划发送。两个连续LSP 计划发送的最
  短间隔为这个间隔时间。
  使用相应的no 命令恢复默认的LSP 发送间隔。

**语法**：

```
isis lsp-interval INTERVAL
no isis lsp-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 指定LSP 发送间隔，单位：ms 1-4294967295 |

**命令模式**：端口配置模式

**默认配置**：33ms

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置链路状态包(LSP)的发送时间间隔:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis lsp-interval 100
```

**相关命令**：无

### 6.8.33 `isis mesh-group`

**功能**：使用此命令将接口加入指定的mesh-group。
  使用相应的no 命令将接口退出指定的mesh-group。

**语法**：

```
isis mesh-group MESH_GROUP
isis mesh-group blocked
no isis mesh-group
```

| 参数 | 说明 |
| --- | --- |
| MESH_GROUP | mesh-group 号 1-4294967295 |
| blocked | 指定接口将被阻塞，不再向其它接口扩散收到的LSP |

**命令模式**：端口配置模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何将接口加入指定的mesh-group:

Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis mesh-group 20
```

**相关命令**：无

### 6.8.34 `isis metric`

**功能**：使用此命令配置接口度量值。这个值用于SPF 计算。
  使用相应的no 命令恢复默认的度量值。

**语法**：

```
isis metric METRIC ( level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| METRIC | 指定度量值 1-16777214 |
| level-1 | 指定度量值应用于level-1 |
| level-2 | 指定度量值应用于level-2 |

**命令模式**：端口配置模式

**默认配置**：默认为10，对level-1 和level-2 都有效。

**使用说明**：

未指定level 时，对两个level 都有效。

**示例**：

```
下面的例子显示了如何配置接口度量值:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis metric 20
```

**相关命令**：无

### 6.8.35 `isis network`

**功能**：使用此命令将广播网接口类型改为P2P 接口类型。
  使用相应的no 命令恢复默认的接口类型。

**语法**：

```
isis network point-to-point
no isis network ( point-to-point | )
```

| 参数 | 说明 |
| --- | --- |
| point-to-point | 指定P2P 接口类型 |

**命令模式**：端口配置模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何将广播网接口类型改为P2P 接口类型:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis network point-to-point
```

**相关命令**：无

### 6.8.36 `isis password`

**功能**：使用此命令在接口上配置Hello 报文的认证密码。
  使用相应的no 命令删除密码。

**语法**：

```
isis password PASSWORD ( level-1 | level-2 | )
no isis password ( level-1 | level-2 | )
no isis password PASSWORD ( level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| PASSWORD | 密码不超过254 字符的字符串 |
| level-1 | 指定level-1 Hello 报文的密码 |
| level-2 | 指定level-2 Hello 报文的密码 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

未指定level 时，对两个level 都有效。

**示例**：

```
下面的例子显示了如何在接口上配置Hello 报文的认证密码:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis password mypassWORD level-1
```

**相关命令**：无

### 6.8.37 `isis prefix-sid`

**功能**：使用此命令来配置isis 前缀sid。

**语法**：

```
isis prefix-sid index INDEX ( n-flag-clear | ) ( explicit-null | )
no isis prefix-sid
```

| 参数 | 说明 |
| --- | --- |
| INDEX | 指定一个前缀SID 0-1048575 |
| n-flag-clear | 将前缀SID 中的Node-SID 标志位清除 |
| explicit-null | 将前缀SID 中的Explicit- Null 标志位置位，表示上游邻居用显示空标签代替前缀 |
| SID |  |

**命令模式**：端口配置模式

**默认配置**：默认没有配置前缀SID

**使用说明**：

索引值不能超过SRGB 的范围。

**示例**：

```
下面的例子显示了如何在接口上配置前缀SID:
Switch# configure terminal
Switch(config)# interface loopback 0
Switch(config-if)# isis prefix-sid index 10
```

**相关命令**：无

### 6.8.38 `isis priority`

**功能**：使用此命令配置用于选取LAN DIS 的优先级。优先级越高，越可能被选取。
  使用相应的no 命令恢复默认的优先级。

**语法**：

```
isis priority PRIORITY ( level-1 | level-2 | )
no isis priority ( level-1 | level-2 | )
no isis priority <0-127> ( level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| PRIORITY | 优先级 0-127 |
| level-1 | 指定level-1 Hello 报文的优先级 |
| level-2 | 指定level-2 Hello 报文的优先级 |

**命令模式**：端口配置模式

**默认配置**：默认优先级为64

**使用说明**：

未指定level 时，对两个level 都有效。

**示例**：

```
下面的例子显示了如何配置用于选取LAN DIS 的优先级值:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis priority 127
```

**相关命令**：无

### 6.8.39 `isis retransmit-interval`

**功能**：使用此命令配置LSP 重传间隔时间。
  使用相应的no 命令恢复默认的重传间隔时间。

**语法**：

```
isis retransmit-interval INTERVAL
no isis retransmit-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 指定发送LSP 的重传间隔时间，单位：s 0-65535 |

**命令模式**：端口配置模式

**默认配置**：默认：5s

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置LSP 重传间隔时间:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis retransmit-interval 10
Switch(config-if)# no isis retransmit-interval
```

**相关命令**：无

### 6.8.40 `isis tag`

**功能**：使用此命令配置接口的管理标记值。

**语法**：

```
isis tag TAG ( level-1 | level-2 | )
no isis tag
```

| 参数 | 说明 |
| --- | --- |
| TAG | 管理标记值 1-4294967295 |
| level-1 | 指定管理标记值应用于 |
| level-1 |  |
| level-2 | 指定管理标记值应用于 |
| level-2 |  |

**命令模式**：端口配置模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置接口的管理标记值:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# isis tag 500 level-1
```

**相关命令**：无

### 6.8.41 `ispf`

**功能**：使用此命令用于使能增量最短路径优先算法。
  使用相应的no 命令删除配置。

**语法**：

```
ispf
ispf ( level-1 | level-1-2 | level-2-only )
no ispf
```

| 参数 | 说明 |
| --- | --- |
| level-1 | 应用于level-1 IS |
| level-1-2 | 应用于level-1 和level-2 IS - |
| level-2-only | 应用于level-2 IS |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何使能增量spf 算法:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# ispf level-1
```

**相关命令**：无

### 6.8.42 `is-type`

**功能**：使用此命令配置IS 的路由级别。
  使用相应的no 命令恢复默认。

**语法**：

```
is-type ( level-1 | level-1-2 | level-2-only )
no is-type
```

| 参数 | 说明 |
| --- | --- |
| level-1 | level-1 的路由 |
| level-1-2 | level-1 和level-2 的路由 |
| level-2-only | level-2 的路由 |

**命令模式**：路由模式

**默认配置**：如果没有level-2 也没有level1-2 的实例，使用level-1-2。否则使用level-1

**使用说明**：

无

**示例**：

```
下面的例子显示了如何ISIS 实例的level:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# is-type level-1
```

**相关命令**：无

### 6.8.43 `lsp-gen-interval`

**功能**：使用此命令配置重复生成相同LSP 的最小间隔时间。
  使用相应的no 命令恢复默认间隔时间。

**语法**：

```
lsp-gen-interval INTERVAL

lsp-gen-interval ( level-1 | level-2 ) <1-120>
no lsp-gen-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | LSP 生成间隔，单位s 1-120 |
| level-1 | 指定间隔只应用于level-1 |
| level-2 | 指定间隔只应用于level-2 |

**命令模式**：路由模式

**默认配置**：30s。对level-1 和level-2 都有效。

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置重复生成相同LSP 的最小间隔时间:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# lsp-gen-interval 5
```

**相关命令**：无

### 6.8.44 `lsp-mtu`

**功能**：使用此命令配置LSP 的MTU。
  使用相应的no 命令恢复默认MTU。

**语法**：

```
lsp-mtu ( level-1 | level-2 | ) MTU
no lsp-mtu ( level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| MTU | MTU 值 512-1492 |
| level-1 | 应用于level-1 |
| level-2 | 应用于level-2 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

未指定level 时，对两个level 都有效。

**示例**：

```
下面的例子显示了如何配置LSP 的MTU:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# lsp-mtu 555
```

**相关命令**：无

### 6.8.45 `lsp-refresh-interval`

**功能**：使用此命令配置LSP 的刷新周期。lsp-refresh-interval 需小于 max-lsp-lifetime。
  使用相应的no 命令恢复默认的刷新周期。

**语法**：

```
lsp-refresh-interval INTERVAL
no lsp-refresh-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 指定LSP 的刷新周期，单位：s 1-65535 |

**命令模式**：路由模式

**默认配置**：默认：900s

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置LSP 的刷新周期:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# lsp-refresh-interval 600

Switch(config-router)# no lsp-refresh-interval
```

**相关命令**：无

### 6.8.46 `max-area-addresses`

**功能**：使用此命令可为ISIS 配置额外的区域地址。
  使用相应的no 命令恢复默认的最大区域地址数。

**语法**：

```
max-area-addresses NUMBER
no max-area-addresses
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | 指定支持的最大区域地址数 3-127 |

**命令模式**：路由模式

**默认配置**：最大区域地址数为3

**使用说明**：

None

**示例**：

```
下面的例子显示了如何配置最大额外的区域地址数量:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# max-area-address 4
```

**相关命令**：无

### 6.8.47 `max-lsp-lifetime`

**功能**：使用此命令配置当前IS-IS 进程生成LSP 的最大有效时间。max-lsp-lifetime 需大于
  lsp-refreshinterval
  使用相应的no 命令恢复默认的有效时间。

**语法**：

```
max-lsp-lifetime LIFETIME
no max-lsp-lifetime
```

| 参数 | 说明 |
| --- | --- |
| LIFETIME | 指定生成LSP 的最大有效时间，单位：s 350-65535 |

**命令模式**：路由模式

**默认配置**：默认：1200s

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置当前IS-IS 进程生成LSP 的最大有效时间:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# max-lsp-lifetime 1500
```

**相关命令**：无

### 6.8.48 `metric-style`

**功能**：使用此命令配置ISIS 开销类型。
  使用相应的no 命令恢复默认的开销类型。

**语法**：

```
metric-style ( narrow | wide | transition ) ( level-1 | level-1-2 | level-2 | )
metric-style ( narrow | wide ) transition ( level-1 | level-1-2 | level-2 | )
no metric-style ( narrow | wide | transition ) ( level-1 | level-1-2 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| narrow | 指定IS-IS 设备只能接收和发送开销类型为narrow 的路由。 |
| wide | 指定IS-IS 设备只能接收和发送开销类型为wide 的路由。 |
| transition | 指定IS-IS 设备可以接收和发送开销类型为narrow 和 wide 的路由。 |
| level-1 | 应用于level-1 |
| level-2 | 应用于level-2 |
| level-1-2 | 应用于level-1 和level-2 |

**命令模式**：路由模式

**默认配置**：开销类型为narrow。应用于level-1 和level-2。

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置ISIS 开销类型:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# metric-style wide
```

**相关命令**：无

### 6.8.49 `net`

**功能**：使用此命令配置IS-IS 进程的网络实体名称(NET)。
  NET 由三部分组成：
  区域ID,长度是可变化的（1~13 字节）
  系统ID，长度为固定值6 个字节
  最后一个字节（SEL），必须为00
  使用相应的no 命令删除配置。

**语法**：

```
net NET
no net NET
```

| 参数 | 说明 |
| --- | --- |
| NET | 指定一个NET，由1-13 位十六进制数组成格式 XX.XXXX. … .XXXX.XX |

**命令模式**：路由模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何为ISIS 实例配置网络实体名称(NET):
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# net 49.0000.0001.0002.0003.00
```

**相关命令**：无

### 6.8.50 `passive-interface`

**功能**：使用此命令配置禁止指定接口的路由更新，使接口进入被动模式。
  使用相应的no 命令将接口移出被动模式。

**语法**：

```
passive-interface ( IFNAME | )
no passive-interface ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名支持 |
| physical/aggregation/loopb | ack/vlan/tunnel 端口 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何禁止指定接口的路由更新:
Switch# configure terminal
Switch(config)# router isis 100
Switch(config-router)# passive-interface eth-0-1
```

**相关命令**：无

### 6.8.51 `prc-interval-exp`

**功能**：使用此命令配置部分路由计算的最大和最小延迟时间。
  使用相应的no 命令删除配置。

**语法**：

```
prc-interval-exp
prc-interval-exp EXP_MIN EXP_MAX
no prc-interval-exp
```

| 参数 | 说明 |
| --- | --- |
| EXP_MIN | 设置在接受到改变进行 PRC 计算的最小延迟，单位：ms 0-2147483647 |
| EXP_MAX | 设置在接受到改变进行 PRC 计算的最大延迟，单位：ms 0-2147483647 |

**命令模式**：路由模式

**默认配置**：最小延迟500ms，最大延迟50000ms

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置部分路由计算的最大和最小延迟时间:
Switch# configure terminal
Switch(config)# router isis
Switch(config-router)# prc-interval-exp 100 10000
```

**相关命令**：无

### 6.8.52 `redistribute`

**功能**：使用此命令配置将其他协议的路由重发布到ISIS 路由表。
  使用相应的no 命令关闭此功能。

**语法**：

```
redistribute ( connected | static | rip | ospf | bgp ) { metric METRIC | metrictype ( internal
| external ) | level-1 | level-2 | level-1-2 | route-map ROUTE_MAP }
no redistribute ( connected | static | rip | ospf | bgp )
```

| 参数 | 说明 |
| --- | --- |
| connected | 重发布connected 路由 |
| static | 重发布static 路由 |
| rip | 重发布rip 路由 |
| ospf | 重发布ospf 路由 |
| bgp | 重发布bgp 路由 |
| metric | 指定重发布路由的度量值 |
| METRIC | 指定ISIS 默认度量值 0-4261412864 |
| metric-type | 指定重发布路由的ISIS 外部的度量值类型 |
| internal | 设置ISIS 内部的度量值类型 |
| external | 设置ISIS 外部的度量值类型 |
| level-1 | ISIS level-1 路由 |
| level-2 | ISIS level-2 路由 |
| level-1-2 | ISIS level-1 和level-2 路由 - |
| route-map | 指定路由映射 |
| ROUTE_MAP | 指定路由映射的名字不超过20 字符的字符串 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何将其他协议的路由重发布到ISIS 路由表:
Switch# configure terminal
Switch(config)# router isis A
Switch(config-router)# redistribute bgp metric 12
```

**相关命令**：无

### 6.8.53 `redistribute isis`

**功能**：使用此命令配置将一个level 的可达信息重新分配到另一个level。
  使用相应的no 命令停止重新分配。

**语法**：

```
redistribute isis level-1 into level-2
redistribute isis level-2 into level-1
redistribute isis level-1 into level-2 distribute-list ACL
redistribute isis level-2 into level-1 distribute-list ACL
no redistribute isis level-1 into level-2
no redistribute isis level-2 into level-1
```

| 参数 | 说明 |
| --- | --- |
| level-1 | 指定内部区域level-1 路由 |
| level-2 | 指定内部区域level-2 路由 |
| into | 指定从一个level 到另一个 |
| level |  |
| distribute-list | 指定分发列表 |
| ACL | ACL 名称不超过40 字符的字符串 |

**命令模式**：路由模式 地址族配置模式

**默认配置**：重发布level-1 路由到level-2

**使用说明**：

无

**示例**：

```
下面的例子显示了如何重发布level-2 路由到level-1:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# redistribute isis level-2 into level-1
```

**相关命令**：无

### 6.8.54 `router isis`

**功能**：使用此命令使能ISIS(中间系统-中间系统)路由协议.
  本命令的no 格式用来关闭ISIS 路由实例。

**语法**：

```
router isis ( INSTANCE | )
no router isis ( INSTANCE | )
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE | 指定ISO 路由实例标记不超过20 字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置isis 实例名并创建实例:
Switch# configure terminal
Switch(config)# router isis New
```

**相关命令**：无

### 6.8.55 `segment-routing mpls`

**功能**：使用此命令来使能IS-IS SR。
  使用相应的no 命令来去使能IS-IS SR。

**语法**：

```
segment-routing mpls
no segment-routing mpls
```

**命令模式**：路由模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何使能IS-IS SR:
Switch# configure terminal
Switch(config)# router isis
Switch(config-router)# segment-routing mpls
```

**相关命令**：无

### 6.8.56 `segment-routing global-block`

**功能**：使用此命令来设置SRGB 范围。

**语法**：

```
segment-routing global-block MIN_VAL MAX_VAL
no segment-routing global-block
```

| 参数 | 说明 |
| --- | --- |
| MIN_VAL | 指定SRGB 的最小值 16000-23999 |
| MAX_VAL | 指定SRGB 的最大值 16000-23999 |

**命令模式**：路由模式

**默认配置**：默认使用16000 到23999 来作为SRGB 的范围。

**使用说明**：

无

**示例**：

```
下面的例子显示了如何设置SRGB 的范围:
Switch# configure terminal
Switch(config)# router isis
Switch(config-router)# segment-routing global-block 18000 19000
```

**相关命令**：无

### 6.8.57 `set-overload-bit`

**功能**：使用此命令配置路由器配置的过载标志位，对设备设置过载标志位后，其它设备在进
  行SPF 计算时不会使用这台设备做转发，只计算该设备上的直连路由。
  本命令的no 格式删除配置。

**语法**：

```
set-overload-bit ( { suppress ( external | interlevel | external interlevel | interlevel
external ) | on-startup ( TIME | wait-for-bgp ) } | )
no set-overload-bit
```

| 参数 | 说明 |
| --- | --- |
| suppress | 指定禁用特定的IP 地址的前缀 |
| external | 指定抑制分配外部可达性 |
| interlevel | 指定抑制分配内部可达性 |
| on-startup | 表示交换机重启或者出现故障时，过载标志位在配置的时间内将保持被置位状态。，单位：s |
| TIME | 指定重启后，指定一个自我通告为超载的时间，单位： s 5-86400 |
| wait-for-bgp | 表示根据BGP 收敛的状态，设置系统保持过载标志位时长 |

**命令模式**：路由模式

**默认配置**：禁用

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置过载标记位:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# set-overload-bit
```

**相关命令**：无

### 6.8.58 `spf-interval-exp`

**功能**：使用此命令配置最短路径优先算法的最小和最大延迟间隔。
  本命令的no 格式恢复默认值。

**语法**：

```
spf-interval-exp EXP_MIN EXP_MAX
spf-interval-exp ( level-1 | level-2 ) <0-2147483647> <0-2147483647>
no spf-interval-exp
```

| 参数 | 说明 |
| --- | --- |
| EXP_MIN | 指定距离进行spf 计算最小延迟间隔。单位：ms 0-2147483647 |
| EXP_MAX | 指定距离进行spf 计算最大延迟间隔。单位：ms 0-2147483647 |
| level-1 | 引用于level-1 |
| level-2 | 引用于level-2 |

**命令模式**：路由模式

**默认配置**：最小延迟500ms，最大延迟50000ms。应用于level-1 和level-2

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置进行下次spf 计算的最小和最大时间间隔:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# spf-interval-exp level-1 600 60000
Switch(config-router)# no spf-interval-exp level-1
```

**相关命令**：无

### 6.8.59 `summary-address`

**功能**：使用此命令配置IS-IS 生成聚合路由(IPv4)。
  使用相应的no 命令删除配置。

**语法**：

```
summary-address IP_ADDR/IP_MASK_LEN ( level-1 | level-1-2 | level-2 | ) ( metric )
( METRIC | )

no summary-address IP_ADDR/IP_MASK_LEN
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR/IP_MASK_LEN | Ipv4 路由前缀格式为A.B.C.D/M 的IPv4 地址和掩码长度 |
| level-1 | 表示只对引入到level-1 区域的路由进行聚合 |
| level-1-2 | 表示对引入到level-1 和 level-2 区域的路由进行聚合 |
| level-2 | 表示只对引入到level-2 区域的路由进行聚合 |
| metric | 指定聚合地址的度量值 |
| METRIC | 指定度量值。默认：0 1-4294967295 |

**命令模式**：路由模式

**默认配置**：禁用

**使用说明**：

未指定level 时，只应用于level-2

**示例**：

```
下面的例子显示了如何配置ipv4 聚合路由:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# summary-address 10.10.0.0/16
```

**相关命令**：无

### 6.8.60 `summary-prefix`

**功能**：使用此命令配置IS-IS 生成聚合路由(IPv6)。
  
  使用相应的no 命令删除配置。

**语法**：

```
summary-prefix GLOBAL_PREFIX/IPV6_MASK_LEN ( level-1 | level-1-2 | level-2 | )
( metric METRIC )
no summary-prefix GLOBAL_PREFIX/IPV6_MASK_LEN
```

| 参数 | 说明 |
| --- | --- |
| GLOBAL_PREFIX/IPV6_M |  |
| ASK_LEN | Ipv6 前缀格式为X:X::X:X/M 的IPv6 地址和掩码长度 |
| level-1 | 表示只对引入到level-1 区域的路由进行聚合 |
| level-1-2 | 表示对引入到level-1 和 level-2 区域的路由进行聚合 |
| level-2 | 表示只对引入到level-2 区域的路由进行聚合 |
| metric | 指定聚合地址的度量值 |
| METRIC | 指定度量值。默认：0 1-4294967295 |

**命令模式**：地址族配置模式

**默认配置**：禁用

**使用说明**：

未指定level 时，默认应用于level-2

**示例**：

```
下面的例子显示了如何配置ipv6 聚合路由:
Switch# configure terminal
Switch(config)# router isis bb
Switch(config-router)# address-family ipv6
Switch(config-router-af)# summary-prefix 3ffe:1234::/32
```

**相关命令**：无

### 6.8.61 `show clns is-neighbors`

**功能**：使用此命令查看所有CLSN 邻接关系。

**语法**：

```
show clns is-neighbors ( detail | )
show clns INSTANCE is-neighbors ( detail | )
show clns is-neighbors IFNAME ( detail | )
show clns INSTANCE is-neighbors IFNAME ( detail | )
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE | 查看指定实例的信息不超过20 字符的字符串 |
| IFNAME | 查看关于指定接口的信息支持 |
| physical/aggregation/loopb | ack/vlan/tunnel 端口 |
| detail | 查看详细信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何显示所有CLNS 邻接关系:
Switch# show clns is-neighbors
Area 100:
System Id      Interface   State  Type Priority  Circuit Id
```

### 6.8.62 `show debugging isis`

**功能**：使用此命令查看IS-IS 系统调试状态

**语法**：

```
show debugging isis
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何查看IS-IS 调试开关状态:
Switch# show debugging isis
IS-IS debugging status:
  IS-IS spf debugging is on
```

**相关命令**：无

### 6.8.63 `show ip isis route`

**功能**：使用此命令查看IS-IS IPv4 路由表

**语法**：

```
show ip isis ( INSTANCE | ) route
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE | 查看指定实例的信息支持 |
| physical/aggregation/loopb | ack/vlan/tunnel 端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何查看IS-IS IPv4 路由表:
Switch# show ip isis route
```

**相关命令**：无

### 6.8.64 `show ipv6 isis route`

**功能**：使用此命令查看IS-IS IPv6 路由表

**语法**：

```
show ipv6 isis ( INSTANCE | ) route
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE | 查看指定实例的信息不超过20 字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何查看IS-IS IPv6 路由表:
Switch# show ipv6 isis route
```

**相关命令**：无

### 6.8.65 `show ipv6 isis topology`

**功能**：使用此命令查看IPv6 IS-IS 拓扑

**语法**：

```
show ipv6 isis topology ( l1 | l2 | level-1 | level-2 | )
show ipv6 isis INSTANCE topology ( l1 | l2 | level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE | 查看指定实例的信息不超过20 字符的字符串 |
| l1 | IS-IS level-1 SPF 拓扑 |
| l2 | IS-IS level-2 SPF 拓扑 |
| level-1 | IS-IS level-1 SPF 拓扑 |
| level-2 | IS-IS level-2 SPF 拓扑 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何查看IPv6 IS-IS 拓扑:
Switch# show ipv6 isis topology
```

**相关命令**：无

### 6.8.66 `show ipv6 protocols isis`

**功能**：使用此命令查看IPv6 进程参数和统计

**语法**：

```
show ipv6 protocols isis
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何查看IPv6 进程参数和统计:
Switch# show ipv6 protocols isis
Routing Protocol is "isis 2 "
 Redistributing:
  Area Address(es):
Distance : (default is 115)
Routing Protocol is "isis 1 "
 Redistributing:
  Area Address(es):
Distance : (default is 115)
```

**相关命令**：无

### 6.8.67 `show isis counter`

**功能**：使用此命令查看IS-IS 系统计数

**语法**：

```
show isis counter
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何查看IS-IS 系统计数:
Switch# show isis counter
Area b:
IS-IS Level-1 isisSystemCounterEntry:
  isisSysStatCorrLSPs: 0
  isisSysStatAuthTypeFails: 0
  isisSysStatAuthFails: 0
  isisSysStatLSPDbaseOloads: 0
  isisSysStatManAddrDropFromAreas: 0
  isisSysStatAttmptToExMaxSeqNums: 0
  isisSysStatSeqNumSkips: 0
  isisSysStatOwnLSPPurges: 0
  isisSysStatIDFieldLenMismatches: 0
  isisSysStatMaxAreaAddrMismatches: 0
  isisSysStatPartChanges: 0
  isisSysStatSPFRuns: 0
  isisSysStatPRCRuns: 0
Area bb:
IS-IS Level-1 isisSystemCounterEntry:
  isisSysStatCorrLSPs: 0
  isisSysStatAuthTypeFails: 0
  isisSysStatAuthFails: 0

  isisSysStatLSPDbaseOloads: 0
  isisSysStatManAddrDropFromAreas: 0
  isisSysStatAttmptToExMaxSeqNums: 0
  isisSysStatSeqNumSkips: 0
  isisSysStatOwnLSPPurges: 0
  isisSysStatIDFieldLenMismatches: 0
  isisSysStatMaxAreaAddrMismatches: 0
  isisSysStatPartChanges: 0
  isisSysStatSPFRuns: 0
  isisSysStatPRCRuns: 0
IS-IS Level-2 isisSystemCounterEntry:
  isisSysStatCorrLSPs: 0
  isisSysStatAuthTypeFails: 0
  isisSysStatAuthFails: 0
  isisSysStatLSPDbaseOloads: 0
  isisSysStatManAddrDropFromAreas: 0
  isisSysStatAttmptToExMaxSeqNums: 0
  isisSysStatSeqNumSkips: 0
  isisSysStatOwnLSPPurges: 0
  isisSysStatIDFieldLenMismatches: 0
  isisSysStatMaxAreaAddrMismatches: 0
  isisSysStatPartChanges: 0
  isisSysStatSPFRuns: 0
  isisSysStatPRCRuns: 0
```

**相关命令**：无

### 6.8.68 `show isis database`

**功能**：使用此命令查看详细的链路状态数据信息

**语法**：

```
show isis database
show isis database ( l1 | l2 | level-1 | level-2 ) LSPID ( detail | verbose )
```

| 参数 | 说明 |
| --- | --- |
| detail | IS-IS 链路状态的详细信息 |
| verbose | IS-IS 链路状态的详细信息 |
| LSPID | LSPID，形式为 |
| XXXX.XXXX.XXXX.XX-XX |  |
| l1 | IS-IS level-1 链路状态表 |
| l2 | IS-IS level-2 链路状态表 |
| level-1 | IS-IS level-1 链路状态表 |
| level-2 | IS-IS level-2 链路状态表 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何查看详细的链路状态数据信息:
Switch# show isis database verbose
Area (null):
IS-IS Level-1 Link State Database:
LSPID                 LSP Seq Num  LSP Checksum  LSP Holdtime      ATT/P/OL
0000.0000.0001.00-00* 0x00000002   0x9E50        1140              0/0/0

IS-IS Level-2 Link State Database:
LSPID                 LSP Seq Num  LSP Checksum  LSP Holdtime      ATT/P/OL
0000.0000.0001.00-00* 0x00000003   0x9C51        1176              0/0/0
```

**相关命令**：无

### 6.8.69 `show isis interface`

**功能**：使用此命令查看详细的接口信息

**语法**：

```
show isis interface
show isis interface IFNAME
show isis interface counter
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 查看指定接口的信息支持 |
| physical/aggregation/loopb | ack/vlan/tunnel 端口 |
| counter | 查看接口统计 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何查看关于ISIS 的详细接口信息:
Switch# show isis interface eth-0-1
eth-0-1 is up, line protocol is up
  Routing Protocol: IS-IS ((null))
    Network Type: Broadcast
    Circuit Type: level-1-2
    Local circuit ID: 0x01
    Extended Local circuit ID: 0x00000001
    Local SNPA: e6f5.41de.3200
    IP interface address:
      1.1.1.1/24
    IPv6 interface address:
    Level-1 Metric: 10/10, Priority: 64, Circuit ID: 0000.0000.0001.01
    Number of active level-1 adjacencies: 0
    Level-1 LSP MTU: 1492
    Level-2 Metric: 10/10, Priority: 64, Circuit ID: 0000.0000.0001.01
    Number of active level-2 adjacencies: 0
    Level-2 LSP MTU: 1492
    Next IS-IS LAN Level-1 Hello in 238 milliseconds
    Next IS-IS LAN Level-2 Hello in 238 milliseconds
```

**相关命令**：无

### 6.8.70 `show isis topology`

**功能**：查看IS-IS 拓扑结构信息

**语法**：

```
show isis topology ( l1 | l2 | level-1 | level-2 | )
show isis INSTANCE topology ( l1 | l2 | level-1 | level-2 | )
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE | 指定实例的信息不超过20 字符的字符串 |
| l1 | 显示区域内所有l1 路由器的路径 |
| l2 | 显示域中所有l2 路由器的路径 |
| level-1 | 显示区域内所有level-1 路由器的路径 |
| level-2 | 显示域中所有level-2 路由器的路径 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何查看IS-IS 拓扑结构信息:
Switch# show isis topology
```

**相关命令**：无

### 6.8.71 `show running-config interface isis`

**功能**：查看指定接口ISIS 的配置信息

**语法**：

```
show running-config interface IFNAME isis
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 指定接口的信息支持 |
| physical/aggregation/loopb | ack/vlan/tunnel 端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何指定接口ISIS 的配置信息:
Switch# show running-config interface eth-0-1 isis
Building configuration...
!
interface eth-0-1
 ip router isis
!
```

**相关命令**：无

### 6.8.72 `show running-config router isis`

**功能**：查看ISIS 路由配置信息

**语法**：

```
show running-config router isis
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何查看ISIS 路由配置信息:
Switch# show running-config router isis
Building configuration...
!
router isis
 net 10.0000.0000.0001.00
!
```

**相关命令**：无、、7 IPv6 路由命令、7.1 OSPFv3 命令

