import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("class-map type qos 多种 match 组合", async () => {
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

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "class-map type qos TC_CM_QOS_ACL",
      "match access-group TC_ACL_CM",
      "class-map type qos TC_CM_QOS_COS",
      "match cos 3",
      "class-map type qos TC_CM_QOS_COS_IN",
      "match cos inner 5",
      "class-map type qos TC_CM_QOS_DSCP",
      "match dscp af11",
    ],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

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
