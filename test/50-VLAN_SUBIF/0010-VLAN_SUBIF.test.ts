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
test("测试设备支持创建VLAN子接口", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address 1.1.1.1/24",
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
    "end",
  ]);

  /** For wait interface up */
  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}.1`,
    `Interface current state: UP`,
    1000 * 10
  );

  testHelper.ReadyCheckDutB(
    `show interface ${Port.A}.1`,
    `Interface current state: UP`,
    1000 * 10
  );

  /** For wait route install */
  testHelper.sleep(2000);

  testHelper.ExecRetMatchDutA("ping 1.1.1.2", ` 0% packet loss`);
  testHelper.ExecRetMatchDutB("ping 1.1.1.1", ` 0% packet loss`);

  testHelper.CleanConfigDutA([
    "configure terminal",
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
