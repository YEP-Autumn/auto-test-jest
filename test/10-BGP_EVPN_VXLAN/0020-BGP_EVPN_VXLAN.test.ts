import { Port } from "../../utils";
import { TestHelper } from "../../utils/TestHelper";
import { LinkConstraint } from "../../utils/topo/LinkConstraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_5,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/*
 *                    +--------+                   +--------+
 *  RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
 *                    +--------+                   +--------+    |
 *                                                               |
 *                                                 +--------+    |
 *                               RenixB <=> PortD--|  DUTC  |--PortB
 *                                                 +--------+
 */
test("测试 bgp evpn vxlan loopback ping功能, 两台交换机使用loopback接口通过vxlan隧道互通", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip vrf v1",
    "rd 1000:1",
    "route-target both 100:1000 evpn",
    "vxlan vni 1000",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 100.100.100.1/24",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip vrf forwarding v1",
    "ip address 1.1.1.1/24",
    "exit",
    "interface loopback0",
    "ip vrf forwarding v1",
    "ip address 10.1.1.1/32",
    "exit",
    "interface loopback1",
    "ip address 11.1.1.1/32",
    "exit",
    "interface nve0",
    `source ${Port.A}`,
    "member vni 1000 associate-vrf",
    "exit",
    "evpn",
    "exit",
    "router bgp 100",
    "neighbor 100.100.101.1 remote-as 100",
    "address-family ipv4",
    "neighbor 100.100.101.1 activate",
    "exit",
    "address-family l2vpn evpn",
    "neighbor 100.100.101.1 activate",
    "neighbor 100.100.101.1 send-community both",
    "exit",
    "address-family ipv4 vrf v1",
    "advertise l2vpn evpn",
    "redistribute connected",
    "exit",
    "exit",
    "ip route 100.100.101.0/24 100.100.100.2",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 100.100.100.2/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 100.100.101.2/24",
    "exit",
    "ip route 11.1.1.1/32 100.100.100.1",
    "ip route 11.1.1.2/32 100.100.101.1",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    "ip vrf v2",
    "rd 1000:2",
    "route-target both 100:1000 evpn",
    "vxlan vni 1000",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 100.100.101.1/24",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip vrf forwarding v2",
    "ip address 2.2.2.1/24",
    "exit",
    "interface loopback0",
    "ip vrf forwarding v2",
    "ip address 10.1.1.2/32",
    "exit",
    "interface nve0",
    `source ${Port.B}`,
    "member vni 1000 associate-vrf",
    "exit",
    "evpn",
    "exit",
    "router bgp 100",
    "neighbor 100.100.100.1 remote-as 100",
    "address-family ipv4",
    "neighbor 100.100.100.1 activate",
    "exit",
    "address-family l2vpn evpn",
    "neighbor 100.100.100.1 activate",
    "neighbor 100.100.100.1 send-community both",
    "exit",
    "address-family ipv4 vrf v2",
    "advertise l2vpn evpn",
    "redistribute connected",
    "exit",
    "exit",
    "ip route 100.100.100.0/24 100.100.101.2",
    "end",
  ]);

  testHelper.ExecConfigDutB(["clear bgp *"]);

  testHelper.sleep(25000);

  testHelper.ExecRetMatchDutA("ping vrf v1 10.1.1.2", " 0% packet loss");

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip vrf v1",
    "no router bgp 100",
    "no ip route 100.100.101.0/24",
    "no evpn",
    "no interface loopback0",
    "no interface loopback1",
    "no interface nve0",
    `interface ${Port.A}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    "no ip route 11.1.1.1/32",
    "no ip route 11.1.1.2/32",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    "no ip vrf v2",
    "no router bgp 100",
    "no ip route 100.100.100.0/24",
    "no evpn",
    "no interface nve0",
    "no interface loopback0",
    `interface ${Port.B}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
