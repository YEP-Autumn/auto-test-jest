/**
 * 拓扑后端服务（topo backend）地址配置。
 *
 * 由 config/env/default.json + local.json 提供。
 */

import { loadConfig } from "./loader";

const { topo } = loadConfig();

export class TopoBackendConfig {
  static readonly host = topo.backend.host;
  static readonly port = topo.backend.port;
  static readonly username = topo.backend.username;
  static readonly password = topo.backend.password;

  /** 服务根地址，如 http://172.16.9.1:8000 */
  static get origin(): string {
    return `http://${this.host}:${this.port}`;
  }

  /** 业务接口 baseURL，如 http://172.16.9.1:8000 */
  static get baseURL(): string {
    return this.origin;
  }

  /** 登录接口完整地址，如 http://172.16.9.1:8000/api/auth/login/ */
  static get loginURL(): string {
    return `${this.origin}/api/auth/login/`;
  }
}
