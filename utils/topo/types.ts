/**
 * 拓扑（topology）相关的共享类型。
 *
 * 这些类型被 link-constraint / topologies / topo-api / test-helper 共同引用，
 * 单独抽出以避免各处内联重复定义。
 */

/** 一个物理端口：所在设备 + 端口索引 */
export interface PortMapping {
  device: string;
  if_index: number;
}

/** 一条单向链路 */
export interface Link {
  stream_id: number;
  vlan?: number;
  in_port: PortMapping;
  out_port: PortMapping;
}

/** 一组链路，即一个拓扑 */
export interface TopoLinks {
  links: Link[];
}

/**
 * 反向链路 stream_id 的偏移量。
 *
 * `topo-api.ts` 会为每条链路生成一条反向链路，其 id 为
 * `REVERSE_STREAM_ID_BASE + stream_id`。因此正向 stream_id 必须小于该值，
 * 否则正反向 id 会冲突。`validateTopo` 会对此做校验。
 */
export const REVERSE_STREAM_ID_BASE = 1 << 12; // 4096
