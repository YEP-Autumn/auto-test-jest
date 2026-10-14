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

test("接口 service-policy type traffic-class", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "class-map type traffic-class TC_IF_TC",
    "match traffic-class 1",
    "end",
    "configure terminal",
    "policy-map type traffic-class TC_IF_PM",
    "class type traffic-class TC_IF_TC",
    "priority level 1",
    "quit",
    "end",
    "configure terminal",
    `interface ${Port.A}`,
    "service-policy type traffic-class TC_IF_PM",
    "end",
  ]);

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    ["service-policy type traffic-class TC_IF_PM"],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no service-policy type traffic-class",
    "end",
    "configure terminal",
    "no policy-map TC_IF_PM",
    "no class-map TC_IF_TC",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
