# traffic：逻辑端口与会话编排

测试用例只使用逻辑端口 `StreamPort.A/B/C...`，不需要知道后端类型、地址、网卡名或拓扑细节。
实际使用哪个端口由 `config/env/default.json` 的 `traffic.ports` 决定：
**数组顺序就是 A/B/C 映射**，第 0 项 = `StreamPort.A`。

```text
测试脚本
  │  StreamPort.A / StreamPort.B
  ▼
TestHelper                      记录逻辑端口
  │
  ▼
StreamPortResolver              按数组下标读取 streamPorts
  │
  ▼
TrafficSession                  会话编排 / 端口串行化 / 能力校验
  │
  ▼
BackendRegistry                 按 provider 选择适配器
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
import { PacketBuilder, StreamPort, TransmitMode } from "@/utils";

testHelper.startCapture(StreamPort.B);

testHelper.addPktSender({
  port: StreamPort.A,
  packet: new PacketBuilder()
    .setEthernet({
      dst: "00:11:22:33:44:55",
      src: "66:77:88:99:aa:bb",
      type: 0x0800,
    })
    .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2", ttl: 64, proto: 17 })
    .setUDP({ sport: 1234, dport: 5678 }),
  transmit_param: { mode: TransmitMode.STEP, param: { step_count: 10 } },
});

testHelper.addPktChecker({
  port: StreamPort.B,
  expected_count: 10,
  packet: new PacketBuilder().setEthernet({
    dst: "00:11:22:33:44:55",
    src: "66:77:88:99:aa:bb",
    type: 0x0800,
  }),
});
```

测试代码里不会出现 provider、IP、NPF 设备、`eth1` 或 `topology`。

## 配置

端口定义在 `config/env/default.json`：

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

- 调整数组顺序即可改变 `StreamPort.A/B/C` 的物理映射，测试代码不变。
- 本机覆盖写入 `config/env/local.json`；数组整体替换，不做逐项合并。
- 不再支持 `TRAFFIC_PROVIDER`、`TRAFFIC_ADDRESS_*`、`STREAM_CONTROL_PORT_MAP` 等环境变量。

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

## 代码位置

| 路径                                    | 职责                                    |
| --------------------------------------- | --------------------------------------- |
| `utils/domain/traffic/stream-port.ts`   | `StreamPort` / `TrafficPortId`          |
| `utils/domain/traffic/resolved-port.ts` | `ResolvedPort` / `resolvedPortKey`      |
| `utils/domain/traffic/capabilities.ts`  | provider 能力表                         |
| `utils/runtime/traffic/resolver.ts`     | 逻辑端口 -> endpoint/topology           |
| `utils/runtime/traffic/session.ts`      | 端口预留、发送、抓包、串行化            |
| `utils/runtime/traffic/registry.ts`     | 按 provider 惰性创建后端                |
| `utils/runtime/config/traffic.ts`       | `streamPorts` 配置入口                  |
| `utils/adapters/traffic/**`             | Renix HTTP / streamcontrol gRPC / codec |

## 能力声明

`TrafficCapabilities` 是发送前的保守能力表：

| provider       | transport | modifiers | fixedLength | burstGap | batchCapture |
| -------------- | --------- | --------- | ----------- | -------- | ------------ |
| `renix`        | http      | ✅        | ✅          | ✅       | ✅           |
| `scapy`        | http      | ✅        | ✅          | ✅       | ✅           |
| `stream-linux` | grpc      | ✅        | ✅          | ✅       | ✅           |

`TrafficSession` 在发送前校验 `modifiers` / `fixedLength`；不满足时直接抛错，
不会静默降级。`batchCapture` 只影响 streamcontrol 停止抓包后的读取路径：
帧数达到阈值时优先走 `Capture.Download + FileService.Download + 本地 pcap 解析`，
失败自动退回 `ReadByIndex`。
