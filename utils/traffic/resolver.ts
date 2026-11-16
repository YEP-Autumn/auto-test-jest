/**
 * 逻辑端口解析器。
 *
 * 输入是 `Config.streamPorts`（顺序即 A/B/C...）。
 * 不读取全局配置或环境变量，便于测试时注入。
 */

import type { StreamPort, StreamPortConfig, TrafficPortId } from "./model";
import { TRAFFIC_PORT_IDS } from "./model";
import type { ResolvedPort } from "./types";

function portIndex(id: TrafficPortId): number {
  const index = TRAFFIC_PORT_IDS.indexOf(id);
  if (index < 0) throw new Error(`未知的逻辑端口：${id}`);
  return index;
}

export class StreamPortResolver {
  private readonly slots: readonly StreamPortConfig[];

  constructor(slots: readonly StreamPortConfig[]) {
    this.slots = slots;
  }

  /** 解析逻辑端口 -> 内部端点 */
  resolve(port: StreamPort): ResolvedPort {
    const slot = this.slotById(port.id);
    return {
      id: port.id,
      endpoint: { provider: slot.provider, address: slot.address },
      topology: slot.topology,
    };
  }

  /** 只解析拓扑落点，不依赖 provider/address */
  resolveTopology(port: StreamPort | TrafficPortId): ResolvedPort["topology"] {
    const id = typeof port === "string" ? port : port.id;
    return this.slotById(id).topology;
  }

  private slotById(id: TrafficPortId): StreamPortConfig {
    const index = portIndex(id);
    const slot = this.slots[index];
    if (!slot) {
      throw new Error(
        `StreamPort.${id} 未配置：streamPorts 只有 ${this.slots.length} 项`,
      );
    }
    return slot;
  }
}
