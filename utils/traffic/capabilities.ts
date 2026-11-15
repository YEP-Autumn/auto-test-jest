/**
 * 流量后端能力声明。
 *
 * 不同 provider 的收发能力并不完全一致。这里放一份保守的静态表，供控制层
 * 或测试在发送前做快速校验；具体报文/字段级能力仍以后端实现为准。
 */

import type { ProviderId } from "../backends/contract";

export type TrafficCapabilityName =
  "modifiers" | "fixedLength" | "burstGap" | "batchCapture";

export interface TrafficCapabilities {
  provider: ProviderId;
  transport: "http" | "grpc";
  supports: Record<TrafficCapabilityName, boolean>;
  /** 同时可运行的 run 数；无硬限制时为空 */
  maxConcurrentRuns?: number;
}

const CAPABILITIES: Record<ProviderId, TrafficCapabilities> = {
  renix: {
    provider: "renix",
    transport: "http",
    supports: {
      modifiers: true,
      fixedLength: true,
      burstGap: true,
      batchCapture: true,
    },
  },
  scapy: {
    provider: "scapy",
    transport: "http",
    supports: {
      modifiers: true,
      fixedLength: true,
      burstGap: true,
      batchCapture: true,
    },
  },
  "stream-linux": {
    provider: "stream-linux",
    transport: "grpc",
    supports: {
      modifiers: true,
      fixedLength: true,
      // 新网关/引擎支持 frames_per_burst + burst_gap（feature=traffic-burst-gap）
      burstGap: true,
      // 抓包停止后优先走 Capture.Download + FileService.Download + pcap
      batchCapture: true,
    },
    maxConcurrentRuns: 4,
  },
};

export function getTrafficCapabilities(
  provider: ProviderId,
): TrafficCapabilities {
  return CAPABILITIES[provider];
}

export function supportsTrafficCapability(
  provider: ProviderId,
  capability: TrafficCapabilityName,
): boolean {
  return getTrafficCapabilities(provider).supports[capability] === true;
}

/** 不支持时抛出可读错误，供发送前的快速校验使用 */
export function assertTrafficCapability(
  provider: ProviderId,
  capability: TrafficCapabilityName,
): void {
  if (!supportsTrafficCapability(provider, capability)) {
    throw new Error(`流量后端 ${provider} 不支持能力 ${capability}`);
  }
}
