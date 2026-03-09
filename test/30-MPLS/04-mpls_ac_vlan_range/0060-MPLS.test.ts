import { Port } from "../../../utils";
import { TestHelper } from "../../../utils/TestHelper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("vlan range ac在使用时，无法删除和修改raw vlan group", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "raw vlan group 1 flex-vlan 10-20",
    `interface ${Port.A}`,
    "switchport mode trunk",
    "mpls-vpls v1 flex-vlan-range-group 1",
    "end",
  ]);
  testHelper.ExecConfigDutA(["configure terminal"]);

  testHelper.ExecRetMatchDutA(
    "raw vlan group 1 flex-vlan 30-40",
    "Group mpls ac used",
  );

  testHelper.ExecRetMatchDutA("no raw vlan group 1", "Group mpls ac used");
  testHelper.ExecConfigDutA(["end"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no mpls-vpls v1 flex-vlan-range-group 1",
    "switchport mode access",
    "exit",
    "no raw vlan group 1",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
