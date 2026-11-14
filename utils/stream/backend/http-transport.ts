/**
 * 信而泰 HTTP 后端共用的传输层。
 *
 * Renix（机框测试仪）和 Scapy（本机网卡）走同一套 HTTP 接口，区别只在
 * 请求体里的 `backend` 字段。这里把登录、token、multipart 上传和端口参数
 * 归一化集中起来，供 RenixHttpBackend 复用，避免两套客户端各自登录。
 */

import axios, { AxiosInstance } from "axios";
import FormData from "form-data";
import { StreamBackendConfig } from "../../comm/config";

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
}

/** HTTP 后端只接受 renix / scapy */
export type HttpTrafficProvider = "renix" | "scapy";

/** HTTP 接口的最小端口参数 */
export interface HttpPortArg {
  address: string;
  provider: HttpTrafficProvider;
}

/**
 * 兼容新旧端口对象的输入：
 * - 新 TrafficPort：{ address, provider }
 * - 旧 { name, type } 对象
 */
export type HttpPortLike =
  | HttpPortArg
  | { name: string; type: string }
  | { address: string; provider: string };

export interface HttpTransportConfig {
  baseURL?: string;
  loginURL?: string;
  username?: string;
  password?: string;
  timeout?: number;
}

function isHttpProvider(value: string): value is HttpTrafficProvider {
  return value === "renix" || value === "scapy";
}

/**
 * 把 TrafficPort / 旧端口对象归一化为 HTTP 请求需要的 { address, provider }。
 *
 * 如果误把 stream-linux 端口交给 HTTP 后端，这里会直接抛错，而不是发一个
 * `backend=stream-linux` 的无效请求。
 */
export function toHttpPortArg(port: HttpPortLike): HttpPortArg {
  const address = "address" in port ? port.address : port.name;
  const provider = "provider" in port ? port.provider : port.type;
  if (!isHttpProvider(provider)) {
    throw new Error(
      `HTTP 后端只支持 renix/scapy，收到 provider=${String(provider)}（${address}）`,
    );
  }
  return { address, provider };
}

export class HttpTrafficTransport {
  readonly api: AxiosInstance;

  private token: string | null = null;
  private loginInfo: LoginResponse | null = null;
  private loginPromise: Promise<LoginResponse> | null = null;

  constructor(private readonly config: HttpTransportConfig = {}) {
    this.api = axios.create({
      baseURL: config.baseURL ?? StreamBackendConfig.baseURL,
      timeout: config.timeout ?? 5000,
    });

    // 通过请求拦截器注入 token，确保不会被 per-request headers 覆盖
    this.api.interceptors.request.use((request) => {
      if (this.token) {
        request.headers.Authorization = `Token ${this.token}`;
      }
      return request;
    });
  }

  /** 当前是否已经登录 */
  get authenticated(): boolean {
    return this.token !== null;
  }

  /** 登录并保存 token；显式调用会重新登录 */
  async login(
    username: string = this.config.username ?? StreamBackendConfig.username,
    password: string = this.config.password ?? StreamBackendConfig.password,
  ): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
      this.config.loginURL ?? StreamBackendConfig.loginURL,
      { username, password },
    );
    this.token = response.data.token;
    this.loginInfo = response.data;
    return response.data;
  }

  /**
   * 确保已登录；多个 Renix/Scapy 后端共享同一个 transport 时只登录一次。
   */
  async ensureLogin(): Promise<void> {
    if (this.token) return;

    if (!this.loginPromise) {
      this.loginPromise = this.login().finally(() => {
        this.loginPromise = null;
      });
    }
    await this.loginPromise;
  }

  async portReserve(port: HttpPortLike): Promise<any> {
    const response = await this.api.post("/port/reserve", this.portBody(port));
    return response.data;
  }

  async portRelease(port: HttpPortLike): Promise<any> {
    const response = await this.api.post("/port/release", this.portBody(port));
    return response.data;
  }

  async streamStop(port: HttpPortLike): Promise<any> {
    const response = await this.api.post("/stream/stop", this.portBody(port));
    return response.data;
  }

  async captureStart(port: HttpPortLike): Promise<any> {
    const response = await this.api.post("/capture/start", this.portBody(port));
    return response.data;
  }

  async captureStop(port: HttpPortLike): Promise<any> {
    const response = await this.api.post("/capture/stop", this.portBody(port));
    return response.data;
  }

  async captureGet(port: HttpPortLike): Promise<any> {
    const response = await this.api.post(
      "/capture/download",
      this.portBody(port),
      {
        responseType: "arraybuffer",
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    );
    return response.data;
  }

  /**
   * 发送单个报文（二进制上传）。
   *
   * `fields` 里如果带 port（TrafficPort / 旧端口对象），会自动拆成
   * port + backend 两个表单字段。
   */
  async sendPacket(
    binary: Buffer,
    fields?: Record<string, any>,
    filename = "packet.buffer",
  ): Promise<any> {
    return this.postBinaryForm("/packet/send", binary, fields, filename);
  }

  /** 发送报文列表（二进制上传） */
  async sendPacketList(
    binary: Buffer,
    fields?: Record<string, any>,
    filename = "packet.buffer",
  ): Promise<any> {
    return this.postBinaryForm("/packetlist/send", binary, fields, filename);
  }

  /**
   * 自定义方式发送报文（二进制上传，附加 modifier_param / transmit_param）。
   */
  async sendUserDefine(
    binary: Buffer,
    port: HttpPortLike,
    modifierParam?: any,
    transmitParam?: any,
    fields?: Record<string, any>,
    filename = "packet.buffer",
  ): Promise<any> {
    const extra: Record<string, any> = { port, ...fields };
    if (modifierParam) extra.modifier_param = modifierParam;
    if (transmitParam) extra.transmit_param = transmitParam;
    return this.postBinaryForm(
      "/packet/send/userdefine",
      binary,
      extra,
      filename,
    );
  }

  /** 最近一次登录返回的信息，便于排障 */
  get user(): LoginResponse | null {
    return this.loginInfo;
  }

  private portBody(port: HttpPortLike): {
    port: string;
    backend: HttpTrafficProvider;
  } {
    const resolved = toHttpPortArg(port);
    return { port: resolved.address, backend: resolved.provider };
  }

  private async postBinaryForm(
    path: string,
    binary: Buffer,
    fields?: Record<string, any>,
    filename = "packet.buffer",
  ): Promise<any> {
    const form = new FormData();
    form.append("file", binary, {
      filename,
      contentType: "application/octet-stream",
    });
    appendFields(form, normalizeFormFields(fields));

    const headers: Record<string, any> = { ...form.getHeaders() };
    const len = await new Promise<number | null>((resolve) => {
      form.getLength((err: Error | null, length: number) => {
        resolve(err ? null : length);
      });
    });
    if (len !== null) headers["Content-Length"] = len;

    const response = await this.api.post(path, form, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return response.data;
  }
}

/** 将 fields.port（旧 { name, type } / 新 TrafficPort）拆成 port + backend */
function normalizeFormFields(
  fields?: Record<string, any>,
): Record<string, any> | undefined {
  if (!fields) return undefined;

  const { port, ...rest } = fields;
  if (port === undefined || typeof port === "string") {
    return fields;
  }

  const resolved = toHttpPortArg(port as HttpPortLike);
  return { port: resolved.address, backend: resolved.provider, ...rest };
}

function appendFields(form: FormData, obj?: Record<string, any>): void {
  if (!obj) return;
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    form.append(
      key,
      typeof value === "object" ? JSON.stringify(value) : String(value),
    );
  }
}
