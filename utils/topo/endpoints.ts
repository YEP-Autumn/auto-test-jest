/**
 * 拓扑端点（endpoint）层。
 *
 * 用「符号」描述拓扑中的一端，例如 `dut("A", "D")` 表示 DUTA 的 PortD，
 * `traffic("A")` 表示第 A 个流量端口（`renix("A")` 是它的兼容别名）。
 * 真正的端口信息（device / if_index）在 `resolveEndpoint` 中才解析，
 * 并在缺失时抛出可读错误，而不是静默产生 `undefined`。
 */
import { Config } from "../comm/config";
import { TrafficConfig } from "../traffic/config";
import { PortMapping } from "./types";

/** 逻辑设备名，对应 Config.dut_list 的下标 A=0 .. L=11（最多 12 台） */
export type DutName =
  "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

/** 逻辑端口名，对应 portMapping 的下标 A=0 .. F=5（DUT 最多支持 6 个端口） */
export type PortName = "A" | "B" | "C" | "D" | "E" | "F";

const DUT_INDEX: Record<DutName, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 10,
  L: 11,
};

const PORT_INDEX: Record<PortName, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
};

/** 拓扑中的一端：DUT 的某个端口，或流量端口的某个端口 */
export type Endpoint =
  | { kind: "dut"; dut: DutName; port: PortName }
  | { kind: "traffic"; port: PortName }
  /** @deprecated 旧拓扑定义使用 kind="renix"，解析逻辑与 traffic 相同 */
  | { kind: "renix"; port: PortName };

/** 构造一个 DUT 端点，例如 dut("A", "D") = DUTA 的 PortD */
export function dut(dutName: DutName, port: PortName): Endpoint {
  return { kind: "dut", dut: dutName, port };
}

/** 构造一个流量端口端点，例如 traffic("A") = 第 A 个流量端口 */
export function traffic(port: PortName): Endpoint {
  return { kind: "traffic", port };
}

/**
 * @deprecated 使用 traffic("A")。
 *
 * 返回值仍然是流量端口，不绑定具体 Renix 后端。
 */
export function renix(port: PortName): Endpoint {
  return traffic(port);
}

/**
 * 把端点解析为真实的端口信息。
 *
 * 这是唯一的解析入口：任何未配置的设备/端口都会在这里抛出明确错误，
 * 从而把「静默 undefined」变成「fail-fast」。
 */
export function resolveEndpoint(endpoint: Endpoint): PortMapping {
  if (endpoint.kind === "traffic" || endpoint.kind === "renix") {
    return TrafficConfig.resolveTopology(endpoint.port);
  }

  const device = Config.dut_list[DUT_INDEX[endpoint.dut]];
  if (!device) {
    throw new Error(
      `DUT ${endpoint.dut} 未在 Config.dut_list 中配置（当前仅 ${Config.dut_list.length} 台）`,
    );
  }

  const port = device.portMapping[PORT_INDEX[endpoint.port]];
  if (!port) {
    throw new Error(`DUT ${endpoint.dut} 未配置端口 ${endpoint.port}`);
  }
  return port;
}
