import { Port, sleep, STR_DEBUG_INFO, STR_FAILED, STR_SUCCESS } from "..";
import {
  formatPktList,
  matchARP,
  matchDot3,
  matchEthernetII,
  matchICMP,
  matchIPv4,
  matchIPv6,
  matchLLC,
  matchRaw,
  matchSNMP,
  matchTCP,
  matchUDP,
  matchVLAN,
  packet_thrift_buffer_build,
} from "../stream/packet-utils";
import { StreamBackendApi } from "../stream/stream-backend-api";
import { PacketBuilder } from "../stream/thrift-packet";
import { StreamPort } from "./config";
import { Dut } from "./dut";

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
      await this.conn.safeExec("end");
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
        console.error(error);
        result = false;
      }
    }
    return result;
  }
}

export class ExecRetMatch implements Actuator {
  private conn: Dut;
  private config: string;
  private expects: RegExp[];
  private notMatch: boolean;

  /**
   * @param expect 期望的正则列表：命令只执行一次，输出对每条期望做 AND 校验。
   *               归一化（string / 单条 / 数组 -> RegExp[]）由 TestHelper 完成。
   */
  constructor(conn: Dut, config: string, expect: RegExp[], notMatch: boolean) {
    this.conn = conn;
    this.config = config;
    this.expects = expect;
    this.notMatch = notMatch;
  }

  async start(): Promise<boolean> {
    const result = await this.conn.safeExec(this.config);

    const failed = this.expects.filter((expect) => {
      /** 重置 lastIndex，避免带 /g、/y 标志的正则在多次 test 时状态残留 */
      expect.lastIndex = 0;
      const hit = expect.test(result);
      return this.notMatch ? hit : !hit;
    });

    const success = failed.length === 0;

    if (!success) {
      const detail = this.expects
        .map(
          (expect) =>
            `    ${failed.includes(expect) ? "[FAIL]" : "[ OK ]"} ${
              this.notMatch ? "must not match" : "must match"
            }: ${expect}`,
        )
        .join("\n");
      console.error(
        `ExecRetMatch failed:\n  Command: ${this.config}\n  IsNotMatch: ${this.notMatch}\n  Expect:\n${detail}\n  Output: ${result}`,
      );
    }

    return success;
  }
}

export class ReadyCheck implements Actuator {
  private conn: Dut;
  private config: string;
  private expect: RegExp;
  private timeout: number;
  private notMatch: boolean;

  constructor(
    conn: Dut,
    config: string,
    expect: RegExp,
    timeout: number,
    notMatch: boolean,
  ) {
    this.conn = conn;
    this.config = config;
    this.expect = expect;
    this.timeout = timeout;
    this.notMatch = notMatch;
  }

  async start(): Promise<boolean> {
    try {
      let retry_cnt = 0;
      let startTime = Date.now();
      while (Date.now() - startTime < this.timeout) {
        let result = await this.conn.safeExec(this.config);
        if (this.notMatch) {
          if (!this.expect.exec(result)) {
            return true;
          }
        } else {
          if (!!this.expect.exec(result)) {
            return true;
          }
        }

        console.log(
          `\nWaiting for condition: ${this.expect} retry cnt: ${++retry_cnt}...`,
        );

        await sleep(2000);
      }
    } catch (error) {
      console.error("Error: ", error);
      return false;
    }
    console.error("ReadyCheck Waiting timeout.");
    return false;
  }
}

export class StartCapture implements Actuator {
  private stream_port: StreamPort;
  constructor(stream_port: StreamPort) {
    this.stream_port = stream_port;
  }
  async start(streamBackendApi: StreamBackendApi): Promise<boolean> {
    try {
      await streamBackendApi?.streamPacketCaptureStart(this.stream_port);
    } catch (error) {
      console.error("Error: ", error);
      return false;
    }
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
      if (this.param.wait_time == null) {
        this.param.wait_time = 1000 * 2;
      }
      await sleep(this.param.wait_time);
      let packet_buffer = packet_thrift_buffer_build(
        this.param.packet.getFields(),
      );
      await streamBackendApi?.streamPacketUserdefineSend(
        packet_buffer,
        this.param.port,
        this.param.modifier_param,
        this.param.transmit_param,
      );
    } catch (error) {
      console.error("PacketSender Error:", error);
      return false;
    }

    await sleep(3000);

    return true;
  }
}

export class StopStream implements Actuator {
  private stream_port: StreamPort;
  constructor(stream_port: StreamPort) {
    this.stream_port = stream_port;
  }
  async start(streamBackendApi: StreamBackendApi): Promise<boolean> {
    try {
      await streamBackendApi?.streamPacketStreamStop(this.stream_port);
    } catch (error) {
      console.error("Error: ", error);
      return false;
    }
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
    expected: NumberCompare | number,
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
        return matchEthernetII(field, actualField);

      case 2: // VLAN
        return matchVLAN(field, actualField);

      case 3: // IPv4
        return matchIPv4(field, actualField);

      case 4: // IPv6
        return matchIPv6(field, actualField);

      case 5: // TCP
        return matchTCP(field, actualField);

      case 6: // UDP
        return matchUDP(field, actualField);

      case 7: // ICMP
        return matchICMP(field, actualField);

      case 8: // ARP
        return matchARP(field, actualField);

      case 9: // Raw
        return matchRaw(field, actualField);

      case 10: // Dot3
        return matchDot3(field, actualField);

      case 11: // LLC
        return matchLLC(field, actualField);

      case 12: // SNMP
        return matchSNMP(field, actualField);

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
    actualFields: any[],
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
          actualFields[actualIndex],
        )
      ) {
        expectedIndex++; // 找到匹配，移动到下一个期望字段
      }
      actualIndex++; // 总是移动实际字段索引
    }

    // 如果所有期望字段都找到了，返回 true
    if (expectedIndex === expectedFields.length) {
      console.log("one packet check pass.");
      return true;
    }

    console.log("报文字段不匹配.");
    return false;
  }

  async start(streamBackendApi: StreamBackendApi): Promise<boolean> {
    let result;

    try {
      await streamBackendApi?.streamPacketCaptureStop(this.param.port);
      result = await streamBackendApi?.streamPacketCaptureGet(this.param.port);
    } catch (error) {
      console.error("PacketChecker Error:", error);
      return false;
    }

    if (!result || !Array.isArray(result.pkt_list)) {
      console.error("❌ No packets captured, result: ", result);
      return false;
    }

    console.log(`📦 Captured ${result.pkt_list.length} packet(s)`);
    console.log(formatPktList(result.pkt_list));

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
        console.log(
          STR_DEBUG_INFO,
          `✅ Packet ${i + 1} matches expected pattern`,
        );
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
        STR_SUCCESS,
        `✅ Found ${matchCount} matching packet(s) (expected: ${expectedCountStr})`,
      );
      return true;
    } else {
      console.error(
        STR_FAILED,
        `❌ Only found ${matchCount} matching packet(s), expected ${expectedCountStr}`,
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
    await sleep(this.milliseconds);
    return true;
  }
}

export function replaceCmdTemplate(configs: string, dut: Dut): string {
  const repl = (s: string) =>
    s
      .replace(new RegExp(Port.A, "g"), dut.getPortList()[0] ?? Port.A)
      .replace(new RegExp(Port.B, "g"), dut.getPortList()[1] ?? Port.B)
      .replace(new RegExp(Port.C, "g"), dut.getPortList()[2] ?? Port.C)
      .replace(new RegExp(Port.D, "g"), dut.getPortList()[3] ?? Port.D)
      .replace(new RegExp(Port.E, "g"), dut.getPortList()[4] ?? Port.E)
      .replace(new RegExp(Port.F, "g"), dut.getPortList()[5] ?? Port.F);

  return repl(configs);
}

export function replaceCmdTemplates(configs: string[], dut: Dut): string[] {
  for (let i = 0; i < configs.length; i++) {
    configs[i] = replaceCmdTemplate(configs[i], dut);
  }

  return configs;
}

/**
 * 将期望值统一转换为 RegExp，并完成端口模板替换，明确“文本 vs 正则”语义：
 * - 传入 RegExp：按正则语义匹配（保留 flags）
 * - 传入 string：按纯文本语义匹配（自动转义元字符）
 */
export function toRegExp(expect: string | RegExp, dut: Dut): RegExp {
  if (expect instanceof RegExp) {
    return new RegExp(replaceCmdTemplate(expect.source, dut), expect.flags);
  }
  const escaped = replaceCmdTemplate(expect, dut).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  return new RegExp(escaped);
}

export class DutHandle {
  private conn: Dut;

  constructor(conn: Dut) {
    this.conn = conn;
  }

  async exec(command: string): Promise<string> {
    const cmd = replaceCmdTemplate(command, this.conn);
    return await this.conn.exec(cmd);
  }

  async safeExec(command: string): Promise<string> {
    const cmd = replaceCmdTemplate(command, this.conn);
    return await this.conn.safeExec(cmd);
  }

  /** Execute and return RegExp match result (with named groups if provided) */
  async match(
    command: string,
    expect: RegExp,
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
  private cb: (h: DutHandle) => Promise<boolean> | boolean;
  private exec_clean: boolean;

  constructor(
    conn: Dut,
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    this.conn = conn;
    this.cb = cb;
    this.exec_clean = exec_clean;
  }

  async start(): Promise<boolean> {
    try {
      const handle = new DutHandle(this.conn);
      const ret = await this.cb(handle);
      return !!ret;
    } catch (e) {
      console.error("ExecCustom Error:", e);
      return false;
    }
  }

  public is_exec_clean() {
    return this.exec_clean;
  }
}

export enum ModifierField {
  EthernetII_MAC_SRC = 0,
  EthernetII_MAC_DST,
  IPv4_IP_SRC,
  IPv4_IP_DST,
  TCP_PORT_SRC,
  TCP_PORT_DST,
  UDP_PORT_SRC,
  UDP_PORT_DST,
  Dot3_MAC_SRC,
  Dot3_MAC_DST,
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
  BYTES = "BYTES",
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
  port: StreamPort;
  packet: PacketBuilder;
  modifier_param?: PacketModifierParam[];
  transmit_param: PacketTransmitModeParam;
  wait_time?: number;
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
  port: StreamPort;
  expected_count: NumberCompare | number;
  packet: PacketBuilder;
}
