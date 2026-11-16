/**
 * 流量会话：应用层编排。
 *
 * 负责：
 *   - StreamPort -> ResolvedPort 解析；
 *   - 按 endpoint（provider + address）串行化操作；
 *   - 端口预留/释放；
 *   - 选择后端并转发 send / capture 请求；
 *   - 发送前能力校验。
 */

import type {
  CapturedPacket,
  SendOptions,
  TransmitHandle,
} from "../backends/contract";
import { BackendRegistry } from "../backends/registry";
import type { PacketSpec } from "../packet/model";
import {
  assertTrafficCapability,
  getTrafficCapabilities,
} from "./capabilities";
import { StreamPort } from "./model";
import { StreamPortResolver } from "./resolver";
import type { ResolvedPort } from "./types";
import { resolvedPortKey } from "./types";

export class TrafficSession {
  private readonly queues = new Map<string, Promise<unknown>>();
  private readonly reserved = new Map<string, ResolvedPort>();

  constructor(
    private readonly resolver: StreamPortResolver,
    private readonly registry: BackendRegistry,
  ) {}

  resolve(port: StreamPort): ResolvedPort {
    return this.resolver.resolve(port);
  }

  resolveTopology(port: StreamPort): ResolvedPort["topology"] {
    return this.resolver.resolveTopology(port);
  }

  capabilities(port: StreamPort) {
    return getTrafficCapabilities(this.resolve(port).endpoint.provider);
  }

  /** 建连 + 预留本测试用到的逻辑端口 */
  async init(ports: Iterable<StreamPort>): Promise<void> {
    for (const port of ports) {
      await this.reservePort(port);
    }
  }

  reservePort(port: StreamPort): Promise<void> {
    const resolved = this.resolve(port);
    return this.serialize(resolved, async () => {
      const key = resolvedPortKey(resolved);
      if (this.reserved.has(key)) return;
      const backend = await this.registry.get(resolved.endpoint.provider);
      await backend.reservePort(resolved.endpoint);
      this.reserved.set(key, resolved);
    });
  }

  releasePort(port: StreamPort): Promise<void> {
    const resolved = this.resolve(port);
    return this.serialize(resolved, async () => {
      const key = resolvedPortKey(resolved);
      if (!this.reserved.has(key)) return;
      const backend = this.registry.getExisting(resolved.endpoint.provider);
      if (backend) await backend.releasePort(resolved.endpoint);
      this.reserved.delete(key);
    });
  }

  stopTransmit(port: StreamPort): Promise<void> {
    const resolved = this.resolve(port);
    return this.serialize(resolved, async () => {
      const backend = await this.registry.get(resolved.endpoint.provider);
      await backend.stopTransmit(resolved.endpoint);
    });
  }

  startCapture(port: StreamPort): Promise<void> {
    const resolved = this.resolve(port);
    return this.serialize(resolved, async () => {
      const backend = await this.registry.get(resolved.endpoint.provider);
      await backend.startCapture(resolved.endpoint);
    });
  }

  stopCapture(port: StreamPort): Promise<void> {
    const resolved = this.resolve(port);
    return this.serialize(resolved, async () => {
      const backend = await this.registry.get(resolved.endpoint.provider);
      await backend.stopCapture(resolved.endpoint);
    });
  }

  readCapture(port: StreamPort): Promise<CapturedPacket[]> {
    const resolved = this.resolve(port);
    return this.serialize(resolved, async () => {
      const backend = await this.registry.get(resolved.endpoint.provider);
      return backend.readCapture(resolved.endpoint);
    });
  }

  startTransmit(
    port: StreamPort,
    packet: PacketSpec,
    options: SendOptions = {},
  ): Promise<TransmitHandle> {
    const resolved = this.resolve(port);
    this.assertSendCapabilities(resolved, options);
    return this.serialize(resolved, async () => {
      const backend = await this.registry.get(resolved.endpoint.provider);
      return backend.startTransmit(resolved.endpoint, packet, options);
    });
  }

  async sendPacket(
    port: StreamPort,
    packet: PacketSpec,
    options: SendOptions = {},
  ): Promise<void> {
    const handle = await this.startTransmit(port, packet, options);
    if (options.wait === true) {
      await handle.wait(options.timeoutMs);
    }
  }

  waitTransmit(port: StreamPort, timeoutMs?: number): Promise<void> {
    const resolved = this.resolve(port);
    return this.serialize(resolved, async () => {
      const backend = await this.registry.get(resolved.endpoint.provider);
      await backend.waitTransmit(resolved.endpoint, timeoutMs);
    });
  }

  /** 释放端口并关闭后端；单个端口失败不影响其它端口 */
  async close(): Promise<void> {
    const errors: string[] = [];
    for (const resolved of Array.from(this.reserved.values())) {
      try {
        const backend = this.registry.getExisting(resolved.endpoint.provider);
        if (backend) await backend.releasePort(resolved.endpoint);
      } catch (err) {
        errors.push(String(err));
      }
    }
    this.reserved.clear();
    this.queues.clear();
    try {
      await this.registry.close();
    } catch (err) {
      errors.push(String(err));
    }
    if (errors.length > 0) {
      throw new Error(`关闭流量会话失败：${errors.join("; ")}`);
    }
  }

  /** 同一物理端口串行执行；前一个失败也继续执行后一个 */
  private serialize<T>(
    resolved: ResolvedPort,
    fn: () => Promise<T>,
  ): Promise<T> {
    const key = resolvedPortKey(resolved);
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

  private assertSendCapabilities(
    resolved: ResolvedPort,
    options: SendOptions,
  ): void {
    const provider = resolved.endpoint.provider;
    if (options.modifiers && options.modifiers.length > 0) {
      assertTrafficCapability(provider, "modifiers");
    }
    if (options.transmit?.fixed_len) {
      assertTrafficCapability(provider, "fixedLength");
    }
  }
}
