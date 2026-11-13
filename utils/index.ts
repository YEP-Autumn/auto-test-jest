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
