/**
 * DUT 连接行为默认值。
 *
 * 这些是 CLI/传输层行为参数，不是环境配置，因此保留在代码中：
 * - pageSeparator 是正则；
 * - 超时、缓冲区、终端尺寸与设备回显特性强相关；
 * - 账号/密码、protocol 等环境差异由 config/env/*.json 覆盖。
 */

import type { ITransportOptions } from "./transport";

export const DUT_DEFAULT_CONFIG: Omit<ITransportOptions, "host"> = {
  protocol: "telnet",
  shellPrompt: "(Switch.*#|password:|CTC_CLI|Password:|\\[confirm\\])",
  timeout: 1000 * 60 * 5,
  debug: true,
  stripShellPrompt: false,
  stripControls: true,
  execTimeout: 1000 * 30,
  disableLogon: true,
  // 分页提示：Hohunet 交换机输出分页时发送的是 `\x1b[7m--More--\x1b[m`（ANSI 反显包裹），
  // 必须匹配 `--More--`，否则 telnet-client 永远不发空格翻页，exec 会一直等到 execTimeout。
  pageSeparator: /-{1,4}\s*More/im,
  // 缓存上限放宽到 16MB：长输出默认 1MB 上限会在到达前截断返回，影响正则匹配。
  maxBufferLength: 1024 * 1024 * 16,
  // 协商更大的终端窗口，避免长输出被交换机按 80 列硬换行。
  terminalWidth: 500,
  terminalHeight: 200,
};
