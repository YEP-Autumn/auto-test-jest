import {
  Actuator,
  CleanConfig,
  DutHandle,
  ExecConfig,
  ExecCustom,
  ExecRetMatch,
  PacketChecker,
  PacketCheckParam,
  PacketSender,
  PacketSendParam,
  ReadyCheck,
  replaceCmdTemplate,
  replaceCmdTemplates,
  Sleep,
  StartCapture,
} from "./comm/components";
import { Config, RenixPort } from "./comm/config";
import { Dut } from "./comm/dut";
import { StreamBackendApi } from "./stream/stream-backend-api";
import { Topolinks } from "./topo/link-constraint";
import { TopoApi } from "./topo/topo-backend-api";

export let DeviceARouteMac: string;
export let DeviceBRouteMac: string;
export let DeviceCRouteMac: string;
export let DeviceDRouteMac: string;

export class TestHelper {
  private dut_list: Dut[] = [];
  private actuator: Actuator[] = [];
  private testResult: boolean = true;
  private topo: Topolinks | undefined;
  private streamBackendApi: StreamBackendApi | undefined;
  private topoApi: TopoApi;
  private topoId?: number;
  private _inner_debug_preserve_scene_when_failed: boolean = false;

  constructor(topo?: Topolinks) {
    this.topoApi = new TopoApi();
    this.topo = topo;
  }

  async init() {
    await this.topoApi.login();
    for (let i = 0; i < Config.dut_list.length; i++) {
      this.dut_list[i] = await new Dut(Config.dut_list[i]).connect();

      let route_mac = await this.dut_list[i].exec("show route-mac", true);
      let match = /\s+([0-9a-fA-F:.]+)/.exec(route_mac);
      if (0 == i) {
        DeviceARouteMac = match?.[1] || "";
      } else if (1 == i) {
        DeviceBRouteMac = match?.[1] || "";
      } else if (2 == i) {
        DeviceCRouteMac = match?.[1] || "";
      } else if (3 == i) {
        DeviceDRouteMac = match?.[1] || "";
      }
    }

    if (this.topo) {
      const topologies = (await this.topoApi.list()) as {
        id: number;
        name: string;
        links: unknown[];
      }[];
      const existing = topologies.find((t) => t.name === "auto-test-topo");
      if (existing) {
        await this.topoApi.delete(existing.id);
      }
      const res = await this.topoApi.create("auto-test-topo");
      this.topoId = res.id;
      const links = this.topo.links.map((link) => ({
        src_device: link.in_port.device,
        src_port_index: link.in_port.if_index,
        dst_device: link.out_port.device,
        dst_port_index: link.out_port.if_index,
        is_two_way: true,
      }));
      await this.topoApi.bulkAddLinks(this.topoId, links);
      await this.topoApi.enable(this.topoId);
    }

    return this;
  }

  async destroy() {
    let promise = new Array<Promise<unknown>>();

    this.dut_list.forEach((dut) => {
      promise.push(dut.disconnect());
    });

    if (this.streamBackendApi) {
      for (let i = 0; i < Config.Renix.portList.length; i++) {
        promise.push(
          this.streamBackendApi.port_release(Config.Renix.portList[i]),
        );
      }
    }

    if (
      this.topo &&
      this.topoId &&
      this._inner_debug_preserve_scene_when_failed != true
    ) {
      promise.push(this.topoApi.delete(this.topoId));
    }

    return await Promise.all(promise);
  }

  async startTest() {
    for (const act of this.actuator) {
      if (
        this.testResult == false &&
        this._inner_debug_preserve_scene_when_failed == true
      ) {
        break;
      }

      if (
        act instanceof CleanConfig ||
        (act instanceof ExecCustom && act.is_exec_clean() == true)
      ) {
        let ret = await act.start();
        this.testResult = false == ret ? ret : this.testResult;
      } else if (
        act instanceof PacketSender ||
        act instanceof StartCapture ||
        act instanceof PacketChecker
      ) {
        if (!this.testResult) {
          continue;
        }

        if (this.streamBackendApi == undefined) {
          try {
            this.streamBackendApi = new StreamBackendApi();
            await this.streamBackendApi.login();
            /** 预约Renix端口 */
            for (let i = 0; i < Config.Renix.portList.length; i++) {
              await this.streamBackendApi.port_reserve(
                Config.Renix.portList[i],
              );
            }
          } catch (err) {
            console.error("StreamBackendApi init or port_reserve error:", err);
            this.testResult = false;
            continue;
          }
        }
        this.testResult = await act.start(this.streamBackendApi);
      } else {
        this.testResult = this.testResult ? await act.start() : this.testResult;
      }
    }
    return this;
  }

  result() {
    return this.testResult;
  }

  startCapture(renix_port: RenixPort) {
    this.actuator.push(new StartCapture(renix_port));
    return this;
  }

  addPktSender(packetSendParam: PacketSendParam) {
    this.actuator.push(new PacketSender(packetSendParam));
    return this;
  }

  /**
   * 获取从startCapture开始到当前的所有报文，并进行报文校验。（会自动调用stopCapture）
   * @param packetCheckParam
   * @returns
   */
  addPktChecker(packetCheckParam: PacketCheckParam) {
    this.actuator.push(new PacketChecker(packetCheckParam));
    return this;
  }

  /** Exec Config */
  ExecConfigDutA(config: string[]) {
    replaceCmdTemplates(config, this.dut_list[0]);
    this.actuator.push(new ExecConfig(this.dut_list[0], config));
    return this;
  }

  ExecConfigDutB(config: string[]) {
    replaceCmdTemplates(config, this.dut_list[1]);
    this.actuator.push(new ExecConfig(this.dut_list[1], config));
    return this;
  }

  ExecConfigDutC(config: string[]) {
    replaceCmdTemplates(config, this.dut_list[2]);
    this.actuator.push(new ExecConfig(this.dut_list[2], config));
    return this;
  }

  ExecConfigDutD(config: string[]) {
    replaceCmdTemplates(config, this.dut_list[3]);
    this.actuator.push(new ExecConfig(this.dut_list[3], config));
    return this;
  }

  /** Clean Config */
  CleanConfigDutA(config: string[]) {
    replaceCmdTemplates(config, this.dut_list[0]);
    this.actuator.push(new CleanConfig(this.dut_list[0], config));
    return this;
  }

  CleanConfigDutB(config: string[]) {
    replaceCmdTemplates(config, this.dut_list[1]);
    this.actuator.push(new CleanConfig(this.dut_list[1], config));
    return this;
  }

  CleanConfigDutC(config: string[]) {
    replaceCmdTemplates(config, this.dut_list[2]);
    this.actuator.push(new CleanConfig(this.dut_list[2], config));
    return this;
  }

  CleanConfigDutD(config: string[]) {
    replaceCmdTemplates(config, this.dut_list[3]);
    this.actuator.push(new CleanConfig(this.dut_list[3], config));
    return this;
  }

  /** Exec Match */
  ExecRetMatchDutA(config: string, expect: string, notMatch: boolean = false) {
    const cmd = replaceCmdTemplate(config, this.dut_list[0]);
    expect = replaceCmdTemplate(expect, this.dut_list[0]);
    this.actuator.push(
      new ExecRetMatch(this.dut_list[0], cmd, new RegExp(expect), notMatch),
    );
    return this;
  }

  ExecRetMatchDutB(config: string, expect: string, notMatch: boolean = false) {
    const cmd = replaceCmdTemplate(config, this.dut_list[1]);
    expect = replaceCmdTemplate(expect, this.dut_list[1]);
    this.actuator.push(
      new ExecRetMatch(this.dut_list[1], cmd, new RegExp(expect), notMatch),
    );
    return this;
  }

  ExecRetMatchDutC(config: string, expect: string, notMatch: boolean = false) {
    const cmd = replaceCmdTemplate(config, this.dut_list[2]);
    expect = replaceCmdTemplate(expect, this.dut_list[2]);
    this.actuator.push(
      new ExecRetMatch(this.dut_list[2], cmd, new RegExp(expect), notMatch),
    );
    return this;
  }

  ExecRetMatchDutD(config: string, expect: string, notMatch: boolean = false) {
    const cmd = replaceCmdTemplate(config, this.dut_list[3]);
    expect = replaceCmdTemplate(expect, this.dut_list[3]);
    this.actuator.push(
      new ExecRetMatch(this.dut_list[3], cmd, new RegExp(expect), notMatch),
    );
    return this;
  }

  ReadyCheckDutA(
    config: string,
    expect: string,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    const cmd = replaceCmdTemplate(config, this.dut_list[0]);
    expect = replaceCmdTemplate(expect, this.dut_list[0]);
    this.actuator.push(
      new ReadyCheck(
        this.dut_list[0],
        cmd,
        new RegExp(expect),
        timeout,
        notMatch,
      ),
    );
    return this;
  }

  ReadyCheckDutB(
    config: string,
    expect: string,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    const cmd = replaceCmdTemplate(config, this.dut_list[1]);
    expect = replaceCmdTemplate(expect, this.dut_list[1]);
    this.actuator.push(
      new ReadyCheck(
        this.dut_list[1],
        cmd,
        new RegExp(expect),
        timeout,
        notMatch,
      ),
    );
    return this;
  }

  ReadyCheckDutC(
    config: string,
    expect: string,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    const cmd = replaceCmdTemplate(config, this.dut_list[2]);
    expect = replaceCmdTemplate(expect, this.dut_list[2]);
    this.actuator.push(
      new ReadyCheck(
        this.dut_list[2],
        cmd,
        new RegExp(expect),
        timeout,
        notMatch,
      ),
    );
    return this;
  }

  ReadyCheckDutD(
    config: string,
    expect: string,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    const cmd = replaceCmdTemplate(config, this.dut_list[3]);
    expect = replaceCmdTemplate(expect, this.dut_list[3]);
    this.actuator.push(
      new ReadyCheck(
        this.dut_list[3],
        cmd,
        new RegExp(expect),
        timeout,
        notMatch,
      ),
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
  ExecCustomDutA(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    this.actuator.push(
      new ExecCustom(
        this.dut_list[0],
        Config.dut_list[0].portList,
        cb,
        exec_clean,
      ),
    );
    return this;
  }

  ExecCustomDutB(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    this.actuator.push(
      new ExecCustom(
        this.dut_list[1],
        Config.dut_list[1].portList,
        cb,
        exec_clean,
      ),
    );
    return this;
  }

  ExecCustomDutC(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    this.actuator.push(
      new ExecCustom(
        this.dut_list[2],
        Config.dut_list[2].portList,
        cb,
        exec_clean,
      ),
    );
    return this;
  }

  ExecCustomDutD(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    this.actuator.push(
      new ExecCustom(
        this.dut_list[3],
        Config.dut_list[3].portList,
        cb,
        exec_clean,
      ),
    );
    return this;
  }
}
