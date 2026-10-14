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

test("接口 trust", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "trust dscp",
    "end",
    "configure terminal",
    `interface ${Port.B}`,
    "trust cos stag-cos",
    "end",
    "configure terminal",
    `interface ${Port.C}`,
    "trust cos ctag-cos",
    "end",
    "configure terminal",
    `interface ${Port.D}`,
    "trust port",
    "end",
  ]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    ["trust dscp", "trust cos stag-cos", "trust cos ctag-cos", "trust port"],
    false,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no trust",
    "end",
    "configure terminal",
    `interface ${Port.B}`,
    "no trust",
    "end",
    "configure terminal",
    `interface ${Port.C}`,
    "no trust",
    "end",
    "configure terminal",
    `interface ${Port.D}`,
    "no trust",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
