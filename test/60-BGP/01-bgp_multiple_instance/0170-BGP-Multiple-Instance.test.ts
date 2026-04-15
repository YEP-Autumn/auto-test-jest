import { Port } from "../../../utils";
import { StreamBackendApi } from "../../../utils/stream/StreamBackendApi";
import { TestHelper } from "../../../utils/TestHelper";
import { LinkConstraint } from "../../../utils/topo/LinkConstraint";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;
const streamBackendApi = new StreamBackendApi();

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
test("测试BGP多实例IPv4 Unicast地址族", async () => {
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
    "router bgp 100 view test1",
    "neighbor 1.1.1.2 remote-as 100",
    "exit",
    "router bgp 200 view test2",
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
    "router bgp 100 view test1",
    "neighbor 1.1.1.1 remote-as 100",
    "exit",
    "router bgp 200 view test2",
    "neighbor 2.2.2.1 remote-as 200",
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

  testHelper.ExecConfigDutA(["clear bgp view test1 *"]);
  testHelper.ExecConfigDutA(["clear bgp view test2 *"]);

  testHelper.ReadyCheckDutA(
    "show ip bgp view test1 neighbors",
    "Established",
    30 * 1000,
  );

  testHelper.ReadyCheckDutA(
    "show ip bgp view test2 neighbors",
    "Established",
    30 * 1000,
  );

  testHelper.ReadyCheckDutB(
    "show ip bgp view test1 neighbors",
    "Established",
    30 * 1000,
  );

  testHelper.ReadyCheckDutB(
    "show ip bgp view test2 neighbors",
    "Established",
    30 * 1000,
  );

  testHelper.ExecConfigDutA([
    "configure terminal",
    "router bgp 100 view test1",
    "no neighbor 1.1.1.2",
    "end",
  ]);

  testHelper.sleep(10 * 1000);

  testHelper.ReadyCheckDutB(
    "show ip bgp view test1 neighbors",
    "Active",
    30 * 1000,
  );

  testHelper.ReadyCheckDutB(
    "show ip bgp view test2 neighbors",
    "Established",
    30 * 1000,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "switchport",
    "exit",
    "no router bgp 100 view test1",
    "no router bgp 200 view test2",
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
    "no router bgp 100 view test1",
    "no router bgp 200 view test2",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
