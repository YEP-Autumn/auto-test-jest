/**
 * 测试用例统一入口。
 *
 * 用例只从这里 import，无需关心 DUT、拓扑、流量后端等内部模块的拆分：
 *
 *   import {
 *     LinkConstraint,
 *     PacketBuilder,
 *     Port,
 *     StreamPort,
 *     TestHelper,
 *     TransmitMode,
 *   } from "@/utils";
 *
 * 需要直接使用后端/编解码内部模块的单元测试，仍可从 `@/utils/<module>` 导入。
 */

export * from "./shared/base";

/** 测试编排、逻辑端口与报文构造 */
export * from "./runtime/test-helper";
export { StreamPort } from "./domain/traffic/stream-port";
export type { TrafficPortId } from "./domain/traffic/stream-port";
export { PacketBuilder } from "./domain/packet/model";
export type { PacketLayer, PacketSpec } from "./domain/packet/model";
export { TransmitMode } from "./domain/packet/types";
export type { TransmitHandle } from "./contracts/traffic-backend";
export { createTrafficSession } from "./runtime/create-session";

/** 声明式拓扑与内置拓扑 */
export {
  link,
  LinkConstraint,
  topo,
  validateTopo,
} from "./runtime/topologies/catalog";
export type { Link, PortMapping, TopoLinks } from "./domain/topology/model";
export { dut, traffic } from "./runtime/topologies/endpoints";
export type {
  DutName,
  Endpoint,
  PortName,
} from "./runtime/topologies/endpoints";

/** 发送/校验参数与常用枚举 */
export {
  BurstGapUnit,
  BurstRateUnit,
  DutHandle,
  EqualTo,
  GreaterThan,
  LessThan,
  ModifierField,
  ModifierMode,
} from "./runtime/actions";
export type { PacketCheckParam, PacketSendParam } from "./runtime/actions";

/** 设备与环境配置 */
export { Config } from "./runtime/config";
export { Dut } from "./adapters/device/dut";
