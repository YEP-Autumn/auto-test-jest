# 16 VPN 命令

## 16.1 VRF 命令

### 16.1.1 `ip vrf`

**功能**：使用该命令来配置VPN 的路由转发表，使用该命令的no 形式删除路由转发表。

**语法**：

```
ip vrf VRF-NAME
no ip vrf VRF-NAME
```

| 参数 | 说明 |
| --- | --- |
| VRF-NAME | 路由转发实例名不超过31 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# ip vrf ComA
Switch(config-vrf)# route-target both 100:2
Switch(config-vrf)# route-target import 200:1
```

**相关命令**：ip vrf forwarding

### 16.1.2 `show ip vrf`

**功能**：使用该命令来显示VRF 以及相关的接口。

**语法**：

```
show ip vrf ( bgp ( brief | detail ) | interfaces | ospf | rip | VRF-NAME | )
```

| 参数 | 说明 |
| --- | --- |
| bgp | 显示BGP 协议里VRF 相关的接口信息 |
| brief | 显示BGP 协议里VRF 的摘要信息 |
| detail | 显示BGP 协议里VRF 的详细信息 |
| interfaces | 显示所有的VRF 相关的接口信息 |
| ospf | 显示OSPF 协议里VRF 相关的接口信息 |
| rip | 显示RIP 协议里VRF 相关的接口信息 |
| VRF-NAME | VPN 路由转发实例名不超过31 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# show ip vrf
```

**相关命令**：无

### 16.1.3 `ip vrf forwarding`

**功能**：使用该命令将某个3 层接口加入VPN 转发实例。使用该命令的no 形式将VRF 和3 层
  接口解除绑定。

**语法**：

```
ip vrf forwarding VRF-NAME
no ip vrf forwarding
```

| 参数 | 说明 |
| --- | --- |
| VRF-NAME | VPN 路由转发实例名不超过31 个字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

使用该命令将会删除接口上原来的IP 地址，您必须重新配置IP 地址。

**示例**：

```
Switch# configure terminal
Switch(config)# ip vrf ComA
Switch(config-vrf)# exit
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ip vrf forwarding ComA
```

**相关命令**：ip vrf、、ip route vrf

### 16.1.4 `ip route vrf`

**功能**：使用该命令在VRF 下创建静态路由，使用该命令的no 形式删除该路由。

**语法**：

```
ip route vrf VRF-NAME ( PREFIX MASK | PREFIX/PREFIX-LENGTH ) ( NH-ADDRESS
( public | ) | vrf VRF-NAME NH-ADDRESS | IFNAME | REMOTE-VTEP ) ( DISTANCE | )
( bind bfd BFD-NAME | track NUMBER | )
no ip route vrf VRF-NAME ( PREFIX MASK | PREFIX/PREFIX-LENGTH ) ( NH-ADDRESS
( public | ) | vrf VRF-NAME NH-ADDRESS | IFNAME | REMOTE-VTEP | ) ( bind bfd | track
| )
```

| 参数 | 说明 |
| --- | --- |
| VRF-NAME | VPN 路由转发实例名不超过31 个字符的字符串 |
| PREFIX | 目的地址 IPv4 地址 |
| MASK | 目的地址的子网掩码 IPv4 地址格式的掩码 |
| PREFIX-LENGTH | 子网前缀长度 1-32 |
| NH-ADDRESS | 下一跳的IP 地址 IPv4 地址 |
| IFNAME | 转发报文的接口目前仅支持tunnel 和null 接口 |
| REMOTE-VTEP | overlay 隧道类型的下一跳 remote-vtep 的index |
| DISTANCE | (可选)管理距离，静态路由默认是1 1-255 |
| BFD-NAME | 指定bfd 名称长度不超过16 的字符串 |
| NUMBER | 指定track ID 1-500 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# ip route vrf VPN-NAME 2.2.2.0/24 1.1.1.2
```

**相关命令**：show ip route vrf

### 16.1.5 `arp vrf`

**功能**：使用该命令在VRF 下增加一条静态的ARP 条目，使用该命令的no 形式删除这条ARP。

**语法**：

```
arp vrf VRF_NAME IP_ADDR MAC
no arp vrf VRF_NAME IP_ADDR
```

| 参数 | 说明 |
| --- | --- |
| VRF-NAME | VPN 路由转发实例名不超过31 个字符的字符串 |
| IP_ADDR | 主机IP 地址 IPv4 地址 |
| MAC | 以HHHH.HHHH.HHHH 格式表示的MAC 地址 MAC 地址 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# arp vrf vpn3 1.1.1.1 0000.1111.2222
```

**相关命令**：show ip arp vrf VRF-NAME、clear ip arp vrf VRF-NAME A.B.C.D

### 16.1.6 `show ip arp vrf`

**功能**：使用该命令显示某个VRF 下的ARP 条目。

**语法**：

```
show ip arp vrf VRF-NAME
```

| 参数 | 说明 |
| --- | --- |
| VRF-NAME | VPN 路由转发实例名不超过31 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
这个例子显示了在VRF ComA 下的所有ARP 条目。 :
Switch# show ip arp vrf ComA

 Protocol    Address          Age (min)  Hardware Addr   Interface
 Internet    1.1.1.1                 -   0000.1111.2222
```

**相关命令**：arp vrf

### 16.1.7 `clear ip arp vrf`

**功能**：使用该命令清除 VRF 下指定的动态ARP 条目。

**语法**：

```
clear ip arp vrf VRF-NAME IP_ADDR
```

| 参数 | 说明 |
| --- | --- |
| VRF-NAME | VPN 路由转发实例名不超过31 个字符的字符串 |
| IP_ADDR | 动态学习到的主机IP 地址 IPv4 地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
该命令显示了如何清除在VRF 下学习到的1.1.1.1 这条ARP。:
Switch# clear ip arp vrf ComA 1.1.1.1
```

**相关命令**：arp vrf

### 16.1.8 `ping vrf`

**功能**：使用该命令在VRF 下检测主机的可达性。

**语法**：

```
ping vrf VRF-NAME IPV4_HOST
```

| 参数 | 说明 |
| --- | --- |
| VRF-NAME | VPN 路由转发实例名 |
| IPV4_HOST | 目的IP 地址或主机名 IPv4 地址或host name 字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# ping vrf vpn 1.1.1.1
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=0 ttl=64 time=0.114 ms
64 bytes from 1.1.1.1: icmp_seq=1 ttl=64 time=0.087 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=64 time=0.087 ms
64 bytes from 1.1.1.1: icmp_seq=3 ttl=64 time=0.097 ms
64 bytes from 1.1.1.1: icmp_seq=4 ttl=64 time=0.133 ms
--- 1.1.1.1 ping statistics ---
5 packets transmitted, 5 received, 0% packet loss, time 4041ms
rtt min/avg/max/mdev = 0.087/0.103/0.133/0.020 ms, pipe 2
```

**相关命令**：无

### 16.1.9 `traceroute vrf`

**功能**：使用该命令在VRF 下查看报文从当前设备到目的地所经过的路径。

**语法**：

```
traceroute vrf VRF-NAME IPV4_HOST
```

| 参数 | 说明 |
| --- | --- |
| VRF-NAME | VPN 路由转发实例名不超过31 个字符的字符串 |
| WORD | 要跟踪的目的IP 地址或主机名 IPv4 地址或host name 字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# traceroute vrf vpn 1.1.1.1
traceroute to 1.1.1.1 (1.1.1.1), 30 hops max, 38 byte packets
 1  1.1.1.1 (1.1.1.1)  0.222 ms  0.169 ms  0.169 ms
```

**相关命令**：无

### 16.1.10 `telnet vrf`

**功能**：使用该命令使用户可以方便地从当前以太网交换机登录到其它以太网交换机进行远程
  管理。

**语法**：

```
telnet vrf VRF-NAME WORD
```

| 参数 | 说明 |
| --- | --- |
| VRF-NAME | VPN 路由转发实例名不超过31 个字符的字符串 |
| WORD | 远端交换机的主机名或IP 地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# telnet vrf vpn 9.9.9.2
Trying 9.9.9.2...
Connected to 9.9.9.2.
Escape character is '^]'.
Fedora Core release 4 (Stentz)
Kernel 2.6.32.23 on an i686
login: root
Password:
```

**相关命令**：无

### 16.1.11 `rd`

**功能**：使用该命令来设置RD。

**语法**：

```
rd RD-VALUE
```

| 参数 | 说明 |
| --- | --- |
| RD-VALUE | RD 的值，格式为ASN:nn 或IP-address:nn ASN 范围1-4294967295 或用IPv4 地址表示，nn 范围1-65535 |

**命令模式**：VRF 模式

**默认配置**：无

**使用说明**：

RD 的作用是为了防止一台PE 接收到远端PE 发来的不同VRF 的相同路由时不知所措，
  而加在路由前面的特殊信息。在PE 发布路由时加上，在远端PE 接收到路由后放在本
  地路由表中，用来与后来接收到的路由进行比较。

**示例**：

```
Switch# configure terminal
Switch(config)# ip vrf test
Switch(config-vrf)# rd 1.1.1.1:1
```

**相关命令**：无

### 16.1.12 `route-target`

**功能**：使用该命令来设置RT。使用该命令的no 形式删除RT。

**语法**：

```
route-target ( both | export | import ) RT-VALUE
no route-target ( both | export | import ) ( RT-VALUE | )
```

| 参数 | 说明 |
| --- | --- |
| both | 入方向和出方向 |
| export | 出方向 |
| import | 入方向 |
| RT-VALUE | RT 的值，格式为ASN:nn 或 IP-address:nn ASN 范围1-4294967295 或用IPv4 地址表示，nn 范围1-65535 |

**命令模式**：VRF 模式

**默认配置**：无

**使用说明**：

RT 表明了一个VRF 的路由喜好，通过他可以实现不同VRF 之间的路由互通。他的本质
  就是BGP 的community 属性。

**示例**：

```
Switch# configure terminal
Switch(config)# ip vrf test
Switch(config-vrf)# route-target import 100:1
```

**相关命令**：无

### 16.1.13 `import map`

**功能**：该命令用来对当前VPN 实例应用入方向路由策略。使用该命令的no 形式解绑入方向
  路由策略

**语法**：

```
import map WORD
no import map
```

| 参数 | 说明 |
| --- | --- |
| WORD | 路由策略名不超过20 个字符的字符串 |

**命令模式**：VRF 模式

**默认配置**：无

**使用说明**：

当要求比采用扩展团体属性方式更精确地控制引入VPN 实例路由时，可以采用入方向
  路由策略，缺省情况下根据路由的VPN-target 扩展团体属性过滤引入的路由。入方向
  路由策略可能会拒绝从输入列表中的团体里选定的路由。
  缺省情况下，允许所有VPN Target 属性匹配的路由通过。

**示例**：

```
Switch# configure terminal
Switch(config)# ip vrf test
Switch(config-vrf)# import map 100
```

**相关命令**：export map

### 16.1.14 `export map`

**功能**：该命令用来对当前VPN 实例应用出方向路由策略。使用该命令的no 形式解绑出方向
  路由策略

**语法**：

```
export map WORD
no export map
```

| 参数 | 说明 |
| --- | --- |
| WORD | 路由策略名不超过20 个字符的字符串 |

**命令模式**：VRF 模式

**默认配置**：无

**使用说明**：

当要求比采用扩展团体属性方式更精确地控制发布的 VPN 实例路由时，可以使用出方
  向路由策略。此路由策略可能会过滤掉发布路由中选定的路由。缺省情况下，允许所
  有 VPN Target 属性匹配的路由通过。

**示例**：

```
Switch# configure terminal
Switch(config)# ip vrf test
Switch(config-vrf)# export map 100
```

**相关命令**：import map

### 16.1.15 `router-id`

**功能**：使用该命令设置路由器标志符。使用该命令的no 形式删除路由器标致符

**语法**：

```
router-id IP_ADDR
no router-id
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 以IP 地址表示的路由器标志符 IPv4 地址 |

**命令模式**：VRF 模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# ip vrf test
Switch(config-vrf)# router-id 1.1.1.1
```

**相关命令**：show ip vrf

### 16.1.16 `description`

**功能**：使用该命令给VRF 增加描述。使用该命令的no 形式删除VRF 的描述

**语法**：

```
description LINE
no description
```

| 参数 | 说明 |
| --- | --- |
| LINE | VRF 描述字符串长度不能超过40， 并且首字符必须是a-z，A- Z 或者0-9 |

**命令模式**：VRF 模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# ip vrf test
Switch(config-vrf)# description VrfName1
```

**相关命令**：show ip vrf

### 16.1.17 `show resource vrf`

**功能**：使用该命令显示系统中vrf 占用的硬件资源统计

**语法**：

```
show resource vrf
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了使用命令show resource vrf 后的结果:
Switch# show resource vrf
VRF
Resource                         Used          Capability
=============================================================
VRF number                        1                252
```

**相关命令**：无、16.2 IPv4 GRE 隧道命令


## 16.2 IPv4 GRE 隧道命令

### 16.2.1 `interface`

**功能**：使用该命令来创建一个Tunnel 接口。使用该命令的no 形式删除该Tunnel 接口。

**语法**：

```
interface tunnel TUNNEL_ID
no interface tunnel TUNNEL_ID
```

| 参数 | 说明 |
| --- | --- |
| TUNNEL_ID | 接口编号 0-1023 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

如果要通过IPv4 网络来连接两个隔离的IPv4 网络，首先要创建Tunnel 接口。配置其
  他属性之后，此Tunnel 接口可用。使能后就可以转发封装后的IPv4 报文。
  注意，创建的interface 没有配置mode 之前，是不能进行有关接口上的任何操作的，
  此时接口不具备任何功能，只是单纯的创建interface 结构体。

**示例**：

```
下面的例子显示了如何创建一个Tunnel 接口:
Switch# configure terminal
Switch(config)# interface tunnel 1
```

**相关命令**：show interface tunnel

### 16.2.2 `tunnel mode gre`

**功能**：使用该命令配置隧道模式。使用该命令的no 形式删除隧道模式。

**语法**：

```
tunnel mode gre
no tunnel mode
```

| 参数 | 说明 |
| --- | --- |
| gre | 当配置tunnel 的模式为 GRE，即通用路由封装协议，目前暂时只支持IPv4 gre tunnel，即针对IPv 4 报文进行封装，且封装后的报文依然为IPv4 。 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

当配置tunnel 的模式为GRE 时，必须要手动配置tunnel source 和tunnel destination，
  不支持自动隧道。只有先配好mode，才能继续配置tunnel 的上其他参数。

**示例**：

```
下面的例子显示了如何配置隧道模式为gre:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel mode gre
```

**相关命令**：tunnel source、tunnel destination

### 16.2.3 `tunnel source`

**功能**：使用该命令来配置隧道的源地址，使用该命令的no 形式删除隧道的源地址。

**语法**：

```
tunnel source ( IP_ADDR | IFNAME )
no tunnel source
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 指定隧道的源地址为IPv4 地址格式 IPv4 地址 |
| IFNAME | 指定隧道的源地址从接口 IPv4 地址中获得，如果接口上有多个地址，则只取主 IP 地址。接口可以为：路由口，vlan 虚拟口，环回口支持 |
| physical/aggregation/loopb | ack/vlan 端口 |

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

**相关命令**：tunnel mode gre、tunnel destination

### 16.2.4 `tunnel destination`

**功能**：使用该命令来配置隧道的目的地址。使用该命令的no 形式删除隧道的目的地址。

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

GRE 隧道需要配置隧道目的地址。

**示例**：

```
下面的例子显示了如何配置隧道的目的地址:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel destination 4.4.4.4
```

**相关命令**：tunnel source、tunnel mode gre

### 16.2.5 `tunnel enable`

**功能**：使用该命令设置使能解封装隧道报文的接口。去使能命令可以恢复端口的默认功能，
  非解封装模式。

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

### 16.2.6 `tunnel gre key`

**功能**：使用该命令来配置gre 隧道的认证密钥，使用该命令的no 形式删除gre 隧道的认证密
  钥。

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

配置gre key 为了与对端tunnel 进行报文认证，是gre tunnel 的一个重要功能，只有对
  key 相匹配的报文才进行解封装后转发，提高gre 隧道的安全性，可以使用设置的gre
  key 对隧道封装的报文进行端到端校验。只有在tunnel mode 为gre 或者erspan 模式
  的时候才能配置gre key，目前gre key 可以支持32bit，但是不支持配置0。

**示例**：

```
配置tunnel 的gre key:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel gre key 666
```

**相关命令**：tunnel source

### 16.2.7 `tunnel dscp`

**功能**：使用该命令设置外层IPv4 头的DSCP 值。使用该命令的no 形式恢复从内层IPv4 头获
  取DSCP 的方式。

**语法**：

```
tunnel dscp DSCP
no tunnel dscp
```

| 参数 | 说明 |
| --- | --- |
| DSCP | 设置外层IPv4 头的DSCP 值 0-63 |

**命令模式**：端口配置模式

**默认配置**：默认从内层IPv4 头获取DSCP 值。

**使用说明**：

无

**示例**：

```
下面的例子显示了如何设置外层IPv4 头的DSCP 值为40:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel dscp 40
```

**相关命令**：show interface tunnel、interface

### 16.2.8 `keepalive`

**功能**：使用该命令使能keepalive 功能，用来检测对端gre tunnel 是否处于有效up 状态以及
  tunnel 之间的链路是否通或者可达。

**语法**：

```
keepalive PERIOD_VALUE RETRY_VALUE
no keepalive
```

| 参数 | 说明 |
| --- | --- |
| PERIOD_VALUE | keepalive 发包的间隔时间 1-32767 |
| RETRY_VALUE | keepalive 发包的超时次数 1-255 |

**命令模式**：端口配置模式

**默认配置**：period_value: 10s retry_value:3

**使用说明**：

keepalive 只支持在gre tunnel 上使能，不支持其他类型的tunnel。当使能keepalive 后，
  只有当tunnel 接口上配有tunnel source 和tunnel destination 时，才会发keepalive 报
  文出来。

**示例**：

```
下面的例子显示了如何使能gre tunnel 接口的keepalive 功能:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# keepalive 10 5
```

**相关命令**：no keepalive

### 16.2.9 `show interface tunnel`

**功能**：使用该命令来显示tunnel 接口的信息。

**语法**：

```
show interface tunnel TUNNEL_ID
```

| 参数 | 说明 |
| --- | --- |
| TUNNEL_ID | 接口编号 0-1023 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了tunnel 接口的信息:
Switch# show interface tunnel 1
Interface tunnel1
  Interface current state: UP
  Hardware is Tunnel
  Index 8193 , Metric 1 , Encapsulation TUNNEL
  VRF binding: not bound
  Internet primary address:
    1.1.1.1/24 pointopoint 1.1.1.255
  Tunnel protocol/transport GRE/IP, Status Valid
  Tunnel source 192.192.168.1(eth-0-10), destination 10.10.10.10
  Tunnel DSCP inherit,  Tunnel TTL 255
  Tunnel transport MTU 1476 bytes
  Tunnel GRE key enable: 100
  Tunnel GRE keepalive enable, Send period: 5, Retry times: 3
  0 packets input, 0 bytes
  0 packets output, 0 bytes
```

**相关命令**：show resource tunnel

### 16.2.10 `show resource tunnel`

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
Switch# show tunnel resource
Tunnel
Resource                         Used          Capability
=============================================================
Peers                            0             8
DUT1#
```

**相关命令**：无

### 16.2.11 `show tunnel keepalive statistics`

**功能**：使用该命令来显示gre tunnel keepalive 报文的统计信息

**语法**：

```
show tunnel keepalive statistics ( | interface tunnel TUNNEL_ID )
```

| 参数 | 说明 |
| --- | --- |
| TUNNEL_ID | 接口编号 0-1023 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了gre tunnel 使能keepalive 后的统计信息:
Switch#  show tunnel keepalive statistics
Name         Status    Keepalive  Out_ka_pkt In_ka_pkt  TunnelUp TunnelDown
-----------------------------------------------------------------------------
DUT1#
```

**相关命令**：clear tunnel keepalive statistics

### 16.2.12 `clear tunnel keepalive statistics`

**功能**：使用该命令可以清空gre tunnel 上keepalive 的统计信息

**语法**：

```
clear tunnel keepalive statistics ( all | interface tunnel TUNNEL_ID )
```

| 参数 | 说明 |
| --- | --- |
| TUNNEL_ID | 接口编号 0-1023 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子清空gre tunnel 使能keepalive 后的统计信息:
Switch# clear tunnel keepalive statistics all
```

**相关命令**：show tunnel keepalive statistics

### 16.2.13 `clear tunnel statistics`

**功能**：使用该命令可以清空gre tunnel 上output 和 input 方向的统计信息

**语法**：

```
clear tunnel statistics ( all | interface tunnel TUNNEL_ID )
```

| 参数 | 说明 |
| --- | --- |
| TUNNEL_ID | 接口编号 0-1023 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子清空gre tunnel encap 和decap 的统计信息:
Switch# clear tunnel statistics all
```

**相关命令**：show interface tunnel id、、16.3 IPv4 ERSPAN 隧道命令


## 16.3 IPv4 ERSPAN 隧道命令

### 16.3.1 `interface`

**功能**：使用该命令来创建一个Tunnel 接口。使用该命令的no 形式删除该Tunnel 接口。

**语法**：

```
interface tunnel TUNNEL_ID
no interface tunnel TUNNEL_ID
```

| 参数 | 说明 |
| --- | --- |
| TUNNEL_ID | 接口编号 0-1023 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

如果要通过IPv4 网络来连接两个隔离的IPv4 网络，首先要创建Tunnel 接口。配置其
  他属性之后，此Tunnel 接口可用。使能后就可以转发封装后的IPv4 报文。
  注意，创建的interface 没有配置mode 之前，是不能进行有关接口上的任何操作的，
  此时接口不具备任何功能，只是单纯的创建interface 结构体。

**示例**：

```
下面的例子显示了如何创建一个Tunnel 接口:
Switch# configure terminal
Switch(config)# interface tunnel 1
```

**相关命令**：show interface tunnel

### 16.3.2 `tunnel mode erspan`

**功能**：使用该命令配置隧道模式。使用该命令的no 形式删除隧道模式。

**语法**：

```
tunnel mode ( erspan ( ecmp-dst-gre | ) )
no tunnel mode
```

| 参数 | 说明 |
| --- | --- |
| erspan | 配置tunnel 的模式为 erspan 单目的地址模式， 目前暂时只支持IPv4 erspan tunnel，即针对IPv 4 报文进行封装，且封装后的报文依然为IPv4 。 |
| erspan ecmp-dst-gre | 配置tunnel 的模式为 erspan 多目的地址模式， 目前暂时只支持IPv4 erspan tunnel，即针对IPv 4 报文进行封装，且封装后的报文依然为IPv4 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

当配置tunnel 的模式为erspan 时，必须要手动配置tunnel source 和tunnel
  destination，不支持自动隧道。只有先配好mode，才能继续配置tunnel 的上其他参数。

**示例**：

```
下面的例子显示了如何配置隧道模式为erspan:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel mode erspan
```

**相关命令**：tunnel source、tunnel destination

### 16.3.3 `tunnel source`

**功能**：使用该命令来配置隧道的源地址，使用该命令的no 形式删除隧道的源地址。

**语法**：

```
tunnel source ( IP_ADDR | IFNAME )
no tunnel source
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 指定隧道的源地址为IPv4 地址格式 IPv4 地址 |
| IFNAME | 指定隧道的源地址从接口 IPv4 地址中获得,接口可以为：路由口，vlan 虚拟口， 环回口支持 |
| physical/aggregation/loopb | ack/vlan 端口 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

每个隧道必须指定一个隧道源。如果隧道源是接口方式配置的，则从接口的IP 地址中
  获取地址。

**示例**：

```
下面的例子显示了如何设置隧道源:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel source 3.3.3.3
```

**相关命令**：tunnel mode erspan、tunnel destination

### 16.3.4 `tunnel destination`

**功能**：使用该命令来配置隧道的目的地址。使用该命令的no 形式删除隧道的目的地址。

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
Switch(config-if)# tunnel mode erspan
Switch(config-if)# tunnel destination 4.4.4.4
```

**相关命令**：tunnel source、tunnel mode erspan

### 16.3.5 `tunnel ecmp-destination`

**功能**：使用该命令来配置隧道的多目的地址。使用该命令的no 形式删除隧道的目的地址。

**语法**：

```
tunnel ecmp-destination IP_ADDR
no tunnel ecmp-destination IP_ADDR
no tunnel ecmp-destination all
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 指定tunnel 接口的目的 IPv4 地址 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

EPSPAN 隧道需要配置隧道目的地址。

**示例**：

```
下面的例子显示了如何配置隧道的多目的地址:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config)#tunnel mode erspan ecmp-dst-gre
Switch(config-if)# tunnel ecmp-destination 3.3.3.3
Switch(config-if)# tunnel ecmp-destination 4.4.4.4
```

**相关命令**：tunnel source、tunnel mode erspan ecmp-dst-gre

### 16.3.6 `tunnel gre key`

**功能**：使用该命令来配置erspan 隧道的认证密钥，使用该命令的no 形式删除erspan 隧道的
  认证密钥。

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

配置gre key 为了与对端tunnel 进行报文认证，是erspan tunnel 的一个重要功能，提
  高erspan 隧道的安全性，可以使用设置的gre key 对隧道封装的报文进行端到端校验。
  目前gre key 可以支持32bit，但是不支持配置0。

**示例**：

```
配置tunnel 的gre key:
Switch# configure terminal
Switch(config-if)# tunnel gre key 666
```

**相关命令**：tunnel source

### 16.3.7 `tunnel dscp`

**功能**：使用该命令设置外层IPv4 头的DSCP 值。使用该命令的no 形式恢复从内层IPv4 头获
  取DSCP 的方式。

**语法**：

```
tunnel dscp DSCP
no tunnel dscp
```

| 参数 | 说明 |
| --- | --- |
| DSCP | 设置外层IPv4 头的DSCP 值 0-63 |

**命令模式**：端口配置模式

**默认配置**：默认从内层IPv4 头获取DSCP 值。

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

### 16.3.8 `tunnel ttl`

**功能**：使用该命令设置外层IPv4 头的ttl 值。使用该命令的no 形式恢复从内层IPv4 头获取ttl
  的方式。

**语法**：

```
tunnel ttl TTL
no tunnel ttl
```

| 参数 | 说明 |
| --- | --- |
| TTL | 设置外层IPv4 头的ttl 值 1-254 |

**命令模式**：端口配置模式

**默认配置**：默认从内层IPv4 头获取ttl 值。

**使用说明**：

无

**示例**：

```
下面的例子显示了如何设置外层IPv4 头的ttl 值为40:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel ttl 40
```

**相关命令**：interface

### 16.3.9 `tunnel extend-header`

**功能**：使用该命令添加erspan 的extend-header 头信息。使用该命令的no 形式删除erspan
  的extend-header 头信息

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
下面的例子显示了如何设置erspan 的extend-header 头:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel extend-header
```

**相关命令**：tunnel extend-header id

### 16.3.10 `tunnel extend-header id`

**功能**：使用该命令添加erspan 的extend-header 头里的extend-header id 信息.使用该命令的
  no 形式删除erspan 的extend-header 头里的extend-header id 信息

**语法**：

```
tunnel extend-header id ID
no tunnel extend-header id
```

| 参数 | 说明 |
| --- | --- |
| ID | Extend-header id 信息 1-1023 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

必须先配置tunnel extend-header 模式后才能继续添加extend-header id
  删除extend-header 前必须先删除extend-header id

**示例**：

```
下面的例子显示了如何设置erspan 的extend-header id:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel extend-header
Switch(config-if)# tunnel extend-header id 1
```

**相关命令**：tunnel extend-header

### 16.3.11 `tunnel extend-header dst-load-balance`

**功能**：使用该命令配置erspan 隧道扩展头的负载分担模式。使用该命令的no 形式删除
  erspan 隧道扩展头的负载分担模式

**语法**：

```
tunnel extend-header dst-load-balance
no tunnel extend-header dst-load-balance
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

必须先配置tunnel extend-header 模式后才能继续添加extend-header dst-load-
  balance
  删除extend-header 前必须先删除extend-header dst-load-balance

**示例**：

```
下面的例子显示了如何设置erspan 的extend-header dst-load-balance:
Switch# configure terminal
Switch(config)# interface tunnel 1
Switch(config-if)# tunnel extend-header
Switch(config-if)# tunnel extend-header dst-load-balance
```

**相关命令**：tunnel extend-header

### 16.3.12 `show resource tunnel`

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
Peers                            3             8
```

**相关命令**：无、、17 网络虚拟化命令、17.1 Overlay 命令

