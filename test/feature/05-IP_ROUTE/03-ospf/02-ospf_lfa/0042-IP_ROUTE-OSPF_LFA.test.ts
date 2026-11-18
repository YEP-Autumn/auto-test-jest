import {
  BurstGapUnit,
  BurstRateUnit,
  DeviceARouteMac,
  GreaterThan,
  LinkConstraint,
  PacketBuilder,
  Port,
  StreamPort,
  TestHelper,
  TransmitMode,
} from "@/utils";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = new TestHelper(LinkConstraint.four_devices_topo_links_type_6);
  await testHelper.init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * LFA 保护切换性能：四设备环形组网 A-B-C-D-A，A-D 开销 10，
 * A 到 C 侧前缀 203.0.113.0/24 的主路径为 A-B-C，LFA 备份为 A-D-C。
 * 测试仪以 1 包/ms 从 A 侧注入 UDP 流，在 C 侧收包；
 * 断开 A-B 后要求丢包少于 50 个，即切换中断小于 50ms。
 *
 *   StreamPort.A -- DUTA PortB
 *   DUTA PortA <=> DUTB PortA
 *   DUTB PortB <=> DUTC PortB
 *   DUTC PortC <=> DUTD PortC
 *   DUTD PortD <=> DUTA PortD
 *   DUTC PortA -- StreamPort.B
 *
 * 地址规划：
 *   A-B: 10.0.12.0/24     A=.1  B=.2
 *   B-C: 10.0.23.0/24     B=.1  C=.2
 *   C-D: 10.0.34.0/24     C=.1  D=.2
 *   D-A: 10.0.41.0/24     D=.1  A=.2（开销 10）
 *   A 注入: 198.51.100.1/24
 *   C 出口: 203.0.113.1/24，测试仪 B=203.0.113.2
 *   Loopback0: A=1.1.1.1/32  B=2.2.2.2/32  C=3.3.3.3/32  D=4.4.4.4/32
 *
 * 所有 OSPF 点对点接口同时使能 BFD（mintx 3ms、minrx 3ms、multiplier 3），
 * 由 BFD 快速检测邻居故障，配合 LFA 完成保护切换。
 */
test("OSPF LFA + BFD 保护切换时 1 包/ms 流量丢包少于 50 个", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.12.1/24",
    "ip ospf network point-to-point",
    "bfd interval mintx 3 minrx 3 multiplier 3",
    "ip ospf bfd",
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
    "ip ospf cost 10",
    "bfd interval mintx 3 minrx 3 multiplier 3",
    "ip ospf bfd",
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
    "bfd interval mintx 3 minrx 3 multiplier 3",
    "ip ospf bfd",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.23.1/24",
    "ip ospf network point-to-point",
    "bfd interval mintx 3 minrx 3 multiplier 3",
    "ip ospf bfd",
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
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.23.2/24",
    "ip ospf network point-to-point",
    "bfd interval mintx 3 minrx 3 multiplier 3",
    "ip ospf bfd",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.34.1/24",
    "ip ospf network point-to-point",
    "bfd interval mintx 3 minrx 3 multiplier 3",
    "ip ospf bfd",
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
    "bfd interval mintx 3 minrx 3 multiplier 3",
    "ip ospf bfd",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.41.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "bfd interval mintx 3 minrx 3 multiplier 3",
    "ip ospf bfd",
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

  // 每台 DUT 各有两条 OSPF 邻居，BFD 会话需全部 Up。
  const bfdSessionsUp = new RegExp(
    "Session State : Up[\\s\\S]*Session State : Up",
  );
  testHelper.ReadyCheckDutA("show bfd session detail", bfdSessionsUp, 90_000);
  testHelper.ReadyCheckDutB("show bfd session detail", bfdSessionsUp, 90_000);
  testHelper.ReadyCheckDutC("show bfd session detail", bfdSessionsUp, 90_000);
  testHelper.ReadyCheckDutD("show bfd session detail", bfdSessionsUp, 90_000);

  // 主路径唯一经 B，LFA 备份经 D；确认受保护后再打流。
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    90_000,
  );
  // 必须等到目标前缀本身出现在 LFA 明细表，不能只看保护计数 > 0：
  // 其他前缀先被保护时，目标前缀可能仍在 deferred/retries 中。
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("203\\.0\\.113\\.0/24[\\s\\S]*?10\\.0\\.41\\.1"),
    120_000,
  );

  testHelper.startCapture(StreamPort.B);

  // 每 1ms 发 1 帧：burst 间 gap 1ms，burst 内 5000 FPS。
  // 5000 个 burst 共 5000 包，发送约 6s；发送不等待完成。
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
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_size: 1,
        burst_count: 5000,
        gap: 1,
        gap_unit: BurstGapUnit.MS,
        rate: 5000,
        rate_unit: BurstRateUnit.FRAME_PER_SEC,
      },
    },
    wait_time: 1000,
    wait_for_completion: false,
  });

  // PacketSender 启动后固定等待 3s 再返回，因此故障注入点在发流后约 4s。
  testHelper.sleep(1000);

  // 断开 A-B 主路径，LFA 应在 50ms 内切到 A-D-C。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);

  // 先确认故障后控制面已切到 A-D-C，并验证目的仍可达。
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.41\\.1,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  // 等待剩余报文发送完成（5000 个，约 1 包/ms，含仪表开销约 6~8s）。
  testHelper.sleep(12000);
  testHelper.stopStream(StreamPort.A);

  // 5000 - 50 = 4950；匹配数大于 4950 即丢包少于 50 个。
  testHelper.addPktChecker({
    port: StreamPort.B,
    packet: new PacketBuilder().setIPv4({
      src: "198.51.100.2",
      dst: "203.0.113.2",
    }),
    expected_count: GreaterThan(5000 - 50),
  });

  // 恢复主路径，确认路由回切。
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

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router ospf",
    `interface ${Port.A}`,
    "no shutdown",
    "no ip ospf bfd",
    "no bfd interval",
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
    "no ip ospf cost",
    "no ip ospf bfd",
    "no bfd interval",
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
    "no ip ospf bfd",
    "no bfd interval",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "no shutdown",
    "no ip ospf bfd",
    "no bfd interval",
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
    "no ip ospf bfd",
    "no bfd interval",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "no shutdown",
    "no ip ospf bfd",
    "no bfd interval",
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
    "no ip ospf bfd",
    "no bfd interval",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf bfd",
    "no bfd interval",
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
