import { RenixPort } from "../stream/StreamBackendApi";

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
    shellPrompt: "(Switch.*#|password:|CTC_CLI|Password:)",
    timeout: 1000 * 60 * 5,
    debug: true,
    stripShellPrompt: false,
    stripControls: true,
    execTimeout: 1000 * 30,
    disableLogon: true,
  };

  public static dut_e361_1 = {
    host: "172.16.131.198",
    portList: [],
    portMapping: [],
  };

  public static dut_e530_1 = {
    host: "172.16.9.106",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.108", if_index: 1 },
      { device: "172.16.9.108", if_index: 2 },
      { device: "172.16.9.108", if_index: 3 },
      { device: "172.16.9.108", if_index: 4 },
    ],
  };

  public static dut_e530_2 = {
    host: "172.16.9.107",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.108", if_index: 5 },
      { device: "172.16.9.108", if_index: 6 },
      { device: "172.16.9.108", if_index: 7 },
      { device: "172.16.9.108", if_index: 8 },
    ],
  };

  public static dut_e670 = {
    host: "172.16.9.110",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [],
  };

  public static dut_e680 = {
    host: "172.16.9.120",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.108", if_index: 9 },
      { device: "172.16.9.108", if_index: 10 },
      { device: "172.16.9.108", if_index: 11 },
      { device: "172.16.9.108", if_index: 12 },
    ],
  };

  public static dut_e730 = {
    host: "172.16.2.91",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: [
      { device: "172.16.9.110", if_index: 29 },
      { device: "172.16.9.110", if_index: 30 },
      { device: "172.16.9.110", if_index: 31 },
      { device: "172.16.9.110", if_index: 32 },
    ],
  };

  public static Renix = {
    portList: [RenixPort.A, RenixPort.B, RenixPort.C],
    portMapping: [
      { device: "172.16.9.110", if_index: 23 },
      { device: "172.16.9.110", if_index: 24 },
    ],
  };

  public static dut_list = [
    this.dut_e530_1,
    this.dut_e530_2,
    this.dut_e730,
    this.dut_e680,
    // this.dut_e670,
    // this.dut_e361_1,
  ];
}
