import { StreamPort } from "../traffic/model";
import { streamPorts } from "../config/traffic";
import { StreamBackendConfig, StreamControlConfig } from "../config/backends";
import { TopoBackendConfig } from "../config/topo";
import { loadConfig } from "../config/loader";
import { DUT_DEFAULT_CONFIG } from "./dut-defaults";

export { StreamPort };
export { StreamBackendConfig, StreamControlConfig, TopoBackendConfig };

const cfg = loadConfig();

export class Config {
  /**
   * 自动测试使用的拓扑名称。
   * TestHelper.init() 会按该名称查找并删除同名旧拓扑，再重新创建。
   */
  public static readonly defaultTopoName = cfg.topo.name;

  /**
   * DUT 默认连接参数。
   *
   * 行为默认值在 `dut-defaults.ts`；账号、密码、protocol 等环境差异
   * 由 config/env/default.json + local.json 的 `dut.connection` 覆盖。
   */
  public static default_cfg = {
    ...DUT_DEFAULT_CONFIG,
    ...cfg.dut.connection,
  };

  /** 流量端口配置（顺序即 StreamPort.A/B/C...） */
  public static readonly streamPorts = streamPorts;

  /**
   * 流量后端服务连接配置（服务级，不属于端口实例）。
   *
   * - renix / scapy：共用同一个 HTTP 服务；
   * - stream-linux：streamcontrol gRPC 网关。
   */
  public static get trafficBackends() {
    return {
      renix: StreamBackendConfig,
      scapy: StreamBackendConfig,
      "stream-linux": StreamControlConfig,
    };
  }

  /** DUT 清单，顺序对应 DutIdx.A ~ DutIdx.L */
  public static dut_list = cfg.dut.list;
}
