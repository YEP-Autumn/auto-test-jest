# 2 基础配置命令

## 2.1 系统管理命令

### 2.1.1 `hostname`

**功能**：全局配置模式下使用hostname 命令配置或修改主机名。no hostname 用来将主机名恢
  复至缺省值。

**语法**：

```
hostname NAME
no hostname
```

| 参数 | 说明 |
| --- | --- |
| NAME | 新主机名不超过64 字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：主机名的缺省值为Switch。

**使用说明**：

主机名将会在提示符和缺省配置文件中出现。
  主机名必须符合ARPANET 网络关于主机名的约定。包括英文字符，数字，连字号以及
  下划线。字数不能超过64 个字符。

**示例**：

```
下面的例子将hostname 改为“sandbox”:

Switch# configure terminal
Switch(config)# hostname sandbox
sandbox(config)#
下面的例子删除配置的hostname:
sandbox# configure terminal
sandbox(config)# no hostname
Switch(config)#
```

**相关命令**：无

### 2.1.2 `management ip address`

**功能**：本命令设置交换机管理口的IP 地址。本命令的no 格式用来删除管理口IP 地址。

**语法**：

```
management ip address ( A.B.C.D/M | A.B.C.D mask ) ( gateway A.B.C.D | )
no management ip address
management ipv6 address ( X:X::X:X/M | X:X::X:X mask ) ( gateway X:X::X:X | )
no management ipv6address
```

| 参数 | 说明 |
| --- | --- |
| A.B.C.D/M | 配置带掩码长度的IPv4 地址点分十进制格式的IPv4 地址，掩码长度1-32 |
| A.B.C.D mask | 配置带掩码的IPv4 地址 IPv4 地址和掩码 |
| X:X::X:X/M | 配置带掩码长度的IPv6 地址 IPv6 地址和1-128 位掩码 |
| X:X::X:X mask | 配置带掩码的IPv6 地址 IPv6 地址和掩码 |
| gateway A.B.C.D | 配置IPv4 网关 IPv4 地址 |
| gateway X:X::X:X | 配置IPv6 网关 IPv6 地址 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
这个例子配置了管理口IPv4 地址:
Switch# configure terminal
Switch(config)# management ip address 192.168.100.100/24
下面的例子删除了管理口IPv4 地址:
Switch# configure terminal
Switch(config)# no management ip address
下面的例子配置了管理口IPv6 地址:
Switch# configure terminal
Switch(config)# management ipv6 address 2001:1000::1000/96
下面的例子删除了管理口IPv6 地址:
Switch# configure terminal
Switch(config)# no management ipv6 address
```

**相关命令**：无

### 2.1.3 `management route`

**功能**：本命令为交换机的管理口设置网关地址。

**语法**：

```
management route ( add | del ) gateway A.B.C.D
management ipv6 route ( add | del ) gateway X:X::X:X
```

| 参数 | 说明 |
| --- | --- |
| add | 添加路由 |
| del | 删除路由 |
| ipv6 | 配置IPv6 路由 |
| gateway | 配置网关 |
| A.B.C.D | 网关IPv4 地址 IPv4 地址 |
| X:X::X:X | 网关IPv6 地址 IPv6 地址 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子将192.168.100.254 设为设备网关:
Switch# configure terminal
Switch(config)# management route add gateway 192.168.100.254
下面的例子将200110001 设为设备网关:
Switch# configure terminal
Switch(config)# management ipv6 route add gateway 2001:1000::1
```

**相关命令**：无

### 2.1.4 `show management arp`

**功能**：本命令显示交换机管理口ARP。

**语法**：

```
show management arp
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了交换机管理口ARP:
Switch# show management arp
Address          Hardware Addr        Interface
----------------+--------------------+----------
10.10.39.241     24:6e:96:62:3f:c4    mgmt-if
10.10.39.254     00:1e:08:09:67:6d    mgmt-if
```

**相关命令**：无

### 2.1.5 `show management ip address`

**功能**：本命令显示交换机管理口IP 地址。

**语法**：

```
show management ip address
show management ipv6 address
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了交换机管理口IP 地址:
Switch# show management ip address
  Management IP address is:  192.168.100.100/24
  Gateway: 192.168.100.254

Switch# show management ipv6 address
  Management IPv6 address is:  2001:1000::1000/96
  Gateway: 2001:1000::1
```

**相关命令**：无

### 2.1.6 `show management interface`

**功能**：本命令显示交换机管理口配置以及统计值。

**语法**：

```
show management interface
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子说明了如何显示交换机管理口的配置和统计值:
Switch# show management interface
Management Interface current state: DOWN
Description:
Link encap: Ethernet       HWaddr: 94:EB:AB:88:2A:B4
Inet addr: 192.168.100.102 Mask: 255.255.255.0
Bcast: 192.168.100.255     MTU: 1500
Speed: 10                  Duplex: Half
Auto-negotiation: Enable
Received:              2 Packets,             128 Bytes (128.0 b)
Transmitted:           1 Packets,              78 Bytes (78.0 b)
```

**相关命令**：clear counters mgmt-if

### 2.1.7 `clear counters mgmt-if`

**功能**：本命令清除交换机管理口的统计值。

**语法**：

```
clear counters mgmt-if
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子说明了如何清除交换机管理口的统计值:
Switch# clear counters mgmt-if
```

**相关命令**：无

### 2.1.8 `enable password`

**功能**：本命令设置用户进入特权模式时的密码。

**语法**：

```
enable password ( privilege LEVEL | ) ( 8 | ) LINE
no enable password
```

| 参数 | 说明 |
| --- | --- |
| Privilege LEVEL | 用户优先等级合法范围1-4 指定隐藏密码 |
| LINE | 设置密码 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

配置该命令后，用户进去特权模式需要输入密码。

**示例**：

```
下面的例子说明了如何设置密码:
Switch# configure terminal
Switch(config)# enable password 123
Switch(config)# exit
Switch# disable
Switch> enable
Password:
Switch#
```

**相关命令**：无

### 2.1.9 `terminal length`

**功能**：特权模式下，命令terminal length 用来设置当前用户终端屏幕的显示行数。本命令的
  no 格式用来将配置恢复至缺省值。

**语法**：

```
terminal length LENGTH
terminal no length
```

| 参数 | 说明 |
| --- | --- |
| LENGTH | 用户终端上的显示行数取值范围0 至512，0 表示不限制显示长度 |

**命令模式**：特权模式

**默认配置**：默认情况下自动检查终端显示行数。

**使用说明**：

配置只对当前终端有效，且不保存配置。当前终端退出后将恢复默认。

**示例**：

```
下面的例子中，交换机系统不限制终端的行数，由终端自动检查控制:
Switch# terminal length 0
```

**相关命令**：service terminal-length

### 2.1.10 `service terminal-length`

**功能**：全局配置模式下，命令service terminal-length 用来设置当前终端下所有会话的显示行
  数。本命令的no 格式用来将配置恢复至缺省值。

**语法**：

```
service terminal-length LENGTH
no service terminal-length
```

| 参数 | 说明 |
| --- | --- |
| LENGTH | 设置屏幕上的显示行数取值范围0 至512，0 表示不限制显示长度 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

该配置修改此设备上所有会话的显示行数。对当前已经登录的终端和配置生效后再登
  录的终端均有效。

**示例**：

```
下面的例子交换机系统不限制终端的行数，由终端自动检查控制:
Switch# configure terminal
Switch(config)# service terminal-length 0
```

**相关命令**：terminal length

### 2.1.11 `banner motd`

**功能**：全局配置模式下，命令banner motd 用来创建每日提示信息，这些信息将会显示在已
  登录的用户的终端上。本命令的no 格式用来将配置恢复至缺省值。

**语法**：

```
banner motd line
no banner motd
```

| 参数 | 说明 |
| --- | --- |
| LINE | 提示信息字符串指定任意一个可见的字符作为起止符，在两个起止符之间输入一行或多行提示信息。消息最多为99 行，每行最多1023 个字符 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子中配置了一个单行的系统提示信息:
Switch# configure terminal
Switch(config)# banner motd #
Enter TEXT message.  End with the character '#'.
this is a example message#
```

**相关命令**：banner exec、banner login

### 2.1.12 `banner exec`

**功能**：全局配置模式下，命令banner exec 用来设置用户登录到EXEC 模式下的提示信息。本
  命令的no 格式用来将配置恢复至缺省值。

**语法**：

```
banner exec line
no banner exec
```

| 参数 | 说明 |
| --- | --- |
| LINE | 提示信息字符串指定任意一个可见的字符作为起止符，在两个起止符之间输入一行或多行提示信息。消息最多为99 行，每行最多1023 个字符 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子中配置了一个单行的提示信息:
Switch# configure terminal
Switch(config)# banner exec #
Enter TEXT message.  End with the character '#'.
this is a example message#
```

**相关命令**：banner motd、banner login

### 2.1.13 `banner login`

**功能**：全局配置模式下，命令banner login 用来设置用户登录到系统时的提示信息。本命令
  的no 格式用来将配置恢复至缺省值。

**语法**：

```
banner login line
no banner login
```

| 参数 | 说明 |
| --- | --- |
| LINE | 提示信息字符串指定任意一个可见的字符作为起止符，在两个起止符之间输入一行或多行提示信息。消息最多为99 行，每行最多1023 个字符 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子中配置了一个单行的登录提示信息:
Switch# configure terminal
Switch(config)# banner login #
Enter TEXT message.  End with the character '#'.
this is a example message#
```

**相关命令**：banner exec、banner motd

### 2.1.14 `show version`

**功能**：特权模式下，使用show version 命令查看硬件和固件的版本信息。

**语法**：

```
show version ( slot ID | )
```

| 参数 | 说明 |
| --- | --- |
| ID | 槽位号 1-29 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何去显示硬件和固件的版本信息:
Switch# show version
Switch# show version
Software, Switch, Version 5.3.8.5
Copyright (C) 2018.  All rights reserved.
The current running image is flash:/boot/uImage.p1010.48t4x.r_20181115

Switch uptime is 0 days, 19 hours, 8 minutes
Hardware Type is 52TX
Hardware Version is 1.1
SDRAM size 2048M
Flash size 2048M
EPLD Version is 2.1
BootRom Version is 6.1.2
System serial number is E101ZB14202C
Current Web Version is 5.3.8.3
```

**相关命令**：无

### 2.1.15 `line vty maximum`

**功能**：全局配置模式下，命令line vty maximum 用来设置最大用户VTY 登录数量。本命令的
  no 格式用来将配置恢复至缺省值。

**语法**：

```
line vty maximum MAX_VTY
no line vty maximum
```

| 参数 | 说明 |
| --- | --- |
| MAX_VTY | 最大VTY 数目设置范围为0-8。默认为8 |

**命令模式**：全局配置模式

**使用说明**：

无

**示例**：

```
下面的例子将最大VTY 数目设为5:
Switch# configure terminal
Switch(config)# line vty maximum 5
```

**相关命令**：无

### 2.1.16 `line vty`

**功能**：全局配置模式下，命令line vty <0-7>用来进入用户Config-line 配置模式。

**语法**：

```
line vty VTY
```

| 参数 | 说明 |
| --- | --- |
| VTY | VTY 的编号设置的范围是0-7。 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何进入Config-line 配置模式:
Switch# configure terminal
Switch(config)#  line vty 2
```

**相关命令**：无

### 2.1.17 `line-password`

**功能**：本命令设置VTY 用户界面的密码。
  使用本命令的no 格式删除密码。

**语法**：

```
line-password LINE
no line-password
```

| 参数 | 说明 |
| --- | --- |
| LINE | 密码字符串字符串长度范围[1,64),支持特殊字符 |

**命令模式**：Line 配置模式

**默认配置**：无

**使用说明**：

配置该命令后，用户进去vty 界面需要输入密码。

**示例**：

```
下面的例子说明了如何设置密码:
Switch# configure terminal
Switch(config)# line vty 0 7
Switch(config-line)# line-password abc
Switch(config-line)# exit
```

**相关命令**：无

### 2.1.18 `exec-timeout`

**功能**：exec-timeout 用来设置用户多久未执行任何操作后被强制退出。no 用来将配置恢复至
  缺省值。

**语法**：

```
exec-timeout MINUTES SECONDS
no exec-timeout
```

| 参数 | 说明 |
| --- | --- |
| MINUTES | 超时时间，以分钟为单位设置范围为<0-35791> |
| SECONDS | 超时时间，以秒为单位设置范围是<0-2147483> |

**命令模式**：Line 配置模式

**默认配置**：600 秒

**使用说明**：

只有当用户重新登录时才会起作用

**示例**：

```
下面的例子显示了如何设置用户多久未执行任何操作后被强制退出:
Switch# configure terminal
Switch(config)# line vty 0
Swicth(config-line)# exec-timeout 3 200
```

**相关命令**：无

### 2.1.19 `access-class`

**功能**：应用IPv4 ACL 于line vty 上。no 形式用来恢复至缺省值。

**语法**：

```
access-class ACL-NAME in
no access-class in
```

| 参数 | 说明 |
| --- | --- |
| ACL-NAME | IPv4 访问控制列表名称不超过40 个字符的字符串 |

**命令模式**：Line 配置模式

**默认配置**：未应用ACL

**使用说明**：

应用于line vty 上的ACL 只能够匹配IP 地址和端口号，ACL 中的其它Entry 不能匹配。

**示例**：

```
下面的例子显示了如何在line vty 上应用IPv4 访问控制列表:
Switch(config-line)# access-class acl4 in
```

**相关命令**：ip access-list

### 2.1.20 `ipv6 access-class`

**功能**：应用IPv6 ACL 于line vty 上。no 形式用来恢复至缺省值。

**语法**：

```
ipv6 access-class ACL-NAME in
no ipv6 access-class in
```

| 参数 | 说明 |
| --- | --- |
| ACL-NAME | IPv6 访问控制列表名称不超过40 个字符的字符串 |

**命令模式**：Line 配置模式

**默认配置**：未应用ACL

**使用说明**：

应用于line vty 上的ACL 只能够匹配IP 地址和端口号，ACL 中的其它Entry 不能匹配。

**示例**：

```
下面的例子显示了如何在line vty 上应用IPv6 访问控制列表:

Switch(config-line)# ipv6 access-class aclv6 in
```

**相关命令**：ipv6 access-list

### 2.1.21 `reboot`

**功能**：特权模式下，使用reboot 命令重启系统。

**语法**：

```
reboot
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

reboot 命令重启系统。重启系统前，请先保存好系统的配置。

**示例**：

```
下面的例子显示了如何重启系统:
Switch# reboot
```

**相关命令**：reload

### 2.1.22 `schedule reboot at`

**功能**：全局配置模式下，使用schedule reboot at 命令设置系统重启时间。该命令的no 格式
  取消设置的重启时间。

**语法**：

```
schedule reboot at HH:MM ( MM/DD | MM/DD/YYYY | YYYY/MM/DD )

no schedule reboot
```

| 参数 | 说明 |
| --- | --- |
| HH:MM | 设置小时与分钟时间范围 00:00 – 23:59 |
| MM/DD | 设置重启时间(以月/年)格式 日期范围[1/1, 12/31] |
| MM/DD/YYYY | 设置重启时间(以月/日/年格式） 年份范围[2000， 2037] |
| YYYY/MM/DD | 设置重启时间（以年/月/日格式) 年份范围[2000， 2037] |

**命令模式**：全局配置模式

**默认配置**：无重启时间

**使用说明**：

如果指定月份和日期，系统将在指定的月份和日期内的指定时间重启。如果没有指定
  月份和日期，系统将在当日的指定时间重启。

**示例**：

```
下面的例子设置了计划重启的时间:
Switch# configure terminal
Switch(config)# schedule reboot at 12:12 2008/12/25
```

**相关命令**：schedule reboot delay

### 2.1.23 `schedule reboot delay`

**功能**：全局配置模式下，使用schedule reboot delay 命令设置系统延期重启时间。该命令的
  no 格式取消设置的重启时间。

**语法**：

```
schedule reboot delay { HH:MM | MINUTES }
no schedule reboot
```

| 参数 | 说明 |
| --- | --- |
| HH:MM | 设置小时与分钟时间范围00:00～23:59 |
| MINUTES | 设置分钟范围1-720 |

**命令模式**：全局配置模式

**默认配置**：无重启时间

**使用说明**：

无

**示例**：

```
下面的例子设置了延迟重启的时间:
Switch# configure terminal
Switch(config)# schedule reboot delay 300
```

**相关命令**：schedule reboot at

### 2.1.24 `boot system`

**功能**：特权模式下，使用命令boot system 指定系统启动时的image 文件。

**语法**：

```
boot system ( tftp: mgmt-if SERVERIP | flash:/ ) FILE_NAME
```

| 参数 | 说明 |
| --- | --- |
| flash:/ | 指定启动时用flash 方式 |
| tftp | 指定启动时用tftp 方式 |
| mgmt-if | 指定管理口 |
| SERVERIP | tftp 服务器的ip 地址 |
| FILE_NAME | 启动时用到的image 文件名完整的文件路径和文件名， 不超过255 字符 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用TFTP 方式启动时，startup-config 文件中的管理口IP 地址将作为源地址。

**示例**：

```
下面这个例子指定了下一次启动使用的image:
Switch# boot system flash:/boot/Internal-1.0.0.25.bin
```

**相关命令**：show boot

### 2.1.25 `show boot`

**功能**：特权模式下，使用show boot 命令查看系统当前使用的image 文件和下次启动时的
  image 文件设置。

**语法**：

```
show boot
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了此命令的输出信息:

Switch# show boot
The current boot image version is: E330-3.0.0.23.it
The current running image is: tftp://10.10.29.160/humberOS-e330-ma-
v3.0.0.23.it.r.bin
The next running image is: tftp://10.10.29.160/humberOS-e330-ma-v3.0.0.23.it.r.bin
```

**相关命令**：show boot images

### 2.1.26 `show boot images`

**功能**：特权模式下，使用show boot images 显示系统flash 中所有的image 文件。

**语法**：

```
show boot images
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了此命令的输出信息:
Switch# show boot images
System image files list:
Current boot image version: 1.0.0.25
    Create Time          Version                File name
===============================================================
* 2011-07-25 10:58:29  v3.0.0.22it            Internal-.00.22.bin
```

**相关命令**：show boot

### 2.1.27 `show memory`

**功能**：特权模式下，使用show memory 命令显示系统中进程的内存使用情况。

**语法**：

```
show memory ( all | bgp | bhm | chsm | dhclient | dot1x | imi | ipv6 | lacp | ldp | lib | mstp
| nsm | oamd | onmd | ospf | pim | ptp | rip | rsvp | shal | summary )
```

| 参数 | 说明 |
| --- | --- |
| all | 所有内存信息 |
| bgp | 边界网关协议 (BGP) |
| bhm | 系统监控 |
| chsm | Chassis 管理 |
| dhclient |  |
| DHCP client |  |
| dhcpd | 动态主机配置协议 |
| dhcprelay |  |
| DHCP relay |  |
| dhcprelay6 | DHCP relay6(IPv6) |
| dot1x |  |
| IEEE 802.1X |  |
| imi | 集成管理接口 (IMI) |
| ipv6 |  |
| Ipv6 |  |
| lacp | 链路聚合控制协议 (LACP) - |
| ldp | 标签分发协议 (LDP) |
| lib | 公共库 |
| mstp | 生成树协议 (STP/RSTP/MSTP) |
| nsm | 网络服务模块 (NSM) |
| oamd | 双向转发检测(BFD) |
| onmd |  |
| LLDP and EFM_OAM |  |
| ospf | 开放最短路径优先(OSPF) |
| pim | 协议无关组播 (PIM) |
| ptp | 精确时间同步协议 (PTP) |
| rip | 路由信息协议 (RIP) |
| rsvp | 资源预留协议 (RSVP) |
| shal |  |
| Hal server monitoring |  |
| summary | 内存概要信息 |
| monitor | 监视器 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了显示bgp 模块内存使用情况的输出信息:
Switch# show memory bgp
Library memories for BGP
Memory type                          Alloc cells   Alloc bytes
============================== ============ ==============
Temporary memory                 :        6596          322216
Hash                             :          10             320
Hash index                        :          10           40960
Hash bucket                       :          55             880
Link list                         :          13             400
Link list node                    :         115            1840
Show                             :           1             512
Show page                        :           1            8192
Show server                       :           1              64
Prefix IPv4                       :           6              48
Route table                       :           6              48
Route node                        :         309           19776
Vector                            :        3383          324768
Vector index                      :        3383           48824
SNMP subtree                     :           8            6144
Host config                       :           1              16
Message of The Day                :           1           128
IMI Client                        :           2            1056
VTY master                        :           1              16
VTY if                            :          52           39936
VTY connected                     :           3             192
Message handler                   :           2             128
Host                              :           1              96
Log information                   :           2             128
Context                           :           1             512
Memories for BGP
Memory type                         Alloc cells   Alloc bytes
============================== ============= ===============
BGP structure                     :           1             768
BGP VR structure                  :           1             384
BGP global structure              :           1              64
BGP peer                          :           1            2048
Ext community                     :           1              16

BGP as list master                :           1              32
Community list handler            :           1              32
BGP Damp Reuse List Array         :           1            2048
BGP table                         :          31             248
BGP VRF list                      :           1              64
```

**相关命令**：show processes memory sorted

### 2.1.28 `show cpu traffic-limit`

**功能**：特权模式下，使用show cpu traffic-limit 显示CPU traffic-limit 的配置信息。

**语法**：

```
show cpu traffic-limit
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何显示CPU traffic-limit 的配置信息:
Switch# show cpu traffic-limit
reason                     rate (pps)   class
bpdu                       64            3
cfm                        512           2
slow-protocol              128           1
eapol                      128           0
erps                       128           2
smart-link                 128           2
udld                       128           3
arp                        640           1
dhcp                       128           0
rip                        64            1
ldp                        512           1
ospf                       256           1
pim                        128           1

vrrp                       512           1
rsvp                       512           1
ipda                       1024          0
icmp-redirect              128           0
mcast-rpf-fail             128           1
macsa-mismatch             128           0
port-security-discard      128           0
vlan-security-discard      128           0
mtu-dontfrag               64            0
mtu-frag                   64            0
ptp                        512           2
ip-option                  512           0
ucast-ttl-fail             64            0
mpls-ttl-fail              64            0
igmp                       128           2
sflow-ingress              128           0
sflow-egress               128           0
fwd-to-cpu                 64            0
mpls-tp-pwoam              128           2
Total rate:      2048 (pps)
```

**相关命令**：无

### 2.1.29 `show processes cpu sorted`

**功能**：特权模式下，使用show processes cpu sorted 命令显示各进程的cpu 利用情况，这里
  的CPU 利用率指的是从进程启动一直到这条命令被执行这个时间段内，这个进程所占
  用CPU 的时间片。

**语法**：

```
show process cpu sorted
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了此命令的输出信息:
Switch# show processes cpu sorted
  PID     TIME %CPU TTY      COMMAND
  924 00:20:03  2.0 ?        hsrvd
  956 00:07:17  0.7 ?        nsm
 1007 00:02:44  0.2 ?        imi
  959 00:01:24  0.1 ?        snmpd
1317 00:00:01  0.1 pts/0    imish
    5 00:00:45  0.0 ?        events/0
  983 00:00:23  0.0 ?        mstpd
  985 00:00:15  0.0 ?        onmd
  966 00:00:15  0.0 ?        lacpd
  963 00:00:12  0.0 ?        bhm
  929 00:00:12  0.0 ?        chsm
  964 00:00:11  0.0 ?        oamd
  919 00:00:10  0.0 ?        ntpd
1003 00:00:08  0.0 ?        pimd
  942 00:00:08  0.0 ?        sshd
  957 00:00:08  0.0 ?        dhcrelay
  973 00:00:07  0.0 ?        authd
 1005 00:00:07  0.0 ?        ldpd
  977 00:00:07  0.0 ?        rmond
 1021 00:00:07  0.0 ?        ripd
 1027 00:00:07  0.0 ?        ospfd
 1032 00:00:07  0.0 ?        bgpd
    1 00:00:05  0.0 ?        init
  779 00:00:04  0.0 ?        jffs2_gcd_mtd1
1106 00:00:01  0.0 ?        imish
    3 00:00:00  0.0 ?        ksoftirqd/0
  916 00:00:00  0.0 ?        syslog-ng
   65 00:00:00  0.0 ?        bdi-default
  965 00:00:00  0.0 ?        ptpd
  917 00:00:00  0.0 ?        crond
   63 00:00:00  0.0 ?        sync_supers
 1096 00:00:00  0.0 ?        telnetd
    6 00:00:00  0.0 ?        khelper
  105 00:00:00  0.0 ?        khungtaskd
    2 00:00:00  0.0 ?        kthreadd
    4 00:00:00  0.0 ?        watchdog/0
    9 00:00:00  0.0 ?        netns
   10 00:00:00  0.0 ?        async/mgr
   66 00:00:00  0.0 ?        kblockd/0
   73 00:00:00  0.0 ?        kseriod
   88 00:00:00  0.0 ?        rpciod/0
  106 00:00:00  0.0 ?        kswapd0
  157 00:00:00  0.0 ?        aio/0
  164 00:00:00  0.0 ?        nfsiod
  171 00:00:00  0.0 ?        crypto/0
  712 00:00:00  0.0 ?        mtdblockd
  741 00:00:00  0.0 ?        kpsmoused
  789 00:00:00  0.0 ?        PETH/Tx
  912 00:00:00  0.0 ?        angel

 1098 00:00:00  0.0 ?        telnetd
 1414 00:00:00  0.0 pts/0    imish
 1415 00:00:00  0.0 pts/0    more
 1416 00:00:00  0.0 ?        ps
```

**相关命令**：无

### 2.1.30 `show processes cpu history`

**功能**：特权模式下，使用show processes cpu history 命令显示cpu 总体历史利用情况，可以
  显示最近5s，1min，5min 的利用情况。

**语法**：

```
show process cpu history
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了cpu 使用率的历史信息:
Switch# show processes cpu history
CPU usage for five seconds: 4.17%; one minute: 3.70%; five minutes: 3.68%
```

**相关命令**：无

### 2.1.31 `show processes memory sorted`

**功能**：特权模式下，使用show processes memory sorted 命令显示各进程的内存使用情况。
  每个进程的CPU 使用是指此进程从开始到当前占用CPU 的时间片。

**语法**：

```
show processes memory sorted ( core | physical | virtual )
```

| 参数 | 说明 |
| --- | --- |
| core | 进程使用的物理内存页面大小 |
| physical | 进程使用的非交换物理内存 - |
| virtual | 进程使用的虚拟内存 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了内存使用率的历史信息:
Switch# show processes memory sorted
Total: 256108; Used: 89644; Free: 166464; Buffers: 0
  PID TTY      RSS    VSZ    SZ COMMAND
1317 pts/0     9516  13104  3276 imish
1106 ?         9428  13104  3276 imish
1463 pts/0     7436  13104  3276 imish
  956 ?         6836  14644  3661 nsm
 1007 ?         5948   9624  2406 imi
  924 ?         5912  17652  4413 hsrvd
  959 ?         3336   8076  2019 snmpd
 1032 ?         2724   8204  2051bgpd
 1027 ?         2488   7140  1785 ospfd
1003 ?         2472   7152  1788 pimd
  957 ?         2340   6572  1643 dhcrelay
  983 ?         2336   6592  1648 mstpd

 1021 ?         2324   6600  1650 ripd
 1005 ?         2320   6732  1683 ldpd
  942 ?         2284   6772  1693 sshd
  985 ?         2208   6592  1648 onmd
  929 ?         2132   7168  1792 chsm
  966 ?         2028   6140  1535 lacpd
  973 ?         2028   6284  1571 authd
  965 ?         2024   6408  1602 ptpd
  964 ?         1952   6364  1591 oamd
  977 ?         1948   6200  1550 rmond
  963 ?         1708   5980  1495 bhm
  919 ?         1120   3792   948 ntpd
  916 ?         1060   2300   575 syslog-ng
1465 pts/0      764   2516   629 ps
  917 ?          668   3040   760 crond
    1 ?          656   2928   732 init
1464 pts/0      472   1668   417 more
 1096 ?          416   2928   732 telnetd
 1098 ?          272   2928   732 telnetd
  912 ?          172   1496   374 angel
    2 ?            0      0     0 kthreadd
    3 ?            0      0     0 ksoftirqd/0
    4 ?            0      0     0 watchdog/0
    5 ?            0      0     0 events/0
    6 ?            0      0     0 khelper
    9 ?            0      0     0 netns
   10 ?            0      0     0 async/mgr
   63 ?            0      0     0 sync_supers
   65 ?            0      0     0 bdi-default
   66 ?            0      0     0 kblockd/0
   73 ?            0      0     0 kseriod
   88 ?            0      0     0 rpciod/0
  105 ?            0      0     0 khungtaskd
  106 ?            0      0     0 kswapd0
  157 ?            0      0     0 aio/0
  164 ?            0      0     0 nfsiod
  171 ?            0      0     0 crypto/0
  712 ?            0      0     0 mtdblockd
  741 ?            0      0     0 kpsmoused
  779 ?            0      0     0 jffs2_gcd_mtd1
  789 ?            0      0     0 PETH/Tx
```

**相关命令**：无

### 2.1.32 `terminal monitor`

**功能**：特权模式下，使用terminal monitor 命令显示系统的调试信息。

**语法**：

```
terminal monitor
terminal no monitor
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子使用了terminal monitor 命令:
Switch# terminal monitor
Jan  1 16:09:30 DUT1 IMISH-6: ready to service
```

**相关命令**：无

### 2.1.33 `configure terminal`

**功能**：特权模式下，使用configure terminal 命令进入全局配置模式。

**语法**：

```
configure terminal
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用本命令进入全局配置模式。全局配置模式下的用户配置将会被保存到running
  configuration 文件，并且命令提示行也会由特权模式下的#变为(config)#，提醒用户系
  统当前处于全局配置模式，end 命令或使用组合键Ctrl-Z 离开本模式。

**示例**：

```
下面这个例子使用了configure terminal 命令:
Switch# configure terminal
Switch(config)#
Enter configuration commands， one per line. End with CNTL/Z.
Switch(config)#
```

**相关命令**：enable、disable

### 2.1.34 `disable`

**功能**：特权模式下，使用disable 命令退出特权模式进入用户模式。

**语法**：

```
disable
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
这个例子中，使用enable 命令进入特权模式，使用disable 命令回到用户模式。注意
用户模式的提示符是>,特权模式的提示符是#:

Switch# configure terminal
Switch> enable
Password: <password>
Switch# disable
Switch>
```

**相关命令**：enable

### 2.1.35 `enable`

**功能**：用户模式下，使用enable 命令进入特权模式。

**语法**：

```
enable
```

**命令模式**：用户模式 特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
这个例子中，使用enable 命令进入特权模式，使用disable 命令回到用户模式。系统
需通过密码来进入特权模式，密码在终端上不会回显。注意用户模式的提示符是>,特
权模式的提示符是#:
Switch# configure terminal
Switch> enable
Password: <password>
Switch# disable
Switch>
```

**相关命令**：disable

### 2.1.36 `end`

**功能**：全局配置模式下，使用end 命令退出当前配置会话并返回到特权模式。

**语法**：

```
end
```

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

该命令将直接返回到特权模式，无论用户当前在那个模式下。
  该命令可在所有配置模式下使用。
  做完所有的系统配置后，用户可以使用该命令返回特权模式查看配置信息。

**示例**：

```
在这个例子中，使用end 命令从端口配置模式回到特权模式下。在特权模式下可以使
用show 命令检查配置:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# end
Switch# show interface eth-0-1
```

**相关命令**：exit

### 2.1.37 `exit (global)`

**功能**：任何模式下，都可使用exit 命令退出当前模式，返回到当前模式的下一级模式。

**语法**：

```
exit
```

**命令模式**：所有配置模式

**默认配置**：无

**使用说明**：

exit 可让用户退出当前模式并返回到当前模式的下一级模式。
  用户可以在全局配置模式下使用该命令退回到特权模式，或在接口配置模式，路由配
  置模式下使用该命令退回到全局配置模式。

**示例**：

```
在这个例子中，使用exit 命令从端口配置模式回到全局配置模式:
Switch# configure terminal
Switch(config-if)# exit
Switch(config)#
```

**相关命令**：end、exit (EXEC)

### 2.1.38 `exit (EXEC)`

**功能**：用户模式下，使用exit 命令关闭会话退出交换机。

**语法**：

```
exit
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

在用户模式下使用exit 命令离开该会话，这个命令可以在任意的模式下使用，可以离
  开当前的模式

**示例**：

```
下面的例子中，使用exit 离开了全局配置模式并进入特权模式，然后在特权模式使用
exit 退出交换机:
Switch# configure terminal
Switch(config)# exit
Switch# disable
Switch> exit
```

**相关命令**：quit

### 2.1.39 `quit`

**功能**：用户模式下，使用quit 命令关闭会话退出交换机。

**语法**：

```
quit
```

**命令模式**：所有配置模式

**默认配置**：无

**使用说明**：

在用户模式或者是特权模式下使用quit 会退出交换机

**示例**：

```
在下面的例子中，使用quit 命令离开了全局配置模式并进入特权模式，disable 命令是
从特权模式进入用户模式，而quit 命令可以从特权模式退出交换机:
Switch# configure terminal
Switch(config)# quit

Switch# disable
Switch> quit
```

**相关命令**：exit

### 2.1.40 `cd`

**功能**：特权模式下，使用cd 命令改变当前路径。

**语法**：

```
cd ( dir | )
```

| 参数 | 说明 |
| --- | --- |
| dir | (可选)文件系统路径。末尾加一个冒号(:)表示。比如， Flash：改变当前路径为 flash： (可选)文件系统路径。末尾加一个冒号(:)表示。比如， Flash：改变当前路径为 flash： udisk：改变当前路径为 udisk。如果当前没有USB 设备，cd udisk 命令将无法执行 |

**命令模式**：特权模式

**默认配置**：系统的初始当前路径为flash:如果用户没有设置当前路径。那么系统的缺省当前路径就 是文件系统的根路径flash:。

**使用说明**：

所有特权模式下带有文件路径参数的命令，如果用户在命令中省略该参数，系统会使
  用由cd 命令指定的当前路径作为缺省参数。比如dir 命令，该命令将当前路径下的文
  件列表显示给用户。

**示例**：

```
下面的例子设置当前路径为flash:
Switch# configure terminal
DUT1# cd
DUT1# pwd
flash:/
下面的例子设置当前路径为USB 盘:
Switch# configure terminal
storage device
DUT1# cd udisk:
DUT1# pwd
udisk:/
下面的例子中，当USB 没有接入时，提示失败:
Switch# cd udisk:
% Failed to cd udisk:: No such file or directory
In the following example, the cd command is used to set the file system with plug
in the USB mass storage device
```

**相关命令**：dir、ls、pwd

### 2.1.41 `copy`

**功能**：特权模式下，使用copy 命令拷贝文件。

**语法**：

```
copy source-name destination-name
```

| 参数 | 说明 |
| --- | --- |
| source-name | 源文件的URL。源文件可以是本地或远程文件 |
| destination-name | 目的文件的URL。目的文件可以是本地或远程文件 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

源和目的文件的URL 的具体值取决于文件所在位置。可以是一个相对路径或者是一个
  满足文件系统要求的绝对路径(filesystem:[/filepath][/filename])。

**示例**：

```
下面的例子展示了如何通过带内管理口从tftp 服务器拷贝image。:
Switch# copy tftp://192.168.0.1/image flash:/boot/image
Download from URL to temporary file.
Get file from tftp://192.168.0.1/image
...................................................................................
...........................
Received 15591515 bytes in 16.6 seconds
Copy the temporary file to its destination.
...................................................................................
...........................
15591515 bytes in 69.8 seconds, 218 kbytes/second
下面的例子展示了如何通过带外管理口从tftp 服务器拷贝image。:
Switch# copy mgmt-if tftp://192.168.0.1/image flash:/boot/image
```

**相关命令**：delete

### 2.1.42 `delete`

**功能**：特权模式下，使用delete 命令删除flash 上的文件。

**语法**：

```
delete file-name
```

| 参数 | 说明 |
| --- | --- |
| file-name | 准备删除的文件名 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

如果用户删除的是系统的配置文件或image 文件，系统会提示用户是否确定删除。同
  样，如果用户删除系统中某些特定文件，比如DHCP 的配置文件，系统也会有同样提
  示。

**示例**：

```
下面的例子删除了flash 上的test 文件。:
Switch# delete flash:/test
Are you sure to delete flash:/test? [confirm]:y
```

**相关命令**：copy

### 2.1.43 `dir`

**功能**：特权模式下，使用dir 命令显示当前路径下的文件列表。

**语法**：

```
dir ( flash: | udisk: | ) ( directory-name | ) ( file-name | )
```

| 参数 | 说明 |
| --- | --- |
| flash | flash 文件系统 |
| udisk | USB 存储设备。如果系统没有USB 存储设备。该命令将无法执行 |
| directory-name | flash 或USB 存储设备的路径 |
| file-name | 文件名字 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用dir 命令去显示flash 或者udisk 的信息

**示例**：

```
dir 命令的输出结果。:
Switch# dir
Directory of flash:/
total 42
drwxr-xr-x  2     0 Jul 30 15:42 boot
drwxr-xr-x  3     0 Jan  1  1970 conf
drwxr-xr-x  2     0 Jan  1  1970 log
-rw-r-----  1  1020 Jul 29 19:18 startup-config.conf
-rw-r--r--  1 10270 Jul 30 10:10 syslog
-rw-r--r--  1  6886 Jul 29 23:59 syslog.1.gz
63.0M bytes total (30.4M bytes free)
Switch # cd udisk:
Switch # dir
Directory of udisk:/
total 12
drwxrwxrwx 2 4096 Jun  2  2011test
drwxrwxrwx 2 4096 Jun  8  2011test1
drwxrwxrwx 2 4096 Jun  7  2011test2
3.7G bytes total (3.7G bytes free)
将当前目录切换到USB 设备后，使用dir 命令显示USB 盘上的文件列表:
Switch# cd udisk:
Switch# dir
Directory of udisk:/

total 12
drwxrwxrwx 2 4096 Jun  2  2011 test
drwxrwxrwx 2 4096 Jun  8  2011 test1
drwxrwxrwx 2 4096 Jun  7  2011 test2
3.7G bytes total (3.7G bytes free)
```

**相关命令**：ls

### 2.1.44 `ls`

**功能**：特权模式下，使用ls 命令显示当前路径下的文件列表。

**语法**：

```
ls ( flash: | udisk: | ) ( directory-name | ) ( file-name | )
```

| 参数 | 说明 |
| --- | --- |
| flash | flash 文件系统 |
| udisk | USB 存储设备。如果系统没有USB 存储设备。该命令将无法执行 |
| directory-name | flash 或USB 存储设备的路径 |
| file-name | 文件名字 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
ls 命令的输出结果。:
Switch# ls
Directory of flash:/
total 42
drwxr-xr-x  2     0 Jul 30 15:42 boot
drwxr-xr-x  3     0 Jan  1  1970 conf
drwxr-xr-x  2     0 Jan  1  1970 log
-rw-r-----  1  1020 Jul 29 19:18 startup-config.conf
-rw-r--r--  1 10270 Jul 30 10:10 syslog
-rw-r--r--  1  6886 Jul 29 23:59 syslog.1.gz
63.0M bytes total (30.4M bytes free)
```

**相关命令**：dir

### 2.1.45 `more`

**功能**：特权模式下，使用more 命令显示文件内容。

**语法**：

```
more ( flash: | udisk: ) ( directory-name | ) file-name
```

| 参数 | 说明 |
| --- | --- |
| flash | flash 文件系统 |
| udisk | USB 存储设备。如果系统没有USB 存储设备。该命令将无法执行 |
| directory-name | flash 或USB 存储设备的路径 |
| file-name | 文件名字 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

系统一次只能以ASCII 形式显示一个文件。

**示例**：

```
显示flash 上startup-config 文件的内容。:
Switch# more flash:/startup-config.conf
```

**相关命令**：dir、ls

### 2.1.46 `mkdir`

**功能**：特权模式下，使用mkdir 命令创建一个新的路径。

**语法**：

```
mkdir directory-name
```

| 参数 | 说明 |
| --- | --- |
| directory-name | 新路径名 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令只对本地文件系统有效。

**示例**：

```
下面的例子在flash 上创建一个名为newdir 的路径。:
Switch# mkdir flash:/newdir
下面的例子在USB 上创建一个名为newdir 的路径:
Switch# mkdir udisk:/newdir
```

**相关命令**：rmdir、dir

### 2.1.47 `rename`

**功能**：特权模式下，使用rename 命令改变一个文件名。

**语法**：

```
rename old-filename new-filename
```

| 参数 | 说明 |
| --- | --- |
| old-filename | 原文件名 |
| new-filename | 新文件名 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令只对本地文件系统有效

**示例**：

```
在下面的例子中，把文件startup-config.conf-bak 重命名为startup-config.conf-bak2:
Switch# configure terminal
Switch1# rename udisk:/wus udisk:/wu
Are you sure to rename udisk:/wus? [confirm]
```

**相关命令**：无

### 2.1.48 `rmdir`

**功能**：特权模式下，使用rmdir 命令删除一个路径。

**语法**：

```
rmdir directory-name
```

| 参数 | 说明 |
| --- | --- |
| directory-name | 删除的路径名 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令只对本地文件系统有效

**示例**：

```
下面的例子删除一个名为newdir 的路径:
Switch# rmdir flash:/newdir
Are you sure to delete newdir? [yes/no]: y
```

**相关命令**：mkdir、dir

### 2.1.49 `tar create`

**功能**：特权模式下，使用tar create 命令创建一个tar 文件。

**语法**：

```
tar create tar-file-name source-directory
```

| 参数 | 说明 |
| --- | --- |
| tar-file-name | 新tar 文件名 |
| source-directory | 源路径 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

源路径必须是一个存在的路径

**示例**：

```
这个例子将udisk/wu 目录下的文件压缩，创建一个名字为tar1 的压缩包:
Switch# tar create udisk:/tar1 udisk:/wu
```

**相关命令**：tar table、tar xtract

### 2.1.50 `tar table`

**功能**：特权模式下，使用tar table 命令查看tar 文件中具体内容。

**语法**：

```
tar table tar-file-name
```

| 参数 | 说明 |
| --- | --- |
| tar-file-name | tar 文件名 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

tar 文件必须是一个已存在的文件

**示例**：

```
显示压缩包tar1 中的文件:
Switch# tar table udisk:/tar1
```

**相关命令**：tar create

### 2.1.51 `tar xtract`

**功能**：特权模式下，使用tar xtract 命令解压tar 文件。

**语法**：

```
tar xtract tar-file destination-directory
```

| 参数 | 说明 |
| --- | --- |
| tar-file | 目的tar 文件名 |
| destination-directory | 目的路径 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

目的路径必须是一个已存在的路径，你可以用mkdir 创建一个新路径

**示例**：

```
这个例子将名为tar1 的压缩包解压，并存解压后的文件放到flash/mydir 目录下:
Switch# tar xtract flash:/tar1 flash:/mydir
```

**相关命令**：tar create、tar table

### 2.1.52 `show diagnostic-information`

**功能**：显示交换机机的诊断信息包含syslog，core 文件，配置信息，版本号等

**语法**：

```
show diagnostic-information ( bgp | ospf | )
```

| 参数 | 说明 |
| --- | --- |
| bgp | BGP 协议诊断信息 |
| ospf | OSPF 协议诊断信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示诊断信息:
Switch# show diagnostic-information
```

**相关命令**：无

### 2.1.53 `tar diagnostic-information`

**功能**：特权模式下，使用tar diagnostic-information 将diagnostic-information 信息打包成tar
  文件，并放到flash。 udisk， ftp 服务器或tftp 服务器上。目前的诊断信息有image 版
  本信息，设备时钟信息，running-config，startup-config，端口信息，内存信息，flash
  上文件信息，logging buffer 信息，core 文件，syslog 文件等信息。

**语法**：

```
tar diagnostic-information ( mgmt-if | ) destination-directory/ tar-file
```

| 参数 | 说明 |
| --- | --- |
| destination-directory | 目的路径，可以是flash， udisk， tftp 服务器， ftp 服务器 |
| tar-file | 目的tar 文件名 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

目的路径必须可达且磁盘空间充足

**示例**：

```
这个例子将diagnostic 打包成名为diag.tar.gz 的压缩包，并存放在flash 根目录下:
Switch# tar diagnostic-information flash:/diag.tar.gz
```

**相关命令**：无

### 2.1.54 `format`

**功能**：配置模式下，使用format 命令格式化udisk。

**语法**：

```
format udsik:
```

| 参数 | 说明 |
| --- | --- |
| udsik: | USB 存储设备。如果系统中没有USB 设备，命令将无法执行 |

**命令模式**：应用配置模式

**默认配置**：无

**使用说明**：

目的路径必须存在

**示例**：

```
下面的例子使用这个命令格式化U 盘:
Switch# configure terminal
Switch(config)# format udisk:
   WARNING: All data on udisk: will be lost!!!
And format operation may take a while.
Are you sure to process with format? [yes/no]: yes
```

**相关命令**：无

### 2.1.55 `umount`

**功能**：配置模式下，使用umount 命令卸载USB 设备。将USB 设备从交换机拔下前需要先卸
  载它。

**语法**：

```
umount udsik:
```

| 参数 | 说明 |
| --- | --- |
| udisk: | USB 存储设备。如果系统中没有USB 设备，命令将无法执行 |

**命令模式**：应用配置模式

**默认配置**：无

**使用说明**：

USB 设备必须已挂载到系统中，使用umount 命令卸载USB 设备

**示例**：

```
下面的例子使用这个命令将U 盘安全卸载:
Switch# configure terminal
Switch(config)# umount udisk:
After this operation, you can not use USB disk.
Are you sure to continue? [yes/no]: yes
```

**相关命令**：无

### 2.1.56 `cut-through enable`

**功能**：全局配置模式下，使能Cut-Through 模式，可以配置支持的速率。使用该命令的no 形
  式恢复默认。

**语法**：

```
cut_through_forwarding enable ( 10G | 100G | 1G | 25G | 2G5 | 40G | 50G | 5G )
no cut_through_forwarding enable
```

| 参数 | 说明 |
| --- | --- |
| enbale | 使能Cut-Through 模式 (10G\|100G\| 1G\| 25G\|2G5\|40G\|50G\|5G) 配置cut_through 支持的速率，默认为10G\|100G\| 1G\| |
| 25G\|2G5\|40G\|50G\|5G |  |

**命令模式**：应用配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何设置cut through 模式:

Switch# configure terminal
Switch(config)# cut-through-forwarding enable 10G
% Configuration about cutting through forwarding mode has been stored, but cannot
take effect until the next reload.
```

**相关命令**：无

### 2.1.57 `show cut-through-forwarding mode`

**功能**：本命令用于查看系统启动当前工作的模式。

**语法**：

```
show cut-through-forwarding mode
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了转发芯片工作模式:
DUT1# show cut-through-forwarding mode
```

**相关命令**：无

### 2.1.58 `reset factory-config`

**功能**：本命令用于恢复出厂配置。

**语法**：

```
reset factory-config
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

选择yes 后会将当前保存的配置恢复为出厂配置，重启时提示是否保存配置时，需要
  选择NO。

**示例**：

```
这个例子显示了如何恢复出厂配置并重启:
Switch# configure terminal
DUT1# reset factory-config

This action will reset the saved configuration immediately.
Running-config will be erased after reboot. Continue? [yes/no]:
```

**相关命令**：无

### 2.1.59 `show factory-config`

**功能**：本命令用于查看出厂配置。

**语法**：

```
show factory-config
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
这个例子显示了出厂设置信息:
DUT1# show factory-config
```

**相关命令**：无

### 2.1.60 `show this`

**功能**：用来查看系统当前模式的运行配置

**语法**：

```
show this
```

**命令模式**：所有配置模式

**默认配置**：无

**使用说明**：

不支持以下模式：key-chain，key-chain key，time range，acl，route-map，line，
  class map

**示例**：

```
下面的例子显示如何查看当前模式下的配置:
Switch(config-vlan)# show this
vlan database
 vlan 5
!
```

**相关命令**：无

### 2.1.61 `show route-mac`

**功能**：用来查看当前设备的三层口MAC 地址

**语法**：

```
show route-mac
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

目前每台设备所有三层接口只有一个route-mac

**示例**：

```
下面的例子显示如何查看当前设备的route-mac:
Switch# show route-mac
Route MAC is: 222c.12fd.6c00

!
```

**相关命令**：无

### 2.1.62 `show history`

**功能**：show history 命令用于显示历史命令行

**语法**：

```
show history
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用该命令显示历史配置命令行。

**示例**：

```
如下示例，显示该设备历史命令行配置信息:
Switch# show history
   1 configure terminal
   2 interface eth-0-1
   3 no shutdown
   4 exit
   5 show version
```

**相关命令**：无

### 2.1.63 `write`

**功能**：用来保存当前配置信息

**语法**：

```
write ( file | memory | )
```

| 参数 | 说明 |
| --- | --- |
| file | 将配置保存到文件中 |
| memory | 将配置保存到交换机的 NVRAM 中 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

用户通过命令行可以修改设备的当前配置，而这些配置是暂时的，如果要使当前配置
  在系统下次重启时仍然有效，在重启设备前，需要将当前配置保存到配置文件中

**示例**：

```
如下示例显示保存当前配置:
Switch# write
Building configuration...
[OK]
```

**相关命令**：无

### 2.1.64 `write terminal`

**功能**：用来查看设备当前生效的配置参数

**语法**：

```
write terminal
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

如果用户完成一组配置之后，需要验证是否配置正确，则可以执行此命令来查看当前
  生效的参数

**示例**：

```
查看所有配置信息:
Switch# write terminal
split interface eth-0-1 10giga
!
!
no service password-encryption

!
!
vlan database
!
interface eth-0-1/1
 no switchport
 ip address 1.1.1.10/24
!
interface eth-0-1/2
!
interface eth-0-1/3
!
interface eth-0-1/4
!
```

**相关命令**：无

### 2.1.65 `show running-config`

**功能**：用来显示当前运行的配置

**语法**：

```
show running-config
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

如果用户完成一组配置之后，需要验证是否配置正确，则可以执行此命令来查看当前
  生效的参数

**示例**：

```
查看包含字符串“vlan”的所有配置信息:
Switch# show running-config | include vlan
vlan database
 vlan 4
```

**相关命令**：无、2.2 用户管理配置命令


## 2.2 用户管理配置命令

### 2.2.1 `username`

**功能**：本命令创建或删除一个本地交换机上的账户。

**语法**：

```
username WORD
no username WORD
```

| 参数 | 说明 |
| --- | --- |
| username | 创建用户账户 |
| WORD | 用户账户名 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
显示了如何创建一个新的用户及用户名:
Switch# configure terminal
Switch(config)#username testName
```

**相关命令**：无

### 2.2.2 `username password`

**功能**：本命令用来配置用户名和密码

**语法**：

```
username WORD password ( 8 | ) LINE
```

| 参数 | 说明 |
| --- | --- |
| WORD | 用户账户名 |
| Password | 用户密码 (8\|) 指定密码加密 |
| LINE | 用户密码字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
显示了如何创建了一个用户名为testName 密码为123456 的账户:
Switch# configure terminal
Switch(config)# username testName password 123456
```

**相关命令**：无

### 2.2.3 `username secret`

**功能**：本命令创建用户账户和加密的账户名密码。

**语法**：

```
username WORD secret LINE
```

| 参数 | 说明 |
| --- | --- |
| WORD | 用户账户名 |
| secret | 指定密码加密 |
| LINE | 用户密码字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
显示了如何创建了一个用户名为testName 密码为123456 的账户:
Switch# configure terminal
Switch(config)#username testName secret 123456
```

**相关命令**：无

### 2.2.4 `username privilege`

**功能**：本命令创建具有特权等级的用户账户。

**语法**：

```
username WORD privilege <1-4>
```

| 参数 | 说明 |
| --- | --- |
| username WORD | 用户账户名 privilege <1-4> 设置账户特权等级，特权等级<1-4> |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
显示了如何创建一个用户名为testName 等级为2 的账户:
Switch# configure terminal
Switch(config)#username testName privilege 2
```

**相关命令**：无

### 2.2.5 `username service-type`

**功能**：本命令用于配置允许的用户接入类型。

**语法**：

```
username WORD service-type ( { rpc-api | ssh | telnet | web } | ftp-server } | all | none )
```

| 参数 | 说明 |
| --- | --- |
| username WORD | 用户账户名 |
| service-type | 用户接入类型（包括 rpc- api，ssh，telnet，web， ftp-server） |

**命令模式**：全局配置模式

**默认配置**：允许所有用户接入类型

**使用说明**：

无

**示例**：

```
显示了如何设置仅允许rpc-api 用户接入类型:
Switch# configure terminal
Switch(config)#username testName service-type rpc-api
```

**相关命令**：无

### 2.2.6 `username privilege password`

**功能**：本命令创建具有特权等级和密码的账户。

**语法**：

```
username WORD privilege <1-4> password ( 8 | ) LINE
```

| 参数 | 说明 |
| --- | --- |
| WORD | 用户账户名 privilege <1-4> 设置账户特权等级，特权等级<1-4> 指定密码隐藏 |
| LINE | 用户密码 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
显示了如何创建了一个用户名为testName 密码为123456 等级为2 的账户:
Switch# configure terminal
Switch(config)# username testName privilege 2 password 123456
```

**相关命令**：无

### 2.2.7 `re-username newname`

**功能**：本命令重命名用户名。

**语法**：

```
re-username WORD newname WORD
```

| 参数 | 说明 |
| --- | --- |
| re-username WORD | 原用户名 |
| newname WORD | 新用户名 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
显示了如何将用户testName 重命名为newname:
Switch# configure terminal
Switch(config)# re-username testName newname newname
```

**相关命令**：无

### 2.2.8 `cipher detect`

**功能**：本命令设置密码的安全等级。

**语法**：

```
cipher detect ( strong ( level ( 1 | 2 ) | ) | normal | none )
```

| 参数 | 说明 |
| --- | --- |
| strong | 密码长度必须处于[8.63],必须包含数字，普通字符和特殊字符中的两种 |
| strong level 1 | 密码长度必须处于[8.63],必须包含数字，普通字符和特殊字符中的两种 |
| strong level 2 | 密码长度必须处于[8.63],必须包含数字，小写字母、大写字母和特殊字符，且与用户无关 |
| normal | 密码长度必须在[8,63] |
| none | 关闭安全检查 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
显示了如何设置密码的安全等级为高:
Switch# configure terminal
Switch(config)# cipher detect strong
```

**相关命令**：无、、2.3 FTP 配置命令


## 2.3 FTP 配置命令

### 2.3.1 `ftp`

**功能**：ftp 命令用来在本地主机和远程ftp 服务器间交换文件。

**语法**：

```
ftp ( mgmt-if | ) host ( port PORTNUM | )
```

| 参数 | 说明 |
| --- | --- |
| mgmt-if | 使用管理口 |
| HOST | 远程主机的IPv4，IPv6 地址或主机名 IPv4，IPv6 地址或主机名 |
| PORTNUM | 远程ftp server 的端口 1-65535 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用ftp 命令从远程ftp 服务器上传或下载文件。

**示例**：

```
下面的例子通过IPv4 地址连接ftp 服务器:
Switch# ftp mgmt-if 10.10.29.160
Connected to 10.10.29.160.
220---------- Welcome to Pure-FTPd ----------
220-You are user number 1 of 50 allowed.
220-Local time is now 09:00. Server port: 21.
220-IPv6 connections are also welcome on this server.
220 You will be disconnected after 15 minutes of inactivity.
Name (10.10.29.160:root): root
331 User root OK. Password required
Password:
230-User root has group access to:  wheel    disk     adm      sys      daemon
230- bin      root
230 OK. Current directory is /root
Remote system type is UNIX.

Using binary mode to transfer files.
ftp>
下面的例子通过IPv6 地址连接ftp 服务器:
Switch# ftp mgmt-if 2001:1000::2

Connected to 2001:1000::2 (2001:1000::2).
220 Serv-U FTP Server v10.2 ready...
Name (2001:1000::2:root): Username
331 User name okay, need password.
Password:
230 User logged in, proceed.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp>
```

**相关命令**：无

### 2.3.2 `ftp vrf`

**功能**：ftp 命令用来在指定的vrf 内通过本地主机和远程ftp 服务器间交换文件。

**语法**：

```
ftp vrf WORD
```

| 参数 | 说明 |
| --- | --- |
| WORD | VPN 路由转发实例名不超过31 个字符 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# ftp vrf testvrf
```

**相关命令**：无

### 2.3.3 `ftp passive`

**功能**：全局配置模式下，使用ftp passive 命令设置FTP 为 passive 模式。本命令的no 格式用
  来恢复到缺省模式。

**语法**：

```
ftp passive
no ftp passive
```

**命令模式**：全局配置模式

**默认配置**：FTP 工作在Active 模式。

**使用说明**：

无

**示例**：

```
下面的例子将ftp 设为被动模式:
Switch# configure terminal
Switch(config)# ftp passive
```

**相关命令**：ftp username、ftp password

### 2.3.4 `show ftp`

**功能**：特权模式下，使用show ftp 命令显示ftp 的配置信息。

**语法**：

```
show ftp
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了show ftp 命令的显示结果:
Switch# show ftp
ftp passive mode: on
ftp username: root
ftp password: unencrypted， abc
Switch#
```

**相关命令**：ftp username、ftp password

### 2.3.5 `copy GFILENAME GURLNAME`

**功能**：使用此命令将本地flash 的文件拷到ftp 服务器。

**语法**：

```
copy GFILENAME ( vrf VRF_NAME | ) ( mgmt-if | -a SRC_ADDR | -si SRC_INTF )
GURLNAME
```

| 参数 | 说明 |
| --- | --- |
| mgmt-if | 使用管理口 |
| vrf WORD | VPN 路由转发实例名不超过31 个字符 |
| GFILENAME | 源目录完整的文件路径和文件名， 不超过255 字符 |
| GURLNAME | 目的URL 完整的文件路径和文件名， 不超过255 字符 |
| -a SRC_ADDR | 指定源IP |
| -si SRC_INTF | 指定源接口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示如何把本地的flash 文件拷贝到ftp 服务器:
Switch# copy flash:/test.c ftp:/username:password@1.1.1.1:21/running-config
```

**相关命令**：无

### 2.3.6 `copy GURLNAME GFILENAME`

**功能**：使用此命令将ftp 服务器的文件拷到本地

**语法**：

```
copy ( vrf VRF_NAME | ) ( mgmt-if | -a SRC_ADDR | -si SRC_INTF ) GURLNAME
GFILENAME
```

| 参数 | 说明 |
| --- | --- |
| mgmt-if | 使用管理口 |
| vrf WORD | VPN 路由转发实例名不超过31 个字符 |
| GURLNAME | 源URL 完整的文件路径和文件名， 不超过255 字符 |
| GFILENAME | 目的目录完整的文件路径和文件名， 不超过255 字符 |
| -a SRC_ADDR | 指定源IP |
| -si SRC_INTF | 指定源接口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何把tftp 服务器的文件拷贝到本地:
Switch# copy ftp://username:password@1.1.1.1:21/test.c flash:test1.c
get file from ftp://username:password@1.1.1.1:21/test.c
.
Received 225 bytes in 0.3 seconds
```

**相关命令**：无、2.4 FTP server 配置命令


## 2.4 FTP server 配置命令

### 2.4.1 `ftp server enable`

**功能**：在交换机上使能FTP server 的服务。

**语法**：

```
ftp server ( mgmt-if | ) enable
no ftp server enable
```

| 参数 | 说明 |
| --- | --- |
| mgmt-if | 使用管理口 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**相关命令**：无

### 2.4.2 `ftp server port`

**功能**：配置FTP server 监听的端口号。在原命令前面加（no）关键字，恢复为默认配置。

**语法**：

```
ftp server port PORTNUM
no ftp server port
```

| 参数 | 说明 |
| --- | --- |
| port num | (1025-65535) |

**命令模式**：全局配置模式

**默认配置**：默认21 端口

**使用说明**：

无

**示例**：

```
下面的例子配置FTP server 端口号为10000:
Switch# configure terminal
Switch# ftp server port 10000
```

**相关命令**：无

### 2.4.3 `ftp server time-out`

**功能**：配置FTP server 静默时间。在原命令前面加（no）关键字，恢复为默认配置。

**语法**：

```
ftp server time-out MINUTES
no ftp server time-out
```

| 参数 | 说明 |
| --- | --- |
| minutes | (1-1000)mins |

**命令模式**：全局配置模式

**默认配置**：默认15 分钟

**使用说明**：

无

**示例**：

```
下面的例子配置FTP server 静默时间为5 分钟:
Switch# configure terminal
Switch# ftp server time-out 5
```

**相关命令**：ftp passive

### 2.4.4 `ftp server source address`

**功能**：本命令可修改交换机上FTP server 的源地址。使用该命令的no 形式恢复默认。

**语法**：

```
ftp server source address ( vrf NAME | ) IP_ADDR
no ftp server source address
```

| 参数 | 说明 |
| --- | --- |
| vrf NAME | 指定提供FTP server 的vrf 不超过31 个字符 |
| IP_ADDR | 配置带内FTP 服务器的源 IP 地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

该命令可以修改FTP server 默认的源地址，并可以指定提供FTP server 的vrf。源地址
  只能是loopback 口的地址或者0.0.0.0，当配置为0.0.0.0 表示不指定ip 作为FTP server
  地址。

**示例**：

```
这个例子配置了FTP server 的源地址:
Switch# configure terminal
Switch(config)# ftp server source address vrf vpn1 10.10.10.1
```

**相关命令**：无

### 2.4.5 `show ftp server`

**功能**：特权模式下，使用show ftp server 命令显示ftp server 的配置信息。

**语法**：

```
show ftp server
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了show ftp server 命令的显示结果:
Switch# show ftp server
FTP server configuration:
============================================================
 FTP Server                              : Disabled
 FTP Server Timeout                      : 15
 FTP Server Port                         : 21
 FTP Server Source Address               : 0.0.0.0
```

**相关命令**：无、2.5 TFTP 配置命令


## 2.5 TFTP 配置命令

### 2.5.1 `copy GFILENAME GURLNAME`

**功能**：使用此命令将本地flash 的文件拷到tftp 服务器。

**语法**：

```
copy GFILENAME ( vrf VRF_NAME | ) ( mgmt-if | -a SRC_ADDR | -si SRC_INTF )
GURLNAME
```

| 参数 | 说明 |
| --- | --- |
| mgmt-if | 使用管理口 |
| vrf WORD | VPN 路由转发实例名不超过31 个字符 |
| GFILENAME | 源目录完整的文件路径和文件名， 不超过255 字符 |
| GURLNAME | 目的URL 完整的文件路径和文件名， 不超过255 字符 |
| -a SRC_ADDR | 指定源IP |
| -si SRC_INTF | 指定源接口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示如何把本地的flash 文件拷贝到tftp 服务器:
Switch# copy flash:/test.c tftp://1.1.1.1/running-config
```

**相关命令**：无

### 2.5.2 `copy GURLNAME GFILENAME`

**功能**：使用此命令将tftp 服务器的文件拷到本地

**语法**：

```
copy ( vrf VRF_NAME | ) ( mgmt-if | -a SRC_ADDR | -si SRC_INTF ) GURLNAME
GFILENAME
```

| 参数 | 说明 |
| --- | --- |
| mgmt-if | 使用管理口 |
| vrf WORD | VPN 路由转发实例名不超过31 个字符 |
| GURLNAME | 源URL 完整的文件路径和文件名， 不超过255 字符 |
| GFILENAME | 目的目录完整的文件路径和文件名， 不超过255 字符 |
| -a SRC_ADDR | 指定源IP |
| -si SRC_INTF | 指定源接口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何把tftp 服务器的文件拷贝到本地:
Switch# copy tftp://1.1.1.1/test.c flash:test1.c
get file from tftp://1.1.1.1/test.c
.
Received 225 bytes in 0.3 seconds
```

**相关命令**：无

### 2.5.3 `copy running-config mgmt-if`

**功能**：使用本命令拷贝running-config 文件至tftp 服务器。

**语法**：

```
copy running-config ( mgmt-if | ) GURLNAME
```

| 参数 | 说明 |
| --- | --- |
| startup-config | 系统当前的配置文件 |
| mgmt-if | 使用管理口 |
| GURLNAME | 目的URL 完整的文件路径和文件名， 不超过255 字符 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
这个例子将当前配置文件备份到远端tftp 服务器:
Switch#copy running-config tftp://1.1.1.1/running-config
Building configuration…
send file to tftp://1.1.1.1/running-config
…
Sent 40198 bytes in 8.3 seconds
```

**相关命令**：无

### 2.5.4 `copy mgmt-if startup-config`

**功能**：使用本命令从tftp 服务器拷贝startup-config 文件至本地。

**语法**：

```
copy ( mgmt-if | ) GURLNAME startup-config
```

| 参数 | 说明 |
| --- | --- |
| mgmt-if | 使用管理口 |
| GURLNAME | 源URL 完整的文件路径和文件名， 不超过255 字符 |
| startup-config | 拷贝至本地的startup- config 文件 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
这个例子显示了如何把startup-config 文件从tftp 服务器拷到本地:
Switch#copy tftp://1.1.1.1/startup-config startup-config
get file from tftp://1.1.1.1/startup-config
..
Sent 32252 bytes in 6.4 seconds
```

**相关命令**：无、2.6 scp 配置命令


## 2.6 scp 配置命令

### 2.6.1 `copy GFILENAME GURLNAME`

**功能**：使用此命令将本地flash 的文件拷到scp 服务器。

**语法**：

```
copy GFILENAME ( mgmt-if | ) GURLNAME
```

| 参数 | 说明 |
| --- | --- |
| mgmt-if | 使用管理口 |
| GFILENAME | 源目录完整的文件路径和文件名， 不超过255 字符 |
| GURLNAME | 目的URL 完整的文件路径和文件名， 不超过255 字符 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示如何把本地的flash 文件拷贝到scp 服务器:
Switch# copy flash:/test.c scp://1.1.1.1/running-config
```

**相关命令**：无

### 2.6.2 `copy GURLNAME GFILENAME`

**功能**：使用此命令将scp 服务器的文件拷到本地

**语法**：

```
copy ( mgmt-if | ) GURLNAME GFILENAME
```

| 参数 | 说明 |
| --- | --- |
| mgmt-if | 使用管理口 |
| GURLNAME | 源URL 完整的文件路径和文件名， 不超过255 字符 |
| GFILENAME | 目的目录完整的文件路径和文件名， 不超过255 字符 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了如何把scp 服务器的文件拷贝到本地:
Switch# copy scp://1.1.1.1/test.c flash:test1.c
get file from scp://1.1.1.1/test.c
.
Received 225 bytes in 0.3 seconds
```

**相关命令**：无

### 2.6.3 `copy running-config mgmt-if`

**功能**：使用本命令拷贝running-config 文件至scp 服务器。

**语法**：

```
copy running-config ( mgmt-if | ) GURLNAME
```

| 参数 | 说明 |
| --- | --- |
| startup-config | 系统当前的配置文件 |
| mgmt-if | 使用管理口 |
| GURLNAME | 目的URL 完整的文件路径和文件名， 不超过255 字符 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
这个例子将当前配置文件备份到远端scp 服务器:
Switch#copy running-config mgmt-if scp://1.1.1.1/running-config
Building configuration…
send file to scp://1.1.1.1/running-config
…
Sent 40198 bytes in 8.3 seconds
```

**相关命令**：无

### 2.6.4 `copy mgmt-if startup-config`

**功能**：使用本命令从scp 服务器拷贝startup-config 文件至本地。

**语法**：

```
copy ( mgmt-if | ) GURLNAME startup-config
```

| 参数 | 说明 |
| --- | --- |
| mgmt-if | 使用管理口 |
| GURLNAME | 源URL 完整的文件路径和文件名， 不超过255 字符 |
| startup-config | 拷贝至本地的startup- config 文件 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
这个例子显示了如何把startup-config 文件从scp 服务器拷到本地:
Switch#copy scp://1.1.1.1/startup-config startup-config
get file from scp://1.1.1.1/startup-config
..
Sent 32252 bytes in 6.4 seconds
```

**相关命令**：无、2.7 Telnet 配置命令


## 2.7 Telnet 配置命令

### 2.7.1 `telnet`

**功能**：本命令可让交换机访问网络上其他的设备。

**语法**：

```
telnet ( -a SRC_ADDR ) ( vrf WORD | mgmt-if ) HOST ( PORT | )
```

| 参数 | 说明 |
| --- | --- |
| -a SRC_ADDR | Telnet 时指定源IP |
| vrf WORD | VPN 路由转发实例名不超过31 个字符 |
| mgmt-if | 使用管理口 |
| HOST | 远程主机的IPv4，IPv6 地址或主机名 IPv4，IPv6 地址或主机名 |
| PORT | TCP 端口号 1-65535 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
使用telnet 命令，连接远程设备:
Switch# telnet mgmt-if 10.10.29.247
Entering character mode
Escape character is '^]'.
TestOS， Version 2.3(62)，fcs
Switch# telnet 2001:1000::1
Entering character mode
Escape character is '^]'.
DUT1#
```

**相关命令**：无

### 2.7.2 `ip telnet server source address`

**功能**：本命令可修改交换机上telnet 服务器的源地址。使用该命令的no 形式恢复默认。

**语法**：

```
ip telnet server source address ( vrf NAME | ) IP_ADDR
no ip telnet server source address
```

| 参数 | 说明 |
| --- | --- |
| vrf NAME | 指定提供telnet 服务的vrf 不超过31 个字符 |
| IP_ADDR | 配置带内telnet 服务器的源 IP 地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

该命令可以修改telnet 服务器默认的源地址，并可以指定提供telnet 服务的vrf。源地
  址只能是loopback 口的地址或者0.0.0.0，当配置为0.0.0.0 表示不指定ip 作为telnet
  服务器地址。

**示例**：

```
这个例子配置了telnet 服务的源地址:
Switch# configure terminal
Switch(config)# ip telnet server source address vrf vpn1 10.10.10.1
```

**相关命令**：无

### 2.7.3 `ip telnet server source port`

**功能**：本命令可修改交换机上带内telnet 服务器的源端口。使用该命令的no 形式恢复默认。

**语法**：

```
ip telnet server source port NUMBER
no ip telnet server source port
```

| 参数 | 说明 |
| --- | --- |
| port NUMBER | 配置带内telnet 服务器的源端口号 1025-65535 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

no telnet server sourc port 会配置带内telnet 服务器的源端口号为默认值23。

**示例**：

```
下面的例子显示了如何为交换机设置带内telnet 服务的port 号:
Switch# configure terminal
Switch(config)# ip telnet server source port 2323
```

**相关命令**：无

### 2.7.4 `ip telnet server source mgmt-if port`

**功能**：本命令可修改交换机上带外telnet 服务器的源端口。使用该命令的no 形式恢复默认。

**语法**：

```
ip telnet server source mgmt-if port NUMBER
no ip telnet server source mgmt-if port
```

| 参数 | 说明 |
| --- | --- |
| mgmt-if port NUMBER | 配置带外telnet 服务器的源端口号 1025-65535 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

no telnet server sourc mgmt-ifport 会配置带外telnet 服务器的源端口号为默认值23。

**示例**：

```
下面的例子显示了如何为交换机设置带外telnet 服务的port 号:
Switch# configure terminal
Switch(config)# ip telnet server source mgmt-if port 2323
```

**相关命令**：无、2.8 SSH 配置命令


## 2.8 SSH 配置命令

### 2.8.1 `ip ssh server`

**功能**：使用此命令启用或者禁用SSH 服务。

**语法**：

```
ip ssh server ( enable | disable )
```

| 参数 | 说明 |
| --- | --- |
| enable | 开启SSH 服务 |
| disable | 关闭SSH 服务 |

**命令模式**：全局配置模式

**默认配置**：开启

**使用说明**：

无

**示例**：

```
交换机上开启SSH 服务:
Switch# configure terminal
Switch(config)# ip ssh server enable
```

**相关命令**：show ip ssh server status

### 2.8.2 `ip ssh server authentication-retries`

**功能**：使用此命令设置使用SSH 登录时，如果认证失败，可以在尝试的次数。
  使用关键字no 恢复当认证失败时可以尝试的次数为默认值。

**语法**：

```
ip ssh server authentication-retries COUNT
no ip ssh server authentication-retries
```

| 参数 | 说明 |
| --- | --- |
| COUNT | 设置认证失败时还可以尝试1-6 登录的次数，最大6 次 |

**命令模式**：全局配置模式

**默认配置**：默认6 次

**使用说明**：

无

**示例**：

```
设置认证失败时还可以尝试登录的次数为3 次:
Switch# configure terminal
Switch(config)# ip ssh server authentication-retries 3
```

**相关命令**：show ip ssh server status

### 2.8.3 `ip ssh server authentication-timeout`

**功能**：使用此命令设置使用SSH 登录后，无操作时系统断开连接的等待时间。
  使用关键字no 恢复此项设置为默认值。

**语法**：

```
ip ssh server authentication-timeout SECONDS
no ip ssh server authentication-timeout
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 设置无操作时系统断开连接的等待时间；以秒为单位 1-120 秒 |

**命令模式**：全局配置模式

**默认配置**：120 秒

**使用说明**：

无

**示例**：

```
设置无操作时系统断开连接的等待时间:
Switch# configure terminal
Switch(config)# ip ssh server authentication-timeout 100
```

**相关命令**：show ip ssh server status

### 2.8.4 `ip ssh server authentication-type`

**功能**：使用此命令设置使用SSH 登录时所支持的认证方式。
  使用关键字no 恢复此项设置为默认值。

**语法**：

```
ip ssh server authentication-type ( all | { password | public-key | rsa } )
no ip ssh server authentication-type
```

| 参数 | 说明 |
| --- | --- |
| all | 启用所有认证方式 |
| password | 启用密码认证方式 |
| public-key | 启用SSHv2 公钥认证方式 - |
| rsa | 启用SSHv1 RSA 认证方式 - |

**命令模式**：全局配置模式

**默认配置**：all

**使用说明**：

无

**示例**：

```
启用密码认证方式:
Switch# configure terminal
Switch(config)# ip ssh server authentication-type password
```

**相关命令**：show ip ssh server status

### 2.8.5 `ip ssh server host-key rsa key`

**功能**：使用此命令设置交换机的host-key。
  使用关键字no 恢复此项设置为默认值。

**语法**：

```
ip ssh server host-key rsa key KEYNAME
no ip ssh server host-key rsa
```

| 参数 | 说明 |
| --- | --- |
| KEYNAME | 所设置的交换机的host-key 不超过32 字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

host-key 主要用来在连接建立时和公钥一起生成会话ID；如果在SSH 登录后修改
  host-key，则此次SSH 登录会立即断开。

**示例**：

```
设置交换机的host-key:

Switch# configure terminal
Switch(config)# ip ssh server host-key rsa key KEY1
```

**相关命令**：show ip ssh server status

### 2.8.6 `ip ssh server rekey-interval`

**功能**：使用此命令设置交换机的rekey-interval。
  使用关键字no 恢复此项设置为默认值。

**语法**：

```
ip ssh server rekey-interval MINUTE
no ip ssh server rekey-interval
```

| 参数 | 说明 |
| --- | --- |
| MINUTE | rekey-interval 值；以分钟为单位 1-1440 分钟 |

**命令模式**：全局配置模式

**默认配置**：默认时间间隔60 分钟。

**使用说明**：

无

**示例**：

```
设置交换机的rekey-interval 为30 分钟:
Switch# configure terminal
Switch(config)# ip ssh server rekey-interval 30
```

**相关命令**：show ip ssh server status

### 2.8.7 `ip ssh server version`

**功能**：使用此命令设置SSH 协议的版本。
  使用关键字no 恢复此设置为默认值。

**语法**：

```
ip ssh server version ( 1 | 2 | all )
no ip ssh server version
```

| 参数 | 说明 |
| --- | --- |
| all | 设置交换机支持version 1 和version 2 |

**命令模式**：全局配置模式

**默认配置**：版本2

**使用说明**：

缺省交换机使用version 2 版本。
  当使用SSH 协议登录时，客户端和服务端在开始建立连接时会协商所使用的协议版本；
  如果协商失败，则不会建立连接；如果某一端设置所使用的SSH 协议为all，则协商的
  结果以对端所支持的SSH 协议的最高版本来决定。

**示例**：

```
设置交换机使用version 1:
Switch# configure terminal
Switch(config)# ip ssh server version 1
```

**相关命令**：show ip ssh server status

### 2.8.8 `ip ssh server source address`

**功能**：使用此命令设置SSH 服务器的源地址。
  使用关键字no 恢复此设置为默认值。

**语法**：

```
ip ssh server source address { vrf NAME | } IP_ADDR
no ip ssh server source address
```

| 参数 | 说明 |
| --- | --- |
| vrf NAME | 指定提供SSH 服务的vrf 不超过31 字符的字符串 |
| IP_ADDR | 配置带内SSH 服务器的源 IP 地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

该命令可以修改SSH 服务器的源地址，指定提供SSH 服务的vrf。源地址只能是
  loopback 口的地址或者0.0.0.0，当配置为0.0.0.0 表示不指定ip 作为SSH 服务器地址。

**示例**：

```
下面的例子显示了如何设置SSH 服务器的带内地址:
Switch# configure terminal
Switch(config)# ip ssh server source address 10.10.10.1
```

**相关命令**：ip ssh server

### 2.8.9 `ip ssh server source port`

**功能**：使用此命令配置带内SSH 服务器的源端口号。
  
  使用关键字no 恢复此设置为默认值。

**语法**：

```
ip ssh server source port NUMBER
no ip ssh server source port
```

| 参数 | 说明 |
| --- | --- |
| port NUMBER | 配置带内SSH 服务器的源端口号 1025-65535 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

no ip ssh server source port 会配置带内SSH 服务器的源端口号为默认值22。

**示例**：

```
配置ssh 服务tcp 源端口:
Switch# configure terminal
Switch(config)# ip ssh server source port 2222
```

**相关命令**：ip ssh server

### 2.8.10 `ip ssh server source mgmt-if port`

**功能**：ip ssh server source mgmt-if port 命令用来配置带外SSH 服务器的源端口号。no ip ssh
  server source mgmt-if port 命令用来恢复默认的源端口号

**语法**：

```
ip ssh server source mgmt-if port NUMBER
no ip ssh server source mgmt-if port
```

| 参数 | 说明 |
| --- | --- |
| mgmt-if port NUMBER | 配置带外SSH 服务器的源端口号 1025-65535 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

no ip ssh server source port 会配置带外SSH 服务器的源端口号为默认值22。

**示例**：

```
配置ssh 服务在管理口上的tcp 源端口:
Switch# configure terminal
Switch(config)# ip ssh server source mgmt-if port 2222
```

**相关命令**：ip ssh server

### 2.8.11 `show ip ssh server status`

**功能**：使用此命令查看SSH 配置信息。

**语法**：

```
show ip ssh server status
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
使用此命令查看SSH 配置信息:
Switch# show ip ssh server status
 SSH server enabled
 Version: 1.99
 Authentication timeout: 33 second(s)
 Authentication retries: 6 time(s)
 Server key lifetime: 60 minute(s)
 Authentication type: password， public-key
```

**相关命令**：show ip ssh server session

### 2.8.12 `rsa key generate`

**功能**：使用此命令生成rsa key。

**语法**：

```
rsa key KEYNAME generate
```

| 参数 | 说明 |
| --- | --- |
| KEYNAME | 指定要创建的key 名称不超过32 字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

使用此命令生成rsa key

**示例**：

```
为KEY1 生成key 字符串:

Switch# configure terminal
Switch(config)# rsa key KEY1 generate
Generating RSA private key, 1024 bit long modulus
Please waiting for a moment: done!
Public exponent is 65537 (0x10001)
Generate RSA key successfully
Switch(config)#
```

**相关命令**：show rsa keys

### 2.8.13 `rsa key`

**功能**：使用此命令创建key 并且进入key 的自定义配置模式。

**语法**：

```
rsa key KEYNAME
```

| 参数 | 说明 |
| --- | --- |
| KEYNAME | 指定要创建的key 名称不超过32 字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

使用此命令生成rsa key

**示例**：

```
创建key1 并进入key1 的自定义配置模式:
Switch# configure terminal
Switch(config)# rsa key KEY1
Switch(config-rsa-key)#
```

**相关命令**：show rsa keys

### 2.8.14 `key format`

**功能**：使用此命令设置生成的key 的格式。

**语法**：

```
key format ( der | pem )
```

| 参数 | 说明 |
| --- | --- |
| der | 设置生成的key 的格式为 der 格式 |
| pem | 设置生成的key 的格式为 pem 格式 |

**命令模式**：RSA key 配置模式

**默认配置**：默认是Der 格式

**使用说明**：

无

**示例**：

```
设置此key 的格式为der 格式:
Switch# configure terminal
Switch(config)# rsa key KEY1
Switch(config-rsa-key)# key format der
```

**相关命令**：rsa key

### 2.8.15 `key string end`

**功能**：退出当前key 配置模式并且应用所有修改。

**语法**：

```
key string end
```

**命令模式**：RSA key 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
退出当前key 配置模式并且应用所有修改:
Switch# configure terminal
Switch(config)# rsa key KEY1
Switch(config-rsa-key)# key string end
Switch(config)#
```

**相关命令**：rsa key

### 2.8.16 `key type`

**功能**：使用此命令设置key 的模式。

**语法**：

```
key type ( public | private )
```

| 参数 | 说明 |
| --- | --- |
| public | 生成公钥 |
| private | 生成私钥 |

**命令模式**：RSA key 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
设置生成公钥:
Switch# configure terminal
Switch(config)# rsa key KEY1
Switch(config-rsa-key)# key type public
```

**相关命令**：rsa key

### 2.8.17 `reset`

**功能**：使用此命令清除在当前key 配置模式中所作的所有修改。

**语法**：

```
reset
```

**命令模式**：RSA key 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
清除在当前key 配置模式中所作的所有修改:
Switch# configure terminal
Switch(config)# rsa key KEY1
Switch(config-rsa-key)# reset
```

**相关命令**：rsa key

### 2.8.18 `validate`

**功能**：使用此命令检查给当前key 的配置是否有效。

**语法**：

```
validate
```

**命令模式**：RSA key 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
检查在当前key 配置模式中所修改的配置是否有效:
Switch# configure terminal
Switch(config)# rsa key KEY1
Switch(config-rsa-key)# validate
```

**相关命令**：rsa key

### 2.8.19 `KEYLINE`

**功能**：使用此命令给当前key 添加密钥内容。

**语法**：

```
KEYLINE
```

| 参数 | 说明 |
| --- | --- |
| KEYLINE | 密钥内容密钥内容字符串 |

**命令模式**：RSA key 配置模式

**默认配置**：无

**使用说明**：

此命令通过直接在屏幕上粘贴密钥文件的内容并设置对应的格式以生成key。

**示例**：

```
粘贴密钥文件内容:
Switch# configure terminal
Switch(config)# rsa key KEY1
Switch(config-rsa-key)# 00302017 4A7D385B 1234EF29 335FC973
Switch(config-rsa-key)# 2DD50A37 C4F4B0FD 9DADE748 429618D5
```

**相关命令**：validate

### 2.8.20 `rsa key export`

**功能**：使用此命令使用指定key 导出密钥文件。

**语法**：

```
rsa key KEYNAME export url DEST_FILE ( public | private ) ( der | der-hex | pem | ssh1 |
ssh2 )
```

| 参数 | 说明 |
| --- | --- |
| KEYNAME | 指定要导出密钥文件所使用的key 不超过32 字符的字符串 |
| DEST_FILE | 指定导出的密钥文件存放的位置完整的文件路径和文件名， 不超过255 字符 |
| public | 导出公钥文件 |
| private | 导出私钥文件 |
| der | der 格式 |
| der-hex | der-hex 格式 |
| pem | pem 格式 |
| ssh1 | ssh1 格式 |
| ssh2 | ssh2 格式 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

指定导出的密钥文件的格式

**示例**：

```
使用key1 生成公钥文件:
Switch# configure terminal
Switch(config)# rsa key KEY1 export url flash:/key1.pub public ssh2
使用key2 生成私钥文件:
Switch# configure terminal
Switch(config)# rsa key KEY2 export url flash:/key1 private ssh1
```

**相关命令**：rsa key generate、rsa key import

### 2.8.21 `rsa key import`

**功能**：使用此命令使用指定密钥文件导入key。

**语法**：

```
rsa key KEYNAME import url SRC_FILE ( public | private ) ( der | der-hex | pem | ssh1 |
ssh2 )
```

| 参数 | 说明 |
| --- | --- |
| KEYNAME | 指定要导入的key 名称不超过32 字符的字符串 |
| SRC_FILE | 指定要使用的密钥文件存放的位置完整的文件路径和文件名， 不超过255 字符 |
| public | 从公钥文件导入key |
| private | 从私钥文件导入key |
| der | der 格式 |
| der-hex | der-hex 格式 |
| pem | pem 格式 |
| ssh1 | ssh1 格式 |
| ssh2 | ssh2 格式 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

通过密钥文件生成密钥key，不能与系统现在存在的key 名称相同，否则提示操作失败。

**示例**：

```
使用key1 公钥文件生成公钥key:
Switch# configure terminal
Switch(config)# rsa key KEY1 import url flash:/key1.pub public ssh2
使用key2 私钥文件生成私钥key:
Switch# configure terminal
Switch(config)# rsa key KEY2 import url flash:/key1 private ssh1
```

**相关命令**：rsa key generate、rsa key export

### 2.8.22 `show rsa key`

**功能**：使用此命令查看key 的详细信息。

**语法**：

```
show rsa key KEYNAME
```

| 参数 | 说明 |
| --- | --- |
| KEYNAME | 要查看的key 名称不超过32 字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看key1 的详细信息:
Switch# show rsa key KEY1
RSA key information:
============================================================
Name: KEY1
Type: private
Modulus: 1024 bit
Usage count: 0
Private key DER code:
30820258
    028180
      9B3E9726 6405BD54 692F172A901F3879 C947366E 5703D282 AA31707F 214D38C9
```

**相关命令**：show rsa keys

### 2.8.23 `show rsa keys`

**功能**：使用此命令查看交换机所有key 的简要信息。

**语法**：

```
show rsa keys
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

查看交换机所有key 的简要信息。

**示例**：

```
查看交换机所有key 的简要信息:
Switch# show rsa keys
Name                              Type     Usage   Modulus
============================================================
key1                              private  0       1024
key2                              public   0       1024
```

**相关命令**：show rsa key、2.9 时间命令


## 2.9 时间命令

### 2.9.1 `clock set datetime`

**功能**：全局配置模式下使用该命令来修改系统时间。

**语法**：

```
clock set datetime HH:MM:SS MONTH DAY YEAR
```

| 参数 | 说明 |
| --- | --- |
| HH:MM:SS | 当前时间 HH 取值范围为0～23, MM 和SS 取值范围为0～59。 |
| MONTH | 设置当前月份范围为1 到12 |
| DAY | 设置当前日期范围为1 到31 |
| YEAR | 设置当前年份范围为1993 到2035 |

**命令模式**：全局配置模式

**默认配置**：缺省为UTC 时间。

**使用说明**：

在需要严格获取绝对时间的应用环境中，必须设定设备当前日期和时钟。

**示例**：

```
将时间日期设置为2014 年7 月23 日，13:32:00:
Switch# configure terminal
Switch(config)# clock set 13:32:00 23 7 2014
```

**相关命令**：show clock

### 2.9.2 `clock set timezone`

**功能**：全局配置模式下使用该命令来修改系统时区。使用该命令的no 形式恢复默认。

**语法**：

```
clock set timezone ZONE ( add | minus ) hours-offset [ minutes-offset ] [ seconds-
offset ]
no clock set timezone
```

| 参数 | 说明 |
| --- | --- |
| ZONE | 设置时区名字时区名字长度必须大于等于 3 并且小于32，同时只支持[a-zA-Z_], 时区名的首字母和末字母不能为”_”. |
| add | 比UTC（Universal Time Coordinated，通用协调时间）标准时间增加 |
| minus | 比UTC 标准时间减少 |
| HOUR_OFFSET | 设置时区的小时偏移量 0-18 |
| MINUTES_OFFSET | 设置时区的分钟偏移量 0-59 |
| SECCONDS_OFFSET | 设置时区的秒偏移量 0-59 |

**命令模式**：全局配置模式

**默认配置**：缺省为UTC 时间。

**使用说明**：

无

**示例**：

```
设置时区名为Canada，比UTC 时间慢3.5 小时:
Switch# configure terminal
Switch(config)# clock set timezone Canada minus 3 30
设置本地时区名称为ZZZ，比UTC 标准时间增加5 小时:
Switch# configure terminal
Switch(config)# clock set timezone ZZZ add 5
```

**相关命令**：show clock (detail)

### 2.9.3 `clock set summer-time`

**功能**：全局配置模式下使用该命令来设置夏令时。使用命令的no 形式恢复默认。

**语法**：

```
clock set summer-time ZONE recurring start-time end-time offset
clock set summer-time ZONE date start-time end-time offset
no clock set summer-time
```

| 参数 | 说明 |
| --- | --- |
| ZONE | 设置时区名字时区名字长度必须大于等于 3 并且小于32，同时只支持[a-zA-Z_], 时区名的首字母和末字母不能为”_”. |
| recurring | 表示对从某一年开始的以后每年的夏令时时间的设置 |
| date | 表示仅对某一年的夏令时时间进行设置 |
| START_TIME | 起始时间和日期对于recurring 模式，格式为month, day, hh:mm:ss 或者(first \| second \| third \| fourth \| last) DAY <1-12> HH:MM:SS，对于date 模式，格式为month, day, |
| year, hh:mm:ss |  |
| END_TIME | 结束时间和日期对于recurring 模式，格式为month, day, hh:mm:ss 或者(first \| second \| third \| fourth \| last) DAY <1-12> HH:MM:SS，对于date 模式，格式为month, day, |
| year, hh:mm:ss |  |
| OFFSET | 增加的时间，以分钟为单位，默认为60 分钟 1-120 分钟 |

**命令模式**：全局配置模式

**默认配置**：夏令时默认不使能。

**使用说明**：

夏令时的第一部分用来说明起始时间和日期，第二部分用来说明结束时间和日期。所
  有的时间都是基于当前时区。开始时间是基于当前的标准时间，而结束时间是基于夏
  令时的。如果设置的开始时间大于结束时间，说明你处于南半球。

**示例**：

```
下面的例子显示了夏令时开始的时间是每年的6 月1 日2 点钟，结束于每年的10 月
31 日2 点钟:
Switch# configure terminal
Switch(config)# clock set summer-time stime recurring 6 1 02:00:00 10 31 02:00:00
下面的例子显示了夏令时开始的时间是每年的3 月的第二个周三2 点钟，结束于每年
的8 月的最后一个周五1 点钟:
Switch# configure terminal
Switch(config)# clock set summer-time stime recurring second Wed 3 02:0:0 last Fri
8 01:0:0 60
```

**相关命令**：show clock (detail)

### 2.9.4 `show clock`

**功能**：显示当前系统的时间和日期。

**语法**：

```
show clock ( detail | )
```

| 参数 | 说明 |
| --- | --- |
| detail | 显示当前时间的时区信息和夏令时信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
这个例子显示了时钟的详细信息:
Switch#show clock detail
10:43:00 beijing Fri Oct 25 2013
Time zone: (GMT + 08:00:00)  beijing
```

**相关命令**：show clock

### 2.9.5 `show timezones`

**功能**：显示所有的时区。

**语法**：

```
show timezons
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
这个例子显示了时区的详细信息:
Switch#show timezones
(GMT+00:06:04)    Europe/Andorra
(GMT+03:41:12)    Asia/Dubai
(GMT+04:36:48)    Asia/Kabul
(GMT-04:07:12)    America/Antigua
(GMT-04:12:16)    America/Anguilla
(GMT+01:19:20)    Europe/Tirane
(GMT+02:58:00)    Asia/Yerevan

(GMT-04:36:00)    America/Curacao
(GMT+00:52:56)    Africa/Luanda
(GMT+11:06:24)    Antarctica/McMurdo    McMurdo Station, Ross Island
============================================================
(GMT+00:00:00)    Antarctica/South_Pole Amundsen-Scott Station, South Pole
(GMT-04:32:32)    Antarctica/Rothera    Rothera Station, Adelaide Island
(GMT-04:16:24)    Antarctica/Palmer     Palmer Station, Anvers Island
```

**相关命令**：show clock、2.10 证书命令


## 2.10 证书命令

### 2.10.1 `generate device identifier`

**功能**：特权模式下使用该命令来生成建立证书所需的设备唯一标识符。

**语法**：

```
generate device identifier ( mgmt-if | ) GURLNAME
generate device identifier ( GFILENAME | )
```

| 参数 | 说明 |
| --- | --- |
| mgmt-if | 管理端口 |
| GURLNAME | 目的URL 地址 |
| GFILENAME | 本地文件名 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于生成交换机的设备唯一标识符(UDI)，使用对应交换机的UDI，可以向设备
  商申请该交换机可用的各类证书。

**示例**：

```
这个例子显示了如何创建UDI:
Switch# generate device identifier mgmt-if tftp://10.10.38.160/device.udi
```

**相关命令**：无

### 2.10.2 `show license`

**功能**：特权模式下使用该命令来显示交换机上的证书。

**语法**：

```
show license ( GFILENAME | )
```

| 参数 | 说明 |
| --- | --- |
| GFILENAME | 本地文件名 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

这个命令用来显示当前设备的证书信息。

**示例**：

```
下面的例子显示了证书信息:
Switch# show lincese
License files:
======================================================================
flash:/ma.lic:
  Created Time: Fri Dec  6 17:22:23 CST 2013
  Vendor:       Vendor1
  Customer:     Customer1
  Device MAC:   00:1E:08:09:03:00
  Feature Set:  QINQ MVR ERPS MEF ETHOAM
                VPWS VPLS HVPLS SMLK TPOAM

                OSPF PIM_SM IGMP VRF MPLS
                LDP BGP RSVP OSPF_TE EXTEND_ACL
                PTP BFD SSM IPV6 OSPF6
                PIM_SM6 MVR6 RIPNG TUNNEL_V6
```

**相关命令**：无、2.11 HTTP 配置命令


## 2.11 HTTP 配置命令

### 2.11.1 `service http`

**功能**：本命令enable 参数可让交换机启用HTTP 服务，使用disable 参数关闭HTTP 服务。

**语法**：

```
service http ( enable | disable )
```

| 参数 | 说明 |
| --- | --- |
| enable | 开启HTTP 服务 |
| disable | 关闭HTTP 服务 |

**命令模式**：全局配置模式

**默认配置**：关闭

**使用说明**：

使能HTTP 服务需要先加载WEB 镜像。

**示例**：

```
下面的例子展示了如何使能HTTP 服务:
Switch# configure terminal
Switch(config)# service http enable
```

**相关命令**：http server load、http timeout

### 2.11.2 `service https`

**功能**：本命令enable 参数可让交换机启用HTTPS 服务，disable 参数关闭HTTPS 服务。

**语法**：

```
service https ( enable | disable )
```

| 参数 | 说明 |
| --- | --- |
| enable | 开启HTTPS 服务 |
| disable | 关闭HTTPS 服务 |

**命令模式**：全局配置模式

**默认配置**：关闭

**使用说明**：

使能HTTPS 服务需要先加载WEB 镜像。

**示例**：

```
下面的例子展示了如何使能HTTPS 服务:
Switch# configure terminal
Switch(config)# service https enable
```

**相关命令**：http server load、http timeout

### 2.11.3 `http server load`

**功能**：本命令用来加载WEB 镜像。

**语法**：

```
http server load FILENAME
```

| 参数 | 说明 |
| --- | --- |
| FILENAME | WEB 镜像名称 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子展示了如何指定WEB 镜像:
Switch# configure terminal
Switch(config)# http server load flash:/webImage.bin
```

**相关命令**：service http enable、service https enable、http timeout

### 2.11.4 `http server secure-certificate load`

**功能**：本命令为https 服务加载证书

**语法**：

```
http server secure-certificate load GFILENAME
```

| 参数 | 说明 |
| --- | --- |
| GFILENAME | 证书路径名称 |

**命令模式**：全局配置模式

**默认配置**：https 加载系统默认证书

**使用说明**：

无

**示例**：

```
下面的例子展示了如何指定SSL 证书:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# http server secure-certificate load flash:/server.pem
```

**相关命令**：service https enable

### 2.11.5 `http timeout`

**功能**：配置Web 服务器的超时时间。

**语法**：

```
http timeout TIMEOUT
```

| 参数 | 说明 |
| --- | --- |
| TIMEOUT | 指定在线用户的Web 服务器超时时间。 取值范围是1～60，单位是分钟。 |

**命令模式**：全局配置模式

**默认配置**：20 分钟

**使用说明**：

无

**示例**：

```
下面的例子展示了如何配置Web 服务器的超时时间:
Switch# configure terminal
Switch(config)# http timeout 30
```

**相关命令**：http server load、service http enable、service https enable

### 2.11.6 `http server source address`

**功能**：配置Web 服务器的源地址。

**语法**：

```
http server source address ( vrf NAME | ) A.B.C.D
no http server source address
```

| 参数 | 说明 |
| --- | --- |
| vrf NAME | 指定提供web 服务的rvf 不超过31 个字符 |
| A.B.C.D | 配置带内web 服务器的源 IP 地址 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

该命令可以修改web 服务器默认的源地址，并可以指定提供web 服务的vrf。源地址
  只能是loopback 口的地址或者0.0.0.0，当配置为0.0.0.0 表示不指定ip 作为web 服务
  器地址。

**示例**：

```
下面的例子展示了如何设置带内http 服务器的地址:
Switch# configure terminal
Switch(config)# http server source address  10.10.10.1
```

**相关命令**：http server load、service http enable、service https enable

### 2.11.7 `http server source port`

**功能**：配置带内HTTP 服务的源端口。

**语法**：

```
http server source port PORT
no http server source port
```

| 参数 | 说明 |
| --- | --- |
| PORT | HTTP 源端口 1025-65535 |

**命令模式**：全局配置模式

**使用说明**：

no http server source port 会配置带内口HTTP 服务端口号为80

**示例**：

```
下面的例子展示了如何设置带内http 服务器的TCP 端口:
Switch# configure terminal
Switch(config)# http server source port 1080
```

**相关命令**：http server load、service http enable、service https enable

### 2.11.8 `http server source ssl-port`

**功能**：配置带内HTTPS 服务的源端口。

**语法**：

```
http server source ssl-port PORT
no http server source ssl-port
```

| 参数 | 说明 |
| --- | --- |
| PORT | HTTPS 源端口 1025-65535 |

**命令模式**：全局配置模式

**使用说明**：

no http server source ssl-port 会配置带内口HTTPS 服务端口号为443

**示例**：

```
下面的例子展示了如何设置带内https 服务器的TCP 端口:

Switch# configure terminal
Switch(config)# http server source port 10443

Switch# configure terminal
Switch(config)# http server source ssl-port 10443
```

**相关命令**：http server load、service http enable、service https enable

### 2.11.9 `http server source mgmt-if port`

**功能**：配置带外HTTP 服务的源端口。

**语法**：

```
http server source mgmt-if port PORT
no http server source mgmt-if port
```

| 参数 | 说明 |
| --- | --- |
| PORT | 管理口HTTP 源端口 1025-65535 |

**命令模式**：全局配置模式

**使用说明**：

no http server source mgmt-if port 会配置带外口HTTP 服务端口号为80

**示例**：

```
下面的例子展示了如何设置带外http 服务器的TCP 端口:
Switch# configure terminal
Switch(config)# http server source mgmt-if port 1080
```

**相关命令**：http server load、service http enable、service https enable

### 2.11.10 `http server source mgmt-if ssl-port`

**功能**：配置带外HTTPS 服务的源端口。

**语法**：

```
http server source mgmt-if ssl-port PORT
no http server source mgmt-if port
```

| 参数 | 说明 |
| --- | --- |
| PORT | 管理口HTTPS 源端口 1025-65535 |

**命令模式**：全局配置模式

**使用说明**：

no http server source mgmt-if ssl-port 会配置带外口HTTPS 服务端口号为443

**示例**：

```
下面的例子展示了如何设置带外https 服务器的TCP 端口:
Switch# configure terminal
Switch(config)# http server source port 10443
```

**相关命令**：http server load、service http enable、service https enable

### 2.11.11 `http server ssl minimum-version`

**功能**：该命令用于配置https 服务所用的TLS 最小版本。使用该命令的no 形式能可以恢复默
  认值。

**语法**：

```
http server ssl minimum-version ( tls-1-0 | tls-1-1 | tls-1-2 )
no http server ssl minimum-version
```

| 参数 | 说明 |
| --- | --- |
| tls-1-0 |  |
| TLSv1.0 |  |
| tls-1-1 |  |
| TLSv1.1 |  |
| tls-1-2 |  |
| TLSv1.2 |  |

**命令模式**：全局配置模式

**默认配置**：tls-1-2

**使用说明**：

http server ssl minimum-version 配置直到重启https 服务后才会生效

**示例**：

```
下面的例子展示了如果设置TLS 最小版本:
DUT1(config)# http server ssl minimum-version tls-1-1
```

**相关命令**：service https enable

### 2.11.12 `http authentication aaa`

**功能**：配置web 登录使用AAA 认证授权的方法。

**语法**：

```
http authentication ( local | aaa ( login-authentication | exec-authorization ) ( default |
LISTNAME ) )
no http authentication ( aaa ( login-authentication | exec-authorization ) )
```

| 参数 | 说明 |
| --- | --- |
| local | 设置认证方式为local |
| aaa | 设置认证方式为AAA |
| login-authentication | 设置认证方法列表 |
| exec-authorization | 设置授权方法列表 |
| default | 设置AAA 认证方法列表为 |
| default |  |
| LISTNAME | 设置AAA 认证方法列表为某listname 不超过31 字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：默认为local 认证

**使用说明**：

http authentication (local |aaa (login-authentication|exec-authorization)
  (default|LISTNAME))只能在AAA 使能后才能配置。

**示例**：

```
下面的例子展示了如何设置web 登录认证方法列表为default:
Switch# configure terminal
Switch(config)# http authentication aaa login-authentication default
```

**相关命令**：aaa new-model、aaa authentication login、aaa authorization exec

### 2.11.13 `show services http`

**功能**：使用此命令查看HTTP 配置信息。

**语法**：

```
show services http
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
使用此命令查看HTTP 配置信息:
Switch# show services http
HTTP service configuration:
 Service HTTP                            : disable
 Service HTTPS                           : disable
 HTTP Timeout                            : 20
 HTTP Server Source Address              : 0.0.0.0
 HTTP Server Source Port                 : 80
 HTTP Server Source Mgmt-if Port         : 80
 HTTP Server Source SSL-port             : 443
 HTTP Server Source Mgmt-if SSL-port     : 443
```

**相关命令**：无、、2.12 RPC-API 配置命令


## 2.12 RPC-API 配置命令

### 2.12.1 `service rpc-api`

**功能**：本命令enable 参数可让交换机启用RPC-API 服务。使用disable 参数关闭RPC-API 服
  务。

**语法**：

```
service rpc-api ( enable ( port PORT | ssl ( ssl-port SSLPORT | ) | ) ( vrf NAME | )
( connect-timeout <10-300> | ) | disable )
service rpc-api disable
```

| 参数 | 说明 |
| --- | --- |
| enable | 使能RPC-API 服务 |
| disable | 去使能RPC-API 服务 |
| PORT | RPC-API 使用HTTP，默认TCP 端口为80 1025-65535 |
| vrf NAME | 指定VRF 不超过31 个字符 |
| ssl | RPC-API 使用HTTPS |
| SSLPORT | RPC-API 使用HTTPS，默认TCP 端口443 1025-65535 |
| connect-timeout | RPC-API 长连接模式 |
| TIMEOUT | RPC-API 长连接超时时间 10-300 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
使能rpc api 服务，并指定端口:

Switch# configure terminal
Switch(config)# service rpc-api enable port 2000
```

**相关命令**：show services rpc-api、service rpc-api auth-mode

### 2.12.2 `service rpc-api auth-mode`

**功能**：本命令可让交换机启用RPC-API 的HTTP 基本认证。

**语法**：

```
service rpc-api auth-mode basic
no service rpc-api auth-mode
```

**命令模式**：全局配置模式

**默认配置**：关闭

**使用说明**：

使能或者去使能RPC-API 的HTTP 基本认证功能，如果需要继续使用RPC-API 则需要
  重新使能一下RPC-API 服务。

**示例**：

```
使能http 基础认证:
Switch# configure terminal
Switch(config)# service rpc-api auth-mode basic
```

**相关命令**：service rpc-api enable、show services rpc-api

### 2.12.3 `show services rpc-api`

**功能**：本命令可查看交换机启上RPC-API 的服务配置。

**语法**：

```
show services rpc-api
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch(config)# show services rpc-api
RPC API services configuration:
HTTP server:    shutdown, port: 80, authentication mode: none
```

**相关命令**：service rpc-api enable、2.13 DIAG 命令


## 2.13 DIAG 命令

### 2.13.1 `diagnostic-information discard`

**功能**：diagnostic-information discard enable 用于打开diagnostic-information discard 功能。

**语法**：

```
diagnostic-information discard enable
no diagnostic-information discard enable
```

| 参数 | 说明 |
| --- | --- |
| enable | 使能字符串enablel。 |

**命令模式**：全局配置模式

**默认配置**：diagnostic-information discard 功能关闭

**使用说明**：

用以使能diagnostic-information discard 功能。

**示例**：

```
如下示例，使用命令diagnostic-information discard enable 使能diagnostic-
information discard 功能:
Switch(config)# diagnostic-information discard enable
如下示例，使用命令no diagnostic-information discard enable 关闭diagnostic-
information discard 功能:
Switch(config)# no diagnostic-information discard enable
```

**相关命令**：N/A

### 2.13.2 `show diagnostic-information discard`

**功能**：show diagnostic-information discard 用于显示系统丢包情况。

**语法**：

```
show diagnostic-information discard
clear diagnostic-information discard
```

| 参数 | 说明 |
| --- | --- |
| discard | 丢包字符串discard。 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

用以显示设备丢包功能。

**示例**：

```
如下示例，使用命令show diagnostic-information discard 显示设备所丢包情况:
Switch# show diagnostic-information discard
Diagnostic-Information Discard:
Drop-Reason                    Description
------------------------------+------------------------------------
CTC_DROP_TTL_CHK               TTL check fail
CTC_DROP_ACL_DENY              Acl deny
CTC_DROP_PKT_ERR               Packet check error
CTC_DROP_ISOLATE_CHK           Port isolate check fail
CTC_DROP_TRANSIT_DISABLE       Transit disable
CTC_DROP_IP_CHK                Ip address or packet check fail
CTC_DROP_VLAN_FILTER           Vlan filtering
CTC_DROP_STP_CHK               Stp check fail
CTC_DROP_CHKSUM_ERR            Checksum error
CTC_DROP_PARSER_ERR            Parser error
CTC_DROP_TRAFFIC_MANAGER       Trafic manager check fail
CTC_DROP_NET_RX                Netrx check fail
CTC_DROP_NET_TX                Nettx check fail
Others                         Other drop reasons
如下示例，使用命令clear interface queue discard 清除设备所有interface queue 的丢
包情况:
Switch# clear diagnostic-information discard
```

**相关命令**：N/A、、3 以太网命令、3.1 接口命令

