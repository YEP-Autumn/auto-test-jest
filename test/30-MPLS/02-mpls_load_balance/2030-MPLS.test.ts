import { Port } from "../../../utils";
import { TestHelper } from "../../../utils/TestHelper";
import { LinkConstraint } from "../../../utils/topo/LinkConstraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_2
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *                    +--------+                   +--------+
 *  RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
 *             PortC--|        |                   |        |    |
 *                    +--------+                   +--------+    |
 *                                                               |
 *                                                 +--------+    |
 *                               RenixB <=> PortD--|  DUTC  |--PortB
 *                                                 +--------+
 */
test("配置linkagg基于MPLS VPLS AC出接口的负载均衡", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.1/24",
    "enable-ldp",
    "exit",
    `interface ${Port.C}`,
    "switchport mode trunk",
    "static-channel-group 1",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "static-channel-group 1",
    "exit",
    "interface agg1",
    "mpls-vpls v1 vlan 2",
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
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.13.2/24",
    "enable-ldp",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.2/24",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 11.11.2.2/32",
    "exit",
    "router rip",
    "network 11.11.0.0/16",
    "exit",
    "router ldp",
    "router-id 11.11.2.2",
    "end",
  ]);

  // 配置 DutA 基于macsa的负载均衡
  testHelper.ExecConfigDutA([
    "configure terminal",
    "no mpls parser control-word exist",
    "hash-field mpls",
    "vpls inner-layer2 macsa",
    "exit",
    "hash-value global",
    "port-channel select mpls",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.13.4/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "mpls-vpls v4 vlan 2",
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

  /**
   * RneixB发送携带vlan2，源mac变化的报文, DutA的portC和portD均有Egress流量
   */

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.C}`,
    "no static-channel-group",
    "switchport mode access",
    "exit",
    `interface ${Port.D}`,
    "no static-channel-group",
    "switchport mode access",
    "exit",
    "no interface loopback 0",
    "no mpls vpls v1",
    "no router rip",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "mpls parser control-word exist",
    "hash-value global",
    "no port-channel select",
    "exit",
    "no hash-field mpls",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    "no interface loopback 0",
    "no router rip",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
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
