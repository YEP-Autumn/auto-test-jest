# utils 分层约定

```text
testing  →  traffic  →  packet
   │           │
   │           ▼
   └──────► composition → backends → packet
                              │
                              └──► config（仅组合根读取）
```

## 目录职责

| 目录                | 职责                                                                                 | 允许依赖                        |
| ------------------- | ------------------------------------------------------------------------------------ | ------------------------------- |
| `utils/packet`      | 报文模型、Builder、match、format、地址转换（纯数据）                                 | 无                              |
| `utils/backends`    | 后端契约、Renix/Scapy HTTP、stream-linux gRPC、codec、pcap                           | `packet`                        |
| `utils/traffic`     | `StreamPort`、端口解析、`TrafficSession`、能力表                                     | `packet`、`backends/contract`   |
| `utils/testing`     | 测试侧内部聚合（由 `@/utils` 统一导出）：`StreamPort`、`PacketBuilder`、`TestHelper` | `traffic`、`packet`             |
| `utils/config`      | 端口配置、后端服务配置、拓扑服务配置                                                 | `traffic/model`（仅类型）       |
| `utils/composition` | 组装 resolver + backend registry + session                                           | `config`、`traffic`、`backends` |

## 规则

1. 测试用例只 import `@/utils`，不感知 provider / address / codec，也不关心工具模块如何拆分。
2. `packet` 不依赖任何其它层。
3. `backends` 只依赖 `packet` 和 `backends/contract`，不读取逻辑端口配置；服务连接地址作为构造参数注入（默认值来自 `utils/config/backends`）。
4. `traffic` 依赖 `backends/contract` 接口，不 `new` 具体后端。
5. 只有 `composition` 读取 `utils/config` 并把实现装配进 `TrafficSession`。
6. 旧入口（`utils/stream/**`、`utils/test-helper.ts`、`RenixPort`）已删除；
   新代码直接使用 `@/utils`。
