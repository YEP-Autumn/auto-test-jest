import { ThriftFullProtocolType } from "./thrift-protocol.factory";

export const thrift = require("thrift");
const ttypes = require("../rpc/gen-nodejs/packet_types");

export const { Packet, EthernetII, VLAN, IPv4, FieldMeta, Field, FieldType } =
  ttypes;

// 类型定义
export type IPacket = any;
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
