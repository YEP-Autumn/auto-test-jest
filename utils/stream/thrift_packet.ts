export const thrift = require("thrift");
const ttypes = require("../rpc/gen-nodejs/packet_types");

import { ipStringToNumber, PARSE_STRATEGIES } from "./packet_utils";
import {
  ThriftFullProtocolType,
  ThriftProtocolFactory,
} from "./thrift-protocol.factory";

export const {
  Packet,
  EthernetII,
  VLAN,
  IPv4,
  IPv6,
  FieldMeta,
  Field,
  FieldType,
  PacketList,
} = ttypes;

// 类型定义
// export type IPacket = any;
export type IPacketList = any;
// export type IEthernetII = any;
// export type IVLAN = any;
// export type IIPv4 = any;
export type IFieldMeta = any;
// export type IField = any;

// PacketBuilder 参数接口定义
interface EthernetOptions {
  dst?: string;
  src?: string;
  type?: number;
}

interface VLANOptions {
  vlan?: number;
  type?: number;
}

interface IPv4Options {
  src?: string;
  dst?: string;
}

interface IPv6Options {
  src?: string;
  dst?: string;
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
  setEthernet({
    dst = "00:00:00:12:30:10",
    src = "00:00:00:12:30:20",
    type = 0x0800,
  }: EthernetOptions = {}): PacketBuilder {
    const normalizedDst = normalizeMacAddress(dst);
    const normalizedSrc = normalizeMacAddress(src);

    const ethernet = new EthernetII({
      dst: normalizedDst,
      src: normalizedSrc,
      type,
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
  setVLAN({ vlan = 1, type = 0x0800 }: VLANOptions = {}): PacketBuilder {
    const vlanField = new VLAN({
      vlan,
      type,
    });

    const fieldMeta = new FieldMeta({
      type: FieldType.VLAN,
      field: new Field({ vlan: vlanField }),
    });

    this.fieldList.push(fieldMeta);
    return this;
  }

  /**
   * 设置IPv4协议头
   */
  setIPv4({
    src: srcIp = "1.1.1.1",
    dst: dstIp = "2.2.2.2",
  }: IPv4Options = {}): PacketBuilder {
    const srcIpNum = ipStringToNumber(srcIp);
    const dstIpNum = ipStringToNumber(dstIp);

    const ipv4 = new IPv4({
      src: srcIpNum,
      dst: dstIpNum,
    });

    const fieldMeta = new FieldMeta({
      type: FieldType.IPv4,
      field: new Field({ ipv4 }),
    });

    this.fieldList.push(fieldMeta);
    return this;
  }

  setIPv6({
    dst = "2001::1",
    src = "3001::1",
  }: IPv6Options = {}): PacketBuilder {
    const ipv6 = new IPv6({
      dst: dst,
      src: src,
    });

    const fieldMeta = new FieldMeta({
      type: FieldType.IPv6,
      field: new Field({ ipv6: ipv6 }),
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
