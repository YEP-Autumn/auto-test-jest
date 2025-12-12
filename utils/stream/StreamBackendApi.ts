import axios, { AxiosError } from "axios";
import FormData from "form-data";
import { PacketListParser, IPacketListParseResult } from "./thrift_packet";

export enum RenixPort {
  A = "//192.168.2.11/5/13",
  B = "//192.168.2.11/5/14",
}

export class StreamBackendApi {
  api = axios.create({ baseURL: "http://127.0.0.1:8000/stream_backend" });
  // api = axios.create({ baseURL: "http://172.16.9.1:8000/stream_backend" });

  /**
   * Send a packet as multipart/form-data. You can pass additional fields
   * via `fields`. The binary is sent under the `file` field (filename can
   * be overridden via `filename`).
   */
  async streamPacketSendStart(
    binary: Buffer,
    fields?: Record<string, any>,
    filename = "packet.buffer"
  ): Promise<any> {
    const form = new FormData();
    form.append("file", binary, {
      filename,
      contentType: "application/octet-stream",
    });

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

    appendFields(form, fields);

    const headers: Record<string, any> = { ...form.getHeaders() };

    const getLength = (): Promise<number | null> =>
      new Promise((resolve) => {
        form.getLength((err: Error | null, len: number) => {
          if (err) resolve(null);
          else resolve(len);
        });
      });

    const len = await getLength();
    if (len !== null) headers["Content-Length"] = len;

    try {
      const response = await this.api.post("/packet/send", form, {
        headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      console.log("Success:", JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      const e = err as AxiosError;
      console.error("Error sending packet:", e.message || err);
      throw err;
    }
  }

  async streamPacketListSendStart(
    binary: Buffer,
    fields?: Record<string, any>,
    filename = "packet.buffer"
  ): Promise<any> {
    const form = new FormData();
    form.append("file", binary, {
      filename,
      contentType: "application/octet-stream",
    });

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

    appendFields(form, fields);

    const headers: Record<string, any> = { ...form.getHeaders() };

    const getLength = (): Promise<number | null> =>
      new Promise((resolve) => {
        form.getLength((err: Error | null, len: number) => {
          if (err) resolve(null);
          else resolve(len);
        });
      });

    const len = await getLength();
    if (len !== null) headers["Content-Length"] = len;

    try {
      const response = await this.api.post("/packetlist/send", form, {
        headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      console.log("Success:", JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      const e = err as AxiosError;
      console.error("Error sending packet:", e.message || err);
      throw err;
    }
  }

  async streamPacketSendStop(port: string) {}

  async streamPacketCaptureStart(port: string) {}

  async streamPacketCaptureStop(port: string) {}

  /**
   * 获取捕获的数据包并进行解析
   * @param port 端口标识
   * @returns 解析后的报文列表结果
   */
  async streamPacketCaptureGet(port: string): Promise<IPacketListParseResult> {
    try {
      // 以二进制格式接收数据
      const response = await this.api.post("/capture/download", { port }, {
        responseType: "arraybuffer",
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      const binaryData = response.data;
      console.log(`Received capture data: ${binaryData.length} bytes from port ${port}`);

      // 使用 PacketListParser 解析二进制数据
      const parser = new PacketListParser();
      const parseResult = parser.parse(Buffer.from(binaryData));

      if (parseResult.packetList && parseResult.packetList.pkt_list) {
        console.log(
          `Successfully parsed ${parseResult.packetList.pkt_list.length} packets using strategy: ${parseResult.strategy}`
        );
        console.log("First packet data json:", JSON.stringify(parseResult.packetList));
      } else {
        console.warn("Failed to parse packet list. Errors:", parseResult.errors);
      }

      return parseResult;
    } catch (err) {
      const e = err as AxiosError;
      console.error("Error capturing packet:", e.message || err);
      throw err;
    }
  }
}
