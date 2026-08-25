import axios from "axios";

export interface TopolopyLink {
  src_port_index: number;
  src_device: number;
  dst_port_index: number;
  dst_device: number;
  is_two_way: boolean;
}

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
