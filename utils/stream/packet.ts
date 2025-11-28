import {
  EthernetII,
  Field,
  FieldMeta,
  FieldType,
  IEthernetPacketBuilder,
  IEthernetPacketValidator,
  IFieldMeta,
  IPacket,
  IPv4,
  IValidationResult,
  Packet,
  VLAN,
  thrift,
} from "./packet.intf";
import {
  ThriftProtocolFactory,
  ThriftFullProtocolType,
  ThriftPresets,
} from "./thrift-protocol.factory";

/**
 * 以太网报文构建器实现
 */
export class EthernetPacketBuilder implements IEthernetPacketBuilder {
  private fieldList: IFieldMeta[] = [];
  /**
   * 设置以太网II帧
   */
  setEthernet(dst: string, src: string, type: number): IEthernetPacketBuilder {
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
  setVLAN(vlan: number, type: number): IEthernetPacketBuilder {
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
  setIPv4(srcIp: number, dstIp: number): IEthernetPacketBuilder {
    const ipv4 = new IPv4({
      src_ip: srcIp,
      dst_ip: dstIp,
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
  clear(): IEthernetPacketBuilder {
    this.fieldList = [];
    return this;
  }
}

/**
 * 以太网报文校验器实现
 */
export class EthernetPacketValidator implements IEthernetPacketValidator {
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

// function make_packet_buffer() {

//   let packet = new Packet();

//   let ethernet = new EthernetII();
//   ethernet.src = "0001.0203.1002";
//   ethernet.dst = "0001.0203.1003";
//   ethernet.type = 0x8100;
//   console.log(ethernet);

//   let vlan = new VLAN();
//   vlan.vlan = 100;
//   vlan.type = 0x0800;
//   console.log(vlan);

//   let ipv4 = new IPv4();
//   ipv4.src_ip = 100000;
//   ipv4.dst_ip = 200000;
//   console.log(ipv4);

//   let fieldMeta = new FieldMeta();
//   let fieldMeta2 = new FieldMeta();
//   let fieldMeta3 = new FieldMeta();

//   let field = new Field();
//   let field2 = new Field();
//   let field3 = new Field();

//   field.ether = ethernet;
//   field2.vlan = vlan;
//   field3.ipv4 = ipv4;

//   fieldMeta.field = field;
//   fieldMeta.type = FieldType.EthernetII;

//   fieldMeta2.field = field2;
//   fieldMeta2.type = FieldType.VLAN;

//   fieldMeta3.field = field3;
//   fieldMeta3.type = FieldType.IPV4;

//   packet.field_list = [fieldMeta, fieldMeta2, fieldMeta3];

//   console.log(packet.field_list[0]);

//   let capturedFlushBuffer: Buffer | null = null;
//   const transport: any = new TBufferedTransport(null, (msg: Buffer) => {
//     capturedFlushBuffer = msg;
//   });
//   // const transport: any = new TFramedTransport(null, (msg: Buffer) => {
//   //   capturedFlushBuffer = msg;
//   // });
//   // const protocol: any = new TCompactProtocol(transport);
//   const protocol: any = new TBinaryProtocol(transport);

//   // 3. 执行写入操作
//   packet.write(protocol);
//   if (typeof transport.flush === "function") {
//     transport.flush();
//   }

//   // 4. 获取序列化后的 Buffer（优先使用 flush 回调提供的数据）
//   let serializedBuffer: any = Buffer.alloc(0);
//   if (capturedFlushBuffer && Buffer.isBuffer(capturedFlushBuffer)) {
//     serializedBuffer = capturedFlushBuffer;
//   } else if (
//     Array.isArray(transport.outBuffers) &&
//     transport.outBuffers.length > 0
//   ) {
//     const bufs = transport.outBuffers.map((b: any) =>
//       Buffer.isBuffer(b) ? b : Buffer.from(b)
//     );
//     serializedBuffer = Buffer.concat(bufs);
//   } else if (Buffer.isBuffer(transport.buffer)) {
//     serializedBuffer = transport.buffer;
//   } else if (typeof transport.getvalue === "function") {
//     serializedBuffer = transport.getvalue();
//   } else if (transport.outBuffer && Buffer.isBuffer(transport.outBuffer)) {
//     serializedBuffer = transport.outBuffer;
//   }

//   console.log(
//     "Serialized length:",
//     serializedBuffer ? serializedBuffer.length : 0
//   );
//   console.log("Hex Data:", serializedBuffer.toString("hex"));
//   return serializedBuffer;
// }
