import { Port, sleep } from "..";
import { packet_thrift_buffer_build } from "../stream/packet_utils";
import { RenixPort, StreamBackendApi } from "../stream/StreamBackendApi";
import { PacketBuilder } from "../stream/thrift_packet";
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
    let result = true;
    for (let i = 0; i < this.config.length; i++) {
      try {
        await this.conn.exec(this.config[i]);
      } catch (error) {
        result = false;
      }
    }
    return result;
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

export class StartCapture implements Actuator {
  private renix_port: RenixPort;
  constructor(renix_port: RenixPort) {
    this.renix_port = renix_port;
  }
  async start(streamBackendApi: StreamBackendApi): Promise<boolean> {
    await streamBackendApi?.streamPacketCaptureStart(this.renix_port);
    return true;
  }
}

export class PacketSender implements Actuator {
  private param: PacketSendParam;

  constructor(param: PacketSendParam) {
    this.param = param;
  }

  async start(streamBackendApi: StreamBackendApi): Promise<boolean> {
    try {
      let packet_buffer = packet_thrift_buffer_build(
        this.param.packet.getFields()
      );
      await streamBackendApi?.streamPacketUserdefineSend(
        packet_buffer,
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

export class PacketChecker implements Actuator {
  private param: PacketCheckParam;

  constructor(param: PacketCheckParam) {
    this.param = param;
  }

  /**
   * 检查数量是否满足期望条件
   * @param actual 实际数量
   * @param expected 期望条件（NumberCompare 或 number）
   * @returns 是否满足条件
   */
  private checkCount(
    actual: number,
    expected: NumberCompare | number
  ): boolean {
    if (typeof expected === "number") {
      return actual === expected;
    }

    // NumberCompare 类型
    switch (expected.type) {
      case CompareType.E_GreaterThan:
        return actual > expected.count;
      case CompareType.E_LessThan:
        return actual < expected.count;
      case CompareType.E_EqualTo:
        return actual === expected.count;
      default:
        return false;
    }
  }

  /**
   * 检查两个字段是否匹配
   * @param expected 期望的字段（来自 PacketBuilder）
   * @param actual 实际捕获的字段
   * @returns 是否匹配
   */
  private fieldsMatch(expected: any, actual: any): boolean {
    if (!expected || !actual) return false;
    if (expected.type !== actual.type) return false;

    const field = expected.field;
    const actualField = actual.field;

    if (!field || !actualField) return false;

    // 根据字段类型比较具体内容
    switch (expected.type) {
      case 1: // EthernetII
        return (
          field.ether &&
          actualField.ether &&
          field.ether.dst === actualField.ether.dst &&
          field.ether.src === actualField.ether.src &&
          field.ether.type === actualField.ether.type
        );
      case 2: // VLAN
        return (
          field.vlan &&
          actualField.vlan &&
          field.vlan.vlan === actualField.vlan.vlan &&
          field.vlan.type === actualField.vlan.type
        );
      case 3: // IPv4
        return (
          field.ipv4 &&
          actualField.ipv4 &&
          field.ipv4.src_ip === actualField.ipv4.src_ip &&
          field.ipv4.dst_ip === actualField.ipv4.dst_ip
        );
      default:
        return false;
    }
  }

  /**
   * 检查期望的字段列表是否按顺序存在于实际字段列表中
   * @param expectedFields 期望的字段列表
   * @param actualFields 实际字段列表
   * @returns 是否匹配
   */
  private fieldListMatches(
    expectedFields: any[],
    actualFields: any[]
  ): boolean {
    if (!expectedFields || expectedFields.length === 0) return true;
    if (!actualFields || actualFields.length === 0) return false;

    let expectedIndex = 0;
    let actualIndex = 0;

    // 遍历实际字段列表，按顺序查找期望字段
    while (
      expectedIndex < expectedFields.length &&
      actualIndex < actualFields.length
    ) {
      if (
        this.fieldsMatch(
          expectedFields[expectedIndex],
          actualFields[actualIndex]
        )
      ) {
        expectedIndex++; // 找到匹配，移动到下一个期望字段
      }
      actualIndex++; // 总是移动实际字段索引
    }

    // 如果所有期望字段都找到了，返回 true
    return expectedIndex === expectedFields.length;
  }

  async start(streamBackendApi: StreamBackendApi): Promise<boolean> {
    await streamBackendApi?.streamPacketCaptureStop(this.param.port);
    let result = await streamBackendApi?.streamPacketCaptureGet(
      this.param.port
    );

    if (!result || !result.pkt_list) {
      console.error("❌ No packets captured");
      return false;
    }

    console.log(`📦 Captured ${result.pkt_list.length} packet(s)`);
    console.log(JSON.stringify(result.pkt_list, null, 2));

    // 获取期望的字段列表
    const expectedFields = this.param.packet.getFields();

    // 遍历捕获的包，检查是否有匹配的
    let matchCount = 0;
    for (let i = 0; i < result.pkt_list.length; i++) {
      const packet = result.pkt_list[i];
      if (
        packet.field_list &&
        this.fieldListMatches(expectedFields, packet.field_list)
      ) {
        matchCount++;
        console.log(`✅ Packet ${i + 1} matches expected pattern`);
      }
    }

    // 判断匹配数量是否满足预期
    const expectedCountStr =
      typeof this.param.expected_count === "number"
        ? `${this.param.expected_count}`
        : `${CompareType[this.param.expected_count.type].replace("E_", "")} ${
            this.param.expected_count.count
          }`;

    if (this.checkCount(matchCount, this.param.expected_count)) {
      console.log(
        `✅ Found ${matchCount} matching packet(s) (expected: ${expectedCountStr})`
      );
      return true;
    } else {
      console.error(
        `❌ Only found ${matchCount} matching packet(s), expected ${expectedCountStr}`
      );
      return false;
    }
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
  fixed_len?: number;
}

export interface PacketSendParam {
  port: RenixPort;
  packet: PacketBuilder;
  modifier_param?: PacketModifierParam[];
  transmit_param: PacketTransmitModeParam;
}

enum CompareType {
  E_GreaterThan,
  E_LessThan,
  E_EqualTo,
}

interface NumberCompare {
  type: CompareType;
  count: number;
}

export function GreaterThan(cnt: number): NumberCompare {
  return { type: CompareType.E_GreaterThan, count: cnt };
}

export function LessThan(cnt: number): NumberCompare {
  return { type: CompareType.E_LessThan, count: cnt };
}

export function EqualTo(cnt: number): NumberCompare {
  return { type: CompareType.E_EqualTo, count: cnt };
}

export interface PacketCheckParam {
  port: RenixPort;
  expected_count: NumberCompare | number;
  packet: PacketBuilder;
}
