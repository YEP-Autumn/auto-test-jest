import type { BackendEndpoint } from "@/utils/backends/contract";
import { RunManager } from "@/utils/backends/grpc/run";

const port: BackendEndpoint = {
  provider: "stream-linux",
  address: "eth1",
};

function fakeClient(calls: string[], state = 6) {
  return {
    traffic: {},
    resource: {},
    run: {},
    async unary(_target: any, method: string) {
      calls.push(method);
      if (method === "GetRun") {
        return { result: { code: 0 }, state };
      }
      return { result: { code: 0 } };
    },
  } as any;
}

function record() {
  return {
    runId: 1,
    port,
    frames: 1,
    durationMs: 0,
    channelRef: { kind: "stream_channel", path: "ch" },
    templateRef: { kind: "stream_template", path: "tpl" },
    profileRef: { kind: "load_profile", path: "prof" },
  };
}

describe("RunManager", () => {
  test("stop calls TrafficService.Stop and deletes temporary resources", async () => {
    const calls: string[] = [];
    const manager = new RunManager(fakeClient(calls));
    manager.add(record());

    await manager.stop(port);

    expect(calls).toEqual(["Stop", "Delete", "Delete", "Delete"]);
  });

  test("wait reaps a completed run and releases its slot", async () => {
    const calls: string[] = [];
    const manager = new RunManager(fakeClient(calls, 6));
    manager.add(record());

    await manager.wait(port);

    expect(calls).toEqual(["GetRun", "Stop", "Delete", "Delete", "Delete"]);
  });

  test("stopAll clears tracked runs", async () => {
    const calls: string[] = [];
    const manager = new RunManager(fakeClient(calls));
    manager.add(record());

    await manager.stopAll();
    await manager.stop(port);

    // 第二次 stop 不应再产生调用
    expect(calls).toEqual(["Stop", "Delete", "Delete", "Delete"]);
  });
});
