import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("测试vpls 在trunk接口下 vlan ac 和 bpdu-forward ac不能同时使用", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport mode trunk",
    "mpls-vpls v1 vlan 2",
  ]);

  testHelper.ExecRetMatchDutA(
    "mpls-vpls v1 bpdu-forward",
    "% MPLS BPDU forward ac can't use with vlan ac, need config vlan ac with bundling",
  );

  testHelper.CleanConfigDutA(["end"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no mpls-vpls v1 vlan 2",
    "switchport mode access",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
