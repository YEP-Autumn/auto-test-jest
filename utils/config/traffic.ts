/**
 * 流量端口配置（组合根输入）。
 *
 * 数组顺序就是逻辑端口：
 *   [0] -> StreamPort.A
 *   [1] -> StreamPort.B
 *   ...
 *
 * 实际配置在 config/env/default.json 的 traffic.ports，
 * 本机可覆盖 config/env/local.json。
 */

import { loadConfig } from "./loader";

export const streamPorts = loadConfig().traffic.ports;
