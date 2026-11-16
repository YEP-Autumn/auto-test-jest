/**
 * JSON 配置文件的结构定义。
 *
 * 只描述“环境/部署相关”的配置；设备 CLI 行为默认值仍在
 * `utils/comm/dut-defaults.ts` 中维护。
 */

import type { ProviderId } from "../backends/contract";
import type { PortMapping } from "../topo/types";
import type { StreamPortConfig } from "../traffic/model";

export const PROVIDER_IDS: readonly ProviderId[] = [
  "renix",
  "scapy",
  "stream-linux",
];

export interface TopoBackendConfigJson {
  host: string;
  port: string;
  username: string;
  password: string;
}

export interface TopoConfigJson {
  name: string;
  backend: TopoBackendConfigJson;
}

export interface DutConnectionConfigJson {
  protocol?: "telnet" | "ssh";
  username?: string;
  password?: string;
}

export interface DutConfigJson {
  host: string;
  portList: string[];
  portMapping: PortMapping[];
}

export interface DutConfigSectionJson {
  connection?: DutConnectionConfigJson;
  list: DutConfigJson[];
}

export interface HttpBackendConfigJson {
  host: string;
  port: string;
  username: string;
  password: string;
}

export interface StreamControlConfigJson {
  host: string;
  port: string;
  tls?: boolean;
  tlsInsecure?: boolean;
  ca?: string;
  cert?: string;
  key?: string;
  token?: string;
  /** 打印批量抓包调试日志 */
  debugCapture?: boolean;
  /** 批量下载阈值；0 表示停止抓包后总是批量下载 */
  batchCaptureMin?: number;
}

export interface TrafficConfigJson {
  http: HttpBackendConfigJson;
  streamControl: StreamControlConfigJson;
  ports: StreamPortConfig[];
}

export interface AppConfigJson {
  topo: TopoConfigJson;
  dut: DutConfigSectionJson;
  traffic: TrafficConfigJson;
}
