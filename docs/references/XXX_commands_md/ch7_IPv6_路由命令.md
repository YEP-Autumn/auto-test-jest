# 7 IPv6 路由命令

## 7.1 OSPFv3 命令

### 7.1.1 `area default-cost`

**功能**：要指定一个发送到Stub 区域或NSSA 区域默认的汇总路由的开销，在路由模式下使用
  命令area default-cost。
  如果要删除配置，使用此命令的no 格式。

**语法**：

```
area AREA-ID default-cost COST
no area AREA-ID default-cost
```

| 参数 | 说明 |
| --- | --- |
| AREA-ID | 区域标识符，标识符可以是十进制的或者是IP 地址 IP 地址或0-4294967295 的整数 |
| COST | 路由开销值 0-16777215 |

**命令模式**：路由模式

**默认配置**：默认为1。

**使用说明**：

此命令只用在连接stub 区域或NSSA 区域的区域边缘路由器(ABR)上。
  有两种Stub 区域的路由配置命令：stub 和 default-cost 命令。
  
  配置Stub 区域后只学习类型为1(router-lsa)，2(network lsa)和3(summary lsa)的LSA。

**示例**：

```
下面例子配置了Stub 区域和Stub 区域的Cost 值:
Switch# configure terminal
Switch(config)#router ipv6 ospf 201
Switch(config-router)#area 10.0.0.0 stub
Switch(config-router)#area 10.0.0.0 default-cost 20
```

**相关命令**：无

### 7.1.2 `area range`

**功能**：使用此命令在OSPF 区域边界上对路由进行合并和汇总，使用此命令的no 格式取消此
  项功能。

**语法**：

```
area AREA-ID range ADDRESS/PREFIX-LENGTH ( advertise | not-advertise | )
no area AREA-ID range ADDRESS/PREFIX-LENGTH
```

| 参数 | 说明 |
| --- | --- |
| AREA-ID | 以ID 标识的OSPF 区域. IP 地址或0-4294967295 的整数 |
| ADDRESS | 聚合路由的目的IPv6 地址 IPv6 地址 |
| PREFIX-LENGTH | 聚合路由的地址前缀长度 1-128 |
| advertise | 发布这条聚合路由 |
| not-advertise | 不发布这条聚合路由 |

**命令模式**：路由模式

**默认配置**：不对路由进行聚合。

**使用说明**：

area range 只能用在ABR 路由器上。 用来对当前区域进行路由聚合。聚合的结果是由
  ABR 把单一的汇总路由宣告给其他区域。一个区域可配置多条聚合网段，这样OSPFv3
  可对多个网段进行聚合。

**示例**：

```
下面的例子在ABR 路由器上对子网2004::1/16 进行了路由汇总:
Switch# configure terminal
Switch(config)# router ipv6 ospf 201
Switch(config-router)#area 10 range 2004::1/16
```

**相关命令**：无

### 7.1.3 `area stub`

**功能**：使用此命令设置指定区域为Stub(存根)区域，使用此命令的no 格式取消对此区域为存
  根区域的设置。

**语法**：

```
area AREA-ID stub ( no-summary | )
no area AREA-ID stub ( no-summary | )
```

| 参数 | 说明 |
| --- | --- |
| AREA-ID | 以ID 或者IP 地址标识的 OSPF 区域 IP 地址或0-4294967295 的整数 |
| no-summary | 如果指定了此项，则配置此区域为完全存根区域 |

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
下面例子配置了Stub 区域以及设置了默认的Cost 值:
Switch# configure terminal
Switch(config)# router ipv6 ospf 201
Switch(config-router)#area 10.0.0.0 stub
Switch(config-router)#area 10.0.0.0 default-cost 20
```

**相关命令**：无

### 7.1.4 `auto-cost`

**功能**：使用此命令设置计算链路开销时所依据的参考带宽，使用此命令的no 格式把参考带宽
  设置为默认值。

**语法**：

```
auto-cost reference-bandwidth RATE
no auto-cost reference-bandwidth
```

| 参数 | 说明 |
| --- | --- |
| RATE | 带宽，以Mbps 为单位.默认是100 |
| 1 - 4294967 Mbps |  |

**命令模式**：路由模式

**默认配置**：100 Mbps

**使用说明**：

使用 ipv6 ospf cost 命令设置的端口Cost 值将会覆盖用该命令计算出来的cost 值。计
  算链路开销的公式为：参考带宽/端口速率。

**示例**：

```
下面例子在链路上设置了带宽为1G:
Switch# configure terminal
Switch(config)# router ipv6 ospf 1
Switch(config-router)#auto-cost reference-bandwidth 1000
```

**相关命令**：ipv6 ospf cost

### 7.1.5 `clear ipv6 ospf`

**功能**：使用此命令重启OSPFv3 进程。

**语法**：

```
clear ipv6 ospf ( PID | ) process
```

| 参数 | 说明 |
| --- | --- |
| PID | (可选)进程 ID 0-65535 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

如果没有指定OSPFv3 进程编号，则重启所有OSPFv3 进程。

**示例**：

```
下面例子重启所有了OSPFv3 进程:
Switch# clear ipv6 ospf process
```

**相关命令**：无

### 7.1.6 `default-information originate (OSPFv3)`

**功能**：使用此命令用来将缺省路由引入OSPFv3 区域，使用此命令的no 格式取消引入缺省路
  由。

**语法**：

```
default-information originate
default-information originate { metric METRIC | metric-type TYPE ) | route-map
ROUTE_MAP | always }
no default-information originate
no default-information originate { metric | metric-type | route-map | always }
```

| 参数 | 说明 |
| --- | --- |
| always | (可选) 在没有配置静态默认路由的情况下始终向 OSPFv3 网络通告默认路由，如果没有指定该关键字，本机必须要配置缺省路由才可以引入产生缺省路由的ASE LSA。 不超过20 个字符 |
| METRIC | (可选)被用作生成默认路由的Metric。假如你没有指定相应的值，默认值是1。 0-16777214 |
| TYPE | (可选) 外部链路的路由类型: 1—type 1 的5 类LSA 2—type 2 类型的5 类LSA 1,2 (可选) 外部链路的路由类型: 1—type 1 的5 类LSA 2—type 2 类型的5 类LSA 默认是Type2 |
| ROUTE_MAP | 路由策略 |

**命令模式**：路由模式

**默认配置**：默认关闭

**使用说明**：

当你使用重发布命令(redistribute)或引入缺省路由命令(default-information-originate)
  时，路由器自动成为自治系统边界路由器(ASBR)。 ASBR 默认不会向OSPFv3 域生成默
  认路由，除非系统本身已经存在默认路由或者指定了always 关键字。
  IPv6 的route-map 目前还没有支持，如果配置了route-map 当作route-map 不存在时
  处理。

**示例**：

```
下面例子设置了默认路由以及修改对应的Metric 值和类型:
Switch# configure terminal
Switch(config)# router ipv6 ospf 109
Switch(config-router)# redistribute rip metric 100
Switch(config-router)#default-information originate metric 100 metric-type 1
```

**相关命令**：redistribute (OSPFv3)

### 7.1.7 `default-metric (OSPFv3)`

**功能**：使用此命令设置OSPFv3 引入外部路由时的开销，使用此命令的no 格式恢复路由开销
  为默认值。

**语法**：

```
default-metric METRIC-VALUE

no default-metric ( METRIC-VALUE )
```

| 参数 | 说明 |
| --- | --- |
| METRIC-VALUE | 设置指定的路由开销 0-16777214 |

**命令模式**：路由模式

**默认配置**：对于引入的BGP 路由，默认为1 对于其他的，默认为20

**使用说明**：

default-metric 命令通常和redistribute 路由器配置命令一起使用。

**示例**：

```
下面例子将RIPng 路由引入到OSPFv3，并将引入时的路由开销设为10:
Switch# configure terminal
Switch(config)# router ipv6 ospf
Switch(config-router)#default-metric 10
Switch(config-router)# redistribute ripng
```

**相关命令**：redistribute (OSPFv3)

### 7.1.8 `distance (OSPFv3)`

**功能**：设置OSPFv3 的管理距离，使用no 命令恢复默认配置。

**语法**：

```
distance { DISTANCE | ospfv3 [ external DIST1 ] [ inter-area DIST2 ] | [ intra-area DIST3 ] }
no distance { DISTANCE | ospfv3 }
```

| 参数 | 说明 |
| --- | --- |
| DISTANCE | 管理距离 1-254。(管理距离为255 的路由无效) |
| external DIST1 | (可选)对区域外路由设置管理距离 1-254 |
| inter-area DIST2 | (可选)对区域间路由设置管理距离 1-254 |
| intra-area DIST3 | (可选)对区域内路由设置管理距离 1-254 |

**命令模式**：路由模式

**默认配置**：DIST1: 110 DIST2: 110 DIST3: 110

**使用说明**：

默认情况下，区域内、区域间、区域外路由的管理距离都为110。
  管理距离表征的是对路由的可信度；管理距离越小，此种路由的可信度越高。
  当有不止一条的路由可以到达目标时，路由器根据路由的可信度，即根据管理
  距离选择采用何种路由。只在本地有效。

**示例**：

```
下面例子设置了OSPFv3 的管理距离:
Switch# configure terminal
Switch(config)# router ipv6 ospf
Switch(config-router)#distance 90
Switch(config-router)# redistribute ripng
```

**相关命令**：无

### 7.1.9 `distribute-list (OSPFv3)`

**功能**：使用该命令对OSPFv3 计算出的路由或重发布到OSPFv3 中的路由进行过滤。使用此命
  令的no 格式取消过滤行为。

**语法**：

```
distribute-list ACCESSS-LIST-NAME ( in | out ( bgp | connected | ospfv3 | ripng | static ) )
no distribute-list ACCESSS-LIST-NAME ( in | out ( bgp | connected | ospfv3 | ripng |
static ) )
```

| 参数 | 说明 |
| --- | --- |
| ACCESSS-LIST-NAME | ACL 名称不超过20 个字符 |
| in | 对OSPFv3 计算出来的路由进行过滤 |
| out | 对重发布到OSPFv3 中的路由进行过滤 |

**命令模式**：路由模式

**默认配置**：默认无配置

**使用说明**：

必须要指定一个ACL。in 方向用来设置路由信息的过滤条件，只有通过过滤的路由信
  息才下到RIB 中；out 方向用来配置对引入的路由信息进行过滤。

**示例**：

```
下面的例子中，只接收2001:1::1/32 和3001:1::1/32 两个网段的路由:
Switch# configure terminal
Switch(config)# ipv6 access-list fiter-as-router
Switch(config-ip-acl)# permit any 2001:1:1::1/32 any
Switch(config-ip-acl)# permit any 3001:1:1::1/32 any
Switch(config-ip-acl)#deny any any any
Switch(config)# router ipv6 ospf 1
Switch(config-router)#distribute-list acl1 in
```

**相关命令**：ipv6 access-list

### 7.1.10 `enable db-summary-opt`

**功能**：使用该命令对OSPFv3 邻居间Database Exchage 的过程进行优化，使用此命令的no 格
  式取消database exchange 过程的优化。

**语法**：

```
enable db-summary-opt
no enable db-summary-opt
```

**命令模式**：路由模式

**默认配置**：默认不使能

**使用说明**：

使能了这个功能后，在database exchange 的过程中，当路由器从邻居收到DD 报文后，
  发现邻居的LSA 比自己的新，那么将这个LSA 从自己的Databse Summary list 中删除，
  没必要再发该LSA 的DD 报文给邻居了。

**示例**：

```
下面的例子使能了Database Exchange 过程的优化:
Switch# configure terminal
Switch(config)# router ipv6 ospf 1
Switch(config-if)# enable db-summary-opt

Switch# configure terminal
Switch(config)# router ipv6 ospf 1
Switch(config-router)# enable db-summary-opt
```

**相关命令**：无

### 7.1.11 `ipv6 ospf cost`

**功能**：使用此命令设置端口不同实例下开销，使用此命令的no 格式设置端口开销为默认值。

**语法**：

```
ipv6 ospf cost INTERFACE-COST ( instance ID | )
no ipv6 ospf cost ( instance ID | )
```

| 参数 | 说明 |
| --- | --- |
| INTERFACE-COST | 设置端口的范围值1 到 65535 1-65535 |

**命令模式**：端口配置模式

**默认配置**：端口的速率不一样，默认开销也可能不一样。

**使用说明**：

如果你不想使用默认的端口开销，可以用该命令来改变开销值。也可以使用reference
  bandwidth 来改变端口开销。

**示例**：

```
下面例子设置端口的开销为65:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ipv6 ospf cost 65
```

**相关命令**：auto-cost reference bandwidth

### 7.1.12 `ipv6 ospf dead-interval`

**功能**：邻居路由器失效时间。如果在该时间之后还没有收到邻居的任何hello 报文，则宣告邻
  居死亡。使用此命令的no 格式恢复此时间段为默认值。

**语法**：

```
ipv6 ospf dead-interval SECONDS ( instance ID | )
no ipv6 ospf dead-interval ( instance ID | )
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 设置的时间间隔值。 网络上所有节点的配置必须相同。 1-65535 |
| ID | 指定接口所属的实例ID， 缺省值是0 0-255 |

**命令模式**：端口配置模式

**默认配置**：默认在宣告邻居死亡之前，端口等待的时间为40 秒

**使用说明**：

邻居路由器失效时间会在hello 报文中被通告。在同一OSPFv3 网络中的时间间隔必须
  一致。该值设置的越短，网络收敛时间也越短，但是会增加网络的不稳定性。

**示例**：

```
设置OSPF 的接口死亡时间间隔为 20 秒:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ipv6 ospf dead-interval 20
```

**相关命令**：ipv6 ospf hello-interval、show ipv6s ospf interface

### 7.1.13 `ipv6 ospf hello-interval`

**功能**：使用此命令设置此端口发送Hello 报文的时间间隔，使用此命令的no 格式设置此端口
  发送Hello 报文的时间间隔为默认值。

**语法**：

```
ip ospf hello-interval SECONDS ( instance ID | )
no ip ospf hello-interval ( instance ID | )
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 范围值1～65535，期间路由器必须接收到一个hello 报文，否则这个邻居就会在邻居表中被删除。网络上所有节点的hello interval 必须要配置成一样的。 1-65535 |
| ID | 指定接口所属的实例ID， 缺省值是0 0-255 |

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
Switch(config-if)# ipv6 ospf hello-interval 15
```

**相关命令**：ipv6 ospf dead-interval

### 7.1.14 `ipv6 ospf mtu-ignore`

**功能**：使用此命令设置端口接收数据库描述报文时，忽略对MTU 字段的检测。
  使用此命令的no 格式恢复对数据库描述报文的MTU 字段检测。

**语法**：

```
ipv6 ospf mtu-ignore ( instance ID | )
no ipv6 ospf mtu-ignore ( instance ID | )
```

| 参数 | 说明 |
| --- | --- |
| ID | 指定接口所属的实例ID， 缺省值是0 0-255 |

**命令模式**：端口配置模式

**默认配置**：默认接口启用MTU 的匹配功能。

**使用说明**：

OSPFv3 检查邻居是否使用相同的MTU 值。这个检查发生在互相交换数据库描述报文
  时，如果在接收到的DD 报文里的MTU 高于入接口上配置的 MTU，OSPFv3s 邻接将无
  法建立。

**示例**：

```
下面例子设置了在端口上接收到DD 报文时不对MTU 值进行检测:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ipv6 ospf mtu-ignore
```

**相关命令**：无

### 7.1.15 `ipv6 ospf priority`

**功能**：使用此命令设置路由器端口优先权，这个值被用来在网络中选举指定路由器。使用此
  命令的no 格式恢复端口优先权为默认值。

**语法**：

```
ipv6 ospf priority NUMBER-VALUE ( instance ID | )

no ipv6 ospf priority ( instance ID | )
```

| 参数 | 说明 |
| --- | --- |
| NUMBER-VALUE | 优先级范围 0-255 |
| ID | 指定接口所属的实例ID， 缺省值是0 0-255 |

**命令模式**：端口配置模式

**默认配置**：默认值是1

**使用说明**：

端口的默认优先权值为1。
  端口的优先权主要用来选举网络中的DR 和BDR；优先级高的会被选举为DR。
  如果优先级相等，则Router-ID 大的会被选举为DR；如果某一个端口的优先级被设置
  为0，则此端口不会参加DR 和BDR 的选举。.端口优先级只在多路访问的网络中起作
  用，也就是说，对点对点网络无效。

**示例**：

```
下面例子配置了OSPFv3 的接口优先级为4:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ipv6 ospf priority 4
```

**相关命令**：无

### 7.1.16 `ipv6 ospf retransmit-interval`

**功能**：使用此命令设置在邻接间交换LSA 报文时的重传时间间隔，使用此命令的no 格式恢复
  在邻接间交换LSA 报文时的重传时间间隔为默认值。

**语法**：

```
ipv6 ospf retransmit-interval SECONDS ( instance ID | )

no ipv6 ospf retransmit-interval ( instance ID | )
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 重传时间间隔，以秒为单位 1-65535 秒 |
| ID | 指定接口所属的实例ID， 缺省值是0 0-255 |

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

当一个路由器发送LSA 报文到它的邻居时，它会缓存该报文直到收到邻居的确认报文。
  如果在重传时间间隔内没有收到确认报文，该LSA 将被重传。设置该值必须要谨慎，
  以免引起不必要的重传。通常，这个值要大于两个路由器之间的报文往返延迟。

**示例**：

```
下面例子设置了接口的LSA 报文交换时候的重传时间:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ipv6 ospf retransmit-interval 8
```

**相关命令**：无

### 7.1.17 `ipv6 ospf transmit-delay`

**功能**：使用此命令设置端口发送一个LSA 报文的延迟时间，使用此命令的no 格式恢复此时间
  为默认值。

**语法**：

```
ipv6 ospf transmit-delay SECONDS ( instance ID | )
no ipv6 ospf transmit-delay ( instance ID | )
```

| 参数 | 说明 |
| --- | --- |
| SECONDS | 重传延迟时间，以秒为单位 1-65535 秒 |
| ID | 指定接口所属的实例ID， 缺省值是0 0-255 |

**命令模式**：端口配置模式

**默认配置**：默认为1 秒。

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
Switch(config-if)# ipv6 ospf transmit-delay 3
```

**相关命令**：无

### 7.1.18 `ipv6 ospf network`

**功能**：使用此命令设置接口的网络类型，使用此命令的no 格式恢复默认值

**语法**：

```
ipv6 ospf network ( broadcast | non-broadcast | point-to-multipoint ( non-broadcast | )
| point-to-point | ) ( instance <0-255> | )
no ipv6 ospf network ( instance <0-255> | )
```

| 参数 | 说明 |
| --- | --- |
| broadcast | 设置接口网络类型为广播 |
| non-broadcast | 设置接口网络类型为 |
| NBMA |  |
| point-to-multipoint | 设置接口网络类型为点到多点 |
| non-broadcast |  |
| point-to-point | 设置接口网络类型为点到点 - |
| instance | 指定设置网络类型的实例 ID，缺省值是0 0-255 |

**命令模式**：端口配置模式

**默认配置**：默认接口网络类型为广播

**使用说明**：

无

**示例**：

```
下面例子讲述如何设置接口的网络类型为点到点:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ipv6 ospf network point-to-point
```

**相关命令**：无

### 7.1.19 `ipv6 ospf neighbor`

**功能**：使用此命令设置IPv6 ospf 邻居，使用此命令的no 格式恢复默认值

**语法**：

```
ipv6 ospf neighbor ADDRESS ( { poll-interval <1-65535> | priority <0-255> } | ) ( cost
<1-65535> | ) ( instance <0-255> | )
no ipv6 ospf neighbor ( instance <0-255> | )
```

| 参数 | 说明 |
| --- | --- |
| ADDRESS | IPv6 邻居地址 IPv6 地址 |
| poll-interval | 设置NBMA 网络上邻居交换机发送轮询Hello 报文的时间间隔 1-65535 |
| priority | 设置NBMA 非广播网络上邻居优先级 0-255 |
| cost | 设置NBMA 网络上邻居的接口开销 1-65535 |
| instance | 指定设置网络类型的实例 ID，缺省值是0 0-255 |

**命令模式**：端口配置模式

**默认配置**：默认没有配置IPv6 ospf 邻居

**使用说明**：

无

**示例**：

```
下面例子讲述如何设置接口上的IPv6 ospf 邻居:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ipv6 ospf neighbor fe80::1
```

**相关命令**：无

### 7.1.20 `passive-interface (OSPF)`

**功能**：使用此命令抑制端口发送Hello 报文，使用此命令的no 格式取消端口对发送Hello 报
  文的抑制。

**语法**：

```
passive-interface IFNAME
no passive-interface IFNAME
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名字支持物理端口，聚合端口， 环回端口，VLAN 端口和隧道端口 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

如果在接口上禁用路由更新报文的发送，那么此接口还是能正常接收和处理OSPF 报文
  的。

**示例**：

```
下面例子将端口设备为被动接口:
Switch# configure terminal
Switch(config)# router ipv6 ospf 200
Switch(config-router)# passive-interface eth-0-1
```

**相关命令**：router ipv6 ospf

### 7.1.21 `redistribute (OSPFv3)`

**功能**：此命令设置路由重发布，即把别的路由协议生成的路由引入到OSPFv3 路由域。使用该
  命令的no 形式取消路由重发布。

**语法**：

```
redistribute PROTOCOL [ route-map WORD ] [ tag TAG-VALUE ] [ metric METRIC-
VALUE ] [ metric-type TYPE-VALUE ]

no redistribute PROTOCOL [ metric METRIC-VALUE ] [ metric-type TYPE-VALUE ]
```

| 参数 | 说明 |
| --- | --- |
| route-map WORD | 路由策略不超过20 个字符 |
| PROTOCOL | (可选)路由协议的名字，支持以下类型：直连路由、静态路由、BGP，RIPng |
| connected/static/bgp/ripng |  |
| tag TAG-VALUE | 设置路由的TAG 0-4294967295 |
| metric METRIC-VALUE | (可选)重发布路由时候的 Metric 值，默认20 0-16777214 |
| metric-type TYPE-VALUE | 对于OSPF，有两种类型的外部路由： 类型一的外部路由类型二的外部路由对于OSPF，有两种类型的外部路由： 类型一的外部路由类型二的外部路由默认是二类路由. 1-2 |

**命令模式**：路由模式

**默认配置**：默认重发布不开启。 metric metric-value：默认值20。 metric-type type-value：类型2 的外部路由。

**使用说明**：

在该命令里配置的metric 值将覆盖用命令default metric 配置的值。
  外部路由是指到达自治系统外部的路由。
  Type-1 外部路由指接收的IGP 路由，如RIPng 和STATIC。此类路由有较高的可靠性，
  所以外部路由开销的计算结果等于自治系统的内部路由开销，并可与OSPF 本身的路
  由开销相比较。也就是说，到达Type-1 外部路由的开销等于路由器到达对应ASBR 的
  开销加上ASBR 到达目的地址的开销。
  Type-2 外部路由指接收的EGP 路由。此类路由可靠性较低，所以OSPF 协议认为从
  ASBR 到达自治系统外部的路由开销要远远高于自治系统内部到达ASBR 的路由开销。
  
  因此在计算路由开销时主要考虑前者。也就是说，到达Type-2 外部路由的开销等于
  ASBR 到达目的地址的开销。
  BGP 和route-map 不支持。

**示例**：

```
下面例子重发布了静态路由，并将其Metric 设置为10:
Switch# configure terminal
Switch(config)# router ospf 119
Switch(config-router)# redistribute static metric 10
```

**相关命令**：default-metric

### 7.1.22 `router-id (OSPF)`

**功能**：使用此命令设置路由器标识为指定的值，使用此命令的no 格式设置标识为默认值。

**语法**：

```
router-id IP-ADDRESS
no router-id
```

| 参数 | 说明 |
| --- | --- |
| IP-ADDRESS | 路由ID IPv6 地址 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

此参数是OSPFv3 协议中一个很重要的参数；在OSPFv3 协议中，路由器ID 号是一个
  32 比特无符号整数，是一台路由器在OSPFv3 自治系统中的唯一标识。用户必须在
  OSPFv3 视图下配置路由器ID 号，否则OSPFv3 将无法运行。 在手工设置路由器ID 号
  时，必须保证自治系统中任意两台路由器ID 号都不相同。若在已经有邻居的路由器上
  用此命令更改了路由器ID，则该ID 必须重新启用OSPF 协议才能生效。

**示例**：

```
下面例子配置了OSPF 的Route-id:
Switch# configure terminal
Switch(config)# router ipv6 ospf 119
Switch(config-router)# router-id 10.1.1.1
```

**相关命令**：clear ipv6 ospf、router ipv6 ospf

### 7.1.23 `router ipv6 ospf`

**功能**：使用此命令创建OSPFv3 进程。

**语法**：

```
router ipv6 ospf [ PROCESS-ID [ vrf VPN-NAME ] ]
no router ipv6 ospf [ PROCESS-ID ]
```

| 参数 | 说明 |
| --- | --- |
| PROCESS-ID | OSPFv3 进程号，整数形式，取值范围是1～ 65535。如果不指定进程号，缺省使用进程号0。 1-65535 |
| vrf VPN-NAME | (可选)VPN 中的OSPFv3 的进程长度不超过31 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

只有在OSPFv3 视图下配置了Router ID，OSPFv3 进程才能正常运行，否则只能看到该
  进程，但无法生成LSA。

**示例**：

```
下面例子创建了OSPFv3 进程109:
Switch# configure terminal
Switch(config)# router ipv6 ospf 109
```

**相关命令**：无

### 7.1.24 `summary-address (OSPFv3)`

**功能**：使用此命令对外部路由进行汇总，使用此命令的no 格式取消汇总。

**语法**：

```
summary-address PREFIX / PREFIX-LENGTH [ not-advertise ] [ tag TAG-VALUE ]
no summary-address PREFIX / PREFIX-LENGTH [ not-advertise ] [ tag TAG-VALUE ]
```

| 参数 | 说明 |
| --- | --- |
| PREFIX | IPv6 路由的前缀 IPv6 地址 |
| PREFIX-LENGTH | 前缀长度 1-128 |
| not-advertise | (可选) 如果指定了此项，则对指定网络的外部路由不进行宣告 |
| tag TAG-VALUE | 路由标记 0-4294967295 |

**命令模式**：路由模式

**默认配置**：缺省情况下，不对外部路由进行聚合。

**使用说明**：

从其他路由协议学到的路由可以在ASBR 上进行汇总，汇总路由里的metric 值选择的
  是所有被汇总的路由里值最大的一个。该命令可以用来帮助减少路由表的大小。配置
  summary-address 命令后，对处于聚合地址范围内的外部路由，本地路由器只向邻居
  路由器发布一条聚合后的路由。您可以使用命令area range 对OSPF 区域间的路由进
  行汇总。

**示例**：

```
下面例子配置了汇总路由，汇总路由2001:1:1::/48 包括了子网2001:1:1:1::/64，
2001:1:1:2::/64 等等。此时，只有2001:1:1::/48 这条汇总路由会被发布出去:
Switch# configure terminal
Switch(config)# router ipv6 ospf
Switch(config-router)# summary-address 2001:1:1::/48
```

**相关命令**：area range

### 7.1.25 `show ipv6 ospf`

**功能**：使用此命令查看指定OSPFv3 路由进程相关信息。

**语法**：

```
show ipv6 ospf ( PROCESS-ID | )
```

| 参数 | 说明 |
| --- | --- |
| PROCESS-ID | OSPF 进程号 1-65535 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

不指定OSPFv3 process ID 时，显示所有process 的信息。

**示例**：

```
下面例子查看OSPFv3 的进程信息:
Switch# show ipv6 ospf 65535
Routing Process "OSPFv3 (65535)" with ID 1.1.1.1
 Process uptime is 1 hour 52 minutes
 SPF schedule delay min 0.500 secs, SPF schedule delay max 50.0 secs
 Minimum LSA interval 5 secs, Minimum LSA arrival 1 secs
 Number of incomming current DD exchange neighbors 0/5
 Number of outgoing current DD exchange neighbors 0/5

 Number of external LSA 0. Checksum Sum 0x0000
 Number of AS-Scoped Unknown LSA 0
 Number of LSA originated 3
 Number of LSA received 19
 Number of areas in this router is 1
    Area BACKBONE(0)
        Number of interfaces in this area is 1(1)
        SPF algorithm executed 6 times
        Number of LSA 4.  Checksum Sum 0x16569
        Number of Unknown LSA 0
```

**相关命令**：无

### 7.1.26 `show ipv6 ospf database`

**功能**：使用此命令查看指定OSPFv3 路由进程的链路状态数据库信息。

**语法**：

```
show ipv6 ospf ( PROCESS-ID | ) database
show ipv6 ospf ( PROCESS-ID | ) database adv-router ROUTER-ID
show ipv6 ospf ( PROCESS-ID | ) database ( external | inter-prefix | inter-router | intra-
prefix | link | network | nssa-external | router ) ( LINK-STATE-ID | ) ( adv-router
ROUTER-ID | self-originate )
show ipv6 ospf ( PROCESS-ID | ) database max-age
show ipv6 ospf ( PROCESS-ID | ) database self-originate
```

| 参数 | 说明 |
| --- | --- |
| PROCESS-ID | (可选) OSPFv3 进程号 1-65535 |
| adv-router ROUTER-ID | (可选) 查看指定OSPFv3 宣告路由器的LSA 信息 A.B.C.D 格式的IPv4 地址 |
| LINK-STATE-ID | (可选) 查看自治系统边界路由器的汇总LSA 信息 A.B.C.D 格式的IPv4 地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子查看OSPFv3 的数据库信息:
Switch# show ipv6 ospf 65535 database
            OSPFv3 Router with ID (1.1.1.1) (Process 65535)
                Link-LSA (Interface vlan1000)
Link State ID   ADV Router      Age  Seq#       CkSum  Prefix
0.0.19.232      1.1.1.1         1492 0x80000002 0x27e3      1
0.0.19.232      2.2.2.2         1488 0x80000002 0xcc94      1
                Router-LSA (Area 0.0.0.0)
Link State ID   ADV Router      Age  Seq#       CkSum    Link
0.0.0.0         1.1.1.1         1452 0x80000003 0x42d6      1
0.0.0.0         2.2.2.2         1449 0x80000003 0x24f0      1
                Network-LSA (Area 0.0.0.0)
Link State ID   ADV Router      Age  Seq#       CkSum
0.0.19.232      2.2.2.2         1453 0x80000001 0x7f99
                Intra-Area-Prefix-LSA (Area 0.0.0.0)
Link State ID   ADV Router      Age  Seq#       CkSum  Prefix  Reference
0.0.0.2         2.2.2.2         1448 0x80000001 0x96fd      2  Network-LSA
```

**相关命令**：无

### 7.1.27 `show ipv6 ospf interface`

**功能**：使用此命令显示OSPFv3 接口的信息。

**语法**：

```
show ipv6 ospf interface ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | (可选) 接口的名字支持物理端口，聚合端口， 环回端口，VLAN 端口和隧道端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子查看OSPFv3 接口信息:
Switch# show ipv6 ospf interface vlan 12
vlan12 is up, line protocol is up
  Interface ID 4108
  IPv6 Prefixes
    fe80::8eb5:d5ff:fed9:ff00/10 (Link-Local Address)
    2004:12:0:12::1/96
  OSPFv3 Process (0), Area 0.0.0.0, Instance ID 0
    Router ID 1.1.1.1, Network Type BROADCAST, Cost: 1
    Transmit Delay is 1 sec, State Backup, Priority 1
    Designated Router (ID) 2.2.2.2
      Interface Address fe80::188f:beff:fe99:9800
    Backup Designated Router (ID) 1.1.1.1
      Interface Address fe80::8eb5:d5ff:fed9:ff00
    Timer interval configured, Hello 10, Dead 40, Wait 40, Retransmit 5
      Hello due in 00:00:06
    Neighbor Count is 1, Adjacent neighbor count is 1
```

**相关命令**：无

### 7.1.28 `show ipv6 ospf neighbor`

**功能**：使用此命令查看指定OSPFv3 路由进程的邻居信息。

**语法**：

```
show ipv6 ospf neighbor ( IFNAME | ) ( NEIGHBOR-ID | ) ( detail | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | (可选) 接口名字. 支持物理端口，聚合端口， 环回端口，VLAN 端口和隧道端口 |
| NEIGHBOR-ID | (可选) 邻居ID A.B.C.D 格式的IPv4 地址 |
| detail | (可选) 查看邻居的详细信息 - |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子查看OSPFv3 邻居信息:
Switch# show ipv6 ospf neighbor
OSPFv3 Process (0)
Neighbor ID     Pri   State           Dead Time   Interface  Instance ID
2.2.2.2           1   Full/DR         00:00:31    vlan12     0
2.2.2.2           1   Full/DR         00:00:33    vlan1212   0
OSPFv3 Process (65535)
Neighbor ID     Pri   State           Dead Time   Interface  Instance ID
2.2.2.2           1   Full/DR         00:00:31    vlan1000   0
```

**相关命令**：无

### 7.1.29 `show ipv6 ospf database database-summary`

**功能**：使用此命令显示OSPFv3 数据库信息的摘要和汇总。

**语法**：

```
show ipv6 ospf ( PROCESS-ID | ) database database-summary
```

| 参数 | 说明 |
| --- | --- |
| PROCESS-ID | (可选) OSPFv3 进程ID 1-65535 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子查看OSPFv3 数据库摘要信息:
Switch# show ipv6 ospf 65535 database database-summary
            OSPFv3 Router with ID (1.1.1.1) (Process ID 65535)
Area (0.0.0.0) database summary
  LSA Type              Count         MaxAge
  Router                  2             0
  Network                 1             0
  Inter-Prefix            0             0
  Inter-Router            0             0
  Intra-Prefix            1             0
  Subtotal                4             0
Process 65535 database summary
  LSA Type              Count         MaxAge
  Router                  2             0
  Network                 1             0
  Inter-Prefix            0             0
  Inter-Router            0             0
  Type-5 Ext              0             0
  Link                    2             0
  Intra-Prefix            1             0
  Total                   6             0
```

**相关命令**：无

### 7.1.30 `show ipv6 ospf route`

**功能**：使用此命令显示OSPFv3 路由的信息。

**语法**：

```
show ipv6 ospf ( PROCESS-ID | ) route
```

| 参数 | 说明 |
| --- | --- |
| PROCESS-ID | (可选) OSPFv3 进程ID 1-65535 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子查看OSPFv3 路由信息:
Switch# show ipv6 ospf route
OSPFv3 Process (0)
Codes: C - connected, D - Discard, O - OSPF, IA - OSPF inter area
       E1 - OSPF external type 1, E2 - OSPF external type 2
   Destination                                   Metric
     Next-hop
C  2004:1:0:10::/96                                   1
     directly connected, vlan10, Area 0.0.0.0
C  2004:1:0:20::/96                                   1
     directly connected, vlan20, Area 0.0.0.14
C  2004:1:0:100::/96                                  1
     directly connected, vlan100, Area 0.0.0.0
C  2004:1:0:200::/96                                  1
     directly connected, vlan200, Area 0.0.0.14
O  2004:2:0:10::/96                                   2
     via fe80::188f:beff:fe99:9800, vlan1212, Area 0.0.0.0
     via fe80::188f:beff:fe99:9800, vlan12, Area 0.0.0.0
IA 2004:2:0:20::/96                                   2
     via fe80::188f:beff:fe99:9800, vlan1212, Area 0.0.0.0
     via fe80::188f:beff:fe99:9800, vlan12, Area 0.0.0.0
```

**相关命令**：无

### 7.1.31 `show ipv6 ospf route summary`

**功能**：使用此命令显示OSPFv3 路由的信息汇总。

**语法**：

```
show ipv6 ospf ( PROCESS-ID | ) route summary
```

| 参数 | 说明 |
| --- | --- |
| PROCESS-ID | (可选) OSPFv3 进程ID 1-65535 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子查看OSPFv3 路由摘要信息:
Switch# show ipv6 ospf route summary
            OSPFv3 Router with ID (1.1.1.1) (Process ID 0)
  Route Type                      Count
  (C)Connected                       8
  (D)Discard                         0
  (O)Intra area                      2
  (IA)Inter area                     4
  (E1)Ext type 1                     0
  (E2)Ext type 2                     0
  (N1)NSSA Ext type 1                0
  (N2)NSSA Ext type 2                0
  Total                              14
            OSPFv3 Router with ID (1.1.1.1) (Process ID 65535)
  Route Type                      Count
  (C)Connected                       1
  (D)Discard                         0
  (O)Intra area                      1
  (IA)Inter area                     0
  (E1)Ext type 1                     0
  (E2)Ext type 2                     0
  (N1)NSSA Ext type 1                0
  (N2)NSSA Ext type 2                0
  Total                              2
```

**相关命令**：无

### 7.1.32 `show ipv6 protocols ospf`

**功能**：使用此命令查看OSPFv3 协议的参数设置信息。

**语法**：

```
show ipv6 protocols ospf
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子查看OSPFv3 协议的信息:
Switch# show ipv6 protocols ospf
Routing Protocol is "OSPFv3 (0)" with ID 1.1.1.1
  Redistributing:
  Distance: (default is 110)
 Routing Protocol is "OSPFv3 (65535)" with ID 1.1.1.1
  Redistributing:
  Distance: (default is 110)
```

**相关命令**：无

### 7.1.33 `timers spf`

**功能**：使用此命令设置收到拓扑变化报文而计算SPF 的时间。

**语法**：

```
timers spf exp SPF-HOLD_MIN SPF-HOLD_MAX
no timers spf exp
```

| 参数 | 说明 |
| --- | --- |
| SPF-HOLD_MIN | 接收到网络变化报文开始计算SPF 之前的最小延迟时间，以毫秒为单位 0-2147483647 毫秒 |
| SPF-HOLD_MAX | 接收到网络变化报文开始计算SPF 之前的最大延迟时间，以毫秒为单位 0-2147483647 毫秒 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子设置了OSPFv3 的SPF 计算参数:
Switch# configure terminal
Switch(config)# router ipv6 ospf 1
Switch(config-router)# router-id 10.10.10.2
Switch(config-router)# timers spf exp 20 50
```

**相关命令**：无

### 7.1.34 `max-concurrent-dd`

**功能**：使用此命令设置能够同时处理的最大的DD 报文数目。
  使用此命令的no 格式恢复为默认值。

**语法**：

```
max-concurrent-dd NUMBER-VALUE
no max-concurrent-dd
```

| 参数 | 说明 |
| --- | --- |
| NUMBER-VALUE | 可同时处理的DD 报文的最大数量 1-65535 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子配置了可同时处理的DD 报文的最大数量:
Switch# configure terminal
Switch(config)# router ipv6 ospf 100
Switch(config-router)# router-id 10.10.10.2
Switch(config-router)# max-concurrent-dd 10
```

**相关命令**：无

### 7.1.35 `debug ipv6 ospf`

**功能**：使用该命令打开所有的OSPFv3 调试开关。使用该命令的no 形式关闭OSPF 调试功能。

**语法**：

```
debug ipv6 ospf ( all | )
no debug ipv6 ospf ( all | )
```

| 参数 | 说明 |
| --- | --- |
| all | 打开全部调试开关 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# debug ipv6 ospf all
Switch# debug ipv6 ospf
```

**相关命令**：无

### 7.1.36 `debug ipv6 ospf events`

**功能**：使用该命令打开OSPFv3 的事件调试开关。使用该命令的no 形式关闭OSPFv3 的事件
  调试功能。

**语法**：

```
debug ipv6 ospf events ( abr | asbr | nssa | os | router | vlink )
no debug ipv6 ospf events ( abr | asbr | nssa | os | router | vlink )
```

| 参数 | 说明 |
| --- | --- |
| abr | 打开ABR 调试开关 |
| asbr | 打开ASBR 调试开关 |
| nssa | 打开NSSA 调试开关 |
| os | 打开OS 交互调试开关 |
| router | 打开路由器调试开关 |
| vlink | 打开虚链路调试开关 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# debug ipv6 ospf events nssa
Switch# debug ipv6 ospf events lsa
```

**相关命令**：无

### 7.1.37 `debug ipv6 ospf ifsm`

**功能**：使用该命令打开OSPFv3 的接口状态机调试开关。使用该命令的no 形式关闭该功能的
  调试开关。

**语法**：

```
debug ipv6 ospf ifsm ( status | events | timers )
no debug ipv6 ospf ifsm ( status | events | timers )
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
Switch# debug ipv6 ospf ifsm timers
```

**相关命令**：无

### 7.1.38 `debug ipv6 ospf nfsm`

**功能**：使用该命令打开OSPFv3 的邻居状态机调试开关。使用该命令的no 形式关闭该功能的
  调试开关。

**语法**：

```
debug ipv6 ospf nfsm ( status | events | timers )
no debug ipv6 ospf nfsm ( status | events | timers )
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
Switch# debug ipv6 ospf nfsm timers
```

**相关命令**：无

### 7.1.39 `debug ipv6 ospf lsa`

**功能**：使用该命令打开OSPFv3 的链路状态通告(LSA)调试开关。使用该命令的no 形式关闭该
  功能的调试开关。

**语法**：

```
debug ipv6 ospf lsa ( flooding | generate | install | maxage | refresh )
no debug ipv6 ospf lsa ( flooding | generate | install | maxage | refresh )
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
Switch# debug ipv6 ospf lsa install
```

**相关命令**：无

### 7.1.40 `debug ipv6 ospf packet`

**功能**：使用该命令打开OSPFv3 的报文调试开关，使用该命令的no 形式关闭该功能的调试开
  关。

**语法**：

```
debug ipv6 ospf packet PARAMETERS
no debug ipv6 ospf packet PARAMETERS
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
Switch# debug ipv6 ospf packet dd send detail
```

**相关命令**：无

### 7.1.41 `debug ipv6 ospf route`

**功能**：使用该命令打开路由计算调试开关，使用该命令的no 形式关闭该功能的调试开关。

**语法**：

```
debug ipv6 ospf route ( ase | ia | install | spf )
no debug ipv6 ospf route ( ase | ia | install | spf )
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
Switch# debug ipv6 ospf route install
```

**相关命令**：无

### 7.1.42 `show debugging ipv6 ospf`

**功能**：使用该命令查看OSPFv3 的调试开关状态。

**语法**：

```
show debugging ipv6 ospf
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了OSPF 调试开关的状态信息:
Switch# show debugging ipv6 ospf
OSPFv3 debugging status:
  OSPFv3 all packet detail debugging is on
  OSPFv3 all IFSM debugging is on
  OSPFv3 all NFSM debugging is on
  OSPFv3 all LSA debugging is on
  OSPFv3 all route calculation debugging is on
  OSPFv3 all event debugging is on
```

**相关命令**：无

### 7.1.43 `show resource ipv6 ospf`

**功能**：使用该命令来显示OSPFv3 路由占用的硬件资源统计。

**语法**：

```
show resource ipov6 ospf
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了OSPFv3 资源信息:
Switch# show resource ipv6 ospf
OSPFv3
Resource                         Used          Capability
=============================================================
Routes                           16            1913
```

**相关命令**：show ipv6 ospf route summary

### 7.1.44 `show ipv6 vrf ospf`

**功能**：使用该命令来显示OSPFv3 接口属于哪个vrf

**语法**：

```
show ipv6 vrf ospf
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面的例子显示了OSPFv3 接口与vrf 的关系:
Switch# show ipv6 vrf ospf
Name             Interfaces
ccc              eth-0-9
```

**相关命令**：无

### 7.1.45 `area nssa`

**功能**：使用此命令设置指定区域为NSSA 区域，使用关键字no 取消对此区域为存根区域的设
  置。

**语法**：

```
area AREA-ID nssa ( translator-role ( candidate | never | always ) | ) ( no-summary | )
( no-redistribution | ) ( default-information-originate { metric METRIC_VALUE | metric-
type TYPE-VALUE | } | )
no area AREA-ID nssa ( translator-role | ) ( no-summary | ) ( no-redistribution | )
( stability-interval | ) ( default-information-originate | )
```

| 参数 | 说明 |
| --- | --- |
| AREA-ID | 区域标识符，标识符可以是十进制的或者是IP 地址 IP 地址或0-4294967295 的整数 |
| candidate | (可选)配置ABR 在NSSA 区域中的角色为候选转换路由器 |
| always | (可选)配置ABR 在NSSA 区域中的角色为指定转换路由器 |
| no-summary | (可选)如果指定了此项，则禁止ABR 向此区域发送 |
| Summary LSAs |  |
| no-redistribution | (可选)如果指定了此项，则禁止向此区域引入外部路由 |
| default-information- |  |
| originate | (可选)如果指定了此项，则 ASBR 将产生默认的type 7 LSA 到NSSA 区域 |
| metric METRIC_VALUE | (可选)配置生成的默认路由的metric 值 0-16777214 |
| metric-type TYPE-VALUE | (可选)配置生成的默认路由的metric 类型 1-2 |
| stability-interval |  |
| INTERVAL-VALUE | (可选)配置失效时间 |
| 0-2147483647 seconds |  |

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
Switch(config)# router ipv6 ospf 201
Switch(config-router)# area 10.0.0.0 nssa
```

**相关命令**：无、7.2 RIPng 命令


## 7.2 RIPng 命令

### 7.2.1 `router ipv6 rip`

**功能**：使用此命令使能RIPng 功能或者进入RIPng 配置模式，使用此命令的no 形式关闭
  RIPng 功能。

**语法**：

```
router ipv6 rip
no router ipv6 rip
```

**命令模式**：全局配置模式

**默认配置**：默认RIPng 不使能

**使用说明**：

无

**示例**：

```
下面例子使能了RIPng 功能:
Switch# configure terminal
Switch(config)# router ipv6 rip
```

**相关命令**：无

### 7.2.2 `ipv6 router rip`

**功能**：使用此命令可以在某个接口下使能RIPng 功能，使用此命令的no 形式关闭接口的
  RIPng 功能。

**语法**：

```
ipv6 router rip
no ipv6 router rip
```

**命令模式**：端口配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子在接口eth-0-1 上使能了RIPng 功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# no switchport
Switch(config-if)# ipv6 router rip
```

**相关命令**：无

### 7.2.3 `ipv6 rip metric-offset`

**功能**：使用此命令用来给RIPng 接口设置接收附加度量值，使用此命令的no 形式恢复默认的
  接口接收附加度量值。

**语法**：

```
ipv6 rip metric-offset NUMBER-VALUE
no ipv6 rip metric-offset NUMBER-VALUE
```

| 参数 | 说明 |
| --- | --- |
| NUMBER-VALUE | 附加度量值 1-16 |

**命令模式**：端口配置模式

**默认配置**：默认附加度量值是1

**使用说明**：

当收到一条合法的RIPng 路由，在其加入到路由表之前，接口接收度量值会附加到该
  路由上，再加入路由表中，因此路由表中的度量值发生变化。即是说，增加一个接口
  的接收度量值，该接口收到的RIPng 路由度量值也会相应增加。

**示例**：

```
下面例子给RIPng 接口设置了接收附加度量值为2:
Switch# configure terminal
Switch(config)#interface eth-0-1
Switch(config-if)# ipv6 rip metric-offset 2
```

**相关命令**：无

### 7.2.4 `ipv6 rip split-horizon`

**功能**：使用此命令配置对RIPng 更新报文进行水平分割或者水平分割对性逆转，使用此命令
  的no 形式 关闭水平分割功能。

**语法**：

```
ipv6 rip split-horizon ( poisoned | )
no ipv6 rip split-horizon
```

| 参数 | 说明 |
| --- | --- |
| poisoned | 水平分割对性逆转 |

**命令模式**：端口配置模式

**默认配置**：默认使能水平分割毒性逆转功能

**使用说明**：

当水平分割毒性反转被使能时，从一个接口学到的路由还可以从这个接口向外发布，
  但metric 值必须为16。当水平分割功能被配置时，从一个接口学到的路由不能通过此
  接口向外发布。

**示例**：

```
下面例子使能了RIPng 水平分割功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 rip split- horizon
```

**相关命令**：无

### 7.2.5 `default-information originate (RIPng)`

**功能**：使用此命令用来生成一条缺省路由到RIPng 路由域中，使用此命令的no 形式关闭此功
  能。

**语法**：

```
default-information originate ( route-map NAME | )
no default-information originate ( route-map | )
```

| 参数 | 说明 |
| --- | --- |
| NAME | 引用的Route map 名字不超过20 字符的字符串 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子中，生成的RIPng 缺省路由将强制通过指定接口的路由更新报文发布出去:
Switch# configure terminal
Switch(config)# router ipv6 rip
Switch(config-router)# default-information originate
```

**相关命令**：无

### 7.2.6 `default-metric (RIPng)`

**功能**：使用此命令用来为再发布引入的路由设置RIPng 度量值，使用此命令的no 形式恢复默
  认值。

**语法**：

```
default-metric NUMBER-VALUE
no default-metric
```

| 参数 | 说明 |
| --- | --- |
| NUMBER-VALUE | 度量值 1-16 |

**命令模式**：路由模式

**默认配置**：默认度量值为0。

**使用说明**：

使用此命令用来为再发布引入的路由设置RIPng 度量值。该命令要和重发布命令一起
  使用，这可以使再发布引入的所有路由的度量值是一样的

**示例**：

```
下面例子将RIPng 的度量值设为10，并且重发布OSPFv3 的路由:
Switch# configure terminal
Switch(config)# router ipv6 rip
Switch(config-router)#default-metric 10
Switch(config-router)#redistribute ospfv3
```

**相关命令**：redistribute (RIPng)

### 7.2.7 `distance (RIPng)`

**功能**：使用此命令设置加入RIPng 域的路由管理距离AD 值，使用此命令的no 形式恢复默认
  值。
  管理距离表明了对一个路由源的信任度，它是从0 到255 之间的一个整数。一般情况
  下，值越高，信任等级越低。 如果管理距离为255，说明这个路由源不被信任，从这
  样的源来的所有路由都应该被忽略

**语法**：

```
distance DISTANCE
no distance
```

| 参数 | 说明 |
| --- | --- |
| DISTANCE | 管理距离 1-255。(管理距离为255 的路由无效) |

**命令模式**：路由模式

**默认配置**：默认管理举例120

**使用说明**：

类型
  管理值
  直连接口
  静态路由
  外部BGP
  OSPFv3
  RIPng
  内部BGP
  未知

**示例**：

```
下面例子将RIPng 的管理举例设为200:
Switch# configure terminal
Switch(config)#router ipv6 rip
Switch(config-router)#distance 200
```

**相关命令**：无

### 7.2.8 `neighbor (RIPng)`

**功能**：使用此命令定义一个用于交换路由信息的邻居路由器。使用此命令的no 形式删除该邻
  居路由器。

**语法**：

```
neighbor IPV6_ADDR IFNAME
no neighbor IP-ADDRESS IFNAME
```

| 参数 | 说明 |
| --- | --- |
| IPV6_ADDR | 与此路由器直接相连的路由器Link-local 地址 IPv6 地址 |
| IFNAME | 在某个接口上指定RIPng 邻居支持物理端口，聚合端口， 环回端口，VLAN 端口和隧道端口 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

更新报文以单播形式发送到对端，而不采用正常的组播的形式。通常情况下，要结合
  passive interface(被动接口)一起使用。您可以配置多个RIP 邻居。

**示例**：

```
下面例子中，RIPng 更新不会通过eth-0-1 发送出去，然而neighbor 命令可以使更新
发送到和eth-0-1 直连的某个link-local 地址邻居:
Switch# configure terminal
Switch(config)#router ipv6 rip
Switch(config-router)# passive-interface eth-0-1
Switch(config-router)# neighbor fe80:db8::1 eth-0-1
```

**相关命令**：router rip

### 7.2.9 `offset-list (RIPng)`

**功能**：使用此命令设置命中列表的路由接收或发送RIPng 路由时的偏移度量值。
  使用此命令的no 形式命令删除列表和路由偏移度量值。

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
| METRIC- OFFSET | 应用到路由的偏移度量值 0-16 |
| IFNAME | 接口的ID 支持物理端口，聚合端口， 环回端口，VLAN 端口和隧道端口 |

**命令模式**：路由模式

**默认配置**：默认没有配置offset-list。

**使用说明**：

如果偏移度量值生效，那么接口接收附加度量值的增加被忽略。偏移量列表可以用来
  改变路由的度量值，以达到某些目的(如做备份链路或者负载均衡)。

**示例**：

```
下面例子在RIPng 路由模式下设置了offset 列表以增加发送的路由的度量值:
Switch# configure terminal
Switch(config)# router ipv6 rip
Switch(config-router)# offset-list 21 out 10
```

**相关命令**：无

### 7.2.10 `passive-interface (RIPng)`

**功能**：使用此命令设置端口上禁止发送RIPng 更新报文，使用此命令的no 形式使能发送
  RIPng 更新报文。

**语法**：

```
passive-interface IFNAME
no passive-interface IFNAME
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 指定接口的名字支持物理端口，聚合端口， 环回端口，VLAN 端口和隧道端口 |

**命令模式**：路由模式

**默认配置**：默认不禁止

**使用说明**：

此命令关闭路由更新的发送功能，且忽略指定接口的邻居发送的RIPng request 报文，
  但是指定接口的邻居发送的路由更新能正常的接受和处理。

**示例**：

```
下面例子将eth-0-1 设置为被动接口:
Switch# configure terminal
Switch(config)#router ipv6 rip
Switch(config-router)# passive-interface eth-0-1
访问控制列表
```

**相关命令**：router ipv6 rip

### 7.2.11 `redistribute (RIPng)`

**功能**：用此命令设置路由再发布。使用此命令的no 形式删除再发布的路由。

**语法**：

```
redistribute PROTOCOL { [ metric VALUE ] | route-map NAME }
no redistribute PROTOCOL
```

| 参数 | 说明 |
| --- | --- |
| PROTOCOL | 可引入的源路由协议，包括 OSPF, BGP, static， |
| connected,isis |  |
| connected/static/bgp/ospf/i |  |
| sis |  |
| metric VALUE | 所发布的路由的度量值 1-16 |
| route-map NAME | 路由映射的名字不超过20 字符的字符串 |

**命令模式**：路由模式

**默认配置**：默认不是能重发布。 如不指定metric，默认值是0。

**使用说明**：

redistribute 命令中指定的metric 值将会取代默认度量命令指定的度量值。

**示例**：

```
下面例子设置重发布的静态路由的度量值为10:
Switch# configure terminal
Switch(config)#router ipv6 rip
Switch(config-router)#redistribute static metric 10
```

**相关命令**：default-metric

### 7.2.12 `timers basic (RIPng)`

**功能**：此命令用来配置RIPng 各个定时器的值，可通过调节RIPng 定时器来调整路由协议的
  性能，以满足网络需要。使用此命令的no 形式恢复设置为默认值。

**语法**：

```
timers basic UPDATE TIMEOUT INVALID
no timers basic
```

| 参数 | 说明 |
| --- | --- |
| UPDATE | 路由更新时间 5-2147483647 秒 |
| TIMEOUT | 路由老化时间，如果在老化时间内没有收到关于某条路由的更新报文，则该条路由在路由表中的度量值将会被设置为16，此时该条路由将不能用于转发报文 5-2147483647 秒 |
| INVALID | 路由的垃圾回收时间，定义了一条路由从度量值变为 16 开始，直到它从路由表里被删除所经过的时间。在垃圾回收时间内，RIPng 以 16 作为度量值向外发送这条路由的更新，如果垃圾回收定时器超时，该路由仍没有得到更新，则该路由将从路由表中被彻底删除 5-2147483647 秒 |

**命令模式**：路由模式

**默认配置**：路由更新时间：30 秒； 路由老化时间：180 秒； 路由的垃圾回收时间：120 秒。

**使用说明**：

RIPng 协议的这些时间参数时可调整的。由于RIPng 是一个分布式的，异步的路由协议，
  因此，各个定时器的值在网络中的所有路由器上需要保持一致。

**示例**：

```
下面的例子设置RIPng 路由的报文更新时间5 秒，当超过15 秒没有收到路由更新报文
时，路由将失效。再过15 秒，路由将从RIPng 路由表中删除:
Switch# configure terminal
Switch(config)#router ipv6 rip
Switch(config-router)#timers basic 5 15 15
```

**相关命令**：无

### 7.2.13 `distribute-list(RIPng)`

**功能**：使用此命令过滤网络中路由更新，使用该命令的no 形式恢复默认设置。

**语法**：

```
distribute-list ( prefix NAME | ACCESSS-LIST-NAME ) ( in | out ) ( IFNAME | )
no distribute-list ( prefix name | ACCESSS-LIST-NAME ) ( in | out ) ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| prefix NAME | 过滤列表不超过40 字符的字符串 |
| ACCESSS-LIST-NAME | 访问控制列表名字不超过40 字符的字符串 |
| in | 进口方向过滤 |
| out | 出口方向过滤 |
| IFNAME | 接口名字支持物理端口，聚合端口， 环回端口，VLAN 端口和隧道端口 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子对接收的路由进行过滤:
Switch# configure terminal
Switch(config)#router ipv6 rip
Switch(config-router)# distribute-list prefix 1 in
```

**相关命令**：ipv6 prefix-list

### 7.2.14 `aggregate-address (RIPng)`

**功能**：使用此命令用来配置RIPng 在接口发布聚合IPv6 地址。使用该命令的no 形式取消配
  置的聚合地址。

**语法**：

```
aggregate-address IPV6_PREFIX ( avoid-feedback | ) IFNAME
no aggregate-address IP-ADDRESS IFNAME
```

| 参数 | 说明 |
| --- | --- |
| IPV6_PREFIX | 指定的聚合地址 X:X::X:X/M 格式的IPv6 地址和掩码长度 |
| avoid-feedback | 禁止从此接口学习到相同的聚合路由 |
| IFNAME | 接口名字支持物理端口，聚合端口， 环回端口，VLAN 端口和隧道端口 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

如果一条路由的前缀和前缀长度与定义的IPv6 前缀匹配，则这个自定义的IPv6 前缀将
  取代原来的路由被发布出去。这样，多条路由将由一条路由所代替，并且，这条路由
  的度量值是原多条路由中最低的。
  通过指定avoid-feedback 关键字，本接口将不再学习到和已发布的聚合IP 地址相同的
  聚合路由，从而可以起到防止产生路由环路的作用。
  该命令只有在接口为三层口时才生效。

**示例**：

```
下面例子在接口eth-0-1 配置了一个RIPng 聚合地址:
Switch# configure terminal
Switch(config)#router ipv6 rip
Switch(config-router)# aggregate-address 2001:db8::/32
```

**相关命令**：无

### 7.2.15 `route map(RIPng)`

**功能**：使用此命令设置接口收到和发送RIPng 路由的路由策略，使用该命令的no 形式关闭配
  置的路由策略。

**语法**：

```
route-map NAME ( in | out ) IFNAME
no route-map name ( in | out ) IFNAME
```

| 参数 | 说明 |
| --- | --- |
| NAME | route map 名字不超过20 字符的字符串 |
| in | 收到报文 |
| out | 发送报文 |
| IFNAME | 指定接口名字支持物理端口，聚合端口， 环回端口，VLAN 端口和隧道端口 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子在接口eth-0-1 设置收到报文后的路由策略:
Switch# configure terminal
Switch(config)# router ipv6 rip
Switch(config-router)# route-map routemap10 in eth-0-1
```

**相关命令**：无

### 7.2.16 `maximum-prefix(RIPng)`

**功能**：使用此命令限制RIPng 域能存储的最大路由条数，使用命令的no 形式恢复默认设置。

**语法**：

```
maximum-prefix NUMBER-VALUE ( PERCENTAGE-VALUE | )
no maximum-prefix
```

| 参数 | 说明 |
| --- | --- |
| NUMBER-VALUE | RIPng 域能存储的最大路由条数 1-65535 |
| PERCENTAGE-VALUE | 设置告警百分比的值，默认值75%。 1-100 |

**命令模式**：路由模式

**默认配置**：默认RIPng 域能存储的最大路由条数，这个和芯片profile 有关，默认告警百分比是 75%。

**使用说明**：

无

**示例**：

```
下面例子设置了RIPng 最大条数700，告警百分比为70%:
Switch# configure terminal
Switch(config)# router ipv6 rip
Switch(config-router)# maximum-prefix 700 70
```

**相关命令**：无

### 7.2.17 `show ipv6 rip database`

**功能**：使用此命令显示RIPng 域的信息。

**语法**：

```
show ipv6 rip database
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示了RIPng 域的信息:
Switch# show ipv6 rip database
Codes: R - RIP, Rc - RIP connected, Rs - RIP static, Ra - RIP aggregated,
       Rcx - RIP connect suppressed, Rsx - RIP static suppressed,
       K - Kernel, C - Connected, S - Static, O - OSPF, I - IS-IS, B - BGP
   Network                     Next Hop                  If     Met Tag  Time
Rc 2001:db8:0:6::/64           ::                        eth-0-9   0   0
Rc 2001:db8:0:49::/64          ::                        eth-0-48   0   0
```

**相关命令**：show ipv6 rip interface

### 7.2.18 `show ipv6 rip interface`

**功能**：使用此命令显示已经使能RIPng 的接口的信息。

**语法**：

```
show ipv6 rip interface ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名字支持物理端口，聚合端口， 环回端口，VLAN 端口和隧道端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示了已经使能RIPng 的接口的信息:
Switch# show ipv6 rip interface eth-0-9
eth-0-9 is up, line protocol is up
  Routing Protocol: RIPng
    Passive interface: Disabled
    Split horizon: Enabled with Poisoned Reversed
    IPv6 interface address:
      2001:db8:0:6::2/64
      fe80::b4df:82ff:fe70:ec00/10
```

**相关命令**：show ipv6 rip database

### 7.2.19 `show ipv6 rip database database-summary`

**功能**：使用此命令显示RIPng 域的概要信息。

**语法**：

```
show ipv6 rip database database-summary
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示了RIPng 域的概要信息:
Switch# show ipv6 rip database database-summary
Type                  Count
RIPng connected       2
Total                 2
```

**相关命令**：show ipv6 rip database

### 7.2.20 `show ipv6 protocol rip`

**功能**：使用此命令显示RIPng 协议的信息。

**语法**：

```
show ipv6 protocol rip
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示了RIPng 协议的信息:
Switch# show ipv6 protocol rip
Routing Protocol is "ripng"
  Sending updates every 30 seconds with +/-50%, next due in 2949331570 seconds
  Timeout after 180 seconds, garbage collect after 120 seconds
  Outgoing update filter list for all interface is not set
  Incoming update filter list for all interface is not set
  Default redistribute metric is 0
  Redistributing:
  Interface
    eth-0-9
    eth-0-48
  Routing for Networks:
  Number of routes (including connected): 2
  Distance: (default is 120)
```

**相关命令**：无

### 7.2.21 `debug ipv6 rip`

**功能**：使用此命令打开RIPng debug 调试功能，主要包括events 和packet 选项，使用命令的
  no 形式关闭debug 功能。

**语法**：

```
debug ipv6 rip ( all | events | packet | )
no debug ripv6 ( all | events | packet | )
no debug all ipv6 ( rip | )
```

| 参数 | 说明 |
| --- | --- |
| all | 打开RIP 的所有调试开关 |
| events | 打开RIP 的事件调试开关 |
| packet | RIP 报文调试开关，包括 recv，send 以及detail |
| recv | 接收报文的调试开关 |
| send | 发送报文的调试开关 |
| detail | 接收或发送报文的详细信息调试开关 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子打开了RIPng 报文的调试开关:
Switch# debug ipv6 rip packet
```

**相关命令**：show debugging rip

### 7.2.22 `show debugging ipv6 rip`

**功能**：使用此命令显示RIPng 调试开关的状态信息。

**语法**：

```
show debugging ipv6 rip
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示了RIPng 调试开关的状态信息:
Switch# show debugging ipv6 rip
RIPng debugging status:
  RIPng event debugging is on
```

**相关命令**：debug ipv6 rip

### 7.2.23 `show resource ipv6 rip`

**功能**：使用此命令显示RIPng 路由存储资源的使用情况。

**语法**：

```
show resource ipv6 rip
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子显示了RIPng 路由存储资源的使用情况:
Switch# show resource ipv6 rip
RIPng
Resource                         Used          Capability
=============================================================
Routes                           2              728
```

**相关命令**：show ipv6 rip database

### 7.2.24 `clear ipv6 rip route`

**功能**：使用此命令清除掉RIPng 域中的路由。

**语法**：

```
clear ipv6 rip route ( IPV6_PREFIX | connected | static | ospfv3 | bgp | all )
```

| 参数 | 说明 |
| --- | --- |
| IPV6_PREFIX | 清除指定地址的路由 X:X::X:X/M 格式的IPv6 地址和掩码长度 |
| connected | 清除再发布直连路由 |
| static | 清除再发布静态路由 |
| ospfv3 | 清除再发布ospf 路由 |
| bgp | 清除再发布bgp 路由 |
| all | 清除所有路由 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子清除了RIPng 域中所有路由:
Switch# clear ipv6 rip route all
```

**相关命令**：无、7.3 IPv6 单播配置命令


## 7.3 IPv6 单播配置命令

### 7.3.1 `ipv6 enable`

**功能**：使用该命令使能IPv6。
  使用该命令的no 格式去使能IPv6。

**语法**：

```
ipv6 enable
no ipv6 enable
```

**命令模式**：全局配置模式

**默认配置**：IPv6 默认不使能。

**使用说明**：

使用该命令全局使能IPv6 功能。
  当IPv6 不使能时候，IPv6 报文被当做普通二层报文处理。

**示例**：

```
以下例子使能了IPv6 功能:
Switch# configure terminal
Switch(config)# ipv6 enable
```

**相关命令**：无

### 7.3.2 `max-static-v6routes`

**功能**：使用该命令配置系统允许的最大IPv6 静态路由数。
  使用该命令的no 格式恢复默认值。

**语法**：

```
max-static-v6routes COUNT
no max-static-v6routes
```

| 参数 | 说明 |
| --- | --- |
| COUNT | 最大静态IPv6 路由数 1-65535 |

**命令模式**：全局配置模式

**默认配置**：根据不同的TCAM profile，默认值可能有所不同。

**使用说明**：

可配最大值受限于当前的TCAM profile。
  也受限于当前已经存在的静态路由条目数。

**示例**：

```
以下例子将最大静态路由条目数限制为10 条:
Switch# configure terminal
Switch(config)# max-static-v6routes 10
```

**相关命令**：show ipv6 route

### 7.3.3 `ipv6 route`

**功能**：使用该命令配置静态IPv6 路由。
  使用该命令的no 格式删除静态路由。

**语法**：

```
ipv6 route vrf NAME DEST_PREFIX ( GLOBAL_PREFIX | LINK_LOCAL IFNAME | IFNULL )
( ADMIN_DISTANCE | )
ipv6 route DEST_PREFIX ( GLOBAL_PREFIX | LINK_LOCAL IFNAME | IFTUNNEL | IFNULL )
( ADMIN_DISTANCE | )
no ipv6 route vrf NAME DEST_PREFIX ( GLOBAL_PREFIX | LINK_LOCAL ( IFNAME | ) |
IFNULL | )
no ipv6 route DEST_PREFIX ( GLOBAL_PREFIX | LINK_LOCAL ( IFNAME | ) | IFTUNNEL |
IFNULL | )
ipv6 route ( vrf NAME | ) DEST_PREFIX ( GLOBAL_PREFIX | IFNULL ) ( ADMIN_DISTANCE
| ) ( track NUMBER | )
no ipv6 route ( vrf NAME | ) DEST_PREFIX ( GLOBAL_PREFIX | IFNULL | ) ( track | )
( no | ) ipv6 route ( vrf NAME | ) DEST_PREFIX REMOTE-VTEP
```

| 参数 | 说明 |
| --- | --- |
| vrf NAME | VRF 实例名不超过31 个字符的字符串 |
| DEST_PREFIX | 目的地址前缀。格式为 |
| X:X::X:X/M | X:X::X:X/M 格式的IPv6 地址和掩码长度 |
| GLOBAL_PREFIX | 下一跳全球单播IPv6 地址。格式为X:X::X:X X:X::X:X 格式的IPv6 地址 |
| LINK_LOCAL | 下一跳link local IPv6 地址 (FE80::/10)。 X:X::X:X 格式的IPv6 地址 |
| IFNAME | IPv6 路由出接口名字支持物理端口，聚合端口， VLAN 端口和隧道端口 |
| IFTUNNEL | IPv6 路由出口的隧道接口名字 tunnel <0-1023> |
| IFNULL | IPv6 黑洞路由出口名字 |
| null 0 |  |
| ADMIN_DISTANCE | (可选项)管理距离。默认值 1。 1-255 |
| track NUMBER | 指定track ID 1-500 |
| REMOTE-VTEP | overlay 隧道类型的下一跳 remote-vtep 的index |

**命令模式**：全局配置模式

**默认配置**：默认情况下，系统没有任何IPv6 静态路由。

**使用说明**：

无

**示例**：

```
以下例子配置了一些静态路由:
Switch# configure terminal
Switch(config)# ipv6 route 3001::1/64 fe80::1234 eth-0-2
Switch(config)# ipv6 route vrf a 3002::1/64 3001::1
```

**相关命令**：show ipv6 route

### 7.3.4 `ipv6 address`

**功能**：使用该命令配置接口上的ipv6 地址。
  使用该命令的no 格式删除ipv6 地址。

**语法**：

```
ipv6 address GOLBAL_FREFIX ( eui-64 | )

no ipv6 address GOLBAL_FREFIX ( eui-64 | )
ipv6 address LINK-LOCAL link-local
no ipv6 address LINK-LOCAL link-local
ipv6 address auto link-local
no ipv6 address auto link-local
no ipv6 address
```

| 参数 | 说明 |
| --- | --- |
| GOLBAL_FREFIX | 全球单播地址。格式为 |
| X:X::X:X/M format | X:X::X:X/M 格式的IPv6 地址和掩码长度 |
| LINK-LOCAL | 链路本地地址。格式为 |
| X:X::X:X | X:X::X:X 格式的IPv6 地址 |

**命令模式**：端口配置模式

**默认配置**：默认情况，接口未配IPv6 地址。

**使用说明**：

使用该命令配置接口上的IPv6 地址，使用该命令的no 格式移除IPv6 地址。IPv6 地址
  配置和IPv4 地址相互不影响。
  每个接口最多可配1 个链路本地地址，8 个全球单播地址。
  当接口上没有任何IPv6 地址的时候，使用auto 关键字可自动生成链路本地地址。使用
  该命令的no 格式、配合auto 关键字，可删除自动生成的链路本地地址，前提是接口
  上已经没有任何全球单播地址了。
  可以在配置的时候指定一个全球单播地址使用eui-64 方式生成接口ID。
  如果配置全球单播地址的时候接口没有任何链路本地地址，那么会自动生成一个。如
  果之后用户又手动指定链路本地地址，那么用户指定的优先级高于自动生成的，将会
  发生覆盖。
  如果不带任何参数的使用该命令的no 格式，接口上所有的IPv6 地址都会被删除。

**示例**：

```
以下例子在接口上配置了链路本地地址和全局单播地址:
Switch# configure terminal
Switch(config)# interface eth-0-1

Switch(config-if)# ipv6 address fe80::1233 link-local
Switch(config-if)# ipv6 address 3001:1::1234/64
```

**相关命令**：show ipv6 interface

### 7.3.5 `show ipv6 route`

**功能**：使用该命令显示IPv6 路由

**语法**：

```
show ipv6 route ( vrf NAME | ) ( database | )
show ipv6 route ( vrf NAME | ) ( database | ) ( bgp | connected | ospf | rip | static )
show ipv6 route ( vrf NAME | ) IPV6_ADDRESS
show ipv6 route ( vrf NAME | ) IPV6_PREFIX
show ipv6 route ( vrf NAME | )
show ipv6 route ( vrf NAME | ) summary
```

| 参数 | 说明 |
| --- | --- |
| IPV6_PREFIX | IPv6 前缀。格式为 |
| X:X::X:X/M | X:X::X:X/M 格式的IPv6 地址和掩码长度 |
| IPV6_ADDRESS | IPv6 地址。格式为 |
| X:X::X:X | X:X::X:X 格式的IPv6 地址 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下为显示结果:

Switch# show ipv6 route
IPv6 Routing Table
Codes: C - connected, S - static, R - RIP, O - OSPF, I - IS-IS, B - BGP
       [*] - [AD/Metric]
Timers: Uptime
S       3001::/64 [1/0]
       via fe80::1234, eth-0-2, 04:09:56
C       3001:1::/64
       via ::, eth-0-1, 01:39:07
C       3001:1::1234/128
       via ::1, eth-0-1, 01:39:07
S       3002::/64 [1/0]
       via 3001::1 (recursive via fe80::1234), eth-0-2, 04:09:19
C       3ffe:2::/64
       via ::, eth-0-2, 1d19h37m
C       3ffe:2::10/128
       via ::1, eth-0-2, 1d19h37m
C       fe80::/10
       via ::, Null0, 1d19h53m

Switch# show ipv6 route database
IPv6 Routing Table
Codes: C - connected, S - static, R - RIP, O - OSPF, I - IS-IS, B - BGP
       [*] - [AD/Metric]
       > - selected route, * - FIB route, p - stale info
Timers: Uptime
S    >  3001::/64 [1/0]
     * via fe80::1234, eth-0-2, 04:10:45
C    >  3001:1::/64
     * via ::, eth-0-1, 01:39:56
C     >  3001:1::1234/128
      * via ::1, eth-0-1, 01:39:56
S    >  3002::/64 [1/0]
     * via 3001::1 (recursive via fe80::1234), eth-0-2, 04:10:08
C    >  3ffe:2::/64
     * via ::, eth-0-2, 1d19h37m
C     >  3ffe:2::10/128
      * via ::1, eth-0-2, 1d19h37m
C    >  fe80::/10
     * via ::, Null0, 1d19h54m

Switch# show ipv6 route static
IPv6 Routing Table
Codes: C - connected, S - static, R - RIP, O - OSPF, I - IS-IS, B - BGP
       [*] - [AD/Metric]
Timers: Uptime
S       3001::/64 [1/0]
       via fe80::1234, eth-0-2, 04:11:42
S       3002::/64 [1/0]
       via 3001::1 (recursive via fe80::1234), eth-0-2, 04:11:05

Switch# show ipv6 route 3001::64
Routing entry for 3001::/64
  Known via "static", distance 1, metric 0, best
  Last update 04:12:32 ago

  * via fe80::1234, eth-0-2

Switch# show ipv6 route 3001::64/64
Routing entry for 3001::/64
  Known via "static", distance 1, metric 0, best
  Last update 04:13:03 ago
  * via fe80::1234, eth-0-2

Switch# show ipv6 route summary
IPv6 routing table name is Default-IPv6-Routing-Table(0)
IPv6 routing table maximum-paths is 8
Route source networks
connected       5
static          2
Total           7
```

**相关命令**：ipv6 route

### 7.3.6 `show ipv6 interface`

**功能**：使用该命令显示接口上的IPv6 状态

**语法**：

```
show ipv6 interface ( IFNAME | ) ( brief | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 指定接口的IPv6 状态与配置支持物理端口，聚合端口， 环回端口，VLAN 端口和隧道端口 |
| brief | 显示摘要信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下为显示结果:
Switch# show ipv6 interface eth-0-1
Interface eth-0-1
  Interface current state: UP
  The maximum transmit unit is 1500 bytes
  IPv6 is enabled, link-local address is fe80::1233
  Global unicast address(es):
    3001:1::1234, subnet is 3001:1::/64
  Joined group address(es):
    ff02::1:ff00:1234
    ff02::1:ff00:0
    ff02::1:ff00:1233
    ff02::2
    ff02::1
  ICMP error messages limited to one every 2000 milliseconds
  ICMP redirects are always sent
  ND DAD is enabled, number of DAD attempts: 1
  ND router advertisement is disabled
  ND reachable time is 30000 milliseconds
  ND advertised reachable time is 0 milliseconds
  ND retransmit interval is 1000 milliseconds
  ND advertised retransmit interval is 0 milliseconds
  ND router advertisements max interval: 600 secs
  ND router advertisements min interval: 198 secs
  ND router advertisements live for 1800 seconds
  ND router advertisements hop-limit is 0
  Hosts use stateless autoconfig for addresses.
Switch # show ipv6 interface eth-0-1 brief
*down: administratively down
Interface           Status  Protocol  IPv6 address
eth-0-1             up       up         3001:1::1234
                                           fe80::1233

Switch# show ipv6 interface eth-0-1 brief
*down: administratively down
Interface           Status  Protocol  IPv6 address
eth-0-1             up       up         3001:1::1234
                                           fe80::1233
```

**相关命令**：ipv6 enable、ipv6 address

### 7.3.7 `ipv6 verify unicast reverse-path`

**功能**：使用该命令在接口上使能IPv6 URPF(反向路径检查)
  
  使用该命令的no 格式去使能URPF。

**语法**：

```
ipv6 verify unicast reverse-path
no ipv6 verify unicast reverse-path
```

**命令模式**：端口配置模式

**默认配置**：URPF 默认不使能。

**使用说明**：

无

**示例**：

```
以下例子使能了URPF:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 verify unicast reverse-path
```

**相关命令**：show ipv6 interface

### 7.3.8 `ipv6 icmp error-interval`

**功能**：使用该命令配置ICMP 报文间隔。
  使用该命令的no 格式恢复默认值。

**语法**：

```
no ipv6 icmp error-interval ERROR_INTERVAL
no ipv6 icmp error-interval
```

| 参数 | 说明 |
| --- | --- |
| error-interval | ICMP 报文间隔。 0–2147483647 毫秒 |

**命令模式**：全局配置模式

**默认配置**：1000 毫秒

**使用说明**：

无

**示例**：

```
以下例子配置了ICMP 报文间隔:
Switch# configure terminal
Switch(config)# ipv6 icmp error-interval 2000
```

**相关命令**：无

### 7.3.9 `clear ipv6 route static`

**功能**：使用该命令清除ipv6 静态路由

**语法**：

```
clear ipv6 route static
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
以下例子展示了如何清除ipv6 静态路由:

Switch# clear ipv6 route static
```

**相关命令**：无、7.4 Ipv6 Prefix-list 命令


## 7.4 Ipv6 Prefix-list 命令

### 7.4.1 `ipv6 prefix-list`

**功能**：在全局配置模式下，使用命令ipv6 prefix-list 创建地址前缀列表或添加表项。
  使用该命令的no 形式删除配置。

**语法**：

```
ipv6 prefix-list WORD [ seq SEQUENCE-NUMBER ] ( deny | permit ) ( any | IPv6-
ADDRESS/M [ ge GE-LENGTH ] [ le LE-LENGTH ] )
no ipv6 prefix-list WORD [ seq SEQUENCE-NUMBER ] ( deny | permit ) ( any | IPv6-
ADDRESS/M [ ge GE-LENGTH ] [ le LE-LENGTH ] )
no ipv6 prefix-list WORD [ seq SEQUENCE-NUMBER ]
```

| 参数 | 说明 |
| --- | --- |
| WORD | 地址前缀列表表名不超过40 个字符 |
| seq SEQUENCE- |  |
| NUMBER | 地址前缀列表表项序号，范围1~65535。如果输入命令的时候没有指定序号，将添加默认序号。默认序号为 5 的倍数，并且是剩下序号中大于当前已分配序号的最小的数 1-65535 |
| deny | 指定地址前缀列表的匹配模式为拒绝。在该模式下，如果过滤的IPv6 地址在定义的范围内，该IPv6 地址不能通过过滤从而不能进入下一表项的测试；否则，将进行下一表项的测试 |
| permit | 指定地址前缀列表的匹配模式为允许。在该模式下，如果过滤的IPv6 地址在定义的范围内，则通过过滤，进行相应的设置；否则，必须进行下一表项的测试 |
| IPv6-ADDRESS /M | 网络地址和掩码位数。掩码位数范围0~128 IPv6 地址和1-128 之间的掩码长度 |
| ge GE-LENGTH | 指定地址匹配的最小前缀长度 1-128 |
| le LE-LENGTH | 指定地址匹配的最大前缀长度 1-128 |

**命令模式**：全局配置模式

**默认配置**：没有地址前缀列表被创建。

**使用说明**：

地址前缀列表用于IPv6 地址过滤。同一个地址前缀列表可包含多个表项，一个表项包
  括地址和掩码位数。命令中的deny 和permit 关键字指定该匹配结果是拒绝或者允许。
  此时，多个表项之间是“或”的关系，即通过一个表项就可通过该地址前缀列表的过滤。
  没有通过任何一个表项的过滤就意味着没有通过该地址前缀列表的过滤。
  地址前缀范围包括两个部分，分别由mask-length 和[greater-equal-value，less-
  equal-value]决定。如果指定了这两部分，要被过滤的IPv6 地址必须匹配这两部分规定
  的前缀范围。具体的匹配公式如下：
  network/length < ge ge-length < le le-length <= 128
  例如，只指定ge-length，则匹配范围为[ge-length,128]；只指定le-length，则匹配范
  围为[network/length，le-length]；如果两者都指定，则匹配范围为[ge-length, le-
  length]。
  如果在输入命令中没有指定序号，则交换机会自动为表项添加默认序号。默认序号从5
  开始，并且每次递增5，例如，5、10、15。默认序号将从当前大于已分配的序号中选
  择，并且是其中的最小值。

**示例**：

```
配置匹配默认路由的拒绝表项:
Switch# configure terminal
Switch(config)# ipv6 prefix-list abc deny ::/0
配置匹配2001:db8::/64 的允许表项:

Switch# configure terminal
Switch(config)# ipv6 prefix-list abc permit 2001:db8::/64
配置匹配长度为[32,64],地址为2001:db8::/32 的允许表项:
Switch# configure terminal
Switch(config)# ipv6 prefix-list abc permit 2001:db8::/32 le 64
配置匹配长度为[64,128],地址为2001:db8::/32 的拒绝表项:
Switch# configure terminal
Switch(config)# ipv6 prefix-list abc deny 2001:db8::/32 ge 64
```

**相关命令**：ipv6 prefix-list description、ipv6 prefix-list sequence、show ipv6 prefix-list、clear ipv6 prefix-list

### 7.4.2 `ipv6 prefix-list description`

**功能**：在全局配置模式下，使用命令ipv6 prefix-list description 添加地址前缀列表描述。使用
  命令相关的no 形式删除该配置。

**语法**：

```
ipv6 prefix-list WORD description LINE
no ipv6 prefix-list WORD description [ LINE ]
```

| 参数 | 说明 |
| --- | --- |
| WORD | 地址前缀列表表名不超过40 个字符 |
| LINE | 地址前缀列表描述不超过80 个字符 |

**命令模式**：全局配置模式

**默认配置**：地址前缀列表默认没有描述。

**使用说明**：

如果该地址前缀列表不存在，交换机将会自动创建。

**示例**：

```
配置地址前缀列表描述为Deny routes from router A:
Switch# configure terminal
Switch(config)# ipv6 prefix-list abc description Permit routes from customer A
```

**相关命令**：ipv6 prefix-list、ipv6 prefix-list sequence、show ipv6 prefix-list、clear ipv6 prefix-list

### 7.4.3 `ipv6 prefix-list sequence-number`

**功能**：在全局配置模式下，使用命令ipv6 prefix-list sequence-number 启用地址前缀列表序
  号。使用命令相关的no 形式关闭序号。

**语法**：

```
ipv6 prefix-list sequence-number
no ipv6 prefix-list sequence-number
```

**命令模式**：全局配置模式

**默认配置**：地址前缀列表默认使用序号。

**使用说明**：

该命令会使显示地址前缀列表配置的时候显示序号。

**示例**：

```
配置启用地址前缀列表序号:

Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ipv6 prefix-list sequence-number
```

**相关命令**：ipv6 prefix-list、show ipv6 prefix-list、clear ipv6 prefix-list

### 7.4.4 `show ipv6 prefix-list`

**功能**：使用命令show ipv6 prefix-list 显示当前地址前缀列表配置。

**语法**：

```
show ipv6 prefix-list ( summary | detail | ) ( WORD | )
show ipv6 prefix-list WORD ( seq SEQUENCE-NUMBER | IPv6-ADDRESS /M ( longer |
first-match | ) | )
```

| 参数 | 说明 |
| --- | --- |
| summary | 地址前缀列表统计摘要 |
| detail | 地址前缀列表详细统计 |
| WORD | 地址前缀列表表名不超过40 个字符 |
| seq SEQUENCE- |  |
| NUMBER | 表项序号 1-65535 |
| IPv6-ADDRESS /M | 网络地址/掩码位数 e.g., |
| 2001:db8::/32 | IPv6 地址和1-128 之间的掩码长度 |
| longer | 只显示掩码位数大于M 的表项 |
| first-match | 只显示第一个匹配的表项 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
显示地址前缀列表信息:
Switch# show ipv6 prefix-list
ipv6 prefix-list ripng_pre: 5 entries
     seq 1 deny 2001:db8:9::/64
     seq 2 deny 2001:db8:10::/64
     seq 3 deny 2001:db8:11::/64
     seq 4 deny 2001:db8:12::/64
     seq 5 permit any
```

**相关命令**：ipv6 prefix-list、clear ipv6 prefix-list

### 7.4.5 `clear ipv6 prefix-list`

**功能**：使用clear ipv6 prefix-list 清除地址前缀列表计数器的统计信息。

**语法**：

```
clear ipv6 prefix-list ( WORD ( IPv6-ADDRESS /M | ) | )
```

| 参数 | 说明 |
| --- | --- |
| WORD | 地址前缀列表表名不超过40 个字符 |
| IPv6-ADDRESS /M | 网络地址/掩码位数 e.g., |
| 2001:db8::/32 | IPv6 地址和1-128 之间的掩码长度 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
重置地址前缀列表计数器:
Switch(config)# clear ipv6 prefix-list test
```

**相关命令**：ipv6 prefix-list、7.5 Route-map 命令


## 7.5 Route-map 命令

### 7.5.1 `route-map`

**功能**：在全局配置模式下，使用route-map 的match 和set 命令，来定义各个路由协议间进
  行重分布的条件，或者启用BGP 协议的条件路由功能。
  使用此命令的no 格式删除route-map 的条目。

**语法**：

```
route-map MAP-TAG [ permit | deny ] [ SEQUENCE_NUMBER ]
no route-map MAP-TAG [ permit | deny ] [ SEQUENCE_NUMBER ]
```

| 参数 | 说明 |
| --- | --- |
| MAP-TAG | Route-map 的一个有意义的名字。路由重分布命令使用这个名字来引用这个 route-map。多个route- map 的序列可以共享同一个route-map 名。 Route-map 的名字长度不得超过20，并且它的首字母必须是’a’-‘z’, ‘A’-‘Z’或者’0’-‘9’ |
| permit | (可选) 如果route-map 的 match 规则被匹配到了，并且指定了permit 关键字， 这个路由将会像set 动作所指定的规则那样进行重分布 |
| deny | (可选) 如果route-map 的 match 规则被匹配到了，这个路由将不会被重分布 |
| SEQUENCE_NUMBER | (可选) route-map 的序列号，表示这个route-map 在 1-65535 同一个route-map 名中所处的位置。如果使用了相应的 no 命令，这个序列将会被删除 |

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

**相关命令**：match as-path、match community、match interface、match ip address、match local-preference、match metric、match origin、match route-type、match tag、set aggregator、set as-path、set atomic-aggregate、set comm-list、、set community、set dampening、set extcommunity、set ip address、set local-preference、set metric、set metric-type、set origin、set originator-id、set tag、set vpnv4、set weight

### 7.5.2 `match as-path`

**功能**：使用这个命令来匹配一个自治系统路径的ACL。
  使用此命令的no 格式来删除这个条目。
  match as-path 命令制定了自治系统匹配的路径。如果设置了这条命令的permit 规则，
  路由将会被set 规则所重分布或者被控制。反之如果match 规则被匹配到，但是配置
  的是deny 规则的话，路由将不会被重分布或者控制。如果没有任何match 规则被匹配
  的话，这个路由将不会被重分布。
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
| LISTNAME | 指定自治系统路径的ACL 名不超过20 个字符 |

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

### 7.5.3 `match community`

**功能**：使用这个命令来指定匹配的团体属性(community)号。
  使用相应的no 命令来删除这个条目。
  Community 是用来过滤路由和建立路由组用的。他们用来在大规模的路由上使用
  match 或者set 命令来启用策略。Community 表使用一组路由的共通属性来识别和过
  滤这组路由。
  match community 命令设置的match 值会覆盖全局值，如果有路由没有满足任何一个
  match 规则的话，这个路由将会被忽略。

**语法**：

```
match community WORD
no match community
```

| 参数 | 说明 |
| --- | --- |
| WORD | Community 表的名字不超过40 个字符 |

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

### 7.5.4 `match interface`

**功能**：使用这个命令来定义一个针对接口的match 规则。
  使用相应的no 命令来删除这个规则。

**语法**：

```
match interface IFNAME
no match interface
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 待匹配的接口名支持物理端口，聚合端口， 环回端口，VLAN 端口和隧道端口 |

**命令模式**：Route-map 模式

**默认配置**：无

**使用说明**：

这个命令只在BGP 协议中起作用。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map mymap1 permit 10
Switch(config-route-map)# match interface eth-0-1
```

**相关命令**：match tag、match route-type external

### 7.5.5 `match ipv6 address`

**功能**：使用这个命令来指定match 一个ipv6 ACL 的规则。
  使用相应的no 命令来删除这个规则。
  match ipv6 address 命令指定匹配了一个ACL， 如果指定了一个permit 的match 规则
  的话，路由将会被像set 规则指定的那样进行重发布或者进行控制。反之如果制定了相
  应的deny 规则的话，满足条件的路由将不会被重发布或者控制。如果没有匹配到任何
  规则的话，路由将不会被接受或者转发。被策略指定的路由最好不要跟路由协议指定
  的路由一样。指定策略会导致报文根据他们的长度或者内容经过不同的路由转发。报
  文转发规则的优先级是策略转发大于普通的路由转发。

**语法**：

```
match ipv6 address ACCESSSLISTID
no match ipv6 address
```

| 参数 | 说明 |
| --- | --- |
| ACCESSSLISTID | 指定IPV6 ACL 名不超过20 个字符 |

**命令模式**：Route-map 模式

**默认配置**：默认match ipv6 address 不设置。

**使用说明**：

这个命令对BGP，OSPFv3，RIPng 和策略路由(PBR)有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map myroute permit 3
Switch(config-route-map)# match ipv6 address List1
```

**相关命令**：match community、match as-path、set as-path、set community、match metric

### 7.5.6 `match ipv6 address prefix-list`

**功能**：用这个命令来匹配ipv6 前缀列表条目；使用相应的no 命令来删除这个规则。
  如果匹配了前缀并且指定是permit 的语法的话，路由将会被重发布或者被set 语法所
  受控。如果满足了match 条件但是制定了deny 语法的话，路由将不会被重发布或者被
  set 语法受控。如果没有满足match 条件，无论指定了permit 还是deny 语法，路由都
  不会被接收或者转发。
  被指定的路由不能跟路由协议相同，指定的策略让报文能够按照他们的长度及内容通
  过不同的路由进行转发。相对于路由表指定的路径来说，报文将会优先以配置的策略
  来进行转发。

**语法**：

```
match ipv6 address prefix-list LISTNAME
no match ipv6 address prefix-list ( LISTNAME | )
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | IPv6 前缀列表名不超过40 个字符 |

**命令模式**：Route-map 模式

**默认配置**：默认match ipv6 addressprefix-list 不设置。

**使用说明**：

这个命令对BGP，OSPFv3，RIPng 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)#match ipv6 address prefix-list mylist
```

**相关命令**：match community、match as-path、set as-path、set community、match metric

### 7.5.7 `match ipv6 next-hop`

**功能**：使用这个命令来指定match 一个下一跳的IPv6 地址。
  使用此命令的no 格式来删除这个规则。
  如果匹配了nexthop 地址并且指定是permit 的语法的话，路由将会被重发布或者被
  set 语法所受控。如果满足了match 条件但是制定了deny 语法的话，路由将不会被重
  
  发布或者被set 语法受控。如果没有满足match 条件，无论指定了permit 还是deny
  语法，路由都不会被接收或者转发。

**语法**：

```
match ipv6 next-hop ( IPV6_ADDR | ACCESSSLISTID )
no match ipv6 next-hop [ IPv6-ADDRESS | ACCESSSLISTID ]
```

| 参数 | 说明 |
| --- | --- |
| IPV6_ADDR | 指定IPv6 prefix, 例如 |
| 2001:db8::1 | IPv6 地址 |
| ACCESSSLISTID | 指定IPV6 ACL 名不超过20 个字符 |

**命令模式**：Route-map 模式

**默认配置**：默认match ip next-hop 不设置。

**使用说明**：

这个命令对BGP，OSPFv3，RIPng 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# match ipv6 next-hop mylist
```

**相关命令**：match community、match as-path、set as-path、set community、match metric

### 7.5.8 `match ipv6 next-hop prefix-list`

**功能**：用这个命令来匹配下一跳的前缀列表条目。
  
  使用此命令的no 格式来删除这个规则。

**语法**：

```
match ipv6 next-hop prefix-list LISTNAME
no match ipv6 next-hop prefix-list [ LISTNAME ]
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | IPv6 前缀列表名 |

**命令模式**：Route-map 模式

**默认配置**：默认match ipv6 next-hop prefix-list 不设置。

**使用说明**：

这个命令对RIPng 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map mymap permit 3
Switch(config-route-map)# match ipv6 next-hop prefix-list list1
```

**相关命令**：match metric、match interface、match ip next-hop

### 7.5.9 `match local-preference`

**功能**：使用这个命令来指定匹配本地优先级。使用此命令的no 格式来删除这个规则。

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

### 7.5.10 `match metric`

**功能**：使用这个命令来match metric 值。
  使用此命令的no 格式来删除这个规则。
  如果指定匹配了metric 值并且指定是permit 的语法的话，路由将会被重发布或者被
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
Switch(config-route-map)# no match metric
```

**相关命令**：match community、match as-path、set as-path、set community、match ip next-hop

### 7.5.11 `match origin`

**功能**：使用这个命令来匹配BGP 中的起始(origin)属性。
  使用此命令的no 格式来删除这个规则。
  Origin 属性定义了路径的起始信息。EGP 参数用路由表中的e 来表示，这表明这一条
  路由的起始信息是从外部网关协议(EGP)中学习到的。同样的，IGP 参数用路由表中的i
  来表示，它表示起始路径信息是通过内部网关协议(IGP)学习到的。
  在路由表中，不完整的(incomplete)会用?来表示，这就是说，这个路由的原始路径是
  通过不清楚或者其他别的方式来学习到的。比如，一个静态路由被重发布到BGP 的话，
  那它的原始路由就是不完整的。
  
  这个命令只对BGP 有效。

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

无

**示例**：

```
Switch# configure terminal
Switch(config)# route-map myroute deny 34
Switch(config-route-map)# match origin egp
```

**相关命令**：无

### 7.5.12 `match route-type`

**功能**：使用这个命令来匹配指定的外部路由类型。
  使用相应的no 命令来删除这个规则。
  使用match route-type external 命令来匹配指定的外部路由类型。自治系统外部LSA
  即是类型1 或者是类型2。外部类型1 值匹配类型1 的外部路由，外部类型2 只匹配
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

### 7.5.13 `match tag`

**功能**：使用这个命令来匹配指定的tag。
  使用此命令的no 格式来删除这个规则。

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

### 7.5.14 `set ipv6 aggregator`

**功能**：使用这个命令来设置route-map 和router ID 的AS 号。
  使用此命令的no 格式来删除这个规则。
  自治系统(AS)是一个网络管理机构控制下的路由器和网络群组。他们被不同的区域所分
  离，被指派了一个独特的16 位的号码。使用set aggregator as 命令来指定这个AS 号
  码。
  为了使用set aggregator 命令，你必须首先要有一个match 规则。Match 和set 命令设
  置了路由协议间重发布路由的规则。Match 命令制定了在满足什么样的条件下才能进
  行重发布，而Set 命令则指定了满足条件后所执行的动作。
  如果报文没有满足任何定义的条件，他们将会被正常的路由所转发。

**语法**：

```
set ipv6 aggregator as ASNUM IPV6_ADDR

no set ipv6 aggregator
```

| 参数 | 说明 |
| --- | --- |
| ASNUM | 指定集合的AS 号 1-65535 |
| IPV6_ADDR | 指定集合的IPv6 地址 IPv6 地址 |

**命令模式**：Route-map 模式

**默认配置**：默认set aggregator 不设置。

**使用说明**：

这个命令仅对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map myroute permit 3
Switch(config-route-map)# set aggregator as 43 2001:db8::1
```

**相关命令**：无

### 7.5.15 `set as-path`

**功能**：使用这个命令来修改自治系统(AS)的路径。
  使用此命令的no 格式来删除这个规则。
  使用set as-path 命令来指定一个AS 的路径。通过指定AS-Path 的长度，路由器可以
  影响路径的最佳路径选择。在这个命令中使用prepend 参数，来在已有的AS-Path 中，
  再追加一个指定的AS-path。

**语法**：

```
set as-path prepend ASN [ …ASN ]
no set as-path
```

| 参数 | 说明 |
| --- | --- |
| ASN | 追加自治系统的AS-path 1-4294967295 |
| prepend | 系统会将这个号码加到现有的AS-path 中去 |

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

### 7.5.16 `set atomic-aggregate`

**功能**：使用这个命令来设置atomic aggregate 属性。
  使用此命令的no 格式来删除这个规则。
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

### 7.5.17 `set comm-list delete`

**功能**：使用这个命令来删除从进入或者外发更新时，满足条件的community。
  使用此命令的no 格式来删除这个规则。

**语法**：

```
set comm-list { STANDARD | EXPANDED | WORD } delete
no set comm-list
```

| 参数 | 说明 |
| --- | --- |
| STANDARD | 标准comminty 列表号 1-99 |
| EXPANDED | 扩展community 列表号 100-199 |
| WORD | Community 列表名长度为1-255 的字符串 |
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

### 7.5.18 `set community`

**功能**：用这个命令来设置comminty 属性。
  使用此命令的no 格式来删除这个规则。
  使用这个命令来设置community 属性和在某个特定的community 中的组目的地址，已
  经，根据这些community 来应用路由选择。

**语法**：

```
set community [ AA:NN | internet | local-AS | no-advertise | no-export ]
set community none
no set community
```

| 参数 | 说明 |
| --- | --- |
| AA:NN | AA:NN: 用这样的格式来描述community 号 AA = AS 号 NN = 指定的community 号 2 字节AS 号，4 字节 community 号 |
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
下面是使用set community 时的例子:
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

### 7.5.19 `set dampening`

**功能**：使用这个命令来使能route-flap 惩罚，并且设置它的参数。
  使用此命令的no 格式来删除这个规则。
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
| REUSE | 指定重用门限值。当被一种的路由的惩罚值衰减到重用门限以下时，这个路由就不再被抑制。默认重用门限是 1-20000 |
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

### 7.5.20 `set extcommunity`

**功能**：使用这个命令来设置一个扩展的community 属性。
  使用此命令的no 格式来删除这个规则。
  使用该命令你首先要有个match 规则，match 和set 规则同时作用来进行路由重分布。
  Match 命令指定向其他路由协议重发布路由的规则。Set 命令指定在当前route-map 下
  路由重分布的表现方式。
  如果报文没有匹配到任何条件，将会被通常的路由表转发。

**语法**：

```
set extcommunity { rt | soo } EXTCOMMNUMBER [ …EXTCOMMNUMBER ]
no set extcommunity { rt | soo }
```

| 参数 | 说明 |
| --- | --- |
| rt | 指定扩展community 的扩展对象 |
| soo | 指定扩展community 的 site-of-origin 属性 |
| EXTCOMMNUMBER | ASN:NN 或者IP- address:nn VPN 扩展 |
| comminty |  |
| ASN:NN | AS 号 2 字节AS 号，4 字节 community 号 |
| IPADDRESS | 以IP 地址形式表示的AS 号 IPv4 地址 |

**命令模式**：Route-map 模式

**默认配置**：默认set extcommunity 不设置。

**使用说明**：

这个命令对BGP 有效。

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

### 7.5.21 `set ipv6 next-hop`

**功能**：使用这个命令来设置指定的ipv6 下一跳的值。
  使用此命令的no 格式来删除这个规则。
  使用该命令你首先要有个match 规则，match 和set 规则同时作用来进行路由重分布。
  Match 命令指定向其他路由协议重发布路由的规则。Set 命令指定在当前route-map 下
  路由重分布的表现方式。
  如果报文没有匹配到任何条件，将会被通常的路由表转发。

**语法**：

```
set ipv6 next-hop [ local ] IPV6_ADDR
no set ipv6 next-hop [ local ]
```

| 参数 | 说明 |
| --- | --- |
| local |  |
| Link-local address |  |
| IPV6_ADDR | 指定下一跳的IPv6 地址 IPv6 地址 |

**命令模式**：Route-map 模式

**默认配置**：默认set ipv6 next-hop 不设置。

**使用说明**：

这个命令对BGP，OSPFv3，RIPng 和策略路由有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map mymap permit 3
Switch(config-route-map)# set ipv6 next-hop 2001:db8::1
```

**相关命令**：无

### 7.5.22 `set local-preference`

**功能**：使用这个命令来设置本地优先级属性。
  使用此命令的no 格式来删除这个规则。
  使用该命令你首先要有个match 规则，match 和set 规则同时作用来进行路由重分布。
  Match 命令指定向其他路由协议重发布路由的规则。Set 命令指定在当前route-map 下
  路由重分布的表现方式。
  如果报文没有匹配到任何条件，将会被通常的路由表转发

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

### 7.5.23 `set metric`

**功能**：使用这个命令来设置一个路由的metric 值。
  使用此命令的no 格式来删除这个规则。
  这个命令用于设置一条路由的metric 值，以及关于一个关于AS 的首选路径影响的外
  部邻居。首选路径是一个比较有较低metric 值的路由。一个路由器比较在同一个AS
  中，邻居路径的metric 值。比较不同的AS 邻居的metric 值，使用bgp always-
  compare-med 命令。

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

### 7.5.24 `set metric-type`

**功能**：使用这个命令来设置目的路由协议的metric 类型。
  使用此命令的no 格式来删除这个规则。
  当route-map 匹配的时候，这个命令设置在AS-external-LSA 中设置Type-1 或者
  Type-2 两种类型。

**语法**：

```
set metric-type { TYPE1 | TYPE2 }
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

### 7.5.25 `set origin`

**功能**：使用这个命令来设置BGP origin 代码。
  使用此命令的no 格式来删除这个规则。
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

### 7.5.26 `set ipv6 originator-id`

**功能**：使用这个命令来设置originator ID 属性。
  使用此命令的no 格式来删除这个规则。
  使用该命令你首先要有个match 规则，match 和set 规则同时作用来进行路由重分布。
  Match 命令指定向其他路由协议重发布路由的规则。Set 命令指定在当前route-map 下
  路由重分布的表现方式。
  如果报文没有匹配到任何条件，将会被通常的路由表转发。

**语法**：

```
set ipv6 originator-id IPV6_ADDR
no set ipv6 originator-id
```

| 参数 | 说明 |
| --- | --- |
| IPV6_ADDR | 指定originator 的IPv6 地址 IPv6 地址 |

**命令模式**：Route-map 模式

**默认配置**：默认set originator-id 不设置。

**使用说明**：

这个命令仅对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set ipv6 originator-id 2001:db8::1
```

**相关命令**：无

### 7.5.27 `set tag`

**功能**：使用这个命令来设置一个指定的tag 值。
  使用此命令的no 格式来删除这个规则。
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

### 7.5.28 `set vpnv6 next-hop`

**功能**：使用这个命令来设置一个VPNv6 下一跳地址。
  使用此命令的no 格式来删除这个规则。
  在这个命令中的tag，被另外一个路由协议(重分布时的BGP 或者其他IGP)所标签，原
  因是AS-external-LSA 在它的LSA 中有一个route-tag 区。并且，使用route-map 的话，
  ZebOS 会使用合适的tag 值对这个LSA 上打上标签。有时候，这个tag 会匹配route-
  mp，有时候，这个值会被其他应用程序所使用。

**语法**：

```
set vpnv6 next-hop IPV6_ADDR
no set vpnv6 next-hop
```

| 参数 | 说明 |
| --- | --- |
| IPV6_ADDR | 指定下一跳IPv6 地址 IPv6 地址 |

**命令模式**：Route-map 模式

**默认配置**：默认set vpnv6 next-hop 不设置。

**使用说明**：

这个命令仅对BGP 有效。

**示例**：

```
Switch# configure terminal
Switch(config)# route-map rmap1 permit 3
Switch(config-route-map)# set vpnv6 next-hop 2001:db8::1
```

**相关命令**：无

### 7.5.29 `set weight`

**功能**：使用这个命令来设置路由表的应用权重(weght)。
  使用此命令的no 格式来删除这个规则。
  Weight 值是用于帮助进行最优路径选择的。它在路由器本地被之地你个。当有多个路
  由器，他们的目的地都相同时，有比较高权重的路由器将会被优先选中。

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

### 7.5.30 `show route-map`

**功能**：使用这个命令来显示用户可读的route-map 信息。

**语法**：

```
show route-map [ NAME ]
```

| 参数 | 说明 |
| --- | --- |
| NAME | route-map 名 Route-map 的名字长度不得超过20，并且它的首字母必须是’a’-‘z’, ‘A’-‘Z’或者’0’-‘9’ |

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

**相关命令**：route-map、7.6 IPv6 BGP 命令


## 7.6 IPv6 BGP 命令

### 7.6.1 `address-family`

**功能**：使用这个命令来进入IPv6, address-family 命令模式。

**语法**：

```
address-family ipv6 ( unicast | )
```

| 参数 | 说明 |
| --- | --- |
| unicast | 指定单播前缀 |

**命令模式**：路由模式

**默认配置**：无

**使用说明**：

使用address-family 命令，来进入路由模式，允许配置跟路由相关的参数。
  退出该模式使用相应的exit，或者exit-address-family 命令。

**示例**：

```
Switch# configure terminal
Switch(config) router bgp 100
Switch(config-router)address-family ipv6
```

**相关命令**：exit-address-family

### 7.6.2 `aggregate-address`

**功能**：使用这个命令来配置BGP 集合条目。
  使用相应的no 命令来删除这个配置。

**语法**：

```
( no ) aggregate-address IPADDRESS { summary-only | as-set }
```

| 参数 | 说明 |
| --- | --- |
| IPV6_ADDR | X:X::X:X/M 指定聚合的 IPv6 前缀 IPv6 地址 |
| summary-only | 从更新过程中，过滤更多的- 指定路由 |
| as-set | 生成AS set 路径信息 |

**命令模式**：地址族配置模式

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
Switch(config-router)# aggregate-address 2018::1/64 as-set summary-only
```

**相关命令**：N/A

### 7.6.3 `bgp always-compare-med`

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

### 7.6.4 `bgp bestpath as-path ignore`

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

### 7.6.5 `bgp bestpath compare-confed-aspath`

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

### 7.6.6 `bgp bestpath compare-routerid`

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

**相关命令**：show bgp ipv6、show ip bgp neighbors

### 7.6.7 `bgp bestpath med`

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

### 7.6.8 `bgp client-to-client reflection`

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

**相关命令**：bgp cluster-id、neighbor route-reflector-client、show bgp ipv6

### 7.6.9 `bgp cluster-id`

**功能**：如果BGP 集群有一个以上的RR 的话，使用这个命令来配置cluster ID。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp cluster-id CLUSTERID
no bgp cluster-id
```

| 参数 | 说明 |
| --- | --- |
| CLUSTERID | A.B.C.D\|<1-4294967295> 指定这个路由器的cluster IPv4 地址或1-4294967295 之间的整数 ID，它会像一个RR 一样活动。可以是一个IP 地址， 或者是一个最大为4 字节的数值。 |
| A.B.C.D | RR 的以IP 地址形式的 |
| cluster-id | IPv4 地址 <1-4294967295> RR 的32bit cluster-id 1-4294967295 |

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

**相关命令**：bgp client-to-client reflection, neighbor route-reflector-client, show bgp ipv6

### 7.6.10 `bgp confederation identifier`

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

### 7.6.11 `bgp confederation peers`

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

### 7.6.12 `bgp dampening`

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
no bgp dampening route-map ROUTEMAP
```

| 参数 | 说明 |
| --- | --- |
| REACHTIME | 指定可达半衰期(单位 min)。惩罚时间是当前值的一半。默认15min。 1-45 |
| REUSE | 指定重用门限值。当对一个抑制路由的惩罚，一直衰减到重用门限值以下时，这个路由就不再被抑制了。默认值是750。 1-20000 |
| SUPPRESS | 指定抑制门限值。当对一个路由的惩罚超过这个抑制门限时，这个路由会被抑制。 默认值2000。 1-20000 |
| MAXSUPPRESS | 指定最大抑制时间。惩罚路由被抑制的最长时间。默认是4 倍的半衰期(60min)。 1-255 |
| UNREACHTIME | 指定不可达半衰期(单位 min)。 1-45 |
| ROUTEMAP | route-map WORD 指定惩罚规则的route-map。 Route-map 的名字长度不得超过20，并且它的首字母必须是’a’-‘z’, ‘A’-‘Z’或者’0’-‘9’ |

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

### 7.6.13 `bgp default local-preference`

**功能**：使用这个命令来改变默认的local-preference 值。
  使用相应的no 来返回默认设置。

**语法**：

```
bgp default local-preference PREF_VALUE
no default local-preference ( PREF_VALUE | )
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

### 7.6.14 `bgp deterministic-med`

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

**相关命令**：show bgp ipv6, show bgp ipv6 neighbors

### 7.6.15 `bgp enforce-first-as`

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

### 7.6.16 `bgp fast-external-failover`

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

### 7.6.17 `bgp graceful-restart`

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

### 7.6.18 `bgp graceful-restart stalepath-time`

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

### 7.6.19 `bgp log-neighbor-changes`

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
  •
  接收到BGP 通告
  •
  接收到错误的BGP 更新
  •
  用户重置请求
  •
  对等体超时
  •
  对等体关闭会话
  •
  接口震荡
  •
  变换
  •
  删除邻居
  •
  成员被增加到对等体组中
  •
  端口
  •
  远端AS 变化
  •
  修改RR 客户端配置
  •
  软件修改配置

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 100
Switch(config-router)# bgp log-neighbor-changes
```

**相关命令**：N/A

### 7.6.20 `bgp router-id`

**功能**：使用这个命令来配置router-id。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp router-id ROUTERID
no bgp router-id ( ROUTERID | )
```

| 参数 | 说明 |
| --- | --- |
| ROUTERID | A.B.C.D 手动配置router-id IPv4 地址格式 |

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

### 7.6.21 `bgp scan-time`

**功能**：使用用这个命令来设置BGP 路由下一跳的扫描间隔。
  使用相应的no 命令来删除这个配置。

**语法**：

```
bgp scan-time TIME
no bgp scan-time ( TIME | )
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

### 7.6.22 `clear bgp ipv6 *`

**功能**：使用这个命令来重置所有对等体的BGP 连接。

**语法**：

```
clear bgp ipv6 * ( in | out | soft | )
clear bgp ipv6 * vrf NAME
```

| 参数 | 说明 |
| --- | --- |
| in | 表示入站的宣告路由将会被清除 |
| out | 示出站的宣告路由将会被清除 |
| soft | soft (in\|out\|)表示入站/出站的宣告路由都将会被清除 |
| vrf | 路由/转发实例 |
| NAME | 路由/转发实例名不超过31 个字符 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

BGP 的重置分硬重置和软重置两种，它们的区别就是：硬重置会导致BGP 邻居关系切
  断并重新建立；软重置不会切断邻居关系，只会重新刷新路由表。

**示例**：

```
Switch# clear bgp ipv6 *
Switch# clear bgp ipv6 * soft
Switch# clear bgp ipv6 * vrf aa
```

**相关命令**：N/A

### 7.6.23 `clear bgp ipv6 X:X::X:X`

**功能**：使用这个命令来通过指定的IPv6 地址重置IPV6 BGP 的连接。

**语法**：

```
clear bgp ipv6 X:X::X:X ( in | out | soft )
clear ipv6 bgp X:X::X:X vrf NAME
```

| 参数 | 说明 |
| --- | --- |
| X:X::X:X | 要清除的BGP 路由的IPv6 地址 IPv6 地址 |
| in | 表示入站的宣告路由将会被清除 |
| out | 示出站的宣告路由将会被清除 |
| soft | soft (in\|out\|)表示入站/出站的宣告路由都将会被清除 |
| vrf | 路由/转发实例 |
| NAME | 路由/转发实例名不超过31 个字符 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# clear bgp ipv6 2018::1
Switch# clear bgp ipv6 2018::1 soft
```

**相关命令**：N/A

### 7.6.24 `clear bgp ipv6 unicast dampening`

**功能**：使用这个命令来重置所有指定地址族的BGP 惩罚路由。

**语法**：

```
clear bgp ipv6 dampening ( X:X::X:X | X:X::X:X/M | )
```

| 参数 | 说明 |
| --- | --- |
| X:X::X:X | 指定想要清除的BGP 惩罚的IPV6 地址 IPv6 地址 |
| X:X::X:X/M | 定想要清除的BGP 惩罚的带子网的IPV6 地址 IPv6 地址和掩码长度 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# clear bgp ipv6  unicast dampening
Switch# clear bgp ipv6  unicast dampening 2018::1
```

**相关命令**：N/A

### 7.6.25 `clear bgp ipv6 unicast flap-statistics`

**功能**：使用这个命令来清除所有指定地址族的前缀的振荡次数和历史统计。

**语法**：

```
clear bgp ipv6 unicast flap-statistics ( X:X::X:X | X:X::X:X/M | )
```

| 参数 | 说明 |
| --- | --- |
| X:X::X:X | 指定想要清除的BGP 惩罚的IPV6 地址 IPv6 地址 |
| X:X::X:X/M | 定想要清除的BGP 惩罚的带子网的IPV6 地址 IPv6 地址和掩码长度 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# clear bgp ipv6 unicast flap-statistics 10.10.0.121
```

**相关命令**：N/A

### 7.6.26 `clear bgp ipv6 ASN`

**功能**：使用这个命令来重置一个指定AS 下的所有对等体的BGP 连接。

**语法**：

```
clear bgp ipv6 ASN ( in | out | soft | )
```

| 参数 | 说明 |
| --- | --- |
| ASN | 指定要被删除的所有路由的 |
| ASN | 1-4294967295 |
| in | 表示入站的宣告路由将会被清除 |
| out | 表示出站的宣告路由将会被清除 |
| soft | soft (in\|out\|)表示入站/出站的宣告路由都将会被清除 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# clear bgp ipv6 100
```

**相关命令**：N/A

### 7.6.27 `clear bgp ipv6 external`

**功能**：使用这个命令来对所有外部对等体的BGP 连接进行重置。

**语法**：

```
clear bgp ipv6 external ( in | sotf | )
```

| 参数 | 说明 |
| --- | --- |
| external | 清除所有的外部对等体 |
| in | 表示入站的宣告路由将会被清除 |
| soft | soft (in\|out\|)表示入站/出站的宣告路由都将会被清除 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# clear bgp ipv6 external in
```

**相关命令**：N/A

### 7.6.28 `clear bgp ipv6 peer-group`

**功能**：使用这个命令来重置一个对等组下的所有成员的BGP 连接。

**语法**：

```
clear bgp ipv6 peer-group WORD ( in | out | soft | )
```

| 参数 | 说明 |
| --- | --- |
| peer-group | 清除一个对等组的所有成员 - |
| WORD | 指定要清除的对等组的名字 不超过20 个字符 |
| in | 表示入站的宣告路由将会被清除 |
| out | 表示出站的宣告路由将会被清除 |
| soft | soft (in\|out\|)表示入站/出站的宣告路由都将会被清除 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

无

**示例**：

```
Switch# clear bgp ipv6 peer-group Peer1 out
```

**相关命令**：N/A

### 7.6.29 `debug bgp`

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

### 7.6.30 `exit-address-family`

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

Switch(config-router)# address-family ipv6
Switch(config-router-af)# exit-address-family
Switch(config-router)#
```

**相关命令**：address-family

### 7.6.31 `neighbor activate`

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
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 |

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
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 2018::1 active
```

**相关命令**：neighbor remote-as

### 7.6.32 `neighbor advertisement-interval`

**功能**：使用这个命令来设置BGP 路由更新的最小间隔。
  使用相应的no 参数来设置间隔为默认值。

**语法**：

```
neighbor NEIGHBORID advertisement-interval TIME
no neighbor NEIGHBORID advertisement-interval TIME
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 |
| TIME | 以秒为单位的宣告间隔值。 0-600 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

使用这个命令来设置BGP 路由更新发送的最小间隔。为了降低在internet 中的路由抖
  动，设定了一个最小的宣告间隔。所以BGP 路由只会在每个时间间隔被发送。bgp
  dampening 也可以被用于控制路由抖动的效果。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 2018::1 advertisement-interval 45
```

**相关命令**：N/A

### 7.6.33 `neighbor allowas-in`

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
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被不超过20 个字符命令使用的时候，这个命令会被应用到指定组的所有对等体上。 |
| NUMBER | 允许重复出现的ASN 次数，默认为3 1-10 |

**命令模式**：地址族配置模式

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
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 2018::1 allowas-in 3
```

**相关命令**：N/A

### 7.6.34 `neighbor attribute-unchanged`

**功能**：使用这个命令来向指定的邻居宣告没改变的BGP 属性。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID attribute-unchanged { as-path | next-hop | med }
no neighbor NEIGHBORID attribute-unchanged { as-path | next-hop | med }
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |
| as-path | AS 路径属性 |
| next-hop | 下一跳属性 |
| med | MED 值 |

**命令模式**：地址族配置模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# address-family ipv6
Switch(config-router-af)#  neighbor 23018::1 attribute-unchanged as-path med
```

**相关命令**：N/A

### 7.6.35 `neighbor capability graceful-restart`

**功能**：使用这个命令来使能或者去使能GR helper 功能。
  
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID capability graceful-restart ( | disable )
no neighbor NEIGHBORID capability graceful-restart ( | disable )
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 格式为X:X::X:X 的IPv6 地址 |
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
Switch(config-router)# neighbor 2000::1 capability graceful-restart
```

**相关命令**：N/A

### 7.6.36 `neighbor capability orf prefix-list`

**功能**：使用这个命令来向邻居宣告ORF 的最大容量(capability)。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID capability orf prefix-list ( both | receive | send )
no neighbor NEIGHBORID capability orf prefix-list ( both | receive | send )
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |
| orf | 向邻居宣告ORF 容量 |
| both | 表示本地路由器既可以向他的对等体发送条目，又可以接受ORF 条目。 |
| receive | 只能接受ORF 条目。 |
| send | 只能发送ORF 条目。 |

**命令模式**：地址族配置模式

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
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 1.1.1.1 capability orf prefix-list both
```

**相关命令**：N/A

### 7.6.37 `neighbor default-originate`

**功能**：使用这个命令来允许BGP 本地路由其来发送默认路由0:0::0:0 到一个邻居，作为它的默
  认路由。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID default-originate ( ROUTEMAP | )
no neighbor NEIGHBORID default-originate ( ROUTEMAP | )
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |
| ROUTEMAP |  |
| route-map WORD |  |
| route-map | 用于指定成为起始默认路由的标准的route-map |
| WORD | Route-map 名 |

**命令模式**：地址族配置模式

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
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 2018::1 default-originate route-map myroute
```

**相关命令**：N/A

### 7.6.38 `neighbor description`

**功能**：使用这个命令来将邻居和一个描述关联起来。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID description LINE
no neighbor NEIGHBORID description
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |
| LINE | 描述这个邻居不超过80 个字符 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 2018::1 description Backup router for sales.
```

**相关命令**：N/A

### 7.6.39 `neighbor distribute-list`

**功能**：使用这个命令来过滤来自特定BGP 邻居的路由更新。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID distribute-list WORD ( in | out )
no neighbor NEIGHBORID distribute-list WORD ( in | out )
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |
| WORD | IP ACL 的名字不超过20 个字符 |
| in | 表示入站的宣告路由将会被过滤 |
| out | 表示出站的宣告路由将会被过滤 |

**命令模式**：地址族配置模式

**默认配置**：N/A

**使用说明**：

每个BGP 邻居只使用一个distribute-list。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 2018::1 distribute-list mylist out
```

**相关命令**：N/A

### 7.6.40 `neighbor ebgp-multihop`

**功能**：使用这个命令来在不直连的网络上接受和与外部的对等体尝试BGP 连接。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID ebgp-multihop ( COUNT | )
no neighbor NEIGHBORID ebgp-multihop
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |
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

Switch(config-router)# neighbor 2018::1 remote-as 20
Switch(config-router)# neighbor 2018::1 ebgp-multihop 5
```

**相关命令**：N/A

### 7.6.41 `neighbor filter-list`

**功能**：使用这个命令来建立一个BGP 过滤器。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID filter-list LISTNAME ( in | out )
no neighbor NEIGHBORID filter-list LISTNAME ( in | out )
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |
| in | 表示入站的宣告路由将会被过滤 |
| out | 表示出站的宣告路由将会被过滤 |
| LISTNAME | 访问控制列表名不超过20 个字符 |

**命令模式**：地址族配置模式

**默认配置**：N/A

**使用说明**：

这个命令指定了基于BGP AS-path 的ACL 过滤器。每个过滤器都是一个基于正则表达
  式的ACL。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 2018::1 filter-list listname out
```

**相关命令**：N/A

### 7.6.42 `neighbor maximum-prefix`

**功能**：使用这个命令来控制可以被邻居接收到的前缀数量。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID maximum-prefix MAXIMUM
no neighbor NEIGHBORID maximum-prefix
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |
| MAXIMUM |  |
| MAXPREFIX | (THRESHOLD\|) (warning- only\|) |
| MAXPREFIX | 指定允许前缀的最大数量。 1-4294967295 |
| THRESHOLD | 指定阈值，1%-100%。 1-100 |
| warning-only | 在超过限制时只发送警告信息。 |

**命令模式**：地址族配置模式

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
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 2018::1 maximum-prefix 1244 warning-only
```

**相关命令**：N/A

### 7.6.43 `neighbor next-hop-self`

**功能**：使用这个命令来配置路由器作为一个BGP-speaking 邻居或者一个对等体组。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID next-hop-self
no neighbor NEIGHBORID next-hop-self
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |

**命令模式**：地址族配置模式

**默认配置**：N/A

**使用说明**：

当BGP 路由器通过eBGP 得到路由，并且这些路由需要广播给一个iBGP 邻居时，发送
  的下一跳信息并不改变。使用这个命令，BGP 路由器可以改变发送给iBGP 对等体的下
  一跳信息，把下一跳信息设置为这个邻居进行通信的接口的IP 地址。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 10.10.0.72 next-hop-self
```

**相关命令**：N/A

### 7.6.44 `neighbor override-capability`

**功能**：使用这个命令来覆盖一个capability 协商的结果。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID override-capability

no neighbor NEIGHBORID override-capability
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 12
Switch(config-router)# neighbor 2018::1 override-capability
```

**相关命令**：N/A

### 7.6.45 `neighbor passive`

**功能**：使用这个命令，来设定一个BGP 邻居组为被动模式。
  使用相应的no 命令来删除这个配置。

**语法**：

```
( no ) neighbor NEIGHBORID passive
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 12
Switch(config-router)# neighbor 2018::1 passive
```

**相关命令**：N/A

### 7.6.46 `neighbor peer-group (adding a neighbor)`

**功能**：使用这个命令，来向一个已经存在的对等体组中增加一个邻居。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor IPADDRESS peer-group TAG
no neighbor IPADDRESS peer-group
```

| 参数 | 说明 |
| --- | --- |
| IPV6_ADDR | X:X::X:X 以IPv6 地址格式来指定BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |

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
Switch(config-router)# neighbor 2018::1 peer-group group1
```

**相关命令**：N/A

### 7.6.47 `neighbor peer-group (creating a peer-group)`

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

### 7.6.48 `neighbor prefix-list`

**功能**：使用这个命令在指定一个前缀列表的时候来分发BGP 邻居信息。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID prefix-list LISTNAME ( in | out )
no neighbor NEIGHBORID prefix-list LISTNAME ( in | out )
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |
| LISTNAME | AS-path 的ACL 号。 不超过20 个字符 |
| in | 指定ACL 应用到入站宣告上 |
| out | 指定ACL 应用到出站宣告上 |

**命令模式**：地址族配置模式

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
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 10.10.10.10 prefix-list list1 in
```

**相关命令**：ip prefix-list

### 7.6.49 `neighbor remote-as`

**功能**：使用这个命令来配置一个跟另一个路由器建立的内部或者外部的BGP(iBGP 或者eBGP)
  的TCP 会话。

**语法**：

```
neighbor NEIGHBORID remote-as ASNUM
no neighbor NEIGHBORID remote-as ASNUM
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |
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
Switch(config-router)# neighbor 2018::1 remote-as 345
```

**相关命令**：N/A

### 7.6.50 `neighbor remove-private-AS`

**功能**：使用这个命令来将私有ASN 从出站更新中移除。
  使用相应的no 命令来删除这个配置并返回默认。

**语法**：

```
neighbor NEIGHBORID remove-private-AS
no neighbor NEIGHBORID remove-private-AS
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |

**命令模式**：地址族配置模式

**默认配置**：Disabled

**使用说明**：

私有ASN 范围<64512-65535>。私有ASN 不会被宣告到Internet 上。这个命令只能和
  外部BGP 对等体一起使用。路由器只会在更新中包含私有ASN 的时候才会删除这个
  ASN。如果更新中既有私有的又有公有的ASN，系统作为error 处理。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 2018::1 remove-private-AS
```

**相关命令**：N/A

### 7.6.51 `neighbor route-reflector-client`

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
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |

**命令模式**：地址族配置模式

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
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 2018::1 route-reflector-client
```

**相关命令**：N/A

### 7.6.52 `neighbor send-community`

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
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， 不超过20 个字符 neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 |
| both | 发送标准和扩展的 community 属性 |
| extended | 发送扩展community 属性 |
| standard | 发送标准community 属性 |

**命令模式**：地址族配置模式

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
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 2018::1 send-community extended
```

**相关命令**：N/A

### 7.6.53 `neighbor shutdown`

**功能**：使用这个命令来关闭一个邻居。
  使用相应的no 命令来重新使能这个邻居。

**语法**：

```
neighbor NEIGHBORID shutdown
no neighbor NEIGHBORID shutdown
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| A.B.C.D | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

这个命令关闭任何指定邻居的活动会话，并且清空相关的路由数据。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 2018::1 shutdown
```

**相关命令**：N/A

### 7.6.54 `neighbor soft-reconfiguration inbound`

**功能**：使用这个命令来配置启动存储更新。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID soft-reconfiguration inbound
bo neighbor NEIGHBORID soft-reconfiguration inbound
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IP 地址格式来指定BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |

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
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 2018::1 soft-reconfiguration inbound
```

**相关命令**：N/A

### 7.6.55 `neighbor strict-capability-match`

**功能**：使用这个命令，如果capability 值无法完全的匹配远端对等体的话，就关闭BGP 连接。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID strict-capability-match
no neighbor NEIGHBORID strict-capability-match
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 12

Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 2018::1 strict-capability-match
```

**相关命令**：N/A

### 7.6.56 `neighbor timers`

**功能**：使用这个命令来对一个指定的BGP 邻居设定时钟。
  使用相应的no 命令来清除这个时钟。

**语法**：

```
neighbor NEIGHBORID timers KEEPALIVE HOLDTIME
no neighbor NEIGHBORID timers
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |
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
Switch(config-router)# address-family ipv6
Switch(config-router-af)# neighbor 2018::1 timers 60 120
```

**相关命令**：N/A

### 7.6.57 `neighbor unsuppress-map`

**功能**：使用这个命令来选择性的对特定的邻居抑制更明确的路由。

**语法**：

```
neighbor NEIGHBORID unsuppress-map WORD
no neighbor NEIGHBORID unsuppress-map WORD
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |
| WORD | route map 名 |

**命令模式**：地址族配置模式

**默认配置**：N/A

**使用说明**：

当aggregate-address 命令使用了summary-only 选项时，会抑制聚合的更明确的路由。
  它会抑制更明确的路由到达所有的邻居。可以使用非抑制的映射，有选择的让特定的
  路由到达特定的邻居。

**示例**：

```
Switch# configure terminal
Switch(config)#router bgp 10
Switch(config-router)address-family ipv6
Switch(config-router-af)neighbor 2018::1 unsuppress-map mymap
```

**相关命令**：N/A

### 7.6.58 `neighbor update-source`

**功能**：使用这个命令，来允许内部BGP 会话使用任何对TCP 连接可选的接口。
  使用no neighbor update-source 命令恢复默认，使用最接近的接口。

**语法**：

```
neighbor NEIGHBORID update-source IFNAME
no neighbor NEIGHBORID update-source
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被不超过20 个字符命令使用的时候，这个命令会被应用到指定组的所有对等体上。 |
| IFNAME | 指定接口名支持物理端口，聚合端口， 环回端口，VLAN 端口和隧道端口 |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

使用这个命令来与任在路由器上指定的接口结合使用。最常用的接口类型是loopback
  接口。使用loopback 接口可以停止BGP 对某个特定的interface 进行TCP 连接的依赖。

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 10
Switch(config-router)# neighbor 2018::1 update-source eth-0-1
```

**相关命令**：N/A

### 7.6.59 `neighbor weight`

**功能**：使用这个命令，来设置路由到另据的默认weight。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor NEIGHBORID weight WEIGHT
no neighbor NEIGHBORID weight
```

| 参数 | 说明 |
| --- | --- |
| NEIGHBORID | (X:X::X:X\|TAG) |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 IPv6 地址 |
| TAG | 已经存在的对等组名。请参考neighbor peer-group， neighbor remote-as 命令来创建对等组。当这个参数被命令使用的时候，这个命令会被应用到指定组的所有对等体上。 不超过20 个字符 |
| WEIGHT | 指定邻居的权重值 0-65535 |

**命令模式**：地址族配置模式

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
Switch(config-router)address-family ipv6
Switch(config-router-af)# neighbor 2018::1 weight 60
```

**相关命令**：N/A

### 7.6.60 `network`

**功能**：使用这个命令来指定被BGP 路由进程宣告的网络。
  使用相应的no 命令来删除这个配置。

**语法**：

```
network X:X::X:X/M
network X:X::X:X/M route-map WORD
no network X:X::X:X/M
no network X:X::X:X/M route-map WORD
```

| 参数 | 说明 |
| --- | --- |
| X:X::X:X/M | IP 前缀, 例 2018:: IPv6 地址和掩码长度 |
| WORD | Route-map 名 Route-map 的名字长度不得超过20，并且它的首字母必须是’a’-‘z’, ‘A’-‘Z’或者’0’-‘9’ |

**命令模式**：地址族配置模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
下面的例子举例说明说明了，把一个Class-A 的地址配置成一个网络路由Class-A 的网
络前缀掩码的长度8 将会被在内部获得，会是2018::/64:
Switch# configure terminal
Switch(config)#router bgp 1
Switch(config-router)address-family ipv6
Switch(config-router-af)#network 2018::/64

!
router bgp 1
no synchronization
network 2018::/64
!
```

**相关命令**：N/A

### 7.6.61 `network synchronization`

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

### 7.6.62 `synchronization`

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
Switch(config)# address-family ipv6
Switch(config-af)# network synchronization
```

**相关命令**：N/A

### 7.6.63 `router bgp`

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

### 7.6.64 `show debugging bgp`

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

### 7.6.65 `show bgp ipv6`

**功能**：使用这个命令来显示BGP 网络信息。

**语法**：

```
show bgp ipv6 ( IPADDRESS | )
```

| 参数 | 说明 |
| --- | --- |
| IPADDRESS | X:X::X:X\|X:X::X:X/M 指定 IPv6 地址及长度 IPv6 地址和掩码长度 |
| unicast | 指定IPV4 单播地址族。这是默认选项。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show bgp ipv6
```

**相关命令**：N/A

### 7.6.66 `show bgp ipv6 community`

**功能**：使用这个命令来显示匹配联合的路由。

**语法**：

```
show bgp ( ipv6 ) community [ AA:NN | local-AS | no-advertise | no-export ] ( exact-
match | )
```

| 参数 | 说明 |
| --- | --- |
| local-AS | 不向外发送本地AS(公认联合) |
| AA:NN | 指定一个对于联合号来说有效的值。这个值的格式是一个32bit 的值，AS 是高 16bit 而VAL 是低16bit。 2 字节AS 号，2 字节 community 号 |
| no-advertise | 不向任何对等体宣告 (公认联合) |
| no-export | 不像下一个AS 输出(公认联合) |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show bgp ipv6 community
Switch# show bgp ipv6 community local-AS 100
```

**相关命令**：N/A

### 7.6.67 `show bgp ipv6 community-list`

**功能**：使用这个命令来显示匹配community-list 的路由。

**语法**：

```
show ip bgp community-list LISTNAME ( exact-match | )
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | 指定community list 名不超过20 个字符 |
| exact-match | 只表示那些有相同指定联合的路由。 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show bgp ipv6 community-list mylist exact-match
Switch# show bgp ipv6 unicast community-list mylist
```

**相关命令**：N/A

### 7.6.68 `show bgp ipv6 dampening`

**功能**：使用这个命令来显示惩罚的详细信息。

**语法**：

```
show bgp ipv6 dampening ( dampened-paths | flap-statistics | parameters )
```

| 参数 | 说明 |
| --- | --- |
| dampened-paths | 显示惩罚路径 |
| flap-statistics | 显示路由flap 统计 |
| parameters | 显示配置的惩罚参数的详细信息 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
使能bgp dampening 来在内存中保存dampened-path 信息 下面是一个显示所有惩罚
参数的一个例子:
Switch# show bgp ipv6 dampening parameters
```

**相关命令**：N/A

### 7.6.69 `show bgp ipv6 filter-list`

**功能**：使用这个命令来显示符合filter-list 的路由。

**语法**：

```
show ip bgp filter-list LISTNAME
```

| 参数 | 说明 |
| --- | --- |
| LISTNAME | 指定ACL 名不超过20 个字符 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show bgp ipv6 filter-list mylist
```

**相关命令**：N/A

### 7.6.70 `show bgp ipv6 inconsistent-as`

**功能**：使用这个命令来显示与AS-path 不匹配的路由。

**语法**：

```
show bgp ipv6 inconsistent-as
```

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show bgp ipv6 inconsistent-as
```

**相关命令**：N/A

### 7.6.71 `show bgp ipv6 neighbors`

**功能**：使用这个命令来表示TCP 和BGP 邻居连接的详细信息。

**语法**：

```
show bgp ipv6 neighbors ( IPV6_ADDR | )
```

| 参数 | 说明 |
| --- | --- |
| IPV6_ADDR | X:X::X:X 指定IPv6 地址 IPv6 地址 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
这是一个使用show bgp ipv6 命令来显示指定邻居的命令:
Switch# show bgp ipv6 neighbors
```

**相关命令**：N/A

### 7.6.72 `show bgp ipv6 paths`

**功能**：使用这个命令来显示BGP 路径信息。

**语法**：

```
show bgp ipv6 paths
```

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show bgp ipv6 paths
```

**相关命令**：N/A

### 7.6.73 `show bgp ipv6 prefix-list`

**功能**：使用这个命令来显示匹配prefix-list 的路由。

**语法**：

```
show bgp ipv6 prefix-list LIST
```

| 参数 | 说明 |
| --- | --- |
| LIST | 指定IPv6 prefix list 的名字 不超过40 个字符 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show bgp ipv6 prefix-list mylist
```

**相关命令**：N/A

### 7.6.74 `show bgp ipv6 quote-regexp`

**功能**：使用这个命令来显示匹配AS path 正则表达式的路由。正则表达式用引号""括起。

**语法**：

```
show bgp ipv6 quote-regexp WORD
```

| 参数 | 说明 |
| --- | --- |
| WORD | 指定匹配BGP AS-path 的正则表达式正则表达式,用引号""括起 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show bgp ipv6 quote-regexp “Switch”
```

**相关命令**：N/A

### 7.6.75 `show bgp ipv6 regexp`

**功能**：使用这个命令来显示匹配AS path 正则表达式的路由。

**语法**：

```
show bgp ipv6 regexp LINE
```

| 参数 | 说明 |
| --- | --- |
| LINE | 显示匹配AS-path 正则表达式的路由正则表达式 |

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
Switch# show bgp ipv6 regexp myexpression
```

**相关命令**：N/A

### 7.6.76 `show bgp ipv6 summary`

**功能**：使用这个命令来显示BGP 邻居状态的汇总信息。

**语法**：

```
show bgp ipv6 summary
```

**命令模式**：特权模式

**默认配置**：N/A

**使用说明**：

N/A

**示例**：

```
这是一个使用show bgp ipv6 命令显示的一个例子:
Switch# show bgp ipv6 summary
```

**相关命令**：N/A

### 7.6.77 `timers`

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

### 7.6.78 `neighbor fall-over bfd`

**功能**：使用这个命令，来为邻居建立IPV6 BFD 会话。
  使用相应的no 命令来删除这个配置。

**语法**：

```
neighbor X:X::X:X fall-over bfd ( multihop | )
no neighbor X:X::X:X fall-over bfd ( multihop | )
```

| 参数 | 说明 |
| --- | --- |
| X:X::X:X | 以IPv6 地址格式来指定 BGP 邻居的地址。 格式为X:X::X:X 的IPv6 地址 |
| multihop | 以多跳的方式来建立bfd |
| session |  |

**命令模式**：路由模式

**默认配置**：N/A

**使用说明**：

为bgp 邻居建立ipv6 bfd 会话

**示例**：

```
Switch# configure terminal
Switch(config)# router bgp 12
Switch(config-router)# neighbor 2001:1::1 fall-over bfd
```

**相关命令**：无、、8 组播命令、8.1 组播路由命令

