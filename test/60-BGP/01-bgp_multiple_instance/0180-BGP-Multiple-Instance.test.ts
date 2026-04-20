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
test("测试BGP多实例IPv6 Unicast地址族", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ipv6 enable",
    `interface ${Port.A}`,
    "no switchport",
    "ipv6 address 1000::1/64",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ipv6 address 2000::1/64",
    "exit",
    "router bgp 100 view test1",
    "bgp router-id 1.2.3.4",
    "neighbor 1000::2 remote-as 100",
    "exit",
    "router bgp 200 view test2",
    "bgp router-id 4.3.2.1",
    "neighbor 2000::2 remote-as 200",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "ipv6 enable",
    `interface ${Port.A}`,
    "no switchport",
    "ipv6 address 1000::2/24",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ipv6 address 2000::2/24",
    "exit",
    "router bgp 100 view test1",
    "bgp router-id 2.3.4.5",
    "neighbor 1000::1 remote-as 100",
    "exit",
    "router bgp 200 view test2",
    "bgp router-id 5.4.3.2",
    "neighbor 2000::1 remote-as 200",
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

  testHelper.ExecConfigDutA(["clear bgp ipv6 view test1 *"]);
  testHelper.ExecConfigDutA(["clear bgp ipv6 view test2 *"]);

  testHelper.ReadyCheckDutA(
    "show bgp ipv6 neighbors 1000::2",
    "Established",
    60 * 1000,
  );
  testHelper.ReadyCheckDutA("show bgp ipv6 neighbors 2000::2", "Established");

  testHelper.ReadyCheckDutB("show bgp ipv6 neighbors 1000::1", "Established");
  testHelper.ReadyCheckDutB("show bgp ipv6 neighbors 2000::1", "Established");

  testHelper.ExecConfigDutA([
    "configure terminal",
    "router bgp 100 view test1",
    "no neighbor 1000::2",
    "end",
  ]);

  testHelper.sleep(10 * 1000);

  testHelper.ReadyCheckDutB(
    "show bgp ipv6 neighbors 1000::1",
    "Active",
    30 * 1000,
  );

  testHelper.ReadyCheckDutB(
    "show bgp ipv6 neighbors 2000::1",
    "Established",
    30 * 1000,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ipv6 enable",
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
    "no ipv6 enable",
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
