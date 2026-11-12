import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";
import { LinkConstraint } from "@/utils/topo/link-constraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.four_devices_topo_links_type_3,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *    +--------+                   +--------+
 *    |  DUTA  |--PortA <=> PortA--|  DUTB  |
 *    +--------+                   +--------+
 *        |                            |
 *      PortD                        PortB
 *        |                            |
 *      PortD                        PortB
 *        |                            |
 *    +--------+                   +--------+
 *    |  DUTD  |--PortC <=> PortC--|  DUTC  |
 *    +--------+                   +--------+
 *
 */
test("测试 OSPF LFA 功能", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.1/24",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 4.4.4.2/24",
    "exit",
    "router ospf",
    "network 1.1.1.0/24 area 0",
    "network 4.4.4.0/24 area 0",
    "exit",
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
    "ip address 2.2.2.1/24",
    "exit",
    "router ospf",
    "network 1.1.1.0/24 area 0",
    "network 2.2.2.0/24 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 2.2.2.2/24",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 3.3.3.1/24",
    "exit",
    "router ospf",
    "network 2.2.2.0/24 area 0",
    "network 3.3.3.0/24 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutD([
    "configure terminal",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 3.3.3.2/24",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 4.4.4.1/24",
    "exit",
    "router ospf",
    "network 3.3.3.0/24 area 0",
    "network 4.4.4.0/24 area 0",
    "exit",
    "end",
  ]);

  testHelper.sleep(20000);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no router ospf",
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
    "no router ospf",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "switchport",
    "exit",
    "no router ospf",
    "end",
  ]);

  testHelper.CleanConfigDutD([
    "configure terminal",
    `interface ${Port.C}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no router ospf",
    "end",
  ]);
  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
