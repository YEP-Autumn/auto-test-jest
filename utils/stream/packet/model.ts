/**
 * 与具体打流/抓包后端无关的报文模型与构建器。
 *
 * 这里只描述"要构造什么报文"，不负责序列化：
 * - Renix HTTP 后端用 codec/thrift/renix 转成 thrift packet；
 * - streamcontrol gRPC 后端用 codec/frame/decode 转成原始以太网帧/pcap。
 *
 * 层对象的结构保持与原 thrift 模型一致（{ type, field: { ether | vlan | ... } }），
 * 因此 packet/match 与 packet/format 可以继续直接复用。
 */

/** 协议层类型，数值与原 thrift FieldType 保持一致 */
export enum FieldType {
  EthernetII = 1,
  VLAN = 2,
  IPv4 = 3,
  IPv6 = 4,
  TCP = 5,
  UDP = 6,
  ICMP = 7,
  ARP = 8,
  RAW = 9,
  Dot3 = 10,
  LLC = 11,
  SNMP = 12,
  SNAP = 13,
}

/**
 * 单个协议层。
 * field 里只会有且仅有一个非空键：ether / vlan / ipv4 / ipv6 / arp / tcp /
 * udp / icmp / raw / dot3 / llc / snmp。
 */
export interface PacketLayer {
  type: FieldType;
  field: Record<string, any>;
}

/** 一个待发送/待比较的报文 */
export interface PacketSpec {
  layers: PacketLayer[];
}

// PacketBuilder 参数接口定义
export interface EthernetOptions {
  dst?: string;
  src?: string;
  type?: number;
}

export interface ARPOptions {
  hwtype?: number;
  ptype?: number;
  hwlen?: number;
  plen?: number;
  op?: number;
  hwsrc?: string;
  psrc?: string;
  hwdst?: string;
  pdst?: string;
}

export interface VLANOptions {
  prio?: number;
  dei?: number;
  vlan?: number;
  type?: number;
}

export interface IPv4Options {
  version?: number;
  ihl?: number;
  tos?: number;
  len?: number;
  id?: number;
  frag?: number;
  flags?: number;
  ttl?: number;
  proto?: number;
  chksum?: number;
  src?: string;
  dst?: string;
  options?: number;
}

export interface IPv6Options {
  version?: number;
  tc?: number;
  fl?: number;
  plen?: number;
  nh?: number;
  hlim?: number;
  src?: string;
  dst?: string;
}

export interface TCPOptions {
  sport?: number;
  dport?: number;
  seq?: number;
  ack?: number;
  dataofs?: number;
  rsv?: number;
  flags?: number;
  window?: number;
  chksum?: number;
  urgptr?: number;
  options?: Buffer;
}

export interface UDPOptions {
  sport?: number;
  dport?: number;
  len?: number;
  chksum?: number;
}

export interface ICMPOptions {
  type?: number;
  code?: number;
  chksum?: number;
  id?: number;
  seq?: number;
}

export interface RAWOptions {
  payload?: Buffer | string;
}

export interface Dot3Options {
  dst?: string;
  src?: string;
  len?: number;
}

export interface LLCOptions {
  dsap?: number;
  ssap?: number;
  ctrl?: number;
}

export interface SNAPOptions {
  /** 24-bit OUI；支持数字、3 字节 Buffer 或 hex 字符串（如 "000000" / "0x000000"） */
  oui?: number | Buffer | string;
  /** SNAP PID，通常就是内层 ethertype，如 0x0800 */
  pid?: number;
}

export interface VarbindOptions {
  /** 点分形式 OID，如 "1.3.6.1.2.1.1.1.0"；期望值可用正则匹配 */
  oid?: string | RegExp;
  /** 值字符串：INTEGER 为十进制数；OCTET STRING 为 UTF-8 文本；期望值可用正则匹配 */
  value?: string | RegExp;
  /** 0/缺省=无值(GET 用)，2=INTEGER，4=OCTET STRING，5=NULL，6=OID */
  value_type?: number;
}

export interface SNMPOptions {
  /** 0=v1, 1=v2c, 3=v3 */
  version?: number;
  /** v1/v2c 社区名 */
  community?: string;
  /** 0=GET,1=NEXT,2=RESPONSE,3=SET,4=TRAPv1,5=BULK,6=INFORM,7=TRAPv2 */
  pdu_type?: number;
  /** PDU request-id */
  request_id?: number;
  varbinds?: VarbindOptions[];
  /** RESPONSE 用 */
  error?: number;
  error_index?: number;
  /** TRAPv1 */
  enterprise?: string;
  /** TRAPv1 */
  agent_addr?: string;
  /** TRAPv1 */
  generic_trap?: number;
  /** TRAPv1 */
  specific_trap?: number;
  /** TRAPv1 (timetick) */
  time_stamp?: number;
  /** BULK */
  non_repeaters?: number;
  /** BULK */
  max_repetitions?: number;
  /** v3 msgGlobalData.msgID */
  msg_id?: number;
  /** v3 msgGlobalData.msgMaxSize */
  msg_max_size?: number;
  /** v3 msgGlobalData.msgFlags（bit0=auth, bit1=priv, bit2=reportable） */
  msg_flags?: number;
  /** v3 msgSecurityModel（3=USM） */
  msg_security_model?: number;
  /** v3 USM msgAuthoritativeEngineID（十六进制） */
  engine_id?: string;
  /** v3 USM msgAuthoritativeEngineBoots */
  engine_boots?: number;
  /** v3 USM msgAuthoritativeEngineTime */
  engine_time?: number;
  /** v3 USM msgUserName */
  user_name?: string;
  /** v3 USM msgAuthenticationParameters（十六进制） */
  auth_params?: string;
  /** v3 USM msgPrivacyParameters（十六进制） */
  privacy_params?: string;
  /** v3 scopedPDU contextEngineID（十六进制） */
  context_engine_id?: string;
  /** v3 scopedPDU contextName */
  context_name?: string;
}

/**
 * 将 MAC 地址转换为冒号分隔的格式。
 * 支持三种格式：
 * - 冒号分隔格式：00:00:00:12:30:10
 * - 点分十六进制格式：0000.0012.3010
 * - 点分十六进制缩写格式：1.1.1（会扩展为 00:01:00:01:00:01）
 */
export function normalizeMacAddress(macAddress: string): string {
  if (macAddress.includes(":")) {
    return macAddress;
  }

  if (macAddress.includes(".")) {
    const parts = macAddress.split(".");
    if (parts.length === 3) {
      return parts
        .map((part) => {
          const padded = part.padStart(4, "0");
          return `${padded.substring(0, 2)}:${padded.substring(2, 4)}`;
        })
        .join(":");
    }
  }

  return macAddress;
}

/**
 * 归一化 SNAP OUI 为 24-bit 数字，便于期望值与抓包解码直接比较。
 */
export function normalizeOui(
  oui: number | Buffer | string | undefined,
): number {
  if (oui === undefined || oui === null) return 0;
  if (typeof oui === "number") return oui & 0xffffff;
  if (Buffer.isBuffer(oui)) {
    if (oui.length > 3)
      throw new Error(`SNAP OUI 必须是 3 字节: ${oui.length}`);
    let value = 0;
    for (const byte of oui) value = (value << 8) | byte;
    return value & 0xffffff;
  }
  const text = String(oui).trim();
  const value = parseInt(text.startsWith("0x") ? text.slice(2) : text, 16);
  if (!Number.isInteger(value) || value < 0 || value > 0xffffff) {
    throw new Error(`无效的 SNAP OUI: ${oui}`);
  }
  return value;
}

/**
 * 以太网报文构建器。
 *
 * 接口保持向后兼容，内部只记录中立的协议层描述；具体后端在发送时再决定
 * 编码方式（thrift / raw frame / pcap）。
 */
export class PacketBuilder {
  private layers: PacketLayer[] = [];

  /** 设置以太网 II 帧 */
  setEthernet(options: EthernetOptions = {}): PacketBuilder {
    this.layers.push({
      type: FieldType.EthernetII,
      field: {
        ether: {
          dst: options.dst ? normalizeMacAddress(options.dst) : null,
          src: options.src ? normalizeMacAddress(options.src) : null,
          type: options.type,
        },
      },
    });
    return this;
  }

  /** 设置 VLAN 标签 */
  setVLAN(options: VLANOptions = {}): PacketBuilder {
    this.layers.push({
      type: FieldType.VLAN,
      field: { vlan: { ...options } },
    });
    return this;
  }

  setARP(options: ARPOptions = {}): PacketBuilder {
    this.layers.push({
      type: FieldType.ARP,
      field: {
        arp: {
          ...options,
          hwsrc: options.hwsrc ? normalizeMacAddress(options.hwsrc) : null,
          hwdst: options.hwdst ? normalizeMacAddress(options.hwdst) : null,
        },
      },
    });
    return this;
  }

  /** 设置 IPv4 协议头 */
  setIPv4(options: IPv4Options = {}): PacketBuilder {
    this.layers.push({
      type: FieldType.IPv4,
      field: { ipv4: { ...options } },
    });
    return this;
  }

  setIPv6(options: IPv6Options = {}): PacketBuilder {
    this.layers.push({
      type: FieldType.IPv6,
      field: { ipv6: { ...options } },
    });
    return this;
  }

  setTCP(options: TCPOptions = {}): PacketBuilder {
    this.layers.push({
      type: FieldType.TCP,
      field: { tcp: { ...options } },
    });
    return this;
  }

  setUDP(options: UDPOptions = {}): PacketBuilder {
    this.layers.push({
      type: FieldType.UDP,
      field: { udp: { ...options } },
    });
    return this;
  }

  setICMP(options: ICMPOptions = {}): PacketBuilder {
    this.layers.push({
      type: FieldType.ICMP,
      field: { icmp: { ...options } },
    });
    return this;
  }

  /** 设置原始数据负载（Builder 内统一保存为 base64 字符串，兼容 Renix thrift 模型） */
  setRaw(options: RAWOptions = {}): PacketBuilder {
    const rawPayload =
      options.payload instanceof Buffer
        ? options.payload.toString("base64")
        : options.payload;
    this.layers.push({
      type: FieldType.RAW,
      field: { raw: { payload: rawPayload } },
    });
    return this;
  }

  /** 设置 802.3 原始以太网帧 */
  setDot3(options: Dot3Options = {}): PacketBuilder {
    this.layers.push({
      type: FieldType.Dot3,
      field: {
        dot3: {
          dst: options.dst ? normalizeMacAddress(options.dst) : null,
          src: options.src ? normalizeMacAddress(options.src) : null,
          len: options.len,
        },
      },
    });
    return this;
  }

  /** 设置 LLC（逻辑链路控制）头 */
  setLLC(options: LLCOptions = {}): PacketBuilder {
    this.layers.push({
      type: FieldType.LLC,
      field: { llc: { ...options } },
    });
    return this;
  }

  /** 设置 LLC SNAP 子头（OUI + PID），通常放在 setLLC({dsap:0xaa,ssap:0xaa,ctrl:3}) 之后 */
  setSNAP(options: SNAPOptions = {}): PacketBuilder {
    this.layers.push({
      type: FieldType.SNAP,
      field: {
        snap: {
          oui: normalizeOui(options.oui),
          pid: options.pid === undefined ? 0x0800 : options.pid & 0xffff,
        },
      },
    });
    return this;
  }

  /** 设置 SNMP 报文 */
  setSNMP(options: SNMPOptions = {}): PacketBuilder {
    this.layers.push({
      type: FieldType.SNMP,
      field: { snmp: { ...options } },
    });
    return this;
  }

  /** 获取中立的报文描述 */
  toSpec(): PacketSpec {
    return { layers: this.layers };
  }

  /**
   * 兼容旧接口：返回层列表。
   * 注意返回的是中立层对象，不再是 thrift 生成类的实例。
   */
  getFields(): PacketLayer[] {
    return this.layers;
  }

  /** 清空所有字段 */
  clear(): PacketBuilder {
    this.layers = [];
    return this;
  }
}
