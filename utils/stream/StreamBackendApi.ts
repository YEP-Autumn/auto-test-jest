import axios from "axios";
import FormData from "form-data";
import { IPacketList, PacketListParser } from "./thrift_packet";

export enum RenixPort {
  A = "//192.168.2.11/5/13",
  B = "//192.168.2.11/5/14",
}

export class StreamBackendApi {
  api = axios.create({
    baseURL: "http://172.16.9.1:8000/stream_backend",
    timeout: 5000,
  });

  /**
   * 端口预约
   */
  async port_reserve(port: string) {
    const response = await this.api.post("/port/reserve", { port });
    return response.data;
  }

  /**
   * 端口释放
   */
  async port_release(port: string) {
    const response = await this.api.post("/port/release", { port });
    return response.data;
  }

  /**
   * Send a packet as multipart/form-data. You can pass additional fields
   * via `fields`. The binary is sent under the `file` field (filename can
   * be overridden via `filename`).
   */
  async streamPacketSend(
    binary: Buffer,
    fields?: Record<string, any>,
    filename = "packet.buffer"
  ): Promise<any> {
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

    const response = await this.api.post("/packet/send", form, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return response.data;
  }

  async streamPacketListSend(
    binary: Buffer,
    fields?: Record<string, any>,
    filename = "packet.buffer"
  ): Promise<any> {
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

    const response = await this.api.post("/packetlist/send", form, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return response.data;
  }

  async streamPacketUserdefineSend(
    binary: Buffer,
    port: RenixPort,
    modifier_param: any,
    transmit_param: any,
    filename = "packet.buffer"
  ): Promise<any> {
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

    const response = await this.api.post("/packet/send/userdefine", form, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return response.data;
  }

  async streamPacketStreamStart(port: string) {}
  async streamPacketStreamStop(port: string) {}

  async streamPacketCaptureStart(port: string) {
    const response = await this.api.post("/capture/start", { port });
    return response.data;
  }

  async streamPacketCaptureStop(port: string) {
    const response = await this.api.post("/capture/stop", { port });
    return response.data;
  }

  /**
   * 获取捕获的数据包并进行解析
   * @param port 端口标识
   * @returns 解析后的报文列表结果
   */
  async streamPacketCaptureGet(port: string): Promise<IPacketList> {
    const response = await this.api.post(
      "/capture/download",
      { port },
      {
        responseType: "arraybuffer",
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    const binaryData = response.data;

    // 使用 PacketListParser 解析二进制数据
    const parser = new PacketListParser();
    const packetList = parser.parse(Buffer.from(binaryData));

    if (packetList && packetList.pkt_list) {
      console.log(`Successfully parsed ${packetList.pkt_list.length} packets`);
      console.log(
        "First packet data json:",
        JSON.stringify(packetList, null, 2)
      );
    }

    return packetList;
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
