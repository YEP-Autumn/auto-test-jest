import { Port } from "../../../../utils";
import { TestHelper } from "../../../../utils/test-helper";
import { LinkConstraint } from "../../../../utils/topo/link-constraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_4,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 * +--------+                   +--------+                   +--------+
 * |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB <=> PortB--|  DUTC  |
 * +--------+                   +--------+                   +--------+
 *
 */
test("配置LDP功能", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.17.1/24",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 1.1.1.1/32",
    "exit",
    "router rip",
    "network 0.0.0.0/0",
    "exit",
    "router ldp",
    "router-id 1.1.1.1",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.17.2/24",
    "enable-ldp",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.1/24",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "exit",
    "router rip",
    "network 0.0.0.0/0",
    "exit",
    "router ldp",
    "router-id 2.2.2.2",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.2/24",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 3.3.3.3/32",
    "exit",
    "router rip",
    "network 0.0.0.0/0",
    "exit",
    "router ldp",
    "router-id 3.3.3.3",
    "end",
  ]);

  testHelper.sleep(25000);

  testHelper.ReadyCheckDutB(
    "show ldp session",
    new RegExp("1.1.1.1.*?OPERATIONAL"),
    60_000,
  );
  testHelper.ReadyCheckDutB(
    "show ldp session",
    new RegExp("3.3.3.3.*?OPERATIONAL"),
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    "no interface loopback0",
    "no router ldp",
    "no router rip",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    "exit",
    "no interface loopback0",
    "no router ldp",
    "no router rip",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    "exit",
    "no interface loopback0",
    "no router ldp",
    "no router rip",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
