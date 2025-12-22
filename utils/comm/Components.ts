import { Port, sleep } from "..";
import { RenixPort, StreamBackendApi } from "../stream/StreamBackendApi";
import { Config } from "./Config";
import { Dut } from "./Dut";

export interface Actuator {
  start(any?: any): any;
}

export class ExecConfig implements Actuator {
  private conn: Dut;
  private config: string[];
  constructor(conn: Dut, config: string[]) {
    this.conn = conn;
    this.config = config;
  }
  async start(): Promise<boolean> {
    try {
      for (let i = 0; i < this.config.length; i++) {
        await this.conn.exec(this.config[i]);
      }
    } catch (e) {
      console.error("\x1b[31m" + e);
      await this.conn.exec("end");
      return false;
    }
    return true;
  }
}

export class CleanConfig implements Actuator {
  private conn: Dut;
  private config: string[];
  constructor(conn: Dut, config: string[]) {
    this.conn = conn;
    this.config = config;
  }
  async start(): Promise<boolean> {
    for (let i = 0; i < this.config.length; i++) {
      await this.conn.safeExec(this.config[i]);
    }
    return true;
  }
}

export class ExecRetMatch implements Actuator {
  private conn: Dut;
  private config: string;
  private expect: RegExp;
  private notMatch: boolean;

  constructor(conn: Dut, config: string, expect: RegExp, notMatch: boolean) {
    this.conn = conn;
    this.config = config;
    this.expect = expect;
    this.notMatch = notMatch;
  }
  async start(): Promise<boolean> {
    let result = await this.conn.safeExec(this.config);
    if (this.notMatch) {
      return !this.expect.exec(result);
    }
    return !!this.expect.exec(result);
  }
}

export class ReadyCheck implements Actuator {
  private conn: Dut;
  private config: string;
  private expect: RegExp;
  private timeout: number;

  constructor(conn: Dut, config: string, expect: RegExp, timeout: number) {
    this.conn = conn;
    this.config = config;
    this.expect = expect;
    this.timeout = timeout;
  }

  async start(): Promise<boolean> {
    let retry_cnt = 0;
    let startTime = Date.now();
    while (Date.now() - startTime < this.timeout) {
      let result = await this.conn.safeExec(this.config);
      if (this.expect.exec(result)) {
        return true;
      }
      console.log(
        `Waiting for condition: ${this.expect} retry cnt${++retry_cnt}...`
      );

      await sleep(2000);
    }
    return false;
  }
}

export class PacketSender implements Actuator {
  private param: PacketSendParam;

  constructor(param: PacketSendParam) {
    this.param = param;
  }

  async start(streamBackendApi: StreamBackendApi): Promise<boolean> {
    try {
      await streamBackendApi?.streamPacketUserdefineSend(
        this.param.packet,
        this.param.port,
        this.param.modifier_param,
        this.param.transmit_param
      );
    } catch (error) {
      console.error("PacketSender Error:", error);
      return false;
    }

    await sleep(3000);

    return true;
  }
}

export class Sleep implements Actuator {
  private milliseconds: number;
  constructor(milliseconds: number) {
    this.milliseconds = milliseconds;
  }
  async start(): Promise<boolean> {
    console.log(`Sleeping for ${this.milliseconds} milliseconds...`);
    await new Promise((resolve) => setTimeout(resolve, this.milliseconds));
    return true;
  }
}

/**
 * Generic interface placeholder replacer. Supports single string or array.
 * Uses global replacement so multiple occurrences are handled.
 */
export function replaceIntf(configs: string[] | string, portList: string[]) {
  const repl = (s: string) =>
    s
      .replace(new RegExp(Port.A, "g"), portList[0] ?? Port.A)
      .replace(new RegExp(Port.B, "g"), portList[1] ?? Port.B)
      .replace(new RegExp(Port.C, "g"), portList[2] ?? Port.C)
      .replace(new RegExp(Port.D, "g"), portList[3] ?? Port.D);

  if (Array.isArray(configs)) {
    for (let i = 0; i < configs.length; i++) {
      configs[i] = repl(configs[i]);
    }
    return configs;
  }
  return repl(configs);
}

export function replaceIntfA(configs: string[]) {
  return replaceIntf(configs, Config.dut_list[0].portList);
}

export function replaceIntfB(configs: string[]) {
  return replaceIntf(configs, Config.dut_list[1].portList);
}

export function replaceIntfC(configs: string[]) {
  return replaceIntf(configs, Config.dut_list[2].portList);
}

export function replaceIntfD(configs: string[]) {
  return replaceIntf(configs, Config.dut_list[3].portList);
}

/**
 * A lightweight, safe proxy handle for executing commands with port alias replacement.
 * Prevents leaking raw interface names by enforcing Port placeholders.
 */
export class DutHandle {
  private conn: Dut;
  private portMap: Record<string, string>;

  constructor(conn: Dut, portList: string[]) {
    this.conn = conn;
    this.portMap = {
      [Port.A]: portList[0],
      [Port.B]: portList[1],
      [Port.C]: portList[2],
      [Port.D]: portList[3],
    };
  }

  /** Tagged template helper: h.cmd`show interface ${Port.A} counters` */
  cmd(strings: TemplateStringsArray, ...values: any[]): string {
    let out = "";
    for (let i = 0; i < strings.length; i++) {
      out += strings[i];
      if (i < values.length) {
        out += String(values[i]);
      }
    }
    return out;
  }

  /** Resolve a single port alias to the physical interface */
  resolvePort(alias: Port | string): string {
    return this.portMap[String(alias)] ?? String(alias);
  }

  /** Internal: replace Port placeholders in a command string */
  private replacePorts(command: string): string {
    const list = [
      this.portMap[Port.A],
      this.portMap[Port.B],
      this.portMap[Port.C],
      this.portMap[Port.D],
    ];
    return replaceIntf(command, list) as string;
  }

  async exec(command: string): Promise<string> {
    const cmd = this.replacePorts(command);
    return await this.conn.exec(cmd);
  }

  async safeExec(command: string): Promise<string> {
    const cmd = this.replacePorts(command);
    return await this.conn.safeExec(cmd);
  }

  /** Execute and return RegExp match result (with named groups if provided) */
  async match(
    command: string,
    expect: RegExp
  ): Promise<RegExpExecArray | null> {
    const result = await this.safeExec(command);
    return expect.exec(result);
  }
}

/**
 * Actuator to run a user-provided callback with a safe DutHandle.
 * The callback returns boolean indicating success.
 */
export class ExecCustom implements Actuator {
  private conn: Dut;
  private portList: string[];
  private cb: (h: DutHandle) => Promise<boolean> | boolean;

  constructor(
    conn: Dut,
    portList: string[],
    cb: (h: DutHandle) => Promise<boolean> | boolean
  ) {
    this.conn = conn;
    this.portList = portList;
    this.cb = cb;
  }

  async start(): Promise<boolean> {
    try {
      const handle = new DutHandle(this.conn, this.portList);
      const ret = await this.cb(handle);
      return !!ret;
    } catch (e) {
      console.error("ExecCustom Error:", e);
      return false;
    }
  }
}

export enum ModifierField {
  EthernetII_MAC_SRC,
  EthernetII_MAC_DST,
  IPv4_IP_SRC,
  IPv4_IP_DST,
  TCP_PORT_SRC,
  TCP_PORT_DST,
  UDP_PORT_SRC,
  UDP_PORT_DST,
}

export enum TransmitMode {
  CONTINUOUS = "Continuous",
  BURST = "Burst",
  STEP = "Step",
  TIME = "Time",
}

export enum BurstGapUnit {
  NS = "NS",
  US = "US",
  MS = "MS",
  SEC = "SEC",
}

export enum BurstRateUnit {
  FRAME_PER_SEC = "FRAME_PER_SEC",
  BYTE_PER_SEC = "BYTE_PER_SEC",
  PERCENT = "PERCENT",
}

export enum ModifierMode {
  Increment = "Increment",
  Decrement = "Decrement",
  Random = "Random",
}

export interface PacketModifierParam {
  modifier_field: ModifierField;
  mode: ModifierMode;
  start_value: string;
  step?: number;
  count: number;
}

export interface TransmitBurstParam {
  burst_size?: number;
  burst_count?: number;
  gap?: number;
  gap_unit?: BurstGapUnit;
  rate?: number;
  rate_unit?: BurstRateUnit;
}

export interface TransmitStepParam {
  step_count: number;
}

export interface TransmitContinuousParam {
  percent_rate: number;
}

export interface TransmitTimeParam {
  time_seconds: number;
}

export interface PacketTransmitModeParam {
  mode: TransmitMode;
  param?:
    | TransmitBurstParam
    | TransmitStepParam
    | TransmitContinuousParam
    | TransmitTimeParam;
}

export interface PacketSendParam {
  port: RenixPort;
  packet: Buffer;
  modifier_param?: PacketModifierParam[];
  transmit_param: PacketTransmitModeParam;
}
