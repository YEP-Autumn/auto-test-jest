import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 15);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.nine_devices_topo_links_type_4,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * RFC 5286 Appendix A / Figure 7 的 9 台等价裁剪：
 *   S = DUTA，N = DUTB，A（ABR）= DUTC，F（area 2 转接）= DUTD，
 *   B（ABR）= DUTE，ASBR = DUTK，E = DUTG，X = DUTH。
 *
 * Area 1：
 *   S-N 40，N-A 5，A-ASBR 35，S-E 5，E-X 5，X-ASBR 5，B-S 5
 * Area 2：
 *   A-F 5，F-B 5，B-ASBR 22
 * Backbone：
 *   A-B 100
 *
 * 关键路径：
 *   S -> ASBR          : area 1，经 E-X，开销 15
 *   N -> ASBR          : area 1，经 A，开销 5 + 35 = 40
 *   A -> ASBR          : area 2，经 F-B，开销 5 + 5 + 22 = 32 < 35
 *   B -> ASBR          : area 1，经 S-E-X，开销 20 < 22
 *   F -> ASBR          : area 2，经 B，开销 5 + 22 = 27
 *
 * 因此 A 的流量会离开 area 1 进入 area 2，再经 B 回到 area 1 的 S，
 * 形成 RFC 5286 描述的“区域穿越”路径。
 *
 * 地址规划（节点编号 A=1 ... H=8，K 作为 ASBR）：
 *   S-N: 10.1.2.0/24    N-A: 10.2.3.0/24    A-ASBR(area1): 10.3.6.0/24
 *   S-E: 10.1.7.0/24    E-X: 10.7.8.0/24    X-ASBR: 10.8.6.0/24
 *   B-S: 10.1.5.0/24    A-F(area2): 10.3.4.0/24
 *   F-B(area2): 10.4.5.0/24                B-ASBR(area2): 10.5.6.0/24
 *   A-B(backbone): 10.3.5.0/24
 *   Loopback0: 10.255.0.1~8/32
 *   外部前缀：198.51.100.1/32（ASBR 用 redistribute connected 发布）
 */
test("RFC 5286 Figure 7 等价拓扑中 LFA 候选 N 的路径经区域穿越回到 S", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.1.2.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 40",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.1.7.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.1.5.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.1/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.1",
    "network 10.1.2.0/24 area 1",
    "network 10.1.7.0/24 area 1",
    "network 10.1.5.0/24 area 1",
    "network 10.255.0.1/32 area 1",
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
    "ip ospf cost 40",
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
    "network 10.1.2.0/24 area 1",
    "network 10.2.3.0/24 area 1",
    "network 10.255.0.2/32 area 1",
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
    "ip address 10.3.6.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 35",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.3.4.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 10.3.5.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 100",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.3/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.3",
    "network 10.2.3.0/24 area 1",
    "network 10.3.6.0/24 area 1",
    "network 10.3.4.0/24 area 2",
    "network 10.3.5.0/24 area 0",
    "network 10.255.0.3/32 area 1",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutD([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.3.4.2/24",
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
    "network 10.3.4.0/24 area 2",
    "network 10.4.5.0/24 area 2",
    "network 10.255.0.4/32 area 2",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutE([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.1.5.1/24",
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
    "ip ospf cost 22",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 10.3.5.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 100",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.5/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.5",
    "network 10.1.5.0/24 area 1",
    "network 10.4.5.0/24 area 2",
    "network 10.5.6.0/24 area 2",
    "network 10.3.5.0/24 area 0",
    "network 10.255.0.5/32 area 1",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutK([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.3.6.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 35",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.8.6.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.5.6.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 22",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.6/32",
    "exit",
    "interface loopback1",
    "ip address 198.51.100.1/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.6",
    "network 10.3.6.0/24 area 1",
    "network 10.8.6.0/24 area 1",
    "network 10.5.6.0/24 area 2",
    "network 10.255.0.6/32 area 2",
    "redistribute connected metric 20 metric-type 2",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutG([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.1.7.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.7.8.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.7/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.7",
    "network 10.1.7.0/24 area 1",
    "network 10.7.8.0/24 area 1",
    "network 10.255.0.7/32 area 1",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutH([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.7.8.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.8.6.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.8/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.8",
    "network 10.7.8.0/24 area 1",
    "network 10.8.6.0/24 area 1",
    "network 10.255.0.8/32 area 1",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutE("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutK("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutG("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutH("show ip ospf neighbor", "Full", 120_000);

  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.2\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.5\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.7\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutB(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.3\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutC(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.6\\s+\\d+\\s+Full"),
    120_000,
  );

  // ASBR 外部前缀存在，且 S 的主路径经 E。
  testHelper.ReadyCheckDutA(
    "show ip ospf route",
    new RegExp("E2\\s+198\\.51\\.100\\.1/32"),
    120_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 198.51.100.1",
    new RegExp("10\\.1\\.7\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA("ping 198.51.100.1", " 0% packet loss", 60_000);

  // 记录区域穿越链路：N->A、A->F(area2)、B->S、F->B。
  testHelper.ReadyCheckDutB(
    "show ip route 198.51.100.1",
    new RegExp("10\\.2\\.3\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutC(
    "show ip route 198.51.100.1",
    new RegExp("10\\.3\\.4\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutE(
    "show ip route 198.51.100.1",
    new RegExp("10\\.1\\.5\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutD(
    "show ip route 198.51.100.1",
    new RegExp("10\\.4\\.5\\.2,\\s+via"),
    60_000,
  );

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

  // 关闭 S-E，主路径失效，收敛后经 N 或 B 绕行。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 198.51.100.1",
    new RegExp("(10\\.1\\.5\\.2|10\\.1\\.2\\.2),\\s+via"),
    120_000,
  );
  testHelper.ReadyCheckDutA("ping 198.51.100.1", " 0% packet loss", 90_000);

  // 恢复 S-E，主路径和保护计数恢复。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 198.51.100.1",
    new RegExp("10\\.1\\.7\\.2,\\s+via"),
    120_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );
  testHelper.ReadyCheckDutA("ping 198.51.100.1", " 0% packet loss", 60_000);

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

  testHelper.CleanConfigDutK([
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
    "end",
  ]);

  testHelper.CleanConfigDutH([
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
