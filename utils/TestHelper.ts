import { Port } from ".";
import config from "../jest.config";
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

  /** Exec Config */
  ExecConfigDutA(config: string[]) {
    replaceIntfA(config);
    this.actuator.push(new ExecConfig(this.dut_list[0], config));
    return this;
  }

  ExecConfigDutB(config: string[]) {
    replaceIntfB(config);
    this.actuator.push(new ExecConfig(this.dut_list[1], config));
    return this;
  }

  ExecConfigDutC(config: string[]) {
    replaceIntfC(config);
    this.actuator.push(new ExecConfig(this.dut_list[2], config));
    return this;
  }

  ExecConfigDutD(config: string[]) {
    replaceIntfD(config);
    this.actuator.push(new ExecConfig(this.dut_list[3], config));
    return this;
  }

  /** Clean Config */
  CleanConfigDutA(config: string[]) {
    replaceIntfA(config);
    this.actuator.push(new CleanConfig(this.dut_list[0], config));
    return this;
  }

  CleanConfigDutB(config: string[]) {
    replaceIntfB(config);
    this.actuator.push(new CleanConfig(this.dut_list[1], config));
    return this;
  }

  CleanConfigDutC(config: string[]) {
    replaceIntfC(config);
    this.actuator.push(new CleanConfig(this.dut_list[2], config));
    return this;
  }

  CleanConfigDutD(config: string[]) {
    replaceIntfD(config);
    this.actuator.push(new CleanConfig(this.dut_list[3], config));
    return this;
  }

  /** Exec Match */
  ExecRetMatchDutA(config: string, expect: RegExp, notMatch: boolean = false) {
    replaceIntfA([config]);
    this.actuator.push(
      new ExecRetMatch(this.dut_list[0], config, expect, notMatch)
    );
    return this;
  }

  ExecRetMatchDutB(config: string, expect: RegExp, notMatch: boolean = false) {
    replaceIntfB([config]);
    this.actuator.push(
      new ExecRetMatch(this.dut_list[1], config, expect, notMatch)
    );
    return this;
  }

  ExecRetMatchDutC(config: string, expect: RegExp, notMatch: boolean = false) {
    replaceIntfC([config]);
    this.actuator.push(
      new ExecRetMatch(this.dut_list[2], config, expect, notMatch)
    );
    return this;
  }

  ExecRetMatchDutD(config: string, expect: RegExp, notMatch: boolean = false) {
    replaceIntfD([config]);
    this.actuator.push(
      new ExecRetMatch(this.dut_list[3], config, expect, notMatch)
    );
    return this;
  }

  sleep(milliseconds: number) {
    this.actuator.push(new Sleep(milliseconds));
    return this;
  }
}

function replaceIntfA(configs: String[]) {
  for (let i = 0; i < configs.length; i++) {
    configs[i] = configs[i].replace(Port.A, Config.dutA.portList[0]);
    configs[i] = configs[i].replace(Port.B, Config.dutA.portList[1]);
    configs[i] = configs[i].replace(Port.C, Config.dutA.portList[2]);
    configs[i] = configs[i].replace(Port.D, Config.dutA.portList[3]);
    // console.log(configs[i], Port.A, Config.dutA.portList[0]);
  }
}

function replaceIntfB(configs: String[]) {
  for (let i = 0; i < configs.length; i++) {
    configs[i] = configs[i].replace(Port.A, Config.dutB.portList[0]);
    configs[i] = configs[i].replace(Port.B, Config.dutB.portList[1]);
    configs[i] = configs[i].replace(Port.C, Config.dutB.portList[2]);
    configs[i] = configs[i].replace(Port.D, Config.dutB.portList[3]);
  }
}

function replaceIntfC(configs: String[]) {
  for (let i = 0; i < configs.length; i++) {
    configs[i] = configs[i].replace(Port.A, Config.dutC.portList[0]);
    configs[i] = configs[i].replace(Port.B, Config.dutC.portList[1]);
    configs[i] = configs[i].replace(Port.C, Config.dutC.portList[2]);
    configs[i] = configs[i].replace(Port.D, Config.dutC.portList[3]);
  }
}

function replaceIntfD(configs: String[]) {
  for (let i = 0; i < configs.length; i++) {
    configs[i] = configs[i].replace(Port.A, Config.dutD.portList[0]);
    configs[i] = configs[i].replace(Port.B, Config.dutD.portList[1]);
    configs[i] = configs[i].replace(Port.C, Config.dutD.portList[2]);
    configs[i] = configs[i].replace(Port.D, Config.dutD.portList[3]);
  }
}
