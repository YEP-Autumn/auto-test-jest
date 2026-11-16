import { Config } from "@/utils/runtime/config/index";
import { StreamPort } from "@/utils";
import { streamPorts } from "@/utils/runtime/config/traffic";
import { loadConfig, validateConfig } from "@/utils/runtime/config/loader";
import { TRAFFIC_PORT_IDS } from "@/utils/domain/traffic/stream-port";
import { StreamPortResolver } from "@/utils/runtime/traffic/resolver";
import { resolvedPortKey } from "@/utils/domain/traffic/resolved-port";

function resolve(port: StreamPort) {
  return new StreamPortResolver(streamPorts).resolve(port);
}

describe("stream port config", () => {
  test("Config keeps code defaults and reads environment values from JSON", () => {
    expect(Config.dut_list.length).toBeGreaterThan(0);
    expect(Config.defaultTopoName).toBe("auto-test-topo");
    // pageSeparator 等 CLI 行为默认值仍来自代码，而不是 JSON
    expect(Config.default_cfg.pageSeparator).toBeInstanceOf(RegExp);
    expect(Config.default_cfg.terminalWidth).toBe(500);
  });

  test("loads JSON config with DUTs and stream ports", () => {
    const config = loadConfig();
    expect(config.dut.list.length).toBeGreaterThan(0);
    expect(config.traffic.ports).toHaveLength(TRAFFIC_PORT_IDS.length);
    expect(config.topo.name).toBe("auto-test-topo");
  });

  test("StreamPort.A resolves the first streamPorts entry", () => {
    expect(resolve(StreamPort.A)).toEqual({
      id: "A",
      endpoint: {
        provider: streamPorts[0].provider,
        address: streamPorts[0].address,
      },
      topology: streamPorts[0].topology,
    });
    expect(resolve(StreamPort.E)).toMatchObject({
      endpoint: { provider: streamPorts[4].provider },
    });
  });

  test("reordering streamPorts changes the physical mapping only", () => {
    const original = [...streamPorts];
    [streamPorts[0], streamPorts[1]] = [streamPorts[1], streamPorts[0]];
    try {
      expect(resolve(StreamPort.A)).toMatchObject({
        id: "A",
        endpoint: { address: original[1].address },
        topology: original[1].topology,
      });
      expect(resolve(StreamPort.B)).toMatchObject({
        id: "B",
        endpoint: { address: original[0].address },
        topology: original[0].topology,
      });
    } finally {
      streamPorts.splice(0, original.length, ...original);
    }
  });

  test("unconfigured StreamPort fails with its position", () => {
    const resolver = new StreamPortResolver([]);
    expect(() => resolver.resolve(StreamPort.A)).toThrow(
      /streamPorts 只有 0 项/,
    );
  });

  test("topology resolution does not depend on provider/address", () => {
    const resolver = new StreamPortResolver(streamPorts);
    expect(resolver.resolveTopology(StreamPort.A)).toEqual(
      streamPorts[0].topology,
    );
    expect(resolver.resolveTopology("A")).toEqual(streamPorts[0].topology);
  });

  test("resolvedPortKey is stable for the internal endpoint", () => {
    const resolved = resolve(StreamPort.A);
    expect(resolvedPortKey(resolved)).toBe(
      `${resolved.endpoint.provider}:${resolved.endpoint.address}`,
    );
  });

  test("streamPorts covers all logical ids", () => {
    expect(streamPorts).toHaveLength(TRAFFIC_PORT_IDS.length);
  });

  test("invalid provider is rejected by config validation", () => {
    const config = loadConfig();
    const invalid = structuredClone(config);
    invalid.traffic.ports[0].provider = "ixia" as never;
    expect(() => validateConfig(invalid)).toThrow(/provider/);
  });

  test("portList/portMapping mismatch is rejected", () => {
    const config = loadConfig();
    const invalid = structuredClone(config);
    invalid.dut.list[0].portMapping.pop();
    expect(() => validateConfig(invalid)).toThrow(/数量不一致/);
  });
});
