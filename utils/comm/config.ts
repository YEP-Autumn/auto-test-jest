import { StreamPort } from "../traffic/model";
import { streamPorts } from "../config/traffic";
import {
  StreamBackendConfig,
  StreamControlConfig,
} from "../config/backends";
import { TopoBackendConfig } from "../config/topo";

export { StreamPort };
export { StreamBackendConfig, StreamControlConfig, TopoBackendConfig };

export class Config {
  /**
   * Full Example
   * 
    public static dutA = {
      host: "172.16.9.106",
      port: 23,
      shellPrompt: "Switch.*#",
      timeout: 1000 * 60 * 5,
      debug: true,
      stripShellPrompt: false,
      stripControls: true,
      execTimeout: 1000 * 30,
      disableLogon: true,
      portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    };
   */

  /**
   * 自动测试使用的拓扑名称。
   * TestHelper.init() 会按该名称查找并删除同名旧拓扑，再重新创建，
   * 集中在此维护，避免名称散落在测试代码里。
   */
  public static readonly defaultTopoName = "auto-test-topo";

  public static default_cfg = {
    protocol: "telnet",
    username: process.env.DUT_USERNAME,
    password: process.env.DUT_PASSWORD,
    shellPrompt: "(Switch.*#|password:|CTC_CLI|Password:|\\[confirm\\])",
    timeout: 1000 * 60 * 5,
    debug: true,
    stripShellPrompt: false,
    stripControls: true,
    execTimeout: 1000 * 30,
    disableLogon: true,
    // 分页提示：Hohunet 交换机输出分页时发送的是 `\x1b[7m--More--\x1b[m`（ANSI 反显包裹），
    // 必须匹配 `--More--`，否则 telnet-client 永远不发空格翻页，exec 会一直等到 execTimeout 抛 "response not received"。
    pageSeparator: /-{1,4}\s*More/im,
    // 缓存上限放宽到 16MB：长输出（如交换机一次 dump 约 9448 行的配置）默认 1MB 上限会在到达前截断返回，影响正则匹配。
    maxBufferLength: 1024 * 1024 * 16,
    // 协商更大的终端窗口，避免长输出（如 show running-config）被交换机按默认 80 列硬换行，
    // 导致 ExecRetMatch 等按整行正则匹配失败。宽度 500 对齐 SSH 路径的 cols: 200 以上。
    terminalWidth: 500,
    terminalHeight: 200,
  };

  public static dut_e530_107 = {
    host: "172.16.9.107",
    portList: [
      "eth-0-1",
      "eth-0-2",
      "eth-0-3",
      "eth-0-4",
      "eth-0-5",
      "eth-0-6",
    ],
    portMapping: [
      { device: "172.16.9.106", if_index: 1 },
      { device: "172.16.9.106", if_index: 2 },
      { device: "172.16.9.106", if_index: 3 },
      { device: "172.16.9.106", if_index: 4 },
      { device: "172.16.9.106", if_index: 21 },
      { device: "172.16.9.106", if_index: 22 },
    ],
  };

  public static dut_e530_108 = {
    host: "172.16.9.108",
    portList: [
      "eth-0-1",
      "eth-0-2",
      "eth-0-3",
      "eth-0-4",
      "eth-0-5",
      "eth-0-6",
    ],
    portMapping: [
      { device: "172.16.9.106", if_index: 5 },
      { device: "172.16.9.106", if_index: 6 },
      { device: "172.16.9.106", if_index: 7 },
      { device: "172.16.9.106", if_index: 8 },
      { device: "172.16.9.106", if_index: 23 },
      { device: "172.16.9.106", if_index: 24 },
    ],
  };

  public static dut_e530_104 = {
    host: "172.16.9.104",
    portList: [
      "eth-0-1",
      "eth-0-2",
      "eth-0-3",
      "eth-0-4",
      "eth-0-5",
      "eth-0-6",
    ],
    portMapping: [
      { device: "172.16.9.105", if_index: 1 },
      { device: "172.16.9.105", if_index: 2 },
      { device: "172.16.9.105", if_index: 3 },
      { device: "172.16.9.105", if_index: 4 },
      { device: "172.16.9.105", if_index: 9 },
      { device: "172.16.9.105", if_index: 10 },
    ],
  };

  public static dut_e530_109 = {
    host: "172.16.9.109",
    portList: [
      "eth-0-1",
      "eth-0-2",
      "eth-0-3",
      "eth-0-4",
      "eth-0-5",
      "eth-0-6",
    ],
    portMapping: [
      { device: "172.16.9.105", if_index: 5 },
      { device: "172.16.9.105", if_index: 6 },
      { device: "172.16.9.105", if_index: 7 },
      { device: "172.16.9.105", if_index: 8 },
      { device: "172.16.9.105", if_index: 11 },
      { device: "172.16.9.105", if_index: 12 },
    ],
  };

  public static dut_e670_112 = {
    host: "172.16.9.112",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.110", if_index: 13 },
      { device: "172.16.9.110", if_index: 14 },
      { device: "172.16.9.110", if_index: 15 },
      { device: "172.16.9.110", if_index: 16 },
    ],
  };

  public static dut_e670_113 = {
    host: "172.16.9.113",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.110", if_index: 29 },
      { device: "172.16.9.110", if_index: 30 },
      { device: "172.16.9.110", if_index: 31 },
      { device: "172.16.9.110", if_index: 32 },
    ],
  };

  public static dut_e670_114 = {
    host: "172.16.9.114",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.110", if_index: 25 },
      { device: "172.16.9.110", if_index: 26 },
      { device: "172.16.9.110", if_index: 27 },
      { device: "172.16.9.110", if_index: 28 },
    ],
  };

  public static dut_e670_115 = {
    host: "172.16.9.115",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.110", if_index: 33 },
      { device: "172.16.9.110", if_index: 34 },
      { device: "172.16.9.110", if_index: 35 },
      { device: "172.16.9.110", if_index: 36 },
    ],
  };

  public static dut_e680_120 = {
    host: "172.16.9.120",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.106", if_index: 9 },
      { device: "172.16.9.106", if_index: 10 },
      { device: "172.16.9.106", if_index: 11 },
      { device: "172.16.9.106", if_index: 12 },
    ],
  };

  public static dut_e361_130 = {
    host: "172.16.9.131",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.106", if_index: 13 },
      { device: "172.16.9.106", if_index: 14 },
      { device: "172.16.9.106", if_index: 15 },
      { device: "172.16.9.106", if_index: 16 },
    ],
  };

  public static dut_e361_131 = {
    host: "172.16.9.130",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.106", if_index: 17 },
      { device: "172.16.9.106", if_index: 18 },
      { device: "172.16.9.106", if_index: 19 },
      { device: "172.16.9.106", if_index: 20 },
    ],
  };

  public static dut_e730_140 = {
    host: "172.16.9.140",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.110", if_index: 53 },
      { device: "172.16.9.110", if_index: 54 },
      { device: "172.16.9.110", if_index: 55 },
      { device: "172.16.9.110", if_index: 56 },
    ],
  };

  public static dut_e530_150 = {
    host: "172.16.9.150",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.110", if_index: 17 },
      { device: "172.16.9.110", if_index: 18 },
      { device: "172.16.9.110", if_index: 19 },
      { device: "172.16.9.110", if_index: 20 },
    ],
  };

  public static dut_e530_107_stack = {
    host: "172.16.9.107",
    portList: ["eth-1-4", "eth-1-5", "eth-1-6", "eth-1-7"],
    portMapping: [
      { device: "172.16.9.106", if_index: 1 },
      { device: "172.16.9.106", if_index: 2 },
      { device: "172.16.9.106", if_index: 3 },
      { device: "172.16.9.106", if_index: 4 },
    ],
  };

  /**
   * 流量端口配置（兼容入口）。
   *
   * 实际配置在 `utils/config/traffic.ts` 的 `streamPorts`。
   *
   * @deprecated 直接修改 `streamPorts`。
   */
  public static readonly streamPorts = streamPorts;

  /**
   * 流量后端服务连接配置（服务级，不属于端口实例）。
   *
   * - renix / scapy：共用同一个 HTTP 服务，由 StreamBackendConfig 提供
   *   host / port / 账号；
   * - stream-linux：streamcontrol gRPC 网关，由 StreamControlConfig 提供
   *   host / port / TLS / token。
   *
   * `streamPorts` 只回答“从哪个物理端口收发”，这里回答“连哪个服务”。
   */
  public static get trafficBackends() {
    return {
      renix: StreamBackendConfig,
      scapy: StreamBackendConfig,
      "stream-linux": StreamControlConfig,
    };
  }

  public static dut_list = [
    this.dut_e530_104,
    this.dut_e530_107,
    this.dut_e530_108,
    this.dut_e530_109,
    this.dut_e361_130,
    this.dut_e361_131,
    this.dut_e730_140,
    this.dut_e680_120,
    this.dut_e670_112,
    this.dut_e670_113,
    this.dut_e670_114,
    this.dut_e670_115,
  ];
}
