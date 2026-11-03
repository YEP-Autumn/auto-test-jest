import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("class-map type traffic-class 匹配", async () => {
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

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "class-map type traffic-class TC_CM_TC",
      "match traffic-class 1",
      "class-map type traffic-class TC_CM_TCALL",
      "match traffic-class 3",
    ],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no class-map TC_CM_TC",
    "no class-map TC_CM_TCALL",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
