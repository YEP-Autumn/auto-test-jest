import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.four_devices_topo_links_type_3,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * 存在物理备份路径但开销不满足无环不等式：四设备环形组网 A-B-C-D-A，
 * A 到 C 的主路径为 A-B-C，物理备份路径 A-D-C 存在。
 * 将 D 侧 C-D 接口开销设为 10 后，D 到 C 的最短路径改为 D-A-B-C，
 * 会经过源节点 A，此时 D(D,C)=3 不小于 D(D,A)+D(A,C)=3，
 * 不满足 RFC 5286 无环不等式，因此 A 不会为 C 的前缀计算 LFA。
 *
 *    +--------+                   +--------+
 *    |  DUTA  |--PortA <=> PortA--|  DUTB  |
 *    +--------+                   +--------+
 *        |                            |
 *      PortD                        PortB
 *        |                            |
 *      PortD                        PortB
 *        |                            |
 *    +--------+                   +--------+
 *    |  DUTD  |--PortC <=> PortC--|  DUTC  |
 *    +--------+                   +--------+
 *
 * 地址规划：
 *   A-B: 10.0.12.0/24   A=.1  B=.2
 *   B-C: 10.0.23.0/24   B=.1  C=.2
 *   C-D: 10.0.34.0/24   C=.1  D=.2（D 侧开销 10，C 侧默认 1）
 *   D-A: 10.0.41.0/24   D=.1  A=.2
 *   Loopback0: A=1.1.1.1/32  B=2.2.2.2/32  C=3.3.3.3/32  D=4.4.4.4/32
 */
test("存在物理备份路径但开销不满足无环不等式时，LFA 保护前缀数为 0 且故障后依赖重收敛恢复", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.12.1/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.41.2/24",
    "ip ospf network point-to-point",
    "exit",
    "interface loopback0",
    "ip address 1.1.1.1/32",
    "no shutdown",
    "exit",
    "router ospf",
    "network 10.0.12.0/24 area 0",
    "network 10.0.41.0/24 area 0",
    "network 1.1.1.1/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.12.2/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.23.1/24",
    "ip ospf network point-to-point",
    "exit",
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "no shutdown",
    "exit",
    "router ospf",
    "network 10.0.12.0/24 area 0",
    "network 10.0.23.0/24 area 0",
    "network 2.2.2.2/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.23.2/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.34.1/24",
    "ip ospf network point-to-point",
    "exit",
    "interface loopback0",
    "ip address 3.3.3.3/32",
    "no shutdown",
    "exit",
    "router ospf",
    "network 10.0.23.0/24 area 0",
    "network 10.0.34.0/24 area 0",
    "network 3.3.3.3/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutD([
    "configure terminal",
    `interface ${Port.C}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.34.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.41.1/24",
    "ip ospf network point-to-point",
    "exit",
    "interface loopback0",
    "ip address 4.4.4.4/32",
    "no shutdown",
    "exit",
    "router ospf",
    "network 10.0.34.0/24 area 0",
    "network 10.0.41.0/24 area 0",
    "network 4.4.4.4/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 90_000);

  // A 的两个邻居都必须 Full，否则 Protected 为 0 可能只是备份邻居未建立。
  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("2\\.2\\.2\\.2\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("4\\.4\\.4\\.4\\s+\\d+\\s+Full"),
    120_000,
  );

  testHelper.ReadyCheckDutA("show ip ospf route", "3.3.3.3/32", 60_000);
  testHelper.ReadyCheckDutA(
    "show ip route 3.3.3.3",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    60_000,
  );

  // D 到 C 的最短路径经过 A，说明 D 作为备份邻居会产生环路。
  testHelper.ReadyCheckDutD(
    "show ip route 3.3.3.3",
    new RegExp("10\\.0\\.41\\.2,\\s+via"),
    60_000,
  );

  // 等待 LFA 计算完成，再断言没有前缀被保护。
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Calculation\\s*:\\s*[1-9]\\d*\\s+runs"),
    60_000,
  );
  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    "Area 0.0.0.0",
    new RegExp("Fast-reroute per-prefix\\s*:\\s*enabled"),
    new RegExp("Intra-area prefixes\\s*:\\s*[1-9]\\d*"),
    new RegExp("Protected by LFA\\s*:\\s*0\\b"),
  ]);
  testHelper.ExecRetMatchDutA("show ip ospf route", [
    "3.3.3.3/32",
    "via 10.0.12.2",
  ]);
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  // 关闭 A-B 链路：物理备份路径 A-D-C 存在，但只能依赖 OSPF 重收敛。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    "show ip route 3.3.3.3",
    new RegExp("10\\.0\\.41\\.1,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);
  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    new RegExp("Protected by LFA\\s*:\\s*0\\b"),
  ]);

  // 恢复 A-B 链路，路由回到 A-B-C 主路径。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 3.3.3.3",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router ospf",
    `interface ${Port.A}`,
    "no shutdown",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "no shutdown",
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
    `interface ${Port.B}`,
    "no shutdown",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "no shutdown",
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
    `interface ${Port.C}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "no shutdown",
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
