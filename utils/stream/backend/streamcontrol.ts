/**
 * streamcontrol gRPC 后端。
 *
 * 对应契约：utils/rpc/grpc/streamcontrol.proto（streamcontrol.v1）。
 *
 * 关键点（基于 2026-11-14 网关实测）：
 * - 鉴权：metadata `authorization: Bearer <token>`；TLS 可用 CA 或 TLS_INSECURE。
 * - 抓包：Capture.Create 的 spec 必须是 Struct 形态，且 port 是端口名字符串；
 *   ReadByIndex 返回原始帧，由 codec/raw-frame 解码成 PacketLayer。
 * - 发送：PacketBuilder -> packet.proto headers -> YAML blocks，
 *   通过 ConfigService draft/apply 下发，再用 RunService.StartTest 启动。
 *   这样避免 TrafficService.Start 每次 apply 时要求“所有端口关闭”，
 *   因此可以在抓包运行期间启动打流。
 * - 发送前需要临时关闭所有已打开端口（CONFIG_APPLY 限制），apply 后按需重开
 *   TX 端口和抓包端口。
 */

import * as fs from "fs";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { StreamControlConfig } from "../../comm/config";
import type { TrafficPort } from "../../traffic/model";
import { FieldType, PacketSpec } from "../packet/model";
import { ModifierField, TransmitMode } from "../packet/types";
import { decodeFrame } from "../codec/raw-frame";
import { encodeDot3Llc } from "../codec/raw-frame-encode";
import { macToBuffer } from "../codec/address";
import {
  HeaderInstance,
  HeaderType,
  packetToHeaders,
} from "../codec/packet-headers";
import { toStruct } from "./grpc-struct";
import { CapturedPacket, SendOptions, TrafficBackend } from "./types";

/** 业务错误检查：契约约定 Result.code != 0 表示失败 */
function assertResult(result: any, op: string): void {
  if (!result) return;
  const code = Number(result.code ?? 0);
  if (code !== 0) {
    const detail = [
      `code=${code}`,
      result.message ? `message=${result.message}` : "",
      result.path ? `path=${result.path}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    throw new Error(`[streamcontrol] ${op} failed: ${detail}`);
  }
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 批量抓包阈值：capture 帧数达到该值后优先走
 * Capture.Download + FileService.Download + 本地 pcap 解析。
 *
 * 设为 0 表示只要停止抓包就批量下载；设为很大的值可退回 ReadByIndex。
 */
function batchCaptureThreshold(): number {
  const raw = process.env.STREAM_CONTROL_BATCH_CAPTURE_MIN;
  if (raw === undefined) return 64;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : 64;
}

/**
 * 解析经典 pcap（Ethernet linktype）。
 *
 * 引擎默认导出 pcap（`sl_pcap_export`），magic 为 0xa1b2c3d4 / 0xa1b23c4d。
 * pcapng 暂不支持，调用方会退回 ReadByIndex。
 */
function parsePcapFrames(buffer: Buffer): CapturedPacket[] {
  if (buffer.length < 24) {
    throw new Error("[streamcontrol] pcap 文件过短");
  }

  const leMagic = buffer.readUInt32LE(0);
  const beMagic = buffer.readUInt32BE(0);
  let littleEndian: boolean;
  let nanosecond: boolean;

  if (leMagic === 0xa1b2c3d4) {
    littleEndian = true;
    nanosecond = false;
  } else if (beMagic === 0xa1b2c3d4) {
    littleEndian = false;
    nanosecond = false;
  } else if (leMagic === 0xa1b23c4d) {
    littleEndian = true;
    nanosecond = true;
  } else if (beMagic === 0xa1b23c4d) {
    littleEndian = false;
    nanosecond = true;
  } else {
    throw new Error(
      `[streamcontrol] 不支持的 pcap magic 0x${beMagic.toString(16)}`,
    );
  }

  const u32 = (offset: number) =>
    littleEndian ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);

  const linkType = u32(20);
  if (linkType !== 1) {
    throw new Error(`[streamcontrol] 不支持的 pcap linktype ${linkType}`);
  }

  const packets: CapturedPacket[] = [];
  let offset = 24;
  while (offset + 16 <= buffer.length) {
    const tsSec = u32(offset);
    const tsFrac = u32(offset + 4);
    const inclLen = u32(offset + 8);
    offset += 16;

    if (inclLen === 0 || offset + inclLen > buffer.length) break;

    const raw = Buffer.from(buffer.subarray(offset, offset + inclLen));
    offset += inclLen;

    const timestampNs =
      BigInt(tsSec) * 1_000_000_000n +
      (nanosecond ? BigInt(tsFrac) : BigInt(tsFrac) * 1000n);

    packets.push({
      raw,
      timestampNs,
      layers: decodeFrame(raw),
    });
  }

  return packets;
}

function headerShortName(type: number): string {
  switch (type) {
    case HeaderType.ETHERNET:
      return "ethernet";
    case HeaderType.VLAN:
      return "vlan";
    case HeaderType.IPV4:
      return "ipv4";
    case HeaderType.IPV6:
      return "ipv6";
    case HeaderType.TCP:
      return "tcp";
    case HeaderType.UDP:
      return "udp";
    case HeaderType.GRE:
      return "gre";
    case HeaderType.MPLS:
      return "mpls";
    case HeaderType.ARP:
      return "arp";
    case HeaderType.ICMP:
      return "icmp";
    case HeaderType.ICMPV6:
      return "icmpv6";
    case HeaderType.DOT3:
      return "dot3";
    case HeaderType.LLC:
      return "llc";
    case HeaderType.SNAP:
      return "snap";
    case HeaderType.SNMP:
      return "snmp";
    default:
      return "custom";
  }
}

function yamlQuote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

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

/** 计算 headers 层栈的最小帧长；SNMP/IPv6+TCP 等会超过默认 64B */
function frameLengthForHeaders(
  headers: HeaderInstance[],
  dot3PayloadLen?: number,
): number {
  const headerTotal = headers.reduce(
    (sum, header) => sum + (HEADER_LENGTH[header.type] ?? 0),
    0,
  );
  if (dot3PayloadLen !== undefined) {
    // 14B 以太网头 + 802.3 length；但如果内层头本身就超过它，以头总长为准
    return Math.max(14 + dot3PayloadLen, headerTotal);
  }
  return Math.max(64, headerTotal);
}

/** Dot3 之后各层头长度之和（LLC + SNAP + IPv4/...）；用于算 payload 补齐 */
function headerLengthAfterDot3(headers: HeaderInstance[]): number {
  const index = headers.findIndex((h) => h.type === HeaderType.DOT3);
  if (index < 0) return 0;
  return headers
    .slice(index + 1)
    .reduce((sum, header) => sum + (HEADER_LENGTH[header.type] ?? 0), 0);
}

function valueYaml(value: any): string {
  if (!value) return "0";
  if (value.u64 !== undefined && value.u64 !== null) return String(value.u64);
  if (value.raw) return `0x${Buffer.from(value.raw).toString("hex")}`;
  return "0";
}

function modifierValueYaml(value: any): string {
  if (value?.raw?.length === 4) {
    // 引擎对 IPv4 的 raw start 更稳妥地接受点分形式；hex 在部分版本会解析为 0。
    return Array.from(value.raw).join(".");
  }
  return valueYaml(value);
}

function modifierYaml(modifier: any): string[] {
  const parts: string[] = [];
  const kinds: Record<number, string> = {
    1: "fixed",
    2: "incr",
    3: "decr",
    4: "random",
    5: "list",
  };
  const scopes: Record<number, string> = {
    1: "frame",
    2: "burst",
    3: "stream",
  };
  parts.push(`kind: ${kinds[modifier.kind] ?? "incr"}`);
  if (modifier.scope) parts.push(`scope: ${scopes[modifier.scope] ?? "frame"}`);
  if (modifier.start) parts.push(`start: ${modifierValueYaml(modifier.start)}`);
  if (modifier.step) parts.push(`step: ${valueYaml(modifier.step)}`);
  if (modifier.end) parts.push(`end: ${valueYaml(modifier.end)}`);
  if (modifier.count) parts.push(`count: ${modifier.count}`);
  if (modifier.offset) parts.push(`offset: ${modifier.offset}`);
  if (modifier.mask) parts.push(`mask: ${modifier.mask}`);
  if (modifier.seed) parts.push(`seed: ${modifier.seed}`);
  if (Array.isArray(modifier.list) && modifier.list.length > 0) {
    parts.push(`list: [${modifier.list.map(valueYaml).join(", ")}]`);
  }
  return parts;
}

function buildFieldYaml(headers: HeaderInstance[]): string[] {
  const lines: string[] = [];
  const counters = new Map<number, number>();
  for (const header of headers) {
    let headerName = header.name;
    if (!headerName) {
      const idx = (counters.get(header.type) ?? 0) + 1;
      counters.set(header.type, idx);
      headerName = `${headerShortName(header.type)}_${idx}`;
    }
    for (const field of header.fields) {
      const fieldName = field.name || (field as any).legacy_name;
      if (!fieldName) continue;
      const path = fieldName.includes(".")
        ? fieldName
        : `${headerName}.${fieldName}`;
      const parts: string[] = [`path: ${yamlQuote(path)}`];
      if (field.fixed) {
        const bytesField =
          fieldName === "community" ||
          fieldName === "oid" ||
          fieldName === "oui";
        const fixedValue =
          bytesField && (field.fixed as any).raw
            ? Buffer.from((field.fixed as any).raw).toString("hex")
            : valueYaml(field.fixed);
        parts.push(`value: ${fixedValue}`);
      } else if (field.modifier) {
        parts.push(...modifierYaml(field.modifier));
      } else {
        continue;
      }
      lines.push(`          - { ${parts.join(", ")} }`);
    }
  }
  return lines;
}

interface BlockOptions {
  portName: string;
  headers: HeaderInstance[];
  frames: number;
  durationMs: number;
  rate: string;
  mode: string;
  fixedLen?: number;
  /** 追加在最后一层后的 payload 字节数（Dot3 的 LLC data 用它凑 802.3 length） */
  payloadLen?: number;
  channelName: string;
  streamName: string;
  /** 非空时使用原始帧 templateString（避免目标引擎 layers 路径的 VLAN 丢层） */
  templateString?: Buffer;
  /** 多帧 Dot3 modifier：一个 stream 一帧，块 frames 由调用方给 */
  templateStrings?: Buffer[];
}

function buildBlocks(options: BlockOptions): string {
  const sb: string[] = ["blocks:"];
  sb.push(`  - name: ${yamlQuote(options.channelName)}`);
  sb.push(`    tx: ${yamlQuote(options.portName)}`);
  sb.push("    basis: port");
  sb.push(`    rate: ${options.rate}`);
  sb.push(`    mode: ${options.mode}`);
  if (options.frames > 0) sb.push(`    frames: ${options.frames}`);
  if (options.durationMs > 0) sb.push(`    duration_ms: ${options.durationMs}`);
  if (
    options.templateString ||
    (options.templateStrings && options.templateStrings.length > 0)
  ) {
    // 部分引擎版本要求 block 带 tmpl 才会读取 stream.templateString；
    // raw 帧本身在 stream_build 里优先于 tmpl，因此这里只是兼容占位。
    sb.push(`    tmpl: ${yamlQuote("eth_ipv4_udp")}`);
  } else {
    sb.push("    layers:");
    for (const header of options.headers) {
      sb.push(`      - { proto: ${yamlQuote(headerShortName(header.type))} }`);
    }
    sb.push(
      `    len: ${options.fixedLen && options.fixedLen > 0 ? options.fixedLen : 64}`,
    );
    if (options.payloadLen !== undefined && options.payloadLen > 0) {
      sb.push(`    payload: ${options.payloadLen}`);
    }
  }
  sb.push("    streams:");
  if (options.templateStrings && options.templateStrings.length > 0) {
    options.templateStrings.forEach((frame, index) => {
      sb.push(`      - name: ${yamlQuote(`${options.streamName}-${index}`)}`);
      sb.push(`        templateString: ${yamlQuote(frame.toString("hex"))}`);
    });
  } else {
    sb.push(`      - name: ${yamlQuote(options.streamName)}`);
    if (options.templateString) {
      sb.push(
        `        templateString: ${yamlQuote(options.templateString.toString("hex"))}`,
      );
    } else {
      const fields = buildFieldYaml(options.headers);
      if (fields.length > 0) {
        sb.push("        fields:");
        sb.push(...fields);
      }
    }
  }
  return sb.join("\n") + "\n";
}

/** 与 gateway TrafficRuntime.MergeBlocks 一致：替换整个 blocks: 段 */
function mergeBlocks(yaml: string, blocks: string): string {
  const lines = (yaml ?? "").replace(/\r\n/g, "\n").split("\n");
  const kept: string[] = [];
  let skipping = false;
  for (const line of lines) {
    if (line.startsWith("blocks:")) {
      skipping = true;
      continue;
    }
    if (
      skipping &&
      line.length > 0 &&
      !/^\s/.test(line) &&
      !line.startsWith("#")
    ) {
      skipping = false;
    }
    if (!skipping) kept.push(line);
  }
  return kept.join("\n") + blocks;
}

function rateYaml(options: SendOptions): string {
  const transmit: any = options.transmit;
  const param: any = transmit?.param ?? {};
  if (transmit?.mode === TransmitMode.CONTINUOUS) {
    return `${param.percent_rate ?? 100}%`;
  }
  if (transmit?.mode === TransmitMode.BURST && param.rate != null) {
    switch (param.rate_unit) {
      case "PERCENT":
        return `${param.rate}%`;
      case "FRAME_PER_SEC":
        return `${param.rate}pps`;
      case "BYTE_PER_SEC":
        return `${param.rate}Bps`;
      default:
        break;
    }
  }
  return "100%";
}

function modeYaml(options: SendOptions): string {
  const transmit: any = options.transmit;
  if (transmit?.mode === TransmitMode.CONTINUOUS) return "continuous";
  if (transmit?.mode === TransmitMode.TIME) return "time";
  return "burst";
}

function framesFromOptions(options: SendOptions): number {
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

function durationFromOptions(options: SendOptions): number {
  const transmit: any = options.transmit;
  if (transmit?.mode === TransmitMode.TIME) {
    const seconds = Number(transmit.param?.time_seconds ?? 0);
    return Math.max(1, Math.round(seconds * 1000));
  }
  return 0;
}

/** Dot3/LLC 原始帧的 MAC modifier：按帧号计算递增/递减后的 MAC */
function applyDot3Modifiers(
  frame: Buffer,
  modifiers: any[] | undefined,
  index: number,
): void {
  if (!modifiers) return;
  for (const modifier of modifiers) {
    let offset = -1;
    switch (modifier.modifier_field) {
      case ModifierField.Dot3_MAC_SRC:
      case ModifierField.EthernetII_MAC_SRC:
        offset = 6;
        break;
      case ModifierField.Dot3_MAC_DST:
      case ModifierField.EthernetII_MAC_DST:
        offset = 0;
        break;
      default:
        continue;
    }
    try {
      const start = macToBuffer(String(modifier.start_value));
      const count = Number(modifier.count ?? 0);
      const step = Number(modifier.step ?? 1);
      const i = count > 0 ? index % count : index;
      let value = 0n;
      for (const byte of start) value = (value << 8n) | BigInt(byte);
      if (modifier.mode === "Decrement") {
        value -= BigInt(step) * BigInt(i);
      } else if (modifier.mode !== "Random") {
        value += BigInt(step) * BigInt(i);
      }
      value &= (1n << 48n) - 1n;
      for (let b = 5; b >= 0; b--) {
        frame[offset + b] = Number(value & 0xffn);
        value >>= 8n;
      }
    } catch {
      // 忽略非法 start_value
    }
  }
}

export class StreamControlBackend implements TrafficBackend {
  readonly kind = "streamcontrol-grpc";

  private initialized = false;
  private metadata = new grpc.Metadata();
  private clients: Record<string, any> = {};
  private captureRefs = new Map<string, any>();
  private captureRunning = new Set<string>();
  private capturedFrames = new Map<string, CapturedPacket[]>();
  private activeRuns = new Map<string, number>();
  private openedPorts = new Set<string>();
  private nameSeq = 0;

  /** Hello 返回的能力/限额，供测试侧做能力门禁 */
  public features: string[] = [];
  public limits: any;

  async init(): Promise<void> {
    if (this.initialized) return;

    if (StreamControlConfig.authorization) {
      this.metadata.set("authorization", StreamControlConfig.authorization);
    }

    const packageDefinition = protoLoader.loadSync(
      StreamControlConfig.protoFile,
      {
        includeDirs: [StreamControlConfig.protoRoot],
        keepCase: true,
        longs: Number,
        enums: Number,
        defaults: false,
        oneofs: true,
      },
    );
    const loaded = grpc.loadPackageDefinition(packageDefinition) as any;
    const v1 = loaded?.streamcontrol?.v1;
    if (!v1) {
      throw new Error(
        `[streamcontrol] proto 加载失败，未找到 streamcontrol.v1: ${StreamControlConfig.protoFile}`,
      );
    }

    const credentials = this.createCredentials();
    const address = StreamControlConfig.address;

    this.clients = {
      system: new v1.SystemService(address, credentials),
      port: new v1.PortService(address, credentials),
      capture: new v1.CaptureService(address, credentials),
      traffic: new v1.TrafficService(address, credentials),
      config: new v1.ConfigService(address, credentials),
      run: new v1.RunService(address, credentials),
      job: new v1.JobService(address, credentials),
      files: new v1.FileService(address, credentials),
    };

    try {
      const hello = await this.unary<any>(this.clients.system, "Hello", {
        client: "auto-test-jest",
        protocol_major: 1,
        protocol_minor: 0,
      });
      assertResult(hello.result, "SystemService.Hello");

      this.features = Array.isArray(hello.features) ? hello.features : [];
      this.limits = hello.limits;
      this.initialized = true;

      console.log(
        `[streamcontrol] connected ${address}` +
          (hello.gateway_version ? ` gateway=${hello.gateway_version}` : "") +
          (hello.engine_version ? ` engine=${hello.engine_version}` : "") +
          (this.features.length ? ` features=${this.features.join(",")}` : ""),
      );

      // 清掉上一次进程遗留的 auto-test capture：capture 线程会占用端口，
      // 导致后续 CONFIG_APPLY 报“有端口处于打开状态”。
      await this.cleanupStaleCaptures();
    } catch (err) {
      await this.close();
      throw err;
    }
  }

  async close(): Promise<void> {
    for (const port of Array.from(this.activeRuns.keys())) {
      try {
        await this.stopTransmit({ provider: "stream-linux", address: port });
      } catch {
        // best-effort
      }
    }
    for (const [name, ref] of Array.from(this.captureRefs.entries())) {
      try {
        if (this.captureRunning.has(name)) {
          await this.unary<any>(this.clients.capture, "Stop", { refs: [ref] });
        }
        await this.unary<any>(this.clients.capture, "Delete", ref);
      } catch {
        // best-effort
      }
    }
    for (const client of Object.values(this.clients)) {
      client?.close?.();
    }
    this.clients = {};
    this.captureRefs.clear();
    this.captureRunning.clear();
    this.capturedFrames.clear();
    this.activeRuns.clear();
    this.openedPorts.clear();
    this.initialized = false;
  }

  async reservePort(port: TrafficPort): Promise<void> {
    this.ensureInit();
    const info = await this.unary<any>(this.clients.port, "GetPort", {
      name: port.address,
    });
    // GetPort 对未注册端口返回 code=103，OpenPort 会顺便注册
    const opened =
      Number(info.result?.code ?? 0) === 0 &&
      (Number(info.port?.flags ?? 0) & 0x1) === 0x1;
    if (!opened) {
      const reply = await this.unary<any>(this.clients.port, "OpenPort", {
        name: port.address,
      });
      assertResult(reply.result, `PortService.OpenPort(${port.address})`);
    }
    this.openedPorts.add(port.address);
  }

  async releasePort(port: TrafficPort): Promise<void> {
    this.ensureInit();
    try {
      await this.stopTransmit(port);
    } catch {
      // 没有运行中的流时忽略
    }

    // 清掉本 backend 创建的 capture 资源，避免测试结束后残留
    const captureRef = this.captureRefs.get(port.address);
    if (captureRef) {
      try {
        await this.stopCapture(port);
      } catch {
        // 可能已停止
      }
      try {
        await this.unary<any>(this.clients.capture, "Delete", captureRef);
      } catch {
        // 可能已被删除
      }
    }

    try {
      const reply = await this.unary<any>(this.clients.port, "ClosePort", {
        name: port.address,
      });
      assertResult(reply.result, `PortService.ClosePort(${port.address})`);
    } catch {
      // 端口可能已关闭
    }
    this.captureRefs.delete(port.address);
    this.captureRunning.delete(port.address);
    this.capturedFrames.delete(port.address);
    this.openedPorts.delete(port.address);
  }

  async stopTransmit(port: TrafficPort): Promise<void> {
    this.ensureInit();
    const runId = this.activeRuns.get(port.address);
    if (runId === undefined) return;

    const reply = await this.unary<any>(this.clients.run, "StopTest", {
      run_id: runId,
    });
    assertResult(reply.result, `RunService.StopTest(${runId})`);
    this.activeRuns.delete(port.address);
  }

  async startCapture(port: TrafficPort): Promise<void> {
    this.ensureInit();
    const ref = await this.ensureCapture(port);
    this.capturedFrames.delete(port.address);

    // 幂等：已经在跑就不重复 Reset/Start（ResetParser 会拒绝运行中的 capture）
    const current = await this.unary<any>(this.clients.capture, "Get", { ref });
    assertResult(current.result, `CaptureService.Get(${port.address})`);
    if (Number(current.status?.state ?? 0) === 3) {
      this.captureRunning.add(port.address);
      return;
    }

    // 与旧后端语义对齐：每次 startCapture 都从空缓冲开始
    const reset = await this.unary<any>(this.clients.capture, "ResetParser", {
      ref,
    });
    assertResult(reset.result, `CaptureService.ResetParser(${port.address})`);
    await this.waitJob(
      reset.job_id,
      `CaptureService.ResetParser(${port.address})`,
    );

    const reply = await this.unary<any>(this.clients.capture, "Start", {
      refs: [ref],
    });
    assertResult(reply.result, `CaptureService.Start(${port.address})`);
    await this.waitJob(reply.job_id, `CaptureService.Start(${port.address})`);
    await this.waitCaptureRunning(ref);
    this.captureRunning.add(port.address);
  }

  async stopCapture(port: TrafficPort): Promise<void> {
    this.ensureInit();
    const ref = await this.ensureCapture(port);

    // 不先判断 state：STARTING/IDLE 等情况下也需要 Stop，否则 capture 线程
    // 可能仍持有端口，导致后续 CONFIG_APPLY 报端口未关闭。
    try {
      const reply = await this.unary<any>(this.clients.capture, "Stop", {
        refs: [ref],
      });
      if (Number(reply.result?.code ?? 0) === 0) {
        await this.waitJob(
          reply.job_id,
          `CaptureService.Stop(${port.address})`,
        );
      }
    } catch {
      // capture 未运行/已停止
    }

    await this.waitCaptureStopped(ref, port.address);
    this.captureRunning.delete(port.address);
  }

  async readCapture(port: TrafficPort): Promise<CapturedPacket[]> {
    this.ensureInit();
    const ref = await this.ensureCapture(port);

    const current = await this.collectCaptureFrames(port, ref, true);
    const pending = this.capturedFrames.get(port.address) ?? [];
    this.capturedFrames.delete(port.address);
    return [...pending, ...current];
  }

  async sendPacket(
    port: TrafficPort,
    packet: PacketSpec,
    options: SendOptions = {},
  ): Promise<void> {
    this.ensureInit();

    // 同一端口若还有未停止的 continuous run，先停掉
    if (this.activeRuns.has(port.address)) {
      await this.stopTransmit(port);
    }

    // 只有带 RAW payload 的 Dot3 报文才必须走原始帧；普通 Dot3+LLC 现在
    // 由新引擎用 layers + payload 长度正确生成 802.3 length。
    const hasRaw = packet.layers.some((layer) => layer.type === FieldType.RAW);
    if (hasRaw) {
      const dot3Frame = encodeDot3Llc(packet);
      if (dot3Frame) {
        const modifiers = options.modifiers ?? [];
        const totalFrames = framesFromOptions(options);
        if (modifiers.length > 0 && totalFrames > 1) {
          // 一帧一个 stream，一次 apply/start 完成，避免逐帧重启抓包丢帧
          const frames = Array.from({ length: totalFrames }, (_, i) => {
            const frame = Buffer.from(dot3Frame);
            applyDot3Modifiers(frame, modifiers, i);
            return frame;
          });
          await this.sendRawFrames(port, frames, options);
          return;
        }
        applyDot3Modifiers(dot3Frame, modifiers, 0);
        await this.sendRawFrame(port, dot3Frame, options);
        return;
      }
    }

    const headers = packetToHeaders(packet, options.modifiers ?? []);
    const frames = framesFromOptions(options);
    const durationMs = durationFromOptions(options);
    const dot3Len = packet.layers.find((layer) => layer.type === FieldType.Dot3)
      ?.field.dot3?.len;
    const payloadLen =
      dot3Len !== undefined && dot3Len !== null
        ? Math.max(0, Number(dot3Len) - headerLengthAfterDot3(headers))
        : undefined;
    const fixedLen =
      options.transmit?.fixed_len && options.transmit.fixed_len > 0
        ? options.transmit.fixed_len
        : frameLengthForHeaders(
            headers,
            dot3Len !== undefined && dot3Len !== null
              ? Number(dot3Len)
              : undefined,
          );
    const seq = ++this.nameSeq;
    const stamp = `${Date.now().toString(36)}-${seq}`;
    const channelName = `auto-test-ch-${stamp}`;
    const streamName = `auto-test-stream-${stamp}`;

    // 固定报文优先用 Encode 预览出真实帧，再用 templateString 原样发送：
    // 目标引擎的 ConfigApply+RunService 路径在 layers VLAN 上会丢层，而
    // traffic.encode 的 layers 路径是正确的。modifier 需要按帧展开，暂不走这条。
    let encodedFrame: Buffer | undefined;
    const hasDot3 = packet.layers.some((l) => l.type === FieldType.Dot3);
    if ((!options.modifiers || options.modifiers.length === 0) && !hasDot3) {
      try {
        const encoded = await this.unary<any>(
          this.clients.traffic,
          "Encode",
          { headers },
          5_000,
        );
        if (
          Number(encoded.result?.code ?? 0) === 0 &&
          encoded.frame &&
          encoded.frame.length > 0
        ) {
          encodedFrame = Buffer.from(encoded.frame);
          // 与旧后端/模板默认一致：不足最小帧长时补齐
          if (encodedFrame.length < fixedLen) {
            encodedFrame = Buffer.concat([
              encodedFrame,
              Buffer.alloc(fixedLen - encodedFrame.length),
            ]);
          }
        }
      } catch {
        // 老网关可能返回 UNIMPLEMENTED，退回 layers/fields 路径
      }
    }

    const blocks = buildBlocks({
      portName: port.address,
      headers,
      frames,
      durationMs,
      rate: rateYaml(options),
      mode: modeYaml(options),
      fixedLen,
      payloadLen,
      channelName,
      streamName,
      templateString: encodedFrame,
    });

    await this.dispatchBlocks(
      port,
      blocks,
      frames,
      durationMs,
      stamp,
      channelName,
    );
  }

  /**
   * 发送一条已经编码好的原始以太网帧（Dot3/LLC/SNMP 或暂时无法用 headers 表达的报文）。
   * 走 templateString，引擎按字节原样发送。
   */
  async sendRawFrame(
    port: TrafficPort,
    frame: Buffer,
    options: SendOptions = {},
  ): Promise<void> {
    this.ensureInit();
    if (this.activeRuns.has(port.address)) {
      await this.stopTransmit(port);
    }

    const computedFrames = framesFromOptions(options);
    const durationMs = durationFromOptions(options);
    // 没传 transmit/count 时，单条原始帧默认发送 1 次，而不是 continuous
    const frames =
      computedFrames === 0 && durationMs === 0 && !options.transmit
        ? 1
        : computedFrames;

    const seq = ++this.nameSeq;
    const stamp = `${Date.now().toString(36)}-${seq}`;
    const channelName = `auto-test-ch-${stamp}`;
    const streamName = `auto-test-stream-${stamp}`;
    const blocks = buildBlocks({
      portName: port.address,
      headers: [],
      frames,
      durationMs,
      rate: rateYaml(options),
      mode: modeYaml(options),
      channelName,
      streamName,
      templateString: frame,
    });

    await this.dispatchBlocks(
      port,
      blocks,
      frames,
      durationMs,
      stamp,
      channelName,
    );
  }

  /** 一帧一个 stream：用于 Dot3 modifier 这类需要逐帧变化、但 HeaderType 又不便表达的报文 */
  async sendRawFrames(
    port: TrafficPort,
    frames: Buffer[],
    options: SendOptions = {},
  ): Promise<void> {
    this.ensureInit();
    if (frames.length === 0) return;
    if (frames.length > 4096) {
      throw new Error("[streamcontrol] 单次原始帧超过 4096，需拆分发送");
    }
    if (this.activeRuns.has(port.address)) {
      await this.stopTransmit(port);
    }

    const seq = ++this.nameSeq;
    const stamp = `${Date.now().toString(36)}-${seq}`;
    const channelName = `auto-test-ch-${stamp}`;
    const streamName = `auto-test-stream-${stamp}`;
    const blocks = buildBlocks({
      portName: port.address,
      headers: [],
      frames: frames.length,
      durationMs: 0,
      rate: rateYaml(options),
      mode: "burst",
      channelName,
      streamName,
      templateStrings: frames,
    });

    await this.dispatchBlocks(
      port,
      blocks,
      frames.length,
      0,
      stamp,
      channelName,
    );
  }

  /** 下发 blocks YAML 并通过 RunService 启停 */
  private async dispatchBlocks(
    port: TrafficPort,
    blocks: string,
    frames: number,
    durationMs: number,
    stamp: string,
    marker: string,
  ): Promise<void> {
    const paused = await this.pauseForApply();
    if (process.env.STREAM_CONTROL_DEBUG_YAML === "true") {
      console.log(`[streamcontrol] blocks:\n${blocks}`);
    }
    try {
      const current = await this.unary<any>(
        this.clients.config,
        "ConfigGet",
        {},
      );
      assertResult(current.result, "ConfigService.ConfigGet");
      await this.applyConfig(mergeBlocks(current.yaml ?? "", blocks));
    } catch (err) {
      await this.reopenAfterApply(port, paused);
      throw err;
    }
    await this.reopenAfterApply(port, paused);

    // ConfigApply 在引擎侧可能异步生效；等当前 YAML 里能看到本次 block 再 StartTest，
    // 否则 RunService 可能还在用上一份配置（表现为 VLAN/字段没生效）。
    await this.waitForConfigApplied(marker);

    // 引擎的 run 槽位在 StopTest 后才回收；先清理本工具遗留的 auto-test-* run，
    // 避免连续用例触发“同时运行的 run 已达上限（4）”。
    await this.cleanupOwnRuns();

    const start = await this.unary<any>(this.clients.run, "StartTest", {
      name: marker,
      duration_ms: durationMs,
      frames,
      idempotency_key: `auto-test-run-${stamp}`,
    });
    assertResult(start.result, "RunService.StartTest");
    const runId = Number(start.run_id ?? 0);
    if (!runId) {
      throw new Error("[streamcontrol] RunService.StartTest 未返回 run_id");
    }

    // duration/frames 都为 0 表示 continuous：记录 run，等 stopTransmit
    if (frames > 0 || durationMs > 0) {
      await this.waitRun(runId, Math.max(15_000, durationMs + 60_000));
    } else {
      this.activeRuns.set(port.address, runId);
    }
  }

  // ---------------------------------------------------------------- 内部

  private ensureInit(): void {
    if (!this.initialized) {
      throw new Error("[streamcontrol] backend 未初始化，请先调用 init()");
    }
  }

  private createCredentials(): grpc.ChannelCredentials {
    if (!StreamControlConfig.tls) {
      return grpc.credentials.createInsecure();
    }
    const read = (file?: string) => (file ? fs.readFileSync(file) : undefined);
    return grpc.credentials.createSsl(
      read(StreamControlConfig.ca),
      read(StreamControlConfig.key),
      read(StreamControlConfig.cert),
      StreamControlConfig.tlsInsecure
        ? { rejectUnauthorized: false }
        : undefined,
    );
  }

  /** 找到端口对应的 Capture 资源；没有则创建并缓存 ref */
  private async ensureCapture(port: TrafficPort): Promise<any> {
    const cached = this.captureRefs.get(port.address);
    if (cached) return cached;

    const list = await this.unary<any>(this.clients.capture, "List", {
      port: { path: `port[${port.address}]` },
    });
    assertResult(list.result, `CaptureService.List(${port.address})`);

    const configs = Array.isArray(list.configs) ? list.configs : [];
    const existing =
      configs.find(
        (config: any) => config?.port?.path === `port[${port.address}]`,
      ) ?? (configs.length === 1 ? configs[0] : undefined);
    if (existing?.ref) {
      this.captureRefs.set(port.address, existing.ref);
      return existing.ref;
    }

    const safeName = port.address.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const created = await this.unary<any>(this.clients.capture, "Create", {
      kind: "capture",
      name: `auto-test-capture-${safeName}`,
      // 引擎 spec 约定（src/api/engine_captures.c）：
      //   port 是端口名字符串；mode=1 表示 WRAP；maxBytes/maxFrames 给引擎。
      spec: toStruct({
        port: port.address,
        mode: 1,
        maxBytes: 4 * 1024 * 1024,
        maxFrames: 65536,
      }),
    });
    assertResult(created.result, `CaptureService.Create(${port.address})`);

    const ref = created.config?.ref;
    if (!ref) {
      throw new Error(
        `[streamcontrol] CaptureService.Create(${port.address}) 未返回 config.ref`,
      );
    }
    this.captureRefs.set(port.address, ref);
    return ref;
  }

  /** 读取 capture 当前缓冲区中的帧（不清空），用于跨 CONFIG_APPLY 保留已抓到的报文 */
  private async collectCaptureFrames(
    port: TrafficPort,
    ref: any,
    allowBatch = false,
  ): Promise<CapturedPacket[]> {
    const got = await this.unary<any>(this.clients.capture, "Get", { ref });
    assertResult(got.result, `CaptureService.Get(${port.address})`);

    const count = Number(got.status?.captured_packet_count ?? 0);

    if (
      allowBatch &&
      count > 0 &&
      // Download 导出的是当前缓冲区；抓包仍在运行时保守走 ReadByIndex
      !this.captureRunning.has(port.address) &&
      count >= batchCaptureThreshold()
    ) {
      try {
        const batches = await this.collectCaptureFramesViaDownload(port, ref);
        if (batches.length > 0) {
          if (process.env.STREAM_CONTROL_DEBUG_CAPTURE === "true") {
            console.log(
              `[streamcontrol] batch capture ${batches.length} frame(s) on ${port.address}`,
            );
          }
          return batches;
        }
      } catch (err) {
        // 网关未配置 state_dir / 文件导出失败时，退回逐帧读取
        if (process.env.STREAM_CONTROL_DEBUG_CAPTURE === "true") {
          console.warn(
            `[streamcontrol] batch capture failed on ${port.address}, fallback ReadByIndex:`,
            err,
          );
        }
      }
    }

    const packets: CapturedPacket[] = [];
    for (let index = 0; index < count; index++) {
      const reply = await this.unary<any>(this.clients.capture, "ReadByIndex", {
        ref,
        index,
      });
      assertResult(
        reply.result,
        `CaptureService.ReadByIndex(${port.address}, ${index})`,
      );
      const frame = reply.frame;
      if (!frame?.data) continue;
      const raw = Buffer.from(frame.data);
      packets.push({
        raw,
        timestampNs:
          frame.timestamp_ns !== undefined
            ? BigInt(frame.timestamp_ns)
            : undefined,
        layers: decodeFrame(raw),
      });
    }
    return packets;
  }

  /**
   * 批量抓包：Capture.Download 导出 pcap，再通过 FileService.Download 取回。
   * 适用于抓包已停止、帧数较多的场景（PacketChecker 的典型路径）。
   */
  private async collectCaptureFramesViaDownload(
    port: TrafficPort,
    ref: any,
  ): Promise<CapturedPacket[]> {
    const reply = await this.unary<any>(
      this.clients.capture,
      "Download",
      {
        refs: [ref],
        file_dir: "captures",
        // 引擎会按 capture id 命名，file_name 只是提示
        file_name: `auto-test-${Date.now()}-${++this.nameSeq}.pcap`,
        category_by_port: false,
        max_download_data_count: 0,
      },
      30_000,
    );
    assertResult(reply.result, `CaptureService.Download(${port.address})`);
    await this.waitJob(
      reply.job_id,
      `CaptureService.Download(${port.address})`,
    );

    const files: string[] = Array.isArray(reply.files) ? reply.files : [];
    const pcapFiles = files.filter((file) => /\.pcap$/i.test(file));
    if (pcapFiles.length === 0) {
      throw new Error(
        `[streamcontrol] CaptureService.Download 未返回 pcap 文件（${files.join(
          ", ",
        )}）`,
      );
    }

    const packets: CapturedPacket[] = [];
    try {
      for (const file of pcapFiles) {
        const buffer = await this.downloadFile(file);
        packets.push(...parsePcapFrames(buffer));
      }
    } finally {
      // 删除导出文件（含 .pcap.json sidecar），避免 state_dir 持续增长
      try {
        await this.unary<any>(this.clients.files, "Delete", { paths: files });
      } catch {
        // best-effort
      }
    }
    return packets;
  }

  /** 通过 FileService.Download 读取一个逻辑文件 */
  private async downloadFile(path: string): Promise<Buffer> {
    const chunks = await this.serverStream<any>(
      this.clients.files,
      "Download",
      { paths: [path] },
      30_000,
    );
    // 按 offset 排序，避免网关/网络层乱序（正常 gRPC 流是有序的）
    chunks.sort((a, b) => Number(a.offset ?? 0) - Number(b.offset ?? 0));
    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk.data ?? [])));
  }

  /**
   * CONFIG_APPLY 要求所有端口关闭：
   * 先把运行中 capture 已抓到的帧读出来存到 capturedFrames（避免 stop/start 丢失），
   * 再停止抓包并关闭当前所有已打开端口。
   * 返回需要恢复的抓包端口。
   */
  private async pauseForApply(): Promise<TrafficPort[]> {
    const paused: TrafficPort[] = [];
    for (const name of Array.from(this.captureRunning)) {
      const port: TrafficPort = {
        provider: "stream-linux",
        address: name,
      };
      try {
        const ref = await this.ensureCapture(port);
        const frames = await this.collectCaptureFrames(port, ref);
        if (frames.length > 0) {
          const pending = this.capturedFrames.get(name) ?? [];
          pending.push(...frames);
          this.capturedFrames.set(name, pending);
        }
        await this.stopCapture(port);
      } catch {
        // best-effort
      }
      paused.push(port);
    }

    // 兼容上一次进程遗留的 capture：它们也会占着端口。
    // 注意：仅 Stop 不够，capture 资源本身仍会让引擎 PORT_CLOSE 无法释放端口，
    // 所以这里直接删除；apply 后再按需重建。
    await this.deleteAutoCaptures();

    if (process.env.STREAM_CONTROL_DEBUG_YAML === "true") {
      const l = await this.unary<any>(this.clients.port, "ListPorts", {
        include_all: true,
      });
      console.log(
        "[streamcontrol] pause ports before close:",
        (l.ports ?? [])
          .map((p: any) => `${p.name}:state=${p.state}:flags=${p.flags}`)
          .join(", "),
      );
    }

    const openNames = new Set(this.openedPorts);
    // loopback 在部分引擎版本上会“已打开但 flags 不显示 open 位”，
    // 导致 CONFIG_APPLY 报端口未关闭；它不影响 eth0 管理口，先固定关掉。
    openNames.add("lo");
    try {
      // 已配置端口：全部尝试 ClosePort（未打开的返回 103，忽略）
      const configured = await this.unary<any>(this.clients.port, "ListPorts", {
        include_all: false,
      });
      for (const port of configured.ports ?? []) openNames.add(port.name);

      // 系统网卡：只关 flags 明确标记 open 的，避免误关 eth0 管理口
      const all = await this.unary<any>(this.clients.port, "ListPorts", {
        include_all: true,
      });
      for (const port of all.ports ?? []) {
        if ((Number(port.flags ?? 0) & 0x1) === 0x1) {
          openNames.add(port.address);
        }
      }
    } catch {
      // ListPorts 失败不影响使用已知 openedPorts 关闭
    }

    for (const name of openNames) {
      try {
        const reply = await this.unary<any>(this.clients.port, "ClosePort", {
          name,
        });
        assertResult(reply.result, `PortService.ClosePort(${name})`);
      } catch {
        // 端口可能已关闭
      }
    }
    this.openedPorts.clear();
    if (process.env.STREAM_CONTROL_DEBUG_YAML === "true") {
      const l = await this.unary<any>(this.clients.port, "ListPorts", {
        include_all: true,
      });
      console.log(
        "[streamcontrol] pause ports after close:",
        (l.ports ?? [])
          .map((p: any) => `${p.name}:state=${p.state}:flags=${p.flags}`)
          .join(", "),
      );
    }
    return paused;
  }

  /** APPLY 之后重开 TX 端口和之前暂停的抓包端口 */
  private async reopenAfterApply(
    txPort: TrafficPort,
    paused: TrafficPort[],
  ): Promise<void> {
    try {
      const reply = await this.unary<any>(this.clients.port, "OpenPort", {
        name: txPort.address,
      });
      assertResult(reply.result, `PortService.OpenPort(${txPort.address})`);
      this.openedPorts.add(txPort.address);
    } catch (err) {
      console.error(`[streamcontrol] reopen ${txPort.address} failed:`, err);
    }

    for (const port of paused) {
      try {
        const reply = await this.unary<any>(this.clients.port, "OpenPort", {
          name: port.address,
        });
        assertResult(reply.result, `PortService.OpenPort(${port.address})`);
        this.openedPorts.add(port.address);
        // 这里只恢复 Start，不做 ResetParser：保留 apply 前已抓到的帧
        const ref = await this.ensureCapture(port);
        const started = await this.unary<any>(this.clients.capture, "Start", {
          refs: [ref],
        });
        assertResult(started.result, `CaptureService.Start(${port.address})`);
        await this.waitJob(
          started.job_id,
          `CaptureService.Start(${port.address})`,
        );
        this.captureRunning.add(port.address);
      } catch (err) {
        console.error(
          `[streamcontrol] resume capture ${port.address} failed:`,
          err,
        );
      }
    }
  }

  /** 等 capture 进入 RUNNING（Start 返回后线程可能还在启动） */
  private async waitCaptureRunning(ref: any): Promise<void> {
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline) {
      const got = await this.unary<any>(this.clients.capture, "Get", { ref });
      if (
        Number(got.result?.code ?? 0) === 0 &&
        Number(got.status?.state ?? 0) === 3
      ) {
        return;
      }
      await sleepMs(50);
    }
  }

  /** 等 capture 从 RUNNING 退出（引擎停止线程是异步的） */
  private async waitCaptureStopped(ref: any, name: string): Promise<void> {
    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) {
      const got = await this.unary<any>(this.clients.capture, "Get", { ref });
      assertResult(got.result, `CaptureService.Get(${name})`);
      if (Number(got.status?.state ?? 0) !== 3) return;
      await sleepMs(50);
    }
  }

  /** 删除上一次进程遗留的 auto-test capture（capture 线程会占用端口） */
  private async cleanupStaleCaptures(): Promise<void> {
    try {
      const list = await this.unary<any>(this.clients.capture, "List", {});
      for (const config of list.configs ?? []) {
        const path = String(config.ref?.path ?? "");
        if (!path.includes("auto-test-capture-")) continue;
        try {
          await this.unary<any>(this.clients.capture, "Stop", {
            refs: [config.ref],
          });
          await this.waitCaptureStopped(config.ref, path);
        } catch {
          // 未运行
        }
        try {
          await this.unary<any>(this.clients.capture, "Delete", config.ref);
        } catch {
          // 已删除
        }
      }
    } catch {
      // List/Delete 不可用时忽略
    }
    this.captureRefs.clear();
    this.captureRunning.clear();
  }

  /** 停掉并删除所有 auto-test capture，确保没有 capture 占用端口 */
  private async deleteAutoCaptures(): Promise<void> {
    try {
      const list = await this.unary<any>(this.clients.capture, "List", {});
      for (const config of list.configs ?? []) {
        const path = String(config.ref?.path ?? "");
        if (!path.includes("auto-test-capture-")) continue;
        try {
          await this.unary<any>(this.clients.capture, "Stop", {
            refs: [config.ref],
          });
          await this.waitCaptureStopped(config.ref, path);
        } catch {
          // 未运行
        }
        try {
          await this.unary<any>(this.clients.capture, "Delete", config.ref);
        } catch {
          // 已删除
        }
      }
    } catch {
      // best-effort
    }
    this.captureRefs.clear();
    this.captureRunning.clear();
  }

  /** 等 ConfigGet 返回的 YAML 里出现本次 block（确认 apply 已生效） */
  private async waitForConfigApplied(marker: string): Promise<void> {
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline) {
      const got = await this.unary<any>(this.clients.config, "ConfigGet", {});
      if (Number(got.result?.code ?? 0) === 0) {
        const yaml = String(got.yaml ?? "");
        if (yaml.includes(marker)) return;
      }
      await sleepMs(50);
    }
  }

  /** 清理本工具遗留的 run（名字前缀 auto-test-），释放引擎 run 槽位 */
  private async cleanupOwnRuns(): Promise<void> {
    try {
      const live = new Set(this.activeRuns.values());
      const list = await this.unary<any>(this.clients.run, "ListRuns", {});
      for (const run of list.runs ?? []) {
        const id = Number(run.run_id);
        if (
          typeof run.name === "string" &&
          run.name.startsWith("auto-test-") &&
          id > 0 &&
          !live.has(id)
        ) {
          try {
            await this.unary<any>(this.clients.run, "StopTest", { run_id: id });
          } catch {
            // 已被回收/已停止
          }
        }
      }
    } catch {
      // ListRuns 不可用时忽略，启动失败会由 StartTest 返回
    }
  }

  /** 轮询 RunService.GetRun 直到 DONE/FAILED/ABORTED */
  private async waitRun(runId: number, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const run = await this.unary<any>(this.clients.run, "GetRun", {
        run_id: runId,
      });
      const code = Number(run.result?.code ?? 0);
      if (code === 2) return; // run 已被引擎回收，视为结束
      assertResult(run.result, `RunService.GetRun(${runId})`);

      // RunState: RUN_DONE=6 RUN_FAILED=7 RUN_ABORTED=8
      const state = Number(run.state ?? 0);
      if (state === 6 || state === 7 || state === 8) {
        // 自然结束的 run 也要 StopTest 才会释放槽位
        try {
          await this.unary<any>(this.clients.run, "StopTest", {
            run_id: runId,
          });
        } catch {
          // 已回收
        }
        if (state !== 6) {
          throw new Error(
            `[streamcontrol] run ${runId} finished with state ${state}`,
          );
        }
        return;
      }
      await sleepMs(100);
    }
    throw new Error(`[streamcontrol] run ${runId} timeout (${timeoutMs}ms)`);
  }

  /** draft open -> put -> apply */
  private async applyConfig(yaml: string): Promise<void> {
    const draft = await this.unary<any>(this.clients.config, "DraftOpen", {
      base_revision: 0,
    });
    assertResult(draft.result, "ConfigService.DraftOpen");
    const draftId = Number(draft.draft_id ?? 0);
    const baseRevision = Number(draft.base_revision ?? 0);
    if (!draftId) {
      throw new Error(
        "[streamcontrol] ConfigService.DraftOpen 未返回 draft_id",
      );
    }

    const put = await this.unary<any>(this.clients.config, "DraftPut", {
      draft_id: draftId,
      yaml,
    });
    assertResult(put.result, "ConfigService.DraftPut");

    const applied = await this.unary<any>(this.clients.config, "ConfigApply", {
      draft_id: draftId,
      expected_revision: baseRevision,
      dry_run: false,
      idempotency_key: `auto-test-apply-${Date.now()}-${++this.nameSeq}`,
    });
    assertResult(applied.result, "ConfigService.ConfigApply");
    await this.waitJob(applied.job_id, "ConfigService.ConfigApply");
  }

  /** 轮询 JobService.GetJob 直到成功/失败/取消 */
  private async waitJob(jobId?: number, op = "job"): Promise<void> {
    if (!jobId) return;

    const timeoutMs = 60_000;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const job = await this.unary<any>(this.clients.job, "GetJob", {
        job_id: jobId,
      });
      assertResult(job.result, `JobService.GetJob(${jobId})`);

      // JobState: QUEUED=1 RUNNING=2 SUCCEEDED=3 FAILED=4 CANCELLED=5
      const state = Number(job.state ?? 0);
      if (state === 3) return;
      if (state === 4) {
        const message = job.job_result?.message || job.message || "";
        throw new Error(
          `[streamcontrol] ${op} job ${jobId} failed: ${message}`,
        );
      }
      if (state === 5) {
        throw new Error(`[streamcontrol] ${op} job ${jobId} cancelled`);
      }
      await sleepMs(100);
    }

    throw new Error(
      `[streamcontrol] ${op} job ${jobId} timeout (${timeoutMs}ms)`,
    );
  }

  private serverStream<T>(
    client: any,
    method: string,
    request: any,
    timeoutMs = 30_000,
  ): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      const fn = client?.[method];
      if (typeof fn !== "function") {
        reject(
          new Error(
            `[streamcontrol] gRPC 流式方法不存在: ${method}（网关版本可能不支持）`,
          ),
        );
        return;
      }

      const chunks: T[] = [];
      let settled = false;
      const call = fn.call(client, request, this.metadata, {
        deadline: new Date(Date.now() + timeoutMs),
      });

      call.on("data", (chunk: T) => chunks.push(chunk));
      call.on("end", () => {
        if (settled) return;
        settled = true;
        resolve(chunks);
      });
      call.on("error", (err: any) => {
        if (settled) return;
        settled = true;
        reject(err);
      });
    });
  }

  private unary<T>(
    client: any,
    method: string,
    request: any,
    timeoutMs = 10_000,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const fn = client?.[method];
      if (typeof fn !== "function") {
        reject(
          new Error(
            `[streamcontrol] gRPC 方法不存在: ${method}（网关版本可能不支持）`,
          ),
        );
        return;
      }
      fn.call(
        client,
        request,
        this.metadata,
        { deadline: new Date(Date.now() + timeoutMs) },
        (err: any, response: T) => {
          if (err) reject(err);
          else resolve(response);
        },
      );
    });
  }
}
