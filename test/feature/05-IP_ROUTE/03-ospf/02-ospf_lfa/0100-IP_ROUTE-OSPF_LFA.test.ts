import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";
import { LinkConstraint } from "@/utils/topo/link-constraint";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_4,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * 多区域 + 外部路由场景：
 *   DUTA（Area 0）-- DUTB（ABR）-- DUTC（Area 1，ASBR）
 *
 * 覆盖点：
 *   1. ABR 将 Area 1 的 Loopback 汇总为区域间路由（area range）；
 *   2. ASBR 重分发静态路由，产生 Type-1 外部路由；
 *   3. ASBR 重分发直连路由，产生 Type-2 外部路由；
 *   4. ASBR 产生 Type-2 默认路由（default-information originate always）；
 *   5. 单 ABR/ASBR 路径下没有 LFA 备份，受保护前缀数应为 0；
 *   6. A-B 链路故障后，区域间、外部和默认路由均不可达，恢复后重新出现。
 *
 *    +--------+                   +--------+                   +--------+
 *    |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB <=> PortB--|  DUTC  |
 *    +--------+                   +--------+                   +--------+
 *
 * 地址规划：
 *   A-B: 10.0.12.0/24  A=.1 B=.2  Area 0
 *   B-C: 10.0.23.0/24  B=.1 C=.2  Area 1
 *   Loopback0: A=1.1.1.1/32  B=2.2.2.2/32  C=3.3.3.3/32
 *   C Loopback1: 172.16.1.1/32（重分发为 Type-2）
 *   C 静态路由: 172.17.0.0/16 null0（重分发为 Type-1）
 */
test("多区域 ABR 汇总、外部 Type-1/Type-2 与默认路由在 LFA 使能后正确发布", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.0.12.1/24",
    "ip ospf network point-to-point",
    "exit",
    "interface loopback0",
    "ip address 1.1.1.1/32",
    "exit",
    "router ospf",
    "network 10.0.12.0/24 area 0",
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
    "exit",
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "exit",
    "router ospf",
    "network 10.0.12.0/24 area 0",
    "network 10.0.23.0/24 area 1",
    "network 2.2.2.2/32 area 0",
    "area 1 range 3.3.0.0/16",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.23.2/24",
    "ip ospf network point-to-point",
    "exit",
    "interface loopback0",
    "ip address 3.3.3.3/32",
    "exit",
    "interface loopback1",
    "ip address 172.16.1.1/32",
    "exit",
    "ip route 172.17.0.0/16 null0",
    "router ospf",
    "network 10.0.23.0/24 area 1",
    "network 3.3.3.3/32 area 1",
    "redistribute connected metric 20 metric-type 2",
    "redistribute static metric 20 metric-type 1",
    "default-information originate always metric-type 2",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "3.3.0.0/16", 60_000);

  testHelper.ExecRetMatchDutA("show ip ospf route", [
    new RegExp("IA\\s+3\\.3\\.0\\.0/16"),
    new RegExp("E1\\s+172\\.17\\.0\\.0/16"),
    new RegExp("E2\\s+172\\.16\\.1\\.1/32"),
    new RegExp("E2\\s+0\\.0\\.0\\.0/0"),
  ]);

  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    "Area 0.0.0.0",
    new RegExp("Fast-reroute per-prefix\\s*:\\s*enabled"),
    new RegExp("Intra-area prefixes\\s*:\\s*[1-9]\\d*"),
    new RegExp("Protected by LFA\\s*:\\s*0\\b"),
  ]);

  testHelper.ExecRetMatchDutA("ping 3.3.3.3", " 0% packet loss");

  // 单 ABR 路径故障后，区域间、外部和默认路由均应撤销。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 3.3.0.0/16",
    "3.3.0.0/16",
    30_000,
    true,
  );
  testHelper.ExecRetMatchDutA(
    "show ip route 3.3.0.0/16",
    "% Network not in table",
  );
  testHelper.ExecRetMatchDutA(
    "show ip route 172.17.0.0/16",
    "% Network not in table",
  );
  testHelper.ExecRetMatchDutA(
    "show ip route 0.0.0.0/0",
    "% Network not in table",
  );

  // 恢复链路，路由应重新学习。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 3.3.0.0/16",
    new RegExp("via 10\\.0\\.12\\.2"),
    60_000,
  );
  testHelper.ReadyCheckDutA("show ip route 0.0.0.0/0", "0.0.0.0/0", 60_000);
  testHelper.ExecRetMatchDutA("ping 3.3.3.3", " 0% packet loss");

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router ospf",
    `interface ${Port.A}`,
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
    "no ip route 172.17.0.0/16 null0",
    `interface ${Port.B}`,
    "no shutdown",
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
