/**
 * 组合根：把配置、解析器和后端注册表装配成 TrafficSession。
 *
 * 这是唯一读取全局配置的地方；traffic / backends 内部不依赖全局 Config。
 */

import { BackendRegistry } from "../backends/registry";
import { streamPorts } from "../config/traffic";
import { StreamPortResolver } from "../traffic/resolver";
import { TrafficSession } from "../traffic/session";

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
