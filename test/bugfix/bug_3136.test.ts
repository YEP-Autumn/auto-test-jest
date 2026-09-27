import { Port } from "../../utils";
import { TestHelper } from "../../utils/test-helper";
import { LinkConstraint } from "../../utils/topo/link-constraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.two_devices_topo_links_type_2,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *   +--------+                   +--------+
 *   |        |--PortA <=> PortA--|        |
 *   |  DUTA  |                   |  DUTB  |
 *   |        |--PortB <=> PortB--|        |
 *   +--------+                   +--------+
 *
 */
test("[BGP多实例] show bgp evpn summary无对应信息显示", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.100.100.1/30",
    "exit",
    "evpn",
    "exit",
    "router bgp 100 view test",
    "neighbor 10.100.100.2 remote-as 100",
    "address-family l2vpn evpn",
    "neighbor 10.100.100.2 activate",
    "exit-address-family",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.100.100.2/30",
    "exit",
    "evpn",
    "exit",
    "router bgp 100 view test",
    "neighbor 10.100.100.1 remote-as 100",
    "address-family l2vpn evpn",
    "neighbor 10.100.100.1 activate",
    "exit-address-family",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    `Interface current state: UP`,
  );

  testHelper.ExecConfigDutB(["clear bgp *"]);
  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA(
    "show bgp evpn neighbors",
    "BGP state = Established",
  );

  testHelper.ExecRetMatchDutA("show bgp evpn summary", "10.100.100.2");

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router bgp 100 view test",
    "no evpn",
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no router bgp 100 view test",  
    "no evpn",
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
