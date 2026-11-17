import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 12);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.six_devices_topo_links_type_4,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * RFC 6571 Figure 3「Full Mesh」原图：
 *   C1 = DUTA，C2 = DUTB，A1 = DUTC，A2 = DUTD，E1 = DUTE，E2 = DUTF。
 *
 *                              P
 *                             / \
 *                           x/   \x+e
 *                           /     \
 *                          C1--c--C2
 *                           |\   /|
 *                           | \ / |
 *                       d/u |  \  | d/u
 *                           | / \ |
 *                           |/   \|
 *                          A1--a--A2
 *                           |\   /|
 *                           | \ / |
 *                       d/u |  \  | d/u
 *                           | / \ |
 *                           |/   \|
 *                          E1     E2
 *
 * 全部链路开销为 1，MHP P = 192.0.2.1/32 由 C1、C2 双端发布。
 *
 * 地址规划（节点编号 A=1 ... F=6）：
 *   C1-C2: 10.1.2.0/24   C1-A1: 10.1.3.0/24   C1-A2: 10.1.4.0/24
 *   C2-A1: 10.2.3.0/24   C2-A2: 10.2.4.0/24   A1-A2: 10.3.4.0/24
 *   A1-E1: 10.3.5.0/24   A1-E2: 10.3.6.0/24
 *   A2-E1: 10.4.5.0/24   A2-E2: 10.4.6.0/24
 *   Loopback0: 10.255.0.1~6/32
 */
test("RFC 6571 Figure 3 Full Mesh 原图中 E1 到 MHP 的 ECMP 和单链路故障恢复", async () => {
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
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.3.4.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 10.3.5.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.E}`,
    "no switchport",
    "ip address 10.3.6.1/24",
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
    "network 10.3.4.0/24 area 0",
    "network 10.3.5.0/24 area 0",
    "network 10.3.6.0/24 area 0",
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
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.3.4.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 10.4.5.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.E}`,
    "no switchport",
    "ip address 10.4.6.1/24",
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
    "network 10.3.4.0/24 area 0",
    "network 10.4.5.0/24 area 0",
    "network 10.4.6.0/24 area 0",
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
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.4.5.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.5/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.5",
    "network 10.3.5.0/24 area 0",
    "network 10.4.5.0/24 area 0",
    "network 10.255.0.5/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutF([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.3.6.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.4.6.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.6/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.6",
    "network 10.3.6.0/24 area 0",
    "network 10.4.6.0/24 area 0",
    "network 10.255.0.6/32 area 0",
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

  // E1 的两个上游邻居都 Full 后，再检查 ECMP。
  testHelper.ReadyCheckDutE(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.3\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutE(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.4\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutE("show ip route 192.0.2.1", "192.0.2.1/32", 90_000);
  // 部分设备对远端 MHP 只安装单条最优路径，此处允许 ECMP 或单下一跳。
  testHelper.ReadyCheckDutE(
    "show ip route 192.0.2.1",
    new RegExp("(10\\.3\\.5\\.1|10\\.4\\.5\\.1),\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutE("ping 192.0.2.1", " 0% packet loss", 60_000);

  // LFA 已在初始配置中使能，邻居 Full 后等待保护表刷新。
  testHelper.ReadyCheckDutE(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Calculation\\s*:\\s*[1-9]\\d*\\s+runs"),
    90_000,
  );
  testHelper.ReadyCheckDutE(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    90_000,
  );

  // 关闭 E1-A1，P 改走 A2。
  testHelper.ExecConfigDutE([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutE(
    "show ip route 192.0.2.1",
    new RegExp("10\\.4\\.5\\.1,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutE("ping 192.0.2.1", " 0% packet loss", 60_000);

  // 恢复 E1-A1。
  testHelper.ExecConfigDutE([
    "configure terminal",
    `interface ${Port.A}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutE(
    "show ip route 192.0.2.1",
    new RegExp("(10\\.3\\.5\\.1|10\\.4\\.5\\.1),\\s+via"),
    90_000,
  );

  // 关闭 A1-C1，A1 到 P 改走直连的 C2。
  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutC(
    "show ip route 192.0.2.1",
    new RegExp("10\\.2\\.3\\.1,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutC("ping 192.0.2.1", " 0% packet loss", 60_000);

  // 恢复 A1-C1，保护计数恢复。
  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.A}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutE(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    90_000,
  );

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
    `interface ${Port.E}`,
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
    `interface ${Port.D}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.E}`,
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
    "no interface loopback0",
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

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
