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
test("非VRF中的router-id的重新选择, 影响所有非VRF BGP实例的router-id", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.1/24",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 2.2.2.1/24",
    "exit",
    "router bgp 100",
    "neighbor 1.1.1.2 remote-as 100",
    "exit",
    "router bgp 200 view test",
    "neighbor 2.2.2.2 remote-as 200",
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
    "ip address 2.2.2.2/24",
    "exit",
    "router bgp 100",
    "neighbor 1.1.1.1 remote-as 100",
    "exit",
    "router bgp 200 view test",
    "neighbor 2.2.2.1 remote-as 200",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    `Interface current state: UP`,
  );

  testHelper.ExecConfigDutA(["clear bgp *"]);
  testHelper.ExecConfigDutA(["clear bgp view test *"]);

  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA(
    "show ip bgp neighbors 1.1.1.2",
    "BGP state = Established",
  );
  testHelper.ReadyCheckDutA(
    "show ip bgp neighbors 2.2.2.2",
    "BGP state = Established",
  );
  testHelper.ExecRetMatchDutA(
    "show ip bgp scan",
    "BGP AS 100, router-id 2.2.2.1",
  );
  testHelper.ExecRetMatchDutA(
    "show ip bgp scan",
    "BGP AS 200, router-id 2.2.2.1",
  );

  testHelper.ExecRetMatchDutB(
    "show ip bgp neighbors 1.1.1.1",
    "remote router ID 2.2.2.1",
  );
  testHelper.ExecRetMatchDutB(
    "show ip bgp neighbors 2.2.2.1",
    "remote router ID 2.2.2.1",
  );

  // 在默认VRF中配置更大的IP地址，重置BGP实例，默认 VRF BGP实例router-id更新
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 12.12.12.12/24",
    "exit",
    "end",
  ]);

  testHelper.sleep(3000);

  testHelper.ExecConfigDutA(["clear bgp *"]);
  testHelper.ExecConfigDutA(["clear bgp view test *"]);

  testHelper.sleep(10000);
  testHelper.ReadyCheckDutA("show ip bgp neighbors", "BGP state = Established");

  testHelper.ReadyCheckDutA(
    "show ip bgp neighbors 1.1.1.2",
    "BGP state = Established",
  );
  testHelper.ReadyCheckDutA(
    "show ip bgp neighbors 2.2.2.2",
    "BGP state = Established",
  );
  testHelper.ExecRetMatchDutA(
    "show ip bgp scan",
    "BGP AS 100, router-id 12.12.12.12",
  );
  testHelper.ExecRetMatchDutA(
    "show ip bgp scan",
    "BGP AS 200, router-id 12.12.12.12",
  );

  testHelper.ExecRetMatchDutB(
    "show ip bgp neighbors 1.1.1.1",
    "remote router ID 12.12.12.12",
  );
  testHelper.ExecRetMatchDutB(
    "show ip bgp neighbors 2.2.2.1",
    "remote router ID 12.12.12.12",
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "switchport",
    "exit",
    "no router bgp 100",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "switchport",
    "exit",
    "no router bgp 100",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
