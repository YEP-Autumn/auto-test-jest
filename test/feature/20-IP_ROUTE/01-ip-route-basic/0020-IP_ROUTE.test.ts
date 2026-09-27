import { Port } from "../../../../utils";
import { TestHelper } from "../../../../utils/test-helper";
import { LinkConstraint } from "../../../../utils/topo/link-constraint";

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
test("测试VRF", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip vrf vpn1",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "ip vrf forwarding vpn1",
    "ip address 1.1.1.1/24",
    "exit",
    "ip route vrf vpn1 2.2.2.0/24 1.1.1.2",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "ip vrf vpn1",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "ip vrf forwarding vpn1",
    "ip address 1.1.1.2/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip vrf forwarding vpn1",
    "ip address 2.2.2.1/24",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    "Interface current state: UP",
  );

  testHelper.ReadyCheckDutB(
    `show interface ${Port.A}`,
    "Interface current state: UP",
  );

  testHelper.ReadyCheckDutB(
    `show interface ${Port.B}`,
    "Interface current state: UP",
  );

  testHelper.ExecRetMatchDutA("ping vrf vpn1 2.2.2.1", " 0% packet loss");

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip route vrf vpn1 2.2.2.0/24 1.1.1.2",
    "no ip vrf vpn1",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no ip vrf vpn1",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
