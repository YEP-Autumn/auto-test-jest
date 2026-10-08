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
test("优先选择 BGP 实例自身配置的 Router ID", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "router-id 1.2.3.4",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.1/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.10.10.10/24",
    "exit",
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "exit",
    "interface loopback1",
    "ip address 20.20.20.20/32",
    "exit",
    "router bgp 100",
    "bgp router-id 4.3.2.1",
    "neighbor 1.1.1.2 remote-as 100",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.2/24",
    "exit",
    "router bgp 100",
    "neighbor 1.1.1.1 remote-as 100",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    `Interface current state: UP`,
  );

  testHelper.ExecConfigDutA(["clear bgp *"]);

  testHelper.ExecRetMatchDutA("show ip bgp scan", "router-id 4.3.2.1");

  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA("show ip bgp neighbors", "BGP state = Established");

  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors",
    "remote router ID 4.3.2.1",
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router bgp 100",
    "no interface loopback 0",
    "no interface loopback 1",
    "no router-id",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no router bgp 100",
    "no router-id",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
