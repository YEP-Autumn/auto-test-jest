import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("policy-map type traffic-class 全部队列/调度动作（03-pm-traffic-class）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "class-map type traffic-class TC_TC_1",
    "match traffic-class 1",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_2",
    "match traffic-class 2",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_3",
    "match traffic-class 3",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_4",
    "match traffic-class 4",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_5",
    "match traffic-class 5",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_6",
    "match traffic-class 6",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_7",
    "match traffic-class 7",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_8",
    "match traffic-class-all 0",
    "end",
    "configure terminal",
    "policy-map type traffic-class TC_PM_TC",
    "class type traffic-class TC_TC_1",
    "priority level 1",
    "quit",
    "class type traffic-class TC_TC_2",
    "bandwidth percentage 10",
    "quit",
    "class type traffic-class TC_TC_3",
    "queue-limit 100",
    "quit",
    "class type traffic-class TC_TC_4",
    "queue-limit 100 ecn-threshold 80",
    "quit",
    "class type traffic-class TC_TC_5",
    "queue-limit maximum",
    "quit",
    "class type traffic-class TC_TC_6",
    "queue-limit maximum ecn-threshold maximum",
    "quit",
    "class type traffic-class TC_TC_7",
    "queue-limit dynamic 1",
    "quit",
    "class type traffic-class TC_TC_8",
    "random-detect maximum-threshold 100",
    "quit",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "policy-map type traffic-class TC_PM_TC",
    "priority level 1",
    "bandwidth percentage 10",
    "queue-limit 100",
    "queue-limit maximum",
    "queue-limit dynamic 1",
    "random-detect maximum-threshold 100",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no policy-map TC_PM_TC",
    "no class-map TC_TC_1",
    "no class-map TC_TC_2",
    "no class-map TC_TC_3",
    "no class-map TC_TC_4",
    "no class-map TC_TC_5",
    "no class-map TC_TC_6",
    "no class-map TC_TC_7",
    "no class-map TC_TC_8",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
