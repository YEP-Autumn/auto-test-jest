/**
 * stream-linux run 生命周期与资源清理。
 *
 * 负责：
 *   - RunRecord 索引（run_id <-> port）
 *   - TransmitHandle 构造
 *   - TrafficService.Stop
 *   - RunService.GetRun 轮询
 *   - 临时 template/channel/profile 资源删除
 */

import type { BackendEndpoint, TransmitHandle } from "../contract";
import type { StreamControlClient } from "./client";
import { assertResult, sleepMs } from "./util";

export interface ResourceRefLike {
  kind: string;
  path: string;
  id?: string;
  revision?: number;
}

export interface RunRecord {
  runId: number;
  port: BackendEndpoint;
  frames: number;
  durationMs: number;
  templateRef?: ResourceRefLike;
  channelRef?: ResourceRefLike;
  profileRef?: ResourceRefLike;
}

/** 删除一次发送创建的临时资源（best-effort） */
export async function cleanupResources(
  client: StreamControlClient,
  refs: {
    templateRef?: ResourceRefLike;
    channelRef?: ResourceRefLike;
    profileRef?: ResourceRefLike;
  },
): Promise<void> {
  for (const ref of [refs.channelRef, refs.templateRef, refs.profileRef]) {
    if (!ref) continue;
    try {
      await client.unary<any>(
        client.resource,
        "Delete",
        { ref, force: true },
        10_000,
      );
    } catch {
      // 资源可能已被删除
    }
  }
}

export class RunManager {
  private readonly runs = new Map<number, RunRecord>();
  private readonly byPort = new Map<string, number>();

  constructor(private readonly client: StreamControlClient) {}

  add(record: RunRecord): void {
    this.runs.set(record.runId, record);
    this.byPort.set(record.port.address, record.runId);
  }

  createHandle(record: RunRecord): TransmitHandle {
    return {
      runId: record.runId,
      port: record.port,
      frames: record.frames,
      durationMs: record.durationMs,
      wait: (timeoutMs?: number) => this.waitRun(record.runId, timeoutMs),
      stop: () => this.stop(record.port),
      state: async () => {
        if (!this.runs.has(record.runId)) return 6;
        const reply = await this.client.unary<any>(this.client.run, "GetRun", {
          run_id: record.runId,
        });
        if (Number(reply.result?.code ?? 0) === 2) {
          await this.stop(record.port);
          return 6;
        }
        assertResult(reply.result, `RunService.GetRun(${record.runId})`);
        return Number(reply.state ?? 0);
      },
    };
  }

  async stop(port: BackendEndpoint): Promise<void> {
    const runId = this.byPort.get(port.address);
    if (runId === undefined) return;

    const record = this.runs.get(runId);
    try {
      if (record?.channelRef) {
        const reply = await this.client.unary<any>(
          this.client.traffic,
          "Stop",
          { streams: [record.channelRef] },
          20_000,
        );
        // Run 可能已经自然结束；Stop 的 code=2 对清理是幂等的。
        const code = Number(reply.result?.code ?? 0);
        if (code !== 0 && code !== 2) {
          assertResult(reply.result, `TrafficService.Stop(${port.address})`);
        }
      }
    } finally {
      if (record) await cleanupResources(this.client, record);
      this.forget(runId);
    }
  }

  async wait(port: BackendEndpoint, timeoutMs?: number): Promise<void> {
    const runId = this.byPort.get(port.address);
    if (runId === undefined) return;
    await this.waitRun(runId, timeoutMs);
  }

  /** 停掉并清理所有已记录的 run */
  async stopAll(): Promise<void> {
    for (const record of Array.from(this.runs.values())) {
      try {
        await this.stop(record.port);
      } catch {
        // best-effort
      }
    }
    this.clear();
  }

  /** 回收已经结束但还占用槽位的 run */
  async reapCompleted(): Promise<void> {
    for (const record of Array.from(this.runs.values())) {
      try {
        const reply = await this.client.unary<any>(this.client.run, "GetRun", {
          run_id: record.runId,
        });
        const code = Number(reply.result?.code ?? 0);
        const state = Number(reply.state ?? 0);
        if (code === 2 || state === 6 || state === 7 || state === 8) {
          await this.stop(record.port);
        }
      } catch {
        // run 已被回收/暂时查询失败，留给下一次 stop/close
      }
    }
  }

  clear(): void {
    this.runs.clear();
    this.byPort.clear();
  }

  private forget(runId: number): void {
    const record = this.runs.get(runId);
    if (!record) return;
    this.runs.delete(runId);
    if (this.byPort.get(record.port.address) === runId) {
      this.byPort.delete(record.port.address);
    }
  }

  /** 轮询 RunService.GetRun 直到 DONE/FAILED/ABORTED */
  private async waitRun(runId: number, timeoutMs?: number): Promise<void> {
    const record = this.runs.get(runId);
    if (!record) return; // 已经被 stop/回收

    const limit = timeoutMs ?? Math.max(15_000, record.durationMs + 60_000);
    const deadline = Date.now() + limit;
    while (Date.now() < deadline) {
      const run = await this.client.unary<any>(this.client.run, "GetRun", {
        run_id: runId,
      });
      const code = Number(run.result?.code ?? 0);
      if (code === 2) {
        await this.stop(record.port);
        return;
      }
      assertResult(run.result, `RunService.GetRun(${runId})`);

      // RunState: RUN_DONE=6 RUN_FAILED=7 RUN_ABORTED=8
      const state = Number(run.state ?? 0);
      if (state === 6 || state === 7 || state === 8) {
        // 自然结束的 run 也要 Stop/StopTest 才会释放槽位和清理资源
        await this.stop(record.port);
        if (state !== 6) {
          throw new Error(
            `[streamcontrol] run ${runId} finished with state ${state}`,
          );
        }
        return;
      }
      await sleepMs(100);
    }
    throw new Error(`[streamcontrol] run ${runId} timeout (${limit}ms)`);
  }
}
