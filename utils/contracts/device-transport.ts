/**
 * DUT 传输层契约。
 *
 * Dut 只依赖这几个方法；Telnet / SSH 的具体实现放在 adapters/device。
 */

/** 统一的传输层选项。同时覆盖 Telnet 与 SSH 所需的字段。 */
export interface ITransportOptions {
  protocol?: "telnet" | "ssh";

  // ---- 通用 ----
  /** 远程地址 */
  host: string;
  /** 端口。Telnet 默认 23；SSH 默认 22 */
  port?: number;
  /** 用于匹配命令提示符 / 会话终止的正则(串) */
  shellPrompt?: string | RegExp;
  timeout?: number;
  execTimeout?: number;
  debug?: boolean;
  /** 是否从返回结果中剥离命令提示符。与 telnet-client 默认保持一致（true） */
  stripShellPrompt?: boolean;
  /** 是否剥离控制字符 / ANSI 转义序列。与 telnet-client 默认保持一致（false） */
  stripControls?: boolean;
  /** 缓存输出上限。达到后即便未等到底部提示符也返回（对应 telnet-client 的 maxBufferLength） */
  maxBufferLength?: number;
  /** 分页提示字符串/正则。命中时发送空格翻页（对应 telnet-client 的 pageSeparator） */
  pageSeparator?: string | RegExp;
  portList?: string[];
  portMapping?: { device: string; if_index: number }[];

  // ---- Telnet 相关 ----
  disableLogon?: boolean;
  /** 命令回显丢弃行数，与 telnet-client 的 echoLines 对应（默认 1） */
  echoLines?: number;
  /** 终端宽度（列），非 0 时 telnet-client 会协商 NAWS，避免交换机按 80 列硬换行。默认见 Config.default_cfg */
  terminalWidth?: number;
  /** 终端高度（行），同 terminalWidth */
  terminalHeight?: number;

  // ---- SSH 相关 ----
  /** SSH 登录用户名（账号/密码认证） */
  username?: string;
  /** SSH 登录密码 */
  password?: string;
}

/**
 * 传输层抽象接口。
 * Dut 只依赖这几个方法，具体用 Telnet 还是 SSH 在构造函数里决定。
 */
export interface ITransport {
  connect(opts: ITransportOptions): Promise<void>;
  exec(command: string): Promise<string>;
  end(): Promise<void>;
}
