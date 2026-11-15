import type { TrafficBackend } from "@/utils/backends/contract";
import { BackendRegistry } from "@/utils/backends/registry";

function fakeBackend(calls: string[]): TrafficBackend {
  return {
    kind: "fake",
    async init() {
      calls.push("init");
    },
    async close() {
      calls.push("close");
    },
    async reservePort() {},
    async releasePort() {},
    async stopTransmit() {},
    async startCapture() {},
    async stopCapture() {},
    async readCapture() {
      return [];
    },
    async sendPacket() {},
    async startTransmit() {
      throw new Error("not used");
    },
    async waitTransmit() {},
  };
}

describe("BackendRegistry", () => {
  test("creates and initializes a backend once per provider", async () => {
    const calls: string[] = [];
    let created = 0;
    const registry = new BackendRegistry({
      factories: {
        renix: () => {
          created++;
          return fakeBackend(calls);
        },
      },
    });

    const [a, b] = await Promise.all([
      registry.get("renix"),
      registry.get("renix"),
    ]);
    expect(a).toBe(b);
    expect(created).toBe(1);
    expect(calls).toEqual(["init"]);

    await registry.close();
    expect(calls).toEqual(["init", "close"]);
  });

  test("unknown provider is rejected", async () => {
    const registry = new BackendRegistry();
    await expect(registry.get("ixia" as any)).rejects.toThrow(
      /未知的流量后端/,
    );
  });
});
