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
  static get E(): StreamPort {
    return Config.Renix.portList[4].port;
  }
  static get F(): StreamPort {
    return Config.Renix.portList[5].port;
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

  public static Renix: {
    portList: {
      port: StreamPort;
      portMapping: { device: string; if_index: number };
    }[];
  } = {
    portList: [
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
