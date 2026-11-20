import chalk from "chalk";

export async function sleep(timeout: number, debug: boolean = true) {
  if (debug) {
    console.log(`\nSleeping for ${timeout} milliseconds...`);
  }
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

export enum Port {
  A = "<PortA>",
  B = "<PortB>",
  C = "<PortC>",
  D = "<PortD>",
  E = "<PortE>",
  F = "<PortF>",
}

export const STR_DEBUG_INFO: string = chalk.bgBlue.white("INFO: ");
export const STR_SUCCESS: string = chalk.bgGreen.white("SUCCESS: ");
export const STR_FAILED: string = chalk.bgRed.white("FAILED: ");

/**
 * 报文校验调试日志开关。
 * 默认关闭：报文匹配成功时不打印逐包日志，只保留最终结果。
 * 可通过环境变量 PACKET_CHECK_DEBUG=1 或 setPacketCheckDebug(true) 打开。
 */
let packetCheckDebug: boolean = process.env.PACKET_CHECK_DEBUG === "1";

export function setPacketCheckDebug(enabled: boolean): void {
  packetCheckDebug = enabled;
}

export function isPacketCheckDebug(): boolean {
  return packetCheckDebug;
}
