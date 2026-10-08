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
test("VRF中的router-id的重新选择, 不影响非VRF BGP实例的router-id", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip vrf vpn1",
    "rd 1:1",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.1/24",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip vrf forwarding vpn1",
    "ip address 2.2.2.1/24",
    "exit",
    "router bgp 100",
    "neighbor 1.1.1.2 remote-as 100",
    "address-family ipv4 vrf vpn1",
    "neighbor 2.2.2.2 remote-as 100",
    "exit-address-family",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "ip vrf vpn1",
    "rd 1:2",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.2/24",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip vrf forwarding vpn1",
    "ip address 2.2.2.2/24",
    "exit",
    "router bgp 100",
    "neighbor 1.1.1.1 remote-as 100",
    "address-family ipv4 vrf vpn1",
    "neighbor 2.2.2.1 remote-as 100",
    "exit-address-family",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    `Interface current state: UP`,
  );

  testHelper.ExecConfigDutA(["clear bgp *"]);
  testHelper.ExecConfigDutA(["clear bgp * vrf vpn1"]);

  testHelper.sleep(10000);

  testHelper.ReadyCheckDutA("show ip bgp neighbors", "BGP state = Established");
  testHelper.ExecRetMatchDutA(
    "show ip bgp scan",
    new RegExp("Default\[\\s\\S\]*?router-id 1.1.1.1"),
  );

  testHelper.ReadyCheckDutA(
    "show ip bgp vpnv4 vrf vpn1 neighbors",
    "BGP state = Established",
  );
  testHelper.ExecRetMatchDutA(
    "show ip bgp scan",
    new RegExp("vpn1\[\\s\\S\]*?router-id 2.2.2.1"),
  );

  testHelper.ExecRetMatchDutB(
    "show ip bgp neighbors",
    "remote router ID 1.1.1.1",
  );
  testHelper.ExecRetMatchDutB(
    "show ip bgp vpnv4 vrf vpn1 neighbors",
    "remote router ID 2.2.2.1",
  );

  // 在VRF中配置更大的IP地址，重置BGP实例，VRF BGP实例router-id更新，默认BGP实例router-id不变
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "ip vrf forwarding vpn1",
    "ip address 12.12.12.12/24",
    "exit",
    "end",
  ]);

  testHelper.sleep(3000);
  testHelper.ExecRetMatchDutA(
    "show ip bgp scan",
    new RegExp("Default\[\\s\\S\]*?router-id 1.1.1.1"),
  );
  testHelper.ExecRetMatchDutA(
    "show ip bgp scan",
    new RegExp("vpn1\[\\s\\S\]*?router-id 2.2.2.1"),
  );
  testHelper.ExecRetMatchDutB(
    "show ip bgp neighbors",
    "remote router ID 1.1.1.1",
  );
  testHelper.ExecRetMatchDutB(
    "show ip bgp vpnv4 vrf vpn1 neighbors",
    "remote router ID 2.2.2.1",
  );

  // 验证重置BGP实例后，根据规则优选全局router-id
  testHelper.ExecConfigDutA(["clear bgp *"]);
  testHelper.ExecConfigDutA(["clear bgp * vrf vpn1"]);

  testHelper.sleep(10000);
  testHelper.ReadyCheckDutA("show ip bgp neighbors", "BGP state = Established");
  testHelper.ExecRetMatchDutA(
    "show ip bgp scan",
    new RegExp("Default\[\\s\\S\]*?router-id 1.1.1.1"),
  );

  testHelper.ReadyCheckDutA(
    "show ip bgp vpnv4 vrf vpn1 neighbors",
    "BGP state = Established",
  );
  testHelper.ExecRetMatchDutA(
    "show ip bgp scan",
    new RegExp("vpn1\[\\s\\S\]*?router-id 12.12.12.12"),
  );

  testHelper.ExecRetMatchDutB(
    "show ip bgp neighbors",
    "remote router ID 1.1.1.1",
  );
  testHelper.ExecRetMatchDutB(
    "show ip bgp vpnv4 vrf vpn1 neighbors",
    "remote router ID 12.12.12.12",
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip vrf vpn1",
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
    "no ip vrf vpn1",
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
