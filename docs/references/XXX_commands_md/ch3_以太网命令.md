# 3 以太网命令

## 3.1 接口命令

### 3.1.1 `bandwidth`

**功能**：使用此命令设置端口带宽。 使用关键词no 设置带宽到默认值。

**语法**：

```
bandwidth BANDWIDTH
no bandwidth
```

| 参数 | 说明 |
| --- | --- |
| BANDWIDTH | 端口带宽 1-100000000, 单位：kbps |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何设置带宽为1M 字节:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# bandwidth 1000

下面的例子显示了如何设置带宽到默认值:
Switch# configure terminal
Switch(config-if)# no bandwidth
```

**相关命令**：duplex、speed

### 3.1.2 `clear counters`

**功能**：使用此命令清除端口的报文统计信息。

**语法**：

```
clear counters ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 端口名称；可以为物理端口，也可以为汇聚端口；如果此项为空，则清除所有端口的报文统计信息支持物理口和聚合口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

在某些情况下，需要统计一定时间内某端口的流量，这就需要在统计开始前清除该端
  口原有的统计信息，重新进行统计。如果不指定端口类型和端口号，则清除所有端口
  的统计信息；如果仅指定端口类型，则清除所有该类型端口的统计信息。

**示例**：

```
下面的例子显示了如何清 除所有端口的统计信息:
Switch# clear counters
下面的例子显示了如何清除物理口eth-0-1 的统计信息:

Switch# clear counters eth-0-1
下面的例子显示了如何清除聚合端口agg1 的统计信息:
Switch# clear counters agg1
```

**相关命令**：无

### 3.1.3 `description`

**功能**：使用该命令为端口设置描述信息。
  使用关键词no 删除端口描述信息。

**语法**：

```
description LINE
no description
```

| 参数 | 说明 |
| --- | --- |
| LINE | 端口描述信息必须小于等于240 个字符，字符串不能包括“?” |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置端口eth-0-1 上的描述信息:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# description Ethernet
下面的例子显示了如何清除端口上的描述信息:

Switch# configure terminal
Switch(config-if)# no description
```

**相关命令**：无

### 3.1.4 `duplex`

**功能**：使用此命令设置端口的工作方式。
  使用关键词no 设置工作方式为默认值。

**语法**：

```
duplex ( auto | full | half )
no duplex
```

| 参数 | 说明 |
| --- | --- |
| auto | 自协商模式，端口根据它所连接的设备自动检测应该处于全双工还是半双工状态 |
| full | 全双工模式 |
| half | 半双工模式,只能配置在 10M,100M 的端口 |

**命令模式**：端口配置模式

**默认配置**：自动

**使用说明**：

此命令不能在10G 端口以及复用端口(combo port)上使用。

**示例**：

```
下面的例子显示了如何设置端口配置模式为自协商:

Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# duplex auto
下面的例子显示了如何设置端口配置模式为全双工:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# duplex full
下面的例子显示了如何将端口双工模式设为默认值:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no duplex
```

**相关命令**：bandwidth、speed

### 3.1.5 `speed`

**功能**：使用该命令设置端口速率。使用该命令的no 形式恢复速率为默认值。

**语法**：

```
speed ( 10 | 100 | 1000 | 2G5 | 5G | 10G | 25G | 40G | 50G | 100G | auto )
no speed
```

| 参数 | 说明 |
| --- | --- |
| auto | 端口自动检测协商速率强制端口速率为10Mb/s 强制端口速率为100Mb/s 强制端口速率为1000Mb/s - |
| 2G5 | 强制端口速率为2.5Gb/s |
| 5G | 强制端口速率为5Gb/s |
| 10G | 强制端口速率为10Gb/s |
| 25G | 强制端口速率为25Gb/s |
| 40G | 强制端口速率为40Gb/s |
| 50G | 强制端口速率为50Gb/s |
| 100G | 强制端口速率为100Gb/s |

**命令模式**：端口配置模式

**默认配置**：自动

**使用说明**：

此命令不能在复用端口(combo port)上使用。

**示例**：

```
强制设置端口速率为1000Mb/s:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# speed 1000
恢复端口速率为自协商:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no speed
```

**相关命令**：bandwidth、duplex

### 3.1.6 `group-speed`

**功能**：使用该命令设置接口组端口速率。接口组中任一端口执行该命令后，同一接口组中所
  有端口都会配置为相同的速率。

**语法**：

```
group-speed ( 1000 | 10G | 25G | default )
```

| 参数 | 说明 |
| --- | --- |
| 1000Mb/s |  |
| 10G | 强制接口组端口速率为 |
| 10Gb/s |  |
| 25G | 强制接口组端口速率为 |
| 25Gb/s |  |
| default | 强制接口组端口速率为默认速率 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

此命令只有接口组端口使用，接口组中任一端口执行该命令后，同一接口组中所有端
  口都会配置为相同的速率。

**示例**：

```
强制设置接口组端口速率为1000Mb/s:
Switch# configure terminal
Switch(config)# interface eth-0-49
Switch(config-if)# group-speed 1000
% Warning: Speed of Port eth-0-49, eth-0-50, eth-0-51, eth-0-52 will all be
switched to 1000M after entering this CLI
```

**相关命令**：show group-id info、bandwidth、duplex

### 3.1.7 `interface`

**功能**：使用该命令进入端口配置模式。

**语法**：

```
interface IFNAME
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称，比如eth-0-1， agg1， vlan1，loopback1 支持所有类型接口 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
进入物理端口eth-0-1:
Switch(config)# interface eth-0-1
进入聚合端口agg1:
Switch(config)# interface agg1
进入逻辑口vlan2:
Switch(config)# interface vlan2
```

**相关命令**：exit

### 3.1.8 `interface range`

**功能**：使用该命令进入接口范围模式。

**语法**：

```
interface range IFNAME
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口范围支持所有类型接口用“,”或“-”区分的界面范围集 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何操作一系列物理接口:
Switch(config)# interface range eth-0-1 – 24
Switch(config-if-range)# shutdown
下面的例子显示了如何操作一系列逻辑接口:
Switch(config)# interface range vlan 1 - 20
Switch(config-if-range)# shutdown
下面的例子显示了如何操作一系列聚合端口:
Switch(config)# interface range agg 10 - 20
Switch(config-if-range)# shutdown
下面的例子显示了如何操作一系列环回接口:
Switch(config)# interface range loopback 0 - 5
Switch(config-if-range)# shutdown
```

**相关命令**：无

### 3.1.9 `interface range create vlan`

**功能**：使用此命令创建一系列的vlanif 并进入vlan 端口配置模式。

**语法**：

```
interface range create vlan VLAN_RANGE
```

| 参数 | 说明 |
| --- | --- |
| VLAN_RANGE | VLAN ID 范围 VLAN ID 合法范围1- 4094，可以用“,”或“-”来分隔 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何一次性创建10 个vlan 界面:
Switch(config)# interface range create vlan 10 - 20
Switch(config-if-range)# shutdown
```

**相关命令**：无

### 3.1.10 `jumboframe`

**功能**：使用该命令允许长帧通过以太网端口。使用该命令的no 形式关闭该功能。

**语法**：

```
jumboframe enable
no jumboframe enable
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

默认情况下接口上不允许长帧通过，最大可以通过的报文的长度是1632 字节。使能
  jumboframe 后，端口上最大允许通过的报文长度为9600 字节。

**示例**：

```
下面的例子显示了如何使能jumboframe 功能:
Switch(config)# interface eth-0-1
Switch(config-if)# jumboframe enable
下面的例子显示了如何关闭jumboframe 功能:
Switch(config-if)# no jumboframe enable
```

**相关命令**：无

### 3.1.11 `media-type`

**功能**：使用该命令设置端口的介质类型。使用该命令的no 形式恢复默认值。

**语法**：

```
media-type ( auto-select | rj45 | sfp )
```

| 参数 | 说明 |
| --- | --- |
| auto-select | 自动检测选择端口介质类型 - |
| rj45 | 端口介质类型为RJ45 |
| sfp | 端口介质类型为SFP |

**命令模式**：端口配置模式

**默认配置**：自动选择端口介质类型

**使用说明**：

无

**示例**：

```
下面的例子显示了如何设置端口的介质类型为RJ45:
Switch(config)# interface eth-0-1
Switch(config-if)# media-type rj45
下面的例子显示了如何设置端口的介质类型为自动选择:
Switch(config-if)# no media-type
```

**相关命令**：无

### 3.1.12 `unidirectional`

**功能**：使用该命令使能/关闭端口的单通功能。

**语法**：

```
unidirectional ( enable | disable )
```

| 参数 | 说明 |
| --- | --- |
| enable | 使能端口的单通功能 |
| disable | 关闭端口的单通功能 |

**命令模式**：端口配置模式

**默认配置**：关闭单通功能

**使用说明**：

使能单通功能会导致该端口的发送强制可用，而接收强制不可用。
  仅光口支持单通功能，且1000M 速率下需要将duplex 强制为full。

**示例**：

```
下面的例子显示了如何使能端口的单通功能:
Switch(config)# interface eth-0-1
Switch(config-if)# unidirectional enable

下面的例子显示了如何关闭端口的单通功能:
Switch(config-if)# unidirectional disable
```

**相关命令**：无

### 3.1.13 `shutdown`

**功能**：使用该命令手动关闭端口。使用该命令的no 形式打开端口。

**语法**：

```
shutdown
no shutdown
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何关闭一个端口:
Switch(config)# interface eth-0-1
Switch(config-if)# shutdown
下面的例子显示了如何打开一个端口:
Switch(config-if)# no shutdown
```

**相关命令**：无

### 3.1.14 `split interface`

**功能**：使用该命令可以拆分40G 或者100G 的端口。使用该命令的no 形式取消拆分。

**语法**：

```
split interface IFNAME ( 10giga | 40giga )
no split interface
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 需要拆分的物理口支持物理口 |
| 10giga | 把端口拆分成4 个10G 口 |
| 40giga | 把端口拆分成1 个40G 口 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

拆分命令配置或者取消配置后，先要保存配置并重启才生效。

**示例**：

```
下面的例子显示了如何将口拆分成4 个10G 口:
Switch# configure terminal
Switch(config)# split interface eth-0-1 10giga
```

**相关命令**：无

### 3.1.15 `load-interval`

**功能**：使用该命令设置计算端口速率时的时间范围。使用该命令的no 形式恢复时间范围为默
  认值。

**语法**：

```
load-interval SECONDS
no load-interval
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 时间范围 5-600, 单位：秒 |

**命令模式**：端口配置模式

**默认配置**：300 秒

**使用说明**：

时间范围必须是5 的整数倍。默认值是300 秒。

**示例**：

```
下面的例子显示了如何将端口的load interval 设为600 秒:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# load-interval 600
下面的例子显示了如何将端口的load interval 恢复为默认值:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no load-interval
```

**相关命令**：show interface

### 3.1.16 `vlan dot1q tag native`

**功能**：使用该命令来配置边缘交换机使得所有从trunk 口出去的报文都是带标签的。

**语法**：

```
vlan dot1q tag native
no vlan dot1q tag native
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

如果在交换机上的trunk 口上配置了该命令，那么交换机可以接收所有不带标签的报文，
  但是从该端口出去的报文一定是打上标签的。默认情况下该功能不开启。

**示例**：

```
下面的例子显示如何让所有从eth-0-1 口出去的报文都带标签:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# vlan dot1q tag native
下面的例子显示了如何禁用tag native 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no vlan dot1q tag native
```

**相关命令**：无

### 3.1.17 `show interface`

**功能**：使用该命令显示指定端口或者所有端口的配置以及统计值。

**语法**：

```
show interface ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称 eth：物理端口 agg：Agg 端口 loopback：环回端口 vlan：Vlan 端口 tunnel：Tunnel 端口 null：Null 端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

OAM 的统计值只有在端口是10G 模式的时候才能显示出来。

**示例**：

```
下面的例子显示了接口eth-0-1 上的信息:
Switch# show interface eth-0-1
Interface eth-0-1
  Interface current state: UP
  Hardware is Ethernet, address is 001e.080a.5102 (bia 001e.080a.5102)
  Bandwidth 1000000 kbits
  Index 1 , Metric 1 , Encapsulation ARPA
  Speed - 1000Mb/s , Duplex - Full  , Media type is 1000BASE_T_SFP
  Up count: 0
  Down count: 0
  Link type is autonegotiation
  Admin input flow-control is off, output flow-control is off
  Oper input flow-control is off, output flow-control is off
  The Maximum Frame Size is 1632 bytes
  VRF binding: not bound
  ARP timeout 01:00:00,  ARP retry interval 1s
  ARP Proxy is disabled, Local ARP Proxy is disabled
    5 minute input rate 0 bits/sec, 0 packets/sec
    5 minute output rate 0 bits/sec, 0 packets/sec
    0 packets input, 0 bytes
    Received 0 unicast, 0 broadcast, 0 multicast
    0 runts, 0 giants, 0 input errors, 0 CRC
    0 frame, 0 overrun, 0 pause input
    24 packets output, 2160 bytes
    Transmitted 0 unicast, 24 broadcast, 0 multicast
    0 underruns, 0 output errors, 0 pause output
    0 output discard
```

**相关命令**：show interface status

### 3.1.18 `show interface status`

**功能**：使用该命令显示物理端口和聚合端口的摘要信息。

**语法**：

```
show interface ( IFNAME | ) status
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称支持聚合口和物理口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令不能显示VLAN 接口和TUNNEL 接口的信息。

**示例**：

```
下面的例子显示了所有物理口和汇聚端口的摘要信息:
Switch# show interface status
Port       Status     Duplex   Speed    Mode    Type     Description
-----------------------------------------------------------------
eth-0-1    down       a-full   a-1000   ACCESS  1000BASE_T
eth-0-2    down       a-full   a-1000   ACCESS  1000BASE_T
eth-0-3    admin down auto     auto    ACCESS  1000BASE_T
eth-0-4    admin down auto     auto    ACCESS  1000BASE_T
eth-0-5    up         a-full   a-1000   routed  1000BASE_T
eth-0-6    up         a-full   a-100     ACCESS  1000BASE_T
eth-0-7    admin down auto     auto     ACCESS  1000BASE_T
eth-0-8    admin down auto     auto     ACCESS  1000BASE_T
eth-0-9    down       a-full   a-1000    ACCESS  1000BASE_T
eth-0-10   down       a-full   a-1000    ACCESS  1000BASE_T
eth-0-11   admin down auto     auto     ACCESS  1000BASE_T
eth-0-12   admin down auto     auto     ACCESS  1000BASE_T
eth-0-13   admin down auto     auto     ACCESS  1000BASE_T
eth-0-14   admin down auto     auto     ACCESS  1000BASE_T
eth-0-15   admin down auto     auto     ACCESS  1000BASE_T
eth-0-16   admin down auto     auto     ACCESS  1000BASE_T
eth-0-17   admin down auto     auto     ACCESS  1000BASE_T
eth-0-18   admin down auto     auto     ACCESS  1000BASE_T

eth-0-19   admin down auto     auto     ACCESS  1000BASE_T
eth-0-20   admin down auto     auto     ACCESS  1000BASE_T
```

**相关命令**：无

### 3.1.19 `show interface summary`

**功能**：使用该命令显示指定端口或者所有端口的统计信息。

**语法**：

```
show interface ( IFNAME | ) summary
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称支持全部类型的接口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令以列表的形式显示物理端口和AGG 接口的统计信息。

**示例**：

```
下面的例子显示了物理口eth-0-1 的统计信息:
Switch# show interface eth-0-1 summary
RXBS: rx rate (bits/sec)        RXPS: rx rate (pkts/sec)
TXBS: tx rate (bits/sec)        TXPS: tx rate (pkts/sec)

Interface    Link  RXBS          RXPS          TXBS          TXPS
-----------------------------------------------------------------------------
eth-0-1      DOWN  0             0             0             0
```

**相关命令**：show interface

### 3.1.20 `show ip interface`

**功能**：使用该命令显示3 层接口的信息。

**语法**：

```
show ip interface ( IFNAME | )
show ip interface brief
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称支持全部类型的接口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了接口vlan10 的信息:
Switch# show interface vlan10
Interface vlan10
  Interface current state: DOWN
  Hardware is VLAN, address is 8633.d260.6500 (bia 8633.d260.6500)
  Bandwidth 1000000 kbits
  Index 4098 , Metric 1 , Encapsulation ARPA
  The maximum transmit unit (MTU) is 1500 bytes
  VRF binding: not bound
  Label switching is disabled
  No virtual circuit configured
  VRRP master of :  VRRP is not configured on this interface
  ARP timeout 01:00:00,  ARP retry interval 1s
```

**相关命令**：无

### 3.1.21 `switchport`

**功能**：使用该命令使端口在2 层口和3 层路由口之间切换。

**语法**：

```
switchport
no switchport
```

**命令模式**：端口配置模式

**默认配置**：2 层口

**使用说明**：

端口默认是一个2 层口。当您使用该命令切换端口配置模式的时候，所有端口上原来
  的配置将会消失并且不能恢复。

**示例**：

```
下面的例子显示了如何将端口设为2 层口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport
下面的例子显示了如何将端口设为3 层路由口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
```

**相关命令**：无

### 3.1.22 `switchport access allowed`

**功能**：使用该命令设置端口加入/离开指定的VLAN。

**语法**：

```
switchport access allowed vlan ( add｜remove ) VLAN_ID
```

| 参数 | 说明 |
| --- | --- |
| add | 允许指定VLAN 的报文通过该端口 |
| remove | 禁止指定VLAN 的报文通过该端口 |
| VLAN_ID | VLAN 标志符 1-4094 |

**命令模式**：端口配置模式

**使用说明**：

该命令只能用于VLAN Classification 功能。

**示例**：

```
下面的例子显示如何设置指定VLAN 的报文允许通过该端口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport access allowed vlan add 10
允许vlan11 通过端口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport access allowed vlan add 11
禁止vlan12 通过端口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport access allowed vlan remove 12
```

**相关命令**：switchport trunk allowed vlan (add vid｜remove vid| all | none)

### 3.1.23 `switchport access vlan`

**功能**：设置access 端口的默认VLAN。使用该命令的no 形式恢复端口默认VLAN 为1。

**语法**：

```
switchport access vlan VLAN_ID
no switchport access vlan
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | VLAN 标志符 2-4094 |

**命令模式**：端口配置模式

**使用说明**：

使用该命令前，端口必须已经设置为access 类型。端口的默认VALN 为1。

**示例**：

```
下面的例子将端口默认VLAN 改为10:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10
下面的例子将端口默认VLAN 恢复为1:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport access vlan
```

**相关命令**：switchport trunk native

### 3.1.24 `switchport mode access`

**功能**：使用该命令设置端口工作在access 模式。

**语法**：

```
switchport mode access
```

**命令模式**：端口配置模式

**默认配置**：Access 口

**使用说明**：

当端口配置模式变化的时候，端口上所有的动态FDB 都会被清掉。

**示例**：

```
下面的例子显示了如何将端口配置为access 模式:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport mode access
```

**相关命令**：switchport mode trunk

### 3.1.25 `switchport mode trunk`

**功能**：使用该命令设置端口工作在trunk 模式。

**语法**：

```
switchport mode trunk
```

**命令模式**：端口配置模式

**默认配置**：Access 口

**使用说明**：

当端口配置模式变化的时候，端口上所有的动态FDB 都会被清掉。

**示例**：

```
下面的例子显示了如何使端口工作在trunk 模式:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport mode trunk
```

**相关命令**：switchport mode access

### 3.1.26 `switchport mode dot1q-tunnel`

**功能**：使用该命令设置端口为QINQ。

**语法**：

```
switchport mode dot1q-tunnel
```

**命令模式**：端口配置模式

**默认配置**：Access 端口

**使用说明**：

当端口配置模式变化的时候，端口上所有的动态FDB 都会被清掉。

**示例**：

```
下面的例子显示了如何使端口工作在QINQ 模式:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport mode dot1q-tunnel
```

**相关命令**：switchport mode trunk

### 3.1.27 `switchport trunk allowed`

**功能**：使用该命令允许指定VLAN 的报文通过trunk 端口。

**语法**：

```
switchport trunk allowed vlan ( add VLAN_ID | remove VLAN_ID | all | none )
```

| 参数 | 说明 |
| --- | --- |
| add VLAN_ID | 允许指定VLAN 的报文通过该端口 1-4094 |
| remove VLAN_ID | 禁止指定VLAN 的报文通过该端口 1-4094 |
| all | 允许所有的报文通过该端口 - |
| none | 禁止所有的报文通过该端口 - |

**命令模式**：端口配置模式

**使用说明**：

使用此命令配置允许指定VLAN 的报文通过该端口

**示例**：

```
下面的例子设置只允许指定VLAN 的报文通过该端口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport trunk allowed vlan add 10
下面的例子设置禁止指定VLAN 的报文通过该端口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport trunk allowed vlan remove 11,12

下面的例子设置允许所有的报文通过该端口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport trunk allowed vlan all
下面的例子显示禁止所有的报文通过该端口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport trunk allowed vlan none
```

**相关命令**：switchport access allowed vlan (add｜remove) vid

### 3.1.28 `switchport trunk native vlan`

**功能**：使用该命令设置trunk 端口的默认VLAN。

**语法**：

```
switchport trunk native vlan VLAN_ID
no switchport trunk native vlan
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | VLAN 标志符 2-4094 |

**命令模式**：端口配置模式

**使用说明**：

使用该命令前，端口必须已经被配置为trunk 口。

**示例**：

```
下面的例子设置trunk 口eth-0-1 的默认VLAN 为10:
Switch# configure terminal
Switch(config)# interface eth-0-1

Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk native vlan 10
下面的例子将端口默认VLAN 恢复为1:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport trunk native vlan
```

**相关命令**：switchport access vlan vid

### 3.1.29 `switchport port-bridge enable`

**功能**：使用该命令使能端口桥功能，即接口支持同源同宿报文的转发。

**语法**：

```
switchport port-bridge enable
no switchport port-bridge enable
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子将使能端口桥接功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport port-bridge enable
```

**相关命令**：port-bridge enable

### 3.1.30 `port-bridge enable`

**功能**：使用该命令使能端口桥功能支持组播和广播。

**语法**：

```
port-bridge enable
no port-bridge enable
```

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子将使能端口桥接功能支持组播和广播:
Switch# configure terminal
Switch(config)# port-bridge enable
```

**相关命令**：switchport port-bridge enable

### 3.1.31 `port-xconnect`

**功能**：使用该命令配置port-xconnect 功能的目的端口，使用该命令的no 形式移除目的端口。

**语法**：

```
port-xconnect destination-interface ( IFPHYSICAL | IFAGG )
no port-xconnect destination-interface
```

| 参数 | 说明 |
| --- | --- |
| IFPHYSICAL | 物理口无 |
| IFAGG | 聚合口 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何设置eth-0-1 port-xconnect 的目的端口为eth-0-2:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# interface eth-0-1
Switch(config-if)# port-xconnect destination-interface eth-0-2
```

**相关命令**：无

### 3.1.32 `carrier up-hold-time interval`

**功能**：使用该命令配置端口up 闪断容忍时间，使用该命令的no 形式删除端口的闪断容忍时
  间。

**语法**：

```
carrier up-hold-time interval TIME
no carrier up-hold-time interval
```

| 参数 | 说明 |
| --- | --- |
| TIME | up 闪断容忍时间 0-3600000，单位是毫秒 |

**命令模式**：端口配置模式

**使用说明**：

无

**示例**：

```
下面的例子显示了如何设置eth-0-1 的up 闪断容忍时间为300 毫秒:
Switch(config)# interface eth-0-1
Switch(config-if)# carrier up-hold-time interval 300
```

**相关命令**：无

### 3.1.33 `carrier down-hold-time interval`

**功能**：使用该命令配置端口down 闪断容忍时间，使用该命令的no 形式删除端口的闪断容忍
  时间。

**语法**：

```
carrier down-hold-time interval TIME
no carrier down-hold-time interval
```

| 参数 | 说明 |
| --- | --- |
| TIME | down 闪断容忍时间 0-3600000，单位是毫秒 |

**命令模式**：端口配置模式

**使用说明**：

无

**示例**：

```
下面的例子显示了如何设置eth-0-1 的down 闪断容忍时间为300 毫秒:
Switch(config)# interface eth-0-1
Switch(config-if)# carrier down-hold-time interval 300
```

**相关命令**：无

### 3.1.34 `mtu`

**功能**：使用该端口改变接口的MTU 值。

**语法**：

```
mtu VALUE
```

| 参数 | 说明 |
| --- | --- |
| VALUE |  |
| MTU | 68-9216 |

**命令模式**：端口配置模式

**使用说明**：

该命令只能配置在3 层接口上。

**示例**：

```
下面的例子设置3 层接口vlan10 的MTU 值为1600:
Switch# configure terminal
Switch(config)# interface vlan10
Switch(config-if)#mtu 1600
```

**相关命令**：无

### 3.1.35 `wavelength freq`

**功能**：使用该命令配置端口上tunable 光模块所使用的波长，使用该命令的no 形式恢复端口
  上tunable 光模块的默认波长。每一种波长都对应一种固定的频率，命令通过配置频率
  来设置波长。

**语法**：

```
wavelength freq FREQ
no wavelength freq
```

| 参数 | 说明 |
| --- | --- |
| FREQ | 光模块频率 19110-19615，步长为5 |

**命令模式**：端口配置模式

**默认配置**：19340

**使用说明**：

配置只有在端口插入tunable 光模块的时候才生效

**示例**：

```
下面的例子设置eth-0-10 的端口光模块波长为19120:
Switch# configure terminal
Switch(config)# interface eth-0-10
Switch(config-if)#wavelength freq 19120
```

**相关命令**：无

### 3.1.36 `fec`

**功能**：使用该命令配置端口fec 功能。

**语法**：

```
fec ( none | baser | rs )
no fec
```

| 参数 | 说明 |
| --- | --- |
| none | 关闭fec |
| baser | 配置fec baser 模式 |
| rs | 配置fec rs 模式 |

**命令模式**：端口配置模式

**默认配置**：关闭fec

**使用说明**：

FEC 仅在10G/40G/25G/50G/100G 的口上支持

**示例**：

```
如下示例，使能端口的fec 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if-eth-0-1)# fec  rs
如下示例，关闭端口的fec 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if-eth-0-1)# fec none
如下示例，配置端口的默认fec 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if-eth-0-1)# no fec
```

**相关命令**：无

### 3.1.37 `mdi`

**功能**：使用该命令配置以太网电口MDI 类型。使用no 命令恢复默认值。

**语法**：

```
mdi ( across | auto | normal )
no mdi
```

| 参数 | 说明 |
| --- | --- |
| auto | 自动识别连接网线类型 |
| across | 强制电口MDIX 模式 |
| normal | 强制电口MDI 模式 |

**命令模式**：端口配置模式

**默认配置**：自动识别连接网线类型

**使用说明**：

MDI 仅在电口上支持

**示例**：

```
如下示例，配置端口默认自动识别MDI 模式:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if-eth-0-1)# mdi auto
如下示例，强制端口MDIX 模式:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if-eth-0-1)# mdi across
如下示例，强制端口MDI 模式:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if-eth-0-1)# mdi normal
```

**相关命令**：无

### 3.1.38 `show group-id info`

**功能**：使用该命令可以查看端口group id 信息。

**语法**：

```
show group-id info
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

组ID 为0 的接口不在端口组中

**示例**：

```
如下示例，显示端口组ID 信息:
Switch# show group-id info
Group Id    Member Ports
-----------+--------------------
0           eth-0-1   eth-0-2
            eth-0-3   eth-0-4
            eth-0-5   eth-0-6
            eth-0-7   eth-0-8
            eth-0-9   eth-0-10
            eth-0-11  eth-0-12
            eth-0-13  eth-0-14
            eth-0-15  eth-0-16
            eth-0-17  eth-0-18
            eth-0-19  eth-0-20
            eth-0-21  eth-0-22
            eth-0-23  eth-0-24
            eth-0-25  eth-0-26
            eth-0-27  eth-0-28
            eth-0-29  eth-0-30
            eth-0-31  eth-0-32
            eth-0-33  eth-0-34
            eth-0-35  eth-0-36

            eth-0-37  eth-0-38
            eth-0-39  eth-0-40
            eth-0-41  eth-0-42
            eth-0-43  eth-0-44
            eth-0-45  eth-0-46
            eth-0-47  eth-0-48
----------------------------------
1           eth-0-49  eth-0-50
            eth-0-51  eth-0-52
Switch#
```

**相关命令**：group-speed、3.2 接口Errdisable 命令


## 3.2 接口Errdisable 命令

### 3.2.1 `errdisable detect`

**功能**：使用此命令使能对端口的链路错误状态检测功能。使用no 命令格式恢复默认值。

**语法**：

```
errdisable detect reason ( link-flap | fdb-loop | udld )
no errdisable detect reason ( link-flap | fdb-loop | udld )
```

| 参数 | 说明 |
| --- | --- |
| link-flap | 启用链路震荡检测功能 |
| fdb-loop | 启用fdb 针对检查功能 |
| udld | 启用链路的单向链路检测功能 |

**命令模式**：全局配置模式

**默认配置**：link-flap 功能开启 fdb-loop 功能开启 udld 功能开启

**使用说明**：

无

**示例**：

```
下面的例子显示如何启用链路震荡检测功能:
Switch# configure terminal
Switch(config)# errdisable detect reason link-flap
下面的例子显示如何禁用链路震荡检测功能:
Switch# configure terminal
Switch(config)# no errdisable detect reason link-flap
```

**相关命令**：show errdisable detect

### 3.2.2 `errdisable recovery interval`

**功能**：使用此命令设置链路从错误状态恢复的时间。
  使用关键词no 恢复时间段为默认值。

**语法**：

```
errdisable recovery interval RANGE
no errdisable recovery interval
```

| 参数 | 说明 |
| --- | --- |
| RANGE | 从错误状态恢复的时间间隔 30-86400, 单位：秒 |

**命令模式**：全局配置模式

**默认配置**：300 秒

**使用说明**：

默认时间间隔为300 秒。
  
  如果没有开启错误关闭自动恢复功能，则需要管理员打开被错误关闭的端口；如果开
  启了错误关闭自动恢复功能，则等待错误关闭恢复时间后，自动打开此端口。此命令
  用于设置错误关闭恢复时间。

**示例**：

```
设置错误状态恢复的时间间隔为30 秒:
Switch# configure terminal
Switch(config)# errdisable recovery interval 30
恢复时间间隔为默认值:
Switch# configure terminal
Switch(config)# no errdisable recovery interval
```

**相关命令**：errdisable recovery reason、show errdisable recovery

### 3.2.3 `errdisable fdb-loop count`

**功能**：使用此命令设置FDB 检测环路值。
  使用关键词no 恢复默认值。

**语法**：

```
errdisable fdb-loop count COUNT
no errdisable fdb-loop count
```

| 参数 | 说明 |
| --- | --- |
| COUNT | 周期内检测到FDB 漂移的次数。默认10。 3-50 |

**命令模式**：全局配置模式

**使用说明**：

周期固定60s。

**示例**：

```
设置配置检测次数为5 次:
Switch# configure terminal
Switch(config)# errdisable fdb-loop count 5
```

**相关命令**：errdisable recovery reason、show errdisable recovery、show errdisable fdb-loop

### 3.2.4 `errdisable fdb-loop exclude-vlan`

**功能**：使用此命令设置FDB 检测白名单。
  使用关键词no 恢复默认值。

**语法**：

```
errdisable fdb-loop exclude-vlan VLAN_LIST
no errdisable fdb-loop exclude-vlan
```

| 参数 | 说明 |
| --- | --- |
| VLAN_LIST | 设置FDB 不检测的VLAN 列表。 使用 ‘-’和 ‘,’符号连接，如： “1-10,15,20,30-40” |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
设置FDB 不检测vlan 1 和5-7:
Switch# configure terminal
Switch(config)# errdisable fdb-loop exclude-vlan 1,5-7
```

**相关命令**：show errdisable fdb-loop

### 3.2.5 `errdisable recovery reason`

**功能**：使用该命令启用指定原因的错误恢复功能。
  使用关键词no 禁用此项功能。

**语法**：

```
errdisable recovery reason ( all | bpduguard | bpduloop | port-security | link-flap | link-
monitor-failure | oam-remote-failure | udld | fdb-loop | loopback-detection )
no errdisable recovery reason ( all | bpduguard | bpduloop | port-security | link-flap |
link-monitor-failure | oam-remote-failure | udld | fdb-loop | loopback-detection )
```

| 参数 | 说明 |
| --- | --- |
| all | 使能所有原因的错误恢复功能 |
| bpduguard | 使能从BPDU 防护错误状态恢复功能 |
| bpduloop | 使能BPDU 环回错误状态恢复功能 |
| port-security | 使能端口绑定错误恢复功能 - |
| link-flap | 使能链路震荡错误恢复功能 - |
| link-monitor-failure | 使能链路监测错误恢复功能 - |
| oam-remote-failure | 使能从OAM 错误恢复功能 - |
| udld | 使能UDLD 错误恢复功能 |
| fdb-loop | 使能FDB 环路恢复功能 |
| loopback-detection | 使能loopback detection 错误状态恢复功能 |
| cfm-failure | 使能failure 错误状态恢复功能 |

**命令模式**：全局配置模式

**默认配置**：关闭

**使用说明**：

修改链路错误状态恢复时间不会影响那些已经进入错误状态的端口。

**示例**：

```
下面的例子显示如何使能链路震荡错误恢复功能:
Switch# configure terminal
Switch(config)# errdisable recovery reason link-flap
下面的例子显示如何禁用链路震荡错误恢复功能:
Switch# configure terminal
Switch(config)# no errdisable recovery reason link-flap
```

**相关命令**：errdisable recovery interval、show errdisable recovery

### 3.2.6 `errdisable flap`

**功能**：使用该命令设置链路震荡的参数。使用该命令的no 形式恢复默认值。

**语法**：

```
errdisable flap reason link-flap COUNT SECONDS
no errdisable flap reason link-flap COUNT SECONDS
```

| 参数 | 说明 |
| --- | --- |
| link-flap | 链路震荡检测 |
| COUNT | 链路震荡检测次数 1-100, 单位次 |
| SECONDS | 链路震荡检测周期 1-120, 单位:秒 |

**命令模式**：全局配置模式

**默认配置**：最大震荡次数：10 震荡周期：10

**使用说明**：

如果链路震荡错误检测功能被开启，那么端口可能会进入errdisable 状态，否则就算链
  路震荡次数达到了指定值，系统只会记录log。

**示例**：

```
下面的例子显示如何设置链路震荡参数:
Switch# configure terminal
Switch(config)# errdisable flap reason link-flap 20 60
下面的例子显示如何恢复链路震荡参数为默认值:
Switch# configure terminal
Switch(config)# no errdisable flap reason link-flap
```

**相关命令**：show errdisable flap

### 3.2.7 `show errdisable detect`

**功能**：该命令用于显示错误检测是否开启。

**语法**：

```
show errdisable detect
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示如何查看错误状态检测开启状态:
DUT1# show errdisable detect
ErrDisable Reason        Detection status
-----------------        ----------------
bpduguard                Enabled
bpduloop                 Enabled
link-monitor-failure     Enabled
oam-remote-failure       Enabled
port-security            Enabled
link-flap                Enabled
monitor-link             Enabled
udld                     Disabled
fdb-loop                 Disabled
loopback-detection       Enabled
reload-delay             Enabled
dual-active-conflict     Enabled
cfm-failure              Enabled
```

**相关命令**：errdisable detect

### 3.2.8 `show errdisable recovery`

**功能**：该命令用于显示错误状态恢复功能是否开启。

**语法**：

```
show errdisable recovery
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示如何查看错误状态恢复功能:
Switch# show errdisable recovery
ErrDisable Reason        Timer Status
-----------------        --------------
bpduguard                Disabled
bpduloop                 Disabled
link-monitor-failure     Disabled
oam-remote-failure       Disabled
port-security            Disabled
link-flap                Disabled
udld                     Disabled
fdb-loop                 Disabled
loopback-detection       Disabled
dual-active-conflict     Disabled
cfm-failure              Disabled

Timer interval: 300 seconds
```

**相关命令**：errdisable recovery interval、errdisable recovery reason

### 3.2.9 `show errdisable flap`

**功能**：该命令用于显示链路震荡错误检测的参数。

**语法**：

```
show errdisable flap
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示如何查看链路震荡错误检测配置:
Switch# show errdisable flap
ErrDisable Reason        Flaps     Time (sec)
-----------------        ------    ----------
link-flap                10        10
```

**相关命令**：errdisable flap

### 3.2.10 `show errdisable fdb-loop`

**功能**：该命令用于显示MAC 地址漂移检测的参数。

**语法**：

```
show errdisable fdb-loop
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

60s 之内发现mac 地址漂移10 次，则判断该mac 地址存在漂移现象，打印提示
  log(log 要在termin monitor 模式才能显示)，log 会写入syslog 里面。
  如果一直存在mac 地址漂移，log 每隔10 分钟打印一次
  MAC 地址漂移是per mac 的，检测mac 数量没有任何限制，即存在多少个mac 地址
  漂移，就检测多少mac，针对每个mac 地址都会打提示log。

**示例**：

```
下面的例子显示如何查看MAC 地址漂移检测配置:

Switch# show errdisable fdb-loop
Errdisable FDB loop information
----------------------------------------------------------------------
Exclude VLAN-list                  : N/A
Detecting count                    : 10
Detecting period                   : 60s
Printing log period                : 600s
```

**相关命令**：无

### 3.2.11 `errdisable fdb-loop trust`

**功能**：使用该命令设置端口配置为可信模式，当检测到是该端口发生fdb-loop 时，不会将该
  端口errdisable。
  使用关键词no 禁用此项功能。

**语法**：

```
errdisable fdb-loop trust
no errdisable fdb-loop trust
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示如何设置接口的fdb-loop 可信:
DUT1(config)# interface eth-0-1
DUT1(config-if)# errdisable fdb-loop trust
下面的例子显示如何清除接口的fdb-loop 可信配置:
DUT1(config)# interface eth-0-1
DUT1(config-if)# no errdisable fdb-loop trust
```

**相关命令**：无、3.3 MAC Address Table 命令


## 3.3 MAC Address Table 命令

### 3.3.1 `mac-address-table aging-time`

**功能**：在MAC 地址表中的条目使用或更新后，可以使用全局配置命令mac-address-table
  aging-time 设置MAC 表中动态条目的老化时间，使用no 命令将老化时间还原到默认
  值。老化时间适用于所有VLAN 中的MAC 地址条目。

**语法**：

```
mac_address-table aging-time SECONDS
no mac_address-table aging-time
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | MAC 表老化时间 0，10-1000000, 0 表示 MAC 表不老化， 单位：秒 |

**命令模式**：全局配置模式

**默认配置**：300 秒

**使用说明**：

如果没有连续的收到报文，用户可以增加老化时间的值使得设备能够保留更长的时间
  的动态条目。增加老化时间可以减少主机重复发送报文而引起广播风暴的可能性。

**示例**：

```
以下例子说明了对所有的VLAN 将老化时间设置成200 秒:
Switch# configure terminal
Switch(config)# mac-address-table aging-time 200
```

**相关命令**：show mac address-table aging-time

### 3.3.2 `mac-address-table hardware-learning`

**功能**：启用硬件学习功能，如果启用该功能，硬件收到未知的单播源MAC 后执行学习FDB，
  不要软件参与。使用no 命令取消该功能。

**语法**：

```
mac_address-table hardware-learning enable
no mac_address-table hardware-learning enable
```

**命令模式**：全局配置模式

**默认配置**：关闭

**使用说明**：

启用该功能可以大大加快FDB 的学习速率。

**示例**：

```
以下例子介绍了如何启用硬件学习功能:
Switch# configure terminal
Switch(config)# mac-address-table hardware-learning enable
```

**相关命令**：无

### 3.3.3 `mac-address-table forward`

**功能**：使用全局配置命令mac-address-table forward 在MAC 表中增加静态条目，使用no 命
  令从MAC 表中移除指定的静态条目。

**语法**：

```
mac_address-table MAC_ADDR forward ( IFNAME | eps EPS_ID | remote-vtep
REMOTE_VTEP_ID | smart-link SMART_LINK_ID ) vlan VLAN_ID
no mac_address-table MAC_ADDR forward ( IFNAME | eps EPS_ID | remote-vtep
REMOTE_VTEP_ID | smart-link SMART_LINK_ID ) vlan VLAN_ID
```

| 参数 | 说明 |
| --- | --- |
| MAC_ADDR | 目的MAC 位址（单播或多播）,特定VLAN 中带有目的MAC 位址的报文将通过特定的接口转发出去 Mac 地址，格式为 |
| HHHH.HHHH.HHHH |  |
| IFNAME | 报文转发出去的界面。 有效的接口包括物理接口和聚合接口 |
| VLAN_ID | 特定的VLAN。带有特定 MAC 地址的报文所属的 VLAN。 1-4094 |
| EPS_ID | EPS 保护组 1-2048 |
| REMOTE_VTEP_ID | 远端vtep 1-65535 |
| SMART_LINK_ID | Smart-link 组 1-16 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

通过该命令配置的静态条目不受老化时间限制。

**示例**：

```
以下例子说明了添加静态条目c2f3220a12f4 到MAC 地址表中。当在VLAN4 中收到一
条这样的MAC 目的地址的报文后，该报文将会从指定的端口转发出去:
Switch# configure terminal
Switch(config)# mac-address-table c2f3.220a.12f4 forward eth-0-1 vlan 4
```

**相关命令**：show mac address-table

### 3.3.4 `mac-address-table discard`

**功能**：使用全局配置命令mac-address-table discard 允许在交换机上对单播MAC 地址过滤和
  对特定的源MAC 位址或目的MAC 位址停止转发。使用no 命令还原到默认配置。

**语法**：

```
mac_address-table MAC_ADDR discard
no mac_address-table MAC_ADDR discard
```

| 参数 | 说明 |
| --- | --- |
| MAC_ADDR | 加入到地址过滤表中的源 MAC 位址或目的MAC 位址 (单播地址) |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

当使用该命令时需要遵循以下原则：
  该命令不支持多播 MAC 地址、广播 MAC 地址和路由 MAC 地址。转发到CPU 上的报
  文同样不支持。

**示例**：

```
以下例子说明了在设备上启用单播地址过滤功能，设备将对源MAC 位址或目的MAC
位址为c2f3220a12f4 的报文丢弃:
Switch# configure terminal
Switch(config)# mac-address-table c2f3.220a.12f4 discard
```

**相关命令**：mac-address-table forward

### 3.3.5 `clear mac address-table`

**功能**：使用命令clear mac address-table 可以删除所有的动态(或静态或组播)条目或根据接口
  /MAC 位址/VLAN 删除部分动态(或静态或组播)条目。

**语法**：

```
clear mac address-table ( static | dynamic | multicast ) { address MAC_ADDR | interface
IFNAME | vlan VLAN_ID }
```

| 参数 | 说明 |
| --- | --- |
| dynamic | 删除动态条目 |
| static | 删除静态条目 |
| multicast | 删除多播条目 |
| address MAC_ADDR | 删除特定MAC 地址的条目 Mac 地址，格式为 |
| HHHH.HHHH.HHHH |  |
| interface IFNAME | 删除所有特定物理接口或聚合接口上的所有条目支持物理口和聚合口 |
| vlan VLAN_ID | 删除特定VLAN 的所有条目 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下例子说明了删除特定MAC 地址的所有动态条目:
Switch# clear mac address-table dynamic address 0008.0070.0007
```

**相关命令**：show mac address-table

### 3.3.6 `port-bridge`

**功能**：使用该命令支持转发同源同宿的报文

**语法**：

```
switchport port-bridge enable
no switchport port-bridge enable
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下例子说明了如何使能port-bridge 的功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport port-bridge enable
```

**相关命令**：无

### 3.3.7 `show mac address-table aging-time`

**功能**：使用特权命令show mac address-table aging-time 显示所有VLAN 中所有条目的老化
  时间。

**语法**：

```
show mac address-table aging-time
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下例子说明了使用show mac address-table aging-time 命令查看条目的老化时间:
Switch# show mac address-table aging-time
MAC address table aging time is 300 seconds
```

**相关命令**：mac-address-table aging-time

### 3.3.8 `show mac address-table`

**功能**：使用特权命令 show mac address-table 显示特定MAC 地址的静态和动态条目或特定接
  口特定VLAN 的的静态条目和动态条目。

**语法**：

```
show mac address-table ( dynamic | static | multicast | ) ( address MAC_ADDR | interface
IFNAME | vlan VLAN_ID | )
```

| 参数 | 说明 |
| --- | --- |
| dynamic | 显示动态条目 |
| static | 显示静态条目 |
| multicast | 显示多播条目 |
| address MAC_ADDR | 显示特定MAC 地址的条目 Mac 地址，格式为 |
| HHHH.HHHH.HHHH |  |
| interface IFNAME | 显示特定物理接口或聚合接口上的所有条目支持物理口和聚合口 |
| vlan VLAN_ID | 显示特定VLAN 中的所有 1-4094 条目. |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下例子说明了使用show mac address-table 命令查看条目输出:
Switch# show mac address-table
          Mac Address Table
-------------------------------------------
(*)  - Security Entry     (M)  - MLAG Entry
(MO) - MLAG Output Entry  (MI) - MLAG Input Entry
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
1       0000.0000.0001    static       eth-0-2
1       0000.0001.0003    static(*)   eth-0-1
1       0000.0001.0002    static(*)   eth-0-1
2       26fc.72e5.0100    dynamic(*)    eth-0-9
1       0100.0000.0001    static       eth-0-2
```

**相关命令**：mac-address-table

### 3.3.9 `show mac address-table hardware`

**功能**：使用特权命令 show mac address-table 显示硬件中特定MAC 地址的静态和动态条目或
  特定接口特定VLAN 的的静态条目和动态条目。

**语法**：

```
show mac address-table hardware ( dynamic | static | ) ( address MAC_ADDR | interface
IFNAME | vlan VLAN_ID | )
```

| 参数 | 说明 |
| --- | --- |
| dynamic | 显示动态条目 |
| static | 显示静态条目 |
| address MAC_ADDR | 显示特定MAC 地址的条目 Mac 地址，格式为 |
| HHHH.HHHH.HHHH |  |
| interface IFNAME | 显示特定物理接口或聚合接口上的所有条目支持物理口和聚合口 |
| vlan VLAN_ID | 显示特定VLAN 中的所有条目. 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下例子说明了使用show mac address-table hardware 命令查看条目输出:
Switch# show mac address-table hardware
          Mac Address Table
-------------------------------------------
(*)  - Security Entry     (M)  - MLAG Entry
(MO) - MLAG Output Entry  (MI) - MLAG Input Entry
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
1       0000.0000.0001    static       eth-0-2
1       0000.0001.0003    static(*)   eth-0-1
1       0000.0001.0002    static(*)   eth-0-1
2       26fc.72e5.0100    dynamic(*)    eth-0-9
1       0100.0000.0001    static       eth-0-2
```

**相关命令**：mac-address-table

### 3.3.10 `show mac address-table count`

**功能**：使用特权命令show mac address-table count 显示所有MAC 的条目总数。

**语法**：

```
show mac address-table count
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下例子说明了使用show mac address-table count 命令查看条目总数:
Switch# show mac address-table count
Dynamic Address Count  :    0    (Security: 0)
Static  Address Count  :    0    (Security: 0)
Blackhole Address Count:    1
Total Mac Addresses    :    1    (Security: 0)
```

**相关命令**：show mac address-table

### 3.3.11 `show mac address-table hardware count`

**功能**：使用特权命令show mac address-table hardware count 显示硬件中所有MAC 的条目总
  数。

**语法**：

```
show mac address-table hardware count
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下例子说明了使用show mac address-table hardware count 命令查看条目总数:
Switch# show mac address-table hardware count
MAC address count in hardware table:
(Include MAC security entry)
-------------------------------------------
Dynamic Address Count  :    0
Static  Address Count  :    0
Total Mac Addresses    :    0
```

**相关命令**：show mac address-table hardware

### 3.3.12 `show mac address-table add-fdb-fail`

**功能**：使用特权命令show mac address-table add-fdb-fail 显示因为Hash 冲突而无法加入的
  静态FDB。

**语法**：

```
show mac address-table add-fdb-fail
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

有大量FDB 的情况下添加静态FDB 有极小的概率出现Hash 冲突而无法配置到硬件的
  情况，使用这条命令可以查看因为冲突而添加失败的FDB。

**示例**：

```
以下例子说明了使用show mac address-table add-fdb-fail 命令查看添加失败的条码:
Switch# show mac address-table add-fdb-fail
Vlan    Mac Address       Type        Ports
--------------------------------------------------
1       0000.0000.0001    static      eth-0-1
1       0000.0000.0002    static      eth-0-2
```

**相关命令**：show mac address-table

### 3.3.13 `show mac-filter address-table`

**功能**：使用特权命令 show mac-filter address-table 显示所有mac-filter 的条目总数。

**语法**：

```
show mac-filter address-table
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下例子说明了使用命令show mac-filter address-table 查看所有mac-filter 的条目总
数:
Switch# show mac-filter address-table
     MAC Filter Address Table
----------------------------------

 Current count       : 0
 Max count           : 128
 Left count          : 128
 Filter address list :
----------------------------------
```

**相关命令**：show mac address-table

### 3.3.14 `show resource mac-filter`

**功能**：使用该命令显示系统中mac-filter 占用的硬件资源统计信息。

**语法**：

```
show resource mac-filter
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了使用命令 show resource mac-filter 的输出结果:
Switch# show resource mac-filter
MAC-FILTER
Resource                         Used          Capability
=============================================================
Blackhole MAC Addresses          0             128
```

**相关命令**：show resource static-fdb

### 3.3.15 `show resource static-fdb`

**功能**：使用该命令显示系统中静态FDB 占用的硬件资源统计信息。

**语法**：

```
show resource static-fdb
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了使用命令 show resource static-fdb 的输出结果:
Switch# show resource static-fdb
STATIC-FDB
Resource                         Used          Capability
=============================================================
Static FDB                       0             1024
```

**相关命令**：show resource mac-filter

### 3.3.16 `mac-address-table discard vlan`

**功能**：使用配置命令mac-address-table discard 允许在交换机上对单播MAC 地址过滤和对特
  定的源MAC 位址或目的MAC 位址并且匹配VLAN 的停止转发。使用no 命令还原到
  默认配置。

**语法**：

```
mac_address-table MAC_ADDR discard ( vlan VLAN_ID | )
```

| 参数 | 说明 |
| --- | --- |
| MAC_ADDR | 加入到地址过滤表中的源 MAC 位址或目的MAC 位址 (单播地址) |
| vlan VLAN_ID | 加入到地址过滤表中的 |
| VLAN | 1-4094 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

当使用该命令时需要遵循以下原则：
  该命令不支持多播 MAC 地址、广播 MAC 地址和路由 MAC 地址。转发到CPU 上的报
  文同样不支持。指定的VLAN 需要先被创建。

**示例**：

```
以下例子说明了在设备上启用单播地址过滤功能，设备将对源MAC 位址或目的MAC
位址为c2f3220a12f4，并匹配VLAN2 的报文丢弃:
Switch# configure terminal
Switch(config)#vlan 2
Switch(config-vlan)#exit
Switch(config)# mac-address-table c2f3.220a.12f4 discard vlan 2
```

**相关命令**：mac-address-table forward

### 3.3.17 `clear mac address-table blackhole`

**功能**：使用命令clear mac address-table 可以删除所有的指定VLAN 黑洞条目或根据VLAN 删
  除部分指定VLAN 黑洞条目。

**语法**：

```
clear mac address-table blackhole ( vlan VLAN_ID | )
```

| 参数 | 说明 |
| --- | --- |
| vlan VLAN_ID | 删除指定VLAN 的黑洞条目 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下例子说明了删除VLAN 的黑洞条目:
Switch# clear mac address-table blackhole vlan 2
```

**相关命令**：show mac address-table

### 3.3.18 `show mac address-table`

**功能**：使用特权命令 show mac address-table 显示特定MAC 地址的指定VLAN 的黑洞条目或
  特定VLAN 的黑洞条目。

**语法**：

```
show mac address-table blackhole ( vlan VLAN_ID | )
```

| 参数 | 说明 |
| --- | --- |
| vlan VLAN_ID | 显示指定VLAN 的黑洞条目 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下例子说明了使用show mac address-table blackhole 命令查看条目输出:
Switch# show mac address-table blackhole
           Mac Address Table
-------------------------------------------
(*)  - Security Entry     (M)  - MLAG Entry
(MO) - MLAG Output Entry  (MI) - MLAG Input Entry
(E)  - EVPN Entry         (EO) - EVPN Output Entry
(EI) - EVPN Input Entry
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
2       0000.0000.0001    blackhole   drop
```

**相关命令**：mac-address-table、3.4 VLAN 命令


## 3.4 VLAN 命令

### 3.4.1 `vlan database`

**功能**：使用该命令进入VLAN 配置模式。

**语法**：

```
vlan database
```

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

当要创建或删除一个VLAN 时，必须首先使用该命令进入VLAN 配置模式。使用exit
  命令退出VLAN 配置模式。

**示例**：

```
以下例子说明了进入VLAN 配置模式:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)#
以下例子说明了退出VLAN 配置模式:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# exit
Switch(config)#
```

**相关命令**：exit

### 3.4.2 `vlan`

**功能**：使用该命令配置VLAN 数据结构中的VLAN 特性。使用 no 命令删除一个VLAN。

**语法**：

```
vlan VLAN_ID ( name NAME | ) ( state ( enable | disable ) | )
no vlan VLAN_ID
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | Vlan 标识 1-4094 |
| NAME | 特定VLAN 的名称不超过128 个字符 |
| enable | 设定VLAN 有效可操作， 默认值为enable |
| disable | 设定VLAN 不可操作 |

**命令模式**：VLAN 配置模式

**默认配置**：VLAN 1 是默认的VLAN，不可删除。所有接口默认都添加到VLAN1 中。

**使用说明**：

vlan1 默认创建，无法删除

**示例**：

```
以下例子说明了创建 VLAN 11 并且命名为“vlan11”:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# vlan 11 name vlan11 state enable
以下例子说明了移除 VLAN 11:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# no vlan 11
```

**相关命令**：vlan VLAN_LIST、show vlan vlan、show vlan all

### 3.4.3 `vlan VLAN_LIST`

**功能**：使用该命令添加一个范围内的VLAN 序列到VLAN 数据结构中。

**语法**：

```
vlan VLAN_LIST
no vlan VLAN_LIST
```

| 参数 | 说明 |
| --- | --- |
| VLAN_LIST | VLAN 序列 VLAN 序列以‘-’ 和‘,’符号相连接，如 “1-10,15,20,30- 40” |

**命令模式**：VLAN 配置模式

**默认配置**：VLAN 1 是默认的VLAN，不可删除。所有接口默认都添加到VLAN1 中。

**使用说明**：

VLAN 序列以‘-’ 和‘,’符号相连接，VLAN 的值的范围在1-4094 之间，并且VLAN 序列
  的值需要符合升序的原则。

**示例**：

```
以下例子说明了添加VLAN 序列“100,200,300-400”:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# vlan 100,200,300-400
以下例子说明了移除VLAN 序列“100,200,300-400”:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# no vlan 100,200,300-400
```

**相关命令**：vlan <1-4094>、show vlan vlan、show vlan all

### 3.4.4 `show vlan`

**功能**：使用该命令显示特定VLAN 的信息。

**语法**：

```
show vlan VLAN_ID
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| vlan id | 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用来显示特定VLAN 的相关属性信息，包括：名称、状态、stp id、DSCP 和接
  口信息。

**示例**：

```
以下例子说明了显示VLAN 11 的相关信息:
Switch# show vlan 11
VLAN ID  Name                           State   STP ID  Member ports

                                                        (u)-Untagged, (t)-Tagged
======= =============================== ======= ======= ========================
11      VLAN0011                        ACTIVE  0       eth-0-3(u) eth-0-4(t)
```

**相关命令**：show vlan all

### 3.4.5 `show vlan all`

**功能**：使用该命令显示所有VLAN 的信息。

**语法**：

```
show vlan all
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用来显示所有VLAN 的相关属性信息，包括：名称、状态、stp id、DSCP 和接
  口信息。

**示例**：

```
以下例子说明了显示所有VLAN 的信息:
Switch# show vlan all
VLAN ID  Name                           State   STP ID  Member ports

                                                        (u)-Untagged, (t)-Tagged
======= =============================== ======= ======= ========================
1       default                         ACTIVE  0       eth-0-1(u) eth-0-2(u)
                                                        eth-0-4(t) eth-0-5(u)
11      VLAN0011                        ACTIVE  0       eth-0-3(u) eth-0-4(t)
```

**相关命令**：show vlan vlan

### 3.4.6 `show vlan brief`

**功能**：使用该命令显示所有设备VLAN 的简要信息。

**语法**：

```
show vlan brief
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用来显示所有设备VLAN 的简要信息，包括静态和动态信息。

**示例**：

```
使用该命令显示所有设备VLAN 的简要信息:
Switch# show vlan brief
VLAN ID  Name                           State   STP ID  Member ports
                                                        (u)-Untagged, (t)-Tagged
======= =============================== ======= ======= ========================
1       default                         ACTIVE  0       eth-0-1(u) eth-0-2(u)
                                                        eth-0-4(u) eth-0-5(u)
10      VLAN0010                        ACTIVE  0       eth-0-3(u)
```

**相关命令**：show vlan vlan

### 3.4.7 `show interface switchport`

**功能**：使用该命令显示特定交换接口或所有交换接口的vlan 配置信息。

**语法**：

```
show interface switchport { interface IFNAME | }
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称支持聚合口和物理口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用来显示一个或所有VLAN 的二层配置信息。

**示例**：

```
以下例子说明了显示特定交换接口或所有交换接口的vlan 配置信息:
Switch# show interface switchport interface eth-0-1
 Interface name          : eth-0-1
 Switchport mode         : access
 Ingress filter          : enable
 Acceptable frame types  : vlan-untagged only
 Default Vlan            : 1
 Configured Vlans        : 1

 Interface name          : eth-0-2
 Switchport mode         : access
 Ingress filter          : enable
 Acceptable frame types  : vlan-untagged only
 Default Vlan            : 1
 Configured Vlans        : 1
```

**相关命令**：switchport mode access、switchport mode trunk

### 3.4.8 `switchport access allowed`

**功能**：使用该命令允许或禁止来自特定VLAN 的报文通过access 界面。

**语法**：

```
switchport access allowed vlan ( add｜remove ) VLAN_ID_LIST
```

| 参数 | 说明 |
| --- | --- |
| add | 允许来自特定VLAN 的报文通过access 界面 |
| remove | 禁止来自特定VLAN 的报文通过access 界面 |
| VLAN_ID_LIST | VLAN 序列使用 ‘-’和 ‘,’符号连接，如： “1-10,15,20,30-40” |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

该命令用来允许或禁止来自特定VLAN 的报文通过access 界面。

**示例**：

```
以下例子说明了允许来自VLAN 11 的报文通过access 接口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport access allowed vlan add 11
以下例子说明了禁止来自VLAN 12 的报文通过access 界面:

Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport access allowed vlan remove 12
```

**相关命令**：switchport trunk allowed

### 3.4.9 `switchport access vlan`

**功能**：使用该命令添加一个access 接口 到特定的VLAN 中。可以使用no 命令恢复access 接
  口到默认的VLAN1 中。

**语法**：

```
switchport access vlan VLAN_ID
no switchport access vlan
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | Vlan 标识 2-4094 |

**命令模式**：端口配置模式

**默认配置**：所有的接口默认添加到vlan 1 中

**使用说明**：

在使用该命令前需要使用switchport mode access 命令将接口设置成access 接口类型。

**示例**：

```
以下命令说明了将接口添加到vlan 11 中:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport access vlan 11
以下命令说明了将接口恢复到默认的vlan 1 中:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport access vlan
```

**相关命令**：switchport mode access

### 3.4.10 `switchport mode access`

**功能**：使用该命令设置接口成为access 类型。

**语法**：

```
switchport mode access
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

access 模式用来连接到终端设备，如：PC。当端口配置模式更改时，该接口上学习到
  的动态MAC 位址和配置的静态位址都将被清空。

**示例**：

```
以下例子说明了设置接口成为access 类型:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport mode access
```

**相关命令**：switchport mode trunk

### 3.4.11 `switchport mode trunk`

**功能**：使用该命令设置接口成为trunk 类型。使用switchport mode access 命令恢复接口到默
  认的模式。

**语法**：

```
switchport mode trunk
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

trunk 模式可以用来连接其它交换设备，也可以连接主机设备。当端口配置模式更改时，
  该接口上学习到的动态MAC 位址和配置的静态位址都将被清空。

**示例**：

```
以下例子说明了设置接口成为trunk 类型:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport mode trunk
```

**相关命令**：switchport mode access

### 3.4.12 `switchport trunk allowed`

**功能**：使用该命令允许来自特定VLAN 的报文在trunk 类型的接口上传送，使用no 命令取消
  该命令设置。

**语法**：

```
switchport trunk allowed vlan ( add VLAN_ID_LIST｜remove VLAN_ID_LIST | all | none )
no switchport trunk
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID_LIST | VLAN 序列使用 ‘-’和 ‘,’符号连接，如： “1-10,15,20,30-40” |
| add | 允许来自特定VLAN 的报文在trunk 类型的界面上传送 |
| remove | 禁止来自特定VLAN 的报文在trunk 类型的界面上传送 |
| all | 允许来自所有VLAN 的报文在trunk 类型的接口上传送 |
| none | 禁止来自所有VLAN 的报文在trunk 类型的接口上传送 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

该命令用来允许来自特定VLAN 的报文在trunk 类型的界面上传送。

**示例**：

```
以下例子说明了允许来自VLAN11,12 的报文在trunk 类型的界面上传送:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport trunk allowed vlan add 11,12
以下例子说明了禁止来自VLAN11,12 的报文在trunk 类型的界面上传送:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport trunk allowed vlan remove 11,12
以下例子说明了允许来自所有VLAN 的报文在trunk 类型的接口上传送:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport trunk allowed vlan all
以下例子说明了禁止来自所有VLAN 的报文在trunk 类型的接口上传送:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport trunk allowed vlan none
```

**相关命令**：switchport access allowed

### 3.4.13 `switchport trunk native`

**功能**：使用该命令设置能够发送和接收没有tag 报文的本地VLAN。使用no 命令恢复本地
  VLAN 到默认值。

**语法**：

```
switchport trunk native vlan VLAN_ID
no switchport trunk native vlan
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | 已存在的VLAN ID 2-4094 |

**命令模式**：端口配置模式

**默认配置**：vlan 1

**使用说明**：

该命令用来设置能够发送和接收没有tag 报文的本地VLAN。

**示例**：

```
以下例子说明了在接口上设置VLAN 10 为本地VLAN:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport trunk native vlan 10
以下例子说明了在接口上恢复本地VLAN 到默认值:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport trunk native vlan
```

**相关命令**：switchport trunk allowed

### 3.4.14 `switchport trunk unatgged vlan`

**功能**：使用该命令剥离从该trunk 口转发出去报文的指定vlan tag。

**语法**：

```
switchport trunk untagged vlan VLAN_ID_LIST
no switchport trunk untagged vlan VLAN_ID_LIST
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID_LIST | VLAN 序列使用 ‘-’和 ‘,’符号连接，如： “1-10,15,20,30-40” |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下例子说明了如何在接口上配置转发出去要剥除的vlan tag:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport trunk untagged vlan 1-2
```

**相关命令**：无

### 3.4.15 `vlan bridge disable`

**功能**：使用该命令可以关闭特定vlan 上的桥功能，使该vlan 丢弃所有通过的二层报文。

**语法**：

```
vlan VLAN_ID bridge disable
no vlan vlan bridge disable
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | Vlan 标识 1-4094 |

**命令模式**：VLAN 配置模式

**默认配置**：打开vlan 上的桥功能

**使用说明**：

无

**示例**：

```
以下示例展示了如何关闭VLAN 2 上的桥功能:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# vlan 10 bridge disable
以下示例展示了如何打开VLAN 2 上的桥功能:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# no vlan 10 bridge disable
```

**相关命令**：无

### 3.4.16 `vlan statistics enable`

**功能**：使用该命令可以使能基于vlan 的报文统计。

**语法**：

```
vlan VLAN_ID statistics enable
no vlan VLAN_ID statistics enable
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | Vlan 标识 1-4094 |

**命令模式**：VLAN 配置模式

**默认配置**：关闭

**使用说明**：

无

**示例**：

```
以下示例展示了如何使能VLAN 2 上的统计功能:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# vlan 2 statistics enable
以下示例展示了如何关闭VLAN 2 上的统计功能:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)#no vlan 2 statistics enable
```

**相关命令**：vlan statistics interval、clear vlan statistics、show vlan vlan statistics

### 3.4.17 `vlan statistics interval`

**功能**：使用该命令可以配置vlan 统计的采样间隔时间。

**语法**：

```
vlan statistics interval VALUE
no vlan statistics intval
```

| 参数 | 说明 |
| --- | --- |
| VALUE | 采样间隔时间 5-600，单位：秒 |

**命令模式**：VLAN 配置模式

**默认配置**：10 秒

**使用说明**：

无

**示例**：

```
以下示例展示了如何配置vlan 统计间隔时间:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# vlan statistics interval 20
```

**相关命令**：vlan statistics enable、clear vlan statistics、show vlan vlan statistics

### 3.4.18 `clear vlan statistics`

**功能**：使用该命令可以清空统计信息。

**语法**：

```
clear vlan VLAN_ID statistics
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | Vlan 标识 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何清空vlan2 的统计信息:
Switch# clear vlan 2 statistics
```

**相关命令**：vlan statistics enable、vlan statistics interval、show vlan vlan statistics

### 3.4.19 `show vlan statistics`

**功能**：使用该命令可以显示统计信息。

**语法**：

```
show vlan VLAN_ID statistics
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | Vlan 标识 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何显示vlan2 的统计信息:
Switch# show vlan all statistics
 --------------------------------------------------------------------------------
VLANID  InPkts           OutPkts          InBytes            OutBytes
--------------------------------------------------------------------------------
2       0                0                0                  0
```

**相关命令**：vlan statistics enable、vlan statistics interval

### 3.4.20 `show resource vlan-stats`

**功能**：使用该命令可以显示当前使用的vlan statistics 的资源数目

**语法**：

```
show resource vlan-stats
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何显示当前使用的vlan statistics 的资源数目:
Switch# show resource vlan-stats
VLAN-STATS
Resource                         Used          Capability
=============================================================
Applied VLAN Stats Entry         1             128
```

**相关命令**：vlan statistics enable

### 3.4.21 `vlan statistics include-interframe`

**功能**：使用该命令使能vlan 报文统计包含帧间隙。

**语法**：

```
vlan VLAN_ID statistics include-interframe enable
vlan VLAN_ID statistics include-interframe disable
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | Vlan 标识 1-4094 |

**命令模式**：VLAN 配置模式

**默认配置**：关闭

**使用说明**：

无

**示例**：

```
以下示例展示了如何使能VLAN 2 上的统计包含帧间隙:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# vlan 2 statistics include-interframe enable
以下示例展示了如何关闭VLAN 2 上的统计包含帧间隙:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)#vlan 2 statistics include-interframe disable
```

**相关命令**：vlan statistics enable、clear vlan statistics、、3.5 VOICE VLAN 命令


## 3.5 VOICE VLAN 命令

### 3.5.1 `voice vlan`

**功能**：使用该命令指定某个VLAN 做为VOICE VLAN。

**语法**：

```
voice vlan VLAN_ID
no voice vlan
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | Vlan 标识 2-4094 |

**命令模式**：全局配置模式

**默认配置**：未启用

**使用说明**：

该命令用于全局启用VOICE VLAN。

**示例**：

```
将VLAN 指定为VOICE VLAN:
Switch# configure terminal
Switch(config)# voice vlan 2
```

**相关命令**：无

### 3.5.2 `voice vlan security enable`

**功能**：使用该命令启用VOICE VLAN 的安全模式。

**语法**：

```
voice vlan security enable
no voice vlan security enable
```

**命令模式**：全局配置模式

**默认配置**：默认启用

**使用说明**：

启用安全模式后，VOICE VLAN 中没有匹配OUI 的所有报文都会被丢弃。

**示例**：

```
启用VOICE VLAN:
Switch# configure terminal
Switch(config)# voice vlan security enable
```

**相关命令**：show voice vlan state

### 3.5.3 `voice vlan set cos to`

**功能**：使用该命令设置通过VOICE VLAN 报文的COS。

**语法**：

```
voice vlan set cos to COS
no voice vlan set cos
```

| 参数 | 说明 |
| --- | --- |
| COS | cos 值 0-7 |

**命令模式**：全局配置模式

**默认配置**：默认为5

**使用说明**：

该命令用于设置通过VOICE VLAN 报文的COS。

**示例**：

```
将报文的COS 修改为7:
Switch# configure terminal
Switch(config)# voice vlan set cos to 7
```

**相关命令**：show voice vlan state

### 3.5.4 `voice vlan mac-address`

**功能**：使用该命令为VOICE VLAN 添加OUI。

**语法**：

```
voice vlan mac-address MAC MASK description LINE
no voice vlan mac-address MAC
```

| 参数 | 说明 |
| --- | --- |
| MAC | 要加到mac 地址表的mac 地址（单播或者组播） MAC 地址，格式为 |
| HHHH.HHHH.HHHH |  |
| MASK | 源mac 掩码 MAC 掩码，格式为 |
| HHHH.HHHH.HHHH |  |
| LINE | OUI 说明信息不超过63 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：在系统中有五条默认OUI： 0003-6b00-0000 phone  000f-e200-0000 phone 00d0-1e00-0000 phone 00e0-7500-0000 phone 00e0-bb00-0000 phone

**使用说明**：

该命为系统添加新的OUI。只有匹配OUI 的报文才会被认为是语音报文。

**示例**：

```
如何为系统添加一条新的OUI:
Switch# configure terminal
Switch(config)# voice vlan mac-address 0034.3400.0000 FFFF.FF00.0000 description
test
```

**相关命令**：show voice vlan state

### 3.5.5 `voice vlan enable`

**功能**：使用该命令在端口上启用VOICE VLAN。

**语法**：

```
voice vlan enable
no voice vlan enable
```

**命令模式**：端口配置模式

**默认配置**：默认不启用

**使用说明**：

该命令用于在端口上启用VOICE VLAN。

**示例**：

```
在端口上启用VOICE VLAN 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# voice vlan enable
```

**相关命令**：show voice vlan state

### 3.5.6 `show voice vlan state`

**功能**：使用该命令显示当前VOICEC VLAN 的配置。

**语法**：

```
show voice vlan state
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于显示当前VOICEC VLAN 的配置。

**示例**：

```
显示当前系统的VOICEC VLAN 配置:
Switch# show voice vlan state
```

**相关命令**：voice vlan enable、、3.6 Link Aggregation 命令


## 3.6 Link Aggregation 命令

### 3.6.1 `channel-group`

**功能**：使用该命令来将端口加入某一动态聚合组。使用该命令的no 形式将端口移出该动态聚
  合组。

**语法**：

```
channel-group GROUP_NUMBER mode ( active | passive )
no channel-group
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 聚合组ID 1-63 |
| active | 在端口上使能动态聚合组 |
| passive | 在端口上去使能动态聚合组 - |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何将端口加入聚合组1:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# channel-group 1 mode active
下面的例子显示了如何将端口从聚合组1 里移出:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no channel-group
```

**相关命令**：无

### 3.6.2 `static-channel-group`

**功能**：使用该命令将端口加入静态聚合组。使用该命令的no 形式将端口移出该静态聚合组。

**语法**：

```
static-channel-group GROUP_NUMBER
no static-channel-group
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 聚合组ID 0-63 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何将端口加入聚合组1:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# static-channel-group 1
下面的例子显示了如何将端口从聚合组1 里移出:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no static-channel-group
```

**相关命令**：无

### 3.6.3 `distribute-weight`

**功能**：使用该命令用来配置成员端口的权重值，使用该命令的no 形式恢复成员权重默认值。

**语法**：

```
distribute-weight WEIGHT
```

| 参数 | 说明 |
| --- | --- |
| WEIGHT | 权重值 1-256 |

**命令模式**：端口配置模式

**使用说明**：

权重仅支持在静态负载均衡的非self-healing 模式下的成员口配置，且成员口总权重不
  能超过最大成员口数。

**示例**：

```
下面的例子显示了如何将成员端口的权重值设置为10:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# static-channel-group 1
Switch(config-if)# distribute-weight 10
下面的例子显示了如何将成员端口的权重恢复默认值:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# static-channel-group 1
Switch(config-if)# no distribute-weight
```

**相关命令**：无

### 3.6.4 `lacp max-active-linknumber`

**功能**：使用该命令用来配置聚合口的LACP 最大活动接口，使用该命令的no 形式恢复聚合口
  最大活动接口默认值。

**语法**：

```
lacp max-active-linknumber NUMBER
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | 最大活动接口 1-255 |

**命令模式**：端口配置模式

**使用说明**：

最大活动接口仅支持配置在LACP 聚合口下。

**示例**：

```
下面的例子显示了如何将LACP 聚合口的最大活动接口数设置为100:
Switch# configure terminal
Switch(config)# interface agg1
Switch(config-if)# lacp max-active-linknumber 100
下面的例子显示了如何将LACP 聚合口的最大活动接口数恢复默认值:
Switch# configure terminal
Switch(config)# interface agg1
Switch(config-if)# no lacp max-active-linknumber
```

**相关命令**：无

### 3.6.5 `lacp preempt enable`

**功能**：使用该命令用来使能聚合口的LACP 抢占，使用该命令的no 形式去使能聚合口的抢占。

**语法**：

```
lacp preempt enable
no lacp preempt enable
```

**命令模式**：端口配置模式

**默认配置**：默认关闭

**使用说明**：

抢占功能仅支持配置在LACP 聚合口下。

**示例**：

```
下面的例子显示了如何使能LACP 聚合口的抢占功能:
Switch# configure terminal
Switch(config)# interface agg1
Switch(config-if)# lacp preempt enable
下面的例子显示了如何去使能LACP 聚合口的抢占功能:
Switch# configure terminal
Switch(config)# interface agg1
Switch(config-if)# no lacp preempt enable
```

**相关命令**：无

### 3.6.6 `lacp preempt delay`

**功能**：使用该命令用来配置聚合口的LACP 抢占延时，使用该命令的no 形式恢复聚合口抢占
  延时默认值。

**语法**：

```
lacp preempt delay TIME
no lacp preempt delay
```

| 参数 | 说明 |
| --- | --- |
| TIME | 抢占时延时间 0-180 |

**命令模式**：端口配置模式

**使用说明**：

抢占时延仅支持配置在LACP 聚合口下，且在使能抢占情况下才生效。

**示例**：

```
下面的例子显示了如何将LACP 聚合口的抢占延时设置为100 秒:
Switch# configure terminal
Switch(config)# interface agg1
Switch(config-if)# lacp preempt delay 100
下面的例子显示了如何将聚合口的抢占延时恢复默认值:
Switch# configure terminal
Switch(config)# interface agg1
Switch(config-if)# no lacp preempt delay
```

**相关命令**：无

### 3.6.7 `lacp port-id extend`

**功能**：使用该命令用来配置LACP 端口号的扩展，使用该命令的no 形式恢复端口优先级默认
  值。

**语法**：

```
lacp port-id extend Value
```

| 参数 | 说明 |
| --- | --- |
| VALUE | 扩展值 1-2 |

**命令模式**：端口配置模式

**默认配置**：默认关闭

**使用说明**：

无

**示例**：

```
下面的例子显示了如何将agg 口的端口扩展值设置为1:
Switch# configure terminal
Switch(config)# interface agg1
Switch(config-if)# lacp port-id extend 1
下面的例子显示了如何将agg 口端口扩展值恢复默认值:
Switch# configure terminal
Switch(config)# interface agg1
Switch(config-if)# no lacp port-id extend
```

**相关命令**：无

### 3.6.8 `lacp port-priority`

**功能**：使用该命令用来配置端口的LACP 协议优先级，使用该命令的no 形式恢复端口优先级
  默认值。

**语法**：

```
lacp port-priority PRIORITY
```

| 参数 | 说明 |
| --- | --- |
| PRIORITY | 优先级 1-65535 |

**命令模式**：端口配置模式

**默认配置**：32768

**使用说明**：

无

**示例**：

```
下面的例子显示了如何将端口的LACP 优先级设置为100:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# lacp port-priority 100
下面的例子显示了如何将端口的优先级恢复默认值:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no lacp port-priority
```

**相关命令**：无

### 3.6.9 `lacp timeout`

**功能**：使用该命令来设置端口的LACP 超时时间。使用该命令的no 形式恢复默认值。

**语法**：

```
lacp timeout ( short | long )
```

| 参数 | 说明 |
| --- | --- |
| short | 设置LACP 超时时间为长超时 |
| long | 设置LACP 超时时间为短超时 |

**命令模式**：端口配置模式

**默认配置**：Long

**使用说明**：

无

**示例**：

```
下面的例子显示了如何将端口的LACP 超时时间设置为短模式:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# lacp timeout short
下面的例子显示了如何将端口的LACP 超时时间恢复为默认值:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no lacp timeout
```

**相关命令**：无

### 3.6.10 `lacp system-priority`

**功能**：使用该命令用来配置系统的LACP 协议优先级，使用该命令的no 形式恢复系统优先级
  默认值。

**语法**：

```
lacp system-priority PRIORITY
```

| 参数 | 说明 |
| --- | --- |
| PRIORITY | LACP 系统优先级 1-65535 |

**命令模式**：全局配置模式

**默认配置**：32768

**使用说明**：

无

**示例**：

```
下面的例子显示了如何将系统的LACP 优先级设置为100:
Switch# configure terminal
Switch(config)# lacp system-priority 100
下面的例子显示了如何将系统的优先级恢复默认值:
Switch# configure terminal
Switch(config)# no lacp system-priority
```

**相关命令**：无

### 3.6.11 `lacp mlag system-id`

**功能**：使用该命令用来配置系统的LACP mlag 系统id，使用该命令的no 形式恢复系统id 默
  认值。

**语法**：

```
lacp mlag system-id MAC
no lacp mlag system-id
```

| 参数 | 说明 |
| --- | --- |
| MAC | LACP mlag 系统id Mac 地址，格式为 |
| HHHH.HHHH.HHHH |  |

**命令模式**：全局配置模式

**默认配置**：系统route-mac

**使用说明**：

无

**示例**：

```
下面的例子显示了如何将系统的LACP mlag system-id 设置为1111.1111.1111:
Switch# configure terminal
Switch(config)# lacp mlag system-id 1111.1111.1111
下面的例子显示了如何将系统的mlag system-id 恢复默认值:
Switch# configure terminal
Switch(config)# no lacp mlag system-id
```

**相关命令**：无

### 3.6.12 `port-channel channel-group-number load-balance-mode dynamic`

**功能**：使用该命令使能动态负载均衡。

**语法**：

```
port-channel GROUP_NUMBER load-balance-mode dynamic ( flow-number
FLOW_NUMBER | )
no port-channel GROUP_NUMBER load-balance-mode
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 需要使能动态负载均衡的聚合组ID 0-63 |
| FLOW_NUMBER | 配置聚合组支持的成员数， 默认32，支持 32/64/128/256/512/1024/2 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

系统默认不为聚合组使能动态负载均衡， 使能/去使能动态负载均衡模式前， 聚合组
  必须没有被创建。

**示例**：

```
下面的例子显示了如何使能agg1 上的动态负载均衡:
Switch# configure terminal
Switch(config)# port-channel 1 load-balance-mode dynamic
```

**相关命令**：无

### 3.6.13 `port-channel channel-group-number load-balance-mode resilient`

**功能**：使用该命令使能resilient 负载均衡。

**语法**：

```
port-channel GROUP_NUMBER load-balance-mode resilient ( flow-number
FLOW_NUMBER | )
no port-channel channel-group-number load-balance-mode
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 需要使能resilient 负载均衡的聚合组ID 0-63 |
| FLOW_NUMBER | 配置聚合组支持的成员数， 默认32，支持 32/64/128/256 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

系统默认不为聚合组使能resilient 负载均衡， 使能/去使能resilient 负载均衡模式前，
  聚合组必须没有被创建。

**示例**：

```
下面的例子显示了如何使能agg1 上的resilient 负载均衡:
Switch# configure terminal
Switch(config)# port-channel 1 load-balance-mode resilient
```

**相关命令**：无

### 3.6.14 `port-channel channel-group-number load-balance-mode round-robin`

**功能**：使用该命令使能round-robin 负载均衡。

**语法**：

```
port-channel GROUP_NUMBER load-balance-mode round-robin ( flow-number
FLOW_NUMBER | )
no port-channel GROUP_NUMBER load-balance-mode
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 需要使能round-robin 负载均衡的聚合组ID 0-63 |
| FLOW_NUMBER | 配置聚合组支持的成员数， 默认24. |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

系统默认不为聚合组使能round-robin 负载均衡， 使能/去使能round-robin 负载均衡
  模式前， 聚合组必须没有被创建。

**示例**：

```
下面的例子显示了如何使能agg1 上的round-robin 负载均衡:
Switch# configure terminal
Switch(config)# port-channel 1 load-balance-mode round-robin
```

**相关命令**：无

### 3.6.15 `port-channel channel-group-number self-healing`

**功能**：使用该命令使能self-healing。

**语法**：

```
port-channel GROUP_NUMBER self-healing
no port-channel GROUP_NUMBER self-healing
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 需要使能self-healing 负载均衡的聚合组ID 0-63 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

系统默认不为聚合组使能self-healing， 使能/去使能self-healing 模式前， 聚合组必
  须没有被创建。

**示例**：

```
下面的例子显示了如何使能agg1 上的self-healing 功能:

Switch# configure terminal
Switch(config)# port-channel 1 self-healing
```

**相关命令**：无

### 3.6.16 `port-channel channel-group-number static`

**功能**：使用该命令使能静态负载均衡

**语法**：

```
port-channel GROUP_NUMBER load-balance-mode static ( flow-number
FLOW_NUMBER | )
no port-channel GROUP_NUMBER load-balance-mode
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 需要使能静态负载均衡的聚合组ID 0-63 |
| FLOW_NUMBER | 配置聚合组支持的成员数， 默认16，支持 1~24/32/64/128 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

系统默认为聚合组使能静态负载均衡， 使能/去使能负载模式前， 聚合组必须没有被
  创建。

**示例**：

```
下面的例子显示了如何使能agg1 上的静态负载均衡:
Switch# configure terminal
Switch(config)# port-channel 1 load-balance-mode static
```

**相关命令**：无

### 3.6.17 `port-channel channel-group-number lacp-mode dynamic`

**功能**：使用该命令使能动态LACP

**语法**：

```
port-channel GROUP_NUMBER lacp-mode dynamic
no port-channel GROUP_NUMBER lacp-mode
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 需要使能动态LACP 的聚合组ID 0-63 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

系统默认不为聚合组使能动态LACP， 使能/去使能动态LACP 前， 聚合组必须没有被
  创建。

**示例**：

```
下面的例子显示了如何使能agg1 上的动态LACP:
Switch# configure terminal
Switch(config)# port-channel 1 lacp-mode dynamic
```

**相关命令**：无

### 3.6.18 `port-channel group-mode`

**功能**：使用该命令切换聚合组支持的模式。使用该命令的no 形式恢复模式模式。
  LACP 不支持id 为0 的链路聚合组。

**语法**：

```
port-channel group-mode ( flexible | 8 | 16 | 32 | 56 )
no port-channel group-mode
```

| 参数 | 说明 |
| --- | --- |
| flexible | 聚合组模式8，支持聚合组范围0~63 聚合组模式8，支持聚合组范围0~7 聚合组模式16，支持聚合组范围0~15 聚合组模式32，支持聚合组范围0~31 聚合组模式56，支持聚合组范围0~55 |

**命令模式**：全局配置模式

**默认配置**：flexible

**使用说明**：

配置模式后，必须保存配置并重启才会生效。

**示例**：

```
下面的例子显示了如何切换聚合组模式到32:
Switch# configure terminal
Switch(config)# port-channel group-mode 32
```

**相关命令**：无

### 3.6.19 `local-preference`

**功能**：使用该命令配置指定聚合组的本地优先转发模式。

**语法**：

```
local-preference （enable | disable）
```

| 参数 | 说明 |
| --- | --- |
| enable | 使能本地优先转发 |
| disable | 去使能本地优先转发 |

**命令模式**：端口配置模式

**默认配置**：使能本地优先转发

**使用说明**：

无

**示例**：

```
下面的例子显示了如何配置聚合组的本地优先转发模式:
DUT1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
DUT1(config)# interface agg 1
DUT1(config-if)# local-preference enable
```

**相关命令**：无

### 3.6.20 `show channel-group summary`

**功能**：使用该命令来显示所有的聚合组或者某个指定的聚合组。

**语法**：

```
show channel-group ( channel-group-number | ) summary
```

| 参数 | 说明 |
| --- | --- |
| channel-group-number | 聚合组ID 0-63 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何显示所有的聚合组信息:
Switch# show channel-group summary
port-channel load-balance hash-arithmetic: xor
port-channel load-balance hash-field-select:
        ipsa ipda srcport dstport ip-protocol
port-channel group-mode: flexible

Flags:  s - Suspend           T - Standby
        D - Down/Admin down   B - In bundle
        R - Layer3            S - Layer2
        w - Wait              U - In use

Mode:   SLB  - Static load balance
        DLB  - Dynamic load balance
        RR   - Round robin load balance

        RLB  - Resilient load balance
Aggregator Name  Mode      Protocol     Ports
----------------+---------+------------+----------------------------------------
-------
agg4(SD)         SLB       Static       eth-0-10(D)
```

**相关命令**：无

### 3.6.21 `show channel-group detail`

**功能**：使用该命令显示所有的聚合组或某个指定聚合组的详细信息。

**语法**：

```
show channel-group ( GROUP_NUMBER | ) detail
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 聚合组ID 0-63 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示如何显示某个指定聚合组的详细信息:
Switch# show channel-group detail
                Channel-group listing:
                ----------------------

Group: 4
----------
Group state: L2
Ports: 1   Maxports: 16
Number of ports in bundle: 0 Max Channel-groups: 63
Protocol:   Static
                Ports in the group:
                -------------------

Port: eth-0-10
------------

Port state    : down Not-in-Bndl
Channel group : 4           Protocol : Static          Port-channel  : agg4
Port index    : 10
```

**相关命令**：无

### 3.6.22 `show lacp internal`

**功能**：使用该命令来显示LACP 的内部信息。

**语法**：

```
show lacp ( GROUP_NUMBER | ) internal
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 聚合组ID 0-63 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了所有聚合组的内部信息:
Switch# show lacp internal
Flags:  S - Device is requesting Slow LACPDUs
        F - Device is requesting Fast LACPDUs
        A - Device is in Active mode       P - Device is in Passive mode

Channel group 1
                           LACP port Admin   Oper    Port    Port
Port        Flags  State     Priority  key     Key     Number  State
eth-0-9     SA     bndl      32768     1       1       0x9     0x3d
```

**相关命令**：无

### 3.6.23 `show lacp internal detail`

**功能**：使用该命令显示LACP 的详细内部信息。

**语法**：

```
show lacp ( GROUP_NUMBER | ) internal detail
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 聚合组ID 0-63 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了所有聚合组的详细内部信息:
Switch# show lacp internal detail
Flags:  S - Device is requesting Slow LACPDUs
        F - Device is requesting Fast LACPDUs
        A - Device is in Active mode       P - Device is in Passive mode
Channel group 1
Actor's information:

          Actor                   Actor        Actor
Port      System ID               Port Number  Flags
eth-0-9   32768,e0ef.1a32.7e00    0x9          SA

          LACP Actor         Actor         Actor
          Port Priority      Oper Key      Port State
          32768              1             0x4d

          Port State Flags Decode:

          Activity:   Timeout:   Aggregation:   Synchronization:
          Active      Long       Yes            Yes

          Collecting:   Distributing:   Defaulted:   Expired:
          No            No              Yes          No
```

**相关命令**：无

### 3.6.24 `show lacp neighbor`

**功能**：使用该命令显示所有聚合组或某个指定聚合组的邻居信息。

**语法**：

```
show lacp ( GROUP_NUMBER | ) neighbor
```

| 参数 | 说明 |
| --- | --- |
| channel-group- |  |
| numberGROUP_NUMBER | 聚合组ID 0-63 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了所有聚合组的邻居信息:
Switch# show lacp neighbor
Flags:  S - Device is requesting Slow LACPDUs
        F - Device is requesting Fast LACPDUs
        A - Device is in Active mode       P - Device is in Passive mode

Channel group 1 neighbors

Partner's information:

                 LACP port                     Admin   Oper    Port      Port
Port      Flags  Priority   Dev ID             key     Key     Number    State
eth-0-9   FP     0          0000.0000.0000     0       0       0x0       0x46
```

**相关命令**：无

### 3.6.25 `show lacp neighbor detail`

**功能**：使用该命令显示所有聚合组或某个指定聚合组的详细邻居信息。

**语法**：

```
show lacp ( GROUP_NUMBER | ) neighbor detail
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 聚合组ID 0-63 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了所有聚合组的详细邻居信息:
Switch# show lacp neighbor detail
Flags:  S - Device is requesting Slow LACPDUs
        F - Device is requesting Fast LACPDUs
        A - Device is in Active mode       P - Device is in Passive mode
Channel group 1 neighbors
Partner's information:

          Partner                 Partner        Partner
Port      System ID               Port Number    Flags
eth-0-9   32768,0000.0000.0000    0x0            SP

          LACP Partner         Partner         Partner

          Port Priority        Oper Key        Port State
          0                    0               0x44

          Port State Flags Decode:
          Activity:   Timeout:   Aggregation:   Synchronization:
          Passive     Long       Yes            No

          Collecting:   Distributing:   Defaulted:   Expired:
          No            No              Yes          No
```

**相关命令**：无

### 3.6.26 `show channel-group port`

**功能**：使用该命令来显示指定端口的链路聚合信息。

**语法**：

```
show channel-group port ( IFNAME | )
show channel-group GROUP_NUMBER port
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 端口名称支持物理口 |
| GROUP_NUMBER | 聚合组ID 0-63 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了所有端口上的链路聚合信息:
Switch# show channel-group port
                Channel-group listing:

                ----------------------

Group: 1
----------
                Ports in the group:
                -------------------

Port: eth-0-9
------------

Port state     : Up Sngl-port-Bndl Not-in-Bndl
Channel number : 1           Protocol : LACP          Channel-group  : agg1
Port index     : 9           Mode     : Active

Flags:  S - Device is sending Slow LACPDUs  F - Device is sending fast LACPDUs
        A - Device is in active mode        P - Device is in passive mode

Local information:
Actor                       LACP port     Admin     Oper    Port        Port
Port      Flags   State     Priority      Key       Key     Number      State
eth-0-9   SA      indep     32768         1         1       9         0x4d

Partner's information:

Actor             LACP port                     Oper   Port      Port
Port      Flags   Priority   Dev ID             Key    Number    State
eth-0-9   SP      0          0000.0000.0000     0      0       0x44
下面的例子显示了指定端口的链路聚合信息:
Switch# show channel-group port eth-0-9
Port: eth-0-9
------------

Port state     : Up Sngl-port-Bndl Not-in-Bndl
Channel number : 1           Protocol : LACP          Channel-group  : agg1
Port index     : 9           Mode     : Active

Flags:  S - Device is sending Slow LACPDUs  F - Device is sending fast LACPDUs
        A - Device is in active mode        P - Device is in passive mode

Local information:
Actor                       LACP port     Admin     Oper    Port        Port
Port      Flags   State     Priority      Key       Key     Number      State
eth-0-9   SA      indep     32768         1         1       9         0x4d

Partner's information:

Actor             LACP port                     Oper   Port      Port
Port      Flags   Priority   Dev ID             Key    Number    State
eth-0-9   SP      0          0000.0000.0000     0      0       0x44
```

**相关命令**：无

### 3.6.27 `show lacp counters`

**功能**：使用该命令显示所有聚合组或某个指定聚合组的报文统计信息。

**语法**：

```
show lacp [ GROUP_NUMBER ] counters
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 聚合组ID 0-63 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了所有聚合组的成员端口上的报文统计信息:
Switch# show lacp counters
Traffic statistics
Port                    LACPDUs        Pkts err
                     Sent    Recv    Sent    Recv
--------------------------------------------------------
Channel-group agg1
eth-0-9              27      0       0       0
```

**相关命令**：无

### 3.6.28 `show lacp sys-id`

**功能**：使用该命令显示设备的系统ID 信息，包括LACP 协议优先级和系统MAC 地址。

**语法**：

```
show lacp sys-id
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了系统ID 信息:
Switch# show lacp sys-id
System ID: 32768,4600.0987.6c01
```

**相关命令**：无

### 3.6.29 `clear lacp counters`

**功能**：使用该命令来清除所有聚合组的统计信息或某个指定聚合组的统计信息。

**语法**：

```
clear lacp ( GROUP_NUMBER | ) counters
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | 聚合组ID 0-63 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何清除所有聚合组的统计信息:
Switch# clear lacp counters
下面的例子显示了如何清除某个指定聚合组的统计信息:
Switch# clear lacp 10 counters
```

**相关命令**：无

### 3.6.30 `debug lacp`

**功能**：使用该命令来打开LACP 的调试开关，主要包括cli、event、ha、packet、sync 和timer
  开关。使用此命令的no 形式关闭LACP 调试开关。

**语法**：

```
debug lacp ( all | cli | event | ha | packet | sync | timer )
no debug lacp ( all | cli | event | ha | packet | sync | timer )
```

| 参数 | 说明 |
| --- | --- |
| all | 打开LACP 的所有调试开关 |
| cli | 打开LACP 的命令调试开关 |
| event | 打开LACP 的事件调试开关 |
| ha | 打开LACP 的高可用事件调试开关 |
| packet | 打开LACP 的报文调试开关 |
| sync | 打开LACP 的同步调试开关 timer(detail\|) 打开LACP 的计时器调试开关 |

**命令模式**：特权模式

**默认配置**：调试功能关闭。

**使用说明**：

无

**示例**：

```
下面的例子显示了如何打开LACP 报文的调试开关:
Switch# debug lacp packet
```

**相关命令**：show debugging lacp

### 3.6.31 `show debugging lacp`

**功能**：使用该命令来显示LACP 调试开关的状态信息。

**语法**：

```
show debugging lacp
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了LACP 调试开关的状态信息:
Switch# show debuging lacp
LACP debugging status:
  LACP packet debugging is on
```

**相关命令**：debug lacp all、3.7 VLAN Classification 命令


## 3.7 VLAN Classification 命令

### 3.7.1 `vlan classifier activate`

**功能**：使用该命令将VLAN 分类规则组应用到一个端口，使用no 命令删除。

**语法**：

```
vlan classifier activate GROUP_NUMBER based ( ip | mac | protocol )
no vlan classifier activate
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | VLAN 分类规则组标识 0-31，仅有31 可用于按协议类型分类 |
| ip | 基于IP 类型分类 |
| mac | 基于MAC 类型分类 |
| protocol | 基于协议类型分类 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

一个端口上只能应用一个VLAN 分类规则组。
  
  一个分类规则组可以应用于多个端口。
  该命令应用VLAN 分类规则组到一个端口，端口会根据分类规则将报文转发到不同的
  VLAN。
  为创建规则，参考命令vlan classifier rule。
  为创建分类规则，参考命令vlan classifier group。

**示例**：

```
以下示例展示如何应用VLAN 分类规则组1 到端口上:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# vlan classifier activate 1 based ip
以下示例展示如何移除VLAN 分类规则组1 在端口上的应用:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no vlan classifier activate
```

**相关命令**：vlan classifier group、vlan classifier rule

### 3.7.2 `vlan classifier group`

**功能**：使用该命令添加或删除分类规则到VLAN 分类规则组。使用no 命令删除分类规则组。

**语法**：

```
vlan classifier group GROUP_NUMBER ( add | delete ) rule RULE
no vlan classifier group group
```

| 参数 | 说明 |
| --- | --- |
| GROUP_NUMBER | VLAN 分类规则组标识 0-31，仅有31 可用于按协议类型分类 |
| add | 添加规则到VLAN 分类规则组 |
| delete | 删除规则到VLAN 分类规则组 |
| RULE | 规则的标识 0-4095 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

为创建规则，参考命令vlan classifier rule。
  为应用VLAN 分类规则组到一个端口，参考命令vlan classifier activate。
  添加一条规则到一个VLAN 分类规则组时，如果VLAN 分类规则组已应用到一个端口，
  这条规则将立即起作用。
  从一个VLAN 分类规则组删除一条规则时，如果VLAN 分类规则组已应用到一个端口，
  这条规则将立即不再起作用。
  当最后一条规则从VLAN 分类规则组删除时，VLAN 分类规则组将被删除。

**示例**：

```
以下示例将展示如何将规则1 添加到VLAN 分类规则组:
Switch# configure terminal
Switch(config)# vlan classifier group 1 add rule 1
以下示例将展示如何将规则1 从VLAN 分类规则组中删除:
Switch# configure terminal
Switch(config)# vlan classifier group 1 delete rule 1
以下示例将展示如何删除VLAN 分类规则组1:
Switch# configure terminal
Switch(config)# no vlan classifier group 1
```

**相关命令**：vlan classifier activate、vlan classifier rule

### 3.7.3 `vlan classifier rule`

**功能**：使用该命令创建VLAN 分类规则，使用no 命令可以移除分类规则。

**语法**：

```
vlan classifier rule RULE ( ip IP_ADDR | ip IP_ADDR/PREFIX-LENGTH | ipv6 IPV6_ADDR |
mac MAC_ADDR | protocol ( arp | ip | mpls | mpls-mcast | pppoe | rarp ) ) vlan VLAN_ID
no vlan classifier rule RULE
```

| 参数 | 说明 |
| --- | --- |
| RULE | 分类规则的标识 0-4095 |
| IP_ADDR | 报文的源ipv4 地址 IPv4 地址 |
| PREFIX-LENGTH | 子网前缀长度 1-32 |
| IPV6_ADDR | 报文的源ipv6 地址 IPv6 地址 |
| MAC_ADDR | 报文的源mac 地址 Mac address 地址，格式为 |
| HHHH.HHHH.HHHH |  |
| protocol | 指定报文的协议类型 |
| arp | ARP 协议类型 |
| ip | IP 协议类型 |
| mpls | MPLS 协议类型 |
| mpls-mcast | MPLS 组播协议类型 |
| pppoe | PPPOE 协议类型 |
| rarp | RARP 协议类型 |
| VLAN_ID | VLAN 标识 1-4094 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

当绑定到端口上后，分类规则才会起作用。
  当报文匹配到分类规则后，分类规则会将将报文在新分配的vlan 中转发，并将新的
  vlan id 添加到报文中。
  添加分类规则到VLAN 分类规则组，参见命令vlan classifier group。
  应用分类规则组到一个端口，参见命令vlan classifier activate。

**示例**：

```
以下示例将展示如何创建分类规则1，将ipv4 报文转发到vlan11 中:
Switch# configure terminal
Switch(config)# vlan classifier rule 1 protocol ip vlan 11
以下示例展示如何删除分类规则1:
Switch# configure terminal
Switch(config)# no vlan classifier rule 1
```

**相关命令**：vlan classifier group、vlan classifier activate

### 3.7.4 `vlan classifier default-action`

**功能**：使用该命令设置当报文从使能了VLAN 分类规则的端口进来，并且没有命中任何规则
  时，报文将被丢弃。使用no 命令设置为不丢弃。

**语法**：

```
vlan classifier default-action drop
no vlan classifier default-action drop
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

当报文从使能了VLAN 分类规则的端口进来，并且没有命中任何规则时，报文将被丢
  弃。

**示例**：

```
以下示例将展示如何将默认行为设置为丢弃:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# vlan classifier default-action drop

以下示例将展示如何将默认行为设置为不丢弃:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no vlan classifier default-action drop
```

**相关命令**：vlan classifier activate

### 3.7.5 `show vlan classifier group`

**功能**：使用该命令显示VLAN 分类规则组的信息。

**语法**：

```
show vlan classifier group GROUP_ID
```

| 参数 | 说明 |
| --- | --- |
| GROUP_ID | VLAN 分类规则组标识 0-31，仅有31 可用于按协议类型分类 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示如何显示分类规则组1 的相关信息:
Switch# show vlan classifier group 1
```

**相关命令**：show vlan classifier interface、show vlan classifier rule

### 3.7.6 `show vlan classifier interface`

**功能**：使用该命令显示VLAN 分类规则组应用在哪些端口上及相关信息。

**语法**：

```
show vlan classifier interface group GROUP_ID
```

| 参数 | 说明 |
| --- | --- |
| GROUP_ID | VLAN 分类规则组标识 0-31，仅有31 可用于按协议类型分类 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示分类规则组1 应用在哪些端口上:
Switch# show vlan classifier interface group 1
```

**相关命令**：show vlan classifier group、show vlan classifier rule

### 3.7.7 `show vlan classifier rule`

**功能**：使用该命令显示分类规则的信息。

**语法**：

```
show vlan classifier rule ( RULE | )
```

| 参数 | 说明 |
| --- | --- |
| RULE | 分类规则的标识 0-4095 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示如何显示所有分类规则的相关信息:
Switch# show vlan classifier rule
以下示例展示如何显示分类规则1 的相关信息:
Switch# show vlan classifier rule 1
```

**相关命令**：show vlan classifier group、show vlan classifier interface

### 3.7.8 `show resource vlan-classification`

**功能**：使用该命令显示系统中VLAN 分类规则占用的硬件资源统计信息。

**语法**：

```
show resource vlan-classification
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了使用命令 show resource vlan-classification 的输出结果:
Switch# show resource vlan-classification
VLAN-CLASS
Resource                             Used          Capability
=============================================================
MAC Based VLAN Classification    0             512
IPv4 Based VLAN Classification   0             512
```

**相关命令**：无、3.8 VLAN Maping 命令


## 3.8 VLAN Maping 命令

### 3.8.1 `ethernet evc`

**功能**：使用该命令添加或删除EVC 表。

**语法**：

```
ethernet evc WORD
no ethernet evc WORD
```

| 参数 | 说明 |
| --- | --- |
| WORD | EVC 名称不超过16 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示如何创建EVC 表evc_table:
Switch# configure terminal
Switch(config)# ethernet evc evc_table
Switch(config-evc)# dot1q mapped-vlan 10
```

**相关命令**：show ethernet evc NAME

### 3.8.2 `dot1q mapped-vlan`

**功能**：使用该命令添加EVC 条目到EVC 表。

**语法**：

```
dot1q mapped-vlan VLAN_ID
no dot1q mapped-vlan
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | 映射的VLAN 标识 1-4094 |

**命令模式**：EVC 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
添加EVC 对应VLAN 为100:

Switch# configure terminal
Switch(config)# ethernet evc evc_table
Switch(config-evc)# dot1q mapped-vlan 100
```

**相关命令**：show ethernet evc NAME

### 3.8.3 `dot1q mapped-double-vlan`

**功能**：使用该命令添加带有两层VLAN 的EVC 条目到EVC 表。

**语法**：

```
dot1q mapped-double-vlan INNER_VLAN_ID OUTER_VLAN_ID
no dot1q mapped-double-vlan
```

| 参数 | 说明 |
| --- | --- |
| INNER_VLAN_ID | 映像的内层VLAN ID 1-4094 |
| OUTER_VLAN_ID | 映像的外层VLAN ID 1-4094 |

**命令模式**：EVC 配置模式

**默认配置**：无

**使用说明**：

该命令仅用于untagged 的报文

**示例**：

```
添加映射的EVC 条目，内层vlan 为100，外层vlan 为10:
Switch# configure terminal
Switch(config)# ethernet evc evc_table
Switch(config-evc)# dot1q mapped-double-vlan 100 10
```

**相关命令**：show ethernet evc NAME

### 3.8.4 `vlan mapping table`

**功能**：使用该命令添加或删除VLAN 映射表。

**语法**：

```
vlan mapping table WORD
no vlan mapping table WORD
```

| 参数 | 说明 |
| --- | --- |
| WORD | VLAN 映射表的名称不超过16 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
创建VLAN 映射表VMT:
Switch# configure terminal
Switch(config)# vlan mapping table VMT
Switch(config-vlan-mapping)#
```

**相关命令**：show vlan mapping table WORD

### 3.8.5 `raw vlan group`

**功能**：使用该命令创建一个raw VLAN 组。

**语法**：

```
raw vlan group GROUP_ID vlan VLAN_LIST
no raw vlan group GROUP_ID
```

| 参数 | 说明 |
| --- | --- |
| GROUP_ID | 组的编号 1-64 |
| VLAN_LIST | VLAN 的一个集合，格式可以为2-5,9-11 VLAN 序列以‘-’ 和‘,’符号相连接，如 “1-10,15,20,30- 40” |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
创建raw VLAN 组1， VLAN 范围是10-20:
Switch# configure terminal
Switch(config)# raw vlan group 1 vlan 10-20
```

**相关命令**：show vlan mapping table WORD

### 3.8.6 `raw-vlan`

**功能**：使用该命令添加VLAN 映射表条目到VLAN 映像表。

**语法**：

```
raw-vlan ( VLAN_ID | out-of-range | untagged | group GROUP_ID ) evc WORD
no raw-vlan ( VLAN_ID | out-of-range | untagged | group )
raw-vlan INNER_VLAN OUTER_VLAN egress-vlan ( untagged | MAPPED_VLAN )

raw-vlan INNER_VLAN OUTER_VLAN evc WORD
no raw-vlan INNER_VLAN OUTER_VLAN egress-vlan
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | 收到报文的源vlan，范围为1- 4094。格式可以为 1,2,3 或 1-20 VLAN 序列以‘-’ 和‘,’符号相连接，如 “1-10,15,20,30- 40” |
| out-of-range | 没有特殊指定的vlans |
| untagged | 不带vlan tag 的报文 |
| group GROUP_ID | Raw VLAN 组，使用组会比直接使用vlan 范围更省资源。 1-64 |
| WORD | EVC 名称不超过16 个字符的字符串 |
| INNER_VLAN |  |
| Inner vlan id | 1-4094 |
| OUTER_VLAN |  |
| Outer vlan id | 1-4094 |
| MAPPED_VLAN |  |
| Mapped vlan id | 1-4094 |

**命令模式**：VLAN 映射配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
添加VLAN 映像条目，源VLAN ID 范围是10-20，映像到evc_table:
Switch# configure terminal
Switch(config)# vlan mapping table VMT
Switch(config-vlan-mapping)# raw-vlan 10-20 evc evc_table
```

**相关命令**：show vlan mapping table WORD

### 3.8.7 `dot1q ethertype`

**功能**：使用该命令设置端口的ethertype。

**语法**：

```
dot1q ethertype VALUE
no dot1q ethertype
```

| 参数 | 说明 |
| --- | --- |
| VALUE | 指定发送报文的VLAN tag 的ethertype。 格式可以为16 进制，默认为0x8100 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
修改端口1 的ethertype，使其出去报文VLAN tag 的ethertype 为0x9100:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# dot1q ethertype 9100
```

**相关命令**：无

### 3.8.8 `show vlan mapping table`

**功能**：使用该命令显示VLAN 映像表。

**语法**：

```
show vlan mapping table ( WORD | )
```

| 参数 | 说明 |
| --- | --- |
| WORD | VLAN 映射表的名称不超过16 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下用例展示如何显示vlan 映像表:
Switch# show vlan mapping table
Table Name       EVC Name         Mapped VLAN  Forward Interface  Raw VLAN
================ ================ =========== ================== ==============
VMT              evc_table        100         n/a                10-20
VMT_double       evc_double       10(100)     n/a                untagged
VMT_forward      evc_forward      20          eth-0-9            30
```

**相关命令**：show vlan mapping table applied-interface

### 3.8.9 `show vlan mapping table applied-interface`

**功能**：使用该命令显示VLAN 映像表应用在哪些端口上。

**语法**：

```
show vlan mapping table applied-interface
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示如何显示vlan 映像表应用在哪些端口上:
Switch# show vlan mapping table applied-interface
 Table Name        Interface Name     Type
 ==============    ================  ================
 VMT                 eth-0-1             802.1Q-Tunnel
```

**相关命令**：show vlan mapping table WORD

### 3.8.10 `switchport mode`

**功能**：使用该命令配置端口配置模式。

**语法**：

```
switchport mode ( access | trunk | dot1q-tunnel )
no switchport dot1q-tunnel
```

| 参数 | 说明 |
| --- | --- |
| access | 配置端口配置模式为 access 类型 |
| trunk | 配置端口配置模式为trunk 类型 |
| dot1q-tunnel | 配置端口配置模式为 dot1q-tunnel 类型 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例显示如何配置端口为dot1q-tunnel 端口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport mode dot1q-tunnel
```

**相关命令**：show interface switchport

### 3.8.11 `switchport dot1q-tunnel type`

**功能**：使用该命令配置dot1q-tunnel 的类型。

**语法**：

```
switchport dot1q-tunnel type ( basic | selective )
```

| 参数 | 说明 |
| --- | --- |
| basic | Dot1q-tunnel 基本类型，对进入的报文统一映射到一个 |
| VLAN |  |
| selective | Dot1q-tunnel 选择类型，对进入的报文根据vlan 映射到对应的VLAN |

**命令模式**：端口配置模式

**默认配置**：Basic type

**使用说明**：

无

**示例**：

```
以下示例展示了如何配置接口dot1q-tunnel 类型为选择类型:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport dot1q-tunnel type selective
```

**相关命令**：show interface switchport

### 3.8.12 `switchport dot1q-tunnel native`

**功能**：使用该命令配置dot1q-tunnel 端口的默认VLAN。

**语法**：

```
switchport dot1q-tunnel native ( vlan | inner-vlan ) VLAN_ID
no switchport dot1q-tunnel native vlan
```

| 参数 | 说明 |
| --- | --- |
| vlan | 被添加的VLAN |
| inner-vlan |  |
| Untagged inner VLAN |  |
| VLAN_ID |  |
| Vlan Id | 1-4094 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
配置eth-0-1 为dot1q-tunnel 并配置端口的默认VLAN 为10:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# vlan 100
Switch(config-vlan)# exit
Switch(config)# interface eth-0-23
Switch(config-if)# switchport mode dot1q-tunnel
Switch(config-if)# switchport dot1q-tunnel native vlan 100
```

**相关命令**：无

### 3.8.13 `switchport dot1q-tunnel allow vlan`

**功能**：使用该命令配置dot1q-tunnel 端口允许VLAN 通过。

**语法**：

```
switchport dot1q-tunnel allow vlan ( all | none | add VLAN_ID | remove VLAN_ID )
```

| 参数 | 说明 |
| --- | --- |
| all | 允许系统中配置的所有 VLAN 通过 |
| none | 不允许任何VLAN 通过 |
| add VLAN_ID | 添加一个VLAN 通过 1-4094 |
| remove VLAN_ID | 从运行通过列表中删除一个 |
| VLAN | 1-4094 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何在dot1q-tunnel 端口上允许VLAN 100 通过:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport dot1q-tunnel allowed vlan add 100
```

**相关命令**：show vlan brief

### 3.8.14 `switchport dot1q-tunnel vlan mapping table`

**功能**：使用该命令将VLAN 映射表应用在可选的dot1q tunnel 端口上。

**语法**：

```
switchport dot1q-tunnel vlan mapping table WORD
no switchport dot1q-tunnel vlan mapping table
```

| 参数 | 说明 |
| --- | --- |
| WORD | VLAN 映射表的名称不超过16 个字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

需要将dot1q-tunnel 端口的类型配置为selective，才可以将VLAN mapping 表绑定到
  该接口上。

**示例**：

```
以下用例展示如何配置在端口上应用VLAN 映射表mp:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport dot1q-tunnel vlan mapping table mp
```

**相关命令**：show interface switchport

### 3.8.15 `switchport dot1q-tunnel vlan mapping miss-forward`

**功能**：使用该命令将未匹配vlan 映射表的报文在端口上做普通转发。

**语法**：

```
switchport dot1q-tunnel vlan mapping miss-forward
no switchport dot1q-tunnel vlan mapping miss-forward
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

需要将dot1q-tunnel 端口的类型配置为selective，才可以使用该命令。

**示例**：

```
以下用例展示如何将未匹配vlan 映射表的报文在端口上做普通转发:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport dot1q-tunnel vlan mapping miss-forward
```

**相关命令**：无

### 3.8.16 `switchport trunk vlan-translation`

**功能**：使用该命令开启VLAN 转换功能，使用no 命令关闭该功能。

**语法**：

```
switchport trunk vlan-translation
no switchport trunk vlan-translation
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

只有trunk 口上可以开启VLAN 转换功能。

**示例**：

```
以下示例展示如何配置trunk 口和如何在trunk 口上使能vlan 转化功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk vlan-translation
```

**相关命令**：show interface switchport

### 3.8.17 `switchport trunk vlan-translation mapping table`

**功能**：使用该命令将vlan 映射表应用到启用VLAN 转换功能的端口上。

**语法**：

```
switchport trunk vlan-translation mapping table WORD
no switchport trunk vlan-translation mapping table
```

| 参数 | 说明 |
| --- | --- |
| WORD | VLAN mapping table name 不超过16 个字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

使用此命令应用vlan 映射表到端口上

**示例**：

```
以下示例展示如何将VLAN 映射表应用到启用VLAN 转换功能的端口上:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport trunk vlan-translation vlan mapping table map_table
```

**相关命令**：show interface switchport

### 3.8.18 `switchport trunk vlan-translation miss-forward`

**功能**：使用该命令将未匹配vlan 映射表的报文在端口上做普通转发。

**语法**：

```
switchport trunk vlan-translation mapping miss-forward
no switchport trunk vlan-translation mapping miss-forward
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示如何配置将未匹配vlan 映射表的报文在端口上做普通转发:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# switchport trunk vlan-translation mapping miss-forward
```

**相关命令**：无

### 3.8.19 `vlan dot1q tag native`

**功能**：使用该命令配置带默认VLAN 的报文从端口出去时带上VLAN，使用no 命令可删除配
  置。

**语法**：

```
vlan dot1q tag native
no vlan dot1q tag native
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了配置带默认VLAN 的报文从端口出去时带上VLAN:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# vlan dot1q tag native
```

**相关命令**：无

### 3.8.20 `show resource vlan-mapping`

**功能**：使用该命令显示系统中VLAN 映像表占用的硬件资源统计信息。

**语法**：

```
show resource vlan-mapping
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了使用命令show resource vlan-mapping 的输出结果:
Switch# show resource vlan-mapping
VLAN-MAPPING
Resource                         Used          Capability
=============================================================
Applied VLAN Mapping Entry   0             1024
```

**相关命令**：无、3.9 MSTP 命令


## 3.9 MSTP 命令

### 3.9.1 `spanning-tree enable`

**功能**：使用该命令全局启用STP 功能，使用no 命令关闭该功能。

**语法**：

```
spanning-tree enable
no spanning-tree enable
```

**命令模式**：全局配置模式

**默认配置**：默认关闭STP

**使用说明**：

无

**示例**：

```
以下示例展示如何全局开启STP 功能:
Switch# configure terminal
Switch(config)# spanning-tree enable
以下示例展示如何全局关闭STP 功能:
Switch# configure terminal
Switch(config)# no spanning-tree enable
```

**相关命令**：show spanning-stree

### 3.9.2 `spanning-tree priority`

**功能**：使用该命令配置STP 的优先权，使用no 命令将STP 的优先权恢复成默认值。

**语法**：

```
spanning-tree priority PRIORITY
no spanning-tree priority
```

| 参数 | 说明 |
| --- | --- |
| PRIORITY | 优先权的值 0-61440 |

**命令模式**：全局配置模式

**默认配置**：优先权的默认值32678 (或十六进制0x8000)。

**使用说明**：

优先权的值必须是4096 的倍数

**示例**：

```
以下示例展示了如何配置优先权值:
Switch# configure terminal
Switch(config)# spanning-tree priority 4096
以下示例展示了如何将优先权值恢复成默认值:
Switch# configure terminal
Switch(config)# no spanning-tree priority
```

**相关命令**：show spanning-stree

### 3.9.3 `spanning-tree instance priority`

**功能**：使用该命令配置MST 用例的优先权值，使用no 命令将该优先权值恢复成默认值。

**语法**：

```
spanning-tree instance INSTANCE_ID priority PRIORITY
no spanning-tree instance INSTANCE_ID priority
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE_ID | 用例号 1-4094 |
| PRIORITY | 用例的优先权值 0-61440 |

**命令模式**：全局配置模式

**默认配置**：每个用例优先权值默认为32768。

**使用说明**：

在该用例中，优先权值小的交换机会成为根桥。优先权值必须是4096 的倍数。

**示例**：

```
以下示例展示了如何设置用例1 的优先权值:
Switch# configure terminal
Switch(config)# spanning-tree instance 1 priority 0
```

**相关命令**：show spanning-stree

### 3.9.4 `spanning-tree forward-time`

**功能**：使用该命令配置forward-time，这是根桥上每个端口从监听状态转化为学习状态或从
  学习状态转化为转发状态的时间间隔。使用no 命令将该时间间隔恢复成默认值。

**语法**：

```
spanning-tree forward-time SECONDS
no spanning-tree forward-time
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 时间间隔 2018/4/30 |

**命令模式**：全局配置模式

**默认配置**：默认值是15 秒。

**使用说明**：

不建议时间间隔设在7 秒钟以下。

**示例**：

```
以下示例展示了如何设置时间间隔为16 秒:
Switch# configure terminal
Switch(config)# spanning-tree forward-time 16
以下示例展示了如何恢复默认的时间间隔:
Switch# configure terminal
Switch(config)# no spanning-tree forward-time
```

**相关命令**：show spanning-stree

### 3.9.5 `spanning-tree hello-time`

**功能**：使用该命令配置hello-time， 这是根桥定期发送BPDU 报文的时间间隔。

**语法**：

```
spanning-tree hello-time SECONDS
no spanning-tree hello-time
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 根桥定期发送BPDU 报文的时间间隔 1-10, 单位：秒 |

**命令模式**：全局配置模式

**默认配置**：默认值为2 秒

**使用说明**：

允许配置的时间范围为1-10 秒。

**示例**：

```
以下示例展示了如何配置hello-time 为5 秒:
Switch# configure terminal
Switch(config)# spanning-tree hello-time 5

Switch# configure terminal
Switch(config)# no spanning-tree hello-time
```

**相关命令**：show spanning-stree

### 3.9.6 `spanning-tree max-age`

**功能**：使用该命令配置最大的超时时间，使用no 命令将最大超时时间恢复成默认值。

**语法**：

```
spanning-tree max-age SECONDS
no spanning-tree max-age
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 最大超时时间长度 6-40 |

**命令模式**：全局配置模式

**默认配置**：默认值为20 秒。

**使用说明**：

最大超时时间是一个消息被认为是有效的时间。这防止了报文环回。这个时间应大于
  两倍的hello time 加1，小于两倍的forward time 减1。可配的时间范围是6-40。

**示例**：

```
以下示例展示了如何配置最大超时时间为12 秒:
Switch# configure terminal
Switch(config)# spanning-tree max-age 12
以下示例展示了如何将这个时间恢复成默认值:
Switch# configure terminal
Switch(config)# no spanning-tree max-age
```

**相关命令**：show spanning-tree

### 3.9.7 `spanning-tree max-hops`

**功能**：使用该命令配置BPDU 报文所允许的最大跳数。这个参数被所有的用例使用。使用no
  命令可以恢复成默认值。

**语法**：

```
spanning-tree max-hops NUMBER
no spanning-tree max-hops
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | 最大跳数 1-40 |

**命令模式**：全局配置模式

**默认配置**：最大跳数默认值为20

**使用说明**：

指定最大跳数是为了防止BPDU 报文在网络中环回。当交换机收到的报文超过最大跳
  数，将丢弃BPDU 报文。

**示例**：

```
以下示例展示了如何配置最大跳数为25:
Switch# configure terminal
Switch(config)# spanning-tree max-hops 25
以下示例展示了如何将最大跳数恢复默认值:
Switch# configure terminal
Switch(config)# no spanning-tree max-hops
```

**相关命令**：show spanning-tree

### 3.9.8 `spanning-tree transmit-holdcount`

**功能**：使用该命令配置1 秒内允许发出的最大BPDU 数目。使用no 命令将允许发出的最大
  BPDU 数目恢复为默认值。

**语法**：

```
spanning-tree transmit-holdcount NUMBER
no spanning-tree transmit-holdcount
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | 允许发出的最大BPDU 数目 2018/1/10 |

**命令模式**：全局配置模式

**默认配置**：默认值为3

**使用说明**：

无

**示例**：

```
以下命令展示如何配置1 秒内允许发出的最大BPDU 数目:
Switch# configure terminal
Switch(config)# spanning-tree transmit-holdcount 5
以下命令展示如何将1 秒内允许发出的最大BPDU 数目恢复默认值:
Switch# configure terminal
Switch(config)# no spanning-tree transmit-holdcount
```

**相关命令**：show spanning-tree

### 3.9.9 `spanning-tree edgeport bpdu-guard (Global)`

**功能**：使用该命令全局开启bpdu–guard 功能。
  使用no 命令全局关闭该功能。

**语法**：

```
spanning-tree edgeport bpdu-guard
no spanning-tree edgeport bpdu-guard
```

**命令模式**：全局配置模式

**默认配置**：关闭

**使用说明**：

当bpdu-guard 功能打开时，如果接收到BPDU 报文，则端口会shutdown。用户可以
  通过no shutdown 重新打开端口或配置errdisable 定时器到时重新打开端口。
  可以用命令show spanning-tree 来查看bpdu-guard 的配置。

**示例**：

```
以下示例展示了如何全局使能bpdu-guard 功能:
Switch# configure terminal
Switch(config)# spanning-tree edgeport bpdu-guard
```

**相关命令**：show spanning-tree

### 3.9.10 `spanning-tree edgeport bpdu-filter (Global)`

**功能**：使用该命令全局配置边缘端口过滤BPDU 报文。
  使用no 命令全局关闭该功能。

**语法**：

```
spanning-tree edgeport bpdu-filter
no spanning-tree edgeport bpdu-filter
```

**命令模式**：全局配置模式

**默认配置**：关闭

**使用说明**：

配置了bpdu-filter 的端口不会接收和发送BPDU 报文。
  使用show spanning tree 命令可以查看bpdu-filter 的配置。

**示例**：

```
以下示例展示了如何全局使能bpdu-filter 功能:
Switch# configure terminal
Switch(config)# spanning-tree edgeport bpdu-filter
```

**相关命令**：show spanning-tree

### 3.9.11 `spanning-tree port`

**功能**：使用该命令可以在端口上启用STP 功能，使用no 命令可以关闭该功能。

**语法**：

```
spanning-tree port ( enable | disable )
```

| 参数 | 说明 |
| --- | --- |
| enable | 在端口上启用STP 功能 |
| disable | 在端口上关闭STP 功能 |

**命令模式**：端口配置模式

**默认配置**：默认启用该功能。

**使用说明**：

无

**示例**：

```
以下实例展示了如何使能端口eth-0-1 的STP 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree port enable
以下实例展示了如何去使能端口eth-0-1 的STP 功能:
Switch# configure terminal
Switch(config-if)# spanning-tree port disable
```

**相关命令**：show spanning-tree interface

### 3.9.12 `spanning-tree port-priority`

**功能**：使用该命令可以配置STP 端口优先权值。如果其它条件一致，端口优先权值较小的一
  侧会成为根桥。

**语法**：

```
spanning-tree port-priority PRIORITY
no spanning-tree port-priority
```

| 参数 | 说明 |
| --- | --- |
| PRIORITY | 端口优先权值 0-240 |

**命令模式**：端口配置模式

**默认配置**：默认值为128

**使用说明**：

无

**示例**：

```
以下示例展示了如何在端口eth-0-1 上配置优先权值为240:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree port-priority 240
```

**相关命令**：show spanning-tree interface

### 3.9.13 `spanning-tree pathcost-standard`

**功能**：使用该命令可以配置STP path cost 的协议标准，使用no 命令恢复默认值。

**语法**：

```
spanning-tree pathcost-standard ( dot1d-1998 | dot1t )
no spanning-tree pathcost-standard
```

| 参数 | 说明 |
| --- | --- |
| dot1d-1998 | IEEE 802.1D-1998 标准 |
| dot1t | IEEE 802.1T 标准 |

**命令模式**：全局配置模式

**默认配置**：默认的协议标准是IEEE 802.1T

**使用说明**：

如果协议标准改变了，每个端口上的cost 将重置和重新计算。

**示例**：

```
以下示例展示了如何配置pathcost 协议标准:
Switch# configure terminal
Switch(config)# spanning-tree pathcost-standard dot1d-1998
Cost of every port has been reset and auto-calculation is available
```

**相关命令**：show spanning-tree

### 3.9.14 `spanning-tree path-cost`

**功能**：使用该命令配置STP 的path cost，使用no 命令将恢复默认值。如果其它条件都一样，
  path cost 较小的一侧将成为根桥。

**语法**：

```
spanning-tree path-cost NUMBER
no spanning-tree path-cost
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | cost 值 dot1t 取值范围是1- 200000000，dot1d-1998 取值范围是1-65535 |

**命令模式**：端口配置模式

**默认配置**：默认的path cost 是根据端口的速率决定的

**使用说明**：

无

**示例**：

```
以下示例展示了如何配置STP path-cost:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree path-cost 123

以下示例展示了如何将STP path-cost 恢复默认值:
Switch# configure terminal
Switch(config-if)# no spanning-tree path-cost
```

**相关命令**：show spanning-tree interface

### 3.9.15 `spanning-tree link-type`

**功能**：使用该命令配置STP 的link-type，使用no 命令恢复默认配置。

**语法**：

```
spanning-tree link-type ( auto | point-to-point | shared )
no spanning-tree link-type
```

| 参数 | 说明 |
| --- | --- |
| auto | 自动检测和配置link type |
| point-to-point | 配置link type 为point to |
| point link |  |
| shared | 配置link type 为shared |

**命令模式**：端口配置模式

**默认配置**：link type 默认为auto

**使用说明**：

无

**示例**：

```
以下示例展示了如何配置link type:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree link-type shared
```

**相关命令**：show spanning-tree brief

### 3.9.16 `spanning-tree edgeport`

**功能**：使用该命令配置端口为边缘端口，使用no 命令恢复端口为非边缘端口。

**语法**：

```
spanning-tree edgeport
no spanning-tree edgeport
```

**命令模式**：端口配置模式

**默认配置**：端口不是边缘端口

**使用说明**：

无

**示例**：

```
以下示例展示如何配置边缘端口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree edgeport
以下实例展示如何将端口恢复为非边缘端口:
Switch# configure terminal
Switch(config-if)# no spanning-tree edgeport
```

**相关命令**：show spanning-tree interface

### 3.9.17 `spanning-tree edgeport bpdu-guard (Interface)`

**功能**：使用该命令配置在边缘端口上启用或关闭BPDU Guard，使用no 命令将该特性恢复为
  默认值。

**语法**：

```
spanning-tree edgeport bpdu-guard ( enable | disable | default )
no spanning-tree edgeport bpdu-guard
```

| 参数 | 说明 |
| --- | --- |
| enable | 启用edgeport bpdu-guard 功能 |
| disable | 关闭edgeport bpdu-guard 功能 |
| default | 默认值 |

**命令模式**：端口配置模式

**默认配置**：默认关闭BPDU Guard

**使用说明**：

无

**示例**：

```
以下命令展示如何配置边缘端口和在边缘端口上启用bpdu guard 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree edgeport
Switch(config-if)# spanning-tree edgeport bpdu-guard enable
```

**相关命令**：show spanning tree interface

### 3.9.18 `spanning-tree edgeport bpdu-filter (Interface)`

**功能**：使用该命令在边缘端口上启用BPDU filter 功能， 使用no 命令将该特性恢复默认值。

**语法**：

```
spanning-tree edgeport bpdu-filter ( enable | disable | default )
no spanning-tree edgeport bpdu-filter
```

| 参数 | 说明 |
| --- | --- |
| enable | 启用edgeport bpdu- filter 功能 |
| disable | 关闭edgeport bpdu- filter 功能 |
| default | 默认值 |

**命令模式**：端口配置模式

**默认配置**：默认关闭BPDU Filter

**使用说明**：

使用show spanning tree 命令显示BPDU filter 的配置。
  如果bpdu-guard 和bpdu-filter 一起配置，则bpdu-filter 起作用。

**示例**：

```
以下命令展示如何在边缘端口上启用bpdu-filter 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree edgeport
Switch(config-if)# spanning-tree edgeport bpdu-filter
以下命令展示如何在边缘端口上关闭bpdu-filter 功能:
Switch# configure terminal
Switch(config-if)# no spanning-tree edgeport bpdu-filter
```

**相关命令**：show spanning tree interface

### 3.9.19 `spanning-tree guard root`

**功能**：使用该命令开启Root Guard 功能，使用no 命令关闭这个功能。当打开这个功能后，
  交换机将不会接收高优先级的BPDU 报文。

**语法**：

```
spanning-tree guard root
no spanning-tree guard root
```

**命令模式**：端口配置模式

**默认配置**：默认关闭Root guard

**使用说明**：

当配置该功能后，如果在端口上收到高优先级的BPDU， 如果运行STP 协议就会转入
  监听状态，如果运行RSTP 和MSTP 就会转入阻塞状态。

**示例**：

```
以下命令展示如何启用Root guard 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree guard root
以下命令展示如何关闭Root guard 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no spanning-tree guard root
```

**相关命令**：无

### 3.9.20 `spanning-tree guard loop`

**功能**：使用该命令开启loop guard 功能。当打开这个功能后，交换机能够防止在网络中形成
  数据转发环路的形成。使用no 命令关闭这个功能。

**语法**：

```
spanning-tree guard loop
no spanning-tree guard loop
```

**命令模式**：端口配置模式

**默认配置**：默认关闭loop guard

**使用说明**：

loop guard 功能需要在非指定端口上启用。
  当非指定端口上启用了loop guard 功能，并且在max_age 时间内没有收到BPDU 报文，
  该端口将会进入loop-inconsistent 阻塞状态，而不是监听-学习-转发一系列的状态转
  换。一旦端口进入loop-inconsistent 状态，该端口将不能转发业务数据。

**示例**：

```
以下命令展示了如何启用guard loop 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree guard loop
以下命令展示了如何关闭guard loop 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no spanning-tree guard loop
```

**相关命令**：spanning-tree guard root

### 3.9.21 `spanning-tree bpdu-loop`

**功能**：使用该命令开启bpdu loop 功能。当打开这个功能后，交换机能够防止在网络中BPDU
  报文转发环路的形成。使用no 命令关闭这个功能。

**语法**：

```
spanning-tree bpdu-loop
no spanning-tree bpdu-loop
```

**命令模式**：全局配置模式

**默认配置**：默认开启bpdu loop

**使用说明**：

当bpdu-loop 功能打开时，如果在1 秒中内接收到BPDU 报文的源MAC 为接收端口
  MAC，则端口会errdisable down。

**示例**：

```
以下命令展示了如何启用bpdu-loop 功能:
Switch# configure terminal
Switch(config)# spanning-tree bpdu-loop
以下命令展示了如何关闭bpdu-loop 功能:
Switch# configure terminal
Switch(config)# no spanning-tree bpdu-loop
```

**相关命令**：无

### 3.9.22 `spanning-tree force-version`

**功能**：使用该命令指定STP 的版本，使用no 命令将STP 的版本恢复默认值。对于STP 协议，
  版本号必须小于2；对于RSTP 协议，版本号范围是0-2；对于MSTP 协议，版本号是
  0-3。

**语法**：

```
spanning-tree force-version NUMBER
no spanning-tree force-version
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | 版本号取值范围0 为STP，1 为 Not supported，2 为 RSTP，3 为MSTP |

**命令模式**：端口配置模式

**默认配置**：STP 默认值为0，RSTP 默认值为2，MSTP 默认值为3

**使用说明**：

无

**示例**：

```
使用以下命令指定STP 的版本:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree force-version 1
使用以下命令恢复STP 的版本:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no spanning-tree force-version
```

**相关命令**：无

### 3.9.23 `spanning-tree restricted-tcn`

**功能**：使用该命令限制TCN 消息的转发，使用no 命令关闭这种限制。

**语法**：

```
spanning-tree restricted-tcn
no spanning-tree restricted-tcn
```

**命令模式**：端口配置模式

**默认配置**：默认行为关闭这种限制

**使用说明**：

无

**示例**：

```
以下示例展示如何配置限制TCN 消息转发:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree restricted-tcn
以下示例展示如何关闭限制TCN 消息转发:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no spanning-tree restricted-tcn
```

**相关命令**：无

### 3.9.24 `spanning-tree restricted-role`

**功能**：使用该命令限制端口被选为根端口，使用no 命令关闭这种限制。

**语法**：

```
spanning-tree restricted-role
no spanning-tree restricted-role
```

**命令模式**：端口配置模式

**默认配置**：默认不限制端口被选为根端口

**使用说明**：

无

**示例**：

```
以下示例展示了如何限制端口成为根端口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree restricted-role
以下示例展示了如何关闭这种限制:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no spanning-tree restricted-role
```

**相关命令**：无

### 3.9.25 `spanning-tree tc-protection`

**功能**：使用该命令启用TC 消息的保护，使用no 命令关闭这种限制。当启用TC 保护时，在
  每个hello-time 间隔内，处理的TC 消息数目不大于系统的TC 保护上限。

**语法**：

```
spanning-tree tc-protection
no spanning-tree tc-protection
```

**命令模式**：全局配置模式

**默认配置**：默认行为关闭这种限制

**使用说明**：

无

**示例**：

```
以下示例展示如何配置限制TC 消息保护:
Switch# configure terminal
Switch(config)# spanning-tree tc-protection
以下示例展示如何关闭这种限制:
Switch# configure terminal
Switch(config)# no spanning-tree tc-protection
```

**相关命令**：无

### 3.9.26 `spanning-tree tc-protection threshold`

**功能**：使用该命令配置TC 消息保护的上限值，使用no 命令将上限值恢复为1。当启用TC 保
  护时，在每个hello-time 间隔内，处理的TC 消息数目不大于系统的TC 保护上限。

**语法**：

```
spanning-tree tc-protection threshold NUMBER
no spanning-tree tc-protection threshold
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | TC 消息保护的上限值，默认值为1 1-255 |

**命令模式**：全局配置模式

**默认配置**：默认TC 消息保护的上限值为1

**使用说明**：

无

**示例**：

```
以下示例展示如何配置限制TC 消息保护上限:
Switch# configure terminal
Switch(config)# spanning-tree tc-protection threshold 255
以下示例展示如何将限制TC 消息保护上限恢复默认值:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no spanning-tree tc-protection threshold
```

**相关命令**：无

### 3.9.27 `spanning-tree mode`

**功能**：使用该命令配置STP 模式或RSTP 模式或MSTP 模式。

**语法**：

```
spanning-tree mode ( stp | rstp | mstp )
```

| 参数 | 说明 |
| --- | --- |
| stp | 生成树协议 |
| rstp | 快速生成树协议 |
| mstp | 多生成树协议 |

**命令模式**：全局配置模式

**默认配置**：默认模式是RSTP 模式

**使用说明**：

无

**示例**：

```
以下示例展示如何配置为多生成树协议（MSTP）:

Switch# configure terminal
Switch(config)# spanning-tree mode mstp
```

**相关命令**：无

### 3.9.28 `spanning-tree instance port-priority`

**功能**：使用该命令配置某个用例的端口优先权值，使用no 命令将优先权值恢复成默认值。

**语法**：

```
spanning-tree instance INSTANCE_ID port-priority PRIORITY
no spanning-tree instance INSTANCE_ID port-priority
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE_ID | 用例号 1-4094 |
| PRIORITY | 配置端口优先权值，取值范围0-240 0-240 |

**命令模式**：端口配置模式

**默认配置**：默认值为128。

**使用说明**：

MSTP 协议使用该优先权值作为一个标准来判断端口是否作为某个用例的根端口。优先
  权值较小的优先。如果优先权值一样，还会比较端口号。可以配值为0-240，优先权
  值必须是16 的倍数。

**示例**：

```
以下示例展示了如何配置eth-0-1 上用例3 的优先权值为112:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree instance 3 port-priority 112
以下示例展示了如何将端口上用例3 的优先权恢复默认值:

Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no spanning-tree instance 3 port-priority
```

**相关命令**：无

### 3.9.29 `spanning-tree instance path-cost`

**功能**：使用该命令配置端口上path-cost，使用no 命令将该path-cost 恢复成默认值。

**语法**：

```
spanning-tree instance INSTANCE_ID path-cost COST
no spanning-tree instance INSTANCE_ID path-cost
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE_ID | 用例号 1-4094 |
| COST | cost 值如果协议类型是dot1t， cost 取值范围 1- 200000000；如果协议类型是dot1d-1998，cost 取值范围是1-65535 |

**命令模式**：端口配置模式

**默认配置**：默认值根据端口速率确定

**使用说明**：

必须首先配置用例，然后才能配置某个端口上的path-cost。

**示例**：

```
以下示例展示了如何配置用例和相关的path-cost 值:
Switch# configure terminal
Switch(config)# spanning-tree mst configuration
Switch(config-mst)# instance 3 vlan 3
Switch(config-mst)# exit

Switch(config)# interface eth-0-1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan add 3
Switch(config-if)# spanning-tree instance 3 path-cost 1000
Switch(config-mst)# exit
Switch(config)# interface eth-0-1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 3
Switch(config-if)# spanning-tree instance 3 path-cost 1000
```

**相关命令**：无

### 3.9.30 `spanning-tree instance restricted-tcn`

**功能**：使用该命令限制某个用例中TCN 的广播，使用no 命令关闭这种限制。

**语法**：

```
spanning-tree instance INSTANCE_ID restricted-tcn
no spanning-tree instance INSTANCE_ID restricted-tcn
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE_ID | 用例号 1-4094 |

**命令模式**：端口配置模式

**默认配置**：默认不限制用例中TCN 的广播

**使用说明**：

无

**示例**：

```
以下示例展示了如何在用例2 中限制端口eth-0-1 转发TCN 报文:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree instance 2 restricted-tcn
```

**相关命令**：无

### 3.9.31 `spanning-tree instance restricted-role`

**功能**：使用该命令限制在用例中某个端口不能成为根端口，使用no 命令关闭这种限制。

**语法**：

```
spanning-tree instance INSTANCE_ID restricted-role
no spanning-tree instance INSTANCE_ID restricted-role
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE_ID | 用例号 1-4094 |

**命令模式**：端口配置模式

**默认配置**：默认行为不做任何限制。

**使用说明**：

无

**示例**：

```
以下示例展示了如何在用例2 中限制端口eth-0-1 的角色:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree instance 2 restricted-role
```

**相关命令**：无

### 3.9.32 `spanning-tree mst configuration`

**功能**：使用该命令进入Mst 配置模式。

**语法**：

```
spanning-tree mst configuraiton
```

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示如何进入mst 配置模式:
Switch# configure terminal
Switch(config)# spanning-tree mst configuration
```

**相关命令**：无

### 3.9.33 `instance`

**功能**：使用该命令创建MSTP 用例，并将VLAN 关联到MST 用例。

**语法**：

```
instance INSTANCE_ID vlan VLAN_ID
no instance INSTANCE_ID vlan VLAN_ID
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE_ID | 用例标识，最多支持64 个用例 1-4094 |
| VLAN_ID |  |
| VLAN ID | 1-4094 |

**命令模式**：MST 配置模式

**默认配置**：无

**使用说明**：

当将VLANs 映射到MST 用例，这些VLANs 应该已经配置，否则配置不会生效；当这
  些VLANs 删除时，对应的MST 用例将删除。

**示例**：

```
以下示例展示了如何将用例1 关联到vlan 10:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# vlan 10
Switch(config-vlan)# exit
Switch(config)# spanning-tree Mst configuration
Switch(config-mst)# instance 1 vlan 10
```

**相关命令**：无

### 3.9.34 `region`

**功能**：使用该命令创建MSTP 域。

**语法**：

```
region NAME
no region NAME
```

| 参数 | 说明 |
| --- | --- |
| NAME | 指定MSTP 域名字符串长度最大为32 个字节，区分大小写。 |

**命令模式**：MST 配置模式

**默认配置**：默认域名为空字符串

**使用说明**：

无

**示例**：

```
以下示例展示了如何将域名配成Switch:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# vlan 10
Switch(config-vlan)# exit
Switch(config)# spanning-tree mst configuration
Switch(config-mst)# region Switch
```

**相关命令**：无

### 3.9.35 `revision`

**功能**：使用该命令创建一个MSTP 版本号。

**语法**：

```
revision NUMBER
no revision NUMBER
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | 版本号 0-65535 |

**命令模式**：MST 配置模式

**默认配置**：默认值为0

**使用说明**：

无

**示例**：

```
以下示例展示了如何配置版本号:
Switch# configure terminal
Switch(config)# spanning-tree mst configuration
Switch(config-mst)# revision 1
```

**相关命令**：无

### 3.9.36 `clear spanning-tree detected protocols`

**功能**：使用该命令清除端口是否接收到RSTP/MSTP 报文，再重新检测一次。

**语法**：

```
clear spanning-tree detected protocols ( interface IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| interface IFNAME | 端口名 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何清除端口上是否接收到RSTP/MSTP 状态，重新接收:
Switch# clear spanning-tree detected protocols interface eth-0-1
```

**相关命令**：无

### 3.9.37 `clear spanning-tree disabled-port`

**功能**：使用该命令打开所有端口上STP 功能。

**语法**：

```
clear spanning-tree disabled-port
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何打开所有端口上STP 功能:
Switch# clear spanning-tree disabled-port
```

**相关命令**：无

### 3.9.38 `show spanning-tree`

**功能**：使用该命令显示STP 的详细信息，这个命令只显示UP 端口的状态。

**语法**：

```
show spanning-tree
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何显示STP 详细信息:
Switch# show spanning-tree
  Bridge up - Spanning Tree Enabled
 Mode - Multiple spanning tree protocol
 Path Cost Standard - dot1t
 CIST Root Path Cost 0 - CIST Root Port 0 -  CIST Bridge Priority 32768
 Forward Delay 15 - Hello Time 2 - Max Age 20 - Max-hops 20
 Tx Hold Count 6
 CIST Root Id 80008afa58e9cb00
 CIST Reg Root Id 80008afa58e9cb00
 CIST Bridge Id 80008afa58e9cb00
 Edgeport bpdu-filter disabled
 Edgeport bpdu-guard disabled
 eth-0-1: Port 1 - Id 8001 - Role Designated - State Forwarding
 eth-0-1: Designated External Path Cost 0 -Internal Path Cost 0
 eth-0-1: Configured Path Cost 20000 - Add type Explicit ref count 1
 eth-0-1: Designated Port Id 8001 - CIST Priority 128
 eth-0-1: CIST Root 80008afa58e9cb00
 eth-0-1: Regional Root 80008afa58e9cb00
 eth-0-1: Designated Bridge 80008afa58e9cb00
 eth-0-1: Message Age 0 - Max Age 20
 eth-0-1: CIST Hello Time 2 - Forward Delay 15
 eth-0-1: CIST Forward Timer 0 - Msg Age Timer 0 - Hello Timer 0 - topo change t
imer 0
 eth-0-1: Forward-transitions 2
 eth-0-1: BPDU sent 373 - BPDU received 0
 eth-0-1: Version Multiple spanning tree protocol - Received None - Send MSTP
 eth-0-1: No edgeport configured - Current edgeport off
 eth-0-1: Edgeport bpdu-guard  Default - Current edgeport bpdu-guard off
 eth-0-1: Edgeport bpdu-filter Default - Current edgeport bpdu-filter off
 eth-0-1: No root guard configured - Current root guard off
 eth-0-1: No loop guard configured - Current loop guard off
 eth-0-1: Configured Link Type auto - Current point-to-point
```

**相关命令**：无

### 3.9.39 `show spanning-tree interface`

**功能**：使用该命令显示指定端口上STP 的详细信息。

**语法**：

```
show spanning-tree interface IFNAME ( brief | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 端口名 |
| brief | 生成树简要信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何显示端口eth-0-1 上STP 的详细信息:
Switch# show spanning-tree interface eth-0-1
 Bridge up - Spanning Tree Enabled
 Mode - Multiple spanning tree protocol
 Path Cost Standard - dot1t
 CIST Root Path Cost 0 - CIST Root Port 0 -  CIST Bridge Priority 32768
 Forward Delay 15 - Hello Time 2 - Max Age 20 - Max-hops 20
 Tx Hold Count 6
 CIST Root Id 80008afa58e9cb00
 CIST Reg Root Id 80008afa58e9cb00
 CIST Bridge Id 80008afa58e9cb00
 Edgeport bpdu-filter disabled
 Edgeport bpdu-guard disabled
 eth-0-1: Port 1 - Id 8001 - Role Designated - State Forwarding
 eth-0-1: Designated External Path Cost 0 -Internal Path Cost 0
 eth-0-1: Configured Path Cost 20000 - Add type Explicit ref count 1
 eth-0-1: Designated Port Id 8001 - CIST Priority 128
 eth-0-1: CIST Root 80008afa58e9cb00
 eth-0-1: Regional Root 80008afa58e9cb00
 eth-0-1: Designated Bridge 80008afa58e9cb00

 eth-0-1: Message Age 0 - Max Age 20
 eth-0-1: CIST Hello Time 2 - Forward Delay 15
 eth-0-1: CIST Forward Timer 0 - Msg Age Timer 0 - Hello Timer 0 - topo change t
imer 0
 eth-0-1: Forward-transitions 2
 eth-0-1: BPDU sent 352 - BPDU received 0
 eth-0-1: Version Multiple spanning tree protocol - Received None - Send MSTP
 eth-0-1: No edgeport configured - Current edgeport off
 eth-0-1: Edgeport bpdu-guard  Default - Current edgeport bpdu-guard off
 eth-0-1: Edgeport bpdu-filter Default - Current edgeport bpdu-filter off
 eth-0-1: No root guard configured - Current root guard off
 eth-0-1: No loop guard configured - Current loop guard off
 eth-0-1: Configured Link Type auto - Current point-to-point
```

**相关命令**：无

### 3.9.40 `show spanning-tree brief`

**功能**：以下命令用于显示STP 的简略信息。

**语法**：

```
show spanning-tree brief
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何显示STP 的简略信息:
Switch# show spanning-tree brief
Multiple spanning tree protocol Enabled
Root ID     Priority    32768 (0x8000)
            Address     8afa.58e9.cb00
            Hello Time  2 sec  Max Age  20 sec Forward Delay 15 sec
Bridge ID   Priority    32768 (0x8000)
            Address     8afa.58e9.cb00

            Hello Time  2 sec  Max Age  20 sec Forward Delay 15 sec
            Aging Time  300 sec
Interface   Role           State           Cost       Priority.Number   Type
-------------------------------------------------------------------------------
eth-0-1     Designated     Forwarding      20000           128.1        P2p
eth-0-2     Designated     Forwarding      20000           128.2        P2p
```

**相关命令**：无

### 3.9.41 `show spanning-tree disabled-port`

**功能**：使用该命令显示关闭STP 功能的接口。

**语法**：

```
show spanning-tree disabled-port
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何显示关闭STP 协议的接口:
Switch# show spanning-tree disabled-port
Interface
---------
eth-0-1
```

**相关命令**：无

### 3.9.42 `show spanning-tree mst`

**功能**：使用该命令显示MSTP 的相关信息。

**语法**：

```
show spanning-tree mst
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下用例展示了如何展示了如何显示MSTP 相关信息:
Switch#show spanning-tree mst
Bridge up - Spanning Tree Enabled
 Mode - Multiple spanning tree protocol
 Path Cost Standard - dot1t
 CIST Root Path Cost 0 - CIST Root Port 0 -  CIST Bridge Priority 32768
 Forward Delay 15 - Hello Time 2 - Max Age 20 - Max-hops 20
 Tx Hold Count 6
 CIST Root Id 80008afa58e9cb00
 CIST Reg Root Id 80008afa58e9cb00
 CIST Bridge Id 80008afa58e9cb00
 Edgeport bpdu-filter disabled
 Edgeport bpdu-guard disabled
 Instance  Interface  VLAN
 0 :                     1, 3
 1 :       eth-0-2      2
```

**相关命令**：无

### 3.9.43 `show spanning-tree mst config`

**功能**：使用该命令显示MST 的配置信息。

**语法**：

```
show spanning-tree mst config
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下用例展示了如何显示MST 的配置信息:
Switch#show spanning-tree mst config
MSTP Configuration Information:
------------------------------------------------------------------------
  Format Id      : 0
  Name           : switch
  Revision Level : 0
  Digest         : 0x3AB68794D602FDF43B21C0B37AC3BCA8
  Instances configured 1
------------------------------------------------------------------------
Instance  Vlans mapped
------------------------------------------------------------------------
0          1, 3
1          2
------------------------------------------------------------------------
```

**相关命令**：无

### 3.9.44 `show spanning-tree mst detail`

**功能**：使用该命令显示MSTP 的详细信息。

**语法**：

```
show spanning-tree mst detail ( interface IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| interface IFNAME | 端口名 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何显示MSTP 的详细信息:
Switch#show spanning-tree mst detail interface eth-0-1
Bridge up - Spanning Tree Enabled
Mode - Multiple spanning tree protocol
Path Cost Standard - dot1t
CIST Root Path Cost 0 - CIST Root Port 0 -  CIST Bridge Priority 32768
Forward Delay 15 - Hello Time 2 - Max Age 20 - Max-hops 20
Tx Hold Count 6
CIST Root Id 80008afa58e9cb00
CIST Reg Root Id 80008afa58e9cb00
CIST Bridge Id 80008afa58e9cb00
Edgeport bpdu-filter disabled
Edgeport bpdu-guard disabled
eth-0-1: Port 1 - Id 8001 - Role Designated - State Forwarding
eth-0-1: Designated External Path Cost 0 -Internal Path Cost 0
eth-0-1: Configured Path Cost 20000 - Add type Explicit ref count 1
eth-0-1: Designated Port Id 8001 - CIST Priority 128
eth-0-1: CIST Root 80008afa58e9cb00
eth-0-1: Regional Root 80008afa58e9cb00
eth-0-1: Designated Bridge 80008afa58e9cb00
eth-0-1: Message Age 0 - Max Age 20
eth-0-1: CIST Hello Time 2 - Forward Delay 15

eth-0-1: CIST Forward Timer 0 - Msg Age Timer 0 - Hello Timer 0 - topo change t
imer 0
eth-0-1: Forward-transitions 2
eth-0-1: BPDU sent 247 - BPDU received 0
eth-0-1: Version Multiple spanning tree protocol - Received None - Send MSTP
eth-0-1: No edgeport configured - Current edgeport off
```

**相关命令**：无

### 3.9.45 `show spanning-tree mst instance`

**功能**：使用该命令显示一个特定用例的MSTP 信息。

**语法**：

```
show spanning-tree mst instance INSTANCE_ID ( interface IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE_ID | 用例号 1-4094 |
| IFNAME | 端口名支持物理口和聚合口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何显示用例2 中MSTP 的相关信息:
Switch#show spanning-tree mst instance 2
 MSTI Root Path Cost 0 - MSTI Root Port 0
 MSTI Root Id 8002e083bce89601
 MSTI Bridge Id 8002e083bce89601
MSTI Bridge Priority 32768

 eth-0-48: Port 48 - Id 8030 - Role Disabled - State Discarding

 eth-0-48: Designated Internal Path Cost 0  - Designated Port Id 0
 eth-0-48: Configured Internal Path Cost 20000
 eth-0-48: Configured CST External Path cost 20000
 eth-0-48: CST Priority 128  - MSTI Priority 128
 eth-0-48: Designated Root 0000000000000000
 eth-0-48: Designated Bridge 0000000000000000
 eth-0-48: Message Age 0 - Max Age 0
 eth-0-48: Hello Time 2 - Forward Delay 15
 eth-0-48: Forward Timer 0 - Msg Age Timer 0 - Hello Timer 0

 eth-0-1: Port 1 - Id 8001 - Role Disabled - State Discarding
 eth-0-1: Designated Internal Path Cost 0  - Designated Port Id 0
 eth-0-1: Configured Internal Path Cost 20000
 eth-0-1: Configured CST External Path cost 20000
 eth-0-1: CST Priority 128  - MSTI Priority 128
 eth-0-1: Designated Root 0000e083bce89601
 eth-0-1: Designated Bridge 0000e083bce89601
 eth-0-1: Message Age 0 - Max Age 0
 eth-0-1: Hello Time 2 - Forward Delay 15
 eth-0-1: Forward Timer 0 - Msg Age Timer 0 - Hello Timer 0
```

**相关命令**：无

### 3.9.46 `show spanning-tree mst interface`

**功能**：使用该命令显示某个特定端口上MSTP 的详细信息。

**语法**：

```
show spanning-tree mst interface IFNAME
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 端口名支持物理口和聚合口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如下显示端口eth-0-1 上MSTP 的详细配置:
Switch# show spanning-tree mst interface eth-0-1
Bridge up - Spanning Tree Enabled
Mode - Multiple spanning tree protocol
Path Cost Standard - dot1t
CIST Root Path Cost 0 - CIST Root Port 0 -  CIST Bridge Priority 32768
Forward Delay 15 - Hello Time 2 - Max Age 20 - Max-hops 20
Tx Hold Count 6
CIST Root Id 8000be8c722f7f00
CIST Reg Root Id 8000be8c722f7f00
CIST Bridge Id 8000be8c722f7f00
Edgeport bpdu-filter disabled
Edgeport bpdu-guard disabled
Loop guard configured disabled
Instance  Interface  VLAN
0                    1, 4-100
1        eth-0-1    2
2        eth-0-1    3
```

**相关命令**：无

### 3.9.47 `show spanning-tree mst brief`

**功能**：使用该命令显示MSTP 的简略信息。

**语法**：

```
show spanning-tree mst brief ( interface IFNAME | instance INSTANCE_ID | )
```

| 参数 | 说明 |
| --- | --- |
| interface IFNAME | 端口名 |
| instance INSTANCE_ID | 用例号 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何显示MSTP 的简略配置信息:
Switch#show spanning-tree mst brief
##### MST0:  Vlans: 1
Multiple spanning tree protocol Enabled
Root ID     Priority    32768 (0x8000)
            Address     e083.bce8.9601
            Hello Time  2 sec  Max Age  20 sec Forward Delay 15 sec
Bridge ID   Priority    32768 (0x8000)
            Address     e083.bce8.9601
            Hello Time  2 sec  Max Age  20 sec Forward Delay 15 sec
            Aging Time 300 sec
Interface   Role           State       Cost       Priority.Number   Type
-----------------------------------------------------------------------
##### MST2:  Vlans: 2
Root ID     Priority    32770 (0x8002)
            Address     e083.bce8.9601
Bridge ID   Priority    32770 (0x8002)
            Address     e083.bce8.9601
Interface   Role           State       Int-Cost  Priority.Number   Type
-----------------------------------------------------------------------
eth-0-48    Disabled       Discarding  20000           128.48        P2p
eth-0-1     Disabled       Discarding  20000           128.1         P2p
##### MST15:  Vlans: 15
Root ID     Priority    32783 (0x800f)
            Address     e083.bce8.9601
Bridge ID   Priority    32783 (0x800f)
            Address     e083.bce8.9601
Interface   Role           State       Int-Cost  Priority.Number   Type
-----------------------------------------------------------------------
eth-0-48    Disabled       Discarding  20000           128.48        P2p
eth-0-1     Disabled       Discarding  20000           128.1         P2p
```

**相关命令**：无

### 3.9.48 `spanning-tree instance forward`

**功能**：使用该命令可配置某端口上STP 用例的状态为固定转发态。

**语法**：

```
spanning-tree instance INSTANCE_ID forward

no spanning-tree instance INSTANCE_ID forward
```

| 参数 | 说明 |
| --- | --- |
| INSTANCE_ID | 实例号 1-4094 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下示例展示了如何在端口eth-0-1 上设置实例1 的状态为固定转发态:
Switch# configure terminal
Switch(config)# spanning-tree mode mstp
Switch(config)# spanning-tree mst configuration
Switch(config-mst)# instance 1 vlan 2
Switch(config)# interface eth-0-1
Switch(config-if)# spanning-tree instance 1 forward
Switch# configure terminal
Switch(config)# interface eth-0-1
```

**相关命令**：无、3.10 Flow control 命令


## 3.10 Flow control 命令

### 3.10.1 `flowcontrol send`

**功能**：使用此命令在端口上使能发送flowcontrol 的功能。

**语法**：

```
flowcontrol send ( on | off )
```

| 参数 | 说明 |
| --- | --- |
| on | 启用flowcontrol 发送功能 |
| off | 关闭flowcontrol 发送功能 |

**命令模式**：端口配置模式

**默认配置**：不启用

**使用说明**：

该功能只在物理口有效。

**示例**：

```
下面的例子表明如何在端口上启用发送flowcontrol 的功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# flowcontrol send on
```

**相关命令**：flowcontrol receive on

### 3.10.2 `flowcontrol receive`

**功能**：使用此命令在端口上使能接收flowcontrol 的功能。

**语法**：

```
flowcontrol receive ( on | off )
```

| 参数 | 说明 |
| --- | --- |
| on | 启用flowcontrol 接收功能 |
| off | 关闭flowcontrol 接收功能 |

**命令模式**：端口配置模式

**默认配置**：不启用

**使用说明**：

该功能只在物理口有效。

**示例**：

```
下面的例子表明如何在端口上启用接收flowcontrol 的功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# flowcontrol receive on
```

**相关命令**：flowcontrol send on

### 3.10.3 `show flowcontrol`

**功能**：使用此命令查看flowcontrol 的具体信息。

**语法**：

```
show flowcontrol ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 端口名（可选） 支持物理口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用这个命令查看每个端口的flowcontrol 能力和pause 帧的信息。

**示例**：

```
下面的例子表明如何查看flowcontrol 的信息:
Switch# show flowcontrol
Port        Receive FlowControl  Send FlowControl   RxPause      TxPause
            admin    oper        admin    oper
----------  -------- --------    -------- --------  ------------ ------------
eth-0-1     off      off         off      off       0            0
eth-0-2     off      off         off      off       0            0
eth-0-3     off      off         off      off       0            0
eth-0-4     off      off         off      off       0            0
eth-0-5     off      off         off      off       0            0
eth-0-6     off      off         off      off       0            0
eth-0-7     off      off         off      off       0            0
eth-0-8     off      off         off      off       0            0
eth-0-9     off      off         off      off       0            0
eth-0-10    off      off         off      off       0            0
eth-0-11    off      off         off      off       0            0
eth-0-12    off      off         off      off       0            0
eth-0-13    off      off         off      off       0            0
eth-0-14    off      off         off      off       0            0
eth-0-15    off      off         off      off       0            0
eth-0-16    off      off         off      off       0            0
eth-0-17    off      off         off      off       0            0
eth-0-18    off      off         off      off       0            0
eth-0-19    off      off         off      off       0            0
eth-0-20    off      off         off      off       0            0
eth-0-21    off      off         off      off       0            0
eth-0-22    off      off         off      off       0            0
eth-0-23    off      off         off      off       0            0
eth-0-24    off      off         off      off       0            0
```

**相关命令**：无、3.11 Priority-based flow control 命令


## 3.11 Priority-based flow control 命令

### 3.11.1 `priority-flow-control enable priority`

**功能**：使用此命令使能或去使能基于优先级的flowcontrol

**语法**：

```
priority-flow-control enable priority { 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 }
no priority-flow-control enable priority { 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 }
```

**命令模式**：端口配置模式

**默认配置**：优先级3 上的flowcontrol 默认使能

**使用说明**：

使用priority-flow-control 命令配置端口是否发送pause 帧

**示例**：

```
以下示例展示如何使用优先权2,3,5,7 的flowcontrol:
Switch# configure terminal
Switch(config-if)# Priority-flow-control enable priority 2 3 5 7
```

**相关命令**：priority-flow-control mode (on | auto)、lldp tlv 8021-org-specific dcbx

### 3.11.2 `show priority-flow-control`

**功能**：使用此命令查看基于优先级的flowcontrol 信息

**语法**：

```
show priority-flow-control ( INTERFACE | )
```

| 参数 | 说明 |
| --- | --- |
| INTERFACE | 端口名支持物理口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用此命令查看基于优先级的flowcontrol 信息

**示例**：

```
以下示例展示如何查看基于优先级的flowcontrol 信息:
Switch# show priority-flow-control interface eth-0-1
Switch# show priority-flow-control
Port             PFC-enable          PFC-enable on priority
               admin    oper        admin     oper
---------------------------------------------------------------
eth-0-1        off      off         off       off
```

**相关命令**：无

### 3.11.3 `show priority-flow-control statistics`

**功能**：使用此命令查看基于优先级的flowcontrol 统计信息

**语法**：

```
show priority-flow-control statistics ( INTERFACE | )
```

| 参数 | 说明 |
| --- | --- |
| INTERFACE | 端口名支持物理口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用此命令查看基于优先级的flowcontrol 统计信息

**示例**：

```
以下示例展示如何查看基于优先级的flowcontrol 统计信息:

Switch# show priority-flow-control statistics interface eth-0-1
Switch# show priority-flow-control statistics
Port               RxPause          TxPause
--------------------------------------------------
eth-0-1            0                0
```

**相关命令**：无

### 3.11.4 `priority-flow-control deadlock precision`

**功能**：使用此命令配置PFC deadlock 侦测的时间精度

**语法**：

```
priority-flow-control deadlock precision PRECISION
no priority-flow-control deadlock precision
```

| 参数 | 说明 |
| --- | --- |
| PRECISION | 时间精度 10-50 |

**命令模式**：全局配置模式

**使用说明**：

使用此命令配置PFC deadlock 侦测的时间精度

**示例**：

```
以下示例展示如何配置PFC deadlock 侦测的时间精度为20:
Switch# configure terminal
Switch(config)# priority-flow-control deadlock precision 20
None
以下示例展示如何将PFC deadlock 侦测的时间精度恢复到默认的10:
Switch# configure terminal
Switch(config)# no priority-flow-control deadlock precision
```

**相关命令**：无

### 3.11.5 `priority-flow-control deadlock priority`

**功能**：使用此命令配置端口PFC deadlock 侦测功能

**语法**：

```
priority-flow-control deadlock priority PRI1 ( PRI2 | ) ( detect DETECT recover RECOVER
| )
no priority-flow-control deadlock priority ( PRI1 | ) ( PRI2 | )
```

| 参数 | 说明 |
| --- | --- |
| PRI1 | 第一个需要被侦测的 Traffic-priority 的值 0-7 |
| PRI2 | 第二个需要被侦测的 Traffic-priority 的值 0-7 |
| DETECT | 发起侦测的时间片次数 1-30 |
| RECOVER | 侦测恢复时间 0-3000 |

**命令模式**：端口配置模式

**默认配置**：默认没有配置端口PFC deadlock 侦测功能 不指定Detect time 时，默认为15 不指定Recover time 时，默认为150

**使用说明**：

使用此命令配置端口PFC deadlock 侦测功能

**示例**：

```
以下示例展示如何配置端口PFC deadlock 侦测功能:
Switch# configure terminal
Switch(config)# interface eth-0-1

Switch(config-if)# priority-flow-control deadlock priority 5 6 detect 20 recover
None
```

**相关命令**：无

### 3.11.6 `priority-flow-control deadlock limit priority`

**功能**：使用此命令配置端口PFC deadlock 门限功能

**语法**：

```
priority-flow-control deadlock limit priority PRI1 ( PRI2 | ) ( frequency FREQUENCY
period PERIOD | )
no priority-flow-control deadlock limit priority ( PRI1 | ) ( PRI2 | )
```

| 参数 | 说明 |
| --- | --- |
| PRI1 | 第一个需要被侦测的 Traffic-priority 的值 0-7 |
| PRI2 | 第二个需要被侦测的 Traffic-priority 的值 0-7 |
| FREQUENCY | 门限次数 10-100000 |
| PERIOD | 侦测周期 2020/1/5 |

**命令模式**：端口配置模式

**默认配置**：默认没有配置端口PFC deadlock 门限功能 不指定Frequency 时，默认为10 不指定Period 时，默认为1

**使用说明**：

使用此命令配置端口PFC deadlock 门限功能

**示例**：

```
以下示例展示如何配置端口PFC deadlock 门限功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# priority-flow-control deadlock limit priority 7 frequency 100
period 5
None
```

**相关命令**：无

### 3.11.7 `show priority-flow-control deadlock status`

**功能**：使用此命令显示PFC deadlock 状态信息

**语法**：

```
show priority-flow-control deadlock status
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用此命令查看PFC deadlock 状态信息

**示例**：

```
以下示例展示如何查看PFC deadlock 状态信息:
Switch# show priority-flow-control deadlock status
None
```

**相关命令**：无

### 3.11.8 `show priority-flow-control deadlock statistics`

**功能**：使用此命令显示PFC deadlock 统计信息

**语法**：

```
show priority-flow-control deadlock statistics ( interface IFPHYSICAL | )
```

| 参数 | 说明 |
| --- | --- |
| IFPHYSICAL | 接口名支持物理口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用此命令查看PFC deadlock 统计信息

**示例**：

```
以下示例展示如何查看PFC deadlock 统计信息:
Switch# show priority-flow-control deadlock statistics interface eth-0-1
None
```

**相关命令**：无

### 3.11.9 `clear priority-flow-control deadlock statistics`

**功能**：使用此命令清除PFC deadlock 统计信息

**语法**：

```
clear priority-flow-control deadlock statistics ( interface IFPHYSICAL | )
```

| 参数 | 说明 |
| --- | --- |
| IFPHYSICAL | 接口名支持物理口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用此命令清除PFC deadlock 统计信息

**示例**：

```
以下示例展示如何清除PFC deadlock 统计信息:
Switch# clear priority-flow-control deadlock statistics interface eth-0-1
None
```

**相关命令**：无、3.12 Layer 2 Protocols Tunneling 命令


## 3.12 Layer 2 Protocols Tunneling 命令

### 3.12.1 `l2protocol enable`

**功能**：使用该命令开启二层协议报文透传功能，使用对应的no 命令关闭该功能。

**语法**：

```
l2protocol enable
no l2protocol enable
```

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

使用该命令开启二层协议报文透传功能。

**示例**：

```
全局开启二层协议报文透传功能:
Switch# configure terminal
Switch(config)# l2protocol enable
```

**相关命令**：show l2protocol

### 3.12.2 `l2protocol tunnel-dmac`

**功能**：使用该命令配置给二层协议报文添加的二层头的目的MAC 位址， 使用no 命令将该
  MAC 地址恢复为默认值。

**语法**：

```
l2protocol tunnel-dmac MAC
no l2protocol tunnel-dmac
```

| 参数 | 说明 |
| --- | --- |
| MAC | 为二层协议报文添加的二层头的目的MAC 取值范围 |
| 0100.0CCD.CDD0-D2 or |  |
| 010F.E200.0003 |  |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

使用该命令配置给二层协议报文添加二层头的目的MAC 位址，默认值为
  0100.0CCD.CDD0。

**示例**：

```
使用以下配置给二层协议报文添加的二层头目的MAC 位址指定为010FE2000003:
Switch# configure terminal
Switch(config)# l2protocol tunnel-dmac 010F.E200.0003
```

**相关命令**：show l2protocol

### 3.12.3 `l2protocol mac 1`

**功能**：使用该命令配置可透传的二层协议报文地址。

**语法**：

```
l2protocol mac 1 MAC mask MASK
no l2protocol mac 1
```

| 参数 | 说明 |
| --- | --- |
| MAC | L2 Protocol MAC 地址。 0180.C200.0000~0180.C2 00.003F 这段MAC 已经被系统的其他功能使用，因此无法起透传。 取值范围0180.C200.0000 ~ 0180.C2FF.FFFF |
| MASK | L2 Protocol MAC 掩码取值范围FFFF.FF00.0000- |
| FFFF.FFFF.FFFF |  |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

使用该命令配置可透传的二层协议报文地址。

**示例**：

```
使用以下命令配置可透传的二层协议报文地址:
Switch# configure terminal
Switch(config)# l2protocol mac 1 0180.c222.0000 mask ffff.ffff.0000
```

**相关命令**：l2protocol full-mac

### 3.12.4 `l2protocol mac <2-6>`

**功能**：使用该命令配置可透传的二层协议报文地址。

**语法**：

```
l2protocol mac MAC_NUM MAC
no l2protocol mac MAC_NUM
```

| 参数 | 说明 |
| --- | --- |
| MAC_NUM | l2 protocal MAC 的编号 2-6 |
| MAC | l2 protocal MAC 的地址取值范围0180.C200.0000 ~ 0180.C2FF.FFFF |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

使用该命令配置可透传的二层协议报文地址。两个地址段不应互相交迭

**示例**：

```
使用以下命令配置可透传的二层协议报文地址:

Switch# configure terminal
Switch(config)# l2protocol mac 3 0180.c200.0000
```

**相关命令**：l2protocol full-mac

### 3.12.5 `l2protocol`

**功能**：使用该命令配置进入该端口的二层协议报文是丢弃，正常处理还是透传。

**语法**：

```
l2protocol ( stp | slow-proto | dot1x | cfm | mac MAC_NUM | full-mac ) ( discard | peer |
tunnel ( evc WORD | ) | forward）
l2protocol ( cdp | vtp | lldp | all ) ( discard | peer | forward )
no l2protocol ( stp | slow-proto | dot1x | cfm | lldp | cdp | vtp | all | mac MAC_NUM |
full-mac )
```

| 参数 | 说明 |
| --- | --- |
| stp | MAC：0180.c200.0000 |
| slow-proto | MAC：0180.c200.0002， ethertype：0x8809 |
| dot1x | MAC：0180.c200.0003， ethertype：0x888e |
| cfm | ethertype：0x8902 |
| cdp |  |
| Discovery Protocol |  |
| vtp |  |
| Vlan Trunking Protocol |  |
| lldp |  |
| Link Layer Discovery |  |
| Protocol |  |
| all | 包括stp, sflow-proto, |
| dot1x, cfm, lldp, cdp, vtp |  |
| mac MAC_NUM | 全局配置的以 0180.c2XX.XXXX 开头的二层协议报文地址段 1-2 |
| discard | 丢弃 |
| peer | 将二层协议报文正常处理 |
| tunnel | 从上联口出去时， 给二层协议报文添加新的二层头， 其中mac da 为配置的 tunnel-dmac， vlan 为evc 对应的svlan；从其它 tunnel 端口出去时，不改变二层协议报文 |
| forward | 转发 |
| full-mac | 任意可配的二层报文地址段 - |
| WORD | EVC 名称不超过15 个字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

使用该命令配置进入该端口的二层协议报文是丢弃，正常处理还是透传。

**示例**：

```
使用以下命令配置进入该端口的STP 报文丢弃:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# l2protocol stp discard
使用以下命令配置进入该端口的慢协议报文透传:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# l2protocol slow-proto tunnel evc evc1
```

**相关命令**：无

### 3.12.6 `l2protocol uplink enable`

**功能**：使用该命令配置二层协议报文透传时的上联口。

**语法**：

```
l2protocol uplink enable
no l2protocol uplink enable
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

使用该命令配置二层协议报文透传时的上联口。从配置为tunnel 的端口进来的二层报
  文，从上联口出去时会添加目的mac 为tunnel dmac 的二层头；从上联口进来的添加
  新二层头的报文，从tunnel 端口出去时，会将二层头去掉。

**示例**：

```
使用以下命令配置该端口在二层协议报文透传时为上联口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# l2protocol uplink enable
```

**相关命令**：无

### 3.12.7 `show l2protocol`

**功能**：使用该命令显示二层协议报文透传功能的配置。

**语法**：

```
show l2protocol ( interface IFNAME | tunnel-dmac | )
```

| 参数 | 说明 |
| --- | --- |
| interface IFNAME | 端口名支持聚合口和物理口 |
| tunnel-dmac | 2 层tunnel 目的MAC 位址 - |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用该命令显示二层协议报文透传功能的配置。

**示例**：

```
以下命令显示了eth-0-1 口二层协议报文透传功能的相关配置:
Switch# show l2protocol interface eth-0-2
Interface  PDU Address        MASK            Status    EVC
           (u)-Untagged
           (t)-Tagged
=========  =================  ==============  ========  ================
eth-0-2    0100.0ccc.cccc(u)  ffff.ffff.ffff  Peer      N/A
eth-0-2    0100.0ccc.cccc(t)  ffff.ffff.ffff  Peer      N/A
eth-0-2    stp(u)             ffff.ffff.ffff  Peer      N/A
eth-0-2    stp(t)             ffff.ffff.ffff  Peer      N/A
eth-0-2    slow-proto(u)      ffff.ffff.ffff  Peer      N/A
eth-0-2    slow-proto(t)      ffff.ffff.ffff  Peer      N/A
eth-0-2    dot1x(u)           ffff.ffff.ffff  Peer      N/A
eth-0-2    dot1x(t)           ffff.ffff.ffff  Peer      N/A
eth-0-2    cfm(u)             ffff.ffff.ffff  Peer      N/A
eth-0-2    cfm(t)             ffff.ffff.ffff  Peer      N/A
eth-0-2    cdp(u)             ffff.ffff.ffff  Peer      N/A
eth-0-2    cdp(t)             ffff.ffff.ffff  Peer      N/A
eth-0-2    vtp(u)             ffff.ffff.ffff  Peer      N/A
eth-0-2    vtp(t)             ffff.ffff.ffff  Peer      N/A
eth-0-2    lldp(u)            ffff.ffff.ffff  Peer      N/A
eth-0-2    lldp(t)            ffff.ffff.ffff  Peer      N/A
以下命令显示了2 层tunnel 目的MAC 位址为01000ccdcdd0 的透传功能的相关配置:
Switch# show l2protocol tunnel-dmac
Layer2 protocols tunnel destination MAC address is 0100.0ccd.cdd0
```

**相关命令**：无

### 3.12.8 `l2protocol cos`

**功能**：使用该命令配置新加二层头的vlan tag 中的Priority。

**语法**：

```
l2protocol cos COS_VALUE
no l2protocol cos
```

| 参数 | 说明 |
| --- | --- |
| COS_VALUE |  |
| vlan tag priority | 0-7 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

使用该命令配置新加二层头的vlan tag 中的Priority，默认值为0。

**示例**：

```
使用以下命令配置新加二层头的vlan tag 中的Priority 为7:
Switch# configure terminal
Switch(config)# l2protocol cos 7
```

**相关命令**：无

### 3.12.9 `l2protocol full-mac`

**功能**：使用该命令配置可透传的二层协议报文地址。支持任意MAC 地址。

**语法**：

```
l2protocol full-mac MAC
no l2protocol full-mac
```

| 参数 | 说明 |
| --- | --- |
| MAC | l2protocol 透传MAC 地址，可支持全部地址取值范围0000.0000.0000 ~ FFFF. FFFF.FFFF |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

当配置的MAC 地址和stp，slow-proto，dot1x 或mac <1-4>地址重叠时，tunnel 选择
  的优先级为：stp > slow-proto > dot1x > full-mac > mac<1-4>。
  当配置的full-mac 地址和l2protocol tunnel-dmac 地址重叠时，重叠的full-mac 地址
  无法tunnel。

**示例**：

```
使用以下命令配置可透传的二层协议报文地址:
Switch# configure terminal
Switch(config)# l2protocol full-mac  0100.0CCC.CCCC
```

**相关命令**：l2protocol mac、3.13 Storm Control 命令


## 3.13 Storm Control 命令

### 3.13.1 `port storm-control`

**功能**：使用此命令在二层端口上配置风暴控制。
  使用关键词no 恢复设置为默认值。

**语法**：

```
storm-control ( broadcast | multicast | unicast ) ( level LEVEL | pps PPS )
no storm-control ( broadcast | multicast | unicast )
```

| 参数 | 说明 |
| --- | --- |
| broadcast | 接口上启用广播控制 |
| multicast | 接口上启用组播控制 |
| unicast | 接口上启用未知单播控制 |
| level LEVEL | 设置报文占可用带宽的最大百分比 0.00-100.00 |
| pps PPS | 设置每秒钟发送报文的最大数量 0-1000000000 |

**命令模式**：端口配置模式

**默认配置**：关闭

**使用说明**：

只能在二层端口上配置。

**示例**：

```
设置广播报文占可用带宽的最大百分比为30%:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# storm-control broadcast level 30
恢复端口默认设置:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no storm-control broadcast
```

**相关命令**：show storm-control

### 3.13.2 `vlan storm-control`

**功能**：使用此命令在vlan 上配置风暴控制。
  使用关键词no 恢复设置为默认值。

**语法**：

```
storm-control ( broadcast | multicast | unicast ) ( bandwidth <1-100000000> | pps <0-
1000000000> )

no storm-control ( broadcast | multicast | unicast )
```

| 参数 | 说明 |
| --- | --- |
| broadcast | vlan 上启用广播控制 |
| multicast | vlan 上启用组播控制 |
| unicast | vlan 上启用未知单播控制 bandwidth <1-100000000> 设置每秒钟发送报文比特数的最大数量 1-100000000 pps <0-1000000000> 设置每秒钟发送报文的最大数量 0-1000000000 |

**命令模式**：VLAN 配置模式

**默认配置**：关闭

**使用说明**：

只能在vlan 配置模式下配置。

**示例**：

```
设置vlan 上广播报文控制速率为3000bps:
Switch# configure terminal
Switch(config)# vlan 10
Switch(config-vlan)# storm-control broadcast bandwidth 3000
恢复端口默认设置:
Switch# configure terminal
Switch(config)# vlan 10
Switch(config-vlan)# no storm-control broadcast
```

**相关命令**：show storm-control

### 3.13.3 `ipg storm-control enable`

**功能**：使用此命令全局指定风暴控制是否计算帧间隙。
  
  使用关键词no 恢复此设置为默认值。

**语法**：

```
ipg storm-control enable
no ipg storm-control enable
```

**命令模式**：全局配置模式

**默认配置**：关闭

**使用说明**：

该命令只可以在全局配置模式中配置。

**示例**：

```
配置风暴控制计算帧间隙:
Switch# configure terminal
Switch(config)# ipg storm-control enable
配置风暴控制不计算帧间隙:
Switch# configure terminal
Switch(config)# no ipg storm-control enable
```

**相关命令**：无

### 3.13.4 `show storm-control`

**功能**：使用此命令显示风暴控制的配置信息。

**语法**：

```
show storm-control ( interface INTERFACE | vlan <1-4094> | )
```

| 参数 | 说明 |
| --- | --- |
| interface INTERFACE | 端口名（可选） 支持物理口 vlan <1-4094> VLAN ID（可选） 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用此命令显示端口的风暴控制的配置信息。

**示例**：

```
显示所有端口及vlan 的风暴控制设置:
Switch# show storm-control
显示端口eth-0-1 风暴控制设置:
Switch# show storm-control interface eth-0-1
```

**相关命令**：storm-control

### 3.13.5 `show storm-control resource`

**功能**：使用此命令显示风暴控制的资源使用情况。

**语法**：

```
show resource storm-control
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用此命令显示风暴控制的资源使用情况。

**示例**：

```
显示storm control 的整体资源和使用情况。:
Switch# show resource storm-control
```

**相关命令**：无、3.14 Loopback Detection 命令


## 3.14 Loopback Detection 命令

### 3.14.1 `loopback-detect enable`

**功能**：使用此命令在端口上使能loopback detection 功能。

**语法**：

```
loopback-detect enable
no loopback-detect enable
```

**命令模式**：端口配置模式

**默认配置**：不启用

**使用说明**：

使用该命令开启端口loopback detection 功能。系统会定期发送检测报文检测该端口下
  挂网络中是否存在环路。该功能会消耗CPU 资源，因此在不需要的时候最好关闭该功
  能。

**示例**：

```
以下示例展示如何使能端口eth-0-1 上的loopback detection 功能:

Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# loopback-detect enable
```

**相关命令**：show loopback-detect

### 3.14.2 `loopback-detect packet-interval`

**功能**：设置loopback detection 报文的发送间隔，该配置对所有端口生效。默认的发送间隔为
  5 秒。

**语法**：

```
loopback-detect packet-interval INTERVAL
no loopback-detect packet-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 检测报文发送时间间隔 1-300, 单位：秒 |

**命令模式**：全局配置模式

**默认配置**：5 秒

**使用说明**：

使用该命令设置loopback detection 报文的发送间隔，配置后，对所有端口生效。如果
  时间间隔较短，那么可以较快的检测出环路，相对的也会想好更多系统资源。

**示例**：

```
以下示例展示如何设置loopback detection 报文的发送间隔为10 秒:
Switch# configure terminal
Switch(config)# loopback-detect packet-interval 10
```

**相关命令**：show loopback-detect

### 3.14.3 `loopback-detect recovery-time`

**功能**：设置loopback detection 生效后，从异常状态恢复到正常状态需要的时间。默认的恢复
  时间是发送时间间隔的三倍。

**语法**：

```
loopback-detect recovery-time TIME
no loopback-detect recovery-time
```

| 参数 | 说明 |
| --- | --- |
| TIME | 恢复时间，以秒为单位 1-255, 单位：秒 |

**命令模式**：端口配置模式

**默认配置**：发送时间间隔的三倍。端口进入shutdown 状态不受此命令控制

**使用说明**：

如果端口是shutdown，该命令无效

**示例**：

```
以下示例展示如何设置loopback detection 恢复时间间隔为10 秒:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# loopback-detect recovery-time 10
```

**相关命令**：show loopback-detect

### 3.14.4 `loopback-detect delay-time`

**功能**：设置loopback detection 延迟生效的时间，默认不启用延迟生效。

**语法**：

```
loopback-detect delay-time TIME
no loopback-detect delay-time
```

| 参数 | 说明 |
| --- | --- |
| TIME | 延迟时间 1-255, 单位：秒 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

使用该命令设置loopback detection 延迟生效的时间，默认不启用。默认收到一个
  loopback detection 报文的就触发action。

**示例**：

```
以下示例展示如何设置loopback detection 延迟生效时间为5 秒:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# loopback-detect delay-time 5
```

**相关命令**：show loopback-detect

### 3.14.5 `loopback-detect action`

**功能**：配置loopback detection 的处理动作，可配置发送告警、关闭接口等处理动作。

**语法**：

```
loopback-detect action { shutdown | trap | block }
no loopback-detect action
```

| 参数 | 说明 |
| --- | --- |
| shutdown | 检测到环回后，关闭接口. |
| Trap | 检测到环回后，发送告警. |
| block | 检测环回后，阻塞端口 |

**命令模式**：端口配置模式

**默认配置**：Trap

**使用说明**：

使用该命令设置loopback detection 的处理动作，只有当loopback detection 使能时，
  才能配置。

**示例**：

```
以下示例展示如何配置接口eth-0-1 的环回处理行为，当环回触发时，关闭接口:
Switch# configure terminal
Switch(config)#interface eth-0-1
Switch(config-if)# loopback-detect action shutdown
```

**相关命令**：show loopback-detect、loopback-detect enable

### 3.14.6 `loopback-detect packet vlan`

**功能**：配置对指定一个或多个指定VLAN 进行环回检测。

**语法**：

```
loopback-detect packet vlan VID
no loopback-detect packet vlan VID
```

| 参数 | 说明 |
| --- | --- |
| VID | VLAN ID, 最多可指定8 个. 1-4094 |

**命令模式**：端口配置模式

**默认配置**：未指定VLAN

**使用说明**：

接口开启Loopback Detection 功能后，系统默认发送的为Untag 检测报文，即不对任
  何指定VLAN 进行环回检测。当接口是以Tagged 方式加入VLAN，接口发出去Untag
  检测报文在链路上会被丢弃，接口将收不到环回回来的报文，因此需要配置对指定的
  VLAN 进行环回检测。
  配置对指定VLAN 的Loopback Detection 功能，接口会定时发送1 份Untagged 检测
  报文和多份带指定VLAN Tag 的检测报文，一个接口最多可发送8 份带指定VLAN Tag
  的检测报文。

**示例**：

```
以下示例展示如何在接口eth-0-1 下，配置对VLAN 30 进行loopback detection 检测:
Switch# configure terminal
Switch(config)#interface eth-0-1
Switch(config-if)# loopback-detect packet vlan 30
```

**相关命令**：show running-config

### 3.14.7 `show loopback-detect`

**功能**：使用此命令查看loopback detection 的配置信息和接口状态。

**语法**：

```
show loopback-detect { interface IFNAME | packet-interval }
```

| 参数 | 说明 |
| --- | --- |
| interface IFNAME | 显示接口上的状态和配置信息. 支持物理口 |
| packet-interval | 显示loopback detection 报文发送间隔时间. |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

可以查看loopback detection 的配置信息，以及使能了loopback detection 的接口状态。

**示例**：

```
查看loopback detection 配置信息，及使能了loopback detection 的接口状态 :
Switch# show loopback-detect

Loopback detection packet interval(second) 5
Interface   Action   Status   Delay(s) DLeft(s) Recovery(s) RLeft(s) Send
Recv                Count
eth-0-47    trap     NORMAL   30       -        15          -        N/A
N/A                 0
eth-0-48    trap     NORMAL   -        -        15          -        2001-01-05
034721 N/A                 0
```

**相关命令**：loopback-detect action、loopback-detect enable

### 3.14.8 `loopback-detect in-loop-enable`

**功能**：此功能用来在全局配置模式下，使能loopback-detect 的in-loop 模式

**语法**：

```
loopback-detect in-loop-enable
no loopback-detect in-loop-enable
```

**命令模式**：全局配置模式

**默认配置**：不启用

**使用说明**：

使用该命令可以在全局配置模式下，将loopback-detect 切换为in-loop 模式。该模式
  下，环路告警的触发条件为不仅限收发lbdt 报文的为同一端口，端口收到同一板子上
  其他端口发出的lbdt 报文也会触发环路告警。

**示例**：

```
以下例子说明了如何在全局配置模式下，使能环路检测的in-loop 模式:
Switch# configure terminal
Switch(config)# loopback-detect in-loop-enable
```

**相关命令**：无、3.15 MLAG 命令


## 3.15 MLAG 命令

### 3.15.1 `mlag configuration`

**功能**：使用此命令来创建mlag 模式，并进入mlag 配置模式。

**语法**：

```
mlag configuration
no mlag configuration
```

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

使用此命令来创建mlag 模式，并进入mlag 配置模式。使用exit 命令可以退出该模式，
  同时并不影响该模式。使用no 命令删除该模式，该模式下的所有配置均会同时被删除。

**示例**：

```
以下示例展示如何使用此命令来创建mlag 模式，并进入mlag 配置模式:
Switch# configure terminal
Switch(config)# mlag configuration
```

**相关命令**：show mlag

### 3.15.2 `peer-address`

**功能**：此命令用来指定mlag 邻居的ipv4 地址。使用no 命令删除mlag 邻居的ipv4 地址

**语法**：

```
peer-address IP_ADDR
no peer-address
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | MLAG 邻居的IPv4 地址 IPv4 地址 |

**命令模式**：MLAG 配置模式

**默认配置**：无

**使用说明**：

此命令用来指定mlag 邻居的ipv4 地址，根据此地址进行邻居的建立。

**示例**：

```
以下示例展示如何指定mlag 邻居ipv4 地址:
Switch# configure terminal
Switch(config)# mlag configuration
Switch(config-mlag)# peer-address 12.1.1.2
Switch(config-mlag)#
```

**相关命令**：show mlag peer

### 3.15.3 `peer-link`

**功能**：此命令用来指定连接mlag 邻居所用的接口。使用no 命令删除mlag 邻居所用接口

**语法**：

```
peer-link IFNAME
no peer-link
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 连接peer-link 所用的接口只能设置成普通物理口或者聚合口 |

**命令模式**：MLAG 配置模式

**默认配置**：无

**使用说明**：

此命令用来指定连接mlag 邻居所使用的接口。要形成mlag 邻居，需要有两台互联的
  设备，中间用来连接彼此的接口，称作peer-link。Peer-link 上既承载了协议报文，也
  承载了数据报文。

**示例**：

```
以下示例展示如何制定mlag 邻居所用的接口:
Switch# configure terminal
Switch(config)# mlag configuration
Switch(config-mlag)# peer-link eth-0-9
Switch(config-mlag)#
```

**相关命令**：show mlag

### 3.15.4 `timers mlag`

**功能**：此命令用来指定keepalive 发送间隔和holdtime 时间。使用no 命令将keepalive 发送
  时间间隔恢复默认值

**语法**：

```
timers mlag keepalive holdtime
no timers mlag
```

| 参数 | 说明 |
| --- | --- |
| keepalive | keepalive 间隔 1-65535, 单位：秒 |
| holdtime | holdtime 间隔 4-65535, 单位：秒 |

**命令模式**：MLAG 配置模式

**默认配置**：keepalive 间隔默认1 秒，holdtime 时间默认5 秒。

**使用说明**：

此命令指定了keepalive 间隔和holdtime 时间。此设置将在下一次邻居建立时生效。
  在本地配置的keepalive 和通过open 报文里携带的远端holdtime 的四分之一中，系统
  会选择较小数值的那个来进行计算。
  注意: holdtime 时间不能小于4 倍的keepalive 间隔。

**示例**：

```
以下示例展示如何指定keepalive 发送间隔和holdtime 时间:
Switch# configure terminal
Switch(config)# mlag configuration
Switch(config-mlag)# timers mlag 10 100
Switch(config-mlag)#
```

**相关命令**：show mlag peer

### 3.15.5 `reload-delay`

**功能**：此命令用来指定在mlag 邻居设备重启之后，除peer-link 之外的其他端口处于error
  disable 的时间。

**语法**：

```
reload-delay ( auto | period )
no reload-delay
```

| 参数 | 说明 |
| --- | --- |
| period | 端口处于error disable 的时间。注意：数值0 代表不让端口处于error disable 状态。 0-86400, 单位：秒 |
| auto | 在MLAG peer 建立成功之后自动从errdisable 状态恢复 |

**命令模式**：MLAG 配置模式

**默认配置**：300 秒.

**使用说明**：

当MLAG 邻居重启时，除了peer link 之外的其他端口会在error disable 状态下保持一
  段时间。在这段时间里，可以让拓扑达到稳定的状态，比如mlag 邻居状态机可以在这
  段时间里进行建立。此命令就是用来设置这个时间值的。

**示例**：

```
以下示例展示如何指定端口处于errdisable 状态的时间:
Switch# configure terminal
Switch(config)# mlag configuration
Switch(config-mlag)# reload-delay 100
Switch(config-mlag)#
```

**相关命令**：show mlag

### 3.15.6 `sync-orphan`

**功能**：此命令用来使能mlag 邻居同步orphan 端口上的MAC 表项。

**语法**：

```
sync-orphan
no sync-orphan
```

**命令模式**：MLAG 配置模式

**默认配置**：使能

**使用说明**：

如果该命令没有配置， mlag 设备只会同步mlag 组内的MAC 表项。

**示例**：

```
以下示例展示如何使能mlag 邻居同步orphan 端口上的MAC 表项:
Switch# configure terminal
Switch(config)# mlag configuration
Switch(config-mlag)# sync-orphan
Switch(config-mlag)#
```

**相关命令**：show mlag

### 3.15.7 `sync-overlay`

**功能**：此命令用来使能mlag 邻居同步overlay 逻辑口上的MAC 表项。

**语法**：

```
sync-overlay
no sync-overlay
```

**命令模式**：MLAG 配置模式

**默认配置**：使能

**使用说明**：

如果该命令没有配置， mlag 设备只会同步mlag 组内的MAC 表项。

**示例**：

```
以下示例展示如何使能mlag 邻居同步overlay 逻辑口上的MAC 表项:
Switch# configure terminal
Switch(config)# mlag configuration
Switch(config-mlag)# sync-overlay
Switch(config-mlag)#
```

**相关命令**：show mlag

### 3.15.8 `mlag`

**功能**：此命令用来在聚合口上指定MLAG ID。

**语法**：

```
mlag MLAGID
no mlag
```

| 参数 | 说明 |
| --- | --- |
| MLAGID | MLAG ID 值。 1-63 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

此命令用来在聚合口上指定MLAG ID。每个聚合口只能指定一个MLAG ID，每个
  MLAG ID 只能同时被一个聚合口使用。

**示例**：

```
以下示例展示如何在聚合口上指定MLAG ID:
Switch# configure terminal
Switch(config)# interface agg1
Switch(config-if)# mlag 1
```

**相关命令**：show mlag interface

### 3.15.9 `clear mlag count`

**功能**：此命令用来清除mlag 计数信息。

**语法**：

```
clear mlag count
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用此命令用来清除mlag 计数信息，可以使用show mlag peer 来查看相关计数。

**示例**：

```
以下命令展示如何清除mlag 计数信息并且显示mlag 邻居信息:
Switch# clear mlag count
Switch# show mlag peer

MLAG neighbor is 12112, MLAG version 1
MLAG state = Established, up for 000039
Last read 000015, hold time is 240, keepalive interval is 60 seconds
Received 0 messages,Sent 0 messages
Open      received 0, sent 0
KAlive    received 0, sent 0
Fdb sync  received 0, sent 0
Failover  received 0, sent 0
Conf      received 0, sent 0
Syspri    received 0, sent 0
Peer fdb  received 0, sent 0
STP Total received 0, sent 0
 Global   received 0, sent 0
 Packet   received 0, sent 0
 Instance received 0, sent 0
 State    received 0, sent 0
Connections established 1; dropped 0
Local host 12111, Local port 61000
Foreign host 12112, Foreign port 37335
remote_sysid 0ecb30301100
```

**相关命令**：show mlag peer

### 3.15.10 `show mlag`

**功能**：此命令用来显示mlag 的相关的配置信息。

**语法**：

```
show mlag
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用此命令来显示mlag 的相关配置信息。

**示例**：

```
以下命令展示如何使用此命令来显示mlag 的相关配置信息:
Switch# show mlag

MLAG configuration
-----------------
role          Master
local_sysid   001e080a6fca
remote_sysid  000000000000
mlag_sysid    001e080a6fca
local_syspri  32768
remote_syspri 0
mlag_syspri   32768
peer-link     -
peer conf     No
reload-delay  300
```

**相关命令**：mlag configuration

### 3.15.11 `show mlag peer`

**功能**：此命令用来显示mlag 邻居信息。

**语法**：

```
show mlag peer ( vlan-if | )
```

| 参数 | 说明 |
| --- | --- |
| vlan-if | vlan 接口相关信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用此命令来显示mlag 邻居信息。

**示例**：

```
以下命令展示如何使用此命令来显示mlag 邻居信息:
Switch# show mlag peer
MLAG neighbor is 12112, MLAG version 1
MLAG state = Established, up for 4d02h14m
Last read 000029, hold time is 240, keepalive interval is 60 seconds
Received 6835 messages,Sent 7185 messages
Open      received 1, sent 2
KAlive    received 6831, sent 6830
Fdb sync  received 0, sent 0
Failover  received 0, sent 87
Conf      received 1, sent 1
STP Total received 2, sent 265
 Global   received 2, sent 3
 Packet   received 0, sent 0
 Instance received 0, sent 0
 State    received 0, sent 262
Connections established 1; dropped 0
Local host 12111, Local port 61000
Foreign host 12112, Foreign port 34283
remote_sysid 5e266a03d400
```

**相关命令**：peer-address

### 3.15.12 `show mlag interface`

**功能**：此命令用来显示mlag 接口信息。

**语法**：

```
show mlag interface ( MLAGID | )
```

| 参数 | 说明 |
| --- | --- |
| MLAGID | MLAG ID 值。 1-63 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用此命令来显示mlag 接口信息。

**示例**：

```
以下命令展示如何使用此命令来显示mlag 接口信息:
Switch# show mlag interface

mlagid  local-if  local-state    remote-state
1       agg1      up             up
2       agg2      up             up
```

**相关命令**：mlag MLAGID、3.16 Hash 负载均衡命令


## 3.16 Hash 负载均衡命令

### 3.16.1 `hash field`

**功能**：使用该命令用来配置已有hash field 或创建新的hash field 并进入hash field 视图，使
  用该命令的no 形式删除用户创建的hash-field。

**语法**：

```
hash-field ( port-channel | ecmp | NAME )
no hash-field NAME
```

| 参数 | 说明 |
| --- | --- |
| port-channel | 用于Port-channel 的系统默认hash filed |
| ecmp | 用于Ecmp 的系统默认 |
| hash filed |  |
| NAME | 用户创建的hash field 名称 字符串首字母必须是a-z, A-Z，0-9 或者._-，且所有字符只能是a-z, A-Z，0-9 或者._-，最大长度为64 |

**命令模式**：全局配置模式

**默认配置**：port-channel，ecmp

**使用说明**：

系统共支持配置4 个hash field。当系统初始化时，默认建立port-channel，ecmp，其
  余2 个由用户自定义创建。如果hash field 被应用在hash value 上，那么该hash field
  不能删除。

**示例**：

```
如下示例，创建一个名为user 的hash field:
Switch# configure terminal
Switch(config)# hash-field user
Switch(config-hash-field)#
如下示例，删除名为user 的hash field:
Switch# configure terminal
Switch(config)# no hash-field user
```

**相关命令**：show hash-field

### 3.16.2 `l2`

**功能**：使用此命令设置L2 报文的字段做hash 负载均衡，使用该命令的no 形式恢复默认值。

**语法**：

```
l2 ( macda | macsa | vlan | eth-type | src-interface )
no l2
```

| 参数 | 说明 |
| --- | --- |
| macda | 源MAC 地址 |
| macsa | 目的MAC 地址 |
| vlan |  |
| VLAN |  |
| eth-type | 以太网类型 |
| src-interface | 入端口 |

**命令模式**：Hash-field 配置模式

**默认配置**：l2 macsa macda

**使用说明**：

无

**示例**：

```
如下示例，显示了如何在port-channel 中选择l2 报文的macsa 做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# l2 macsa
如下示例，显示了如何在port-channel 中选择l2 报文的默认字段做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# no l2
```

**相关命令**：show hash-field

### 3.16.3 `ip`

**功能**：使用此命令设置IP 报文的字段做hash 负载均衡，使用该命令的no 形式恢复默认值。

**语法**：

```
ip ( ipda | ipsa | ip-protocol | sourceport | destport | src-interface )
no ip
```

| 参数 | 说明 |
| --- | --- |
| ipda | 目的IP 地址 |
| ipsa | 源IP 地址 |
| ip-protocol | IP 协议 |
| sourceport | 四层源端口号 |
| destport | 四层目的端口号 |
| src-interface | 入端口 |

**命令模式**：Hash-field 配置模式

**默认配置**：ip ipsa ipda sourceport destport ip-protocol

**使用说明**：

无

**示例**：

```
如下示例，显示了如何在port-channel 中选择ip 报文的ipsa 做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# ip ipsa
如下示例，显示了如何在port-channel 中选择ipv4 报文的默认字段做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# no ip
```

**相关命令**：show hash-field

### 3.16.4 `ipv6`

**功能**：使用此命令设置IPv6 报文的字段做hash 负载均衡，使用该命令的no 形式恢复默认值。

**语法**：

```
ipv6 ( ipda | ipsa | ip-protocol | sourceport | destport | src-interface )
no ipv6
```

| 参数 | 说明 |
| --- | --- |
| ipda | 目的IP 地址 |
| ipsa | 源IP 地址 |
| ip-protocol | IP 协议 |
| sourceport | 四层源端口号 |
| destport | 四层目的端口号 |
| src-interface | 入端口 |

**命令模式**：Hash-field 配置模式

**默认配置**：ipv6 ipsa ipda sourceport destport ip-protocol

**使用说明**：

ipv6 报文的字段做hash 时，只有系统模式为ipv6 模式时，才能起作用。

**示例**：

```
如下示例，显示了如何在port-channel 中选择ipv6 报文的ipsa 做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# ipv6 ipsa
如下示例，显示了如何在port-channel 中选择ipv6 报文的默认字段做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# no ipv6
```

**相关命令**：show hash-field

### 3.16.5 `vxlan`

**功能**：使用此命令设置vxlan 报文的做hash 的字段选择,使用该命令的no 形式恢复默认值。

**语法**：

```
vxlan { vni | src-interface }
vxlan ( { vni | src-interface } | ) outer { ipsa | ipda | sourceport | destport | vlan }
vxlan ( { vni | src-interface } | ) inner-layer2 { macsa | macda | eth-type }
vxlan ( { vni | src-interface } | ) inner-layer3 { ipsa | ipda | sourceport | destport | ip-
protocol }
no vxlan
```

| 参数 | 说明 |
| --- | --- |
| vni | 根据Vxlan 的vni 进行负载均衡 |
| src-interface | 根据报文的入口进行负载均衡 |
| outer ipsa | 根据外层报文的源ip 地址进行负载均衡 |
| outer ipda | 根据外层报文的目的ip 地址进行负载均衡 |
| outer sourceport | 根据外层报文的源端口号进行负载均衡 |
| outer destport | 根据外层报文的目的端口号进行负载均衡 |
| outer vlan | 根据外层报文的vlan id 进行负载均衡 |
| inner macsa | 根据内层报文的源MAC 进行负载均衡 |
| inner macda | 根据内层报文的目的MAC 进行负载均衡 |
| inner eth-type | 根据内层报文的以太网类型进行负载均衡 |
| inner ipsa | 根据内层报文的源ip 地址进行负载均衡 |
| inner ipda | 根据内层报文的目的ip 地址进行负载均衡 |
| inner sourceport | 根据内层报文的源端口号进行负载均衡 |
| inner destport | 根据内层报文的目的端口号进行负载均衡 |
| inner ip-protocol | 根据内层报文的ip 协议进行负载均衡 |

**命令模式**：Hash-field 配置模式

**默认配置**：vxlan vni outer ipsa ipda sourceport

**使用说明**：

此命令不能同时vxlan 配置outer 和inner 字段，inner 字段中layer2 与layer3 配置时不
  冲突的。

**示例**：

```
如下示例，显示了如何在port-channel 中选择vxlan 报文的outer ipsa 和vni 做hash
负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# vxlan vni outer ipda
如下示例，显示了如何在port-channel 中选择vxlan 报文的默认字段做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# no vxlan
```

**相关命令**：show hash-field

### 3.16.6 `nvgre`

**功能**：使用此命令设置nvgre 报文的做hash 的字段选择,使用该命令的no 形式恢复默认值。

**语法**：

```
nvgre { vsid | src-interface }
nvgre ( { vsid | src-interface } | ) outer { ipsa | ipda }
nvgre ( { vsid | src-interface } | ) inner-layer2 { macsa | macda | eth-type }
nvgre ( { vsid | src-interface } | ) inner-layer3 { ipsa | ipda | sourceport | destport | ip-
protocol }
no nvgre
```

| 参数 | 说明 |
| --- | --- |
| vsid | 根据nvgre 的vsid 进行负载均衡 |
| src-interface | 根据报文的入口进行负载均衡 |
| outer ipsa | 根据外层报文的源ip 地址进行负载均衡 |
| outer ipda | 根据外层报文的目的ip 地址进行负载均衡 |
| inner macsa | 根据内层报文的源MAC 进行负载均衡 |
| inner macda | 根据内层报文的目的MAC 进行负载均衡 |
| inner eth-type | 根据内层报文的以太网类型进行负载均衡 |
| inner ipsa | 根据内层报文的源ip 地址进行负载均衡 |
| inner ipda | 根据内层报文的目的ip 地址进行负载均衡 |
| inner sourceport | 根据内层报文的源端口号进行负载均衡 |
| inner destport | 根据内层报文的目的端口号- 进行负载均衡 |
| inner ip-protocol | 根据内层报文的ip 协议进行负载均衡 |
| top-label | 根据报文的top label 进行负载均衡 |

**命令模式**：Hash-field 配置模式

**默认配置**：nvgre vsid outer ipsa ipda

**使用说明**：

此命令不能在一个hash field 中同时配置outer 与inner 字段，但是inner layer2 与
  layer3 的配置不冲突。

**示例**：

```
如下示例，显示了如何在port-channel 中选择nvgre 报文的outer ipsa 和vsid 做hash
负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# nvgre vsid outer ipda
如下示例，显示了如何在port-channel 中选择nvgre 报文的默认字段做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# no nvgre
```

**相关命令**：show hash-field

### 3.16.7 `mpls`

**功能**：使用此命令设置mpls 报文的做hash 的字段选择,使用该命令的no 形式恢复默认值。

**语法**：

```
mpls { top-label | 2nd-label | 3rd-label | src-interface }

mpls ( { top-label | 2nd-label | 3rd-label | src-interface } | ) inner { ipsa | ipda }
no mpls
```

| 参数 | 说明 |
| --- | --- |
| 2nd-label | 根据报文的2nd label 进行负载均衡 |
| 3rd-label | 根据报文的3rd label 进行负载均衡 |
| src-interface | 根据报文的入口进行负载均衡 |
| inner ipsa | 根据内层报文的源ip 地址进行负载均衡 |
| inner ipda | 根据内层报文的目的ip 地址进行负载均衡 |
| top-label | 根据报文的top label 进行负载均衡 |

**命令模式**：Hash-field 配置模式

**默认配置**：mpls top-label 2nd-label

**使用说明**：

无

**示例**：

```
如下示例，显示了如何在port-channel 中选择mpls 报文的inner ipsa 和top-label 做
hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# mpls top-label inner ipsa
如下示例，显示了如何在port-channel 中选择mpls 报文的默认字段做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# no mpls
```

**相关命令**：show hash-field

### 3.16.8 `vpws`

**功能**：使用此命令设置vpws 报文的做hash 的字段选择,使用该命令的no 形式恢复默认值。

**语法**：

```
vpws { top-label | 2nd-label | 3rd-label | src-interface }
no vpws
```

| 参数 | 说明 |
| --- | --- |
| 2nd-label | 根据报文的2nd label 进行负载均衡 |
| 3rd-label | 根据报文的3rd label 进行负载均衡 |
| src-interface | 根据报文的入口进行负载均衡 |
| src-interface | 根据报文的入口进行负载均衡 |

**命令模式**：Hash-field 配置模式

**默认配置**：vpws top-label 2nd-label

**使用说明**：

无

**示例**：

```
如下示例，显示了如何在port-channel 中选择vpws 报文的top-label 做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# vpws top-label

如下示例，显示了如何在port-channel 中选择vpws 报文的默认字段做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# no vpws
```

**相关命令**：show hash-field

### 3.16.9 `vpls`

**功能**：使用此命令设置vpls 报文的做hash 的字段选择,使用该命令的no 形式恢复默认值。

**语法**：

```
vpls src-interface
vpls ( src-interface | ) inner-layer2 { macsa | macda | vlan | eth-type }
vpls ( src-interface | ) inner-layer3 { ipsa | ipda | sourceport | destport | ip-protocol }
no vpls
```

| 参数 | 说明 |
| --- | --- |
| inner macsa | 根据内层报文的源MAC 进行负载均衡 |
| inner macda | 根据内层报文的目的MAC 进行负载均衡 |
| inner vlan | 根据内层报文的vlan id 进行负载均衡 |
| inner eth-type | 根据内层报文的以太网类型进行负载均衡 |
| inner ipsa | 根据内层报文的源IP 地址进行负载均衡 |
| inner ipsa | 根据内层报文的目的IP 地址进行负载均衡 |
| inner sourceport | 根据内层报文的源端口号进行负载均衡 |
| inner destport | 根据内层报文的目的端口号进行负载均衡 |
| inner ip-protocol | 根据内层报文的ip 协议进行负载均衡 |
| top-label | 根据报文的top label 进行负载均衡 |

**命令模式**：Hash-field 配置模式

**默认配置**：vpls inner-layer2 macsa macda vpls inner-layer3 ipsa ipda

**使用说明**：

使用此命令配置hash field 时，可以同时使用inner-layer2 与inner-layer3 的配置。

**示例**：

```
如下示例，显示了如何在port-channel 中选择vpws 报文的src-interface 和inner
macsa 做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# vpls src-interface inner-layer2 macsa
如下示例，显示了如何在port-channel 中选择vpws 报文的默认字段做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# no vpls
```

**相关命令**：show hash-field

### 3.16.10 `l3vpn`

**功能**：使用此命令设置l3vpn 报文的做hash 的字段选择,使用该命令的no 形式恢复默认值。

**语法**：

```
l3vpn src-interface
l3vpn ( src-interface | ) inner { ipsa | ipda | sourceport | destport | ip-protocol }
no l3vpn
```

| 参数 | 说明 |
| --- | --- |
| 2nd-label | 根据报文的2nd label 进行负载均衡 |
| 3rd-label | 根据报文的3rd label 进行负载均衡 |
| src-interface | 根据报文的入口进行负载均衡 |
| inner ipsa | 根据内层报文的源IP 地址进行负载均衡 |
| inner ipda | 根据内层报文的目的IP 地址进行负载均衡 |
| inner sourceport | 根据内层报文的源端口号进行负载均衡 |
| inner destport | 根据内层报文的目的端口号进行负载均衡 |
| inner ip-protocol | 根据内层报文的ip 协议进行负载均衡 |

**命令模式**：Hash-field 配置模式

**默认配置**：l3vpn inner ipsa ipda sourceport destport ip-protocol

**使用说明**：

无

**示例**：

```
如下示例，显示了如何在port-channel 中选择l3vpn 报文的src-interface 和inner ipsa
做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# l3vpn src-interface inner ipsa
```

**相关命令**：show hash-field

### 3.16.11 `disable control`

**功能**：使用该命令使得相应类型的报文按l2 报文处理，使用该命令的no 形式使得该类型报
  文按相应类型的hash 字段选择处理。

**语法**：

```
ip disable
no ip disable
ipv6 disable
no ipv6 disable
mpls disable
no mpls disable
```

**命令模式**：Hash-field 配置模式

**默认配置**：no ip disable no ipv6 disable no mpls disable

**使用说明**：

无

**示例**：

```
如下示例，显示了如何在port-channel 中选择不采用ipv6 报文的字段做hash 负载均
衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)#  ipv6 disable
如下示例，显示了如何在port-channel 中选择采用ipv6 报文的字段做hash 负载均衡:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)#  no ipv6 disable
```

**相关命令**：show hash-field

### 3.16.12 `ipv6 address compress`

**功能**：使用该命令可以选择压缩ipv6 地址的方式,使用该命令的no 形式可以恢复默认的配置。

**语法**：

```
ipv6 address compress mode ( xor | lsb )
no ipv6 address compress mode
```

| 参数 | 说明 |
| --- | --- |
| xor | 使用xor 算法把ipv6 地址压缩成32bits |
| lsb | 使用lsb 算法把ipv6 地址压缩成32bits |

**命令模式**：Hash-field 配置模式

**默认配置**：ipv6 address compress mode xor

**使用说明**：

无

**示例**：

```
如下示例，显示了如何配置ipv6 为lsb 压缩算法:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# ipv6 address compress mode lsb
如下示例，显示了如何配置ipv6 为默认压缩算法:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# no ipv6 address compress mode
```

**相关命令**：show hash-field

### 3.16.13 `hash seed`

**功能**：使用该命令设置hash seed 的值，使用该命令的no 形式可以恢复默认的配置。

**语法**：

```
seed ( <0-4294967295> | router-id | random )
no seed
```

| 参数 | 说明 |
| --- | --- |
| router-id | 使用router id 的值作为 hash seed 的值 |
| random | 取随机数作为hash seed 的值 |

**命令模式**：Hash-field 配置模式

**默认配置**：seed 0

**使用说明**：

无

**示例**：

```
如下示例，显示了如何配置hash seed 的值为router id:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# seed router-id
如下示例，显示了如何配置hash seed 的值为默认值:

Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# no seed
```

**相关命令**：show hash-field

### 3.16.14 `hash arithmetic`

**功能**：使用该命令来配置hash field 中每32bits 字段中前16bits 使用的hash 算法和后16bits
  使用的hash 算法。使用该命令的no 形式是恢复默认配置。

**语法**：

```
hash-arithmetic ( xor | crc )
no hash-arithmetic
```

| 参数 | 说明 |
| --- | --- |
| xor | hash 计算的xor 算法 |
| crc | hash 计算的crc 算法 |

**命令模式**：Hash-field 配置模式

**默认配置**：hash-arithmetic xor

**使用说明**：

无

**示例**：

```
如下示例，显示了如何在port-channel 中选择crc hash 算法:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# hash-arithmetic crc
如下示例，显示了如何在port-channel 中恢复默认的hash 算法:

Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# no hash-arithmetic
```

**相关命令**：show hash-field

### 3.16.15 `hash symmetry`

**功能**：使用该命令配置hash field 采用hash symmetry,该命令的no 形式是关闭hash
  symmetry。

**语法**：

```
mode symmetry
no mode symmetry
```

**命令模式**：Hash-field 配置模式

**默认配置**：no mode symmetry

**使用说明**：

无

**示例**：

```
如下示例，显示了如何在port-channel 中配置hash symmetry:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# mode symmetry
如下示例，显示了如何在port-channel 中配置hash symmetry 为默认值:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# no mode symmetry
```

**相关命令**：show hash-field

### 3.16.16 `description`

**功能**：使用该命令为hash field 设置描述信息，使用该命令的no 形式删除描述信息。

**语法**：

```
descrition LINE
no description
```

| 参数 | 说明 |
| --- | --- |
| LINE | Hash field 描述信息 hash field 描述信息,字符串长度小于128 字节 |

**命令模式**：Hash-field 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
如下示例，显示了如何为port-channel 中配置描述信息:
Switch# configure terminal
Switch(config)# hash-field port-channel
Switch(config-hash-field)# description this is port-channel
```

**相关命令**：show hash-field

### 3.16.17 `show hash-filed`

**功能**：使用该命令显示指定hash field 的信息或者全部hash field 的信息。

**语法**：

```
show hash-field ( port-channel | ecmp | NAME | )
```

| 参数 | 说明 |
| --- | --- |
| port-channel | 用于Port-channel 的系统默认hash filed |
| ecmp | 用于Ecmp 的系统默认 |
| hash filed |  |
| NAME | 用户创建的hash field 名称 - |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
如下示例，显示了port-channel 信息:
Switch# show hash-field port-channel
hash-field name: port-channel
description: this is port-channel
 Option                             Control type
----------------------------------------------------------------------
 ipv6 address compress              xor
 hash seed                          user set (0)
 hash arithmetic                    xor
 hash symmetry                      disable
 ip                                 enable
 ipv6                               enable
 mpls                               enable
----------------------------------------------------------------------
 hash field select
 Packet                HashField
----------------------------------------------------------------------
 l2:                   macsa                 macda

 ip:                   ipsa                  ipda
                       l4-sourceport         l4-destport
                       ip-protocol

 ipv6:                 ipsa                  ipda
                       l4-sourceport         l4-destport
                       ip-protocol

 gre:                  ipsa                  ipda
                       gre-key

 vxlan:                vni                   outer-l4-sourceport
                       outer-ipda            outer-ipsa

 nvgre:                vsid                  outer-ipda
                       outer-ipsa

 mpls:                 top-label             2nd-label

 vpws:                 top-label             2nd-label

 vpls(inner-l2):       inner-macda           inner-macsa

 vpls(inner-l3):       inner-ipda            inner-ipsa

 l3vpn:                inner-ipsa            inner-ipda
                       inner-ip-protocol     inner-l4-sourceport
                       inner-l4-destport
```

**相关命令**：无

### 3.16.18 `hash value`

**功能**：使用该命令用来创建hash value，并进入hash value 视图，使用该命令的no 形式删除
  该hash value。

**语法**：

```
hash-value NAME
no hash-value NAME
```

| 参数 | 说明 |
| --- | --- |
| NAME | Hash value 名称字符串首字母必须是a-z, A-Z，0-9 或者._-，且所有字符只能是a-z, A-Z，0-9 或者._-，最大长度为64 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

系统支持配置63 个hash value。
  如果hash value 被应用在端口上，那么该hash value 不能被删除。

**示例**：

```
如下示例，显示了如何为创建hash value aaa:
Switch# configure terminal
Switch(config)# hash-value aaa
Switch(config-hash-value)#
如下示例，显示了如何为删除hash value aaa:
Switch# configure terminal
Switch(config)# no hash-value aaa
```

**相关命令**：show hash-value

### 3.16.19 `port-channel unicast select`

**功能**：使用此命令在单播模式下为所有linkagg 的所有模式选择hash field，该命令的no 形式
  是清除配置。

**语法**：

```
port-channel uincast select NAME
no port-channel unicast select
```

| 参数 | 说明 |
| --- | --- |
| NAME | 选择用户创建的hash field - |

**命令模式**：Hash-value 配置模式

**默认配置**：无

**使用说明**：

如果一个hash value 中只存在”port-channel uincast select“配置，那么该hash value 可
  以应用到agg 口的output 方向和input 方向，也可以应用到物理口的input 的方向。
  如果一个hash value 中存在”port-channel non-unicast select“配置或者”ecmp select“配
  置，那么该hash value 只能应用到agg 口和物理口的input 方向。

**示例**：

```
如下示例，显示了如何在hash value aaa 中设置linkagg 负载均衡所用的hash field:
Switch# configure terminal
Switch(config)# hash-value aaa
Switch(config-hash-value)# port-channel unicast select user
如下示例，显示了如何在hash value aaa 中删除linkagg 负载均衡所用的hash field:
Switch# configure terminal
Switch(config)# hash-value aaa
Switch(config-hash-value)# no port-channel unicast select
```

**相关命令**：show hash-value

### 3.16.20 `port-channel non-unicast select`

**功能**：使用此命令在非单播模式下为所有linkagg 选择hash field，该命令的no 形式是清除配
  置。

**语法**：

```
port-channel non-unicast select NAME
no port-channel non-unicast select
```

| 参数 | 说明 |
| --- | --- |
| NAME | 选择用户创建的hash field - |

**命令模式**：Hash-value 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
如下示例，显示了如何在hash value aaa 中设置non-unicast linkagg 负载均衡所用的
hash field:
Switch# configure terminal
Switch(config)# hash-value aaa
Switch(config-hash-value)# port-channel non-unicast select user
如下示例，显示了如何在hash value aaa 中删除non-unicast linkagg 负载均衡所用的
hash field:
Switch# configure terminal
Switch(config)# hash-value aaa
Switch(config-hash-value)# no port-channel non-unicast select
```

**相关命令**：show hash-value

### 3.16.21 `ecmp select`

**功能**：使用此命令一次性为ecmp 所有模式选择hash field 和hash 算法，使用此命令的no 命
  令清除配置。

**语法**：

```
ecmp select NAME
no ecmp select
```

| 参数 | 说明 |
| --- | --- |
| NAME | 选择用户创建的hash field - |

**命令模式**：Hash-value 配置模式

**默认配置**：无

**使用说明**：

当配置ecmp 的负载均衡的hash field 时，同时配置dynamic、static 模式的hash field，
  同时指定ecmp 的dynamic 模式下的flow hash field。

**示例**：

```
如下示例，显示了如何在hash value aaa 中设置所有ecmp 负载均衡所用的hash field:
Switch# configure terminal
Switch(config)# hash-value aaa
Switch(config-hash-value)# ecmp select user
如下示例，显示了如何在hash value aaa 中删除所有ecmp 负载均衡所用的hash field:
Switch# configure terminal
Switch(config)# hash-value aaa
Switch(config-hash-value)# no ecmp select
```

**相关命令**：show hash-value

### 3.16.22 `ecmp dynamic flow-id select`

**功能**：使用此命令为ecmp 的流动态模式选择hash field，使用此命令的no 命令清除配置。

**语法**：

```
ecmp dynamic flow-id select NAME
no ecmp dynamic flow-id select
```

| 参数 | 说明 |
| --- | --- |
| NAME | 选择用户创建的hash field - |

**命令模式**：Hash-value 配置模式

**默认配置**：无

**使用说明**：

单独配置动态流模式的ecmp 负载均衡算法时，它的优先级高于ecmp select NAME。

**示例**：

```
如下示例，显示了如何在hash value aaa 中设置动态流ecmp 负载均衡所用的hash
field:
Switch# configure terminal
Switch(config)# hash-value aaa
Switch(config-hash-value)# ecmp dynamic flow-id select user
如下示例，显示了如何在hash value aaa 中删除动态流ecmp 负载均衡所用的hash
field:
Switch# configure terminal
Switch(config)# hash-value aaa
Switch(config-hash-value)# no ecmp dynamic flow-id select
```

**相关命令**：show hash-value

### 3.16.23 `description`

**功能**：使用该命令为hash value 设置描述信息，使用该命令的no 形式删除描述信息。

**语法**：

```
descrition LINE
no description
```

| 参数 | 说明 |
| --- | --- |
| LINE | Hash value 描述信息 hash field 描述信息,字符串长度小于128 字节 |

**命令模式**：Hash-value 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
如下示例，显示了如何为hash value aaa 配置描述信息:
Switch# configure terminal
Switch(config)# hash-value aaa
Switch(config-hash-value)# description this is hash-value aaa
如下示例，显示了如何将hash value aaa 的描述信息删除:
Switch# configure terminal
Switch(config)# hash-value aaa
Switch(config-hash-value)# no description
```

**相关命令**：show hash-value

### 3.16.24 `show hash-value`

**功能**：使用该命令显示指定hash value 的信息或者全部hash value 的信息。

**语法**：

```
show hash-value ( NAME | )
```

| 参数 | 说明 |
| --- | --- |
| NAME | 用户创建的hash value 名称 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
如下示例，显示了hash value 的全部配置信息:
Switch# show hash-value
LBT:load balance type         LBM:load balance mode
PT :packet type               HF :hash field
HA :hash arithmetic
hash-value name: aaa
 LBT            LBM            PT             HF             HA
----------------------------------------------------------------------
 port-channel   unicast        all            NOCFG          NOCFG
 port-channel   non-unicast    all            NOCFG          NOCFG
 ecmp           -              all            NOCFG          NOCFG
 ecmp           flow id        all            NOCFG          NOCFG
```

**相关命令**：无

### 3.16.25 `show hash-value interface-applied`

**功能**：使用该命令显示hash value 与物理接口以及linkagg 的绑定关系。

**语法**：

```
show hash-value interface-applied
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
如下示例，显示了物理口和linkagg 与hash value 的绑定信息:

Switch# show hash-value interface-applied
eth-0-1
 hash-value aaa input
```

**相关命令**：无

### 3.16.26 `hash value applied to interface`

**功能**：使用该命令为物理接口和linkagg 口应hash-value，使用此命令的no 形式解除接口与
  hash value 的绑定关系。

**语法**：

```
load-balance hash-value NAME ( input | output )
no load-balance hash-value ( input | output )
```

| 参数 | 说明 |
| --- | --- |
| NAME | Hash value 名称 |
| input | 入方向 |
| output | 出方向 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

物理口只可以选择input 方向，只有linkagg 可以同时配置input 以及output 方向。另
  外属于linkagg 的成员口不可使用该命令。

**示例**：

```
如下示例，显示了如何将一个hash value 应用到端口eth-0-1:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# load-balance hash-value aaa input

如下示例，显示了如何将一个hash value 从端口eth-0-1 中移除:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no load-balance hash-value input
```

**相关命令**：show hash-value interface-applied

### 3.16.27 `hash value applied to acl`

**功能**：使用该命令选取hash value 作为acl 的action。
  使用该命令的no 形式取消绑定。

**语法**：

```
load-balance hash-value NAME
no load-balance hash-value
```

| 参数 | 说明 |
| --- | --- |
| NAME | Hash value 名称 |

**命令模式**：config-pmap-c 配置模式

**默认配置**：无

**使用说明**：

acl 中出的hash 具有最高优先级。

**示例**：

```
如下示例，显示了如何选取 hash value 作为acl 的action:
Switch# configure terminal
Switch(config)# policy-map pmap1
Switch(config-pmap)# class cmap1
Switch(config-pmap-c)# load-balance hash-value aaa
如下示例，显示了如何将一个hash value 从acl 的action 移除:

Switch# configure terminal
Switch(config)# policy-map pmap1
Switch(config-pmap)# class cmap1
Switch(config-pmap-c)# no load-balance hash-value
```

**相关命令**：无

### 3.16.28 `hash-value global`

**功能**：使用该命令进入hash value global 视图。

**语法**：

```
hash-value global
```

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
如下示例，显示了如何为进入hash value global 视图:
Switch# configure terminal
Switch(config)# hash-value global
Switch(config-hash-value-global)#
```

**相关命令**：show hash-value global

### 3.16.29 `port-channel select`

**功能**：使用此命令为全局linkagg 的所有模式选择hash field 和hash 算法，使用此命令的no
  形式恢复默认配置。

**语法**：

```
port-channel select NAME
no port-channel select
```

| 参数 | 说明 |
| --- | --- |
| NAME | 选择用户创建的hash field - |

**命令模式**：Hash-value 全局配置模式

**默认配置**：port-channel

**使用说明**：

全局配置linkagg 的计算hash 的hash 算法，配置为output 方向，优先级低于input 方
  向配置。

**示例**：

```
如下示例，显示了如何全局配置linkagg 负载均衡所用的hash field:
Switch# configure terminal
Switch(config)# hash-value global
Switch(config-hash-value-global)# port-channel select user
如下示例，显示了如何全局默认配置linkagg 负载均衡所用的hash field:
Switch# configure terminal
Switch(config)# hash-value global
Switch(config-hash-value-global)# no port-channel select
```

**相关命令**：show hash-value global

### 3.16.30 `ecmp select`

**功能**：使用此命令一次性为全局ecmp 所有模式选择hash field 和hash 算法，使用此命令的
  no 形式恢复默认配置。

**语法**：

```
ecmp select NAME
no ecmp select
```

| 参数 | 说明 |
| --- | --- |
| NAME | 选择用户创建的hash field - |

**命令模式**：Hash-value 全局配置模式

**默认配置**：ecmp

**使用说明**：

当配置ecmp 的负载均衡的hash field 时，同时配置dynamic、static 模式的hash 算法，
  同时指定ecmp 的dynamic 模式下的flow hash 算法。

**示例**：

```
如下示例，显示了如何一次性全局配置ecmp 所有模式负载均衡所用的hash field:
Switch# configure terminal
Switch(config)# hash-value global
Switch(config-hash-value-global)# ecmp select user
如下示例，显示了如何一次性全局默认配置ecmp 所有模式负载均衡所用的hash field:
Switch# configure terminal
Switch(config)# hash-value global
Switch(config-hash-value-global)# no ecmp select
```

**相关命令**：show hash-value global

### 3.16.31 `ecmp dynamic flow-id select`

**功能**：使用此命令全局设置ecmp 的流动态模式选择hash field 和hash 算法，使用此命令的
  no 形式恢复默认配置。

**语法**：

```
ecmp dynamic flow-id select NAME
no ecmp dynamic flow-id select
```

| 参数 | 说明 |
| --- | --- |
| NAME | 选择用户创建的hash field - |

**命令模式**：Hash-value 全局配置模式

**默认配置**：ecmp

**使用说明**：

在全局单独配置ecmp dynamic 模式下的flow hash 算法，它的优先级高于ecmp select
  NAME。

**示例**：

```
如下示例，显示了如何全局配置ecmp dynamic flow 模式所用的hash field:
Switch# configure terminal
Switch(config)# hash-value global
Switch(config-hash-value-global)# ecmp dynamic flow-id select user
如下示例，显示了如何全局默认配置ecmp dynamic flow 模式所用的hash field:
Switch# configure terminal
Switch(config)# hash-value global
Switch(config-hash-value-global)# no ecmp dynamic flow-id select
```

**相关命令**：show hash-value global

### 3.16.32 `efd hash`

**功能**：使用此命令全局设置efd hash 计算所选字段。
  使用此命令的no 命令恢复默认配置。

**语法**：

```
efd select { ipda | ipsa | macda | macsa | sourceport | destport | ip-protocol | vxlan-vni |
nvgre-vsid | inner-ipda | inner-ipsa | inner-ip-protocol | inner-macda | inner-macsa |
inner-sourceport | inner-destport | src-interface }
no efd select
```

| 参数 | 说明 |
| --- | --- |
| ipda | 根据源ip 地址进行负载均衡 |
| ipsa | 根据目的ip 地址进行负载均衡 |
| macda | 根据源MAC 进行负载均衡 - |
| macsa | 根据目的MAC 进行负载均衡 |
| sourceport | 根据源端口号进行负载均衡 - |
| destport | 根据目的端口号进行负载均衡 |
| ip-protocol | 根据ip 协议进行负载均衡 |
| vxlan-vni | 根据Vxlan 的vni 进行负载均衡 |
| nvgre-vsid | 根据nvgre 的vsid 进行负载均衡 |
| inner-ipda | 根据内层报文的目的ip 地址进行负载均衡 |
| inner-ipsa | 根据内层报文的源ip 地址进行负载均衡 |
| inner-ip-protocol | 根据内层报文的ip 协议进行负载均衡 |
| inner-macda | 根据内层报文的目的MAC 进行负载均衡 |
| inner-macsa | 根据内层报文的源MAC 进行负载均衡 |
| inner-sourceport | 根据内层报文的源端口号进行负载均衡 |
| inner-destport | 根据内层报文的目的端口号- 进行负载均衡 |
| src-interface | 根据报文的入口进行负载均衡 |

**命令模式**：Hash-value 全局配置模式

**默认配置**：ipda ipsa macda macsa sourceport destport ip-protocol

**使用说明**：

efd flow hash 不再单独配置，与此配置同值。

**示例**：

```
如下示例，显示了如何全局配置efd hash 计算所选字段:
Switch# configure terminal
Switch(config)# hash-value global
Switch(config-hash-value-global)# efd select ipsa ipda
如下示例，显示了如何删除全局配置efd hash 计算所选字段:
Switch# configure terminal
Switch(config)# hash-value global
Switch(config-hash-value-global)# no efd select
```

**相关命令**：show hash-value global

### 3.16.33 `entropy select`

**功能**：使用此命令全局设置entropy hash 计算所选字段。
  使用此命令的no 命令恢复默认配置。

**语法**：

```
entropy select NAME
```

| 参数 | 说明 |
| --- | --- |
| NAME | 选择用户创建的hash field - |

**命令模式**：Hash-value 全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
如下示例，显示了如何全局配置entropy hash 计算所选字段:
Switch# configure terminal
Switch(config)# hash-value global
Switch(config-hash-value-global)# entropy select usr
如下示例，显示了如何删除全局配置entropy hash 计算所选字段:
Switch# configure terminal
Switch(config)# hash-value global
Switch(config-hash-value-global)# no entropy select
```

**相关命令**：show hash-value global

### 3.16.34 `show hash-value global`

**功能**：使用该命令显示hash-value global 中的全部配置信息。

**语法**：

```
show hash-value global
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
如下示例，显示了hash value global 的全部配置信息:
Switch# show hash-value global
LBT:load balance type         LBM :load balance mode
PT :packet type               HF  :hash field
HA :hash arithmetic
hash-value global
 LBT            LBM            PT             HF             HA
----------------------------------------------------------------------
 port-channel   -              all            port-channel   xor
 ecmp           -              all            ecmp           xor
 ecmp           flow id        all            ecmp           xor
 entropy        -              all            ecmp           xor
----------------------------------------------------------------------
 Efd hash field select:
  macsa                 macda
  ipsa                  ipda
  sourceport            destport
  ip-protocol
```

**相关命令**：无

### 3.16.35 `disable ecmp round-robin`

**功能**：使用此命令禁止被acl 命中的报文使用RR 的方式参与ecmp 负载均衡。
  使用此命令的no 形式解除禁止。

**语法**：

```
ecmp load-balance round-robin disable
no ecmp load-balance round-robin disable
```

**命令模式**：config-pmap-c 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
如下示例，显示了如何禁止被acl 命中的报文使用RR 的方式参与ecmp 负载均衡:
Switch# configure terminal
Switch(config)# policy-map map1
Switch(config-pmap)# class class-default
Switch(config-pmap-c)# ecmp load-balance round-robin disable
如下示例，显示了如何使能被acl 命中的报文使用RR 的方式参与ecmp 负载均衡:
Switch# configure terminal
Switch(config)# policy-map map1
Switch(config-pmap)# class class-default
Switch(config-pmap-c)# no ecmp load-balance round-robin disable
```

**相关命令**：无

### 3.16.36 `disable port-channel round-robin`

**功能**：使用此命令禁止被acl 命中的报文使用RR 的方式参与linkagg 负载均衡。
  使用此命令的no 形式解除禁止。

**语法**：

```
port-channel load-balance round-robin disable
no port-channel load-balance round-robin disable
```

**命令模式**：config-pmap-c 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
如下示例，显示了如何禁止被acl 命中的报文参与linkagg RR 负载均衡:
Switch# configure terminal
Switch(config)# policy-map map1
Switch(config-pmap)# class class-default
Switch(config-pmap-c)# port-channel load-balance round-robin disable
如下示例，显示了如何使能被acl 命中的报文参与linkagg RR 负载均衡:
Switch# configure terminal
Switch(config)# policy-map map1
Switch(config-pmap)# class class-default
Switch(config-pmap-c)# no port-channel load-balance round-robin disable
```

**相关命令**：无、、4 IP 业务命令、4.1 ARP 命令

