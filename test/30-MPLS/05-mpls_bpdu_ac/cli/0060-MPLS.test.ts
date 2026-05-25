import { Port } from "../../../../utils";
import { TestHelper } from "../../../../utils/TestHelper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("测试vpws 在trunk接口下每个vpws只能配置一个ac", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport mode trunk",
    "mpls-l2-circuit t1 bpdu-forward",
  ]);

  testHelper.ExecRetMatchDutA(
    "mpls-l2-circuit t1 vlan 2",
    "already bound to VPWS, VPLS or Layer-3 VPN instance",
  );

  testHelper.CleanConfigDutA(["end"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no mpls-l2-circuit t1 bpdu-forward",
    "switchport mode access",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
