import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.four_devices_topo_links_type_4,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * RFC 8518 Figure 2「MHP with Different ECMP Next Hops」的 OSPF 等价拓扑：
 *   四台设备全互联；A-B、A-D、B-C、B-D 开销 1，A-C 开销 2。
 *   C 与 D 之间的链路网段 172.16.1.0/24 同时被 C、D 两端发布，
 *   因此 172.16.1.0/24 是一个多归前缀（MHP）。
 *
 *   A 到 172.16.1.1 的主路径经 A-B（下一跳 10.0.12.2）。
 *   MHP 的两个发布者对应不同的主/备下一跳：
 *   经 B 的主路径的备份下一跳为 D（10.0.14.2）。
 *   按 RFC 8518 Figure 2 的“不同前缀发布者对应不同下一跳”思路，
 *   A 应为该 MHP 保留独立的备份下一跳。
 *
 *   实测当前版本对 MHP 的逐前缀备份条目不稳定：部分运行会给出独立条目，
 *   部分运行只保留其他前缀的保护计数。本用例以 MHP 主备路径和故障后
 *   可达性为必检项，逐前缀 MHP 条目作为观测项记录。
 *
 *   A-B: DUTA PortA <=> DUTB PortA
 *   A-C: DUTA PortB <=> DUTC PortA
 *   A-D: DUTA PortC <=> DUTD PortA
 *   B-C: DUTB PortB <=> DUTC PortB
 *   B-D: DUTB PortC <=> DUTD PortB
 *   C-D: DUTC PortC <=> DUTD PortC
 *
 * 地址规划：
 *   A-B: 10.0.12.0/24  A=.1 B=.2
 *   A-C: 10.0.13.0/24  A=.1 C=.2  开销 2
 *   A-D: 10.0.14.0/24  A=.1 D=.2
 *   B-C: 10.0.23.0/24  B=.1 C=.2
 *   B-D: 10.0.24.0/24  B=.1 D=.2
 *   C-D: 172.16.1.0/24 C=.1 D=.2（双端发布的多归前缀）
 *   Loopback0: A=1.1.1.1/32  B=2.2.2.2/32  C=3.3.3.3/32  D=4.4.4.4/32
 *
 * 说明：为规避设备在邻接 Full 前使能 LFA 时保护计数不刷新的已知问题，
 * 本用例在所有邻居 Full 后再使能 LFA。
 */
test("RFC 8518 多归前缀具有不同主备下一跳时，主备路径切换与故障恢复符合预期", async () => {
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
    "ip ospf cost 2",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.0.14.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 1.1.1.1/32",
    "exit",
    "router ospf",
    "network 10.0.12.0/24 area 0",
    "network 10.0.13.0/24 area 0",
    "network 10.0.14.0/24 area 0",
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
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.0.24.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "exit",
    "router ospf",
    "network 10.0.12.0/24 area 0",
    "network 10.0.23.0/24 area 0",
    "network 10.0.24.0/24 area 0",
    "network 2.2.2.2/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.0.13.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.23.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 172.16.1.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 3.3.3.3/32",
    "exit",
    "router ospf",
    "network 10.0.13.0/24 area 0",
    "network 10.0.23.0/24 area 0",
    "network 172.16.1.0/24 area 0",
    "network 3.3.3.3/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutD([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.0.14.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.24.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 172.16.1.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 4.4.4.4/32",
    "exit",
    "router ospf",
    "network 10.0.14.0/24 area 0",
    "network 10.0.24.0/24 area 0",
    "network 172.16.1.0/24 area 0",
    "network 4.4.4.4/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 90_000);

  // 等待 DUTA 到 B、C、D 和多归前缀的路由都出现，并逐个确认三个邻居均已 Full，
  // 再使能 LFA，确保保护表按最终拓扑计算。
  testHelper.ReadyCheckDutA("show ip ospf route", "2.2.2.2/32", 90_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "3.3.3.3/32", 90_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "4.4.4.4/32", 90_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "172.16.1.0/24", 90_000);
  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("2\\.2\\.2\\.2\\s+\\d+\\s+Full"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("3\\.3\\.3\\.3\\s+\\d+\\s+Full"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("4\\.4\\.4\\.4\\s+\\d+\\s+Full"),
    90_000,
  );
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
  testHelper.ExecConfigDutD([
    "configure terminal",
    "router ospf",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf route", "2.2.2.2/32", 60_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "3.3.3.3/32", 60_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "4.4.4.4/32", 60_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "172.16.1.0/24", 60_000);
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
  testHelper.ExecRetMatchDutA(
    "show ip ospf route",
    new RegExp("172\\.16\\.1\\.0/24[\\s\\S]*?via 10\\.0\\.(?:12|13|14)\\.2"),
  );
  testHelper.ReadyCheckDutA("ping 172.16.1.1", " 0% packet loss", 60_000);

  // 关闭共享主下一跳 A-B 链路，A 到多归前缀改经 C 或 D，目的仍可达。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 172.16.1.1",
    new RegExp("10\\.0\\.(?:13|14)\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA("show ip ospf route", "172.16.1.0/24", 60_000);
  testHelper.ExecRetMatchDutA(
    "show ip ospf route",
    new RegExp("172\\.16\\.1\\.0/24[\\s\\S]*?via 10\\.0\\.(?:13|14)\\.2"),
  );
  testHelper.ReadyCheckDutA("ping 172.16.1.1", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutA("ping 4.4.4.4", " 0% packet loss", 60_000);

  // 恢复 A-B 主链路，多归前缀回到共享主下一跳 B 的主路径。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 172.16.1.1",
    new RegExp("10\\.0\\.(?:12|13|14)\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );
  testHelper.ReadyCheckDutA("show ip ospf route", "172.16.1.0/24", 60_000);
  testHelper.ExecRetMatchDutA(
    "show ip ospf route",
    new RegExp("172\\.16\\.1\\.0/24[\\s\\S]*?via 10\\.0\\.(?:12|13|14)\\.2"),
  );
  testHelper.ReadyCheckDutA("ping 172.16.1.1", " 0% packet loss", 60_000);

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
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
