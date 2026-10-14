import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("policy-map 绑定到接口（service-policy type qos input）（02-interface-service-policy）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip access-list TC_ACL_SP",
    "10 permit tcp any any",
    "end",
    "configure terminal",
    "class-map type qos TC_CM_SP",
    "match access-group TC_ACL_SP",
    "end",
    "configure terminal",
    "policy-map type qos TC_PM_SP",
    "class type qos TC_CM_SP",
    "set dscp cs1",
    "quit",
    "end",
    "configure terminal",
    "interface eth-0-1",
    "service-policy type qos input TC_PM_SP",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", "service-policy type qos input TC_PM_SP", false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "interface eth-0-1",
    "no service-policy type qos input",
    "end",
    "configure terminal",
    "no policy-map TC_PM_SP",
    "no class-map TC_CM_SP",
    "no ip access-list TC_ACL_SP",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
