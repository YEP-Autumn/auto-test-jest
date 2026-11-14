/**
 * 流量后端控制层。
 *
 * `TrafficManager` 按逻辑端口的 provider 路由到具体后端，并负责：
 *   - provider 后端的惰性创建/初始化/关闭；
 *   - 同一逻辑端口上的操作串行化，避免 capture/apply/run 竞争；
 *   - 实现现有 `TrafficBackend` 接口，让 components 可以继续按原方式调用。
 *
 * 复用现有 RenixHttpBackend / StreamControlBackend，不重写收发逻辑；
 * renix / scapy 通过同一个 HttpTrafficTransport 共享登录与上传。
 */

import type { TrafficBackend } from "../stream/backend/types";
import { HttpTrafficTransport } from "../stream/backend/shared/http-transport";
import { RenixHttpBackend } from "../stream/backend/http/renix-http";
import { StreamControlBackend } from "../stream/backend/grpc/stream-linux";
import type { CapturedPacket, SendOptions } from "../stream/backend/types";
import type { PacketSpec } from "../stream/packet/model";
import {
  assertTrafficCapability,
  getTrafficCapabilities,
  type TrafficCapabilities,
} from "./capabilities";
import type { TrafficPort, TrafficProvider } from "./model";

export class TrafficManager implements TrafficBackend {
  readonly kind = "traffic-manager";

  private backends = new Map<TrafficProvider, TrafficBackend>();
  private backendInits = new Map<TrafficProvider, Promise<TrafficBackend>>();
  private ports = new Map<string, TrafficPort>();
  private queues = new Map<string, Promise<unknown>>();

  /**
   * renix / scapy 共用同一个 HTTP transport：
   * - 只登录一次；
   * - 请求体里的 backend 仍由具体端口决定。
   */
  private httpTransport: HttpTrafficTransport | undefined;

  /**
   * 注册一个端口。重复注册同一个逻辑端口时保持 provider 一致，
   * 防止同一端口在一次测试中被两个后端同时占用。
   */
  register(port: TrafficPort): TrafficPort {
    const resolved = port;
    const key = this.key(resolved);
    if (resolved.id) {
      for (const existing of this.ports.values()) {
        if (
          existing.id === resolved.id &&
          existing.provider !== resolved.provider
        ) {
          throw new Error(
            `端口 ${resolved.id} 已注册为 ${existing.provider}，不能再作为 ${resolved.provider} 使用`,
          );
        }
      }
    }
    this.ports.set(key, resolved);
    return resolved;
  }

  /**
   * 建连并初始化用到的 provider。
   *
   * `ports` 可选：传了就一并注册；不传则使用之前 `register()` 的端口。
   */
  async init(ports?: Iterable<TrafficPort>): Promise<void> {
    if (ports) {
      for (const port of ports) this.register(port);
    }

    const providers = new Set<TrafficProvider>();
    for (const port of this.ports.values()) providers.add(port.provider);

    await Promise.all(
      Array.from(providers, (provider) => this.ensureBackend(provider)),
    );
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
    this.backendInits.clear();
    this.httpTransport = undefined;
    this.ports.clear();
    this.queues.clear();

    if (errors.length > 0) {
      throw new Error(`关闭流量后端失败：${errors.join("; ")}`);
    }
  }

  reservePort(port: TrafficPort): Promise<void> {
    const resolved = this.register(port);
    return this.serialize(this.key(resolved), async () => {
      const backend = await this.ensureBackend(resolved.provider);
      return backend.reservePort(resolved);
    });
  }

  releasePort(port: TrafficPort): Promise<void> {
    const resolved = this.register(port);
    return this.serialize(this.key(resolved), async () => {
      // 初始化失败的端口没有可释放的后端，不要在这里重新触发 login/connect
      const backend = this.backends.get(resolved.provider);
      if (!backend) return;
      return backend.releasePort(resolved);
    });
  }

  stopTransmit(port: TrafficPort): Promise<void> {
    const resolved = this.register(port);
    return this.serialize(this.key(resolved), async () => {
      const backend = await this.ensureBackend(resolved.provider);
      return backend.stopTransmit(resolved);
    });
  }

  startCapture(port: TrafficPort): Promise<void> {
    const resolved = this.register(port);
    return this.serialize(this.key(resolved), async () => {
      const backend = await this.ensureBackend(resolved.provider);
      return backend.startCapture(resolved);
    });
  }

  stopCapture(port: TrafficPort): Promise<void> {
    const resolved = this.register(port);
    return this.serialize(this.key(resolved), async () => {
      const backend = await this.ensureBackend(resolved.provider);
      return backend.stopCapture(resolved);
    });
  }

  readCapture(port: TrafficPort): Promise<CapturedPacket[]> {
    const resolved = this.register(port);
    return this.serialize(this.key(resolved), async () => {
      const backend = await this.ensureBackend(resolved.provider);
      return backend.readCapture(resolved);
    });
  }

  sendPacket(
    port: TrafficPort,
    packet: PacketSpec,
    options: SendOptions = {},
  ): Promise<void> {
    const resolved = this.register(port);
    this.assertSendCapabilities(resolved.provider, options);

    return this.serialize(this.key(resolved), async () => {
      const backend = await this.ensureBackend(resolved.provider);
      return backend.sendPacket(resolved, packet, options);
    });
  }

  /** 查询 provider 的能力声明 */
  capabilities(provider: TrafficProvider): TrafficCapabilities {
    return getTrafficCapabilities(provider);
  }

  /** 查询某个端口当前 provider 的能力声明 */
  capabilitiesFor(port: TrafficPort): TrafficCapabilities {
    return getTrafficCapabilities(this.register(port).provider);
  }

  /**
   * 发送前只校验控制层能明确判断的能力。
   *
   * burstGap 目前不校验：stream-linux 会被压平成普通 BURST，但现有用例只
   * 关心总帧数，贸然抛错会破坏存量回归。等后端补齐 gap 后再打开。
   */
  private assertSendCapabilities(
    provider: TrafficProvider,
    options: SendOptions,
  ): void {
    if (options.modifiers && options.modifiers.length > 0) {
      assertTrafficCapability(provider, "modifiers");
    }
    if (options.transmit?.fixed_len) {
      assertTrafficCapability(provider, "fixedLength");
    }
  }

  /** provider + address 是实际后端资源；同一物理端口的别名共用一把锁 */
  private key(port: TrafficPort): string {
    return `${port.provider}:${port.address}`;
  }

  /**
   * 同一端口串行执行。前一个操作失败也要继续执行后一个，
   * 否则一次 send 失败会让该端口后续 capture/check 全部卡住。
   */
  private serialize<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const previous = this.queues.get(key) ?? Promise.resolve();
    const next = previous.then(fn, fn);
    this.queues.set(
      key,
      next.then(
        () => undefined,
        () => undefined,
      ),
    );
    return next;
  }

  private async ensureBackend(
    provider: TrafficProvider,
  ): Promise<TrafficBackend> {
    const existing = this.backends.get(provider);
    if (existing) return existing;

    const pending = this.backendInits.get(provider);
    if (pending) return pending;

    const promise = (async () => {
      const backend = this.createBackend(provider);
      await backend.init();
      this.backends.set(provider, backend);
      return backend;
    })();

    this.backendInits.set(provider, promise);
    try {
      return await promise;
    } finally {
      this.backendInits.delete(provider);
    }
  }

  private createBackend(provider: TrafficProvider): TrafficBackend {
    switch (provider) {
      case "renix":
      case "scapy":
        // renix / scapy 共用同一套 HTTP transport，只登录一次；
        // 请求体里的 backend 仍由具体端口决定。
        this.httpTransport ??= new HttpTrafficTransport();
        return new RenixHttpBackend(this.httpTransport);
      case "stream-linux":
        return new StreamControlBackend();
      default:
        throw new Error(`未知的流量后端：${String(provider)}`);
    }
  }
}
