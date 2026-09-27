import { Port } from "../../../utils";
import { TestHelper } from "../../../utils/test-helper";
import { LinkConstraint } from "../../../utils/topo/link-constraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.one_device_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *                    +--------+
 *  RenixA <=> PortA--|  DUTA  |--PortB <=> RenixB
 *                    +--------+
 *
 */
test("支持在VLAN子接口上配置MLD", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ipv6 enable",
    "ipv6 mld limit 2000",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ipv6 address 2001:1::1/64",
    "ipv6 pim sparse-mode",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "exit",
    `interface ${Port.B}.1`,
    "dot1q termination vid 200",
    "ipv6 address 3001:1::1/64",
    "ipv6 pim sparse-mode",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}.1`,
    "ipv6 mld last-member-query-count 3",
    "ipv6 mld last-member-query-interval 2000",
    "ipv6 mld limit 1000",
    "ipv6 mld proxy-service",
    "ipv6 mld query-max-response-time 12",
    "ipv6 mld query-interval 120",
    "ipv6 mld robustness-variable 3",
    "ipv6 mld version 2",
    "ipv6 mld static-group ff0e::1234",
    "exit",
    `interface ${Port.B}.1`,
    `ipv6 mld mroute-proxy ${Port.A}.1`,
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}.1`,
    `Interface current state: UP`,
    1000 * 10,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ipv6 enable",
    "no ipv6 mld limit",
    `no interface ${Port.A}.1`,
    `no interface ${Port.B}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
