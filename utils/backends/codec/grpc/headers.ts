/**
 * PacketSpec -> packet.proto HeaderInstance 映射。
 *
 * 用于 streamcontrol gRPC 后端：把 PacketBuilder 的中立报文层转换为
 * StreamTemplate.headers，由 gateway 生成 YAML layers/fields，引擎在 Start 前应用。
 *
 * 字段名来自 ExtensionService.ListHeaderTypes（2026-11-14 实测网关），不是猜的。
 * Dot3 / LLC / SNMP 已按新 HeaderType 映射；带 RAW payload 的 Dot3 发送仍走
 * 原始帧（RAW 没有对应 HeaderType）。
 */

import {
  PacketLayer,
  PacketSpec,
  FieldType,
  type HeaderOption,
} from "../../../packet/model";
import {
  ModifierField,
  ModifierMode,
  PacketModifierParam,
} from "../../../packet/types";
import {
  ipv4ToBuffer,
  ipv6ToBuffer,
  macToBuffer,
} from "../../../packet/address";

export const HeaderType = {
  ETHERNET: 1,
  VLAN: 2,
  IPV4: 3,
  IPV6: 4,
  TCP: 5,
  UDP: 6,
  GRE: 7,
  MPLS: 8,
  CUSTOM: 9,
  ARP: 10,
  ICMP: 11,
  ICMPV6: 12,
  RAW: 13,
  DOT3: 14,
  LLC: 15,
  SNAP: 16,
  SNMP: 17,
} as const;

export interface PacketFieldValue {
  u64?: number | string;
  raw?: Buffer;
}

export interface PacketFieldModifier {
  kind: number;
  scope: number;
  start?: PacketFieldValue;
  step?: PacketFieldValue;
  end?: PacketFieldValue;
  list?: PacketFieldValue[];
  count?: number;
  offset?: number;
  mask?: number;
  mask_raw?: Buffer;
  seed?: number;
  repeat?: boolean;
  contain_repeat?: boolean;
}

export interface PacketField {
  name: string;
  legacy_name?: string;
  fixed?: PacketFieldValue;
  modifier?: PacketFieldModifier;
}

/** 已归一化的 IP/TCP option；data 不包含 type/length */
export interface HeaderOptionInstance {
  type: number;
  data?: Buffer;
}

export interface HeaderInstance {
  type: number;
  name?: string;
  index?: number;
  header_length?: number;
  fields: PacketField[];
  /** 仅 IPv4/TCP（以及 IPv6 扩展头）使用；由引擎生成 length/对齐并修正 IHL/data_off */
  options?: HeaderOptionInstance[];
  /** 动态自定义层名；普通 HeaderType 留空 */
  proto_name?: string;
}

function decodeOptionHex(hex: string, label: string): Buffer {
  const normalized =
    hex.startsWith("0x") || hex.startsWith("0X") ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) {
    throw new Error(`[streamcontrol] ${label} option data 必须是偶数长度 hex`);
  }
  if (!/^[0-9a-fA-F]*$/.test(normalized)) {
    throw new Error(`[streamcontrol] ${label} option data 含非 hex 字符`);
  }
  return Buffer.from(normalized, "hex");
}

/**
 * 把 PacketBuilder 的 options 数组归一化成 HeaderOptionInstance[]。
 * 兼容旧字段时给出明确错误，避免“看起来配置了但没发出去”。
 */
function normalizeHeaderOptions(
  raw: HeaderOption[] | number | Buffer | undefined,
  label: string,
): HeaderOptionInstance[] | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw)) {
    throw new Error(
      `[streamcontrol] ${label} options 现在需要数组，例如 ` +
        `[{ type: 148, data: "0000" }]；旧的 number/Buffer 形式不再支持`,
    );
  }
  if (raw.length === 0) return undefined;

  let wireLength = 0;
  const options = raw.map((option, index) => {
    if (!option || typeof option !== "object") {
      throw new Error(`[streamcontrol] ${label} options[${index}] 必须是对象`);
    }
    const type = Number(option.type);
    if (!Number.isInteger(type) || type < 0 || type > 255) {
      throw new Error(
        `[streamcontrol] ${label} options[${index}].type 必须在 0..255`,
      );
    }

    let data: Buffer | undefined;
    if (typeof option.data === "string") {
      data = decodeOptionHex(option.data, label);
    } else if (Buffer.isBuffer(option.data)) {
      data = Buffer.from(option.data);
    } else if (option.data !== undefined && option.data !== null) {
      throw new Error(
        `[streamcontrol] ${label} options[${index}].data 必须是 Buffer 或 hex 字符串`,
      );
    }

    // EOL(0)/NOP(1) 只有 1 字节；SACK permitted(4) 没有 data。
    if ((type === 0 || type === 1 || type === 4) && data && data.length > 0) {
      throw new Error(
        `[streamcontrol] ${label} option type=${type} 不应该带 data`,
      );
    }
    wireLength += type === 0 || type === 1 ? 1 : 2 + (data?.length ?? 0);
    return { type, data };
  });

  const padded = Math.ceil(wireLength / 4) * 4;
  if (padded > 40) {
    throw new Error(
      `[streamcontrol] ${label} options 对齐后 ${padded}B，超过 40B 上限`,
    );
  }
  return options;
}

/** option 在报文里占用的字节数（含 4 字节对齐） */
export function headerOptionBytesLength(
  options?: HeaderOptionInstance[],
): number {
  if (!options || options.length === 0) return 0;
  let wireLength = 0;
  for (const option of options) {
    wireLength +=
      option.type === 0 || option.type === 1
        ? 1
        : 2 + (option.data?.length ?? 0);
  }
  return Math.ceil(wireLength / 4) * 4;
}

const SHORT_NAME: Record<number, string> = {
  [HeaderType.ETHERNET]: "ethernet",
  [HeaderType.VLAN]: "vlan",
  [HeaderType.IPV4]: "ipv4",
  [HeaderType.IPV6]: "ipv6",
  [HeaderType.TCP]: "tcp",
  [HeaderType.UDP]: "udp",
  [HeaderType.ARP]: "arp",
  [HeaderType.ICMP]: "icmp",
  [HeaderType.ICMPV6]: "icmpv6",
  [HeaderType.DOT3]: "dot3",
  [HeaderType.LLC]: "llc",
  [HeaderType.SNAP]: "snap",
  [HeaderType.SNMP]: "snmp",
};

const LAYER_TO_HEADER: Partial<Record<FieldType, number>> = {
  [FieldType.EthernetII]: HeaderType.ETHERNET,
  [FieldType.VLAN]: HeaderType.VLAN,
  [FieldType.IPv4]: HeaderType.IPV4,
  [FieldType.IPv6]: HeaderType.IPV6,
  [FieldType.TCP]: HeaderType.TCP,
  [FieldType.UDP]: HeaderType.UDP,
  [FieldType.ARP]: HeaderType.ARP,
  [FieldType.ICMP]: HeaderType.ICMP,
  [FieldType.Dot3]: HeaderType.DOT3,
  [FieldType.LLC]: HeaderType.LLC,
  [FieldType.SNAP]: HeaderType.SNAP,
  [FieldType.SNMP]: HeaderType.SNMP,
};

const UNSUPPORTED_LAYERS: Partial<Record<FieldType, string>> = {
  [FieldType.RAW]: "RAW",
};

const MODIFIER_KIND: Record<ModifierMode, number> = {
  [ModifierMode.Increment]: 2,
  [ModifierMode.Decrement]: 3,
  [ModifierMode.Random]: 4,
};

const MODIFIER_SCOPE_FRAME = 1;

type ValueKind = "mac" | "ipv4" | "u64";

interface ModifierTarget {
  layerType: FieldType;
  headerType: number;
  fieldName: string;
  valueKind: ValueKind;
}

const MODIFIER_TARGETS: Record<number, ModifierTarget> = {
  [ModifierField.EthernetII_MAC_SRC]: {
    layerType: FieldType.EthernetII,
    headerType: HeaderType.ETHERNET,
    fieldName: "src",
    valueKind: "mac",
  },
  [ModifierField.EthernetII_MAC_DST]: {
    layerType: FieldType.EthernetII,
    headerType: HeaderType.ETHERNET,
    fieldName: "dst",
    valueKind: "mac",
  },
  [ModifierField.IPv4_IP_SRC]: {
    layerType: FieldType.IPv4,
    headerType: HeaderType.IPV4,
    fieldName: "src",
    valueKind: "ipv4",
  },
  [ModifierField.IPv4_IP_DST]: {
    layerType: FieldType.IPv4,
    headerType: HeaderType.IPV4,
    fieldName: "dst",
    valueKind: "ipv4",
  },
  [ModifierField.TCP_PORT_SRC]: {
    layerType: FieldType.TCP,
    headerType: HeaderType.TCP,
    fieldName: "src_port",
    valueKind: "u64",
  },
  [ModifierField.TCP_PORT_DST]: {
    layerType: FieldType.TCP,
    headerType: HeaderType.TCP,
    fieldName: "dst_port",
    valueKind: "u64",
  },
  [ModifierField.UDP_PORT_SRC]: {
    layerType: FieldType.UDP,
    headerType: HeaderType.UDP,
    fieldName: "src_port",
    valueKind: "u64",
  },
  [ModifierField.UDP_PORT_DST]: {
    layerType: FieldType.UDP,
    headerType: HeaderType.UDP,
    fieldName: "dst_port",
    valueKind: "u64",
  },
  [ModifierField.Dot3_MAC_SRC]: {
    layerType: FieldType.Dot3,
    headerType: HeaderType.DOT3,
    fieldName: "src",
    valueKind: "mac",
  },
  [ModifierField.Dot3_MAC_DST]: {
    layerType: FieldType.Dot3,
    headerType: HeaderType.DOT3,
    fieldName: "dst",
    valueKind: "mac",
  },
};

function u64(value: number | string): PacketFieldValue {
  return { u64: value };
}

function raw(value: Buffer): PacketFieldValue {
  return { raw: value };
}

function parseValue(kind: ValueKind, value: string | number): PacketFieldValue {
  switch (kind) {
    case "mac":
      return raw(macToBuffer(String(value)));
    case "ipv4":
      return raw(ipv4ToBuffer(String(value)));
    default:
      return u64(Number(value));
  }
}

function toModifier(
  param: PacketModifierParam,
  kind: ValueKind,
): PacketFieldModifier {
  const modifier: PacketFieldModifier = {
    kind: MODIFIER_KIND[param.mode] ?? 2,
    scope: MODIFIER_SCOPE_FRAME,
    start: parseValue(kind, param.start_value),
    count: param.count,
  };
  if (param.end_value !== undefined) {
    modifier.end = parseValue(kind, param.end_value);
  }
  if (param.step !== undefined) {
    modifier.step = u64(param.step);
  }
  return modifier;
}

/** 把 modifier_param 按 层+字段 建索引，映射时替换同名 fixed 字段 */
function buildModifierIndex(modifiers: PacketModifierParam[] = []): {
  map: Map<string, { param: PacketModifierParam; target: ModifierTarget }>;
} {
  const map = new Map<
    string,
    { param: PacketModifierParam; target: ModifierTarget }
  >();
  for (const param of modifiers) {
    const target = MODIFIER_TARGETS[param.modifier_field];
    if (!target) continue;
    map.set(`${target.layerType}:${target.fieldName}`, { param, target });
  }
  return { map };
}

function addFixed(
  fields: PacketField[],
  name: string,
  value: PacketFieldValue | undefined,
  modifiers: ReturnType<typeof buildModifierIndex>,
  layerType: FieldType,
): void {
  const modifier = modifiers.map.get(`${layerType}:${name}`);
  if (modifier) {
    fields.push({
      name,
      modifier: toModifier(modifier.param, modifier.target.valueKind),
    });
    return;
  }
  if (value !== undefined) fields.push({ name, fixed: value });
}

function ethernetFields(
  field: any,
  modifiers: ReturnType<typeof buildModifierIndex>,
): PacketField[] {
  const fields: PacketField[] = [];
  if (field.dst != null) {
    addFixed(
      fields,
      "dst",
      raw(macToBuffer(field.dst)),
      modifiers,
      FieldType.EthernetII,
    );
  }
  if (field.src != null) {
    addFixed(
      fields,
      "src",
      raw(macToBuffer(field.src)),
      modifiers,
      FieldType.EthernetII,
    );
  }
  if (field.type != null) {
    addFixed(
      fields,
      "ethertype",
      u64(field.type),
      modifiers,
      FieldType.EthernetII,
    );
  }
  return fields;
}

function vlanFields(
  field: any,
  modifiers: ReturnType<typeof buildModifierIndex>,
): PacketField[] {
  const fields: PacketField[] = [];
  const add = (name: string, value: any) => {
    if (value != null)
      addFixed(fields, name, u64(value), modifiers, FieldType.VLAN);
  };
  add("pcp", field.prio);
  add("dei", field.dei);
  add("vid", field.vlan);
  add("ethertype", field.type);
  return fields;
}

function ipv4Fields(
  field: any,
  modifiers: ReturnType<typeof buildModifierIndex>,
): PacketField[] {
  const fields: PacketField[] = [];
  const add = (name: string, value: any) => {
    if (value != null)
      addFixed(fields, name, u64(value), modifiers, FieldType.IPv4);
  };
  add("version", field.version);
  add("ihl", field.ihl);
  if (field.tos != null) {
    add("dscp", (field.tos >> 2) & 0x3f);
    add("ecn", field.tos & 0x03);
  }
  add("total_len", field.len);
  add("id", field.id);
  if (field.frag != null) {
    add("flags", (field.frag >> 13) & 0x07);
    add("frag_off", field.frag & 0x1fff);
  }
  add("ttl", field.ttl);
  add("proto", field.proto);
  add("csum", field.chksum);
  if (field.src != null) {
    addFixed(
      fields,
      "src",
      raw(ipv4ToBuffer(field.src)),
      modifiers,
      FieldType.IPv4,
    );
  }
  if (field.dst != null) {
    addFixed(
      fields,
      "dst",
      raw(ipv4ToBuffer(field.dst)),
      modifiers,
      FieldType.IPv4,
    );
  }
  return fields;
}

function ipv6Fields(
  field: any,
  modifiers: ReturnType<typeof buildModifierIndex>,
): PacketField[] {
  const fields: PacketField[] = [];
  const add = (name: string, value: any) => {
    if (value != null)
      addFixed(fields, name, u64(value), modifiers, FieldType.IPv6);
  };
  add("version", field.version);
  add("traffic_class", field.tc);
  add("flow_label", field.fl);
  add("payload_len", field.plen);
  add("next_header", field.nh);
  add("hop_limit", field.hlim);
  if (field.src != null) {
    addFixed(
      fields,
      "src",
      raw(ipv6ToBuffer(field.src)),
      modifiers,
      FieldType.IPv6,
    );
  }
  if (field.dst != null) {
    addFixed(
      fields,
      "dst",
      raw(ipv6ToBuffer(field.dst)),
      modifiers,
      FieldType.IPv6,
    );
  }
  return fields;
}

const TCP_FLAG_FIELDS: Array<[string, number]> = [
  ["ns", 0x100],
  ["cwr", 0x80],
  ["ece", 0x40],
  ["urg", 0x20],
  ["ack_flag", 0x10],
  ["psh", 0x08],
  ["rst", 0x04],
  ["syn", 0x02],
  ["fin", 0x01],
];

function tcpFields(
  field: any,
  modifiers: ReturnType<typeof buildModifierIndex>,
): PacketField[] {
  const fields: PacketField[] = [];
  const add = (name: string, value: any) => {
    if (value != null)
      addFixed(fields, name, u64(value), modifiers, FieldType.TCP);
  };
  if (field.sport != null) {
    addFixed(fields, "src_port", u64(field.sport), modifiers, FieldType.TCP);
  }
  if (field.dport != null) {
    addFixed(fields, "dst_port", u64(field.dport), modifiers, FieldType.TCP);
  }
  add("seq", field.seq);
  add("ack", field.ack);
  add("data_off", field.dataofs);
  add("reserved", field.rsv);
  if (field.flags != null) {
    for (const [name, bit] of TCP_FLAG_FIELDS) {
      if ((field.flags & bit) !== 0) add(name, 1);
    }
  }
  add("window", field.window);
  add("csum", field.chksum);
  add("urg_ptr", field.urgptr);
  return fields;
}

function udpFields(
  field: any,
  modifiers: ReturnType<typeof buildModifierIndex>,
): PacketField[] {
  const fields: PacketField[] = [];
  if (field.sport != null) {
    addFixed(fields, "src_port", u64(field.sport), modifiers, FieldType.UDP);
  }
  if (field.dport != null) {
    addFixed(fields, "dst_port", u64(field.dport), modifiers, FieldType.UDP);
  }
  if (field.len != null) {
    addFixed(fields, "len", u64(field.len), modifiers, FieldType.UDP);
  }
  if (field.chksum != null) {
    addFixed(fields, "csum", u64(field.chksum), modifiers, FieldType.UDP);
  }
  return fields;
}

function icmpFields(
  field: any,
  modifiers: ReturnType<typeof buildModifierIndex>,
): PacketField[] {
  const fields: PacketField[] = [];
  const add = (name: string, value: any) => {
    if (value != null)
      addFixed(fields, name, u64(value), modifiers, FieldType.ICMP);
  };
  add("type", field.type);
  add("code", field.code);
  add("csum", field.chksum);
  add("id", field.id);
  add("seq", field.seq);
  return fields;
}

function arpFields(
  field: any,
  modifiers: ReturnType<typeof buildModifierIndex>,
): PacketField[] {
  const fields: PacketField[] = [];
  const add = (name: string, value: any) => {
    if (value != null)
      addFixed(fields, name, u64(value), modifiers, FieldType.ARP);
  };
  add("hw_type", field.hwtype);
  add("proto_type", field.ptype);
  add("hw_len", field.hwlen);
  add("proto_len", field.plen);
  add("opcode", field.op);
  if (field.hwsrc != null) {
    addFixed(
      fields,
      "sender_mac",
      raw(macToBuffer(field.hwsrc)),
      modifiers,
      FieldType.ARP,
    );
  }
  if (field.psrc != null) {
    addFixed(
      fields,
      "sender_ip",
      raw(ipv4ToBuffer(field.psrc)),
      modifiers,
      FieldType.ARP,
    );
  }
  if (field.hwdst != null) {
    addFixed(
      fields,
      "target_mac",
      raw(macToBuffer(field.hwdst)),
      modifiers,
      FieldType.ARP,
    );
  }
  if (field.pdst != null) {
    addFixed(
      fields,
      "target_ip",
      raw(ipv4ToBuffer(field.pdst)),
      modifiers,
      FieldType.ARP,
    );
  }
  return fields;
}

function dot3Fields(
  field: any,
  modifiers: ReturnType<typeof buildModifierIndex>,
): PacketField[] {
  const fields: PacketField[] = [];
  if (field.dst != null) {
    addFixed(
      fields,
      "dst",
      raw(macToBuffer(field.dst)),
      modifiers,
      FieldType.Dot3,
    );
  }
  if (field.src != null) {
    addFixed(
      fields,
      "src",
      raw(macToBuffer(field.src)),
      modifiers,
      FieldType.Dot3,
    );
  }
  // length 由引擎 seal 按实际 MAC client data 长度回填。
  // 当前引擎不允许显式编辑 length 字段（TrafficService.Start 会返回 code=102）。
  return fields;
}

function llcFields(
  field: any,
  modifiers: ReturnType<typeof buildModifierIndex>,
): PacketField[] {
  const fields: PacketField[] = [];
  const add = (name: string, value: any) => {
    if (value != null)
      addFixed(fields, name, u64(value), modifiers, FieldType.LLC);
  };
  add("dsap", field.dsap);
  add("ssap", field.ssap);
  add("control", field.ctrl);
  return fields;
}

function snapFields(
  field: any,
  modifiers: ReturnType<typeof buildModifierIndex>,
): PacketField[] {
  const fields: PacketField[] = [];
  const oui = Number(field.oui ?? 0) & 0xffffff;
  const ouiBytes = Buffer.from([
    (oui >> 16) & 0xff,
    (oui >> 8) & 0xff,
    oui & 0xff,
  ]);
  addFixed(fields, "oui", raw(ouiBytes), modifiers, FieldType.SNAP);
  if (field.pid != null) {
    addFixed(
      fields,
      "pid",
      u64(Number(field.pid) & 0xffff),
      modifiers,
      FieldType.SNAP,
    );
  }
  return fields;
}

/** BER OID 内容（不含 06/len），用于 SNMP 固定模板的 8 字节 oid */
function encodeOidContent(oid: string): Buffer {
  const parts = oid.split(".").map((p) => parseInt(p, 10));
  if (parts.length < 2 || parts.some((p) => !Number.isInteger(p) || p < 0)) {
    throw new Error(`[streamcontrol] 无效的 SNMP OID: ${oid}`);
  }
  const out: number[] = [40 * parts[0] + parts[1]];
  for (const part of parts.slice(2)) {
    const stack: number[] = [part & 0x7f];
    let v = part >> 7;
    while (v > 0) {
      stack.unshift((v & 0x7f) | 0x80);
      v >>= 7;
    }
    out.push(...stack);
  }
  return Buffer.from(out);
}

function padBytes(bytes: Buffer, width: number, label: string): Buffer {
  if (bytes.length > width) {
    throw new Error(
      `[streamcontrol] SNMP ${label} 超过固定模板宽度 ${width}B（给了 ${bytes.length}B）`,
    );
  }
  const out = Buffer.alloc(width);
  bytes.copy(out, 0, 0, Math.min(bytes.length, width));
  return out;
}

function snmpFields(
  field: any,
  modifiers: ReturnType<typeof buildModifierIndex>,
): PacketField[] {
  const varbinds = Array.isArray(field.varbinds) ? field.varbinds : [];
  if (varbinds.length === 0) {
    throw new Error("[streamcontrol] SNMP 固定模板需要一个 varbind（oid）");
  }
  const pdu = Number(field.pdu_type ?? 0);
  if (pdu !== 0 && pdu !== 1) {
    throw new Error(
      `[streamcontrol] SNMP 固定模板只支持 Get(0)/GetNext(1)，收到 pdu_type=${pdu}`,
    );
  }

  const fields: PacketField[] = [];
  const add = (name: string, value: any) => {
    if (value != null)
      addFixed(fields, name, u64(value), modifiers, FieldType.SNMP);
  };
  const addRaw = (name: string, value: Buffer) => {
    addFixed(fields, name, raw(value), modifiers, FieldType.SNMP);
  };
  add("version", Number(field.version ?? 1));
  addRaw(
    "community",
    padBytes(
      Buffer.from(String(field.community ?? "public"), "utf8"),
      6,
      "community",
    ),
  );
  add("pdu_type", pdu === 0 ? 0xa0 : 0xa1);
  add("request_id", Number(field.request_id ?? 0));
  add("error_status", Number(field.error ?? 0));
  add("error_index", Number(field.error_index ?? 0));
  addRaw("oid", padBytes(encodeOidContent(String(varbinds[0].oid)), 8, "oid"));
  // message_len/pdu_len/vbl_len/varbind_len/oid_len 由引擎 seal 回填
  return fields;
}

function layerToHeader(
  layer: PacketLayer,
  name: string,
  modifiers: ReturnType<typeof buildModifierIndex>,
): HeaderInstance {
  const headerType = LAYER_TO_HEADER[layer.type];
  if (headerType === undefined) {
    const label = UNSUPPORTED_LAYERS[layer.type] ?? `FieldType(${layer.type})`;
    throw new Error(
      `[streamcontrol] PacketBuilder 的 ${label} 层暂时无法映射到 packet.proto HeaderType`,
    );
  }

  const field = layer.field ?? {};
  let fields: PacketField[] = [];
  let options: HeaderOptionInstance[] | undefined;
  switch (layer.type) {
    case FieldType.EthernetII:
      fields = ethernetFields(field.ether, modifiers);
      break;
    case FieldType.VLAN:
      fields = vlanFields(field.vlan, modifiers);
      break;
    case FieldType.IPv4:
      options = normalizeHeaderOptions(field.ipv4?.options, "IPv4");
      fields = ipv4Fields(field.ipv4, modifiers);
      break;
    case FieldType.IPv6:
      fields = ipv6Fields(field.ipv6, modifiers);
      break;
    case FieldType.TCP:
      options = normalizeHeaderOptions(field.tcp?.options, "TCP");
      fields = tcpFields(field.tcp, modifiers);
      break;
    case FieldType.UDP:
      fields = udpFields(field.udp, modifiers);
      break;
    case FieldType.ICMP:
      fields = icmpFields(field.icmp, modifiers);
      break;
    case FieldType.ARP:
      fields = arpFields(field.arp, modifiers);
      break;
    case FieldType.Dot3:
      fields = dot3Fields(field.dot3, modifiers);
      break;
    case FieldType.LLC:
      fields = llcFields(field.llc, modifiers);
      break;
    case FieldType.SNAP:
      fields = snapFields(field.snap, modifiers);
      break;
    case FieldType.SNMP:
      fields = snmpFields(field.snmp, modifiers);
      break;
    default:
      throw new Error(`[streamcontrol] 未处理的报文层: ${layer.type}`);
  }

  return { type: headerType, name, fields, options };
}

/**
 * 把 PacketBuilder 的报文描述转换成 packet.proto 的 HeaderInstance 列表。
 *
 * @param packet PacketBuilder.toSpec()
 * @param modifiers 旧的 modifier_param（会转成 PacketFieldModifier）
 */
export function packetToHeaders(
  packet: PacketSpec,
  modifiers: PacketModifierParam[] = [],
): HeaderInstance[] {
  const index = buildModifierIndex(modifiers);

  const counters = new Map<number, number>();
  return packet.layers.map((layer) => {
    const headerType = LAYER_TO_HEADER[layer.type];
    if (headerType === undefined) {
      const label =
        UNSUPPORTED_LAYERS[layer.type] ?? `FieldType(${layer.type})`;
      throw new Error(
        `[streamcontrol] PacketBuilder 的 ${label} 层暂时无法映射到 packet.proto HeaderType`,
      );
    }
    const idx = (counters.get(headerType) ?? 0) + 1;
    counters.set(headerType, idx);
    const name = `${SHORT_NAME[headerType] ?? "header"}_${idx}`;
    return layerToHeader(layer, name, index);
  });
}
