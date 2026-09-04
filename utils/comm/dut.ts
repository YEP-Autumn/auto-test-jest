import { Config } from "./config";
import {
  ITransport,
  ITransportOptions,
  SshConnection,
  TelnetConnection,
} from "./transport";

/**
 * Device Under Test
 */
export class Dut {
  private conn_param: ITransportOptions;
  private transport: ITransport;

  private lastCmdMode = "Switch# ";

  constructor(conn_param: ITransportOptions) {
    // 浅拷贝合并，避免就地修改并共享 Config.default_cfg（否则所有 Dut 的 host 会被最后一次连接覆盖）
    this.conn_param = Object.assign({}, Config.default_cfg, conn_param);

    // 根据 protocol 字段选择传输方式，默认 Telnet，向后兼容。
    const protocol = this.conn_param.protocol ?? "telnet";
    this.transport =
      protocol === "ssh" ? new SshConnection() : new TelnetConnection();
  }

  public async connect() {
    await this.transport.connect(this.conn_param);

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
