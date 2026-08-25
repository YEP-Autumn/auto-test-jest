import { Config } from "./config";
import {
  ITransport,
  ITransportOptions,
  SshConnection,
  TelnetConnection,
} from "./transport";

export class Dut {
  private conn_param: ICONN_PARAM;
  private transport: ITransport;

  private lastCmdMode = "Switch# ";

  constructor(conn_param: ICONN_PARAM) {
    this.conn_param = conn_param;

    // 根据 protocol 字段选择传输方式，默认 Telnet，向后兼容。
    const protocol = conn_param.protocol ?? "telnet";
    this.transport =
      protocol === "ssh" ? new SshConnection() : new TelnetConnection();
  }

  public async connect() {
    const opts = Object.assign(
      Config.default_cfg,
      this.conn_param,
    ) as ITransportOptions;
    await this.transport.connect(opts);

    return this;
  }

  public async exec(command: string, silence: boolean = false) {
    let result = await this.transport.exec(command);
    if (!silence) {
      console.log(
        `\n[${this.conn_param.host}]: \n` + this.lastCmdMode + command,
      );
      console.log(result);
    }
    let error = new RegExp(`(\r|\n)% `).exec(result);
    if (error || result.startsWith("% ")) {
      throw new Error(
        `Command Exec Failed!\n${this.lastCmdMode + command}\n${result}`,
      );
    }
    let split = new RegExp("Switch.*?# ").exec(result);
    this.lastCmdMode = split ? split[0] : this.lastCmdMode;
    return result;
  }

  public async safeExec(command: string, silence: boolean = false) {
    let result = await this.transport.exec(command);
    if (!silence) {
      console.log(
        `\n[${this.conn_param.host}][s]: \n` + this.lastCmdMode + command,
      );
      console.log(result);
    }
    let split = new RegExp("Switch.*?# ").exec(result);
    this.lastCmdMode = split ? split[0] : this.lastCmdMode;
    return result;
  }

  public async disconnect() {
    await this.transport.end();
    return this;
  }

  public getPortList(): string[] {
    return this.conn_param.portList ?? [];
  }
}

interface ICONN_PARAM extends ITransportOptions {
  host: string /** e.g. "172.16.9.107" */;
  port?: number /** e.g. 23 (telnet) / 22 (ssh) */;
  shellPrompt?: string /** e.g. "Switch\\(.*\\)#" */;
  timeout?: number /** e.g. 1000 * 60 * 5 */;
  debug?: boolean /** e.g. true */;
  stripShellPrompt?: boolean /** e.g. false */;
  stripControls?: boolean /** e.g. true */;
  execTimeout?: number /** e.g. 1000 * 5 */;
  disableLogon?: boolean /** e.g. true */;
  portList?: string[];
  portMapping?: { device: string; if_index: number }[];
}