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
 *
 * 端点（dut/traffic）位于 `./endpoints`，共享类型位于 domain/topology。
 * 端点统一使用 `traffic("A")`。
 */
import { dut, Endpoint, traffic, resolveEndpoint } from "./endpoints";
import {
  Link,
  REVERSE_STREAM_ID_BASE,
  TopoLinks,
} from "../../domain/topology/model";

export { REVERSE_STREAM_ID_BASE } from "../../domain/topology/model";
export type { Link, PortMapping, TopoLinks } from "../../domain/topology/model";

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
   *                          +--------+
   *  StreamPort.A <=> PortA--|  DUTA  |--PortB <=> StreamPort.B
   *                          +--------+
   *
   */
  static get one_device_topo_links_type_1(): TopoLinks {
    return cached("one_device_topo_links_type_1", () =>
      topo(
        link(traffic("A"), dut("A", "A")),
        link(dut("A", "B"), traffic("B")),
      ),
    );
  }

  /**
   *
   *                          +--------+                   +--------+
   *                          |        |--PortA <=> PortA--|        |
   *  StreamPort.A <=> PortD--|  DUTA  |                   |  DUTB  |--PortD <=> StreamPort.B
   *                          |        |--PortC <=> PortC--|        |
   *                          +--------+                   +--------+
   *
   */
  static get two_devices_topo_links_type_1(): TopoLinks {
    return cached("two_devices_topo_links_type_1", () =>
      topo(
        link(traffic("A"), dut("A", "D")),
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "C"), dut("B", "C")),
        link(dut("B", "D"), traffic("B")),
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
   *                          +--------+
   *  StreamPort.A <=> PortD--|        |                    +--------+
   *                          |  DUTA  | --PortA <=> PortA--|  DUTB  |--PortD <=> StreamPort.B
   *  StreamPort.C <=> PortB--|        |                    +--------+
   *                          +--------+
   */
  static get two_devices_topo_links_type_3(): TopoLinks {
    return cached("two_devices_topo_links_type_3", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), traffic("C")),
        link(dut("A", "D"), traffic("A")),
        link(dut("B", "D"), traffic("B")),
      ),
    );
  }

  /**
   *                          +--------+                   +--------+
   *                          |        |--PortA <=> PortA--|        |
   *  StreamPort.A <=> PortD--|  DUTA  |                   |  DUTB  |--PortB
   *                          |        |--PortC <=> PortC--|        |    |
   *                          +--------+                   +--------+    |
   *                                                                     |
   *                                                       +--------+    |
   *                               StreamPort.B <=> PortD--|  DUTC  |--PortB
   *                                                       +--------+
   */
  static get three_devices_topo_links_type_1(): TopoLinks {
    return cached("three_devices_topo_links_type_1", () =>
      topo(
        link(traffic("A"), dut("A", "D")),
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "C"), dut("B", "C")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("C", "D"), traffic("B")),
      ),
    );
  }

  /*
   *                          +--------+                   +--------+
   *  StreamPort.A <=> PortD--|        |                   |        |
   *                          |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
   *  StreamPort.C <=> PortB--|        |                   |        |    |
   *                          +--------+                   +--------+    |
   *                                                                     |
   *                                                       +--------+    |
   *                               StreamPort.B <=> PortD--|  DUTC  |--PortB
   *                                                       +--------+
   */
  static get three_devices_topo_links_type_2(): TopoLinks {
    return cached("three_devices_topo_links_type_2", () =>
      topo(
        link(traffic("A"), dut("A", "D")),
        link(dut("A", "A"), dut("B", "A")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("C", "D"), traffic("B")),
        link(traffic("C"), dut("A", "B")),
      ),
    );
  }

  /**
   *
   *                            +--------+
   *     StreamPort.A <-> PortD-|  DUTA  |--PortA---+
   *                            +--------+          |
   *                            |        |         PortA
   *                          PortB    PortC        |
   *                            |        |       +--------+
   *                            |        |       |  DUTB  |
   *                            |        |       +--------+
   *                          PortB    PortC        |
   *                            |        |         PortB
   *                            +--------+          |
   *     StreamPort.B <-> PortD-|  DUTC  |--PortA---+
   *                            +--------+
   *
   */
  static get three_devices_topo_links_type_3(): TopoLinks {
    return cached("three_devices_topo_links_type_3", () =>
      topo(
        link(traffic("A"), dut("A", "D")),
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("C", "B")),
        link(dut("A", "C"), dut("C", "C")),
        link(dut("B", "B"), dut("C", "A")),
        link(dut("C", "D"), traffic("B")),
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
   *                          +--------+                   +--------+
   *  StreamPort.A <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
   *                          +--------+                   +--------+    |
   *                                                                     |
   *                                                       +--------+    |
   *                               StreamPort.B <=> PortD--|  DUTC  |--PortB
   *                                                       +--------+
   */
  static get three_devices_topo_links_type_5(): TopoLinks {
    return cached("three_devices_topo_links_type_5", () =>
      topo(
        link(traffic("A"), dut("A", "D")),
        link(dut("A", "A"), dut("B", "A")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("C", "D"), traffic("B")),
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
   *                                        +--------+
   *               +-----------------PortC--|  DUTD  |--PortA-----------------+
   *               |                        +--------+                       |
   *               |                            |                            |
   *               |                          PortB                          |
   *               |                            |                            |
   *             PortC                        PortC                        PortA
   *               |                            |                            |
   *          +--------+                   +--------+                   +--------+
   *          |        |--PortA <=> PortA--|        |                   |        |
   *          |  DUTA  |                   |  DUTB  |                   |  DUTC  |
   *          |        |--PortB <=> PortB--|        |                   |        |
   *          +--------+                   +--------+                   +--------+
   *              |                            |                            |
   *            PortD                        PortD                        PortD
   *              |                            |                            |
   *        StreamPort.A                 StreamPort.B                 StreamPort.C
   *
   */
  static get four_devices_topo_links_type_2(): TopoLinks {
    return cached("four_devices_topo_links_type_2", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("B", "B")),
        link(dut("A", "C"), dut("D", "C")),
        link(dut("A", "D"), traffic("A")),
        link(dut("B", "D"), traffic("B")),
        link(dut("C", "D"), traffic("C")),
        link(dut("B", "C"), dut("D", "B")),
        link(dut("C", "A"), dut("D", "A")),
      ),
    );
  }

  /**
   *
   *    +--------+                   +--------+
   *    |  DUTA  |--PortA <=> PortA--|  DUTB  |
   *    +--------+                   +--------+
   *        |                            |
   *      PortD                        PortB
   *        |                            |
   *      PortD                        PortB
   *        |                            |
   *    +--------+                   +--------+
   *    |  DUTD  |--PortC <=> PortC--|  DUTC  |
   *    +--------+                   +--------+
   *
   */
  static get four_devices_topo_links_type_3(): TopoLinks {
    return cached("four_devices_topo_links_type_3", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("D", "C"), dut("C", "C")),
        link(dut("D", "D"), dut("A", "D")),
      ),
    );
  }

  /**
   * 四设备全互联拓扑，任意两台设备之间均有一条独立链路：
   *
   *   A-B: DUTA PortA <=> DUTB PortA
   *   A-C: DUTA PortB <=> DUTC PortA
   *   A-D: DUTA PortC <=> DUTD PortA
   *   B-C: DUTB PortB <=> DUTC PortB
   *   B-D: DUTB PortC <=> DUTD PortB
   *   C-D: DUTC PortC <=> DUTD PortC
   *
   *   链路矩阵（行 -> 列，值为本端端口-对端端口）：
   *
   *          DUTB          DUTC          DUTD
   *   DUTA  PortA-PortA   PortB-PortA   PortC-PortA
   *   DUTB                PortB-PortB   PortC-PortB
   *   DUTC                              PortC-PortC
   *
   *   拓扑形状（每一条边都是一对一的点对点链路）：
   *
   *        DUTA --------- DUTB
   *          | \        / |
   *          |   \    /   |
   *          |     \/     |
   *          |     /\     |
   *          |   /    \   |
   *          | /        \ |
   *        DUTD --------- DUTC
   */
  static get four_devices_topo_links_type_4(): TopoLinks {
    return cached("four_devices_topo_links_type_4", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("C", "A")),
        link(dut("A", "C"), dut("D", "A")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("B", "C"), dut("D", "B")),
        link(dut("C", "C"), dut("D", "C")),
      ),
    );
  }

  /**
   * 四设备拓扑：
   *
   *   A-B: DUTA PortA <=> DUTB PortA
   *   A-C: DUTA PortB <=> DUTC PortA
   *   B-C: DUTB PortB <=> DUTC PortB
   *   A-D: DUTA PortC <=> DUTD PortA
   *   B-D: DUTB PortC <=> DUTD PortB
   *
   *        DUTA --------- DUTB
   *          | \        / |
   *          |   \    /   |
   *          |     \/     |
   *          |     /\     |
   *          |   /    \   |
   *          | /        \ |
   *        DUTC          DUTD
   *
   *   链路矩阵（行 -> 列，值为本端端口-对端端口）：
   *
   *          DUTB          DUTC          DUTD
   *   DUTA  PortA-PortA   PortB-PortA   PortC-PortA
   *   DUTB                PortB-PortB   PortC-PortB
   */
  static get four_devices_topo_links_type_5(): TopoLinks {
    return cached("four_devices_topo_links_type_5", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("C", "A")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("A", "C"), dut("D", "A")),
        link(dut("B", "C"), dut("D", "B")),
      ),
    );
  }

  /**
   * 四设备环形拓扑 + 两个测试仪端口：
   *
   *   StreamPort.A <=> PortB--+--------+                   +--------+
   *                           |  DUTA  |--PortA <=> PortA--|  DUTB  |
   *                           +--------+                   +--------+
   *                               |                            |
   *                             PortD                        PortB
   *                               |                            |
   *                             PortD                        PortB
   *                               |                            |
   *                           +--------+                   +--------+
   *                           |  DUTD  |--PortC <=> PortC--|  DUTC  |
   *                           +--------+                   +--------+
   *                                                          |
   *                                                        PortA
   *                                                          |
   *                                                    StreamPort.B
   *
   *   链路矩阵（行 -> 列，值为本端端口-对端端口）：
   *
   *          StreamPort.A   DUTB          DUTC          DUTD
   *   DUTA  PortB          PortA-PortA   —             PortD-PortD
   *   DUTB                 —             PortB-PortB   —
   *   DUTC  PortA          —             —             PortC-PortC
   *   DUTD                 —             —             —
   */
  static get four_devices_topo_links_type_6(): TopoLinks {
    return cached("four_devices_topo_links_type_6", () =>
      topo(
        link(traffic("A"), dut("A", "B")),
        link(dut("A", "A"), dut("B", "A")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("C", "C"), dut("D", "C")),
        link(dut("D", "D"), dut("A", "D")),
        link(dut("C", "A"), traffic("B")),
      ),
    );
  }

  /**
   * 五设备拓扑：
   *
   *   A-B: DUTA PortA <=> DUTB PortA
   *   B-D: DUTB PortB <=> DUTD PortA
   *   A-C: DUTA PortB <=> DUTC PortA
   *   C-D: DUTC PortB <=> DUTD PortB
   *   C-E: DUTC PortC <=> DUTE PortA
   *
   *        DUTA --------- DUTB
   *          |              |
   *        DUTC --------- DUTD
   *          |
   *        DUTE
   *
   *   链路矩阵（行 -> 列，值为本端端口-对端端口）：
   *
   *          DUTB          DUTC          DUTD          DUTE
   *   DUTA  PortA-PortA   PortB-PortA   —             —
   *   DUTB                —             PortB-PortA   —
   *   DUTC                              PortB-PortB   PortC-PortA
   *   DUTD                                            —
   */
  static get five_devices_topo_links_type_1(): TopoLinks {
    return cached("five_devices_topo_links_type_1", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("B", "B"), dut("D", "A")),
        link(dut("A", "B"), dut("C", "A")),
        link(dut("C", "B"), dut("D", "B")),
        link(dut("C", "C"), dut("E", "A")),
      ),
    );
  }

  /**
   * 六设备拓扑：
   *
   *   A-B: DUTA PortA <=> DUTB PortA
   *   A-C: DUTA PortB <=> DUTC PortA
   *   A-D: DUTA PortC <=> DUTD PortA
   *   B-C: DUTB PortB <=> DUTC PortB
   *   B-D: DUTB PortC <=> DUTD PortB
   *   C-D: DUTC PortC <=> DUTD PortC
   *   C-E: DUTC PortD <=> DUTE PortA
   *   C-F: DUTC PortE <=> DUTF PortA
   *   D-E: DUTD PortD <=> DUTE PortB
   *   D-F: DUTD PortE <=> DUTF PortB
   *
   *        DUTA --------- DUTB
   *          | \        / |
   *          |   \    /   |
   *          |     \/     |
   *          |     /\     |
   *          |   /    \   |
   *          | /        \ |
   *        DUTC --------- DUTD
   *          | \        / |
   *          |   \    /   |
   *          |     \/     |
   *          |     /\     |
   *          |   /    \   |
   *          | /        \ |
   *        DUTE --------- DUTF
   */
  static get six_devices_topo_links_type_4(): TopoLinks {
    return cached("six_devices_topo_links_type_4", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("C", "A")),
        link(dut("A", "C"), dut("D", "A")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("B", "C"), dut("D", "B")),
        link(dut("C", "C"), dut("D", "C")),
        link(dut("C", "D"), dut("E", "A")),
        link(dut("C", "E"), dut("F", "A")),
        link(dut("D", "D"), dut("E", "B")),
        link(dut("D", "E"), dut("F", "B")),
      ),
    );
  }

  /**
   * 七设备拓扑：
   *
   *   A-B: DUTA PortA <=> DUTB PortA
   *   A-D: DUTA PortB <=> DUTD PortA
   *   A-E: DUTA PortC <=> DUTE PortA
   *   B-C: DUTB PortB <=> DUTC PortA
   *   C-G: DUTC PortB <=> DUTG PortA
   *   D-E: DUTD PortB <=> DUTE PortB
   *   E-F: DUTE PortC <=> DUTF PortA
   *   F-G: DUTF PortB <=> DUTG PortB
   *
   *        DUTB --------- DUTC --------------- DUTG
   *          |                                 /
   *        DUTA -------------- DUTE --- DUTF -/
   *          \                 |
   *           \                |
   *          DUTD --------------+
   *
   *   链路矩阵（行 -> 列，值为本端端口-对端端口）：
   *
   *          DUTB          DUTC          DUTD          DUTE          DUTF          DUTG
   *   DUTA  PortA-PortA   —             PortB-PortA   PortC-PortA   —             —
   *   DUTB                PortB-PortA   —             —             —             —
   *   DUTC                              —             —             —             PortB-PortA
   *   DUTD                                            PortB-PortB   —             —
   *   DUTE                                                          PortC-PortA   —
   *   DUTF                                                                        PortB-PortB
   */
  static get seven_devices_topo_links_type_1(): TopoLinks {
    return cached("seven_devices_topo_links_type_1", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("D", "A")),
        link(dut("A", "C"), dut("E", "A")),
        link(dut("B", "B"), dut("C", "A")),
        link(dut("C", "B"), dut("G", "A")),
        link(dut("D", "B"), dut("E", "B")),
        link(dut("E", "C"), dut("F", "A")),
        link(dut("F", "B"), dut("G", "B")),
      ),
    );
  }

  /**
   * 九设备拓扑：
   *
   *   A-B: DUTA PortA <=> DUTB PortA
   *   A-D: DUTA PortB <=> DUTD PortA
   *   A-F: DUTA PortC <=> DUTF PortA
   *   B-C: DUTB PortB <=> DUTC PortA
   *   C-G: DUTC PortB <=> DUTG PortA
   *   D-H: DUTD PortB <=> DUTH PortA
   *   D-I: DUTD PortC <=> DUTI PortA
   *   E-G: DUTE PortA <=> DUTG PortB
   *   E-H: DUTE PortB <=> DUTH PortB
   *   F-H: DUTF PortB <=> DUTH PortC
   *
   *                          DUTE
   *                         /    \
   *                      DUTG    DUTH ------ DUTF
   *                       |       |          /
   *                      DUTB     |         /
   *                       |       |        /
   *                   DUTA ------ DUTD ----
   *                       \       |
   *                        \    DUTI
   */
  static get nine_devices_topo_links_type_1(): TopoLinks {
    return cached("nine_devices_topo_links_type_1", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("D", "A")),
        link(dut("A", "C"), dut("F", "A")),
        link(dut("B", "B"), dut("C", "A")),
        link(dut("C", "B"), dut("G", "A")),
        link(dut("D", "B"), dut("H", "A")),
        link(dut("D", "C"), dut("L", "A")),
        link(dut("E", "A"), dut("G", "B")),
        link(dut("E", "B"), dut("H", "B")),
        link(dut("F", "B"), dut("H", "C")),
      ),
    );
  }

  /**
   * 九设备拓扑：
   *
   *   A-B: DUTA PortA <=> DUTB PortA
   *   A-C: DUTA PortB <=> DUTC PortA
   *   A-D: DUTA PortC <=> DUTD PortA
   *   B-C: DUTB PortB <=> DUTC PortB
   *   B-D: DUTB PortC <=> DUTD PortB
   *   B-E: DUTB PortD <=> DUTE PortA
   *   B-F: DUTB PortE <=> DUTF PortA
   *   C-D: DUTC PortC <=> DUTD PortC
   *   C-G: DUTC PortD <=> DUTG PortA
   *   C-H: DUTC PortE <=> DUTH PortA
   *   D-G: DUTD PortD <=> DUTG PortB
   *   D-H: DUTD PortE <=> DUTH PortB
   *   E-F: DUTE PortB <=> DUTF PortB
   *   E-I: DUTE PortC <=> DUTI PortA
   *   F-I: DUTF PortC <=> DUTI PortB
   *
   *                     DUTA --------- DUTB
   *                    / | \          / | \
   *                   /  |  \        /  |  \
   *               DUTC --+-- DUTD  DUTE--+--DUTF
   *                 | \       / |      \    /
   *                 |   \   /   |       \  /
   *               DUTG ---+--- DUTH     DUTI
   */
  static get nine_devices_topo_links_type_2(): TopoLinks {
    return cached("nine_devices_topo_links_type_2", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("C", "A")),
        link(dut("A", "C"), dut("D", "A")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("B", "C"), dut("D", "B")),
        link(dut("B", "D"), dut("E", "A")),
        link(dut("B", "E"), dut("F", "A")),
        link(dut("C", "C"), dut("D", "C")),
        link(dut("C", "D"), dut("G", "A")),
        link(dut("C", "E"), dut("H", "A")),
        link(dut("D", "D"), dut("G", "B")),
        link(dut("D", "E"), dut("H", "B")),
        link(dut("E", "B"), dut("F", "B")),
        link(dut("E", "C"), dut("L", "A")),
        link(dut("F", "C"), dut("L", "B")),
      ),
    );
  }

  /**
   * 九设备拓扑（在 nine_devices_topo_links_type_2 基础上去掉 DUTA-DUTB 直连）：
   *
   *   A-C: DUTA PortB <=> DUTC PortA
   *   A-D: DUTA PortC <=> DUTD PortA
   *   B-C: DUTB PortB <=> DUTC PortB
   *   B-D: DUTB PortC <=> DUTD PortB
   *   B-E: DUTB PortD <=> DUTE PortA
   *   B-F: DUTB PortE <=> DUTF PortA
   *   C-D: DUTC PortC <=> DUTD PortC
   *   C-G: DUTC PortD <=> DUTG PortA
   *   C-H: DUTC PortE <=> DUTH PortA
   *   D-G: DUTD PortD <=> DUTG PortB
   *   D-H: DUTD PortE <=> DUTH PortB
   *   E-F: DUTE PortB <=> DUTF PortB
   *   E-I: DUTE PortC <=> DUTI PortA
   *   F-I: DUTF PortC <=> DUTI PortB
   *
   *                     DUTA          DUTB
   *                    / | \          / | \
   *                   /  |  \        /  |  \
   *               DUTC --+-- DUTD  DUTE--+--DUTF
   *                 | \       / |      \    /
   *                 |   \   /   |       \  /
   *               DUTG ---+--- DUTH     DUTI
   */
  static get nine_devices_topo_links_type_3(): TopoLinks {
    return cached("nine_devices_topo_links_type_3", () =>
      topo(
        link(dut("A", "B"), dut("C", "A")),
        link(dut("A", "C"), dut("D", "A")),
        link(dut("B", "B"), dut("C", "B")),
        link(dut("B", "C"), dut("D", "B")),
        link(dut("B", "D"), dut("E", "A")),
        link(dut("B", "E"), dut("F", "A")),
        link(dut("C", "C"), dut("D", "C")),
        link(dut("C", "D"), dut("G", "A")),
        link(dut("C", "E"), dut("H", "A")),
        link(dut("D", "D"), dut("G", "B")),
        link(dut("D", "E"), dut("H", "B")),
        link(dut("E", "B"), dut("F", "B")),
        link(dut("E", "C"), dut("L", "A")),
        link(dut("F", "C"), dut("L", "B")),
      ),
    );
  }

  /**
   * 九设备拓扑：
   *
   *   A-B: DUTA PortA <=> DUTB PortA
   *   B-C: DUTB PortB <=> DUTC PortA
   *   C-F: DUTC PortB <=> DUTF PortA
   *   A-G: DUTA PortB <=> DUTG PortA
   *   G-H: DUTG PortB <=> DUTH PortA
   *   H-F: DUTH PortB <=> DUTF PortB
   *   E-A: DUTE PortA <=> DUTA PortC
   *   C-D: DUTC PortC <=> DUTD PortA
   *   D-E: DUTD PortB <=> DUTE PortB
   *   E-F: DUTE PortC <=> DUTF PortC
   *   C-E: DUTC PortD <=> DUTE PortD
   *
   *   DUTB ---- DUTA ---- DUTG ---- DUTH
   *               | \               |
   *               |  \              |
   *               |   DUTE -------- + ---- DUTF
   *               |     |  \                 |
   *             DUTC ---+   \                |
   *              |  \        \               |
   *            DUTD  +--------+--------------+
   *
   *   示意图仅表示相邻关系，端口对应关系以链路列表为准。
   */
  static get nine_devices_topo_links_type_4(): TopoLinks {
    return cached("nine_devices_topo_links_type_4", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("B", "B"), dut("C", "A")),
        link(dut("C", "B"), dut("K", "A")),
        link(dut("A", "B"), dut("G", "A")),
        link(dut("G", "B"), dut("H", "A")),
        link(dut("H", "B"), dut("K", "B")),
        link(dut("E", "A"), dut("A", "C")),
        link(dut("C", "C"), dut("D", "A")),
        link(dut("D", "B"), dut("E", "B")),
        link(dut("E", "C"), dut("K", "C")),
        link(dut("C", "D"), dut("E", "D")),
      ),
    );
  }

  /**
   * 十二设备拓扑：
   *
   *   A-B: DUTA PortA <=> DUTB PortA
   *   A-H: DUTA PortB <=> DUTH PortA
   *   A-I: DUTA PortC <=> DUTI PortA
   *   B-C: DUTB PortB <=> DUTC PortA
   *   C-D: DUTC PortB <=> DUTD PortA
   *   C-I: DUTC PortC <=> DUTI PortB
   *   C-J: DUTC PortD <=> DUTJ PortA
   *   D-E: DUTD PortB <=> DUTE PortA
   *   E-F: DUTE PortB <=> DUTF PortA
   *   F-H: DUTF PortB <=> DUTH PortB
   *   F-G: DUTF PortC <=> DUTG PortA
   *   J-K: DUTJ PortB <=> DUTK PortA
   *   K-I: DUTK PortB <=> DUTI PortC
   *   K-L: DUTK PortC <=> DUTL PortB
   *   L-G: DUTL PortA <=> DUTG PortB
   *
   *   DUTD -- DUTE
   *    |       |
   *   DUTC -- DUTF -- DUTG
   *    |  \    |  \    |
   *   DUTB  DUTJ  DUTH DUTL
   *    |      |         |
   *   DUTA -- DUTK -----+
   *    |       |
   *   DUTI ----+     （DUTI 同时连接 DUTC）
   *
   *   以上示意图仅表示相邻关系，端口对应关系以链路列表和下面的矩阵为准。
   */
  static get twelve_devices_topo_links_type_2(): TopoLinks {
    return cached("twelve_devices_topo_links_type_2", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("H", "A")),
        link(dut("A", "C"), dut("I", "A")),
        link(dut("B", "B"), dut("C", "A")),
        link(dut("C", "B"), dut("D", "A")),
        link(dut("C", "C"), dut("I", "B")),
        link(dut("C", "D"), dut("J", "A")),
        link(dut("D", "B"), dut("E", "A")),
        link(dut("E", "B"), dut("F", "A")),
        link(dut("F", "B"), dut("H", "B")),
        link(dut("F", "C"), dut("G", "A")),
        link(dut("J", "B"), dut("K", "A")),
        link(dut("K", "B"), dut("I", "C")),
        link(dut("K", "C"), dut("L", "B")),
        link(dut("L", "A"), dut("G", "B")),
      ),
    );
  }

  /**
   * 十二设备环形拓扑。每台设备使用两个端口，形成一条闭合环：
   *
   *   A -- B -- C -- D -- E -- F
   *   |                        |
   *   L -- K -- J -- I -- H -- G
   *
   * 端口约定：顺时针方向使用本端 PortA/PortB：
   *   A PortA -> B PortA, B PortB -> C PortA, ..., L PortB -> A PortB
   */
  static get twelve_devices_topo_links_type_1(): TopoLinks {
    return cached("twelve_devices_topo_links_type_1", () =>
      topo(
        link(dut("A", "A"), dut("B", "A")),
        link(dut("B", "B"), dut("C", "A")),
        link(dut("C", "B"), dut("D", "A")),
        link(dut("D", "B"), dut("E", "A")),
        link(dut("E", "B"), dut("F", "A")),
        link(dut("F", "B"), dut("G", "A")),
        link(dut("G", "B"), dut("H", "A")),
        link(dut("H", "B"), dut("I", "A")),
        link(dut("I", "B"), dut("J", "A")),
        link(dut("J", "B"), dut("K", "A")),
        link(dut("K", "B"), dut("L", "A")),
        link(dut("L", "B"), dut("A", "B")),
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

  /**
   * 六设备拓扑：
   *
   *   A-C: DUTA PortA <=> DUTC PortA
   *   A-D: DUTA PortB <=> DUTD PortA
   *   A-B: DUTA PortC <=> DUTB PortA
   *   B-E: DUTB PortB <=> DUTE PortA
   *   C-D: DUTC PortB <=> DUTD PortB
   *   D-F: DUTD PortC <=> DUTF PortA
   *   E-F: DUTE PortB <=> DUTF PortB
   *
   *              DUTA
   *             / | \
   *            /  |  \
   *        DUTB  DUTC--DUTD
   *          |           |
   *          |           |
   *        DUTE---------DUTF
   *
   *   链路矩阵（行 -> 列，值为本端端口-对端端口）：
   *
   *          DUTB          DUTC          DUTD          DUTE          DUTF
   *   DUTA  PortC-PortA   PortA-PortA   PortB-PortA   —             —
   *   DUTB                —             —             PortB-PortA   —
   *   DUTC                              PortB-PortB   —             —
   *   DUTD                                            —             PortC-PortA
   *   DUTE                                                          PortB-PortB
   */
  static get six_devices_topo_links_type_3(): TopoLinks {
    return cached("six_devices_topo_links_type_3", () =>
      topo(
        link(dut("A", "A"), dut("C", "A")),
        link(dut("A", "B"), dut("D", "A")),
        link(dut("A", "C"), dut("B", "A")),
        link(dut("B", "B"), dut("E", "A")),
        link(dut("C", "B"), dut("D", "B")),
        link(dut("D", "C"), dut("F", "A")),
        link(dut("E", "B"), dut("F", "B")),
      ),
    );
  }
}

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
