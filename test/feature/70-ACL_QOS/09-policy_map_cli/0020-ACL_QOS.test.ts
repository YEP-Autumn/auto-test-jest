import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("policy-map type qos policer 全参数 + aggregate-policer（02-pm-qos-policer-agg）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "qos aggregate-policer TC_AGG color-blind cir 2000 cbs 20000 statistics",
    "class-map type qos TC_CM_AGG",
    "match cos 2",
    "end",
    "configure terminal",
    "class-map type qos TC_CM_POL",
    "match cos 4",
    "end",
    "configure terminal",
    "class-map type qos TC_CM_PPS",
    "match cos 5",
    "end",
    "configure terminal",
    "policy-map type qos TC_PM_AGG",
    "class type qos TC_CM_AGG",
    "aggregate-policer TC_AGG",
    "set traffic-class 2",
    "quit",
    "class type qos TC_CM_POL",
    "policer color-aware cir 1000 cbs 10000 eir 2000 ebs 20000 conform transmit exceed drop violate drop statistics",
    "quit",
    "class type qos TC_CM_PPS",
    "policer pps color-blind cir 1000 cbs 100 conform transmit set-traffic-class 3 exceed drop violate drop statistics",
    "quit",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "qos aggregate-policer TC_AGG",
    "policy-map type qos TC_PM_AGG",
    "class type qos TC_CM_AGG",
    "aggregate-policer TC_AGG",
    "class type qos TC_CM_POL",
    "policer color-aware cir 1000",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no policy-map TC_PM_AGG",
    "no class-map TC_CM_AGG",
    "no class-map TC_CM_POL",
    "no class-map TC_CM_PPS",
    "no qos aggregate-policer TC_AGG",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
