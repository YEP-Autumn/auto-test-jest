# 9 IPv6 组播命令

## 9.1 IPv6 组播路由命令

### 9.1.1 `Ipv6 multicast-routing`

**功能**：使用此命令启用交换机的IPv6 多播路由功能。使用关键字no 禁用此功能。

**语法**：

```
ipv6 multicast-routing
no ipv6 multicast-routing
```

**命令模式**：全局配置模式

**默认配置**：开启

**使用说明**：

无

**示例**：

```
启用交换机的IPv6 多播路由功能:
Switch# configure terminal
Switch(config)# ipv6 multicast-routing
禁用交换机的IPv6 多播路由功能:
Switch# configure terminal
Switch(config)# no ipv6 multicast-routing
```

**相关命令**：无

### 9.1.2 `ipv6 multicast route-limit`

**功能**：使用此命令设置IPv6 组播路由的最大数目。使用关键字no 恢复此项设置为默认值。

**语法**：

```
ipv6 multicast route-limit LIMIT ( THRESHOLD | )
no ipv6 multicast route-limit
```

| 参数 | 说明 |
| --- | --- |
| LIMIT | 组播路由的最大数目 1-2048 |
| THRESHOLD | 超过阈值时生成警告消息， 这个阈值应小于或等于组播路由的最大数量 1-2048 |

**命令模式**：全局配置模式

**默认配置**：默认IPv6 组播路由最大数目为2048。 默认阈值应为IPv6 组播路由的最大数量相同。

**使用说明**：

无

**示例**：

```
设置IPv6 组播路由的最大数目为512:
Switch# configure terminal
Switch(config)# ipv6 multicast route-limit 512
设置IPv6 组播路由的最大数目为默认值:
Switch# configure terminal
Switch(config)# no ipv6 multicast route-limit
```

**相关命令**：show ipv6 mroute route-limit

### 9.1.3 `show ipv6 mroute`

**功能**：使用此命令查看多播路由表。

**语法**：

```
show ipv6 mroute ( sparse | ) ( count | summary | )
show ipv6 mroute IPV6_ADDR ( sparse | ) ( count | summary | )
show ipv6 mroute route-limit
```

| 参数 | 说明 |
| --- | --- |
| sparse | 查看稀疏模式的多播路由 |
| count | 查看路由和数据包的统计情况 |
| summary | 查看多播路由的总体情况 |
| IPV6_ADDR | 源IP 地址或者组播IP 地址；查看此地址的路由 IPv6 地址 |
| route-limit | 查看路由数目的最大值 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示组播路由表信息:
Switch# show ipv6 mroute
IPv6 Multicast Routing Table
Flags: I - Immediate Stat, T - Timed Stat, F - Forwarder installed

Timers: Uptime/Stat Expiry
Interface State: Interface
2001:1::1234, ff0e::1234:5678
uptime 00:00:02, stat expires 00:03:28
Owner PIM-SMv6, Flags: TF
  Incoming interface: eth-0-1
  Outgoing interface list:
    Register
    eth-0-2
下面例子显示组播路由表总体信息:
Switch# show ipv6 mroute summary
IPv6 Multicast Routing Table
Flags: I - Immediate Stat, T - Timed Stat, F - Forwarder installed
Timers: Uptime/Stat Expiry
Interface State: Interface
2001:1::1234, ff0e::1234:5678
    00:01:04/00:02:26, PIM-SMv6, Flags: TF
```

**相关命令**：ipv6 multicast route-limit、ipv6 mroute-rpf

### 9.1.4 `show ipv6 mif`

**功能**：使用此命令查看IPv6 的多播接口信息。

**语法**：

```
show ipv6 mif ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称支持 物理端口，聚合端口，环回端口，VLAN 端口和隧道端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子查看所有IPv6 多播接口信息:
Switch# show ipv6 mif
Interface   Mif   Owner                 Uptime
            Idx   Module
eth-0-1     0     PIM-SMv6              00:00:05
Register    1     PIM-SMv6              00:00:05
```

**相关命令**：ipv6 pim sparse-mode

### 9.1.5 `show ipv6 multicast groups count`

**功能**：此命令用于显示IPv6 组播组数目。

**语法**：

```
show ipv6 multicast groups count
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子查看当前的IPv6 组播组数目:
Switch# show ipv6 multicast groups count
multicast group record count:  1
multicast source record count: 0
multicast total record count:  1
multicast max record count:    2048
```

**相关命令**：无

### 9.1.6 `show resource mcast6`

**功能**：此命令用于显示IPv6 组播路由资源使用情况。

**语法**：

```
show resource mcast6
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示IPv6 组播路由资源使用情况:
Switch# show resource mcast6
MCAST
Resource                         Used          Capability
=============================================================
Mcast Entry                      0             224
Mcast Member                     0             1792
```

**相关命令**：无

### 9.1.7 `clear ipv6 mroute`

**功能**：此命令用于显示IPv6 组播路由表的信息

**语法**：

```
clear ipv6 mroute ( * | GRP_IPV6_ADDR ( SRC_IPV6_ADDR ) | )
```

| 参数 | 说明 |
| --- | --- |
| GRP_IPV6_ADDR | 指定组播组地址 IPv6 地址 |
| SRC_IPV6_ADDR | 指定组播源地址 IPv6 地址 * 所有组播组 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子清除所有IPv6 组播路由:
Switch# clear ipv6 mroute *
```

**相关命令**：show ipv6 mroute、9.2 MLD 命令


## 9.2 MLD 命令

### 9.2.1 `ipv6 mld access-group`

**功能**：此命令根据访问控制列表对加入IPv6 组播组的主机或可以加入的IPv6 组播组进行限制。
  使用关键字no 取消此种限制。

**语法**：

```
ipv6 mld access-group LISTNAME

no ipv6 mld access-group
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | 访问控制列表名称不超过20 字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

假如ACE 的行为是拒绝, 数据包将会被忽略; 此外, ACE 的行为如果允许的话,那么数据
  包正常转发。

**示例**：

```
在VLAN1 的端口上根据访问控制列表acl1 对可加入IPv6 组播组的主机和可加入的
IPv6 组播组进行限制:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ipv6 mld access-group acl1
取消在VLAN1 的端口上的限制:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ipv6 mld access-group
```

**相关命令**：show ipv6 mld interface

### 9.2.2 `ipv6 mld immediate-leave group-list`

**功能**：此命令根据访问控制列表限制可快速离开的主机和主机可快速离开的IPv6 组播组。使
  用关键字no 取消此种限制。

**语法**：

```
ipv6 mld immediate-leave group-list LISTNAME
no ipv6 mld immediate-leave
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | 访问控制列表名称 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

假如ACE’s 的行为是拒绝, 数据包将会被忽略; 此外, ACE’s 的行为如果允许的话,那么数
  据包正常转发。

**示例**：

```
在VLAN1 端口上限制可快速离开的主机和主机可快速离开的IPv6 组播组:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ipv6 mld immediate-leave group-list acl1
在VLAN1 端口上取消此种限制:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ipv6 mld immediate-leave group-list
```

**相关命令**：show ipv6 mld interface

### 9.2.3 `ipv6 mld last-member-query-count`

**功能**：使用此命令设置当IPv6 组播组的最后一个成员离开后所发送的特定组查询报文的数量；
  如果在发送完所有的成员查询报文后，仍然没有收到成员报告报文，则端口会退出此
  IPv6 多播组。使用关键字no 恢复成员查询报文的数量为默认值。

**语法**：

```
ipv6 mld last-member-query-count COUNT
no ipv6 mld last-member-query-count
```

| 参数 | 说明 |
| --- | --- |
| COUNT | 特定组查询报文的数目，范围是2 到7 2-7 |

**命令模式**：端口配置模式

**使用说明**：

无

**示例**：

```
设置发送成员查询报文的最大数目为5:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ipv6 mld last-member-query-count 5
恢复发送成员查询报文的数目为默认值:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ipv6 mld last-member-query-count
```

**相关命令**：show ipv6 mld interface、ipv6 mld last-member-query-interval

### 9.2.4 `ipv6 mld last-member-query-interval`

**功能**：使用此命令设置当IPv6 组播组的最后一个成员离开后，发送特定组查询报文的间隔。
  使用关键字no 恢复此间隔为默认值。

**语法**：

```
ipv6 mld last-member-query-interval INTERVAL
no ipv6 mld last-member-query-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 查询间隔，单位为毫秒 1000-25500 |

**命令模式**：端口配置模式

**默认配置**：1000 毫秒

**使用说明**：

无

**示例**：

```
设置当仅存最后一个成员时的查询间隔:
Switch# configure terminal
Switch(config)# ipv6 mld snooping last-member-query-interval 2000
恢复端口发送组成员查询报文的时间间隔默认值:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping last-member-query-interval
```

**相关命令**：show ipv6 mld interface、ipv6 mld last-member-query-count

### 9.2.5 `ipv6 mld limit`

**功能**：使用此命令设置全局或端口上可加入的IPv6 组播组的最大个数。使用关键字no 恢复
  此设置为默认值。

**语法**：

```
ipv6 mld limit NUMBER ( except LISTNAME | )
no ipv6 mld limit
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | 全局或端口上可加入的组播1-4096 组的最大个数 |
| LISTNAME | 组播组在这个访问控制列表中时不做数目限制不超过20 字符的字符串 |

**命令模式**：全局配置模式 端口配置模式

**使用说明**：

默认情况下，端口可加入的组播组的最大数目是4096。
  在全局配置模式下，设置所有端口可加入的IPv6 组播组的最大数目。
  在端口配置模式下，设置此端口可加入的IPv6 组播组的最大数目。

**示例**：

```
设置所有端口可加入的IPv6 组播组的最大个数为1000:
Switch# configure terminal
Switch(config)# ipv6 mld limit 1000
设置所有端口可加入的IPv6 组播组的最大个数为默认值:
Switch# configure terminal
Switch(config)# no ipv6 mld limit
```

**相关命令**：show ipv6 mld interface

### 9.2.6 `ipv6 mld mroute-proxy`

**功能**：使用此命令设置本端口的MLD 代理的上行端口。

**语法**：

```
ipv6 mld mroute-proxy IFNAME
no ipv6 mld mroute-proxy IFNAME
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 端口名称，指定的上行端口 支持 物理端口，聚合端口，环回端口，VLAN 端口和隧道端口 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

一个端口只能设置一个上行代理端口。多次设置时，后面的设置会覆盖前面的设置。

**示例**：

```
设置本端口的上行代理端口为eth-0-1:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ipv6 mld mroute-proxy eth-0-1
删除本端口的上行代理端口:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ipv6 mld mroute-proxy
```

**相关命令**：ipv6 mld proxy-service

### 9.2.7 `ipv6 mld proxy-service`

**功能**：使用此命令启用端口的MLD 代理服务。使用关键字no 关闭此服务。

**语法**：

```
ipv6 mld proxy-service
no ipv6 mld proxy-service
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

此命令与ipv6 mld mroute-proxy 配合使用，用来设定交换机的MLD 代理上联口。

**示例**：

```
启用此端口的MLD 代理服务的上联口:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ipv6 mld proxy-service
关闭此此端口作为MLD 代理服务的上联口:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ipv6 mld proxy-service
```

**相关命令**：ipv6 mld mroute-proxy

### 9.2.8 `ipv6 mld querier-timeout`

**功能**：使用此命令设置Querier 的超时时间。使用关键字no 恢复此超时时间为默认值。

**语法**：

```
ipv6 mld querier-timeout INTERVAL
no ipv6 mld querier-timeout
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 超时时间，以秒为单位，范围是60 到300 秒 60-300 |

**命令模式**：端口配置模式

**默认配置**：255 秒

**使用说明**：

无

**示例**：

```
设置Querier 的超时时间为100 秒:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ipv6 mld querier-timeout 100
恢复Querier 的超时时间为默认值:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ipv6 mld querier-timeout
```

**相关命令**：ipv6 mld query-interval、ipv6 mld query-max-response-time

### 9.2.9 `ipv6 mld query-interval`

**功能**：使用此命令设置端口发送Querier 查询报文的时间间隔。使用关键字no 恢复此时间间
  隔为默认值。

**语法**：

```
ipv6 mld query-interval INTERVAL
no ipv6 mld query-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 端口发送Querier 查询报文的时间间隔，以秒为单位， 范围是2 到18000 秒 2-18000 |

**命令模式**：端口配置模式

**默认配置**：125 秒

**使用说明**：

无

**示例**：

```
设置发送Querier 查询报文的时间间隔为300 秒:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ipv6 mld query-interval 300
恢复发送Querier 查询报文的时间间隔为默认值:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ipv6 mld query-interval
```

**相关命令**：ipv6 mld querier-timeout、ipv6 mld query-max-response-time

### 9.2.10 `ipv6 mld query-max-response-time`

**功能**：使用此命令设置查询报文的最大响应时间；要求成员在此时间范围内必须响应一个报
  告消息。使用关键字no 恢复此最大响应时间为默认值。

**语法**：

```
ipv6 mld query-max-response-time INTERVAL
no ipv6 query-max-response-time
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 查询报文的最大响应时间， 以秒为单位，范围是1 到 25 秒 1-25 |

**命令模式**：端口配置模式

**默认配置**：10 秒

**使用说明**：

必须小于igmp query interval 的时间。

**示例**：

```
设置查询报文的最大响应时间为20 秒:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ipv6 mld query-max-response-time 20
恢复此最大响应时间为默认值:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ipv6 mld query-max-response-time
```

**相关命令**：ipv6 mld querier-timeout、ipv6 mld query-interval

### 9.2.11 `ipv6 mld robustness-variable`

**功能**：使用此命令设置MLD 查询器的健壮系数。使用关键字no 恢复此项设置为默认值。

**语法**：

```
ipv6 mld robustness-variable VALUE
no ipv6 robustness-variable
```

| 参数 | 说明 |
| --- | --- |
| VALUE | 设定MLD 报文的健壮程度，范围是2 到7 2-7 |

**命令模式**：端口配置模式

**使用说明**：

无

**示例**：

```
设置MLD 查询器的健壮系数为6:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ipv6 mld robustness-variable 6
恢复此设置到默认值:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ipv6 mld robustness-variable
```

**相关命令**：show ipv6 mld interface

### 9.2.12 `ipv6 mld version`

**功能**：使用此命令设定端口使用的MLD 协议的版本。使用关键字no 恢复端口所使用的版本
  为默认值。

**语法**：

```
ipv6 mld version NUMBER
no ipv6 version
```

| 参数 | 说明 |
| --- | --- |
| NUMBER | 设置端口使用的IGMP 协议版本 1-2 |

**命令模式**：端口配置模式

**使用说明**：

无

**示例**：

```
设定端口使用的MLD 协议的版本为version 2:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# ipv6 mld version 2
设定端口使用的MLD 协议的版本为默认值:
Switch# configure terminal
Switch(config)# interface vlan 1
Switch(config-if)# no ipv6 mld version
```

**相关命令**：show ipv6 mld interface

### 9.2.13 `ipv6 mld static-group`

**功能**：此命令用来设置或删除端口上的静态组播组。

**语法**：

```
ipv6 mld static-group GRP_IPV6_ADDR ( source SRC_IPV6_ADDR | )
no ipv6 mld static-group GRP_IPV6_ADDR ( source SRC_IPV6_ADDR | )
```

| 参数 | 说明 |
| --- | --- |
| GRP_IPV6_ADDR | 组播组地址 IPv6 地址 |
| SRC_IPV6_ADDR | 组播源地址 IPv6 地址 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子说明如何在接口上配置静态组播组:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 mld static-group ff0e::1234
Switch(config-if)# ipv6 mld static-group ff0e::1234 source 2001::2
下面的例子说明如何删除接口上配置的静态组播组:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no ipv6 mld static-group ff02::1234
```

**相关命令**：show ipv6 mld groups

### 9.2.14 `ipv6 mld ssm-map enable`

**功能**：此命令用来使能MLD ssm-mapping 功能。使用关键字no 禁用此功能。

**语法**：

```
ipv6 mld ssm-map enable
no ipv6 mld ssm-map enable
```

**命令模式**：全局配置模式

**默认配置**：关闭

**使用说明**：

无

**示例**：

```
使能MLD ssm-mapping 功能:
Switch# configure terminal
Switch(config)# ipv6 mld ssm-map enable
关闭MLD ssm-mapping 功能:
Switch# configure terminal
Switch(config)# no ipv6 mld ssm-map enable
```

**相关命令**：无

### 9.2.15 `ipv6 mld ssm-map static`

**功能**：此命令用来设置MLD ssm-mapping 的规则。使用关键字no 删除ssm-mapping 规则。

**语法**：

```
ipv6 mld ssm-map static LISTNAME SRC_IPV6_ADDR
no ipv6 mld ssm-map static LISTNAME SRC_IPV6_ADDR
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | 访问控制列表，指定组播组范围不超过20 字符的字符串 |
| SRC_IPV6_ADDR | 组播源地址 IPv6 地址 |

**命令模式**：全局配置模式

**默认配置**：关闭

**使用说明**：

无

**示例**：

```
设置在ipacl 中的group 映射的source 地址为2001::2:

Switch# configure terminal
Switch(config)# ipv6 mld ssm-map static ipacl 2001::2
取消在ipacl 中的group 的映射的source 地址为2001::2:
Switch# configure terminal
Switch(config)# no ipv6 mld ssm-map static ipacl 2001::2
```

**相关命令**：无

### 9.2.16 `clear ipv6 mld`

**功能**：此命令清除动态学习的IPv6 组播组信息。

**语法**：

```
clear ipv6 mld group ( * | IPV6_ADDR )
```

| 参数 | 说明 |
| --- | --- |
| IPV6_ADDR | 指定IPv6 组播组地址 IPv6 地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示如何删除所有的组播组信息:
Switch# clear ipv6 mld
Switch# clear ipv6 mld group *
下面例子显示如何删除组播组ff02::1234:
Switch# clear ipv6 mld group ff02::1234
```

**相关命令**：show ipv6 mld groups

### 9.2.17 `clear ipv6 mld interface`

**功能**：此命令清除指定端口上动态学习的IPv6 组播组信息。

**语法**：

```
clear ipv6 mld ( group IPV6_ADDR | interface ) IFNAME
```

| 参数 | 说明 |
| --- | --- |
| IPV6_ADDR | 指定IPv6 组播组地址 IPv6 地址 |
| IFNAME | 指定接口名称支持 物理端口，聚合端口，环回端口，VLAN 端口和隧道端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示如何清除端口eth-0-1 上动态IPv6 组播组信息:
Switch# clear ipv6 mld group interface eth-0-1
```

**相关命令**：show ipv6 mld groups

### 9.2.18 `show ipv6 mld groups`

**功能**：此命令用于显示IPv6 组播组信息。

**语法**：

```
show ipv6 mld groups IPV6_ADDR ( detail | )
```

| 参数 | 说明 |
| --- | --- |
| IPV6_ADDR | 指定IPv6 组播组地址 IPv6 地址 |
| detail | IPv6 组播组详细信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示组播组的详细信息:
Switch# show ipv6 mld groups detail
MLD Connected Group Membership Details for eth-0-2
Interface:      eth-0-2
Group:          ff0e::1234:5678
Uptime:         00:00:10
Group mode:     Exclude (Expires: 00:04:10)
Last reporter:  fe80:1111:1111:1111:1111:1111:1111:1111
Source list is empty
```

**相关命令**：无

### 9.2.19 `show ipv6 mld groups interface`

**功能**：此命令用于显示端口的IPv6 组播组信息。

**语法**：

```
show ipv6 mld groups IFNAME ( IPV6_ADDR | ) ( detail | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称支持 物理端口，聚合端口，环回端口，VLAN 端口和隧道端口 |
| IPV6_ADDR | 指定IPv6 组播组地址 IPv6 地址 |
| detail | IPv6 组播组详细信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示接口eth-0-1 上的组播组信息:
Switch# show ipv6 mld groups eth-0-1
MLD Connected Group Membership
Group Address                           Interface            Expires
ff0e::1234:5678                         eth-0-2              00:03:01
```

**相关命令**：无

### 9.2.20 `show ipv6 mld groups count`

**功能**：此命令用于显示组播组数目。

**语法**：

```
show ipv6 mld groups ( IFNAME | ) count
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称支持 物理端口，聚合端口，环回端口，VLAN 端口和隧道端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示端口eth-0-1 上的组播组数目:
Switch# show ipv6 mld groups eth-0-1 count
Dynamic multicast groups count: 1
Static multicast groups count: 0
Total multicast groups count: 1
```

**相关命令**：无

### 9.2.21 `show ipv6 mld interface`

**功能**：此命令用于查看组播组端口的信息。

**语法**：

```
show ipv6 mld interface ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称支持 物理端口，聚合端口，环回端口，VLAN 端口和隧道端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看端口eth-0-1 的多播设置信息:
Switch# show ipv6 mld interface eth-0-1
Interface eth-0-1 (Index 1)
MLD Active, Querier, Version 1 (default)
Internet address is fe80::9c7c:7eff:fe94:8300
MLD interface has 0 group-record states
MLD activity: 0 joins, 0 leaves
MLD query interval is 125 seconds
MLD querier timeout is 255 seconds
MLD max query response time is 10 seconds
Last member query response interval is 1000 milliseconds
Group Membership interval is 260 seconds
```

**相关命令**：无、、9.3 MLD Snooping 命令


## 9.3 MLD Snooping 命令

### 9.3.1 `ipv6 mld snooping`

**功能**：使用此命令启用MLD Snooping 使用关键字no 关闭此项功能。

**语法**：

```
ipv6 mld snooping ( vlan VLAN_ID | )
no ipv6 mld snooping ( vlan VLAN_ID | )
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：全局配置模式

**默认配置**：去使能

**使用说明**：

在全局配置模式下或者VLAN 模式下启用Mld Snooping。
  默认，mld snooping 不启用。

**示例**：

```
全局启用MLD Snooping 功能:
Switch# configure terminal
Switch(config)# ipv6 mld snooping
全局关闭MLD Snooping 功能:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping
VLAN 启用MLD Snooping 功能:
Switch# configure terminal
Switch(config)# ipv6 mld snooping vlan 10
VLAN 关闭MLD Snooping 功能:

Switch# configure terminal
Switch(config)# no ipv6 mld snooping vlan 10
```

**相关命令**：show ipv6 mld snooping

### 9.3.2 `ipv6 mld snooping fast-leave`

**功能**：使用此命令启用MLD snooping 成员快速离开功能。使用关键字no 关闭此功能。

**语法**：

```
ipv6 mld snooping ( vlan VLAN_ID | ) fast-leave
no ipv6 mld snooping ( vlan VLAN_ID | ) fast-leave
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
Switch(config)# ipv6 mld snooping fast-leave
关闭成员快速离开功能:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping fast-leave
```

**相关命令**：show ipv6 mld snooping global

### 9.3.3 `ipv6 mld snooping last-member-query-interval`

**功能**：使用此命令设置当仅存最后一个成员时的查询间隔。使用关键字no 恢复查询间隔为默
  认值。

**语法**：

```
ipv6 mld snooping ( vlan VLAN_ID | ) last-member-query-interval INTERVAL
no ipv6 mld snooping ( vlan VLAN_ID | ) last-member-query-interval
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| INTERVAL | 查询间隔，单位为毫秒 1000-25500 |

**命令模式**：全局配置模式

**默认配置**：1000 毫秒

**使用说明**：

支持每个Vlan 单独配置或者全局配置，默认为1000 毫秒

**示例**：

```
设置当仅存最后一个成员时的查询间隔:
Switch# configure terminal
Switch(config)# ipv6 mld snooping last-member-query-interval 2000
恢复查询间隔为默认值:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping last-member-query-interval
```

**相关命令**：show ipv6 mld snooping、show ipv6 mld snooping vlan

### 9.3.4 `ipv6 mld snooping global source-address`

**功能**：使用此命令设置MLD snooping 查询器源地址。

**语法**：

```
ipv6 mld snooping global source-address IPV6_ADDR
no ipv6 mld snooping global source-address
```

| 参数 | 说明 |
| --- | --- |
| IPV6_ADDR | 查询器源IP 地址 IPv6 地址 |

**命令模式**：全局配置模式

**默认配置**：默认IPv6 地址为 :: （全零地址）

**使用说明**：

VLAN 上没有配置查询器源地址时使用全局的查询器地址，VLAN 上配置了查询器地址
  后使用VLAN 上配置的查询器地址。

**示例**：

```
全局配置模式下配置查询器源IP 地址 fe80::1:
Switch# configure terminal
Switch(config)# ipv6 mld snooping global source-address fe80::1
恢复全局配置模式的查询器地址:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping global source-address
```

**相关命令**：show ipv6 mld snooping querier

### 9.3.5 `ipv6 mld snooping max-member-num`

**功能**：使用此命令设置MLD snooping 最大成员数目。使用关键字no 恢复此数目为默认值。

**语法**：

```
ipv6 mld snooping ( vlan VLAN_ID | ) max-member-num NUMBER
no ipv6 mld snooping ( vlan VLAN_ID | ) max-member-num
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| NUMBER | 最大成员数目 1-4096 |

**命令模式**：全局配置模式

**使用说明**：

无

**示例**：

```
设置MLD snooping 最大成员数目为1024 :
Switch# configure terminal
Switch(config)# ipv6 mld snooping max-member-num 1024
恢复MLD snooping 最大成员数目为默认值:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping max-member-num
```

**相关命令**：show ipv6 mld snooping global、show ipv6 mld snooping vlan

### 9.3.6 `ipv6 mld snooping query-interval`

**功能**：使用此命令设置成员查询的间隔。使用关键字no 恢复此间隔为默认值。

**语法**：

```
ipv6 mld snooping ( vlan VLAN_ID | ) query-interval INTERVAL
no ipv6 mld snooping ( vlan VLAN_ID | ) query-interval
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| INTERVAL | 成员查询间隔，以秒为单位，范围是2 到18000 2-18000 |

**命令模式**：全局配置模式

**默认配置**：125 秒

**使用说明**：

查询的间隔时间不能少于MLD snooping 查询最大的响应时间。

**示例**：

```
设置成员查询间隔为64 秒:
Switch# configure terminal
Switch(config)# ipv6 mld snooping query-interval 64
恢复成员查询间隔为默认值:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping query-interval
```

**相关命令**：show ipv6 mld snooping querier、show ipv6 mld snooping querier vlan

### 9.3.7 `ipv6 mld snooping query-max-response-time`

**功能**：使用此命令设置等待查询应答报文的超时时间。使用关键字no 恢复此超时时间为默认
  值。

**语法**：

```
ipv6 mld snooping ( vlan VLAN_ID | ) query-max-response-time TIME
no ipv6 mld snooping ( vlan VLAN_ID | ) query-max-response-TIME
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| TIME | 等待查询应答报文的超时时间，以秒为单位 1-25 |

**命令模式**：全局配置模式

**默认配置**：10 秒

**使用说明**：

查询应答时间不能少于MLD snooping 查询间隔。

**示例**：

```
设置等待查询应答报文的超时时间为15 秒:
Switch# configure terminal
Switch(config)# ipv6 mld snooping query-max-response-time 15
恢复此超时时间:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping query-max-response-time
```

**相关命令**：show ipv6 mld snooping querier、show ipv6 mld snooping querier vlan

### 9.3.8 `ipv6 mld snooping report-suppression`

**功能**：使用此命令设置端口对MLDv1/v2 的成员报告报文进行抑制。使用关键字no 取消对对
  MLDv1/v2 的成员报告报文的抑制。

**语法**：

```
ipv6 mld snooping ( vlan VLAN_ID | ) report-suppression
no ipv6 mld snooping ( vlan VLAN_ID | ) report-suppression
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：全局配置模式

**默认配置**：启用

**使用说明**：

MLD snooping 工作在v2 模式时，成员报告报文不进行抑制。

**示例**：

```
对MLDv1/MLDv2 的成员报告报文进行抑制:
Switch# configure terminal
Switch(config)# ipv6 mld snooping report-suppression
取消对MLDv1/MLDv2 的成员报告报文的抑制:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping report-suppression
```

**相关命令**：show ipv6 mld snooping、show ipv6 mld snooping vlan

### 9.3.9 `ipv6 mld snooping version`

**功能**：使用此命令指定运行的MLD 版本。使用关键字no 恢复运行的MLD 版本为默认值

**语法**：

```
ipv6 mld snooping ( vlan VLAN_ID | ) version VERSION
no ipv6 mld snooping ( vlan VLAN_ID | ) version
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| VERSION | MLD 版本，范围是1 到2 1-2 |

**命令模式**：全局配置模式

**默认配置**：默认MLD 版本为1

**使用说明**：

默认使用version 1

**示例**：

```
指定全局MLD snooping 运行MLDv2 模式下:
Switch# configure terminal
Switch(config)# ipv6 mld snooping version 2
```

**相关命令**：show ipv6 mld snooping、show ipv6 mld snooping vlan

### 9.3.10 `ipv6 mld snooping discard-unknown`

**功能**：使用此命令丢弃未知的IPv6 组播流量。使用no 命令恢复默认值。

**语法**：

```
ipv6 mld snooping ( vlan VLAN_ID | ) discard-unknown
no ipv6 mld snooping ( vlan VLAN_ID | ) discard-unknown
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
Switch(config)# ipv6 mld snooping discard-unknown
```

**相关命令**：show ipv6 mld snooping、show ipv6 mld snooping vlan

### 9.3.11 `ipv6 mld snooping querier tcn`

**功能**：使用此命令设置MLD snooping 的TCN 相关参数。使用关键字no 恢复默认值。

**语法**：

```
ipv6 mld snooping querier tcn ( enable | query-count COUNT | query-interval INTERVAL
| query-max-response-time TIME )
no ipv6 mld snooping querier tcn ( enable | query-count | query-interval | query-max-
response-time )
```

| 参数 | 说明 |
| --- | --- |
| enable | 使能MLD snooping 查询器 TCN 查询 |
| COUNT | MLD snooping 查询 TCN 查询次数，默认是2 1-10 |
| INTERVAL | MLD snooping 查询 TCN 查询间隔，默认是10 秒 1-255 秒 |
| TIME | MLD snooping 查询 TCN 查询最大响应时间，默认5 秒 1-9 秒 |

**命令模式**：全局配置模式

**默认配置**：默认使能，默认查询次数为2，默认查询间隔10 秒，默认最大响应时间5 秒

**使用说明**：

无

**示例**：

```
设置MLD Snooping Tcn 的查询次数为2 次:
Switch# configure terminal
Switch(config)# ipv6 mld snooping querier tcn query-count 2
```

**相关命令**：show ipv6 mld snooping querier

### 9.3.12 `ipv6 mld snooping vlan access-group`

**功能**：此命令用于设置允许加入的组播组范围。

**语法**：

```
ipv6 mld snooping vlan vlan_id access-group acl
no ipv6 mld snooping vlan vlan_id access-group
```

| 参数 | 说明 |
| --- | --- |
| vlan_id | VLAN id，范围是1 到 1-4094 |
| acl | 访问控制列表名称 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在VLAN 上设置运行加入的组播组范围是acl 中的组播组范围:
Switch# configure terminal
Switch(config)# ipv6 mld snooping vlan 10 access-group acl
取消VLAN10 上配置的组播组访问控制列表:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping vlan 10 access-group
```

**相关命令**：show ipv6 mld snooping vlan

### 9.3.13 `ipv6 mld snooping vlan mrouter interface`

**功能**：此命令用于静态配置VLAN 的IPv6 组播路由端口。

**语法**：

```
ipv6 mld snooping vlan VLAN_ID mrouter interface IFNAME
no ipv6 mld snooping vlan vlan_id mrouter interface IFNAME
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| IFNAME | 端口名称支持 物理端口，聚合端口，环回端口，VLAN 端口和隧道端口 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

指定的组播路由端口必须属于指定的VLAN。

**示例**：

```
将eth-0-1 设置成VLAN10 的组播路由端口:
Switch# configure terminal
Switch(config)# ipv6 mld snooping vlan 10 mrouter interface eth-0-1
取消VLAN10 上配置的组播路由端口eth-0-1:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping vlan 10 mrouter interface eth-0-1
```

**相关命令**：show ipv6 mld snooping vlan

### 9.3.14 `ipv6 mld snooping vlan mrouter-aging-interval`

**功能**：此命令用于设置动态组播路由端口老化的时间间隔。

**语法**：

```
ipv6 mld snooping vlan VLAN_ID mrouter-aging-interval INTERVAL
no ipv6 mld snooping vlan VLAN_ID mrouter-aging-INTERVAL
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| INTERVAL | 老化时间间隔，单位是秒 1-65535 |

**命令模式**：全局配置模式

**默认配置**：255 秒

**使用说明**：

无

**示例**：

```
设置VLAN 上的动态IPv6 组播路由端口老化间隔是100 秒:
Switch# configure terminal
Switch(config)# ipv6 mld snooping vlan 10 mrouter-aging-interval 100
恢复动态组播路由端口老化的时间间隔为默认值:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping vlan 10 mrouter-aging-interval
```

**相关命令**：show ipv6 mld snooping vlan

### 9.3.15 `ipv6 mld snooping vlan querier`

**功能**：此命令用于在VLAN 上使能IPv6 组播查询器功能。

**语法**：

```
ipv6 mld snooping vlan VLAN_ID querier
no ipv6 mld snooping vlan VLAN_ID querier
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
在VLAN10 上使能IPv6 组播查询器功能:
Switch# configure terminal
Switch(config)# ipv6 mld snooping vlan 10 querier
取消在VLAN 上使能组播查询器功能:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping vlan 10 querier
```

**相关命令**：show ipv6 mld snooping querier vlan

### 9.3.16 `ipv6 mld snooping vlan querier address`

**功能**：此命令用于设置VLAN 上IPv6 组播查询器的源地址。

**语法**：

```
ipv6 mld snooping vlan VLAN_ID querier address IPV6_ADDR
no ipv6 mld snooping vlan VLAN_ID querier address IPV6_ADDR
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| IPV6_ADDR | IPv6 组播查询器源地址 IPv6 地址 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

VLAN 上配置的IPv6 组播查询器源地址将覆盖全局的IPv6 组播查询器地址。

**示例**：

```
设置VLAN10 上组播查询器的源地址是fe80::1:
Switch# configure terminal
Switch(config)# ipv6 mld snooping vlan 10 querier address fe80::1
删除VLAN10 上组播查询器的源地址:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping vlan 10 querier address
```

**相关命令**：show ipv6 mld snooping querier vlan

### 9.3.17 `ipv6 mld snooping vlan querier-timeout`

**功能**：此命令用于设置VLAN 上查询器老化时间。使用关键字no 恢复默认配置。

**语法**：

```
ipv6 mld snooping vlan VLAN_ID querier-timeout INTERVAL
no ipv6 mld snooping vlan vlan_id querier-timeout
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| INTERVAL | 查询器老化时间间隔，单位是秒 60-300 |

**命令模式**：全局配置模式

**默认配置**：255 秒

**使用说明**：

无

**示例**：

```
设置VLAN10 上IPv6 组播查询器的源地址是2001::2:
Switch# configure terminal
Switch(config)# ipv6 mld snooping vlan 10 querier address 2001::2
恢复VLAN10 查询器老化间隔为默认值:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping vlan 10 querier-timeout
```

**相关命令**：show ipv6 mld snooping querier vlan

### 9.3.18 `ipv6 mld snooping vlan static-group`

**功能**：此命令用于设置VLAN 的成员端口加入IPv6 组播组或组播源组。使用关键字no 删除
  此配置。

**语法**：

```
ipv6 mld snooping vlan VLAN_ID static-group GRP_IPV6_ADDR ( source
SRC_IPV6_ADDR | ) interface IFNAME
no ipv6 mld snooping vlan VLAN_ID static-group GRP_IPV6_ADDR ( source
SRC_IPV6_ADDR | ) interface IFNAME
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| GRP_IPV6_ADDR | 组播组地址 IPv6 地址 |
| SRC_IPV6_ADDR | 组播源地址 IPv6 地址 |
| IFNAME | VLAN 的成员端口名称 |
| Support |  |
| physical/aggregation ports |  |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
设置VLAN10 查询器老化间隔为100 秒:
Switch# configure terminal
Switch(config)# ipv6 mld snooping vlan 10 querier-timeout 100
下面例子显示如何将VLAN10 的成员端口eth-0-11 加入组播组ff0e::1234:
Switch# configure terminal
Switch(config)# no ipv6 mld snooping vlan 10 static-group ff0e::1234 interface eth-
0-11
```

**相关命令**：show ipv6 mld snooping group

### 9.3.19 `clear ipv6 mld snooping group`

**功能**：此命令用于删除所有的MLD snooping 组信息。

**语法**：

```
clear ipv6 mld snooping ( group * | )
```

**参数**：

```
*
所有的IPv6 组播组信息
-
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示如何删除所有的IPv6 组播组信息:
Switch# clear ipv6 mld snooping
```

**相关命令**：无

### 9.3.20 `clear ipv6 mld snooping vlan group`

**功能**：此命令用于删除指定VLAN 上的IPv6 组播组信息。

**语法**：

```
clear ipv6 mld snooping vlan VLAN_ID
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
下面例子显示如何删除VLAN10 上的IPv6 组播组信息:
Switch# clear ipv6 mld snooping vlan 10
```

**相关命令**：无

### 9.3.21 `show ipv6 mld snooping global`

**功能**：使用此命令查看关于MLD Snooping 的全局配置。

**语法**：

```
show ipv6 mld snooping global
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看关于MLD Snooping 的全局配置:
Switch# show ipv6 mld snooping global
Global Mld Snooping Configuration
-------------------------------------------------
Mld Snooping                             :Enabled
Mld Snooping Fast-Leave                  :Disabled
Mld Snooping Version                     :1
Mld Snooping Max-Member-Number           :4096
Mld Snooping Unknown Multicast Behavior  :Flood
Mld Snooping Report-Suppression          :Enabled
```

**相关命令**：无

### 9.3.22 `show ipv6 mld snooping groups`

**功能**：此命令用于显示MLD snooping 组播组信息。

**语法**：

```
show ipv6 mld snooping groups
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
显示MLD snooping 组播组信息:
Switch# show ipv6 mld snooping groups
VLAN  Interface  Group Address                            Uptime     Expire-time
1     eth-0-3    ff0e:2111:1111:1111:1111:1111:1234:5678  00:00:04   00:04:16
```

**相关命令**：无

### 9.3.23 `show ipv6 mld snooping groups vlan`

**功能**：此命令用于指定VLAN 上的组播组信息。

**语法**：

```
show ipv6 mld snooping groups vlan VLAN_ID ( group_address | )
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |
| group-address | 组播组信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示VLAN1 上的组播组信息:
Switch# show ipv6 mld snooping groups vlan 1
MLD Snooping groups for vlan1
Interface:      eth-0-3
Group:          ff0e:2111:1111:1111:1111:1111:1234:5678
Uptime:         00:00:42
Group mode:     Exclude (Expires: 00:03:38)
Last reporter:  fe80:1111:1111:1111:1111:1111:1111:1111
Source list is empty
```

**相关命令**：无

### 9.3.24 `show ipv6 mld snooping groups count`

**功能**：此命令用于显示MLD snooping 组播组数目。

**语法**：

```
show ipv6 mld snooping groups ( vlan VLAN_ID | ) count
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
Switch# show ipv6 mld snooping groups vlan 1 count
Dynamic multicast groups count: 1
Static multicast groups count: 0
Total multicast groups count: 1
```

**相关命令**：无

### 9.3.25 `show ipv6 mld snooping querier`

**功能**：此命令用于显示MLD snooping 查询器相关信息。

**语法**：

```
show ipv6 mld snooping querier ( vlan VLAN_ID | )
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
Switch# show ipv6 mld snooping querier vlan 1
Global Mld Snooping Querier Configuration
-------------------------------------------------
Version                           :1
Last-Member-Query-Interval (msec) :1000
Max-Query-Response-Time (sec)     :10
Query-Interval (sec)              :125

Global Source-Address             :::
TCN Query Count                   :2
TCN Query Interval (sec)          :10
Vlan 1:   MLD snooping querier status
--------------------------------------------
Elected querier is : ::
--------------------------------------------
Admin state                       :Disabled
Admin version                     :1
Operational state                 :Non-Querier
Querier operational address       :::
Querier configure address         :N/A
Last-Member-Query-Interval (msec) :1000
Max-Query-Response-Time (sec)     :10
Query-Interval (sec)              :125
Querier-Timeout (sec)             :255
```

**相关命令**：无

### 9.3.26 `show ipv6 mld snooping mrouter`

**功能**：此命令用于显示IPv6 组播路由端口信息。

**语法**：

```
show ipv6 mld snooping mrouter ( vlan VLAN_ID | )
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
下面例子显示VLAN1 上的IPv6 组播路由端口信息:

Switch# show ipv6 mld snooping mrouter  vlan 1
VLAN    Interface      Mode      Uptime     Expires-time
2       eth-0-1        static    -          -
```

**相关命令**：无

### 9.3.27 `show ipv6 mld snooping vlan`

**功能**：此命令用于MLD snooping 的配置信息。

**语法**：

```
show ipv6 mld snooping ( vlan VLAN_ID | )
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
下面例子显示VLAN1 上MLD snooping 的信息:
Switch# show ipv6 mld snooping vlan 1
Global Mld Snooping Configuration
-------------------------------------------------
Mld Snooping                             :Enabled
Mld Snooping Fast-Leave                  :Disabled
Mld Snooping Version                     :1
Mld Snooping Max-Member-Number           :4096
Mld Snooping Unknown Multicast Behavior  :Flood
Mld Snooping Report-Suppression          :Enabled
Vlan 2
-----------
Mld Snooping                             :Enabled

Mld Snooping Fast-Leave                  :Disabled
Mld Snooping Report-Suppression          :Enabled
Mld Snooping Version                     :1
Mld Snooping Max-Member-Number           :4096
Mld Snooping Unknown Multicast Behavior  :Flood
Mld Snooping Group Access-list           :N/A
Mld Snooping Mrouter Port                :eth-0-1(static)
Mld Snooping Mrouter Port Aging Interval(sec) :255
```

**相关命令**：无

### 9.3.28 `show resource l2mcast`

**功能**：此命令用于二层组播的资源使用情况。

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
L2 Mcast Entry                   1             1024
L2 Mcast Member                  2             8192
```

**相关命令**：无、、9.4 PIMv6 命令


## 9.4 PIMv6 命令

### 9.4.1 `ipv6 pim accept-register`

**功能**：此命令根据访问控制列表限制RP 可接受的PIM 注册报文。使用关键字no 关闭此项功
  能。

**语法**：

```
ipv6 pim accept-register list LISTNAME
no ipv6 pim accept-register
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | 访问控制列表不超过20 字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

此功能用来防止未经认证的用户注册到交换机；当其用此功能后，如果一个未经认证
  的主机发送一个PIMv6 注册报文给交换机，此交换机会立即发送一个Stop 报文回去阻
  止其继续发送报文注册。此命令可以有效的让网络中众多RP 负载分担，通过ACL 的
  设置控制不同的组播组。

**示例**：

```
下面例子讲述了如何根据访问控制列表acl1 限制RP 可接受的PIMv6 注册报文:
Switch# configure terminal
Switch(config)# ipv6 pim accept-register list acl1
下面例子描述了如何删除限制:
Switch# configure terminal
Switch(config)# no ipv6 pim accept-register
```

**相关命令**：无

### 9.4.2 `ipv6 pim anycast-rp`

**功能**：使用此命令设置任播汇聚路由器地址及其成员。使用关键字no 删除指定成员。

**语法**：

```
ipv6 pim anycast-rp ANYCAST_RP_ADDR ANYCAST_MEMBER_ADDR
no ipv6 pim anycast-rp ANYCAST_RP_ADDR ( ANYCAST_MEMBER_ADDR | )
```

| 参数 | 说明 |
| --- | --- |
| ANYCAST_RP_ADDR | RP 地址 IPv6 地址 |
| IPv6 address | 组成员地址 IPv6 地址 |

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
Switch(config)# ipv6 pim anycast-rp 2001::2 2001::10
删除任播汇聚路由器地址及其组成员:
Switch# configure terminal
Switch(config)# no ipv6 pim anycast-rp 2001::2 2001::10
```

**相关命令**：无

### 9.4.3 `ipv6 pim bsr-candidate`

**功能**：使用此命令设置本交换机作为侯选的自举交换机，使用关键字no 取消此项设置。

**语法**：

```
ipv6 pim bsr-candidate IFNAME ( HASH_MASK ( PRIORITY ) | )
no ipv6 pim bsr-candidate
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 端口名称支持 物理端口，聚合端口，环回端口，VLAN 端口和隧道端口 |
| HASH_MASK | RP 选举时候HASH 的掩码长度 0-128 |
| PRIORITY | 候选BSR 路由器的优先级 0-255 |

**命令模式**：全局配置模式

**默认配置**：默认没有设置本交换机作为侯选的自举交换机 默认RP 选举时候HASH 的掩码长度10 默认候选BSR 路由器的优先级64

**使用说明**：

无

**示例**：

```
设置此交换机作为BSR，设置端口eth-0-1 的地址作为BSR 的地址:
Switch# configure terminal
Switch(config)# ipv6 pim bsr-candidate eth-0-1
取消BSR 配置:
Switch# configure terminal
Switch(config)# no ipv6 pim bsr-candidate
```

**相关命令**：ipv6 pim bsr-border

### 9.4.4 `ipv6 pim bsr-border`

**功能**：使用此命令设置此交换机作为PIMv6 域的边界，BSR 报文不再被转发出去。

**语法**：

```
ipv6 pim bsr-border
no ipv6 pim bsr-border
```

**命令模式**：端口配置模式

**默认配置**：不使能

**使用说明**：

无

**示例**：

```
设置此交换机作为PIMv6 域的边界:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 pim bsr-border
取消设置此交换机作为PIM 域的边界:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no ipv6 pim bsr-border
```

**相关命令**：ipv6 pim bsr-candidate

### 9.4.5 `ipv6 pim dr-priority`

**功能**：使用此命令设定竞选指定路由器的优先权值，使用关键字no 恢复优先权值为默认值。

**语法**：

```
ipv6 pim dr-priority PRIORITY
no ipv6 pim dr-priority
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
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 pim dr-priority 1000
恢复默认的优先权值:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no ipv6 pim dr-priority
```

**相关命令**：无

### 9.4.6 `ipv6 pim exclude-genid`

**功能**：使用此命令设置此端口发出的Hello 报文不包括GenerationID 选项。使用关键字no 恢
  复此项设置为默认状态。

**语法**：

```
ipv6 pim exclude-genid
no ipv6 pim exclude-genid
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
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 pim exclude-genid
恢复默认的配置:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no ipv6 pim exclude-genid
```

**相关命令**：无

### 9.4.7 `ipv6 pim hello-interval`

**功能**：使用此命令设定端口发送Hello 报文的时间间隔，使用关键字no 恢复时间间隔为默认
  值。

**语法**：

```
ipv6 pim hello-interval INTERVAL
no ipv6 pim hello-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 发送Hello 报文的时间间隔，以秒为单位 1-65535 |

**命令模式**：端口配置模式

**默认配置**：30 秒

**使用说明**：

无

**示例**：

```
设定发送Hello 报文的时间间隔是100 秒:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 pim hello-interval 100
恢复默认的Hello 报文时间间隔:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no ipv6 pim hello-interval
```

**相关命令**：无

### 9.4.8 `ipv6 pim ignore-rp-set-priority`

**功能**：设置忽略关于RP（Rendezvous Router，汇聚路由器）的优先权。使用关键字no 对RP
  优先权不进行忽略。

**语法**：

```
ipv6 pim ignore-rp-set-priority
no ipv6 pim ignore-rp-set-priority
```

**命令模式**：全局配置模式

**默认配置**：默认情况下，对RP 优先权不进行忽略。

**使用说明**：

无

**示例**：

```
忽略关于RP 优先权的设置值:
Switch# configure terminal
Switch(config)# ipv6 pim ignore-rp-set-priority
取消忽略关于RP 优先权的设置:
Switch# configure terminal
Switch(config)# no ipv6 pim ignore-rp-set-priority
```

**相关命令**：无

### 9.4.9 `ipv6 pim jp-timer`

**功能**：设置端口发送加入/修剪报文的时间间隔。使用关键字no 恢复此时间间隔为默认值。

**语法**：

```
ipv6 pim jp-timer SECOND
no ipv6 pim jp-timer
```

| 参数 | 说明 |
| --- | --- |
| SECOND | 端口发送加入/修剪报文的时间间隔，以秒为单位 1-65535 |

**命令模式**：全局配置模式

**默认配置**：60 秒

**使用说明**：

无

**示例**：

```
设置端口发送加入/修剪报文的时间间隔为100 秒。:
Switch# configure terminal
Switch(config)# ipv6 pim jp-timer 100
恢复默认的端口发送加入/修剪报文的时间间隔:
Switch# configure terminal
Switch(config)# no ipv6 pim jp-timer
```

**相关命令**：无

### 9.4.10 `ipv6 pim neighbor-filter`

**功能**：此命令根据访问控制列表限制与此设备建立邻居关系的节点。使用关键字no 取消此项
  限制。

**语法**：

```
ipv6 pim neighbor-filter LISTNAME

no ipv6 pim neighbor-filter
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | 访问控制列表名不超过20 字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

在PIMv6 协议中，节点之间会互相发送PIMv6 Hello 报文来与对方建立邻居关系；此
  命令可以根据访问控制列表来限制与此设备建立邻居关系的节点。

**示例**：

```
根据访问控制列表acl1 限制与此设备建立邻居关系的节点:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 pim neighbor-filter acl1
删除控制pim 邻居的访问控制列表:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no ipv6 pim neighbor-filter
```

**相关命令**：无

### 9.4.11 `ipv6 pim register-rate-limit`

**功能**：使用此命令设置DR 发往RP 的PIM 注册报文的最大速度。使用关键字no 恢复此项设
  置为默认值。

**语法**：

```
ipv6 pim register-rate-limit LIMIT
no ipv6 pim register-rate-limit
```

| 参数 | 说明 |
| --- | --- |
| LIMIT | DR 发往RP 的PIM 注册报文的最大速度，范围是1 到 65535 1-65535 |

**命令模式**：全局配置模式

**默认配置**：默认情况下，对DR 发往RP 的PIM 注册报文的速度不进行限制。如果设定了此项，则 超过此速度的PIM 注册报文在RP 处会被丢弃。

**使用说明**：

用来设置DR 发往RP 的PIM 注册报文的最大速度，超过此速度的注册报文在RP 处会
  被丢弃。

**示例**：

```
设置DR 发往RP 的PIM 注册报文的最大速度为每秒100 个:
Switch# configure terminal
Switch(config)# ipv6 pim register-rate-limit 100
恢复默认的DR 发往RP 的PIM 注册报文的最大速度:
Switch# configure terminal
Switch(config)# no ipv6 pim register-rate-limit
```

**相关命令**：ipv6 pim register-rp-reachability、ipv6 pim register-source、ipv6 pim register-suppression

### 9.4.12 `ipv6 pim register-source`

**功能**：此命令设置DR 发往RP 的注册报文的源IP 地址，使用关键字no 恢复注册报文的源IP
  地址为默认值

**语法**：

```
ipv6 pim register-source IFNAME

no ipv6 pim register-source
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称支持 物理端口，聚合端口，环回端口，VLAN 端口和隧道端口 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
设置注册报文的源IP 地址为eth-0-1 端口的IP 地址:
Switch# configure terminal
Switch(config)# ipv6 pim register-source eth-0-1
删除注册报文的源IP 地址:
Switch# configure terminal
Switch(config)# no ipv6 pim register-source
```

**相关命令**：ipv6 pim register-rate-limit、ipv6 pim register-rp-reachability、ipv6 pim register-suppression

### 9.4.13 `ipv6 pim register-rp-reachability`

**功能**：此命令设置对RP（Rendezvous Router，汇聚路由器）可到达性的检测。

**语法**：

```
ipv6 pim register-rp-reachability
no ipv6 pim register-rp-reachability
```

**命令模式**：全局配置模式

**默认配置**：不使能

**使用说明**：

无

**示例**：

```
设置对RP（Rendezvous Router，汇聚路由器）可到达性的检测:
Switch# configure terminal
Switch(config)#ipv6 pim register-rp-reachability
取消对RP（Rendezvous Router，汇聚路由器）可到达性的检测:
Switch# configure terminal
Switch(config)#no ipv6 pim register-rp-reachability
```

**相关命令**：ipv6 pim register-rate-limit、ipv6 pim register-source

### 9.4.14 `ipv6 pim register-suppression`

**功能**：当RP 给DR 发送Stop 报文后，DR 会停止发送PIMv6 注册报文一段时间。此命令可以
  设置DR 停止发送PIMv6 注册报文的时间长短。使用关键字no 恢复此时间段的设置为
  默认值。

**语法**：

```
ipv6 pim register-suppression SECOND
no ipv6 pim register-suppression
```

| 参数 | 说明 |
| --- | --- |
| SECOND | 限制时间的长短，以秒为单位 11-65535 |

**命令模式**：全局配置模式

**默认配置**：60 秒

**使用说明**：

无

**示例**：

```
设置当DR 接受到Stop 报文后停止发送注册报文的时间间隔为100 秒:
Switch# configure terminal
Switch(config)# ipv6 pim register-suppression 100
恢复默认的DR 接受到Stop 报文后停止发送注册报文的时间间隔:
Switch# configure terminal
Switch(config)# no ipv6 pim register-suppression
```

**相关命令**：ipv6 pim register-rate-limit、ipv6 pim register-rp-reachability、ipv6 pim register-source

### 9.4.15 `ipv6 pim rp-address`

**功能**：使用此命令为设置静态RP 地址，使用关键字no 删除RP。

**语法**：

```
ipv6 pim rp-address IPV6_ADDR ( LISTNAME | override | )
no ipv6 pim rp-address IPV6_ADDR ( LISTNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IPV6_ADDR | RP 地址 IPv6 地址 |
| LISTNAME | 访问控制列表不超过20 字符的字符串 |
| override | 覆盖动态学习的RP 的映射 - |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
设置RP 地址为2001::2:
Switch# configure terminal
Switch(config)# ipv6 pim rp-address 2001::2
删除RP 地址:
Switch# configure terminal
Switch(config)# no ipv6 pim rp-address 2001::2
```

**相关命令**：ipv6 pim rp-candidate、ipv6 pim rp-register-kat

### 9.4.16 `ipv6 pim rp-candidate`

**功能**：使用此命令设置本交换机作为侯选的RP，使用关键字no 取消此设置。

**语法**：

```
ipv6 pim rp-candidate IFNAME ( { priority PRIORITY | interval INTERVAL | group-list
LISTNAME } | )
no ipv6 pim rp-candidate ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 此端口的IP 地址会作为候选的RP 在网络上被广播支持 物理端口，聚合端口，环回端口，VLAN 端口和隧道端口 |
| PRIORITY | 候选RP 的优先权 0-255 |
| INTERVAL | 发送宣告报文的时间间隔， 单位是秒 1-16383 |
| LISTNAME | 访问控制列表限制可注册到此RP 的组播组不超过20 字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
设置本交换机的eth-0-1 端口的IPv6 地址为侯选的RP 地址:
Switch# configure terminal
Switch(config)# ipv6 pim rp-candidate eth-0-1
取消设置本交换机eth-0-1 为候选RP 地址:
Switch# configure terminal
Switch(config)# no ipv6 pim rp-candidate eth-0-1
```

**相关命令**：ipv6 pim rp-address

### 9.4.17 `ipv6 pim rp-register-kat`

**功能**：使用此命令设置DR 发往RP 的PIM 注册报文的存活时间。使用关键字no 恢复此存活
  时间为默认值。

**语法**：

```
ipv6 pim rp-register-kat SECOND
no ipv6 pim rp-register-kat
```

| 参数 | 说明 |
| --- | --- |
| SECOND | DR 发往RP 的PIM 注册报1-65535 文的存活时间，以秒为单位 |

**命令模式**：全局配置模式

**默认配置**：185 秒

**使用说明**：

DR 发往RP 的PIMv6 注册报文在RP 上会生成一个(S,G)条目，此条目会在RP 上存在一
  段时间，超过此时间后，交换机会删除相应条目；此命令可以设置当RP 发送Stop 报
  文后该条目在RP 上存活的时间。

**示例**：

```
设置DR 发往RP 的PIMv6 注册报文的存活时间为100 秒:
Switch# configure terminal
Switch(config)# ipv6 pim rp-register-kat 100
恢复DR 发往RP 的PIM 注册报文的存活时间为默认值:
Switch# configure terminal
Switch(config)# no ipv6 pim rp-register-kat
```

**相关命令**：ipv6 pim rp-address、ipv6 pim rp-candidate

### 9.4.18 `ipv6 pim spt-switch-threshold infinity`

**功能**：使用此功能设置永远都不切换到最短路径树，使用关键字no 取消此项设置。

**语法**：

```
ipv6 pim spt-switch-threshold infinity ( group-list LISTNAME | )
no ipv6 pim spt-switch-threshold infinity ( group-list LISTNAME | )
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | IPv6 组播组地址范围不超过20 字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：默认DR 收到第一个IPv6 组播流后立即切换为最短路径树。

**使用说明**：

无

**示例**：

```
设置永远都不切换到最短路径树:
Switch# configure terminal
Switch(config)# ipv6 pim spt-switch-threshold infinity
恢复默认DR 收到第一个组播流后立即切换为最短路径树:
Switch# configure terminal
Switch(config)# no ipv6 pim spt-switch-threshold infinity
```

**相关命令**：show ipv6 pim sparse-mode spt-threshold

### 9.4.19 `ipv6 pim cisco-register-checksum`

**功能**：使用此功能设置DR 发送注册报文时使用Register Checksum，使用关键字no
  取消此项设置。

**语法**：

```
ipv6 pim cisco-register-checksum ( group-list LISTNAME | )
no ipv6 pim cisco-register-checksum ( group-list LISTNAME | )
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | IPv6 组播组地址范围不超过20 字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：默认使用RFC 定义的register checksum

**使用说明**：

默认是RFC 规定的register checksum，如果配置了访问控制列表，只有通过验证的报
  文才能以Register Checksum 的方式发送。

**示例**：

```
设置DR 发送注册报文时使用Register Checksum:
Switch# configure terminal
Switch(config)# ipv6 pim cisco-register-checksum
恢复DR 发送注册报文时使用RFC 方式:
Switch# configure terminal
Switch(config)# no ipv6 pim cisco-register-checksum
```

**相关命令**：无

### 9.4.20 `ipv6 pim sparse-mode`

**功能**：使用此命令在此端口启用PIMv6-SM 协议，使用关键字no 在此端口关闭PIMv6-SM 协
  议。

**语法**：

```
ipv6 pim sparse-mode ( passive | )
no ipv6 pim sparse-mode ( passive | )
```

| 参数 | 说明 |
| --- | --- |
| passive | 被动模式 |

**命令模式**：端口配置模式

**默认配置**：不使能

**使用说明**：

默认情况下，端口没有启用PIMv6-SM 协议；工作在被动模式的端口不会发送PIMv6
  Hello 报文。

**示例**：

```
在此端口启用PIMv6 协议:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 pim sparse-mode
在此端口关闭PIM 协议:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no ipv6 pim  sparse-mode
在此端口启用PIM 协议并配置为被动模式:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 pim sparse-mode passive
```

**相关命令**：无

### 9.4.21 `ipv6 pim unicast-bsm`

**功能**：默认情况下，端口会向整个PIMv6 域发送BSM 报文；此命令可以限制交换机只向它的
  邻居发送BSM 报文。使用关键字no 恢复此项设置为默认值。

**语法**：

```
ipv6 pim unicast-bsm
no ipv6 pim unicast-bsm
```

**命令模式**：端口配置模式

**默认配置**：不使能

**使用说明**：

每个端口只能创建一条统计。

**示例**：

```
在此端口配置BSM 报文转发方式:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 pim unicast-bsm
在此端口取消配置BSM 报文转发方式为默认:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no ipv6 pim unicast-bsm
```

**相关命令**：无

### 9.4.22 `ipv6 pim ssm`

**功能**：使用这个命令来使能PIMv6-SSM 和指定SSM 组范围。默认范围是FF3X::/32。使用关
  键字no 来关闭PIMv6-SSM。

**语法**：

```
ipv6 pim ssm ( default | range LISTNAME )
no ipv6 pim ssm
```

| 参数 | 说明 |
| --- | --- |
| default | 使用默认的SSM IPv6 组播组范围 |
| LISTNAME | 使用访问控制列表中的组播组范围作为SSM IPv6 组播组范围不超过20 字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：不使能

**使用说明**：

无

**示例**：

```
下面的例子用来演示使能PIMv6-SSM,并将SSM 组范围设置为默认范围:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 pim ssm default
去使能PIM-SSM:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no ipv6 pim ssm default
```

**相关命令**：无

### 9.4.23 `show ipv6 pim sparse-mode bsr-router`

**功能**：使用此命令查看自举路由器信息。

**语法**：

```
show ipv6 pim sparse-mode bsr-router
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看自举路由器信息:
Switch# show ipv6 pim sparse-mode bsr-router
PIM6v2 Bootstrap information
This system is the Bootstrap Router (BSR)
  BSR address: 2001:2::1 (?)
  Uptime:      00:00:08, BSR Priority: 64, Hash mask length: 126
  Next bootstrap message in 00:00:52
  Role: Candidate BSR
  State: Elected BSR
```

**相关命令**：无

### 9.4.24 `show ipv6 pim sparse-mode interface`

**功能**：使用此命令查看稀疏模式下的端口信息。

**语法**：

```
show ipv6 pim sparse-mode interface ( detail | )
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
Switch# show ipv6 pim sparse-mode interface detail
eth-0-1 (vif 0):
  Address fe80::9c7c:7eff:fe94:8300, DR fe80::9c7c:7eff:fe94:8300

  Hello period 30 seconds, Next Hello in 3 seconds
  Triggered Hello period 5 seconds
  Secondary addresses:
   2001:1::1
  Neighbors:
```

**相关命令**：无

### 9.4.25 `show ipv6 pim sparse-mode local-member`

**功能**：使用此命令查看稀疏模式下的本地成员信息。

**语法**：

```
show ipv6 pim sparse-mode local-member ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 端口名称支持 物理端口，聚合端口，环回端口，VLAN 端口和隧道端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看稀疏模式下的本地成员信息:
Switch# show ipv6 pim sparse-mode local-members
PIM Local membership information
eth-0-2:
*, ff0e::1234:5678
    info: Include
```

**相关命令**：无

### 9.4.26 `show ipv6 pim sparse-mode mroute`

**功能**：使用此命令查看SM 模式下的多播路由。

**语法**：

```
show ipv6 pim sparse-mode mroute ( SRC_IPV6_ADDR | GROUP_IPV6_ADDR | ) ( detail
| )
```

| 参数 | 说明 |
| --- | --- |
| SRC_IPV6_ADDR | IPv6 多播路由源地址 IPv6 地址 |
| GROUP_IPV6_ADDR | IPv6 多播路由目的地址 IPv6 地址 |
| detail | 详细信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看稀疏模式下的IPv6 多播路由:
Switch# show ipv6 pim sparse-mode mroute detail
IPv6 Multicast Routing Table
(*,*,RP) Entries: 0
(*,G) Entries: 1
(S,G) Entries: 0
(S,G,rpt) Entries: 0
FCR Entries: 0
*, ff0e::1234:5678
Type: (*,G)
Uptime: 00:01:49
  RP: ::, RPF nbr: None, RPF idx: None

  Upstream:
   State: JOINED, SPT Switch: Enabled, JT: off
   Macro state: Join Desired,
  Downstream:
   eth-0-2:
     State: NO INFO, ET: off, PPT: off
     Assert State: NO INFO, AT: off
      Winner: ::, Metric: 4294967295, Pref: 4294967295, RPT bit: on
     Macro state: Could Assert, Assert Track
  Local Olist:
   eth-0-2
```

**相关命令**：无

### 9.4.27 `show ipv6 pim sparse-mode neighbor`

**功能**：使用此命令查看稀疏模式下的邻居信息。

**语法**：

```
show ipv6 pim sparse-mode neighbor ( ( IFNAME ( IPV6_ADDR | ) ) | detail | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 端口名称支持 物理端口，聚合端口，环回端口，VLAN 端口和隧道端口 |
| IPV6_ADDR | 邻居地址 IPv6 地址 |
| detail | 详细信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看稀疏模式下的邻居信息:
Switch# show ipv6 pim sparse-mode neighbor
Neighbor Address                         Interface   Uptime/Expires    DR
                                                                       Pri/Mode
fe80::9c7c:7eff:fe94:8300                eth-0-9     00:00:40/00:01:44 1 / DR
```

**相关命令**：无

### 9.4.28 `show ipv6 pim sparse-mode rp mapping`

**功能**：使用此命令查看IPv6 多播组与RP 的对应关系。

**语法**：

```
show ipv6 pim sparse-mode rp mapping
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看IPv6 多播组与RP 的映射关系:
Switch# show ipv6 pim sparse-mode rp mapping
RP: 2001:1::1
Info source: 2001:1::1, via bootstrap
```

**相关命令**：无

### 9.4.29 `show ipv6 pim sparse-mode rp-hash`

**功能**：使用此命令查看指定IPv6 多播组的RP 信息。

**语法**：

```
show ipv6 pim sparse-mode rp-hash GROUP_IPV6_ADDR
```

| 参数 | 说明 |
| --- | --- |
| GROUP_IPV6_ADDR | 组播组地址 IPv6 地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看多播组ff02::1234 的RP:
Switch# show ipv6 pim sparse-mode rp-hash ff02::1234
    RP: 2001::2
```

**相关命令**：无

### 9.4.30 `show ipv6 pim sparse-mode spt-threshold`

**功能**：使用此命令查看从共享树切换为最短路径树的阈值。

**语法**：

```
show ipv6 pim sparse-mode spt-threshold
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
查看从共享树切换为最短路径树的阈值:
Switch# show ipv6 pim sparse-mode spt-threshold
IPv6 PIM spare-mode immediately switches over to SPT upon receiving the first tr
affic
```

**相关命令**：无、9.5 MVR6 命令


## 9.5 MVR6 命令

### 9.5.1 `mvr6`

**功能**：此命令用来使能和去使能MVR6。使用no 关键字关闭此功能。

**语法**：

```
mvr6
no mvr6
```

**命令模式**：全局配置模式

**默认配置**：不使能

**使用说明**：

在交换机上使能MVR6，在使能MVR6 前，组播路由功能需要关闭。

**示例**：

```
下面的例子用来说明如何在交换机上使能MVR6:
Switch# configure terminal
Switch(config)# no ipv6 multicast-routing
Switch(config)# mvr6
```

**相关命令**：show mvr6

### 9.5.2 `mvr6 vlan`

**功能**：此命令用来指定MVR6 的源VLAN。使用no 关键字取消此配置。

**语法**：

```
mvr6 vlan VLAN_ID
no mvr6 vlan
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID |  |
| Vlan ID | 1-4094 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

在指定MVR6 的源VLAN 前，该VLAN 的vlan interface 需要先创建起来。

**示例**：

```
下面的例子用来说明如何配置MVR6 的源VLAN:
Switch# configure terminal
Switch(config)# vlan database

Switch(config-vlan)# vlan 2
Switch(config)# interface vlan 2
Switch(config-if)# exit
Switch(config)# mvr6 vlan 2
```

**相关命令**：interface vlan

### 9.5.3 `mvr6 group`

**功能**：此命令用来设置MVR6 全局group。使用no 关键字删除此配置。

**语法**：

```
mvr6 group IPV6_ADDR ( COUNT | )
no mvr6 group address ( COUNT | )
```

| 参数 | 说明 |
| --- | --- |
| IPV6_ADDR | 组播组地址 IPv6 地址 |
| COUNT | 要配置的组播组数目 1-64 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

此命令用来设置MVR6 全局group。

**示例**：

```
下面例子显示如何在端口上创建一条统计 下面的例子说明如何来创建50 个静态group,
范围是ff0e::1~ff0e::50:
Switch# configure terminal
Switch(config)# mvr6 group ff0e::1 50
```

**相关命令**：无

### 9.5.4 `mvr6 source-address`

**功能**：此命令用来设置或删除MVR6 源地址。使用no 关键字删除此配置。

**语法**：

```
mvr6 source-address IPv6_ADDR
no mvr6 source-address
```

| 参数 | 说明 |
| --- | --- |
| IPv6_ADDR | MVR6 上报组播报文的源地址 IPv6 地址 |

**命令模式**：全局配置模式

**默认配置**：fe80::1

**使用说明**：

无

**示例**：

```
下面的例子用来说明如何设置MVR6 源地址为2001::2:
Switch# configure terminal
Switch(config)# mvr6 source-address 2001::2
下面的例子用来说明如何恢复MVR6 的源地址为默认:
Switch# configure terminal
Switch(config)# no mvr6 source-address
```

**相关命令**：无

### 9.5.5 `mvr6 type`

**功能**：此命令用来设置交换机端口作为MVR6 的源端口或者接收端口。使用no 关键字删除此
  配置。

**语法**：

```
mvr6 type ( source | receiver vlan VLAN_ID )
no mvr6 type ( receiver vlan VLAN_ID | )
```

| 参数 | 说明 |
| --- | --- |
| source | MVR6 源端口 |
| receiver | MVR6 接收端口 |
| VLAN_ID | VLAN id，范围是1 到 1-4094 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

在配置某个端口作为MVR6 的源端口或接收端口时，源端口必须在MVR6 源VLAN 中，
  接收端口必须不在MVR6 的源VLAN 中。

**示例**：

```
下面的例子将eth-0-1 配置成MVR6 的源端口，eth-0-2 配置成VLAN2 中的接收端口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# mvr6 type source
Switch(config)# interface eth-0-2
Switch(config-if)# mvr6 type receiver vlan 2
```

**相关命令**：无

### 9.5.6 `show mvr6`

**功能**：此命令用来显示MVR6 相关的信息。

**语法**：

```
show mvr6
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示MVR6 相关的信息:
Switch# show mvr6
MVR6 Running: TRUE
MVR6 Multicast VLAN: 2
MVR6 Source-address: fe80::1
MVR6 Max Multicast Groups: 1024
MVR6 Hw Rt Limit: 224
MVR6 Current Multicast Groups: 3
```

**相关命令**：无

### 9.5.7 `show mvr6 interface`

**功能**：此命令用来显示MVR6 端口相关的信息。

**语法**：

```
show mvr6 interface
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示MVR6 端口相关的信息:
Switch# show mvr6 interface
Port        Type          VLAN    Status
eth-0-2     source        10      ACTIVE
eth-0-1     receiver      11      ACTIVE
```

**相关命令**：无

### 9.5.8 `show mvr6 group`

**功能**：此命令用来显示从MVR6 接收端口上学习到组播组信息。

**语法**：

```
show mvr6 group vlan VLAN_ID ( IPV6_ADDR | )
```

| 参数 | 说明 |
| --- | --- |
| VLAN_ID | MVR6 接收 VLAN 1-4094 |
| IPV6_ADDR | 组播组地址 IPv6 地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示如何从MVR6 接收端口上学习到组播组信息:
Switch# show mvr6 groups
VLAN  Interface  Group Address                            Uptime     Expire-time
1     eth-0-3    ff0e:2111:1111:1111:1111:1111:1234:5678  00:00:11   00:04:10
```

**相关命令**：无

### 9.5.9 `show mvr6 group static`

**功能**：此命令用来显示MVR6 全局配置的静态组播组信息。

**语法**：

```
show mvr6 group static global
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示MVR6 全局配置的静态组播组信息:
Switch# show mvr6 groups static global
MVR6 Static Global Group:
ff0e::1234
ff0e::1235
ff0e::1236
ff0e:2111:1111:1111:1111:1111:1234:5678
```

**相关命令**：无

### 9.5.10 `show resource mvr6`

**功能**：此命令用于显示MVR6 的资源使用情况。

**语法**：

```
show resource mvr6
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示MVR6 的资源使用情况:
Switch# show resource mvr6
MVR
Resource                         Used          Capability
=============================================================
MVR Entry                        4             224
L2 Mcast Member                  1             1792
```

**相关命令**：无、、10 流量管理命令、10.1 QOS 命令

