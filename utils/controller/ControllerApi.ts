import axios, { AxiosError } from "axios";
import { TopolopyLink } from "./ControllerApi.Intf";

export class ControllerApi {
  // api = axios.create({ baseURL: "http://localhost:8000/" });
  api = axios.create({ baseURL: "http://127.0.0.1:8000/topology" });

  async topolopyCreate(name: String) {
    await this.api
      .post("/add", {
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
      .post("/del", { name: name })
      .then((response) => {
        console.log("Success:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  async topolopyLinkAdd(name: String, link: TopolopyLink[]) {
    await this.api
      .post("/link/add", {
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
      .post("/link/del", {
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

}
