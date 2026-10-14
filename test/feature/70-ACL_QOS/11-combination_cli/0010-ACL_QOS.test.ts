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

test("组合：IPv4 ACL + class-map + policy-map + 接口 service-policy（01-acl-cm-pm-interface）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip access-list TC_C_IP",
    "10 permit tcp any any",
    "20 deny udp any any",
    "30 permit icmp any any",
    "end",
    "configure terminal",
    "class-map type qos TC_C_CM_ACL",
    "match access-group TC_C_IP",
    "end",
    "configure terminal",
    "class-map type qos TC_C_CM_COS",
    "match cos 3",
    "end",
    "configure terminal",
    "policy-map type qos TC_C_PM",
    "class type qos TC_C_CM_ACL",
    "set dscp af11",
    "policer color-blind cir 1000 cbs 10000 statistics",
    "quit",
    "class type qos TC_C_CM_COS",
    "set cos 5",
    "statistics enable",
    "quit",
    "end",
    "configure terminal",
    `interface ${Port.A}`,
    "access-group input TC_C_IP",
    "service-policy type qos input TC_C_PM",
    "end",
  ]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "ip access-list TC_C_IP",
      "10 permit tcp any any",
      "class-map type qos TC_C_CM_ACL",
      "match access-group TC_C_IP",
      "policy-map type qos TC_C_PM",
      "class type qos TC_C_CM_ACL",
      "set dscp af11",
      "policer color-blind cir 1000",
      "access-group input TC_C_IP",
      "service-policy type qos input TC_C_PM",
    ],
    false,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no access-group input",
    "no service-policy type qos input",
    "end",
    "configure terminal",
    "no policy-map TC_C_PM",
    "no class-map TC_C_CM_ACL",
    "no class-map TC_C_CM_COS",
    "no ip access-list TC_C_IP",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
