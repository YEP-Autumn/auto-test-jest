import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("policy-map type performance-monitor 创建与 class（06-performance-monitor）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "class-map type qos TC_PMF_C",
    "match cos 0",
    "end",
    "configure terminal",
    "policy-map type performance-monitor TC_PM_PERF",
    "class type qos TC_PMF_C",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", "policy-map type performance-monitor TC_PM_PERF", false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no policy-map TC_PM_PERF",
    "no class-map TC_PMF_C",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
