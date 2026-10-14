import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("测试在trunk接口下 vpls vlan bundling ac和vpws vlan ac 和 vpws bpdu-forwad ac可以同时配置", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport mode trunk",
    "mpls-vpls v1 vlan 2 bundling",
    "mpls-l2-circuit t1 vlan 100",
    "mpls-l2-circuit t2 bpdu-forward",
    "end",
  ]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no mpls-vpls v1 vlan 2",
    "no mpls-l2-circuit t1 vlan 100",
    "no mpls-l2-circuit t2 bpdu-forward",
    "switchport mode access",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
