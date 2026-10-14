import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("ACL 绑定到接口（access-group input/output）（01-interface-access-group）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip access-list TC_ACL_IF",
    "10 permit tcp any any",
    "20 deny udp any any",
    "end",
    "configure terminal",
    "interface eth-0-1",
    "access-group input TC_ACL_IF",
    "access-group output TC_ACL_IF",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "access-group input TC_ACL_IF",
    "access-group output TC_ACL_IF",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "interface eth-0-1",
    "no access-group input",
    "no access-group output",
    "end",
    "configure terminal",
    "no ip access-list TC_ACL_IF",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
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

test("接口上的 qos policer（input/output）（03-interface-qos-policer）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "interface eth-0-1",
    "qos policer input color-blind cir 1000 cbs 10000 statistics",
    "qos policer output color-blind cir 1000 cbs 10000 statistics",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "qos policer input color-blind cir 1000",
    "qos policer output color-blind cir 1000",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "interface eth-0-1",
    "no qos policer input",
    "no qos policer output",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
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

test("接口 trust / qos shape rate / service-policy type traffic-class（05-interface-trust-shape）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "class-map type traffic-class TC_IF_TC",
    "match traffic-class 1",
    "end",
    "configure terminal",
    "policy-map type traffic-class TC_IF_PM",
    "class type traffic-class TC_IF_TC",
    "priority level 1",
    "quit",
    "end",
    "configure terminal",
    "interface eth-0-1",
    "trust dscp",
    "end",
    "configure terminal",
    "interface eth-0-2",
    "trust cos stag-cos",
    "end",
    "configure terminal",
    "interface eth-0-3",
    "trust cos ctag-cos",
    "end",
    "configure terminal",
    "interface eth-0-4",
    "trust port",
    "end",
    "configure terminal",
    "interface eth-0-5",
    "qos shape rate 1000",
    "end",
    "configure terminal",
    "interface eth-0-6",
    "qos shape rate pir 1000",
    "end",
    "configure terminal",
    "interface eth-0-7",
    "qos shape rate 1000 ecn-percentage 60",
    "end",
    "configure terminal",
    "interface eth-0-8",
    "qos shape rate pir 1000 ecn-percentage 60",
    "end",
    "configure terminal",
    "interface eth-0-9",
    "service-policy type traffic-class TC_IF_PM",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "trust dscp",
    "trust cos stag-cos",
    "trust cos ctag-cos",
    "trust port",
    "qos shape rate pir 1000",
    "qos shape rate pir 1000 ecn-percentage 60",
    "service-policy type traffic-class TC_IF_PM",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "interface eth-0-1",
    "no trust",
    "end",
    "configure terminal",
    "interface eth-0-2",
    "no trust",
    "end",
    "configure terminal",
    "interface eth-0-3",
    "no trust",
    "end",
    "configure terminal",
    "interface eth-0-4",
    "no trust",
    "end",
    "configure terminal",
    "interface eth-0-5",
    "no qos shape rate",
    "end",
    "configure terminal",
    "interface eth-0-6",
    "no qos shape rate",
    "end",
    "configure terminal",
    "interface eth-0-7",
    "no qos shape rate",
    "end",
    "configure terminal",
    "interface eth-0-8",
    "no qos shape rate",
    "end",
    "configure terminal",
    "interface eth-0-9",
    "no service-policy type traffic-class",
    "end",
    "configure terminal",
    "no policy-map TC_IF_PM",
    "no class-map TC_IF_TC",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});

test("port-group / vlan-group 上引用 ACL（06-portgroup-vlangroup）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip access-list TC_G_ACL",
    "10 permit tcp any any",
    "end",
    "configure terminal",
    "port-group TC_PG",
    "member interface eth-0-1",
    "member interface eth-0-2",
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

  testHelper.ExecRetMatchDutA("show running-config", [
    "port-group TC_PG",
    "member interface eth-0-1",
    "vlan-group TC_VG",
    "member vlan 100",
    "access-group input TC_G_ACL",
  ], false);

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
