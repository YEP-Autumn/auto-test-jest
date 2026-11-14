import { StreamBackendConfig, StreamBackendKind } from "../../comm/config";
import { RenixHttpBackend } from "./renix-http";
import { StreamControlBackend } from "./streamcontrol";
import { TrafficBackend } from "./types";

/**
 * 按配置创建单个打流/抓包后端。
 *
 * 注意：TestHelper 已改为使用 `utils/traffic` 的 `createTrafficManager()`，
 * 由控制层按逻辑端口的 provider 路由到 Renix / Scapy / stream-linux。
 * 这里的工厂保留用于直接创建后端或旧代码兼容。
 *
 * 默认保持原行为（renix-http）；设置 STREAM_BACKEND_KIND=streamcontrol-grpc
 * 可切到 streamcontrol gRPC 后端。
 */
export function createStreamBackend(
  kind: StreamBackendKind = StreamBackendConfig.kind,
): TrafficBackend {
  switch (kind) {
    case "streamcontrol-grpc":
      return new StreamControlBackend();
    case "renix-http":
      return new RenixHttpBackend();
    default: {
      // 配置写错时不要静默回退，避免"以为切了后端其实没切"
      throw new Error(`[stream] 未知的 STREAM_BACKEND_KIND: ${String(kind)}`);
    }
  }
}
