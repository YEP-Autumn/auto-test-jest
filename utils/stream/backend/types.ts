/**
 * 打流/抓包后端抽象。
 *
 * 测试组件只依赖该接口，不关心底层是信而泰 HTTP 后端、Scapy 还是
 * stream-linux gRPC：
 * - init/close：建连与释放（login / gRPC channel）
 * - reservePort/releasePort：端口占用与释放
 * - startCapture/stopCapture/readCapture：抓包
 * - sendPacket：按 PacketSpec 构造并发送报文
 * - stopTransmit：停止当前端口上的发送
 *
 * 端口统一使用 `TrafficPort`（逻辑端口 + provider + address + topology）。
 */

import type { TrafficPort } from "../../traffic/model";
import { PacketLayer, PacketSpec } from "../packet/model";
import { PacketModifierParam, PacketTransmitModeParam } from "../packet/types";

/** 抓包得到的一个报文 */
export interface CapturedPacket {
  /** 中立协议层列表，可直接交给 packet-utils 的 match* 使用 */
  layers: PacketLayer[];
  /** 原始以太网帧（gRPC 后端可用；thrift 后端可能没有） */
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
}

export interface TrafficBackend {
  /** 后端标识，便于日志/排障 */
  readonly kind: string;

  /** 建连/鉴权，必须在使用其它方法前调用 */
  init(): Promise<void>;
  /** 释放连接（端口释放由 TestHelper.destroy 显式处理） */
  close(): Promise<void>;

  /** 预约/占用端口（Renix：port_reserve；gRPC：OpenPort） */
  reservePort(port: TrafficPort): Promise<void>;
  /** 释放端口（Renix：port_release；gRPC：ClosePort） */
  releasePort(port: TrafficPort): Promise<void>;

  /** 停止该端口上的发送 */
  stopTransmit(port: TrafficPort): Promise<void>;

  /** 开始抓包 */
  startCapture(port: TrafficPort): Promise<void>;
  /** 停止抓包 */
  stopCapture(port: TrafficPort): Promise<void>;
  /** 获取从 startCapture 到 stopCapture 之间的报文 */
  readCapture(port: TrafficPort): Promise<CapturedPacket[]>;

  /** 发送单个报文 */
  sendPacket(
    port: TrafficPort,
    packet: PacketSpec,
    options?: SendOptions,
  ): Promise<void>;
}
