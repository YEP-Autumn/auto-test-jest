/**
 * 流量收发（traffic）领域的共享模型。
 *
 * 这里刻意把四个概念分开：
 *   1. 逻辑端口：A/B/C/D，测试脚本只引用它；
 *   2. provider：renix / scapy / stream-linux，决定用哪套收发实现；
 *   3. address：provider 内部的物理地址（机框端口 / NPF 设备 / eth1）；
 *   4. topology：该端口接在哪个 SDN 设备的哪个接口（原 portMapping）。
 */

import type { PortMapping } from "../topo/types";

/** 流量后端类型 */
export type TrafficProvider = "renix" | "scapy" | "stream-linux";

/** 逻辑端口号，对应 Config.Renix.portList 的下标 A=0 .. F=5 */
export type TrafficPortId = "A" | "B" | "C" | "D" | "E" | "F";

/**
 * 测试和组件使用的逻辑端口。
 *
 * - `id`：逻辑端口号；自定义端口可能没有对应配置，因此允许为空。
 * - `provider`：实际使用的流量后端。
 * - `address`：provider 内部地址。
 * - `topology`：拓扑落点，对应旧的 `portMapping`。
 */
export interface TrafficPort {
  id?: TrafficPortId;
  provider: TrafficProvider;
  address: string;
  topology?: PortMapping;
}

/** 端口在每个 provider 上的物理落点 */
export interface TrafficEndpointConfig {
  /** provider 内部的物理地址 */
  address: string;
  /** 可选：覆盖端口默认 topology */
  topology?: PortMapping;
}

/**
 * 逻辑端口配置。
 *
 * Phase 1 仍以 `Config.Renix.portList` 为数据源，由 `TrafficConfig` 派生；
 * 后续可以把这里作为唯一的端口配置入口。
 */
export interface TrafficPortConfig {
  id: TrafficPortId;
  /** 该逻辑端口的默认拓扑落点 */
  topology: PortMapping;
  /** 同一逻辑端口在不同流量后端上的落点 */
  endpoints: Partial<Record<TrafficProvider, TrafficEndpointConfig>>;
  /** 可选默认 provider；环境变量优先级更高 */
  provider?: TrafficProvider;
}
