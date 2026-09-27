import { Port } from "../../../../utils";
import { TestHelper } from "../../../../utils/test-helper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("一个接口只能配置一个mpls vlan range ac", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "raw vlan group 1 flex-vlan 10-20",
    "raw vlan group 2 flex-vlan 20-30",
    `interface ${Port.A}`,
    "switchport mode trunk",
    "mpls-vpls v1 flex-vlan-range-group 1",
  ]);

  testHelper.ExecRetMatchDutA(
    "mpls-vpls v2 flex-vlan-range-group 2",
    "Vlan range only can config one vpls ac on same interface",
  );

  testHelper.ExecConfigDutA(["end"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no mpls-vpls v1 flex-vlan-range-group 1",
    "switchport mode access",
    "exit",
    "no raw vlan group 1",
    "no raw vlan group 2",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});

test("同一个接口上dot1q-tunnel type flex raw vlan group不能和 mpls vlan range ac同时使用", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "raw vlan group 1 flex-vlan 10-20",
    "raw vlan group 2 flex-vlan 20-30",
    "ethernet evc 1",
    "dot1q mapped-vlan 100",
    "exit",
    "vlan mapping table vm1",
    "raw-vlan group 1 evc 1",
    "exit",
    `interface ${Port.A}`,
    "switchport mode dot1q-tunnel",
    "switchport dot1q-tunnel type flex",
    "switchport dot1q-tunnel vlan mapping table vm1",
  ]);

  testHelper.ExecRetMatchDutA(
    "mpls-vpls v1 flex-vlan-range-group 2",
    "Vlan range already in use with vlan mapping",
  );

  testHelper.ExecConfigDutA(["no switchport dot1q-tunnel vlan mapping table"]);
  testHelper.ExecConfigDutA(["mpls-vpls v1 flex-vlan-range-group 2"]);

  testHelper.ExecRetMatchDutA(
    "switchport dot1q-tunnel vlan mapping table vm1",
    "VLAN range conflict with mpls ac vlan",
  );

  testHelper.ExecConfigDutA(["end"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no mpls-vpls v1 flex-vlan-range-group 2",
    "switchport mode access",
    "exit",
    "no vlan mapping table vm1",
    "no ethernet evc 1",
    "no raw vlan group 1",
    "no raw vlan group 2",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});

test("接口配置mpls vlan range ac后, 不能向dot1q-tunnel type flex 的vlan mapping table中添加 raw vlan group条目", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "raw vlan group 1 flex-vlan 10-20",
    "raw vlan group 2 flex-vlan 20-30",
    "ethernet evc 1",
    "dot1q mapped-vlan 100",
    "exit",
    "vlan mapping table vm1",
    "exit",
    `interface ${Port.A}`,
    "switchport mode dot1q-tunnel",
    "switchport dot1q-tunnel type flex",
    "switchport dot1q-tunnel vlan mapping table vm1",
    "mpls-vpls v1 flex-vlan-range-group 1",
    "end",
  ]);

  testHelper.ExecConfigDutA(["configure terminal", "vlan mapping table vm1"]);

  testHelper.ExecRetMatchDutA(
    "raw-vlan group 2 evc 1",
    "VLAN range conflict with mpls ac vlan",
  );
  testHelper.ExecConfigDutA(["end"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no mpls-vpls v1 flex-vlan-range-group 1",
    "switchport mode access",
    "exit",
    "no vlan mapping table vm1",
    "no ethernet evc 1",
    "no raw vlan group 1",
    "no raw vlan group 2",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
