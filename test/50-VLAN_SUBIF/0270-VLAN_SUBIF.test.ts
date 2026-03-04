import { Port } from "../../utils";
import { TestHelper } from "../../utils/TestHelper";
import { LinkConstraint } from "../../utils/topo/LinkConstraint";

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
test("支持在VLAN子接口上配置PIMv6-SM", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ipv6 enable",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ipv6 address 2001:9::1/64",
    "ipv6 pim sparse-mode",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "exit",
    `interface ${Port.D}.1`,
    "dot1q termination vid 200",
    "ipv6 address 2001:1::1/64",
    "ipv6 pim sparse-mode",
    "exit",
    "ipv6 pim rp-address 2001:1::1",
    "ipv6 route 2001:2::/64 2001:9::2",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "ipv6 enable",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ipv6 address 2001:9::2/64",
    "ipv6 pim sparse-mode",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "exit",
    `interface ${Port.D}.1`,
    "dot1q termination vid 200",
    "ipv6 address 2001:2::1/64",
    "ipv6 pim sparse-mode",
    "exit",
    "ipv6 pim rp-address 2001:1::1",
    "ipv6 route 2001:1::/64 2001:9::1",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}.1`,
    `Interface current state: UP`,
    1000 * 10,
  );

  testHelper.sleep(1000 * 5);
  testHelper.ExecRetMatchDutA(
    "show ipv6 pim sparse-mode rp mapping",
    "RP: 2001:1::1",
  );
  testHelper.ExecRetMatchDutB(
    "show ipv6 pim sparse-mode rp mapping",
    "RP: 2001:1::1",
  );
  testHelper.ExecRetMatchDutA(
    "show ipv6 pim sparse-mode interface",
    `${Port.A}.1`,
  );
  testHelper.ExecRetMatchDutB(
    "show ipv6 pim sparse-mode interface",
    `${Port.A}.1`,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ipv6 enable",
    `no interface ${Port.A}.1`,
    `no interface ${Port.D}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no ipv6 pim rp-address 2001:1::1",
    "no ipv6 route 2001:2::/64",
    "end",
  ]);
  testHelper.CleanConfigDutB([
    "configure terminal",
    "no ipv6 enable",
    `no interface ${Port.A}.1`,
    `no interface ${Port.D}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no ipv6 pim rp-address 2001:1::1",
    "no ipv6 route 2001:1::/64",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
