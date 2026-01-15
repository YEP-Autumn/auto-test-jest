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
    shellPrompt: "(Switch.*#|password:)",
    timeout: 1000 * 60 * 5,
    debug: true,
    stripShellPrompt: false,
    stripControls: true,
    execTimeout: 1000 * 30,
    disableLogon: true,
  };

  public static dut_e530_1 = {
    host: "172.16.9.106",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
  };

  public static dut_e530_2 = {
    host: "172.16.9.107",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: ["eth-0-5", "eth-0-6", "eth-0-7", "eth-0-8"],
  };

  public static dut_e670 = {
    host: "172.16.9.110",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: ["eth-0-25", "eth-0-26", "eth-0-27", "eth-0-28"],
  };

  public static dut_e680 = {
    host: "172.16.9.120",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: ["eth-0-9", "eth-0-10", "eth-0-11", "eth-0-12"],
  };

  public static dut_e780 = {
    host: "172.16.9.130",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: ["eth-0-29", "eth-0-30", "eth-0-31", "eth-0-32"],
  };

  public static Renix = {
    portList: [RenixPort.A, RenixPort.B],
    portMapping: ["eth-0-23", "eth-0-24"],
  };

  public static dut_list = [
    this.dut_e670,
    this.dut_e680,
    this.dut_e530_1,
    this.dut_e530_2,
  ];
  // public static dut_list = [this.dut_e530_1, this.dut_e530_2];
}
