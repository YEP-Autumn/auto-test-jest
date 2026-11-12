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
 * OSPF LFA CLI 用例（不依赖拓扑与邻居）：
 *   1. 全局使能/去使能 `fast-reroute per-prefix enable`；
 *   2. 接口配置 `candidate disable` / `protection disable` 并校验 running-config；
 *   3. L2 接口配置 LFA 角色时被拒绝。
 *
 * 设备实际回显（E530 3.3.2.4）：
 *   Switch(config-router)# fast-reroute per-prefix enable
 *   Switch(config-if)# ip ospf fast-reroute per-prefix candidate disable
 *   % This can't be configured for L2 interface.
 */
test("OSPF LFA 的全局使能、接口角色配置与 L2 接口拒绝行为符合预期", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.0.0.1/24",
    "ip ospf network point-to-point",
    "exit",
    "router ospf",
    "network 10.0.0.0/24 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config | include fast-reroute", [
    "fast-reroute per-prefix enable",
  ]);
  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    "Area 0.0.0.0",
    new RegExp("Fast-reroute per-prefix\\s*:\\s*enabled"),
  ]);

  // 配置接口的候选角色与受保护角色。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "ip ospf fast-reroute per-prefix candidate disable",
    "ip ospf fast-reroute per-prefix protection disable",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config | include fast-reroute", [
    "fast-reroute per-prefix enable",
    "ip ospf fast-reroute per-prefix candidate disable",
    "ip ospf fast-reroute per-prefix protection disable",
  ]);

  // L2 接口不允许配置 LFA 角色；使用 safeExec 捕获预期错误回显。
  testHelper.ExecCustomDutA(async (dut) => {
    await dut.safeExec("configure terminal");
    await dut.safeExec(`interface ${Port.B}`);
    const output = await dut.safeExec(
      "ip ospf fast-reroute per-prefix candidate disable",
    );
    await dut.safeExec("exit");
    await dut.safeExec("end");
    return output.includes("This can't be configured for L2 interface");
  });

  // 去使能全局 LFA 后，show 命令不再输出使能状态。
  testHelper.ExecConfigDutA([
    "configure terminal",
    "router ospf",
    "no fast-reroute per-prefix enable",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    "Area 0.0.0.0",
    new RegExp("Fast-reroute per-prefix\\s*:\\s*disabled"),
  ]);
  testHelper.ExecRetMatchDutA(
    "show running-config | include fast-reroute",
    "fast-reroute per-prefix enable",
    true,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router ospf",
    `interface ${Port.A}`,
    "no ip ospf fast-reroute per-prefix candidate disable",
    "no ip ospf fast-reroute per-prefix protection disable",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
