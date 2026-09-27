import { Port } from "../../../utils";
import { TestHelper } from "../../../utils/test-helper";
import { LinkConstraint } from "../../../utils/topo/link-constraint";

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
test("设备支持通过VLAN子接口配置MPLS L3VPN", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address 2.2.2.1/24",
    "exit",
    "interface loopback0",
    "ip address 4.4.4.4/32",
    "exit",
    "router rip",
    "network 2.2.2.0/24",
    "redistribute connected",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "ip vrf vpn1",
    "rd 1:1",
    "route-target both 1:1",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip vrf forwarding vpn1",
    "ip address 2.2.2.2/24",
    "exit",
    "interface loopback0",
    "ip address 5.5.5.5/32",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "exit",
    `interface ${Port.B}.1`,
    "dot1q termination vid 200",
    "ip address 1.1.1.1/24",
    "label-switching",
    "enable-ldp",
    "exit",
    "router ospf",
    "router-id 5.5.5.5",
    "redistribute connected",
    "network 1.1.1.0/24 area 0",
    "exit",
    "router rip",
    "address-family ipv4 vrf vpn1",
    "network 2.2.2.0/24",
    "redistribute bgp",
    "exit-address-family",
    "exit",
    "router bgp 1",
    "neighbor 6.6.6.6 remote-as 1",
    "neighbor 6.6.6.6 update-source loopback0",
    "address-family vpnv4 unicast",
    "neighbor 6.6.6.6 activate",
    "neighbor 6.6.6.6 send-community both",
    "exit-address-family",
    "address-family ipv4 vrf vpn1",
    "redistribute connected",
    "redistribute rip",
    "exit-address-family",
    "exit",
    "router ldp",
    "router-id 5.5.5.5",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    "ip vrf vpn1",
    "rd 1:1",
    "route-target both 1:1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "exit",
    `interface ${Port.B}.1`,
    "dot1q termination vid 200",
    "ip address 1.1.1.2/24",
    "label-switching",
    "enable-ldp",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 300",
    "ip vrf forwarding vpn1",
    "ip address 3.3.3.3/24",
    "exit",
    "interface loopback0",
    "ip address 6.6.6.6/32",
    "exit",
    "router ospf",
    "router-id 6.6.6.6",
    "redistribute connected",
    "network 1.1.1.0/24 area 0",
    "exit",
    "router rip",
    "address-family ipv4 vrf vpn1",
    "network 3.3.3.0/24",
    "redistribute bgp",
    "exit-address-family",
    "exit",
    "router bgp 1",
    "neighbor 5.5.5.5 remote-as 1",
    "neighbor 5.5.5.5 update-source loopback0",
    "address-family vpnv4 unicast",
    "neighbor 5.5.5.5 activate",
    "neighbor 5.5.5.5 send-community both",
    "exit-address-family",
    "address-family ipv4 vrf vpn1",
    "redistribute connected",
    "redistribute rip",
    "exit-address-family",
    "exit",
    "router ldp",
    "router-id 6.6.6.6",
    "end",
  ]);

  testHelper.ExecConfigDutD([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 300",
    "ip address 3.3.3.4/24",
    "exit",
    "interface loopback0",
    "ip address 7.7.7.7/32",
    "exit",
    "router rip",
    "network 3.3.3.0/24",
    "redistribute connected",
    "end",
  ]);

  testHelper.sleep(1000 * 40);

  testHelper.ReadyCheckDutB(
    "show ip ospf neighbor",
    "6.6.6.6.*?Full",
    1000 * 30,
  );

  testHelper.ReadyCheckDutC(
    "show ip ospf neighbor",
    "5.5.5.5.*?Full",
    1000 * 30,
  );

  testHelper.sleep(1000 * 45);

  testHelper.ReadyCheckDutA("show ip route", "R.*?7.7.7.7/32", 1000 * 60);
  testHelper.ReadyCheckDutD("show ip route", "R.*?4.4.4.4/32", 1000 * 60);

  testHelper.ReadyCheckDutB(
    "show ldp session",
    "6.6.6.6.*?OPERATIONAL",
    1000 * 45,
  );

  testHelper.ReadyCheckDutC(
    "show ldp session",
    "5.5.5.5.*?OPERATIONAL",
    1000 * 45,
  );

  testHelper.ExecRetMatchDutA("ping 7.7.7.7", " 0% packet loss");
  testHelper.ExecRetMatchDutD("ping 4.4.4.4", " 0% packet loss");

  testHelper.CleanConfigDutA([
    "configure terminal",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    "no interface loopback0",
    "no router rip",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `no interface ${Port.A}.1`,
    `no interface ${Port.B}.1`,
    "no ip vrf vpn1",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    "no interface loopback 0",
    "no router ospf",
    "no router rip",
    "no router bgp 1",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    `no interface ${Port.A}.1`,
    `no interface ${Port.B}.1`,
    "no ip vrf vpn1",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    "no interface loopback 0",
    "no router ospf",
    "no router rip",
    "no router bgp 1",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutD([
    "configure terminal",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    "no interface loopback0",
    "no router rip",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
