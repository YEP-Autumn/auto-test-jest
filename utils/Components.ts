import { Dut } from "./Dut";

export interface Actuator {
  start(): any;
}

export class ExecConfig implements Actuator {
  private conn: Dut;
  private config: string[];
  constructor(conn: Dut, config: string[]) {
    this.conn = conn;
    this.config = config;
  }
  async start(): Promise<boolean> {
    try {
      for (let i = 0; i < this.config.length; i++) {
        await this.conn.exec(this.config[i]);
      }
    } catch (e) {
      console.error("\x1b[31m" + e);
      await this.conn.exec("end");
      return false;
    }
    return true;
  }
}

export class CleanConfig implements Actuator {
  private conn: Dut;
  private config: string[];
  constructor(conn: Dut, config: string[]) {
    this.conn = conn;
    this.config = config;
  }
  async start(): Promise<boolean> {
    for (let i = 0; i < this.config.length; i++) {
      await this.conn.safeExec(this.config[i]);
    }
    return true;
  }
}

export class ExecRetMatch implements Actuator {
  private conn: Dut;
  private config: string;
  private expect: RegExp;
  private notMatch: boolean;

  constructor(conn: Dut, config: string, expect: RegExp, notMatch: boolean) {
    this.conn = conn;
    this.config = config;
    this.expect = expect;
    this.notMatch = notMatch;
  }
  async start(): Promise<boolean> {
    let result = await this.conn.safeExec(this.config);
    if (this.notMatch) {
      return !this.expect.exec(result);
    }
    return !!this.expect.exec(result);
  }
}

export class Sleep implements Actuator {
  private milliseconds: number;
  constructor(milliseconds: number) {
    this.milliseconds = milliseconds;
  }
  async start(): Promise<boolean> {
    console.log(`Sleeping for ${this.milliseconds} milliseconds...`);
    await new Promise((resolve) => setTimeout(resolve, this.milliseconds));
    return true;
  }
}
