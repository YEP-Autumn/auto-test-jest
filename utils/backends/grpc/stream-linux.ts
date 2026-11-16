/**
 * streamcontrol gRPC 后端。
 *
 * 对应契约：utils/rpc/grpc/streamcontrol.proto（streamcontrol.v1）。
 *
 * 关键点（基于 2026-11-14 网关实测）：
 * - 鉴权：metadata `authorization: Bearer <token>`；TLS 可用 CA 或 TLS_INSECURE。
 * - 抓包：Capture.Create 的 spec 必须是 Struct 形态，且 port 是端口名字符串；
 *   ReadByIndex 返回原始帧，由 codec/frame/decode 解码成 PacketLayer。
 * - 发送：PacketBuilder -> StreamTemplate/StreamChannel ->
 *   TrafficService.Start（引擎 TEST_START_SPEC inline blocks）。
 *   不写全局 ConfigApply，不关闭端口；不同 tx 端口可以独立启停。
 * - 抓包停止由引擎 drain RX ring；发送结束后 Stop channel 并删除临时资源。
 */

import {
  StreamControlConfig,
  type StreamControlSettings,
} from "../../config/backends";
import { FieldType, PacketSpec } from "../../packet/model";
import { TransmitMode } from "../../packet/types";
import { canUseFixedSnmpTemplate, encodeSnmpMessage } from "../codec/snmp";
import { HeaderInstance, packetToHeaders } from "../codec/grpc/headers";
import { CaptureManager } from "./capture";
import {
  cleanupResources,
  RunManager,
  type ResourceRefLike,
  type RunRecord,
} from "./run";
import { StreamControlClient } from "./client";
import {
  durationFromOptions,
  frameLengthForHeaders,
  framesFromOptions,
  headerLengthTotal,
} from "./template";
import { assertResult } from "./util";
import {
  CapturedPacket,
  SendOptions,
  TrafficBackend,
  TransmitHandle,
  BackendEndpoint,
} from "../contract";

export class StreamControlBackend implements TrafficBackend {
  readonly kind = "streamcontrol-grpc";

  private readonly client: StreamControlClient;
  private readonly captureManager: CaptureManager;
  private readonly runManager: RunManager;
  private initialized = false;
  private openedPorts = new Set<string>();
  private nameSeq = 0;

  constructor(
    private readonly settings: StreamControlSettings = StreamControlConfig,
  ) {
    this.client = new StreamControlClient(settings);
    this.captureManager = new CaptureManager(this.client);
    this.runManager = new RunManager(this.client);
  }

  /** Hello 返回的能力/限额，供测试侧做能力门禁 */
  public features: string[] = [];
  public limits: any;

  async init(): Promise<void> {
    if (this.initialized) return;

    await this.client.connect();

    try {
      const hello = await this.client.unary<any>(this.client.system, "Hello", {
        client: "auto-test-jest",
        protocol_major: 1,
        protocol_minor: 0,
      });
      assertResult(hello.result, "SystemService.Hello");

      this.features = Array.isArray(hello.features) ? hello.features : [];
      this.limits = hello.limits;
      this.initialized = true;

      console.log(
        `[streamcontrol] connected ${this.settings.address}` +
          (hello.gateway_version ? ` gateway=${hello.gateway_version}` : "") +
          (hello.engine_version ? ` engine=${hello.engine_version}` : "") +
          (this.features.length ? ` features=${this.features.join(",")}` : ""),
      );

      // 清掉上一次进程遗留的 auto-test capture：capture 线程会占用端口。
      await this.captureManager.cleanupStale();
    } catch (err) {
      await this.close();
      throw err;
    }
  }

  async close(): Promise<void> {
    await this.runManager.stopAll();
    await this.captureManager.closeAll();
    this.client.close();
    this.openedPorts.clear();
    this.initialized = false;
  }

  async reservePort(port: BackendEndpoint): Promise<void> {
    this.ensureInit();
    const info = await this.client.unary<any>(this.client.port, "GetPort", {
      name: port.address,
    });
    // GetPort 对未注册端口返回 code=103，OpenPort 会顺便注册
    const opened =
      Number(info.result?.code ?? 0) === 0 &&
      (Number(info.port?.flags ?? 0) & 0x1) === 0x1;
    if (!opened) {
      const reply = await this.client.unary<any>(this.client.port, "OpenPort", {
        name: port.address,
      });
      assertResult(reply.result, `PortService.OpenPort(${port.address})`);
    }
    this.openedPorts.add(port.address);
  }

  async releasePort(port: BackendEndpoint): Promise<void> {
    this.ensureInit();
    try {
      await this.stopTransmit(port);
    } catch {
      // 没有运行中的流时忽略
    }

    // 清掉本 backend 创建的 capture 资源，避免测试结束后残留
    await this.captureManager.release(port);

    try {
      const reply = await this.client.unary<any>(
        this.client.port,
        "ClosePort",
        {
          name: port.address,
        },
      );
      assertResult(reply.result, `PortService.ClosePort(${port.address})`);
    } catch {
      // 端口可能已关闭
    }
    this.openedPorts.delete(port.address);
  }

  async stopTransmit(port: BackendEndpoint): Promise<void> {
    this.ensureInit();
    await this.runManager.stop(port);
  }

  async waitTransmit(port: BackendEndpoint, timeoutMs?: number): Promise<void> {
    await this.runManager.wait(port, timeoutMs);
  }

  async startCapture(port: BackendEndpoint): Promise<void> {
    this.ensureInit();
    await this.captureManager.start(port);
  }

  async stopCapture(port: BackendEndpoint): Promise<void> {
    this.ensureInit();
    await this.captureManager.stop(port);
  }

  async readCapture(port: BackendEndpoint): Promise<CapturedPacket[]> {
    this.ensureInit();
    return this.captureManager.read(port);
  }

  async sendPacket(
    port: BackendEndpoint,
    packet: PacketSpec,
    options: SendOptions = {},
  ): Promise<void> {
    const handle = await this.startTransmit(port, packet, options);
    if (options.wait === true) {
      await handle.wait(options.timeoutMs);
    }
  }

  async startTransmit(
    port: BackendEndpoint,
    packet: PacketSpec,
    options: SendOptions = {},
  ): Promise<TransmitHandle> {
    return this.startPacketInternal(port, packet, options);
  }

  private async startPacketInternal(
    port: BackendEndpoint,
    packet: PacketSpec,
    options: SendOptions = {},
  ): Promise<TransmitHandle> {
    this.ensureInit();

    // RAW 不是协议层：它只能作为最后一层之后的 payload。
    const rawIndex = packet.layers.findIndex(
      (layer) => layer.type === FieldType.RAW,
    );
    if (rawIndex >= 0 && rawIndex !== packet.layers.length - 1) {
      throw new Error(
        "[streamcontrol] RAW 只能作为报文最后一层（其后的字节无法再解析成协议头）",
      );
    }
    const rawPayload =
      rawIndex >= 0
        ? Buffer.from(
            packet.layers[rawIndex].field.raw?.payload
              ? String(packet.layers[rawIndex].field.raw.payload)
              : "",
            "base64",
          )
        : Buffer.alloc(0);

    // 固定 43B SNMP 模板表达不了可变 PDU：把 BER 编成 payload，仍放在 UDP 后。
    const snmpIndex = packet.layers.findIndex(
      (layer) => layer.type === FieldType.SNMP,
    );
    let variablePayload: Buffer | undefined;
    let headerLayers = packet.layers;
    if (snmpIndex >= 0) {
      const snmp = packet.layers[snmpIndex].field.snmp ?? {};
      if (!canUseFixedSnmpTemplate(snmp)) {
        if (rawIndex >= 0) {
          throw new Error("[streamcontrol] SNMP 与 RAW payload 不能同时使用");
        }
        if (snmpIndex !== packet.layers.length - 1) {
          throw new Error("[streamcontrol] SNMP 必须是最后一层");
        }
        variablePayload = encodeSnmpMessage(snmp);
        headerLayers = packet.layers.slice(0, snmpIndex);
      }
    }

    const payloadBytes = variablePayload ?? rawPayload;
    const hasPayload = payloadBytes.length > 0;

    if (rawIndex >= 0) {
      headerLayers = headerLayers.filter((_, index) => index !== rawIndex);
    }

    const headers = packetToHeaders(
      { layers: headerLayers },
      options.modifiers ?? [],
    );
    const frames = framesFromOptions(options);
    const durationMs = durationFromOptions(options);
    const dot3Len = headerLayers.find((layer) => layer.type === FieldType.Dot3)
      ?.field.dot3?.len;
    const fixedLen =
      options.transmit?.fixed_len && options.transmit.fixed_len > 0
        ? options.transmit.fixed_len
        : hasPayload
          ? Math.max(
              dot3Len !== undefined && dot3Len !== null
                ? 14 + Number(dot3Len)
                : 64,
              headerLengthTotal(headers) + payloadBytes.length,
            )
          : frameLengthForHeaders(
              headers,
              dot3Len !== undefined && dot3Len !== null
                ? Number(dot3Len)
                : undefined,
            );
    const hasDot3 = headerLayers.some((l) => l.type === FieldType.Dot3);

    return this.startViaTrafficService(
      port,
      headers,
      frames,
      durationMs,
      fixedLen,
      hasPayload
        ? { type: hasDot3 ? "blob" : "custom", custom: payloadBytes }
        : undefined,
      options,
    );
  }

  /**
   * 新后端路径：template/channel/load_profile/port_config + TrafficService.Start。
   * 不写全局 YAML，不关闭端口；不同 tx 端口可以独立启动和停止。
   */
  private async startViaTrafficService(
    port: BackendEndpoint,
    headers: HeaderInstance[],
    frames: number,
    durationMs: number,
    fixedLen: number,
    payload: { type: "blob" | "custom"; custom?: Buffer } | undefined,
    options: SendOptions,
  ): Promise<TransmitHandle> {
    await this.stopTransmit(port);
    await this.runManager.reapCompleted();

    const seq = ++this.nameSeq;
    const stamp = `${Date.now().toString(36)}-${seq}`;
    const templateName = `auto-test-tpl-${stamp}`;
    const channelName = `auto-test-ch-${stamp}`;
    let templateRef: ResourceRefLike | undefined;
    let channelRef: ResourceRefLike | undefined;
    let profileRef: ResourceRefLike | undefined;

    try {
      const template: any = {
        name: templateName,
        headers,
        frame_length: { type: 1, fixed: fixedLen },
      };
      if (payload) {
        template.payload = {
          type: payload.type === "blob" ? 7 : 5,
          custom: payload.custom ?? Buffer.alloc(0),
        };
      }
      const tpl = await this.client.unary<any>(
        this.client.traffic,
        "CreateTemplate",
        { template },
        20_000,
      );
      assertResult(tpl.result, "TrafficService.CreateTemplate");
      templateRef = tpl.resource?.meta?.ref;
      if (!templateRef) {
        throw new Error(
          "[streamcontrol] CreateTemplate 未返回 resource.meta.ref",
        );
      }

      const transmit = this.transmitConfig(options);
      const channel: any = {
        ref: { kind: "stream_channel", path: `stream_channel[${channelName}]` },
        template: templateRef,
        source_endpoints: [{ kind: "port", path: `port[${port.address}]` }],
      };
      if (transmit) channel.transmit = transmit;
      const ch = await this.client.unary<any>(
        this.client.traffic,
        "CreateChannel",
        { channel },
        20_000,
      );
      assertResult(ch.result, "TrafficService.CreateChannel");
      channelRef = ch.resource?.meta?.ref;
      if (!channelRef) {
        throw new Error(
          "[streamcontrol] CreateChannel 未返回 resource.meta.ref",
        );
      }

      const prof = await this.client.unary<any>(
        this.client.traffic,
        "CreateLoadProfile",
        {
          owner: channelRef,
          type: "default",
          rate: this.trafficRate(options),
        },
        20_000,
      );
      assertResult(prof.result, "TrafficService.CreateLoadProfile");
      profileRef = prof.resource?.meta?.ref;

      const previousPortConfig = await this.findPortConfig(port.address);
      const portConfig = this.trafficPortConfig(frames, options);

      let start: any;
      try {
        const pc = await this.client.unary<any>(
          this.client.traffic,
          "SetPortConfig",
          {
            ports: [{ kind: "port", path: `port[${port.address}]` }],
            config: portConfig,
            apply: false,
          },
          20_000,
        );
        assertResult(pc.result, "TrafficService.SetPortConfig");

        start = await this.client.unary<any>(
          this.client.traffic,
          "Start",
          {
            streams: [channelRef],
            duration_ms: durationMs,
            idempotency_key: `auto-test-traffic-${stamp}`,
          },
          30_000,
        );
      } finally {
        // Start 已经把 inline blocks 交给引擎；端口配置资源可以恢复，
        // 避免污染后续用例/用户配置。
        await this.restorePortConfig(port.address, previousPortConfig);
      }
      assertResult(start?.result, "TrafficService.Start");
      const runId = Number(start.run_ids?.[0] ?? 0);
      if (!runId) {
        throw new Error("[streamcontrol] TrafficService.Start 未返回 run_id");
      }

      const record: RunRecord = {
        runId,
        port,
        frames,
        durationMs,
        templateRef,
        channelRef,
        profileRef,
      };
      this.runManager.add(record);
      return this.runManager.createHandle(record);
    } catch (err) {
      await cleanupResources(this.client, {
        templateRef,
        channelRef,
        profileRef,
      });
      throw err;
    }
  }

  private trafficRate(options: SendOptions): any {
    const transmit: any = options.transmit;
    const param: any = transmit?.param ?? {};
    if (transmit?.mode === TransmitMode.CONTINUOUS) {
      return { value: param.percent_rate ?? 100, unit: 1, per_port: true };
    }
    if (transmit?.mode === TransmitMode.BURST && param.rate != null) {
      const unit =
        param.rate_unit === "PERCENT"
          ? 1
          : param.rate_unit === "FRAME_PER_SEC"
            ? 2
            : param.rate_unit === "BYTE_PER_SEC"
              ? 7
              : 1;
      return { value: param.rate, unit, per_port: true };
    }
    return { value: 100, unit: 1, per_port: true };
  }

  /**
   * BURST 分组/组间 gap。新网关用 StreamChannel.transmit 表达：
   *   frames_per_burst * burst_count = 总帧数
   *   burst_gap 是组间空闲（不是起始周期）
   */
  private transmitConfig(options: SendOptions): any | undefined {
    const transmit: any = options.transmit;
    if (transmit?.mode !== TransmitMode.BURST) return undefined;
    const param: any = transmit.param ?? {};
    const hasBurst =
      param.burst_size != null ||
      param.burst_count != null ||
      param.gap != null;
    if (!hasBurst) return undefined;

    if (param.gap != null && !this.features.includes("traffic-burst-gap")) {
      throw new Error(
        "[streamcontrol] 网关/引擎不支持 burst gap（缺 feature=traffic-burst-gap）",
      );
    }

    const unitMap: Record<string, string> = {
      NS: "ns",
      US: "us",
      MS: "ms",
      SEC: "s",
    };
    const unit = String(param.gap_unit ?? "US").toUpperCase();
    if (param.gap != null && !unitMap[unit]) {
      throw new Error(
        `[streamcontrol] burst gap 单位 ${unit} 不支持（可用 NS/US/MS/SEC）`,
      );
    }

    const config: any = { mode: 2 };
    const framesPerBurst = Math.max(1, Number(param.burst_size ?? 1));
    config.frames_per_burst = framesPerBurst;
    if (param.burst_count != null) {
      config.burst_count = Math.max(1, Number(param.burst_count));
    }
    if (param.gap != null) {
      config.burst_gap = Math.max(0, Number(param.gap));
      config.burst_gap_unit = unitMap[unit];
    }
    return config;
  }

  private trafficPortConfig(frames: number, options: SendOptions): any {
    const transmit: any = options.transmit;
    const param: any = transmit?.param ?? {};
    const mode = transmit?.mode;
    if (mode === TransmitMode.TIME) {
      return { transmit_mode: 3, burst_size: 0 };
    }
    if (
      mode === TransmitMode.STEP ||
      mode === TransmitMode.BURST ||
      frames > 0
    ) {
      return { transmit_mode: 2, burst_size: Math.max(1, frames) };
    }
    return { transmit_mode: 1, burst_size: 0 };
  }

  private async findPortConfig(
    portName: string,
  ): Promise<{ path: string; spec: any } | undefined> {
    try {
      const list = await this.client.unary<any>(
        this.client.resource,
        "List",
        { kind: "stream_port_config" },
        10_000,
      );
      const path = `stream_port_config[${portName}]`;
      const found = (list.resources ?? []).find(
        (r: any) => r?.meta?.ref?.path === path,
      );
      return found ? { path, spec: found.spec } : undefined;
    } catch {
      return undefined;
    }
  }

  private async restorePortConfig(
    portName: string,
    previous: { path: string; spec: any } | undefined,
  ): Promise<void> {
    const path = `stream_port_config[${portName}]`;
    try {
      await this.client.unary<any>(
        this.client.resource,
        "Delete",
        {
          ref: { kind: "stream_port_config", path },
          force: true,
        },
        10_000,
      );
    } catch {
      // 资源可能不存在
    }
    if (!previous) return;
    try {
      await this.client.unary<any>(
        this.client.resource,
        "Create",
        {
          kind: "stream_port_config",
          name: portName,
          spec: previous.spec,
        },
        10_000,
      );
    } catch {
      // 恢复失败只影响端口默认配置，不影响已经启动的 inline run
    }
  }

  // ---------------------------------------------------------------- 内部

  private ensureInit(): void {
    if (!this.initialized) {
      throw new Error("[streamcontrol] backend 未初始化，请先调用 init()");
    }
  }
}
