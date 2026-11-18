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
} from "./actions/index";
import { Config } from "./config/index";
import { Dut } from "../adapters/device/dut";
import { createTrafficSession } from "./create-session";
import type { TrafficSession } from "./traffic/session";
import type { StreamPort, TrafficPortId } from "../domain/traffic/stream-port";
import { TopoApi } from "../adapters/topology/api";
import { TopoLinks } from "../domain/topology/model";

export let DeviceARouteMac: string;
export let DeviceBRouteMac: string;
export let DeviceCRouteMac: string;
export let DeviceDRouteMac: string;

/** DUT 索引，与 Config.dut_list / this.dut_list 的下标一一对应（最多 12 台） */
export enum DutIdx {
  A = 0,
  B = 1,
  C = 2,
  D = 3,
  E = 4,
  F = 5,
  G = 6,
  H = 7,
  I = 8,
  J = 9,
  K = 10,
  L = 11,
}

export class TestHelper {
  private dut_list: Dut[] = [];
  private actuator: Actuator[] = [];
  private testResult: boolean = true;
  private topo: TopoLinks | undefined;
  private trafficSession: TrafficSession | undefined;
  private topoApi: TopoApi;
  private topoId?: number;
  private _inner_debug_preserve_scene_when_failed: boolean = false;

  private streamPorts: Map<TrafficPortId, StreamPort> = new Map();

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
    try {
      await this.topoApi.login();
      for (let i = 0; i < Config.dut_list.length; i++) {
        const dut = new Dut(Config.dut_list[i]);
        // 先登记再连接：connect 中途失败时，destroy() 仍能统一回收。
        this.dut_list[i] = dut;
        await dut.connect();

        let route_mac = await dut.exec("show route-mac", true);
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
    } catch (err) {
      // init 是资源的唯一获取点，失败时在同一层归还，避免 open handle。
      await this.destroy();
      throw err;
    }
  }

  /**
   * 归还本实例持有的全部资源。
   *
   * 通过取走并清空字段实现幂等：重复调用不会重复释放，
   * 也不需要额外的 destroyed 标志。单个资源释放失败不阻断其它资源。
   */
  async destroy() {
    const duts = this.dut_list.splice(0);
    const trafficSession = this.trafficSession;
    const topoId = this.topoId;
    this.trafficSession = undefined;
    this.topoId = undefined;

    const tasks: Promise<unknown>[] = duts.map((dut) => dut.disconnect());
    if (trafficSession) tasks.push(trafficSession.close());
    if (
      this.topo &&
      topoId &&
      this._inner_debug_preserve_scene_when_failed != true
    ) {
      tasks.push(this.topoApi.delete(topoId));
    }

    await Promise.allSettled(tasks);
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

        if (this.trafficSession == undefined) {
          try {
            this.trafficSession = createTrafficSession();
            /** 建连并预约本测试用到的逻辑端口 */
            await this.trafficSession.init(this.streamPorts.values());
          } catch (err) {
            console.error("TrafficSession init or port_reserve error:", err);
            this.testResult = false;
            continue;
          }
        }
        this.testResult = await act.start(this.trafficSession);
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

  /**
   * 记录本测试用到的逻辑端口。
   *
   * 对外只有 `StreamPort` 令牌；具体 provider/address 在 startTest 时由
   * `TrafficSession` 内部解析，测试用例不需要感知。
   */
  private registerStreamPort(streamPort: StreamPort): StreamPort {
    this.streamPorts.set(streamPort.id, streamPort);
    return streamPort;
  }

  startCapture(stream_port: StreamPort) {
    const port = this.registerStreamPort(stream_port);
    this.actuator.push(new StartCapture(port));
    return this;
  }

  addPktSender(packetSendParam: PacketSendParam) {
    const param: PacketSendParam = {
      ...packetSendParam,
      port: this.registerStreamPort(packetSendParam.port),
    };
    this.actuator.push(new PacketSender(param));
    return this;
  }

  stopStream(stream_port: StreamPort) {
    const port = this.registerStreamPort(stream_port);
    this.actuator.push(new StopStream(port));
    return this;
  }

  /**
   * 获取从startCapture开始到当前的所有报文，并进行报文校验。（会自动调用stopCapture）
   * @param packetCheckParam
   * @returns
   */
  addPktChecker(packetCheckParam: PacketCheckParam) {
    const param: PacketCheckParam = {
      ...packetCheckParam,
      port: this.registerStreamPort(packetCheckParam.port),
    };
    this.actuator.push(new PacketChecker(param));
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

  ExecConfigDutE(config: string[]) {
    return this.ExecConfigDut(DutIdx.E, config);
  }

  ExecConfigDutF(config: string[]) {
    return this.ExecConfigDut(DutIdx.F, config);
  }

  ExecConfigDutG(config: string[]) {
    return this.ExecConfigDut(DutIdx.G, config);
  }

  ExecConfigDutH(config: string[]) {
    return this.ExecConfigDut(DutIdx.H, config);
  }

  ExecConfigDutI(config: string[]) {
    return this.ExecConfigDut(DutIdx.I, config);
  }

  ExecConfigDutJ(config: string[]) {
    return this.ExecConfigDut(DutIdx.J, config);
  }

  ExecConfigDutK(config: string[]) {
    return this.ExecConfigDut(DutIdx.K, config);
  }

  ExecConfigDutL(config: string[]) {
    return this.ExecConfigDut(DutIdx.L, config);
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

  CleanConfigDutE(config: string[]) {
    return this.CleanConfigDut(DutIdx.E, config);
  }

  CleanConfigDutF(config: string[]) {
    return this.CleanConfigDut(DutIdx.F, config);
  }

  CleanConfigDutG(config: string[]) {
    return this.CleanConfigDut(DutIdx.G, config);
  }

  CleanConfigDutH(config: string[]) {
    return this.CleanConfigDut(DutIdx.H, config);
  }

  CleanConfigDutI(config: string[]) {
    return this.CleanConfigDut(DutIdx.I, config);
  }

  CleanConfigDutJ(config: string[]) {
    return this.CleanConfigDut(DutIdx.J, config);
  }

  CleanConfigDutK(config: string[]) {
    return this.CleanConfigDut(DutIdx.K, config);
  }

  CleanConfigDutL(config: string[]) {
    return this.CleanConfigDut(DutIdx.L, config);
  }

  /** Exec Match */
  ExecRetMatchDut(
    idx: DutIdx,
    config: string,
    expect: string | RegExp | (string | RegExp)[],
    notMatch: boolean = false,
  ) {
    const dut = this.getDut(idx);
    const cmd = replaceCmdTemplate(config, dut);
    /** 统一成数组：命令只执行一次，输出同时对多条期望做 AND 校验 */
    const expects = (Array.isArray(expect) ? expect : [expect]).map((e) =>
      toRegExp(e, dut),
    );
    this.actuator.push(new ExecRetMatch(dut, cmd, expects, notMatch));
    return this;
  }

  ExecRetMatchDutA(
    config: string,
    expect: string | RegExp | (string | RegExp)[],
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.A, config, expect, notMatch);
  }

  ExecRetMatchDutB(
    config: string,
    expect: string | RegExp | (string | RegExp)[],
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.B, config, expect, notMatch);
  }

  ExecRetMatchDutC(
    config: string,
    expect: string | RegExp | (string | RegExp)[],
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.C, config, expect, notMatch);
  }

  ExecRetMatchDutD(
    config: string,
    expect: string | RegExp | (string | RegExp)[],
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.D, config, expect, notMatch);
  }

  ExecRetMatchDutE(
    config: string,
    expect: string | RegExp | (string | RegExp)[],
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.E, config, expect, notMatch);
  }

  ExecRetMatchDutF(
    config: string,
    expect: string | RegExp | (string | RegExp)[],
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.F, config, expect, notMatch);
  }

  ExecRetMatchDutG(
    config: string,
    expect: string | RegExp | (string | RegExp)[],
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.G, config, expect, notMatch);
  }

  ExecRetMatchDutH(
    config: string,
    expect: string | RegExp | (string | RegExp)[],
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.H, config, expect, notMatch);
  }

  ExecRetMatchDutI(
    config: string,
    expect: string | RegExp | (string | RegExp)[],
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.I, config, expect, notMatch);
  }

  ExecRetMatchDutJ(
    config: string,
    expect: string | RegExp | (string | RegExp)[],
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.J, config, expect, notMatch);
  }

  ExecRetMatchDutK(
    config: string,
    expect: string | RegExp | (string | RegExp)[],
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.K, config, expect, notMatch);
  }

  ExecRetMatchDutL(
    config: string,
    expect: string | RegExp | (string | RegExp)[],
    notMatch: boolean = false,
  ) {
    return this.ExecRetMatchDut(DutIdx.L, config, expect, notMatch);
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

  ReadyCheckDutE(
    config: string,
    expect: string | RegExp,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    return this.ReadyCheckDut(DutIdx.E, config, expect, timeout, notMatch);
  }

  ReadyCheckDutF(
    config: string,
    expect: string | RegExp,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    return this.ReadyCheckDut(DutIdx.F, config, expect, timeout, notMatch);
  }

  ReadyCheckDutG(
    config: string,
    expect: string | RegExp,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    return this.ReadyCheckDut(DutIdx.G, config, expect, timeout, notMatch);
  }

  ReadyCheckDutH(
    config: string,
    expect: string | RegExp,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    return this.ReadyCheckDut(DutIdx.H, config, expect, timeout, notMatch);
  }

  ReadyCheckDutI(
    config: string,
    expect: string | RegExp,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    return this.ReadyCheckDut(DutIdx.I, config, expect, timeout, notMatch);
  }

  ReadyCheckDutJ(
    config: string,
    expect: string | RegExp,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    return this.ReadyCheckDut(DutIdx.J, config, expect, timeout, notMatch);
  }

  ReadyCheckDutK(
    config: string,
    expect: string | RegExp,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    return this.ReadyCheckDut(DutIdx.K, config, expect, timeout, notMatch);
  }

  ReadyCheckDutL(
    config: string,
    expect: string | RegExp,
    timeout: number = 30 * 1000,
    notMatch: boolean = false,
  ) {
    return this.ReadyCheckDut(DutIdx.L, config, expect, timeout, notMatch);
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

  ExecCustomDutE(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    return this.ExecCustomDut(DutIdx.E, cb, exec_clean);
  }

  ExecCustomDutF(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    return this.ExecCustomDut(DutIdx.F, cb, exec_clean);
  }

  ExecCustomDutG(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    return this.ExecCustomDut(DutIdx.G, cb, exec_clean);
  }

  ExecCustomDutH(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    return this.ExecCustomDut(DutIdx.H, cb, exec_clean);
  }

  ExecCustomDutI(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    return this.ExecCustomDut(DutIdx.I, cb, exec_clean);
  }

  ExecCustomDutJ(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    return this.ExecCustomDut(DutIdx.J, cb, exec_clean);
  }

  ExecCustomDutK(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    return this.ExecCustomDut(DutIdx.K, cb, exec_clean);
  }

  ExecCustomDutL(
    cb: (h: DutHandle) => Promise<boolean> | boolean,
    exec_clean: boolean = false,
  ) {
    return this.ExecCustomDut(DutIdx.L, cb, exec_clean);
  }
}
