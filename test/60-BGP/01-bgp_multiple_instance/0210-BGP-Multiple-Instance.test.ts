import { Port } from "../../../utils";
import { TestHelper } from "../../../utils/TestHelper";
import { LinkConstraint } from "../../../utils/topo/LinkConstraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
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
test("测试bgp多实例 ebgp underlay 叠加 ibgp evpn路由", async () => {
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
    "ip address 1.1.1.1/24",
    "exit",
    "interface loopback0",
    "ip address 10.10.10.10/32",
    "exit",
    "interface loopback1",
    "ip vrf forwarding v1",
    "ip address 10.1.1.1/32",
    "exit",
    "interface nve0",
    "source eth-0-1",
    "member vni 1000 associate-vrf",
    "exit",
    "evpn",
    "exit",
    "router bgp 65001",
    "neighbor 1.1.1.2 remote-as 65000",
    "network 1.1.1.0 mask 255.255.255.0",
    "network 10.10.10.10 mask 255.255.255.255",
    "exit",
    "router bgp 64512 view 64512",
    "neighbor 11.11.11.11 remote-as 64512",
    "neighbor 11.11.11.11 update-source loopback0",
    "address-family l2vpn evpn",
    "neighbor 11.11.11.11 activate",
    "neighbor 11.11.11.11 send-community both",
    "exit-address-family",
    "address-family ipv4 vrf v1",
    "advertise l2vpn evpn",
    "redistribute connected",
    "exit-address-family",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.2/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 2.2.2.2/24",
    "exit",
    "router bgp 65000",
    "neighbor 1.1.1.1 remote-as 65001",
    "neighbor 2.2.2.1 remote-as 65002",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    "ip vrf v1",
    "rd 1000:2",
    "route-target both 100:1000 evpn",
    "vxlan vni 1000",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 2.2.2.1/24",
    "exit",
    "interface loopback0",
    "ip address 11.11.11.11/32",
    "exit",
    "interface loopback1",
    "ip vrf forwarding v1",
    "ip address 11.1.1.1/32",
    "exit",
    "interface nve0",
    "source eth-0-2",
    "member vni 1000 associate-vrf",
    "exit",
    "evpn",
    "exit",
    "router bgp 65002",
    "neighbor 2.2.2.2 remote-as 65000",
    "network 2.2.2.0 mask 255.255.255.0",
    "network 11.11.11.11 mask 255.255.255.255",
    "exit",
    "router bgp 64512 view 64512",
    "neighbor 10.10.10.10 remote-as 64512",
    "neighbor 10.10.10.10 update-source loopback0",
    "address-family l2vpn evpn",
    "neighbor 10.10.10.10 activate",
    "neighbor 10.10.10.10 send-community both",
    "exit-address-family",
    "address-family ipv4 vrf v1",
    "advertise l2vpn evpn",
    "redistribute connected",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    `Interface current state: UP`,
  );
  testHelper.ReadyCheckDutA(
    `show interface ${Port.C}`,
    `Interface current state: UP`,
  );
  testHelper.ReadyCheckDutB(
    `show interface ${Port.A}`,
    `Interface current state: UP`,
  );
  testHelper.ReadyCheckDutB(
    `show interface ${Port.C}`,
    `Interface current state: UP`,
  );
  testHelper.ReadyCheckDutB(
    `show interface ${Port.B}`,
    `Interface current state: UP`,
  );
  testHelper.ReadyCheckDutC(
    `show interface ${Port.B}`,
    `Interface current state: UP`,
  );

  testHelper.ExecConfigDutA(["clear ip bgp *"]);
  testHelper.ExecConfigDutB(["clear ip bgp *"]);
  testHelper.ExecConfigDutC(["clear ip bgp *"]);

  testHelper.ReadyCheckDutA("show ip route", "B.*?11.11.11.11/32", 60 * 1000);
  testHelper.ReadyCheckDutB("show ip route", "B.*?10.10.10.10/32", 60 * 1000);

  testHelper.ExecConfigDutA(["clear bgp view 64512 *"]);
  testHelper.ExecConfigDutC(["clear bgp view 64512 *"]);

  testHelper.ReadyCheckDutA(
    "show ip route vrf v1",
    "B.*?11.1.1.1/32",
    60 * 1000,
  );
  testHelper.ReadyCheckDutC(
    "show ip route vrf v1",
    "B.*?10.1.1.1/32",
    60 * 1000,
  );

  testHelper.sleep(3 * 1000);

  testHelper.ExecRetMatchDutA("ping vrf v1 11.1.1.1", " 0% packet loss");
  testHelper.ExecRetMatchDutC("ping vrf v1 10.1.1.1", " 0% packet loss");

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip vrf v1",
    `interface ${Port.A}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    "no evpn",
    "no interface nve 0",
    "no interface loopback 0",
    "no interface loopback 1",
    "no router bgp 65001",
    "no router bgp 64512 view 64512",
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
    "no router bgp 65000",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    "no ip vrf v1",
    `interface ${Port.B}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    "no evpn",
    "no interface nve 0",
    "no interface loopback 0",
    "no interface loopback 1",
    "no router bgp 65002",
    "no router bgp 64512 view 64512",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
