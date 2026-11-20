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
 * 不依赖 IP BFD，仅靠本地接口 shutdown 触发 OSPF LFA。
 *
 *   StreamPort.A -- DUTA PortB
 *   DUTA PortA   <=> DUTB PortA
 *   DUTB PortB   <=> DUTC PortB
 *   DUTC PortC   <=> DUTD PortC
 *   DUTD PortD   <=> DUTA PortD
 *   DUTC PortA   -- StreamPort.B
 *
 * 拓扑和地址与 0042 相同，A-D 开销 10，A 到 203.0.113.0/24 的主路径为
 * A-B-C，LFA 备份为 A-D-C。区别是本用例不配置 IP BFD，只依赖 A 本地
 * PortA shutdown 事件触发 LFA/OSPF 处理。
 *
 * 测试仪以 1 包/ms 发送 5000 个报文；丢包数近似等于切换中断的毫秒数。
 * 本用例用于测量无 BFD 时的切换时间：本地接口 shutdown 后，LFA 表
 * 已有备份条目，期望数据面在 50ms 内完成切换。
 */
test("不依赖 BFD 时本地接口 shutdown 的 LFA 切换时间小于 50ms", async () => {
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
    "ip ospf cost 10",
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
    "ip ospf cost 10",
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

  // 不等待 BFD；只等待 OSPF 邻居、目标路由和 LFA 明细收敛。
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
  testHelper.ReadyCheckDutB(
    "show ip ospf neighbor",
    new RegExp("1\\.1\\.1\\.1\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutB(
    "show ip ospf neighbor",
    new RegExp("3\\.3\\.3\\.3\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutC(
    "show ip ospf neighbor",
    new RegExp("2\\.2\\.2\\.2\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutC(
    "show ip ospf neighbor",
    new RegExp("4\\.4\\.4\\.4\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutD(
    "show ip ospf neighbor",
    new RegExp("3\\.3\\.3\\.3\\s+\\d+\\s+Full"),
    120_000,
  );
  testHelper.ReadyCheckDutD(
    "show ip ospf neighbor",
    new RegExp("1\\.1\\.1\\.1\\s+\\d+\\s+Full"),
    120_000,
  );

  testHelper.ReadyCheckDutD(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.34\\.1,\\s+via"),
    120_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.12\\.2,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("203\\.0\\.113\\.0/24[\\s\\S]*?10\\.0\\.41\\.1"),
    120_000,
  );

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

  // PacketSender 启动后固定等待 3s，故障点位于发流后约 4s。
  testHelper.sleep(1000);
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "shutdown",
    "end",
  ]);

  // 没有 BFD 时，控制面需要等 OSPF 处理本地接口 down 后再切到 A-D-C。
  testHelper.ReadyCheckDutA(
    "show ip route 203.0.113.2",
    new RegExp("10\\.0\\.41\\.1,\\s+via"),
    90_000,
  );
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  testHelper.sleep(12000);
  testHelper.stopStream(StreamPort.A);

  // 1 包/ms 下，丢包少于 50 表示切换中断小于 50ms。
  testHelper.addPktChecker({
    port: StreamPort.B,
    packet: new PacketBuilder().setIPv4({
      src: "198.51.100.2",
      dst: "203.0.113.2",
    }),
    expected_count: GreaterThan(5000 - 50),
  });

  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no shutdown",
    "end",
  ]);
  // 本用例只测量故障切换；回切不作为判定项，给 OSPF 留出恢复时间后直接清理。
  testHelper.sleep(5000);

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
