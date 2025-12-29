import {
  Actuator,
  CleanConfig,
  DutHandle,
  ExecConfig,
  ExecCustom,
  ExecRetMatch,
  PacketSender,
  PacketSendParam,
  ReadyCheck,
  replaceIntfA,
  replaceIntfB,
  replaceIntfC,
  replaceIntfD,
  Sleep,
} from "./comm/Components";
import { Config } from "./comm/Config";
import { Dut } from "./comm/Dut";
import { StreamBackendApi } from "./stream/StreamBackendApi";
import { Topolinks } from "./topo/LinkConstraint";
import { TopoApi } from "./topo/TopoApi";

export class TestHelper {
  private dut_list: Dut[] = [];
  private actuator: Actuator[] = [];
  private testResult: boolean = true;
  private topo: Topolinks | undefined;
  private streamBackendApi: StreamBackendApi | undefined;
  private topoApi: TopoApi;
  private _inner_debug: boolean = false;

  constructor(topo?: Topolinks) {
    this.topoApi = new TopoApi();
    this.topo = topo;
  }

  async init() {
    /** 连接交换机 */
    for (let i = 0; i < Config.dut_list.length; i++) {
      this.dut_list[i] = await new Dut(Config.dut_list[i]).connect();
    }
    // 拓扑服务不再进行健康检查，直接进行后续操作

    /** 创建拓扑 */
    if (this.topo) {
      await this.topoApi.topoLinksAdd(this.topo);
    }

    // await new Promise((resolve) => setTimeout(resolve, 2000));

    return this;
  }

  async destroy() {
    let promise = new Array<Promise<Dut>>();

    /** 释放交换机连接 */
    this.dut_list.forEach((dut) => {
      promise.push(dut.disconnect());
    });

    /** 释放Renix端口 */
    if (this.streamBackendApi) {
      for (let i = 0; i < Config.Renix.portList.length; i++) {
        promise.push(
          this.streamBackendApi.port_release(Config.Renix.portList[i])
        );
      }
    }

    /** 删除拓扑 */
    if (this.topo && this._inner_debug != true) {
      promise.push(this.topoApi.topoLinksDelete(this.topo));
    }

    return await Promise.all(promise);
  }

  async startTest() {
    for (let i = 0; i < this.actuator.length; i++) {
      if (this.testResult == false && this._inner_debug == true) {
        break;
      }
      if (this.actuator[i] instanceof CleanConfig) {
        let ret = await this.actuator[i].start();
        this.testResult = false == ret ? ret : this.testResult;
      } else if (this.actuator[i] instanceof PacketSender) {
        if (this.streamBackendApi == undefined) {
          try {
            this.streamBackendApi = new StreamBackendApi();
            /** 预约Renix端口 */
            for (let i = 0; i < Config.Renix.portList.length; i++) {
              await this.streamBackendApi.port_reserve(
                Config.Renix.portList[i]
              );
            }
          } catch (err) {
            console.error("StreamBackendApi init or port_reserve error:", err);
            this.testResult = false;
            continue;
          }
        }
        this.testResult = this.testResult
          ? await this.actuator[i].start(this.streamBackendApi)
          : this.testResult;
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

  addPktSender(packetSendParam: PacketSendParam) {
    this.actuator.push(new PacketSender(packetSendParam));
    return this;
  }

  addPktChecker(any: any) {}

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

  ReadyCheckDutA(config: string, expect: RegExp, timeout: number) {
    replaceIntfA([config]);
    this.actuator.push(
      new ReadyCheck(this.dut_list[0], config, expect, timeout)
    );
    return this;
  }

  ReadyCheckDutB(config: string, expect: RegExp, timeout: number) {
    replaceIntfB([config]);
    this.actuator.push(
      new ReadyCheck(this.dut_list[1], config, expect, timeout)
    );
    return this;
  }

  ReadyCheckDutC(config: string, expect: RegExp, timeout: number) {
    replaceIntfC([config]);
    this.actuator.push(
      new ReadyCheck(this.dut_list[2], config, expect, timeout)
    );
    return this;
  }

  ReadyCheckDutD(config: string, expect: RegExp, timeout: number) {
    replaceIntfD([config]);
    this.actuator.push(
      new ReadyCheck(this.dut_list[3], config, expect, timeout)
    );
    return this;
  }

  sleep(milliseconds: number) {
    this.actuator.push(new Sleep(milliseconds));
    return this;
  }

  /**
   * Exec Custom Callback (Read-only or controlled operations)
   * The callback receives a safe `DutHandle` with port alias replacement.
   */
  ExecCustomDutA(cb: (h: DutHandle) => Promise<boolean> | boolean) {
    this.actuator.push(
      new ExecCustom(this.dut_list[0], Config.dut_list[0].portList, cb)
    );
    return this;
  }

  ExecCustomDutB(cb: (h: DutHandle) => Promise<boolean> | boolean) {
    this.actuator.push(
      new ExecCustom(this.dut_list[1], Config.dut_list[1].portList, cb)
    );
    return this;
  }

  ExecCustomDutC(cb: (h: DutHandle) => Promise<boolean> | boolean) {
    this.actuator.push(
      new ExecCustom(this.dut_list[2], Config.dut_list[2].portList, cb)
    );
    return this;
  }

  ExecCustomDutD(cb: (h: DutHandle) => Promise<boolean> | boolean) {
    this.actuator.push(
      new ExecCustom(this.dut_list[3], Config.dut_list[3].portList, cb)
    );
    return this;
  }
}
