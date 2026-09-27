import { Port } from "../../../../../utils";
import { TestHelper } from "../../../../../utils/test-helper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("测试vpls在trunk接口下vlan bundling ac和bpdu-forward ac可以同时使用", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport mode trunk",
    "mpls-vpls v1 vlan 2 bundling",
    "mpls-vpls v1 bpdu-forward",
    "end",
  ]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no mpls-vpls v1 vlan 2",
    "no mpls-vpls v1 bpdu-forward",
    "switchport mode access",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
