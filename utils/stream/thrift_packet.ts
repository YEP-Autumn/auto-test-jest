export const thrift = require("thrift");
const ttypes = require("../rpc/gen-nodejs/packet_types");

import { interceptors } from "axios";
import { PARSE_STRATEGIES } from "./packet_utils";
import {
  ThriftFullProtocolType,
  ThriftProtocolFactory,
} from "./thrift-protocol.factory";

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
  FieldMeta,
  Field,
  FieldType,
  PacketList,
} = ttypes;

// 类型定义
export type IPacketList = any;
export type IFieldMeta = any;

// PacketBuilder 参数接口定义
interface EthernetOptions {
  dst?: string;
  src?: string;
  type?: number;
}

interface ARPOptions {
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

interface VLANOptions {
  prio?: number;
  dei?: number;
  vlan?: number;
  type?: number;
}

interface IPv4Options {
  version?: number;
  inl?: number;
  tos?: number;
  len?: number;
  id?: number;
  flags?: number;
  ttl?: number;
  proto?: number;
  chksum?: number;
  src?: string;
  dst?: string;
  option?: number;
}

interface IPv6Options {
  version?: number;
  tc?: number;
  fl?: number;
  plen?: number;
  nh?: number;
  hlim?: number;
  src?: string;
  dst?: string;
}

interface TCPOptions {
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
  option?: Buffer;
}

interface UDPOptions {
  sport?: number;
  dport?: number;
  len?: number;
  chksum?: number;
}

interface ICMPOptions {
  type?: number;
  code?: number;
  chksum?: number;
  id?: number;
  seq?: number;
}

/**
 * 将MAC地址转换为冒号分隔的格式
 * 支持三种格式：
 * - 冒号分隔格式：00:00:00:12:30:10
 * - 点分十六进制格式：0000.0012.3010
 * - 点分十六进制缩写格式：1.1.1（会扩展为 00:01:00:01:00:01）
 * @param macAddress MAC地址字符串
 * @returns 冒号分隔格式的MAC地址
 */
function normalizeMacAddress(macAddress: string): string {
  // 如果已经是冒号分隔的格式，直接返回
  if (macAddress.includes(":")) {
    return macAddress;
  }

  // 处理点分十六进制格式（如 0000.0012.3010 或缩写 1.1.1）
  if (macAddress.includes(".")) {
    const parts = macAddress.split(".");
    if (parts.length === 3) {
      // 每个部分是十六进制数字，需要补零到4位，然后分成两个2位数字
      const expanded = parts
        .map((part) => {
          // 补零到4位
          const padded = part.padStart(4, "0");
          return `${padded.substring(0, 2)}:${padded.substring(2, 4)}`;
        })
        .join(":");
      return expanded;
    }
  }

  // 如果格式无法识别，返回原始值
  return macAddress;
}

/**
 * 以太网报文构建器实现
 */
export class PacketBuilder {
  private fieldList: IFieldMeta[] = [];
  /**
   * 设置以太网II帧
   */
  setEthernet(options: EthernetOptions = {}): PacketBuilder {
    const ethernet = new EthernetII({
      dst: options.dst ? normalizeMacAddress(options.dst) : null,
      src: options.src ? normalizeMacAddress(options.src) : null,
      type: options.type,
    });

    const fieldMeta = new FieldMeta({
      type: FieldType.EthernetII,
      field: new Field({ ether: ethernet }),
    });

    this.fieldList.push(fieldMeta);
    return this;
  }

  /**
   * 设置VLAN标签
   */
  setVLAN(options: VLANOptions = {}): PacketBuilder {
    const fieldMeta = new FieldMeta({
      type: FieldType.VLAN,
      field: new Field({ vlan: new VLAN(options) }),
    });

    this.fieldList.push(fieldMeta);
    return this;
  }

  setARP(options: ARPOptions = {}): PacketBuilder {
    const fieldMeta = new FieldMeta({
      type: FieldType.ARP,
      field: new Field({ arp: new ARP(options) }),
    });

    this.fieldList.push(fieldMeta);

    return this;
  }

  /**
   * 设置IPv4协议头
   */
  setIPv4(options: IPv4Options = {}): PacketBuilder {
    const fieldMeta = new FieldMeta({
      type: FieldType.IPv4,
      field: new Field({ ipv4: new IPv4(options) }),
    });

    this.fieldList.push(fieldMeta);
    return this;
  }

  setIPv6(options: IPv6Options = {}): PacketBuilder {
    const fieldMeta = new FieldMeta({
      type: FieldType.IPv6,
      field: new Field({ ipv6: new IPv6(options) }),
    });

    this.fieldList.push(fieldMeta);
    return this;
  }

  setTCP(options: TCPOptions = {}): PacketBuilder {
    const fieldMeta = new FieldMeta({
      type: FieldType.TCP,
      field: new Field({ tcp: new TCP(options) }),
    });

    this.fieldList.push(fieldMeta);
    return this;
  }

  setUDP(options: UDPOptions = {}): PacketBuilder {
    const fieldMeta = new FieldMeta({
      type: FieldType.UDP,
      field: new Field({ udp: new UDP(options) }),
    });

    this.fieldList.push(fieldMeta);

    return this;
  }

  setICMP(options: ICMPOptions = {}): PacketBuilder {
    const fieldMeta = new FieldMeta({
      type: FieldType.ICMP,
      field: new Field({ icmp: new ICMP(options) }),
    });

    this.fieldList.push(fieldMeta);
    return this;
  }

  /**
   * 获取字段列表
   */
  getFields(): IFieldMeta[] {
    return this.fieldList;
  }

  /**
   * 清空所有字段
   */
  clear(): PacketBuilder {
    this.fieldList = [];
    return this;
  }
}

/**
 * PacketList 构建器实现
 * 用于构建和序列化报文列表
 */
// export class PacketListBuilder {
//   private packets: IPacket[] = [];

//   /**
//    * 添加单个报文
//    * @param packet 要添加的报文对象
//    */
//   addPacket(packet: IPacket): PacketListBuilder {
//     this.packets.push(packet);
//     return this;
//   }

//   /**
//    * 从 EthernetPacketBuilder 添加报文
//    * @param builder 以太网报文构建器
//    */
//   addFromBuilder(builder: PacketBuilder): PacketListBuilder {
//     const packet = new Packet({
//       field_list: builder.getFields(),
//     });
//     this.packets.push(packet);
//     return this;
//   }

//   /**
//    * 批量添加报文
//    * @param packets 报文数组
//    */
//   addPackets(packets: IPacket[]): PacketListBuilder {
//     this.packets.push(...packets);
//     return this;
//   }

//   /**
//    * 获取报文数量
//    */
//   getPacketCount(): number {
//     return this.packets.length;
//   }

//   /**
//    * 获取所有报文
//    */
//   getPackets(): IPacket[] {
//     return this.packets;
//   }

//   /**
//    * 清空报文列表
//    */
//   clear(): PacketListBuilder {
//     this.packets = [];
//     return this;
//   }

//   /**
//    * 构建并序列化报文列表
//    * @param protocolType 协议类型
//    * @returns 序列化后的 Buffer
//    */
//   build(protocolType: ThriftFullProtocolType = ThriftPresets.DEFAULT): Buffer {
//     let capturedFlushBuffer: Buffer | null = null;
//     const factory = new ThriftProtocolFactory(thrift);
//     const { transport, protocol } = factory.createByFullType(
//       protocolType,
//       (msg: Buffer) => {
//         capturedFlushBuffer = msg;
//       }
//     );

//     const packetList = new PacketList({
//       pkt_list: this.packets,
//     });

//     // 执行写入操作
//     packetList.write(protocol);
//     if (typeof transport.flush === "function") {
//       transport.flush();
//     }

//     return capturedFlushBuffer || Buffer.alloc(0);
//   }
// }

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
   * @returns 解析后的 PacketList 对象，失败时返回 null
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
    const errors: string[] = [];

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
      } catch (e) {
        const errorMsg = `${strategy.name}: ${
          e instanceof Error ? e.message : String(e)
        }`;
        errors.push(errorMsg);
      }
    }

    return null;
  }
}
