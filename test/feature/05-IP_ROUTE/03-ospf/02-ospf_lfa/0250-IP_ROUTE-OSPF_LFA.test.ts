import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.five_devices_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * RFC 8518 Figure 3「Link with IGP MAX_METRIC」原图：
 *   S = DUTA，N1 = DUTB，N2 = DUTC，D1 = DUTD，D2 = DUTE。
 *
 *     S ----10---- N1 ----10---- D1
 *     |                          |
 *    10（S->N2）               10 |
 *     |                          |
 *     +-------- N2 --------------+
 *               |
 *              10
 *               |
 *              D2
 *
 * S-N2 链路在 N2->S 方向配置 MAX_METRIC（65535），S->N2 方向仍为 10。
 * 按 RFC 8518 5.1：N2 到 D1 的无环条件满足时，即使反向开销为 MAX_METRIC，
 * 该链路仍可作为 D1 的候选 LFA。
 *
 * 地址规划：
 *   S-N1: 10.1.2.0/24   S=.1 N1=.2
 *   N1-D1: 10.2.4.0/24  N1=.1 D1=.2
 *   S-N2: 10.1.3.0/24   S=.1 N2=.2
 *   N2-D1: 10.3.4.0/24  N2=.1 D1=.2
 *   N2-D2: 10.3.5.0/24  N2=.1 D2=.2
 *   Loopback0: 10.255.0.1~5/32
 */
test("RFC 8518 Figure 3 中反向 MAX_METRIC 链路仍可作为 D1 的候选 LFA", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.1.2.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.1.3.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.1/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.1",
    "network 10.1.2.0/24 area 0",
    "network 10.1.3.0/24 area 0",
    "network 10.255.0.1/32 area 0",
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
    "ip ospf cost 10",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.2.4.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.2/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.2",
    "network 10.1.2.0/24 area 0",
    "network 10.2.4.0/24 area 0",
    "network 10.255.0.2/32 area 0",
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
    "ip ospf cost 65535",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.3.4.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.3.5.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.3/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.3",
    "network 10.1.3.0/24 area 0",
    "network 10.3.4.0/24 area 0",
    "network 10.3.5.0/24 area 0",
    "network 10.255.0.3/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutD([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.2.4.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.3.4.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.4/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.4",
    "network 10.2.4.0/24 area 0",
    "network 10.3.4.0/24 area 0",
    "network 10.255.0.4/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutE([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.3.5.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.5/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.5",
    "network 10.3.5.0/24 area 0",
    "network 10.255.0.5/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutE("show ip ospf neighbor", "Full", 90_000);

  // S 到 D1 的主路径经 N1。
  testHelper.ReadyCheckDutA(
    "show ip route 10.255.0.4",
    "10.255.0.4/32",
    60_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 10.255.0.4",
    new RegExp("10\\.1\\.2\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA("ping 10.255.0.4", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutA("ping 10.255.0.5", " 0% packet loss", 60_000);

  // LFA 已在初始配置中使能，邻居 Full 后等待保护表刷新。
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Calculation\\s*:\\s*[1-9]\\d*\\s+runs"),
    60_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );

  // 故障前记录 N2 的反向 MAX_METRIC 配置和 D1 的主路径。
  testHelper.ExecRetMatchDutC(`show running-config interface ${Port.A}`, [
    "ip ospf cost 65535",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 10.255.0.4",
    new RegExp("10\\.1\\.2\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA("ping 10.255.0.5", " 0% packet loss", 60_000);

  // 关闭 S-N1，D1 改走 N2。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 10.255.0.4",
    new RegExp("10\\.1\\.3\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA("ping 10.255.0.4", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutA("ping 10.255.0.5", " 0% packet loss", 60_000);

  // 恢复 S-N1，主路径和保护计数恢复。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 10.255.0.4",
    new RegExp("10\\.1\\.2\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );
  testHelper.ReadyCheckDutA("ping 10.255.0.4", " 0% packet loss", 60_000);

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
    "no interface loopback0",
    "end",
  ]);

  testHelper.CleanConfigDutE([
    "configure terminal",
    "no router ospf",
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
