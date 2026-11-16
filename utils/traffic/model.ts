/**
 * 流量端口模型。
 *
 * 对外只暴露 `StreamPort`（逻辑端口令牌），测试用例不感知 provider /
 * address / topology。配置在 `Config.streamPorts` 中，按数组顺序映射到
 * `StreamPort.A/B/C...`。
 */

import type { PortMapping } from "../topo/types";
import type { ProviderId } from "../backends/contract";

/** 逻辑端口号，对应 `Config.streamPorts` 的数组下标 */
export type TrafficPortId =
  "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";

/** 逻辑端口顺序；数组下标 -> 端口 id */
export const TRAFFIC_PORT_IDS: readonly TrafficPortId[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
];

/**
 * 测试用例使用的逻辑端口令牌。
 *
 * 它只有一个 id，不包含 provider / address / topology；具体使用哪个
 * 后端和物理端口完全由 `Config.streamPorts` 的数组顺序决定。
 */
export class StreamPort {
  private constructor(readonly id: TrafficPortId) {}

  static readonly A = new StreamPort("A");
  static readonly B = new StreamPort("B");
  static readonly C = new StreamPort("C");
  static readonly D = new StreamPort("D");
  static readonly E = new StreamPort("E");
  static readonly F = new StreamPort("F");
  static readonly G = new StreamPort("G");
  static readonly H = new StreamPort("H");
  static readonly I = new StreamPort("I");
  static readonly J = new StreamPort("J");

  toString(): string {
    return `StreamPort.${this.id}`;
  }
}

/**
 * `Config.streamPorts` 的单项配置。
 *
 * 数组顺序即逻辑端口：第 0 项 = StreamPort.A，第 1 项 = StreamPort.B ...
 * 调整测试实际使用的物理端口时，只需要调整数组顺序。
 */
export interface StreamPortConfig {
  /** 实际使用的后端 */
  provider: ProviderId;
  /** 该后端的物理地址（机框端口 / NPF 设备 / eth1） */
  address: string;
  /** 拓扑落点：接在哪个 SDN 设备的哪个接口 */
  topology: PortMapping;
}
