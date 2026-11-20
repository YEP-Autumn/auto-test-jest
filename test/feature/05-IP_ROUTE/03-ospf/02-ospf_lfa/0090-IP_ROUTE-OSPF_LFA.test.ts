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
 * ECMP 与 LFA 共存：四设备环全部链路使用相同开销。
 * DUTA 到 203.0.113.0/24 存在两条等价路径 A-B-C 和 A-D-C，
 * OSPF 应形成 ECMP；关闭 A-B 后，A-D-C 应接管且不出现整前缀黑洞。
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
 * 所有链路开销保持默认值 1，A 到目标前缀形成 ECMP。
 * 本用例不使用 BFD，故障由本地接口 shutdown 触发。
 */
test("等开销 ECMP 下单路径故障时流量切到另一条等价路径，1 包/ms 丢包少于 50 个", async () => {
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

  // 先确认目标前缀在 A 上形成两条等价路径。
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
  testHelper.ExecRetMatchDutA("show ip ospf route", [
    "203.0.113.0/24",
    "via 10.0.12.2",
    "via 10.0.41.1",
  ]);
  testHelper.ExecRetMatchDutA("show ip ospf fast-reroute per-prefix", [
    new RegExp("Fast-reroute per-prefix\\s*:\\s*enabled"),
    new RegExp("Intra-area prefixes\\s*:\\s*[1-9]\\d*"),
  ]);

  testHelper.startCapture(StreamPort.B);

  // 每个报文使用不同的 UDP 源端口，避免单条五元组只哈希到一条 ECMP 路径。
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
        count: 5000,
      },
    ],
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

  // 关闭 A-B 路径，ECMP 退化为 A-D-C。
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
  testHelper.ReadyCheckDutA("ping 3.3.3.3", " 0% packet loss", 60_000);

  // 等待剩余报文发送完成，统计接收匹配数。
  testHelper.sleep(12000);
  testHelper.stopStream(StreamPort.A);

  testHelper.addPktChecker({
    port: StreamPort.B,
    packet: new PacketBuilder().setIPv4({
      src: "198.51.100.2",
      dst: "203.0.113.2",
    }),
    expected_count: GreaterThan(5000 - 50),
  });

  // 恢复 A-B 路径，等待 ECMP 重新形成。
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
