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
  testHelper = new TestHelper(LinkConstraint.two_devices_topo_links_type_1);
  await testHelper.init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * 并行链路 LFA 保护切换打流：DUTA 与 DUTB 之间有两条链路，
 * PortA 为主链路（开销 1），PortC 为备份链路（开销 10）。
 * A 到 203.0.113.0/24 的主路径经 PortA，LFA 备份下一跳经 PortC。
 * 测试仪以 1 包/ms 从 A 侧注入 UDP 流，在 B 侧收包；
 * 关闭 A 的 PortA 后要求丢包少于 50 个，即切换中断小于 50ms。
 *
 *   StreamPort.A <=> DUTA PortD
 *   DUTA PortA   <=> DUTB PortA
 *   DUTA PortC   <=> DUTB PortC
 *   DUTB PortD   <=> StreamPort.B
 *
 * 地址规划：
 *   A-B 主链路: 10.0.12.0/24   A=.1  B=.2（开销 1）
 *   A-B 备链路: 10.0.21.0/24   A=.1  B=.2（开销 10）
 *   A 注入: 198.51.100.1/24
 *   B 出口: 203.0.113.1/24，测试仪 B=203.0.113.2
 *   Loopback0: A=1.1.1.1/32  B=2.2.2.2/32
 *
 * 所有 OSPF 点对点接口同时使能 BFD（mintx 3ms、minrx 3ms、multiplier 3），
 * 由 BFD 快速检测邻居故障，配合 LFA 完成保护切换。
 */
test("并行链路主链路故障后 LFA 切换到备份链路，1 包/ms 流量丢包少于 50 个", async () => {
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
    `interface ${Port.C}`,
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
    `interface ${Port.C}`,
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
  testHelper.ReadyCheckDutA("ping 10.0.12.2", " 0% packet loss", 60_000);
  testHelper.ReadyCheckDutA("ping 10.0.21.2", " 0% packet loss", 60_000);

  const bfdSessionsUp = new RegExp(
    "Session State : Up[\\s\\S]*Session State : Up",
  );
  testHelper.ReadyCheckDutA("show bfd session detail", bfdSessionsUp, 90_000);
  testHelper.ReadyCheckDutB("show bfd session detail", bfdSessionsUp, 90_000);

  // 主路径唯一经 PortA；确认目标前缀本身已安装 LFA 备份，
  // 不能只看 Protected by LFA > 0，否则其他前缀可能先被保护。
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

  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    new RegExp("Fast-reroute per-prefix\\s*:\\s*enabled"),
    new RegExp("Protected by LFA\\s*:\\s*[1-9]\\d*"),
  ]);
  testHelper.ExecRetMatchDutA("show ip ospf route", [
    "203.0.113.0/24",
    "via 10.0.12.2",
  ]);

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

  // 断开 A-B 主链路，LFA 应切到 PortC 备份链路。
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);

  // 先确认故障后控制面已切到备份链路，并验证目的仍可达。
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.21\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA("ping 2.2.2.2", " 0% packet loss", 60_000);

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

  // 恢复主链路，确认路由回切。
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
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.C}`,
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
    `interface ${Port.C}`,
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
