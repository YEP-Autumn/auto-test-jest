/**
 * 后端起注册表 / 工厂。
 *
 * 负责按 provider 惰性创建并初始化适配器；renix 与 scapy 共用同一个 HTTP
 * transport，只登录一次。组合根可以注入自定义 factory（测试替身）。
 */

import type { ProviderId, TrafficBackend } from "./contract";
import { RenixHttpBackend } from "./http/renix-http";
import { StreamControlBackend } from "./grpc/stream-linux";
import { HttpTrafficTransport } from "./shared/http-transport";

export type BackendFactory = () => TrafficBackend;

export interface BackendRegistryOptions {
  factories?: Partial<Record<ProviderId, BackendFactory>>;
  /** renix/scapy 共用的 HTTP 工厂；默认使用全局配置 */
  httpFactory?: (provider: ProviderId) => TrafficBackend;
  /** stream-linux 工厂；默认使用全局配置 */
  grpcFactory?: () => TrafficBackend;
}

export class BackendRegistry {
  private readonly backends = new Map<ProviderId, TrafficBackend>();
  private readonly pending = new Map<ProviderId, Promise<TrafficBackend>>();
  private readonly factories: Partial<Record<ProviderId, BackendFactory>>;
  private readonly httpFactory: (provider: ProviderId) => TrafficBackend;
  private readonly grpcFactory: () => TrafficBackend;

  constructor(options: BackendRegistryOptions = {}) {
    this.factories = options.factories ?? {};
    const sharedTransport = options.httpFactory
      ? undefined
      : new HttpTrafficTransport();
    this.httpFactory =
      options.httpFactory ??
      (() => new RenixHttpBackend(sharedTransport as HttpTrafficTransport));
    this.grpcFactory = options.grpcFactory ?? (() => new StreamControlBackend());
  }

  async get(provider: ProviderId): Promise<TrafficBackend> {
    const existing = this.backends.get(provider);
    if (existing) return existing;

    const pending = this.pending.get(provider);
    if (pending) return pending;

    const promise = (async () => {
      const backend = this.create(provider);
      await backend.init();
      this.backends.set(provider, backend);
      return backend;
    })();

    this.pending.set(provider, promise);
    try {
      return await promise;
    } finally {
      this.pending.delete(provider);
    }
  }

  /** 已初始化的后端；不会触发建连 */
  getExisting(provider: ProviderId): TrafficBackend | undefined {
    return this.backends.get(provider);
  }

  async close(): Promise<void> {
    const errors: string[] = [];
    for (const backend of this.backends.values()) {
      try {
        await backend.close();
      } catch (err) {
        errors.push(String(err));
      }
    }
    this.backends.clear();
    this.pending.clear();
    if (errors.length > 0) {
      throw new Error(`关闭流量后端失败：${errors.join("; ")}`);
    }
  }

  private create(provider: ProviderId): TrafficBackend {
    const custom = this.factories[provider];
    if (custom) return custom();
    switch (provider) {
      case "renix":
      case "scapy":
        return this.httpFactory(provider);
      case "stream-linux":
        return this.grpcFactory();
      default:
        throw new Error(`未知的流量后端：${String(provider)}`);
    }
  }
}
