import { loadConfig } from "./loader";
import { DUT_DEFAULT_CONFIG } from "./device-defaults";
import type { DutConfigJson } from "./schema";

const cfg = loadConfig();

/**
 * 按 `dut.mapping` 把设备名解析为逻辑槽位 A ~ L 的设备对象。
 *
 * 未配置 mapping 时保持旧行为：直接使用 `dut.list` 的顺序。
 */
function resolveDutList(): DutConfigJson[] {
  const { list, mapping } = cfg.dut;
  if (!mapping) return list;

  const byName = new Map(list.map((device) => [device.name, device]));
  return mapping.map((name) => {
    const device = byName.get(name);
    if (!device) {
      throw new Error(`dut.mapping 引用了未定义的设备名：${name}`);
    }
    return device;
  });
}

/**
 * 测试运行时的全局配置门面。
 *
 * 环境相关取值来自 config/env/*.json；设备 CLI 行为默认值保留在
 * `device-defaults.ts`，避免把正则、超时等代码细节写进 JSON。
 */
export class Config {
  /**
   * 自动测试使用的拓扑名称。
   * TestHelper.init() 会按该名称查找并删除同名旧拓扑，再重新创建。
   */
  public static readonly defaultTopoName = cfg.topo.name;

  /**
   * DUT 默认连接参数。
   *
   * 行为默认值在 `device-defaults.ts`；账号、密码、protocol 等环境差异
   * 由 config/env/default.json + local.json 的 `dut.connection` 覆盖。
   */
  public static default_cfg = {
    ...DUT_DEFAULT_CONFIG,
    ...cfg.dut.connection,
  };

  /**
   * DUT 清单，顺序对应 DutIdx.A ~ DutIdx.L。
   *
   * 顺序由 `dut.mapping` 决定（名字的排列顺序 = A/B/C… 的绑定关系），
   * 与 `dut.list` 中设备对象的书写顺序无关。
   */
  public static dut_list = resolveDutList();
}
