import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.five_devices_topo_links_type_2,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * 主路径不变，LFA 备份下一跳在 D 和 E 之间切换：
 *
 *   主路径：  A-B-C   （A-B、B-C 开销 1）
 *   备份 1：  A-D-C   （A-D、D-C 开销 10，初始最低开销备份）
 *   备份 2：  A-E-C   （A-E、E-C 开销 20）
 *
 * 将 D 到 C 的接口开销从 10 提高到 100 后，D 不再满足无环条件，
 * 主路径仍为 A-B-C，但 repair path 应从 D 的 10.0.14.2 切换为
 * E 的 10.0.15.2；恢复开销后 repair path 回到 D。
 *
 * 地址规划：
 *   A-B: 10.0.12.0/24    B-C: 10.0.23.0/24
 *   A-D: 10.0.14.0/24    D-C: 10.0.34.0/24
 *   A-E: 10.0.15.0/24    E-C: 10.0.35.0/24
 *   Loopback0: 1.1.1.1 ~ 5.5.5.5/32
 */
test("主路径不变时，LFA 备份下一跳随候选路径开销变化在 D/E 之间切换", async () => {
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
    "ip ospf cost 20",
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
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "exit",
    "router ospf",
    "router-id 2.2.2.2",
    "network 10.0.12.0/24 area 0",
    "network 10.0.23.0/24 area 0",
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
    "ip address 10.0.34.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.0.35.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 20",
    "exit",
    "interface loopback0",
    "ip address 3.3.3.3/32",
    "exit",
    "router ospf",
    "router-id 3.3.3.3",
    "network 10.0.23.0/24 area 0",
    "network 10.0.34.0/24 area 0",
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
    "ip address 10.0.34.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 4.4.4.4/32",
    "exit",
    "router ospf",
    "router-id 4.4.4.4",
    "network 10.0.14.0/24 area 0",
    "network 10.0.34.0/24 area 0",
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
    "ip ospf cost 20",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.35.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 20",
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

  // 初始备份应为开销更低的 D。
  testHelper.ReadyCheckDutA(
    "show ip route 3.3.3.3",
    new RegExp("repair path: 10\\.0\\.14\\.2 via"),
    90_000,
  );
  testHelper.ExecRetMatchDutA("show ip route 3.3.3.3", [
    new RegExp("\\*\\s+10\\.0\\.12\\.2,\\s+via"),
    new RegExp("repair path: 10\\.0\\.14\\.2 via"),
  ]);
  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    new RegExp("3\\.3\\.3\\.3/32\\s+\\S+\\s+2\\.2\\.2\\.2\\s+10\\.0\\.14\\.2"),
  ]);
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  // 提高 D-C 开销，使 D 不再满足无环条件；主路径不变，备份应切换到 E。
  testHelper.ExecConfigDutD([
    "configure terminal",
    `interface ${Port.B}`,
    "ip ospf cost 100",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("3\\.3\\.3\\.3/32\\s+\\S+\\s+2\\.2\\.2\\.2\\s+10\\.0\\.15\\.2"),
    90_000,
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
  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    new RegExp("3\\.3\\.3\\.3/32\\s+\\S+\\s+2\\.2\\.2\\.2\\s+10\\.0\\.15\\.2"),
  ]);
  testHelper.ExecRetMatchDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("3\\.3\\.3\\.3/32\\s+\\S+\\s+2\\.2\\.2\\.2\\s+10\\.0\\.14\\.2"),
    true,
  );
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  // 恢复开销，主路径仍不变，备份回到 D。
  testHelper.ExecConfigDutD([
    "configure terminal",
    `interface ${Port.B}`,
    "ip ospf cost 10",
    "end",
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
  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    new RegExp("3\\.3\\.3\\.3/32\\s+\\S+\\s+2\\.2\\.2\\.2\\s+10\\.0\\.14\\.2"),
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
