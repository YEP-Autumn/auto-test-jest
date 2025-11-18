import { TestHelper } from "../../utils/TestHelper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("测试 VRF MAX", async () => {
  for (let i = 1; i < 250; i++) {
    testHelper.ExecConfigDutA([
      `configure terminal`,
      `ip vrf ${i}`,
      `router-id 1.1.1.${i}`,
      `rd 100:${i}`,
      `route-target both 100:100`,
      `end`,
    ]);
  }

  testHelper.CleanConfigDutA(["configure terminal", "end"]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
