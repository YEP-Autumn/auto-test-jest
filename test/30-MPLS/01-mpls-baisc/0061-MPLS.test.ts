import { Port } from "../../../utils";
import { TestHelper } from "../../../utils/TestHelper";
import { LinkConstraint } from "../../../utils/topo/LinkConstraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.two_devices_topo_links_type_1,
  ).init();
}, 120_000);

afterAll(async () => {
  if (testHelper) {
    await testHelper.destroy();
  }
});

/**
 *
 *                    +--------+                   +--------+
 *                    |        |--PortA <=> PortA--|        |
 *  RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortD <=> RenixB
 *                    |        |--PortC <=> PortC--|        |
 *                    +--------+                   +--------+
 *
 */
test("测试MPLS L3VPN PING功能", async () => {
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
    "ip address 2.2.2.2/24",
    "exit",
    "interface loopback0",
    "ip address 5.5.5.5/32",
    "exit",
    "router ospf",
    "redistribute connected",
    "network 1.1.1.0/24 area 0",
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
    "label-switching",
    "ip address 1.1.1.2/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip vrf forwarding vpn1",
    "ip address 3.3.3.3/24",
    "exit",
    "interface loopback0",
    "ip address 6.6.6.6/32",
    "exit",
    "router ospf",
    "redistribute connected",
    "network 1.1.1.0/24 area 0",
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
    "exit-address-family",
    "exit",
    "router ldp",
    "router-id 6.6.6.6",
    "end",
  ]);

  /** 等待ospf建立连接 */
  testHelper.sleep(20_000);
  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 80_000);

  /** 等待bgp建立连接 */
  testHelper.sleep(5_000);
  testHelper.CleanConfigDutA(["clear ip bgp *"]);
  testHelper.sleep(10_000);
  testHelper.ReadyCheckDutA(
    "show ip bgp neighbors",
    "BGP state = Established",
    60_000,
  );

  /** 等待ldp建立连接 */
  testHelper.ExecConfigDutA(["clear ldp session *"]);
  testHelper.sleep(10_000);
  testHelper.ReadyCheckDutA("show ldp session", "OPERATIONAL", 90_000);

  /** 验证ping连通性 */
  testHelper.ExecRetMatchDutA(
    "ping vrf vpn1 -a 2.2.2.2 3.3.3.3",
    " 0% packet loss",
  );

  testHelper.ExecRetMatchDutB(
    "ping vrf vpn1 -a 3.3.3.3 2.2.2.2",
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
  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
}, 180_000);
