import { Port } from "@/utils";
import { DeviceARouteMac, TestHelper } from "@/utils/test-helper";
import { LinkConstraint } from "@/utils/topo/link-constraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.four_devices_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *    +--------+                   +--------+
 *    |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
 *    +--------+                   +--------+    |
 *                                               |
 *    +--------+                   +--------+    |
 *    |  DUTD  |--PortA <=> PortA--|  DUTC  |--PortB
 *    +--------+                   +--------+
 *
 */
test("删除bgp evpn地址族重新配置后，本地evpn type 3 host 路由丢失，无法通告到对端", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "vlan database",
    "vlan 10",
    "exit",
    "interface vlan 10",
    "ip address 192.168.10.100/24",
    `interface ${Port.A}`,
    "switchport mode trunk",
    "switchport trunk allowed vlan add 10",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "vlan database",
    "vlan 10",
    "vlan 10 overlay enable",
    "exit",
    "ip vrf evpn",
    "rd 1000:1",
    "route-target import 1000:1000 evpn",
    "vxlan vni 1000",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 192.168.1.1/24",
    "exit",
    `interface ${Port.A}`,
    "switchport mode trunk",
    "switchport trunk allowed vlan add 10",
    "exit",
    "interface vlan10",
    "ip vrf forwarding evpn",
    "overlay distributed-gateway enable",
    "overlay host-collect enable",
    "ip address 192.168.10.1/24",
    "exit",
    "interface loopback0",
    "ip address 10.1.1.1/32",
    "exit",
    "interface nve0",
    "source loopback0",
    "member vni 10",
    "member vni 1000 associate-vrf",
    "exit",
    "overlay",
    "vlan 10 vni 10",
    "exit",
    "evpn",
    "vni 10",
    "rd 10:1",
    "route-target both 10:10",
    "route-target export 1000:1000",
    "exit",
    "exit",
    "router bgp 100",
    "bgp router-id 10.1.1.1",
    "neighbor 10.2.2.2 remote-as 100",
    "neighbor 10.2.2.2 update-source loopback0",
    "address-family ipv4",
    "neighbor 10.2.2.2 activate",
    "exit-address-family",
    "address-family l2vpn evpn",
    "neighbor 10.2.2.2 activate",
    "neighbor 10.2.2.2 send-community both",
    "exit-address-family",
    "exit",
    "ip route 10.2.2.2/32 192.168.1.2",
    "ip route 10.3.3.3/32 192.168.1.2",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 192.168.1.2/24",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 192.168.2.1/24",
    "exit",
    "interface loopback0",
    "ip address 10.2.2.2/32",
    "exit",
    "evpn",
    "exit",
    "router bgp 100",
    "bgp router-id 10.2.2.2",
    "neighbor 10.1.1.1 remote-as 100",
    "neighbor 10.1.1.1 update-source loopback0",
    "neighbor 10.3.3.3 remote-as 100",
    "neighbor 10.3.3.3 update-source loopback0",
    "address-family ipv4",
    "neighbor 10.1.1.1 activate",
    "neighbor 10.3.3.3 activate",
    "exit-address-family",
    "address-family l2vpn evpn",
    "retain route-target all",
    "neighbor 10.1.1.1 activate",
    "neighbor 10.1.1.1 route-reflector-client",
    "neighbor 10.1.1.1 send-community both",
    "neighbor 10.3.3.3 activate",
    "neighbor 10.3.3.3 route-reflector-client",
    "neighbor 10.3.3.3 send-community both",
    "exit-address-family",
    "exit",
    "ip route 10.1.1.1/32 192.168.1.1",
    "ip route 10.3.3.3/32 192.168.2.2",
    "end",
  ]);

  testHelper.ExecConfigDutD([
    "configure terminal",
    "vlan database",
    "vlan 10,20",
    "vlan 10 overlay enable",
    "vlan 20 overlay enable",
    "exit",
    "ip vrf evpn",
    "rd 1000:3",
    "route-target import 1000:1000 evpn",
    "vxlan vni 1000",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 192.168.2.2/24",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "switchport trunk allowed vlan add 10,20",
    "exit",
    "interface vlan10",
    "ip vrf forwarding evpn",
    "overlay distributed-gateway enable",
    "overlay host-collect enable",
    "ip address 192.168.10.1/24",
    "exit",
    "interface vlan20",
    "ip vrf forwarding evpn",
    "overlay distributed-gateway enable",
    "overlay host-collect enable",
    "ip address 192.168.20.1/24",
    "exit",
    "interface loopback0",
    "ip address 10.3.3.3/32",
    "exit",
    "interface nve0",
    "source loopback0",
    "member vni 10",
    "member vni 20",
    "member vni 1000 associate-vrf",
    "exit",
    "overlay",
    "vlan 10 vni 10",
    "vlan 20 vni 20",
    "exit",
    "evpn",
    "vni 10",
    "rd 10:3",
    "route-target both 10:10",
    "route-target export 1000:1000",
    "vni 20",
    "rd 20:3",
    "route-target both 20:20",
    "route-target export 1000:1000",
    "exit",
    "exit",
    "router bgp 100",
    "bgp router-id 10.3.3.3",
    "neighbor 10.2.2.2 remote-as 100",
    "neighbor 10.2.2.2 update-source loopback0",
    "address-family ipv4",
    "neighbor 10.2.2.2 activate",
    "exit-address-family",
    "address-family l2vpn evpn",
    "neighbor 10.2.2.2 activate",
    "neighbor 10.2.2.2 send-community both",
    "exit-address-family",
    "exit",
    "ip route 10.1.1.1/32 192.168.2.1",
    "ip route 10.2.2.2/32 192.168.2.1",
    "end",
  ]);

  testHelper.ExecConfigDutB(["clear bgp *"]);

  testHelper.sleep(25000);

  testHelper.ExecRetMatchDutA("ping 192.168.10.1", " 0% packet loss");

  testHelper.sleep(1000 * 5);

  testHelper.ExecRetMatchDutB(
    "show ip arp vrf evpn",
    new RegExp(`192.168.10.100.*?${DeviceARouteMac}`),
  );

  // 校验dutA收到的ARP条目，被 evpn host route通告到dutD
  testHelper.ReadyCheckDutD(
    "show ip route vrf evpn",
    new RegExp("B.*?192.168.10.100/32"),
    1000 * 60,
  );

  // 删除l2 evpn地址族，再重新添加
  testHelper.ExecConfigDutB([
    "configure terminal",
    "router bgp 100",
    "no address-family l2vpn evpn",
    "end",
  ]);

  testHelper.sleep(3000);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "router bgp 100",
    "address-family l2vpn evpn",
    "neighbor 10.2.2.2 activate",
    "neighbor 10.2.2.2 send-community both",
    "exit-address-family",
    "end",
  ]);
  testHelper.sleep(10 * 1000);

  // 验证重新配置l2 evpn地址族后，evpn host路由可以再次通告到dutD
  testHelper.ReadyCheckDutD(
    "show ip route vrf evpn",
    new RegExp("B.*?192.168.10.100/32"),
    1000 * 60,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "vlan database",
    "no vlan 10",
    "exit",
    `interface ${Port.A}`,
    "switchport mode access",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no router bgp 100",
    "no evpn",
    "no ip vrf evpn",
    "no ip route 10.2.2.2/32",
    "no ip route 10.3.3.3/32",
    "no interface loopback0",
    "no interface nve0",
    "overlay",
    "no vlan 10 vni",
    "exit",
    "vlan database",
    "no vlan 10",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    `interface ${Port.A}`,
    "switchport mode access",
    "exit",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    "no router bgp 100",
    "no evpn",
    "no interface loopback0",
    `interface ${Port.B}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    "no ip route 10.1.1.1/32",
    "no ip route 10.3.3.3/32",
    "end",
  ]);

  testHelper.CleanConfigDutD([
    "configure terminal",
    "no router bgp 100",
    "no evpn",
    "no ip vrf evpn",
    "no interface loopback0",
    "no interface nve0",
    "no ip route 10.1.1.1/32",
    "no ip route 10.2.2.2/32",
    "overlay",
    "no vlan 10 vni",
    "no vlan 20 vni",
    "vlan database",
    "no vlan 10,20",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    `interface ${Port.D}`,
    "switchport mode access",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
