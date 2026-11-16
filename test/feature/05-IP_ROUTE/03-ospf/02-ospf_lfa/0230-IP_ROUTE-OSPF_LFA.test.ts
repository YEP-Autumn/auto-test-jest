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
 * RFC 8518 4.2 / 4.2.1「同一外部前缀由多个 ASBR 发布」：
 *   S = DUTA，N1 = DUTB，N2 = DUTC，B = DUTD，E = DUTE，F = DUTF。
 *
 *   E、F 作为两个 ASBR，各自用 redistribute connected 发布同一个外部前缀
 *   198.51.100.1/32，外部类型 Type-2、metric 20，满足“同类型、同 cost”前置条件。
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
 *   外部前缀：198.51.100.1/32（E、F 双 ASBR 发布）
 *
 * 说明：E/F 使用相同的 loopback1 地址，必须显式配置 OSPF router-id。
 * 本用例关注“主 ASBR 路径故障后备用 ASBR 是否可达”，不把 AS 外部路由的 LFA
 * 保护计数作为必检项（RFC 5286 6.3 已说明该场景不应使用 LFA）。
 */
test("双 ASBR 发布同一外部前缀时，主路径故障后流量切换到备用 ASBR", async () => {
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
    "ip address 198.51.100.1/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.5",
    "network 10.2.5.0/24 area 0",
    "network 10.5.6.0/24 area 0",
    "network 10.255.0.5/32 area 0",
    "redistribute connected metric 20 metric-type 2",
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
    "ip address 198.51.100.1/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.6",
    "network 10.4.6.0/24 area 0",
    "network 10.5.6.0/24 area 0",
    "network 10.255.0.6/32 area 0",
    "redistribute connected metric 20 metric-type 2",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutE("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutF("show ip ospf neighbor", "Full", 90_000);

  // S 学到 Type-2 外部前缀，经 F（S-B 路径）转发。
  testHelper.ReadyCheckDutA(
    "show ip ospf route",
    new RegExp("E2\\s+198\\.51\\.100\\.1/32"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 198.51.100.1",
    new RegExp("10\\.1\\.4\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA("ping 198.51.100.1", " 0% packet loss", 60_000);

  // 邻居 Full 后再使能 LFA。
  for (const idx of [
    testHelper.ExecConfigDutA,
    testHelper.ExecConfigDutB,
    testHelper.ExecConfigDutC,
    testHelper.ExecConfigDutD,
    testHelper.ExecConfigDutE,
    testHelper.ExecConfigDutF,
  ]) {
    idx.call(testHelper, [
      "configure terminal",
      "router ospf",
      "fast-reroute per-prefix enable",
      "exit",
      "end",
    ]);
  }
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Calculation\\s*:\\s*[1-9]\\d*\\s+runs"),
    60_000,
  );

  // 关闭 S-B 主路径，外部前缀先切到 S-N2-B-F 路径。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 198.51.100.1",
    new RegExp("10\\.1\\.3\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA("ping 198.51.100.1", " 0% packet loss", 60_000);

  // 再关闭 S-N2，F 侧路径不可用，外部前缀切换到 E（S-N1 路径）。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 198.51.100.1",
    new RegExp("10\\.1\\.2\\.2,\\s+via"),
    60_000,
  );
  testHelper.ReadyCheckDutA("ping 198.51.100.1", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutA(
    "show ip ospf route",
    new RegExp("E2\\s+198\\.51\\.100\\.1/32"),
    60_000,
  );

  // 恢复两条路径，外部前缀回到 F。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no shutdown",
    "exit",
    `interface ${Port.B}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 198.51.100.1",
    new RegExp("10\\.1\\.4\\.2,\\s+via"),
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
