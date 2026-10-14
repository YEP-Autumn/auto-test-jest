import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("port-group / vlan-group 上引用 ACL", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip access-list TC_G_ACL",
    "10 permit tcp any any",
    "end",
    "configure terminal",
    "port-group TC_PG",
    `member interface ${Port.A}`,
    `member interface ${Port.B}`,
    "access-group input TC_G_ACL",
    "end",
    "configure terminal",
    "vlan database",
    "vlan 100",
    "exit",
    "vlan-group TC_VG",
    "member vlan 100",
    "access-group input TC_G_ACL",
    "end",
  ]);

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "port-group TC_PG",
      `member interface ${Port.A}`,
      "vlan-group TC_VG",
      "member vlan 100",
      "access-group input TC_G_ACL",
    ],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no vlan-group TC_VG",
    "vlan database",
    "no vlan 100",
    "exit",
    "no port-group TC_PG",
    "no ip access-list TC_G_ACL",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
