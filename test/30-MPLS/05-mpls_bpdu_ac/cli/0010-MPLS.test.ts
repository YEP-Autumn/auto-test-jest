import { Port } from "../../../../utils";
import { TestHelper } from "../../../../utils/TestHelper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("测试vpls在access接口相同vpls的ethernet ac 和 bpdu-forwad ac可以同时使用", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "mpls-vpls v1 ethernet",
    "mpls-vpls v1 bpdu-forward",
    "end",
  ]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no mpls-vpls v1",
    "no mpls-vpls v1 bpdu-forward",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
