# 12 IPv6 安全性命令

## 12.1 DHCPv6 Snooping 命令

### 12.1.1 `clear dhcpv6 snooping bindings learning`

**功能**：在特权模式下使用clear dhcpv6 snooping binding learning 命令来清除DHCP 绑定数据
  库中动态绑定的条目。

**语法**：

```
clear dhcpv6 snooping bindings ( learning | manual ) ( ipv6 IP-ADDRESS | mac MAC-
ADDRESS | vlan VLAN-ID | interface IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| ipv6 IP-ADDRESS | 清除指定IPv6 地址的绑定条目 IPv6 地址 |
| mac MAC-ADDRESS | 清除指定MAC 地址的绑定条目 MAC 地址 |
| vlan VLAN-ID | 清除指定VLAN 的绑定条目 1-4094 |
| interface IFNAME | 清除指定端口名称的绑定条目支持物理端口和聚合端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于清除DHCPv6 snooping 绑定条目。

**示例**：

```
配置清除DHCPv6 snooping 所有动态绑定条目:
Switch# clear dhcpv6 snooping bindings learning
```

**相关命令**：show dhcpv6 snooping binding

### 12.1.2 `clear dhcpv6 snooping statistics`

**功能**：在特权模式下使用clear dhcpv6 snooping statistics 命令来清除DHCPv6 snooping 统计
  信息。

**语法**：

```
clear dhcpv6 snooping statistics
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于清除DHCPv6 snooping 计数信息。

**示例**：

```
配置清除DHCPv6 snooping 计数:
Switch# clear dhcpv6 snooping statistics
```

**相关命令**：show dhcpv6 snooping statistics

### 12.1.3 `dhcpv6 snooping`

**功能**：在全局配置模式下使用dhcpv6 snooping 命令配置交换机全局使能DHCPv6 snooping。
  使用此命令的no 格式恢复为默认设置。

**语法**：

```
dhcpv6 snooping
no dhcpv6 snooping
```

**命令模式**：全局配置模式

**默认配置**：默认情况下，DHCPv6 snooping 未使能。

**使用说明**：

必需在全局使能DHCPv6 snooping，才可以使DHCPv6 snooping 的配置生效。
  只有在全局配置模式下使用dhcpv6 snooping vlan vlan-id 命令在VLAN 上使能
  snooping，DHCPv6 snooping 才会起作用。
  可以在特权模式下使用show dhcpv6 snooping config 命令验证配置是否启用

**示例**：

```
配置使能DHCPv6 snooping:
Switch# configure terminal
Switch(config)# dhcpv6 snooping
```

**相关命令**：dhcpv6 snooping vlan、show dhcpv6 snooping config

### 12.1.4 `dhcpv6 snooping binding`

**功能**：在全局配置模式下，使用dhcpv6 snooping binding 命令配置DHCPv6 snooping 绑定
  数据库以及向数据库中添加静态绑定条目。

**语法**：

```
dhcpv6 snooping binding mac MAC-ADDRESS vlan VLAN-ID ipv6 IP-ADDRESS
interface IFNAME expiry SECONDS
no dhcpv6 snooping bindings ( ipv6 IP-ADDRESS | mac MAC-ADDRESS | vlan VLAN-ID
| interface IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| mac MAC-ADDRESS | 指定MAC 地址 MAC 地址 |
| vlan VLAN-ID | 指定VLAN 序号。 1-4094 |
| ipv6 IP-ADDRESS | 指定IPv6 地址 IPv6 地址 |
| interface IFNAME | 指定添加或删除绑定条目的接口支持物理端口和聚合端口 |
| expiry SECONDS | 指定时间间隔(单位为秒)后绑定条目无效。范围为0 到 86400 0-86400 秒 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

当你在测试或调试交换机时使用该条命令。
  在DHCPv6 snooping 绑定数据库中，每一个数据条目都有一个IPv6 地址，一个关联的
  MAC 地址，一个租约时间，提供绑定数据的接口，以及该接口属于的VALN。
  在特权模式下，使用show dhcpv6 snooping binding 命令显示配置的绑定信息。

**示例**：

```
为在VLAN1 的接口eth-0-1 上配置一个DHCPv6 snooping 绑定，MAC 地址为
0001.000c.01ef，IPv6 地址为2001:1::1，过期时间为1000 秒:
Switch# configure terminal
Switch(config)# dhcpv6 snooping binding mac 0001.000c.01ef vlan 1 ipv6 2001:1::1
interface eth-0-1 expiry 1000
```

**相关命令**：show dhcpv6 snooping binding

### 12.1.5 `dhcpv6 snooping database`

**功能**：在全局配置模式下，使用dhcpv6 snooping database 命令位置交换机的DHCPv6
  snooping 绑定数据库代理。
  使用此命令的no 格式重置保存延期时间。

**语法**：

```
dhcpv6 snooping database auto-save interval SECONDS
```

| 参数 | 说明 |
| --- | --- |
| interval SECONDS | 指定保存绑定数据库的时间间隔 (单位为秒) 。 15-2000 秒 |

**命令模式**：全局配置模式

**默认配置**：默认时间间隔为600 秒。

**使用说明**：

DHCPv6 snooping 绑定数据库存储在flash:/dhcpv6snooping 中。

**示例**：

```
配置DHCPv6 snooping 自动保存数据库时间间隔为120 秒:
Switch# configure terminal
Switch(config)# dhcpv6 snooping database auto-save interval 120
```

**相关命令**：dhcpv6 snooping、dhcpv6 snooping binding

### 12.1.6 `dhcpv6 snooping remote-id format`

**功能**：在全局配置模式下，使用dhcpv6 snooping remote-id format 命令配置插入报文中的
  remote-id 的格式。使用此命令的no 格式恢复remote-id 格式的默认值。

**语法**：

```
dhcpv6 snooping remote-id format { vlan | ifname | duid }
no dhcpv6 snooping remote-id format
```

| 参数 | 说明 |
| --- | --- |
| vlan | 客户端所在的vlan id |
| ifname | 接收客户端报文的二层物理口的名字 |
| duid | remote-id 中包含设备的 |
| DUID |  |

**命令模式**：全局配置模式

**默认配置**：默认格式为duid::ifname

**使用说明**：

Remote-id 的格式可以是vlan id，接口名称，duid 三种关键字的组合，可以设置需要
  显示在remote-id 中的关键字。

**示例**：

```
配置remote-id 的格式:
Switch# configure terminal

Switch(config)# dhcpv6 snooping remote-id format duid vlan ifname
```

**相关命令**：dhcpv6 snooping remote-id option

### 12.1.7 `dhcpv6 snooping remote-id option`

**功能**：在全局配置模式下，使用dhcpv6 snooping remote-id option 命令使能报文中插入
  remote-id 选项功能。使用此命令的no 格式去使能插入remote-id 选项功能。

**语法**：

```
dhcpv6 snooping remote-id option
no dhcpv6 snooping remote-id option
```

**命令模式**：全局配置模式

**默认配置**：默认未使能插入remote-id 选项

**使用说明**：

无

**示例**：

```
配置DHCPv6 snooping 启用remote-id 选项:
Switch# configure terminal

Switch(config)# dhcpv6 snooping remote-id option
```

**相关命令**：dhcpv6 snooping remote-id format

### 12.1.8 `dhcpv6 snooping trust`

**功能**：在端口配置模式下使用dhcpv6 snooping trust 命令配置接口对DHCPv6 snooping 为信
  任接口。
  使用此命令的no 格式恢复为默认设置。

**语法**：

```
dhcpv6 snooping trust
no dhcpv6 snooping trust
```

**命令模式**：端口配置模式

**默认配置**：默认情况下，为DHCPv6 snooping 不信任接口。

**使用说明**：

配置连接DHCPv6 服务器或其他交换机或路由器的接口为信任接口。配置连接
  DHCPv6 客户端的接口为不信任接口。

**示例**：

```
配置接口为DHCPv6 snooping 信任接口:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# dhcpv6 snooping trust
```

**相关命令**：show dhcpv6 snooping trusted-sources

### 12.1.9 `dhcpv6 snooping vlan`

**功能**：在全局配置模式下使用dhcpv6 snooping vlan 命令配置交换机在VLAN 使能DHCPv6
  snooping。使用此命令的no 格式恢复为默认设置。

**语法**：

```
dhcpv6 snooping vlan VLAN-RANGE
no dhcpv6 snooping vlan VLAN-RANGE
```

| 参数 | 说明 |
| --- | --- |
| VLAN-RANGE | 指定使能DHCP snooping 的VLAN ID 或VLAN 的范围。 1-4094 |

**命令模式**：全局配置模式

**默认配置**：默认情况下DHCPv6 snooping 在所有VLAN 都未使能。

**使用说明**：

你可以输入VLAN 序号指定单独一个VLAN ID，或者输入几个VLAN 序号使用逗号间隔，
  或输入一个VLAN 范围使用连字号间隔，或输入VLAN 开始ID 和VLAN 结束ID 使用空
  格间隔。在VLAN 上使能DHCPv6 snooping 前，必须先全局使能DHCPv6 snooping。

**示例**：

```
在VLAN10 上配置DHCPv6 snooping:
Switch# configure terminal
Switch(config)# dhcpv6 snooping vlan 10
```

**相关命令**：show dhcpv6 snooping config

### 12.1.10 `debug dhcpv6 snooping`

**功能**：使用此命令可以打开dhcpv6 snooping 的模块的调试功能。
  在原命令之前加上关键字“no”，关闭调试功能。

**语法**：

```
debug dhcpv6 snooping ( events | error | dump | packet | all )
no debug dhcpv6 snooping ( events | error | dump | packet | all )
```

| 参数 | 说明 |
| --- | --- |
| events | 调试dhcpv6 snooping 事件信息 |
| error | 调试dhcpv6 snooping 错误信息 |
| packet | 调试dhcpv6 snooping 的数据包信息 |
| dump | 以十六进制调试dhcpv6 snooping 的数据包信息 |
| all | 上面提到的所有调试信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

使用“terminal monitor”打印消息

**示例**：

```
使用如下命令，打开D snooping 的所有调试信息:
Switch# debug dhcpv6 snooping all
```

**相关命令**：terminal monitor、show logging buffer

### 12.1.11 `show dhcpv6 snooping binding`

**功能**：在特权模式下使用show dhcpv6 snooping binding 命令显示设备DHCPv6 snooping 绑
  定数据库和所有接口的配置信息。

**语法**：

```
show dhcpv6 snooping binding ( （all | manual | learning ） ( ipv4 IP-ADDRESS | mac
MAC-ADDRESS | vlan VLAN-ID | interface IFNAME | ) summary | )
```

| 参数 | 说明 |
| --- | --- |
| all | 显示所有绑定条目 |
| manual | 显示静态绑定条目 |
| learning | 显示动态绑定条目 |
| mac MAC-ADDRESS | 指定MAC 地址 MAC 地址 |
| vlan VLAN-ID | 指定VLAN 序号。 1-4094 |
| ipv4 IP-ADDRESS | 指定IP 地址 IPv4 地址 |
| interface IFNAME | 指定添加或删除绑定条目的接口支持物理端口和聚合端口 |
| summary | 显示DHCPv6 snooping 绑定的概要信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

如果使能了DHCPv6 snooping 功能，即使接口变为断开状态，交换机也不会删除静态
  配置的绑定条目。

**示例**：

```
显示DHCPv6 snooping 绑定信息:
Switch# show dhcpv6 snooping binding all
DHCPv6 snooping binding table:
VLAN MAC Address    Interface  Lease(s)   IPv6 Address
============================================================
1    0001.0001.0001 eth-0-2    static     1:1::1:1
Switch# show dhcpv6 snooping binding summary
Total 1 DHCPv6 snooping binding entries
    0 learning entry, 1 configured entry
```

**相关命令**：dhcpv6 snooping binding

### 12.1.12 `show dhcpv6 snooping config`

**功能**：在特权模式下使用show dhcpv6 snooping config 命令显示DHCPv6 snooping 配置。

**语法**：

```
show dhcpv6 snooping config
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于显示DHCPv6 snooping 配置信息。

**示例**：

```
显示dhcpv6 snooping 配置信息:
Switch# show dhcpv6 snooping config
dhcpv6 snooping service: enabled
dhcpv6 snooping switch: enabled
dhcpv6 snooping vlan 3
```

**相关命令**：dhcpv6 snooping、dhcpv6 snooping vlan

### 12.1.13 `show dhcpv6 snooping trusted-sources`

**功能**：在特权模式下使用show dhcpv6 snooping trusted-sources 命令显示DHCPv6 snooping
  的信任端口。

**语法**：

```
show dhcpv6 snooping trusted-sources
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于显示DHCPv6 snooping 信任端口。

**示例**：

```
显示dhcpv6 snooping 信任端口:
Switch# show dhcpv6 snooping trusted-source
List of DHCPv6 snooping trusted interface(s):
============================================================
eth-0-20
```

**相关命令**：dhcpv6 snooping trust

### 12.1.14 `show dhcpv6 snooping statistics`

**功能**：在特权模式下使用show dhcpv6 snooping statistics 命令显示DHCPv6 snooping 统计信
  息。

**语法**：

```
show dhcpv6 snooping statistics
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

该命令用于显示DHCPv6 snooping 统计信息。

**示例**：

```
显示DHCPv6 snooping 统计信息:
Switch# show dhcpv6 snooping statistics
DHCPv6 snooping statistics:
============================================================
DHCPv6 packets                            137
Packets forwarded                         137

Packets invalid                           0
Packets dropped                           0
```

**相关命令**：clear dhcpv6 snooping statistics、12.2 设备管理安全命令


## 12.2 设备管理安全命令

### 12.2.1 `ipv6 telnet server acl`

**功能**：在全局配置模式下，使用该命令可以过滤telnet client ipv6。使用该命令的no 形式删
  除配置。

**语法**：

```
ipv6 telnet server acl NAME
no ipv6 telnet server acl
```

| 参数 | 说明 |
| --- | --- |
| NAME | 对应创建的ipv6 access-list 名字不超过40 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：不过滤任何telnet client ipv6

**使用说明**：

为了防止网络上的暴力破解，可以使用该命令过滤指定的telnet client ipv6。
  在使用此命令前必须先创建access-list。

**示例**：

```
启用telnet acl，仅允许源ip 为3001:1::1000 的报文:
Switch# configure terminal
Switch(config)# ipv6 access-list telnetACL
Switch(config-ip-acl)# permit tcp host 3001:1::1000 any

Switch(config-ip-acl)# exit
Switch(config)# ipv6 telnet server acl telnetACL
```

**相关命令**：无

### 12.2.2 `ipv6 ssh server acl`

**功能**：在全局配置模式下，使用该命令可以过滤ssh client ipv6。使用该命令的no 形式删除
  配置。

**语法**：

```
ipv6 ssh server acl NAME
no ipv6 ssh server acl
```

| 参数 | 说明 |
| --- | --- |
| NAME | 对应创建的ipv6 access-list 名字不超过40 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：不过滤任何ssh client ipv6

**使用说明**：

为了防止暴力破解，可以使用该命令过滤指定的ssh client ipv6。
  在使用此命令前必须先创建access-list。

**示例**：

```
启用ssh acl，仅允许源ip 为3001:1::1000 的报文:
Switch# configure terminal
Switch(config)# ipv6 access-list sshACL
Switch(config-ip-acl)# permit tcp host 3001:1::1000 any
Switch(config-ip-acl)# exit
Switch(config)# ipv6 ssh server acl sshACL
```

**相关命令**：无、、13 可靠性命令、13.1 BHM 命令

