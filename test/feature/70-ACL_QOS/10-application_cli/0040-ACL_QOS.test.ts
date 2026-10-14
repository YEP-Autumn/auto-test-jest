import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("全局 ACL 相关应用（http server acl / snmp-server access-group / acl-statistics）（04-global-acl-apply）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip access-list TC_ACL_G",
    "10 permit tcp any any",
    "end",
    "configure terminal",
    "http server acl TC_ACL_G",
    "snmp-server access-group TC_ACL_G in",
    "acl-statistics exclude-drop enable",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "http server acl TC_ACL_G",
    "snmp-server access-group TC_ACL_G in",
    "acl-statistics exclude-drop enable",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no http server acl",
    "no snmp-server access-group",
    "no acl-statistics exclude-drop enable",
    "no ip access-list TC_ACL_G",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
