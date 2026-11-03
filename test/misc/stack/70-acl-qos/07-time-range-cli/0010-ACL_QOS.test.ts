import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("time-range 绝对/周期时间范围", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "time-range TC_TR_ABS",
    "absolute start 00:00:00 jan 1 2024 end 23:59:59 dec 31 2030",
    "end",
    "configure terminal",
    "time-range TC_TR_DAILY",
    "periodic 08:00 daily to 18:00",
    "end",
    "configure terminal",
    "time-range TC_TR_WEEK",
    "periodic 08:00 monday to 18:00 friday",
    "end",
    "configure terminal",
    "time-range TC_TR_WEEKDAYS",
    "periodic 09:00 weekdays to 17:00",
    "end",
    "configure terminal",
    "time-range TC_TR_WEEKEND",
    "periodic 09:00 weekend to 17:00",
    "end",
  ]);

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "time-range TC_TR_ABS",
      "absolute start 00:00:00 Jan 01 2024 end 23:59:59 Dec 31 2030",
      "time-range TC_TR_DAILY",
      "periodic 08:00 daily to 18:00",
      "time-range TC_TR_WEEK",
      "periodic 08:00 Mon to 18:00 Fri",
    ],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no time-range TC_TR_ABS",
    "no time-range TC_TR_DAILY",
    "no time-range TC_TR_WEEK",
    "no time-range TC_TR_WEEKDAYS",
    "no time-range TC_TR_WEEKEND",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
