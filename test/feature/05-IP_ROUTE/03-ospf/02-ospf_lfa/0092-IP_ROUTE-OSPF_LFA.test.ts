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
  testHelper = new TestHelper(LinkConstraint.six_devices_topo_links_type_5);
  await testHelper.init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * 6 设备双 ECMP 主路径 + 两条独立 LFA 备份路径：
 *
 *   StreamPort.A -- DUTA PortE
 *   DUTA PortA   <=> DUTB PortA      A-B  ECMP 主路径 1
 *   DUTA PortB   <=> DUTC PortA      A-C  ECMP 主路径 2
 *   DUTA PortC   <=> DUTD PortA      A-D  B 成员的独立 LFA 首跳
 *   DUTA PortD   <=> DUTE PortA      A-E  C 成员的独立 LFA 首跳
 *   DUTB PortB   <=> DUTF PortA      B-F
 *   DUTC PortB   <=> DUTF PortB      C-F
 *   DUTD PortB   <=> DUTB PortC      D-B
 *   DUTE PortB   <=> DUTC PortC      E-C
 *   DUTF PortC   -- StreamPort.B
 *
 * 全部链路开销为 1，DUTA 到 203.0.113.0/24 的主路径为 A-B-F 和 A-C-F，
 * 开销均为 2，形成两个 ECMP 成员。
 *
 * 设备优先节点保护 LFA 时，预期：
 *   Primary 2.2.2.2（DUTB） -> Backup 10.0.15.2（DUTE，A-E-C-F）
 *   Primary 3.3.3.3（DUTC） -> Backup 10.0.14.2（DUTD，A-D-B-F）
 * 若实现选择链路保护候选，则 B->D、C->E 的独立配对同样满足判定。
 *
 * 为排除“另一个 ECMP 成员恰好也是 LFA”的干扰，在 DUTA 连接 DUTB/DUTC
 * 的接口上执行 candidate disable，使两个主下一跳不再作为彼此的备份。
 *
 * 地址规划：
 *   A-B: 10.0.12.0/24   A=.1  B=.2
 *   A-C: 10.0.13.0/24   A=.1  C=.2
 *   A-D: 10.0.14.0/24   A=.1  D=.2
 *   A-E: 10.0.15.0/24   A=.1  E=.2
 *   B-F: 10.0.26.0/24   B=.1  F=.2
 *   C-F: 10.0.36.0/24   C=.1  F=.2
 *   D-B: 10.0.24.0/24   D=.1  B=.2
 *   E-C: 10.0.35.0/24   E=.1  C=.2
 *   A 注入: 198.51.100.1/24
 *   F 出口: 203.0.113.1/24，测试仪 B=203.0.113.2
 *   Loopback0: A=1.1.1.1/32  B=2.2.2.2/32  C=3.3.3.3/32
 *              D=4.4.4.4/32  E=5.5.5.5/32  F=6.6.6.6/32
 */
test("6 设备双 ECMP 主路径下，每个成员分别使用独立的第三方 LFA 备份路径", async () => {
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
    "ip address 10.0.13.1/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.14.1/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.15.1/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.E}`,
    "no switchport",
    "no shutdown",
    "ip address 198.51.100.1/24",
    "exit",
    "interface loopback0",
    "ip address 1.1.1.1/32",
    "no shutdown",
    "exit",
    "router ospf",
    "router-id 1.1.1.1",
    "network 10.0.12.0/24 area 0",
    "network 10.0.13.0/24 area 0",
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
    "no shutdown",
    "ip address 10.0.12.2/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.26.1/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.24.2/24",
    "ip ospf network point-to-point",
    "exit",
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "no shutdown",
    "exit",
    "router ospf",
    "router-id 2.2.2.2",
    "network 10.0.12.0/24 area 0",
    "network 10.0.26.0/24 area 0",
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
    "no shutdown",
    "ip address 10.0.13.2/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.36.1/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.35.2/24",
    "ip ospf network point-to-point",
    "exit",
    "interface loopback0",
    "ip address 3.3.3.3/32",
    "no shutdown",
    "exit",
    "router ospf",
    "router-id 3.3.3.3",
    "network 10.0.13.0/24 area 0",
    "network 10.0.36.0/24 area 0",
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
    "no shutdown",
    "ip address 10.0.14.2/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.24.1/24",
    "ip ospf network point-to-point",
    "exit",
    "interface loopback0",
    "ip address 4.4.4.4/32",
    "no shutdown",
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
    "no shutdown",
    "ip address 10.0.15.2/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.35.1/24",
    "ip ospf network point-to-point",
    "exit",
    "interface loopback0",
    "ip address 5.5.5.5/32",
    "no shutdown",
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

  testHelper.ExecConfigDutF([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.26.2/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.36.2/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "no shutdown",
    "ip address 203.0.113.1/24",
    "exit",
    "interface loopback0",
    "ip address 6.6.6.6/32",
    "no shutdown",
    "exit",
    "arp 203.0.113.2 0002.0002.0002",
    "router ospf",
    "router-id 6.6.6.6",
    "network 10.0.26.0/24 area 0",
    "network 10.0.36.0/24 area 0",
    "network 203.0.113.0/24 area 0",
    "network 6.6.6.6/32 area 0",
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

  // 邻居 Full 后再禁用两个主接口的候选角色，避免 DUTB/DUTC 以更低开销
  // 抢走对方的 LFA 备份；该配置会触发 LFA 重新计算。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "ip ospf fast-reroute per-prefix candidate disable",
    "exit",
    `interface ${Port.B}`,
    "ip ospf fast-reroute per-prefix candidate disable",
    "end",
  ]);

  // 目标前缀在 A 上形成经 B 和 C 的两条等价主路径。
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.13\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA("show ip ospf route", "203.0.113.0/24", 90_000);
  testHelper.ExecRetMatchDutA("show ip ospf route", [
    "203.0.113.0/24",
    "via 10.0.12.2",
    "via 10.0.13.2",
  ]);

  // B/C 两个成员必须各自使用 D、E 中不同的一个作为备份，且不能是另一个
  // ECMP 成员。设备优先节点保护时预期 B->E、C->D；若实现按链路保护
  // 候选选择，B->D、C->E 也满足“每个成员各自一条独立备份路径”。
  const dedicatedLfaRows = new RegExp(
    "(?:" +
      "(?=[\\s\\S]*203\\.0\\.113\\.0/24\\s+\\S+\\s+2\\.2\\.2\\.2\\s+10\\.0\\.14\\.2)" +
      "(?=[\\s\\S]*203\\.0\\.113\\.0/24\\s+\\S+\\s+3\\.3\\.3\\.3\\s+10\\.0\\.15\\.2)" +
      "|" +
      "(?=[\\s\\S]*203\\.0\\.113\\.0/24\\s+\\S+\\s+2\\.2\\.2\\.2\\s+10\\.0\\.15\\.2)" +
      "(?=[\\s\\S]*203\\.0\\.113\\.0/24\\s+\\S+\\s+3\\.3\\.3\\.3\\s+10\\.0\\.14\\.2)" +
      ")",
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    dedicatedLfaRows,
    120_000,
  );
  testHelper.ExecRetMatchDutA(
    "show ip ospf fast-reroute per-prefix",
    dedicatedLfaRows,
  );
  // 反向确认两个成员没有互为备份。
  testHelper.ExecRetMatchDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp(
      "203\\.0\\.113\\.0/24\\s+\\S+\\s+2\\.2\\.2\\.2\\s+10\\.0\\.13\\.2",
    ),
    true,
  );
  testHelper.ExecRetMatchDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp(
      "203\\.0\\.113\\.0/24\\s+\\S+\\s+3\\.3\\.3\\.3\\s+10\\.0\\.12\\.2",
    ),
    true,
  );
  testHelper.ReadyCheckDutA("ping 6.6.6.6", " 0% packet loss", 60_000);

  // 故障周期 1：只关闭 A-B，验证 B 成员删除后仍无整前缀黑洞。
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
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.13\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    30_000,
    true,
  );
  testHelper.ReadyCheckDutA("ping 6.6.6.6", " 0% packet loss", 60_000);

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
    "show ip ospf fast-reroute per-prefix",
    dedicatedLfaRows,
    120_000,
  );

  // 故障周期 2：只关闭 A-C，验证 C 成员删除后仍无整前缀黑洞。
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
    `interface ${Port.B}`,
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
    new RegExp("10\\.0\\.13\\.2,\\s+via"),
    30_000,
    true,
  );
  testHelper.ReadyCheckDutA("ping 6.6.6.6", " 0% packet loss", 60_000);

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

  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.B}`,
    "no shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.13\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    dedicatedLfaRows,
    120_000,
  );

  // 故障周期 3：同时关闭 A-B 和 A-C，两个 ECMP 主路径都失效，
  // 流量应分别沿两条独立 LFA 路径 A-D-B-F 和 A-E-C-F 转发。
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
    `interface ${Port.A}`,
    "shutdown",
    "exit",
    `interface ${Port.B}`,
    "shutdown",
    "end",
  ]);
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.14\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.15\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA("ping 6.6.6.6", " 0% packet loss", 60_000);

  testHelper.sleep(6000);
  testHelper.stopStream(StreamPort.A);
  testHelper.addPktChecker({
    port: StreamPort.B,
    packet: new PacketBuilder().setIPv4({
      src: "198.51.100.2",
      dst: "203.0.113.2",
    }),
    // 双主下一跳同时故障属于叠加故障，丢包判据放宽到少于 100 个。
    expected_count: GreaterThan(6000 - 100),
  });

  // 恢复两个 ECMP 主接口，确认 ECMP 与两条独立 LFA 明细回到基线。
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
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.13\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    dedicatedLfaRows,
    120_000,
  );
  testHelper.ReadyCheckDutA("ping 6.6.6.6", " 0% packet loss", 60_000);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router ospf",
    `interface ${Port.A}`,
    "no shutdown",
    "no ip ospf fast-reroute per-prefix candidate disable",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "no shutdown",
    "no ip ospf fast-reroute per-prefix candidate disable",
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
    `interface ${Port.D}`,
    "no shutdown",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.E}`,
    "no shutdown",
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
    `interface ${Port.C}`,
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

  testHelper.CleanConfigDutE([
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

  testHelper.CleanConfigDutF([
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
    `interface ${Port.C}`,
    "no shutdown",
    "no ip address",
    "switchport",
    "exit",
    "no arp 203.0.113.2",
    "no interface loopback0",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
