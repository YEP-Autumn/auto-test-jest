import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("组合：time-range + UDF/ip ACL 引用（04-acl-time-range-udf）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "time-range TC_C_TR",
    "periodic 08:00 daily to 18:00",
    "end",
    "configure terminal",
    "ip access-list TC_C_TRACL",
    "10 permit tcp any any time-range TC_C_TR",
    "end",
    "configure terminal",
    "user-define access-list TC_C_UDF",
    "10 permit l2-head 0x0800 0xffff 12 time-range TC_C_TR",
    "end",
  ]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "time-range TC_C_TR",
      "periodic 08:00 daily to 18:00",
      "ip access-list TC_C_TRACL",
      "user-define access-list TC_C_UDF",
    ],
    false,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip access-list TC_C_TRACL",
    "no user-define access-list TC_C_UDF",
    "no time-range TC_C_TR",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
