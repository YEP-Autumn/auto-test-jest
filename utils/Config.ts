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
  };

  public static dut_list = [this.dutA, this.dutB, this.dutC];
}
