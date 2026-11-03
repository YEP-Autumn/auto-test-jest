import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("MPLS ACL 满参数 rule 组合", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "time-range TC_TR_MAX",
    "periodic 08:00 daily to 18:00",
    "end",
    "configure terminal",
    "mpls access-list TC_MPLS",
    "10 permit topmost-label 100 exp 5 ttl 10 next-label 200 exp 3 ttl 8 next-label 300 exp 2 ttl 4 stack-bottom time-range TC_TR_MAX",
    "20 deny topmost-label any exp 0 ttl 255",
    "30 permit topmost-label 500 exp 1 ttl 20",
    "40 deny topmost-label any stack-bottom",
    "end",
  ]);

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "mpls access-list TC_MPLS",
      "10 permit topmost-label 100 exp 5 ttl 10 next-label 200 exp 3 ttl 8 next-label 300 exp 2 ttl 4 stack-bottom time-range TC_TR_MAX",
      "20 deny topmost-label any exp 0 ttl 255",
      "40 deny topmost-label any stack-bottom",
      "30 permit topmost-label 500 exp 1 ttl 20",
    ],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no mpls access-list TC_MPLS",
    "no time-range TC_TR_MAX",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
