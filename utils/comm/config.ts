export interface StreamPort {
  name: string;
  type: "renix" | "scapy";
}

export class RenixPort {
  static get A(): StreamPort {
    return Config.Renix.portList[0].port;
  }
  static get B(): StreamPort {
    return Config.Renix.portList[1].port;
  }
  static get C(): StreamPort {
    return Config.Renix.portList[2].port;
  }
  static get D(): StreamPort {
    return Config.Renix.portList[3].port;
  }
}

/**
 * 打流/抓包后端服务（stream backend）地址配置。
 *
 * IP、端口集中在此维护，stream-backend-api.ts 只负责拼接接口路径，
 * 避免地址硬编码在各个请求里、切换环境时到处改。
 * 可通过环境变量覆盖：STREAM_BACKEND_HOST / STREAM_BACKEND_PORT /
 * STREAM_BACKEND_USERNAME / STREAM_BACKEND_PASSWORD。
 */
export class StreamBackendConfig {
  static readonly host = process.env.STREAM_BACKEND_HOST || "172.16.9.1";
  static readonly port = process.env.STREAM_BACKEND_PORT || "8001";
  /** 默认登录账号 */
  static readonly username = process.env.STREAM_BACKEND_USERNAME || "test";
  static readonly password = process.env.STREAM_BACKEND_PASSWORD || "autotest";

  /** 服务根地址，如 http://172.16.9.1:8001 */
  static get origin(): string {
    return `http://${this.host}:${this.port}`;
  }

  /** 业务接口 baseURL，如 http://172.16.9.1:8001/api/backend_proxy */
  static get baseURL(): string {
    return `${this.origin}/api/backend_proxy`;
  }

  /** 登录接口完整地址，如 http://172.16.9.1:8001/api/auth/login/ */
  static get loginURL(): string {
    return `${this.origin}/api/auth/login/`;
  }
}

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
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.106", if_index: 1 },
      { device: "172.16.9.106", if_index: 2 },
      { device: "172.16.9.106", if_index: 3 },
      { device: "172.16.9.106", if_index: 4 },
    ],
  };

  public static dut_e530_108 = {
    host: "172.16.9.108",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.106", if_index: 5 },
      { device: "172.16.9.106", if_index: 6 },
      { device: "172.16.9.106", if_index: 7 },
      { device: "172.16.9.106", if_index: 8 },
    ],
  };

  public static dut_e530_104 = {
    host: "172.16.9.104",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.105", if_index: 1 },
      { device: "172.16.9.105", if_index: 2 },
      { device: "172.16.9.105", if_index: 3 },
      { device: "172.16.9.105", if_index: 4 },
    ],
  };

  public static dut_e530_109 = {
    host: "172.16.9.109",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.105", if_index: 5 },
      { device: "172.16.9.105", if_index: 6 },
      { device: "172.16.9.105", if_index: 7 },
      { device: "172.16.9.105", if_index: 8 },
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
    host: "172.16.9.130",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.106", if_index: 13 },
      { device: "172.16.9.106", if_index: 14 },
      { device: "172.16.9.106", if_index: 15 },
      { device: "172.16.9.106", if_index: 16 },
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

  public static Renix: {
    portList: {
      port: StreamPort;
      portMapping: { device: string; if_index: number };
    }[];
  } = {
    portList: [
      {
        port: { name: "//172.16.254.11/3/13", type: "renix" },
        portMapping: { device: "172.16.9.110", if_index: 305 },
      },
      {
        port: { name: "//172.16.254.11/3/14", type: "renix" },
        portMapping: { device: "172.16.9.110", if_index: 561 },
      },
      {
        port: { name: "//172.16.254.11/3/15", type: "renix" },
        portMapping: { device: "172.16.9.110", if_index: 817 },
      },
      {
        port: { name: "//172.16.254.11/3/15", type: "renix" },
        portMapping: { device: "172.16.9.110", if_index: 1073 },
      },
      {
        port: {
          name: "\\Device\\NPF_{D0DB71B0-1C1E-419C-8360-20C25AF8A6E1}",
          type: "scapy",
        },
        portMapping: { device: "172.16.9.110", if_index: 23 },
      },
      {
        port: {
          name: "\\Device\\NPF_{02DCC5B0-C8A6-4440-9362-21B78C286280}",
          type: "scapy",
        },
        portMapping: { device: "172.16.9.110", if_index: 24 },
      },
      {
        port: {
          name: "\\Device\\NPF_{CD6CB24F-5008-4F71-8D48-2E92DB1DAA88}",
          type: "scapy",
        },
        portMapping: { device: "172.16.9.106", if_index: 32 },
      },
      {
        port: { name: "//172.16.254.11/5/1", type: "renix" },
        portMapping: { device: "172.16.9.106", if_index: 25 },
      },
      {
        port: { name: "//172.16.254.11/5/2", type: "renix" },
        portMapping: { device: "172.16.9.106", if_index: 25 },
      },
      {
        port: { name: "//172.16.254.11/3/15", type: "renix" },
        portMapping: { device: "172.16.9.106", if_index: 25 },
      },
    ],
  };

  public static dut_list = [
    this.dut_e530_107,
    this.dut_e530_108,
    this.dut_e530_109,
    this.dut_e530_104,
    // this.dut_e670_112,
    // this.dut_e680_120,
    // this.dut_e361_130,
    // this.dut_e730_140,
  ];
}
