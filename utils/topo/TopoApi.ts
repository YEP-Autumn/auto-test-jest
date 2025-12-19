import axios from "axios";
import { Topolinks } from "./LinkConstraint";

export class TopoApi {
  private api = axios.create({
    baseURL: "http://172.16.9.108:8888",
    timeout: 5000,
  });
  private baseURL = "http://172.16.9.108:8888";

  /**
   * 健康检查：尝试连接拓扑服务的实际端点，失败重试 3 次
   * （不使用 /health，而是对 /stream/link/add 做 POST 空数据探活）
   * @param maxRetries 最大重试次数
   * @param delayMs 初始延迟（毫秒），每次失败会加倍
   */
  async healthCheck(maxRetries = 3, delayMs = 500): Promise<boolean> {
    const emptyPayload = { links: [] };
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await this.api.post("/stream/link/add", emptyPayload, {
          timeout: 2000,
        });
        console.log(
          `TopoApi connectivity check passed (attempt ${attempt + 1})`
        );
        return true;
      } catch (error: any) {
        // 4xx 错误（如 400 Bad Request）说明服务在线，只是数据格式不对 → 认为健康
        if (error.response?.status >= 400 && error.response?.status < 500) {
          console.log(
            `TopoApi connectivity check passed (attempt ${
              attempt + 1
            }, status ${error.response.status})`
          );
          return true;
        }

        const delay = delayMs * Math.pow(2, attempt);
        console.warn(
          `TopoApi connectivity check failed (attempt ${
            attempt + 1
          }/${maxRetries}): ${error.message}, ` + `retry after ${delay}ms...`
        );
        if (attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
    console.warn(
      "TopoApi connectivity check failed after all retries, relying on auto-retry"
    );
    return false;
  }

  /**
   * 带重试的拓扑链接添加（指数退避）
   */
  async topoLinksAdd(links: Topolinks, maxRetries = 3, initialDelayMs = 500) {
    return this.postWithRetry(
      "/stream/link/add",
      _tmp_set_topo_links_two_way(links),
      maxRetries,
      initialDelayMs
    );
  }

  /**
   * 带重试的拓扑链接删除（指数退避）
   */
  async topoLinksDelete(
    links: Topolinks,
    maxRetries = 3,
    initialDelayMs = 500
  ) {
    return this.postWithRetry(
      "/stream/link/delete",
      _tmp_set_topo_links_two_way(links),
      maxRetries,
      initialDelayMs
    );
  }

  /**
   * 通用重试逻辑：遇到连接错误或 5xx 会自动重试
   */
  private async postWithRetry(
    path: string,
    payload: any,
    maxRetries: number,
    initialDelayMs: number
  ) {
    let lastError: any;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.api.post(path, payload);
        const result = response.data;
        if (attempt > 0) {
          console.log(`✓ TopoApi ${path} succeeded on attempt ${attempt + 1}`);
        } else {
          console.log(`✓ TopoApi ${path}:`, result);
        }
        return result;
      } catch (error: any) {
        lastError = error;
        const isRetryable =
          !error.response || // 网络错误/超时
          error.response.status >= 500 || // 服务端错误
          error.code === "ECONNREFUSED" ||
          error.code === "ECONNRESET" ||
          error.code === "ETIMEDOUT" ||
          error.message?.includes("socket hang up");

        if (!isRetryable || attempt === maxRetries - 1) {
          break;
        }

        const delay = initialDelayMs * Math.pow(2, attempt);
        console.warn(
          `TopoApi ${path} failed (attempt ${attempt + 1}/${maxRetries}): ${
            error.message
          }, ` + `retry after ${delay}ms...`
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    // 所有重试都失败，抛出错误
    throw new Error(
      `TopoApi ${path} failed after ${maxRetries} attempts: ${
        lastError?.message || lastError
      }`
    );
  }
}

function _tmp_set_topo_links_two_way(links: Topolinks): Topolinks {
  let new_links: Topolinks = { links: [] };
  links.links.forEach((link) => {
    new_links.links.push(link);
    new_links.links.push({
      stream_id: 1 << (8 + link.stream_id),
      in_port: link.out_port,
      out_port: link.in_port,
    });
  });

  return new_links;
}
