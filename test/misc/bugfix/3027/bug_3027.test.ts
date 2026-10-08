import { Port } from "../../../../utils";
import { TestHelper } from "../../../../utils/test-helper";
import { LinkConstraint } from "../../../../utils/topo/link-constraint";

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
test("BGP VPN路由表出现直连路由", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "vlan database",
    "vlan 10,20",
    "exit",
    "ip vrf vpn1",
    "rd 1:1",
    "route-target import 100:200",
    "route-target export 100:100",
    "exit",
    "ip vrf vpn2",
    "rd 1:2",
    "route-target import 100:100",
    "route-target export 100:200",
    "exit",
    "interface vlan10",
    "ip vrf forwarding vpn1",
    "ip address 10.10.10.100/24",
    "exit",
    "interface vlan20",
    "ip vrf forwarding vpn2",
    "ip address 11.11.11.100/24",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "switchport trunk allowed vlan all",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.1/24",
    "exit",
    "router bgp 100",
    "neighbor 1.1.1.2 remote-as 100",
    "address-family ipv4 vrf vpn1",
    "redistribute connected",
    "no synchronization",
    "exit-address-family",
    "address-family ipv4 vrf vpn2",
    "redistribute connected",
    "no synchronization",
    "exit-address-family",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "vlan database",
    "vlan 10,20",
    "exit",
    "ip vrf vpn1",
    "rd 2:1",
    "route-target import 100:200",
    "route-target export 100:100",
    "exit",
    "ip vrf vpn2",
    "rd 2:2",
    "route-target import 100:100",
    "route-target export 100:200",
    "exit",
    "interface vlan10",
    "ip vrf forwarding vpn1",
    "ip address 10.10.10.100/24",
    "exit",
    "interface vlan20",
    "ip vrf forwarding vpn2",
    "ip address 11.11.11.100/24",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "switchport trunk allowed vlan all",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.2/24",
    "exit",
    "router bgp 100",
    "neighbor 1.1.1.1 remote-as 100",
    "address-family ipv4 vrf vpn1",
    "redistribute connected",
    "no synchronization",
    "exit-address-family",
    "address-family ipv4 vrf vpn2",
    "redistribute connected",
    "no synchronization",
    "exit-address-family",
    "exit",
    "end",
  ]);

  testHelper.sleep(5000);

  testHelper.ExecConfigDutB(["clear bgp *"]);
  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA("show ip bgp neighbors", "BGP state = Established");

  testHelper.ExecRetMatchDutA("show ip route vrf vpn1", "B.*?11.11.11.100/32");
  testHelper.ExecRetMatchDutA(
    "show ip route vrf vpn1 bgp",
    "B.*?11.11.11.100/32",
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router bgp 100",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport mode access",
    "exit",
    "no ip vrf vpn1",
    "no ip vrf vpn2",
    "vlan database",
    "no vlan 10,20",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no router bgp 100",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport mode access",
    "exit",
    "no ip vrf vpn1",
    "no ip vrf vpn2",
    "vlan database",
    "no vlan 10,20",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
