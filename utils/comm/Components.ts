import { Port, sleep } from "..";
import { i16_to_u16, packet_thrift_buffer_build } from "../stream/packet_utils";
import { RenixPort, StreamBackendApi } from "../stream/StreamBackendApi";
import { PacketBuilder } from "../stream/thrift_packet";
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
    try {
      let retry_cnt = 0;
      let startTime = Date.now();
      while (Date.now() - startTime < this.timeout) {
        let result = await this.conn.safeExec(this.config);
        if (this.expect.exec(result)) {
          return true;
        }
        console.log(
          `Waiting for condition: ${this.expect} retry cnt: ${++retry_cnt}...`
        );

        await sleep(2000);
      }
    } catch (error) {
      console.error("Error: ", error);
      return false;
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
    try {
      await streamBackendApi?.streamPacketCaptureStart(this.renix_port);
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
        console.log("Comparing EthernetII fields:", field, actualField);
        if (field.ether == null || actualField.ether == null) {
          console.log("EthernetII field is null.");
          return false;
        }

        if (field.ether.type !== i16_to_u16(actualField.ether.type)) {
          console.log(
            "EthernetII type field does not match. expected:",
            field.ether.type,
            "actual:",
            i16_to_u16(actualField.ether.type)
          );
          return false;
        }

        if (field.ether.dst !== actualField.ether.dst) {
          console.log(
            "EthernetII dst field does not match. expected:",
            field.ether.dst,
            "actual:",
            actualField.ether.dst
          );
          return false;
        }
        if (field.ether.src !== actualField.ether.src) {
          console.log(
            "EthernetII src field does not match. expected:",
            field.ether.src,
            "actual:",
            actualField.ether.src
          );
          return false;
        }

        return true;

      case 2: // VLAN
        console.log("Comparing VLAN fields:", field, actualField);
        return (
          field.vlan &&
          actualField.vlan &&
          field.vlan.vlan === i16_to_u16(actualField.vlan.vlan) &&
          field.vlan.type === i16_to_u16(actualField.vlan.type)
        );
      case 3: // IPv4
        console.log("Comparing IPv4 fields:", field, actualField);
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

    if (!result || !Array.isArray(result.pkt_list)) {
      console.error("❌ No packets captured, result: ", result);
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

export function replaceCmdTemplate(configs: string, dut: Dut): string {
  const repl = (s: string) =>
    s
      .replace(new RegExp(Port.A, "g"), dut.getPortList()[0] ?? Port.A)
      .replace(new RegExp(Port.B, "g"), dut.getPortList()[1] ?? Port.B)
      .replace(new RegExp(Port.C, "g"), dut.getPortList()[2] ?? Port.C)
      .replace(new RegExp(Port.D, "g"), dut.getPortList()[3] ?? Port.D);

  

  return repl(configs);
}

export function replaceCmdTemplates(configs: string[], dut: Dut): string[] {
  for (let i = 0; i < configs.length; i++) {
    configs[i] = replaceCmdTemplate(configs[i], dut);
  }

  return configs;
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
      const handle = new DutHandle(this.conn);
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
