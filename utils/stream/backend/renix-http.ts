import {
  packet_thrift_buffer_build,
  PacketListParser,
} from "../codec/renix-thrift";
import { PacketSpec } from "../packet/model";
import {
  HttpTrafficTransport,
  toHttpPortArg,
  type HttpPortLike,
  type LoginResponse,
} from "./http-transport";
import { CapturedPacket, SendOptions, TrafficBackend } from "./types";

export type { LoginResponse } from "./http-transport";

/**
 * 信而泰 HTTP 后端（renix / scapy）。
 *
 * 具体的登录、multipart 上传和端口请求体由 `HttpTrafficTransport` 负责；
 * 本类只保留 TrafficBackend 语义和旧接口兼容。TrafficManager 会让 renix 和
 * scapy 共享同一个 transport，因此混用两个 provider 时只登录一次。
 */
export class RenixHttpBackend implements TrafficBackend {
  readonly kind = "renix-http";

  /** 共享的 HTTP 传输层；可在构造时注入 */
  readonly transport: HttpTrafficTransport;

  constructor(transport?: HttpTrafficTransport) {
    this.transport = transport ?? new HttpTrafficTransport();
  }

  /** 兼容旧代码：直接访问 axios 实例 */
  get api() {
    return this.transport.api;
  }

  async init(): Promise<void> {
    await this.transport.ensureLogin();
  }

  async close(): Promise<void> {
    // HTTP 后端无长连接，无需释放
  }

  /** 登录并保存 token，后续所有请求自动携带 Authorization 头 */
  async login(username?: string, password?: string): Promise<LoginResponse> {
    return this.transport.login(username, password);
  }

  async reservePort(port: HttpPortLike): Promise<void> {
    await this.transport.portReserve(toHttpPortArg(port));
  }

  async releasePort(port: HttpPortLike): Promise<void> {
    await this.transport.portRelease(toHttpPortArg(port));
  }

  async stopTransmit(port: HttpPortLike): Promise<void> {
    await this.transport.streamStop(toHttpPortArg(port));
  }

  async startCapture(port: HttpPortLike): Promise<void> {
    await this.transport.captureStart(toHttpPortArg(port));
  }

  async stopCapture(port: HttpPortLike): Promise<void> {
    await this.transport.captureStop(toHttpPortArg(port));
  }

  async readCapture(port: HttpPortLike): Promise<CapturedPacket[]> {
    const packetList = await this.streamPacketCaptureGet(port);
    if (!packetList || !Array.isArray(packetList.pkt_list)) return [];
    return packetList.pkt_list.map((packet: any) => ({
      layers: Array.isArray(packet?.field_list) ? packet.field_list : [],
    }));
  }

  async sendPacket(
    port: HttpPortLike,
    packet: PacketSpec,
    options: SendOptions = {},
  ): Promise<void> {
    const binary = packet_thrift_buffer_build(packet.layers);
    await this.streamPacketUserdefineSend(
      binary,
      port,
      options.modifiers,
      options.transmit,
      options.count !== undefined ? { count: options.count } : undefined,
    );
  }

  /**
   * 端口预约（JSON: { port, backend }）
   * @param port 端口对象（RenixPort.A/B... 或自定义 TrafficPort）
   */
  async port_reserve(port: HttpPortLike) {
    return this.transport.portReserve(toHttpPortArg(port));
  }

  /** 端口释放（JSON: { port, backend }） */
  async port_release(port: HttpPortLike) {
    return this.transport.portRelease(toHttpPortArg(port));
  }

  /** 停止流发送（JSON: { port, backend }） */
  async streamPacketStreamStop(port: HttpPortLike) {
    return this.transport.streamStop(toHttpPortArg(port));
  }

  /** 开始抓包（JSON: { port, backend }） */
  async streamPacketCaptureStart(port: HttpPortLike) {
    return this.transport.captureStart(toHttpPortArg(port));
  }

  /** 停止抓包（JSON: { port, backend }） */
  async streamPacketCaptureStop(port: HttpPortLike) {
    return this.transport.captureStop(toHttpPortArg(port));
  }

  /**
   * 发送单个报文（二进制上传）
   * @param binary 报文二进制数据
   * @param fields 附加字段：port（TrafficPort）、count（发送次数，默认 1）等
   * @param filename 上传文件名
   */
  async streamPacketSend(
    binary: Buffer,
    fields?: Record<string, any>,
    filename = "packet.buffer",
  ): Promise<any> {
    return this.transport.sendPacket(binary, fields, filename);
  }

  /**
   * 发送报文列表（二进制上传）
   * @param fields 附加字段：port（TrafficPort）、count 等
   */
  async streamPacketListSend(
    binary: Buffer,
    fields?: Record<string, any>,
    filename = "packet.buffer",
  ): Promise<any> {
    return this.transport.sendPacketList(binary, fields, filename);
  }

  /**
   * 自定义方式发送报文（二进制上传，附加 modifier_param / transmit_param）
   * @param port 发送端口（TrafficPort，如 RenixPort.A/B）
   * @param modifier_param 报文字段修改参数（仅本接口使用）
   * @param transmit_param 发送模式参数（仅本接口使用）
   * @param fields 其他附加字段：count 等
   */
  async streamPacketUserdefineSend(
    binary: Buffer,
    port: HttpPortLike,
    modifier_param?: any,
    transmit_param?: any,
    fields?: Record<string, any>,
    filename = "packet.buffer",
  ): Promise<any> {
    return this.transport.sendUserDefine(
      binary,
      toHttpPortArg(port),
      modifier_param,
      transmit_param,
      fields,
      filename,
    );
  }

  /**
   * 获取捕获的数据包并进行解析
   * @param port 端口标识（TrafficPort，如 RenixPort.A/B）
   */
  async streamPacketCaptureGet(port: HttpPortLike): Promise<any> {
    const buffer = Buffer.from(
      await this.transport.captureGet(toHttpPortArg(port)),
    );
    const parser = new PacketListParser();
    return parser.parse(buffer);
  }
}
