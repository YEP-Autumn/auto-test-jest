import { Port } from "../../../utils";
import { TestHelper } from "../../../utils/TestHelper";
import { LinkConstraint } from "../../../utils/topo/LinkConstraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.two_devices_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
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
test("使用 VLAN Interface 配置MPLS VPLS", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "vlan database",
    "vlan 2",
    "exit",
    `interface ${Port.A}`,
    "switchport access vlan 2",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "mpls-vpls v1 vlan 2",
    "exit",
    "interface vlan 2",
    "label-switching",
    "ip address 11.11.9.1/24",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 11.11.1.1/32",
    "exit",
    "mpls vpls v1 100",
    "vpls-peer 11.11.4.4 raw",
    "exit",
    "router rip",
    "network 11.11.0.0/16",
    "exit",
    "router ldp",
    "router-id 11.11.1.1",
    "targeted-peer 11.11.4.4",
    "transport-address 11.11.1.1",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "vlan database",
    "vlan 2",
    "exit",
    `interface ${Port.A}`,
    "switchport access vlan 2",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "mpls-vpls v4 vlan 2",
    "exit",
    "interface vlan 2",
    "label-switching",
    "ip address 11.11.9.2/24",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 11.11.4.4/32",
    "exit",
    "mpls vpls v4 100",
    "vpls-peer 11.11.1.1 raw",
    "exit",
    "router rip",
    "network 11.11.0.0/16",
    "exit",
    "router ldp",
    "router-id 11.11.4.4",
    "targeted-peer 11.11.1.1",
    "transport-address 11.11.4.4",
    "end",
  ]);

  testHelper.sleep(25000);

  testHelper.ReadyCheckDutA(
    "show ldp session",
    "11.11.4.4.*?OPERATIONAL",
    60 * 1000,
  );

  testHelper.ReadyCheckDutB(
    "show ldp session",
    "11.11.1.1.*?OPERATIONAL",
    60 * 1000,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "vlan database",
    "no vlan 2",
    "exit",
    `interface ${Port.A}`,
    "no switchport access vlan",
    "exit",
    `interface ${Port.D}`,
    "no mpls-vpls v1 vlan 2",
    "switchport mode access",
    "exit",
    "no interface loopback 0",
    "no mpls vpls v1",
    "no router rip",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "vlan database",
    "no vlan 2",
    "exit",
    `interface ${Port.A}`,
    "no switchport access vlan",
    "exit",
    `interface ${Port.D}`,
    "no mpls-vpls v4 vlan 2",
    "switchport mode access",
    "exit",
    "no interface loopback 0",
    "no mpls vpls v4",
    "no router rip",
    "no router ldp",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
