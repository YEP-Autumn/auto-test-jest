/**
 * @deprecated 已迁移到 `./backend/http/renix-http` 的 RenixHttpBackend。
 *
 * 保留此文件仅用于兼容旧的 import；新代码请使用
 * `createStreamBackend()` 或 `TrafficBackend` 接口。
 */
export { RenixHttpBackend as StreamBackendApi } from "./backend/http/renix-http";
export type { LoginResponse } from "./backend/http/renix-http";
