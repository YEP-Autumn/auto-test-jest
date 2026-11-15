import { StreamPort } from "@/utils/testing";
import { streamPorts } from "@/utils/config/traffic";
import { TRAFFIC_PORT_IDS } from "@/utils/traffic/model";
import {
  parseTrafficProvider,
  resolverFromEnv,
  StreamPortResolver,
} from "@/utils/traffic/resolver";
import { resolvedPortKey } from "@/utils/traffic/types";

const ENV_KEYS = [
  "TRAFFIC_PROVIDER",
  "TRAFFIC_PROVIDER_A",
  "TRAFFIC_ADDRESS_A",
  "STREAM_CONTROL_PORT_MAP",
];

function resolve(port: StreamPort) {
  return resolverFromEnv(streamPorts).resolve(port);
}

describe("stream port config", () => {
  const saved = new Map<string, string | undefined>();

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      saved.set(key, process.env[key]);
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const value = saved.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    saved.clear();
  });

  test("StreamPort.A resolves the first streamPorts entry", () => {
    expect(resolve(StreamPort.A)).toEqual({
      id: "A",
      endpoint: { provider: "renix", address: "//172.16.254.11/3/13" },
      topology: { device: "172.16.9.110", if_index: 305 },
    });
    expect(resolve(StreamPort.E)).toMatchObject({
      endpoint: {
        provider: "scapy",
        address: "\\Device\\NPF_{D0DB71B0-1C1E-419C-8360-20C25AF8A6E1}",
      },
    });
  });

  test("reordering streamPorts changes the physical mapping only", () => {
    const original = [...streamPorts];
    [streamPorts[0], streamPorts[1]] = [
      streamPorts[1],
      streamPorts[0],
    ];
    try {
      expect(resolve(StreamPort.A)).toMatchObject({
        id: "A",
        endpoint: { address: "//172.16.254.11/3/14" },
        topology: { device: "172.16.9.110", if_index: 561 },
      });
      expect(resolve(StreamPort.B)).toMatchObject({
        id: "B",
        endpoint: { address: "//172.16.254.11/3/13" },
        topology: { device: "172.16.9.110", if_index: 305 },
      });
    } finally {
      streamPorts.splice(0, original.length, ...original);
    }
  });

  test("provider override uses STREAM_CONTROL_PORT_MAP for stream-linux", () => {
    process.env.TRAFFIC_PROVIDER_A = "stream-linux";
    process.env.STREAM_CONTROL_PORT_MAP = "A=eth9, B=eth10";
    expect(resolve(StreamPort.A)).toMatchObject({
      endpoint: { provider: "stream-linux", address: "eth9" },
    });

    process.env.TRAFFIC_PROVIDER = "stream-linux";
    expect(resolve(StreamPort.B)).toMatchObject({
      endpoint: { provider: "stream-linux", address: "eth10" },
    });
  });

  test("TRAFFIC_ADDRESS has the highest priority", () => {
    process.env.TRAFFIC_PROVIDER_A = "stream-linux";
    process.env.STREAM_CONTROL_PORT_MAP = "A=eth9";
    process.env.TRAFFIC_ADDRESS_A = "custom0";
    expect(resolve(StreamPort.A).endpoint.address).toBe("custom0");
  });

  test("provider without an address fails instead of guessing", () => {
    process.env.TRAFFIC_PROVIDER_A = "scapy";
    expect(() => resolve(StreamPort.A)).toThrow(/但当前要求使用 scapy/);
  });

  test("injected resolver does not depend on process.env", () => {
    process.env.TRAFFIC_ADDRESS_A = "from-env";
    const resolver = new StreamPortResolver({
      slots: streamPorts,
      overrides: { address: { A: "injected" } },
    });
    expect(resolver.resolve(StreamPort.A).endpoint.address).toBe("injected");
  });

  test("unconfigured StreamPort fails with its position", () => {
    const original = [...streamPorts];
    streamPorts.splice(0, streamPorts.length);
    try {
      expect(() => resolve(StreamPort.A)).toThrow(
        /streamPorts 只有 0 项/,
      );
    } finally {
      streamPorts.push(...original);
    }
  });

  test("unknown provider is rejected", () => {
    expect(() => parseTrafficProvider("ixia")).toThrow(/未知的流量后端/);
  });

  test("topology resolution does not depend on the selected provider", () => {
    const topology = resolverFromEnv(streamPorts).resolveTopology(
      StreamPort.A,
    );
    process.env.TRAFFIC_PROVIDER_A = "stream-linux";
    expect(
      resolverFromEnv(streamPorts).resolveTopology(StreamPort.A),
    ).toEqual(topology);
  });


  test("resolvedPortKey is stable for the internal endpoint", () => {
    const resolved = resolve(StreamPort.A);
    expect(resolvedPortKey(resolved)).toBe(
      `renix:${resolved.endpoint.address}`,
    );
  });

  test("streamPorts covers all logical ids", () => {
    expect(streamPorts).toHaveLength(TRAFFIC_PORT_IDS.length);
  });
});
