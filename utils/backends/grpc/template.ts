/**
 * stream-linux 模板相关的纯计算辅助：
 * 帧长、帧数、时长。不涉及 gRPC 或资源生命周期。
 */

import { TransmitMode } from "../../packet/types";
import type { SendOptions } from "../contract";
import {
  HeaderInstance,
  HeaderType,
  headerOptionBytesLength,
} from "../codec/grpc/headers";

const HEADER_LENGTH: Record<number, number> = {
  [HeaderType.ETHERNET]: 14,
  [HeaderType.VLAN]: 4,
  [HeaderType.IPV4]: 20,
  [HeaderType.IPV6]: 40,
  [HeaderType.TCP]: 20,
  [HeaderType.UDP]: 8,
  [HeaderType.ARP]: 28,
  [HeaderType.ICMP]: 8,
  [HeaderType.ICMPV6]: 8,
  [HeaderType.GRE]: 4,
  [HeaderType.MPLS]: 4,
  [HeaderType.DOT3]: 14,
  [HeaderType.LLC]: 3,
  [HeaderType.SNAP]: 5,
  [HeaderType.SNMP]: 43,
};

export function headerLength(header: HeaderInstance): number {
  return (
    (HEADER_LENGTH[header.type] ?? 0) +
    headerOptionBytesLength(header.options)
  );
}

export function headerLengthTotal(headers: HeaderInstance[]): number {
  return headers.reduce((sum, header) => sum + headerLength(header), 0);
}

/** 计算 headers 层栈的最小帧长；SNMP/IPv6+TCP 等会超过默认 64B */
export function frameLengthForHeaders(
  headers: HeaderInstance[],
  dot3PayloadLen?: number,
): number {
  const headerTotal = headerLengthTotal(headers);
  if (dot3PayloadLen !== undefined) {
    // 14B 以太网头 + 802.3 length；但如果内层头本身就超过它，以头总长为准
    return Math.max(14 + dot3PayloadLen, headerTotal);
  }
  return Math.max(64, headerTotal);
}

export function framesFromOptions(options: SendOptions): number {
  if (options.count !== undefined) return Math.max(1, options.count);
  const transmit: any = options.transmit;
  const param: any = transmit?.param ?? {};
  if (transmit?.mode === TransmitMode.STEP) {
    return Math.max(1, Number(param.step_count ?? 1));
  }
  if (transmit?.mode === TransmitMode.BURST) {
    const size = Math.max(1, Number(param.burst_size ?? 1));
    const count = Math.max(1, Number(param.burst_count ?? 1));
    // 防止异常参数把引擎打爆；旧用例里 1000000 是洪泛意图，保留。
    return Math.min(size * count, 10_000_000);
  }
  return 0;
}

export function durationFromOptions(options: SendOptions): number {
  const transmit: any = options.transmit;
  if (transmit?.mode === TransmitMode.TIME) {
    const seconds = Number(transmit.param?.time_seconds ?? 0);
    return Math.max(1, Math.round(seconds * 1000));
  }
  return 0;
}
