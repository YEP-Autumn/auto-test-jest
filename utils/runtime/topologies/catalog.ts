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
   *
   *                          +--------+                   +--------+
   *                          |        |--PortA <=> PortA--|        |
   *  StreamPort.A <=> PortD--|  DUTA  |                   |  DUTB  |--PortD <=> StreamPort.B
   *                          |        |--PortB <=> PortB--|        |
   *                          +--------+                   +--------+
   *
   */
  static get two_devices_topo_links_type_4(): TopoLinks {
    return cached("two_devices_topo_links_type_4", () =>
      topo(
        link(traffic("A"), dut("A", "D")),
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("B", "B")),
        link(dut("B", "D"), traffic("B")),
      ),
    );
  }

  /**
   *
   *                          +--------+                   +--------+
   *  StreamPort.A <=> PortD--|        |                   |        |
   *                          |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortD <=> StreamPort.B
   *  StreamPort.C <=> PortB--|        |                   |        |
   *                          +--------+                   +--------+
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
   *  StreamPort.A <=> PortD--|  DUTA  |                   |  DUTB  |--PortB--+
   *                          |        |--PortC <=> PortC--|        |         |
   *                          +--------+                   +--------+         |
   *                                                                          |
   *                                                       +--------+         |
   *                               StreamPort.B <=> PortD--|  DUTC  |--PortB--+
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

  /**
   *                          +--------+                   +--------+
   *  StreamPort.A <=> PortD--|        |                   |        |
   *                          |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB--+
   *  StreamPort.C <=> PortB--|        |                   |        |         |
   *                          +--------+                   +--------+         |
   *                                                                          |
   *                                                       +--------+         |
   *                               StreamPort.B <=> PortD--|  DUTC  |--PortB--+
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
   *                         +----------+                   +----------+
   * StreamPort.A <=> PortD--|   DUTA   |--PortA <=> PortA--|   DUTB   |
   *                         +-+-----+--+                   +----+-----+
   *                           |     |                           |
   *                         PortB PortC                         |
   *                           |     |                         PortB
   *                         PortB PortC                         |
   *                           |     |                           |
   *                         +-+-----+--+                        |
   * StreamPort.B <=> PortD--|   DUTC   |--PortA-----------------+
   *                         +----------+
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
   *  StreamPort.A <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB--+
   *                          +--------+                   +--------+         |
   *                                                                          |
   *                                                       +--------+         |
   *                               StreamPort.B <=> PortD--|  DUTC  |--PortB--+
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
   *    |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB--+
   *    +--------+                   +--------+         |
   *                                                    |
   *    +--------+                   +--------+         |
   *    |  DUTD  |--PortA <=> PortA--|  DUTC  |--PortB--+
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
   *                                    +--------+
   *            +----------------PortC--|  DUTD  |--PortA-----------------+
   *            |                       +----+---+                        |
   *            |                            |                            |
   *            |                          PortB                          |
   *            |                            |                            |
   *          PortC                        PortC                        PortA
   *            |                            |                            |
   *       +----+---+                   +----+---+                   +----+---+
   *       |        |--PortA <=> PortA--|        |                   |        |
   *       |  DUTA  |                   |  DUTB  |                   |  DUTC  |
   *       |        |--PortB <=> PortB--|        |                   |        |
   *       +----+---+                   +----+---+                   +----+---+
   *            |                            |                            |
   *          PortD                        PortD                        PortD
   *            |                            |                            |
   *      StreamPort.A                 StreamPort.B                 StreamPort.C
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
   *                                    +--------+
   *        +-------------------PortB---|  DUTB  |--PortC----------+
   *        |                           +----+---+                 |
   *        |                                |                     |
   *        |                              PortA                   |
   *        |                                |                     |
   *        |                              PortA                   |
   *        |                                |                     |
   *        |                           +----+---+                 |
   *        |     +-------------PortB---|  DUTA  |--PortC----+     |
   *        |     |                     +--------+           |     |
   *        |     |                                          |     |
   *        |     |                                          |     |
   *      PortA PortA                                      PortB PortB
   *        |     |                                          |     |
   *        |     |                                          |     |
   *      +-+-----+-+                                      +-+-----+-+
   *      |  DUTC   |-----------PortC <=> PortC------------|  DUTD   |
   *      +---------+                                      +---------+
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
   *
   *                              +--------+
   *  +-------------------PortA---|  DUTA  |--PortB-------------------+
   *  |                           +---+----+                          |
   *  |                               |                               |
   *  |                             PortC                             |
   *  |                               |                               |
   *  |                             PortA                             |
   *  |                               |                               |
   *  |                           +---+----+                          |
   *  |     +--------------PortB--|  DUTD  |                          |
   *  |     |                     +--------+                          |
   *  |     |                                                         |
   * PortA PortC                                                     PortA
   *  |     |                                                         |
   * +-+-----+-+                                                 +-----+---+
   * |  DUTB   |-----------------PortB <=> PortB-----------------|  DUTC   |
   * +---------+                                                 +---------+
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
   *
   *                           +--------+                   +--------+
   *   StreamPort.A <=> PortB--|  DUTA  |--PortA <=> PortA--|  DUTB  |
   *                           +---+----+                   +---+----+
   *                               |                            |
   *                             PortD                        PortB
   *                               |                            |
   *                             PortD                        PortB
   *                               |                            |
   *                           +---+----+                   +---+----+
   *                           |  DUTD  |--PortC <=> PortC--|  DUTC  |
   *                           +--------+                   +---+----+
   *                                                            |
   *                                                           PortA
   *                                                            |
   *                                                       StreamPort.B
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
   *
   * +--------+                   +--------+
   * |  DUTA  |--PortA <=> PortA--|  DUTB  |
   * +---+----+                   +---+----+
   *     |                            |
   *   PortB                        PortB
   *     |                            |
   *   PortA                        PortA
   *     |                            |
   * +---+----+                   +---+----+
   * |  DUTC  |--PortB <=> PortB--|  DUTD  |
   * +---+----+                   +--------+
   *     |
   *   PortC
   *     |
   *   PortA
   *     |
   * +---+----+
   * |  DUTE  |
   * +--------+
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
   *                               +--------+
   *    +-------------------PortB--|  DUTB  |--PortC---------------------+
   *    |                          +---+----+                            |
   *    |                              |                                 |
   *    |                            PortA                               |
   *    |                              |                                 |
   *    |                            PortA                               |
   *    |                              |                                 |
   *    |                          +---+----+                            |
   *    |     +-------------PortB--|  DUTA  |--PortC---------------+     |
   *    |     |                    +--------+                      |     |
   *    |     |                                                    |     |
   *    |     |                    +--------+                      |     |
   *    |     |           +--------|  DUTE  |----------+           |     |
   *    |     |           |        +--------+          |           |     |
   *  PortB PortA         |                            |         PortA PortB
   *    |     |         PortA                        PortB         |     |
   *    |     |           |                            |           |     |
   * +--+-----+-+         |                            |         +-+-----+--+
   * |          |--PortD--+                            +--PortD--|          |
   * |   DUTC   |                                                |   DUTD   |
   * |          |----------------PortC <=> PortC-----------------|          |
   * +---+------+                                                +---+------+
   *     |                                                           |
   *   PortE                                                       PortE
   *     |                         +--------+                        |
   *     +---------------PortA-----|  DUTF  |--PortB-----------------+
   *                               +--------+
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
   *
   *                                  StreamPort.A
   *                                        |
   *                                      PortE
   *                                        |
   * +--------------------------------------+--------------------------------------+
   * |                                    DUTA                                     |
   * +-----+---------------------+------------------+-----------------------+------+
   *       |                     |                  |                       |
   *     PortC                 PortA              PortB                   PortD
   *       |                     |                  |                       |
   *     PortA                 PortA              PortA                   PortA
   *       |                     |                  |                       |
   * +-----+------+        +-----+------+     +-----+------+          +-----+------+
   * |    DUTD    |        |    DUTB    |     |    DUTC    |          |    DUTE    |
   * +-----+------+        +-+--------+-+     +--+------+--+          +-----+------+
   *       |                 |        |          |      |                   |
   *     PortB             PortC    PortB      PortB  PortC               PortB
   *       |                 |        |          |      |                   |
   *       +-----------------+        |          |      +-------------------+
   *                                  |          |
   *                                PortA      PortB
   *                                  |          |
   *                             +----+----------+----+
   *                             |        DUTF        |
   *                             +---------+----------+
   *                                       |
   *                                     PortC
   *                                       |
   *                                 StreamPort.B
   *
   */
  static get six_devices_topo_links_type_5(): TopoLinks {
    return cached("six_devices_topo_links_type_5", () =>
      topo(
        link(traffic("A"), dut("A", "E")),
        link(dut("A", "A"), dut("B", "A")),
        link(dut("A", "B"), dut("C", "A")),
        link(dut("A", "C"), dut("D", "A")),
        link(dut("A", "D"), dut("E", "A")),
        link(dut("B", "B"), dut("F", "A")),
        link(dut("C", "B"), dut("F", "B")),
        link(dut("D", "B"), dut("B", "C")),
        link(dut("E", "B"), dut("C", "C")),
        link(dut("F", "C"), traffic("B")),
      ),
    );
  }

  /**
   *
   *                               +----------+                     +----------+
   *                               |   DUTA   |---PortA <=> PortA---|   DUTB   |
   *                               +--+-----+-+                     +----+-----+
   *                                  |     |                            |
   *                                PortB PortC                        PortB
   *                                  |     |                            |
   *     +----------------------------+     |                            |
   *     |                                  |                            |
   *   PortA                                |                          PortA
   *     |                                  |                            |
   * +---+------+                           |                       +----+-----+
   * |   DUTD   |                           |                       |   DUTC   |
   * +--+-------+                           |                       +----+-----+
   *    |                                   |                            |
   *  PortB   +-----------------------------+                          PortB
   *    |     |                                                          |
   *  PortB PortA                                                      PortA
   *    |     |                                                          |
   * +--+-----+-+                    +----------+                   +----+-----+
   * |   DUTE   |---PortC <=> PortA--|   DUTF   |--PortB <=> PortB--|   DUTG   |
   * +----------+                    +----------+                   +----------+
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
   *
   * +---------+                   +---------+                   +---------+
   * |  DUTB   |--PortA <=> PortA--|  DUTA   |--PortC <=> PortA--|  DUTF   |
   * +----+----+                   +----+----+                   +----+----+
   *      |                             |                             |
   *    PortB                         PortB                         PortB
   *      |                             |                             |
   *    PortA                         PortA                         PortC
   *      |                             |                             |
   * +----+----+                   +----+----+                   +----+----+
   * |  DUTC   |                   |  DUTD   |--PortB <=> PortA--|  DUTH   |
   * +----+----+                   +----+----+                   +----+----+
   *      |                             |                             |
   *    PortB                         PortC                         PortB
   *      |                             |                             |
   *    PortA                         PortA                         PortB
   *      |                             |                             |
   * +----+----+                   +----+----+                   +----+----+
   * |  DUTG   |                   |  DUTL   |                   |  DUTE   |
   * +----+----+                   +---------+                   +----+----+
   *      |                                                           |
   *    PortB                                                       PortA
   *      |                                                           |
   *      +-----------------------------------------------------------+
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
   *
   *                                                           +--------+
   *                        +----------------------------------+  DUTL  |
   *                        |                                  +---+----+
   *                      PortA                                    |
   *                        |                                    PortB
   *                        |                                      |
   *                      PortC                                  PortC
   *                        |                                      |
   *                 +------+-+                                +---+----+
   *                 |  DUTE  +--------PortB <=> PortB---------+  DUTF  +----+
   *                 +---+----+                                +--------+    |
   *                     |                                                 PortA
   *                     |                                                   |
   *                     |                                                   |
   *                     +-------------PortD <=> PortA-------------+         |
   *                                                               |       PortE
   *                 +--------+                                +---+----+    |
   *    +------------+  DUTA  +--------PortA <=> PortA---------+  DUTB  +----+
   *    |            +----+---+                                +----+---+---------+
   *  PortB               |                                         |             |
   *    |                 +--PortC <=> PortA--+ +--PortC <=> PortB--+           PortB
   *    |                                     | |                                 |
   *    |   +--------+                    +---+-+--+                   +--------+ |
   *    |   |  DUTG  +--PortD <=> PortB---+  DUTD  +--PortE <=> PortB--+  DUTH  | |
   *    |   +----+---+                    +-+------+                   +---+----+ |
   *    |        |                          |                              |      |
   *    |        |                        PortC                            |      |
   *    |        |                          |                              |      |
   *    |        |                        PortC                            |      |
   *    |        |                          |                              |      |
   *  PortA      |                        +-+------+                       |    PortB
   *    |        +----PortD <=> PortA-----+  DUTC  +----PortE <=> PortA----+      |
   *    |                                 +--+--+--+                              |
   *    +------------------------------------+  +---------------------------------+
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
   *
   * +----------+                                      +----------+
   * |   DUTE   |-----------PortB <=> PortB------------|   DUTF   |
   * +--+-----+-+                                      +--+-----+-+
   *    |     |                                           |     |
   *  PortA PortC                                       PortC PortA
   *    |     |                                           |     |
   *    |     |                                           |     |
   *    |     |          +----------+                     |     |
   *    |     +---PortA--|   DUTL   |--PortB--------------+     |
   *    |                +----------+                           |
   *    |                                                       |
   *    +-------------------------------------------------+     |
   *                                                      |     |
   *    +----------------------------------+              |     |
   *    |                                  |              |     |
   *  PortC                                |            PortD  PortE
   *    |                                  |              |     |
   * +--+-------+                          |           +--+-----+-+
   * |   DUTA   |             +------------X----PortB--|   DUTB   |
   * +--+-------+             |            |           +--------+-+
   *    |                     |            |                    |
   *  PortB                   |            |                  PortC
   *    |     +---------------+            +--------------+     |
   *    |     |                                           |     |
   *  PortA PortB                                       PortA PortB
   *    |     |                                           |     |
   * +--+-----+--+                                     +--+-----+---+
   * |           |-------------PortC <=> PortC---------|            |
   * |    DUTC   |                                     |    DUTD    |
   * |           |--PortE-----+                        |            |
   * +--+--------+            |                        +--+-------+-+
   *    |                     |                           |      |
   *  PortD                   |                         PortD  PortE
   *    |       +-------------X---------------------------+       |
   *    |       |             |                                   |
   *  PortA   PortB           |                                 PortB
   *    |       |             |                                   |
   * +--+-------+-+           |                        +----------+-+
   * |    DUTG    |           +-----------------PortA--|    DUTH    |
   * +------------+                                    +------------+
   *
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
   *
   *        +--------+                              +--------+                              +--------+
   *        |  DUTB  +-------PortA <=> PortA--------+  DUTA  +-------PortB <=> PortA--------+  DUTG  |
   *        +---+----+                              +-+------+                              +---+----+
   *            |                                     |                                         |
   *          PortB                                 PortC                                     PortB
   *            |                                     |                                         |
   *          PortA                                   |                                       PortA
   *            |                                     |                                         |
   *        +---+----+                                |                                     +---+----+
   *  +-----+  DUTC  +-----+                          |                                     |  DUTH  |
   *  |     +-----+--+     |                        PortA                                   +------+-+
   *  |           |        |                          |                                            |
   *  |           |        |                        +-+------+                                   PortB
   *  |           |        +----PortD <=> PortD-----+  DUTE  +-----+                               |
   *  |           |                                 +---+----+     |                             PortB
   *  |           |                                     |          |                               |
   *  |           |                                   PortB        |                        +------+-+
   *  |           |                                     |          +----PortC <=> PortC-----+  DUTK  |
   *  |           |                                   PortB                                 +--+-----+
   *  |           |                                     |                                      |
   *  |           |                                 +---+----+                                 |
   *  |           +---------PortC <=> PortA---------+  DUTD  |                                 |
   *  |                                             +--------+                                 |
   *  |                                                                                        |
   *  |                                                                                        |
   *  |                                                                                        |
   *  +--------------------------------------PortB <=> PortA-----------------------------------+
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
   *
   *  +--------+
   *  |  DUTH  +---------------------PortB <=> PortB----------------------+
   *  +---+----+                                                          |
   *      |                                                               |
   *    PortA                                                             |
   *      |                                                               |
   *    PortB                                                             |
   *      |                                                               |
   *  +---+----+                                        +--------+        |
   *  |  DUTA  +------------PortC <=> PortA-------------+  DUTI  |        |
   *  +-----+--+                                        +---+---++        |
   *        |     +-------------PortC <=> PortB-------------+   |         |
   *      PortA   |                 +--------+                PortC       |
   *        |     |           +-----+  DUTJ  |                  |         |
   *      PortA   |           |     +----+---+                PortB       |
   *        |     |           |          +-PortB <=> PortA--+   |         |
   *  +-----+--+  |         PortA                       +---+---++        |
   *  |  DUTB  |  |           |                         |  DUTK  |        |
   *  +-+------+  |           |                         +-----+--+        |
   *    |         |           |                               |           |
   *  PortB       |         PortD                           PortC         |
   *    |         |           |                               |           |
   *  PortA       |           |                             PortB         |
   *    |         |           |                               |           |
   *  +-+------+--+           |                         +-----+--+        |
   *  |  DUTC  +--------------+                         |  DUTL  |        |
   *  +-----+--+                                        +-+------+        |
   *        |                                             |               |
   *      PortB                                         PortA             |
   *        |                                             |               |
   *      PortA                                         PortB             |
   *        |                                             |               |
   *  +-----+--+                                        +-+------+        |
   *  |  DUTD  |                                        |  DUTG  |        |
   *  +-+------+                                        +-----+--+        |
   *    |                                                     |           |
   *  PortB                                                 PortA         |
   *    |                                                     |           |
   *  PortA                                                 PortC         |
   *    |                                                     |           |
   *  +-+------+                                        +-----+--+        |
   *  |  DUTE  +------------PortB <=> PortA-------------+  DUTF  +--------+
   *  +--------+                                        +--------+
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
   *
   *       +--------+                   +--------+                   +--------+
   *   +---|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB <=> PortA--|  DUTC  |
   *   |   +----+---+                   +----+---+                   +----+---+
   *   |                                                                  |
   * PortB                                                              PortB
   *   |                                                                  |
   *   |                                                                PortA
   *   |                                                                  |
   *   |   +----+---+                   +--------+                   +----+---+
   *   |   |  DUTF  |--PortB <=> PortA--|  DUTE  |--PortB <=> PortA--|  DUTD  |
   *   |   +--------+                   +--------+                   +----+---+
   *   |        |
   *   |      PortB
   *   |        |
   *   |      PortA
   *   |        |
   *   |   +----+---+                   +--------+                   +--------+
   *   |   |  DUTG  |--PortB <=> PortA--|  DUTH  |--PortB <=> PortA--|  DUTI  |
   *   |   +--------+                   +--------+                   +----+---+
   *   |                                                                  |
   *   |                                                                PortB
   *   |                                                                  |
   * PortB                                                              PortA
   *   |                                                                  |
   *   |   +----+---+                   +--------+                   +----+---+
   *   +---|  DUTL  |--PortB <=> PortA--|  DUTK  |--PortB <=> PortA--|  DUTJ  |
   *       +--------+                   +--------+                   +--------+
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
   *    +---+----+                   +---+----+
   *        |                            |
   *      PortB                        PortB
   *        |                            |
   *      PortB                        PortB
   *        |                            |
   *    +---+----+                   +---+----+
   *    |  DUTC  |                   |  DUTD  |
   *    +---+----+                   +---+----+
   *        |                            |
   *      PortA                        PortA
   *        |                            |
   *      PortA                        PortA
   *        |                            |
   *    +---+----+                   +---+----+
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
   *                               +--------+
   *      +-----------------PortC--|  DUTD  |--PortA--------------------+
   *      |                        +----+---+                           |
   *      |                             |                               |
   *      |                           PortB                             |
   *      |                             |                               |
   *    PortC                         PortC                           PortA
   *      |                             |                               |
   * +-----+----+                   +----+-----+                   +-----+----+
   * |   DUTA   |--PortA <=> PortA--|   DUTB   |                   |   DUTC   |
   * +-+------+-+                   +-+------+-+                   +-+-----+--+
   *   |      |                       |      |                       |     |
   * PortB  PortD                   PortB  PortD                   PortC PortD
   *   |      |                       |      |                       |     |
   * PortA  PortB                   PortC  PortD                   PortA PortB
   *   |      |                       |      |                       |     |
   * +-+------+-----------------------+------+------+          +-----+-----+-+
   * |                     DUTE                     |          |    DUTF     |
   * +----------------------------------------------+          +-------------+
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
   *
   * +--------+                   +--------+                   +--------+
   * |  DUTB  |--PortC <=> PortA--|  DUTA  |--PortA <=> PortA--|  DUTC  |
   * +---+----+                   +---+----+                   +------+-+
   *     |                            |                               |
   *   PortB                        PortB                           PortB
   *     |                            |                               |
   *     |                            +----------------PortA-----+    |
   *     |                                                       |    |
   *   PortA                                                     |  PortB
   *     |                                                       |    |
   * +---+----+                                                +-+----+-+
   * |  DUTE  |                                                |  DUTD  |
   * +---+----+                                                +---+----+
   *     |                                                         |
   *   PortB                                                     PortC
   *     |                                                         |
   *     |                        +--------+                       |
   *     +----------PortB---------|  DUTF  |--PortA----------------+
   *                              +--------+
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
