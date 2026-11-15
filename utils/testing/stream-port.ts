/**
 * 对测试用例暴露的逻辑端口令牌。
 *
 * 只 re-export，真正的定义在 traffic 领域模型中，避免出现第二份 id。
 */
export { StreamPort } from "../traffic/model";
export type { TrafficPortId } from "../traffic/model";
