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

export * from "./base";

/** 测试编排、逻辑端口与报文构造 */
export * from "./testing";

/** 声明式拓扑与内置拓扑 */
export {
  link,
  LinkConstraint,
  topo,
  validateTopo,
} from "./topo/link-constraint";
export type { Link, PortMapping, TopoLinks } from "./topo/link-constraint";
export { dut, traffic } from "./topo/endpoints";
export type { DutName, Endpoint, PortName } from "./topo/endpoints";

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
} from "./comm/components";
export type { PacketCheckParam, PacketSendParam } from "./comm/components";

/** 设备与环境配置 */
export { Config } from "./comm/config";
export { Dut } from "./comm/dut";
