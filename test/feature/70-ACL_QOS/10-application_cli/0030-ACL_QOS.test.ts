import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("接口上的 qos policer（input/output）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "qos policer input color-blind cir 1000 cbs 10000 statistics",
    "qos policer output color-blind cir 1000 cbs 10000 statistics",
    "end",
  ]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "qos policer input color-blind cir 1000",
      "qos policer output color-blind cir 1000",
    ],
    false,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no qos policer input",
    "no qos policer output",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
