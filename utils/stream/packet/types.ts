/**
 * 报文发送相关的公共类型。
 *
 * 这些类型原先定义在 comm/components.ts，为了让 stream backend（Renix HTTP、
 * streamcontrol gRPC 等）不依赖测试组件层，统一下沉到这里；components.ts 会
 * 原样 re-export，保持既有测试代码的 import 路径不变。
 */

/** 可被 modifier 修改的报文字段 */
export enum ModifierField {
  EthernetII_MAC_SRC = 0,
  EthernetII_MAC_DST,
  IPv4_IP_SRC,
  IPv4_IP_DST,
  TCP_PORT_SRC,
  TCP_PORT_DST,
  UDP_PORT_SRC,
  UDP_PORT_DST,
  Dot3_MAC_SRC,
  Dot3_MAC_DST,
}

/** 发送模式 */
export enum TransmitMode {
  CONTINUOUS = "Continuous",
  BURST = "Burst",
  STEP = "Step",
  TIME = "Time",
}

/** 突发间隔单位 */
export enum BurstGapUnit {
  NS = "NS",
  US = "US",
  MS = "MS",
  SEC = "SEC",
  BYTES = "BYTES",
}

/** 突发速率单位 */
export enum BurstRateUnit {
  FRAME_PER_SEC = "FRAME_PER_SEC",
  BYTE_PER_SEC = "BYTE_PER_SEC",
  PERCENT = "PERCENT",
}

/** modifier 变化模式 */
export enum ModifierMode {
  Increment = "Increment",
  Decrement = "Decrement",
  Random = "Random",
}

/** 报文字段修改参数 */
export interface PacketModifierParam {
  modifier_field: ModifierField;
  mode: ModifierMode;
  start_value: string;
  step?: number;
  count: number;
}

/** 突发模式参数 */
export interface TransmitBurstParam {
  burst_size?: number;
  burst_count?: number;
  gap?: number;
  gap_unit?: BurstGapUnit;
  rate?: number;
  rate_unit?: BurstRateUnit;
}

/** 步进模式参数 */
export interface TransmitStepParam {
  step_count: number;
}

/** 连续模式参数 */
export interface TransmitContinuousParam {
  percent_rate: number;
}

/** 定时模式参数 */
export interface TransmitTimeParam {
  time_seconds: number;
}

/** 发送模式参数 */
export interface PacketTransmitModeParam {
  mode: TransmitMode;
  param?:
    | TransmitBurstParam
    | TransmitStepParam
    | TransmitContinuousParam
    | TransmitTimeParam;
  fixed_len?: number;
}
