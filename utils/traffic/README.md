# traffic：流量收发抽象层

测试用例只使用逻辑端口 `StreamPort.A/B/C...`，**不需要知道后端类型、地址、
网卡名或拓扑细节**。实际使用哪个端口由 `utils/config/traffic.ts` 中 `streamPorts` 的
**数组顺序**决定：第 0 项 = `StreamPort.A`，第 1 项 = `StreamPort.B`，以此类推。

```
测试脚本
  │  StreamPort.A / StreamPort.B
  ▼
TestHelper                     只记录逻辑端口
  │
  ▼
StreamPortResolver             按数组下标读取 streamPorts + 环境覆盖
  │
  ▼
TrafficSession                 会话编排 / 端口串行化 / 能力校验
  │
  ▼
BackendRegistry                按 provider 选择适配器
  ├── RenixHttpBackend        HTTP，backend=renix
  ├── RenixHttpBackend        HTTP，backend=scapy
  └── StreamControlBackend    gRPC，stream-linux
```

## 概念

| 概念           | 说明                                                   |
| -------------- | ------------------------------------------------------ |
| `StreamPort`   | 对外唯一令牌，只含逻辑 id；测试用例只接触这个          |
| `streamPorts`  | 有序端口配置；数组顺序决定 A/B/C 实际使用哪个端口      |
| `ResolvedPort` | 内部解析结果（endpoint + topology），不对外暴露        |
| provider       | `renix` / `scapy` / `stream-linux`，只在配置和内部出现 |

## 使用

```ts
import { StreamPort } from "@/utils/testing";

testHelper.startCapture(StreamPort.B);

testHelper.addPktSender({
  port: StreamPort.A,
  packet: new PacketBuilder()
    .setEthernet({ ... })
    .setIPv4({ ... }),
  transmit_param: { mode: TransmitMode.STEP, param: { step_count: 10 } },
});

testHelper.addPktChecker({
  port: StreamPort.B,
  expected_count: 10,
  packet: new PacketBuilder()
    .setEthernet({ ... })
    .setIPv4({ ... }),
});
```

测试代码里不会出现 provider、IP、NPF 设备、`eth1` 或 `topology`。

## 配置

配置在 `utils/config/traffic.ts`，**数组顺序就是逻辑端口**：

```ts
export const streamPorts: StreamPortConfig[] = [
  {
    // A
    provider: "renix",
    address: "//172.16.254.11/3/13",
    topology: { device: "172.16.9.110", if_index: 305 },
  },
  {
    // B
    provider: "renix",
    address: "//172.16.254.11/3/14",
    topology: { device: "172.16.9.110", if_index: 561 },
  },
  // ...
];
```

调整实际使用的端口只需要调整数组顺序，例如把 B 的条目放到第一项：

```ts
// 把 streamPorts 的条目顺序调整为 [原 B, 原 A, ...]
streamPorts.splice(0, streamPorts.length, 原B, 原A, ...);
```

之后 `StreamPort.A` 就使用原 B 的物理端口，测试代码完全不变。

需要切到 stream-linux 时，直接修改条目的 `provider` / `address`：

```ts
{
  provider: "stream-linux",
  address: "eth1",
  topology: { device: "172.16.9.110", if_index: 305 },
}
```

后端服务地址（HTTP 服务、gRPC 网关、token）不属于端口条目，由
`StreamBackendConfig` / `StreamControlConfig` 维护，可通过
`Config.trafficBackends` 查看。

## 迁移

旧 `RenixPort` / `Config.Renix.portList` / `TrafficManager` 已删除；
测试统一使用 `StreamPort.A/B/...`。

## JSON 配置

流量端口由 `config/env/default.json` 的 `traffic.ports` 配置，本机可在
`config/env/local.json` 覆盖。顺序即逻辑端口：

```json
{
  "traffic": {
    "ports": [
      {
        "provider": "renix",
        "address": "//172.16.254.11/3/13",
        "topology": { "device": "172.16.9.110", "if_index": 305 }
      },
      {
        "provider": "stream-linux",
        "address": "eth1",
        "topology": { "device": "172.16.9.110", "if_index": 305 }
      }
    ]
  }
}
```

不再支持 `TRAFFIC_PROVIDER`、`TRAFFIC_ADDRESS_*`、
`STREAM_CONTROL_PORT_MAP` 等环境变量；切换 provider/address 直接改 JSON。

`streamcontrol` 网关参数同样在 JSON 中：

```json
{
  "traffic": {
    "streamControl": {
      "host": "10.10.10.163",
      "port": "9443",
      "tls": true,
      "tlsInsecure": false,
      "ca": "/path/to/ca.pem",
      "token": "...",
      "debugCapture": false,
      "batchCaptureMin": 64
    }
  }
}
```

## 示例

### 默认 Renix/Scapy HTTP 后端

直接运行：

```bash
npx jest ...
```

### stream-linux gRPC 后端

修改 `config/env/default.json` 或 `local.json`：

```json
{
  "traffic": {
    "ports": [
      {
        "provider": "stream-linux",
        "address": "eth1",
        "topology": { "device": "172.16.9.110", "if_index": 305 }
      }
    ],
    "streamControl": {
      "host": "10.10.10.163",
      "port": "9443",
      "tls": true,
      "ca": "/path/to/ca.pem",
      "token": "..."
    }
  }
}
```

然后运行 `npx jest ...`。

## 能力声明

`TrafficCapabilities` 是控制层使用的保守能力表，发送前只会校验能明确判断的
能力（`modifiers` / `fixed_len`）：

| provider       | transport | modifiers | fixed_len | burstGap | batchCapture |
| -------------- | --------- | --------- | --------- | -------- | ------------ |
| `renix`        | http      | ✅        | ✅        | ✅       | ✅           |
| `scapy`        | http      | ✅        | ✅        | ✅       | ✅           |
| `stream-linux` | grpc      | ✅        | ✅        | ✅       | ✅           |

`burstGap` 通过 `StreamChannel.transmit` 下发：`frames_per_burst` /
`burst_count` / `burst_gap` / `burst_gap_unit`，需要网关能力
`feature=traffic-burst-gap`；缺失时 backend 会明确报错。stream-linux 停止抓包后
会在帧数超过阈值时优先走 `Capture.Download + FileService.Download + 本地 pcap 解析`，
失败自动退回 `ReadByIndex`。

## 当前阶段

Phase 1 已完成：

- `TrafficPort` / `TrafficConfig` / `TrafficManager` / `createTrafficManager()`；
- `TestHelper` 改用 `TrafficManager`，测试代码无需修改；
- `TrafficManager` 支持同一测试内按端口路由多个 provider；
- 复用现有 `RenixHttpBackend` / `StreamControlBackend`，收发逻辑未重写。

Phase 2 已完成：

- 新增 `HttpTrafficTransport`，集中登录、token、multipart 上传和 `{port, backend}` 归一化；
- `RenixHttpBackend` 只保留 `TrafficBackend` 语义，HTTP 请求委托给 transport；
- Renix / Scapy 共用同一个 transport，混用时只登录一次；
- 误把 `stream-linux` 端口交给 HTTP 后端会立即抛错；
- 新增 `TrafficCapabilities` / `getTrafficCapabilities()` / `assertTrafficCapability()`；
- `TrafficManager.sendPacket()` 在发送前校验 `modifiers` 和 `fixed_len` 能力；
- `components.ts` 的端口参数在 Phase 5 起改为 `StreamPort`；
- 拓扑侧统一使用 `traffic("A")`；
- `TrafficConfig.resolveTopology()` 只解析 `portMapping`，不依赖 provider 地址，
  因此切换后端不会影响拓扑创建。

Phase 3 已完成：

- 后端接口统一为 `TrafficBackend`，方法参数使用 `TrafficPort`；
- `StreamBackend` / `StreamPort` 别名已移除；
- `RenixHttpBackend` / `StreamControlBackend` 全部改用 `port.address` / `port.provider`；
- `TrafficPort` 移除了 `name` / `type` 兼容字段；
- `RenixPort.A` 当时返回内部 `TrafficPort`（Phase 5 起改为 `StreamPort` 别名）；
- `Config.Renix.portList[].port` 当时迁移为 `{ provider, address }`（Phase 5 已删除）；
- `TrafficConfig.normalizePort()` 旧对象分支已移除。

Phase 4 已完成：

- stream-linux 抓包停止后优先走 `Capture.Download` + `FileService.Download`；
- 本地解析经典 pcap（little/big endian、微秒/纳秒 magic，Ethernet linktype）；
- 帧数低于阈值、pcap 导出失败或 linktype 不支持时自动退回 `ReadByIndex`；
- 导出的 `.pcap` / `.pcap.json` 读取后通过 `FileService.Delete` 清理；
- `batchCapture` 能力对 stream-linux 标记为 ✅。

Phase 5 已完成（对外屏蔽端口细节）：

- 新增 `StreamPort.A/B/C...` 逻辑端口令牌，只包含 id；
- `streamPorts` 改为有序数组，数组顺序即 A/B/C 映射；
- 调整实际端口只需要调整数组顺序，测试代码不变；
- 每个条目只配置一个 `provider + address + topology`；
- `TrafficConfig.resolvePort(StreamPort)` 只在内部使用，返回 `TrafficPort`；
- `TestHelper` / `components` 的公开端口类型改为 `StreamPort`；
- 删除 `Config.Renix.portList`；
- `RenixPort` 已删除，测试统一使用 `StreamPort.A/B/...`。

后续阶段：

2. `HttpTrafficTransport` 仍接受旧 `{ name, type }` 对象，供直接调用旧 HTTP 接口的脚本过渡；如需彻底清理可再移除。
