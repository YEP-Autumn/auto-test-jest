import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("policy-map type control-plane 动作", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "control-plane access-list TC_ACL_PMCP",
    "10 permit exception any",
    "end",
    "configure terminal",
    "class-map type control-plane TC_CM_PMCP",
    "match access-group TC_ACL_PMCP",
    "end",
    "configure terminal",
    "policy-map type control-plane TC_PM_CP",
    "class type control-plane TC_CM_PMCP",
    "policer cir 100 statistics",
    "policer cir 100 cbs 1000 statistics",
    "statistics enable",
    "quit",
    "end",
  ]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "policy-map type control-plane TC_PM_CP",
      "policer cir 100",
      "statistics enable",
    ],
    false,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no policy-map TC_PM_CP",
    "no class-map TC_CM_PMCP",
    "no control-plane access-list TC_ACL_PMCP",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
