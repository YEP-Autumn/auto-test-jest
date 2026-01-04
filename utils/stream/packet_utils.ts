import {
  ThriftFullProtocolType,
  ThriftPresets,
  ThriftProtocolFactory,
} from "./thrift-protocol.factory";
import { IFieldMeta, Packet, thrift } from "./thrift_packet";

export function i16_to_u16(value: any): any {
  return typeof value === "number" ? (value >>> 0) & 0xffff : value;
}

export function i32_to_u32(value: any): any {
  return typeof value === "number" ? (value >>> 0) & 0xffffffff : value;
}

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
  protocolType: ThriftFullProtocolType = ThriftPresets.DEFAULT
): Buffer {
  let capturedFlushBuffer: Buffer | null = null;
  const factory = new ThriftProtocolFactory(thrift);
  const { transport, protocol } = factory.createByFullType(
    protocolType,
    (msg: Buffer) => {
      capturedFlushBuffer = msg;
    }
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
