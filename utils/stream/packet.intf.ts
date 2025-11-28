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
 * 以太网报文构建器接口
 * 用于构建和管理以太网报文的各个层级
 */
export interface IEthernetPacketBuilder {
  /**
   * 设置以太网II帧
   * @param dst 目的MAC地址 (格式: xxxx.xxxx.xxxx)
   * @param src 源MAC地址 (格式: xxxx.xxxx.xxxx)
   * @param type 以太网类型 (0x0800=IPv4, 0x8100=VLAN, 0x86DD=IPv6)
   */
  setEthernet(dst: string, src: string, type: number): IEthernetPacketBuilder;

  /**
   * 设置VLAN标签
   * @param vlan VLAN ID (1-4094)
   * @param type 上层协议类型
   */
  setVLAN(vlan: number, type: number): IEthernetPacketBuilder;

  /**
   * 设置IPv4协议头
   * @param srcIp 源IP地址
   * @param dstIp 目的IP地址
   */
  setIPv4(srcIp: number, dstIp: number): IEthernetPacketBuilder;

  /**
   * 获取构建的报文
   */
  build(protocolType?: ThriftFullProtocolType): IPacket;

  /**
   * 获取字段列表
   */
  getFields(): IFieldMeta[];

  /**
   * 清空所有字段
   */
  clear(): IEthernetPacketBuilder;
}

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
 * 以太网报文校验器接口
 * 用于验证报文是否包含特定的协议头和字段值
 */
export interface IEthernetPacketValidator {
  /**
   * 检验是否存在以太网II帧
   */
  hasEthernet(): boolean;

  /**
   * 验证以太网II帧的详细信息
   * @param dst 目的MAC地址 (可选)
   * @param src 源MAC地址 (可选)
   * @param type 以太网类型 (可选)
   */
  validateEthernet(
    dst?: string,
    src?: string,
    type?: number
  ): IValidationResult;

  /**
   * 检验是否存在VLAN标签
   */
  hasVLAN(): boolean;

  /**
   * 验证VLAN标签的详细信息
   * @param vlan VLAN ID (可选)
   * @param type 上层协议类型 (可选)
   */
  validateVLAN(vlan?: number, type?: number): IValidationResult;

  /**
   * 检验是否存在IPv4协议头
   */
  hasIPv4(): boolean;

  /**
   * 验证IPv4协议头的详细信息
   * @param srcIp 源IP地址 (可选)
   * @param dstIp 目的IP地址 (可选)
   */
  validateIPv4(srcIp?: number, dstIp?: number): IValidationResult;

  /**
   * 获取特定类型的字段
   * @param fieldType 字段类型
   */
  getField(fieldType: number): IFieldMeta | undefined;

  /**
   * 获取所有字段
   */
  getAllFields(): IFieldMeta[];

  /**
   * 获取字段数量
   */
  getFieldCount(): number;
}
