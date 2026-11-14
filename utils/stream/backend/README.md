# stream backend 抽象

测试组件只依赖 `TrafficBackend`（`types.ts`），
报文统一用 `packet/model.ts` 的 `PacketBuilder` 描述，编码/传输由具体后端负责。

> Phase 1 起，测试侧建议通过 `utils/traffic` 的 `TrafficManager` 使用这些后端：
> 它按逻辑端口的 provider（`renix` / `scapy` / `stream-linux`）路由，
> `RenixPort.A` 会自动解析成对应后端的地址。详见 `utils/traffic/README.md`。

```
PacketBuilder -> PacketSpec
                    │
             TrafficBackend
        ┌───────────┴────────────┐
 RenixHttpBackend        StreamControlBackend
 (codec/thrift/renix)     (codec/grpc/headers + codec/frame)
```

## 后端选择

通过环境变量 `STREAM_BACKEND_KIND`：

| 值                   | 说明                                         |
| -------------------- | -------------------------------------------- |
| `renix-http`（默认） | 原信而泰/scapy HTTP 后端，行为不变           |
| `streamcontrol-grpc` | `utils/rpc/grpc` 的 stream-control gRPC 网关 |

gRPC 相关环境变量：

- `STREAM_CONTROL_HOST`（默认 `127.0.0.1`）
- `STREAM_CONTROL_PORT`（默认 `5443`）
- `STREAM_CONTROL_TLS`（`true`/`false`）
- `STREAM_CONTROL_CA` / `STREAM_CONTROL_CERT` / `STREAM_CONTROL_KEY`
- `STREAM_CONTROL_TLS_INSECURE`（`true` 时跳过证书校验，仅测试环境）
- `STREAM_CONTROL_TOKEN`（自动补 `Bearer ` 前缀）
- `STREAM_CONTROL_DEBUG_YAML`（`true` 时打印下发的 blocks YAML）
- `STREAM_CONTROL_STRUCTURED_PAYLOAD`（`true` 时启用 `payload: custom/blob`
  新路径；当前引擎有 UAF，默认关闭并回退到原始帧）

## 当前状态

| 能力                   | Renix HTTP                    | streamcontrol gRPC                                                             |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| init / 鉴权            | ✅ login                      | ✅ Hello + Bearer metadata                                                     |
| 端口占用/释放          | ✅                            | ✅ GetPort/OpenPort/ClosePort                                                  |
| 抓包启停               | ✅                            | ✅ CaptureService（Create/Reset/Start/Stop）                                   |
| 抓包读取               | ✅ thrift PacketList          | ✅ ReadByIndex + pcap 批量下载                                                 |
| 发送报文               | ✅ thrift + modifier/transmit | ✅ `packet.proto headers -> YAML -> RunService`                                |
| Dot3 / LLC / SNAP 发送 | ✅                            | ✅ `HeaderType.DOT3/LLC/SNAP` + `payload`（RAW payload 才走 `templateString`） |
| SNMP 发送              | ✅                            | ✅ `HeaderType.SNMP` 固定 43B v1/v2c Get/GetNext 模板                          |
| SNMP 解码              | ✅                            | ✅ v1/v2c/v3（抓包校验）                                                       |
| 停止发送               | ✅                            | ✅ RunService.StopTest                                                         |

Renix 和 Scapy 共享 `HttpTrafficTransport`：登录、token、multipart 上传只实现
一次，请求体里的 `backend` 由具体端口决定。`TrafficManager` 混用两个 provider
时也只会登录一次。

### gRPC 发送实现

不再走 `TrafficService.Start`（它每次 apply 都要求所有端口关闭），而是：

```
PacketSpec
  -> codec/grpc/headers：HeaderInstance + PacketFieldModifier
  -> 固定报文：TrafficService.Encode(headers) 得到真实帧
     -> stream.templateString 原样发送
  -> 带 modifier：退回落 YAML layers/fields 路径
  -> ConfigService.DraftOpen/DraftPut/ConfigApply
  -> RunService.StartTest(frames/duration)
```

发送前会暂停抓包并关闭所有已打开端口（CONFIG_APPLY 限制），apply 后重开
TX 端口和抓包端口，并用 `RunService.StartTest` 启动，因此可以“抓包中打流”。
跨 apply 已抓到的帧会先缓存到内存，避免丢失。

> 2026-11-14 更新后 `TrafficService.Encode(headers)` 已可用，本 backend 会优先
> 用它生成固定帧；老网关返回 `UNIMPLEMENTED` 时自动退回 layers/fields。

## 2026-11-14 实测（10.10.10.163:9443）

已验证：

- TLS 自签证书 + `authorization: Bearer <token>` 可连接；
  `Hello` 返回 gateway 1.0.0 / engine 0.1.0 / features=events,yaml。
- `PortService.OpenPort` 可注册 eth1/eth2；eth1↔eth2 对接。
- `CaptureService.Create` 的 spec 必须是 Struct 形态，`port` 必须是端口名字符串；
  `mode: 1` 表示 WRAP。
- `ConfigService` 下发 `layers/fields` + `RunService.StartTest` 可实际发包；
  抓包读回并解码后与 PacketBuilder 期望字段匹配。
- **VLAN（重新部署后复测通过）**：抓到
  `...aabb 8100 000a 0800 ...`，解码出 Ethernet type=0x8100 + VLAN vid=10。
- **地址 modifier start（重新部署后复测通过）**：
  IPv4 src 为 `3.3.3.3 ... 3.3.3.12`，MAC src 为
  `66:77:88:99:aa:bb ... 66:77:88:99:aa:c4`。
- `RunService` 的 run 槽位（上限 4）需要 `StopTest` 才会释放，自然结束的 run
  也要 StopTest；backend 已自动清理 `auto-test-*` 遗留 run。

- **Dot3 / LLC / SNAP（已复测通过）**：普通 Dot3+LLC(+SNAP) 走
  `HeaderType.DOT3/LLC/SNAP` + YAML `payload`。backend 会按
  `dot3.len - 其后各层头长度` 设置 LLC data 补齐，引擎
  `sl_pkt_seal()` 用未 padding 的 logical length 回填 802.3 length。
  已验证 Dot3+LLC+SNAP+IPv4+UDP 的 `len=36`、SNAP oui=0/pid=0x0800。
- **Dot3 MAC modifier（已复测通过）**：走 `PacketFieldModifier`，source MAC
  从 `...bb` 递增到 `...c4`。
- **地址 Random modifier（已复测通过）**：新引擎支持 MAC/IPv4/IPv6/BYTES
  的 `kind=random`；`PacketModifierParam` 新增 `end_value`，Dot3 source MAC
  在 `00:02:00:02:00:02 .. 00:02:00:02:00:0f` 内随机。
- **Dot3 + RAW payload**：新网关支持 `payload: blob`，但当前引擎在
  `RunService.StartTest` 路径存在 use-after-free（见下），所以默认仍用
  `codec/frame/encode` + `templateString`；修复后可用
  `STREAM_CONTROL_STRUCTURED_PAYLOAD=true` 切到 headers + blob。
- **Ethernet + RAW payload**：同一个 payload 路径，默认同样会回退/报错；
  不再静默把 `setRaw()` 当成协议层。
- **SNMP v1/v2c Get/GetNext（已复测通过）**：`packet.proto` 新增的
  `HeaderType.SNMP` 是固定 43B 模板；`PacketBuilder.setSNMP` 的
  version/community/first-varbind-oid 可映射到该模板，抓包侧可完整解码。
- **SNMP 可变 PDU**：`codec/snmp.ts` 已能编码 v1/v2c 的 SET / Trap /
  GetBulk / 多 varbind；但结构化 payload 路径同样被引擎 UAF 阻塞，默认
  用 `templateString` 发送原始 BER。
- **SNMP 解码端口**：已修正 UDP 端口不是 161/162 时的 SNMP 识别（之前误把
  UDP 头的首字节当 BER SEQUENCE）。

当前剩余问题：

1. **引擎 payload UAF（阻塞新后端 1/2）**：`payload: custom/blob` 的
   `custom` 内存在 `sl_load_report_free()` 后被 stream cfg 继续引用，
   抓到帧的前 16B 会变成堆指针。2026-11-14 再次复测（网关已包含 burst
   修复）：Dot3+RAW 10/10 仍错误、Ethernet+RAW 9/10 仍错误，说明目标
   引擎还没有包含 `stream_build()` 里的 payload 深拷贝修复。修复代码在
   `src/flow/stream.c` 的工作区改动中，提交并重新构建/部署后再打开
   `STREAM_CONTROL_STRUCTURED_PAYLOAD`。
2. **SNMP HeaderType 只覆盖固定模板**：v1/v2c Get/GetNext、单 varbind、
   community 固定 6B、OID 固定 8B；SET/TRAP/多 varbind 走 BER payload。
3. **HeaderInstance.options / proto_name 未接**：网关已验证支持 IPv4/TCP
   选项（IHL/data_off 自动同步），但 `PacketBuilder` 还没有
   `HeaderOption` 映射；`proto_name` 只对动态 `CUSTOM` 层有意义，当前没有
   自定义层 API。
4. **BURST 总帧数已生效，但 burst 内 gap 仍未映射**：2026-11-14 复测
   `burst_size=5, burst_count=3` 抓到 15 帧；新引擎增加了 `combine`，
   但 YAML 仍没有 `gap/gap_unit` 字段，所以 `burst_count` 只是被压平成
   “总帧数 + 速率”，不是带间隔的多次 burst。
5. **抓包性能**：停止抓包且帧数达到阈值后，`readCapture` 会走
   `Capture.Download -> FileService.Download -> pcap 解析`；否则仍用
   `ReadByIndex`。可用 `STREAM_CONTROL_BATCH_CAPTURE_MIN` 调整阈值。
6. **抓包参数**：`startCapture(port)` 没有 options；backend 固定
   `WRAP + 4MB + 65536 帧`。引擎支持 `maxBytes/maxFrames/snaplen`，但
   没有 BPF 过滤。

### 其他实测问题

- 目标 engine 上 `lo` 可能处于“已打开但 ListPorts.flags 不显示 open”的状态，
  会阻塞 `CONFIG_APPLY`（code 106）。backend 现在 apply 前会关闭 loopback
  和所有已配置端口，并清理遗留 capture；不会误关 eth0 管理口。

### 2026-11-14 proto/网关更新后的新能力

- `TrafficService.Encode(headers)` 已实现：本 backend 已用它预览固定帧，
  返回的 plain/VLAN 帧都正确。
- `packet.proto` 新增 `DOT3` / `LLC` / `SNAP` / `SNMP` / IPv6 扩展头 /
  `VXLAN` / `PPPOE` HeaderType，以及 `HeaderOption`（IPv4/TCP 选项）和
  `HeaderInstance.proto_name`；字段数从 75 扩到 134。backend 已接
  DOT3/LLC/SNAP/SNMP 字段映射；HeaderOption 已在网关验证通过，客户端映射待补。
- `HeaderType.RAW` 现在会被网关明确拒绝：它不是协议层，只能用
  `PayloadSpec custom/blob` 或整帧 `templateString`。
- `PayloadType.BLOB` 已加入（只写一次 custom、剩余补零），用于 Dot3 LLC data；
  但当前引擎 payload 生命周期有 UAF，暂不作为默认路径。
- `HeaderInstance` 的增删层、`header_length`、`PayloadSpec`（cycle/incr/decr/
  random/custom/blob/PRBS）、`ErrorInjectionSpec`、`StreamTemplate.repeat_count`
  已在网关侧接入；backend 目前只用到 headers 的层栈和字段，error/repeat 还未接。
- `ImportPcap` 单帧上限从 2048B 提升到 16000B（最多 64 帧）。
- `ExtensionService` 已实现 7/10：`ListHeaderTypes` / `ListHeaderProperties` /
  `ListHeaders` / `CreateHeader` / `InsertHeader` / `UpdateHeader` / `DeleteHeader`。
- `EncodeStreamRequest.headers` 不再是 `UNIMPLEMENTED`，可以用于“不启动流量”的
  报文预览和映射校验。

## 兼容性

- `utils/stream/thrift-packet.ts` 保留为 barrel，测试里的
  `import { PacketBuilder } from "@/utils/stream/thrift-packet"` 不需要改。
- `utils/stream/stream-backend-api.ts` 保留为 `RenixHttpBackend` 的别名。
- `ModifierField` / `TransmitMode` 等类型从 `comm/components` 原样 re-export。
- 支持解码：Ethernet / VLAN / IPv4 / IPv6 / TCP / UDP / ICMP / ARP / Dot3 / LLC / SNAP，
  以及 IPv4/IPv6 上的 SNMP v1/v2c/v3（用于 Storm Control Trap 用例）。
- `PacketBuilder` 新增 `setSNAP({ oui, pid })`；`matchSNAP()` 已接入 `PacketChecker`。
