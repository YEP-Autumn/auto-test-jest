import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.four_devices_topo_links_type_3,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * RFC 5286 Figure 1「Basic Topology」的 OSPF 等价拓扑：
 *   S = DUTA，E = DUTB，D = DUTC，N1 = DUTD。
 *
 *   S 到 D 的主路径为 S-E-D（5 + 4 = 9），
 *   备份路径为 S-N1-D（8 + 3 = 11），N1 满足 RFC 5286 Inequality 1：
 *   D_opt(N1,D)=3 < D_opt(N1,S)=8 + D_opt(S,D)=9。
 *
 *    +--------+  5   +--------+
 *    |  DUTA  |------|  DUTB  |
 *    |   S    |      |   E    |
 *    +--------+      +--------+
 *        | 8              | 4
 *        |                |
 *    +--------+  3   +--------+
 *    |  DUTD  |------|  DUTC  |
 *    |   N1   |      |   D    |
 *    +--------+      +--------+
 *
 * 地址规划：
 *   S-E   (A-B): 10.0.12.0/24  A=.1 B=.2  开销 5
 *   E-D   (B-C): 10.0.23.0/24  B=.1 C=.2  开销 4
 *   D-N1  (C-D): 10.0.34.0/24  C=.1 D=.2  开销 3
 *   N1-S  (D-A): 10.0.41.0/24  D=.1 A=.2  开销 8
 *   Loopback0: A=1.1.1.1/32  B=2.2.2.2/32  C=3.3.3.3/32  D=4.4.4.4/32
 *
 * 说明：本用例在初始 OSPF 配置中使能 LFA，使拓扑与无环不等式成为唯一变量。
 */
test("RFC 5286 Figure 1 基本拓扑中 N1 满足无环不等式并可作为 LFA", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.0.12.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 10.0.41.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 8",
    "exit",
    "interface loopback0",
    "ip address 1.1.1.1/32",
    "exit",
    "router ospf",
    "network 10.0.12.0/24 area 0",
    "network 10.0.41.0/24 area 0",
    "network 1.1.1.1/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.0.12.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.23.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 4",
    "exit",
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "exit",
    "router ospf",
    "network 10.0.12.0/24 area 0",
    "network 10.0.23.0/24 area 0",
    "network 2.2.2.2/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.23.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 4",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.0.34.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 3",
    "exit",
    "interface loopback0",
    "ip address 3.3.3.3/32",
    "exit",
    "router ospf",
    "network 10.0.23.0/24 area 0",
    "network 10.0.34.0/24 area 0",
    "network 3.3.3.3/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutD([
    "configure terminal",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.0.34.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 3",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 10.0.41.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 8",
    "exit",
    "interface loopback0",
    "ip address 4.4.4.4/32",
    "exit",
    "router ospf",
    "network 10.0.34.0/24 area 0",
    "network 10.0.41.0/24 area 0",
    "network 4.4.4.4/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 90_000);

  // 等待 DUTA 到 C（经 B）和到 D 的路由都出现，确认两个邻居均已 Full，
  // 再使能 LFA，确保保护表按最终拓扑计算。
  testHelper.ReadyCheckDutA("show ip ospf route", "3.3.3.3/32", 90_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "4.4.4.4/32", 90_000);

  testHelper.ReadyCheckDutA("show ip ospf route", "3.3.3.3/32", 60_000);
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );

  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    "Area 0.0.0.0",
    new RegExp("Fast-reroute per-prefix\\s*:\\s*enabled"),
    new RegExp("Intra-area prefixes\\s*:\\s*[1-9]\\d*"),
    new RegExp("Protected by LFA\\s*:\\s*[1-9]\\d*"),
  ]);
  testHelper.ExecRetMatchDutA("show ip ospf route", [
    "3.3.3.3/32",
    "via 10.0.12.2",
  ]);

  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  // 主链路 S-E 故障：LFA 经 N1 转发，路由最终收敛到 S-N1-D。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 3.3.3.3",
    new RegExp("10\\.0\\.41\\.1,\\s+via"),
    60_000,
  );
  testHelper.ExecRetMatchDutA("show ip ospf route", [
    "3.3.3.3/32",
    "via 10.0.41.1",
  ]);
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  // 恢复主链路，路由回到 S-E-D，LFA 保护计数恢复。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 3.3.3.3",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );
  testHelper.ExecRetMatchDutA("show ip ospf route", [
    "3.3.3.3/32",
    "via 10.0.12.2",
  ]);
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

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
    `interface ${Port.D}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    "no interface loopback0",
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
    "no interface loopback0",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    "no router ospf",
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
    "end",
  ]);

  testHelper.CleanConfigDutD([
    "configure terminal",
    "no router ospf",
    `interface ${Port.C}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.D}`,
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
