import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";
import { LinkConstraint } from "@/utils/topo/link-constraint";

jest.setTimeout(1000 * 60 * 10);

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
test("同一目的网络配置两条等价静态路由时，两个下一跳均被优选形成多路径", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.1/24",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 3.3.3.1/24",
    "exit",
    "ip route 2.2.2.0/24 1.1.1.2",
    "ip route 2.2.2.0/24 3.3.3.2",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.2/24",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 3.3.3.2/24",
    "exit",
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    "Interface current state: UP",
  );

  testHelper.ReadyCheckDutA(
    `show interface ${Port.C}`,
    "Interface current state: UP",
  );

  testHelper.ReadyCheckDutB(
    `show interface ${Port.A}`,
    "Interface current state: UP",
  );

  testHelper.ReadyCheckDutB(
    `show interface ${Port.C}`,
    "Interface current state: UP",
  );

  testHelper.ReadyCheckDutA("show ip route", "2.2.2.0/24");

  testHelper.ExecRetMatchDutA("show ip route", ["via 1.1.1.2", "via 3.3.3.2"]);

  testHelper.ExecRetMatchDutA("ping 2.2.2.2", " 0% packet loss");

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip route 2.2.2.0/24 1.1.1.2",
    "no ip route 2.2.2.0/24 3.3.3.2",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "switchport",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no interface loopback0",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
