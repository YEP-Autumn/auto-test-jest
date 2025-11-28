export class Config {
  public static dutA = {
    host: "172.16.9.106",
    port: 23,
    shellPrompt: "Switch.*#",
    timeout: 1000 * 60 * 5,
    debug: true,
    stripShellPrompt: false,
    stripControls: true,
    execTimeout: 1000 * 15,
    disableLogon: true,
    portList: ["eth-0-1", "eth-0-19", "eth-0-3", "eth-0-39"],
  };

  public static dutB = {
    host: "172.16.9.108",
    port: 23,
    shellPrompt: "Switch.*#",
    timeout: 1000 * 60 * 5,
    debug: true,
    stripShellPrompt: false,
    stripControls: true,
    execTimeout: 1000 * 15,
    disableLogon: true,
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-39"],
  };

  public static dutC = {
    host: "172.16.9.107",
    port: 23,
    shellPrompt: "Switch.*#",
    timeout: 1000 * 60 * 5,
    debug: true,
    stripShellPrompt: false,
    stripControls: true,
    execTimeout: 1000 * 15,
    disableLogon: true,
    portList: ["eth-0-2", "eth-0-2", "eth-0-3", "eth-0-39"],
  };

  public static dutD = {
    host: "172.16.9.107",
    port: 23,
    shellPrompt: "Switch.*#",
    timeout: 1000 * 60 * 5,
    debug: true,
    stripShellPrompt: false,
    stripControls: true,
    execTimeout: 1000 * 15,
    disableLogon: true,
    portList: ["eth-0-1", "eth-0-2", "eth-0-3", "eth-0-39"],
  };

  // public static dut_list = [this.dutA, this.dutC, this.dutC, this.dutD];
  // public static dut_list = [this.dutA, this.dutB, this.dutC];
  public static dut_list = [this.dutA, this.dutC];
}
