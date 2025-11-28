import axios, { AxiosError } from "axios";
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
      const response = await this.api.post(
        "/stream_backend/packet/send",
        form,
        {
          headers,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );
      console.log("Success:", JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      const e = err as AxiosError;
      console.error("Error sending packet:", e.message || err);
      throw err;
    }
  }
}
