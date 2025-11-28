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
 */

test("支持在开启了flex模式的dot1q-tunne接口上配置vlan类型的 mpls-vpws ac", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 8.8.8.1/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "switchport mode dot1q-tunnel",
    "switchport dot1q-tunnel type flex",
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

  /** 配置 flex dotq-tunnel */
  testHelper.ExecConfigDutA([
    "configure terminal",
    "vlan database",
    "vlan 2-500",
    "exit",
    "raw vlan group 1 qinq-flex vlan 100-150",
    "ethernet evc 1",
    "dot1q mapped-vlan 400",
    "exit",
    "ethernet evc 2",
    "dot1q mapped-vlan 401",
    "exit",
    "ethernet evc 3",
    "dot1q mapped-vlan 402",
    "exit",
    "ethernet evc 4",
    "dot1q mapped-vlan 403",
    "exit",
    "ethernet evc 5",
    "dot1q mapped-vlan 404",
    "exit",
    "ethernet evc 6",
    "dot1q mapped-vlan 500",
    "exit",
    "vlan mapping table vm",
    "raw-vlan group 1 evc 5",
    "raw-vlan-translate 200 evc 1",
    "raw-vlan-translate 201 202 evc 2",
    "raw-vlan 203 evc 3",
    "raw-vlan untagged evc 4",
    "raw-vlan out-of-range evc 6",
    "raw-vlan 100 200 egress-vlan untagged",
    "raw-vlan 200 300 egress-vlan 123",
    "exit",
    `interface ${Port.D}`,
    "switchport dot1q-tunnel vlan mapping table vm",
    "switchport dot1q-tunnel allowed vlan add 400-404,500",
    "exit",
    `interface ${Port.B}`,
    "switchport mode trunk",
    "switchport trunk allowed vlan add 400-404,500",
    "end",
  ]);

  testHelper.sleep(45000);

  testHelper.ExecRetMatchDutB("show mpls l2-circuit", /t1.*?200 /g);
  testHelper.ExecRetMatchDutB(
    "show mpls vc-table",
    /200.*?192.168.10.10.*?Active/g
  );

  /**
   * RenixA 发送 vlan 2的报文时, RenixB能够收到报文
   * RenixA 发送 vlan 200的报文时, RenixC能够收到vlan 400的报文
   * RenixA 发送 vlan 201 202的报文时, RenixC能够收到vlan 201 401的报文
   * RenixA 发送 vlan 203的报文时, RenixC能够收到vlan 203 402的报文
   * RenixA 发送 vlan 不带vlan的报文时, RenixC能够收到vlan 403的报文
   * RenixA 发送 vlan 100-150的报文时, RenixC能够收到携带内层100-150, 外层404的报文
   * RenixA 发送 vlan 其他vlan的报文时, RenixC能够收到vlan 500的报文 (需要portB和portD都配置允许该vlan通行)
   *
   * (携带vlan 100 200的报文从PortB接口出时, 会剥离两层tag)
   * (携带vlan 200 300的报文从PortB接口出时, 会替换为vlan 123)
   *
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
    "no mpls-l2-circuit t1",
    "switchport mode access",
    "exit",
    `interface ${Port.B}`,
    "switchport mode access",
    "exit",
    "no vlan mapping table vm",
    "no ethernet evc 1",
    "no ethernet evc 2",
    "no ethernet evc 3",
    "no ethernet evc 4",
    "no ethernet evc 5",
    "no ethernet evc 6",
    "no raw vlan group 1",
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
    "switchport mode access",
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
