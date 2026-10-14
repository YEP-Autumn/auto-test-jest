import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("control-plane ACL 满参数 exception 组合（01-cp-acl）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "time-range TC_TR_MAX",
    "periodic 08:00 daily to 18:00",
    "end",
    "configure terminal",
    "control-plane access-list TC_CP",
    "10 permit exception any",
    "20 deny exception ipda untag-vlan",
    "30 permit exception ipda vlan 10 cos 3",
    "40 permit exception ipda untag-vlan ipv4 any any any time-range TC_TR_MAX",
    "50 permit exception ipda vlan 100 cos 5 ipv4 icmp any any icmp-type 8 icmp-code 0 time-range TC_TR_MAX",
    "60 permit exception ipda vlan 100 cos 5 ipv4 udp any any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX",
    "70 permit exception ipda vlan 100 cos 5 ipv4 gre any any time-range TC_TR_MAX",
    "80 permit exception ipda untag-vlan ipv6 any any any time-range TC_TR_MAX",
    "90 permit exception ipda untag-vlan ipv6 udp any any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX",
    "100 permit exception tcp vlan 100 cos 5 ipv4 tcp 10.0.0.0 0.0.0.255 any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX",
    "110 permit exception fwd-to-cpu vlan 100 cos 5 ipv4 tcp any any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX",
    "120 permit exception slow-protocol efm time-range TC_TR_MAX",
    "130 permit exception slow-protocol lacp time-range TC_TR_MAX",
    "140 permit exception slow-protocol sub-type 1 time-range TC_TR_MAX",
    "150 permit exception dhcp time-range TC_TR_MAX",
    "160 permit exception dhcp dhcp 10.0.0.0 0.0.0.255 any client time-range TC_TR_MAX",
    "170 permit exception dhcp dhcpv6 any any reply time-range TC_TR_MAX",
    "180 permit exception rip time-range TC_TR_MAX",
    "190 permit exception rip rip 10.0.0.0 0.0.0.255 any time-range TC_TR_MAX",
    "200 permit exception rip ripng any any time-range TC_TR_MAX",
    "210 permit exception ospf ospfv2 any any time-range TC_TR_MAX",
    "220 permit exception ospf ospfv3 any any time-range TC_TR_MAX",
    "230 permit exception pim pim any any time-range TC_TR_MAX",
    "240 permit exception pim pimv6 any any time-range TC_TR_MAX",
    "250 permit exception bgp bgp any any time-range TC_TR_MAX",
    "260 permit exception bgp bgp4plus any any time-range TC_TR_MAX",
    "270 permit exception vrrp vrrp any any time-range TC_TR_MAX",
    "280 permit exception vrrp vrrp6 any any time-range TC_TR_MAX",
    "290 permit exception arp vlan 100 cos 5 arp-op-code 1 sender-ip host 192.168.1.1 time-range TC_TR_MAX",
    "300 permit exception arp untag-vlan garp time-range TC_TR_MAX",
    "310 permit exception arp untag-vlan arp-reply time-range TC_TR_MAX",
    "320 permit exception arp untag-vlan rarp-request time-range TC_TR_MAX",
    "330 permit exception igmp vlan 100 cos 5 igmp 10.0.0.0 0.0.0.255 any host-query time-range TC_TR_MAX",
    "340 permit exception igmp untag-vlan igmp any any igmp-type 1 time-range TC_TR_MAX",
    "350 permit exception igmp untag-vlan mld any any mld-query time-range TC_TR_MAX",
    "360 permit exception bpdu time-range TC_TR_MAX",
    "370 permit exception ldp time-range TC_TR_MAX",
    "380 permit exception ptp time-range TC_TR_MAX",
    "390 permit exception rsvp time-range TC_TR_MAX",
    "400 permit exception icmp-redirect time-range TC_TR_MAX",
    "410 permit exception mcast-rpf-fail time-range TC_TR_MAX",
    "420 permit exception macsa-mismatch time-range TC_TR_MAX",
    "430 permit exception vlan-security-discard time-range TC_TR_MAX",
    "440 permit exception port-security-discard time-range TC_TR_MAX",
    "450 permit exception ip-option time-range TC_TR_MAX",
    "460 permit exception udld time-range TC_TR_MAX",
    "470 permit exception dot1x-mac-bypass time-range TC_TR_MAX",
    "480 permit exception l2protocol-tunnel time-range TC_TR_MAX",
    "end",
  ]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "control-plane access-list TC_CP",
      "40 permit exception ipda untag-vlan ipv4 any any any time-range TC_TR_MAX",
      "60 permit exception ipda vlan 100 cos 5 ipv4 udp any any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX",
      "160 permit exception dhcp dhcp 10.0.0.0 0.0.0.255 any client time-range TC_TR_MAX",
      "280 permit exception vrrp vrrp6 any any time-range TC_TR_MAX",
      "480 permit exception l2protocol-tunnel time-range TC_TR_MAX",
      "10 permit exception any",
      "20 deny exception ipda untag-vlan",
      "30 permit exception ipda vlan 10 cos 3",
      "50 permit exception ipda vlan 100 cos 5 ipv4 icmp any any icmp-type 8 icmp-code 0 time-range TC_TR_MAX",
      "70 permit exception ipda vlan 100 cos 5 ipv4 gre any any time-range TC_TR_MAX",
      "80 permit exception ipda untag-vlan ipv6 any any any time-range TC_TR_MAX",
      "90 permit exception ipda untag-vlan ipv6 udp any any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX",
      "100 permit exception tcp vlan 100 cos 5 ipv4 tcp 10.0.0.0 0.0.0.255 any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX",
      "110 permit exception fwd-to-cpu vlan 100 cos 5 ipv4 tcp any any src-port eq 80 dst-port eq 80 time-range TC_TR_MAX",
      "120 permit exception slow-protocol efm time-range TC_TR_MAX",
      "130 permit exception slow-protocol lacp time-range TC_TR_MAX",
      "140 permit exception slow-protocol sub-type 1 time-range TC_TR_MAX",
      "150 permit exception dhcp time-range TC_TR_MAX",
      "170 permit exception dhcp dhcpv6 any any reply time-range TC_TR_MAX",
      "180 permit exception rip time-range TC_TR_MAX",
      "190 permit exception rip rip 10.0.0.0 0.0.0.255 any time-range TC_TR_MAX",
      "200 permit exception rip ripng any any time-range TC_TR_MAX",
      "210 permit exception ospf ospfv2 any any time-range TC_TR_MAX",
      "220 permit exception ospf ospfv3 any any time-range TC_TR_MAX",
      "230 permit exception pim pim any any time-range TC_TR_MAX",
      "240 permit exception pim pimv6 any any time-range TC_TR_MAX",
      "250 permit exception bgp bgp any any time-range TC_TR_MAX",
      "260 permit exception bgp bgp4plus any any time-range TC_TR_MAX",
      "270 permit exception vrrp vrrp any any time-range TC_TR_MAX",
      "290 permit exception arp vlan 100 cos 5 arp-op-code 1 sender-ip host 192.168.1.1 time-range TC_TR_MAX",
      "300 permit exception arp untag-vlan garp time-range TC_TR_MAX",
      "310 permit exception arp untag-vlan arp-reply time-range TC_TR_MAX",
      "320 permit exception arp untag-vlan rarp-request time-range TC_TR_MAX",
      "330 permit exception igmp vlan 100 cos 5 igmp 10.0.0.0 0.0.0.255 any host-query time-range TC_TR_MAX",
      "340 permit exception igmp untag-vlan igmp any any igmp-type 1 time-range TC_TR_MAX",
      "350 permit exception igmp untag-vlan mld any any mld-query time-range TC_TR_MAX",
      "360 permit exception bpdu time-range TC_TR_MAX",
      "370 permit exception ldp time-range TC_TR_MAX",
      "380 permit exception ptp time-range TC_TR_MAX",
      "390 permit exception rsvp time-range TC_TR_MAX",
      "400 permit exception icmp-redirect time-range TC_TR_MAX",
      "410 permit exception mcast-rpf-fail time-range TC_TR_MAX",
      "420 permit exception macsa-mismatch time-range TC_TR_MAX",
      "430 permit exception vlan-security-discard time-range TC_TR_MAX",
      "440 permit exception port-security-discard time-range TC_TR_MAX",
      "450 permit exception ip-option time-range TC_TR_MAX",
      "460 permit exception udld time-range TC_TR_MAX",
      "470 permit exception dot1x-mac-bypass time-range TC_TR_MAX",
    ],
    false,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no control-plane access-list TC_CP",
    "no time-range TC_TR_MAX",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
