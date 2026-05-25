import { Port } from "../../../utils";
import { TransmitMode } from "../../../utils/comm/Components";
import { RenixPort } from "../../../utils/comm/Config";
import { PacketBuilder } from "../../../utils/stream/thrift_packet";
import { TestHelper } from "../../../utils/TestHelper";
import { LinkConstraint } from "../../../utils/topo/LinkConstraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_2,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/*
 *                    +--------+                   +--------+
 *  RenixA <=> PortD--|        |                   |        |
 *                    |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
 *             PortC--|        |                   |        |    |
 *                    +--------+                   +--------+    |
 *                                                               |
 *                                                 +--------+    |
 *                               RenixB <=> PortD--|  DUTC  |--PortB
 *                                                 +--------+
 */
test("测试BGP多实例配置 VXLAN L2 EVPN", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "vlan database",
    "vlan 10",
    "vlan 10 overlay enable",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 192.168.1.1/24",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "switchport trunk allowed vlan add 10",
    "exit",
    "interface loopback0",
    "ip address 10.1.1.1/32",
    "exit",
    "interface nve0",
    "source loopback0",
    "member vni 10",
    "exit",
    "overlay",
    "vlan 10 vni 10",
    "exit",
    "evpn",
    "vni 10",
    "rd 10:1",
    "route-target both 10:10",
    "exit",
    "router bgp 100 view test1",
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

  testHelper.ExecConfigDutB([
    "configure terminal",
    "vlan database",
    "vlan 10,20",
    "vlan 10 overlay enable",
    "vlan 20 overlay enable",
    "exit",
    "ip vrf evpn",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 192.168.1.2/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 192.168.2.1/24",
    "exit",
    "interface vlan10",
    "ip address 192.168.10.1/24",
    "exit",
    "interface vlan20",
    "ip address 192.168.20.1/24",
    "exit",
    "interface loopback0",
    "ip address 10.2.2.2/32",
    "exit",
    "interface nve0",
    "source loopback0",
    "member vni 10",
    "member vni 20",
    "exit",
    "overlay",
    "vlan 10 vni 10",
    "vlan 20 vni 20",
    "exit",
    "evpn",
    "vni 10",
    "rd 10:2",
    "route-target both 10:10",
    "vni 20",
    "rd 20:2",
    "route-target both 20:20",
    "exit",
    "exit",
    "router bgp 100 view test1",
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

  testHelper.ExecConfigDutC([
    "configure terminal",
    "vlan database",
    "vlan 10,20",
    "vlan 10 overlay enable",
    "vlan 20 overlay enable",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "vxlan uplink enable",
    "ip address 192.168.2.2/24",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "switchport trunk allowed vlan add 10,20",
    "exit",
    "interface loopback0",
    "ip address 10.3.3.3/32",
    "exit",
    "interface nve0",
    "source loopback0",
    "member vni 10",
    "member vni 20",
    "exit",
    "overlay",
    "vlan 10 vni 10",
    "vlan 20 vni 20",
    "exit",
    "evpn",
    "vni 10",
    "rd 10:3",
    "route-target both 10:10",
    "vni 20",
    "rd 20:3",
    "route-target both 20:20",
    "exit",
    "exit",
    "router bgp 100 view test1",
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

  testHelper.ExecConfigDutB(["clear bgp view test1 *"]);

  testHelper.sleep(10 * 1000);

  testHelper.ReadyCheckDutA("show overlay", "10.*?10.2.2.2");
  testHelper.ReadyCheckDutA("show overlay", "10.*?10.3.3.3");

  testHelper.startCapture(RenixPort.B);

  testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:00:44:55:77",
        src: "00:00:00:44:55:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 10, type: 0x0800 })
      .setIPv4({
        src: "100.100.100.1",
        dst: "10.10.10.100",
      }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: { step_count: 10 },
    },
  });

  testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:00:44:55:77",
        src: "00:00:00:44:55:66",
      })
      .setIPv4({
        src: "100.100.100.1",
        dst: "10.10.10.100",
      }),
    expected_count: 10,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no evpn",
    "no router bgp 100 view test1",
    "no interface nve0",
    "no interface loopback0",
    "overlay",
    "no vlan 10 vni",
    "exit",
    "vlan database",
    "no vlan 10",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    `interface ${Port.D}`,
    "switchport mode access",
    "exit",
    "no ip route 10.2.2.2/32",
    "no ip route 10.3.3.3/32",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no ip vrf evpn",
    "no evpn",
    "no interface loopback0",
    "no interface nve0",
    "no router bgp 100 view test1",
    "overlay",
    "no vlan 10 vni",
    "no vlan 20 vni",
    "exit",
    "vlan database",
    "no vlan 10,20",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    "no ip route 10.1.1.1/32",
    "no ip route 10.3.3.3/32",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    "no evpn",
    "no router bgp 100 view test1",
    "no interface loopback0",
    "no interface nve0",
    "overlay",
    "no vlan 10 vni",
    "no vlan 20 vni",
    "exit",
    "vlan database",
    "no vlan 10,20",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "vxlan uplink disable",
    "exit",
    `interface ${Port.D}`,
    "switchport mode access",
    "exit",
    "no ip route 10.1.1.1/32",
    "no ip route 10.2.2.2/32",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
