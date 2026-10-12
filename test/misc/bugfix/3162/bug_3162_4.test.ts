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
test("BGP没有配置Router ID, 没有配置全局Router ID时, 没有Loopback接口IP地址时, 选择三层接口最大的IP地址", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.1/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.10.10.10/24",
    "exit",
    "router bgp 100",
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

  testHelper.ExecRetMatchDutA("show ip bgp scan", "router-id 10.10.10.10");

  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA("show ip bgp neighbors", "BGP state = Established");

  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors",
    "remote router ID 10.10.10.10",
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router bgp 100",
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
