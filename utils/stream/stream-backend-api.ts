import axios from "axios";
import FormData from "form-data";
import { StreamPort } from "../comm/config";
import { IPacketList, PacketListParser } from "./thrift-packet";

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
}

/** 端口类接口请求体（见接口文档 2.2.1） */
interface PortBody {
  port: string;
  /** 发包/抓包后端：renix（信而泰测试仪）| scapy（本机网卡） */
  backend: string;
}

/**
 * 将 StreamPort 入参统一为 { port, backend } 请求体：
 * port 取 name，backend 取 type。
 */
function resolvePortArg(port: StreamPort): PortBody {
  return { port: port.name, backend: port.type };
}

/**
 * 归一化二进制上传接口的附加表单字段（见接口文档 2.2.2）：
 * 将字段中的 port（StreamPort）解析为 port + backend 两个表单字段，
 * 其余字段（如 count、modifier_param、transmit_param）原样保留。
 */
function normalizeFormFields(
  fields?: Record<string, any>,
): Record<string, any> | undefined {
  if (!fields) return undefined;
  const { port, ...rest } = fields;
  if (port === undefined) return fields;
  return { ...resolvePortArg(port), ...rest };
}

export class StreamBackendApi {
  api = axios.create({
    // baseURL: "http://172.16.9.1:8001/api/backend_proxy",
    baseURL: "http://192.168.2.98:8000/api/backend_proxy",
    timeout: 5000,
  });

  private token: string | null = null;

  constructor() {
    this.setupAuthInterceptor();
  }

  /** 通过请求拦截器注入 token，确保不会被 per-request headers 覆盖 */
  private setupAuthInterceptor() {
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Token ${this.token}`;
      }
      return config;
    });
  }

  /** 登录并保存 token，后续所有请求自动携带 Authorization 头 */
  async login(
    username: string = "test",
    password: string = "autotest",
  ): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
      "http://192.168.2.98:8000/api/auth/login/",
      { username, password },
    );
    this.token = response.data.token;
    return response.data;
  }

  /**
   * 端口预约（JSON: { port, backend }）
   * @param port 端口对象（RenixPort.A/B... 或自定义 StreamPort）
   */
  async port_reserve(port: StreamPort) {
    const response = await this.api.post("/port/reserve", resolvePortArg(port));
    return response.data;
  }

  /**
   * 端口释放（JSON: { port, backend }）
   */
  async port_release(port: StreamPort) {
    const response = await this.api.post("/port/release", resolvePortArg(port));
    return response.data;
  }

  /**
   * 停止流发送（JSON: { port, backend }）
   */
  async streamPacketStreamStop(port: StreamPort) {
    const response = await this.api.post("/stream/stop", resolvePortArg(port));
    return response.data;
  }

  /**
   * 开始抓包（JSON: { port, backend }）
   */
  async streamPacketCaptureStart(port: StreamPort) {
    const response = await this.api.post("/capture/start", resolvePortArg(port));
    return response.data;
  }

  /**
   * 停止抓包（JSON: { port, backend }）
   */
  async streamPacketCaptureStop(port: StreamPort) {
    const response = await this.api.post("/capture/stop", resolvePortArg(port));
    return response.data;
  }

  /**
   * 通用二进制上传：multipart/form-data，文件字段名为 `file`，
   * 其余字段（port/count/backend/modifier_param/transmit_param 等）从表单读取。
   */
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
      form.getLength((err: Error | null, len: number) => {
        resolve(err ? null : len);
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

  /**
   * 发送单个报文（二进制上传）
   * @param binary 报文二进制数据
   * @param fields 附加字段：port（StreamPort）、count（发送次数，默认 1）等
   * @param filename 上传文件名
   */
  async streamPacketSend(
    binary: Buffer,
    fields?: Record<string, any>,
    filename = "packet.buffer",
  ): Promise<any> {
    return this.postBinaryForm("/packet/send", binary, fields, filename);
  }

  /**
   * 发送报文列表（二进制上传）
   * @param fields 附加字段：port（StreamPort）、count 等
   */
  async streamPacketListSend(
    binary: Buffer,
    fields?: Record<string, any>,
    filename = "packet.buffer",
  ): Promise<any> {
    return this.postBinaryForm("/packetlist/send", binary, fields, filename);
  }

  /**
   * 自定义方式发送报文（二进制上传，附加 modifier_param / transmit_param）
   * @param port 发送端口（StreamPort，如 RenixPort.A/B）
   * @param modifier_param 报文字段修改参数（仅本接口使用）
   * @param transmit_param 发送模式参数（仅本接口使用）
   * @param fields 其他附加字段：count 等
   */
  async streamPacketUserdefineSend(
    binary: Buffer,
    port: StreamPort,
    modifier_param?: any,
    transmit_param?: any,
    fields?: Record<string, any>,
    filename = "packet.buffer",
  ): Promise<any> {
    const extra: Record<string, any> = { port, ...fields };
    if (modifier_param) {
      extra.modifier_param = modifier_param;
    }
    if (transmit_param) {
      extra.transmit_param = transmit_param;
    }
    return this.postBinaryForm(
      "/packet/send/userdefine",
      binary,
      extra,
      filename,
    );
  }

  /**
   * 获取捕获的数据包并进行解析
   * @param port 端口标识（StreamPort，如 RenixPort.A/B）
   * @returns 解析后的报文列表结果
   */
  async streamPacketCaptureGet(port: StreamPort): Promise<IPacketList> {
    const response = await this.api.post(
      "/capture/download",
      resolvePortArg(port),
      {
        responseType: "arraybuffer",
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    );
    const binaryData = response.data;

    const buffer = Buffer.from(binaryData);

    // 使用 PacketListParser 解析二进制数据
    const parser = new PacketListParser();
    const packetList = parser.parse(buffer);

    return packetList;
  }
}

const appendFields = (f: FormData, obj?: Record<string, any>) => {
  if (!obj) return;
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    f.append(
      key,
      typeof value === "object" ? JSON.stringify(value) : String(value),
    );
  }
};
