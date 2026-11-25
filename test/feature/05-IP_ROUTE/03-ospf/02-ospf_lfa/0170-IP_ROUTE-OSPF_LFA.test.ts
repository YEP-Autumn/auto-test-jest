import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.four_devices_topo_links_type_5,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * RFC 6571 Figure 2「Triangle」原图：
 *   C1 = DUTA，C2 = DUTB，E1 = DUTC，E2 = DUTD。
 *
 *   C1-C2、C1-E1、C2-E1、C1-E2、C2-E2 五条链路开销均为 1。
 *   P 是 C1/C2 双端发布的同一前缀（192.0.2.1/32），
 *   用于验证 RFC 6571 Triangle 的 MHP 和链路保护行为。
 *
 *        C1 = DUTA ---- DUTB = C2
 *          | \          / |
 *          |   \      /   |
 *          |     \  /     |
 *          |     /  \     |
 *          |   /      \   |
 *          | /          \ |
 *        E1 = DUTC ---- DUTD = E2
 *
 * 地址规划：
 *   C1-C2: 10.1.2.0/24  C1=.1 C2=.2
 *   C1-E1: 10.1.3.0/24  C1=.1 E1=.2
 *   C2-E1: 10.2.3.0/24  C2=.1 E1=.2
 *   C1-E2: 10.1.4.0/24  C1=.1 E2=.2
 *   C2-E2: 10.2.4.0/24  C2=.1 E2=.2
 *   Loopback0: 10.255.0.1~4/32
 *   MHP P: 192.0.2.1/32（C1、C2 双端发布）
 *
 * 说明：C1、C2 上 192.0.2.1/32 是 anycast/MHP，必须显式配置 router-id，
 * 避免 OSPF 用最高 loopback 地址选到重复 Router ID。
 * 本用例在初始 OSPF 配置中使能 LFA。
 */
test("RFC 6571 Triangle 原图中 MHP 和链路保护在单链路故障后保持可达", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.1.2.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.1.3.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.1.4.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.1/32",
    "exit",
    "interface loopback1",
    "ip address 192.0.2.1/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.1",
    "network 10.1.2.0/24 area 0",
    "network 10.1.3.0/24 area 0",
    "network 10.1.4.0/24 area 0",
    "network 10.255.0.1/32 area 0",
    "network 192.0.2.1/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.1.2.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.2.3.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.2.4.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.2/32",
    "exit",
    "interface loopback1",
    "ip address 192.0.2.1/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.2",
    "network 10.1.2.0/24 area 0",
    "network 10.2.3.0/24 area 0",
    "network 10.2.4.0/24 area 0",
    "network 10.255.0.2/32 area 0",
    "network 192.0.2.1/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.1.3.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.2.3.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.3/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.3",
    "network 10.1.3.0/24 area 0",
    "network 10.2.3.0/24 area 0",
    "network 10.255.0.3/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutD([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.1.4.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.2.4.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.4/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.4",
    "network 10.1.4.0/24 area 0",
    "network 10.2.4.0/24 area 0",
    "network 10.255.0.4/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 90_000);

  // E1 的两个上游邻居 Full 后等待保护表刷新。
  testHelper.ReadyCheckDutC(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.1\\s+\\d+\\s+Full"),
    90_000,
  );
  testHelper.ReadyCheckDutC(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.2\\s+\\d+\\s+Full"),
    90_000,
  );
  testHelper.ReadyCheckDutD("show ip ospf route", "192.0.2.1/32", 90_000);

  testHelper.ReadyCheckDutC(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Calculation\\s*:\\s*[1-9]\\d*\\s+runs"),
    60_000,
  );
  testHelper.ReadyCheckDutC(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );

  testHelper.ExecRetMatchDutC("show ip ospf fast-reroute per-prefix", [
    "Area 0.0.0.0",
    new RegExp("Fast-reroute per-prefix\\s*:\\s*enabled"),
    new RegExp("Intra-area prefixes\\s*:\\s*[1-9]\\d*"),
    new RegExp("Protected by LFA\\s*:\\s*[1-9]\\d*"),
  ]);
  testHelper.ExecRetMatchDutC("show ip ospf route", [
    "192.0.2.1/32",
    "via 10.1.3.1",
    "via 10.2.3.1",
  ]);
  testHelper.ReadyCheckDutC("show ip ospf route", "10.255.0.4/32", 90_000);
  testHelper.ExecRetMatchDutC("show ip ospf route", [
    new RegExp(
      "10\\.255\\.0\\.4/32" +
        "(?=[\\s\\S]{0,200}?via 10\\.1\\.3\\.1)" +
        "(?=[\\s\\S]{0,200}?via 10\\.2\\.3\\.1)",
    ),
  ]);

  testHelper.ReadyCheckDutC("ping 192.0.2.1", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutC("ping 10.255.0.4", " 0% packet loss", 60_000);

  // 关闭 E1-C1，主路径切换到 E1-C2。
  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutC(
    "show ip route 192.0.2.1",
    new RegExp("10\\.2\\.3\\.1,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutC("show ip ospf route", "192.0.2.1/32", 60_000);
  testHelper.ExecRetMatchDutC("show ip ospf route", [
    "192.0.2.1/32",
    "via 10.2.3.1",
  ]);
  testHelper.ReadyCheckDutC("ping 192.0.2.1", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutC("ping 10.255.0.4", " 0% packet loss", 60_000);

  // 恢复 E1-C1，MHP 重新形成 ECMP，LFA 保护计数恢复。
  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.A}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutC(
    "show ip route 192.0.2.1",
    new RegExp("10\\.1\\.3\\.1,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutC(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );
  testHelper.ReadyCheckDutC("show ip ospf route", "192.0.2.1/32", 60_000);
  testHelper.ExecRetMatchDutC("show ip ospf route", [
    "192.0.2.1/32",
    "via 10.1.3.1",
    "via 10.2.3.1",
  ]);
  testHelper.ReadyCheckDutC("ping 192.0.2.1", " 0% packet loss", 60_000);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router ospf",
    `interface ${Port.A}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    "no interface loopback0",
    "no interface loopback1",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no router ospf",
    `interface ${Port.A}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    "no interface loopback0",
    "no interface loopback1",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    "no router ospf",
    `interface ${Port.A}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    "no interface loopback0",
    "end",
  ]);

  testHelper.CleanConfigDutD([
    "configure terminal",
    "no router ospf",
    `interface ${Port.A}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    "no interface loopback0",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
