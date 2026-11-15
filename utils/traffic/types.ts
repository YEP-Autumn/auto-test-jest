/**
 * traffic 应用层的共享类型。
 */

import type { BackendEndpoint, ProviderId } from "../backends/contract";
import type { PortMapping } from "../topo/types";
import type {
  StreamPort,
  StreamPortConfig,
  TrafficPortId,
} from "./model";

/** 逻辑端口 + 实际后端地址 + 拓扑落点（仅内部使用） */
export interface ResolvedPort {
  id: TrafficPortId;
  endpoint: BackendEndpoint;
  topology: PortMapping;
}

/** 后端资源层面的唯一 key；同一物理端口共用锁和预留状态 */
export function resolvedPortKey(port: ResolvedPort): string {
  return `${port.endpoint.provider}:${port.endpoint.address}`;
}

/** 逻辑端口在解析时可用的覆盖项（来自环境变量或测试注入） */
export interface PortOverrides {
  provider?: Partial<Record<TrafficPortId, ProviderId>>;
  address?: Partial<Record<TrafficPortId, string>>;
  /** stream-linux 的 A=eth1,B=eth2 映射 */
  enginePortMap?: Partial<Record<TrafficPortId, string>>;
}

/** 解析器输入：顺序即 A/B/C... */
export interface StreamPortSource {
  slots: readonly StreamPortConfig[];
  overrides?: PortOverrides;
}

export type { BackendEndpoint, ProviderId };
export type { StreamPort };
