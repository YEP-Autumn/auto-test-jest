import axios, { isCancel, AxiosError, InternalAxiosRequestConfig } from "axios";
import FormData from "form-data";
import { TopolopyLink } from "./ControllerApi.Intf";

export class ControllerApi {
  // api = axios.create({ baseURL: "http://localhost:8000/" });
  api = axios.create({ baseURL: "http://127.0.0.1:8000/" });

  async topolopyCreate(name: String) {
    await this.api
      .post("/topology/add", {
        name: name,
      })
      .then((response) => {
        console.log("Success:", response.data);
      })
      .catch((error) => {
        // console.error("Error:", error);
      });
  }

  async topolopyRemove(name: String) {
    await this.api
      .post("/topology/del", { name: name })
      .then((response) => {
        console.log("Success:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  async topolopyLinkAdd(name: String, link: TopolopyLink[]) {
    await this.api
      .post("/topology/link/add", {
        name: name,
        link: link,
      })
      .then((response) => {
        console.log("Success:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  async topolopyLinkDel(name: String, link: TopolopyLink[]) {
    await this.api
      .post("/topology/link/del", {
        name: name,
        link: link,
      })
      .then((response) => {
        console.log("Success:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  /**
   * Send a packet as multipart/form-data. You can pass additional fields
   * via `fields`. The binary is sent under the `file` field (filename can
   * be overridden via `filename`).
   */
  async streamPacketSend(
    binary: Buffer,
    fields?: Record<string, any>,
    filename: string = "packet.bin"
  ) {
    const form = new FormData();
    form.append("file", binary, { filename, contentType: "application/octet-stream" });

    if (fields) {
      for (const [key, value] of Object.entries(fields)) {
        if (value === undefined || value === null) continue;
        if (typeof value === "object") {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, String(value));
        }
      }
    }

    const headers: Record<string, any> = {
      ...form.getHeaders(),
    };

    try {
      const length = await new Promise<number>((resolve, reject) => {
        form.getLength((err: Error | null, len: number) => {
          if (err) reject(err);
          else resolve(len);
        });
      });
      headers["Content-Length"] = length;
    } catch (e) {
      // If we can't determine length, proceed without setting it.
    }

    await this.api
      .post("/stream_backend/packet/send", form, {
        headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })
      .then((response) => {
        console.log("Success:", JSON.stringify(response.data));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}
