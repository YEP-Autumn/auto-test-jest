import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("IPv4 ACL extend 满参数 rule 组合（03-ip-acl-extend）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "time-range TC_TR_MAX",
    "periodic 08:00 daily to 18:00",
    "end",
    "configure terminal",
    "ip access-list TC_IP_EXT extend",
    "10 deny tcp any any",
    "20 permit tcp host 10.1.1.1 src-port range 1024 2048 10.2.2.0 0.0.0.255 dst-port eq 80 established ip-precedence 5 ecn 1 non-fragment routed-packet options packet-length range 64 1500 time-range TC_TR_MAX",
    "30 permit tcp 10.0.0.0 0.0.0.255 src-port gt 1024 any dst-port lt 1024 match-all ack syn dscp 10 ecn 2 first-fragment routed-packet options packet-length eq 500 time-range TC_TR_MAX",
    "40 permit udp 10.3.0.0 0.0.0.255 src-port range 1 100 any dst-port range 1 65535 dscp 12 ecn 3 non-or-first-fragment options packet-length gt 100 time-range TC_TR_MAX",
    "50 permit icmp any any icmp-type 8 icmp-code 0 ip-precedence 5 ecn 1 non-first-fragment time-range TC_TR_MAX",
    "60 deny icmp 10.1.0.0 0.0.0.255 any icmp-type 3 ip-precedence 3 options",
    "70 permit igmp any any host-query ip-precedence 5 ecn 0 options time-range TC_TR_MAX",
    "80 deny igmp 10.2.0.0 0.0.0.255 any ip-precedence 4 ecn 1",
    "90 permit gre any any key 1 mask 0xffff ip-precedence 5 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX",
    "100 deny nvgre any any vsid 100 mask 0xffffff ip-precedence 5 ecn 2 routed-packet",
    "110 permit 50 any any dscp 20 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX",
    "120 deny 89 10.0.0.0 0.0.0.255 10.1.0.0 0.0.255.255 ip-precedence 5 ecn 1",
    "130 permit any any any dscp 10 ecn 0 non-fragment routed-packet options time-range TC_TR_MAX",
    "140 permit src-mac host 0011.2233.4455 dest-mac host 0011.2233.4466 vlan 10 cos 3 inner-vlan 20 inner-cos 4 arp-packet arp-op-code 1 sender-ip 1.1.1.0 0.0.0.255 target-ip any time-range TC_TR_MAX",
    "150 deny src-mac any dest-mac any untag-vlan packet-length range 64 1500 time-range TC_TR_MAX",
    "160 permit src-mac any vlan 10 cos 3 arp-packet sender-ip host 1.1.1.1",
    "170 deny src-mac any vlan 30",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "ip access-list TC_IP_EXT extend",
    "20 permit tcp host 10.1.1.1 src-port range 1024 2048 10.2.2.0 0.0.0.255 dst-port eq 80 established ip-precedence 5 ecn 1 non-fragment routed-packet options packet-length range 64 1500 time-range TC_TR_MAX",
    "30 permit tcp 10.0.0.0 0.0.0.255 src-port gt 1024 any dst-port lt 1024 match-all ack syn dscp 10 ecn 2 first-fragment routed-packet options packet-length eq 500 time-range TC_TR_MAX",
    "40 permit udp 10.3.0.0 0.0.0.255 src-port range 1 100 any dst-port range 1 65535 dscp 12 ecn 3 non-or-first-fragment options packet-length gt 100 time-range TC_TR_MAX",
    "90 permit gre any any key 1 mask 0x0000ffff ip-precedence 5 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX",
    "140 permit src-mac host 0011.2233.4455 dest-mac host 0011.2233.4466 vlan 10 cos 3 inner-vlan 20 inner-cos 4 arp-packet arp-op-code 1 sender-ip 1.1.1.0 0.0.0.255 target-ip any time-range TC_TR_MAX",
    "10 deny tcp any any",
    "50 permit icmp any any icmp-type 8 icmp-code 0 ip-precedence 5 ecn 1 non-first-fragment time-range TC_TR_MAX",
    "60 deny icmp 10.1.0.0 0.0.0.255 any icmp-type 3 ip-precedence 3 options",
    "70 permit igmp any any host-query ip-precedence 5 ecn 0 options time-range TC_TR_MAX",
    "80 deny igmp 10.2.0.0 0.0.0.255 any ip-precedence 4 ecn 1",
    "100 deny nvgre any any vsid 100 mask 0xffffff ip-precedence 5 ecn 2 routed-packet",
    "110 permit 50 any any dscp 20 ecn 1 non-fragment routed-packet options time-range TC_TR_MAX",
    "120 deny 89 10.0.0.0 0.0.0.255 10.1.0.0 0.0.255.255 ip-precedence 5 ecn 1",
    "130 permit any any any dscp 10 ecn 0 non-fragment routed-packet options time-range TC_TR_MAX",
    "150 deny src-mac any dest-mac any untag-vlan packet-length range 64 1500 time-range TC_TR_MAX",
    "160 permit src-mac any dest-mac any vlan 10 cos 3 arp-packet sender-ip host 1.1.1.1",
    "170 deny src-mac any dest-mac any vlan 30",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip access-list TC_IP_EXT extend",
    "no time-range TC_TR_MAX",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
