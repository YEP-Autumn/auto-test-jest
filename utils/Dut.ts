import { Telnet } from "telnet-client";

export class Dut {
  private conn_param: ICONN_PARAM;
  private connection: Telnet;

  private lastCmdMode = "Switch# ";

  constructor(conn_param: ICONN_PARAM) {
    this.conn_param = conn_param;
    this.connection = new Telnet();
  }

  public async connect() {
    await this.connection.connect(this.conn_param);
    return this;
  }

  public async exec(command: string) {
    let result = await this.connection.exec(command);
    console.log(`[${this.conn_param.host}] ` + this.lastCmdMode + command);
    console.log(result);
    let error = new RegExp(`(\r|\n)% `, "g").exec(result);
    if (error || result.startsWith("% ")) {
      throw new Error(
        `Command Exec Failed!\n${this.lastCmdMode + command}\n${result}`
      );
    }
    let split = new RegExp("Switch.*?# ", "g").exec(result);
    this.lastCmdMode = split ? split[0] : this.lastCmdMode;
    return result;
  }

  public async safeExec(command: string) {
    let result = await this.connection.exec(command);
    console.log(`[s][${this.conn_param.host}] ` + this.lastCmdMode + command);
    console.log(result);
    let split = new RegExp("Switch.*?# ", "g").exec(result);
    this.lastCmdMode = split ? split[0] : this.lastCmdMode;
    return result;
  }

  public async disconnect() {
    await this.connection.end();
    return this;
  }
}

interface ICONN_PARAM {
  host: string /** e.g. "172.16.9.107" */;
  port?: number /** e.g. 23 */;
  shellPrompt: string /** e.g. "Switch\\(.*\\)#" */;
  timeout: number /** e.g. 1000 * 60 * 5 */;
  debug: boolean /** e.g. true */;
  stripShellPrompt: boolean /** e.g. false */;
  stripControls: boolean /** e.g. true */;
  execTimeout: number /** e.g. 1000 * 5 */;
  disableLogon: boolean /** e.g. true */;
}
