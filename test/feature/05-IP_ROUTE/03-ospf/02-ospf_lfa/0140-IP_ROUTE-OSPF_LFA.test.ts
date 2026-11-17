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
 * RFC 6571 Figure 3「Full Mesh」的 OSPF 等价拓扑：
 *   DUTA/DUTB/DUTC/DUTD 四台设备两两全互联，共 6 条链路，全部开销 1。
 *
 *   全互联拓扑中任意单条链路故障都不会造成目的不可达：
 *   A 到 C 的主路径为直连 A-C，备份路径可以是 A-B-C 或 A-D-C；
 *   A 到 B、A 到 D 同样存在至少一条绕行路径。
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
 *   A-C: 10.0.13.0/24  A=.1 C=.2
 *   A-D: 10.0.14.0/24  A=.1 D=.2
 *   B-C: 10.0.23.0/24  B=.1 C=.2
 *   B-D: 10.0.24.0/24  B=.1 D=.2
 *   C-D: 10.0.34.0/24  C=.1 D=.2
 *   Loopback0: A=1.1.1.1/32  B=2.2.2.2/32  C=3.3.3.3/32  D=4.4.4.4/32
 *
 * 说明：本用例在初始 OSPF 配置中使能 LFA。
 */
test("RFC 6571 Full Mesh 拓扑中所有目的前缀均有 LFA，单链路故障后仍可达", async () => {
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
    "fast-reroute per-prefix enable",
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
    "ip address 10.0.34.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 3.3.3.3/32",
    "exit",
    "router ospf",
    "network 10.0.13.0/24 area 0",
    "network 10.0.23.0/24 area 0",
    "network 10.0.34.0/24 area 0",
    "network 3.3.3.3/32 area 0",
    "fast-reroute per-prefix enable",
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
    "ip address 10.0.34.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 4.4.4.4/32",
    "exit",
    "router ospf",
    "network 10.0.14.0/24 area 0",
    "network 10.0.24.0/24 area 0",
    "network 10.0.34.0/24 area 0",
    "network 4.4.4.4/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 90_000);

  // 全互联要求 A 的三个直连邻居都 Full 后再校验直连主路径。
  for (const routerId of ["2\\.2\\.2\\.2", "3\\.3\\.3\\.3", "4\\.4\\.4\\.4"]) {
    testHelper.ReadyCheckDutA(
      "show ip ospf neighbor",
      new RegExp(`${routerId}\\s+\\d+\\s+Full`),
      90_000,
    );
  }

  // 等待 DUTA 到 B、C、D 的路由都出现，并逐个确认三个邻居均已 Full，
  // 再使能 LFA，确保保护表按最终拓扑计算。
  testHelper.ReadyCheckDutA("show ip ospf route", "2.2.2.2/32", 90_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "3.3.3.3/32", 90_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "4.4.4.4/32", 90_000);
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

  testHelper.ReadyCheckDutA("show ip ospf route", "2.2.2.2/32", 60_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "3.3.3.3/32", 60_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "4.4.4.4/32", 60_000);
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
  testHelper.ReadyCheckDutA(
    "show ip route 2.2.2.2",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 3.3.3.3",
    new RegExp("10\\.0\\.13\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 4.4.4.4",
    new RegExp("10\\.0\\.14\\.2,\\s+via"),
    60_000,
  );

  testHelper.ReadyCheckDutA("ping 2.2.2.2", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutA("ping 4.4.4.4", " 0% packet loss", 60_000);

  // 关闭 A-C 直连链路，A 到 C 改走 A-B-C 或 A-D-C，目的仍可达。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 3.3.3.3",
    new RegExp("10\\.0\\.(?:12|14)\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf route",
    new RegExp("3\\.3\\.3\\.3/32[\\s\\S]*?via 10\\.0\\.(?:12|14)\\.2"),
    60_000,
  );
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutA("ping 2.2.2.2", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutA("ping 4.4.4.4", " 0% packet loss", 60_000);

  // 恢复 A-C 直连链路，路由回到直连主路径。
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
