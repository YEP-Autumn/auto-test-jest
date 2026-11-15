# stream backend 抽象

测试组件只依赖 `TrafficBackend`（`contract.ts`），
报文统一用 `utils/packet/model.ts` 的 `PacketBuilder` 描述，编码/传输由具体后端负责。

> Phase 1 起，测试侧建议通过 `utils/traffic` 的 `TrafficSession` 使用这些后端：
> 它按逻辑端口的 provider（`renix` / `scapy` / `stream-linux`）路由，
> `StreamPort.A` 会自动解析成对应后端的地址。详见 `utils/traffic/README.md`。

```
PacketBuilder -> PacketSpec
                    │
             TrafficBackend
        ┌───────────┴────────────┐
 RenixHttpBackend        StreamControlBackend
 (codec/thrift/renix)     (codec/grpc/headers + codec/frame)
```

stream-linux gRPC 后端内部拆分：

```text
grpc/
├── stream-linux.ts   TrafficBackend 门面（端口 / 发送 / run 生命周期）
├── client.ts         gRPC channel / metadata / unary / stream
├── capture.ts        抓包启停 / 读取 / pcap 下载
├── run.ts            run 生命周期 / TransmitHandle / 资源清理
├── jobs.ts           JobService 轮询
├── template.ts       帧长 / 帧数 / 时长计算
├── pcap.ts           经典 pcap 解析
└── util.ts           assertResult / sleep / 批量阈值
```

## 后端选择

日常由 `utils/config/traffic.ts` 的 `streamPorts` 指定每个端口的
`provider`。

gRPC 相关环境变量：

- `STREAM_CONTROL_HOST`（默认 `127.0.0.1`）
- `STREAM_CONTROL_PORT`（默认 `5443`）
- `STREAM_CONTROL_TLS`（`true`/`false`）
- `STREAM_CONTROL_CA` / `STREAM_CONTROL_CERT` / `STREAM_CONTROL_KEY`
- `STREAM_CONTROL_TLS_INSECURE`（`true` 时跳过证书校验，仅测试环境）
- `STREAM_CONTROL_TOKEN`（自动补 `Bearer ` 前缀）
- `STREAM_CONTROL_BATCH_CAPTURE_MIN`（抓包批量下载阈值）

## 当前状态

| 能力                   | Renix HTTP                    | streamcontrol gRPC                                                             |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| init / 鉴权            | ✅ login                      | ✅ Hello + Bearer metadata                                                     |
| 端口占用/释放          | ✅                            | ✅ GetPort/OpenPort/ClosePort                                                  |
| 抓包启停               | ✅                            | ✅ CaptureService（Create/Reset/Start/Stop）                                   |
| 抓包读取               | ✅ thrift PacketList          | ✅ ReadByIndex + pcap 批量下载                                                 |
| 发送报文               | ✅ thrift + modifier/transmit | ✅ template/channel + `TrafficService.Start`（默认）                            |
| Dot3 / LLC / SNAP 发送 | ✅                            | ✅ `HeaderType.DOT3/LLC/SNAP` + `payload`（RAW 用 `blob/custom`） |
| IPv4/TCP options       | ✅ thrift options             | ✅ `HeaderOption[]` + 自动 IHL/data_off                                        |
| SNMP 发送              | ✅                            | ✅ 固定 43B 模板 + 可变 PDU `payload: custom`                                  |
| SNMP 解码              | ✅                            | ✅ v1/v2c/v3（抓包校验）                                                       |
| 停止发送               | ✅                            | ✅ `TrafficService.Stop`                                                       |

Renix 和 Scapy 共享 `HttpTrafficTransport`：登录、token、multipart 上传只实现
一次，请求体里的 `backend` 由具体端口决定。`TrafficSession` 混用两个 provider
时也只会登录一次。

### gRPC 发送实现

```
PacketSpec
  -> codec/grpc/headers：HeaderInstance + PacketFieldModifier
  -> CreateTemplate（headers / frame_length / payload）
  -> CreateChannel（template + tx port）
  -> CreateLoadProfile（rate）
  -> SetPortConfig（STEP/BURST/TIME/CONTINUOUS）
  -> TrafficService.Start（inline blocks，不写全局 YAML、不关端口）
  -> 完成后 TrafficService.Stop + 删除 template/channel/profile
```

不同 tx 端口可以同时 `Start`，停止一个 channel 不影响另一个。
不再使用 `ConfigService.ConfigApply`，也没有关闭端口/暂停抓包步骤。

### 发送语义（异步）

`sendPacket()` 默认只保证 **Run 已启动**，不等待发送完成：

```ts
await backend.sendPacket(port, spec, {
  transmit: { mode: TransmitMode.STEP, param: { step_count: 1000 } },
});
```

需要等待完成时：

```ts
await backend.sendPacket(port, spec, { wait: true, timeoutMs: 30000 });
```

或者使用 handle：

```ts
const handle = await backend.startTransmit(port, spec, options);
await handle.wait(30000);      // 等待并自动 StopTest，释放 run 槽位
await handle.stop();           // 提前停止
const state = await handle.state();
```

`PacketSender` 的默认策略：

- `STEP` / `BURST` / `TIME`：等待完成（保持现有用例的确定性）；
- `CONTINUOUS`：不等待，保留异步行为。

可以用 `wait_for_completion` 覆盖：

```ts
testHelper.addPktSender({
  ...,
  wait_for_completion: false, // 低速长 burst 不阻塞
});
```

`TrafficSession` 只按 tx 端口串行化；不同端口可以各自 `startTransmit()`。
同一端口再次启动会先停掉该端口的旧 run。

## 2026-11-14 实测（10.10.10.163:9443）

已验证：

- TLS 自签证书 + `authorization: Bearer <token>` 可连接；
  `Hello` 返回 gateway 1.0.0 / engine 0.1.0 / features=events,yaml。
- `PortService.OpenPort` 可注册 eth1/eth2；eth1↔eth2 对接。
- `CaptureService.Create` 的 spec 必须是 Struct 形态，`port` 必须是端口名字符串；
  `mode: 1` 表示 WRAP。
- `TrafficService.CreateTemplate/CreateChannel/CreateLoadProfile/SetPortConfig`
  + `TrafficService.Start` 可实际发包；抓包读回并解码后与 PacketBuilder
  期望字段匹配。
- **VLAN（重新部署后复测通过）**：抓到
  `...aabb 8100 000a 0800 ...`，解码出 Ethernet type=0x8100 + VLAN vid=10。
- **地址 modifier start（重新部署后复测通过）**：
  IPv4 src 为 `3.3.3.3 ... 3.3.3.12`，MAC src 为
  `66:77:88:99:aa:bb ... 66:77:88:99:aa:c4`。
- run 槽位（上限 4）在 DONE 后仍占用；backend 的 `TrafficService.Stop`
  和资源清理会释放本次 channel 对应的 run。
- **抓包停止时序（2026-11-15 复测通过）**：引擎 Stop 会 join capture 线程并
  drain RX ring；发送完成后立即 `stopCapture`，20/20 次都能读到最后一帧，
  不再需要 100ms settle。`CaptureService.Flush` / `ReadRange` 已可用，但
  客户端目前仍走 `ReadByIndex`/pcap 批量下载。
- **TrafficService 多端口隔离（已接入并复测通过）**：backend 创建
  template/channel/load_profile，走 `TrafficService.Start/Stop`。eth1 和 eth2
  可以同时 RUNNING；停止其中一个后另一个继续 RUNNING。

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
- **Dot3 + RAW payload（已复测通过）**：走 `HeaderType.DOT3/LLC` +
  YAML `payload: { type: blob, custom: ... }`。引擎把 custom 只写一次、
  剩余最小帧 padding 补零，802.3 length 仍按逻辑数据计算。
  2026-11-14 复测 5/5 正确，Dot3+RAW+MAC random 4/4 正确。
- **Ethernet + RAW payload（已复测通过）**：走 `payload: custom`；
  IPv4 total_len / UDP len / checksum 仍由引擎计算。复测 20/20 payload
  正确（去掉抓包立即停止的竞态后）。
- **SNMP v1/v2c Get/GetNext（已复测通过）**：`packet.proto` 新增的
  `HeaderType.SNMP` 是固定 43B 模板；`PacketBuilder.setSNMP` 的
  version/community/first-varbind-oid 可映射到该模板，抓包侧可完整解码。
- **SNMP 可变 PDU（已复测通过）**：`codec/snmp.ts` 编码 v1/v2c 的 SET /
  Trap / GetBulk / 多 varbind，后端通过 `payload: custom` 放在 UDP 之后；
  SET / Trap / Bulk 抓包解码均通过。
- **SNMP 解码端口**：已修正 UDP 端口不是 161/162 时的 SNMP 识别（之前误把
  UDP 头的首字节当 BER SEQUENCE）。
- **IPv4 / TCP options（已复测通过）**：`PacketBuilder` 的
  `setIPv4({ options: [...] })` / `setTCP({ options: [...] })` 接受
  `{ type, data }[]`；codec 映射到 `HeaderInstance.options`，YAML 下发
  `options: [ { type, data } ]`。引擎自动生成 length、4 字节对齐并修正
  IPv4 IHL / TCP data offset。已验证 Router Alert（IHL=6）和
  MSS/SACK/Timestamp/NOP（dataofs=10）。

当前剩余问题：

1. **SNMP HeaderType 只覆盖固定模板**：v1/v2c Get/GetNext、单 varbind、
   community 固定 6B、OID 固定 8B；SET/TRAP/多 varbind 走 BER payload。
2. **`proto_name` / 自定义动态层未接**：IPv4/TCP options 已接；但
   `HeaderInstance.proto_name` 只对动态 `CUSTOM` 层有意义，当前
   `PacketBuilder` 没有自定义层 API。
3. **BURST 总帧数已生效，但 burst 内 gap 仍未映射**：2026-11-14 复测
   `burst_size=5, burst_count=3` 抓到 15 帧；新引擎增加了 `combine`，
   但 YAML 仍没有 `gap/gap_unit` 字段，所以 `burst_count` 只是被压平成
   “总帧数 + 速率”，不是带间隔的多次 burst。
4. **每次发送会创建/删除资源**：新路径每次发送会创建并清理
   template/channel/load_profile，资源开销比直接 RunService.StartTest 略高；
   端口配置会快照/恢复，避免污染用户配置。
5. **抓包性能**：停止抓包且帧数达到阈值后，`readCapture` 会走
   `Capture.Download -> FileService.Download -> pcap 解析`；否则仍用
   `ReadByIndex`。可用 `STREAM_CONTROL_BATCH_CAPTURE_MIN` 调整阈值。
6. **抓包参数**：`startCapture(port)` 没有 options；backend 固定
   `WRAP + 4MB + 65536 帧`。引擎支持 `maxBytes/maxFrames/snaplen`，但
   没有 BPF 过滤。

### 2026-11-14 proto/网关更新后的新能力

- `TrafficService.Encode(headers)` 可用于报文预览；发送路径不再依赖它，
  直接由 `StreamTemplate.headers` 在引擎侧生成帧。
- `packet.proto` 新增 `DOT3` / `LLC` / `SNAP` / `SNMP` / IPv6 扩展头 /
  `VXLAN` / `PPPOE` HeaderType，以及 `HeaderOption`（IPv4/TCP 选项）和
  `HeaderInstance.proto_name`；字段数从 75 扩到 134。backend 已接
  DOT3/LLC/SNAP/SNMP 字段映射和 IPv4/TCP `HeaderOption`。
- `HeaderType.RAW` 现在会被网关明确拒绝：它不是协议层，只能用
  `PayloadSpec custom/blob` 或整帧 `templateString`。
- `PayloadType.BLOB` 已加入（只写一次 custom、剩余补零），用于 Dot3 LLC data；
  引擎已修复 payload 生命周期（`stream_build()` 深拷贝 custom），现为默认路径。
- `HeaderInstance` 的增删层、`header_length`、`PayloadSpec`（cycle/incr/decr/
  random/custom/blob/PRBS）、`ErrorInjectionSpec`、`StreamTemplate.repeat_count`
  已在网关侧接入；backend 目前只用到 headers 的层栈和字段，error/repeat 还未接。
- `ImportPcap` 单帧上限从 2048B 提升到 16000B（最多 64 帧）。
- `ExtensionService` 已实现 7/10：`ListHeaderTypes` / `ListHeaderProperties` /
  `ListHeaders` / `CreateHeader` / `InsertHeader` / `UpdateHeader` / `DeleteHeader`。
- `EncodeStreamRequest.headers` 不再是 `UNIMPLEMENTED`，可以用于“不启动流量”的
  报文预览和映射校验。

## 兼容性

- 测试统一从 `@/utils/testing` 导入 `PacketBuilder` / `StreamPort` / `TestHelper`。
- `utils/stream/**`、`utils/test-helper.ts`、`RenixPort` 已删除。
- `ModifierField` / `TransmitMode` 等类型仍从 `comm/components` 原样 re-export。
- 支持解码：Ethernet / VLAN / IPv4 / IPv6 / TCP / UDP / ICMP / ARP / Dot3 / LLC / SNAP，
  以及 IPv4/IPv6 上的 SNMP v1/v2c/v3（用于 Storm Control Trap 用例）。
- `PacketBuilder` 新增 `setSNAP({ oui, pid })`；`matchSNAP()` 已接入 `PacketChecker`。
