import { Port } from "../../utils";
import { TestHelper } from "../../utils/test-helper";
import { LinkConstraint } from "../../utils/topo/link-constraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_3,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *                       +--------+
 *     RenixA <-> PortD-|  DUTA  |--PortA---+
 *                      +--------+          |
 *                       |      |         PortA
 *                     PortB  PortC         |
 *                       |      |       +--------+
 *                       |      |       |  DUTB  |
 *                       |      |       +--------+
 *                     PortB  PortC         |
 *                       |      |         PortB
 *                      +--------+          |
 *     RenixB <-> PortD-|  DUTC  |--PortA---+
 *                      +--------+
 *
 */

test("测试 bgp evpn vxlan loopback ping功能, 模拟两台PC分别通过普通路由和vxlan隧道测试连通性", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip vrf v1",
    "rd 1000:1",
    "route-target both 100:1000 evpn",
    "vxlan vni 1000",
    "exit",
    "ip vrf pc1",
    "exit",
    "ip vrf pc2",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 100.100.100.1/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip vrf forwarding pc1",
    "ip address 3.3.3.100/24",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip vrf forwarding pc2",
    "ip address 3.3.3.100/24",
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
    "network 11.1.1.1 mask 255.255.255.255",
    "neighbor 100.100.101.1 activate",
    "exit",
    "address-family l2vpn evpn",
    "neighbor 100.100.101.1 activate",
    "neighbor 100.100.101.1 send-community both",
    "exit",
    "address-family ipv4 vrf v1",
    "advertise l2vpn evpn",
    "redistribute connected",
    "end",
    "configure terminal",
    "ip route 100.100.101.0/24 100.100.100.2",
    "ip route vrf pc1 0.0.0.0/0 3.3.3.1",
    "ip route vrf pc2 0.0.0.0/0 3.3.3.1",
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
    "ip route 3.3.3.0/24 100.100.101.1",
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
    `interface ${Port.A}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 100.100.101.1/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip vrf forwarding v2",
    "ip address 3.3.3.1/24",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 3.3.3.1/24",
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
    `source ${Port.A}`,
    "member vni 1000 associate-vrf",
    "exit",
    "evpn",
    "exit",
    "router bgp 100",
    "neighbor 100.100.100.1 remote-as 100",
    "address-family ipv4",
    "network 3.3.3.0 mask 255.255.255.0",
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

  testHelper.sleep(20000);

  testHelper.ExecRetMatchDutA("ping vrf pc2 11.1.1.1", " 0% packet loss");
  testHelper.ExecRetMatchDutA("ping vrf pc1 10.1.1.1", " 0% packet loss");

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip vrf v1",
    "no ip vrf pc1",
    "no ip vrf pc2",
    "no router bgp 100",
    "no evpn",
    "no ip route 100.100.101.0/24",
    "no interface nve0",
    "no interface loopback0",
    "no interface loopback1",
    `interface ${Port.A}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
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
    "no ip route 3.3.3.0/24",
    "no ip route 11.1.1.1/32",
    "no ip route 11.1.1.2/32",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    "no router bgp 100",
    "no ip vrf v2",
    "no evpn",
    "no ip route 100.100.100.0/24",
    "no interface nve0",
    "no interface loopback0",
    `interface ${Port.A}`,
    "vxlan uplink disable",
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
