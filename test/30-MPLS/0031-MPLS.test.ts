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
 *  RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortD <=> RenixB
 *  RenixC <=> PortB--|        |                   +--------+
 *                    +--------+
 *
 */

test("支持在开启了vlan-translate功能的接口上配置vlan 类型mpls-vpws ac", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 8.8.8.1/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "mpls-l2-circuit t1 vlan 2",
    "exit",
    "interface loopback0",
    "ip address 192.168.10.10/32",
    "exit",
    "router rip",
    "network 0.0.0.0/0",
    "exit",
    "router ldp",
    "router-id 192.168.10.10",
    "targeted-peer 192.168.11.10",
    "exit",
    "mpls l2-circuit t1 200 192.168.11.10 raw",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 8.8.8.2/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "mpls-l2-circuit t1 ethernet",
    "exit",
    "interface loopback0",
    "ip address 192.168.11.10/32",
    "exit",
    "router rip",
    "network 0.0.0.0/0",
    "exit",
    "router ldp",
    "router-id 192.168.11.10",
    "targeted-peer 192.168.10.10",
    "exit",
    "mpls l2-circuit t1 200 192.168.10.10 raw",
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
   * RenixA发送vlan tag 2的报文, RenixB 可以收到
   * RenixA发送vlan tag 123的报文, RenixC 可以收到vlan tag为333的报文
   * RenixA发送vlan tag 100 200 的报文, RenixC 可以收到vlan tag为100 444的报文
   *
   * (删除其中任意一个'mpls或vlan-translate'不会影响另一个的功能)
   */

  testHelper.ExecRetMatchDutB("show mpls l2-circuit", /t1.*?200 /g);
  testHelper.ExecRetMatchDutB(
    "show mpls vc-table",
    /200.*?192.168.10.10.*?Active/g
  );

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
    "no mpls-l2-circuit t1",
    "switchport mode access",
    "exit",
    `interface ${Port.B}`,
    "switchport mode access",
    "exit",
    "no vlan mapping table vm",
    "no ethernet evc 1",
    "no ethernet evc 2",
    "no interface loopback 0",
    "no router rip",
    "no router ldp",
    "no mpls l2-circuit t1",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no mpls-l2-circuit t1",
    "exit",
    "no interface loopback 0",
    "no router rip",
    "no router ldp",
    "no mpls l2-circuit t1",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
