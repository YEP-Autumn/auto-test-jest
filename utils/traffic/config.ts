/**
 * 流量端口解析。
 *
 * Phase 1 不改现有 `Config.Renix.portList` 的数据结构，而是把它当作
 * “逻辑端口 -> 主 provider 落点 + topology” 的来源，再结合环境变量解析出
 * 当前要使用的 `TrafficPort`。
 *
 * 解析优先级（provider）：
 *   TRAFFIC_PROVIDER_<A-F> > TRAFFIC_PROVIDER
 *   > 旧 STREAM_BACKEND_KIND=streamcontrol-grpc > Config 中的 port.type
 *
 * 解析优先级（address）：
 *   TRAFFIC_ADDRESS_<A-F>
 *   > stream-linux: STREAM_CONTROL_PORT_MAP / 默认 eth<N>
 *   > Config 中同 provider 的 port.name
 */

import { Config, StreamBackendConfig } from "../comm/config";
import type { ConfiguredTrafficPort } from "../comm/config";
import type { PortMapping } from "../topo/types";
import type { TrafficPort, TrafficPortId, TrafficProvider } from "./model";

/** 逻辑端口 A-F，与 Config.Renix.portList 的下标一一对应 */
export const TRAFFIC_PORT_IDS: readonly TrafficPortId[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];

interface ConfiguredPortEntry {
  /** Config.Renix 中的物理端口（provider + address） */
  port: ConfiguredTrafficPort;
  /** 拓扑落点 */
  portMapping: PortMapping;
}

/** 把环境变量/配置里的 provider 字符串归一化 */
export function parseTrafficProvider(value: string): TrafficProvider {
  switch (value.trim().toLowerCase()) {
    case "renix":
      return "renix";
    case "scapy":
      return "scapy";
    case "stream-linux":
    case "streamlinux":
    case "streamcontrol-grpc":
    case "grpc":
      return "stream-linux";
    default:
      throw new Error(
        `未知的流量后端 "${value}"，可选值：renix / scapy / stream-linux`,
      );
  }
}

/**
 * 解析 STREAM_CONTROL_PORT_MAP，例如 "A=eth1,B=eth2"。
 *
 * 只解析环境变量，不访问 Config，避免与 utils/comm/config 的循环引用在
 * 模块初始化阶段触发 TDZ。
 */
function parseEnginePortMap(raw: string | undefined): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of (raw ?? "").split(",")) {
    const [key, value] = item.split("=").map((part) => part.trim());
    if (key && value) map[key.toUpperCase()] = value;
  }
  return map;
}

export class TrafficConfig {
  /** stream-linux 的逻辑端口 -> 引擎网卡名 */
  private static readonly enginePortMap = parseEnginePortMap(
    process.env.STREAM_CONTROL_PORT_MAP,
  );

  /**
   * 解析逻辑端口 A-F。
   *
   * 返回的 `TrafficPort` 只包含 id/provider/address/topology。
   */
  static resolvePort(id: TrafficPortId): TrafficPort {
    const index = TRAFFIC_PORT_IDS.indexOf(id);
    const entry = Config.Renix.portList[index] as
      ConfiguredPortEntry | undefined;
    if (!entry) {
      throw new Error(
        `逻辑端口 ${id} 未在 Config.Renix.portList 中配置（索引 ${index}）`,
      );
    }

    const provider = this.providerFor(id, entry);
    const address = this.addressFor(id, index, provider, entry);
    const topology = entry.portMapping;

    return {
      id,
      provider,
      address,
      topology,
    };
  }

  /**
   * 只解析逻辑端口的拓扑落点，不依赖当前 provider 的地址配置。
   *
   * 拓扑控制只需要知道“接在哪个 SDN 设备接口”，即使该端口当前没有配置
   * 任何流量后端地址，也不应该影响拓扑创建。
   */
  static resolveTopology(id: TrafficPortId): PortMapping {
    const index = TRAFFIC_PORT_IDS.indexOf(id);
    const entry = Config.Renix.portList[index] as
      ConfiguredPortEntry | undefined;
    if (!entry) {
      throw new Error(
        `逻辑端口 ${id} 未在 Config.Renix.portList 中配置（索引 ${index}）`,
      );
    }
    return entry.portMapping;
  }

  private static providerFor(
    id: TrafficPortId,
    entry: ConfiguredPortEntry,
  ): TrafficProvider {
    const perPort = process.env[`TRAFFIC_PROVIDER_${id}`]?.trim();
    if (perPort) return parseTrafficProvider(perPort);

    const global = process.env.TRAFFIC_PROVIDER?.trim();
    if (global) return parseTrafficProvider(global);

    // 兼容旧的全局后端开关
    if (StreamBackendConfig.kind === "streamcontrol-grpc") {
      return "stream-linux";
    }

    return parseTrafficProvider(entry.port.provider);
  }

  private static addressFor(
    id: TrafficPortId,
    index: number,
    provider: TrafficProvider,
    entry: ConfiguredPortEntry,
  ): string {
    const override = process.env[`TRAFFIC_ADDRESS_${id}`]?.trim();
    if (override) return override;

    if (provider === "stream-linux") {
      return this.enginePortMap[id] ?? `eth${index + 1}`;
    }

    if (provider === parseTrafficProvider(entry.port.provider)) {
      return entry.port.address;
    }

    throw new Error(
      `逻辑端口 ${id} 没有 ${provider} 后端地址。` +
        `当前 Config.Renix.portList 中该端口是 ${entry.port.provider}` +
        `（${entry.port.address}）。请设置 TRAFFIC_ADDRESS_${id}，` +
        `或在 Config 中补该 provider 的地址。`,
    );
  }
}
