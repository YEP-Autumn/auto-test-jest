/**
 * 逻辑端口解析器。
 *
 * 输入是 `Config.streamPorts`（顺序即 A/B/C...）以及可选的覆盖项；
 * 不读取全局配置，便于测试时注入。
 */

import type { ProviderId } from "../backends/contract";
import type { StreamPort, StreamPortConfig, TrafficPortId } from "./model";
import { TRAFFIC_PORT_IDS } from "./model";
import type { PortOverrides, ResolvedPort, StreamPortSource } from "./types";

/** 把环境变量/配置里的 provider 字符串归一化 */
export function parseTrafficProvider(value: string): ProviderId {
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

/** 解析 STREAM_CONTROL_PORT_MAP，例如 "A=eth1,B=eth2" */
function parseEnginePortMap(
  raw: string | undefined,
): Partial<Record<TrafficPortId, string>> {
  const map: Partial<Record<TrafficPortId, string>> = {};
  for (const item of (raw ?? "").split(",")) {
    const [key, value] = item.split("=").map((part) => part.trim());
    if (key && value) map[key.toUpperCase() as TrafficPortId] = value;
  }
  return map;
}

/** 从环境变量读取覆盖项；不修改 process.env */
export function readPortOverrides(
  env: NodeJS.ProcessEnv = process.env,
): PortOverrides {
  const provider: Partial<Record<TrafficPortId, ProviderId>> = {};
  const address: Partial<Record<TrafficPortId, string>> = {};

  const globalProvider = env.TRAFFIC_PROVIDER?.trim()
    ? parseTrafficProvider(env.TRAFFIC_PROVIDER)
    : undefined;

  for (const id of TRAFFIC_PORT_IDS) {
    const perPort = env[`TRAFFIC_PROVIDER_${id}`]?.trim();
    if (perPort) provider[id] = parseTrafficProvider(perPort);
    else if (globalProvider) provider[id] = globalProvider;

    const override = env[`TRAFFIC_ADDRESS_${id}`]?.trim();
    if (override) address[id] = override;
  }

  return {
    provider,
    address,
    enginePortMap: parseEnginePortMap(env.STREAM_CONTROL_PORT_MAP),
  };
}

function portIndex(id: TrafficPortId): number {
  const index = TRAFFIC_PORT_IDS.indexOf(id);
  if (index < 0) throw new Error(`未知的逻辑端口：${id}`);
  return index;
}

export class StreamPortResolver {
  private readonly slots: readonly StreamPortConfig[];
  private readonly overrides: PortOverrides;

  constructor(source: StreamPortSource) {
    this.slots = source.slots;
    this.overrides = source.overrides ?? {};
  }

  /** 解析逻辑端口 -> 内部端点 */
  resolve(port: StreamPort): ResolvedPort {
    const slot = this.slot(port);
    const provider = this.providerFor(port.id, slot);
    const address = this.addressFor(port.id, provider, slot);

    return {
      id: port.id,
      endpoint: { provider, address },
      topology: slot.topology,
    };
  }

  /** 只解析拓扑落点，不依赖 provider/address */
  resolveTopology(port: StreamPort | TrafficPortId): ResolvedPort["topology"] {
    const id = typeof port === "string" ? port : port.id;
    return this.slotById(id).topology;
  }

  private slot(port: StreamPort): StreamPortConfig {
    return this.slotById(port.id);
  }

  private slotById(id: TrafficPortId): StreamPortConfig {
    const index = portIndex(id);
    const slot = this.slots[index];
    if (!slot) {
      throw new Error(
        `StreamPort.${id} 未配置：Config.streamPorts 只有 ${this.slots.length} 项`,
      );
    }
    return slot;
  }

  private providerFor(id: TrafficPortId, slot: StreamPortConfig): ProviderId {
    return this.overrides.provider?.[id] ?? slot.provider;
  }

  private addressFor(
    id: TrafficPortId,
    provider: ProviderId,
    slot: StreamPortConfig,
  ): string {
    const override = this.overrides.address?.[id];
    if (override) return override;

    if (provider === "stream-linux") {
      const mapped = this.overrides.enginePortMap?.[id];
      if (mapped) return mapped;
    }

    if (provider === slot.provider) return slot.address;

    throw new Error(
      `StreamPort.${id} 在 Config.streamPorts[${portIndex(id)}] 中配置的是 ` +
        `${slot.provider}（${slot.address}），但当前要求使用 ${provider}。` +
        `请设置 TRAFFIC_ADDRESS_${id}，或直接修改该条目的 provider/address。`,
    );
  }
}

/** 用环境变量覆盖项构造解析器 */
export function resolverFromEnv(
  slots: readonly StreamPortConfig[],
  env: NodeJS.ProcessEnv = process.env,
): StreamPortResolver {
  return new StreamPortResolver({ slots, overrides: readPortOverrides(env) });
}
