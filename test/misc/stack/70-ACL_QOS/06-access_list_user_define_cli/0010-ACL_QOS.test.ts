import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("user-define（UDF）ACL 满参数 rule 组合", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "time-range TC_TR_MAX",
    "periodic 08:00 daily to 18:00",
    "end",
    "configure terminal",
    "user-define access-list TC_UDF",
    "10 permit l2-head 0x0800 0xffff 12 time-range TC_TR_MAX",
    "20 deny ipv4-head 0x4500 0xffff 0 time-range TC_TR_MAX",
    "30 permit l4-head 0x0050 0xffff 0 time-range TC_TR_MAX",
    "40 deny l2-head 0x0806 0xffff 12",
    "50 permit l2-head 0x0800 0xffff 12 ipv4-head 0x4500 0xffff 0 time-range TC_TR_MAX",
    "60 permit l2-head 0x0800 0xffff 12 ipv4-head 0x4500 0xffff 0 l4-head 0x0050 0xffff 0 time-range TC_TR_MAX",
    "70 deny l2-head 0x0000 0xffff 0 ipv4-head 0x0000 0xffff 0",
    "end",
  ]);

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "user-define access-list TC_UDF",
      "10 permit l2-head 0x00000800 0x0000ffff 12 time-range TC_TR_MAX",
      "50 permit l2-head 0x00000800 0x0000ffff 12 ipv4-head 0x00004500 0x0000ffff 0 time-range TC_TR_MAX",
      "60 permit l2-head 0x00000800 0x0000ffff 12 ipv4-head 0x00004500 0x0000ffff 0 l4-head 0x00000050 0x0000ffff 0 time-range TC_TR_MAX",
      "20 deny ipv4-head 0x00004500 0x0000ffff 0 time-range TC_TR_MAX",
      "30 permit l4-head 0x00000050 0x0000ffff 0 time-range TC_TR_MAX",
      "40 deny l2-head 0x00000806 0x0000ffff 12",
      "70 deny l2-head 0x00000000 0x0000ffff 0 ipv4-head 0x00000000 0x0000ffff 0",
    ],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no user-define access-list TC_UDF",
    "no time-range TC_TR_MAX",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
