import axios, { isCancel, AxiosError, InternalAxiosRequestConfig } from "axios";
import { TopolopyLink } from "./ControllerIntf";

export class ControllerApi {
  api = axios.create({ baseURL: "http://localhost:8000/" });

  token: string = "";
  refreshToken: string = "";

  async init() {
    await this.tokenFetch();
    this.setApiInterceptors();
  }

  private async tokenFetch() {
    await this.api
      .post("/api/token/", {
        username: "root",
        password: "root",
      })
      .then((response) => {
        console.log("Success:", response.data);
        this.token = response.data.access;
        this.refreshToken = response.data.refresh;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  private setApiInterceptors() {
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        console.log(this.token);
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true; // 标记请求已被重试

          try {
            const refreshResponse = await axios.post<{ access: string }>(
              "/api/token/refresh",
              {
                refresh: this.refreshToken,
              }
            );

            const newAccessToken = refreshResponse.data.access;
            this.token = newAccessToken;

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return this.api(originalRequest);
          } catch (refreshError) {
            console.error("Token 刷新失败，强制登出");
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

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

  topolopyRemove(name: String) {
    this.api
      .post("/topology/del", { name: name })
      .then((response) => {
        console.log("Success:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  topolopyLinkAdd(name: String, link: TopolopyLink[]) {
    this.api
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

  topolopyLinkDel(name: String, link: TopolopyLink[]) {
    this.api
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
}
