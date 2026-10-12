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
test("最优Router ID变化后, 只有重置BGP进程后才会生效(选择 BGP 实例自身配置的 Router ID)", async () => {
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
  // 验证router-id是1.2.3.4
  testHelper.ExecRetMatchDutA("show ip bgp scan", "router-id 1.2.3.4");

  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA("show ip bgp neighbors", "BGP state = Established");

  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors",
    "remote router ID 1.2.3.4",
  );

  // 验证配置bgp实例的route-id后, 不影响BGP实例当前使用的router-id
  testHelper.ExecConfigDutA([
    "configure terminal",
    "router bgp 100",
    "bgp router-id 4.3.2.1",
    "end",
  ]);

  testHelper.sleep(3000);
  testHelper.ExecRetMatchDutA("show ip bgp scan", "router-id 1.2.3.4");

  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors",
    "remote router ID 1.2.3.4",
  );

  // 验证重置BGP实例后, 使用bgp实例配置的router-id
  testHelper.sleep(3000);
  testHelper.ExecConfigDutA(["clear bgp *"]);
  testHelper.ExecRetMatchDutA("show ip bgp scan", "router-id 4.3.2.1");

  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA("show ip bgp neighbors", "BGP state = Established");

  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors",
    "remote router ID 4.3.2.1",
  );

  // 验证删除bgp实例配置的router-id后，不影响当前使用的router-id
  testHelper.ExecConfigDutA([
    "configure terminal",
    "router bgp 100",
    "no bgp router-id",
    "end",
  ]);

  testHelper.sleep(3000);
  testHelper.ExecRetMatchDutA("show ip bgp scan", "router-id 4.3.2.1");

  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors",
    "remote router ID 4.3.2.1",
  );

  // 验证重置BGP实例后，根据规则优选全局router-id
  testHelper.sleep(3000);
  testHelper.ExecConfigDutA(["clear bgp *"]);
  testHelper.ExecRetMatchDutA("show ip bgp scan", "router-id 1.2.3.4");

  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA("show ip bgp neighbors", "BGP state = Established");

  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors",
    "remote router ID 1.2.3.4",
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
