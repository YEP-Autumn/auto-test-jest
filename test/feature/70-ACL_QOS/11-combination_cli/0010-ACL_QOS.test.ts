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
    "interface eth-0-1",
    "access-group input TC_C_IP",
    "service-policy type qos input TC_C_PM",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
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
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "interface eth-0-1",
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

test("组合：MAC ACL 用于 class-map match access-group（02-mac-acl-in-classmap）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "mac access-list TC_C_MAC",
    "10 permit src-mac any vlan 10",
    "end",
    "configure terminal",
    "class-map type qos TC_C_CM_MAC",
    "match access-group TC_C_MAC",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "mac access-list TC_C_MAC",
    "10 permit src-mac any dest-mac any vlan 10",
    "class-map type qos TC_C_CM_MAC",
    "match access-group TC_C_MAC",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no class-map TC_C_CM_MAC",
    "no mac access-list TC_C_MAC",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});

test("组合：control-plane ACL + class-map type control-plane + policy-map type control-plane（03-cp-acl-in-policy）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "control-plane access-list TC_C_CPACL",
    "10 permit exception any",
    "20 permit exception tcp untag-vlan ipv4 tcp any any dst-port eq 22",
    "end",
    "configure terminal",
    "class-map type control-plane TC_C_CM_CP",
    "match access-group TC_C_CPACL",
    "end",
    "configure terminal",
    "policy-map type control-plane TC_C_PM_CP",
    "class type control-plane TC_C_CM_CP",
    "policer cir 100 statistics",
    "quit",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "control-plane access-list TC_C_CPACL",
    "class-map type control-plane TC_C_CM_CP",
    "match access-group TC_C_CPACL",
    "policy-map type control-plane TC_C_PM_CP",
    "policer cir 100",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no policy-map TC_C_PM_CP",
    "no class-map TC_C_CM_CP",
    "no control-plane access-list TC_C_CPACL",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});

test("组合：time-range + UDF/ip ACL 引用（04-acl-time-range-udf）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "time-range TC_C_TR",
    "periodic 08:00 daily to 18:00",
    "end",
    "configure terminal",
    "ip access-list TC_C_TRACL",
    "10 permit tcp any any time-range TC_C_TR",
    "end",
    "configure terminal",
    "user-define access-list TC_C_UDF",
    "10 permit l2-head 0x0800 0xffff 12 time-range TC_C_TR",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "time-range TC_C_TR",
    "periodic 08:00 daily to 18:00",
    "ip access-list TC_C_TRACL",
    "user-define access-list TC_C_UDF",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip access-list TC_C_TRACL",
    "no user-define access-list TC_C_UDF",
    "no time-range TC_C_TR",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
