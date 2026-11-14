# traffic：流量收发抽象层

`utils/traffic` 把“逻辑端口 / 流量后端 / 后端地址 / 拓扑落点”拆开，测试脚本仍然
只引用 `RenixPort.A/B/C/D`，实际使用哪个后端由配置和环境变量决定。

```
测试脚本
  │  RenixPort.A / TrafficConfig.resolvePort("A")
  ▼
TrafficManager                 逻辑端口 -> provider 路由
  ├── RenixHttpBackend         HTTP，backend=renix
  ├── RenixHttpBackend         HTTP，backend=scapy
  └── StreamControlBackend     gRPC，stream-linux
```

## 概念

| 概念     | 类型              | 说明                                            |
| -------- | ----------------- | ----------------------------------------------- |
| 逻辑端口 | `TrafficPortId`   | `A`-`F`，对应 `Config.Renix.portList` 下标      |
| provider | `TrafficProvider` | `renix` / `scapy` / `stream-linux`              |
| address  | `string`          | provider 内部地址：机框端口 / NPF 设备 / `eth1` |
| topology | `PortMapping`     | 原 `portMapping`，表示接在哪个 SDN 设备接口     |

`TrafficPort` 只包含 `id` / `provider` / `address` / `topology`。
`Config.Renix.portList[].port` 也使用 `{ provider, address }`，不再有 `name/type`。

## 能力声明

`TrafficCapabilities` 是控制层使用的保守能力表，发送前只会校验能明确判断的
能力（`modifiers` / `fixed_len`）：

| provider       | transport | modifiers | fixed_len | rawFrame | burstGap  | batchCapture |
| -------------- | --------- | --------- | --------- | -------- | --------- | ------------ |
| `renix`        | http      | ✅        | ✅        | ✅       | ✅        | ✅           |
| `scapy`        | http      | ✅        | ✅        | ✅       | ✅        | ✅           |
| `stream-linux` | grpc      | ✅        | ✅        | ✅       | ⚠️ 未保留 | ✅           |

`burstGap` 暂不强制校验：引擎 YAML 目前只有 `mode/frames/duration_ms/rate`，
没有 burst 内 gap 字段。stream-linux 停止抓包后会在帧数超过阈值时优先走
`Capture.Download + FileService.Download + 本地 pcap 解析`，失败自动退回
`ReadByIndex`。

## 使用

```ts
import { RenixPort } from "@/utils/comm/config";
import { TrafficConfig } from "@/utils/traffic/config";

RenixPort.A;
// 默认 renix-http：
// { id:"A", provider:"renix", address:"//172.16.254.11/3/13",
//   topology:{device:"172.16.9.110", if_index:305} }

// STREAM_BACKEND_KIND=streamcontrol-grpc：
// { id:"A", provider:"stream-linux", address:"eth1", ... }

TrafficConfig.resolvePort("A");
```

测试侧不需要改：

```ts
testHelper.startCapture(RenixPort.B);
testHelper.addPktSender({ port: RenixPort.A, ... });
testHelper.addPktChecker({ port: RenixPort.B, ... });
```

`TestHelper` 内部创建 `TrafficManager`，由它按 `port.provider` 选择后端，
并按物理端口（provider + address）串行化 capture / send / apply。

## 环境变量

| 变量                               | 说明                                                          |
| ---------------------------------- | ------------------------------------------------------------- |
| `TRAFFIC_PROVIDER`                 | 全局 provider：`renix` / `scapy` / `stream-linux`             |
| `TRAFFIC_PROVIDER_A` ... `_F`      | 单端口覆盖，优先级高于 `TRAFFIC_PROVIDER`                     |
| `TRAFFIC_ADDRESS_A` ... `_F`       | 覆盖该逻辑端口解析出的 address                                |
| `STREAM_CONTROL_PORT_MAP`          | stream-linux 的 `A=eth1,B=eth2` 映射                          |
| `STREAM_CONTROL_BATCH_CAPTURE_MIN` | 批量下载阈值（默认 64 帧；0=总是批量，调大=退回 ReadByIndex） |
| `STREAM_BACKEND_KIND`              | 兼容旧配置；`streamcontrol-grpc` 等价于默认 `stream-linux`    |

provider 解析优先级：

```
TRAFFIC_PROVIDER_<id>
  > TRAFFIC_PROVIDER
  > STREAM_BACKEND_KIND=streamcontrol-grpc
  > Config.Renix.portList[].port.type
```

address 解析优先级：

```
TRAFFIC_ADDRESS_<id>
  > stream-linux: STREAM_CONTROL_PORT_MAP / 默认 eth<N>
  > Config.Renix.portList 中同 provider 的 port.name
```

如果某个逻辑端口没有当前 provider 的地址，会直接抛错并提示设置
`TRAFFIC_ADDRESS_<id>`，不会静默退回错误的端口名。

## 示例

### 默认 Renix/Scapy HTTP 后端

```bash
npx jest ...
```

### stream-linux gRPC 后端

```bash
STREAM_BACKEND_KIND=streamcontrol-grpc \
STREAM_CONTROL_HOST=10.10.10.163 \
STREAM_CONTROL_PORT=9443 \
STREAM_CONTROL_TLS=true \
STREAM_CONTROL_CA=/tmp/opencode/streamcontrol/ca.pem \
STREAM_CONTROL_TOKEN=... \
STREAM_CONTROL_PORT_MAP="A=eth1,B=eth2" \
npx jest ...
```

### 单端口指定 provider

```bash
TRAFFIC_PROVIDER_A=renix \
TRAFFIC_PROVIDER_B=stream-linux \
STREAM_CONTROL_PORT_MAP="B=eth2" \
npx jest ...
```

## 当前阶段

Phase 1 已完成：

- `TrafficPort` / `TrafficConfig` / `TrafficManager` / `createTrafficManager()`；
- `RenixPort` 改为通过 `TrafficConfig.resolvePort()` 解析；
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
- `components.ts` 的端口参数类型已从 `StreamPort` 迁移到 `TrafficPort`；
- 拓扑侧新增 `traffic("A")`，`renix("A")` 保留为别名；
- `TrafficConfig.resolveTopology()` 只解析 `portMapping`，不依赖 provider 地址，
  因此切换后端不会影响拓扑创建。

Phase 3 已完成：

- 后端接口统一为 `TrafficBackend`，方法参数使用 `TrafficPort`；
- `StreamBackend` / `StreamPort` 别名已移除；
- `RenixHttpBackend` / `StreamControlBackend` 全部改用 `port.address` / `port.provider`；
- `TrafficPort` 移除了 `name` / `type` 兼容字段；
- `RenixPort.A` 现在只返回 `{ id, provider, address, topology }`；
- `Config.Renix.portList[].port` 迁移为 `{ provider, address }`；
- `TrafficConfig.normalizePort()` 旧对象分支已移除。

Phase 4 已完成：

- stream-linux 抓包停止后优先走 `Capture.Download` + `FileService.Download`；
- 本地解析经典 pcap（little/big endian、微秒/纳秒 magic，Ethernet linktype）；
- 帧数低于阈值、pcap 导出失败或 linktype 不支持时自动退回 `ReadByIndex`；
- 导出的 `.pcap` / `.pcap.json` 读取后通过 `FileService.Delete` 清理；
- `batchCapture` 能力对 stream-linux 标记为 ✅。

后续阶段：

1. 引擎 YAML 增加 burst 内 gap 字段后，再实现精确 BURST 时序并打开 `burstGap` 校验；
2. `HttpTrafficTransport` 仍接受旧 `{ name, type }` 对象，供直接调用旧 HTTP 接口的脚本过渡；如需彻底清理可再移除。
