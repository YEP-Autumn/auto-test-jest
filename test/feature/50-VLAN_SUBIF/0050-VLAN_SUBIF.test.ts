import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";
import { LinkConstraint } from "@/utils/topo/link-constraint";

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
test("测试设备能够通过VLAN子接口ssh", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "username test privilege 4 password test",
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
    "username test privilege 4 password test",
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
    1000 * 10,
  );

  testHelper.ReadyCheckDutB(
    `show interface ${Port.A}.1`,
    `Interface current state: UP`,
    1000 * 10,
  );

  /** For wait route install */
  testHelper.sleep(2000);

  testHelper.ExecConfigDutA(["ssh -l test 1.1.1.2", "test", "exit"]);
  testHelper.ExecConfigDutB(["ssh -l test 1.1.1.1", "test", "exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no username test",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no username test",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
