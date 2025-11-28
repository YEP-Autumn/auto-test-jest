import axios, { isCancel, AxiosError, InternalAxiosRequestConfig } from "axios";
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

  async streamPacketSend(binary: Buffer) {
    await this.api
      .post("/stream_backend/packet/send", binary, {
        headers: {
          "Content-Type": "application/octet-stream",
          // 可以根据需要添加其他头，例如 Content-Length
          "Content-Length": binary.length,
        },
      })
      .then((response) => {
        console.log("Success:", JSON.stringify(response.data));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}
