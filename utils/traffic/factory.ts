/**
 * 流量控制层工厂。
 *
 * 与 `createStreamBackend()` 的区别：
 *   - 旧工厂按全局环境变量创建一个后端；
 *   - TrafficManager 按每个逻辑端口的 provider 路由，可同时承载多个后端。
 *
 * Phase 1 默认仍由端口解析决定 provider，因此不传参即可保持旧行为。
 */

import { TrafficManager } from "./manager";

export function createTrafficManager(): TrafficManager {
  return new TrafficManager();
}
