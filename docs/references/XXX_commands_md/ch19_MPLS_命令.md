# 19 MPLS 命令

## 19.1 LDP 命令

### 19.1.1 `advertise-labels for`

**功能**：使用该条指令为指定的Peer，指定FEC 分发标签，使用no 参数清除配置。

**语法**：

```
advertise-labels for PREFIX_ACL to ( PEER_ACL | any )
no advertise-labels for PREFIX_ACL to ( PEER_ACL | any )
```

| 参数 | 说明 |
| --- | --- |
| PREFIX_ACL | 目的ACL 名称不超过20 个字符的字符串 |
| PEER_ACL | 邻接Peer 的ACL 名称不超过20 个字符的字符串 |
| any | 所有的LDP 邻接 |

**命令模式**：路由模式

**默认配置**：默认将标签发布到所有LDP 邻接。

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令来为指定的Peer，指定FEC 分发标签:

Switch# configure terminal
Switch(config)# router ldp
Switch(config-router)# advertise-labels for prefix-acl to any
```

**相关命令**：advertise-labels for any to none、advertise-labels for prefix-acl to peer-acl

### 19.1.2 `clear ldp adjacency`

**功能**：通过指定Peer 的IP 地址来清除指定邻接的信息，使用参数 * 将清除所有邻接的信息。

**语法**：

```
clear ldp adjacency ( IP_ADDR | * )
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 邻接的IP 地址 IPv4 地址 * 清除所有邻接 |

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令来清除一个指定的邻接路由器:
Switch# clear ldp adjacency 123.123.123.33
```

**相关命令**：clear ldp session、show ldp adjacency

### 19.1.3 `clear ldp session`

**功能**：通过指定Peer 的IP 地址来清除指定Session 的信息，使用参数 * 将清除所有Session
  的信息。

**语法**：

```
clear ldp session ( IP_ADDR | * )
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 会话对端的IP 地址 IPv4 地址 * 清除所有邻接 |

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令来清除一个指定的Session:
Switch# clear ldp session 123.123.123.33
```

**相关命令**：clear ldp adjacency、show ldp adjacency、show ldp session

### 19.1.4 `clear ldp statistics`

**功能**：使用该指令来清除LDP 的包统计计数。

**语法**：

```
clear ldp statistics
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令来清除包统计计数:
Switch# clear ldp statistics
```

**相关命令**：show ldp statistics

### 19.1.5 `clear ldp statistics advertise-labels`

**功能**：使用该命令来清除LDP 分发标签的统计信息。

**语法**：

```
clear ldp statistics advertise-labels ( for PREFIX_ACL ) ( to PERR_ACL )
```

| 参数 | 说明 |
| --- | --- |
| PREFIX_ACL | 目的ACL 名称不超过20 个字符的字符串 |
| PEER_ACL | 邻接Peer 的ACL 名称不超过20 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令来清除LDP 分发标签的统计信息:
Switch# clear ldp statistics advertise-labels for prefix_acl to peer_acl
```

**相关命令**：show ldp statistics advertise-labels

### 19.1.6 `control-mode`

**功能**：使用该条指令来设置标签的分发模式，使用no 来清除配置。

**语法**：

```
control-mode ( ordered | independent )
no control-mode ( ordered | independent )
```

| 参数 | 说明 |
| --- | --- |
| ordered | 设置控制模式为有序控制方式 |
| independent | 设置控制模式为独立控制方式 |

**命令模式**：路由模式

**默认配置**：独立控制模式

**使用说明**：

LSR 如果工作在有序控制方式下，则只有收到下游LSR 分发的标签时才会向自己的上
  游LSR 通告标签，如果没有收到下游的标签映射则不向上游LSR 通告。
  LSR 如果工作在独立控制方式下，即使在没有获得下游标签的情况下也会直接向上游
  分发标签。在标签控制的方式上显得很“独立”，不依赖下游LSR。
  
  修改控制模式后不会对之前已经生效的Label 重新分发。

**示例**：

```
下面例子讲述如何使用该指令来修改标签分发模式:
Switch# configure terminal
Switch(config)# router ldp
Switch(congig-router)# control-mode ordered
```

**相关命令**：show ldp

### 19.1.7 `debug ldp advertise-labels`

**功能**：使用该指令输出LDP 分发标签的调试信息，使用no 参数来关闭调试信息输出。

**语法**：

```
debug ldp advertise-labels
no debug ldp advertise-labels
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何输出LDP 分发标签的调试信息:
Switch# debug ldp advertise-labels
```

**相关命令**：show debugging ldp

### 19.1.8 `debug ldp all`

**功能**：使用该条指令来打开所有的LDP 故障定位功能，使用no 参数可以清除这条命令。

**语法**：

```
debug ldp all
no debug ldp all
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令来打开所有的LDP 故障定位功能:
Switch# debug ldp all
```

**相关命令**：show debugging ldp

### 19.1.9 `debug ldp dsm`

**功能**：使用该条指令输出下游状态机的信息，主要用于收到标签后的处理。
  所有debug 命令一旦打开，只有通过no 命令清除该参数，从而终结输出。以下
  debug 命令中不再赘述。Debug 信息和系统错误信息会打印到虚拟终端上，还可以通
  过配置模式将Debug 信息和系统错误信息输出到日志文件中去。

**语法**：

```
debug ldp dsm
no debug ldp dsm
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令输出下游状态机的信息:
Switch# debug ldp dsm
```

**相关命令**：debug ldp fsm、debug ldp packet

### 19.1.10 `debug ldp usm`

**功能**：使用该条指令输出上游状态机的信息，主要用于分发标签。
  所有debug 命令一旦打开，只有通过no 命令清除该参数，从而终结输出。以下
  debug 命令中不再赘述。Debug 信息和系统错误信息会打印到虚拟终端上，还可以通
  过配置模式将Debug 信息和系统错误信息输出到日志文件中去。

**语法**：

```
debug ldp usm
no debug ldp usm
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令输出上游状态机的信息:
Switch# debug ldp usm
```

**相关命令**：debug ldp fsm、debug ldp packet

### 19.1.11 `debug ldp events`

**功能**：使用该条指令来输出LDP 的事件信息，比如收发协议报文。
  所有debug 命令一旦打开，只有通过no 命令清除该参数，从而终结输出。以下
  debug 命令中不再赘述。Debug 信息和系统错误信息会打印到虚拟终端上，还可以通
  过配置模式将Debug 信息和系统错误信息输出到日志文件中去。

**语法**：

```
debug ldp events
no debug ldp events
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令输出LDP 的事件信息:
Switch# debug ldp events
2002/06/18 11:30:35 LDP: RECV packet from 192.168.3.5 port 32783

2002/06/18 11:30:35 LDP: ldp_message_hello_recv: Hello Packet received from
192.168.3.5
2002/06/18 11:30:36 LDP: ldp_message_hello_send: Sending Hello message via
interface
eth1. No transport address is being advertised.
2002/06/18 11:30:36 LDP: SEND to socket 13 port 646 addr 224.0.0.2
2002/06/18 11:30:36 LDP: ldp_message_hello_send: Sending Hello message via
interface
eth2. No transport address is being advertised.
2002/06/18 11:30:36 LDP: SEND to socket 13 port 646 addr 224.0.0.2
2002/06/18 11:30:37 LDP: Server : TCP Connection established with 192.168.3.5
2002/06/18 11:30:37 LDP: ldp_message_initialization_recv: Initialization message
received from 192.168.3.5
```

**相关命令**：debug ldp fsm、debug ldp packet

### 19.1.12 `debug ldp fsm`

**功能**：使用该条指令输出LDP 状态机信息。
  所有debug 命令一旦打开，只有通过no 命令清除该参数，从而终结输出。以下
  debug 命令中不再赘述。Debug 信息和系统错误信息会打印到虚拟终端上，还可以通
  过配置模式将Debug 信息和系统错误信息输出到日志文件中去。

**语法**：

```
debug ldp fsm
no debug ldp fsm
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令输出LDP 状态机信息:
Switch# debug ldp fsm
2002/06/18 11:40:01 LDP: FSM: State changed from NON_EXISTENT to INITIALIZED for
event LDP_EVENT_TCP_established
2002/06/18 11:40:01 LDP: FSM: State changed from INITIALIZED to OPENREC for event
LDP_EVENT_Recv_Init_msg
2002/06/18 11:40:01 LDP: FSM: State changed from OPENREC to OPERATIONAL for event
LDP_EVENT_Recv_KeepAlive_msg
2002/06/18 11:40:01 LDP: FSM: State changed from OPERATIONAL to OPERATIONAL for
event
LDP_EVENT_Recv_Other_msg
```

**相关命令**：debug ldp packet、debug ldp events

### 19.1.13 `debug ldp hexdump`

**功能**：使用该条指令输出hexdump 信息。
  所有debug 命令一旦打开，只有通过no 命令清除该参数，从而终结输出。以下
  debug 命令中不再赘述。Debug 信息和系统错误信息会打印到虚拟终端上，还可以通
  过配置模式将Debug 信息和系统错误信息输出到日志文件中去。

**语法**：

```
debug ldp hexdump
no debug ldp hexdump
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令输出hexdump 状态机信息:
Switch# debug ldp hexdump
```

**相关命令**：debug ldp fsm、debug ldp packet

### 19.1.14 `debug ldp packet`

**功能**：使用该条指令来输出从Peer 收到和发向Peer 的协议报文的信息。
  所有debug 命令一旦打开，只有通过no 命令清除该参数，从而终结输出。以下
  debug 命令中不再赘述。Debug 信息和系统错误信息会打印到虚拟终端上，还可以通
  过配置模式将Debug 信息和系统错误信息输出到日志文件中去。

**语法**：

```
debug ldp packet
no debug ldp packet
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令输出从Peer 收到和发向Peer 的协议报文的信息:
Switch# debug ldp packet
2002/06/18 11:43:23 LDP: ldp_message_hello_send: Dump of outgoing packet
2002/06/18 11:43:23 LDP:
2002/06/18 11:43:23 LDP: PDU Version: 1
2002/06/18 11:43:23 LDP: PDU Length: 22
2002/06/18 11:43:23 LDP: LDP Identifier: 10.10.0.11:0
2002/06/18 11:43:23 LDP:

2002/06/18 11:43:23 LDP: Message U bit: 0
2002/06/18 11:43:23 LDP: Message Type: Hello Message
2002/06/18 11:43:23 LDP: Message Length: 12
2002/06/18 11:43:23 LDP: Message ID: 0x1a9
2002/06/18 11:43:23 LDP:
2002/06/18 11:43:23 LDP: TLV U bit: 0
2002/06/18 11:43:23 LDP: TLV F bit: 0
2002/06/18 11:43:23 LDP: TLV Type: Common Hello Parameters TLV
2002/06/18 11:43:23 LDP: TLV length: 4
2002/06/18 11:43:23 LDP: Hold Time: 15
2002/06/18 11:43:23 LDP: Targeted Hello: 0
2002/06/18 11:43:23 LDP: Request Send Targedetail
```

**相关命令**：debug ldp fsm、debug ldp events

### 19.1.15 `debug ldp qos`

**功能**：使用该条指令来输出LDP qos 信息。
  所有debug 命令一旦打开，只有通过no 命令清除该参数，从而终结输出。以下
  debug 命令中不再赘述。Debug 信息和系统错误信息会打印到虚拟终端上，还可以通
  过配置模式将Debug 信息和系统错误信息输出到日志文件中去。

**语法**：

```
debug ldp qos
no debug ldp qos
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令输出LDP Qos 信息:

Switch# debug ldp qos
```

**相关命令**：debug ldp fsm、debug ldp packet

### 19.1.16 `debug ldp tsm`

**功能**：使用该条指令输出主干状态机的信息。
  所有debug 命令一旦打开，只有通过no 命令清除该参数，从而终结输出。以下
  debug 命令中不再赘述。Debug 信息和系统错误信息会打印到虚拟终端上，还可以通
  过配置模式将Debug 信息和系统错误信息输出到日志文件中去。

**语法**：

```
debug ldp tsm
no debug ldp tsm
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令输出主干状态机信息:
Switch# debug ldp tsm
```

**相关命令**：debug ldp fsm、debug ldp packet

### 19.1.17 `debug ldp vc`

**功能**：使用该条指令输出二层VPN 的处理信息。
  所有debug 命令一旦打开，只有通过no 命令清除该参数，从而终结输出。以下
  debug 命令中不再赘述。Debug 信息和系统错误信息会打印到虚拟终端上，还可以通
  过配置模式将Debug 信息和系统错误信息输出到日志文件中去。

**语法**：

```
debug ldp vc ( dsm | usm | events )
no debug ldp vc ( dsm | usm | events )
```

| 参数 | 说明 |
| --- | --- |
| dsm | 下游状态机 |
| usm | 上游状态机 |
| events | VC 事件 |

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该指令输出二层VPN 的处理信息:
Switch# debug ldp vc events
```

**相关命令**：debug ldp dsm、debug ldp usm

### 19.1.18 `disable-ldp`

**功能**：使用该条指令在一个指定的接口上禁用LDP。
  在指定端口上配置了该条指令后，LDP hello 报文将无法从该接口发出，与该接口相关
  的邻接和LDP 会话都将被清除。

**语法**：

```
disable-ldp
```

**命令模式**：端口配置模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令在一个指定的接口上禁用LDP:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# disable-ldp
```

**相关命令**：无

### 19.1.19 `enable-ldp`

**功能**：使用该条指令在指定的接口上使能LDP。

**语法**：

```
enable-ldp
```

**命令模式**：端口配置模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令在一个指定的接口上使能LDP:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# enable-ldp
```

**相关命令**：无

### 19.1.20 `explicit-null`

**功能**：使用该条指令来配置路由器将向直连路由器分发显示空标签。使用no 参数清除该条指
  令后，路由器将向直连路由器分发隐式空标签，默认情况下将会分发隐式空标签。
  在MPLS/BGP 的VPN 环境中，建议使用no 参数阻止LDP 分发显示空标签。

**语法**：

```
explicit-null
no explicit-null
```

**命令模式**：路由模式

**默认配置**：发送隐式空标签。

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令来配置路由器将向直连路由器分发显示空标签:
Switch# configure terminal
Switch(config)# router ldp
Switch(config-router)# explicit-null
```

**相关命令**：show ldp FEC

### 19.1.21 `hello-interval`

**功能**：使用该条指令来设置全局的Hello 报文的发送间隔，使用no 参数来回复默认发送间隔。

**语法**：

```
hello-interval INTERVAL
no hello-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | hello 报文的发送间隔，以秒为单位 1-21845 |

**命令模式**：路由模式

**默认配置**：默认为5 秒。

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令来设置全局的Hello 报文的发送间隔:

Switch# configure terminal
Switch(config)# router ldp
Switch(config-router)# hello-interval 35
```

**相关命令**：hold-time、ldp hello-interval、ldp hold-time

### 19.1.22 `hold-time`

**功能**：使用该条指令可以配置全局的LSR 邻接的老化时间，每次收到hello 报文将重新更新计
  时器，使用no 参数来回复默认时间。

**语法**：

```
hold-time TIME
no hold-time
```

| 参数 | 说明 |
| --- | --- |
| TIME | 邻接的老化时间，以秒为单位 3-65535 |

**命令模式**：路由模式

**默认配置**：默认为15 秒。

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令来设置全局的LDP 邻接的老化时间:
Switch# configure terminal
Switch(config)# router ldp
Switch(config-router)# hold-time 635
```

**相关命令**：hello-interval、ldp hello-interval、ldp hold-time

### 19.1.23 `keepalive-interval`

**功能**：使用该条指令来设置全局的Keep-alive 报文的发送间隔，使用no 参数来回复默认值。

**语法**：

```
keepalive-interval INTERVAL
no keepalive-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | Keep-alive 报文的发送间隔，以秒为单位 10-21845 |

**命令模式**：路由模式

**默认配置**：默认为10 秒。

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令来设置全局的keepalive 邻接的发送间隔时间:
Switch# configure terminal
Switch(config)# router ldp
Switch(config-router)# keepalive-interval 635
```

**相关命令**：keepalive-timeout、ldp keepalive-interval、、ldp keepalive-timeout

### 19.1.24 `keepalive-timeout`

**功能**：使用该条指令来设置全局的LDP 会话的老化时间，使用no 参数来恢复默认配置。

**语法**：

```
keepalive-timeout TIME
no keepalive-timeout
```

| 参数 | 说明 |
| --- | --- |
| TIME | 全局LDP 会话的老化时间，以秒为单位 30-65535 |

**命令模式**：路由模式

**默认配置**：默认为30 秒。

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令来设置全局的会话的老化时间:
Switch# configure terminal
Switch(config)# router ldp
Switch(config-router)# keepalive-timeout 635
```

**相关命令**：keepalive-timeout、ldp keepalive-interval、ldp keepalive-timeout

### 19.1.25 `ldp hello-interval`

**功能**：使用该条指令来设置指定接口上Hello 报文的广播间隔，使用no 参数可以将间隔恢复
  成全局设置的hello 报文发送间隔。

**语法**：

```
ldp hello-interval TIME
no ldp hello-interval
```

| 参数 | 说明 |
| --- | --- |
| TIME | hello 报文的发送间隔，以秒为单位 1-21845 |

**命令模式**：端口配置模式

**默认配置**：默认依赖于全局hello 报文发送间隔，为5 秒。

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令来设置指定接口上Hello 报文的发送间隔:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ldp hello-interval 635
```

**相关命令**：hello-interval、hold-time、ldp hold-time

### 19.1.26 `ldp hold-time`

**功能**：使用该条指令来设置指定接口上邻接的老化时间，使用no 参数可以将间隔恢复成全局
  设置的邻接老化时间。

**语法**：

```
ldp hold-time TIME
no ldp hold-time
```

| 参数 | 说明 |
| --- | --- |
| TIME | 邻接的老化时间，以秒为单位 3-65535 |

**命令模式**：端口配置模式

**默认配置**：默认依赖与全局的邻接老化时间，默认为15 秒。

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令来设置指定接口上的邻接老化时间:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ldp hold-time 635
```

**相关命令**：hello-interval、hold-time、ldp hello-interval

### 19.1.27 `ldp keepalive-interval`

**功能**：使用该条指令来设置指定接口上的Keepalive 报文的发送间隔，使用no 参数来恢复成
  全局的Keepalive 报文发送间隔。

**语法**：

```
ldp keepalive-interval INTERVAL
no ldp keepalive-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | Keep-alive 报文的发送间隔，以秒为单位 10-21845 |

**命令模式**：端口配置模式

**默认配置**：默认依赖于全局的keepalive 发送间隔时间，默认为10 秒

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令来设置指定接口上的Keepalive 的发送间隔:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ldp keepalive-interval 635
```

**相关命令**：ldp keepalive-timeout

### 19.1.28 `ldp keepalive-timeout`

**功能**：使用该条指令来设置指定接口上的LDP 会话老化时间，使用no 参数恢复为全局的LDP
  会话老化时间。

**语法**：

```
ldp keepalive-timeout TIME
no ldp keepalive-timeout
```

| 参数 | 说明 |
| --- | --- |
| TIME | LDP 会话的老化时间，以秒为单位 30-65535 |

**命令模式**：端口配置模式

**默认配置**：默认依赖与全局的LDP 会话老化时间，为30 秒。

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令来设置指定接口上的LDP 会话的老化时间:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ldp keepalive-timeout 635
```

**相关命令**：ldp keepalive-interval

### 19.1.29 `ldp multicast-hellos`

**功能**：使用该命令来使能组播Hello 报文功能，使用no 参数关闭组播Hello 报文功能。

**语法**：

```
ldp multicast-hellos
no ldp multicast-hellos
```

**命令模式**：端口配置模式

**默认配置**：默认关闭

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令来来使能组播Hello 报文功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ldp multicast-hellos
```

**相关命令**：multicast-hellos

### 19.1.30 `ldp targeted-peer-hello-interval`

**功能**：使用该条指令来设定targeted-peer 的单播Hello 报文的发送时间间隔，使用no 参数
  恢复成默认值。

**语法**：

```
ldp targeted-peer-hello-interval INTERVAL
no ldp targeted-peer-hello-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | targeted-peer 的单播Hello 报文的发送时间间隔，以秒为单位 1-21845 |

**命令模式**：端口配置模式

**默认配置**：默认为15 秒

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令来设置targeted-peer 的单播Hello 报文的发送时间间
隔:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ldp targeted-peer-hello-interval 635
```

**相关命令**：show ldp interface IFNAME、targeted-peer-hello-interval

### 19.1.31 `ldp targeted-peer-hold-time`

**功能**：使用该条指令来设置targeted-peer 的邻接老化时间，使用no 参数可以恢复成默认值。

**语法**：

```
ldp targeted-peer-hold-time TIME
no ldp targeted-peer-hold-time
```

| 参数 | 说明 |
| --- | --- |
| TIME | targeted-peer 的邻接老化时间，，以秒为单位 3-65535 |

**命令模式**：端口配置模式

**默认配置**：默认时间为45 秒。

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令来设置targeted-peer 的邻接的老化时间:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# ldp targeted-peer-hold-time 635
```

**相关命令**：show ldp interface IFNAME、targeted-peer-hold-time

### 19.1.32 `router ldp`

**功能**：使用该条指令来进入LDP 视图，并启动LDP 进程，不运行这条指令LSR 不进行任何
  LDP 的操作，例如发送hello 报文。

**语法**：

```
router ldp
```

**命令模式**：全局配置模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何使用该条指令启动LDP 进程:
Switch# configure router
Switch(config)# router ldp
Switch(config-router)#
```

**相关命令**：无

### 19.1.33 `router-id`

**功能**：使用该条指令将一条路由器上的loopback 地址设置为router-id，路由器使用这个地址
  生成LDP-ID。
  使用no 参数将清除配置，LDP 会重新自动选择一个可用的IP 地址作为router-id。

**语法**：

```
router-id IP_ADDR
no router-id
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 新的IP 地址作为router-id IPv4 地址 |

**命令模式**：路由模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何配置LDP-ID:
Switch# configure router
Switch(config)# router ldp
Switch(config-router)# router-id 123.123.123.8
```

**相关命令**：无

### 19.1.34 `show debugging ldp`

**功能**：使用该条指令可以显示打开了哪些LDP 调试功能。

**语法**：

```
show debugging ldp
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示打开了哪些LDP 调试功能:
Switch# show debugging ldp
LDP debugging status:
LDP event debugging is on
LDP packet debugging is on
LDP finite state machine debugging is on
LDP pdu hexdump debugging is on
LDP downstream state machine debugging is on
LDP upstream state machine debugging is on
LDP trunk state machine debugging is on
LDP QoS debugging is on
LDP CSPF debugging is on
LDP VC USM debugging is on
LDP VC DSM debugging is on
LDP NSM debugging is on
LDP Advertise-labels debugging is on
```

**相关命令**：无

### 19.1.35 `show ldp`

**功能**：使用该条指令来显示当前路由器的基本LDP 属性。

**语法**：

```
show ldp
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示当前路由器的基本LDP 属性:
Switch# show ldp
Router ID : 10.10.0.11
LDP Version : 1
Global Merge Capability : N/A
Label Advertisement Mode : Downstream Unsolicited
Label Retention Mode : Liberal
Label Control Mode : Independent
Loop Detection : Off
Loop Detection Count : 0
Request Retry : Off
Propagate Release : Disabled
Hello Interval : 5
Targeted Hello Interval : 15
Hold time : 15
Targeted Hold time : 45
Keepalive Interval : 10
Keepalive Timeout : 30
Request retry Timeout : 5
Targeted Hello Receipt : Disabled
Transport Address : N/A
Transport Interface : N/A
Import BGP routes : No
```

**相关命令**：无

### 19.1.36 `show ldp adjacency`

**功能**：使用该条指令来显示当前路由器的所有邻接属性。

**语法**：

```
show ldp adjacency
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示当当前路由器的所有邻接属性:
Switch# show ldp adjacency
IP Address Interface Name Holdtime LDP ID
192.168.3.5 eth1 15 10.10.0.18:0
192.168.4.5 eth2 15 10.10.0.18:0
```

**相关命令**：无

### 19.1.37 `show ldp advertise-labels`

**功能**：使用该命令来显示LDP 为哪些IP 地址分发标签。

**语法**：

```
show ldp advertise-labels
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示LDP 为哪些IP 地址分发标签:
Switch# show ldp advertise-labels
Advertisement spec:
Prefix acl = pfx1; Peer acl = pfx1
Prevent the distribution of any assigned labels
```

**相关命令**：无

### 19.1.38 `show ldp downstream`

**功能**：使用该条指令来显示下游LDP 会话的状态和标签分发的信息。

**语法**：

```
show ldp downstream
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示下游LDP 会话的状态和标签分发的信息:
Switch# show ldp downstream
Session peer 192.168.11.50:
Downstream state: Established Label: impl-null RequestID: 0 Peer:
192.168.11.50 Attr:
Downstream state: Established Label: impl-null RequestID: 0 Peer: 192.168.11.50
Attr:
Downstream state: Established Label: impl-null RequestID: 0 Peer: 192.168.11.50

Attr:
Downstream state: Established Label: 20 RequestID: 0 Peer: 192.168.11.50 Attr:
Session peer 192.168.13.60:
Downstream state: Established Label: impl-null RequestID: 0 Peer: 192.168.13.60
Attr:
Downstream state: Established Label: 16 RequestID: 0 Peer: 192.168.13.60 Attr:
Downstream state: Established Label: 17 RequestID: 0 Peer: 192.168.13.60 Attr:
Downstream state: Established Label: impl-null RequestID: 0 Peer: 192.168.13.60
Attr:
Downstream state: Established Label: 18 RequestID: 0 Peer: 192.168.13.60 Attr:
Downstream state: Established Label: impl-null RequestID: 0 Peer: 192.168.13.60
Attr:
Downstream state: Established Label: 19 RequestID: 0 Peer: 192.168.13.60 Attr: --
More--
Downstream state: Established Label: 20 RequestID: 0 Peer: 192.168.13.60 Attr:
```

**相关命令**：无

### 19.1.39 `show ldp fec`

**功能**：使用该条指令来显示当前路由器上所有的转发等价类信息。

**语法**：

```
show ldp fec ( host | prefix | )
```

| 参数 | 说明 |
| --- | --- |
| host | 主机路由 |
| prefix | 非主机路由 |

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示当前路由器上所有的转发等价类信息:
Switch# show ldp fec
LSR codes : E/N - LSR is egress/non-egress for this FEC,
L - LSR received a label for this FEC,
> - LSR will use this route for the FEC
Code FEC Session Out Label Nexthop Addr
E > 10.10.0.0/24 non-existent none connected
NL 10.10.0.0/24 192.168.3.5 impl-null connected
E > 192.168.3.0/24 non-existent none connected
NL 192.168.3.0/24 192.168.3.5 impl-null connected
E > 192.168.4.0/24 non-existent none connected
NL 192.168.4.0/24 192.168.3.5 impl-null connected
NL 192.168.5.0/24 192.168.3.5 impl-null invalid
```

**相关命令**：无

### 19.1.40 `show ldp interface`

**功能**：使用该条指令来显示LDP 接口上的详细信息，可以通过参数来显示指定的LDP 接口。

**语法**：

```
show ldp interface ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称，格式如下：eth- 0-1, agg1, vlan1, 等支持 |
| physical/aggregation/loopb | ack/vlan/tunnel 端口 |

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示LDP 接口上的详细信息:
Switch# show ldp interface eth-0-1
Status : Enabled
Primary IP Address : 192.168.3.4
Interface Type : Ethernet
Label Merge Capability : Merge Capable
Hello Interval : 5
Targeted Hello Interval : 15
Hold Time : 15
Targeted Hold Time : 45
Keepalive Interval : 10
Keepalive Timeout : 30
Advertisement Mode : Downstream On Demand
Label Retention Mode : Liberal
Administrative Groups : Cen1: Cen2
```

**相关命令**：无

### 19.1.41 `show ldp lsp`

**功能**：使用该条指令来显示LDP 的路径信息。

**语法**：

```
show ldp lsp
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示LDP 的路径信息:

Switch# show ldp lsp
Advertisement spec:
Prefix acl = pfx1; Peer acl = pfx1
Prevent the distribution of any assigned labels
FEC IPV4:1.1.1.0/30 -> 0.0.0.0
Downstream state: Established Label: impl-null RequestID: 0 Peer: 50.50.50.50 Attr:
Advert acl(s): Prevent the distribution of any assigned labels
FEC IPV4:3.3.3.0/30 -> 0.0.0.0
Advert acl(s): Prevent the distribution of any assigned labels
FEC IPV4:10.30.0.0/24 -> 0.0.0.0
Downstream state: Established Label: impl-null RequestID: 0 Peer: 50.50.50.50 Attr:
Advert acl(s): Prevent the distribution of any assigned labels
FEC IPV4:50.50.50.50/32 -> 1.1.1.1
Advert acl(s): Prefix acl = pfx1; Peer acl = pfx1
FEC IPV4:55.55.55.55/32 -> 3.3.3.2
Advert acl(s): Prevent the distribution of any assigned labels
FEC IPV4:169.254.0.0/16 -> 0.0.0.0
Downstream state: Established Label: impl-null RequestID: 0 Peer: 50.50.50.50 Attr:
Advert acl(s): Prevent the distribution of any assigned labels
```

**相关命令**：show ldp lsp host、show ldp lsp prefix、show ldp lsp cr-lsp

### 19.1.42 `show ldp mpls-l2-circuit`

**功能**：使用该条指令来显示VPWS 的相关信息。

**语法**：

```
show ldp mpls-l2-circuit ( detail | Virtual_Circuit_ID | )
```

| 参数 | 说明 |
| --- | --- |
| detail | 显示详细信息 |
| Virtual_Circuit_ID | VPWS 的标志 1-4294967295 |

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示VPWS 的相关信息:
Switch# show ldp mpls-l2-circuit
Transport  Client     VC     Trans    Local       Remote      Destination
VC ID      Binding    State  Type     VC Label    VC Label    Address
200        eth-0-2    UP     Ethernet      32768       32768       192.168.11.10
```

**相关命令**：无

### 19.1.43 `show ldp session`

**功能**：使用该条指令来显示当前路由器与其他路由器上建立的LDP 会话信息。

**语法**：

```
show ldp session ( IP_ADDR | )
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 对端的IP 地址 IPv4 地址 |

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示LDP 会话的相关信息:
Switch# show ldp session
Peer IP Address IF Name My Role State KeepAlive
192.168.11.50 eth1 Passive OPERATIONAL 30

192.168.13.60 eth2 Passive OPERATIONAL 30
In the following example, the show ldp session command is used to display sessions
established between the current LSR and other LSRs:
Switch# show ldp session 192.168.3.5
Session state : OPERATIONAL
Session role : Passive
TCP Connection : Established
IP Address for TCP : 192.168.3.5
Interface being used : eth1
Peer LDP ID : 10.10.0.18:0
Adjacencies : 192.168.3.5
192.168.4.5
Advertisement mode : Downstream Unsolicited
Label retention mode : Liberal
Keepalive Timeout : 30
Reconnect Interval : 15
Address List received : 192.168.3.5
192.168.4.5
Received Labels : Fec Label Maps To
IPV4:10.10.0.0/24 impl-null none
IPV4:192.168.3.0/24 impl-null none
IPV4:192.168.4.0/24 impl-null none
IPV4:192.168.5.0/24 impl-null none
Sent Labels : Fec Label Maps To
IPV4:10.10.0.0/24 impl-null none
IPV4:192.168.3.0/24 impl-null none
IPV4:192.168.4.0/24 impl-null none
下面例子讲述使用show ldp session 命令显示当前session 建立的LSR 和其他的LSR 信
息:
Switch# show ldp session 192.168.3.5
Session state : OPERATIONAL
Session role : Passive
TCP Connection : Established
IP Address for TCP : 192.168.3.5
Interface being used : eth1
Peer LDP ID : 10.10.0.18:0
Adjacencies : 192.168.3.5
192.168.4.5
Advertisement mode : Downstream Unsolicited
Label retention mode : Liberal
Keepalive Timeout : 30
Reconnect Interval : 15
Address List received : 192.168.3.5
192.168.4.5
Received Labels : Fec Label Maps To
IPV4:10.10.0.0/24 impl-null none
IPV4:192.168.3.0/24 impl-null none
IPV4:192.168.4.0/24 impl-null none
IPV4:192.168.5.0/24 impl-null none
Sent Labels : Fec Label Maps To
IPV4:10.10.0.0/24 impl-null none
IPV4:192.168.3.0/24 impl-null none
IPV4:192.168.4.0/24 impl-null none
```

**相关命令**：无

### 19.1.44 `show ldp statistics`

**功能**：使用该条命令来显示LDP 协议报文的统计信息。

**语法**：

```
show ldp statistics ( advertise-labels | )
```

| 参数 | 说明 |
| --- | --- |
| advertise-labels | 每个advertisement 列表的过滤操作统计值 |

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示LDP 协议报文的统计信息:
Switch# show ldp statistics
PacketType Total
Sent Received
Notification 0 0
Hello 3980 0
Initialization 1 1
Keepalive 1932 1932
Address 1 1
Address Withdraw 0 0
Label Mapping 7 7
Label Request 0 0
Label Withdraw 1 0
Label Release 0 1
Request About 0 0
In the following example, the show ldp statistics command is used to display LDP

packet statistics:
Switch# show ldp statistics advertise-labels
Advertisement spec:
Prefix acl = pfx1; Peer acl = pfx1
Deny : Label Mapping = 2
Label Request = 0
Prevent the distribution of any assigned labels
Deny : Label Mapping = 9
Label Request = 3

Switch# show ldp statistics advertise-labels
Advertisement spec:
Prefix acl = pfx1; Peer acl = pfx1
Deny : Label Mapping = 2
Label Request = 0
Prevent the distribution of any assigned labels
Deny : Label Mapping = 9
Label Request = 3
```

**相关命令**：clear ldp statistics advertise-labels

### 19.1.45 `show ldp targeted-peers`

**功能**：使用该条命令来显示targeted-peer 的详细信息。

**语法**：

```
show ldp targeted-peers
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示targeted-peer 的详细信息:

Switch#  show ldp targeted-peers
IP Address          Interface
1.1.1.3             eth-0-9
```

**相关命令**：无

### 19.1.46 `show ldp upstream`

**功能**：使用该条命令来显示上游LDP 会话的信息和标签交换的信息。

**语法**：

```
show ldp upstream
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示上游LDP 会话的信息和标签交换的信息:
Switch# show ldp targeted-peers
IP Address          Interface
1.1.1.3             eth-0-9
```

**相关命令**：无

### 19.1.47 `show memory ldp`

**功能**：使用该条指令来显示LDP 使用的内存信息。

**语法**：

```
show memory ldp
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示LDP 使用的内存信息:
Switch# show ldp upstream
Session peer 192.168.11.50:
Upstream state: Established Label: impl-null RequestID: 0 Peer: 192.168.11.50 Attr:
Upstream state: Established Label: impl-null RequestID: 0 Peer: 192.168.11.50 Attr:
Upstream state: Established Label: impl-null RequestID: 0 Peer: 192.168.11.50 Attr:
Session peer 192.168.13.60:
Upstream state: Established Label: impl-null RequestID: 0 Peer: 192.168.13.60 Attr:
None
Upstream state: Established Label: impl-null RequestID: 0 Peer: 192.168.13.60 Attr:
None
Upstream state: Established Label: impl-null RequestID: 0 Peer: 192.168.13.60 Attr:
None
Upstream state: Established Label: 16 RequestID: 0 Peer: 192.168.13.60 Attr: None
Upstream state: Established Label: 17 RequestID: 0 Peer: 192.168.13.60 Attr: None
Upstream state: Established Label: impl-null RequestID: 0 Peer: 192.168.13.60 Attr:
None
Upstream state: Established Label: 18 RequestID: 0 Peer: 192.168.13.60 Attr: None
Upstream state: Established Label: 19 RequestID: 0 Peer: 192.168.13.60 Attr: N --Mo
```

**相关命令**：无

### 19.1.48 `targeted-peer`

**功能**：使用该条指令来指定或者删除targeted-peer 的IP 地址。

**语法**：

```
targeted-peer IP_ADDR
no targeted-peer IP_ADDR
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | targeted-peer 的IP 地址 IPv4 地址 |

**命令模式**：路由模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何targeted-peer 的IP 地址:
Switch# configure terminal
Switch(config)# router ldp
Switch(config-router)# targeted-peer 10.10.10.10
```

**相关命令**：无

### 19.1.49 `targeted-peer-hello-interval`

**功能**：使用该条指令来配置targeted-peer 的hello 报文发送间隔时间，使用no 参数可以恢复
  为默认值。

**语法**：

```
targeted-peer-hello-interval INTERVAL
no targeted-peer-hello-interval
```

| 参数 | 说明 |
| --- | --- |
| INTERVAL | 间隔时间的设置值，以秒为1-21845 单位 |

**命令模式**：路由模式

**默认配置**：默认值为15 秒。

**使用说明**：

无

**示例**：

```
下面例子讲述如何指定targeted-peer 的hello 报文发送间隔时间:
Switch# configure terminal
Switch(config)# router ldp
Switch(config-router)# targeted-peer-hello-interval 100
```

**相关命令**：show ldp、targeted-peer-hello-interval

### 19.1.50 `targeted-peer-hello-receipt`

**功能**：使用命令打开targeted-peer 学习功能，将收到对端Hello 报文的源IP 地址做为
  targeted-peer。

**语法**：

```
targeted-peer-hello-receipt
no targeted-peer-hello-receipt
```

**命令模式**：路由模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何打开targeted-peer 学习功能:
Switch# configure router
Switch(config)# router ldp
Switch(config-router)# targeted-peer-hello-receipt
```

**相关命令**：无

### 19.1.51 `targeted-peer-hold-time`

**功能**：使用该条指令来配置targeted-peer 的老化时间，使用no 参数来回复为默认时间。

**语法**：

```
targeted-peer-hold-time TIME
no targeted-peer-hold-time
```

| 参数 | 说明 |
| --- | --- |
| TIME | targeted-peer 的老化时间，以秒为单位 3-65535 |

**命令模式**：路由模式

**默认配置**：默认为45 秒。

**使用说明**：

无

**示例**：

```
下面例子讲述如何配置targeted-peer 的老化时间:

Switch# configure terminal
Switch(config)# router ldp
Switch(config-router)# targeted-peer-hold-time 100
```

**相关命令**：show ldp、ldp targeted-peer-hold-time

### 19.1.52 `transport-address`

**功能**：使用该条指令来显示配置LDP 的传输地址，使用no 参数可以清除显示配置，LDP 将会
  自动选择一个可用的IP 地址作为传输地址。

**语法**：

```
transport-address IP_ADDR
no transport-address
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 只能为Loopback 的IP 地址 IPv4 地址 |

**命令模式**：路由模式

**默认配置**：默认将会优先选择Loopback 地址，如果不存在Loopback 地址，将选择一个可以用的 接口地址，建议配Loopback 地址。

**使用说明**：

无

**示例**：

```
下面例子讲述如何配置LDP 的传输地址:
Switch# configure router
Switch(config)# router ldp
Switch(config-router)# transport-address 10.10.0.5
```

**相关命令**：无

### 19.1.53 `show ldp igp sync`

**功能**：使用该命令可以显示使能ldp igp 同步功能的接口信息

**语法**：

```
show ldp igp sync
```

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面的例子讲述了如何显示使能了ldp igp 同步功能的接口信息:
Switch# show ldp igp sync
eth-0-9 is up, line protocol is up
  LDP configured; LDP-IGP Synchronization enabled.
  Session IP Address : 2.2.2.2
    Sync status: Achieved
    Delay timer: Configured, 60 seconds, Not Running
```

**相关命令**：无

### 19.1.54 `show ldp vpls`

**功能**：使用该条指令可以显示所有的LDP VPLS 信息，指定VPLS ID 可以显示该VPLS 的信息。

**语法**：

```
show ldp vpls ( detail | VPLS_ID | )
```

| 参数 | 说明 |
| --- | --- |
| detail | 显示详细信息 |
| VPLS_ID | VPLS 标志 1-4294967295 |

**命令模式**：特权模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面例子讲述如何显示所有的LDP VPLS 信息:
Switch# show ldp vpls
VPLS-ID Peer Address State Type Label-Sent Label-Rcvd
1 192.168.0.80 Up vpls 16 640
1 192.168.0.90 Up vpls 18 642
2 192.168.0.80 Up vpls 19 641
2 192.168.0.90 Up vpls 17 643
```

**相关命令**：无

### 19.1.55 `label distribution default-route`

**功能**：使用该命令使能ldp 为默认路由分发label 以及生成表项

**语法**：

```
label distribution default-route
no label distribution default-route
```

**命令模式**：路由模式

**默认配置**：默认无配置

**使用说明**：

无

**示例**：

```
下面的例子讲述了如何使能ldp 为默认路由分发标签并生成转发表项:
Switch(config-router)# label distribution default-route
```

**相关命令**：无、19.2 MPLS 命令


## 19.2 MPLS 命令

### 19.2.1 `mpls enable-all-interfaces`

**功能**：使用该条命令在所有的三层接口上使能标签转发功能。.

**语法**：

```
mpls enable-all-interfaces
mpls disable-all-interfaces
```

**命令模式**：全局配置模式

**默认配置**：默认关闭标签转发功能。

**使用说明**：

无

**示例**：

```
根据以下例子，配置mpls disable-all-interface 关闭所有三层接口上的标签转发功能:
Switch# configure terminal
Switch(config)# mpls disable-all-interfaces
```

**相关命令**：无

### 19.2.2 `label-switching`

**功能**：使用该命令在三层接口上使能标签转发功能：

**语法**：

```
label-switching
no label-switching
```

**命令模式**：端口配置模式

**默认配置**：默认关闭标签转发功能。

**使用说明**：

无

**示例**：

```
根据以下例子, 在eth-0-1 上配置label-swithing 命令使能标签转发功能:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# label-switching
```

**相关命令**：无

### 19.2.3 `show mpls interface`

**功能**：使用该命令来显示使能标签转发功能接口的相关信息：

**语法**：

```
show mpls interface ( IFNAME | )
```

| 参数 | 说明 |
| --- | --- |
| IFNAME | 接口名称，格式如下：eth- 0-1, agg1, vlan1, 等支持 |
| physical/aggregation/vlan | 端口 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
根据以下例子, 使用show mpls interface 来显示使能标签转发功能接口的相关信息:
Switch# show mpls interface eth-0-9
Interface eth-0-9
  Label switching is enabled with label-space 0
   minimum label value configured is 16
   maximum label value configured is 4095
  In-labels used:0, Out-labels used:0
```

**相关命令**：无

### 19.2.4 `mpls lsp-model`

**功能**：使用该命令来全局配置MPLS LSP 网络的模型

**语法**：

```
mpls lsp-model ( uniform | pipe ( exp EXP | ) | short-pipe ( exp EXP | ) ) ( domain
DOMAINID | )
no mpls lsp-model
```

| 参数 | 说明 |
| --- | --- |
| uniform | Uniform 模式 |
| pipe | Pipe 模式 |
| short-pipe | Short-pipe 模式 |
| EXP | EXP 值 0-7 |
| DOMIANID |  |
| Domain ID | 0-15 |

**命令模式**：全局配置模式

**默认配置**：Uniform 模式

**使用说明**：

无

**示例**：

```
配置MPLS QoS 全局模式:
Switch# configure terminal
Switch(config)# mpls lsp-model short-pipe exp 7 domain 1
```

**相关命令**：无

### 19.2.5 `mpls ilm-entry`

**功能**：使用该条命令来配置ILM 表项。

**语法**：

```
mpls ilm-entry swap INLABEL IP_ADDR OUTLABEL
mpls ilm-entry php INLABEL IP_ADDR
mpls ilm-entry pop INLABEL
no mpls ilm-entry INLABEL
```

| 参数 | 说明 |
| --- | --- |
| INLABEL | 入标签 16-1048575 |
| IP_ADDR | 下一跳的IP 地址 IPv4 地址 |
| OUTLABEL | 出标签 0(显示空标签),3(隐式空标签),16-1048575 |

**命令模式**：全局配置模式

**默认配置**：无默认配置

**使用说明**：

无

**示例**：

```
根据以下例子，使用该条命令来配置ILM 表项:
Switch# configure terminal
Switch(config)# mpls ilm-entry swap 100 12.12.12.2 200
Switch(config)# mpls ilm-entry php 101 12.12.12.20
Switch(config)# mpls ilm-entry pop 102
```

**相关命令**：无

### 19.2.6 `mpls mtu`

**功能**：使用该命令来配置mpls 的mtu

**语法**：

```
mpls mtu MTU-VALUE
no mpls mtu
```

| 参数 | 说明 |
| --- | --- |
| MTU-VALUE | MTU 值 16-1048575 |

**命令模式**：端口配置模式

**默认配置**：无默认配置

**使用说明**：

无

**示例**：

```
根据以下例子，使用该条命令来配置mpls mtu:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# mpls mtu 1600
```

**相关命令**：mtu

### 19.2.7 `show mpls ilm-database`

**功能**：使用该命令来显示所有ILM 表项，包括用于保护的的ILM 表项。

**语法**：

```
show mpls ilm-database
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
根据以下例子，使用该命令来显示所有ILM 表项，包括用于保护的的ILM 表项:
Switch# show mpls ilm-database
Codes: > - selected ILM, p - stale ILM, B - BGP ILM, K - CLI ILM,
       L - LDP ILM, R - RSVP-TE ILM, S - SNMP ILM, I - IGP-Shortcut,
       U - unknown ILM
Code     FEC               I/O Label            Nexthop         Out-Intf
L>       5.5.5.0/24       1024/3               3.3.3.2         eth-0-17
```

**相关命令**：show mpls ilm-forwarding

### 19.2.8 `show mpls ilm-forwarding`

**功能**：使用该命令来显示所有正在使用的ILM 表项。

**语法**：

```
show mpls ilm-forwarding
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
根据以下例子，使用该命令来显示所有正在使用的ILM 表项:
Switch# show mpls ilm-forwarding
FEC                I/O Label            Nexthop         Out-Intf
5.5.5.0/24         1024/3               3.3.3.2         eth-0-17
```

**相关命令**：show mpls ilm-database

### 19.2.9 `mpls ftn-entry`

**功能**：使用该命令来静态配置FTN 表项。

**语法**：

```
mpls ftn-entry ( IP_ADDR IP_ADDR_MASK | IP_ADDR/IP_MASK_LEN ) OUTLABEL
NEXTHOP
no mpls ftn-entry ( IP_ADDR IP_ADDR_MASK | IP_ADDR/IP_MASK_LEN ) NEXTHOP
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | FEC 的IP 地址 IPv4 地址 |
| IP_ADDR_MASK | FEC 的IP 地址掩码 IPv4 地址 |
| IP_MASK_LEN | FEC 的IP 地址掩码长度 1-32 |
| OUTLABEL | 出标签 0(显示空标签),3(隐式空标签),16-1048575 |
| NEXTHOP | 下一跳的IP 地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：无默认配置

**使用说明**：

无

**示例**：

```
根据以下例子，使用该命令来静态配置FTN 表项:
Switch# configure terminal
Switch(config)# mpls ftn-entry 200.200.200.0/24 200 12.12.12.2
```

**相关命令**：无

### 19.2.10 `show mpls ftn-database`

**功能**：使用该命令来显示FTN 的信息，包括用于保护的FTN。

**语法**：

```
show mpls ftn-database
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
根据以下例子，使用该命令来显示FTN 的信息，包括用于保护的FTN:
Switch# show mpls ftn-database
Codes: > - selected FTN, p - stale FTN, B - BGP FTN, K - CLI FTN,
       L - LDP FTN, R - RSVP-TE FTN, S - SNMP FTN, I - IGP-Shortcut,
       U - unknown FTN
Code    FEC                 Out-Label    Nexthop          Out-Intf
K       19.1.1.0/24         0            172.10.1.2       -
```

**相关命令**：无

### 19.2.11 `show mpls ftn-forwarding`

**功能**：使用该命令来显示所有正在工作FTN 的信息。

**语法**：

```
show mpls ftn-forwarding
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
根据以下例子，使用该命令来显示所有正在工作FTN 的信息:
Switch# show mpls ftn-forwarding
FEC                 Out-Label    Nexthop          Out-Intf
3.3.3.0/24          3            2.2.2.2          eth-0-9
5.5.5.0/24          1024         2.2.2.2         eth-0-9
```

**相关命令**：show mpls ftn-database

### 19.2.12 `mpls lsp-tunneling`

**功能**：使用该条命令来静态配置一条LSP 通道。

**语法**：

```
mpls lsp-tunneling INLABEL OUTLABEL IP_ADDR/IP_MASK_LEN
no mpls lsp-tunneling INLABEL
```

| 参数 | 说明 |
| --- | --- |
| INLABEL | 入标签 16-1048575 |
| IP_ADDR | FEC 的IP 地址 IPv4 地址 |
| IP_MASK_LEN | FEC 的IP 地址掩码 IPv4 地址 |
| OUTLABEL | 出标签 0(显示空标签),3(隐式空标签),16-1048575 |

**命令模式**：全局配置模式

**默认配置**：无默认配置

**使用说明**：

无

**示例**：

```
根据以下例子，使用该条命令来静态配置一条LSP 通道:
Switch# configure terminal
Switch(config)# mpls lsp-tunneling 100 300 200.200.200.0/24
```

**相关命令**：无

### 19.2.13 `show mpls lsp-tunneling`

**功能**：使用该命令来显示所有的LSP 通道。

**语法**：

```
show mpls lsp-tunneling
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
根据以下例子，使用该命令来显示所有的LSP 通道:
Switch1# show mpls lsp-tunneling
Codes: > - selected ILM
Code    I/O Label         FEC                 Out-Intf
        200/300           5.5.5.0/24          N/A
```

**相关命令**：无

### 19.2.14 `mpls map-route`

**功能**：使用该条命令来将一个FEC 地址映射到一个FTN 上。

**语法**：

```
mpls map-route ( IP_ADDR/IP_MASK_LEN | IP_ADDR IP_ADDR_MASK )
( FEC_IP_ADDR/FEC_IP_MASK_LEN | FEC_IP_ADDR FEC_IP_MASK )
no mpls map-route ( IP_ADDR/IP_MASK_LEN | IP_ADDR IP_ADDR_MASK )
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 需要映射的IP 地址 IPv4 地址 |
| IP_ADDR_MASK | 需要映射的IP 地址的掩码 IPv4 地址 |
| IP_MASK_LEN | 需要映射的IP 地址的掩码长度 1-32 |
| FEC_IP_ADDR | 映射后的FEC IP 地址 IPv4 地址 |
| FEC_IP_MASK | 映射后的FEC IP 地址掩码 IPv4 地址 |
| FEC_IP_MASK_LEN | 映射后的FEC IP 地址掩码长度 1-32 |

**命令模式**：全局配置模式

**默认配置**：无默认配置

**使用说明**：

无

**示例**：

```
根据以下例子，使用该条命令来将一个FEC 地址映射到一个FTN 上:
Switch# configure terminal
Switch(config)# mpls map-route 100.100.100.0/24 200.200.200.0/24
Switch(config)# mpls map-route 101.101.101.0/24 tunnel tun1
```

**相关命令**：mpls ftn-entry (IP_ADDR IP_ADDR_MASK | IP_ADDR/IP_MASK_LEN) OUTLABEL IP_ADDR

### 19.2.15 `show mpls map-routes`

**功能**：使用该条命令来显示Map route 的配置。

**语法**：

```
show mpls mapped-routes
```

**命令模式**：特权模式

**默认配置**：无默认配置

**使用说明**：

无

**示例**：

```
根据以下例子，使用该条命令来显示Map route 的配置:
Switch# show mpls map-routes
Mapped-route        IPv4 FEC
12.12.12.0/24       -
```

**相关命令**：无、19.3 VPLS 命令


## 19.3 VPLS 命令

### 19.3.1 `mpls vpls`

**功能**：使用该命令来创建一个VPLS 实例，并且进入VPLS 视图。如果该实例已经被创建，那
  么可以不输入VPLS ID 直接进入视图。

**语法**：

```
mpls vpls NAME VPLS-ID ( whitelist ) ( ac-vlan-operation )
no mpls vpls NAME
```

| 参数 | 说明 |
| --- | --- |
| NAME | VPLS 名称不超过20 个字符的字符串 |
| VPLS-ID |  |
| VPLS ID | 1-4294967295 |
| whitelist | 白名单功能 |
| ac-vlan-operation | vlan 保留功能 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在接下来的例子里，使用mpls vpls 命令来创建一个VPLS:
Switch# configure terminal
Switch(config)# mpls vpls vpls1 1
Switch(config-vpls)#
```

**相关命令**：无

### 19.3.2 `vpls-description`

**功能**：使用该命令来添加VPLS 描述。

**语法**：

```
vpls-description LINE
no vpls-description
```

| 参数 | 说明 |
| --- | --- |
| LINE | 对于VPLS 的描述信息不超过20 个字符的字符串 |

**命令模式**：VPLS 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在接下来的例子里， 使用vpls-description 命令来对VPLS 进行描述:
Switch# configure terminal
Switch(config)# mpls vpls vpls1 1
Switch(config-vpls)# vpls-description this is a good vpls instance
```

**相关命令**：无

### 19.3.3 `vpls-mtu`

**功能**：使用该命令来配置VPLS 实例的MTU，如果VPLS 使用LDP 创建，那么LDP 会使用该
  MTU 信息与对方进行协商。

**语法**：

```
vpls-mtu MTU
no vpls-mtu
```

| 参数 | 说明 |
| --- | --- |
| MTU | MTU 值 576-65535 |

**命令模式**：VPLS 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在接下来的例子，使用vpls-mtu 命令来设置VPLS 的MTU 值:
Switch# configure terminal
Switch(config)# mpls vpls vpls1 1
Switch(config-vpls)# vpls-mtu 55555
```

**相关命令**：无

### 19.3.4 `vpls-peer`

**功能**：使用该命令来添加一个VPLS PEER，如果使用manual 参数，那么需要静态配置VC 标
  签，否则可以使用LDP 协议来分配标签。

**语法**：

```
vpls-peer IP_ADDR ( raw | tagged ) ( control-word | ) ( manual | ) ( upd | )
no vpls-peer IP_ADDR
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | 对端PEER 的IP 地址 IPv4 地址 |
| raw | 设置PW 属性为Raw 模式 - |
| tagged | 设置PW 属性为Tagged 模式 |
| control-word | 设置PW 携带控制字 |
| manual | 手动配置标签 |
| upe | 面向用户的PE 设备 |

**命令模式**：VPLS 配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，描述了如果配置一个VPLS peer:
Switch# configure terminal
Switch(config)# mpls vpls vpls1 1
Switch(config-vpls)# vpls-peer 100.100.100.1 raw manual
```

**相关命令**：no vpls-peer

### 19.3.5 `vpls-fib-add`

**功能**：使用该命令来为PEER 配置静态的VC 标签，这需要在配置VPLS PEER 的时候指定
  mannul 参数：

**语法**：

```
vpls-fib-add NAME peer IP_ADDR IN-LABLE OUT-LABEL
vpls-fib-delete NAME peer IP_ADDR
```

| 参数 | 说明 |
| --- | --- |
| NAME | VPLS 名称不超过20 个字符的字符串 |
| IP_ADDR | 对端PEER 的IP 地址 IPv4 地址 |
| IN-LABLE | 入标签 16-1048575 |
| OUT-LABEL | 出标签 16-1048575 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，使用vpls-fib-add 命令来配置PEER 的VC 标签:
Switch# configure terminal
Switch(config)# vpls-fib-add vpls1 peer 100.100.100.1 101 102
```

**相关命令**：vpls-fib-delete

### 19.3.6 `mpls-vpls`

**功能**：使用该命令在AC 口上绑VPLS， 支持Ethernet 接入和vlan 接入两种模型：

**语法**：

```
mpls-vpls NAME ( vlan VLANID ( cvlan CVLANID ( bundling | ) | ethernet ) ( etree-leaf | )
( vlan-operation-table VLAN_OP_TBL_NAME | )
no mpls-vpls NAME ( vlan VLANID )
```

| 参数 | 说明 |
| --- | --- |
| NAME | VPLS 名称不超过20 个字符的字符串 |
| VLANID |  |
| Vlan ID | 1-4094 |
| CVLANID |  |
| Customer Vlan ID | 1-4094 |
| bundling | 捆绑模式 |
| ethernet | ethernet 模式 |
| etree-leaf | 叶子AC |
| VLAN_OP_TBL_NAME | vlan operation 表名称不超过16 个字符的字符串 |

**命令模式**：端口配置模式

**默认配置**：使用Vlan 模式绑定VLPS

**使用说明**：

无

**示例**：

```
在接下来的例子里，使用mpls-vpls 来在AC 口上行绑VPLS 实例:
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# mpls-vpls vpls1 vlan 100
```

**相关命令**：无

### 19.3.7 `vpls-mac-learning`

**功能**：使用该命令来使能或者关闭VPLS 的mac 地址学习功能。

**语法**：

```
vpls-mac-learning ( enable | disable )
```

**命令模式**：VPLS 配置模式

**默认配置**：默认使能

**使用说明**：

无

**示例**：

```
在下面的例子里，使用vpls-mac-learning 命令来关闭vpls1 的mac 地址学习功能:
Switch# configure terminal
Switch(config)# mpls vpls vpls1 1
Switch(config-vpls)# vpls-mac-learning disable
```

**相关命令**：无

### 19.3.8 `vpls-mac-limit maximum`

**功能**：使用该命令了设置VPLS 的mac 地址学习限制数目。

**语法**：

```
vpls-mac-limit maximum MAXIMUM
no vpls-mac-limit maximum
```

| 参数 | 说明 |
| --- | --- |
| MAXIMUM | MAC 地址学习的最大值 1-4294967295 |

**命令模式**：VPLS 配置模式

**默认配置**：默认关闭

**使用说明**：

无

**示例**：

```
在下面的例子里，使用vpls-mac-limit 来限制mac 地址学习条目为100 条:
Switch# configure terminal
Switch(config)# mpls vpls vpls1 1
Switch(config-vpls)# vpls-mac-limit maximum 100
```

**相关命令**：无

### 19.3.9 `vpls-mac-limit`

**功能**：使用该命令了设置VPLS 的mac 地址学习限制行为。

**语法**：

```
vpls-mac-limit action ( warn | discard )
no vpls-mac-limit action
```

| 参数 | 说明 |
| --- | --- |
| warn | 当达到最大规格时，丢弃报文，并打印log 信息 |
| discard | 当达到最大规格时，丢弃报文，不打印log 信息 |

**命令模式**：VPLS 配置模式

**默认配置**：默认关闭

**使用说明**：

无

**示例**：

```
在下面的例子里，使用vpls-mac-limit 来设置mac 地址达到规格时的行为为warn:
Switch# configure terminal
Switch(config)# mpls vpls vpls1 1
Switch(config-vpls)# vpls-mac-limit action warn
```

**相关命令**：无

### 19.3.10 `clear mpls vpls mac-addresses`

**功能**：使用该命令来发送MAC 地址撤销信令给其他PE 设置。

**语法**：

```
clear mpls vpls NAME mac-addresses
```

| 参数 | 说明 |
| --- | --- |
| NAME | VPLS 名称不超过20 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里使用该命令带来发送mac 撤销信令:

Switch# clear mpls vpls vpls1 mac-addresse
```

**相关命令**：无

### 19.3.11 `clear mac address-table vpls`

**功能**：使用该命令来清除VPLS 的MAC 地址。

**语法**：

```
clear mac address-table vpls ( address MAC_ADDR | interface INTERFACE )
```

| 参数 | 说明 |
| --- | --- |
| MAC_ADDR | MAC 地址 MAC 地址 |
| INTERFACE | 接口名称，格式如下：eth- 0-1, agg1, vlan1, 等支持 physical/aggregation 端口和eps 组 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，使用clear mac address-table vpls 命令来清楚peer 上学习到的mac
地址:
Switch# clear mac address-table vpls peer 1.1.1.1
```

**相关命令**：无

### 19.3.12 `show mpls vpls`

**功能**：使用该命令来显示MPLS VPLS 信息。.

**语法**：

```
show mpls vpls ( NAME | detail | mesh )
```

| 参数 | 说明 |
| --- | --- |
| NAME | VPLS 名称不超过20 个字符的字符串 |
| detail | VPLS 的详细信息 |
| mesh | PEER 信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，使用show mpls vpls 命令来显示vpls 信息:
Switch# show mpls vpls
Name                 VPLS-ID     MPeers(R) MPeers(T) SPeers    State
v1                   200         1         0         0         Active
In the following example, the show mpls vpls detail command is used to display
detailed VPLS information:
在下面的例子里，使用show mpls vpls detail 命令来显示vpls 的详细信息:
Switch# show mpls vpls detail
Virtual Private LAN Service Instance: v1, ID: 200
Group ID: 0, Configured MTU: NULL
Description: none
AC interface : none
Mesh Peers :
Peer            TYPE State C-Word  Tunnel name          LSP name
3.3.3.3         RAW  UP    Disable tun                  lsp1
Vpls-mac-learning enable
Vpls-mac-limit maximum 100

Vpls-mac-limit action warn
Discard flooding disabled
Discard unknown-unicast disabled
Discard multicast disabled
In the following example, the show mpls vpls mesh command is used to display MPLS
VPLS Mesh Forwarding information:
在下面的例子里，使用show mpls vpls mesh 命令来显示vpls peer 的信息 :
Switch# show mpls vpls mesh
VPLS-ID    Peer Addr        In-Label   Out-Intf   Out-Label  Type       Lkps/St
200        3.3.3.3          25         eth-0-9    26         RAW        2/Up
```

**相关命令**：无

### 19.3.13 `show mac address-table vpls`

**功能**：使用该命令来显示VPLS 的FDB。

**语法**：

```
show mac address-table vpls ( address MAC_ADDR | interface IFNAME )
```

| 参数 | 说明 |
| --- | --- |
| MAC_ADDR | MAC 地址 MAC 地址 |
| IFNAME | 接口名称，格式如下：eth- 0-1, agg1, vlan1, 等支持 physical/aggregation 端口和eps 组 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，使用show mac address-table vpls 命令来显示FDB 信息:

Switch# show mac address-table vpls
vpls        peer             mac               static
1000        eth-0-1          0001.001f.aa12 0
1000        eth-0-1          407a.a718.3400 0
```

**相关命令**：无

### 19.3.14 `mac-address-table`

**功能**：使用带改命令来静态配置VPLS 的MAC 地址。

**语法**：

```
mac-address-table MAC-ADDR forward ( IFNAME | vpls-peer IP_ADDR )
mac-address-table MAC-ADDR discard
mac-address-table MAC-ADDR permit
no mac-address-table MAC-ADDR
```

| 参数 | 说明 |
| --- | --- |
| MAC-ADDR | MAC 地址 MAC 地址 |
| IFNAME | 接口信息支持 physical/aggregation 端口和eps 组 |
| IP_ADDR | PEER 地址 IPv4 地址 |

**命令模式**：VPLS 配置模式

**默认配置**：默认无静态转发地址

**使用说明**：

无

**示例**：

```
在下面的例子中, 使用the mac-table-address 命令来配置MAC 地址:
Switch# configure terminal
Switch(config)# mpls vpls v1

Switch(config-vpls)# mac-address-table c2f3.220a.12f4 forward vpls-peer 1.1.1.2
Switch(config-vpls)# mac-address-table c2f3.220a.12f5 discard
在下面的例子中, 当白名单功能使能的时候，使用the mac-table-address permiet 命令
来配置允许通过的MAC 地址:
Switch# configure terminal
Switch(config)# mpls vpls v1 whitelist
Switch(config-vpls)# mac-address-table c2f3.220a.12f4 permit
```

**相关命令**：show mac address-table vpls

### 19.3.15 `discard`

**功能**：使用该命令来控制VPLS 广播风暴。

**语法**：

```
discard ( broadcast | unknown-unicast | unknown-multicast )
no discard ( broadcast | unknown-unicast | unknown-multicast )
```

| 参数 | 说明 |
| --- | --- |
| broadcast | 所有的广播报文 |
| unknown-unicast | 未知单播报文 |
| unknown-multicast | 未知组播报文 |

**命令模式**：VPLS 配置模式

**默认配置**：默认关闭丢弃flooding，unknown-unicast，multicase 报文

**使用说明**：

无

**示例**：

```
在下面的例子中，使用discard flooding 命令来丢弃所有的未知单播报文:

Switch# configure terminal
Switch(config)# mpls vpls v1
Switch(config-vpls)# discard unknown-unicast
```

**相关命令**：show mpls vpls detail

### 19.3.16 `mpls trust topmost-exp`

**功能**：使用MPLS 报文最外层标签的exp 字段来映射优先级

**语法**：

```
mpls trust topmost-exp
no mpls trust topmost-exp
```

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子中，使用最外层标签exp 字段:
Switch# configure terminal
Switch(config)# mpls trust topmost-exp
```

**相关命令**：无

### 19.3.17 `vlan operation table`

**功能**：创建一个vlan 编辑表

**语法**：

```
vlan operation table WORD
no vlan operation table WORD
```

| 参数 | 说明 |
| --- | --- |
| WORD | 表的名称不超过16 个字符的字符串 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子中，创建一个vlan 编辑表，名称push:
Switch# configure terminal
Switch(config)# vlan operation table push
```

**相关命令**：rewrite ingress tag

### 19.3.18 `rewrite ingress tag`

**功能**：为vlan 编辑表添加编辑规则

**语法**：

```
rewrite ingress tag ( push ( vlan VLANID ( second-vlan SVLANID | ) ) | pop ( 1 | 2 ) |
translate ( 1-to-1 vlan VLANID | 2-to-1 vlan VLANID | 1-to-2 vlan VLANID second-vlan
SVLANID | 2-to-2 vlan VLANID second-vlan SVLANID ) )
no vlan operation
```

| 参数 | 说明 |
| --- | --- |
| VLANID |  |
| Vlan ID | 1-4094 |
| SVLANID |  |
| Second Vlan ID | 1-4094 |

**命令模式**：VLAN 操作配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子中，为一个名为push 的vlan 编辑表添加一个规则，push a vlantag with
vlan 2:
Switch# configure terminal
Switch(config)# vlan operation table push
Switch(config-vlan-operation)# rewrite ingress tag push vlan 2
```

**相关命令**：vlan operation table

### 19.3.19 `mpls vpls-l3vpn-compatible`

**功能**：使用该命令使能同端口同vlan 功能使用vpls 和l3vpn 功能。

**语法**：

```
mpls vpls-l3vpn-compatible
no mpls vpls-l3vpn-compatible
```

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

使用该命令后，每个vpls 实例就只能映射到唯一一个vlan 上。

**示例**：

```
在接下来的例子里，使用该命令使能同端口同vlan 使用vpls 和l3vpn 功能:
Switch# configure terminal
Switch(config)# mpls vpls-l3vpn-compatible
```

**相关命令**：无、19.4 VPWS 命令


## 19.4 VPWS 命令

### 19.4.1 `mpls l2-circuit`

**功能**：使用该命令来配置VPWS。

**语法**：

```
mpls l2-circuit NAME VC-ID NEXTHOP ( control-word | ) ( manual | ) ( mtu MTU | ) ( raw
| tagged | )
no mpls l2-circuit NAME
```

| 参数 | 说明 |
| --- | --- |
| NAME | VPWS 名称不超过20 个字符的字符串 |
| VC-ID |  |
| VPWS ID | 1- 4294967295 |
| NEXTHOP | 下一跳的IP 地址 IPv4 地址 |
| control-word | 控制字 |
| manual | 静态配置 |
| MTU | VPWS 的MTU 576-65535 |
| raw | PW 为raw 模式 |
| tagged | PW 为tagged 模式 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# mpls l2-circuit pw1 1 100.100.100.1 manual
```

**相关命令**：no mpls l2-circuit

### 19.4.2 `mpls-l2-circuit`

**功能**：使用该命令在AC 口上绑定VPWS。

**语法**：

```
mpls-l2-circuit NAME ( ethernet | vlan VLANID | )
no mpls-l2-circuit NAME
```

| 参数 | 说明 |
| --- | --- |
| NAME | VPWS 名称不超过20 个字符的字符串 |
| VLANID | VLAN 标识 1-4094 |

**命令模式**：端口配置模式

**默认配置**：默认为ethernet 绑定

**使用说明**：

无

**示例**：

```
Switch# configure terminal
Switch(config)# interface eth-0-1
Switch(config-if)# mpls-l2-circuit pw1 vlan 100
```

**相关命令**：no mpls-l2-circuit

### 19.4.3 `mpls l2-circuit-fib-entry`

**功能**：使用该命令来静态配置VPWS 的VC 标签。

**语法**：

```
mpls l2-circuit-fib-entry NAME INLABEL OUTLABEL
no mpls l2-circuit-fib-entry NAME
```

| 参数 | 说明 |
| --- | --- |
| NAME | VPWS 名称不超过20 个字符的字符串 |
| INLABEL | 入标签 16-1048575 |
| OUTLABEL | 出标签 16-1048575 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

静态配置VPWS 的VC 标签，在配置VPWS 的时候需要指定“manual”参数。

**示例**：

```
Switch# configure terminal
Switch(config)# mpls l2-circuit-fib-entry pw1 100 200
```

**相关命令**：no mpls l2-circuit-fib-entry

### 19.4.4 `show mpls l2-circuit`

**功能**：使用该命令来显示VPWS 的配置。

**语法**：

```
show mpls l2-circuit ( NAME | )
```

| 参数 | 说明 |
| --- | --- |
| NAME | VPWS 名称不超过20 个字符的字符串 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
Switch# show mpls l2-circuit
VC-Name        VC-ID      Interface    AC-type        VLAN   PW-mode   Manual
pw1            100        eth-0-1      Ethernet       N/A    Raw       Yes

Switch# show mpls l2-circuit pw1
MPLS Layer-2 Virtual Circuit: pw1, id: 100
 Endpoint: 11.11.3.3
 Control Word: 0
 MPLS Layer-2 Virtual Circuit Group: none
 Bound to interface: eth-0-1
 Virtual Circuit Type: Ethernet
 Owner: manual
    Virtual Circuit is configured as Primary
```

**相关命令**：mpls l2-circuit

### 19.4.5 `show mpls vc-table`

**功能**：使用该命令来显示VPWS 的标签和状态。

**语法**：

```
show mpls vc-table ( detail | )
```

| 参数 | 说明 |
| --- | --- |
| vc-table | VPWS 转发表 |
| detail | 详细信息 |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
switch# show mpls vc-table
VC-ID       PW Intf   AC Intf   L/R Label       EndPoint        Status   Manual
100         eth-0-9   eth-0-1   22/33           11.11.3.3       Active   Yes
Switch# show mpls vc-table detail
mpls l2-curcuit: test                 ID: 100
Manual: Yes                             Configured MTU: NULL
AC interface: eth-0-9                 PW interface: eth-0-1
Tunnel-name: tun                       LSP-name: lsp1
Peer Address: 3.3.3.3                 In lable/Out label: 23/24
PW type: Raw                            AC type: Ethernet
```

**相关命令**：mpls l2-circuit、、19.5 MPLS SR 命令


## 19.5 MPLS SR 命令

### 19.5.1 `static-sr-mpls adjacency`

**功能**：使用该命令来创建adj segment。

**语法**：

```
static-sr-mpls adjacency ADJNAME in-label IN_LABEL nexthop IPV4_ADDR
no static-sr-mpls adjacency ADJNAME
```

| 参数 | 说明 |
| --- | --- |
| ADJNAME | Adj segment 的名称不超过20 个字符的字符串 |
| IN_LABEL | Adj segment 的入标签 16-1048575 |
| IPV4_ADDR | 下一跳地址 IPv4 地址 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，将使用static-sr-mpls adjacency 命令来创建一个adjacency segment:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# static-sr-mpls adjacency adj1 in-label 20 nexthop 12.1.1.2
```

**相关命令**：无

### 19.5.2 `static-sr-mpls prefix`

**功能**：使用该命令来创建prefix segment。

**语法**：

```
static-sr-mpls prefix PREFIXNAME destination IP_ADDR/IP_MASK_LEN in-label
IN_LABEL ( nexthop NH_IP_ADDR out-label OUT_LABEL | )
no static-sr-mpls prefix PREFIXNAME ( destination IP_ADDR/IP_MASK_LEN in-label
IN_LABEL ( nexthop NH_IP_ADDR out-label OUT_LABEL | ) | )
```

| 参数 | 说明 |
| --- | --- |
| PREFIXNAME | Prefix segment 的名称不超过20 个字符的字符串 |
| IP_ADDR | 指定目的IP 地址 IPv4 地址 |
| IP_MASK_LEN | 目的IP 地址的掩码长度 1-32 |
| IN_LABEL | Prefix segment 的入标签 16-1048575 |
| NH_IP_ADDR | 下一跳地址 IPv4 地址 |
| OUT_LABEL | Prefix segment 的出标签 0/3/16-1048575 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，将使用static-sr-mpls prefix 命令来创建一个prefix segment:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# static-sr-mpls prefix prefix1 destination 10.10.10.10/32 in-label
30 nexthop 12.1.1.2 out-label 100
```

**相关命令**：无

### 19.5.3 `static-sr-mpls lsp`

**功能**：使用该命令来创建sr lsp。

**语法**：

```
static-sr-mpls lsp LSPNAME out-label [ OUT_LABEL ]
no static-sr-mpls lsp LSPNAME
```

| 参数 | 说明 |
| --- | --- |
| LSPNAME | Sr lsp 的名称 Sr lsp 的出标签栈 |
| OUT_LABEL | Sr lsp 的出标签栈 0/3/16-1048575 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

最多可以配置10 个outlabel

**示例**：

```
在下面的例子里，将使用static-sr-mpls lsp 命令来创建一个sr lsp:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# static-sr-mpls lsp lsp1 out-label 20 30 40 50
```

**相关命令**：无

### 19.5.4 `static-sr-mpls tunnel`

**功能**：使用该命令来创建sr tunnel,并进入sr tunnel 模式。

**语法**：

```
static-sr-mpls tunnel TUNNELNAME ( non-aps | aps | )
no static-sr-mpls tunnel TUNNELNAME
```

| 参数 | 说明 |
| --- | --- |
| TUNNELNAME | Sr tunnel 的名称不超过20 个字符的字符串 |
| non-aps | 非aps 保护模式 |
| aps | aps 保护模式 |

**命令模式**：全局配置模式

**默认配置**：无

**使用说明**：

创建sr tunnel 时需要指定是aps 还是non-aps 类型

**示例**：

```
在下面的例子里，将使用static-sr-mpls tunnel 命令来创建一个sr tunnel:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# static-sr-mpls tunnel tun1 non-aps
```

**相关命令**：无

### 19.5.5 `primary`

**功能**：使用该命令来将主用lsp 绑定到sr 隧道上。

**语法**：

```
primary LSPNAME
no primary
```

| 参数 | 说明 |
| --- | --- |
| LSPNAME | 主用lsp 的名称不超过20 个字符的字符串 |

**命令模式**：VLAN 操作配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，将使用这条命令行来把主用lsp 绑定到sr 隧道上:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# static-sr-mpls tunnel tun1 non-aps
Switch(config-sr-tunnel)# primary lsp1
```

**相关命令**：无

### 19.5.6 `secondary`

**功能**：使用该命令来将备用lsp 绑定到sr 隧道上。

**语法**：

```
secondary LSPNAME
no secondary
```

| 参数 | 说明 |
| --- | --- |
| LSPNAME | 备用lsp 的名称不超过20 个字符的字符串 |

**命令模式**：VLAN 操作配置模式

**默认配置**：无

**使用说明**：

只有aps 类型的sr tunnel 支持配置secondary lsp

**示例**：

```
在下面的例子里，将使用这条命令行来把备用lsp 绑定到sr 隧道上:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# static-sr-mpls tunnel tun1 aps
Switch(config-sr-tunnel)# secondary lsp2
```

**相关命令**：无

### 19.5.7 `map-route`

**功能**：使用该命令来将路由引入这个sr 隧道。

**语法**：

```
map-route IP_ADDR/IP_MASK_LEN
no map-route
```

| 参数 | 说明 |
| --- | --- |
| IP_ADDR | IPv4 路由前缀 |
| IP_MASK_LEN | 路由的掩码长度 |

**命令模式**：VLAN 操作配置模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，将使用这条命令来把路由map 到这个sr 隧道:
Switch# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Switch(config)# static-sr-mpls tunnel tun1 non-aps
Switch(config-sr-tunnel)# map-route 5.5.5.5/32
```

**相关命令**：无

### 19.5.8 `static-sr-mpls manual-switch`

**功能**：使用该命令来对sr 隧道进行手动切换

**语法**：

```
static-sr-mpls manual-switch TUNNELNAME ( to-primary | to-secondary )
```

| 参数 | 说明 |
| --- | --- |
| TUNNELNAME | 手动切换的sr 隧道名称不超过20 个字符的字符串 |
| to-primary | 手动切换到主用lsp |
| to-secondary | 手动切换到备用lsp |

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

只有aps 类型的sr 隧道支持手动切换

**示例**：

```
在下面的例子里，将使用这条命令来把sr 隧道从主用lsp 切换到备用lsp:
Switch# static-sr-mpls manual-switch tun1 to-secondary
```

**相关命令**：无

### 19.5.9 `show mpls sr-adj`

**功能**：使用该命令来显示adjacency segment

**语法**：

```
show mpls sr-adj
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，将使用此命令来显示adjacency segment:
Switch# show mpls sr-adj
sr-adj               id    inlabel   nexthop         lsp_list
adj1                 0     20        12.1.1.2        lsp1
adj2                 0     21        12.1.2.2        lsp2
```

**相关命令**：无

### 19.5.10 `show mpls sr-prefix`

**功能**：使用该命令来显示prefix segment

**语法**：

```
show mpls sr-prefix
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，将使用此命令来显示prefix segment:
Switch# show mpls sr-prefix
sr-prefix            id    inlabel   outlabel  nexthop         lsp_list
prefix1              0     30        40        12.1.1.2
prefix2              0     31        41        12.1.1.2
```

**相关命令**：无

### 19.5.11 `show mpls sr-lsp`

**功能**：使用该命令来显示sr lsp

**语法**：

```
show mpls sr-lsp
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，将使用此命令来显示sr lsp:
Switch# show mpls sr-lsp
sr-lsp     id    tunid instl nexthop         tunnel    adj       prefix    outlabel
lsp1       5     6     1     12.1.1.2        tun1      adj1      -         20 30 40
lsp2       6     8     1     12.1.1.2        tun1      adj2      -         21 31 41
```

**相关命令**：无

### 19.5.12 `show mpls sr-tunnel`

**功能**：使用该命令来显示sr 隧道

**语法**：

```
show mpls sr-tunnel
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，将使用此命令来显示sr 隧道:
Switch# show mpls sr-tunnel
sr-tunnel            id    type   wlsp      plsp      slsp      map-route
tun1                 4     aps    lsp1      lsp2      lsp1      5.5.5.5/32
6.6.6.6/32
```

**相关命令**：无

### 19.5.13 `show mpls sr-mapped-routes`

**功能**：使用该命令来显示map 到sr 隧道的路由

**语法**：

```
show mpls sr-mapped-routes
```

**命令模式**：特权模式

**默认配置**：无

**使用说明**：

无

**示例**：

```
在下面的例子里，将使用此命令来显示map 到sr 隧道的路由:
Switch# show mpls sr-mapped-routes
Mapped-route        SR Tunnel name
5.5.5.5/32          tun1
6.6.6.6/32          tun1
```

**相关命令**：无、、20 堆叠命令、20.1 堆叠命令

