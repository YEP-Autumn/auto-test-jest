# utils/stream

报文模型、编解码与流量后端实现。

`utils/traffic` 负责“逻辑端口 -> provider”的控制层；`utils/stream` 负责
“报文怎么描述、怎么编码、怎么发/抓”。

## 目录结构

```
utils/stream/
├── index.ts                 # 公共入口：PacketBuilder、类型、match*/format
├── packet/
│   ├── model.ts             # PacketSpec / PacketBuilder / 协议层模型
│   ├── types.ts             # Modifier / Transmit 等发送参数
│   ├── match.ts             # PacketChecker 的字段匹配
│   └── format.ts            # 抓包列表紧凑打印
├── codec/
│   ├── address.ts           # MAC / IPv4 / IPv6 与字节转换
│   ├── snmp.ts              # SNMP v1/v2c BER 编码
│   ├── frame/
│   │   ├── decode.ts        # 原始以太网帧 -> PacketLayer
│   │   └── encode.ts        # Dot3/LLC -> 原始以太网帧
│   ├── grpc/
│   │   └── headers.ts       # PacketSpec -> packet.proto HeaderInstance
│   └── thrift/
│       ├── protocol-factory.ts  # Thrift Transport + Protocol 工厂
│       └── renix.ts             # Renix thrift 编解码
└── backend/
    ├── types.ts             # TrafficBackend / CapturedPacket / SendOptions
    ├── factory.ts           # 单个后端工厂（旧用法）
    ├── README.md            # 后端实现与实测记录
    ├── shared/
    │   ├── http-transport.ts    # 登录 / multipart / HTTP 请求
    │   └── grpc-struct.ts       # protobuf Struct 转换
    ├── http/
    │   └── renix-http.ts        # Renix + Scapy HTTP 后端
    └── grpc/
        └── stream-linux.ts      # stream-linux gRPC 后端
```

## 兼容入口

以下文件仅用于旧 import，内部已指向新位置：

| 旧入口                                 | 新位置                                |
| -------------------------------------- | ------------------------------------- |
| `utils/stream/thrift-packet`           | `utils/stream` + `codec/thrift/renix` |
| `utils/stream/packet-utils`            | `packet/match` + `packet/format`      |
| `utils/stream/stream-backend-api`      | `backend/http/renix-http`             |
| `utils/stream/thrift-protocol.factory` | `codec/thrift/protocol-factory`       |
| `utils/stream/backend/renix-http`      | `backend/http/renix-http`             |
| `utils/stream/backend/streamcontrol`   | `backend/grpc/stream-linux`           |

测试里既有的：

```ts
import { PacketBuilder } from "@/utils/stream/thrift-packet";
```

不需要修改。新代码建议使用：

```ts
import { PacketBuilder } from "@/utils/stream";
```
