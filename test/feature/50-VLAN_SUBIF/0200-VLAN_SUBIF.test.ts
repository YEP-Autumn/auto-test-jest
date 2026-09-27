import { Port } from "../../../utils";
import { TestHelper } from "../../../utils/test-helper";
import { LinkConstraint } from "../../../utils/topo/link-constraint";

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
test("支持在VLAN子接口上配置IPv6地址", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ipv6 enable",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address 1.1.1.1/24",
    "ipv6 address 2001::1/64",
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
    "ip address 1.1.1.1/24",
    "ipv6 address 2001::2/64",
    "end",
  ]);

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

  testHelper.sleep(1000 * 3);

  testHelper.ExecRetMatchDutA(
    "ping ipv6 2001::2",
    `5 packets transmitted, 5 received, 0% packet loss`,
  );
  testHelper.ExecRetMatchDutB(
    "ping ipv6 2001::1",
    `5 packets transmitted, 5 received, 0% packet loss`,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ipv6 enable",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no ipv6 enable",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
