/**
 * 拓扑定义与门面。
 *
 * 每个拓扑都直接定义在 `LinkConstraint` 对应的静态 getter 内，ASCII 拓扑图紧贴其上，
 * 因此在测试脚本中 F12 跳转 `LinkConstraint.xxx` 会**直接落到该拓扑的定义处**，
 * 无需再向上翻找。
 *
 * 组成：
 *   1. 声明式 DSL：`link(from, to)` 描述一条链路，`topo(...links)` 组装成拓扑并自动生成 stream_id；
 *   2. `LinkConstraint`：静态 getter，既是拓扑定义，也是既有测试文件的访问入口；
 *   3. `Topologies`：由 getter 自动派生的注册表，供遍历/校验使用。
 *
 * 端点（dut/renix）与共享类型分别位于 `./endpoints` 与 `./types`。
 */
import { dut, Endpoint, renix, resolveEndpoint } from "./endpoints";
import { Link, REVERSE_STREAM_ID_BASE, TopoLinks } from "./types";

export { REVERSE_STREAM_ID_BASE } from "./types";
export type { Link, PortMapping, TopoLinks } from "./types";

/** 一条链路的声明（尚未解析为真实端口） */
export interface LinkSpec {
  from: Endpoint;
  to: Endpoint;
  vlan?: number;
}

/** 声明一条链路：from -> to */
export function link(
  from: Endpoint,
  to: Endpoint,
  options: { vlan?: number } = {},
): LinkSpec {
  return { from, to, ...options };
}

/** 把若干链路组装成一个拓扑，stream_id 由下标自动生成（1 起） */
export function topo(...specs: LinkSpec[]): TopoLinks {
  return {
    links: specs.map((spec, index): Link => {
      const item: Link = {
        stream_id: index + 1,
        in_port: resolveEndpoint(spec.from),
        out_port: resolveEndpoint(spec.to),
      };
      if (spec.vlan !== undefined) {
        item.vlan = spec.vlan;
      }
      return item;
    }),
  };
}

/** 递归冻结，防止共享拓扑被就地修改 */
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value as object).forEach((child) => deepFreeze(child));
    Object.freeze(value);
  }
  return value;
}

/** 惰性构建 + 缓存：只有被访问时才解析，且只解析一次 */
const topologyCache = new Map<string, TopoLinks>();

function cached(name: string, build: () => TopoLinks): TopoLinks {
  let value = topologyCache.get(name);
  if (!value) {
    value = deepFreeze(build());
    topologyCache.set(name, value);
  }
  return value;
}

/**
 * 拓扑定义与访问门面。
 *
 * 每个 getter 内部即该拓扑的完整定义，ASCII 图紧贴其上；
 * 返回的是惰性构建并冻结的共享对象，请勿就地修改。
 */
export class LinkConstraint {
  /**
   *
   *                    +--------+
   *  RenixA <=> PortA--|  DUTA  |--PortB <=> RenixB
   *                    +--------+
   *
   */
  static get one_device_topo_links_type_1(): TopoLinks {
    return cached("one_device_topo_links_type_1", () =>
      topo(link(renix("A"), dut("A", "A")), link(dut("A", "B"), renix("B"))),
    );
  }

  /**
   *
   *                    +--------+                   +--------+
   *                    |        |--PortA <=> PortA--|        |
   *  RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortD <=> RenixB
   *                    |        |--PortC <=> PortC--|        |
   *                    +--------+                   +--------+
   *
   */
  static get two_devices_topo_links_type_1(): TopoLinks {
    return cached("two_devices_topo_links_type_1", () =>
      topo(
        link(renix("A"), dut("A", "D")),
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "C"), dut("B", "C")),
        link(dut("B", "D"), renix("B")),
      ),
    );
  }

  /**
   *
   *   +--------+                   +--------+
   *   |        |--PortA <=> PortA--|        |
   *   |  DUTA  |                   |  DUTB  |
   *   |        |--PortB <=> PortB--|        |
   *   +--------+                   +--------+
   *
   */
  static get two_devices_topo_links_type_2(): TopoLinks {
    return cached("two_devices_topo_links_type_2", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("B", "B")),
      ),
    );
  }

  /**
   *                    +--------+
   *  RenixA <=> PortD--|        |                    +--------+
   *                    |  DUTA  | --PortA <=> PortA--|  DUTB  |--PortD <=> RenixB
   *  RenixC <=> PortB--|        |                    +--------+
   *                    +--------+
   */
  static get two_devices_topo_links_type_3(): TopoLinks {
    return cached("two_devices_topo_links_type_3", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), renix("C")),
        link(dut("A", "D"), renix("A")),
        link(dut("B", "D"), renix("B")),
      ),
    );
  }

  /**
   *                    +--------+                   +--------+
   *                    |        |--PortA <=> PortA--|        |
   *  RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortB
   *                    |        |--PortC <=> PortC--|        |    |
   *                    +--------+                   +--------+    |
   *                                                               |
   *                                                 +--------+    |
   *                               RenixB <=> PortD--|  DUTC  |--PortB
   *                                                 +--------+
   */
  static get three_devices_topo_links_type_1(): TopoLinks {
    return cached("three_devices_topo_links_type_1", () =>
      topo(
        link(renix("A"), dut("A", "D")),
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "C"), dut("B", "C")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("C", "D"), renix("B")),
      ),
    );
  }

  /*
   *                    +--------+                   +--------+
   *  RenixA <=> PortD--|        |                   |        |
   *                    |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
   *  RenixC <=> PortB--|        |                   |        |    |
   *                    +--------+                   +--------+    |
   *                                                               |
   *                                                 +--------+    |
   *                               RenixB <=> PortD--|  DUTC  |--PortB
   *                                                 +--------+
   */
  static get three_devices_topo_links_type_2(): TopoLinks {
    return cached("three_devices_topo_links_type_2", () =>
      topo(
        link(renix("A"), dut("A", "D")),
        link(dut("A", "A"), dut("B", "A")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("C", "D"), renix("B")),
        link(renix("C"), dut("A", "B")),
      ),
    );
  }

  /**
   *
   *                       +--------+
   *     RenixA <-> PortD-|  DUTA  |--PortA---+
   *                      +--------+          |
   *                       |      |         PortA
   *                     PortB  PortC         |
   *                       |      |       +--------+
   *                       |      |       |  DUTB  |
   *                       |      |       +--------+
   *                     PortB  PortC         |
   *                       |      |         PortB
   *                      +--------+          |
   *     RenixB <-> PortD-|  DUTC  |--PortA---+
   *                      +--------+
   *
   */
  static get three_devices_topo_links_type_3(): TopoLinks {
    return cached("three_devices_topo_links_type_3", () =>
      topo(
        link(renix("A"), dut("A", "D")),
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("C", "B")),
        link(dut("A", "C"), dut("C", "C")),
        link(dut("B", "B"), dut("C", "A")),
        link(dut("C", "D"), renix("B")),
      ),
    );
  }

  /**
   *
   * +--------+                   +--------+                   +--------+
   * |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB <=> PortB--|  DUTC  |
   * +--------+                   +--------+                   +--------+
   *
   */
  static get three_devices_topo_links_type_4(): TopoLinks {
    return cached("three_devices_topo_links_type_4", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("B", "B"), dut("C", "B")),
      ),
    );
  }

  /**
   *                    +--------+                   +--------+
   *  RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
   *                    +--------+                   +--------+    |
   *                                                               |
   *                                                 +--------+    |
   *                               RenixB <=> PortD--|  DUTC  |--PortB
   *                                                 +--------+
   */
  static get three_devices_topo_links_type_5(): TopoLinks {
    return cached("three_devices_topo_links_type_5", () =>
      topo(
        link(renix("A"), dut("A", "D")),
        link(dut("A", "A"), dut("B", "A")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("C", "D"), renix("B")),
      ),
    );
  }

  /**
   *
   *    +--------+                   +--------+
   *    |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
   *    +--------+                   +--------+    |
   *                                               |
   *    +--------+                   +--------+    |
   *    |  DUTD  |--PortA <=> PortA--|  DUTC  |--PortB
   *    +--------+                   +--------+
   *
   */
  static get four_devices_topo_links_type_1(): TopoLinks {
    return cached("four_devices_topo_links_type_1", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("D", "A"), dut("C", "A")),
      ),
    );
  }

  /**
   *
   *                                  +--------+
   *         +-----------------PortC--|  DUTD  |--PortA-----------------+
   *         |                        +--------+                       |
   *         |                            |                            |
   *         |                          PortB                          |
   *         |                            |                            |
   *       PortC                        PortC                        PortA
   *         |                            |                            |
   *    +--------+                   +--------+                   +--------+
   *    |        |--PortA <=> PortA--|        |                   |        |
   *    |  DUTA  |                   |  DUTB  |                   |  DUTC  |
   *    |        |--PortB <=> PortB--|        |                   |        |
   *    +--------+                   +--------+                   +--------+
   *        |                            |                            |
   *      PortD                        PortD                        PortD
   *        |                            |                            |
   *     RenixA                       RenixB                       RenixC
   *
   */
  static get four_devices_topo_links_type_2(): TopoLinks {
    return cached("four_devices_topo_links_type_2", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("B", "B")),
        link(dut("A", "C"), dut("D", "C")),
        link(dut("A", "D"), renix("A")),
        link(dut("B", "D"), renix("B")),
        link(dut("C", "D"), renix("C")),
        link(dut("B", "C"), dut("D", "B")),
        link(dut("C", "A"), dut("D", "A")),
      ),
    );
  }

  /**
   *
   *    +--------+                   +--------+
   *    |  DUTE  |--PortA <=> PortA--|  DUTF  |
   *    +--------+                   +--------+
   *        |                            |
   *      PortB                        PortB
   *        |                            |
   *      PortB                        PortB
   *        |                            |
   *    +--------+                   +--------+
   *    |  DUTC  |                   |  DUTD  |
   *    +--------+                   +--------+
   *        |                            |
   *      PortA                        PortA
   *        |                            |
   *      PortA                        PortA
   *        |                            |
   *    +--------+                   +--------+
   *    |  DUTA  |                   |  DUTB  |
   *    +--------+                   +--------+
   *
   */
  static get six_devices_topo_links_type_1(): TopoLinks {
    return cached("six_devices_topo_links_type_1", () =>
      topo(
        link(dut("A", "A"), dut("C", "A")),
        link(dut("B", "A"), dut("D", "A")),
        link(dut("C", "B"), dut("E", "B")),
        link(dut("D", "B"), dut("F", "B")),
        link(dut("E", "A"), dut("F", "A")),
      ),
    );
  }

  /**
   *
   *                                  +--------+
   *         +-----------------PortC--|  DUTD  |--PortA-----------------+
   *         |                        +--------+                       |
   *         |                            |                            |
   *         |                          PortB                          |
   *         |                            |                            |
   *       PortC                        PortC                        PortA
   *         |                            |                            |
   *    +--------+                   +--------+                   +--------+
   *    |        |                   |        |                   |        |
   *    |  DUTA  |--PortA <=> PortA--|  DUTB  |                   |  DUTC  |
   *    |        |                   |        |                   |        |
   *    +--------+                   +--------+                   +--------+
   *     |      |                     |      |                     |      |
   *   PortB  PortD                 PortB  PortD                 PortC  PortD
   *     |      |                     |      |                     |      |
   *   PortA  PortB                 PortC  PortD                 PortA  PortB
   *     |      |                     |      |                     |      |
   *  +----------------------------------------+                  +--------+
   *  |                                        |                  |        |
   *  |                  DutE                  |                  |  DUTF  |
   *  |                                        |                  |        |
   *  +----------------------------------------+                  +--------+
   *
   */
  static get six_devices_topo_links_type_2(): TopoLinks {
    return cached("six_devices_topo_links_type_2", () =>
      topo(
        link(dut("A", "C"), dut("D", "C")),
        link(dut("B", "C"), dut("D", "B")),
        link(dut("C", "A"), dut("D", "A")),
        link(dut("A", "A"), dut("B", "A")),

        link(dut("A", "B"), dut("E", "A")),
        link(dut("A", "D"), dut("E", "B")),
        link(dut("B", "B"), dut("E", "C")),
        link(dut("B", "D"), dut("E", "D")),

        link(dut("C", "C"), dut("F", "A")),
        link(dut("C", "D"), dut("F", "B")),
      ),
    );
  }
}

/**
 * 拓扑注册表：由 `LinkConstraint` 的静态 getter 自动派生，
 * 便于遍历/校验（如单测），无需重复维护一份清单。
 */
export const Topologies: Record<string, () => TopoLinks> = Object.fromEntries(
  Object.entries(Object.getOwnPropertyDescriptors(LinkConstraint))
    .filter(([, descriptor]) => typeof descriptor.get === "function")
    .map(([name, descriptor]) => [
      name,
      () => (descriptor.get as () => TopoLinks).call(LinkConstraint),
    ]),
);

/**
 * 校验一个拓扑是否自洽，返回错误信息列表（空数组表示合法）。
 *
 * 检查项：
 *   - stream_id 唯一
 *   - stream_id 小于反向链路偏移量（否则正反向 id 冲突）
 *   - 同一物理端口不被重复占用
 */
export function validateTopo(topology: TopoLinks): string[] {
  const errors: string[] = [];
  const seenStreamIds = new Set<number>();
  const usedPorts = new Map<string, number>();

  for (const item of topology.links) {
    if (seenStreamIds.has(item.stream_id)) {
      errors.push(`stream_id 重复: ${item.stream_id}`);
    }
    if (item.stream_id >= REVERSE_STREAM_ID_BASE) {
      errors.push(
        `stream_id ${item.stream_id} 超过反向链路偏移上限 ${REVERSE_STREAM_ID_BASE}`,
      );
    }
    seenStreamIds.add(item.stream_id);

    for (const port of [item.in_port, item.out_port]) {
      const key = `${port.device}:${port.if_index}`;
      if (usedPorts.has(key)) {
        errors.push(
          `端口被重复占用: ${key}（stream_id ${usedPorts.get(key)} 与 ${item.stream_id}）`,
        );
      }
      usedPorts.set(key, item.stream_id);
    }
  }

  return errors;
}
