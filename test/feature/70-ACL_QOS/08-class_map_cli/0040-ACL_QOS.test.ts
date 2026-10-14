import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("class-map match-all/any 传统形式（04-cm-match-all）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip access-list TC_ACL_L",
    "10 permit tcp any any",
    "end",
    "configure terminal",
    "class-map match-all TC_CM_LEGACY",
    "match access-group TC_ACL_L",
    "end",
  ]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    ["class-map match-all TC_CM_LEGACY", "match access-group TC_ACL_L"],
    false,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no class-map TC_CM_LEGACY",
    "no ip access-list TC_ACL_L",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
