/**
 * 打流/抓包后端契约（适配器层）。
 *
 * 后端只认识 provider + address，不认识逻辑端口、拓扑或配置：
 * - 连接配置由组合根在构造后端时注入；
 * - 端口生命周期、串行化、能力校验由 traffic 会话层负责。
 */

import type { PacketLayer, PacketSpec } from "../packet/model";
import type {
  PacketModifierParam,
  PacketTransmitModeParam,
} from "../packet/types";

/** 后端标识；与配置中的 provider 一一对应 */
export type ProviderId = "renix" | "scapy" | "stream-linux";

/** 后端内部的最小端口参数 */
export interface BackendEndpoint {
  provider: ProviderId;
  address: string;
}

/** 抓包得到的一个报文 */
export interface CapturedPacket {
  /** 中立协议层列表，可直接交给 packet/match 的 match* 使用 */
  layers: PacketLayer[];
  /** 原始以太网帧（部分后端可用） */
  raw?: Buffer;
  /** 抓包时间戳（纳秒），后端支持时提供 */
  timestampNs?: bigint;
}

/** 发送参数，语义与原有的 modifier_param / transmit_param 对齐 */
export interface SendOptions {
  /** 发送次数；具体后端可结合 transmit 模式解释 */
  count?: number;
  /** 字段修改参数（MAC/IP/端口自增等） */
  modifiers?: PacketModifierParam[];
  /** 发送模式（连续/突发/步进/定时） */
  transmit?: PacketTransmitModeParam;
  /**
   * 是否等待本次发送结束。默认 false：只保证已启动。
   * 需要确定“发送完成”时显式传 true，或使用 startTransmit() 的 handle.wait()。
   */
  wait?: boolean;
  /** wait=true 时的超时；不传则按 duration + 60s 估算 */
  timeoutMs?: number;
}

/** 一次已启动的发送。用于异步发送、显式等待和提前停止。 */
export interface TransmitHandle {
  /** gRPC run id；Renix/Scapy 等无 run 概念的后端为 0 */
  readonly runId: number;
  readonly port: BackendEndpoint;
  readonly frames: number;
  readonly durationMs: number;
  /** 等待发送结束 */
  wait(timeoutMs?: number): Promise<void>;
  /** 提前停止当前发送 */
  stop(): Promise<void>;
  /** 查询当前 run 状态；不支持的后端返回 6 (DONE) */
  state(): Promise<number>;
}

/**
 * 适配器接口。
 *
 * 实现方只负责“怎么连、怎么发、怎么抓”，不负责逻辑端口解析、配置读取、
 * 多端口调度或测试动作编排。
 */
export interface TrafficBackend {
  /** 后端标识，便于日志/排障 */
  readonly kind: string;

  /** 建连/鉴权，必须在使用其它方法前调用 */
  init(): Promise<void>;
  /** 释放连接（端口释放由会话层显式处理） */
  close(): Promise<void>;

  /** 预约/占用端口（Renix：port_reserve；gRPC：OpenPort） */
  reservePort(port: BackendEndpoint): Promise<void>;
  /** 释放端口（Renix：port_release；gRPC：ClosePort） */
  releasePort(port: BackendEndpoint): Promise<void>;

  /** 停止该端口上的发送 */
  stopTransmit(port: BackendEndpoint): Promise<void>;

  /** 开始抓包 */
  startCapture(port: BackendEndpoint): Promise<void>;
  /** 停止抓包 */
  stopCapture(port: BackendEndpoint): Promise<void>;
  /** 获取从 startCapture 到 stopCapture 之间的报文 */
  readCapture(port: BackendEndpoint): Promise<CapturedPacket[]>;

  /** 发送单个报文；默认只保证启动，不等待完成 */
  sendPacket(
    port: BackendEndpoint,
    packet: PacketSpec,
    options?: SendOptions,
  ): Promise<void>;

  /** 启动发送并返回 handle；用于异步发送/显式等待/提前停止 */
  startTransmit(
    port: BackendEndpoint,
    packet: PacketSpec,
    options?: SendOptions,
  ): Promise<TransmitHandle>;

  /** 等待该端口最近一次发送结束 */
  waitTransmit(port: BackendEndpoint, timeoutMs?: number): Promise<void>;
}
