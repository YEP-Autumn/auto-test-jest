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

test("接口 qos shape rate", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "qos shape rate 1000",
    "end",
    "configure terminal",
    `interface ${Port.B}`,
    "qos shape rate pir 1000",
    "end",
    "configure terminal",
    `interface ${Port.C}`,
    "qos shape rate 1000 ecn-percentage 60",
    "end",
    "configure terminal",
    `interface ${Port.D}`,
    "qos shape rate pir 1000 ecn-percentage 60",
    "end",
  ]);

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    ["qos shape rate pir 1000", "qos shape rate pir 1000 ecn-percentage 60"],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no qos shape rate",
    "end",
    "configure terminal",
    `interface ${Port.B}`,
    "no qos shape rate",
    "end",
    "configure terminal",
    `interface ${Port.C}`,
    "no qos shape rate",
    "end",
    "configure terminal",
    `interface ${Port.D}`,
    "no qos shape rate",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
