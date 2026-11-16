/**
 * stream-linux 抓包生命周期与读取。
 *
 * 只负责 CaptureService / FileService 相关操作；端口打开、发送、run 管理等
 * 仍由 StreamControlBackend 负责。
 */

import type { BackendEndpoint, CapturedPacket } from "../contract";
import { decodeFrame } from "../codec/frame/decode";
import { toStruct } from "../shared/grpc-struct";
import type { StreamControlClient } from "./client";
import { waitJob } from "./jobs";
import { parsePcapFrames } from "./pcap";
import { StreamControlConfig } from "../../config/backends";
import { assertResult, batchCaptureThreshold, sleepMs } from "./util";

export class CaptureManager {
  private readonly refs = new Map<string, any>();
  private readonly running = new Set<string>();
  private seq = 0;

  constructor(private readonly client: StreamControlClient) {}

  async start(port: BackendEndpoint): Promise<void> {
    const ref = await this.ensureCapture(port);

    // 幂等：已经在跑就不重复 Reset/Start（ResetParser 会拒绝运行中的 capture）
    const current = await this.client.unary<any>(this.client.capture, "Get", {
      ref,
    });
    assertResult(current.result, `CaptureService.Get(${port.address})`);
    if (Number(current.status?.state ?? 0) === 3) {
      this.running.add(port.address);
      return;
    }

    // 与旧后端语义对齐：每次 startCapture 都从空缓冲开始
    const reset = await this.client.unary<any>(
      this.client.capture,
      "ResetParser",
      { ref },
    );
    assertResult(reset.result, `CaptureService.ResetParser(${port.address})`);
    await waitJob(
      this.client,
      reset.job_id,
      `CaptureService.ResetParser(${port.address})`,
    );

    const reply = await this.client.unary<any>(this.client.capture, "Start", {
      refs: [ref],
    });
    assertResult(reply.result, `CaptureService.Start(${port.address})`);
    await waitJob(
      this.client,
      reply.job_id,
      `CaptureService.Start(${port.address})`,
    );
    await this.waitRunning(ref);
    this.running.add(port.address);
  }

  async stop(port: BackendEndpoint): Promise<void> {
    const ref = await this.ensureCapture(port);

    // 不先判断 state：STARTING/IDLE 等情况下也需要 Stop，否则 capture 线程
    // 可能仍持有端口。
    try {
      const reply = await this.client.unary<any>(this.client.capture, "Stop", {
        refs: [ref],
      });
      if (Number(reply.result?.code ?? 0) === 0) {
        await waitJob(
          this.client,
          reply.job_id,
          `CaptureService.Stop(${port.address})`,
        );
      }
    } catch {
      // capture 未运行/已停止
    }

    await this.waitStopped(ref, port.address);
    this.running.delete(port.address);
  }

  async read(port: BackendEndpoint): Promise<CapturedPacket[]> {
    const ref = await this.ensureCapture(port);
    return this.collect(port, ref, true);
  }

  /** 释放单个端口对应的 capture 资源 */
  async release(port: BackendEndpoint): Promise<void> {
    const ref = this.refs.get(port.address);
    if (!ref) return;
    try {
      await this.stop(port);
    } catch {
      // 可能已停止
    }
    try {
      await this.client.unary<any>(this.client.capture, "Delete", ref);
    } catch {
      // 可能已被删除
    }
    this.refs.delete(port.address);
    this.running.delete(port.address);
  }

  /** 关闭并删除本进程创建/复用的所有 capture */
  async closeAll(): Promise<void> {
    for (const [name, ref] of Array.from(this.refs.entries())) {
      try {
        if (this.running.has(name)) {
          await this.client.unary<any>(this.client.capture, "Stop", {
            refs: [ref],
          });
        }
        await this.client.unary<any>(this.client.capture, "Delete", ref);
      } catch {
        // best-effort
      }
    }
    this.refs.clear();
    this.running.clear();
  }

  /** 删除上一次进程遗留的 auto-test capture（capture 线程会占用端口） */
  async cleanupStale(): Promise<void> {
    try {
      const list = await this.client.unary<any>(
        this.client.capture,
        "List",
        {},
      );
      for (const config of list.configs ?? []) {
        const path = String(config.ref?.path ?? "");
        if (!path.includes("auto-test-capture-")) continue;
        try {
          await this.client.unary<any>(this.client.capture, "Stop", {
            refs: [config.ref],
          });
          await this.waitStopped(config.ref, path);
        } catch {
          // 未运行
        }
        try {
          await this.client.unary<any>(
            this.client.capture,
            "Delete",
            config.ref,
          );
        } catch {
          // 已删除
        }
      }
    } catch {
      // List/Delete 不可用时忽略
    }
    this.refs.clear();
    this.running.clear();
  }

  /** 找到端口对应的 Capture 资源；没有则创建并缓存 ref */
  private async ensureCapture(port: BackendEndpoint): Promise<any> {
    const cached = this.refs.get(port.address);
    if (cached) return cached;

    const list = await this.client.unary<any>(this.client.capture, "List", {
      port: { path: `port[${port.address}]` },
    });
    assertResult(list.result, `CaptureService.List(${port.address})`);

    const configs = Array.isArray(list.configs) ? list.configs : [];
    const existing =
      configs.find(
        (config: any) => config?.port?.path === `port[${port.address}]`,
      ) ?? (configs.length === 1 ? configs[0] : undefined);
    if (existing?.ref) {
      this.refs.set(port.address, existing.ref);
      return existing.ref;
    }

    const safeName = port.address.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const created = await this.client.unary<any>(
      this.client.capture,
      "Create",
      {
        kind: "capture",
        name: `auto-test-capture-${safeName}`,
        // 引擎 spec 约定（src/api/engine_captures.c）：
        //   port 是端口名字符串；mode=1 表示 WRAP；maxBytes/maxFrames 给引擎。
        spec: toStruct({
          port: port.address,
          mode: 1,
          maxBytes: 4 * 1024 * 1024,
          maxFrames: 65536,
        }),
      },
    );
    assertResult(created.result, `CaptureService.Create(${port.address})`);

    const ref = created.config?.ref;
    if (!ref) {
      throw new Error(
        `[streamcontrol] CaptureService.Create(${port.address}) 未返回 config.ref`,
      );
    }
    this.refs.set(port.address, ref);
    return ref;
  }

  /** 读取 capture 当前缓冲区中的帧（不清空） */
  private async collect(
    port: BackendEndpoint,
    ref: any,
    allowBatch = false,
  ): Promise<CapturedPacket[]> {
    const got = await this.client.unary<any>(this.client.capture, "Get", {
      ref,
    });
    assertResult(got.result, `CaptureService.Get(${port.address})`);

    const count = Number(got.status?.captured_packet_count ?? 0);

    if (
      allowBatch &&
      count > 0 &&
      // Download 导出的是当前缓冲区；抓包仍在运行时保守走 ReadByIndex
      !this.running.has(port.address) &&
      count >= batchCaptureThreshold()
    ) {
      try {
        const batches = await this.collectViaDownload(port, ref);
        if (batches.length > 0) {
          if (StreamControlConfig.debugCapture) {
            console.log(
              `[streamcontrol] batch capture ${batches.length} frame(s) on ${port.address}`,
            );
          }
          return batches;
        }
      } catch (err) {
        // 网关未配置 state_dir / 文件导出失败时，退回逐帧读取
        if (StreamControlConfig.debugCapture) {
          console.warn(
            `[streamcontrol] batch capture failed on ${port.address}, fallback ReadByIndex:`,
            err,
          );
        }
      }
    }

    const packets: CapturedPacket[] = [];
    for (let index = 0; index < count; index++) {
      const reply = await this.client.unary<any>(
        this.client.capture,
        "ReadByIndex",
        { ref, index },
      );
      assertResult(
        reply.result,
        `CaptureService.ReadByIndex(${port.address}, ${index})`,
      );
      const frame = reply.frame;
      if (!frame?.data) continue;
      const raw = Buffer.from(frame.data);
      packets.push({
        raw,
        timestampNs:
          frame.timestamp_ns !== undefined
            ? BigInt(frame.timestamp_ns)
            : undefined,
        layers: decodeFrame(raw),
      });
    }
    return packets;
  }

  /**
   * 批量抓包：Capture.Download 导出 pcap，再通过 FileService.Download 取回。
   * 适用于抓包已停止、帧数较多的场景（PacketChecker 的典型路径）。
   */
  private async collectViaDownload(
    port: BackendEndpoint,
    ref: any,
  ): Promise<CapturedPacket[]> {
    const reply = await this.client.unary<any>(
      this.client.capture,
      "Download",
      {
        refs: [ref],
        file_dir: "captures",
        // 引擎会按 capture id 命名，file_name 只是提示
        file_name: `auto-test-${Date.now()}-${++this.seq}.pcap`,
        category_by_port: false,
        max_download_data_count: 0,
      },
      30_000,
    );
    assertResult(reply.result, `CaptureService.Download(${port.address})`);
    await waitJob(
      this.client,
      reply.job_id,
      `CaptureService.Download(${port.address})`,
    );

    const files: string[] = Array.isArray(reply.files) ? reply.files : [];
    const pcapFiles = files.filter((file) => /\.pcap$/i.test(file));
    if (pcapFiles.length === 0) {
      throw new Error(
        `[streamcontrol] CaptureService.Download 未返回 pcap 文件（${files.join(
          ", ",
        )}）`,
      );
    }

    const packets: CapturedPacket[] = [];
    try {
      for (const file of pcapFiles) {
        const buffer = await this.downloadFile(file);
        packets.push(...parsePcapFrames(buffer));
      }
    } finally {
      // 删除导出文件（含 .pcap.json sidecar），避免 state_dir 持续增长
      try {
        await this.client.unary<any>(this.client.files, "Delete", {
          paths: files,
        });
      } catch {
        // best-effort
      }
    }
    return packets;
  }

  /** 通过 FileService.Download 读取一个逻辑文件 */
  private async downloadFile(path: string): Promise<Buffer> {
    const chunks = await this.client.serverStream<any>(
      this.client.files,
      "Download",
      { paths: [path] },
      30_000,
    );
    // 按 offset 排序，避免网关/网络层乱序（正常 gRPC 流是有序的）
    chunks.sort((a, b) => Number(a.offset ?? 0) - Number(b.offset ?? 0));
    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk.data ?? [])));
  }

  /** 等 capture 进入 RUNNING（Start 返回后线程可能还在启动） */
  private async waitRunning(ref: any): Promise<void> {
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline) {
      const got = await this.client.unary<any>(this.client.capture, "Get", {
        ref,
      });
      if (
        Number(got.result?.code ?? 0) === 0 &&
        Number(got.status?.state ?? 0) === 3
      ) {
        return;
      }
      await sleepMs(50);
    }
  }

  /** 等 capture 从 RUNNING 退出（引擎停止线程是异步的） */
  private async waitStopped(ref: any, name: string): Promise<void> {
    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) {
      const got = await this.client.unary<any>(this.client.capture, "Get", {
        ref,
      });
      assertResult(got.result, `CaptureService.Get(${name})`);
      if (Number(got.status?.state ?? 0) !== 3) return;
      await sleepMs(50);
    }
  }
}
