import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("IPv4 ACL（普通）满参数 rule 组合（01-ip-acl-plain）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "time-range TC_TR_MAX",
    "periodic 08:00 daily to 18:00",
    "end",
    "configure terminal",
    "ip access-list TC_IP_PLAIN",
    "10 deny tcp any any",
    "20 permit tcp host 10.1.1.1 src-port range 1024 2048 10.2.2.0 0.0.0.255 dst-port eq 80 established ip-precedence 5 ecn 1 non-fragment routed-packet options packet-length range 64 1500 time-range TC_TR_MAX",
    "30 permit tcp 10.0.0.0 0.0.0.255 src-port gt 1024 any dst-port lt 1024 match-all ack syn dscp 10 ecn 2 first-fragment routed-packet options packet-length eq 500 time-range TC_TR_MAX",
    "40 permit tcp 10.3.0.0 0.0.0.255 src-port eq 53 any dst-port range 1024 2048 ip-precedence 7 small-fragment",
    "50 deny udp 192.168.0.0 0.0.255.255 src-port range 1 100 any dst-port range 1 65535 ip-precedence 7 small-fragment",
    "60 permit udp any src-port eq 53 any dst-port range 53 53 dscp 12 ecn 3 non-or-first-fragment options packet-length gt 100 time-range TC_TR_MAX",
    "70 permit icmp any any icmp-type 8 icmp-code 0 ip-precedence 5 ecn 1 non-first-fragment time-range TC_TR_MAX",
    "80 deny icmp 10.1.1.0 0.0.0.255 any icmp-type 3 ip-precedence 3 options",
    "90 permit igmp any any host-query ip-precedence 5 ecn 0 options packet-length lt 100 time-range TC_TR_MAX",
    "100 deny igmp 10.2.0.0 0.0.0.255 any ip-precedence 4 ecn 1",
    "110 permit gre any any key 1 mask 0xffff ip-precedence 5 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX",
    "120 deny nvgre any any vsid 100 mask 0xffffff ip-precedence 5 ecn 2 routed-packet",
    "130 permit 50 any any dscp 20 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX",
    "140 deny 89 10.0.0.0 0.0.0.255 10.1.0.0 0.0.255.255 ip-precedence 5 ecn 1",
    "150 permit any 10.0.0.0 0.0.0.255 any ip-precedence 5 ecn 0 non-fragment routed-packet options time-range TC_TR_MAX",
    "160 deny any 10.5.0.0 0.0.0.255 any dscp 63 ecn 3 first-fragment routed-packet options",
    "end",
  ]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "ip access-list TC_IP_PLAIN",
      "20 permit tcp host 10.1.1.1 src-port range 1024 2048 10.2.2.0 0.0.0.255 dst-port eq 80 established ip-precedence 5 ecn 1 non-fragment routed-packet options packet-length range 64 1500 time-range TC_TR_MAX",
      "30 permit tcp 10.0.0.0 0.0.0.255 src-port gt 1024 any dst-port lt 1024 match-all ack syn dscp 10 ecn 2 first-fragment routed-packet options packet-length eq 500 time-range TC_TR_MAX",
      "60 permit udp any src-port eq 53 any dst-port range 53 53 dscp 12 ecn 3 non-or-first-fragment options packet-length gt 100 time-range TC_TR_MAX",
      "90 permit igmp any any host-query ip-precedence 5 ecn 0 options packet-length lt 100 time-range TC_TR_MAX",
      "110 permit gre any any key 1 mask 0x0000ffff ip-precedence 5 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX",
      "10 deny tcp any any",
      "40 permit tcp 10.3.0.0 0.0.0.255 src-port eq 53 any dst-port range 1024 2048 ip-precedence 7 small-fragment",
      "50 deny udp 192.168.0.0 0.0.255.255 src-port range 1 100 any dst-port range 1 65535 ip-precedence 7 small-fragment",
      "70 permit icmp any any icmp-type 8 icmp-code 0 ip-precedence 5 ecn 1 non-first-fragment time-range TC_TR_MAX",
      "80 deny icmp 10.1.1.0 0.0.0.255 any icmp-type 3 ip-precedence 3 options",
      "100 deny igmp 10.2.0.0 0.0.0.255 any ip-precedence 4 ecn 1",
      "120 deny nvgre any any vsid 100 mask 0xffffff ip-precedence 5 ecn 2 routed-packet",
      "130 permit 50 any any dscp 20 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX",
      "140 deny 89 10.0.0.0 0.0.0.255 10.1.0.0 0.0.255.255 ip-precedence 5 ecn 1",
      "150 permit any 10.0.0.0 0.0.0.255 any ip-precedence 5 ecn 0 non-fragment routed-packet options time-range TC_TR_MAX",
      "160 deny any 10.5.0.0 0.0.0.255 any dscp 63 ecn 3 first-fragment routed-packet options",
    ],
    false,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip access-list TC_IP_PLAIN",
    "no time-range TC_TR_MAX",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
