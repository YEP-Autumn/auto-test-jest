import { Port } from "../../../utils";
import { TestHelper } from "../../../utils/test-helper";
import { LinkConstraint } from "../../../utils/topo/link-constraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  if (testHelper) {
    await testHelper.destroy();
  }
});

/**
 *                    +--------+                   +--------+
 *                    |        |--PortA <=> PortA--|        |
 *  RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortB
 *                    |        |--PortC <=> PortC--|        |    |
 *                    +--------+                   +--------+    |
 *                                                               |
 *                                                 +--------+    |
 *                               RenixB <=> PortD--|  DUTC  |--PortB
 *                                                 +--------+
 */
test("测试MPLS L3VPN 多跳 PING功能", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip vrf vpn1",
    "rd 1:1",
    "route-target both 1:1",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 1.1.1.1/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip vrf forwarding vpn1",
    "ip address 20.2.2.2/24",
    "exit",
    "interface loopback0",
    "ip address 5.5.5.5/32",
    "exit",
    "router ospf",
    "router-id 5.5.5.5",
    "network 1.1.1.0/24 area 0",
    "network 5.5.5.5/32 area 0",
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
    "exit-address-family",
    "exit",
    "router ldp",
    "router-id 5.5.5.5",
    "targeted-peer 7.7.7.7",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 1.1.1.2/24",
    "enable-ldp",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 2.2.2.2/24",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 6.6.6.6/32",
    "exit",
    "router ospf",
    "network 1.1.1.0/24 area 0",
    "network 2.2.2.0/24 area 0",
    "network 6.6.6.6/32 area 0",
    "exit",
    "router bgp 1",
    "neighbor 5.5.5.5 remote-as 1",
    "neighbor 5.5.5.5 update-source loopback0",
    "neighbor 7.7.7.7 remote-as 1",
    "neighbor 7.7.7.7 update-source loopback0",
    "address-family vpnv4 unicast",
    "neighbor 5.5.5.5 activate",
    "neighbor 5.5.5.5 route-reflector-client",
    "neighbor 5.5.5.5 send-community both",
    "neighbor 7.7.7.7 activate",
    "neighbor 7.7.7.7 route-reflector-client",
    "neighbor 7.7.7.7 send-community both",
    "exit",
    "exit",
    "router ldp",
    "router-id 6.6.6.6",
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
    "label-switching",
    "ip address 2.2.2.1/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip vrf forwarding vpn1",
    "ip address 30.3.3.3/24",
    "exit",
    "interface loopback0",
    "ip address 7.7.7.7/32",
    "exit",
    "router ospf",
    "router-id 7.7.7.7",
    "network 2.2.2.0/24 area 0",
    "network 7.7.7.7/32 area 0",
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
    "exit-address-family",
    "exit",
    "router ldp",
    "router-id 7.7.7.7",
    "targeted-peer 5.5.5.5",
    "end",
  ]);

  /** 等待ospf建立连接 */
  testHelper.sleep(20_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "5.5.5.5.*?Full", 80_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "7.7.7.7.*?Full", 60_000);

  /** 等待bgp建立连接 */
  testHelper.sleep(5_000);
  testHelper.CleanConfigDutB(["clear ip bgp *"]);
  testHelper.sleep(10_000);
  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors 5.5.5.5",
    "BGP state = Established",
    60_000,
  );
  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors 7.7.7.7",
    "BGP state = Established",
    60_000,
  );

  /** 等待ldp建立连接 */
  testHelper.ExecConfigDutB(["clear ldp session *"]);
  testHelper.sleep(10_000);
  testHelper.ReadyCheckDutB(
    "show ldp session",
    "5.5.5.5.*?OPERATIONAL",
    90_000,
  );
  testHelper.ReadyCheckDutB(
    "show ldp session",
    "7.7.7.7.*?OPERATIONAL",
    60_000,
  );

  /** 验证ping连通性 */
  testHelper.ExecRetMatchDutA(
    "ping vrf vpn1 -a 20.2.2.2 30.3.3.3",
    " 0% packet loss",
  );

  testHelper.ExecRetMatchDutC(
    "ping vrf vpn1 -a 30.3.3.3 20.2.2.2",
    " 0% packet loss",
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip vrf vpn1",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no interface loopback 0",
    "no router ospf",
    "no router bgp 1",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.B}`,
    "disable-ldp",
    "switchport",
    "exit",
    "no interface loopback 0",
    "no router ospf",
    "no router bgp 1",
    "no router ldp",
    "exit",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    "no ip vrf vpn1",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no interface loopback 0",
    "no router ospf",
    "no router bgp 1",
    "no router ldp",
    "end",
  ]);
  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
