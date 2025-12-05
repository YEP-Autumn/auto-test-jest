import { Port } from "../../utils";
import { TestHelper } from "../../utils/TestHelper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *                    +--------+                   +--------+
 *  RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
 *  RenixC <=> PortB--|        |                   +--------+    |
 *                    +--------+                                 |
 *                                                 +--------+    |
 *                               RenixB <=> PortD--|  DUTC  |--PortB
 *                                                 +--------+
 */
test("支持在开启了vlan-translate功能的接口上配置vlan + cvlan 类型mpls-vpls ac", async () => {
  testHelper.ExecConfigDutA([
    /** 配置MPLS VPLS */
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.1/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "mpls-vpls v1 vlan 2 cvlan 3",
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

  /** 配置 vlan-translate */
  testHelper.ExecConfigDutA([
    "configure terminal",
    "vlan database",
    "vlan 2-500",
    "ethernet evc 1",
    "dot1q mapped-vlan 333",
    "exit",
    "ethernet evc 2",
    "dot1q mapped-vlan 444",
    "exit",
    "vlan mapping table vm",
    "raw-vlan 123 evc 1",
    "raw-vlan 100 200 evc 2",
    "exit",
    `interface ${Port.D}`,
    "switchport trunk vlan-translation",
    "switchport trunk vlan-translation mapping table vm",
    "switchport trunk allowed vlan add 333,444",
    "exit",
    `interface ${Port.B}`,
    "switchport mode trunk",
    "switchport trunk allowed vlan add 333,444",
    "end",
  ]);

  testHelper.sleep(45000);

  /**
   * RenixA发送vlan tag 3 2 的报文, RenixB 可以收到
   * RenixA发送vlan tag 123的报文, RenixC 可以收到vlan tag为333的报文
   * RenixA发送vlan tag 100 200 的报文, RenixC 可以收到vlan tag为100 444的报文
   *
   * (删除其中任意一个'mpls或vlan-translate'不会影响另一个的功能)
   */

  testHelper.CleanConfigDutA([
    "configure terminal",
    "vlan database",
    "no vlan 2-500",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no mpls-vpls v1 vlan 2",
    "switchport mode access",
    "exit",
    `interface ${Port.B}`,
    "switchport mode access",
    "exit",
    "no vlan mapping table vm",
    "no ethernet evc 1",
    "no ethernet evc 2",
    "no interface loopback 0",
    "no mpls vpls v1",
    "no router rip",
    "no router ldp",
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
