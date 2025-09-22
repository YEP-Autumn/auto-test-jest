import {
  Actuator,
  CleanConfig,
  ExecConfig,
  ExecRetMatch,
  Sleep,
} from "./comm/Components";
import { Config } from "./comm/Config";
import { Dut } from "./comm/Dut";

export class TestHelper {
  private dut_list: Dut[] = [];
  private actuator: Actuator[] = [];
  private testResult: boolean = true;
  constructor() {}

  async init() {
    for (let i = 0; i < Config.dut_list.length; i++) {
      this.dut_list[i] = await new Dut(Config.dut_list[i]).connect();
    }
    return this;
  }

  async destroy() {
    let promise = new Array<Promise<Dut>>();
    this.dut_list.forEach((dut) => {
      promise.push(dut.disconnect());
    });
    return await Promise.all(promise);
  }

  async startTest() {
    for (let i = 0; i < this.actuator.length; i++) {
      if (this.actuator[i] instanceof CleanConfig) {
        let ret = await this.actuator[i].start();
        this.testResult = false == ret ? ret : this.testResult;
      } else {
        this.testResult = this.testResult
          ? await this.actuator[i].start()
          : this.testResult;
      }
    }
    return this;
  }

  result() {
    return this.testResult;
  }

  ExecConfigDutA(config: string[]) {
    this.actuator.push(new ExecConfig(this.dut_list[0], config));
    return this;
  }

  ExecConfigDutB(config: string[]) {
    this.actuator.push(new ExecConfig(this.dut_list[1], config));
    return this;
  }

  ExecConfigDutC(config: string[]) {
    this.actuator.push(new ExecConfig(this.dut_list[2], config));
    return this;
  }

  CleanConfigDutA(config: string[]) {
    this.actuator.push(new CleanConfig(this.dut_list[0], config));
    return this;
  }

  CleanConfigDutB(config: string[]) {
    this.actuator.push(new CleanConfig(this.dut_list[1], config));
    return this;
  }

  CleanConfigDutC(config: string[]) {
    this.actuator.push(new CleanConfig(this.dut_list[2], config));
    return this;
  }

  ExecRetMatchDutA(config: string, expect: RegExp, notMatch: boolean = false) {
    this.actuator.push(
      new ExecRetMatch(this.dut_list[0], config, expect, notMatch)
    );
    return this;
  }

  ExecRetMatchDutB(config: string, expect: RegExp, notMatch: boolean = false) {
    this.actuator.push(
      new ExecRetMatch(this.dut_list[1], config, expect, notMatch)
    );
    return this;
  }

  ExecRetMatchDutC(config: string, expect: RegExp, notMatch: boolean = false) {
    this.actuator.push(
      new ExecRetMatch(this.dut_list[2], config, expect, notMatch)
    );
    return this;
  }

  sleep(milliseconds: number) {
    this.actuator.push(new Sleep(milliseconds));
    return this;
  }
}
