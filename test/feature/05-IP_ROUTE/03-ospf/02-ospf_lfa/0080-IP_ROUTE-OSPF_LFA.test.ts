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

jest.setTimeout(1000 * 60 * 15);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = new TestHelper(LinkConstraint.two_devices_topo_links_type_4);
  await testHelper.init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * 并行链路反复主备切换稳定性：对 A-B 主链路执行 3 次“关闭 -> 恢复”。
 * PortA 为主链路（开销 1），PortB 为备份链路（开销 10）；A 到
 * 203.0.113.0/24 的主路径经 PortA，LFA 备份下一跳经 PortB。
 *
 *   StreamPort.A <=> DUTA PortD
 *   DUTA PortA   <=> DUTB PortA
 *   DUTA PortB   <=> DUTB PortB
 *   DUTB PortD   <=> StreamPort.B
 *
 * 地址规划：
 *   A-B 主链路: 10.0.12.0/24   A=.1  B=.2（开销 1）
 *   A-B 备链路: 10.0.21.0/24   A=.1  B=.2（开销 10）
 *   A 注入: 198.51.100.1/24
 *   B 出口: 203.0.113.1/24，测试仪 B=203.0.113.2
 *   Loopback0: A=1.1.1.1/32  B=2.2.2.2/32
 *
 * 所有 OSPF 点对点接口使能 BFD（mintx 3ms、minrx 3ms、multiplier 3），
 * 每个周期发送 6000 个报文，要求单周期丢包少于 50 个。
 */
test("并行链路连续 3 次故障恢复后，LFA 切换与单周期丢包不超过 50 个", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.12.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "bfd interval mintx 3 minrx 3 multiplier 3",
    "ip ospf bfd",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.21.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "bfd interval mintx 3 minrx 3 multiplier 3",
    "ip ospf bfd",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "no shutdown",
    "ip address 198.51.100.1/24",
    "exit",
    "interface loopback0",
    "ip address 1.1.1.1/32",
    "no shutdown",
    "exit",
    "router ospf",
    "network 10.0.12.0/24 area 0",
    "network 10.0.21.0/24 area 0",
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
    "ip ospf cost 1",
    "bfd interval mintx 3 minrx 3 multiplier 3",
    "ip ospf bfd",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "no shutdown",
    "ip address 10.0.21.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "bfd interval mintx 3 minrx 3 multiplier 3",
    "ip ospf bfd",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "no shutdown",
    "ip address 203.0.113.1/24",
    "exit",
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "no shutdown",
    "exit",
    "arp 203.0.113.2 0002.0002.0002",
    "router ospf",
    "network 10.0.12.0/24 area 0",
    "network 10.0.21.0/24 area 0",
    "network 203.0.113.0/24 area 0",
    "network 2.2.2.2/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 90_000);

  // BFD 单跳报文需要先解析两条直连链路的 ARP。
  testHelper.ReadyCheckDutA("ping 10.0.12.2", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutA("ping 10.0.21.2", " 0% packet loss", 60_000);

  const bfdSessionsUp = new RegExp(
    "Session State : Up[\\s\\S]*Session State : Up",
  );
  testHelper.ReadyCheckDutA("show bfd session detail", bfdSessionsUp, 90_000);
  testHelper.ReadyCheckDutB("show bfd session detail", bfdSessionsUp, 90_000);

  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("203\\.0\\.113\\.0/24[\\s\\S]*?10\\.0\\.21\\.2"),
    120_000,
  );

  for (let cycle = 1; cycle <= 3; cycle++) {
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

    // PacketSender 启动后固定等待 3s，故障点位于本周期发流后约 4s。
    testHelper.sleep(1000);
    testHelper.ExecConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "shutdown",
      "end",
    ]);
    testHelper.ReadyCheckDutA(
      "show ip route 203.0.113.2",
      new RegExp("10\\.0\\.21\\.2,\\s+via"),
      90_000,
    );
    testHelper.ReadyCheckDutA("ping 2.2.2.2", " 0% packet loss", 60_000);

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
      new RegExp("203\\.0\\.113\\.0/24[\\s\\S]*?10\\.0\\.21\\.2"),
      120_000,
    );
    testHelper.ReadyCheckDutA("ping 2.2.2.2", " 0% packet loss", 60_000);
  }

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router ospf",
    `interface ${Port.A}`,
    "no shutdown",
    "no ip ospf bfd",
    "no bfd interval",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "no shutdown",
    "no ip ospf bfd",
    "no bfd interval",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.D}`,
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
    "no ip ospf bfd",
    "no bfd interval",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "no shutdown",
    "no ip ospf bfd",
    "no bfd interval",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.D}`,
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
