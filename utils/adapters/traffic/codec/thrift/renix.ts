/**
 * Renix（信而泰）HTTP 后端的 thrift 编解码。
 *
 * 该模块是唯一依赖 thrift 生成代码的地方：
 * - 发送：中立 PacketLayer -> thrift Packet -> Buffer（/packet/send* 的 packet.buffer）
 * - 抓包：/capture/download 返回的 thrift PacketList Buffer -> 中立 PacketLayer
 *
 * 非 Renix 后端（如 streamcontrol gRPC）不应 import 本模块，避免把 thrift
 * 运行时/生成代码带进纯 gRPC 环境。
 */

import { PacketLayer } from "../../../../domain/packet/model";
import {
  ThriftFullProtocolType,
  ThriftPresets,
  ThriftProtocolFactory,
} from "./protocol-factory";

export const thrift = require("thrift");
const ttypes = require("../../../../rpc/gen-nodejs/packet_types");

// 兼容层：thrift js:node 生成的代码把 read/write 挂在 Symbol.for("read")/Symbol.for("write") 上，
// 这里为所有生成的 struct 类补上普通的 read/write 别名，便于直接调用（如 packet.write(protocol)）。
for (const key of Object.keys(ttypes)) {
  const cls: any = (ttypes as any)[key];
  if (typeof cls !== "function" || !cls.prototype) continue;
  for (const m of ["read", "write"]) {
    const sym = Symbol.for(m);
    if (!cls.prototype[m] && typeof cls.prototype[sym] === "function") {
      cls.prototype[m] = cls.prototype[sym];
    }
  }
}

export const {
  Packet,
  EthernetII,
  VLAN,
  ARP,
  IPv4,
  IPv6,
  TCP,
  UDP,
  ICMP,
  RAW,
  Dot3,
  LLC,
  Varbind,
  SNMP,
  FieldMeta,
  Field,
  PacketList,
} = ttypes;

/** 兼容旧命名：字段列表就是中立 layer 列表 */
export type IFieldMeta = PacketLayer;
/** Renix 抓包返回的 thrift PacketList（结构见 rpc/thrift/packet.thrift） */
export type IPacketList = any;

/** 中立 layer 的 field 键 -> thrift struct 类名 */
const FIELD_KEY_TO_STRUCT: Record<string, string> = {
  ether: "EthernetII",
  vlan: "VLAN",
  ipv4: "IPv4",
  ipv6: "IPv6",
  arp: "ARP",
  tcp: "TCP",
  udp: "UDP",
  icmp: "ICMP",
  raw: "RAW",
  dot3: "Dot3",
  llc: "LLC",
  snmp: "SNMP",
};

/**
 * 把中立 layer 还原成 thrift 生成类实例。
 * 生成代码里 Field 只认识自己声明过的字段，因此老版本生成文件会忽略
 * raw/dot3/llc/snmp 等层；这是生成代码与 packet.thrift 不同步导致的，
 * 与本次重构无关（script/gen-thrift.js 会在源文件更新后重新生成）。
 */
function toThriftFieldMeta(layer: PacketLayer): any {
  for (const key of ["ipv4", "tcp"]) {
    const options = (layer.field as any)?.[key]?.options;
    if (Array.isArray(options)) {
      throw new Error(
        `[thrift] ${key.toUpperCase()} options 数组目前只支持 streamcontrol gRPC 后端；` +
          `Renix/Scapy 请改用原始 options 字符串或 templateString`,
      );
    }
  }
  const fieldArgs: Record<string, any> = {};
  for (const [key, value] of Object.entries(layer.field ?? {})) {
    if (value === undefined || value === null) continue;
    const structName = FIELD_KEY_TO_STRUCT[key];
    const Ctor = structName ? (ttypes as any)[structName] : undefined;
    fieldArgs[key] = Ctor ? new Ctor(value) : value;
  }
  return new FieldMeta({ type: layer.type, field: new Field(fieldArgs) });
}

/**
 * 获取构建的报文（thrift 序列化）。
 * 使用配置的 Thrift 协议类型序列化报文。
 */
export function packet_thrift_buffer_build(
  layers: PacketLayer[],
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
    field_list: layers.map(toThriftFieldMeta),
  });

  packet.write(protocol);
  if (typeof transport.flush === "function") {
    transport.flush();
  }

  return capturedFlushBuffer || Buffer.alloc(0);
}

/** 解析策略定义 */
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

/**
 * PacketList 解析器实现
 * 用于从二进制数据反序列化报文列表
 */
export class PacketListParser {
  private factory: ThriftProtocolFactory;

  constructor() {
    this.factory = new ThriftProtocolFactory(thrift);
  }

  /**
   * 尝试使用指定协议反序列化数据
   * @param data 二进制数据
   * @param protocolType 协议类型
   * @returns 解析后的 PacketList 对象，失败时抛出异常
   */
  private tryDeserializeWithProtocol(
    data: Buffer,
    protocolType: ThriftFullProtocolType,
  ): IPacketList {
    const { protocol } = this.factory.createReaderByFullType(
      protocolType,
      data,
    );
    const packetList = new PacketList();
    packetList.read(protocol);
    return packetList;
  }

  /**
   * 剥离帧头并尝试反序列化
   * @param data 包含帧头的二进制数据
   * @param framePrefixLen 帧头长度
   * @param byteOrder 字节序
   * @param protocolType 协议类型
   * @returns 解析后的报文列表对象，失败时返回 null
   */
  private tryStripFrameAndDeserialize(
    data: Buffer,
    framePrefixLen: number,
    byteOrder: "big" | "little",
    protocolType: ThriftFullProtocolType,
  ): IPacketList | null {
    if (data.length <= framePrefixLen) {
      return null;
    }

    try {
      // 读取帧长度
      let frameLen: number;
      if (byteOrder === "big") {
        frameLen = data.readUInt32BE(0);
      } else {
        frameLen = data.readUInt32LE(0);
      }

      // 验证帧长度是否合理
      if (frameLen <= 0 || frameLen > data.length - framePrefixLen) {
        return null;
      }

      // 剥离帧头
      const stripped = data.subarray(framePrefixLen, framePrefixLen + frameLen);

      return this.tryDeserializeWithProtocol(stripped, protocolType);
    } catch {
      return null;
    }
  }

  /**
   * 从 Buffer 反序列化报文列表（自动识别协议）
   * @param buffer 序列化后的报文列表数据
   * @returns 解析结果，包含报文列表对象、错误列表和使用的策略
   */
  parse(buffer: Buffer): IPacketList | null {
    for (const strategy of PARSE_STRATEGIES) {
      try {
        let packetList: IPacketList | null = null;

        if (strategy.stripFrame) {
          packetList = this.tryStripFrameAndDeserialize(
            buffer,
            strategy.framePrefixLen!,
            strategy.byteOrder!,
            strategy.protocolType,
          );
        } else {
          packetList = this.tryDeserializeWithProtocol(
            buffer,
            strategy.protocolType,
          );
        }

        // 只要成功解析出 PacketList 对象就返回，即使 pkt_list 为空
        if (packetList && packetList.pkt_list !== undefined) {
          return packetList;
        }
      } catch {
        // 尝试下一种策略
      }
    }

    return null;
  }
}

/** 把 thrift PacketList 转成中立 layer 列表 */
export function packetListToLayers(
  packetList: IPacketList | null,
): PacketLayer[][] {
  if (!packetList || !Array.isArray(packetList.pkt_list)) return [];
  return packetList.pkt_list
    .map((packet: any) =>
      Array.isArray(packet?.field_list) ? packet.field_list : [],
    )
    .filter((layers: PacketLayer[]) => layers.length > 0);
}

/** 供需要判断层类型的调用方使用 */
export const ThriftFieldType = ttypes.FieldType;
