import { Port, sleep, STR_DEBUG_INFO, STR_FAILED, STR_SUCCESS } from "..";
import { packet_thrift_buffer_build } from "../stream/packet_utils";
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
  private expect: RegExp;
  private notMatch: boolean;

  constructor(conn: Dut, config: string, expect: RegExp, notMatch: boolean) {
    this.conn = conn;
    this.config = config;
    this.expect = expect;
    this.notMatch = notMatch;
  }

  async start(): Promise<boolean> {
    let success: boolean;
    let result = await this.conn.safeExec(this.config);
    if (this.notMatch) {
      success = !this.expect.exec(result);
    } else {
      success = !!this.expect.exec(result);
    }

    if (!success) {
      console.error(
        `ExecRetMatch failed:\n  Command: ${this.config}\n  Expected: ${this.expect}\n  Output: ${result}\n  IsNotMatch: ${this.notMatch}`,
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
          `Waiting for condition: ${this.expect} retry cnt: ${++retry_cnt}...`,
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
      await sleep(1000 * 2, false);
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
        console.log("Comparing EthernetII fields:", field, actualField);
        if (field.ether == null || actualField.ether == null) {
          console.log("EthernetII field is null.");
          return false;
        }

        if (field.ether.type && field.ether.type !== actualField.ether.type) {
          console.log(
            "EthernetII type field does not match. expected:",
            field.ether.type,
            "actual:",
            actualField.ether.type,
          );
          return false;
        }

        if (field.ether.dst && field.ether.dst !== actualField.ether.dst) {
          console.log(
            "EthernetII dst field does not match. expected:",
            field.ether.dst,
            "actual:",
            actualField.ether.dst,
          );
          return false;
        }
        if (field.ether.src && field.ether.src !== actualField.ether.src) {
          console.log(
            "EthernetII src field does not match. expected:",
            field.ether.src,
            "actual:",
            actualField.ether.src,
          );
          return false;
        }

        return true;

      case 2: // VLAN
        console.log("Comparing VLAN fields:", field, actualField);
        if (field.vlan == null || actualField.vlan == null) {
          console.log("VLAN field is null.");
          return false;
        }

        if (field.vlan.prio && field.vlan.prio !== actualField.vlan.prio) {
          console.log(
            "VLAN prio field does not match. expected:",
            field.vlan.prio,
            "actual:",
            actualField.vlan.prio,
          );
          return false;
        }

        if (field.vlan.dei && field.vlan.dei !== actualField.vlan.dei) {
          console.log(
            "VLAN dei field does not match. expected:",
            field.vlan.dei,
            "actual:",
            actualField.vlan.dei,
          );
          return false;
        }

        if (field.vlan.vlan && field.vlan.vlan !== actualField.vlan.vlan) {
          console.log(
            "VLAN vlan field does not match. expected:",
            field.vlan.vlan,
            "actual:",
            actualField.vlan.vlan,
          );
          return false;
        }

        if (field.vlan.type && field.vlan.type !== actualField.vlan.type) {
          console.log(
            "VLAN type field does not match. expected:",
            field.vlan.type,
            "actual:",
            actualField.vlan.type,
          );
          return false;
        }

        return true;

      case 3: // IPv4
        console.log("Comparing IPv4 fields:", field, actualField);
        if (field.ipv4 == null || actualField.ipv4 == null) {
          console.log("IPv4 field is null.");
          return false;
        }

        if (
          field.ipv4.version &&
          field.ipv4.version !== actualField.ipv4.version
        ) {
          console.log(
            "IPv4 version field does not match. expected:",
            field.ipv4.version,
            "actual:",
            actualField.ipv4.version,
          );
          return false;
        }

        if (field.ipv4.ihl && field.ipv4.ihl !== actualField.ipv4.ihl) {
          console.log(
            "IPv4 ihl field does not match. expected:",
            field.ipv4.ihl,
            "actual:",
            actualField.ipv4.ihl,
          );
          return false;
        }

        if (field.ipv4.tos && field.ipv4.tos !== actualField.ipv4.tos) {
          console.log(
            "IPv4 tos field does not match. expected:",
            field.ipv4.tos,
            "actual:",
            actualField.ipv4.tos,
          );
          return false;
        }

        if (field.ipv4.len && field.ipv4.len !== actualField.ipv4.len) {
          console.log(
            "IPv4 len field does not match. expected:",
            field.ipv4.len,
            "actual:",
            actualField.ipv4.len,
          );
          return false;
        }

        if (field.ipv4.id && field.ipv4.id !== actualField.ipv4.id) {
          console.log(
            "IPv4 id field does not match. expected:",
            field.ipv4.id,
            "actual:",
            actualField.ipv4.id,
          );
          return false;
        }

        if (field.ipv4.frag && field.ipv4.frag !== actualField.ipv4.frag) {
          console.log(
            "IPv4 frag field does not match. expected:",
            field.ipv4.frag,
            "actual:",
            actualField.ipv4.frag,
          );
          return false;
        }

        if (field.ipv4.flags && field.ipv4.flags !== actualField.ipv4.flags) {
          console.log(
            "IPv4 flags field does not match. expected:",
            field.ipv4.flags,
            "actual:",
            actualField.ipv4.flags,
          );
          return false;
        }

        if (field.ipv4.ttl && field.ipv4.ttl !== actualField.ipv4.ttl) {
          console.log(
            "IPv4 ttl field does not match. expected:",
            field.ipv4.ttl,
            "actual:",
            actualField.ipv4.ttl,
          );
          return false;
        }

        if (field.ipv4.proto && field.ipv4.proto !== actualField.ipv4.proto) {
          console.log(
            "IPv4 proto field does not match. expected:",
            field.ipv4.proto,
            "actual:",
            actualField.ipv4.proto,
          );
          return false;
        }

        if (
          field.ipv4.chksum &&
          field.ipv4.chksum !== actualField.ipv4.chksum
        ) {
          console.log(
            "IPv4 chksum field does not match. expected:",
            field.ipv4.chksum,
            "actual:",
            actualField.ipv4.chksum,
          );
          return false;
        }

        if (field.ipv4.src && field.ipv4.src !== actualField.ipv4.src) {
          console.log(
            "IPv4 src field does not match. expected:",
            field.ipv4.src,
            "actual:",
            actualField.ipv4.src,
          );
          return false;
        }

        if (field.ipv4.dst && field.ipv4.dst !== actualField.ipv4.dst) {
          console.log(
            "IPv4 dst field does not match. expected:",
            field.ipv4.dst,
            "actual:",
            actualField.ipv4.dst,
          );
          return false;
        }

        if (
          field.ipv4.option &&
          field.ipv4.option !== actualField.ipv4.option
        ) {
          console.log(
            "IPv4 option field does not match. expected:",
            field.ipv4.option,
            "actual:",
            actualField.ipv4.option,
          );
          return false;
        }

        return true;

      case 4: // IPv6
        console.log("Comparing IPv6 fields:", field, actualField);
        if (field.ipv6 == null || actualField.ipv6 == null) {
          console.log("IPv6 field is null.");
          return false;
        }

        if (
          field.ipv6.version &&
          field.ipv6.version !== actualField.ipv6.version
        ) {
          console.log(
            "IPv6 version field does not match. expected:",
            field.ipv6.version,
            "actual:",
            actualField.ipv6.version,
          );
          return false;
        }

        if (field.ipv6.tc && field.ipv6.tc !== actualField.ipv6.tc) {
          console.log(
            "IPv6 tc field does not match. expected:",
            field.ipv6.tc,
            "actual:",
            actualField.ipv6.tc,
          );
          return false;
        }

        if (field.ipv6.fl && field.ipv6.fl !== actualField.ipv6.fl) {
          console.log(
            "IPv6 fl field does not match. expected:",
            field.ipv6.fl,
            "actual:",
            actualField.ipv6.fl,
          );
          return false;
        }

        if (field.ipv6.plen && field.ipv6.plen !== actualField.ipv6.plen) {
          console.log(
            "IPv6 plen field does not match. expected:",
            field.ipv6.plen,
            "actual:",
            actualField.ipv6.plen,
          );
          return false;
        }

        if (field.ipv6.nh && field.ipv6.nh !== actualField.ipv6.nh) {
          console.log(
            "IPv6 nh field does not match. expected:",
            field.ipv6.nh,
            "actual:",
            actualField.ipv6.nh,
          );
          return false;
        }

        if (field.ipv6.hlim && field.ipv6.hlim !== actualField.ipv6.hlim) {
          console.log(
            "IPv6 hlim field does not match. expected:",
            field.ipv6.hlim,
            "actual:",
            actualField.ipv6.hlim,
          );
          return false;
        }

        if (field.ipv6.src && field.ipv6.src !== actualField.ipv6.src) {
          console.log(
            "IPv6 src field does not match. expected:",
            field.ipv6.src,
            "actual:",
            actualField.ipv6.src,
          );
          return false;
        }

        if (field.ipv6.dst && field.ipv6.dst !== actualField.ipv6.dst) {
          console.log(
            "IPv6 dst field does not match. expected:",
            field.ipv6.dst,
            "actual:",
            actualField.ipv6.dst,
          );
          return false;
        }

        return true;

      case 5: // TCP
        console.log("Comparing TCP fields:", field, actualField);
        if (field.tcp == null || actualField.tcp == null) {
          console.log("TCP field is null.");
          return false;
        }

        if (field.tcp.sport && field.tcp.sport !== actualField.tcp.sport) {
          console.log(
            "TCP sport field does not match. expected:",
            field.tcp.sport,
            "actual:",
            actualField.tcp.sport,
          );
          return false;
        }

        if (field.tcp.dport && field.tcp.dport !== actualField.tcp.dport) {
          console.log(
            "TCP dport field does not match. expected:",
            field.tcp.dport,
            "actual:",
            actualField.tcp.dport,
          );
          return false;
        }

        if (field.tcp.seq && field.tcp.seq !== actualField.tcp.seq) {
          console.log(
            "TCP seq field does not match. expected:",
            field.tcp.seq,
            "actual:",
            actualField.tcp.seq,
          );
          return false;
        }

        if (field.tcp.ack && field.tcp.ack !== actualField.tcp.ack) {
          console.log(
            "TCP ack field does not match. expected:",
            field.tcp.ack,
            "actual:",
            actualField.tcp.ack,
          );
          return false;
        }

        if (
          field.tcp.dataofs &&
          field.tcp.dataofs !== actualField.tcp.dataofs
        ) {
          console.log(
            "TCP dataofs field does not match. expected:",
            field.tcp.dataofs,
            "actual:",
            actualField.tcp.dataofs,
          );
          return false;
        }

        if (field.tcp.rsv && field.tcp.rsv !== actualField.tcp.rsv) {
          console.log(
            "TCP rsv field does not match. expected:",
            field.tcp.rsv,
            "actual:",
            actualField.tcp.rsv,
          );
          return false;
        }

        if (field.tcp.flags && field.tcp.flags !== actualField.tcp.flags) {
          console.log(
            "TCP flags field does not match. expected:",
            field.tcp.flags,
            "actual:",
            actualField.tcp.flags,
          );
          return false;
        }

        if (field.tcp.window && field.tcp.window !== actualField.tcp.window) {
          console.log(
            "TCP window field does not match. expected:",
            field.tcp.window,
            "actual:",
            actualField.tcp.window,
          );
          return false;
        }

        if (field.tcp.chksum && field.tcp.chksum !== actualField.tcp.chksum) {
          console.log(
            "TCP chksum field does not match. expected:",
            field.tcp.chksum,
            "actual:",
            actualField.tcp.chksum,
          );
          return false;
        }

        if (field.tcp.urgptr && field.tcp.urgptr !== actualField.tcp.urgptr) {
          console.log(
            "TCP urgptr field does not match. expected:",
            field.tcp.urgptr,
            "actual:",
            actualField.tcp.urgptr,
          );
          return false;
        }

        if (field.tcp.option && field.tcp.option !== actualField.tcp.option) {
          console.log(
            "TCP option field does not match. expected:",
            field.tcp.option,
            "actual:",
            actualField.tcp.option,
          );
          return false;
        }

        return true;

      case 6: // UDP
        console.log("Comparing UDP fields:", field, actualField);
        if (field.udp == null || actualField.udp == null) {
          console.log("UDP field is null.");
          return false;
        }

        if (field.udp.sport && field.udp.sport !== actualField.udp.sport) {
          console.log(
            "UDP sport field does not match. expected:",
            field.udp.sport,
            "actual:",
            actualField.udp.sport,
          );
          return false;
        }

        if (field.udp.dport && field.udp.dport !== actualField.udp.dport) {
          console.log(
            "UDP dport field does not match. expected:",
            field.udp.dport,
            "actual:",
            actualField.udp.dport,
          );
          return false;
        }

        if (field.udp.len && field.udp.len !== actualField.udp.len) {
          console.log(
            "UDP len field does not match. expected:",
            field.udp.len,
            "actual:",
            actualField.udp.len,
          );
          return false;
        }

        if (field.udp.chksum && field.udp.chksum !== actualField.udp.chksum) {
          console.log(
            "UDP chksum field does not match. expected:",
            field.udp.chksum,
            "actual:",
            actualField.udp.chksum,
          );
          return false;
        }

        return true;

      case 7: // ICMP
        console.log("Comparing ICMP fields:", field, actualField);
        if (field.icmp == null || actualField.icmp == null) {
          console.log("ICMP field is null.");
          return false;
        }

        if (field.icmp.type && field.icmp.type !== actualField.icmp.type) {
          console.log(
            "ICMP type field does not match. expected:",
            field.icmp.type,
            "actual:",
            actualField.icmp.type,
          );
          return false;
        }

        if (field.icmp.code && field.icmp.code !== actualField.icmp.code) {
          console.log(
            "ICMP code field does not match. expected:",
            field.icmp.code,
            "actual:",
            actualField.icmp.code,
          );
          return false;
        }

        if (
          field.icmp.chksum &&
          field.icmp.chksum !== actualField.icmp.chksum
        ) {
          console.log(
            "ICMP chksum field does not match. expected:",
            field.icmp.chksum,
            "actual:",
            actualField.icmp.chksum,
          );
          return false;
        }

        if (field.icmp.id && field.icmp.id !== actualField.icmp.id) {
          console.log(
            "ICMP id field does not match. expected:",
            field.icmp.id,
            "actual:",
            actualField.icmp.id,
          );
          return false;
        }

        if (field.icmp.seq && field.icmp.seq !== actualField.icmp.seq) {
          console.log(
            "ICMP seq field does not match. expected:",
            field.icmp.seq,
            "actual:",
            actualField.icmp.seq,
          );
          return false;
        }

        return true;

      case 8: // ARP
        console.log("Comparing ARP fields:", field, actualField);
        if (field.arp == null || actualField.arp == null) {
          console.log("ARP field is null.");
          return false;
        }

        if (field.arp.hwtype && field.arp.hwtype !== actualField.arp.hwtype) {
          console.log(
            "ARP hwtype field does not match. expected:",
            field.arp.hwtype,
            "actual:",
            actualField.arp.hwtype,
          );
          return false;
        }

        if (field.arp.ptype && field.arp.ptype !== actualField.arp.ptype) {
          console.log(
            "ARP ptype field does not match. expected:",
            field.arp.ptype,
            "actual:",
            actualField.arp.ptype,
          );
          return false;
        }

        if (field.arp.hwlen && field.arp.hwlen !== actualField.arp.hwlen) {
          console.log(
            "ARP hwlen field does not match. expected:",
            field.arp.hwlen,
            "actual:",
            actualField.arp.hwlen,
          );
          return false;
        }

        if (field.arp.plen && field.arp.plen !== actualField.arp.plen) {
          console.log(
            "ARP plen field does not match. expected:",
            field.arp.plen,
            "actual:",
            actualField.arp.plen,
          );
          return false;
        }

        if (field.arp.op && field.arp.op !== actualField.arp.op) {
          console.log(
            "ARP op field does not match. expected:",
            field.arp.op,
            "actual:",
            actualField.arp.op,
          );
          return false;
        }

        if (field.arp.hwsrc && field.arp.hwsrc !== actualField.arp.hwsrc) {
          console.log(
            "ARP hwsrc field does not match. expected:",
            field.arp.hwsrc,
            "actual:",
            actualField.arp.hwsrc,
          );
          return false;
        }

        if (field.arp.psrc && field.arp.psrc !== actualField.arp.psrc) {
          console.log(
            "ARP psrc field does not match. expected:",
            field.arp.psrc,
            "actual:",
            actualField.arp.psrc,
          );
          return false;
        }

        if (field.arp.hwdst && field.arp.hwdst !== actualField.arp.hwdst) {
          console.log(
            "ARP hwdst field does not match. expected:",
            field.arp.hwdst,
            "actual:",
            actualField.arp.hwdst,
          );
          return false;
        }

        if (field.arp.pdst && field.arp.pdst !== actualField.arp.pdst) {
          console.log(
            "ARP pdst field does not match. expected:",
            field.arp.pdst,
            "actual:",
            actualField.arp.pdst,
          );
          return false;
        }

        return true;

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
  private portList: string[];
  private cb: (h: DutHandle) => Promise<boolean> | boolean;

  constructor(
    conn: Dut,
    portList: string[],
    cb: (h: DutHandle) => Promise<boolean> | boolean,
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
