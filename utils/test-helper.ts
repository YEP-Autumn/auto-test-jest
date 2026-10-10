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
  StopStream,
  toRegExp,
} from "./comm/components";
import { Config, StreamPort } from "./comm/config";
import { Dut } from "./comm/dut";
import { StreamBackendApi } from "./stream/stream-backend-api";
import { TopoApi } from "./topo/topo-backend-api";
import { TopoLinks } from "./topo/types";

export let DeviceARouteMac: string;
export let DeviceBRouteMac: string;
export let DeviceCRouteMac: string;
export let DeviceDRouteMac: string;

/** DUT 索引，与 Config.dut_list / this.dut_list 的下标一一对应 */
export enum DutIdx {
  A = 0,
  B = 1,
  C = 2,
  D = 3,
  E = 4,
  F = 5,
  G = 6,
  H = 7,
}

export class TestHelper {
  private dut_list: Dut[] = [];
  private actuator: Actuator[] = [];
  private testResult: boolean = true;
  private topo: TopoLinks | undefined;
  private streamBackendApi: StreamBackendApi | undefined;
  private topoApi: TopoApi;
  private topoId?: number;
  private _inner_debug_preserve_scene_when_failed: boolean = false;

  private streamPortSet: Map<string, StreamPort> = new Map();

  constructor(topo?: TopoLinks) {
    this.topoApi = new TopoApi();
    this.topo = topo;
  }

  /**
   * 按索引获取已连接的 DUT，并做存在性校验。
   * 避免在 Config.dut_list 未配置对应设备时，后续 replaceCmdTemplate 访问
   * undefined.getPortList() 抛出难以定位的异常。
   */
  private getDut(idx: DutIdx): Dut {
    const dut = this.dut_list[idx];
    if (!dut) {
      throw new Error(
        `DUT ${DutIdx[idx]} 未配置或未初始化（dut_list 长度=${this.dut_list.length}，` +
          `Config.dut_list 长度=${Config.dut_list.length}）。请检查 Config.dut_list 配置。`,
      );
    }
    return dut;
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
      const existing = topologies.find(
        (t) => t.name === Config.defaultTopoName,
      );
      if (existing) {
        await this.topoApi.delete(existing.id);
      }
      const res = await this.topoApi.create(Config.defaultTopoName);
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
      for (const port of this.streamPortSet.values()) {
        promise.push(this.streamBackendApi.port_release(port));
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
    this.testResult = true;

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
        act instanceof PacketChecker ||
        act instanceof StopStream
      ) {
        if (!this.testResult) {
          continue;
        }

        if (this.streamBackendApi == undefined) {
          try {
            this.streamBackendApi = new StreamBackendApi();
            await this.streamBackendApi.login();
            /** 预约Renix端口 */
            for (const port of this.streamPortSet.values()) {
              await this.streamBackendApi.port_reserve(port);
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

    this.actuator = [];

    return this;
  }

  result() {
    return this.testResult;
  }

  startCapture(stream_port: StreamPort) {
    this.streamPortSet.set(stream_port.name, stream_port);
    this.actuator.push(new StartCapture(stream_port));
    return this;
  }

  addPktSender(packetSendParam: PacketSendParam) {
    this.streamPortSet.set(packetSendParam.port.name, packetSendParam.port);
    this.actuator.push(new PacketSender(packetSendParam));
    return this;
  }

  stopStream(stream_port: StreamPort) {
    this.streamPortSet.set(stream_port.name, stream_port);
    this.actuator.push(new StopStream(stream_port));
    return this;
  }

  /**
   * 获取从startCapture开始到当前的所有报文，并进行报文校验。（会自动调用stopCapture）
   * @param packetCheckParam
   * @returns
   */
  addPktChecker(packetCheckParam: PacketCheckParam) {
    this.streamPortSet.set(packetCheckParam.port.name, packetCheckParam.port);
    this.actuator.push(new PacketChecker(packetCheckParam));
    return this;
  }

  /** Exec Config */
  ExecConfigDut(idx: DutIdx, config: string[]) {
    const dut = this.getDut(idx);
    const cmds = replaceCmdTemplates([...config], dut);
    this.actuator.push(new ExecConfig(dut, cmds));
    return this;
  }

  ExecConfigDutA(config: string[]) {
    return this.ExecConfigDut(DutIdx.A, config);
  }

  ExecConfigDutB(config: string[]) {
    return this.ExecConfigDut(DutIdx.B, config);
  }

  ExecConfigDutC(config: string[]) {
    return this.ExecConfigDut(DutIdx.C, config);
  }

  ExecConfigDutD(config: string[]) {
    return this.ExecConfigDut(DutIdx.D, config);
  }

  /** Clean Config */
  CleanConfigDut(idx: DutIdx, config: string[]) {
    const dut = this.getDut(idx);
    const cmds = replaceCmdTemplates([...config], dut);
    this.actuator.push(new CleanConfig(dut, cmds));
    return this;
  }

  CleanConfigDutA(config: string[]) {
    return this.CleanConfigDut(DutIdx.A, config);
  }

  CleanConfigDutB(config: string[]) {
    return this.CleanConfigDut(DutIdx.B, config);
  }

  CleanConfigDutC(config: string[]) {
    return this.CleanConfigDut(DutIdx.C, config);
  }

  CleanConfigDutD(config: string[]) {
    return this.CleanConfigDut(DutIdx.D, config);
  }

  /** Exec Match */
  ExecRetMatchDut(
    idx: DutIdx,
    config: string,
    expect: string | RegExp,
    notMatch: boolean = false,
  ) {
    const dut = this.getDut(idx);
    const cmd = replaceCmdTemplate(config, dut);
    this.actuator.push(
      new ExecRetMatch(dut, cmd, toRegExp(expect, dut), notMatch),
    );
    return this;
  }

  ExecRetMatchDutA(
    config: string,
    expect: string | RegExp,
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.A, config, expect, notMatch);
  }

  ExecRetMatchDutB(
    config: string,
    expect: string | RegExp,
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.B, config, expect, notMatch);
  }

  ExecRetMatchDutC(
    config: string,
    expect: string | RegExp,
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.C, config, expect, notMatch);
  }

  ExecRetMatchDutD(
    config: string,
    expect: string | RegExp,
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.D, config, expect, notMatch);
  }

  ReadyCheckDut(
    idx: DutIdx,
    config: string,
    expect: string | RegExp,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    const dut = this.getDut(idx);
    const cmd = replaceCmdTemplate(config, dut);
    this.actuator.push(
      new ReadyCheck(dut, cmd, toRegExp(expect, dut), timeout, notMatch),
    );
    return this;
  }

  ReadyCheckDutA(
    config: string,
    expect: string | RegExp,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    return this.ReadyCheckDut(DutIdx.A, config, expect, timeout, notMatch);
  }

  ReadyCheckDutB(
    config: string,
    expect: string | RegExp,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    return this.ReadyCheckDut(DutIdx.B, config, expect, timeout, notMatch);
  }

  ReadyCheckDutC(
    config: string,
    expect: string | RegExp,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    return this.ReadyCheckDut(DutIdx.C, config, expect, timeout, notMatch);
  }

  ReadyCheckDutD(
    config: string,
    expect: string | RegExp,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    return this.ReadyCheckDut(DutIdx.D, config, expect, timeout, notMatch);
  }

  sleep(milliseconds: number) {
    this.actuator.push(new Sleep(milliseconds));
    return this;
  }

  /**
   * Exec Custom Callback (Read-only or controlled operations)
   * The callback receives a safe `DutHandle` with port alias replacement.
   */
  ExecCustomDut(
    idx: DutIdx,
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    const dut = this.getDut(idx);
    this.actuator.push(new ExecCustom(dut, cb, exec_clean));
    return this;
  }

  ExecCustomDutA(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    return this.ExecCustomDut(DutIdx.A, cb, exec_clean);
  }

  ExecCustomDutB(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    return this.ExecCustomDut(DutIdx.B, cb, exec_clean);
  }

  ExecCustomDutC(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    return this.ExecCustomDut(DutIdx.C, cb, exec_clean);
  }

  ExecCustomDutD(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    return this.ExecCustomDut(DutIdx.D, cb, exec_clean);
  }
}
