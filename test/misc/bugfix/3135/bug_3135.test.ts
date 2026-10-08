import { Port } from "../../../../utils";
import { DutIdx, TestHelper } from "../../../../utils/test-helper";
import { LinkConstraint } from "../../../../utils/topo/link-constraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.six_devices_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *    +--------+                   +--------+
 *    |  DUTE  |--PortA <=> PortA--|  DUTF  |
 *    +--------+                   +--------+
 *        |                            |
 *      PortB                        PortB
 *        |                            |
 *      PortB                        PortB
 *        |                            |
 *    +--------+                   +--------+
 *    |  DUTC  |                   |  DUTD  |
 *    +--------+                   +--------+
 *        |                            |
 *      PortA                        PortA
 *        |                            |
 *      PortA                        PortA
 *        |                            |
 *    +--------+                   +--------+
 *    |  DUTA  |                   |  DUTB  |
 *    +--------+                   +--------+
 *
 */
test("[BGP多实例] 设备使用BGP view方式配置BGP EVPN, 无法建立Vxlan tunnel", async () => {
  testHelper.ExecConfigDut(DutIdx.A, [
    `configure terminal`,
    `vlan database`,
    `vlan 10,20`,
    `vlan 10 overlay enable`,
    `vlan 10 arp-broadcast-suppress enable`,
    `vlan 20 overlay enable`,
    `vlan 20 arp-broadcast-suppress enable`,
    `exit`,
    `ip vrf test`,
    `rd 1:10086`,
    `route-target both 1:10000 evpn`,
    `route-target both 1:20000 evpn`,
    `vxlan vni 10086`,
    `exit`,
    `interface ${Port.A}`,
    `no switchport`,
    `vxlan uplink enable`,
    `ip address 192.168.20.1/24`,
    `exit`,
    `interface ${Port.B}`,
    `switchport mode trunk`,
    `switchport trunk allowed vlan add 10,20`,
    `exit`,
    `interface vlan10`,
    `ip vrf forwarding test`,
    `overlay distributed-gateway enable`,
    `overlay host-collect enable`,
    `ip address 10.0.0.1/24`,
    `ip virtual-router address 10.0.0.254`,
    `exit`,
    `interface vlan20`,
    `ip vrf forwarding test`,
    `overlay distributed-gateway enable`,
    `overlay host-collect enable`,
    `ip address 20.0.0.1/24`,
    `ip virtual-router address 20.0.0.254`,
    `exit`,
    `interface loopback0`,
    `ip address 1.1.1.1/32`,
    `exit`,
    `interface nve1`,
    `source loopback0`,
    `member vni 10000`,
    `member vni 20000`,
    `member vni 10086 associate-vrf`,
    `exit`,
    `overlay`,
    `vlan 10 vni 10000`,
    `vlan 20 vni 20000`,
    `exit`,
    `ip virtual-router mac 000a.000a.000a`,
    `evpn virtual-mac enable`,
    `evpn`,
    `vni 10000`,
    `rd auto`,
    `route-target both 1:10000`,
    `vni 20000`,
    `rd auto`,
    `route-target both 1:20000`,
    `exit`,
    `exit`,
    `router ospf 1`,
    `redistribute connected`,
    `network 192.168.20.0/24 area 0`,
    `exit`,
    `router bgp 100 view evpn`,
    `neighbor 2.2.2.2 remote-as 100`,
    `neighbor 2.2.2.2 update-source loopback0`,
    `address-family ipv4`,
    `no synchronization`,
    `neighbor 2.2.2.2 activate`,
    `exit-address-family`,
    `address-family l2vpn evpn`,
    `neighbor 2.2.2.2 activate`,
    `neighbor 2.2.2.2 send-community extended`,
    `exit-address-family`,
    `address-family ipv4 vrf test`,
    `advertise l2vpn evpn`,
    `redistribute connected`,
    `no synchronization`,
    `exit-address-family`,
    `end`,
  ]);

  testHelper.ExecConfigDut(DutIdx.B, [
    `configure terminal`,
    `vlan database`,
    `vlan 10,20`,
    `vlan 10 overlay enable`,
    `vlan 10 arp-broadcast-suppress enable`,
    `vlan 20 overlay enable`,
    `vlan 20 arp-broadcast-suppress enable`,
    `exit`,
    `ip vrf test`,
    `rd 4:10086`,
    `route-target both 1:10000 evpn`,
    `route-target both 1:20000 evpn`,
    `vxlan vni 10086`,
    `exit`,
    `interface ${Port.A}`,
    `no switchport`,
    `vxlan uplink enable`,
    `ip address 192.168.30.1/24`,
    `exit`,
    `interface ${Port.B}`,
    `switchport mode trunk`,
    `switchport trunk allowed vlan add 10,20`,
    `exit`,
    `interface vlan10`,
    `ip vrf forwarding test`,
    `overlay distributed-gateway enable`,
    `overlay host-collect enable`,
    `ip address 10.0.0.4/24`,
    `ip virtual-router address 10.0.0.254`,
    `exit`,
    `interface vlan20`,
    `ip vrf forwarding test`,
    `overlay distributed-gateway enable`,
    `overlay host-collect enable`,
    `ip address 20.0.0.4/24`,
    `ip virtual-router address 20.0.0.254`,
    `exit`,
    `interface loopback0`,
    `ip address 4.4.4.4/32`,
    `exit`,
    `interface nve1`,
    `source loopback0`,
    `member vni 10000`,
    `member vni 20000`,
    `member vni 10086 associate-vrf`,
    `exit`,
    `overlay`,
    `vlan 10 vni 10000`,
    `vlan 20 vni 20000`,
    `exit`,
    `ip virtual-router mac 000a.000a.000a`,
    `evpn virtual-mac enable`,
    `evpn`,
    `vni 10000`,
    `rd auto`,
    `route-target both 1:10000`,
    `vni 20000`,
    `rd auto`,
    `route-target both 1:20000`,
    `exit`,
    `exit`,
    `router ospf 1`,
    `network 4.4.4.4/32 area 0`,
    `network 192.168.30.0/24 area 0`,
    `exit`,
    `router bgp 200`,
    `neighbor 3.3.3.3 remote-as 200`,
    `neighbor 3.3.3.3 update-source loopback0`,
    `address-family ipv4`,
    `no synchronization`,
    `neighbor 3.3.3.3 activate`,
    `exit-address-family`,
    `address-family l2vpn evpn`,
    `neighbor 3.3.3.3 activate`,
    `neighbor 3.3.3.3 send-community extended`,
    `exit-address-family`,
    `address-family ipv4 vrf test`,
    `advertise l2vpn evpn`,
    `redistribute connected`,
    `no synchronization`,
    `exit-address-family`,
    `end`,
  ]);

  testHelper.ExecConfigDut(DutIdx.C, [
    `configure terminal`,
    `interface ${Port.A}`,
    `no switchport`,
    `ip address 192.168.20.2/24`,
    `exit`,
    `interface ${Port.B}`,
    `no switchport`,
    `ip address 192.168.50.2/24`,
    `exit`,
    `interface loopback0`,
    `ip address 2.2.2.2/32`,
    `exit`,
    `evpn`,
    `router ospf 1`,
    `redistribute connected`,
    `redistribute bgp`,
    `network 192.168.20.0/24 area 0`,
    `exit`,
    `router bgp 20`,
    `neighbor 192.168.50.1 remote-as 10`,
    `address-family ipv4`,
    `no synchronization`,
    `network 1.1.1.1 mask 255.255.255.255`,
    `network 2.2.2.2 mask 255.255.255.255`,
    `neighbor 192.168.50.1 activate`,
    `exit-address-family`,
    `exit`,
    `router bgp 100 view evpn1`,
    `neighbor 1.1.1.1 remote-as 100`,
    `neighbor 1.1.1.1 update-source loopback0`,
    `neighbor 3.3.3.3 remote-as 200`,
    `neighbor 3.3.3.3 ebgp-multihop 255`,
    `neighbor 3.3.3.3 update-source loopback0`,
    `address-family ipv4`,
    `no synchronization`,
    `neighbor 1.1.1.1 activate`,
    `neighbor 1.1.1.1 send-community both`,
    `neighbor 1.1.1.1 attribute-unchanged next-hop`,
    `neighbor 3.3.3.3 activate`,
    `neighbor 3.3.3.3 send-community both`,
    `neighbor 3.3.3.3 attribute-unchanged next-hop`,
    `exit-address-family`,
    `address-family l2vpn evpn`,
    `neighbor 1.1.1.1 activate`,
    `neighbor 1.1.1.1 send-community both`,
    `neighbor 1.1.1.1 attribute-unchanged next-hop`,
    `neighbor 3.3.3.3 activate`,
    `neighbor 3.3.3.3 send-community both`,
    `neighbor 3.3.3.3 attribute-unchanged next-hop`,
    `exit-address-family`,
    `end`,
  ]);

  testHelper.ExecConfigDut(DutIdx.D, [
    `configure terminal`,
    `interface ${Port.A}`,
    `no switchport`,
    `ip address 192.168.30.2/24`,
    `exit`,
    `interface ${Port.B}`,
    `no switchport`,
    `ip address 192.168.60.2/24`,
    `exit`,
    `interface loopback0`,
    `ip address 3.3.3.3/32`,
    `exit`,
    `evpn`,
    `router ospf 1`,
    `redistribute connected`,
    `redistribute bgp`,
    `network 192.168.30.0/24 area 0`,
    `exit`,
    `router bgp 30`,
    `neighbor 192.168.60.1 remote-as 10`,
    `address-family ipv4`,
    `no synchronization`,
    `network 3.3.3.3 mask 255.255.255.255`,
    `network 4.4.4.4 mask 255.255.255.255`,
    `neighbor 192.168.60.1 activate`,
    `exit-address-family`,
    `exit`,
    `router bgp 200 view evpn1`,
    `neighbor 2.2.2.2 remote-as 100`,
    `neighbor 2.2.2.2 ebgp-multihop 255`,
    `neighbor 2.2.2.2 update-source loopback0`,
    `neighbor 4.4.4.4 remote-as 200`,
    `neighbor 4.4.4.4 update-source loopback0`,
    `address-family ipv4`,
    `no synchronization`,
    `neighbor 2.2.2.2 activate`,
    `neighbor 4.4.4.4 activate`,
    `exit-address-family`,
    `address-family l2vpn evpn`,
    `neighbor 2.2.2.2 activate`,
    `neighbor 2.2.2.2 send-community extended`,
    `neighbor 2.2.2.2 attribute-unchanged next-hop`,
    `neighbor 4.4.4.4 activate`,
    `neighbor 4.4.4.4 send-community extended`,
    `neighbor 4.4.4.4 attribute-unchanged next-hop`,
    `exit-address-family`,
    `end`,
  ]);

  testHelper.ExecConfigDut(DutIdx.E, [
    `configure terminal`,
    `interface ${Port.A}`,
    `no switchport`,
    `ip address 192.168.1.1/24`,
    `exit`,
    `interface ${Port.B}`,
    `no switchport`,
    `ip address 192.168.50.1/24`,
    `exit`,
    `router bgp 10`,
    `neighbor 192.168.1.2 remote-as 10`,
    `neighbor 192.168.50.2 remote-as 20`,
    `address-family ipv4`,
    `no synchronization`,
    `neighbor 192.168.1.2 activate`,
    `neighbor 192.168.1.2 next-hop-self`,
    `neighbor 192.168.50.2 activate`,
    `exit-address-family`,
    `end`,
  ]);

  testHelper.ExecConfigDut(DutIdx.F, [
    `configure terminal`,
    `interface ${Port.A}`,
    `no switchport`,
    `ip address 192.168.1.2/24`,
    `exit`,
    `interface ${Port.B}`,
    `no switchport`,
    `ip address 192.168.60.1/24`,
    `exit`,
    `router bgp 10`,
    `neighbor 192.168.1.1 remote-as 10`,
    `neighbor 192.168.60.2 remote-as 30`,
    `address-family ipv4`,
    `no synchronization`,
    `neighbor 192.168.1.1 activate`,
    `neighbor 192.168.1.1 next-hop-self`,
    `neighbor 192.168.60.2 activate`,
    `exit-address-family`,
    `end`,
  ]);

  testHelper.sleep(15_000);

  testHelper.ReadyCheckDut(
    DutIdx.E,
    "show ip bgp neighbors 192.168.1.2",
    "BGP state = Established",
    240_1000,
  );

  testHelper.ReadyCheckDut(
    DutIdx.E,
    "show ip bgp neighbors 192.168.50.2",
    "BGP state = Established",
    240_1000,
  );

  testHelper.ReadyCheckDut(
    DutIdx.C,
    "show ip bgp neighbors 192.168.50.1",
    "BGP state = Established",
    240_1000,
  );

  testHelper.ReadyCheckDut(
    DutIdx.C,
    "show ip bgp neighbors 1.1.1.1",
    "BGP state = Established",
    240_1000,
  );

  testHelper.ReadyCheckDut(DutIdx.C, "show ip route", "3.3.3.3/32", 240_1000);
  testHelper.ReadyCheckDut(
    DutIdx.C,
    "show ip bgp neighbors 3.3.3.3",
    "BGP state = Established",
    240_1000,
  );

  testHelper.ReadyCheckDut(
    DutIdx.D,
    "show ip bgp neighbors 192.168.60.1",
    "BGP state = Established",
    240_1000,
  );

  testHelper.ReadyCheckDut(
    DutIdx.D,
    "show ip bgp neighbors 2.2.2.2",
    "BGP state = Established",
    240_1000,
  );

  testHelper.ReadyCheckDut(DutIdx.D, "show ip route", "4.4.4.4/32", 240_1000);
  testHelper.ReadyCheckDut(
    DutIdx.D,
    "show ip bgp neighbors 4.4.4.4",
    "BGP state = Established",
    240_1000,
  );

  testHelper.sleep(5_000);

  testHelper.ExecRetMatchDut(
    DutIdx.A,
    "show overlay tunnel",
    new RegExp("10   10000.*?4.4.4.4.*?1.1.1.1"),
  );

  testHelper.ExecRetMatchDut(
    DutIdx.A,
    "show overlay tunnel",
    new RegExp("20   20000.*?4.4.4.4.*?1.1.1.1"),
  );

  testHelper.ExecRetMatchDut(
    DutIdx.B,
    "show overlay tunnel",
    new RegExp("10   10000.*?1.1.1.1.*?4.4.4.4"),
  );

  testHelper.ExecRetMatchDut(
    DutIdx.B,
    "show overlay tunnel",
    new RegExp("20   20000.*?1.1.1.1.*?4.4.4.4"),
  );

  testHelper.CleanConfigDut(DutIdx.A, [
    `configure terminal`,
    "no ip vrf test",
    `interface ${Port.A}`,
    `switchport`,
    `vxlan uplink disable`,
    `exit`,
    `interface ${Port.B}`,
    `switchport mode access`,
    `exit`,
    `no interface vlan 10`,
    `no interface vlan 20`,
    `no interface loopback 0`,
    `no interface nve 1`,
    `no evpn`,
    `evpn virtual-mac disable`,
    `no ip virtual-router mac`,
    `no router ospf 1`,
    `no router bgp 100 view evpn`,
    `overlay`,
    `no vlan 10 vni`,
    `no vlan 20 vni`,
    `exit`,
    "vlan database",
    "no vlan 10,20",
    "end",
  ]);

  testHelper.CleanConfigDut(DutIdx.B, [
    `configure terminal`,
    "no ip vrf test",
    `interface ${Port.A}`,
    `switchport`,
    `vxlan uplink disable`,
    `exit`,
    `interface ${Port.B}`,
    `switchport mode access`,
    `exit`,
    `no interface vlan 10`,
    `no interface vlan 20`,
    `no interface loopback 0`,
    `no interface nve 1`,
    `no evpn`,
    `evpn virtual-mac disable`,
    `no ip virtual-router mac`,
    `no router ospf 1`,
    `no router bgp 200`,
    `overlay`,
    `no vlan 10 vni`,
    `no vlan 20 vni`,
    `exit`,
    "vlan database",
    "no vlan 10,20",
    "end",
  ]);

  testHelper.CleanConfigDut(DutIdx.C, [
    `configure terminal`,
    `interface ${Port.A}`,
    `switchport`,
    `exit`,
    `interface ${Port.B}`,
    `switchport`,
    `exit`,
    `no interface loopback 0`,
    `no evpn`,
    `no router ospf 1`,
    `no router bgp 20`,
    `no router bgp 100 view evpn1`,
    "end",
  ]);

  testHelper.CleanConfigDut(DutIdx.D, [
    `configure terminal`,
    `interface ${Port.A}`,
    `switchport`,
    `exit`,
    `interface ${Port.B}`,
    `switchport`,
    `exit`,
    `no interface loopback 0`,
    `no evpn`,
    `no router ospf 1`,
    `no router bgp 30`,
    `no router bgp 200 view evpn1`,
    "end",
  ]);

  testHelper.CleanConfigDut(DutIdx.E, [
    `configure terminal`,
    `interface ${Port.A}`,
    `switchport`,
    `exit`,
    `interface ${Port.B}`,
    `switchport`,
    `exit`,
    `no router bgp 10`,
    "end",
  ]);

  testHelper.CleanConfigDut(DutIdx.F, [
    `configure terminal`,
    `interface ${Port.A}`,
    `switchport`,
    `exit`,
    `interface ${Port.B}`,
    `switchport`,
    `exit`,
    `no router bgp 10`,
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
