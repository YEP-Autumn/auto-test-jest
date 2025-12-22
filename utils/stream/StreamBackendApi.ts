import axios, { AxiosError } from "axios";
import FormData from "form-data";
import { PacketListParser, IPacketListParseResult } from "./thrift_packet";
import { convertCompilerOptionsFromJson } from "typescript";

export enum RenixPort {
  A = "//192.168.2.11/5/13",
  B = "//192.168.2.11/5/14",
}

export class StreamBackendApi {
  // api = axios.create({ baseURL: "http://127.0.0.1:8000/stream_backend" });
  api = axios.create({
    baseURL: "http://172.16.9.1:8000/stream_backend",
    timeout: 5000,
  });
  private baseURL = "http://172.16.9.1:8000/stream_backend";

  /**
   * 带重试的端口预约（指数退避）
   */
  async port_reserve(port: string, maxRetries = 3, initialDelayMs = 500) {
    return this.postWithRetry(
      async () => this.api.post("/port/reserve", { port }),
      `/port/reserve`,
      maxRetries,
      initialDelayMs
    );
  }

  /**
   * 带重试的端口释放（指数退避）
   */
  async port_release(port: string, maxRetries = 3, initialDelayMs = 500) {
    return this.postWithRetry(
      async () => this.api.post("/port/release", { port }),
      `/port/release`,
      maxRetries,
      initialDelayMs
    );
  }

  /**
   * Send a packet as multipart/form-data. You can pass additional fields
   * via `fields`. The binary is sent under the `file` field (filename can
   * be overridden via `filename`). Supports auto-retry on network errors.
   */
  async streamPacketSend(
    binary: Buffer,
    fields?: Record<string, any>,
    filename = "packet.buffer",
    maxRetries = 3,
    initialDelayMs = 500
  ): Promise<any> {
    return this.postWithRetry(
      async () => {
        const form = new FormData();
        form.append("file", binary, {
          filename,
          contentType: "application/octet-stream",
        });
        appendFields(form, fields);

        const headers: Record<string, any> = { ...form.getHeaders() };
        const len = await new Promise<number | null>((resolve) => {
          form.getLength((err: Error | null, len: number) => {
            resolve(err ? null : len);
          });
        });
        if (len !== null) headers["Content-Length"] = len;

        return this.api.post("/packet/send", form, {
          headers,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
      },
      "/packet/send",
      maxRetries,
      initialDelayMs
    );
  }

  async streamPacketListSend(
    binary: Buffer,
    fields?: Record<string, any>,
    filename = "packet.buffer",
    maxRetries = 3,
    initialDelayMs = 500
  ): Promise<any> {
    return this.postWithRetry(
      async () => {
        const form = new FormData();
        form.append("file", binary, {
          filename,
          contentType: "application/octet-stream",
        });
        appendFields(form, fields);

        const headers: Record<string, any> = { ...form.getHeaders() };
        const len = await new Promise<number | null>((resolve) => {
          form.getLength((err: Error | null, len: number) => {
            resolve(err ? null : len);
          });
        });
        if (len !== null) headers["Content-Length"] = len;

        return this.api.post("/packetlist/send", form, {
          headers,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
      },
      "/packetlist/send",
      maxRetries,
      initialDelayMs
    );
  }

  async streamPacketUserdefineSend(
    binary: Buffer,
    port: RenixPort,
    modifier_param: any,
    transmit_param: any,
    filename = "packet.buffer",
    maxRetries = 3,
    initialDelayMs = 500
  ): Promise<any> {
    return this.postWithRetry(
      async () => {
        const form = new FormData();
        form.append("file", binary, {
          filename,
          contentType: "application/octet-stream",
        });
        if (port) {
          appendFields(form, { port });
        }
        if (modifier_param) {
          appendFields(form, { modifier_param });
        }
        if (transmit_param) {
          appendFields(form, { transmit_param });
        }

        const headers: Record<string, any> = { ...form.getHeaders() };
        const len = await new Promise<number | null>((resolve) => {
          form.getLength((err: Error | null, len: number) => {
            resolve(err ? null : len);
          });
        });
        if (len !== null) headers["Content-Length"] = len;

        return this.api.post("/packet/send/userdefine", form, {
          headers,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
      },
      "/packet/send/userdefine",
      maxRetries,
      initialDelayMs
    );
  }

  async streamPacketStreamStart(port: string) {}
  async streamPacketStreamStop(port: string) {}

  async streamPacketCaptureStart(port: string) {}
  async streamPacketCaptureStop(port: string) {}

  /**
   * 获取捕获的数据包并进行解析（支持自动重试）
   * @param port 端口标识
   * @returns 解析后的报文列表结果
   */
  async streamPacketCaptureGet(
    port: string,
    maxRetries = 3,
    initialDelayMs = 500
  ): Promise<IPacketListParseResult> {
    return this.postWithRetry(
      async () => {
        // 以二进制格式接收数据
        return this.api.post(
          "/capture/download",
          { port },
          {
            responseType: "arraybuffer",
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          }
        );
      },
      `/capture/download`,
      maxRetries,
      initialDelayMs
    ).then((binaryData) => {
      // 使用 PacketListParser 解析二进制数据
      const parser = new PacketListParser();
      const parseResult = parser.parse(Buffer.from(binaryData));

      if (parseResult.packetList && parseResult.packetList.pkt_list) {
        console.log(
          `Successfully parsed ${parseResult.packetList.pkt_list.length} packets using strategy: ${parseResult.strategy}`
        );
        console.log(
          "First packet data json:",
          JSON.stringify(parseResult.packetList)
        );
      } else {
        console.warn(
          "Failed to parse packet list. Errors:",
          parseResult.errors
        );
      }

      return parseResult;
    });
  }

  /**
   * 通用重试逻辑：遇到连接错误或 5xx 会自动重试（指数退避）
   */
  private async postWithRetry(
    requestFn: () => Promise<any>,
    path: string,
    maxRetries: number,
    initialDelayMs: number
  ) {
    let lastError: any;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await requestFn();
        const result = response.data;
        if (attempt > 0) {
          console.log(
            `✓ StreamBackendApi ${path} succeeded on attempt ${attempt + 1}`
          );
        } else {
          console.log(`✓ StreamBackendApi ${path}:`, JSON.stringify(result));
        }
        return result;
      } catch (error: any) {
        lastError = error;
        const isRetryable =
          !error.response || // 网络错误/超时
          error.response?.status >= 500 || // 服务端错误
          error.code === "ECONNREFUSED" ||
          error.code === "ECONNRESET" ||
          error.code === "ETIMEDOUT" ||
          error.message?.includes("socket hang up");

        if (!isRetryable || attempt === maxRetries - 1) {
          break;
        }

        const delay = initialDelayMs * Math.pow(2, attempt);
        console.warn(
          `StreamBackendApi ${path} failed (attempt ${
            attempt + 1
          }/${maxRetries}): ${error.message}, ` + `retry after ${delay}ms...`
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    // 所有重试都失败，抛出错误
    throw new Error(
      `StreamBackendApi ${path} failed after ${maxRetries} attempts: ${
        lastError?.message || lastError
      }`
    );
  }
}

const appendFields = (f: FormData, obj?: Record<string, any>) => {
  if (!obj) return;
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    f.append(
      key,
      typeof value === "object" ? JSON.stringify(value) : String(value)
    );
  }
};
