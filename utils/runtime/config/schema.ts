/**
 * JSON 配置文件的结构定义。
 *
 * 只描述“环境/部署相关”的配置；设备 CLI 行为默认值仍在
 * `runtime/config/device-defaults.ts` 中维护。
 */

import type { PortMapping } from "../../domain/topology/model";
import type { StreamPortConfig } from "../../domain/traffic/stream-port";

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
  /** 设备名称，在 list 内唯一；用于 dut.mapping 引用，与 IP 无关 */
  name: string;
  host: string;
  portList: string[];
  portMapping: PortMapping[];
}

export interface DutConfigSectionJson {
  connection?: DutConnectionConfigJson;
  /**
   * 逻辑槽位（A~L）→ 设备名映射，按数组顺序依次对应 A、B、C…
   *
   * 调整 A/B/C/D 分别使用哪台设备时，只需改这里名字的顺序，
   * 无需移动 list 中的设备对象。省略时退回 list 的原始顺序。
   */
  mapping?: string[];
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
