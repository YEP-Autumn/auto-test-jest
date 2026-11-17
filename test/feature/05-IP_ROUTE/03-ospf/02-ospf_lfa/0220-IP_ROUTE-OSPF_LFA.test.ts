import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.six_devices_topo_links_type_3,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * RFC 8518 Figure 2「MHP with Different ECMP Next Hops」原图：
 *   S = DUTA，N1 = DUTB，N2 = DUTC，B = DUTD，E = DUTE，F = DUTF。
 *
 *   S 到 P 的两条路径：
 *     S-N1-E-P：10 + 5 + 5 = 20
 *     S-B-F-P： 3 + 1 + 16 = 20
 *   因此 P 在 S 上形成经 N1 和 B 的 ECMP。
 *
 *            S
 *          / | \
 *         /  |  \
 *       N1   N2  B
 *        \   /    \
 *         E------ F
 *
 * 地址规划：
 *   S-N2: 10.1.3.0/24  S=.1 N2=.2
 *   S-B:  10.1.4.0/24  S=.1 B=.2
 *   S-N1: 10.1.2.0/24  S=.1 N1=.2
 *   N1-E: 10.2.5.0/24  N1=.1 E=.2
 *   N2-B: 10.3.4.0/24  N2=.1 B=.2
 *   B-F:  10.4.6.0/24  B=.1 F=.2
 *   E-F:  10.5.6.0/24  E=.1 F=.2
 *   Loopback0: 10.255.0.1~6/32
 *   MHP P: 192.0.2.1/32（E、F 双端发布，E 侧 cost 5，F 侧 cost 16）
 *
 * 说明：E/F 上 192.0.2.1/32 是 anycast/MHP，必须显式配置 router-id。
 * 本用例在初始 OSPF 配置中使能 LFA。
 */
test("RFC 8518 Figure 2 原图中 MHP 的两个 ECMP 主下一跳在单路径故障后保持可达", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.1.3.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 4",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.1.4.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 3",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.1.2.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.1/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.1",
    "network 10.1.3.0/24 area 0",
    "network 10.1.4.0/24 area 0",
    "network 10.1.2.0/24 area 0",
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
    "ip address 10.2.5.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.2/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.2",
    "network 10.1.2.0/24 area 0",
    "network 10.2.5.0/24 area 0",
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
    "ip ospf cost 4",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.3.4.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 4",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.3/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.3",
    "network 10.1.3.0/24 area 0",
    "network 10.3.4.0/24 area 0",
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
    "ip ospf cost 3",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.3.4.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 4",
    "exit",
    `interface ${Port.C}`,
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
    "network 10.3.4.0/24 area 0",
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
    "ip address 10.2.5.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.5.6.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 16",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.5/32",
    "exit",
    "interface loopback1",
    "ip address 192.0.2.1/32",
    "ip ospf cost 5",
    "exit",
    "router ospf",
    "router-id 10.255.0.5",
    "network 10.2.5.0/24 area 0",
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
    "ip address 10.4.6.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.5.6.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 16",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.6/32",
    "exit",
    "interface loopback1",
    "ip address 192.0.2.1/32",
    "ip ospf cost 16",
    "exit",
    "router ospf",
    "router-id 10.255.0.6",
    "network 10.4.6.0/24 area 0",
    "network 10.5.6.0/24 area 0",
    "network 10.255.0.6/32 area 0",
    "network 192.0.2.1/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutE("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutF("show ip ospf neighbor", "Full", 90_000);

  // S 的三个上游邻居 Full 后等待保护表刷新。
  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.2\\s+\\d+\\s+Full"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.3\\s+\\d+\\s+Full"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.4\\s+\\d+\\s+Full"),
    90_000,
  );
  testHelper.ReadyCheckDutA("show ip ospf route", "192.0.2.1/32", 90_000);


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

  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    "Area 0.0.0.0",
    new RegExp("Fast-reroute per-prefix\\s*:\\s*enabled"),
    new RegExp("Intra-area prefixes\\s*:\\s*[1-9]\\d*"),
    new RegExp("Protected by LFA\\s*:\\s*[1-9]\\d*"),
  ]);
  testHelper.ExecRetMatchDutA("show ip ospf route", [
    "192.0.2.1/32",
    "via 10.1.2.2",
    "via 10.1.4.2",
  ]);

  testHelper.ReadyCheckDutA("ping 192.0.2.1", " 0% packet loss", 60_000);

  // 关闭 S-B 主路径，P 改走 S-N1-E。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 192.0.2.1",
    new RegExp("10\\.1\\.2\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA("show ip ospf route", "192.0.2.1/32", 60_000);
  testHelper.ExecRetMatchDutA("show ip ospf route", [
    "192.0.2.1/32",
    "via 10.1.2.2",
  ]);
  testHelper.ReadyCheckDutA("ping 192.0.2.1", " 0% packet loss", 60_000);

  // 恢复 S-B，MHP 重新形成 ECMP。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 192.0.2.1",
    new RegExp("10\\.1\\.4\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );
  testHelper.ReadyCheckDutA("show ip ospf route", "192.0.2.1/32", 60_000);
  testHelper.ExecRetMatchDutA("show ip ospf route", [
    "192.0.2.1/32",
    "via 10.1.2.2",
    "via 10.1.4.2",
  ]);
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
    "no interface loopback1",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
