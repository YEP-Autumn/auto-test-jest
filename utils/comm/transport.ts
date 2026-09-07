import { Client, ClientChannel } from "ssh2";
import { Telnet } from "telnet-client";

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
  // 默认与 telnet-client 对齐
  private stripShellPrompt = true;
  private stripControls = false;
  private maxBufferLength = 1048576;
  private pageSeparator: RegExp = /-{1,4}\s*More/im;
  private echoLines = 1;

  /** 当前命令累积的输出 */
  private data = "";
  /** 当前正在等待命令结果的 resolve 回调 */
  private pendingResolve?: (v: string) => void;
  private pendingTimer?: NodeJS.Timeout;
  /** exec 串行化队列，避免并发写命令互相污染缓冲 */
  private execQueue: Promise<unknown> = Promise.resolve();

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
    // 对齐 telnet-client 默认值：stripShellPrompt=true, stripControls=false
    this.stripShellPrompt = opts.stripShellPrompt ?? true;
    this.stripControls = opts.stripControls ?? false;
    this.maxBufferLength = opts.maxBufferLength ?? this.maxBufferLength;
    this.echoLines = opts.echoLines ?? 1;
    if (opts.pageSeparator) {
      this.pageSeparator = this.buildRegex(opts.pageSeparator);
    } else {
      // 兼容常见的 `--More--` / `-- More --` / `----More----` 等写法
      this.pageSeparator = /-{1,4}\s*More/im;
    }

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
      // 尽量使用非分页终端类型，避免长输出（如 show run）卡在 --More--
      this.client.shell(
        { term: "dumb", rows: 500, cols: 200 },
        (err, stream) => {
          if (err) return reject(err);
          resolve(stream);
        },
      );
    });
    this.stream.on("data", (d: Buffer) => this.onData(d));

    // 3. 等待首个 shell 提示符，丢弃 banner 等登录横幅
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`[${this.host}] SSH 未等到 shell prompt`)),
        this.execTimeout,
      );
      this.oncePrompt((data) => {
        clearTimeout(timer);
        this.data = "";
        resolve();
      });
    });
  }

  async exec(command: string): Promise<string> {
    // 串行化：同一时刻只有一条命令在等待结果，避免 data 缓冲互相污染
    const res = this.execQueue.then(() => this.execRaw(command));
    // 队列吞掉错误，真正的错误仍由调用者从 res 捕获
    this.execQueue = res.catch(() => undefined);
    return res;
  }

  private async execRaw(command: string): Promise<string> {
    // 清空上次累积
    this.data = "";
    this.stream?.write(command + "\n");

    const raw = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingResolve = undefined;
        this.pendingTimer = undefined;
        // 超时后清空缓冲，避免残留污染下一条命令
        this.data = "";
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

    const hasPrompt = this.shellPrompt.test(this.data);

    // 缓冲超限：即便未等到底部提示符也立即返回（对应 telnet-client 的 bufferexceeded）
    if (this.data.length > this.maxBufferLength) {
      this.settle();
      return;
    }

    // 分页处理：提示符尚未出现，且本数据块落在分页提示上就发送空格翻页。
    // 只检查数据块（chunk）而非累积 data，避免把命令输出里含 'More' 的文本误当成翻页。
    if (
      !hasPrompt &&
      SshConnection.endsWithPage(chunk.toString("utf8"), this.pageSeparator)
    ) {
      this.stream.write(" ");
      return;
    }

    // 等到底部命中 shell 提示符，才认为本条命令输出结束
    if (hasPrompt) {
      this.settle();
    }
  }

  /** 判断数据块结尾是否命中分页提示正则 */
  private static endsWithPage(src: string, p: RegExp): boolean {
    for (let i = src.length - 1; i >= 0; i--) {
      const m = src.slice(i).match(p);
      if (m && m.index === 0 && src.endsWith(m[0])) return true;
    }
    return false;
  }

  /** 触发一次 pendingResolve / readyCallback，并清空缓冲 */
  private settle() {
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

  /**
   * 对原始输出做处理，使其与 telnet-client 返回格式一致。
   * 顺序参考 telnet-client 的 parseData(response 分支)：
   *   1) 剥控制字符（stripControls）
   *   2) 换行符归一化
   *   3) 逐行剥除分页提示残留，并丢弃空行
   *   4) 丢弃命令回显行（echoLines）
   *   5) 末尾行剥除提示符（stripShellPrompt）
   */
  private postProcess(raw: string): string {
    let text = raw;
    if (this.stripControls) {
      // 去 ANSI 转义
      text = text.replace(/\x1B((\[.*?[a-z])|.)/gi, "");
      // 去除除 tab/ll/cr 外的控制字符
      text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
    }
    // 换行归一化（对应 telnet-client 按 irs 拆行的语义）
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    let lines = text.split("\n");

    // 分页残留剥除（对齐 telnet-client：replace(pageSeparator) 后丢弃空行）
    lines = lines.map((l) =>
      this.pageSeparator.test(l) ? l.replace(this.pageSeparator, "") : l,
    );
    lines = lines.filter((l) => l.length > 0);

    // 丢弃命令回显行（对应 telnet-client 的 echoLines）
    if (this.echoLines === 1) lines.shift();
    else if (this.echoLines > 1) lines.splice(0, this.echoLines);
    else if (this.echoLines < 0) lines.splice(0, Math.max(0, lines.length - 2));

    // 末尾行剥除提示符（与 telnet-client 一致，只剥最后一行）
    if (this.stripShellPrompt && lines.length > 0) {
      const idx = lines.length - 1;
      lines[idx] = this.shellPrompt.test(lines[idx])
        ? lines[idx].replace(this.shellPrompt, "")
        : "";
    }

    return lines.join("\n");
  }
}
