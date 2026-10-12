import { Port } from "../../../../utils";
import { TestHelper } from "../../../../utils/test-helper";
import { LinkConstraint } from "../../../../utils/topo/link-constraint";

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
test("测试BGP多实例配置 ipv6 地址族路由重分布", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ipv6 enable",
    "router-id 1.1.1.1",
    `interface ${Port.A}`,
    "no switchport",
    "ipv6 address 1::1/64",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ipv6 address 2::1/64",
    "exit",
    "router bgp 100 view test1",
    "neighbor 1::2 remote-as 100",
    "exit",
    "router bgp 200 view test2",
    "neighbor 2::2 remote-as 200",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "ipv6 enable",
    "router-id 2.2.2.2",
    `interface ${Port.A}`,
    "no switchport",
    "ipv6 address 1::2/64",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ipv6 address 2::2/64",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 10.10.10.1/24",
    "exit",
    "ip route 100.100.100.0/24 10.10.10.2",
    "router bgp 100 view test1",
    "neighbor 1::1 remote-as 100",
    "neighbor 1::1 as-origination-interval 1",
    "neighbor 1::1 advertisement-interval 0",
    "exit",
    "router bgp 200 view test2",
    "neighbor 2::1 remote-as 200",
    "neighbor 2::1 as-origination-interval 1",
    "neighbor 2::1 advertisement-interval 0",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    "Interface current state: UP",
  );

  testHelper.ReadyCheckDutA(
    `show interface ${Port.B}`,
    "Interface current state: UP",
  );

  testHelper.sleep(5 * 1000);

  testHelper.ExecRetMatchDutA("ping ipv6 1::2", " 0% packet loss");
  testHelper.ExecRetMatchDutA("ping ipv6 2::2", " 0% packet loss");

  testHelper.ExecConfigDutA(["clear bgp ipv6 view test1 *"]);
  testHelper.ExecConfigDutA(["clear bgp ipv6 view test2 *"]);

  testHelper.sleep(10 * 1000);

  testHelper.ReadyCheckDutA(
    "show bgp ipv6 neighbors 1::2",
    "BGP state = Established",
  );

  testHelper.ReadyCheckDutA(
    "show bgp ipv6 neighbors 2::2",
    "BGP state = Established",
  );

  testHelper.ExecConfigDutB([
    "configure terminal",
    "router bgp 100 view test1",
    "address-family ipv6",
    "redistribute connected",
    "end",
  ]);

  testHelper.sleep(2000);
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test1", "i1::/64");
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test1", "i2::/64");
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test2", "i1::/64", true);
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test2", "i2::/64", true);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "router bgp 200 view test2",
    "address-family ipv6",
    "redistribute connected",
    "end",
  ]);

  testHelper.sleep(2000);
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test1", "i1::/64");
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test1", "i2::/64");
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test2", "i1::/64");
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test2", "i2::/64");

  testHelper.ExecConfigDutB([
    "configure terminal",
    "router bgp 100 view test1",
    "address-family ipv6",
    "no redistribute connected",
    "end",
  ]);

  testHelper.sleep(2000);
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test1", "i1::/64", true);
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test1", "i2::/64", true);
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test2", "i1::/64");
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test2", "i2::/64");

  testHelper.ExecConfigDutB([
    "configure terminal",
    "router bgp 200 view test2",
    "address-family ipv6",
    "no redistribute connected",
    "end",
  ]);

  testHelper.sleep(2000);
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test1", "i1::/64", true);
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test1", "i2::/64", true);
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test2", "i1::/64", true);
  testHelper.ExecRetMatchDutA("show bgp ipv6 view test2", "i2::/64", true);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router bgp 100 view test1",
    "no router bgp 200 view test2",
    "no ipv6 enable",
    "no router-id",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "switchport",
    "exit",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no router bgp 100 view test1",
    "no router bgp 200 view test2",
    "no ip route 100.100.100.0/24",
    "no ipv6 enable",
    "no router-id",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
