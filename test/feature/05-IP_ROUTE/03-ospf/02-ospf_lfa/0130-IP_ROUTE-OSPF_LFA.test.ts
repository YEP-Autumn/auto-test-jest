import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_3,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * RFC 6571 Figure 2「Triangle」的 OSPF 等价拓扑：
 *   C1 = DUTA，C2 = DUTB，E1 = DUTC。
 *   C1-C2、C1-E1、C2-E1 三条链路开销相同（1）。
 *
 *   A 到 C 的主路径为直连 A-C，备份路径为 A-B-C；
 *   邻居 B 满足 RFC 5286 Inequality 1：
 *   D_opt(B,C)=1 < D_opt(B,A)=1 + D_opt(A,C)=1 = 2。
 *   因此三角拓扑中 A-C 直连链路具备链路保护的 LFA。
 *
 *   链路矩阵（行 -> 列，值为本端端口-对端端口）：
 *
 *          DUTB          DUTC
 *   DUTA  PortA-PortA   PortB-PortB
 *   DUTB                PortB-PortA
 *
 *   拓扑形状（每一条边都是一对一的点对点链路）：
 *
 *        DUTA -------- DUTB
 *          \          /
 *           \        /
 *            \      /
 *             DUTC
 *
 * 地址规划：
 *   A-B: 10.0.12.0/24  A=.1 B=.2
 *   A-C: 10.0.13.0/24  A=.1 C=.2
 *   B-C: 10.0.23.0/24  B=.1 C=.2
 *   Loopback0: A=1.1.1.1/32  B=2.2.2.2/32  C=3.3.3.3/32
 *
 * 说明：拓扑中的 A PortC <=> C PortC 并行链路保持二层默认状态，不参与 OSPF。
 * 为规避设备在邻接 Full 前使能 LFA 时保护计数不刷新的已知问题，
 * 本用例在所有邻居 Full 后再使能 LFA。
 */
test("RFC 6571 Triangle 拓扑中直连链路故障后可通过第三条边恢复", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.0.12.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.13.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 1.1.1.1/32",
    "exit",
    "router ospf",
    "network 10.0.12.0/24 area 0",
    "network 10.0.13.0/24 area 0",
    "network 1.1.1.1/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.0.12.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.23.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "exit",
    "router ospf",
    "network 10.0.12.0/24 area 0",
    "network 10.0.23.0/24 area 0",
    "network 2.2.2.2/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.13.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.0.23.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 3.3.3.3/32",
    "exit",
    "router ospf",
    "network 10.0.13.0/24 area 0",
    "network 10.0.23.0/24 area 0",
    "network 3.3.3.3/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 90_000);

  // 等待 DUTA 到 B、C 的路由都出现，确认两个邻居均已 Full，
  // 再使能 LFA，确保保护表按最终拓扑计算。
  testHelper.ReadyCheckDutA("show ip ospf route", "2.2.2.2/32", 90_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "3.3.3.3/32", 90_000);
  testHelper.ExecConfigDutA([
    "configure terminal",
    "router ospf",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);
  testHelper.ExecConfigDutB([
    "configure terminal",
    "router ospf",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);
  testHelper.ExecConfigDutC([
    "configure terminal",
    "router ospf",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

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
    "via 10.0.13.2",
  ]);

  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  // 关闭 A-C 直连链路，主路径切换到三角形第三条边 A-B-C。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 3.3.3.3",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    60_000,
  );
  testHelper.ExecRetMatchDutA("show ip ospf route", [
    "3.3.3.3/32",
    "via 10.0.12.2",
  ]);
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  // 恢复 A-C 直连链路，路由回到直连主路径，LFA 保护计数恢复。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 3.3.3.3",
    new RegExp("10\\.0\\.13\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );
  testHelper.ExecRetMatchDutA("show ip ospf route", [
    "3.3.3.3/32",
    "via 10.0.13.2",
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
    `interface ${Port.A}`,
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
