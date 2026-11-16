import { LinkConstraint, Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 15);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.nine_devices_topo_links_type_3,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * RFC 6571 Figure 5「Extended U」：
 *   与 Square 相同的 9 台设备，但 C1-C2 之间没有 L1 直连链路。
 *   用一条 GRE 隧道模拟 C1/C2 在 L2 中的逻辑路径，隧道开销等价于 c。
 *
 *   C1 = DUTA，C2 = DUTB，A1 = DUTC，A2 = DUTD，A3 = DUTE，A4 = DUTF，
 *   E1 = DUTG，E2 = DUTH，E3 = DUTL。
 *
 *                              P
 *                             / \
 *                           x/   \x+e
 *                           /     \
 *                          C1<...>C2        <...> = GRE tunnel
 *                           |\    | \
 *                           | \   |  +-------+
 *                       d/u |  \  |           \
 *                           |   +-|-----+      \
 *                           |     |      \      \
 *                          A1--a--A2     A3--a--A4
 *                           |\   /|       |    /
 *                           | \ / |       |   /
 *                        d/u|  \  |d/u    |  /
 *                           | / \ |       | /
 *                           |/   \|       |/
 *                          E1     E2      E3
 *
 * 隧道地址：10.100.0.1/24（C1）<-> 10.100.0.2/24（C2），开销 1。
 * 隧道源/目的使用各自的 loopback0。
 *
 * 地址规划与 0200 相同，另加：
 *   Tunnel0: 10.100.0.0/24
 *   Loopback0: 10.255.0.1~9/32
 *   MHP P: 192.0.2.1/32（C1、C2 双端发布）
 */
test("RFC 6571 Figure 5 Extended U 中 C1/C2 通过隧道形成逻辑邻居并保持 LFA 覆盖", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
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
    "interface tunnel 1",
    "tunnel mode gre",
    "tunnel source loopback0",
    "tunnel destination 10.255.0.2",
    "ip address 10.100.0.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "router ospf",
    "router-id 10.255.0.1",
    "network 10.1.3.0/24 area 0",
    "network 10.1.4.0/24 area 0",
    "network 10.100.0.0/24 area 0",
    "network 10.255.0.1/32 area 0",
    "network 192.0.2.1/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
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
    `interface ${Port.D}`,
    "no switchport",
    "ip address 10.2.5.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.E}`,
    "no switchport",
    "ip address 10.2.6.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.2/32",
    "exit",
    "interface loopback1",
    "ip address 192.0.2.1/32",
    "exit",
    "interface tunnel 1",
    "tunnel mode gre",
    "tunnel source loopback0",
    "tunnel destination 10.255.0.1",
    "ip address 10.100.0.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "router ospf",
    "router-id 10.255.0.2",
    "network 10.2.3.0/24 area 0",
    "network 10.2.4.0/24 area 0",
    "network 10.2.5.0/24 area 0",
    "network 10.2.6.0/24 area 0",
    "network 10.100.0.0/24 area 0",
    "network 10.255.0.2/32 area 0",
    "network 192.0.2.1/32 area 0",
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
    "ip address 10.3.7.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.E}`,
    "no switchport",
    "ip address 10.3.8.1/24",
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
    "network 10.3.7.0/24 area 0",
    "network 10.3.8.0/24 area 0",
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
    "ip address 10.4.7.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.E}`,
    "no switchport",
    "ip address 10.4.8.1/24",
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
    "network 10.4.7.0/24 area 0",
    "network 10.4.8.0/24 area 0",
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
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.5.6.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.5.9.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.5/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.5",
    "network 10.2.5.0/24 area 0",
    "network 10.5.6.0/24 area 0",
    "network 10.5.9.0/24 area 0",
    "network 10.255.0.5/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutF([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.2.6.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.5.6.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.6.9.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.6/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.6",
    "network 10.2.6.0/24 area 0",
    "network 10.5.6.0/24 area 0",
    "network 10.6.9.0/24 area 0",
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
    "ip address 10.4.7.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.7/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.7",
    "network 10.3.7.0/24 area 0",
    "network 10.4.7.0/24 area 0",
    "network 10.255.0.7/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutH([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.3.8.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.4.8.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.8/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.8",
    "network 10.3.8.0/24 area 0",
    "network 10.4.8.0/24 area 0",
    "network 10.255.0.8/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutL([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.5.9.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.6.9.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    "interface loopback0",
    "ip address 10.255.0.9/32",
    "exit",
    "router ospf",
    "router-id 10.255.0.9",
    "network 10.5.9.0/24 area 0",
    "network 10.6.9.0/24 area 0",
    "network 10.255.0.9/32 area 0",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 150_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 150_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 150_000);
  testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 150_000);
  testHelper.ReadyCheckDutE("show ip ospf neighbor", "Full", 150_000);
  testHelper.ReadyCheckDutF("show ip ospf neighbor", "Full", 150_000);
  testHelper.ReadyCheckDutG("show ip ospf neighbor", "Full", 150_000);
  testHelper.ReadyCheckDutH("show ip ospf neighbor", "Full", 150_000);
  testHelper.ReadyCheckDutL("show ip ospf neighbor", "Full", 150_000);

  // C1/C2 通过隧道形成逻辑邻居。
  testHelper.ReadyCheckDutA(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.2\\s+\\d+\\s+Full"),
    150_000,
  );
  testHelper.ReadyCheckDutB(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.1\\s+\\d+\\s+Full"),
    150_000,
  );
  testHelper.ReadyCheckDutA("ping 10.100.0.2", " 0% packet loss", 90_000);

  testHelper.ReadyCheckDutG(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.3\\s+\\d+\\s+Full"),
    150_000,
  );
  testHelper.ReadyCheckDutG(
    "show ip ospf neighbor",
    new RegExp("10\\.255\\.0\\.4\\s+\\d+\\s+Full"),
    150_000,
  );

  // E1 到 P 的 ECMP 仍然存在。
  testHelper.ReadyCheckDutG("show ip route 192.0.2.1", "192.0.2.1/32", 90_000);
  testHelper.ExecRetMatchDutG("show ip route 192.0.2.1", [
    "192.0.2.1/32",
    new RegExp("10\\.3\\.7\\.1,\\s+via"),
    new RegExp("10\\.4\\.7\\.1,\\s+via"),
  ]);
  testHelper.ReadyCheckDutG("ping 192.0.2.1", " 0% packet loss", 60_000);

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

  testHelper.ReadyCheckDutG(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Calculation\\s*:\\s*[1-9]\\d*\\s+runs"),
    90_000,
  );
  testHelper.ReadyCheckDutG(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    90_000,
  );

  // 关闭 E1-A1，P 改走 A2。
  testHelper.ExecConfigDutG([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutG(
    "show ip route 192.0.2.1",
    new RegExp("10\\.4\\.7\\.1,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutG("ping 192.0.2.1", " 0% packet loss", 60_000);

  // 恢复 E1-A1。
  testHelper.ExecConfigDutG([
    "configure terminal",
    `interface ${Port.A}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutG(
    "show ip route 192.0.2.1",
    new RegExp("10\\.3\\.7\\.1,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutG(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router ospf",
    "no interface tunnel 1",
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
    "no interface tunnel 1",
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
