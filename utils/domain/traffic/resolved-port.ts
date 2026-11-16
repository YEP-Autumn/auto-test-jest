/**
 * 逻辑端口解析后的内部结果。
 */

import type { BackendEndpoint } from "./provider";
import type { PortMapping } from "../topology/model";
import type { TrafficPortId } from "./stream-port";

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
