import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.five_devices_topo_links_type_3,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * LFA 保护从 link 升级为 link+node：
 *
 *   主路径：  A-B-C         （B 为主下一跳节点）
 *   初始备份：A-D-B-C       （经过 B，属于 link 保护）
 *   升级备份：A-E-C         （绕开 B，属于 link+node 保护）
 *
 * 初始关闭 E-C，只有 D 可作为 LFA（Type=link，Backup nbr=10.0.14.2）。
 * 打开 E-C 后，E 的路径开销更低且绕开 B，LFA 升级为
 * Type=link+node、Backup nbr=10.0.15.2，主路径始终为 A-B-C。
 * 再次关闭 E-C 后，应退回 link 保护。
 *
 * 地址规划：
 *   A-B: 10.0.12.0/24    B-C: 10.0.23.0/24
 *   A-D: 10.0.14.0/24    D-B: 10.0.24.0/24
 *   A-E: 10.0.15.0/24    E-C: 10.0.35.0/24
 *   Loopback0: 1.1.1.1 ~ 5.5.5.5/32
 */
test("LFA 保护随绕开主下一跳节点的备份路径出现由 link 升级为 link+node", async () => {
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
    "ip address 10.0.14.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.0.15.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    "interface loopback0",
    "ip address 1.1.1.1/32",
    "exit",
    "router ospf",
    "router-id 1.1.1.1",
    "network 10.0.12.0/24 area 0",
    "network 10.0.14.0/24 area 0",
    "network 10.0.15.0/24 area 0",
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
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.23.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.0.24.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "exit",
    "router ospf",
    "router-id 2.2.2.2",
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
    "ip address 10.0.23.2/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.35.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    "interface loopback0",
    "ip address 3.3.3.3/32",
    "exit",
    "router ospf",
    "router-id 3.3.3.3",
    "network 10.0.23.0/24 area 0",
    "network 10.0.35.0/24 area 0",
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
    "ip ospf cost 10",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.24.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 4.4.4.4/32",
    "exit",
    "router ospf",
    "router-id 4.4.4.4",
    "network 10.0.14.0/24 area 0",
    "network 10.0.24.0/24 area 0",
    "network 4.4.4.4/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutE([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.0.15.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.35.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 5",
    "shutdown",
    "exit",
    "interface loopback0",
    "ip address 5.5.5.5/32",
    "exit",
    "router ospf",
    "router-id 5.5.5.5",
    "network 10.0.15.0/24 area 0",
    "network 10.0.35.0/24 area 0",
    "network 5.5.5.5/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutE("show ip ospf neighbor", "Full", 120_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "3.3.3.3/32", 90_000);
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    90_000,
  );

  // 初始只有经过 B 的 D 备份，应为 link 保护。
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("3\\.3\\.3\\.3/32\\s+link\\s+2\\.2\\.2\\.2\\s+10\\.0\\.14\\.2"),
    120_000,
  );
  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    new RegExp("3\\.3\\.3\\.3/32\\s+link\\s+2\\.2\\.2\\.2\\s+10\\.0\\.14\\.2"),
  ]);
  testHelper.ExecRetMatchDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("3\\.3\\.3\\.3/32\\s+link\\+node"),
    true,
  );
  testHelper.ExecRetMatchDutA("show ip route 3.3.3.3", [
    new RegExp("\\*\\s+10\\.0\\.12\\.2,\\s+via"),
    new RegExp("repair path: 10\\.0\\.14\\.2 via"),
  ]);
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  // 打开 E-C，出现绕开 B 且开销更低的备份路径。
  testHelper.ExecConfigDutE([
    "configure terminal",
    `interface ${Port.B}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutC(
    "show ip ospf neighbor",
    new RegExp("5\\.5\\.5\\.5"),
    120_000,
  );
  testHelper.ReadyCheckDutE(
    "show ip ospf neighbor",
    new RegExp("3\\.3\\.3\\.3"),
    120_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp(
      "3\\.3\\.3\\.3/32\\s+link\\+node\\s+2\\.2\\.2\\.2\\s+10\\.0\\.15\\.2",
    ),
    120_000,
  );
  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    new RegExp(
      "3\\.3\\.3\\.3/32\\s+link\\+node\\s+2\\.2\\.2\\.2\\s+10\\.0\\.15\\.2",
    ),
  ]);
  testHelper.ExecRetMatchDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("3\\.3\\.3\\.3/32\\s+\\S+\\s+2\\.2\\.2\\.2\\s+10\\.0\\.14\\.2"),
    true,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 3.3.3.3",
    new RegExp("repair path: 10\\.0\\.15\\.2 via"),
    90_000,
  );
  testHelper.ExecRetMatchDutA("show ip route 3.3.3.3", [
    new RegExp("\\*\\s+10\\.0\\.12\\.2,\\s+via"),
    new RegExp("repair path: 10\\.0\\.15\\.2 via"),
  ]);
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  // 再次关闭 E-C，应退回经过 B 的 link 保护。
  testHelper.ExecConfigDutE([
    "configure terminal",
    `interface ${Port.B}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutC(
    "show ip ospf neighbor",
    new RegExp("5\\.5\\.5\\.5"),
    120_000,
    true,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("3\\.3\\.3\\.3/32\\s+link\\s+2\\.2\\.2\\.2\\s+10\\.0\\.14\\.2"),
    120_000,
  );
  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    new RegExp("3\\.3\\.3\\.3/32\\s+link\\s+2\\.2\\.2\\.2\\s+10\\.0\\.14\\.2"),
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 3.3.3.3",
    new RegExp("repair path: 10\\.0\\.14\\.2 via"),
    90_000,
  );
  testHelper.ExecRetMatchDutA("show ip route 3.3.3.3", [
    new RegExp("\\*\\s+10\\.0\\.12\\.2,\\s+via"),
    new RegExp("repair path: 10\\.0\\.14\\.2 via"),
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
    "no interface loopback0",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
