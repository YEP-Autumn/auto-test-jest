/**
 * traffic 应用层的共享类型。
 */

import type { BackendEndpoint, ProviderId } from "../backends/contract";
import type { PortMapping } from "../topo/types";
import type { StreamPort, StreamPortConfig, TrafficPortId } from "./model";

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

export type { BackendEndpoint, ProviderId };
export type { StreamPort, StreamPortConfig };
