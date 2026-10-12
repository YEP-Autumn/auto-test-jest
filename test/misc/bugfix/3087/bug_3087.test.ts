import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";
import { LinkConstraint } from "@/utils/topo/link-constraint";

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
test("ip bgp存在递归路由的时候，bgp路由选路无法正确优选，导致路由震荡", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.100.100.1/30",
    "exit",
    "interface loopback3",
    "ip address 10.1.67.1/32",
    "exit",
    "interface loopback4",
    "ip address 10.1.68.1/32",
    "exit",
    "router bgp 100",
    "bgp router-id 10.1.67.1",
    "neighbor 10.2.67.1 remote-as 200",
    "neighbor 10.2.67.1 ebgp-multihop 255",
    "neighbor 10.2.67.1 update-source loopback3",
    "neighbor 10.100.100.2 remote-as 200",
    `neighbor 10.100.100.2 update-source ${Port.A}`,
    "address-family ipv4",
    "no synchronization",
    "redistribute connected",
    "neighbor 10.2.67.1 activate",
    "neighbor 10.100.100.2 activate",
    "exit-address-family",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.100.100.2/30",
    "exit",
    "interface loopback3",
    "ip address 10.2.67.1/32",
    "exit",
    "interface loopback4",
    "ip address 10.2.68.1/32",
    "exit",
    "router bgp 200",
    "bgp router-id 10.2.67.1",
    "neighbor 10.1.67.1 remote-as 100",
    "neighbor 10.1.67.1 ebgp-multihop 255",
    "neighbor 10.1.67.1 update-source loopback3",
    "neighbor 10.100.100.1 remote-as 100",
    `neighbor 10.100.100.1 update-source ${Port.A}`,
    "address-family ipv4",
    "no synchronization",
    "redistribute connected",
    "neighbor 10.1.67.1 activate",
    "neighbor 10.100.100.1 activate",
    "exit-address-family",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    `Interface current state: UP`,
  );

  testHelper.sleep(1000);

  testHelper.ExecConfigDutB(["clear bgp *"]);
  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA("show ip route", "10.2.67.1/32", 1000 * 60);
  testHelper.ReadyCheckDutA("show ip route", "10.2.68.1/32");

  testHelper.ExecConfigDutA(["clear ip bgp 10.2.67.1"]);

  testHelper.ReadyCheckDutA(
    "show ip bgp neighbors 10.2.67.1",
    "BGP state = Established",
  );

  testHelper.sleep(10 * 1000);

  testHelper.ExecRetMatchDutA("show ip route", "10.2.67.1/32");
  testHelper.ExecRetMatchDutA("show ip route", "10.2.68.1/32");

  testHelper.ExecRetMatchDutA(
    "show ip bgp neighbors 10.2.67.1",
    "BGP state = Established",
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router bgp 100",
    "no interface loopback 3",
    "no interface loopback 4",
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no router bgp 200",
    "no interface loopback 3",
    "no interface loopback 4",
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
