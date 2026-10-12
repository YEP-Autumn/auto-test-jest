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
test("测试设备支持创建AGG VLAN子接口", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "static-channel-group 1",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "static-channel-group 1",
    "exit",
    `interface agg 1.1`,
    "dot1q termination vid 100",
    "ip address 1.1.1.1/24",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "static-channel-group 1",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "static-channel-group 1",
    "exit",
    `interface agg 1.1`,
    "dot1q termination vid 100",
    "ip address 1.1.1.2/24",
    "end",
  ]);

  /** For wait interface up */
  testHelper.ReadyCheckDutA(
    `show interface agg 1.1`,
    `Interface current state: UP`,
    1000 * 10,
  );

  testHelper.ReadyCheckDutB(
    `show interface agg 1.1`,
    `Interface current state: UP`,
    1000 * 10,
  );

  /** For wait route install */
  testHelper.sleep(2000);

  testHelper.ExecRetMatchDutA("ping 1.1.1.2", ` 0% packet loss`);
  testHelper.ExecRetMatchDutB("ping 1.1.1.1", ` 0% packet loss`);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no interface agg 1.1",
    `interface ${Port.A}`,
    "no static-channel-group",
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "no static-channel-group",
    "switchport",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no interface agg 1.1",
    `interface ${Port.A}`,
    "no static-channel-group",
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "no static-channel-group",
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
