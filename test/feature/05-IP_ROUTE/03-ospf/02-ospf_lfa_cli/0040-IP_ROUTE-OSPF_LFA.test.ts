import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * OSPF 网络类型 CLI 用例（不依赖邻居）：
 *   broadcast / non-broadcast(NBMA) / point-to-multipoint / point-to-point
 * 逐个下发并校验 running-config；NBMA 额外校验 neighbor 命令可配置。
 * 功能层面的邻居建立与 LFA 保护由后续拓扑用例覆盖。
 *
 * 设备实测命令：
 *   ip ospf network broadcast
 *   ip ospf network non-broadcast
 *   ip ospf network point-to-multipoint
 *   ip ospf network point-to-point
 *   router ospf
 *   neighbor 10.0.0.2 priority 1
 */
test("OSPF 四种网络类型与 NBMA neighbor 命令均可正确配置", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.0.0.1/24",
    "ip ospf network broadcast",
    "exit",
    "router ospf",
    "network 10.0.0.0/24 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config | include ip ospf network", [
    "ip ospf network broadcast",
  ]);
  testHelper.ExecRetMatchDutA("show running-config | include fast-reroute", [
    "fast-reroute per-prefix enable",
  ]);

  for (const networkType of [
    "non-broadcast",
    "point-to-multipoint",
    "point-to-point",
  ]) {
    testHelper.ExecConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      `ip ospf network ${networkType}`,
      "end",
    ]);
    testHelper.ExecRetMatchDutA(
      "show running-config | include ip ospf network",
      `ip ospf network ${networkType}`,
    );
  }

  // NBMA 场景需要静态邻居；校验命令可配置并写入 running-config。
  testHelper.ExecConfigDutA([
    "configure terminal",
    "router ospf",
    "neighbor 10.0.0.2 priority 1",
    "exit",
    "end",
  ]);
  testHelper.ExecRetMatchDutA("show running-config | include neighbor", [
    "neighbor 10.0.0.2",
  ]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router ospf",
    `interface ${Port.A}`,
    "no ip ospf network",
    "no ip address",
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
