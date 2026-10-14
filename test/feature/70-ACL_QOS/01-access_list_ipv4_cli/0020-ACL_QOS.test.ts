import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("IPv4 ACL basic 满参数 rule 组合（02-ip-acl-basic）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "time-range TC_TR_MAX",
    "periodic 08:00 daily to 18:00",
    "end",
    "configure terminal",
    "ip access-list TC_IP_BASIC basic",
    "1 permit tcp any src-port eq 1024 any dst-port eq 80 dscp 10 ecn 1 time-range TC_TR_MAX",
    "2 permit udp host 10.1.1.1 src-port eq 53 host 10.2.2.2 dst-port eq 53 dscp 5 ecn 2 time-range TC_TR_MAX",
    "3 permit any 10.0.0.0 0.0.0.255 any dscp 10 ecn 1 time-range TC_TR_MAX",
    "4 deny tcp 10.0.0.0 0.0.0.255 src-port eq 80 any dst-port eq 80 dscp 3 ecn 3",
    "5 deny udp 10.9.0.0 0.0.0.255 src-port eq 80 any dst-port eq 80 dscp 1 ecn 0",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "ip access-list TC_IP_BASIC basic",
    "1 permit tcp any src-port eq 1024 any dst-port eq 80 dscp 10 ecn 1 time-range TC_TR_MAX",
    "2 permit udp host 10.1.1.1 src-port eq 53 host 10.2.2.2 dst-port eq 53 dscp 5 ecn 2 time-range TC_TR_MAX",
    "5 deny udp 10.9.0.0 0.0.0.255 src-port eq 80 any dst-port eq 80 dscp 1 ecn 0",
    "3 permit any 10.0.0.0 0.0.0.255 any dscp 10 ecn 1 time-range TC_TR_MAX",
    "4 deny tcp 10.0.0.0 0.0.0.255 src-port eq 80 any dst-port eq 80 dscp 3 ecn 3",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip access-list TC_IP_BASIC basic",
    "no time-range TC_TR_MAX",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
