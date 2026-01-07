import { Port } from "../../utils";
import { TestHelper } from "../../utils/TestHelper";
import { LinkConstraint } from "../../utils/topo/LinkConstraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.two_devices_topo_links_type_2
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *   +--------+                   +--------+
 *   |        |--PortA <=> PortA--|        |
 *   |  DUTA  |                   |  DUTB  |
 *   |        |--PortB <=> PortB--|        |
 *   +--------+                   +--------+
 *
 */
test("支持配置BFD指定VLAN子接口", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address 1.1.1.1/24",
    "exit",
    "bfd test peer-ip 1.1.1.2 interface eth-0-1.1 auto",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address 1.1.1.2/24",
    "exit",
    "bfd test peer-ip 1.1.1.1 interface eth-0-1.1 auto",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    "show bfd session detail",
    /Session State : Up/g,
    1000 * 20
  );

  testHelper.ReadyCheckDutB(
    "show bfd session detail",
    /Session State : Up/g,
    1000 * 10
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no bfd test",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no bfd test",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
