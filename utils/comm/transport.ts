import { Telnet } from "telnet-client";
import { Client, ClientChannel } from "ssh2";

/**
 * 统一的传输层选项。同时覆盖 Telnet 与 SSH 所需的字段。
 * Dut 会把 `Config.default_cfg` 与 `conn_param` 合并后传给 transport。
 */
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
  /** 是否从返回结果中剥离命令提示符（默认 false，与 telnet 路径一致） */
  stripShellPrompt?: boolean;
  /** 是否剥离控制字符 / ANSI 转义序列 */
  stripControls?: boolean;
  portList?: string[];
  portMapping?: { device: string; if_index: number }[];

  // ---- Telnet 相关 ----
  disableLogon?: boolean;

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

/* ====================================================================
 * Telnet 传输实现。
 * 逻辑沿用原 Dut.ts 中 telnet-client 的用法，返回行为保持一致。
 * ==================================================================== */
export class TelnetConnection implements ITransport {
  private connection: Telnet;

  constructor() {
    this.connection = new Telnet();
  }

  async connect(opts: ITransportOptions) {
    await this.connection.connect(opts);
  }

  async exec(command: string) {
    return await this.connection.exec(command);
  }

  async end() {
    await this.connection.end();
  }
}

/* ====================================================================
 * SSH 传输实现。
 * 依赖 ssh2，使用持久 shell 通道（而非一次性 exec），从而保持交换机的
 * configure 模式等有状态会话，行为与 Telnet 路径对齐。
 * ==================================================================== */
export class SshConnection implements ITransport {
  private client: Client;
  private stream?: ClientChannel;
  private host = "";

  private shellPrompt: RegExp = /(?:)/;
  private execTimeout = 1000 * 30;
  private stripShellPrompt = false;
  private stripControls = true;

  /** 当前命令累积的输出 */
  private data = "";
  /** 当前正在等待命令结果的 resolve 回调 */
  private pendingResolve?: (v: string) => void;
  private pendingTimer?: NodeJS.Timeout;

  constructor() {
    this.client = new Client();
  }

  async connect(opts: ITransportOptions) {
    this.host = opts.host;
    this.shellPrompt = this.buildRegex(
      opts.shellPrompt ??
        "(Switch.*?#|password:|CTC_CLI|Password:|\\[confirm\\])",
    );
    this.execTimeout = opts.execTimeout ?? 1000 * 30;
    this.stripShellPrompt = opts.stripShellPrompt ?? false;
    this.stripControls = opts.stripControls ?? true;

    // 1. 建立 SSH 会话（账号/密码认证）
    if (opts.username === undefined) {
      throw new Error(`[${this.host}] SSH 缺少 username`);
    }
    await new Promise<void>((resolve, reject) => {
      const onError = (err: Error) => reject(err);
      this.client.once("error", onError);
      this.client.once("ready", () => {
        this.client.removeListener("error", onError);
        resolve();
      });
      this.client.connect({
        host: opts.host,
        port: opts.port ?? 22,
        username: opts.username,
        password: opts.password,
        keepaliveInterval: opts.timeout ?? 1000 * 60 * 5,
        keepaliveCountMax: 3,
      });
    });

    // 2. 打开交互式 shell，获得双工流
    this.stream = await new Promise<ClientChannel>((resolve, reject) => {
      this.client.shell({ term: "vt100", rows: 120, cols: 200 }, (err, stream) => {
        if (err) return reject(err);
        resolve(stream);
      });
    });
    this.stream.on("data", (d: Buffer) => this.onData(d));

    // 3. 等待首个 shell 提示符，丢弃 banner 等登录横幅
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`[${this.host}] SSH 未等到 shell prompt`)),
        this.execTimeout,
      );
      this.oncePrompt(data => {
        clearTimeout(timer);
        this.data = "";
        resolve();
      });
    });
  }

  async exec(command: string): Promise<string> {
    // 清空上次累积
    this.data = "";
    this.stream?.write(command + "\n");

    const raw = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingResolve = undefined;
        reject(new Error(`[${this.host}] exec '${command}' 超时`));
      }, this.execTimeout);
      this.pendingTimer = timer;
      this.pendingResolve = resolve;
    });
    if (this.pendingTimer) clearTimeout(this.pendingTimer);
    this.pendingTimer = undefined;

    return this.postProcess(raw);
  }

  async end() {
    try {
      if (this.stream) this.stream.end();
    } catch {
      /* ignore */
    }
    this.client.end();
  }

  /* ------------------ 内部实现 ------------------ */

  private onData(chunk: Buffer) {
    if (!this.stream) return;
    this.data += chunk.toString("utf8");

    // 简单分页处理：遇到 More 提示发送空格/回车继续
    if (/----\s*More/.test(this.data)) {
      this.stream.write(" ");
      return;
    }

    // 等到底部命中 shell 提示符，才认为本条命令输出结束
    if (this.shellPrompt.test(this.data)) {
      const result = this.data;
      this.data = "";
      if (this.pendingResolve) {
        const cb = this.pendingResolve;
        this.pendingResolve = undefined;
        cb(result);
      } else if (this.readyCallback) {
        const cb = this.readyCallback;
        this.readyCallback = undefined;
        cb(result);
      }
    }
  }

  /** 连接阶段：等待 shell 提示符后调用回调 */
  private readyCallback?: (v: string) => void;
  private oncePrompt(cb: (v: string) => void) {
    // 可能 shell 建立后输出已提前到达，先检查已有缓冲
    if (this.data && this.shellPrompt.test(this.data)) {
      cb(this.data);
      return;
    }
    this.readyCallback = cb;
  }

  /** 兼容用户传入字符串或 RegExp */
  private buildRegex(src: string | RegExp): RegExp {
    const s = typeof src === "string" ? src : src.source;
    return new RegExp(s);
  }

  /** 对原始输出做处理，使其与 Telnet 路径返回格式一致 */
  private postProcess(raw: string): string {
    let text = raw;
    if (this.stripControls) {
      // 去 ANSI 转义
      text = text.replace(/\x1B((\[.*?[a-z])|.)/gi, "");
      // 去除除 tab/lf/cr 外的控制字符
      text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
    }
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const lines = text.split("\n").filter(l => l.length);
    // 首行是命令回显，丢弃（对应 telnet-client 的 echoLines=1）
    if (lines.length) lines.shift();
    text = lines.join("\n");

    if (this.stripShellPrompt)
      text = text.replace(this.shellPrompt, "\n");

    return text;
  }
}
