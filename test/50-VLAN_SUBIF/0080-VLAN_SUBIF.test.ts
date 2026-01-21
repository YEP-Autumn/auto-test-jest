import { Port } from "../../utils";
import { TestHelper } from "../../utils/TestHelper";
import { LinkConstraint } from "../../utils/topo/LinkConstraint";

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
test("设备支持在子接口配置DHCP Relay", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "service dhcp enable",
    "dhcp server",
    "dhcp pool pool1",
    "network 5.5.5.0/24",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "dhcp server enable",
    "ip address 4.4.4.1/24",
    "exit",
    "ip route 5.5.5.0/24 4.4.4.2",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "service dhcp enable",
    "dhcp-server 1 4.4.4.1",
    "dhcp relay",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address 4.4.4.2/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "exit",
    `interface ${Port.B}.1`,
    "dot1q termination vid 200",
    "dhcp relay information trusted",
    "dhcp-server 1",
    "ip address 5.5.5.2/24",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "exit",
    `interface ${Port.B}.1`,
    "dot1q termination vid 200",
    "ip address dhcp",
    "end",
  ]);

  testHelper.sleep(30000);

  testHelper.ExecRetMatchDutC(
    "show dhcp client verbose",
    "DHCP server: 4.4.4.1",
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "service dhcp disable",
    "no dhcp server",
    "no dhcp pool pool1",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "no ip route 5.5.5.0/24",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "service dhcp disable",
    "no dhcp-server 1",
    "no dhcp relay",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    `no interface ${Port.B}.1`,
    `interface ${Port.B}`,
    "switchport",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    `no interface ${Port.B}.1`,
    `interface ${Port.B}`,
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
