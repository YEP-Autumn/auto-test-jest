/**
 * Thrift 传输和协议配置工厂
 * 用于管理 4 种不同的 Transport + Protocol 组合
 */

/**
 * Thrift 传输层类型枚举
 */
export enum ThriftTransportType {
  /** 缓冲传输 */
  BUFFERED = "buffered",
  /** 帧传输 */
  FRAMED = "framed",
}

/**
 * Thrift 协议层类型枚举
 */
export enum ThriftProtocolType {
  /** 紧凑协议 - 数据压缩，传输量小 */
  COMPACT = "compact",
  /** 二进制协议 - 标准二进制格式，通用性强 */
  BINARY = "binary",
}

/**
 * Thrift 完整协议类型枚举
 * 组合 Transport + Protocol
 */
export enum ThriftFullProtocolType {
  /** BufferedTransport + CompactProtocol */
  BUFFERED_COMPACT = "buffered_compact",
  /** FramedTransport + BinaryProtocol */
  FRAMED_BINARY = "framed_binary",
  /** BufferedTransport + BinaryProtocol */
  BUFFERED_BINARY = "buffered_binary",
  /** FramedTransport + CompactProtocol */
  FRAMED_COMPACT = "framed_compact",
}

/**
 * Thrift 传输和协议配置接口
 */
export interface IThriftProtocolConfig {
  /** 传输类型 */
  transportType: ThriftTransportType;
  /** 协议类型 */
  protocolType: ThriftProtocolType;
}

/**
 * Thrift 工厂创建结果
 */
export interface IThriftProtocolInstance {
  /** Transport 实例 */
  transport: any;
  /** Protocol 实例 */
  protocol: any;
}

/**
 * Thrift 协议工厂类
 * 用于创建不同组合的 Transport 和 Protocol 实例
 */
export class ThriftProtocolFactory {
  private thrift: any;

  constructor(thrift: any) {
    this.thrift = thrift;
  }

  /**
   * 将完整协议类型转换为配置
   */
  private parseFullProtocolType(
    fullType: ThriftFullProtocolType
  ): IThriftProtocolConfig {
    const mapping: Record<ThriftFullProtocolType, IThriftProtocolConfig> = {
      [ThriftFullProtocolType.BUFFERED_COMPACT]: {
        transportType: ThriftTransportType.BUFFERED,
        protocolType: ThriftProtocolType.COMPACT,
      },
      [ThriftFullProtocolType.FRAMED_BINARY]: {
        transportType: ThriftTransportType.FRAMED,
        protocolType: ThriftProtocolType.BINARY,
      },
      [ThriftFullProtocolType.BUFFERED_BINARY]: {
        transportType: ThriftTransportType.BUFFERED,
        protocolType: ThriftProtocolType.BINARY,
      },
      [ThriftFullProtocolType.FRAMED_COMPACT]: {
        transportType: ThriftTransportType.FRAMED,
        protocolType: ThriftProtocolType.COMPACT,
      },
    };

    return mapping[fullType];
  }

  /**
   * 创建 Transport 实例
   */
  private createTransport(
    transportType: ThriftTransportType,
    callback: (msg: Buffer) => void
  ): any {
    switch (transportType) {
      case ThriftTransportType.BUFFERED:
        return new this.thrift.TBufferedTransport(null, callback);
      case ThriftTransportType.FRAMED:
        return new this.thrift.TFramedTransport(null, callback);
      default:
        throw new Error(`Unknown transport type: ${transportType}`);
    }
  }

  /**
   * 创建 Protocol 实例
   */
  private createProtocol(
    protocolType: ThriftProtocolType,
    transport: any
  ): any {
    switch (protocolType) {
      case ThriftProtocolType.COMPACT:
        return new this.thrift.TCompactProtocol(transport);
      case ThriftProtocolType.BINARY:
        return new this.thrift.TBinaryProtocol(transport);
      default:
        throw new Error(`Unknown protocol type: ${protocolType}`);
    }
  }

  /**
   * 使用完整协议类型创建 Transport 和 Protocol
   * @param fullType 完整协议类型
   * @param callback flush 回调函数
   */
  createByFullType(
    fullType: ThriftFullProtocolType,
    callback: (msg: Buffer) => void
  ): IThriftProtocolInstance {
    const config = this.parseFullProtocolType(fullType);
    return this.createByConfig(config, callback);
  }

  /**
   * 使用配置创建 Transport 和 Protocol
   * @param config 配置对象
   * @param callback flush 回调函数
   */
  createByConfig(
    config: IThriftProtocolConfig,
    callback: (msg: Buffer) => void
  ): IThriftProtocolInstance {
    const transport = this.createTransport(config.transportType, callback);
    const protocol = this.createProtocol(config.protocolType, transport);

    return {
      transport,
      protocol,
    };
  }

  /**
   * 使用传输和协议类型创建
   * @param transportType 传输类型
   * @param protocolType 协议类型
   * @param callback flush 回调函数
   */
  createByTypes(
    transportType: ThriftTransportType,
    protocolType: ThriftProtocolType,
    callback: (msg: Buffer) => void
  ): IThriftProtocolInstance {
    return this.createByConfig({ transportType, protocolType }, callback);
  }

  /**
   * 获取所有支持的完整协议类型
   */
  static getSupportedFullTypes(): ThriftFullProtocolType[] {
    return Object.values(ThriftFullProtocolType);
  }

  /**
   * 获取所有支持的传输类型
   */
  static getSupportedTransportTypes(): ThriftTransportType[] {
    return Object.values(ThriftTransportType);
  }

  /**
   * 获取所有支持的协议类型
   */
  static getSupportedProtocolTypes(): ThriftProtocolType[] {
    return Object.values(ThriftProtocolType);
  }

  /**
   * 获取完整协议类型的描述
   */
  static getFullTypeDescription(fullType: ThriftFullProtocolType): string {
    const descriptions: Record<ThriftFullProtocolType, string> = {
      [ThriftFullProtocolType.BUFFERED_COMPACT]:
        "缓冲传输 + 紧凑协议（数据压缩，传输量小）",
      [ThriftFullProtocolType.FRAMED_BINARY]:
        "帧传输 + 二进制协议（标准格式，通用性强）",
      [ThriftFullProtocolType.BUFFERED_BINARY]:
        "缓冲传输 + 二进制协议（标准格式，缓冲处理）",
      [ThriftFullProtocolType.FRAMED_COMPACT]:
        "帧传输 + 紧凑协议（数据压缩，流式传输）",
    };

    return descriptions[fullType] || "Unknown protocol type";
  }
}

/**
 * Thrift 协议预设配置
 * 提供常用的协议组合预设
 */
export const ThriftPresets = {
  /**
   * 默认配置 - 通用，适合大多数场景
   */
  DEFAULT: ThriftFullProtocolType.BUFFERED_BINARY,

  /**
   * 紧凑配置 - 数据量优化，传输压缩
   */
  COMPACT: ThriftFullProtocolType.BUFFERED_COMPACT,

  /**
   * 流式配置 - 适合流式数据传输
   */
  STREAMING: ThriftFullProtocolType.FRAMED_BINARY,

  /**
   * 紧凑流式配置 - 同时优化数据量和流式传输
   */
  COMPACT_STREAMING: ThriftFullProtocolType.FRAMED_COMPACT,
};
