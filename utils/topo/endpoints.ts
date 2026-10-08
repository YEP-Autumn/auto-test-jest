/**
 * 拓扑端点（endpoint）层。
 *
 * 用「符号」描述拓扑中的一端，例如 `dut("A", "D")` 表示 DUTA 的 PortD，
 * `renix("A")` 表示 Renix 的 PortA。真正的端口信息（device / if_index）
 * 在 `resolveEndpoint` 中才从 `Config` 解析，并在缺失时抛出可读错误，
 * 而不是静默产生 `undefined`。
 */
import { Config } from "../comm/config";
import { PortMapping } from "./types";

/** 逻辑设备名，对应 Config.dut_list 的下标 A=0 .. F=5 */
export type DutName = "A" | "B" | "C" | "D" | "E" | "F";

/** 逻辑端口名，对应 portMapping 的下标 A=0 .. D=3 */
export type PortName = "A" | "B" | "C" | "D";

const DUT_INDEX: Record<DutName, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
};

const PORT_INDEX: Record<PortName, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
};

/** 拓扑中的一端：DUT 的某个端口，或 Renix 的某个端口 */
export type Endpoint =
  | { kind: "dut"; dut: DutName; port: PortName }
  | { kind: "renix"; port: PortName };

/** 构造一个 DUT 端点，例如 dut("A", "D") = DUTA 的 PortD */
export function dut(dutName: DutName, port: PortName): Endpoint {
  return { kind: "dut", dut: dutName, port };
}

/** 构造一个 Renix 端点，例如 renix("A") = Renix 的 PortA */
export function renix(port: PortName): Endpoint {
  return { kind: "renix", port };
}

/**
 * 把端点解析为真实的端口信息。
 *
 * 这是唯一的解析入口：任何未配置的设备/端口都会在这里抛出明确错误，
 * 从而把「静默 undefined」变成「fail-fast」。
 */
export function resolveEndpoint(endpoint: Endpoint): PortMapping {
  if (endpoint.kind === "renix") {
    const port = Config.Renix.portList[PORT_INDEX[endpoint.port]]?.portMapping;
    if (!port) {
      throw new Error(`Renix 未配置端口 ${endpoint.port}`);
    }
    return port;
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
