import {
  ThriftFullProtocolType,
  ThriftPresets,
  ThriftProtocolFactory,
} from "./thrift-protocol.factory";
import { IFieldMeta, Packet, thrift } from "./thrift_packet";

/**
 * 将IP地址字符串转换为32位整数
 * 例如: "192.168.1.1" -> 3232235777
 */
export function ipStringToNumber(ipString: string): number {
  const parts = ipString.split(".");
  if (parts.length !== 4) {
    throw new Error(`无效的IP地址格式: ${ipString}`);
  }

  const octets = parts.map((part) => {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) {
      throw new Error(`无效的IP八位组: ${part} (必须是0-255之间的数字)`);
    }
    return num;
  });

  return (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
}

/**
 * 获取构建的报文
 * 使用配置的 Thrift 协议类型序列化报文
 */
export function packet_thrift_buffer_build(
  fieldList: IFieldMeta[],
  protocolType: ThriftFullProtocolType = ThriftPresets.DEFAULT,
): Buffer {
  let capturedFlushBuffer: Buffer | null = null;
  const factory = new ThriftProtocolFactory(thrift);
  const { transport, protocol } = factory.createByFullType(
    protocolType,
    (msg: Buffer) => {
      capturedFlushBuffer = msg;
    },
  );

  const packet = new Packet({
    field_list: fieldList,
  });

  // 执行写入操作
  packet.write(protocol);
  if (typeof transport.flush === "function") {
    transport.flush();
  }

  return capturedFlushBuffer || Buffer.alloc(0);
}

/**
 * 解析策略定义
 */
interface IParseStrategy {
  /** 策略名称 */
  name: string;
  /** 协议类型 */
  protocolType: ThriftFullProtocolType;
  /** 是否需要剥离帧头 */
  stripFrame: boolean;
  /** 帧头字节序 */
  byteOrder?: "big" | "little";
  /** 帧头长度 */
  framePrefixLen?: number;
}

export const PARSE_STRATEGIES: IParseStrategy[] = [
  // 策略 1: Framed + Compact (big-endian)
  {
    name: "compact-framed-be-4byte",
    protocolType: ThriftFullProtocolType.FRAMED_COMPACT,
    stripFrame: true,
    byteOrder: "big",
    framePrefixLen: 4,
  },
  // 策略 2: Framed + Compact (little-endian)
  {
    name: "compact-framed-le-4byte",
    protocolType: ThriftFullProtocolType.FRAMED_COMPACT,
    stripFrame: true,
    byteOrder: "little",
    framePrefixLen: 4,
  },
  // 策略 3: Framed + Binary (big-endian)
  {
    name: "binary-framed-be-4byte",
    protocolType: ThriftFullProtocolType.FRAMED_BINARY,
    stripFrame: true,
    byteOrder: "big",
    framePrefixLen: 4,
  },
  // 策略 4: Framed + Binary (little-endian)
  {
    name: "binary-framed-le-4byte",
    protocolType: ThriftFullProtocolType.FRAMED_BINARY,
    stripFrame: true,
    byteOrder: "little",
    framePrefixLen: 4,
  },
  // 策略 5: Buffered + Compact (无帧)
  {
    name: "compact-as-is",
    protocolType: ThriftFullProtocolType.BUFFERED_COMPACT,
    stripFrame: false,
  },
  // 策略 6: Buffered + Binary (无帧)
  {
    name: "binary-as-is",
    protocolType: ThriftFullProtocolType.BUFFERED_BINARY,
    stripFrame: false,
  },
];

/** 比较单个字段的期望值与实际值；不一致时输出单行提示。仅当期望值已设置时才比较(与原逻辑一致) */
function fieldEq(label: string, expected: any, actual: any): boolean {
  if (expected !== undefined && expected !== null && expected !== actual) {
    console.log(`[mismatch] ${label}: expected=${expected}, actual=${actual}`);
    return false;
  }
  return true;
}

// 报文字段匹配函数（由 PacketChecker.fieldsMatch 分发调用，逐一比较期望字段与实际捕获字段）

/**
 * 比较 EthernetII 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchEthernetII(field: any, actualField: any): boolean {
  if (field.ether == null || actualField.ether == null) {
    console.log("EthernetII field is null.");
    return false;
  }
  return (
    fieldEq("EthernetII.type", field.ether.type, actualField.ether.type) &&
    fieldEq("EthernetII.dst", field.ether.dst, actualField.ether.dst) &&
    fieldEq("EthernetII.src", field.ether.src, actualField.ether.src)
  );
}

/**
 * 比较 VLAN 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchVLAN(field: any, actualField: any): boolean {
  if (field.vlan == null || actualField.vlan == null) {
    console.log("VLAN field is null.");
    return false;
  }
  return (
    fieldEq("VLAN.prio", field.vlan.prio, actualField.vlan.prio) &&
    fieldEq("VLAN.dei", field.vlan.dei, actualField.vlan.dei) &&
    fieldEq("VLAN.vlan", field.vlan.vlan, actualField.vlan.vlan) &&
    fieldEq("VLAN.type", field.vlan.type, actualField.vlan.type)
  );
}

/**
 * 比较 IPv4 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchIPv4(field: any, actualField: any): boolean {
  if (field.ipv4 == null || actualField.ipv4 == null) {
    console.log("IPv4 field is null.");
    return false;
  }
  return (
    fieldEq("IPv4.version", field.ipv4.version, actualField.ipv4.version) &&
    fieldEq("IPv4.ihl", field.ipv4.ihl, actualField.ipv4.ihl) &&
    fieldEq("IPv4.tos", field.ipv4.tos, actualField.ipv4.tos) &&
    fieldEq("IPv4.len", field.ipv4.len, actualField.ipv4.len) &&
    fieldEq("IPv4.id", field.ipv4.id, actualField.ipv4.id) &&
    fieldEq("IPv4.frag", field.ipv4.frag, actualField.ipv4.frag) &&
    fieldEq("IPv4.flags", field.ipv4.flags, actualField.ipv4.flags) &&
    fieldEq("IPv4.ttl", field.ipv4.ttl, actualField.ipv4.ttl) &&
    fieldEq("IPv4.proto", field.ipv4.proto, actualField.ipv4.proto) &&
    fieldEq("IPv4.chksum", field.ipv4.chksum, actualField.ipv4.chksum) &&
    fieldEq("IPv4.src", field.ipv4.src, actualField.ipv4.src) &&
    fieldEq("IPv4.dst", field.ipv4.dst, actualField.ipv4.dst) &&
    fieldEq("IPv4.option", field.ipv4.option, actualField.ipv4.option)
  );
}

/**
 * 比较 IPv6 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchIPv6(field: any, actualField: any): boolean {
  if (field.ipv6 == null || actualField.ipv6 == null) {
    console.log("IPv6 field is null.");
    return false;
  }
  return (
    fieldEq("IPv6.version", field.ipv6.version, actualField.ipv6.version) &&
    fieldEq("IPv6.tc", field.ipv6.tc, actualField.ipv6.tc) &&
    fieldEq("IPv6.fl", field.ipv6.fl, actualField.ipv6.fl) &&
    fieldEq("IPv6.plen", field.ipv6.plen, actualField.ipv6.plen) &&
    fieldEq("IPv6.nh", field.ipv6.nh, actualField.ipv6.nh) &&
    fieldEq("IPv6.hlim", field.ipv6.hlim, actualField.ipv6.hlim) &&
    fieldEq("IPv6.src", field.ipv6.src, actualField.ipv6.src) &&
    fieldEq("IPv6.dst", field.ipv6.dst, actualField.ipv6.dst)
  );
}

/**
 * 比较 TCP 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchTCP(field: any, actualField: any): boolean {
  if (field.tcp == null || actualField.tcp == null) {
    console.log("TCP field is null.");
    return false;
  }
  return (
    fieldEq("TCP.sport", field.tcp.sport, actualField.tcp.sport) &&
    fieldEq("TCP.dport", field.tcp.dport, actualField.tcp.dport) &&
    fieldEq("TCP.seq", field.tcp.seq, actualField.tcp.seq) &&
    fieldEq("TCP.ack", field.tcp.ack, actualField.tcp.ack) &&
    fieldEq("TCP.dataofs", field.tcp.dataofs, actualField.tcp.dataofs) &&
    fieldEq("TCP.rsv", field.tcp.rsv, actualField.tcp.rsv) &&
    fieldEq("TCP.flags", field.tcp.flags, actualField.tcp.flags) &&
    fieldEq("TCP.window", field.tcp.window, actualField.tcp.window) &&
    fieldEq("TCP.chksum", field.tcp.chksum, actualField.tcp.chksum) &&
    fieldEq("TCP.urgptr", field.tcp.urgptr, actualField.tcp.urgptr) &&
    fieldEq("TCP.option", field.tcp.option, actualField.tcp.option)
  );
}

/**
 * 比较 UDP 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchUDP(field: any, actualField: any): boolean {
  if (field.udp == null || actualField.udp == null) {
    console.log("UDP field is null.");
    return false;
  }
  return (
    fieldEq("UDP.sport", field.udp.sport, actualField.udp.sport) &&
    fieldEq("UDP.dport", field.udp.dport, actualField.udp.dport) &&
    fieldEq("UDP.len", field.udp.len, actualField.udp.len) &&
    fieldEq("UDP.chksum", field.udp.chksum, actualField.udp.chksum)
  );
}

/**
 * 比较 ICMP 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchICMP(field: any, actualField: any): boolean {
  if (field.icmp == null || actualField.icmp == null) {
    console.log("ICMP field is null.");
    return false;
  }
  return (
    fieldEq("ICMP.type", field.icmp.type, actualField.icmp.type) &&
    fieldEq("ICMP.code", field.icmp.code, actualField.icmp.code) &&
    fieldEq("ICMP.chksum", field.icmp.chksum, actualField.icmp.chksum) &&
    fieldEq("ICMP.id", field.icmp.id, actualField.icmp.id) &&
    fieldEq("ICMP.seq", field.icmp.seq, actualField.icmp.seq)
  );
}

/**
 * 比较 ARP 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchARP(field: any, actualField: any): boolean {
  if (field.arp == null || actualField.arp == null) {
    console.log("ARP field is null.");
    return false;
  }
  return (
    fieldEq("ARP.hwtype", field.arp.hwtype, actualField.arp.hwtype) &&
    fieldEq("ARP.ptype", field.arp.ptype, actualField.arp.ptype) &&
    fieldEq("ARP.hwlen", field.arp.hwlen, actualField.arp.hwlen) &&
    fieldEq("ARP.plen", field.arp.plen, actualField.arp.plen) &&
    fieldEq("ARP.op", field.arp.op, actualField.arp.op) &&
    fieldEq("ARP.hwsrc", field.arp.hwsrc, actualField.arp.hwsrc) &&
    fieldEq("ARP.psrc", field.arp.psrc, actualField.arp.psrc) &&
    fieldEq("ARP.hwdst", field.arp.hwdst, actualField.arp.hwdst) &&
    fieldEq("ARP.pdst", field.arp.pdst, actualField.arp.pdst)
  );
}

/**
 * 比较 Raw 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchRaw(field: any, actualField: any): boolean {
  if (field.raw == null || actualField.raw == null) {
    console.log("RAW field is null.");
    return false;
  }
  if (field.raw.payload !== actualField.raw.payload) {
    console.log(
      `[mismatch] RAW.payload: expected=${field.raw.payload}, actual=${actualField.raw.payload}`,
    );
    return false;
  }
  return true;
}

/**
 * 比较 Dot3 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchDot3(field: any, actualField: any): boolean {
  if (field.dot3 == null || actualField.dot3 == null) {
    console.log("Dot3 field is null.");
    return false;
  }
  return (
    fieldEq("Dot3.dst", field.dot3.dst, actualField.dot3.dst) &&
    fieldEq("Dot3.src", field.dot3.src, actualField.dot3.src) &&
    fieldEq("Dot3.len", field.dot3.len, actualField.dot3.len)
  );
}

/**
 * 比较 LLC 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchLLC(field: any, actualField: any): boolean {
  if (field.llc == null || actualField.llc == null) {
    console.log("LLC field is null.");
    return false;
  }
  return (
    fieldEq("LLC.dsap", field.llc.dsap, actualField.llc.dsap) &&
    fieldEq("LLC.ssap", field.llc.ssap, actualField.llc.ssap) &&
    fieldEq("LLC.ctrl", field.llc.ctrl, actualField.llc.ctrl)
  );
}

/**
 * 比较 SNMP 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchSNMP(field: any, actualField: any): boolean {
  if (field.snmp == null || actualField.snmp == null) {
    console.log("SNMP field is null.");
    return false;
  }
  const snmp = field.snmp;
  const actualSnmp = actualField.snmp;

  if (!fieldEq("SNMP.version", snmp.version, actualSnmp.version)) return false;
  if (!fieldEq("SNMP.community", snmp.community, actualSnmp.community))
    return false;
  if (!fieldEq("SNMP.pdu_type", snmp.pdu_type, actualSnmp.pdu_type))
    return false;
  if (!fieldEq("SNMP.request_id", snmp.request_id, actualSnmp.request_id))
    return false;

  // varbinds 列表比较
  if (snmp.varbinds && snmp.varbinds.length > 0) {
    if (
      !actualSnmp.varbinds ||
      snmp.varbinds.length !== actualSnmp.varbinds.length
    ) {
      console.log(
        `[mismatch] SNMP.varbinds length: expected=${snmp.varbinds.length}, actual=${
          actualSnmp.varbinds ? actualSnmp.varbinds.length : 0
        }`,
      );
      return false;
    }

    for (let i = 0; i < snmp.varbinds.length; i++) {
      const expectedVb = snmp.varbinds[i];
      const actualVb = actualSnmp.varbinds[i];
      if (!fieldEq(`SNMP.varbinds[${i}].oid`, expectedVb.oid, actualVb.oid))
        return false;
      if (
        expectedVb.value !== undefined &&
        expectedVb.value !== null &&
        expectedVb.value !== actualVb.value
      ) {
        console.log(
          `[mismatch] SNMP.varbinds[${i}].value: expected=${expectedVb.value}, actual=${actualVb.value}`,
        );
        return false;
      }
      if (
        !fieldEq(
          `SNMP.varbinds[${i}].value_type`,
          expectedVb.value_type,
          actualVb.value_type,
        )
      )
        return false;
    }
  }

  if (!fieldEq("SNMP.error", snmp.error, actualSnmp.error)) return false;
  if (!fieldEq("SNMP.error_index", snmp.error_index, actualSnmp.error_index))
    return false;
  if (!fieldEq("SNMP.enterprise", snmp.enterprise, actualSnmp.enterprise))
    return false;
  if (!fieldEq("SNMP.agent_addr", snmp.agent_addr, actualSnmp.agent_addr))
    return false;
  if (!fieldEq("SNMP.generic_trap", snmp.generic_trap, actualSnmp.generic_trap))
    return false;
  if (
    !fieldEq("SNMP.specific_trap", snmp.specific_trap, actualSnmp.specific_trap)
  )
    return false;

  // time_stamp 为 i64，反序列化后是 Int64 对象，统一转为 number 比较
  if (snmp.time_stamp) {
    const expectedTime =
      typeof snmp.time_stamp.toNumber === "function"
        ? snmp.time_stamp.toNumber()
        : snmp.time_stamp;
    const actualTime =
      typeof actualSnmp.time_stamp?.toNumber === "function"
        ? actualSnmp.time_stamp.toNumber()
        : actualSnmp.time_stamp;
    if (expectedTime !== actualTime) {
      console.log(
        `[mismatch] SNMP.time_stamp: expected=${expectedTime}, actual=${actualTime}`,
      );
      return false;
    }
  }

  if (
    !fieldEq("SNMP.non_repeaters", snmp.non_repeaters, actualSnmp.non_repeaters)
  )
    return false;
  if (
    !fieldEq(
      "SNMP.max_repetitions",
      snmp.max_repetitions,
      actualSnmp.max_repetitions,
    )
  )
    return false;

  return true;
}

// ---- 紧凑打印 pkt_list：每个报文一层一行，过滤 null 字段 ----
function compactValue(v: any): string {
  if (v == null) return "";
  if (Array.isArray(v)) return `[${v.map(compactValue).join(", ")}]`;
  if (typeof v === "object") {
    if (v.type === "Buffer") return `<Buffer:${v.data?.length ?? 0}B>`;
    const parts: string[] = [];
    for (const [k, val] of Object.entries(v)) {
      const s = compactValue(val);
      if (s) parts.push(`${k}=${s}`);
    }
    return `{${parts.join(" ")}}`;
  }
  if (typeof v === "string" && /[\u0000-\u001f]/.test(v))
    return `<bytes:${v.length}>`; // 控制字符(如 agent_addr)只留长度
  return String(v);
}

/** 提取 field 中唯一非空的协议层，格式化为 name({k=v ...}) */
function formatField(f: any): string {
  for (const [name, layer] of Object.entries(f?.field ?? {})) {
    if (layer != null) return `${name}(${compactValue(layer)})`;
  }
  return "";
}

/** 每个报文一层一行（首层与 [i] 同行，后续层缩进 4 空格） */
export function formatPktList(pktList: any[]): string {
  return pktList
    .map((pkt, i) => {
      const layers = (pkt?.field_list ?? []).map(formatField).filter(Boolean);
      if (layers.length === 0) return `[${i}] (empty)`;
      const [first, ...rest] = layers;
      return `[${i}] ${first}\n${rest.map((l: string) => `    ${l}`).join("\n")}`;
    })
    .join("\n");
}
