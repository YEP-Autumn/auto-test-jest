/**
 * 拓扑后端服务（topo backend）地址配置。
 *
 * 可通过环境变量覆盖：TOPO_BACKEND_HOST / TOPO_BACKEND_PORT /
 * TOPO_BACKEND_USERNAME / TOPO_BACKEND_PASSWORD。
 */
export class TopoBackendConfig {
  static readonly host = process.env.TOPO_BACKEND_HOST || "172.16.9.1";
  static readonly port = process.env.TOPO_BACKEND_PORT || "8000";
  /** 默认登录账号 */
  static readonly username = process.env.TOPO_BACKEND_USERNAME || "test";
  static readonly password = process.env.TOPO_BACKEND_PASSWORD || "autotest";

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
