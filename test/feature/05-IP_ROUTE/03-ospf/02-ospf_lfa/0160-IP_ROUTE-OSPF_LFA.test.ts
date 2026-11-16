import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 12);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.nine_devices_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * RFC 6571 Figure 1「Example 1」原图：
 *   S = DUTA，A = DUTB，B = DUTC，C = DUTD，D = DUTE，
 *   E = DUTF，F = DUTG，G = DUTH，H = DUTL。
 *
 *                       D
 *                      / \
 *                  10 /   \ 10
 *                    /     \
 *                   G       H ----------.
 *                   |       |           |
 *                 1 |     1 |           |
 *                   |       |           |
 *                   B       C           | 10
 *                   |       |\          |
 *                   |       | \         |
 *                   |       |  \ 6      |
 *                   |       |   \       |
 *                 7 |    10 |    E      F
 *                   |       |   /      /
 *                   |       |  / 6    / 5
 *                   |       | /      /
 *                   |       |/      /
 *                   A-------S------/
 *                       7
 *
 * 地址规划（节点编号 A=1 ... I=9）：
 *   S-A:  10.1.2.0/24   S=.1 A=.2      开销 7
 *   S-C:  10.1.4.0/24   S=.1 C=.2      开销 10
 *   S-F:  10.1.6.0/24   S=.1 F=.2      开销 5
 *   A-B:  10.2.3.0/24   A=.1 B=.2      开销 7
 *   B-G:  10.3.7.0/24   B=.1 G=.2      开销 1
 *   C-H:  10.4.8.0/24   C=.1 H=.2      开销 1
 *   C-E:  10.4.9.0/24   C=.1 E=.2      开销 6
 *   D-G:  10.5.7.0/24   D=.1 G=.2      开销 10
 *   D-H:  10.5.8.0/24   D=.1 H=.2      开销 10
 *   H-F:  10.8.6.0/24   H=.1 F=.2      开销 10
 *   Loopback0: 10.255.0.1~9/32
 *
 * S 到 D 的主路径为 S-C-H-D（10+1+10=21），
 * LFA 为 S-A-B-G-D 或 S-F-H-D（7+7+1+10=25、5+10+10=25）。
 */
test("RFC 6571 Figure 1 原图中 S 到 D 的主路径故障后由 A 或 F 作为 LFA 恢复", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.1.2.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 7",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.1.4.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.1.6.1/24",
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
    "network 10.1.6.0/24 area 0",
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
    "ip ospf cost 7",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.2.3.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 7",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.2/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.2",
    "network 10.1.2.0/24 area 0",
    "network 10.2.3.0/24 area 0",
    "network 10.255.0.2/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.2.3.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 7",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.3.7.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.3/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.3",
    "network 10.2.3.0/24 area 0",
    "network 10.3.7.0/24 area 0",
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
    "ip ospf cost 10",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.4.8.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.4.9.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 6",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.4/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.4",
    "network 10.1.4.0/24 area 0",
    "network 10.4.8.0/24 area 0",
    "network 10.4.9.0/24 area 0",
    "network 10.255.0.4/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutE([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.5.7.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.5.8.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.5/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.5",
    "network 10.5.7.0/24 area 0",
    "network 10.5.8.0/24 area 0",
    "network 10.255.0.5/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutF([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.1.6.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.8.6.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.6/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.6",
    "network 10.1.6.0/24 area 0",
    "network 10.8.6.0/24 area 0",
    "network 10.255.0.6/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutG([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.3.7.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.5.7.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.7/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.7",
    "network 10.3.7.0/24 area 0",
    "network 10.5.7.0/24 area 0",
    "network 10.255.0.7/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutH([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.4.8.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.5.8.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.8.6.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.8/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.8",
    "network 10.4.8.0/24 area 0",
    "network 10.5.8.0/24 area 0",
    "network 10.8.6.0/24 area 0",
    "network 10.255.0.8/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutL([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.4.9.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 6",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.9/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.9",
    "network 10.4.9.0/24 area 0",
    "network 10.255.0.9/32 area 0",
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
  testHelper.ReadyCheckDutH("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutL("show ip ospf neighbor", "Full", 120_000);

  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.2\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.4\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.6\\s+\\d+\\s+Full"),
    120_000,
  );

  // S 到 D 的主路径经 C（DUTD）。
  testHelper.ReadyCheckDutA(
    "show ip route 10.255.0.5",
    "10.255.0.5/32",
    90_000,
  );
  testHelper.ExecRetMatchDutA("show ip route 10.255.0.5", [
    "10.255.0.5/32",
    new RegExp("10\\.1\\.4\\.2,\\s+via"),
  ]);
  testHelper.ReadyCheckDutA("ping 10.255.0.5", " 0% packet loss", 60_000);

  // 所有邻居 Full 后再使能 LFA。
  for (const idx of [
    testHelper.ExecConfigDutA,
    testHelper.ExecConfigDutB,
    testHelper.ExecConfigDutC,
    testHelper.ExecConfigDutD,
    testHelper.ExecConfigDutE,
    testHelper.ExecConfigDutF,
    testHelper.ExecConfigDutG,
    testHelper.ExecConfigDutH,
    testHelper.ExecConfigDutL,
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
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    90_000,
  );

  // 关闭 S-C，S 到 D 改走 A（S-A-B-G-D）或 F（S-F-H-D）。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 10.255.0.5",
    new RegExp("(10\\.1\\.2\\.2|10\\.1\\.6\\.2),\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA("ping 10.255.0.5", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutA("ping 10.255.0.9", " 0% packet loss", 60_000);

  // 恢复 S-C，主路径和保护计数恢复。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 10.255.0.5",
    new RegExp("10\\.1\\.4\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );
  testHelper.ReadyCheckDutA("ping 10.255.0.5", " 0% packet loss", 60_000);

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

  testHelper.CleanConfigDutL([
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
