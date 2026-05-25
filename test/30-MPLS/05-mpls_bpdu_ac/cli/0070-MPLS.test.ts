import { Port } from "../../../../utils";
import { TestHelper } from "../../../../utils/TestHelper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("测试在trunk接口下 vpls vlan bundling ac和vpls bpdu-forward ac和vpws vlan ac可以同时配置", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport mode trunk",
    "mpls-vpls v1 vlan 2 bundling",
    "mpls-vpls v2 bpdu-forward",
    "mpls-l2-circuit t1 vlan 100",
    "end",
  ]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no mpls-vpls v1 vlan 2",
    "no mpls-vpls v2 bpdu-forward",
    "no mpls-l2-circuit t1 vlan 100",
    "switchport mode access",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
