import {
  BurstGapUnit,
  BurstRateUnit,
  DeviceARouteMac,
  GreaterThan,
  LinkConstraint,
  ModifierField,
  ModifierMode,
  PacketBuilder,
  Port,
  StreamPort,
  TestHelper,
  TransmitMode,
} from "@/utils";

jest.setTimeout(1000 * 60 * 15);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = new TestHelper(LinkConstraint.four_devices_topo_links_type_6);
  await testHelper.init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * ECMP 每个成员分别继承自己的 LFA 备份下一跳：
 * 四设备环 A-B-C-D-A 全部链路开销为 1，DUTA 到 203.0.113.0/24
 * 形成两条等价主路径 A-B-C 和 A-D-C。
 *
 * LFA 逐前缀明细中应同时出现两行：
 *   Primary 2.2.2.2（DUTB） -> Backup 10.0.41.1（DUTD）
 *   Primary 4.4.4.4（DUTD） -> Backup 10.0.12.2（DUTB）
 * 即每个 ECMP 成员都以另一个成员作为自己的修复路径。
 *
 *   StreamPort.A -- DUTA PortB
 *   DUTA PortA   <=> DUTB PortA
 *   DUTB PortB   <=> DUTC PortB
 *   DUTC PortC   <=> DUTD PortC
 *   DUTD PortD   <=> DUTA PortD
 *   DUTC PortA   -- StreamPort.B
 *
 * 地址规划：
 *   A-B: 10.0.12.0/24   A=.1  B=.2
 *   B-C: 10.0.23.0/24   B=.1  C=.2
 *   C-D: 10.0.34.0/24   C=.1  D=.2
 *   D-A: 10.0.41.0/24   D=.1  A=.2
 *   A 注入: 198.51.100.1/24
 *   C 出口: 203.0.113.1/24，测试仪 B=203.0.113.2
 *   Loopback0: A=1.1.1.1/32  B=2.2.2.2/32  C=3.3.3.3/32  D=4.4.4.4/32
 *
 * 两个故障周期分别关闭 A-B 和 A-D，每个周期 1 包/ms 发送 6000 个报文，
 * 要求接收匹配数大于 5950，验证两个 ECMP 成员的 LFA 修复路径均可用。
 */
test("ECMP 的每个成员分别使用各自的 LFA 备份路径，单成员故障时 1 包/ms 丢包少于 50 个", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.12.1/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "no shutdown",
    "ip address 198.51.100.1/24",
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
    `interface ${Port.A}`,
    "no switchport",
    "no shutdown",
    "ip address 203.0.113.1/24",
    "exit",
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
    "arp 203.0.113.2 0002.0002.0002",
    "router ospf",
    "network 10.0.23.0/24 area 0",
    "network 10.0.34.0/24 area 0",
    "network 203.0.113.0/24 area 0",
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

  // 目标前缀在 A 上形成经 B 和 D 的两条等价主路径。
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.41\\.1,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA("show ip ospf route", "203.0.113.0/24", 90_000);
  testHelper.ExecRetMatchDutA("show ip ospf route", [
    "203.0.113.0/24",
    "via 10.0.12.2",
    "via 10.0.41.1",
  ]);

  // 每个 ECMP 成员各有一条 LFA 明细：主下一跳 B 备份到 D，主下一跳 D 备份到 B。
  // 两条正则分别匹配同一前缀的两行，避免依赖回显行顺序。
  const perEcmpLfaRows = new RegExp(
    "(?=[\\s\\S]*203\\.0\\.113\\.0/24\\s+\\S+\\s+2\\.2\\.2\\.2\\s+10\\.0\\.41\\.1)" +
      "(?=[\\s\\S]*203\\.0\\.113\\.0/24\\s+\\S+\\s+4\\.4\\.4\\.4\\s+10\\.0\\.12\\.2)",
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    perEcmpLfaRows,
    120_000,
  );
  testHelper.ExecRetMatchDutA(
    "show ip ospf fast-reroute per-prefix",
    perEcmpLfaRows,
  );
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  // 故障周期 1：关闭 A-B，B 成员的流量应由其 LFA 备份经 D 转发。
  testHelper.startCapture(StreamPort.B);
  testHelper.addPktSender({
    port: StreamPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:44:55:66",
        type: 0x0800,
      })
      .setIPv4({ src: "198.51.100.2", dst: "203.0.113.2", proto: 17 })
      .setUDP({ sport: 1234, dport: 5678 }),
    // 逐包修改 UDP 源端口，让流量同时哈希到两个 ECMP 成员。
    modifier_param: [
      {
        modifier_field: ModifierField.UDP_PORT_SRC,
        mode: ModifierMode.Increment,
        start_value: "1000",
        step: 1,
        count: 6000,
      },
    ],
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_size: 1,
        burst_count: 6000,
        gap: 1,
        gap_unit: BurstGapUnit.MS,
        rate: 1000,
        rate_unit: BurstRateUnit.FRAME_PER_SEC,
      },
    },
    wait_time: 1000,
    wait_for_completion: false,
  });

  // PacketSender 启动后固定等待 3s 再返回，故障注入点在发流后约 4s。
  testHelper.sleep(1000);
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.41\\.1,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    30_000,
    true,
  );
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  testHelper.sleep(6000);
  testHelper.stopStream(StreamPort.A);
  testHelper.addPktChecker({
    port: StreamPort.B,
    packet: new PacketBuilder().setIPv4({
      src: "198.51.100.2",
      dst: "203.0.113.2",
    }),
    expected_count: GreaterThan(6000 - 50),
  });

  // 恢复 A-B，等待 ECMP 和两条 LFA 明细重新形成。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.41\\.1,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    perEcmpLfaRows,
    120_000,
  );

  // 故障周期 2：关闭 A-D，D 成员的流量应由其 LFA 备份经 B 转发。
  testHelper.startCapture(StreamPort.B);
  testHelper.addPktSender({
    port: StreamPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:44:55:66",
        type: 0x0800,
      })
      .setIPv4({ src: "198.51.100.2", dst: "203.0.113.2", proto: 17 })
      .setUDP({ sport: 1234, dport: 5678 }),
    modifier_param: [
      {
        modifier_field: ModifierField.UDP_PORT_SRC,
        mode: ModifierMode.Increment,
        start_value: "1000",
        step: 1,
        count: 6000,
      },
    ],
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_size: 1,
        burst_count: 6000,
        gap: 1,
        gap_unit: BurstGapUnit.MS,
        rate: 1000,
        rate_unit: BurstRateUnit.FRAME_PER_SEC,
      },
    },
    wait_time: 1000,
    wait_for_completion: false,
  });

  testHelper.sleep(1000);
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.D}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.41\\.1,\\s+via"),
    30_000,
    true,
  );
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  testHelper.sleep(6000);
  testHelper.stopStream(StreamPort.A);
  testHelper.addPktChecker({
    port: StreamPort.B,
    packet: new PacketBuilder().setIPv4({
      src: "198.51.100.2",
      dst: "203.0.113.2",
    }),
    expected_count: GreaterThan(6000 - 50),
  });

  // 恢复 A-D，确认 ECMP 与每个成员的 LFA 均回到基线。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.D}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.41\\.1,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    perEcmpLfaRows,
    120_000,
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
    `interface ${Port.B}`,
    "no shutdown",
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
    `interface ${Port.A}`,
    "no shutdown",
    "no ip address",
    "switchport",
    "exit",
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
    "no arp 203.0.113.2",
    "no interface loopback0",
    "end",
  ]);

  testHelper.CleanConfigDutD([
    "configure terminal",
    "no router ospf",
    `interface ${Port.C}`,
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

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
