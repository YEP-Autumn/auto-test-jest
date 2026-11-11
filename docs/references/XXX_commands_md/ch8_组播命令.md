# 8 组播命令

## 8.1 组播路由命令

### 8.1.1 `ip multicast-routing`

**功能**：使用此命令启用交换机的多播路由功能。使用关键字no 禁用此功能。

**语法**：

```
ip multicast-routing
no ip multicast-routing
```

**命令模式**：全局配置模式

**默认配置**：开启

**使用说明**：

无

**示例**：

```
启用交换机的多播路由功能:
Switch# configure terminal
Switch(config)# ip multicast-routing
禁用交换机的多播路由功能:
Switch# configure terminal
Switch(config)# no ip multicast-routing
```

**相关命令**：无

### 8.1.2 `ip multicast route-limit`

**功能**：使用此命令设置组播路由的最大数目。使用关键字no 恢复此项设置为默认值。

**语法**：

```
ip multicast route-limit ROUTE_NUMBER ( THRESHOLD_NUMBER | )
no ip multicast route-limit
```

| 参数 | 说明 |
| --- | --- |
| ROUTE_NUMBER | 组播路由的最大数目 1-2048 |
| THRESHOLD_NUMBER | 超过阈值时生成警告消息， 这个阈值应小于或等于组播路由的最大数量 1-2048 |

**命令模式**：全局配置模式

**默认配置**：默认组播路由最大数目为2048。 默认阈值应为组播路由的最大数量相同。

**使用说明**：

无

**示例**：

```
设置组播路由的最大数目为512:
Switch# configure terminal
Switch(config)# ip multicast route-limit 512
设置组播路由的最大数目为默认值.:
Switch# configure terminal
Switch(config)# no ip multicast route-limit
```

**相关命令**：show ip mroute route-limit

### 8.1.3 `show ip mroute`

**功能**：使用此命令查看多播路由表。

**语法**：

```
show ip mroute ( sparse | ) ( count | summary | )
show ip mroute IP_ADDR ( sparse | ) ( count | summary | )
show ip mroute route-limit
```

| 参数 | 说明 |
| --- | --- |
| sparse | 查看稀疏模式的多播路由 |
| count | 查看路由和数据包的统计情况 |
| summary | 查看多播路由的总体情况 |
| IP_ADDR | 源IP 地址或者组播IP 地址；查看此地址的路由 IPv4 地址 |
| route-limit | 查看路由数目的最大值 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示组播路由表信息:
Switch# show ip mroute
IP Multicast Routing Table
Flags: I - Immediate Stat, T - Timed Stat, F - Forwarder installed

Timers: Uptime/Stat Expiry
Interface State: Interface (TTL)
(10.0.1.20, 228.1.1.1), uptime 00:35:46, stat expires 00:02:19
Owner PIM-SM, Flags: TF
  Incoming interface: eth-0-1
  Outgoing interface list:
    eth-0-2 (1)
下面例子显示组播路由表总体信息:
Switch# show ip mroute summary
IP Multicast Routing Table
Flags: I - Immediate Stat, T - Timed Stat, F - Forwarder installed
Timers: Uptime/Stat Expiry
Interface State: Interface (TTL)
(10.0.1.20, 228.1.1.1), 00:36:59/00:02:46, PIM-SM, Flags: TF
```

**相关命令**：ip multicast route-limit、ip mroute-rpf

### 8.1.4 `show ip mvif`

**功能**：使用此命令查看IP 的多播接口信息。

**语法**：

```
show ip mvif ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子查看所有多播接口信息:
Switch# show ip mvif
Interface Vif   Owner                   TTL  Local            Remote
Uptime
          Idx   Module                       Address          Address
eth-0-1   0     PIM-SM                  1    10.0.1.1         0.0.0.0
00:42:56
eth-0-2   2     PIM-SM                  1    10.0.2.1         0.0.0.0
00:42:53
```

**相关命令**：ip pim sparse-mode

### 8.1.5 `show ip multicast groups count`

**功能**：此命令用于显示组播组数目。

**语法**：

```
show ip multicast groups count
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示当前的组播组数目:
Switch# show ip multicast groups count
multicast group record count:  1
multicast source record count: 0
multicast total record count:  1
multicast max record count:    2048
```

**相关命令**：无

### 8.1.6 `show resource mcast`

**功能**：此命令用于显示组播路由资源使用情况。

**语法**：

```
show resource mcast
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示组播路由资源使用情况:
Switch# show resource mcast
MCAST
Resource                         Used          Capability
=============================================================
Mcast Entry                      0             1023
Mcast Normal Member              0             2046
Mcast Vlan Member                0             1023
```

**相关命令**：无

### 8.1.7 `clear ip mroute`

**功能**：此命令清除组播路由表项。

**语法**：

```
clear ip mroute ( * | GRP_ADDR ( SRC_IP ) | )
```

| 参数 | 说明 |
| --- | --- |
| GRP_ADDR | 指定组播组路由 IPv4 地址 |
| SRC_ADDR | 指定组播源路由 IPv4 地址 * 所有的组播组信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示如何删除所有的组播路由信息:
Switch# clear ip mroute *
```

**相关命令**：show ip mroute、8.2 IGMP 命令


## 8.2 IGMP 命令

### 8.2.1 `ip igmp access-group`

**功能**：此命令根据访问控制列表对加入组播组的主机或可以加入的组播组进行限制。使用关
  键字no 取消此种限制。

**语法**：

```
ip igmp access-group LIST

no ip igmp access-group
```

| 参数 | 说明 |
| --- | --- |
| LIST | 访问控制列表名称不超过40 个字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

假如ACE 的行为是拒绝, 数据包将会被忽略; 此外, ACE 的行为如果允许的话,那么数据
  包正常转发。

**示例**：

```
在VLAN1 的端口上根据访问控制列表acl1 对可加入组播组的主机和可加入的组播组进
行限制:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ip igmp access-group acl1
取消在VLAN1 的端口上的限制:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ip igmp access-group
```

**相关命令**：show ip igmp interface

### 8.2.2 `ip igmp immediate-leave group-list`

**功能**：此命令根据访问控制列表限制可快速离开的主机和主机可快速离开的组播组。使用关
  键字no 取消此种限制。

**语法**：

```
ip igmp immediate-leave group-list LIST
no ip igmp immediate-leave
```

| 参数 | 说明 |
| --- | --- |
| LIST | 访问控制列表名称不超过40 个字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

假如ACE 的行为是拒绝, 数据包将会被忽略; 此外, ACE 的行为如果允许的话,那么数据
  包正常转发。

**示例**：

```
在VLAN1 端口上限制可快速离开的主机和主机可快速离开的组播组:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ip igmp immediate-leave group-list acl1
在VLAN1 端口上取消此种限制:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ip igmp immediate-leave group-list
```

**相关命令**：show ip igmp interface

### 8.2.3 `ip igmp last-member-query-count`

**功能**：使用此命令设置当组播组的最后一个成员离开后所发送的特定组查询报文的数量；如
  果在发送完所有的成员查询报文后，仍然没有收到成员报告报文，则端口会退出此多
  播组。使用关键字no 恢复成员查询报文的数量为默认值。

**语法**：

```
ip igmp last-member-query-count COUNT
no ip igmp last-member-query-count
```

| 参数 | 说明 |
| --- | --- |
| COUNT | 特定组查询报文的数目 2-7 |

**命令模式**：端口配置模式

**使用说明**：

无

**示例**：

```
设置发送成员查询报文的最大数目为5:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ip igmp last-member-query-count 5
恢复发送成员查询报文的数目为默认值:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ip igmp last-member-query-count
```

**相关命令**：show ip igmp interface、ip igmp last-member-query-interval

### 8.2.4 `ip igmp last-member-query-interval`

**功能**：使用此命令设置当组播组的最后一个成员离开后，发送特定组查询报文的间隔。使用
  关键字no 恢复此间隔为默认值。

**语法**：

```
ip igmp last-member-query-interval INTERVAL
no ip igmp last-member-query-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 特定组查询报文的间隔 (毫秒) 1000-25500 毫秒 |

**命令模式**：端口配置模式

**默认配置**：1000 毫秒

**使用说明**：

无

**示例**：

```
设置端口发送组成员查询报文的时间间隔是10000ms:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ip igmp last-member-query-interval 10000
恢复端口发送组成员查询报文的时间间隔默认值:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ip igmp last-member-query-interval
```

**相关命令**：show ip igmp interface、ip igmp last-member-query-count

### 8.2.5 `ip igmp limit`

**功能**：使用此命令设置全局或端口上可加入的组播组的最大个数。使用关键字no 恢复此设置
  为默认值。

**语法**：

```
ip igmp limit NUMBER except LIST
no ip igmp limit
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | 全局或端口上可加入的组播组的最大个数 1-2048 |
| LIST | 组播组在这个访问控制列表中时不做数目限制 |
| Up to 40 characters |  |

**命令模式**：全局配置模式 端口配置模式

**使用说明**：

默认情况下，端口可加入的组播组的最大数目是2048。
  在全局配置模式下，设置所有端口可加入的组播组的最大数目。
  在端口配置模式下，设置此端口可加入的组播组的最大数目。

**示例**：

```
设置所有端口可加入的组播组的最大个数为1000:
Switch# configure terminal
Switch(config)# ip igmp limit 1000
设置所有端口可加入的组播组的最大个数为默认值:
Switch# configure terminal
Switch(config)# no ip igmp limit
```

**相关命令**：show ip igmp interface

### 8.2.6 `ip igmp mroute-proxy`

**功能**：使用此命令设置本端口的IGMP 代理的上行端口。

**语法**：

```
ip igmp mroute-proxy IFNAME

no ip igmp mroute-proxy
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 端口名称，指定的上行端口 支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

一个端口只能设置一个上行代理端口。多次设置时，后面的设置会覆盖前面的设置。

**示例**：

```
设置本端口的上行代理端口为eth-0-1:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ip igmp mroute-proxy eth-0-1
删除本端口的上行代理端口:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ip igmp mroute-proxy
```

**相关命令**：ip igmp proxy-service

### 8.2.7 `ip igmp proxy-service`

**功能**：使用此命令启用端口的IGMP 代理服务。使用关键字no 关闭此服务。

**语法**：

```
ip igmp proxy-service
no ip igmp proxy-service
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

此命令与ip igmp mroute-proxy 配合使用，用来设定交换机的IGMP 代理上联口。

**示例**：

```
启用此端口的IGMP 代理服务的上联口:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ip igmp proxy-service
关闭此此端口作为IGMP 代理服务的上联口:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ip igmp proxy-service
```

**相关命令**：ip igmp mroute-proxy

### 8.2.8 `ip igmp querier-timeout`

**功能**：使用此命令设置Querier 的超时时间。使用关键字no 恢复此超时时间为默认值。

**语法**：

```
ip igmp querier-timeout INTERVAL
no ip igmp querier-timeout
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 超时时间，以秒为单位 60-300 秒 |

**命令模式**：端口配置模式

**默认配置**：255 秒

**使用说明**：

无

**示例**：

```
设置Querier 的超时时间为100 秒:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ip igmp querier-timeout 100
恢复Querier 的超时时间为默认值:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if) #no ip igmp querier-timeout
```

**相关命令**：ip igmp query-interval、ip igmp query-max-response-time

### 8.2.9 `ip igmp query-interval`

**功能**：使用此命令设置端口发送Querier 查询报文的时间间隔。使用关键字no 恢复此时间间
  隔为默认值。

**语法**：

```
ip igmp query-interval INTERVAL
no ip igmp query-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 端口发送Querier 查询报文的时间间隔，以秒为单位 2-18000 |

**命令模式**：端口配置模式

**默认配置**：125 秒

**使用说明**：

无

**示例**：

```
设置发送Querier 查询报文的时间间隔为300 秒:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ip igmp query-interval 300
恢复发送Querier 查询报文的时间间隔为默认值:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ip igmp query-interval
```

**相关命令**：ip igmp querier-timeout、ip igmp query-max-response-time

### 8.2.10 `ip igmp query-max-response-time`

**功能**：使用此命令设置查询报文的最大响应时间；要求成员在此时间范围内必须响应一个报
  告消息。使用关键字no 恢复此最大响应时间为默认值。

**语法**：

```
ip igmp query-max-response-time INTERVAL
no ip query-max-response-time
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 查询报文的最大响应时间， 以秒为单位 1-25 |

**命令模式**：端口配置模式

**默认配置**：10 秒

**使用说明**：

必须小于igmp query interval 的时间。

**示例**：

```
设置查询报文的最大响应时间为20 秒:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ip igmp query-max-response-time 20
恢复此最大响应时间为默认值:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ip igmp query-max-response-time
```

**相关命令**：ip igmp querier-timeout、ip igmp query-interval

### 8.2.11 `ip igmp robustness-variable`

**功能**：使用此命令设置IGMP 查询器的健壮系数。使用关键字no 恢复此项设置为默认值。

**语法**：

```
ip igmp robustness-variable VALUE
no ip robustness-variable
```

| 参数 | 说明 |
| --- | --- |
| VALUE | 设定IGMP 报文的健壮程度 2-7 |

**命令模式**：端口配置模式

**使用说明**：

无

**示例**：

```
设置IGMP 查询器的健壮系数为6:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ip igmp robustness-variable 6
恢复此设置到默认值:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ip igmp robustness-variable
```

**相关命令**：show ip igmp interface

### 8.2.12 `ip igmp version`

**功能**：使用此命令设定端口使用的IGMP 协议的版本。使用关键字no 恢复端口所使用的版本
  为默认值。

**语法**：

```
ip igmp version VER
no ip igmp version
```

| 参数 | 说明 |
| --- | --- |
| VER | 设置端口使用的IGMP 协议版本 1-3 |

**命令模式**：端口配置模式

**使用说明**：

无

**示例**：

```
设定端口使用的IGMP 协议的版本为version 1:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ip igmp version 1
设定端口使用的IGMP 协议的版本为默认值:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ip igmp version
```

**相关命令**：show ip igmp interface

### 8.2.13 `ip igmp static-group`

**功能**：此命令用来设置端口上的静态组播组。使用关键字no 删除端口配置的静态组播组。

**语法**：

```
ip igmp static-group GRP_ADDR ( source SRC_ADDR | )
no ip igmp static-group GRP_ADDR ( source SRC_ADDR | )
```

| 参数 | 说明 |
| --- | --- |
| GRP_ADDR | 组播组地址 IPv4 地址 |
| SRC_ADDR | 组播源地址 IPv4 地址 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子说明如何在接口上配置静态组播组。:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ip igmp static-group 226.1.2.3
Switch(config-if)# ip igmp static-group 226.1.2.4 source 1.2.3.4
下面的例子说明如何删除接口上配置的静态组播组。:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no ip igmp static-group 226.1.2.3
```

**相关命令**：show ip igmp groups

### 8.2.14 `ip igmp ssm-map enable`

**功能**：此命令用来使能IGMP ssm-mapping 功能。使用关键字no 禁用此功能。

**语法**：

```
ip igmp ssm-map enable
no ip igmp ssm-map enable
```

**命令模式**：全局配置模式

**默认配置**：关闭

**使用说明**：

无

**示例**：

```
使能IGMP ssm-mapping 功能:

Switch# configure terminal
Switch(config)# ip igmp ssm-map enable
关闭IGMP ssm-mapping 功能:
Switch# configure terminal
Switch(config)# no ip igmp ssm-map enable
```

**相关命令**：无

### 8.2.15 `ip igmp ssm-map static`

**功能**：此命令用来设置IGMP ssm-mapping 的规则。使用关键字no 删除ssm-mapping 规则。

**语法**：

```
ip igmp ssm-map static LIST SRC_ADDR
no ip igmp ssm-map static LIST SRC_ADDR
```

| 参数 | 说明 |
| --- | --- |
| LIST | 访问控制列表，指定组播组范围不超过40 个字符的字符串 |
| SRC_ADDR | 组播源地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
设置在ipacl 中的group 映射的source 地址为192.168.1.1:
Switch# configure terminal
Switch(config)# ip igmp ssm-map static ipacl 192.168.1.1
取消在ipacl 中的group 的映射的source 地址为192.168.1.1:

Switch# configure terminal
Switch(config)# no ip igmp ssm-map static ipacl 192.168.1.1
```

**相关命令**：无

### 8.2.16 `clear ip igmp`

**功能**：此命令清除动态学习的组播组信息。

**语法**：

```
clear ip igmp group ( * | GRP_ADDR | )
```

| 参数 | 说明 |
| --- | --- |
| GRP_ADDR | 指定组播组地址 IPv4 地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示如何删除所有的组播组信息:
Switch# clear ip igmp
Switch# clear ip igmp group *
下面例子显示如何删除组播组228.1.1.1:
Switch# clear ip igmp group 228.1.1.1
```

**相关命令**：show ip igmp groups

### 8.2.17 `clear ip igmp interface`

**功能**：此命令清除指定端口上动态学习的组播组信息。

**语法**：

```
clear ip igmp interface IFNAME
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 指定接口名称支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示如何清除端口eth-0-1 上动态组播组信息:
Switch# clear ip igmp group interface eth-0-1
```

**相关命令**：show ip igmp groups

### 8.2.18 `show ip igmp groups`

**功能**：此命令用于显示组播组信息。

**语法**：

```
show ip igmp groups GRP_ADDR ( detail | )
```

| 参数 | 说明 |
| --- | --- |
| GRP_ADDR | 指定组播组地址 IPv4 地址 |
| detail | 组播组详细信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示组播组的详细信息:
Switch# show ip igmp groups detail
Interface:      eth-0-1
Group:          227.0.0.1
Uptime:         00:00:33
Group mode:     Exclude (Expires: 00:04:18)
Last reporter:  10.0.1.100
Source list is empty
```

**相关命令**：无

### 8.2.19 `show ip igmp groups interface`

**功能**：此命令用于显示端口的IPv6 组播组信息。

**语法**：

```
show ip igmp groups IFNAME ( GRP_ADDR | ) ( detail | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |
| GRP_ADDR | 指定组播组地址 IPv4 地址 |
| detail | 组播组详细信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示接口eth-0-1 上的组播组信息:
Switch# show ip igmp groups eth-0-1
IGMP Connected Group Membership
Group Address    Interface            Uptime   Expires  Last Reporter
227.0.0.1        eth-0-1              00:01:11 00:04:16 10.0.1.100
```

**相关命令**：无

### 8.2.20 `show ip igmp groups count`

**功能**：此命令用于显示组播组数目。

**语法**：

```
show ip igmp groups ( IFNAME | ) count
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示端口eth-0-1 上的组播组数目:
Switch# show ip igmp groups eth-0-1 count
Dynamic multicast groups count: 1
Static multicast groups count: 0
Total multicast groups count: 1
```

**相关命令**：无

### 8.2.21 `show ip igmp interface`

**功能**：此命令用于查看组播组端口的信息。

**语法**：

```
show ip igmp interface ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看端口eth-0-1 的组播设置信息:
Switch# show ip igmp interface eth-0-1
Interface eth-0-1 (Index 1)
 IGMP Enabled, Active, Querier, Version 2 (default)
 Internet address is 10.0.1.1
 IGMP interface limit is 8192
 IGMP interface has 1 group-record states
 IGMP activity: 97 joins, 0 leaves
 IGMP query interval is 125 seconds
 IGMP querier timeout is 255 seconds
 IGMP max query response time is 10 seconds
 Last member query response interval is 1000 milliseconds
 Group Membership interval is 260 seconds
 Last memeber query count is 2
 Robustness Variable is 2
```

**相关命令**：无、8.3 IGMP Snooping 命令


## 8.3 IGMP Snooping 命令

### 8.3.1 `ip igmp snooping`

**功能**：使用此命令启用IGMP Snooping 。使用关键字no 关闭此项功能。

**语法**：

```
ip igmp snooping ( vlan VLAN_ID | )
no ip igmp snooping ( vlan VLAN_ID | )
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：全局配置模式

**默认配置**：使能

**使用说明**：

在全局配置模式下或者VLAN 模式下启用Igmp Snooping。
  默认，igmp snooping 启用。

**示例**：

```
全局启用IGMP Snooping 功能:
Switch# configure terminal
Switch(config)# ip igmp snooping
全局关闭IGMP Snooping 功能:
Switch# configure terminal
Switch(config)# no ip igmp snooping
在vlan10 上启用IGMP Snooping 功能:
Switch# configure terminal
Switch(config)# ip igmp snooping vlan 10
在vlan10 上关闭IGMP Snooping 功能:
Switch# configure terminal
Switch(config)# no ip igmp snooping vlan 10
```

**相关命令**：show ip igmp snooping

### 8.3.2 `ip igmp snooping fast-leave`

**功能**：使用此命令启用IGMP snooping 成员快速离开功能。使用关键字no 关闭此功能。

**语法**：

```
ip igmp snooping ( vlan VLAN_ID | ) fast-leave
no ip igmp snooping ( vlan VLAN_ID | ) fast-leave
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：全局配置模式

**默认配置**：关闭

**使用说明**：

此命令会覆盖immediate-leave 的设置。

**示例**：

```
启用成员快速离开功能:
Switch# configure terminal
Switch(config)# ip igmp snooping fast-leave
关闭成员快速离开功能:
Switch# configure terminal
Switch(config)# no ip igmp snooping fast-leave
```

**相关命令**：show ip igmp snooping global

### 8.3.3 `ip igmp snooping last-member-query-interval`

**功能**：使用此命令设置当仅存最后一个成员时的查询间隔。使用关键字no 恢复查询间隔为默
  认值。

**语法**：

```
ip igmp snooping ( vlan VLAN_ID | ) last-member-query-interval INTERVAL
no ip igmp snooping ( vlan VLAN_ID | ) last-member-query-interval
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| INTERVAL | 查询间隔，单位为毫秒 1000-25500 毫秒 |

**命令模式**：全局配置模式

**默认配置**：1000 毫秒

**使用说明**：

支持每个Vlan 单独配置或者全局配置，默认为1000 毫秒

**示例**：

```
设置当仅存最后一个成员时的查询间隔:
Switch# configure terminal
Switch(config)# ip igmp snooping last-member-query-interval 2000
恢复查询间隔为默认值:
Switch# configure terminal
Switch(config)# no ip igmp snooping last-member-query-interval
```

**相关命令**：show ip igmp snooping、show ip igmp snooping vlan

### 8.3.4 `ip igmp snooping global source-address`

**功能**：使用此命令设置IGMP snooping 查询器源地址。

**语法**：

```
ip igmp snooping global source-address IP_ADDR
no ip igmp snooping global source-address
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 查询器源IP 地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：0.0.0.0

**使用说明**：

VLAN 上没有配置查询器源地址时使用全局的查询器地址，VLAN 上配置了查询器地址
  后使用VLAN 上配置的查询器地址。

**示例**：

```
全局配置模式下配置查询器源IP 地址 1.3.4.5:
Switch# configure terminal
Switch(config)# ip igmp snooping global source-address 1.3.4.5
恢复全局配置模式的查询器地址:
Switch# configure terminal
Switch(config)# no ip igmp snooping global source-address
```

**相关命令**：show ip igmp snooping querier

### 8.3.5 `ip igmp snooping max-member-num`

**功能**：使用此命令设置IGMP snooping 最大成员数目。使用关键字no 恢复此数目为默认值。

**语法**：

```
ip igmp snooping ( vlan VLAN_ID | ) max-member-num NUMBER
no ip igmp snooping ( vlan VLAN_ID | ) max-member-num
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| NUMBER | 最大成员数目 1-8192 |

**命令模式**：全局配置模式

**使用说明**：

无

**示例**：

```
设置IGMP snooping 最大成员数目为1024 :

Switch# configure terminal
Switch(config)# ip igmp snooping max-member-num 1024
恢复IGMP snooping 最大成员数目为默认值:
Switch# configure terminal
Switch(config)# no ip igmp snooping max-member-num
```

**相关命令**：show ip igmp snooping global、show ip igmp snooping vlan

### 8.3.6 `ip igmp snooping query-interval`

**功能**：使用此命令设置成员查询的间隔。使用关键字no 恢复此间隔为默认值。

**语法**：

```
ip igmp snooping ( vlan VLAN_ID | ) query-interval interval
no ip igmp snooping ( vlan VLAN_ID | ) query-interval
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| INTERVAL | 成员查询间隔，以秒为单位 2-18000 秒 |

**命令模式**：全局配置模式

**默认配置**：125 秒

**使用说明**：

查询的间隔时间不能少于IGMP snooping 查询最大的响应时间。

**示例**：

```
设置成员查询间隔为64 秒:
Switch# configure terminal
Switch(config)# ip igmp snooping query-interval 64

恢复成员查询间隔为默认值:
Switch# configure terminal
Switch(config)# no ip igmp snooping query-interval
```

**相关命令**：show ip igmp snooping querier、show ip igmp snooping querier vlan

### 8.3.7 `ip igmp snooping query-max-response-time`

**功能**：使用此命令设置等待查询应答报文的超时时间。使用关键字no 恢复此超时时间为默认
  值。

**语法**：

```
ip igmp snooping ( vlan VLAN_ID | ) query-max-response-time TIME
no ip igmp snooping ( vlan VLAN_ID | ) query-max-response-time
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| TIME | 等待查询应答报文的超时时间，以秒为单位 1-25 |

**命令模式**：全局配置模式

**默认配置**：10 秒

**使用说明**：

查询应答时间不能少于IGMP snooping 查询间隔时间。

**示例**：

```
设置等待查询应答报文的超时时间为15 秒:
Switch# configure terminal
Switch(config)# ip igmp snooping query-max-response-time 15
恢复此超时时间:

Switch# configure terminal
Switch(config)# no ip igmp snooping query-max-response-time
```

**相关命令**：show ip igmp snooping querier、show ip igmp snooping querier vlan

### 8.3.8 `ip igmp snooping report-suppression`

**功能**：使用此命令设置端口对IGMPv1/v2 的成员报告报文进行抑制。使用关键字no 取消对
  对IGMPv1/v2 的成员报告报文的抑制。

**语法**：

```
ip igmp snooping ( vlan VLAN_ID | ) report-suppression
no ip igmp snooping ( vlan VLAN_ID | ) report-suppression
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：全局配置模式

**默认配置**：启用

**使用说明**：

IGMP snooping 工作在v3 模式时，成员报告报文不进行抑制。

**示例**：

```
对IGMPv1/IGMPv2 的成员报告报文进行抑制.:
Switch# configure terminal
Switch(config)# ip igmp snooping report-suppression
取消对IGMPv1/IGMPv2 的成员报告报文的抑制:
Switch# configure terminal
Switch(config)# no ip igmp snooping report-suppression
```

**相关命令**：show ip igmp snooping、show ip igmp snooping vlan

### 8.3.9 `ip igmp snooping version`

**功能**：使用此命令指定运行的IGMP 版本。使用关键字no 恢复运行的IGMP 版本为默认值

**语法**：

```
ip igmp snooping ( vlan VLAN_ID | ) version VER
no ip igmp snooping ( vlan VLAN_ID | ) version
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| VER | IGMP 版本 1-3 |

**命令模式**：全局配置模式

**使用说明**：

默认使用version 2

**示例**：

```
指定全局IGMP snooping 运行IGMPv1 模式下:
Switch# configure terminal
Switch(config)# ip igmp snooping version 1
```

**相关命令**：show ip igmp snooping、show ip igmp snooping vlan

### 8.3.10 `ip igmp snooping discard-unknown`

**功能**：使用此命令丢弃未知的组播流量。使用关键字no 恢复默认值。

**语法**：

```
ip igmp snooping ( vlan VLAN_ID | ) discard-unknown
no ip igmp snooping ( vlan VLAN_ID | ) discard-unknown
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：全局配置模式

**默认配置**：未知组播流量在VLAN 内泛洪。

**使用说明**：

无

**示例**：

```
在全局配置模式下配置交换机丢弃未知组播流量:
Switch# configure terminal
Switch(config)# ip igmp snooping discard-unknown
```

**相关命令**：show ip igmp snooping、show ip igmp snooping vlan

### 8.3.11 `ip igmp snooping limit-mrouter-forward`

**功能**：使用此命令使能一个功能，即当二层组播的规格满了后，report 报文依然可以往
  mrouter 口转发。使用关键字no 恢复默认值。

**语法**：

```
ip igmp snooping ( vlan VLAN_ID | ) limit-mrouter-forward
no ip igmp snooping ( vlan VLAN_ID | ) limit-mrouter-forward
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：全局配置模式

**默认配置**：igmp snooping group 表项学满后，多余的report 不往mrouter 口转发。

**使用说明**：

无

**示例**：

```
在全局配置模式下配置交换机使能二层组播表项学满后，report 报文依然可以转发到
mrouter 口:
Switch# configure terminal
Switch(config)# ip igmp snooping limit-mrouter-forward
```

**相关命令**：show ip igmp snooping、show ip igmp snooping vlan

### 8.3.12 `ip igmp snooping querier tcn`

**功能**：使用此命令设置IGMP snooping 的TCN 相关参数。使用关键字no 恢复默认值。

**语法**：

```
ip igmp snooping querier tcn ( enable | query-count COUNT | query-interval INTERVAL
| query-max-response-time TIME )
no ip igmp snooping querier tcn ( enable | query-count | query-interval | query-max-
response-time )
```

| 参数 | 说明 |
| --- | --- |
| enable | 使能IGMP snooping 查询器TCN 查询 |
| COUNT | IGMP snooping 查询 TCN 查询次数，默认是2 1-10 |
| INTERVAL | IGMP snooping 查询 TCN 查询间隔，默认是10 秒 1-255 秒 |
| TIME | IGMP snooping 查询 TCN 查询最大响应时间，默认5 秒 1-9 秒 |

**命令模式**：全局配置模式

**默认配置**：默认使能，默认查询次数为2，默认查询间隔10 秒，默认最大响应时间5 秒

**使用说明**：

无

**示例**：

```
设置IGMP Snooping Tcn 的查询次数为2 次:
Switch# configure terminal
Switch(config)# ip igmp snooping querier tcn query-count 2
```

**相关命令**：show ip igmp snooping querier

### 8.3.13 `ip igmp snooping vlan access-group`

**功能**：此命令用于设置允许加入的组播组范围。使用关键字no 取消此配置。

**语法**：

```
ip igmp snooping vlan VLAN_ID access-group LIST
no ip igmp snooping vlan VLAN_ID access-group
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| LIST | 访问控制列表名称不超过40 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在VLAN 上设置允许加入的组播组范围是acl 中的组播组范围:
Switch# configure terminal
Switch(config)# ip igmp snooping vlan 10 access-group acl
取消VLAN10 上配置的组播组访问控制列表:
Switch# configure terminal
Switch(config)# no ip igmp snooping vlan 10 access-group
```

**相关命令**：show ip igmp snooping vlan

### 8.3.14 `ip igmp snooping vlan mrouter interface`

**功能**：此命令用于静态配置VLAN 的组播路由端口。使用关键字no 取消此配置。

**语法**：

```
ip igmp snooping vlan VLAN_ID mrouter interface IFNAME
no ip igmp snooping vlan VLAN_ID mrouter interface IFNAME
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| IFNAME | 端口名称支持物理端口和聚合端口 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

指定的组播路由端口必须加入指定的VLAN。

**示例**：

```
将eth-0-1 设置成VLAN10 的组播路由端口:
Switch# configure terminal
Switch(config)# ip igmp snooping vlan 10 mrouter interface eth-0-1
取消VLAN10 上配置的组播路由端口eth-0-1:
Switch# configure terminal
Switch(config)# no ip igmp snooping vlan 10 mrouter interface eth-0-1
```

**相关命令**：show ip igmp snooping vlan

### 8.3.15 `ip igmp snooping vlan mrouter-aging-interval`

**功能**：此命令用于设置动态组播路由端口老化的时间间隔。使用关键字no 恢复默认值。

**语法**：

```
ip igmp snooping vlan VLAN_ID mrouter-aging-interval INTERVAL
no ip igmp snooping vlan VLAN_ID mrouter-aging-interval
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| INTERVAL | 老化时间间隔，单位是秒 1-65535 秒 |

**命令模式**：全局配置模式

**默认配置**：255 秒

**使用说明**：

无

**示例**：

```
设置VLAN 上的动态组播路由端口老化间隔是100 秒:
Switch# configure terminal
Switch(config)# ip igmp snooping vlan 10 mrouter-aging-interval 100
恢复动态组播路由端口老化的时间间隔为默认值。:
Switch# configure terminal
Switch(config)# no ip igmp snooping vlan 10 mrouter-aging-interval
```

**相关命令**：show ip igmp snooping vlan

### 8.3.16 `ip igmp snooping vlan mrouter-port-discard`

**功能**：此命令用于设置组播的mrouter 口不参与转发。使用关键字no 恢复默认值。

**语法**：

```
ip igmp snooping vlan VLAN_ID mrouter-port-discard
no ip igmp snooping vlan VLAN_ID mrouter-port-discard
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：全局配置模式

**默认配置**：Disable

**使用说明**：

无

**示例**：

```
设置VLAN 上的mrouter 口不参与转发:
Switch# configure terminal

Switch(config)# ip igmp snooping vlan 10 mrouter-port-discard
设置VLAN 上的mrouter 口参与转发:
Switch# configure terminal

Switch(config)# no ip igmp snooping vlan 10 mrouter-port-discard
```

**相关命令**：show ip igmp snooping vlan

### 8.3.17 `ip igmp snooping vlan querier`

**功能**：此命令用于在VLAN 上使能组播查询器功能。使用关键字no 恢复默认配置。

**语法**：

```
ip igmp snooping vlan VLAN_ID querier
no ip igmp snooping vlan VLAN_ID querier
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：全局配置模式

**默认配置**：关闭

**使用说明**：

无

**示例**：

```
在VLAN10 上使能组播查询器功能:
Switch# configure terminal
Switch(config)# ip igmp snooping vlan 10 querier
取消在VLAN 上使能组播查询器功能:
Switch# configure terminal
Switch(config)# no ip igmp snooping vlan 10 querier
```

**相关命令**：show ip igmp snooping querier vlan

### 8.3.18 `ip igmp snooping vlan querier address`

**功能**：此命令用于设置VLAN 上组播查询器的源地址。使用关键字no 删除此配置。

**语法**：

```
ip igmp snooping vlan VLAN_ID querier address IP_ADDR
no ip igmp snooping vlan VLAN_ID querier address IP_ADDR
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| IP_ADDR | 组播查询器源地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

VLAN 上没有配置查询器源地址时使用全局的查询器地址，VLAN 上配置了查询器地址
  后使用VLAN 上配置的查询器地址。

**示例**：

```
设置VLAN10 上组播查询器的源地址是1.1.1.1:
Switch# configure terminal
Switch(config)# ip igmp snooping vlan 10 querier address 1.1.1.1
删除VLAN10 上组播查询器的源地址:
Switch# configure terminal
Switch(config)# no ip igmp snooping vlan 10 querier address
```

**相关命令**：show ip igmp snooping querier vlan

### 8.3.19 `ip igmp snooping vlan querier-timeout`

**功能**：此命令用于设置VLAN 上查询器老化时间。使用关键字no 恢复默认配置。

**语法**：

```
ip igmp snooping vlan VLAN_ID querier-timeout INTERVAL
no ip igmp snooping vlan VLAN_ID querier-timeout
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| INTERVAL | 查询器老化时间间隔，单位是秒 60-300 秒 |

**命令模式**：全局配置模式

**默认配置**：255 秒

**使用说明**：

无

**示例**：

```
设置VLAN10 查询器老化间隔为100 秒:

Switch# configure terminal
Switch(config)# ip igmp snooping vlan 10 querier-timeout 100
恢复VLAN10 查询器老化间隔为默认值:
Switch# configure terminal
Switch(config)# no ip igmp snooping vlan 10 querier-timeout
```

**相关命令**：show ip igmp snooping querier vlan

### 8.3.20 `ip igmp snooping vlan static-group`

**功能**：此命令用于设置VLAN 的成员端口加入组播组或组播源组。使用关键字no 删除此配置。

**语法**：

```
ip igmp snooping vlan VLAN_ID static-group GRP_ADDR ( source SRC_ADDR | )
interface IFNAME
no ip igmp snooping vlan VLAN_ID static-group GRP_ADDR ( source SRC_ADDR | )
interface IFNAME
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| GRP_ADDR | 组播组地址 IPv4 地址 |
| SRC_ADDR | 组播源地址 IPv4 地址 |
| IFNAME | VLAN 的成员端口名称支持物理端口和聚合端口 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示如何将VLAN10 的成员端口eth-0-11 加入组播组238.1.1.1:

Switch# configure terminal
Switch(config)# ip igmp snooping vlan 10 static-group 238.1.1.1 interface eth-0-11
下面例子显示如何将VLAN10 的成员端口eth-0-11 退出组播组238.1.1.1:
Switch# configure terminal
Switch(config)# no ip igmp snooping vlan 10 static-group 238.1.1.1 interface eth-0-
```

**相关命令**：show ip igmp snooping group

### 8.3.21 `ip igmp snooping vlan static-group remote-vtep`

**功能**：此命令用于设置VLAN 的remote vtep 成员加入组播组。使用关键字no 删除此配置。

**语法**：

```
ip igmp snooping vlan VLAN_ID static-group GRP_ADDR remote-vtep VTEP_NUM
no ip igmp snooping vlan VLAN_ID static-group GRP_ADDR remote-vtep VTEP_NUM
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| GRP_ADDR | 组播组地址 IPv4 地址 |
| VTEP_NUM |  |
| Remote Vtep Number | 1-65535 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示如何将VLAN10 的成员remote-vtep 1 加入组播组238.1.1.1:
Switch# configure terminal
Switch# vlan 10

Switch(config-vlan)# overlay enable
Switch(config-vlan)# exit
Switch(config)# overlay
Switch(config-overlay)# source 1.1.1.1
Switch(config-overlay)# remote-vtep 1 ip-address 2.2.2.2 type vxlan
Switch(config-overlay)# vlan 10 vni 10
Switch(config-overlay)# vlan 10 remote-vtep 1
Switch(config-vlan)# exit
Switch(config)# ip igmp snooping vlan 10 static-group 238.1.1.1 remote-vtep 1
下面例子显示如何将VLAN10 的成员remote-vtep 1 退出组播组238.1.1.1:
Switch# configure terminal
Switch(config)# no ip igmp snooping vlan 10 static-group 238.1.1.1 remote-vtep 1
```

**相关命令**：show ip igmp snooping group

### 8.3.22 `clear ip igmp snooping group`

**功能**：此命令用于删除所有的IGMP snooping 组信息。

**语法**：

```
clear ip igmp snooping group ( * | GRP_ADDR )
```

| 参数 | 说明 |
| --- | --- |
| GRP_ADDR | 指定组播组地址 IPv4 地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示如何删除所有的组播组信息:

Switch# clear ip igmp snooping group *
```

**相关命令**：无

### 8.3.23 `clear ip igmp snooping vlan`

**功能**：此命令用于删除指定VLAN 上的组播组信息。

**语法**：

```
clear ip igmp snooping vlan VLAN_ID
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示如何删除VLAN10 上的组播组信息:
Switch# clear ip igmp snooping vlan 10
```

**相关命令**：无

### 8.3.24 `clear ip igmp snooping mrouter vlan`

**功能**：此命令用于删除指定VLAN 上的组播路由口。

**语法**：

```
clear ip igmp snooping mrouter vlan VLAN_ID
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| VLAN ID | 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示如何删除VLAN10 上的组播路由口信息:
Switch# clear ip igmp snooping mrouter vlan 10
```

**相关命令**：clear ip igmp snooping mrouter

### 8.3.25 `clear ip igmp snooping mrouter`

**功能**：此命令用于删除所有的组播路由口。

**语法**：

```
clear ip igmp snooping mrouter
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示如何删除所有的组播路由口信息:
Switch# clear ip igmp snooping mrouter
```

**相关命令**：clear ip igmp snooping mrouter vlan

### 8.3.26 `show ip igmp snooping global`

**功能**：使用此命令查看关于IGMP Snooping 的全局配置。

**语法**：

```
show ip igmp snooping global
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看关于IGMP Snooping 的全局配置:
Switch# show ip igmp snooping global
Global Igmp Snooping Configuration
-------------------------------------------------
Igmp Snooping                             :Enabled
Igmp Snooping Fast-Leave                  :Disabled
Igmp Snooping Version                     :2
Igmp Snooping Robustness Variable         :2
Igmp Snooping Max-Member-Number           :2048
Igmp Snooping Unknown Multicast Behavior  :Flood
Igmp Snooping Report-Suppression          :Enabled
```

**相关命令**：无

### 8.3.27 `show ip igmp snooping groups`

**功能**：此命令用于显示IGMP snooping 组播组信息。

**语法**：

```
show ip igmp snooping groups
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
显示IGMP snooping 组播组信息:
Switch# show ip igmp snooping groups
VLAN   Interface      Group-Address      Uptime     Expires-time
1      eth-0-1        227.0.0.1          00:03:44   00:04:18
```

**相关命令**：无

### 8.3.28 `show ip igmp snooping groups vlan`

**功能**：此命令用于指定VLAN 上的组播组信息。

**语法**：

```
show ip igmp snooping groups vlan VLAN_ID ( GRP_ADDR | )
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| GRP_ADDR | 组播组信息 IPv4 地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示VLAN1 上的组播组信息:
Switch# show ip igmp snooping groups vlan 1
IGMP Snooping groups for vlan1
Interface:      eth-0-1
Group:          227.0.0.1
Uptime:         00:05:24
Group mode:     Exclude (Expires: 00:04:20)
Last reporter:  10.0.1.100
Source list is empty
```

**相关命令**：无

### 8.3.29 `show ip igmp snooping groups count`

**功能**：此命令用于显示IGMP snooping 组播组数目。

**语法**：

```
show ip igmp snooping groups ( vlan VLAN_ID | ) count
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子VLAN1 上组播组数目:
Switch# show ip igmp snooping groups vlan 1 count
Dynamic multicast groups count: 1
Static multicast groups count: 0
Total multicast groups count: 1
```

**相关命令**：无

### 8.3.30 `show ip igmp snooping querier`

**功能**：此命令用于显示IGMP snooping 查询器相关信息。

**语法**：

```
show ip igmp snooping querier ( vlan VLAN_ID | )
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示VLAN1 上查询器信息:
Switch# show ip igmp snooping querier vlan 1
Global Igmp Snooping Querier Configuration
-------------------------------------------------
Version                           :2
Last-Member-Query-Interval (msec) :1000
Last-Member-Query-Count           :2
Max-Query-Response-Time (sec)     :10
Query-Interval (sec)              :125
Global Source-Address             :0.0.0.0
TCN Query Count                   :2
TCN Query Interval (sec)          :10
TCN Query Max Respose Time (sec)  :5
Vlan 1:   IGMP snooping querier status
--------------------------------------------
Elected querier is : 0.0.0.0
--------------------------------------------
Admin state                       :Disabled
Admin version                     :2
Operational state                 :Non-Querier
Querier operational address       :0.0.0.0
Querier configure address         :N/A
Last-Member-Query-Interval (msec) :1000
Last-Member-Query-Count           :2
Max-Query-Response-Time (sec)     :10
Query-Interval (sec)              :125
Querier-Timeout (sec)             :255
```

**相关命令**：无

### 8.3.31 `show ip igmp snooping mrouter`

**功能**：此命令用于显示组播路由端口信息。

**语法**：

```
show ip igmp snooping mrouter ( vlan VLAN_ID | )
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示VLAN1 上的组播路由端口信息:
Switch# show ip igmp snooping mrouter vlan 1
Interface      Mode      Uptime     Expires-time
eth-0-11       static    -          -
```

**相关命令**：无

### 8.3.32 `show ip igmp snooping vlan`

**功能**：此命令用于IGMP snooping 的配置信息。

**语法**：

```
show ip igmp snooping ( vlan VLAN_ID | )
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示VLAN1 上IGMP snooping 的信息:
Switch# show ip igmp snooping vlan 1
Global Igmp Snooping Configuration
-------------------------------------------------
Igmp Snooping                             :Enabled
Igmp Snooping Fast-Leave                  :Disabled
Igmp Snooping Version                     :2
Igmp Snooping Robustness Variable         :2
Igmp Snooping Max-Member-Number           :2048
Igmp Snooping Unknown Multicast Behavior  :Flood
Igmp Snooping Report-Suppression          :Enabled
Vlan 1
-----------
Igmp Snooping                             :Enabled
Igmp Snooping Fast-Leave                  :Disabled
Igmp Snooping Report-Suppression          :Enabled
Igmp Snooping Version                     :2
Igmp Snooping Robustness Variable         :2
Igmp Snooping Max-Member-Number           :2048
Igmp Snooping Unknown Multicast Behavior  :Flood
Igmp Snooping Group Access-list           :N/A
Igmp Snooping Mrouter Port                :
Igmp Snooping Mrouter Port Aging Interval(sec) :255
```

**相关命令**：无

### 8.3.33 `show resource l2mcast`

**功能**：此命令用于查看二层组播的资源使用情况。

**语法**：

```
show resource l2mcast
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示二层组播资源使用情况:
Switch# show resource l2mcast
L2MCAST
Resource                         Used          Capability
=============================================================
L2 Mcast Entry                   0             2048
```

**相关命令**：无、8.4 PIM 命令


## 8.4 PIM 命令

### 8.4.1 `ip pim accept-register`

**功能**：此命令根据访问控制列表限制RP 可接受的PIM 注册报文。使用关键字no 关闭此项功
  能。

**语法**：

```
ip pim accept-register list LIST
no ip pim accept-register
```

| 参数 | 说明 |
| --- | --- |
| LIST | 访问控制列表不超过40 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

此功能用来防止未经认证的用户注册到交换机；当其用此功能后，如果一个未经认证
  的主机发送一个PIM 注册报文给交换机，此交换机会立即发送一个Stop 报文回去阻止
  其继续发送报文注册。此命令可以有效的让网络中众多RP 负载分担，通过ACL 的设
  置控制不同的组播组。

**示例**：

```
下面例子描述了如何根据访问控制列表acl1 限制RP 可接受的PIM 注册报文:
Switch# configure terminal
Switch(config)# ip pim accept-register list acl1
下面例子描述了如何删除限制:
Switch# configure terminal
Switch(config)# no ip pim accept-register
```

**相关命令**：无

### 8.4.2 `ip pim anycast-rp`

**功能**：使用此命令设置任播汇聚路由器地址及其成员。使用关键字no 删除指定成员。

**语法**：

```
ip pim anycast-rp ANYCAST_RP_ADDR ANYCAST_MEMBER_ADDR
no ip pim anycast-rp ANYCAST_RP_ADDR ( ANYCAST_MEMBER_ADDR | )
```

| 参数 | 说明 |
| --- | --- |
| ANYCAST_RP_ADDR | RP 地址 IPv4 地址 |
| ANYCAST_MEMBER_AD |  |
| DR | 组成员地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

如果要配置，则应该在所有路由器上配置，所有路由器必须使用相同的 RP 地址，当静
  态配置的RP 失效时，路由器不可能切换到其它的备用RP(除非使用Anycast-RP，在
  RP 之间运行)。

**示例**：

```
设置任播汇聚路由器地址及其组成员:
Switch# configure terminal
Switch(config)# ip pim anycast-rp 10.10.10.1 10.10.10.11
删除任播汇聚路由器地址及其组成员:
Switch# configure terminal
Switch(config)# no ip pim anycast-rp 10.10.10.1 10.10.10.11
```

**相关命令**：无

### 8.4.3 `ip pim bsr-candidate`

**功能**：使用此命令设置本交换机作为侯选的自举交换机，使用关键字no 取消此项设置。

**语法**：

```
ip pim bsr-candidate IFNAME ( MASK_LEN ( PRIORITY ) ( INTERVAL ) | )
no ip pim bsr-candidate
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 端口名称支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |
| MASK_LEN | RP 选举时候HASH 的掩码长度 0-32 |
| PRIORITY | 候选BSR 路由器的优先级 0-255 |
| INTERVAL | BSR 发送bootstrap 报文的 |
| interval | 1-107374177 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
设置此交换机作为BSR，设置端口eth-0-1 的地址作为BSR 的地址:
Switch# configure terminal
Switch(config)# ip pim bsr-candidate eth-0-1
取消BSR 配置:
Switch# configure terminal
Switch(config)# no ip pim bsr-candidate
```

**相关命令**：ip pim bsr-border

### 8.4.4 `ip pim bsr-border`

**功能**：使用此命令设置此交换机作为PIM 域的边界，BSR 报文不再被转发出去。使用关键字
  no 删除此配置。

**语法**：

```
ip pim bsr-border
no ip pim bsr-border
```

**命令模式**：端口配置模式

**默认配置**：不使能

**使用说明**：

无

**示例**：

```
设置此交换机作为PIM 域的边界:
Switch# configure terminal
Switch(config-if)# ip pim bsr-border
取消设置此交换机作为PIM 域的边界:
Switch# configure terminal
Switch(config-if)# no ip pim bsr-border
```

**相关命令**：ip pim bsr-candidate

### 8.4.5 `ip pim dr-priority`

**功能**：使用此命令设定竞选指定路由器的优先权值，使用关键字no 恢复优先权值为默认值。

**语法**：

```
ip pim dr-priority PRIORITY
no ip pim dr-priority
```

| 参数 | 说明 |
| --- | --- |
| PRIORITY | 设定的指定路由器的优先权值 0-4294967294 |

**命令模式**：端口配置模式

**使用说明**：

端口的优先权默认为1，如果一个路由器在它的Hello 报文中没有宣布它的优先权值，
  此路由器将被认为具有最大的优先权值，因此将被选举为DR。如果有不止一个的路由
  器在它的HELLO 报文中没有宣布它的优先权值，则具有最高IP 地址的将被选为DR。

**示例**：

```
设置竞选指定路由器的优先权值是1000:
Switch# configure terminal
Switch(config-if)# ip pim dr-priority 1000
恢复默认的优先权值:
Switch# configure terminal
Switch(config-if)# no ip pim dr-priority
```

**相关命令**：无

### 8.4.6 `ip pim exclude-genid`

**功能**：使用此命令设置此端口发出的Hello 报文不包括GenerationID 选项。使用关键字no 恢
  复此项设置为默认状态。

**语法**：

```
ip pim exclude-genid
no ip pim exclude-genid
```

**命令模式**：端口配置模式

**默认配置**：不使能

**使用说明**：

GenerationID 是PIM 邻居的一个标识ID，在PIM Hello 中携带，本端设备会记录对端
  发送的hello 报文中携带的GenerationID，本端设备每次收到对端的PIM Hello 会去
  check 一下这个ID 是否有变化，如果有变化，则认为邻居状态发生改变，重新走状态
  机。

**示例**：

```
设置RP 发送的Hello 报文中无GenerationID 的报文:
Switch# configure terminal
Switch(config-if)# ip pim exclude-genid

恢复默认的配置:
Switch# configure terminal
Switch(config-if)# no ip pim exclude-genid
```

**相关命令**：无

### 8.4.7 `ip pim hello-interval`

**功能**：使用此命令设定端口发送Hello 报文的时间间隔，使用关键字no 恢复时间间隔为默认
  值。

**语法**：

```
ip pim hello-interval INTERVAL
no ip pim hello-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 发送Hello 报文的时间间隔，以秒为单位 1-18724 |

**命令模式**：端口配置模式

**默认配置**：30 秒

**使用说明**：

无

**示例**：

```
设定发送Hello 报文的时间间隔是100 秒:
Switch# configure terminal
Switch(config-if)# ip pim hello-interval 100
恢复默认的Hello 报文时间间隔:
Switch# configure terminal
Switch(config-if)# no ip pim hello-interval
```

**相关命令**：无

### 8.4.8 `ip pim ignore-rp-set-priority`

**功能**：设置忽略关于RP（Rendezvous Router，汇聚路由器）的优先权。使用关键字no 对RP
  优先权不进行忽略。

**语法**：

```
ip pim ignore-rp-set-priority
no ip pim ignore-rp-set-priority
```

**命令模式**：全局配置模式

**默认配置**：默认情况下，对RP 优先权不进行忽略。

**使用说明**：

无

**示例**：

```
忽略关于RP 优先权的设置值:
Switch# configure terminal
Switch(config)# ip pim ignore-rp-set-priority
取消忽略关于RP 优先权的设置:
Switch# configure terminal
Switch(config)# no ip pim ignore-rp-set-priority
```

**相关命令**：无

### 8.4.9 `ip pim jp-timer`

**功能**：设置端口发送加入/修剪报文的时间间隔。使用关键字no 恢复此时间间隔为默认值。

**语法**：

```
ip pim jp-timer TIMER
no ip pim jp-timer
```

| 参数 | 说明 |
| --- | --- |
| TIMER | 端口发送加入/修剪报文的时间间隔，以秒为单位 1-65535 |

**命令模式**：全局配置模式

**默认配置**：60 秒

**使用说明**：

无

**示例**：

```
设置端口发送加入/修剪报文的时间间隔为100 秒:
Switch# configure terminal
Switch(config)# ip pim jp-timer 100
恢复默认的端口发送加入/修剪报文的时间间隔:
Switch# configure terminal
Switch(config)# no ip pim jp-timer
```

**相关命令**：无

### 8.4.10 `ip pim neighbor-filter`

**功能**：此命令根据访问控制列表限制与此设备建立邻居关系的节点。使用关键字no 取消此项
  限制。

**语法**：

```
ip pim neighbor-filter LIST
no ip pim neighbor-filter
```

| 参数 | 说明 |
| --- | --- |
| LIST | 访问控制列表不超过40 个字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

在PIM 协议中，节点之间会互相发送PIM Hello 报文来与对方建立邻居关系；此命令
  可以根据访问控制列表来限制与此设备建立邻居关系的节点。

**示例**：

```
根据访问控制列表acl1 限制与此设备建立邻居关系的节点:
Switch# configure terminal
Switch(config-if)# ip pim neighbor-filter acl1
删除控制pim 邻居的访问控制列表:
Switch# configure terminal
Switch(config-if)# no ip pim  neighbor-filter
```

**相关命令**：无

### 8.4.11 `ip pim register-rate-limit`

**功能**：使用此命令设置DR 发往RP 的PIM 注册报文的最大速度。使用关键字no 恢复此项设
  置为默认值。

**语法**：

```
ip pim register-rate-limit LIMIT
no ip pim register-rate-limit
```

| 参数 | 说明 |
| --- | --- |
| LIMIT | DR 发往RP 的PIM 注册报文的最大速度 1-65535 |

**命令模式**：全局配置模式

**默认配置**：默认情况下，对DR 发往RP 的PIM 注册报文的速度不进行限制。如果设定了此项，则 超过此速度的PIM 注册报文在RP 处会被丢弃。

**使用说明**：

用来设置DR 发往RP 的PIM 注册报文的最大速度，超过此速度的注册报文在RP 处会
  被丢弃。

**示例**：

```
设置DR 发往RP 的PIM 注册报文的最大速度为每秒100 个:
Switch# configure terminal
Switch(config)# ip pim register-rate-limit 100
恢复默认的DR 发往RP 的PIM 注册报文的最大速度:
Switch# configure terminal
Switch(config)# no ip pim register-rate-limit
```

**相关命令**：ip pim register-rp-reachability、ip pim register-source、、ip pim register-suppression

### 8.4.12 `ip pim register-source`

**功能**：此命令设置DR 发往RP 的注册报文的源IP 地址，使用关键字no 恢复注册报文的源IP
  地址为默认值

**语法**：

```
ip pim register-source IFNAME
no ip pim register-source
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称，将使用该接口的接口地址作为源地址支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |

**命令模式**：全局配置模式

**默认配置**：默认情况下，源IP 地址为DR 的interface IP 地址。

**使用说明**：

无

**示例**：

```
设置注册报文的源IP 地址为eth-0-1 端口的IP 地址:
Switch# configure terminal
Switch(config)# ip pim register-source eth-0-1
删除注册报文的源IP 地址:
Switch# configure terminal
Switch(config)# no ip pim register-source
```

**相关命令**：ip pim register-rate-limit、ip pim register-rp-reachability、、ip pim register-suppression

### 8.4.13 `ip pim register-rp-reachability`

**功能**：此命令设置对RP（Rendezvous Router，汇聚路由器）可到达性的检测。使用关键字
  no 取消此检查。

**语法**：

```
ip pim register-rp-reachability
no ip pim register-rp-reachability
```

**命令模式**：全局配置模式

**默认配置**：不使能

**使用说明**：

无

**示例**：

```
设置对RP（Rendezvous Router，汇聚路由器）可到达性的检测:
Switch# configure terminal
Switch(config)#ip pim register-rp-reachability
取消对RP（Rendezvous Router，汇聚路由器）可到达性的检测:
Switch# configure terminal
Switch(config)#no ip pim register-rp-reachability
```

**相关命令**：ip pim register-rate-limit、ip pim register-source、ip pim register-suppression

### 8.4.14 `ip pim register-suppression`

**功能**：当RP 给DR 发送Stop 报文后，DR 会停止发送PIM 注册报文一段时间。此命令可以设
  置DR 停止发送PIM 注册报文的时间长短。使用关键字no 恢复此时间段的设置为默认
  值。

**语法**：

```
ip pim register-suppression TIME
no ip pim register-suppression
```

| 参数 | 说明 |
| --- | --- |
| TIME | 限制时间的长短，以秒为单位 11-18000 秒 |

**命令模式**：全局配置模式

**默认配置**：60 秒

**使用说明**：

无

**示例**：

```
设置当DR 接受到Stop 报文后停止发送注册报文的时间间隔为100 秒:
Switch# configure terminal
Switch(config)# ip pim register-suppression 100
恢复默认的DR 接受到Stop 报文后停止发送注册报文的时间间隔:
Switch# configure terminal
Switch(config)# no ip pim register-suppression
```

**相关命令**：ip pim register-rate-limit、ip pim register-rp-reachability、ip pim register-source

### 8.4.15 `ip pim rp-address`

**功能**：使用此命令为设置静态RP 地址，使用关键字no 删除此配置。

**语法**：

```
ip pim rp-address IP_ADDR ( LIST | override | )
no ip pim rp-address IP_ADDR ( LIST | )
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | RP 地址 IPv4 地址 |
| LIST | 访问控制列表不超过40 个字符的字符串 |
| override | 覆盖动态学习的RP 的映射 - |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
设置RP 地址为1.1.1.1:
Switch# configure terminal
Switch(config)# ip pim rp-address 1.1.1.1
删除RP 地址:
Switch# configure terminal
Switch(config)# no ip pim rp-address 1.1.1.1
```

**相关命令**：ip pim rp-candidate、ip pim rp-register-kat

### 8.4.16 `ip pim rp-candidate`

**功能**：使用此命令设置本交换机作为侯选的RP，使用关键字no 取消此设置。

**语法**：

```
ip pim rp-candidate IFNAME ( { priority PRIORITY | interval INTERVAL | group-list LIST }
| )
no ip pim rp-candidate ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 此端口的IP 地址会作为候选的RP 在网络上被广播支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |
| PRIORITY | 候选RP 的优先权 0-255 |
| INTERVAL | 发送宣告报文的时间间隔， 单位是秒 1-16383 秒 |
| LIST | 访问控制列表限制可注册到此RP 的组播组不超过40 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
设置本交换机的eth-0-1 端口的IP 地址为侯选的RP 地址:
Switch# configure terminal
Switch(config)# ip pim rp-candidate eth-0-1
取消设置本交换机eth-0-1 为候选RP 地址:
Switch# configure terminal
Switch(config)# no ip pim rp-candidate eth-0-1
```

**相关命令**：ip pim rp-address

### 8.4.17 `ip pim rp-register-kat`

**功能**：使用此命令设置DR 发往RP 的PIM 注册报文的存活时间。使用关键字no 恢复此存活
  时间为默认值。

**语法**：

```
ip pim rp-register-kat TIME
no ip pim rp-register-kat
```

| 参数 | 说明 |
| --- | --- |
| TIME | DR 发往RP 的PIM 注册报文的存活时间，以秒为单位 1-65535 秒 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

DR 发往RP 的PIM 注册报文在RP 上会生成一个(S,G)条目，此条目会在RP 上存在一段
  时间，超过此时间后，交换机会删除相应条目；此命令可以设置当RP 发送Stop 报文
  后该条目在RP 上存活的时间。

**示例**：

```
设置DR 发往RP 的PIM 注册报文的存活时间为100 秒:
Switch# configure terminal
Switch(config)# ip pim rp-register-kat 100
恢复DR 发往RP 的PIM 注册报文的存活时间为默认值:
Switch# configure terminal
Switch(config)# no ip pim rp-register-kat
```

**相关命令**：ip pim rp-address、ip pim rp-candidate

### 8.4.18 `ip pim spt-switch-threshold infinity`

**功能**：使用此功能设置永远都不切换到最短路径树，使用关键字no 取消此项设置。

**语法**：

```
ip pim spt-switch-threshold infinity ( group-list LIST | )
no ip pim spt-switch-threshold infinity ( group-list LIST | )
```

| 参数 | 说明 |
| --- | --- |
| LIST | 组播组地址范围的访问控制列表不超过40 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：默认DR 收到第一个组播流后立即切换为最短路径树。

**使用说明**：

无

**示例**：

```
设置永远都不切换到最短路径树:
Switch# configure terminal
Switch(config)# ip pim spt-switch-threshold infinity
恢复默认DR 收到第一个组播流后立即切换为最短路径树。:
Switch# configure terminal
Switch(config)# no ip pim spt-switch-threshold infinity
```

**相关命令**：show ip pim sparse-mode spt-threshold

### 8.4.19 `ip pim cisco-register-checksum`

**功能**：使用此功能设置DR 发送注册报文时使用Register Checksum，使用关键字no
  取消此项设置。

**语法**：

```
ip pim cisco-register-checksum ( group-list LIST | )
no ip pim cisco-register-checksum ( group-list LIST | )
```

| 参数 | 说明 |
| --- | --- |
| LIST |  |
| Up to 40 characters | 不超过40 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：默认使用RFC 定义的register checksum

**使用说明**：

默认是RFC 规定的register checksum，如果配置了访问控制列表，只有通过验证的报
  文才能以Register Checksum 的方式发送。

**示例**：

```
设置DR 发送注册报文时使用Register Checksum:
Switch# configure terminal
Switch(config)# ip pim cisco-register-checksum
恢复DR 发送注册报文时使用RFC 方式:
Switch# configure terminal
Switch(config)# no ip pim cisco-register-checksum
```

**相关命令**：无

### 8.4.20 `ip pim sparse-mode`

**功能**：使用此命令在此端口启用PIM-SM 协议，使用关键字no 在此端口关闭PIM-SM 协议。

**语法**：

```
ip pim sparse-mode ( passive | )
no ip pim sparse-mode ( passive | )
```

| 参数 | 说明 |
| --- | --- |
| passive | 被动模式 |

**命令模式**：端口配置模式

**默认配置**：不使能

**使用说明**：

默认情况下，端口没有启用PIM-SM 协议；工作在被动模式的端口不会发送PIM Hello
  报文。

**示例**：

```
在此端口启用PIM 协议:
Switch# configure terminal
Switch(config-if)# ip pim sparse-mode
在此端口关闭PIM 协议:
Switch# configure terminal
Switch(config-if)# no ip pim  sparse-mode
在此端口启用PIM 协议并配置为被动模式:
Switch# configure terminal
Switch(config-if)# ip pim sparse-mode passive
```

**相关命令**：无

### 8.4.21 `ip pim dense-mode`

**功能**：使用此命令在此端口启用PIM-DM 协议，使用关键字no 在此端口关闭PIM-DM 协议。

**语法**：

```
ip pim dense-mode ( passive | )
no ip pim dense -mode
```

| 参数 | 说明 |
| --- | --- |
| passive | 被动模式 |

**命令模式**：端口配置模式

**默认配置**：不使能

**使用说明**：

PIM-DM 和PIM-SM 模式在同一个端口上是互斥的，默认情况下，端口没有启用PIM-
  DM 协议；工作在被动模式的端口不会主动发送PIM Hello 报文。

**示例**：

```
在此端口启用PIM DM 协议:
Switch# configure terminal
Switch(config-if)# ip pim dense-mode
在此端口关闭PIM DM 协议:
Switch# configure terminal
Switch(config-if)# no ip pim  dense-mode
在此端口启用PIM DM 协议并配置为被动模式:
Switch# configure terminal
Switch(config-if)# ip pim dense-mode passive
```

**相关命令**：无

### 8.4.22 `ip pim propagation-delay`

**功能**：使用此命令PIM-DM 的端口的传播延时，使用关键字no 取消配置。

**语法**：

```
ip pim propagation-delay timer
no ip pim propagation-delay
```

| 参数 | 说明 |
| --- | --- |
| timer | 传播延时 100-5000 毫秒 |

**命令模式**：端口配置模式

**默认配置**：1000 毫秒

**使用说明**：

当一个网络上所有的路由器都支持剪枝延迟选项时，PIM-DM 路由器将用接收到的所
  有的传播延时来修正加入和剪枝的覆盖间隔。

**示例**：

```
设置端口的传播延时为400 毫秒。:
Switch# configure terminal
Switch(config-if)# ip pim propagation-delay 400
在此端口取消传播延时并恢复为默认值。:
Switch# configure terminal
Switch(config-if)# no ip pim propagation-delay
```

**相关命令**：无

### 8.4.23 `ip pim state-refresh origination-interval`

**功能**：使用此命令PIM-DM 源端路由器发送SR 消息的间隔时间，使用关键字no 取消配置。

**语法**：

```
ip pim state-refresh origination-interval INTERVAL
no ip pim state-refresh origination-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | SR 消息的间隔 1-100 秒 |

**命令模式**：端口配置模式

**默认配置**：60 秒

**使用说明**：

PIM 的SR 消息是由与组播源直接相连的路由器发送的，此命令可以控制SR 消息的发
  送间隔。

**示例**：

```
在此端口配置传播延时:
Switch# configure terminal
Switch(config-if)# ip pim state-refresh origination-interval 50
在此端口取消SR 的消息间隔配置:
Switch# configure terminal
Switch(config-if)# no ip pim state-refresh origination-interval
```

**相关命令**：无

### 8.4.24 `ip pim unicast-bsm`

**功能**：默认情况下，端口会向整个PIM 域发送BSM 报文；此命令可以限制交换机只向它的邻
  居发送BSM 报文。使用关键字no 恢复此项设置为默认值。

**语法**：

```
ip pim unicast-bsm
no ip pim unicast-bsm
```

**命令模式**：端口配置模式

**默认配置**：不使能

**使用说明**：

默认端口会向整个PIM 域发送BSM 消息，每个端口只能创建一条统计。

**示例**：

```
在此端口配置BSM 报文转发方式:
Switch# configure terminal
Switch(config-if)# ip pim unicast-bsm
在此端口取消配置BSM 报文转发方式为默认:
Switch# configure terminal
Switch(config-if)# no ip pim unicast-bsm
```

**相关命令**：无

### 8.4.25 `ip pim ssm`

**功能**：使用这个命令来使能PIM-SSM 和指定SSM 组范围。默认范围是
  232.0.0.0~232.255.255.255。使用关键字no 来关闭PIM-SSM。

**语法**：

```
ip pim ssm ( default | range LIST )
no ip pim ssm
```

| 参数 | 说明 |
| --- | --- |
| default | 使用默认的232.0.0.0/8 SSM 组播组范围 |
| LIST | 使用访问控制列表中的组播组范围作为SSM 组播组范围不超过40 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：不使能

**使用说明**：

无

**示例**：

```
使能PIM-SSM,并将SSM 组范围设置为默认范围:
Switch# configure terminal
Switch(config-if)# ip pim ssm default
去使能PIM-SSM:
Switch# configure terminal
Switch(config-if)# no ip pim ssm default
```

**相关命令**：无

### 8.4.26 `ip pim graceful-restart`

**功能**：使用此命令启用PIM-SM 协议平滑重启功能及配置重启阶段持续时间，使用关键字no
  关闭PIM-SM 协议平滑重启功能及配置重启阶段持续时间为默认值。

**语法**：

```
ip pim graceful-restart ( period TIME | )
no ip pim graceful-restart ( period TIME | )
```

| 参数 | 说明 |
| --- | --- |
| TIME | PIM 平滑重启阶段时间 90-3600 秒 |

**命令模式**：全局配置模式

**默认配置**：120 秒

**使用说明**：

PIM 平滑重启只能在stack 系统中生效。

**示例**：

```
启用PIM-SM 协议平滑重启功能:
Switch# configure terminal
Switch(config)# ip pim graceful-restart
关闭PIM-SM 协议平滑重启功能:
Switch# configure terminal
Switch(config)# no ip pim graceful-restart
配置PIM-SM 协议平滑重启阶段时间:
Switch# configure terminal
Switch(config)# ip pim graceful-restart period 100
```

**相关命令**：无

### 8.4.27 `show ip pim sparse-mode bsr-router`

**功能**：使用此命令查看自举路由器信息。

**语法**：

```
show ip pim sparse-mode bsr-router
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看自举路由器信息:
Switch# show ip pim sparse-mode bsr-router
PIMv2 bootstrap information
This system is the bootstrap router (BSR)
  BSR address: 12.0.9.2
  Uptime:      00:00:08, BSR Priority: 64, Hash mask length: 10
  Next bootstrap message in 00:00:04
  Role: Candidate BSR
  State: Elected BSR
  Candidate RP: 12.0.9.2(eth-0-9)
    Advertisement interval 60 seconds
    Next C-RP advertisement in 00:00:57
```

**相关命令**：无

### 8.4.28 `show ip pim sparse-mode interface`

**功能**：使用此命令查看稀疏模式下的端口信息。

**语法**：

```
show ip pim sparse-mode interface ( detail | )
```

| 参数 | 说明 |
| --- | --- |
| detail | 查看详细信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看稀疏模式下的端口信息:
Switch# show ip pim sparse-mode interface detail
eth-0-9 (vif 0):
  Address 12.0.9.1, DR 12.0.9.2
  Hello period 30 seconds, Next Hello in 26 seconds
  Triggered Hello period 5 seconds
  Neighbors:
   12.0.9.2
```

**相关命令**：无

### 8.4.29 `show ip pim sparse-mode local-member`

**功能**：使用此命令查看稀疏模式下的本地成员信息。

**语法**：

```
show ip pim sparse-mode local-member ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 端口名称支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看稀疏模式下的本地成员信息:
Switch# show ip pim sparse-mode local-members
PIM local membership information
eth-0-3:
  (*, 229.1.1.1) : Include
eth-0-9:
  (*, 228.1.1.1) : Include
```

**相关命令**：无

### 8.4.30 `show ip pim sparse-mode mroute`

**功能**：使用此命令查看SM 模式下的多播路由。

**语法**：

```
show ip pim sparse-mode mroute ( SRC_ADDR | GRP_ADDR | ) ( detail | )
```

| 参数 | 说明 |
| --- | --- |
| SRC_ADDR | 多播路由源地址 IPv4 地址 |
| GRP_ADDR | 多播路由目的地址 IPv4 地址 |
| detail | 详细信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看稀疏模式下的多播路由:
Switch# show ip pim sparse-mode mroute detail
IP Multicast Routing Table
(*,*,RP) Entries: 0
(*,G) Entries: 2
(S,G) Entries: 0
(S,G,rpt) Entries: 0
FCR Entries: 0
(*, 228.1.1.1) Uptime: 00:09:55
  RP: 0.0.0.0, RPF nbr: None, RPF idx: None
  Upstream:
   State: NOT JOINED, SPT Switch: Enabled, JT: off
  Downstream:
   eth-0-9:
     State: NO INFO, ET: off, PPT: off
     Assert State: NO INFO, AT: off
      Winner: 0.0.0.0, Metric: 4294967295, Pref: 4294967295, RPT bit: on
  Local Olist:
   eth-0-9
(*, 229.1.1.1) Uptime: 00:04:22
  RP: 12.0.9.2, RPF nbr: 12.0.9.2, RPF idx: eth-0-9
  Upstream:
   State: JOINED, SPT Switch: Enabled, JT Expiry: 40 secs
   Macro state: Join Desired,
  Downstream:
   eth-0-3:
     State: NO INFO, ET: off, PPT: off
     Assert State: NO INFO, AT: off
      Winner: 0.0.0.0, Metric: 4294967295, Pref: 4294967295, RPT bit: on
     Macro state: Could Assert, Assert Track
  Local Olist:
   eth-0-3
```

**相关命令**：无

### 8.4.31 `show ip pim sparse-mode neighbor`

**功能**：使用此命令查看稀疏模式下的邻居信息。

**语法**：

```
show ip pim sparse-mode neighbor ( ( IFNAME ( address | ) ) | detail | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 端口名称支持物理端口，聚合端口， 环回端口，VLAN 端口，隧道端口 |
| address | 邻居地址 |
| detail | 详细信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看稀疏模式下的邻居信息:
Switch# show ip pim sparse-mode neighbor
Neighbor          Interface          Uptime/Expires     Ver   DR
Address                                                       Priority/Mode
12.0.9.2          eth-0-9            00:18:18 /00:01:20 v2    1 / DR
```

**相关命令**：无

### 8.4.32 `show ip pim sparse-mode rp mapping`

**功能**：使用此命令查看多播组与RP 的对应关系。

**语法**：

```
show ip pim sparse-mode rp mapping
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看多播组与RP 的映射关系:
Switch# show ip pim sparse-mode rp mapping
PIM group-to-RP mappings
Group(s): 224.0.0.0/4
  RP: 12.0.9.2
    Info source: 12.0.9.2, via bootstrap, priority 192
         Uptime: 00:22:56, expires: 00:01:34
```

**相关命令**：无

### 8.4.33 `show ip pim sparse-mode rp-hash`

**功能**：使用此命令查看指定多播组的RP 信息。

**语法**：

```
show ip pim sparse-mode rp-hash GRP_ADDR
```

| 参数 | 说明 |
| --- | --- |
| GRP_ADDR | 组播组地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看多播组224.0.0.10 的RP 信息:
Switch# show ip pim sparse-mode rp-hash 224.0.0.10
    RP: 12.0.9.2
    Info source: 12.0.9.2, via bootstrap
```

**相关命令**：无

### 8.4.34 `show ip pim sparse-mode spt-threshold`

**功能**：使用此命令查看从共享树切换为最短路径树的阈值。

**语法**：

```
show ip pim sparse-mode spt-threshold
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看从共享树切换为最短路径树的阈值:
Switch# show ip pim sparse-mode spt-threshold
PIM spare-mode immediately switches over to SPT upon receiving the first traffic
```

**相关命令**：无

### 8.4.35 `show ip pim dense-mode interface`

**功能**：使用此命令查看从PIM-DM 的接口信息。

**语法**：

```
show ip pim dense-mode interface ( detail | )
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看PIM-DM 的接口信息:
Switch# show ip pim dense-mode interface
Address          Interface VIFIndex Ver/   Nbr
                                    Mode   Count
2.2.2.1          eth-0-2   0        v2/D   0
3.3.3.1          eth-0-3   2        v2/D   0
```

**相关命令**：无

### 8.4.36 `show ip pim dense-mode mroute`

**功能**：使用此命令查看从PIM-DM 的组播路由表。

**语法**：

```
show ip pim dense-mode mroute
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看PIM-DM 的组播路由表:
Switch# show ip pim dense-mode mroute
PIM-DM Multicast Routing Table
(2.2.2.2, 225.1.2.3)
  Source directly connected on eth-0-2
  State-Refresh Originator State: Originator
  Upstream IF: eth-0-2
    Upstream State: Forwarding
    Assert State: NoInfo
  Downstream IF List:
    eth-0-3, in 'olist':
      Downstream State: NoInfo
      Assert State: NoInfo
(2.2.2.2, 225.1.2.4)
  Source directly connected on eth-0-2
  State-Refresh Originator State: Originator
  Upstream IF: eth-0-2
    Upstream State: Forwarding
    Assert State: NoInfo
  Downstream IF List:
    eth-0-3, in 'olist':
      Downstream State: NoInfo
      Assert State: NoInfo
```

**相关命令**：无

### 8.4.37 `show ip pim dense-mode neighbor`

**功能**：使用此命令查看从PIM-DM 的邻居。

**语法**：

```
show ip pim sparse-mode neighbor ( detail | )
```

| 参数 | 说明 |
| --- | --- |
| detail | 显示详细的信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看PIM-DM 的邻居:
Switch# show ip pim dense-mode neighbor
Neighbor-Address Interface          Uptime/Expires    Ver
4.4.4.4          eth-0-9            03d19h16m/00:01:29 v2
3.3.3.2          agg3               03d19h17m/00:01:37 v2
```

**相关命令**：无

### 8.4.38 `show ip pim dense-mode nexthop`

**功能**：使用此命令查看从PIM-DM 的下一跳信息。

**语法**：

```
show ip pim sparse-mode nexthop
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看PIM-DM 的下一跳信息:
Switch# show ip pim dense-mode nexthop
Destination      Nexthop   Nexthop         Nexthop          Metric Pref
                 Num       Addr            Interface
1.1.1.2         0         -               -                 -      -
```

**相关命令**：无

### 8.4.39 `show ip pim dense-mode interface`

**功能**：使用此命令查看从PIM-DM 的接口信息。

**语法**：

```
show ip pim dense-mode interface ( detail | )
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看PIM-DM 的接口信息:
Switch# show ip pim dense-mode interface
Address          Interface VIFIndex Ver/   Nbr

                                    Mode   Count
2.2.2.1          eth-0-2   0        v2/D   0
3.3.3.1          eth-0-3   2        v2/D   0
```

**相关命令**：无

### 8.4.40 `show ip pim dense-mode mroute`

**功能**：使用此命令查看从PIM-DM 的组播路由表。

**语法**：

```
show ip pim dense-mode mroute
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看PIM-DM 的组播路由表:
Switch# show ip pim dense-mode mroute
PIM-DM Multicast Routing Table
(2.2.2.2, 225.1.2.3)
  Source directly connected on eth-0-2
  State-Refresh Originator State: Originator
  Upstream IF: eth-0-2
    Upstream State: Forwarding
    Assert State: NoInfo
  Downstream IF List:
    eth-0-3, in 'olist':
      Downstream State: NoInfo
      Assert State: NoInfo
(2.2.2.2, 225.1.2.4)
  Source directly connected on eth-0-2
  State-Refresh Originator State: Originator
  Upstream IF: eth-0-2
    Upstream State: Forwarding

    Assert State: NoInfo
  Downstream IF List:
    eth-0-3, in 'olist':
      Downstream State: NoInfo
      Assert State: NoInfo
```

**相关命令**：无

### 8.4.41 `show ip pim sparse-mode nexthop-virtual-pair`

**功能**：使用此命令查看从PIM 下一跳地址和对应虚地址的映射关系。

**语法**：

```
show ip pim sparse-mode nexthop-virtual-pair
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看从PIM 下一跳地址和对应虚地址的映射关系:
Switch# show ip pim sparse-mode nexthop-virtual-pair
pim nexthop address  virtual address
10.1.1.2             20.1.1.2
```

**相关命令**：无

### 8.4.42 `ip pim nexthop-address`

**功能**：使用此命令PIM 邻居下一跳地址对应的虚IP 地址，使用关键字no 取消配置。

**语法**：

```
ip pim nexthop-address NEXTHOP-ADDRESS virtual-address VIRTUAL-ADDRESS
no ip pim nexthop-address ( NEXTHOP-ADDRESS | )
```

| 参数 | 说明 |
| --- | --- |
| NEXTHOP-ADDRESS | 下一跳地址 IPv4 地址 |
| VIRTUAL-ADDRESS | 虚地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

当组播邻居建立使用的是VRRP 虚地址，RP 收到组播源DR 的Register 报文，会向组
  播源进行RPF 检查，根据单播路由，RPF 检查的下一
  跳为接口实地址，而这个接口实地址是没有组播邻居表项的，此命令可以配置PIM 在
  查询下一跳的时候使用对应的虚地址。
  该命令用来启动pim-sm 与vrrp 的联动，当使能或者去使能 ip pim virtual address 时，
  需要到对应ip pim bsr 候选接口上
  shutdown 和no shutdown 该接口，才能使得配置生效。
  当使能后，可以通过手动disable 和 enable vrrp 来代替shutdown 和 no shutdown 接
  口。

**示例**：

```
配置PIM 下一跳地址与虚地址的对应关系:
Switch# configure terminal
Switch(config-if)# ip pim nexthop-address 10.1.1.2 virtual-address 20.1.1.2
取消PIM 下一跳地址与虚地址的对应关系配置:
Switch# configure terminal
Switch(config-if)# no ip pim nexthop-address
```

**相关命令**：无

### 8.4.43 `show ip pim graceful-restart`

**功能**：使用此命令查看PIM-SM 平滑重启状态。

**语法**：

```
show ip pim graceful-restart
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看PIM 协议平滑重启状态。:
Switch# show ip pim graceful-restart
PIMSM Graceful Restart enabled with GR period 300 seconds
  Current runnig status is Not at restart period
```

**相关命令**：无、8.5 MVR 命令


## 8.5 MVR 命令

### 8.5.1 `mvr`

**功能**：此命令用来使能MVR。使用关键字no 去使能MVR。

**语法**：

```
mvr

no mvr
```

**命令模式**：全局配置模式

**默认配置**：不使能

**使用说明**：

在交换机上使能MVR，在使能MVR 前，组播路由功能需要关闭。

**示例**：

```
在交换机上使能MVR:
Switch# configure terminal
Switch(config)# no ip multicast-routing
Switch(config)# mvr
```

**相关命令**：show mvr

### 8.5.2 `mvr vlan`

**功能**：此命令用来指定MVR 的源VLAN。使用关键字no 删除此配置。

**语法**：

```
mvr vlan vlan VLAN_ID
no mvr vlan
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

在指定MVR 的源VLAN 前，该VLAN 的vlan interface 需要先创建起来。

**示例**：

```
下面的例子用来说明如何配置MVR 的源VLAN:
Switch# configure terminal
Switch(config)# vlan database
Switch(config-vlan)# vlan 2
Switch(config)# interface vlan 2
Switch(config-if)# exit
Switch(config)# mvr vlan 2
```

**相关命令**：interface vlan

### 8.5.3 `mvr group`

**功能**：此命令用来设置MVR 全局group。使用关键字no 删除此配置。

**语法**：

```
mvr group IP_ADDR ( COUNT | )
no mvr group address ( COUNT | )
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 组播组地址 IPv4 地址 |
| COUNT | 要配置的组播组数目 1-64 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

此命令用来设置MVR 全局group。

**示例**：

```
下面例子显示如何在端口上创建一条统计 下面的例子说明如何来创建50 个静态group,
范围是238.255.0.1~238.255.0.50:
Switch# configure terminal
Switch(config)# mvr group 238.255.0.1 50
```

**相关命令**：无

### 8.5.4 `mvr source-address`

**功能**：此命令用来设置MVR 源地址。使用关键字no 删除此配置。

**语法**：

```
mvr source-address IP_ADDR
no mvr source-address
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | MVR 上报组播报文的源地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：10.0.0.1

**使用说明**：

无

**示例**：

```
设置MVR 源地址为192.168.11.1:
Switch# configure terminal
Switch(config)# mvr source-address 192.168.11.1
恢复MVR 源地址为默认地址:

Switch# configure terminal
Switch(config)# no mvr source-address
```

**相关命令**：无

### 8.5.5 `mvr type`

**功能**：此命令用来设置交换机端口作为MVR 的源端口或者接收端口。使用关键字no 删除此
  配置。

**语法**：

```
mvr type ( source | receiver vlan VLAN_ID )
no mvr type ( receiver vlan VLAN_ID | )
```

| 参数 | 说明 |
| --- | --- |
| source | MVR 源端口 |
| receiver | MVR 接收端口 |
| VLAN_ID | MVR 接收VLAN ID 1-4094 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

在配置某个端口作为MVR 的源端口或接收端口时，源端口必须在MVR 源VLAN 中，
  接收端口必须不在MVR 的源VLAN 中。

**示例**：

```
下面的例子将eth-0-1 配置成MVR 的源端口，eth-0-2 配置成VLAN2 中的接收端口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# mvr type source
Switch(config)# interface eth-0-2
Switch(config-if)# mvr type receiver vlan 2
```

**相关命令**：无

### 8.5.6 `show mvr`

**功能**：此命令用来显示MVR 相关的信息。

**语法**：

```
show mvr
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

显示MVR 相关信息。

**示例**：

```
下面例子显示MVR 相关的信息:
Switch# show mvr
MVR Running: TRUE
MVR Multicast VLAN: 10
MVR Source-address: 1.1.1.1
MVR Max Multicast Groups: 512
MVR Hw Rt Limit: 511
MVR Current Multicast Groups: 0
```

**相关命令**：无

### 8.5.7 `show mvr interface`

**功能**：此命令用来显示MVR 端口相关的信息。

**语法**：

```
show mvr interface
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

显示MVR 端口相关的信息。

**示例**：

```
下面例子显示MVR 端口相关的信息:
Switch# show mvr interface
Port        Type          VLAN    Status
eth-0-2     source        10      ACTIVE
eth-0-1     receiver      11      ACTIVE
```

**相关命令**：无

### 8.5.8 `show mvr group`

**功能**：此命令用来显示从MVR 接收端口上学习到组播组信息。

**语法**：

```
show mvr group vlan VLAN_ID ( GRP_ADDR | )
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | MVR 接收VLAN ID 1-4094 |
| GRP_ADDR | 组播组地址 IPv4 地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

显示从MVR 接收端口上学习到的组播组信息。

**示例**：

```
下面例子显示如何从MVR 接收端口上学习到组播组信息:
Switch# show mvr groups
VLAN   Interface      Group-Address      Uptime     Expires-time
11     eth-0-1        227.0.0.1          00:25:51   00:04:19
```

**相关命令**：无

### 8.5.9 `show mvr group static`

**功能**：此命令用来显示MVR 全局配置的静态组播组信息。

**语法**：

```
show mvr group static global
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

显示MVR 全局配置的静态组播组信息。

**示例**：

```
下面例子显示MVR 全局配置的静态组播组信息:
Switch# show mvr groups static global
MVR Static Global Group:
227.0.0.1

227.0.0.2
227.0.0.3
227.0.0.4
227.0.0.5
227.0.0.6
227.0.0.7
227.0.0.8
227.0.0.9
227.0.0.10
```

**相关命令**：无

### 8.5.10 `show resource mvr`

**功能**：此命令用于显示MVR 的资源使用情况。

**语法**：

```
show resource mvr
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示MVR 的资源使用情况:
Switch# show resource mvr
MVR
Resource                         Used          Capability
=============================================================
MVR Entry                        0             511
MVR Member                       0             1022
```

**相关命令**：无、、9 IPv6 组播命令、9.1 IPv6 组播路由命令

