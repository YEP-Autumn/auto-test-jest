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
  testHelper = await new TestHelper(
    LinkConstraint.four_devices_topo_links_type_6,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * BGP 路由递归到 OSPF LFA 受保护前缀的性能验证：
 * 四设备环形组网 A-B-C-D-A，A-D 开销 10。
 * C 通过 iBGP 向 A/B/D 通告 203.0.113.0/24；A 的下一跳为 10.0.23.2，
 * A 的 BGP 路由递归到 OSPF 前缀 10.0.23.0/24，该前缀主路径为 A-B-C，
 * LFA 备份为 A-D-C。B/D 也运行 iBGP，并由 C 将下一跳设置为直连地址，
 * 使中间路由器具备目的网段路由。
 *
 * 测试仪以 1 包/ms 从 A 侧注入 UDP 流，在 C 侧收包；
 * 断开 A-B 后要求丢包少于 50 个，即切换中断小于 50ms，
 * 同时 BGP 会话保持 Established、BGP 下一跳保持 10.0.23.2，
 * 以证明切换来自 OSPF LFA，而不是 BGP 重新收敛。
 *
 * 已知限制：当前软件版本中，递归 BGP 路由的 FIB 表项不会继承 OSPF LFA
 * 的预安装备份路径。实测丢包约 2100~2500 个（约 2.1~2.5s），与 OSPF/BGP
 * 重新收敛时间相当，未达到 50ms。用例以 test.failing 固化该差距；
 * 固件修复后应改回 test(...)。
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
test.failing(
  "BGP 路由递归到 OSPF LFA 受保护前缀时 1 包/ms 流量丢包少于 50 个",
  async () => {
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
      "router bgp 65002",
      "bgp router-id 1.1.1.1",
      "bgp scan-time 5",
      "neighbor 3.3.3.3 remote-as 65002",
      "neighbor 3.3.3.3 update-source loopback0",
      "address-family ipv4",
      "no synchronization",
      "neighbor 3.3.3.3 activate",
      "exit-address-family",
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
      "router bgp 65002",
      "bgp router-id 2.2.2.2",
      "bgp scan-time 5",
      "neighbor 3.3.3.3 remote-as 65002",
      "neighbor 3.3.3.3 update-source loopback0",
      "address-family ipv4",
      "no synchronization",
      "neighbor 3.3.3.3 activate",
      "exit-address-family",
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
      "route-map NH_A permit 10",
      "set ip next-hop 10.0.23.2",
      "exit",
      "route-map NH_B permit 10",
      "set ip next-hop 10.0.23.2",
      "exit",
      "route-map NH_D permit 10",
      "set ip next-hop 10.0.34.1",
      "exit",
      "router ospf",
      "network 10.0.23.0/24 area 0",
      "network 10.0.34.0/24 area 0",
      "network 3.3.3.3/32 area 0",
      "fast-reroute per-prefix enable",
      "exit",
      "router bgp 65002",
      "bgp router-id 3.3.3.3",
      "bgp scan-time 5",
      "neighbor 1.1.1.1 remote-as 65002",
      "neighbor 1.1.1.1 update-source loopback0",
      "neighbor 2.2.2.2 remote-as 65002",
      "neighbor 2.2.2.2 update-source loopback0",
      "neighbor 4.4.4.4 remote-as 65002",
      "neighbor 4.4.4.4 update-source loopback0",
      "address-family ipv4",
      "no synchronization",
      "network 203.0.113.0 mask 255.255.255.0",
      "neighbor 1.1.1.1 activate",
      "neighbor 1.1.1.1 route-map NH_A out",
      "neighbor 2.2.2.2 activate",
      "neighbor 2.2.2.2 route-map NH_B out",
      "neighbor 4.4.4.4 activate",
      "neighbor 4.4.4.4 route-map NH_D out",
      "exit-address-family",
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
      "router bgp 65002",
      "bgp router-id 4.4.4.4",
      "bgp scan-time 5",
      "neighbor 3.3.3.3 remote-as 65002",
      "neighbor 3.3.3.3 update-source loopback0",
      "address-family ipv4",
      "no synchronization",
      "neighbor 3.3.3.3 activate",
      "exit-address-family",
      "exit",
      "end",
    ]);

    testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 90_000);
    testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 90_000);
    testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 90_000);
    testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 90_000);

    // 每台 DUT 各有一条或两条 OSPF 邻居，BFD 会话需全部 Up。
    const bfdSessionsUp = new RegExp(
      "Session State : Up[\\s\\S]*Session State : Up",
    );
    testHelper.ReadyCheckDutA("show bfd session detail", bfdSessionsUp, 90_000);
    testHelper.ReadyCheckDutB("show bfd session detail", bfdSessionsUp, 90_000);
    testHelper.ReadyCheckDutC("show bfd session detail", bfdSessionsUp, 90_000);
    testHelper.ReadyCheckDutD("show bfd session detail", bfdSessionsUp, 90_000);

    // OSPF 收敛后再触发一次 BGP 连接，避免配置早期失败后的连接定时器退避
    // 让会话在 Active 状态等待 60s 以上。
    testHelper.ExecConfigDutA(["clear ip bgp *"]);
    testHelper.ExecConfigDutB(["clear ip bgp *"]);
    testHelper.ExecConfigDutC(["clear ip bgp *"]);
    testHelper.ExecConfigDutD(["clear ip bgp *"]);

    // BGP 会话通过 Loopback 建立，先等 Established 再确认路由。
    testHelper.ReadyCheckDutA(
      "show ip bgp neighbors 3.3.3.3",
      "BGP state = Established",
      120_000,
    );
    testHelper.ReadyCheckDutC(
      "show ip bgp neighbors 1.1.1.1",
      "BGP state = Established",
      120_000,
    );

    // BGP 路由 203.0.113.0/24 的下一跳为 C 的转发接口地址 10.0.23.2。
    testHelper.ReadyCheckDutA(
      "show ip bgp 203.0.113.0/24",
      new RegExp("203\\.0\\.113\\.0/24[\\s\\S]*10\\.0\\.23\\.2"),
      120_000,
    );

    // 中间路由器 B/D 也要有该 BGP 路由；C 分别把下一跳设置为直连地址，
    // 避免 B/D 因缺少目的网段路由而丢包。
    testHelper.ReadyCheckDutB(
      "show ip bgp 203.0.113.0/24",
      new RegExp("203\\.0\\.113\\.0/24[\\s\\S]*10\\.0\\.23\\.2"),
      120_000,
    );
    testHelper.ReadyCheckDutD(
      "show ip bgp 203.0.113.0/24",
      new RegExp("203\\.0\\.113\\.0/24[\\s\\S]*10\\.0\\.34\\.1"),
      120_000,
    );
    testHelper.ReadyCheckDutB(
      "show ip route 203.0.113.2",
      new RegExp("203\\.0\\.113\\.0/24"),
      90_000,
    );
    testHelper.ReadyCheckDutD(
      "show ip route 203.0.113.2",
      new RegExp("203\\.0\\.113\\.0/24"),
      90_000,
    );

    // BGP 前缀在路由表中；其递归 OSPF 前缀 10.0.23.0/24 的主路径经 A-B-C。
    testHelper.ReadyCheckDutA(
      "show ip route 203.0.113.2",
      new RegExp("203\\.0\\.113\\.0/24"),
      90_000,
    );
    testHelper.ReadyCheckDutA(
      "show ip route 10.0.23.2",
      new RegExp("10\\.0\\.12\\.2,\\s+via"),
      90_000,
    );

    // 必须等到 10.0.23.0/24 本身出现在 LFA 明细表，且备份下一跳为 10.0.41.1。
    testHelper.ReadyCheckDutA(
      "show ip ospf fast-reroute per-prefix",
      new RegExp("10\\.0\\.23\\.0/24[\\s\\S]*?10\\.0\\.41\\.1"),
      120_000,
    );

    // bgp scan-time 5：等待 BGP 下一跳扫描完成、递归路由真正下发到 FIB 后再打流。
    testHelper.sleep(6000);

    // 预热：先发送少量报文，确认故障前的 BGP 转发路径已经生效。
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
          burst_count: 100,
          gap: 1,
          gap_unit: BurstGapUnit.MS,
          rate: 5000,
          rate_unit: BurstRateUnit.FRAME_PER_SEC,
        },
      },
      wait_time: 1000,
      wait_for_completion: false,
    });
    testHelper.sleep(3000);
    testHelper.stopStream(StreamPort.A);
    testHelper.addPktChecker({
      port: StreamPort.B,
      packet: new PacketBuilder().setIPv4({
        src: "198.51.100.2",
        dst: "203.0.113.2",
      }),
      expected_count: GreaterThan(90),
    });

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

    // 断开 A-B 主路径，OSPF LFA 应在 50ms 内把 10.0.23.0/24 切到 A-D-C。
    testHelper.ExecConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "shutdown",
      "end",
    ]);

    // 控制面收敛后，BGP 前缀仍在路由表中，递归 OSPF 下一跳改为经 D。
    testHelper.ReadyCheckDutA(
      "show ip route 203.0.113.2",
      new RegExp("203\\.0\\.113\\.0/24"),
      30_000,
    );
    testHelper.ReadyCheckDutA(
      "show ip route 10.0.23.2",
      new RegExp("10\\.0\\.41\\.1,\\s+via"),
      90_000,
    );

    // BGP 会话与 BGP 下一跳保持不变，证明路由未依赖 BGP 重新收敛。
    testHelper.ReadyCheckDutA(
      "show ip bgp neighbors 3.3.3.3",
      "BGP state = Established",
      30_000,
    );
    testHelper.ReadyCheckDutA(
      "show ip bgp 203.0.113.0/24",
      new RegExp("203\\.0\\.113\\.0/24[\\s\\S]*10\\.0\\.23\\.2"),
      30_000,
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

    // 恢复主路径，确认递归下一跳回切，BGP 会话保持 Established。
    testHelper.ExecConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no shutdown",
      "end",
    ]);
    testHelper.ReadyCheckDutA(
      "show ip route 203.0.113.2",
      new RegExp("203\\.0\\.113\\.0/24"),
      30_000,
    );
    testHelper.ReadyCheckDutA(
      "show ip route 10.0.23.2",
      new RegExp("10\\.0\\.12\\.2,\\s+via"),
      90_000,
    );
    testHelper.ReadyCheckDutA(
      "show ip bgp neighbors 3.3.3.3",
      "BGP state = Established",
      30_000,
    );

    testHelper.CleanConfigDutA([
      "configure terminal",
      "no router bgp 65002",
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
      "no router bgp 65002",
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
      "no router bgp 65002",
      "no route-map NH_A",
      "no route-map NH_B",
      "no route-map NH_D",
      "no router ospf",
      `interface ${Port.A}`,
      "no shutdown",
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
      "no router bgp 65002",
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
  },
);
