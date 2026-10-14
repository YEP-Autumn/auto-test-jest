import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("MAC ACL 满参数 rule 组合", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "time-range TC_TR_MAX",
    "periodic 08:00 daily to 18:00",
    "end",
    "configure terminal",
    "mac access-list TC_MAC",
    "10 permit src-mac host 0011.2233.4455 dest-mac 0011.2233.4466 0000.0000.ffff vlan 100 cos 5 inner-vlan 200 inner-cos 6 protocol arp arp-op-code 1 time-range TC_TR_MAX",
    "20 deny src-mac 0011.2233.4455 0000.0000.ffff dest-mac any vlan 100 cos 5 inner-vlan 200 inner-cos 6 protocol rarp time-range TC_TR_MAX",
    "30 permit src-mac any dest-mac any untag-vlan protocol arp time-range TC_TR_MAX",
    "40 permit src-mac any dest-mac any vlan 100 cos 5 inner-vlan 200 inner-cos 6",
    "50 deny src-mac any dest-mac any vlan 200 cos 2",
    "60 permit src-mac any inner-vlan 200 inner-cos 6",
    "70 deny src-mac any",
    "end",
  ]);

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "mac access-list TC_MAC",
      "10 permit src-mac host 0011.2233.4455 dest-mac 0011.2233.0000 0000.0000.ffff vlan 100 cos 5 inner-vlan 200 inner-cos 6 protocol arp arp-op-code 1 time-range TC_TR_MAX",
      "30 permit src-mac any dest-mac any untag-vlan protocol arp time-range TC_TR_MAX",
      "50 deny src-mac any dest-mac any vlan 200 cos 2",
      "20 deny src-mac 0011.2233.0000 0000.0000.ffff dest-mac any vlan 100 cos 5 inner-vlan 200 inner-cos 6 protocol rarp time-range TC_TR_MAX",
      "40 permit src-mac any dest-mac any vlan 100 cos 5 inner-vlan 200 inner-cos 6",
      "60 permit src-mac any dest-mac any inner-vlan 200 inner-cos 6",
      "70 deny src-mac any dest-mac any",
    ],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no mac access-list TC_MAC",
    "no time-range TC_TR_MAX",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
