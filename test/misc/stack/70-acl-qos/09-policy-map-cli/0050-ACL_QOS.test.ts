import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("table-map 映射表参数", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "table-map TC_TM",
    "map from 1 to 2",
    "map from 3 4 5 6 7 8 to 9",
    "map from 10 11 12 13 14 15 16 17 to 63",
    "default copy",
    "end",
    "configure terminal",
    "table-map TC_TM2",
    "map from 20 to 21",
    "default 7",
    "end",
    "configure terminal",
    "table-map TC_TM3",
    "default ignore",
    "end",
  ]);

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "table-map TC_TM",
      "map from 1 to 2",
      "map from 3 to 9",
      "default copy",
      "table-map TC_TM2",
      "default 7",
      "table-map TC_TM3",
      "default ignore",
    ],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no table-map TC_TM",
    "no table-map TC_TM2",
    "no table-map TC_TM3",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
