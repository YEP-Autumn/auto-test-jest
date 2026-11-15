import * as path from "path";

/**
 * 打流/抓包后端服务（HTTP）地址配置。
 *
 * 可通过环境变量覆盖：STREAM_BACKEND_HOST / STREAM_BACKEND_PORT /
 * STREAM_BACKEND_USERNAME / STREAM_BACKEND_PASSWORD。
 */
export class StreamBackendConfig {
  static readonly host = process.env.STREAM_BACKEND_HOST || "172.16.9.1";
  static readonly port = process.env.STREAM_BACKEND_PORT || "8001";
  /** 默认登录账号 */
  static readonly username = process.env.STREAM_BACKEND_USERNAME || "test";
  static readonly password = process.env.STREAM_BACKEND_PASSWORD || "autotest";

  /** 服务根地址，如 http://172.16.9.1:8001 */
  static get origin(): string {
    return `http://${this.host}:${this.port}`;
  }

  /** 业务接口 baseURL，如 http://172.16.9.1:8001/api/backend_proxy */
  static get baseURL(): string {
    return `${this.origin}/api/backend_proxy`;
  }

  /** 登录接口完整地址，如 http://172.16.9.1:8001/api/auth/login/ */
  static get loginURL(): string {
    return `${this.origin}/api/auth/login/`;
  }
}

/**
 * streamcontrol gRPC 网关配置（对应 utils/rpc/grpc/streamcontrol.proto）。
 *
 * 可通过环境变量覆盖：STREAM_CONTROL_HOST / STREAM_CONTROL_PORT /
 * STREAM_CONTROL_TLS / STREAM_CONTROL_CA / STREAM_CONTROL_CERT /
 * STREAM_CONTROL_KEY / STREAM_CONTROL_TOKEN。
 */
export interface StreamControlSettings {
  readonly host: string;
  readonly port: string;
  readonly tls: boolean;
  readonly tlsInsecure: boolean;
  readonly ca?: string;
  readonly cert?: string;
  readonly key?: string;
  readonly token?: string;
  readonly authorization?: string;
  readonly address: string;
  readonly protoRoot: string;
  readonly protoFile: string;
}

export class StreamControlConfig {
  static readonly host = process.env.STREAM_CONTROL_HOST || "127.0.0.1";
  static readonly port = process.env.STREAM_CONTROL_PORT || "5443";

  /** 是否启用 TLS；默认关闭，生产网关（README 示例 5443）通常开启 */
  static readonly tls = (process.env.STREAM_CONTROL_TLS || "false") === "true";
  /** 自签证书联调时可跳过证书校验（仅限测试环境） */
  static readonly tlsInsecure =
    (process.env.STREAM_CONTROL_TLS_INSECURE || "false") === "true";
  static readonly ca = process.env.STREAM_CONTROL_CA;
  static readonly cert = process.env.STREAM_CONTROL_CERT;
  static readonly key = process.env.STREAM_CONTROL_KEY;

  /** 可选的鉴权 token；网关要求 Bearer 前缀时自动补齐 */
  static readonly token = process.env.STREAM_CONTROL_TOKEN;

  /** 实际发送的 authorization metadata 值 */
  static get authorization(): string | undefined {
    const token = this.token?.trim();
    if (!token) return undefined;
    return /^(Bearer|Token)\s+/i.test(token) ? token : `Bearer ${token}`;
  }

  /** gRPC 地址，如 127.0.0.1:5443 */
  static get address(): string {
    return `${this.host}:${this.port}`;
  }

  /** proto 根目录（manifest: streamcontrol.proto） */
  static get protoRoot(): string {
    return path.resolve(__dirname, "../rpc/grpc");
  }

  static get protoFile(): string {
    return path.resolve(this.protoRoot, "streamcontrol.proto");
  }
}
