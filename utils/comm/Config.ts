export enum RenixPort {
  A = "//192.168.2.11/5/5",
  B = "//192.168.2.11/5/6",
  C = "WIN_NIC1",
  D = "WIN_NIC2",
  E = "WIN_NIC3",
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
    port: 23,
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

  public static Renix = {
    portList: [RenixPort.A, RenixPort.B],
    portMapping: [
      { device: "172.16.9.106", if_index: 25 },
      { device: "172.16.9.106", if_index: 26 },
      // { device: "172.16.9.110", if_index: 9 },
      // { device: "172.16.9.110", if_index: 23 },
      // { device: "172.16.9.110", if_index: 24 },
      // { device: "172.16.9.106", if_index: 32 },
    ],
  };

  public static dut_list = [
    this.dut_e530_107,
    this.dut_e530_108,
    this.dut_e530_109,
    this.dut_e530_104,
    this.dut_e670_112,
    this.dut_e680_120,
    this.dut_e361_130,
    this.dut_e730_140,
  ];
}
