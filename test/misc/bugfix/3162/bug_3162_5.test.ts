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

test("最优Router ID变化后, 只有重置BGP进程后才会生效(选择三层接口最大的IP地址)", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.1/24",
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
  // 验证router-id是1.1.1.1
  testHelper.ExecRetMatchDutA("show ip bgp scan", "router-id 1.1.1.1");

  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA("show ip bgp neighbors", "BGP state = Established");

  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors",
    "remote router ID 1.1.1.1",
  );

  // 验证三层接口IP地址更大的出现后, 不影响BGP实例当前使用的router-id
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.10.10.10/24",
    "exit",
    "end",
  ]);

  testHelper.sleep(3000);
  testHelper.ExecRetMatchDutA("show ip bgp scan", "router-id 1.1.1.1");
  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors",
    "remote router ID 1.1.1.1",
  );

  // 验证重置bgp实例后, 使用三层接口中IP地址最大的作为router-id
  testHelper.sleep(3000);
  testHelper.ExecConfigDutA(["clear bgp *"]);
  testHelper.ExecRetMatchDutA("show ip bgp scan", "router-id 10.10.10.10");

  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA("show ip bgp neighbors", "BGP state = Established");

  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors",
    "remote router ID 10.10.10.10",
  );

  // 验证删除三层接口IP地址后，不影响BGP实例当前使用的router-id
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "end",
  ]);

  testHelper.sleep(3000);
  testHelper.ExecRetMatchDutA("show ip bgp scan", "router-id 10.10.10.10");
  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors",
    "remote router ID 10.10.10.10",
  );

  // 验证重置BGP实例后，根据规则优选三层接口中IP地址最大的作为router-id
  testHelper.sleep(3000);
  testHelper.ExecConfigDutA(["clear bgp *"]);
  testHelper.ExecRetMatchDutA("show ip bgp scan", "router-id 1.1.1.1");

  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA("show ip bgp neighbors", "BGP state = Established");

  testHelper.ReadyCheckDutB(
    "show ip bgp neighbors",
    "remote router ID 1.1.1.1",
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
