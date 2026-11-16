/**
 * 打流/抓包后端服务配置。
 *
 * 由 config/env/default.json + local.json 提供，不再读取环境变量。
 */

import * as path from "path";
import { loadConfig } from "./loader";

const { traffic } = loadConfig();

/**
 * 打流/抓包后端服务（HTTP）地址配置。
 */
export class StreamBackendConfig {
  static readonly host = traffic.http.host;
  static readonly port = traffic.http.port;
  static readonly username = traffic.http.username;
  static readonly password = traffic.http.password;

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
  static readonly host = traffic.streamControl.host;
  static readonly port = traffic.streamControl.port;

  /** 是否启用 TLS；默认关闭，生产网关（README 示例 5443）通常开启 */
  static readonly tls = traffic.streamControl.tls ?? false;
  /** 自签证书联调时可跳过证书校验（仅限测试环境） */
  static readonly tlsInsecure = traffic.streamControl.tlsInsecure ?? false;
  static readonly ca = traffic.streamControl.ca;
  static readonly cert = traffic.streamControl.cert;
  static readonly key = traffic.streamControl.key;

  /** 可选的鉴权 token；网关要求 Bearer 前缀时自动补齐 */
  static readonly token = traffic.streamControl.token;

  /** 批量抓包调试日志 */
  static readonly debugCapture = traffic.streamControl.debugCapture ?? false;

  /** 批量抓包下载阈值 */
  static readonly batchCaptureMin = traffic.streamControl.batchCaptureMin ?? 64;

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
