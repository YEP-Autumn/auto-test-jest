import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("MAC ACL basic 满参数 rule 组合", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "time-range TC_TR_MAX",
    "periodic 08:00 daily to 18:00",
    "end",
    "configure terminal",
    "mac access-list TC_MAC_BASIC basic",
    "1 permit src-mac host 0011.2233.4455 dest-mac 0011.2233.4466 0000.0000.ffff vlan 100 cos 5 protocol arp time-range TC_TR_MAX",
    "2 deny src-mac any dest-mac any untag-vlan protocol rarp time-range TC_TR_MAX",
    "3 permit src-mac any dest-mac any protocol arp time-range TC_TR_MAX",
    "4 deny src-mac any dest-mac any vlan 10 cos 3 time-range TC_TR_MAX",
    "end",
  ]);

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "mac access-list TC_MAC_BASIC basic",
      "1 permit src-mac host 0011.2233.4455 dest-mac 0011.2233.0000 0000.0000.ffff vlan 100 cos 5 protocol arp time-range TC_TR_MAX",
      "2 deny src-mac any dest-mac any untag-vlan protocol rarp time-range TC_TR_MAX",
      "4 deny src-mac any dest-mac any vlan 10 cos 3 time-range TC_TR_MAX",
      "3 permit src-mac any dest-mac any protocol arp time-range TC_TR_MAX",
    ],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no mac access-list TC_MAC_BASIC basic",
    "no time-range TC_TR_MAX",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
