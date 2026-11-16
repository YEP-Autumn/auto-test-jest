/**
 * 组合根：把配置、解析器和后端注册表装配成 TrafficSession。
 *
 * 配置注入尚未完全收敛：目前 adapters 仍会读取 runtime/config 的默认值，
 * 后续应改为由这里构造并传入 settings。
 */

import { BackendRegistry } from "./traffic/registry";
import { streamPorts } from "./config/traffic";
import { StreamPortResolver } from "./traffic/resolver";
import { TrafficSession } from "./traffic/session";

export interface CreateTrafficSessionOptions {
  resolver?: StreamPortResolver;
  registry?: BackendRegistry;
}

export function createTrafficSession(
  options: CreateTrafficSessionOptions = {},
): TrafficSession {
  const resolver = options.resolver ?? new StreamPortResolver(streamPorts);
  const registry = options.registry ?? new BackendRegistry();
  return new TrafficSession(resolver, registry);
}
