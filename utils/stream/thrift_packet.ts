export const thrift = require("thrift");
const ttypes = require("../rpc/gen-nodejs/packet_types");

import {
  ThriftProtocolFactory,
  ThriftFullProtocolType,
  ThriftPresets,
} from "./thrift-protocol.factory";

export const {
  Packet,
  EthernetII,
  VLAN,
  IPv4,
  FieldMeta,
  Field,
  FieldType,
  PacketList,
} = ttypes;

// 类型定义
export type IPacket = any;
export type IPacketList = any;
export type IEthernetII = any;
export type IVLAN = any;
export type IIPv4 = any;
export type IFieldMeta = any;
export type IField = any;

/**
 * 验证结果接口
 */
export interface IValidationResult {
  /**
   * 验证是否通过
   */
  passed: boolean;

  /**
   * 错误消息
   */
  message?: string;

  /**
   * 实际值
   */
  actualValue?: any;
}

/**
 * 以太网报文构建器实现
 */
export class EthernetPacketBuilder {
  private fieldList: IFieldMeta[] = [];
  /**
   * 设置以太网II帧
   */
  setEthernet(dst: string, src: string, type: number): EthernetPacketBuilder {
    const ethernet = new EthernetII({
      dst,
      src,
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
  setVLAN(vlan: number, type: number): EthernetPacketBuilder {
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
   * 将IP地址字符串转换为32位整数
   * 例如: "192.168.1.1" -> 3232235777
   */
  private ipStringToNumber(ipString: string): number {
    const parts = ipString.split('.');
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
   * 设置IPv4协议头
   * @param srcIp 源IP地址字符串，例如 "192.168.1.1"
   * @param dstIp 目的IP地址字符串，例如 "192.168.1.2"
   */
  setIPv4(srcIp: string, dstIp: string): EthernetPacketBuilder {
    const srcIpNum = this.ipStringToNumber(srcIp);
    const dstIpNum = this.ipStringToNumber(dstIp);
    
    const ipv4 = new IPv4({
      src_ip: srcIpNum,
      dst_ip: dstIpNum,
    });

    const fieldMeta = new FieldMeta({
      type: FieldType.IPv4,
      field: new Field({ ipv4 }),
    });

    this.fieldList.push(fieldMeta);
    return this;
  }

  /**
   * 获取构建的报文
   * 使用配置的 Thrift 协议类型序列化报文
   */
  build(protocolType: ThriftFullProtocolType = ThriftPresets.DEFAULT): Buffer {
    let capturedFlushBuffer: Buffer | null = null;
    const factory = new ThriftProtocolFactory(thrift);
    const { transport, protocol } = factory.createByFullType(
      protocolType,
      (msg: Buffer) => {
        capturedFlushBuffer = msg;
      }
    );

    const packet = new Packet({
      field_list: this.fieldList,
    });

    // 执行写入操作
    packet.write(protocol);
    if (typeof transport.flush === "function") {
      transport.flush();
    }

    return capturedFlushBuffer || Buffer.alloc(0);
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
  clear(): EthernetPacketBuilder {
    this.fieldList = [];
    return this;
  }
}

/**
 * 以太网报文校验器实现
 */
export class EthernetPacketValidator {
  private packet: IPacket;

  constructor(packet: IPacket) {
    this.packet = packet;
  }

  /**
   * 检验是否存在以太网II帧
   */
  hasEthernet(): boolean {
    return this.getField(FieldType.EthernetII) !== undefined;
  }

  /**
   * 验证以太网II帧的详细信息
   */
  validateEthernet(
    dst?: string,
    src?: string,
    type?: number
  ): IValidationResult {
    const field = this.getField(FieldType.EthernetII);

    if (!field) {
      return {
        passed: false,
        message: "报文中不存在以太网II帧",
      };
    }

    const ethernet = field.field?.ether;
    if (!ethernet) {
      return {
        passed: false,
        message: "以太网II帧解析失败",
      };
    }

    // 验证目的MAC地址
    if (dst !== undefined && ethernet.dst !== dst) {
      return {
        passed: false,
        message: `目的MAC地址不匹配，期望: ${dst}，实际: ${ethernet.dst}`,
        actualValue: ethernet.dst,
      };
    }

    // 验证源MAC地址
    if (src !== undefined && ethernet.src !== src) {
      return {
        passed: false,
        message: `源MAC地址不匹配，期望: ${src}，实际: ${ethernet.src}`,
        actualValue: ethernet.src,
      };
    }

    // 验证以太网类型
    if (type !== undefined && ethernet.type !== type) {
      return {
        passed: false,
        message: `以太网类型不匹配，期望: 0x${type.toString(
          16
        )}，实际: 0x${ethernet.type.toString(16)}`,
        actualValue: ethernet.type,
      };
    }

    return {
      passed: true,
      message: "以太网II帧验证通过",
      actualValue: ethernet,
    };
  }

  /**
   * 检验是否存在VLAN标签
   */
  hasVLAN(): boolean {
    return this.getField(FieldType.VLAN) !== undefined;
  }

  /**
   * 验证VLAN标签的详细信息
   */
  validateVLAN(vlan?: number, type?: number): IValidationResult {
    const field = this.getField(FieldType.VLAN);

    if (!field) {
      return {
        passed: false,
        message: "报文中不存在VLAN标签",
      };
    }

    const vlanField = field.field?.vlan;
    if (!vlanField) {
      return {
        passed: false,
        message: "VLAN标签解析失败",
      };
    }

    // 验证VLAN ID
    if (vlan !== undefined && vlanField.vlan !== vlan) {
      return {
        passed: false,
        message: `VLAN ID不匹配，期望: ${vlan}，实际: ${vlanField.vlan}`,
        actualValue: vlanField.vlan,
      };
    }

    // 验证上层协议类型
    if (type !== undefined && vlanField.type !== type) {
      return {
        passed: false,
        message: `VLAN上层协议类型不匹配，期望: 0x${type.toString(
          16
        )}，实际: 0x${vlanField.type.toString(16)}`,
        actualValue: vlanField.type,
      };
    }

    return {
      passed: true,
      message: "VLAN标签验证通过",
      actualValue: vlanField,
    };
  }

  /**
   * 检验是否存在IPv4协议头
   */
  hasIPv4(): boolean {
    return this.getField(FieldType.IPv4) !== undefined;
  }

  /**
   * 验证IPv4协议头的详细信息
   */
  validateIPv4(srcIp?: number, dstIp?: number): IValidationResult {
    const field = this.getField(FieldType.IPv4);

    if (!field) {
      return {
        passed: false,
        message: "报文中不存在IPv4协议头",
      };
    }

    const ipv4 = field.field?.ipv4;
    if (!ipv4) {
      return {
        passed: false,
        message: "IPv4协议头解析失败",
      };
    }

    // 验证源IP地址
    if (srcIp !== undefined && ipv4.src_ip !== srcIp) {
      return {
        passed: false,
        message: `源IP地址不匹配，期望: ${srcIp}，实际: ${ipv4.src_ip}`,
        actualValue: ipv4.src_ip,
      };
    }

    // 验证目的IP地址
    if (dstIp !== undefined && ipv4.dst_ip !== dstIp) {
      return {
        passed: false,
        message: `目的IP地址不匹配，期望: ${dstIp}，实际: ${ipv4.dst_ip}`,
        actualValue: ipv4.dst_ip,
      };
    }

    return {
      passed: true,
      message: "IPv4协议头验证通过",
      actualValue: ipv4,
    };
  }

  /**
   * 获取特定类型的字段
   */
  getField(fieldType: number): IFieldMeta | undefined {
    if (!this.packet || !this.packet.field_list) {
      return undefined;
    }

    return this.packet.field_list.find(
      (fieldMeta: IFieldMeta) => fieldMeta.type === fieldType
    );
  }

  /**
   * 获取所有字段
   */
  getAllFields(): IFieldMeta[] {
    return this.packet?.field_list || [];
  }

  /**
   * 获取字段数量
   */
  getFieldCount(): number {
    return this.packet?.field_list?.length || 0;
  }
}

/**
 * 解析结果接口
 */
export interface IParseResult {
  /** 解析后的报文对象，解析失败时为 null */
  packet: IPacket | null;
  /** 解析过程中的错误列表 */
  errors: string[];
  /** 成功使用的策略名称，解析失败时为 null */
  strategy: string | null;
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

/**
 * 以太网报文解析器实现
 * 用于从二进制数据反序列化报文
 * 支持自动识别多种 Transport + Protocol 组合
 */
export class EthernetPacketParser {
  private factory: ThriftProtocolFactory;

  /** 解析策略列表，按优先级排序 */
  private static readonly PARSE_STRATEGIES: IParseStrategy[] = [
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

  constructor() {
    this.factory = new ThriftProtocolFactory(thrift);
  }

  /**
   * 尝试使用指定协议反序列化数据
   * @param data 二进制数据
   * @param protocolType 协议类型
   * @returns 解析后的 Packet 对象，失败时抛出异常
   */
  private tryDeserializeWithProtocol(
    data: Buffer,
    protocolType: ThriftFullProtocolType
  ): IPacket {
    const { protocol } = this.factory.createReaderByFullType(
      protocolType,
      data
    );
    const packet = new Packet();
    packet.read(protocol);
    return packet;
  }

  /**
   * 剥离帧头并尝试反序列化
   * @param data 包含帧头的二进制数据
   * @param framePrefixLen 帧头长度
   * @param byteOrder 字节序
   * @param protocolType 协议类型
   * @returns 解析后的 Packet 对象，失败时返回 null
   */
  private tryStripFrameAndDeserialize(
    data: Buffer,
    framePrefixLen: number,
    byteOrder: "big" | "little",
    protocolType: ThriftFullProtocolType
  ): IPacket | null {
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
   * 从 Buffer 反序列化报文（自动识别协议）
   * 尝试多种反序列化策略以处理不同的 Thrift 协议和帧格式
   *
   * 策略尝试顺序：
   * 1. TFramedTransport (4字节 big-endian) + TCompactProtocol
   * 2. TFramedTransport (4字节 little-endian) + TCompactProtocol
   * 3. TFramedTransport (4字节 big-endian) + TBinaryProtocol
   * 4. TFramedTransport (4字节 little-endian) + TBinaryProtocol
   * 5. TCompactProtocol 无帧
   * 6. TBinaryProtocol 无帧
   *
   * @param buffer 序列化后的报文数据
   * @returns 解析结果，包含报文对象、错误列表和使用的策略
   */
  parse(buffer: Buffer): IParseResult {
    const errors: string[] = [];

    for (const strategy of EthernetPacketParser.PARSE_STRATEGIES) {
      try {
        let packet: IPacket | null = null;

        if (strategy.stripFrame) {
          packet = this.tryStripFrameAndDeserialize(
            buffer,
            strategy.framePrefixLen!,
            strategy.byteOrder!,
            strategy.protocolType
          );
        } else {
          packet = this.tryDeserializeWithProtocol(
            buffer,
            strategy.protocolType
          );
        }

        if (packet && packet.field_list && packet.field_list.length > 0) {
          return {
            packet,
            errors,
            strategy: strategy.name,
          };
        }
      } catch (e) {
        const errorMsg = `${strategy.name}: ${
          e instanceof Error ? e.message : String(e)
        }`;
        errors.push(errorMsg);
      }
    }

    return {
      packet: null,
      errors,
      strategy: null,
    };
  }

  /**
   * 从 Buffer 反序列化报文（指定协议类型）
   * @param buffer 序列化后的报文数据
   * @param protocolType 协议类型
   * @returns 解析后的 Packet 对象
   */
  parseWithProtocol(
    buffer: Buffer,
    protocolType: ThriftFullProtocolType
  ): IPacket {
    return this.tryDeserializeWithProtocol(buffer, protocolType);
  }

  /**
   * 从 Buffer 反序列化并返回校验器（自动识别协议）
   * @param buffer 序列化后的报文数据
   * @returns 报文校验器实例
   * @throws 如果所有策略都失败则抛出异常
   */
  parseToValidator(buffer: Buffer): EthernetPacketValidator {
    const result = this.parse(buffer);
    if (!result.packet) {
      throw new Error(
        `无法解析报文，尝试的策略均失败：\n${result.errors.join("\n")}`
      );
    }
    return new EthernetPacketValidator(result.packet);
  }

  /**
   * 从 Buffer 反序列化并返回校验器（指定协议类型）
   * @param buffer 序列化后的报文数据
   * @param protocolType 协议类型
   * @returns 报文校验器实例
   */
  parseToValidatorWithProtocol(
    buffer: Buffer,
    protocolType: ThriftFullProtocolType
  ): EthernetPacketValidator {
    const packet = this.parseWithProtocol(buffer, protocolType);
    return new EthernetPacketValidator(packet);
  }

  /**
   * 提取以太网II帧信息（自动识别协议）
   * @param buffer 序列化后的报文数据
   * @returns 以太网II帧信息，如果不存在则返回 undefined
   */
  extractEthernet(buffer: Buffer): IEthernetII | undefined {
    const result = this.parse(buffer);
    if (!result.packet) return undefined;
    const field = result.packet.field_list?.find(
      (f: IFieldMeta) => f.type === FieldType.EthernetII
    );
    return field?.field?.ether;
  }

  /**
   * 提取 VLAN 标签信息（自动识别协议）
   * @param buffer 序列化后的报文数据
   * @returns VLAN 标签信息数组
   */
  extractVLANs(buffer: Buffer): IVLAN[] {
    const result = this.parse(buffer);
    if (!result.packet) return [];
    const fields =
      result.packet.field_list?.filter(
        (f: IFieldMeta) => f.type === FieldType.VLAN
      ) || [];
    return fields.map((f: IFieldMeta) => f.field?.vlan).filter(Boolean);
  }

  /**
   * 提取 IPv4 协议头信息（自动识别协议）
   * @param buffer 序列化后的报文数据
   * @returns IPv4 协议头信息，如果不存在则返回 undefined
   */
  extractIPv4(buffer: Buffer): IIPv4 | undefined {
    const result = this.parse(buffer);
    if (!result.packet) return undefined;
    const field = result.packet.field_list?.find(
      (f: IFieldMeta) => f.type === FieldType.IPv4
    );
    return field?.field?.ipv4;
  }

  /**
   * 提取所有字段列表（自动识别协议）
   * @param buffer 序列化后的报文数据
   * @returns 字段元数据列表
   */
  extractAllFields(buffer: Buffer): IFieldMeta[] {
    const result = this.parse(buffer);
    return result.packet?.field_list || [];
  }
}

/**
 * PacketList 构建器实现
 * 用于构建和序列化报文列表
 */
export class PacketListBuilder {
  private packets: IPacket[] = [];

  /**
   * 添加单个报文
   * @param packet 要添加的报文对象
   */
  addPacket(packet: IPacket): PacketListBuilder {
    this.packets.push(packet);
    return this;
  }

  /**
   * 从 EthernetPacketBuilder 添加报文
   * @param builder 以太网报文构建器
   */
  addFromBuilder(builder: EthernetPacketBuilder): PacketListBuilder {
    const packet = new Packet({
      field_list: builder.getFields(),
    });
    this.packets.push(packet);
    return this;
  }

  /**
   * 批量添加报文
   * @param packets 报文数组
   */
  addPackets(packets: IPacket[]): PacketListBuilder {
    this.packets.push(...packets);
    return this;
  }

  /**
   * 获取报文数量
   */
  getPacketCount(): number {
    return this.packets.length;
  }

  /**
   * 获取所有报文
   */
  getPackets(): IPacket[] {
    return this.packets;
  }

  /**
   * 清空报文列表
   */
  clear(): PacketListBuilder {
    this.packets = [];
    return this;
  }

  /**
   * 构建并序列化报文列表
   * @param protocolType 协议类型
   * @returns 序列化后的 Buffer
   */
  build(protocolType: ThriftFullProtocolType = ThriftPresets.DEFAULT): Buffer {
    let capturedFlushBuffer: Buffer | null = null;
    const factory = new ThriftProtocolFactory(thrift);
    const { transport, protocol } = factory.createByFullType(
      protocolType,
      (msg: Buffer) => {
        capturedFlushBuffer = msg;
      }
    );

    const packetList = new PacketList({
      pkt_list: this.packets,
    });

    // 执行写入操作
    packetList.write(protocol);
    if (typeof transport.flush === "function") {
      transport.flush();
    }

    return capturedFlushBuffer || Buffer.alloc(0);
  }
}

/**
 * PacketList 解析结果接口
 */
export interface IPacketListParseResult {
  /** 解析后的报文列表对象，解析失败时为 null */
  packetList: IPacketList | null;
  /** 解析过程中的错误列表 */
  errors: string[];
  /** 成功使用的策略名称，解析失败时为 null */
  strategy: string | null;
}

/**
 * PacketList 解析器实现
 * 用于从二进制数据反序列化报文列表
 */
export class PacketListParser {
  private factory: ThriftProtocolFactory;

  /** 复用与 EthernetPacketParser 相同的解析策略 */
  private static readonly PARSE_STRATEGIES =
    EthernetPacketParser["PARSE_STRATEGIES"];

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
    protocolType: ThriftFullProtocolType
  ): IPacketList {
    const { protocol } = this.factory.createReaderByFullType(
      protocolType,
      data
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
    protocolType: ThriftFullProtocolType
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
  parse(buffer: Buffer): IPacketListParseResult {
    const errors: string[] = [];

    for (const strategy of PacketListParser.PARSE_STRATEGIES) {
      try {
        let packetList: IPacketList | null = null;

        if (strategy.stripFrame) {
          packetList = this.tryStripFrameAndDeserialize(
            buffer,
            strategy.framePrefixLen!,
            strategy.byteOrder!,
            strategy.protocolType
          );
        } else {
          packetList = this.tryDeserializeWithProtocol(
            buffer,
            strategy.protocolType
          );
        }

        if (
          packetList &&
          packetList.pkt_list &&
          packetList.pkt_list.length > 0
        ) {
          return {
            packetList,
            errors,
            strategy: strategy.name,
          };
        }
      } catch (e) {
        const errorMsg = `${strategy.name}: ${
          e instanceof Error ? e.message : String(e)
        }`;
        errors.push(errorMsg);
      }
    }

    return {
      packetList: null,
      errors,
      strategy: null,
    };
  }

  /**
   * 从 Buffer 反序列化报文列表（指定协议类型）
   * @param buffer 序列化后的报文列表数据
   * @param protocolType 协议类型
   * @returns 解析后的 PacketList 对象
   */
  parseWithProtocol(
    buffer: Buffer,
    protocolType: ThriftFullProtocolType
  ): IPacketList {
    return this.tryDeserializeWithProtocol(buffer, protocolType);
  }

  /**
   * 获取报文列表中的所有报文
   * @param buffer 序列化后的报文列表数据
   * @returns 报文数组
   */
  extractPackets(buffer: Buffer): IPacket[] {
    const result = this.parse(buffer);
    return result.packetList?.pkt_list || [];
  }

  /**
   * 获取报文数量
   * @param buffer 序列化后的报文列表数据
   * @returns 报文数量
   */
  getPacketCount(buffer: Buffer): number {
    const result = this.parse(buffer);
    return result.packetList?.pkt_list?.length || 0;
  }

  /**
   * 从报文列表中提取指定索引的报文校验器
   * @param buffer 序列化后的报文列表数据
   * @param index 报文索引（从 0 开始）
   * @returns 报文校验器实例，如果索引越界则返回 null
   */
  getValidatorAt(
    buffer: Buffer,
    index: number
  ): EthernetPacketValidator | null {
    const result = this.parse(buffer);
    if (
      !result.packetList?.pkt_list ||
      index < 0 ||
      index >= result.packetList.pkt_list.length
    ) {
      return null;
    }
    return new EthernetPacketValidator(result.packetList.pkt_list[index]);
  }

  /**
   * 从报文列表中提取所有报文的校验器
   * @param buffer 序列化后的报文列表数据
   * @returns 报文校验器数组
   */
  getAllValidators(buffer: Buffer): EthernetPacketValidator[] {
    const result = this.parse(buffer);
    if (!result.packetList?.pkt_list) {
      return [];
    }
    return result.packetList.pkt_list.map(
      (packet: IPacket) => new EthernetPacketValidator(packet)
    );
  }
}
