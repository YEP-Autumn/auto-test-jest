import { Port } from "../../utils";
import { TestHelper } from "../../utils/TestHelper";
import { LinkConstraint } from "../../utils/topo/LinkConstraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.two_devices_topo_links_type_2,
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
test("支持配置VRRP指定VLAN子接口", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address 1.1.1.1/24",
    "exit",
    "router vrrp 1",
    `interface ${Port.A}.1`,
    "priority 200",
    "virtual-ip 1.1.1.100",
    "advertisement-interval 5",
    "enable",
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
    "router vrrp 1",
    `interface ${Port.A}.1`,
    "priority 120",
    "virtual-ip 1.1.1.100",
    "advertisement-interval 5",
    "enable",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    "show vrrp",
    `State               : Master`,
    1000 * 20,
  );
  testHelper.ReadyCheckDutB(
    "show vrrp",
    `State               : Backup`,
    1000 * 10,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "router vrrp 1",
    "disable",
    "exit",
    "no router vrrp 1",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "router vrrp 1",
    "disable",
    "exit",
    "no router vrrp 1",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
