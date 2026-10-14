import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("class-map type control-plane 匹配", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "control-plane access-list TC_ACL_CP2",
    "10 permit exception any",
    "end",
    "configure terminal",
    "class-map type control-plane TC_CM_CP",
    "match access-group TC_ACL_CP2",
    "end",
  ]);

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    ["class-map type control-plane TC_CM_CP", "match access-group TC_ACL_CP2"],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no class-map TC_CM_CP",
    "no control-plane access-list TC_ACL_CP2",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
