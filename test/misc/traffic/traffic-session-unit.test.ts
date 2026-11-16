import type { TrafficBackend, TransmitHandle } from "@/utils/backends/contract";
import { BackendRegistry } from "@/utils/backends/registry";
import { PacketBuilder } from "@/utils/packet/model";
import { StreamPort } from "@/utils/traffic/model";
import { StreamPortResolver } from "@/utils/traffic/resolver";
import { TrafficSession } from "@/utils/traffic/session";

function createFakeBackend(calls: string[]): TrafficBackend {
  return {
    kind: "fake",
    async init() {
      calls.push("init");
    },
    async close() {
      calls.push("close");
    },
    async reservePort(port) {
      calls.push(`reserve:${port.address}`);
    },
    async releasePort(port) {
      calls.push(`release:${port.address}`);
    },
    async stopTransmit(port) {
      calls.push(`stop:${port.address}`);
    },
    async startCapture(port) {
      calls.push(`capture:${port.address}`);
    },
    async stopCapture(port) {
      calls.push(`capture-stop:${port.address}`);
    },
    async readCapture(port) {
      calls.push(`capture-read:${port.address}`);
      return [];
    },
    async sendPacket(port) {
      calls.push(`send:${port.address}`);
    },
    async startTransmit(port): Promise<TransmitHandle> {
      calls.push(`start:${port.address}`);
      return {
        runId: 1,
        port,
        frames: 1,
        durationMs: 0,
        wait: async () => undefined,
        stop: async () => undefined,
        state: async () => 6,
      };
    },
    async waitTransmit(port) {
      calls.push(`wait:${port.address}`);
    },
  };
}

describe("TrafficSession", () => {
  function setup() {
    const calls: string[] = [];
    const backend = createFakeBackend(calls);
    const resolver = new StreamPortResolver([
      {
        provider: "renix",
        address: "fake0",
        topology: { device: "dut", if_index: 1 },
      },
    ]);
    const registry = new BackendRegistry({
      factories: { renix: () => backend },
    });
    return {
      session: new TrafficSession(resolver, registry),
      calls,
    };
  }

  test("resolves StreamPort and drives the backend through one session", async () => {
    const { session, calls } = setup();

    await session.init([StreamPort.A]);
    await session.startCapture(StreamPort.A);
    await session.stopCapture(StreamPort.A);
    await session.readCapture(StreamPort.A);
    await session.sendPacket(
      StreamPort.A,
      new PacketBuilder().setEthernet({ src: "00:11:22:33:44:55" }).toSpec(),
    );
    await session.stopTransmit(StreamPort.A);
    await session.close();

    expect(calls).toEqual([
      "init",
      "reserve:fake0",
      "capture:fake0",
      "capture-stop:fake0",
      "capture-read:fake0",
      "start:fake0",
      "stop:fake0",
      "release:fake0",
      "close",
    ]);
  });

  test("session does not expose provider/address to the test", () => {
    const { session } = setup();
    expect(session.resolve(StreamPort.A)).toMatchObject({
      id: "A",
      endpoint: { provider: "renix", address: "fake0" },
    });
    expect(session.resolveTopology(StreamPort.A)).toEqual({
      device: "dut",
      if_index: 1,
    });
  });
});
