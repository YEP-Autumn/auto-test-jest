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
test("支持在VLAN子接口上配置PIM-DM", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.D}`,
    "no switchport",
    "exit",
    `interface ${Port.D}.1`,
    "dot1q termination vid 100",
    "ip address 11.1.1.1/24",
    "ip pim dense-mode",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 200",
    "ip address 12.1.1.1/24",
    "ip pim dense-mode",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.D}`,
    "no switchport",
    "exit",
    `interface ${Port.D}.1`,
    "dot1q termination vid 100",
    "ip address 22.1.1.2/24",
    "ip pim dense-mode",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 200",
    "ip address 12.1.1.2/24",
    "ip pim dense-mode",
    "end",
  ]);

  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip route 22.1.1.0/24 12.1.1.2",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "ip route 11.1.1.0/24 12.1.1.1",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}.1`,
    `Interface current state: UP`,
    1000 * 10,
  );

  testHelper.ReadyCheckDutA(
    `show interface ${Port.D}.1`,
    `Interface current state: UP`,
    1000 * 10,
  );

  testHelper.ExecRetMatchDutA(
    "show ip pim dense-mode interface",
    `11.1.1.1 *?${Port.D}.1`,
  );

  testHelper.ExecRetMatchDutA(
    "show ip pim dense-mode interface",
    `12.1.1.1 *?${Port.A}.1`,
  );

  testHelper.sleep(1000 * 30);

  testHelper.ReadyCheckDutA(
    "show ip pim dense-mode neighbor",
    `12.1.1.2.*?${Port.A}.1`,
    1000 * 10,
  );

  testHelper.ReadyCheckDutB(
    "show ip pim dense-mode neighbor",
    `12.1.1.1.*?${Port.A}.1`,
    1000 * 10,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    `no interface ${Port.D}.1`,
    `no interface ${Port.A}.1`,
    `interface ${Port.D}`,
    "switchport",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    "no ip route 22.1.1.0/24",
    "no ip pim rp-address 11.1.1.1",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `no interface ${Port.D}.1`,
    `no interface ${Port.A}.1`,
    `interface ${Port.D}`,
    "switchport",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    "no ip route 11.1.1.0/24",
    "no ip pim rp-address 11.1.1.1",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
