import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("class-map type qos 多种 match 组合（01-cm-qos）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip access-list TC_ACL_CM",
    "10 permit tcp any any",
    "end",
    "configure terminal",
    "class-map type qos TC_CM_QOS_ACL",
    "match access-group TC_ACL_CM",
    "end",
    "configure terminal",
    "class-map type qos TC_CM_QOS_COS",
    "match cos 3",
    "end",
    "configure terminal",
    "class-map type qos TC_CM_QOS_COS_IN",
    "match cos inner 5",
    "end",
    "configure terminal",
    "class-map type qos TC_CM_QOS_DSCP",
    "match dscp af11",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "class-map type qos TC_CM_QOS_ACL",
    "match access-group TC_ACL_CM",
    "class-map type qos TC_CM_QOS_COS",
    "match cos 3",
    "class-map type qos TC_CM_QOS_COS_IN",
    "match cos inner 5",
    "class-map type qos TC_CM_QOS_DSCP",
    "match dscp af11",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no class-map TC_CM_QOS_ACL",
    "no class-map TC_CM_QOS_COS",
    "no class-map TC_CM_QOS_COS_IN",
    "no class-map TC_CM_QOS_DSCP",
    "no ip access-list TC_ACL_CM",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});

test("class-map type traffic-class 匹配（02-cm-traffic-class）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "class-map type traffic-class TC_CM_TC",
    "match traffic-class 1",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_CM_TCALL",
    "match traffic-class-all 3",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "class-map type traffic-class TC_CM_TC",
    "match traffic-class 1",
    "class-map type traffic-class TC_CM_TCALL",
    "match traffic-class 3",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no class-map TC_CM_TC",
    "no class-map TC_CM_TCALL",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});

test("class-map type control-plane 匹配（03-cm-control-plane）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "control-plane access-list TC_ACL_CP2",
    "10 permit exception any",
    "end",
    "configure terminal",
    "class-map type control-plane TC_CM_CP",
    "match access-group TC_ACL_CP2",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "class-map type control-plane TC_CM_CP",
    "match access-group TC_ACL_CP2",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no class-map TC_CM_CP",
    "no control-plane access-list TC_ACL_CP2",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});

test("class-map match-all/any 传统形式（04-cm-match-all）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip access-list TC_ACL_L",
    "10 permit tcp any any",
    "end",
    "configure terminal",
    "class-map match-all TC_CM_LEGACY",
    "match access-group TC_ACL_L",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "class-map match-all TC_CM_LEGACY",
    "match access-group TC_ACL_L",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no class-map TC_CM_LEGACY",
    "no ip access-list TC_ACL_L",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
