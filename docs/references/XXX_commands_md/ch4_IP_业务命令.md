# 4 IP 业务命令

## 4.1 ARP 命令

### 4.1.1 `arp`

**功能**：此命令添加一条静态ARP，使用该命令的no 形式来删除静态配置的ARP。

**语法**：

```
arp ( vrf VRF-NAME | ) IP-ADDRESS HARDWARE-ADDRESS
no arp ( vrf VRF-NAME | ) IP-ADDRESS
```

| 参数 | 说明 |
| --- | --- |
| vrf VRF-NAME | VRF 实例名字不超过31 个字符的字符串 |
| IP-ADDRESS | 要添加的静态映射的IP 地址 IPv4 地址 |
| HARDWARE-ADDRESS | 要添加的静态映射的MAC 地址，格式为 |
| HHHH.HHHH.HHHH | MAC 地址 |

**命令模式**：全局配置模式

**默认配置**：默认无静态ARP 表项

**使用说明**：

所添加的IP 地址不能为广播地址、多播地址或者本地环回地址；或者形如0.X.X.X/8 的
  地址；所添加的MAC 地址不能为广播地址、多播地址，设备本身地址，或者全0 地址；
  添加的静态ARP 不能被clear arp-cache 命令删除。

**示例**：

```
下面的例子显示了如何添加一条静态ARP:
Switch# configure terminal
Switch(config)# arp 10.31.7.19 0800.0900.1834
```

**相关命令**：clear arp-cache

### 4.1.2 `arp retry-interval`

**功能**：此命令设置本地发送ARP 请求报文的频率，即解析同一个IP 地址，发送连续2 次ARP
  请求报文的时间间隔。使用关键字no 恢复此时间间隔为默认值。

**语法**：

```
arp retry-interval SECONDS
no arp retry-interval
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 发送ARP 请求报文的时间间隔，以秒为单位 0-3 秒 |

**命令模式**：端口配置模式

**默认配置**：1 秒

**使用说明**：

默认重发ARP 请求报文的时间间隔为1 秒；此功能不能配置在2 层端口上；使用no
  switchport 命令关闭端口的二层功能。

**示例**：

```
设置设备发送ARP 请求报文的时间间隔为3 秒:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# arp retry-interval 3
```

**相关命令**：show interface

### 4.1.3 `arp timeout`

**功能**：此命令设置动态ARP 表项的老化时间。使用关键字no 恢复老化时间为默认值。

**语法**：

```
arp timeout SECONDS
no arp timeout
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | ARP 表项的老化时间，以秒为单位，范围<1- 2147483> 1-2147483 秒 |

**命令模式**：端口配置模式

**默认配置**：3600 秒

**使用说明**：

默认老化时间是3600 秒；
  此功能不能配置在2 层端口上。

**示例**：

```
设置动态ARP 表项的老化时间为1200 秒:

Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# arp timeout 1200
```

**相关命令**：show interface

### 4.1.4 `arp as-layer-3 enable`

**功能**：此命令设置将arp 报文当作三层报文处理。使用该命令的no 形式来去使能arp 报文当
  作三层处理。

**语法**：

```
arp as-layer-3 enable
no arp as-layer-3 enable
```

**命令模式**：全局配置模式

**默认配置**：未使能

**使用说明**：

vlan classifier 和IP Source Guard 会收到此命令的影响。
  使能时，vlan classifier 使能基于ip 的rule 时，会将匹配src ip 的arp 报文也划分到指
  定vlan。否则arp 报文不会被划分到指定vlan。
  使能时，ip source guard 在端口上使能IP 检查时，匹配src ip 的arp 报文不会被过滤。
  否则被过滤。

**示例**：

```
设置将arp 报文当作三层报文处理:
Switch# configure terminal
Switch(config)# arp as-layer-3 enable
```

**相关命令**：N/A

### 4.1.5 `arp fake global enable`

**功能**：此命令用于全局使能临时ARP。使用该命令的no 形式来去使能临时arp。

**语法**：

```
arp fake global enable
no arp fake global enable
```

**命令模式**：全局配置模式

**默认配置**：未使能

**使用说明**：

同时在全局使能和接口上使能才生效

**示例**：

```
下面的例子在全局使能触发临时ARP 表项:
Switch# configure terminal
Switch(config)# arp fake global enable
```

**相关命令**：arp fake enable

### 4.1.6 `arp fake enable`

**功能**：此命令用于在接口上使能临时ARP。使用该命令的no 形式去使能端口临时arp。

**语法**：

```
arp fake enable
no arp fake enable
```

**命令模式**：端口配置模式

**默认配置**：使能

**使用说明**：

使能后，本端口收到IP 报文匹配不到对应的ARP 表项时，会下临时ARP 表项。在收
  到ARP 应答报文前，匹配临时ARP 表项的IP 报文将被丢弃并且不会上cpu 触发ARP
  请求。在收到ARP 应答报文后，则生成正确的ARP 表项来替换临时ARP 表项。未使能
  时，不会下临时ARP 表项(不过show ip arp 可以看到该临时ARP 表项)。

**示例**：

```
下面的例子在端口上使能触发临时ARP 表项:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# arp fake enable
```

**相关命令**：arp fake global enable

### 4.1.7 `arp fake timeout`

**功能**：此命令用来配置临时ARP 表项的老化时间。使用该命令的no 形式恢复默认时间。

**语法**：

```
arp fake timeout SECONDS
no arp fake timeout
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | ARP 临时表项的老化时间 1-36000, 单位:秒 |

**命令模式**：端口配置模式

**默认配置**：5 秒

**使用说明**：

当判断设备受到攻击时，可以执行本命令增大临时ARP 表项的老化时间

**示例**：

```
下面的例子设置临时ARP 表项老化时间为100 秒:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# arp fake timeout 100
```

**相关命令**：N/A

### 4.1.8 `clear arp-cache`

**功能**：使用此命令更新ARP cache。使用此命令后，系统将探测ARP cache 中的各项，探测失
  败的项将被清除。

**语法**：

```
clear arp-cache ( ( vrf VRF-NAME | ) interface IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| vrf VRF-NAME | 如果指定了此项，则更新此 VRF 内的ARP cache；如果没有指定此项，则更新公网内学习的ARP 表项不超过31 个字符的字符串 |
| IFNAME | 如果指定了此项，则更新此端口的ARP cache；如果没有指定此项，则更新所有端口学习的ARP 表项支持 |
| physical/aggregation/loopb | ack/vlan/tunnel 端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

此命令不能更新静态ARP 表项。

**示例**：

```
下面的例子描述了如何更新公网内所有动态ARP 表项:
Switch# clear arp-cache
```

**相关命令**：show ip arp

### 4.1.9 `clear ip arp`

**功能**：使用此命令更新某个指定的动态ARP 表项。使用此命令后，系统将探测这条ARP，若
  探测失败则该ARP 被清除。

**语法**：

```
clear ip arp ( vrf VRF-NAME | ) IP-ADDRESS
```

| 参数 | 说明 |
| --- | --- |
| vrf VRF-NAME | 如果指定了此项，则更新此 VRF 内的ARP cache；如果没有指定此项，则更新公网内学习的ARP 表项不超过31 个字符的字符串 |
| IP-ADDRESS | 更新指定的ARP 表项 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

此命令用于更新指定IP 地址的动态ARP 表项。

**示例**：

```
下面的例子描述了如何更新公网内的指定ARP 表项:
Switch# clear ip arp 10.10.10.10
```

**相关命令**：show ip arp

### 4.1.10 `clear ip arp statistics`

**功能**：使用此命令清除ARP 报文统计消息。

**语法**：

```
clear ip arp ( vrf VRF-NAME | ) statistics
```

| 参数 | 说明 |
| --- | --- |
| vrf VRF-NAME | 如果指定了此项，则清除此 VRF 内的ARP 统计信息； 如果没有指定此项，则清除公网内ARP 统计信息不超过31 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

此命令用于清除ARP 统计信息。

**示例**：

```
下面的例子描述了如何清除ARP 统计信息:
Switch# clear ip arp statistics
```

**相关命令**：show ip arp summary

### 4.1.11 `show ip arp`

**功能**：使用此命令查看所有ARP 条目，包括动态的和静态的。

**语法**：

```
show ip arp ( ( vrf VRF-NAME | ) interface INTERFACE-NAME | )
```

| 参数 | 说明 |
| --- | --- |
| vrf VRF-NAME\| | 如果指定了此项，则查看此 VRF 内的ARP cache；如果没有指定此项，则查看公网内学习的ARP 表项不超过31 个字符的字符串 |
| INTERFACE-NAME | 如果指定了此项，则查看此端口的ARP cache；如果没有指定此项，则查看所有端口学习的ARP 表项 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

显示所有的ARP 表项信息。

**示例**：

```
下面的例子描述了如何查看公网内所有的ARP 表项信息:
Switch# show ip arp
 Protocol    Address          Age (min)  Hardware Addr   Interface
 Internet    1.1.1.1                 -   7cb5.0157.0c00  eth-0-1
 Internet    2.2.2.1                 -   7cb5.0157.0c00  eth-0-2
 Internet    3.3.3.1                 -   7cb5.0157.0c00  eth-0-3
 Internet    10.0.20.1               -   7cb5.0157.0c00  eth-0-10
 Internet    10.0.20。254             -   0000.5e00.0101  eth-0-10
```

**相关命令**：clear ip arp

### 4.1.12 `show ip arp summary`

**功能**：使用此命令查看ARP 表项的统计信息。

**语法**：

```
show ip arp ( vrf VRF-NAME | ) summary
```

| 参数 | 说明 |
| --- | --- |
| vrf VRF-NAME | VRF 名称；如果指定了此项，则表示查看此VRF 内的ARP 表项统计信息；否则查看公网内的ARP 表项统计信息不超过31 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

显示ARP 表项的统计信息。

**示例**：

```
下面的例子描述了如何查看公网内ARP 表项的统计信息:
Switch# show ip arp summary
 Gratuitous ARP learning is disabled
 2 IP ARP entries, with 0 of them incomplete
 (Static:1,  Dyamic:0, Interface:1)
 ARP Pkt Received is: 0
 ARP Pkt Send number is: 1
 ARP Pkt Dicard number is: 0
```

**相关命令**：clear ip arp statistics

### 4.1.13 `debug arp`

**功能**：使用此命令打开ARP 的调试开关，使用该命令的no 形式关掉ARP 调试。

**语法**：

```
debug arp ( vrf VRF-NAME | )
```

| 参数 | 说明 |
| --- | --- |
| vrf VRF-NAME | VRF 名称；如果指定了此项，则表示只打开此VRF 内的ARP 调试开关；否则打开公网内的ARP 调试开关不超过31 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

打开ARP 的调试开关，用户可以看到ARP 报文的接收和发送信息，以及ARP 表项的创
  建，更新和删除过程。

**示例**：

```
下面的例子描述了如何打开ARP 调试开关:
Switch# debug arp
 Sep  7 03:34:08 SWITCH ARP-7: IP ARP: creating entry for IP address: 7.7.7.7, hw:
e64d。0445。df00
Sep  7 03:34:08 SWITCH ARP-7: IP ARP: send req src 7.7.7.7 e64d。0445。df00, dst
7.7.7.7 eth-0-1
```

**相关命令**：show debugging arp

### 4.1.14 `show debugging arp`

**功能**：使用此命令查看ARP 调试开关是否打开。

**语法**：

```
show debugging arp ( vrf VRF-NAME | )
```

| 参数 | 说明 |
| --- | --- |
| vrf VRF-NAME | VRF 名称；如果指定了此项，则表示只打开此VRF 内的ARP 调试开关；否则打开公网内的ARP 调试开关不超过31 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

显示ARP 调试开关是否打开。

**示例**：

```
下面的例子描述了如何查看公网内ARP 调试开关是否打开:
Switch# show debugging arp
 ARP debugging status:
  ARP packet debugging is on
```

**相关命令**：debug arp

### 4.1.15 `proxy-arp enable`

**功能**：使用proxy-arp enable 命令用来开启代理ARP 功能。
  
  使用该命令的no 形式来关闭代理ARP 功能。

**语法**：

```
proxy-arp enable
```

**命令模式**：端口配置模式

**默认配置**：缺省情况下，关闭ARP 代理功能。

**使用说明**：

当ARP 代理功能没有启用的时候，设备只会回复那些目的IP 是设备自己的ARP 请求
  报文。

**示例**：

```
下面的例子显示了如何在端口eth-0-1 上使能代理功能:
Switch# configure terminal
Switch(config)#interface eth-0-1
Switch(config-if)#no switchport
Switch(config-if)#no shutdown
Switch(config-if)#ip address 1.1.1.1/24
Switch(config-if)# proxy-arp enable
```

**相关命令**：local-proxy-arp enable

### 4.1.16 `local-proxy-arp enable`

**功能**：本地ARP 代理功能使得3 层设备可以回复那些目的IP 和接收端口是同一个子网的ARP
  请求报文，无需通过路由。
  使用local-proxy-arp enable 命令使能本地ARP 代理功能，使用该命令的no 形式关闭
  本地ARP 代理功能。

**语法**：

```
local-proxy-arp enable
no local-proxy-arp enable
```

**命令模式**：端口配置模式

**默认配置**：缺省情况下，本地ARP 代理功能不使能。

**使用说明**：

本地ARP 代理最常见的应用场景是交换机或其下挂的交换机开启了二层端口隔离功能。
  使能本地ARP 代理功能的时候，ICMP 重定向功能被自动关闭。

**示例**：

```
下面的例子显示了如何在端口eth-0-1 上使能本地ARP 代理功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# no shutdown
Switch(config-if)# ip address 1.1.1.1/24
Switch(config-if)# local-proxy-arp enable
```

**相关命令**：proxy-arp enable

### 4.1.17 `gratuitous-arp-learning enable`

**功能**：使用命令gratuitous-arp-learning enable 来使能设备的免费ARP 学习功能，使用该命
  令的no 形式关闭免费ARP 学习功能。

**语法**：

```
gratuitous-arp-learning enable
no gratuitous-arp-learning enable
```

**命令模式**：全局配置模式

**默认配置**：缺省情况下，关闭设备的免费ARP 学习功能

**使用说明**：

无

**示例**：

```
下面的例子显示了如何使能端口eth-0-1 上的免费ARP 学习功能:
Switch# configure terminal
Switch(config)# gratuitous-arp-learning enable
```

**相关命令**：show ip arp summary

### 4.1.18 `gratuitous-arp send interval`

**功能**：使用该命令去配置gratuitous arp 发送的间隔时间，使用该命令的no 形式去恢复默认
  值

**语法**：

```
arp gratuitous-arp send interval SECONDS
no arp gratuitous-arp send interval
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | gratuitous arp 发送的间隔时间 1-86400 秒 |

**命令模式**：端口配置模式

**默认配置**：60 秒

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置端口eth-0-1 发送免费ARP 的间隔时间:

Switch# configure terminal
Switch(config)#interface eth-0-1
Switch(config-if)#no switchport
Switch(config-if)#no shutdown
Switch(config-if)#ip address 1.1.1.1/24
Switch(config-if)#arp gratuitous-arp send interval 80
```

**相关命令**：arp gratuitous-arp send enable

### 4.1.19 `gratuitous-arp send enable`

**功能**：使用该命令去使能接口发送gratuitous arp

**语法**：

```
arp gratuitous-arp send enable
no arp gratuitous-arp send enable
```

**命令模式**：端口配置模式

**默认配置**：不使能

**使用说明**：

无

**示例**：

```
下面的例子显示了如何使能eth-0-1 发送免费ARP:
Switch# configure terminal
Switch(config)#interface eth-0-1
Switch(config-if)#no switchport
Switch(config-if)#no shutdown
Switch(config-if)#ip address 1.1.1.1/24
Switch(config-if)#arp gratuitous-arp send enable
```

**相关命令**：arp gratuitous-arp send interval、、4.2 DHCP Client 命令


## 4.2 DHCP Client 命令

### 4.2.1 `ip address dhcp`

**功能**：使用此命令通过DHCP 获得ip 地址。
  使用此命令的no 格式删除获得的ip 地址，并取消DHCP client 功能。

**语法**：

```
ip address dhcp
no ip address dhcp
```

**命令模式**：端口配置模式

**默认配置**：没有启用DHCP client。

**使用说明**：

此命令在接口上启用DHCP client 功能；如果接口处于打开状态， 则立即开始通过
  DHCP 获得ip 地址。否则该接口的DHCP client 功能处于挂起状态，在接口打开后，开
  始启用DHCP client；使用此命令的no 格式，会释放获得的ip 地址，并发送DHCP
  RELEASE 消息。

**示例**：

```
使用DHCP 获得ip 地址:
Switch# configure terminal
Switch(config-if)# ip address dhcp
取消DHCP client 功能，并释放通过DHCP 获得的ip 地址:
Switch# configure terminal
Switch(config-if)# no ip address dhcp
```

**相关命令**：dhcp client request、dhcp client client-id、dhcp client class-id、、dhcp client lease、dhcp client hostname、management ip address dhcp、show dhcp client

### 4.2.2 `management ip address dhcp`

**功能**：使用此命令在管理口上通过DHCP 获得ip 地址。
  使用此命令的no 格式删除获得的ip 地址，并取消DHCP client 功能。

**语法**：

```
management ip address dhcp
no management ip address dhcp
```

**命令模式**：全局配置模式

**默认配置**：没有在管理口启用DHCP client。

**使用说明**：

此命令在管理口上启用DHCP client 功能；使用此命令的no 格式，会释放获得的ip 地
  址，并发送DHCP RELEASE 消息。

**示例**：

```
使用DHCP 为管理口获得ip 地址:
Switch# configure terminal
Switch(config)# management ip address dhcp
取消管理口DHCP client 功能，并释放通过DHCP 获得的ip 地址:
Switch# configure terminal
Switch(config)# no management ip address dhcp
```

**相关命令**：show dhcp client

### 4.2.3 `dhcp client request`

**功能**：使用此命令设置client 通过DHCP 获得指定的配置参数。使用此命令的no 格式取消请
  求的参数。

**语法**：

```
dhcp client request ( router | static-route | classless-static-route | classless-static-route-
ms | tftp-server-address | dns-nameserver | domain-name | netbios-nameserver |
vendor-specific )
no dhcp client request ( router | static-route | classless-static-route | classless-static-
route-ms | tftp-server-address | dns-nameserver | domain-name | netbios-nameserver
| vendor-specific )
```

| 参数 | 说明 |
| --- | --- |
| router | 默认路由器选项 (3) |
| static-route | 静态路由选项 (33) |
| classless-static-route | 无类静态路由选项(121) |
| classless-static-route-ms | 无类静态路由选项 (249) |
| tftp-server-address | TFTP 服务器ip 地址选项 (150) |
| dns-nameserver | DNS 服务器选项 (6) |
| domain-name | 域名选项 (15) |
| netbios-nameserver | Netbios 服务器选项 (44) |
| vendor-specific | 配置选项 (43) |

**命令模式**：端口配置模式

**默认配置**：router，static-route，classless-static-route，classless-static-route-ms，tftp-server- address 为默认请求。

**使用说明**：

此命令向DHCP server 请求指定的配置参数，可以分多次指定所需要的参数，也可以
  一次指定所有需要的参数。此命令需要在ip address dhcp 之前执行，否则只有在下一
  条ip address dhcp 命令后才会生效。选项33,121,249 之间存在优先级关系：选项121
  优先于选项33 和选项249，选项249 优先于选项33。

**示例**：

```
取消DHCP client 功能，并释放通过DHCP 获得的ip 地址。:
Switch# configure terminal
Switch(config-if)# no management ip address dhcp
指定请求默认路由器:
Switch# configure terminal
Switch(config-if)# dhcp client request router
取消默认路由器请求:
Switch# configure terminal
Switch(config-if)# no dhcp client request router
指定请求TFTP 服务器ip 地址和静态路由:
Switch# configure terminal
Switch(config-if)# dhcp client request static-route tftp-server-address
```

**相关命令**：ip address dhcp

### 4.2.4 `dhcp client client-id`

**功能**：使用此命令设置DHCP client ID, 作为DHCP client 的标记。
  使用此命令的no 格式删除设置的client ID，并使用默认的client ID。

**语法**：

```
dhcp client client-id ( ascii WORD | hex HEX-STRING | IFVLAN | IFAGG | IFPHYSICAL )
no dhcp client client-id
```

| 参数 | 说明 |
| --- | --- |
| ascii | ascii 格式 |
| WORD | ascii 字符串长度不超过64 个字符 |
| hex | 十六进制格式 |
| HEX-STRING | 十六进制字符串长度不超过64 个字符 |
| IFVLAN | vlan 接口名称 1-4094 |
| IFAGG | agg 接口名称 |
| IFPHYSICAL | 物理接口名称 |

**命令模式**：端口配置模式

**默认配置**：缺省采用格式“Switch-HWADDR-IFNAME”。

**使用说明**：

此命令需要在ip address dhcp 之前执行，否则只有在下一条ip address dhcp 命令后才
  会生效。

**示例**：

```
设置DHCP client ID 为 switch-client:
Switch# configure terminal
Switch(config-if)# dhcp client client-id ascii switch-client
删除设置的DHCP client ID:
Switch# configure terminal
Switch(config-if)# no dhcp client client-id
```

**相关命令**：ip address dhcp

### 4.2.5 `dhcp client class-id`

**功能**：使用此命令设置DHCP client 的 class-id。
  使用此命令的no 格式删除设置的class-id。

**语法**：

```
dhcp client class-id ( WORD | hex HEX-STRING )

no dhcp client class-id
```

| 参数 | 说明 |
| --- | --- |
| WORD | ascii 字符串 |
| hex | 十六进制 |
| HEX-STRING | 十六进制字符串 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

DHCP client 使用class-id 标记自己需要的配置参数类型。此命令需要在ip address dhcp 之前执行，否则只有在下一条 ip address dhcp 命令后才会生效。

**示例**：

```
指定DHCP client 的class-id:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# dhcp client class-id acsii switch
删除指定的class-id:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no dhcp client class-id
```

**相关命令**：ip address dhcp

### 4.2.6 `dhcp client lease`

**功能**：使用此命令设置DHCP client 期望获得的租期。
  使用此命令的no 格式取消设置的期望租期。

**语法**：

```
dhcp client lease DAYS ( HOURS ( MINUTES | ) | ) | infinite )
no dhcp client lease
```

| 参数 | 说明 |
| --- | --- |
| DAYS | 租期时间，单位为天 0-365 |
| HOURS | 租期时间，单位为小时 0-23 |
| MINUTES | 租期时间，单位为分 0-59 |
| infinite | 租期时间为永久 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

设置DHCP client 期望获得的租期，DHCP server 可以接受该租期，也可以忽略client
  的请求，分配自己设置的租期。此命令需要在ip address dhcp 之前执行，否则只有在
  下一条ip address dhcp 命令后才会生效。

**示例**：

```
设置DHCP client 期望租期为20 分钟:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# dhcp client lease 0 0 20
删除设置的期望租期:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no dhcp client lease
```

**相关命令**：ip address dhcp

### 4.2.7 `dhcp client hostname`

**功能**：使用此命令设置在DHCP 报文中使用的主机名称。
  使用此命令的no 格式取消设置的主机名称。

**语法**：

```
dhcp client hostname WORD
no dhcp client hostname
```

| 参数 | 说明 |
| --- | --- |
| WORD | 主机名称不超过256 个字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：默认使用系统主机名称。

**使用说明**：

此命令设置DHCP 报文中的主机名称。此命令需要在ip address dhcp 之前执行，否则
  只有在下一条ip address dhcp 命令后才会生效。

**示例**：

```
设置DHCP 报文中主机名称为switch:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# dhcp client hostname switch
删除设置的主机名称:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no dhcp client hostname
```

**相关命令**：ip address dhcp

### 4.2.8 `dhcp client default-router distance`

**功能**：使用此命令为从DHCP server 获得的路由设置默认的路由器的距离。
  使用此命令的no 格式删除设置的默认路由器距离。

**语法**：

```
dhcp client default-router distance METRIC
no dhcp client default-router distance
```

| 参数 | 说明 |
| --- | --- |
| METRIC | 默认的路由器距离 1-255 |

**命令模式**：全局配置模式

**默认配置**：DHCP server 获得的路由的路由器距离将被设置为默认值254。

**使用说明**：

无

**示例**：

```
设置默认路由器距离为233:
Switch# configure terminal
Switch(config)# dhcp client default-router distance 233
删除设置的默认路由器距离:
Switch# configure terminal
Switch(config)# no dhcp client default-router distance
```

**相关命令**：ip address dhcp

### 4.2.9 `dhcp client broadcast-flag`

**功能**：使用此命令在DHCP 消息中设置broadcast flag。
  使用此命令的no 格式删除broadcast flag。

**语法**：

```
dhcp client broadcast-flag
no dhcp client broadcast-flag
```

**命令模式**：全局配置模式

**默认配置**：默认在请求IP 地址阶段的DHCP 消息中设置该标记。

**使用说明**：

Broadcast flag 表示DHCP client 在获得IP 地址前不能接受单播IP 报文，所以如果设置
  broadcast flag，则DHCP 服务器或 DHCP relay agent 将会广播DHCP 消息到client 所
  在的子网。

**示例**：

```
设置broadcast flag:
Switch# configure terminal
Switch(config)# dhcp client broadcast-flag
删除broadcast flag:
Switch# configure terminal
Switch(config)# no dhcp client broadcast-flag
```

**相关命令**：ip address dhcp

### 4.2.10 `debug dhcp client`

**功能**：使用此命令可以打开dhcp client 的模块的调试功能。
  
  使用此命令的no 格式关闭调试功能。

**语法**：

```
debug dhcp client ( events | error | dump | packet | all )
no debug dhcp client ( events | error | dump | packet | all )
```

| 参数 | 说明 |
| --- | --- |
| events | 调试dhcp client 事件信息 |
| error | 调试dhcp client 错误信息 |
| packet | 调试dhcp client 的数据包信息 |
| dump | 以十六进制调试dhcp client 的数据包信息 |
| all | 上面提到的所有调试信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用“terminal monitor”打印消息

**示例**：

```
使用如下命令，打开dhcp client 的所有调试信息:
Switch# debug dhcp client all
```

**相关命令**：terminal monitor、show logging buffer

### 4.2.11 `show dhcp client`

**功能**：此命令显示DHCP client 的工作状态。

**语法**：

```
show dhcp client ( management | IFVLAN | IFAGG | IFPHYSICAL | ) ( verbose | )
```

| 参数 | 说明 |
| --- | --- |
| management | 显示管理口的DHCP client 工作状态 |
| IFVLAN | vlan 接口名称 1-4094 |
| IFAGG | agg 接口名称 |
| IFPHYSICAL | 物理接口名称 |
| verbose | 详细信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用此命令查看一个或多个接口上DHCP client 的工作状态，添加verbose 查看详细信
  息。

**示例**：

```
查看所有接口上DHCP client 工作状态:
Switch# show dhcp client verbose
DHCP client informations:
============================================================
vlan1 DHCP client information:
  Current state: SELECT
  Transaction ID: 0x3ac1c1c7
============================================================
eth-0-1 DHCP client information:
  Current state: SELECT
  Transaction ID: 0x2fd3f55b
```

**相关命令**：ip address dhcp

### 4.2.12 `show dhcp client statistics`

**功能**：使用此命令查看DHCP client 统计信息。

**语法**：

```
show dhcp client statistics
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

此命令显示DHCP 消息的统计信息。

**示例**：

```
查看DHCP 消息统计信息:
Switch# show dhcp client statistics
DHCP client packet statistics:
============================================================
DHCP OFFERS    received: 0
DHCP ACKs      received: 0
DHCP NAKs      received: 0
DHCP Others    received: 0
DHCP DISCOVER      sent: 0
DHCP DECLINE       sent: 0
DHCP RELEASE       sent: 0
DHCP REQUEST       sent: 0
DHCP packet send failed: 0
```

**相关命令**：ip address dhcp

### 4.2.13 `clear dhcp client statistics`

**功能**：使用此命令清除DHCP client 计数器。

**语法**：

```
clear dhcp client statistics
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

此命令将DHCP client 消息计数器清零。

**示例**：

```
将DHCP client 消息计数器清零。:
Switch# clear dhcp client statistics
```

**相关命令**：ip address dhcp、show dhcp client statistics、4.3 DHCP Relay 命令


## 4.3 DHCP Relay 命令

### 4.3.1 `dhcp relay`

**功能**：在全局配置模式下，使用dhcp relay 命令来启用DHCP relay 服务。
  使用此命令的no 格式关闭该项功能。

**语法**：

```
dhcp relay
no dhcp relay
```

**命令模式**：全局配置模式

**默认配置**：默认情况下此功能未打开。

**使用说明**：

在启用DHCP relay 服务前，必需先使用dhcp service 命令使能DHCP 功能，DHCP
  relay 功能要在系统使能DHCP 功能后才生效。

**示例**：

```
启用dhcp relay 服务:
Switch# configure terminal
Switch(config)# dhcp relay
```

**相关命令**：service dhcp

### 4.3.2 `dhcp-server (global)`

**功能**：在全局模式下使用dhcp-server 命令创建DHCP 服务器组。
  使用此命令的no 格式，删除一个DHCP 服务器组。

**语法**：

```
dhcp-server NUMBER SERVER-LIST
no dhcp-server NUMBER ( SERVER-LIST | )
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | DHCP 服务器组的序号 1-16 |
| SERVER-LIST | 加入服务器组中的DHCP 服务器的IP 地址列表。 1-16 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

此命令用来创建远端DHCP 服务器组。

**示例**：

```
配置全局的DHCP 服务器:
Switch# configure terminal
Switch(config)# dhcp-server 1 1.1.1.1 2.2.2.2 3.3.3.3
```

**相关命令**：service dhcp、dhcp-server (interface)

### 4.3.3 `dhcp-server (interface)`

**功能**：在接口模式下，使用dhcp-server 命令将一个接口添加到一个DHCP 服务器组中去。
  使用此命令的no 格式，将这个接口从DHCP 服务器组中删除。

**语法**：

```
dhcp-server NUMBER
no dhcp-server
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | DHCP 服务器组的序号 1-16 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

此命令用来将一个接口添加到一个DHCP 服务器组中去。

**示例**：

```
将接口加入DHCP 服务器组:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# dhcp-server 1
```

**相关命令**：service dhcp

### 4.3.4 `dhcp relay information check`

**功能**：在全局模式下，使用dhcp relay information check 命令配置DHCP 服务器对转发的
  BOOTREPLY 消息进行中继代理信息验证。
  使用此命令的no 格式取消中继代理信息的验证。

**语法**：

```
dhcp relay information check
no dhcp relay information check
```

**命令模式**：全局配置模式

**默认配置**：DHCP 服务器对转发的BOOTREPLY 消息检查中继信息。无效的信息会被丢弃。

**使用说明**：

无

**示例**：

```
配置DHCP 服务器对转发的BOOTREPLY 消息进行中继代理信息验证:
Switch# configure terminal
Switch(config)# dhcp relay information check
```

**相关命令**：dhcp relay information option

### 4.3.5 `dhcp relay information option`

**功能**：在全局模式下，使用dhcp relay information option 命令，使能系统转发
  BOOTREQUEST 消息到DHCP 服务器时，插入Option82 选项功能。使用此命令的no
  格式关闭该项功能。

**语法**：

```
dhcp relay information option
no dhcp relay information option
```

**命令模式**：全局配置模式

**默认配置**：默认情况下，不对DHCP 报文插入Option82 选项。

**使用说明**：

该命令使能DHCP 服务器检测用户发送的请求，在Option82 选项中添加适当的内容。
  默认情况下，系统不对DHCP 报文插入Option82 选项。
  dhcp relay information option 命令会在报文中加入电路ID 和远端ID。

**示例**：

```
使能系统对DHCP 报文插入Option82 选项:
Switch# configure terminal
Switch(config)# dhcp relay information option
```

**相关命令**：dhcp relay information check、、dhcp relay information policy

### 4.3.6 `dhcp relay information policy`

**功能**：在全局模式下，使用dhcp relay information policy 命令配置DHCP 报文Option82 选项
  转发策略。
  使用此命令的no 格式设置为默认的转发策略。

**语法**：

```
dhcp relay information policy ( drop | keep | replace )
no dhcp relay information policy
```

| 参数 | 说明 |
| --- | --- |
| drop | 带Option82 选项的报文直接丢弃 |
| keep | 带Option82 选项的报文原样转发 |
| replace | 替换原报文中的Option 82 选项，然后进行转发 |

**命令模式**：全局配置模式

**默认配置**：默认情况下，替换原报文中的Option 82 选项，然后进行转发。

**使用说明**：

该条命令用于电缆接入路由器终端系统。一个DHCP 中继代理可能收到从另一个
  DHCP 中继代理处发送的含有Option82 信息的DHCP 报文。默认情况下，使用当前
  relay 的Option82 替换原报文中的Option82 选项，然后进行转发。

**示例**：

```
设置带Option82 选项的报文直接丢弃:
Switch# configure terminal
Switch(config)# dhcp relay information policy drop
```

**相关命令**：dhcp relay information option、dhcp relay information policy

### 4.3.7 `dhcp relay information policy (interface)`

**功能**：在接口模式下，使用dhcp relay information policy 命令配置DHCP 报文Option82 选项
  转发策略。
  使用此命令的no 格式取消配置。

**语法**：

```
dhcp relay information policy ( drop | keep | replace )
no dhcp relay information policy
```

| 参数 | 说明 |
| --- | --- |
| drop | 带Option82 选项的报文直接丢弃 |
| keep | 带Option82 选项的报文原样转发 |
| replace | 替换原报文中的Option 82 选项，然后进行转发 |

**命令模式**：端口配置模式

**默认配置**：接口没有配置Option 82 策略。

**使用说明**：

接口配置Option 82 策略后，使用接口策略处理报文中的Option82 内容。如果接口没
  有配置，则按照全局策略处理。

**示例**：

```
设置带Option82 选项的报文直接丢弃:

Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# dhcp relay information policy drop
```

**相关命令**：dhcp relay information option

### 4.3.8 `dhcp relay information trust-all`

**功能**：在全局模式下，使用dhcp relay information trust-all 命令配置路由器上所有接口为
  DHCP 中继代理信息选项的信任源接口。使用此命令的no 格式将接口设置为默认配置。

**语法**：

```
dhcp relay information trust-all
no dhcp relay information trust-all
```

**命令模式**：全局配置模式

**默认配置**：默认情况下，交换机上的所有接口都为不信任中继代理信息。

**使用说明**：

默认情况下，如果在DHCP 报文中的网关地址被设置为0.0.0.0 并且该报文中已经包含
  Option82 选项，DHCP 中继代理会丢弃该报文。如果在全局配置了dhcp relay
  information trust-all 命令，即使DHCP 报文的网关地址被设置为全0，DHCP 中继代理
  也不会丢弃该DHCP 报文。取而代之，收到的DHCP DISCOVER 或者DHCP REQUEST
  报文会按照普通的DHCP 中继操作被转发到命令dhcp-server 所配置的地址。

**示例**：

```
配置所有接口为DHCP 中继代理信息选项的信任源接口:
Switch# configure terminal
Switch(config)# dhcp relay information trust-all
```

**相关命令**：dhcp relay information trusted

### 4.3.9 `dhcp relay information trusted`

**功能**：在接口模式下，使用命令配置某接口为DHCP 中继代理信息选项的信任源接口。使用
  此命令的no 格式将接口设置为默认配置。

**语法**：

```
dhcp relay information trusted
no dhcp relay information trusted
```

**命令模式**：端口配置模式

**默认配置**：默认情况下，所有接口都为不信任中继代理信息。

**使用说明**：

默认情况下，如果在DHCP 报文中的网关地址被设置为0.0.0.0 并且该报文中已经包含
  Option82 选项，DHCP 中继代理会丢弃该报文。如果在全局配置了dhcp relay
  information trust-all 命令，即使DHCP 报文的网关地址被设置为全0，DHCP 中继代理
  也不会丢弃该DHCP 报文。取而代之，收到的DHCP DISCOVER 或者DHCP REQUEST
  报文会按照普通的DHCP 中继操作被转发到命令dhcp-server 所配置的地址。

**示例**：

```
配置某接口为DHCP 中继代理信息选项的信任源接口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# dhcp relay information trusted
```

**相关命令**：dhcp relay information trust-all

### 4.3.10 `dhcp relay gateway`

**功能**：在接口模式下，使用命令配置DHCP 报文中的中继地址字段。
  使用此命令的no 格式将接口设置为默认配置。

**语法**：

```
dhcp relay gateway A.B.C.D
no dhcp relay gateway
```

**命令模式**：端口配置模式

**默认配置**：DHCP 报文中携带默认中继地址。

**使用说明**：

无

**示例**：

```
配置DHCP 报文中的中继地址为10.10.10.1:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# dhcp relay gateway 10.10.10.1
```

**相关命令**：dhcp-server (interface)

### 4.3.11 `dhcp relay address cycle`

**功能**：dhcp relay address cycle 命令用来使能DHCP 中继的轮询功能。
  no dhcp relay address cycle 命令用来去使能DHCP 中继的轮询功能。

**语法**：

```
dhcp relay address cycle
no dhcp relay address cycle
```

**命令模式**：全局配置模式

**默认配置**：DHCP 报文中继轮询功能默认不使能。

**使用说明**：

此命令应用于DHCP 中继。当DHCP 中继上配置多个DHCP 服务器的IP 地址时，
  DHCP 中继默认向所有的服务器转发DHCP DISCOVER 报文，这样会造成服务器处理报
  文过多，给服务器带来压力。为解决此问题，可以配置此命令，使 DHCP 中继收到
  DHCP DISCOVER 报文后，每次只向一个服务器转发，并且每收到一次DHCP
  DISCOVER 报文切换一个服务器，使多个服务器分配出去的IP 地址数量持平，达到
  DHCP 服务器之间负载均衡的效果。

**示例**：

```
使能DHCP 报文中继轮询功能:
Switch# configure terminal
Switch(config)# dhcp relay address cycle
```

**相关命令**：无

### 4.3.12 `service dhcp`

**功能**：在全局模式下，使用命令service dhcp enable 使能DHCP snooping 和中继代理功能。
  使用service dhcp disabl 关闭DHCP snooping 和中继代理功能。

**语法**：

```
service dhcp enable
service dhcp disable
```

**命令模式**：全局配置模式

**默认配置**：DHCP 服务缺省处于去使能状态。

**使用说明**：

只有在用service dhcp 命令总开关使能了DHCP 服务，dhcp snooping，dhcp relay，
  dhcp server 等DHCP 功能才会生效。

**示例**：

```
配置全局使能DHCP 功能:
Switch# configure terminal
Switch(config)# service dhcp enable
配置全局关闭DHCP 功能:
Switch# configure terminal
Switch(config)# service dhcp disable
```

**相关命令**：dhcp relay、dhcp snooping

### 4.3.13 `debug dhcp relay`

**功能**：使用此命令可以打开dhcp relay 的模块的调试功能。
  在原命令之前加上关键字“no”，关闭调试功能。

**语法**：

```
debug dhcp relay ( events | error | dump | packet | all )
no debug dhcp relay ( events | error | dump | packet | all )
```

| 参数 | 说明 |
| --- | --- |
| events | 调试dhcp relay 事件信息 |
| error | 调试dhcp relay 错误信息 |
| packet | 调试dhcp relay 的数据包信息 |
| dump | 以十六进制调试dhcp relay 的数据包信息 |
| all | 上面提到的所有调试信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用“terminal monitor”打印消息

**示例**：

```
使用如下命令，打开dhcp relay 的所有调试信息。:
Switch# debug dhcp relay all
```

**相关命令**：terminal monitor、show logging buffer

### 4.3.14 `show dhcp-server`

**功能**：在特权模式下，使用show dhcp-server 命令查看DHCP 服务器组的配置信息。

**语法**：

```
show dhcp-server
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于显示全局模式下使用dhcp-server 命令配置的所有DHCP 服务器组。

**示例**：

```
在特权模式下使用 show dhcp-server 命令:
Switch# show dhcp-server
DHCP server group information:
============================================================
group 1 ip address list:
    [1] 1.1.1.1
    [2] 2.2.2.2
    [3] 3.3.3.3
    [4] 4.4.4.4
    [5] 5.5.5.5
    [6] 6.6.6.6
    [7] 7.7.7.7
    [8] 8.8.8.8
```

**相关命令**：dhcp-server (global)

### 4.3.15 `show dhcp relay interfaces`

**功能**：在特权模式下，使用show dhcp relay interfaces 命令显示DHCP 服务器组下的接口属
  性。

**语法**：

```
show dhcp relay interfaces
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于显示属于DHCP 中继的接口信息。

**示例**：

```
在特权模式下使用show dhcp relay interfaces 命令:
Switch# show dhcp relay interfaces
List of DHCP relay enabled interface(s):

DHCP relay service status: enabled
Interface Name          DHCP server group
============================================================
eth-0-1                   1
```

**相关命令**：show dhcp-server

### 4.3.16 `show dhcp relay information config`

**功能**：在特权模式下，使用show dhcp relay information config 命令显示DHCP 中继信息
  （Option82 选项）配置信息。

**语法**：

```
show dhcp relay information config
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于显示DHCP 中继的配置信息。

**示例**：

```
在特权模式下使用show dhcp relay information config 命令:
Switch# show dhcp relay information config
DHCP relay agent information configuration:
============================================================
no dhcp relay information option
dhcp relay information check
dhcp relay information policy keep
```

**相关命令**：dhcp relay information option

### 4.3.17 `show dhcp relay information trusted-sources`

**功能**：在特权模式下，使用show dhcp relay information trusted-sources 命令显示所有接口是
  否配置为DHCP 中继信息选项的信任源信息。

**语法**：

```
show dhcp relay information trusted-sources
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于显示所有接口被设置为DHCP 中继的信任源。

**示例**：

```
特权模式下使用show dhcp relay information trusted-sources 命令:
Switch# show dhcp relay information trusted-sources
List of trusted sources of relay agent information option:
============================================================
All interfaces are trusted source of relay agent information option
```

**相关命令**：dhcp relay information trusted

### 4.3.18 `show dhcp relay statistics`

**功能**：在特权模式下，使用show dhcp relay statistics 命令显示交换机中继的DHCP 报文统计
  信息。

**语法**：

```
show dhcp relay statistics
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于显示交换机处理的DHCP 统计的详情。

**示例**：

```
在特权模式下使用show dhcp relay statistics 命令:
Switch# show dhcp relay statistics
DHCP relay packet statistics:
============================================================
Client relayed packets:  101
Server relayed packets:  88
Client error packets:    0
Server error packets:    0
Bogus GIADDR drops:      15
Bad circuit ID packets:  0
Corrupted agent options: 0
Missing agent options:   0
Missing circuit IDs:     0
```

**相关命令**：clear dhcp relay statistics

### 4.3.19 `clear dhcp relay statistics`

**功能**：在特权模式下，使用clear dhcp relay statistics 命令清除交换机中继的DHCP 报文统计
  信息。

**语法**：

```
clear dhcp relay statistics
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于清除交换机处理的DHCP 统计的详情。

**示例**：

```
在特权模式下使用clear dhcp relay statistics 命令:
Switch# clear dhcp relay statistics
```

**相关命令**：show dhcp relay statistics、4.4 DHCP Server 命令


## 4.4 DHCP Server 命令

### 4.4.1 `service dhcp`

**功能**：service dhcp enable 命令用来使能DHCP snooping, server 或 relay 功能。
  service dhcp disable 命令用来关闭DHCP snooping, server 或 relay 功能。

**语法**：

```
service dhcp enable
service dhcp disable
```

**命令模式**：全局配置模式

**默认配置**：默认情况下DHCP 服务关闭。

**使用说明**：

只有在用service dhcp 命令总开关使能了DHCP 服务，dhcp snooping，dhcp relay 等
  DHCP 功能才会生效。

**示例**：

```
配置全局使能DHCP 功能:
Switch# configure terminal
Switch(config)# service dhcp enable
配置全局关闭DHCP 功能:
Switch# configure terminal
Switch(config)# service dhcp disable
```

**相关命令**：dhcp server、dhcp relay、dhcp snooping

### 4.4.2 `dhcp-server (global)`

**功能**：dhcp server 命令用来使能 DHCP server 功能。
  no dhcp server 命令用来关闭DHCP server 功能。

**语法**：

```
dhcp server
no dhcp server
```

**命令模式**：全局配置模式

**默认配置**：默认情况下DHCP server 处于关闭状态

**使用说明**：

在使能DHCP server 功能前，必需先使用dhcp service 命令使能DHCP 功能，DHCP
  server 功能要在系统使能DHCP 功能后才生效。

**示例**：

```
配置全局使能DHCP server 功能:

Switch# configure terminal
Switch(config)# dhcp server
```

**相关命令**：service dhcp、dhcp-server (interface)

### 4.4.3 `dhcp-server (interface)`

**功能**：dhcp server enable 命令用来在接口上启用DHCP server 功能。
  dhcp server disable 命令用来在接口上关闭DHCP server 功能。

**语法**：

```
dhcp server enable
dhcp server disable
```

| 参数 | 说明 |
| --- | --- |
| enable | 使能接口的DHCP server 功能 |
| disable | 去使能接口的DHCP server 功能 |

**命令模式**：端口配置模式

**默认配置**：默认情况下接口上的DHCP server 和DHCP relay 模式都处于关闭状态。

**使用说明**：

这个命令用来在三层端口上是能DHCP server 功能。

**示例**：

```
配置端口使能DHCP server 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# dhcp server enable
```

**相关命令**：service dhcp、dhcp server(global)

### 4.4.4 `dhcp ping packets`

**功能**：在全局模式下使用dhcp ping packets 命令配置在分配地址前需要发出ping 的包的个
  数。使用命令相关的no 形式恢复默认值。

**语法**：

```
dhcp ping packets NUMBER
no dhcp ping packets
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | 需要设置的ping 发出的包个数 0-10 |

**命令模式**：全局配置模式

**默认配置**：默认在ping 的时候发出1 个ICMP 消息。

**使用说明**：

DHCP server 在分配地址之前会ping 所要分配的地址。使用该命令指定ping 发出的包
  的个数，如果这些包都没有回应，则将地址分配给DHCP client， 否则不回应。

**示例**：

```
配置ping 发出的包的个数为10:
Switch# configure terminal
Switch(config)# dhcp ping packets 10
```

**相关命令**：service dhcp、dhcp ping timeout

### 4.4.5 `dhcp ping timeout`

**功能**：在全局模式下，使用dhcp ping timeout 命令配置ping 超时时间。使用命令相关的no
  形式恢复默认值。

**语法**：

```
dhcp ping timeout NUMBER
no dhcp ping timeout
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | 设置ping 超时的时间，单位秒（s）。 1-10 秒 |

**命令模式**：全局配置模式

**默认配置**：默认ping 的超时等待时间为1 秒。

**使用说明**：

DHCP server 在分配地址前会ping 该地址，并等待该命令指定的时间。如果在指定时
  间内没有回应，则认为该地址没有被使用。

**示例**：

```
配置dhcp ping 超时时间为3 秒:
Switch# configure terminal
Switch(config)# dhcp ping timeout 3
```

**相关命令**：service dhcp、dhcp ping packets

### 4.4.6 `dhcp pool`

**功能**：在全局模式下，使用dhcp pool 命令创建DHCP 地址池，并进入DHCP 地址池配置模
  式。
  使用命令相关的no 形式删除创建的DHCP 地址池。

**语法**：

```
dhcp pool WORD
no dhcp pool WORD
```

| 参数 | 说明 |
| --- | --- |
| WORD | DHCP 地址池名称 1) 名称长度范围 [1, 32) 2) 名称合法的字符 [0-9a- |
| zA-Z.-_] | 3) 名称必须以字母开头， 字母或数字结束 |

**命令模式**：全局配置模式

**默认配置**：默认系统中没有DHCP 地址池。

**使用说明**：

命令执行中，系统会从全局模式进入DHCP 地址池配置模式，显示 " (config-dhcp)# "。
  在DHCP 地址池配置模式下，可以配置地址池的参数，例如，可分配的子网地址段，
  默认网关等。

**示例**：

```
创建DHCP 地址池pool1:
Switch# configure terminal
Switch(config)# dhcp pool pool1
```

**相关命令**：service dhcp、dhcp select、、static-bind、dhcp excluded-address、network (DHCP)

### 4.4.7 `static-bind`

**功能**：在DHCP 地址池配置模式下，使用static-bind 命令配置静态绑定的地址。使用此命令
  的no 格式，删除该地址的静态绑定。

**语法**：

```
static-bind ip-address IP_ADDR/IP_MASK_LEN ( mac-address MAC_ADDR | client-
identifier ( ascii WORD | hex HEX_STRING ) )
static-bind ip-address IP_ADDR IP_ADDR_MASK ( mac-address MAC_ADDR | client-
identifier ( ascii WORD | hex HEX_STRING ) )
no static-bind
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | ip 地址 IPv4 地址 |
| IP_ADDR_MASK | 掩码 IPv4 地址 |
| IP_MASK_LEN | 掩码位数 1-32 mac-address MAC_ADDR DHCP client 的mac 地址 MAC 地址 |
| ascii WORD | ascii 形式的client id 长度不超过63 个字符 |
| hex HEX_STRING | hex string 形式的client id 长度不超过126 个字符 |

**命令模式**：DHCP 地址池配置模式

**默认配置**：默认DHCP 地址池中没有静态绑定的地址。

**使用说明**：

该命令会使当前DHCP 地址池成为静态地址池。每个静态地址池中，只能配置一条静
  态绑定地址。

**示例**：

```
配置静态绑定的地址:
Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)# static-bind ip 10.10.10.10/24 mac-address 0012.2222.2222
```

**相关命令**：dhcp pool

### 4.4.8 `dns-server address`

**功能**：在DHCP 地址池配置模式下，使用dns-server 命令配置DNS 服务器IP 地址。使用此
  命令的no 格式删除配置的服务器地址。

**语法**：

```
dns-server A.B.C.D ( A.B.C.D… A.B.C.D )
no dns-server
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | DNS 服务器IP 地址（至少配置一个） IPv4 地址 A.B.C.D… A.B.C.D (Optional) 最多配置8 个地址 IPv4 地址 |

**命令模式**：DHCP 地址池配置模式

**默认配置**：默认DHCP 地址池没有配置DNS 服务器地址。

**使用说明**：

最多可以配置8 个DNS 服务器地址。

**示例**：

```
配置DNS 服务器地址:

Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)#  dns-server 1.1.1.1 2.2.2.2
```

**相关命令**：dhcp pool

### 4.4.9 `domain-name`

**功能**：在DHCP 地址池配置模式下，使用domain-name 命令配置域名。使用此命令的no 格
  式删除配置的域名。

**语法**：

```
domain-name WORD
no domain-name
```

| 参数 | 说明 |
| --- | --- |
| WORD | DHCP 客户端使用的域名前缀。 1) 名称长度范围 [1, 64) 2) 名称合法的字符 [0-9a- |
| zA-Z.-_], | DHCP 客户端使用的域名前缀。 1) 名称长度范围 [1, 64) 2) 名称合法的字符 [0-9a- |
| zA-Z.-_], | 3) 名称必须以字母开头， 字母或数字结束 |

**命令模式**：DHCP 地址池配置模式

**默认配置**：默认DHCP 地址池没有配置域名。

**使用说明**：

通过设置域名前缀，DHCP 客户端只需要输入部分域名，系统会自动添加设置的域名
  前缀。

**示例**：

```
配置DHCP 地址池的域名:
Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)#  domain-name switch.org
```

**相关命令**：dhcp pool

### 4.4.10 `bootfile-name`

**功能**：在DHCP 地址池配置模式下，使用bootfile-name 命令配置DHCP 客户端需要的启动
  镜像文件名。使用此命令的no 格式删除配置的启动文件名。

**语法**：

```
bootfile-name WORD
no bootfile-name
```

| 参数 | 说明 |
| --- | --- |
| WORD | 配置的启动文件的文件名. 1) 名称长度范围[1, 64) 2) 名称合法的字符[0-9a- |
| zA-Z.-_], | 配置的启动文件的文件名. 1) 名称长度范围[1, 64) 2) 名称合法的字符[0-9a- |
| zA-Z.-_], | 3) 名称必须以字母开头， 字母或数字结束 |

**命令模式**：DHCP 地址池配置模式

**默认配置**：默认没有配置启动文件名。

**使用说明**：

通过配置地址池中的TFTP 服务器地址和启动文件名称，DHCP 客户端可以从TFTP 服
  务器请求启动文件，完成自动配置。

**示例**：

```
配置启动文件名称为dhclient_startup_config:
Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)# bootfile dhclient_startup_config
```

**相关命令**：dhcp pool、tftp-server-address

### 4.4.11 `tftp-server-address`

**功能**：在地址池配置模式下，使用命令tftp-server-address 配置TFTP 服务器地址。使用此命
  令的no 格式删除配置。

**语法**：

```
tftp-server-address A.B.C.D ( A.B.C.D… A.B.C.D )
no tftp-server-address
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | IP 地址 IPv4 地址 A.B.C.D… A.B.C.D (Optional) TFTP 服务器IP 地址列表 （最多可以设置8 个） IPv4 地址 |

**命令模式**：DHCP 地址池配置模式

**默认配置**：默认没有配置配置TFTP 服务器地址

**使用说明**：

最多可以设置8 个TFTP 服务器地址。列表中地址按照先后顺序使用。

**示例**：

```
配置TFTP 服务器地址为1.1.1.1,2.2.2.2:

Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)# tftp-server-address1.1.1.1 2.2.2.2
```

**相关命令**：dhcp pool、bootfile-name

### 4.4.12 `gateway address`

**功能**：在地址池配置模式下，使用命令gateway 配置默认网关。使用此命令的no 格式删除配
  置。

**语法**：

```
gateway A.B.C.D ( A.B.C.D… A.B.C.D )
no gateway
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | IP 地址 IPv4 地址 A.B.C.D… A.B.C.D (Optional) IP 地址列表（最多可以设置8 个） IPv4 地址 |

**命令模式**：DHCP 地址池配置模式

**默认配置**：默认没有配置默认网关

**使用说明**：

默认网关需要和地址池中的地址在同一子网内。.最多可以设置8 个默认网关地址。列
  表中地址按照先后顺序使用。

**示例**：

```
配置默认网关为1.1.1.1，2.2.2.2:
Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)# gateway 1.1.1.1 2.2.2.2
```

**相关命令**：dhcp pool

### 4.4.13 `netbios-name-server`

**功能**：在地址池配置模式下，使用命令netbios-name-server 配置netbios 域名服务器。使用
  此命令的no 格式删除配置。

**语法**：

```
netbios-name-server A.B.C.D ( A.B.C.D… A.B.C.D )
no netbios-name-server
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | IP 地址 IPv4 地址 A.B.C.D… A.B.C.D (Optional) IP 地址列表（最多可以设置8 个） IPv4 地址 |

**命令模式**：DHCP 地址池配置模式

**默认配置**：默认没有配置netbios 域名服务器

**使用说明**：

最多可以设置8 个netbios 域名服务器地址。列表中地址按照先后顺序使用。

**示例**：

```
配置netbios 域名服务器1.1.1.1 2.2.2.2:
Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)# netbios-name-server 1.1.1.1 2.2.2.2
```

**相关命令**：dhcp pool

### 4.4.14 `netbios-node-type`

**功能**：在地址池配置模式下，使用netbios-node-type 配置NetBIOS node type。使用此命令
  的no 格式删除配置。

**语法**：

```
netbios-node-type [ b-node | p-node | m-node | h-node ]
no netbios-node-type
```

| 参数 | 说明 |
| --- | --- |
| b-node | 广播 |
| p-node | 点到点 |
| m-node | 混合的 |
| h-node | 混合的（推荐使用） |

**命令模式**：DHCP 地址池配置模式

**默认配置**：默认没有配置NetBIOS 节点类型

**使用说明**：

使用该命令配置地址池中NetBIOS node type 参数。

**示例**：

```
配置NetBIOS node type 为h-node:
Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)# netbios-node-type h-node
```

**相关命令**：dhcp pool

### 4.4.15 `network`

**功能**：在地址池配置模式下，使用命令network 配置要分配的地址段。使用此命令的no 格式
  删除配置。

**语法**：

```
network [ ip-address wildcard-mask | ip-address/prefix-length ]
no network
```

| 参数 | 说明 |
| --- | --- |
| ip-address | IP 地址 IPv4 地址 |
| wildcard-mask | IP 地址掩码 IPv4 地址 |
| prefix-length | IP 掩码长度 0-32 |

**命令模式**：DHCP 地址池配置模式

**默认配置**：默认没有配置分配的地址段

**使用说明**：

该命令配置地址池中可分配的地址段。所有的主机地址都是可分配的，可以使用命令
  dhcp excluded-address 禁止分配其中的地址。 不同地址池的地址段不能有重叠，并且
  不能再配置静态绑定。

**示例**：

```
配置分配的地址段为1.1.1.0/24:
Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)# network 1.1.1.0/24
```

**相关命令**：dhcp pool

### 4.4.16 `lease`

**功能**：在地址池配置模式下，使用命令lease 配置地址池中分配的地址的租约时间。使用此命
  令的no 格式恢复默认配置。

**语法**：

```
lease DAYS ( HOURS ( MINUTES | ) | )
no lease
```

| 参数 | 说明 |
| --- | --- |
| DAYS | 设置租约时间的天数 0-365 天 HOURS (Optional) 设置租约时间的小时数。必须先指定天数以后才能配置小时数。 0-23 小时 MINUTES (Optional) 设置租约时间的分钟数数。 必须先指定天数和小时数以后才能配置分钟数。 0-59 分钟 |

**命令模式**：DHCP 地址池配置模式

**默认配置**：默认配置为1 天

**使用说明**：

无。

**示例**：

```
配置租约为2 天:
Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)# lease 2
配置租约为1 天2 小时:
Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)#  lease 1 2

配置租约为30 分钟:
Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)# lease 0 0 30
```

**相关命令**：dhcp pool

### 4.4.17 `option`

**功能**：在DHCP 地址池配置模式下，使用option 命令配置DHCP 选项。
  使用此命令的no 格式删除配置的DHCP 选项。

**语法**：

```
option { code [ ascii ascii-string | hex hex-string | ip-address ip-address ] }
no option [ code ]
```

| 参数 | 说明 |
| --- | --- |
| code | DHCP 选项代码,不支持 配置的选项列表如下：3, 6, 15, 44, 46, 50, 51, 52, 53, 54, 55, 57, 58, 59, 61, 67, 82 and 150。 2-254 |
| ascii-string | NVT ASCII 字符串长度不超过255 个字符 |
| hex-string | 十六进制字符串长度不超过254 个字符， 长度不是偶数时会在字符串的前面自动补0 |
| ip-address | IP 地址 IPv4 地址, 最多配置8 个IP 地址，每个IP 地址用空格分隔 |

**命令模式**：DHCP 地址池配置模式

**默认配置**：默认没有DHCP 选项被配置。

**使用说明**：

DHCP 提供一个TCP/IP 网络上的参数配置框架。不同的参数以DHCP 选项的形式存储。
  当前的DHCP 选项参考RFC 2131, Dynamic Host Configuration Protocol。
  已经有专门命令行的DHCP 选项以及DHCP server 无需支持的选项不支持用option 命
  令来配置，
  不支持配置的raw option 列表如下：3, 6, 15, 44, 46, 50, 51, 52, 53, 54, 55, 57, 58, 59, 61,
  67, 82 and 150。

**示例**：

```
配置代码为4 的DHCP 选项:
Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)# option 4 ip-address 10.10.10.10 11.11.11.11
```

**相关命令**：dhcp pool

### 4.4.18 `dhcp excluded-address`

**功能**：在全局模式下，使用dhcp excluded-address 命令配置禁止分配的地址段。使用此命令
  的no 格式删除配置的禁止分配地址。

**语法**：

```
dhcp excluded-address A.B.C.D [ A.B.C.D ]
no dhcp excluded-address A.B.C.D [ A.B.C.D ]
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D | 起始的IP 地址 IPv4 地址 A.B.C.D(Optional) (可选)结束的IP 地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：所有地址池中的地址都可以分配。

**使用说明**：

使用该命令选择地址池中禁止分配的地址。DHCP 服务器在分配地址时，会检查该地
  址是否被禁用。

**示例**：

```
配置禁止分配地址10.10.1.100 -10.10.1.199:
Switch# configure terminal
Switch(config)# dhcp pool test
Switch(config-dhcp)#  ip dhcp excluded-address 10.10.1.100 10.10.1.199
```

**相关命令**：dhcp pool

### 4.4.19 `show dhcp server conflict`

**功能**：在特权模式下，使用命令show dhcp server conflict 显示发现并记录的冲突地址。

**语法**：

```
show dhcp server conflict [ ip A.B.C.D | all ]
```

| 参数 | 说明 |
| --- | --- |
| ip A.B.C.D | IP 地址 IPv4 地址 |
| all | 所有地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

DHCP 服务器在分配地址之前，会检测地址是否已使用，并将冲突的地址记录下来。

**示例**：

```
显示冲突的地址:

Switch# show ip dhcp conflict all
```

**相关命令**：clear dhcp server conflict、dhcp ping packets、dhcp ping timeout

### 4.4.20 `show dhcp server binding`

**功能**：在特权模式下，使用命令show dhcp server binding 显示DHCP 服务器中绑定的地址信
  息。

**语法**：

```
show dhcp server binding [ ip A.B.C.D | pool WORD | all ]
```

| 参数 | 说明 |
| --- | --- |
| ip A.B.C.D | IP 地址 IPv4 地址 |
| pool WORD | 地址池名称长度不超过31 个字符的字符串 |
| all | 所有地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

绑定地址的信息包括IP 地址，MAC 地址，租约时间，地址类型。

**示例**：

```
显示DHCP 服务器绑定地址信息:
Switch# show ip dhcp binding 1.1.1.1
```

**相关命令**：clear dhcp server binding

### 4.4.21 `show dhcp server statistics`

**功能**：在特权模式下，使用命令show dhcp server statistics 显示DHCP 服务器统计。

**语法**：

```
show dhcp server statistics
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无。

**示例**：

```
显示DHCP 服务器统计:
Switch#show dhcp server statistics
DHCP server packet statistics:
============================================================
Message Received
BOOTREQUEST         12
DHCPDISCOVER    200
DHCPREQUEST         178
DHCPDECLINE         0
DHCPRELEASE         0
DHCPINFORM      0
Message Sent
BOOTREPLY       12
DHCPOFFER       190
DHCPACK             172
DHCPNAK             6
```

**相关命令**：clear dhcp server statistics

### 4.4.22 `show dhcp server config`

**功能**：在特权模式下，使用show dhcp server config 命令显示DHCP 服务器配置。

**语法**：

```
show dhcp server config
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

显示DHCP 服务器配置。

**示例**：

```
显示DHCP 服务器配置:
Switch# show dhcp server config
DHCP server configuration:
============================================================
Pool name: pool10
network 10.1.1.0 mask 255.255.255.0
gateway 10.1.1.1
```

**相关命令**：N/A

### 4.4.23 `clear dhcp server conflict`

**功能**：在特权模式下，使用clear dhcp server conflict 命令清除记录的冲突地址。

**语法**：

```
clear dhcp server conflict [ ip A.B.C.D | all ]
```

| 参数 | 说明 |
| --- | --- |
| ip A.B.C.D | IP 地址 IPv4 地址 |
| all | 所有地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
清除地址 1.1.1.99:
Switch# clear ip dhcp conflict 1.1.1.99
```

**相关命令**：show dhcp server conflict

### 4.4.24 `clear dhcp server binding`

**功能**：在特权模式下，使用clear dhcp server binding 从DHCP 服务器数据库中清除动态绑定
  的地址。

**语法**：

```
clear dhcp server binding [ ip A.B.C.D | pool WORD | all ]
```

| 参数 | 说明 |
| --- | --- |
| ip A.B.C.D | IP 地址 IPv4 地址 |
| pool WORD | 地址池名字长度不超过31 个字符的字符串 |
| all | 所有地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
清除地址绑定 1.1.1.99:
Switch# clear ip dhcp binding 1.1.1.99
```

**相关命令**：show dhcp server binding

### 4.4.25 `clear dhcp server statistics`

**功能**：在特权模式下，使用clear dhcp server statistics 命令清除DHCP 服务器统计信息。

**语法**：

```
clear dhcp server statistics
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
清除DHCP 服务器计数器:

Switch# clear dhcp server statistics
```

**相关命令**：clear dhcp server statistics

### 4.4.26 `show dhcp server pool`

**功能**：在特权模式下，使用show dhcp server pool 命令显示DHCP 服务器pool 资源使用情况
  统计信息。

**语法**：

```
show dhcp server pool ( WORD | )
```

| 参数 | 说明 |
| --- | --- |
| WORD | 地址池名字长度不超过31 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
显示pool 资源的使用情况:
Switch# show dhcp server pool pool1
 Pool                           : pool1
 Type                           : Dynamic
 Lease                          : 0 Days 0 Hours 5 Minutes
 Total addresses                : 254
 Leased addresses               : 1
 Excluded addresses             : 1
 Free addresses                 : 252
 Conflict addresses             : 0
 Current index        IP address range                    Leased/Excluded/Total
 2.1.1.5              2.1.1.1         - 2.1.1.254          1    /1    /254
============================================================
```

**相关命令**：无、4.5 DNS 命令


## 4.5 DNS 命令

### 4.5.1 `ip host`

**功能**：全局模式下使用 ip host 命令在域名系统(DNS)中设置主机名及其对应的ip 地址。如果
  当前域名缓存中不存在此对应关系，系统会自动创建。
  本命令的no 格式用来删除主机名与ip 地址的对应关系。

**语法**：

```
ip host HOSTNAME IP_ADDR
no ip host hostname
```

| 参数 | 说明 |
| --- | --- |
| HOSTNAME | 主机名长度不超过63 个字符的字符串 |
| IP_ADDR | 与主机名对应的ip 地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：域名缓存中无静态配置的主机名及其对应的ip 地址。

**使用说明**：

无

**示例**：

```
全局模式下,设置主机名及对应IP 地址:
Switch# configure terminal
Switch(config)# ip host www.example1.com 192.0.2.141
```

**相关命令**：show ip host

### 4.5.2 `dns domain`

**功能**：全局模式下使用dns domain 命令在域名系统(DNS)下设置一个缺省域名。
  本命令的no 格式用来删除指定的域名。

**语法**：

```
dns domain DOMAIN-NAME
no dns domain DOMAIN-NAME
```

| 参数 | 说明 |
| --- | --- |
| DOMAIN-NAME | 域名长度不超过63 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
全局模式下,在域名系统中设置缺省域名:
Switch# configure terminal
Switch(config)# dns domain www.example1.com
```

**相关命令**：show dns domain

### 4.5.3 `dns server`

**功能**：全局模式下使用dns server 命令在域名系统(DNS)的域名服务器列表中新增一个域名服
  务器。本命令的no 格式用来从服务器列表中删除域名服务器。

**语法**：

```
dns server IP_ADDR ( source-interface IFNAME | source-ip A.B.C.D | )
no dns server IP_ADDR
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 域名服务器的ip 地址支持IPv4 和IPv6 地址 |
| IFNAME | 指定源接口名称支持 |
| physical/aggregation/loopb | ack/tunnel/vlan 端口 |
| A.B.C.D | 指定源IP 地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：域名服务器列表中不存在域名服务器。

**使用说明**：

本命令最多能添加三个域名解析服务器。如果指定源接口或者源IP 地址，将会使用对
  应的IP 地作为发出报文的源IP 地址。

**示例**：

```
全局模式下,新增域名服务器:
Switch# configure terminal
Switch(config)# dns server 10.10.1.1
Switch(config)# dns server 20.20.2.2
```

**相关命令**：show dns server

### 4.5.4 `show dns`

**功能**：特权模式下使用show dns 命令显示域名系统(DNS)的配置信息。

**语法**：

```
show dns { domain | server }
```

| 参数 | 说明 |
| --- | --- |
| domain | 显示域名列表 |
| server | 显示域名服务器列表 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
特权模式下,显示域名系统的配置信息:
Switch# show dns domain
Current DNS domain configuration:
     Domain                 Suffix
----------------------------------------
1    domain                 domain.com
2    domain                 aa.com
```

**相关命令**：dns server、dns domain

### 4.5.5 `show ip host`

**功能**：特权模式下,使用show ip host 命令显示指定ip 主机的配置信息。

**语法**：

```
show ip host
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
特权模式下,显示指定主机的配置信息:
Switch# show ip host
Current IP host configuration:
     Host                           Address
--------------------------------------------------------------
1    www.sampledomain.com           1.1.1.1
```

**相关命令**：ip host、、5 IPv6 业务命令、5.1 隧道命令

