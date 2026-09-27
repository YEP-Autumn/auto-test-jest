import { Port } from "../../../utils";
import { TestHelper } from "../../../utils/test-helper";
import { LinkConstraint } from "../../../utils/topo/link-constraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.two_devices_topo_links_type_2,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *   +--------+                   +--------+
 *   |        |--PortA <=> PortA--|        |
 *   |  DUTA  |                   |  DUTB  |
 *   |        |--PortB <=> PortB--|        |
 *   +--------+                   +--------+
 *
 */
test("bgp路由数据库中学到路由后，bgp进程再使能“address-family ipv4 vrf vpna”，bgp路由无法写入vrf路由表", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "vlan database",
    "vlan 100,200,1000,1234,1235",
    "vlan 100 overlay enable",
    "vlan 200 overlay enable",
    "exit",
    "ip vrf vpna",
    "rd 1000:4",
    "route-target both 1000:1000 evpn",
    "vxlan vni 1000",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 192.168.102.4/24",
    "exit",
    `interface ${Port.C}`,
    "switchport mode trunk",
    "switchport trunk allowed vlan add 100,200,1234,1235",
    "exit",
    "interface vlan100",
    "ip address 100.100.100.254/24",
    "exit",
    "interface vlan200",
    "ip address 200.200.200.254/24",
    "exit",
    "interface vlan1234",
    "ip vrf forwarding vpna",
    "ip address 40.40.40.254/24",
    "exit",
    "interface loopback1",
    "ip address 4.4.4.4/32",
    "exit",
    "interface nve0",
    "source loopback1",
    "member vni 100",
    "member vni 200",
    "member vni 1000 associate-vrf",
    "exit",
    "overlay",
    "vlan 100 vni 100",
    "vlan 100 mac-address-tunnel learning-disable",
    "vlan 200 vni 200",
    "vlan 200 mac-address-tunnel learning-disable",
    "exit",
    "evpn",
    "vni 100",
    "rd 100:4",
    "route-target both 100:100",
    "vni 200",
    "rd 200:4",
    "route-target both 200:200",
    "exit",
    "router ospf",
    "network 4.4.4.4 0.0.0.0 area 0",
    "network 192.168.100.0 0.0.0.255 area 0",
    "network 192.168.101.0 0.0.0.255 area 0",
    "network 192.168.102.0 0.0.0.255 area 0",
    "exit",
    "router bgp 100",
    "neighbor 3.3.3.3 remote-as 100",
    "neighbor 3.3.3.3 update-source loopback1",
    "neighbor 3.3.3.3 as-origination-interval 1",
    "neighbor 3.3.3.3 advertisement-interval 0",
    "address-family ipv4",
    "no synchronization",
    "neighbor 3.3.3.3 activate",
    "exit-address-family",
    "address-family vpnv4 unicast",
    "no synchronization",
    "exit-address-family",
    "address-family l2vpn evpn",
    "neighbor 3.3.3.3 activate",
    "neighbor 3.3.3.3 route-reflector-client",
    "neighbor 3.3.3.3 send-community both",
    "exit-address-family",
    "address-family vpnv6 unicast",
    "no synchronization",
    "exit-address-family",
    "address-family ipv6",
    "no synchronization",
    "exit-address-family",
    "address-family ipv4 vrf vpna",
    "advertise l2vpn evpn",
    "redistribute connected",
    "no synchronization",
    "exit-address-family",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "vlan database",
    "vlan 100,200",
    "vlan 100 overlay enable",
    "vlan 200 overlay enable",
    "exit",
    "ip vrf vpna",
    "rd 1000:3",
    "route-target both 1000:1000 evpn",
    "vxlan vni 1000",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 192.168.102.3/24",
    "exit",
    `interface ${Port.C}`,
    "switchport mode trunk",
    "switchport trunk allowed vlan add 100,200",
    "exit",
    "interface vlan100",
    "ip vrf forwarding vpna",
    "overlay distributed-gateway enable",
    "overlay host-collect enable",
    "ip address 100.100.255.253/16",
    "ip virtual-router address 100.100.255.254",
    "exit",
    "interface vlan200",
    "ip vrf forwarding vpna",
    "overlay distributed-gateway enable",
    "overlay host-collect enable",
    "ip address 200.200.255.253/16",
    "ip virtual-router address 200.200.255.254",
    "exit",
    "interface loopback1",
    "ip address 3.3.3.3/32",
    "exit",
    "interface nve0",
    "source loopback1",
    "member vni 100",
    "member vni 200",
    "member vni 1000 associate-vrf",
    "exit",
    "overlay",
    "vlan 100 vni 100",
    "vlan 100 mac-address-tunnel learning-disable",
    "vlan 200 vni 200",
    "vlan 200 mac-address-tunnel learning-disable",
    "exit",
    "evpn",
    "vni 100",
    "rd 100:3",
    "route-target both 100:100",
    "route-target export 1000:1000",
    "vni 200",
    "rd 200:3",
    "route-target both 200:200",
    "route-target export 1000:1000",
    "exit",
    "router ospf",
    "network 3.3.3.0 0.0.0.255 area 0",
    "network 192.168.102.0 0.0.0.255 area 0",
    "exit",
    "router bgp 100",
    "neighbor 4.4.4.4 remote-as 100",
    "neighbor 4.4.4.4 update-source loopback1",
    "neighbor 4.4.4.4 as-origination-interval 1",
    "neighbor 4.4.4.4 advertisement-interval 0",
    "address-family ipv4",
    "no synchronization",
    "neighbor 4.4.4.4 activate",
    "exit-address-family",
    "address-family vpnv4 unicast",
    "no synchronization",
    "exit-address-family",
    "address-family l2vpn evpn",
    "neighbor 4.4.4.4 activate",
    "neighbor 4.4.4.4 send-community both",
    "exit-address-family",
    "address-family vpnv6 unicast",
    "no synchronization",
    "exit-address-family",
    "address-family ipv6",
    "no synchronization",
    "exit-address-family",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    `Interface current state: UP`,
  );

  testHelper.sleep(1000);

  testHelper.ExecConfigDutA(["clear ip ospf process", "Y"]);

  testHelper.sleep(20000);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 1000 * 60);
  testHelper.ReadyCheckDutA("show ip route", "3.3.3.3/32", 1000 * 60);

  testHelper.ExecConfigDutB(["clear bgp *"]);
  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA(
    "show ip bgp neighbors",
    "BGP state = Established",
    1000 * 60,
  );

  testHelper.ReadyCheckDutB("show bgp evpn all", "40.40.40.0");

  testHelper.ExecConfigDutB([
    "configure terminal",
    "router bgp 100",
    "address-family ipv4 vrf vpna",
    "end",
  ]);

  testHelper.sleep(5000);

  testHelper.ExecRetMatchDutB("show ip route vrf vpna", "B.*?40.40.40.0/24");

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router bgp 100",
    "no evpn",
    "no ip vrf vpna",
    "no router ospf",
    "no interface loopback1",
    "no interface nve0",
    "overlay",
    "no vlan 100 vni",
    "no vlan 200 vni",
    "exit",
    "vlan database",
    "vlan 100 overlay disable",
    "vlan 200 overlay disable",
    "no vlan 100,200,1000,1234,1235",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    `interface ${Port.C}`,
    "switchport mode access",
    "exit",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no router bgp 100",
    "no evpn",
    "no ip vrf vpna",
    "no router ospf",
    "no interface loopback1",
    "no interface nve0",
    "overlay",
    "no vlan 100 vni",
    "no vlan 200 vni",
    "exit",
    "vlan database",
    "vlan 100 overlay disable",
    "vlan 200 overlay disable",
    "no vlan 100,200",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    `interface ${Port.C}`,
    "switchport mode access",
    "exit",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
