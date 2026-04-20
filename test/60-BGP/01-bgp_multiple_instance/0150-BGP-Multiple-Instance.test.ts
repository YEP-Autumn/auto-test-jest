import { Port } from "../../../utils";
import { StreamBackendApi } from "../../../utils/stream/StreamBackendApi";
import { TestHelper } from "../../../utils/TestHelper";
import { LinkConstraint } from "../../../utils/topo/LinkConstraint";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;
const streamBackendApi = new StreamBackendApi();

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *                    +--------+                   +--------+
 *                    |        |--PortA <=> PortA--|        |
 *  RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortB
 *                    |        |--PortC <=> PortC--|        |    |
 *                    +--------+                   +--------+    |
 *                                                               |
 *                                                 +--------+    |
 *                               RenixB <=> PortD--|  DUTC  |--PortB
 *                                                 +--------+
 */
test("测试BGP多实例配置邻居default-originate功能", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.1/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.10.10.1/24",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 2.2.2.1/24",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 11.11.11.1/24",
    "exit",
    "arp 10.10.10.10 10.10.10",
    "ip route 100.100.100.0/24 10.10.10.10",
    "router bgp 100 view test1",
    "neighbor 1.1.1.2 remote-as 100",
    "redistribute static",
    "exit",
    "router bgp 200 view test2",
    "network 11.11.11.0/24",
    "neighbor 2.2.2.2 remote-as 200",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.2/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 3.3.3.2/24",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 2.2.2.2/24",
    "exit",
    "router bgp 100 view test1",
    "neighbor 1.1.1.1 remote-as 100",
    "exit",
    "router bgp 200 view test2",
    "neighbor 2.2.2.1 remote-as 200",
    "neighbor 2.2.2.1 default-originate",
    "neighbor 3.3.3.1 remote-as 300",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.2.3.4/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 3.3.3.1/24",
    "exit",
    "router bgp 300 view test3",
    "neighbor 3.3.3.2 remote-as 200",
    "redistribute connected",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    `Interface current state: UP`,
  );
  testHelper.ReadyCheckDutA(
    `show interface ${Port.C}`,
    `Interface current state: UP`,
  );
  testHelper.ReadyCheckDutB(
    `show interface ${Port.A}`,
    `Interface current state: UP`,
  );
  testHelper.ReadyCheckDutB(
    `show interface ${Port.C}`,
    `Interface current state: UP`,
  );
  testHelper.ReadyCheckDutB(
    `show interface ${Port.B}`,
    `Interface current state: UP`,
  );

  testHelper.ExecConfigDutB(["clear bgp view test1 *"]);
  testHelper.ExecConfigDutB(["clear bgp view test2 *"]);

  testHelper.ReadyCheckDutB(
    "show ip bgp view test1 neighbors",
    "Established",
    60 * 1000,
  );

  testHelper.ReadyCheckDutB(
    "show ip bgp view test2 neighbors",
    "Established",
    60 * 1000,
  );

  testHelper.sleep(10 * 1000);

  testHelper.ReadyCheckDutA(
    "show ip route",
    "B\\*.*?0.0.0.0\\/0 \\[200\\/0\\] via 2.2.2.2",
    60 * 1000,
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
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no arp 10.10.10.10",
    "no ip route 100.100.100.0/24",
    "no router bgp 100 view test1",
    "no router bgp 200 view test2",
    "end",
  ]);

  testHelper.CleanConfigDutB([
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
    "no router bgp 100 view test1",
    "no router bgp 200 view test2",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    "no router bgp 300 view test3",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
