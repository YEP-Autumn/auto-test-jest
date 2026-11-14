/**
 * 兼容入口（barrel）。
 *
 * 重构后：
 * - PacketBuilder / 报文模型 -> ./packet/model
 * - thrift 编解码          -> ./codec/renix-thrift
 *
 * 保留此文件，确保测试里既有的
 * `import { PacketBuilder } from "@/utils/stream/thrift-packet"` 不需要修改。
 */

export * from "./packet/model";

export {
  thrift,
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
  ThriftFieldType,
  packet_thrift_buffer_build,
  packetListToLayers,
  PacketListParser,
  PARSE_STRATEGIES,
} from "./codec/renix-thrift";

export type { IFieldMeta, IPacketList } from "./codec/renix-thrift";
