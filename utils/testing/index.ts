/**
 * 测试侧内部聚合。
 *
 * 测试用例统一从 `@/utils` 导入；这里只负责把测试侧 API 汇总给 `utils/index.ts`：
 *   - StreamPort：逻辑端口令牌
 *   - PacketBuilder：报文构造
 *   - TestHelper：测试动作编排
 *
 * backend / codec / provider / address 等细节不在这里暴露。
 */

export { StreamPort } from "./stream-port";
export type { TrafficPortId } from "./stream-port";

export { PacketBuilder } from "../packet/model";
export type { PacketSpec, PacketLayer } from "../packet/model";

export * from "./test-helper";
export { TransmitMode } from "../packet/types";
export type { TransmitHandle } from "../backends/contract";
