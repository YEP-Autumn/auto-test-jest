import { Port } from "../../utils";
import { TestHelper } from "../../utils/test-helper";
import { LinkConstraint } from "../../utils/topo/link-constraint";

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
test("设备支持在子接口配置DHCP Client", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "service dhcp enable",
    "dhcp server",
    "dhcp pool pool1",
    "network 5.5.5.0/24",
    "gateway 5.5.5.1",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "dhcp server enable",
    "ip address 5.5.5.1/24",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address dhcp",
    "end",
  ]);

  testHelper.sleep(30000);

  testHelper.ExecRetMatchDutB(
    "show dhcp client verbose",
    "DHCP server: 5.5.5.1",
  );

  testHelper.ExecRetMatchDutA("show dhcp server binding all", "5.5.5.2");

  testHelper.CleanConfigDutA([
    "configure terminal",
    "service dhcp disable",
    "no dhcp server",
    "no dhcp pool pool1",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
