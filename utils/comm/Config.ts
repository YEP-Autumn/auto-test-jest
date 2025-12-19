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

  public static dutA = {
    host: "172.16.9.106",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
  };

  public static dutB = {
    host: "172.16.9.107",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: ["eth-0-5", "eth-0-6", "eth-0-7", "eth-0-8"],
  };

  public static dutC = {
    host: "172.16.9.111",
    portList: ["eth-0-13", "eth-0-14", "eth-0-15", "eth-0-16"],
    portMapping: ["eth-0-25", "eth-0-26", "eth-0-27", "eth-0-28"],
  };

  public static dutD = {
    host: "172.16.9.122",
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-4"],
    portMapping: ["eth-0-9", "eth-0-10", "eth-0-11", "eth-0-12"],
  };

  public static Renix = {
    // portList: [RenixPort.A, RenixPort.B],
    portList: [RenixPort.A],
    portMapping: ["eth-0-23", "eth-0-24"],
  };

  // public static dut_list = [this.dutA, this.dutC, this.dutC, this.dutD];
  public static dut_list = [this.dutA, this.dutB, this.dutD];
}
