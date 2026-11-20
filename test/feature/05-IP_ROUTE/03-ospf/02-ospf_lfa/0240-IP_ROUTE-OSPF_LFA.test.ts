import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 12);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.seven_devices_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * RFC 8518 Figure 1「MHP with Same ECMP Next Hop」原图：
 *   S = DUTA，A = DUTB，B = DUTC，C = DUTD，E = DUTE，M = DUTF，F = DUTG。
 *
 *                        5   +---+  8   +---+  5  +---+
 *                      +-----| S |------| A |-----| B |
 *                      |     +---+      +---+     +---+
 *                      |       |                    |
 *                      |     5 |                  5 |
 *                      |       |                    |
 *                    +---+ 5 +---+   4 +---+  1    +---+
 *                    | C |---| E |-----| M |-------| F |
 *                    +---+   +---+     +---+       +---+
 *                              |   10           5    |
 *                              +-----------P---------+
 *
 * P 由 E 和 F 同时发布，E-P 开销 10、F-P 开销 5：
 *   S-E-P   = 5 + 10 = 15
 *   S-E-M-F-P = 5 + 4 + 1 + 5 = 15
 * 两个发布者共享同一个主下一跳 E，用于验证 RFC 8518 3.1 的“同主下一跳 MHP”。
 *
 * 地址规划（节点编号 A=1 ... G=7）：
 *   S-A:  10.1.2.0/24   S=.1 A=.2   开销 8
 *   S-C:  10.1.4.0/24   S=.1 C=.2   开销 5
 *   S-E:  10.1.5.0/24   S=.1 E=.2   开销 5
 *   A-B:  10.2.3.0/24   A=.1 B=.2   开销 5
 *   B-F:  10.3.7.0/24   B=.1 F=.2   开销 5
 *   C-E:  10.4.5.0/24   C=.1 E=.2   开销 5
 *   E-M:  10.5.6.0/24   E=.1 M=.2   开销 4
 *   M-F:  10.6.7.0/24   M=.1 F=.2   开销 1
 *   Loopback0: 10.255.0.1~7/32
 *   MHP P: 192.0.2.1/32（E、F 双端发布）
 */
test("RFC 8518 Figure 1 中共享同一主下一跳的 MHP 在主链路故障后保持可达", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.1.2.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 8",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.1.4.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.1.5.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.1/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.1",
    "network 10.1.2.0/24 area 0",
    "network 10.1.4.0/24 area 0",
    "network 10.1.5.0/24 area 0",
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
    "ip ospf cost 8",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.2.3.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.2/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.2",
    "network 10.1.2.0/24 area 0",
    "network 10.2.3.0/24 area 0",
    "network 10.255.0.2/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.2.3.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.3.7.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.3/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.3",
    "network 10.2.3.0/24 area 0",
    "network 10.3.7.0/24 area 0",
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
    "ip ospf cost 5",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.4.5.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.4/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.4",
    "network 10.1.4.0/24 area 0",
    "network 10.4.5.0/24 area 0",
    "network 10.255.0.4/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutE([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.1.5.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.4.5.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.5.6.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 4",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.5/32",
    "exit",
    "interface loopback1",
    "ip address 192.0.2.1/32",
    "ip ospf cost 10",
    "no shutdown",
    "exit",
    "router ospf",
    "router-id 10.255.0.5",
    "network 10.1.5.0/24 area 0",
    "network 10.4.5.0/24 area 0",
    "network 10.5.6.0/24 area 0",
    "network 10.255.0.5/32 area 0",
    "network 192.0.2.1/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutF([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.5.6.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 4",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.6.7.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.6/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.6",
    "network 10.5.6.0/24 area 0",
    "network 10.6.7.0/24 area 0",
    "network 10.255.0.6/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutG([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.3.7.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.6.7.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.7/32",
    "exit",
    "ip route 192.0.2.1/32 10.6.7.1",
    "router ospf",
    "router-id 10.255.0.7",
    "network 10.3.7.0/24 area 0",
    "network 10.6.7.0/24 area 0",
    "network 10.255.0.7/32 area 0",
    "redistribute static metric 5 metric-type 2",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutE("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutF("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutG("show ip ospf neighbor", "Full", 120_000);

  // S 到 P 的主下一跳是 E，E 与 F 两个发布者共享该下一跳。
  testHelper.ReadyCheckDutA("show ip route 192.0.2.1", "192.0.2.1/32", 90_000);
  testHelper.ReadyCheckDutA(
    "show ip route 192.0.2.1",
    new RegExp("10\\.1\\.5\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA("ping 192.0.2.1", " 0% packet loss", 60_000);

  // LFA 已在初始配置中使能，邻居 Full 后等待保护表刷新。
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Calculation\\s*:\\s*[1-9]\\d*\\s+runs"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    90_000,
  );

  // 关闭 S-E 主路径，P 改走 C-E-M-F。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.C}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 192.0.2.1",
    new RegExp("10\\.1\\.4\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA("ping 192.0.2.1", " 0% packet loss", 60_000);

  // 恢复 S-E，P 回到共享主下一跳 E。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.C}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 192.0.2.1",
    new RegExp("10\\.1\\.5\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );
  testHelper.ReadyCheckDutA("ping 192.0.2.1", " 0% packet loss", 60_000);

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

  testHelper.CleanConfigDutF([
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

  testHelper.CleanConfigDutG([
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
    "no ip route 192.0.2.1/32 10.6.7.1",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
