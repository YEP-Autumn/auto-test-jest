import {
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
  testHelper = await new TestHelper(
    LinkConstraint.one_device_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *                          +--------+
 *  StreamPort.A <=> PortA--|  DUTA  |--PortB <=> StreamPort.B
 *                          +--------+
 */

describe("VLAN trunk translate 转发行为", () => {
  test("单层唯一映射在 ingress 与 egress 方向均转换 VLAN", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 10,200",
      "exit",
      "ethernet evc 1",
      "dot1q mapped-vlan 200",
      "exit",
      "vlan mapping table vm",
      "raw-vlan 10 evc 1",
      "exit",
      `interface ${Port.A}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk vlan-translation",
      "switchport trunk vlan-translation mapping table vm",
      "switchport trunk allowed vlan all",
      "exit",
      `interface ${Port.B}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk allowed vlan all",
      "end",
    ]);

    /** StreamPort.A 发送 VLAN 10，StreamPort.B 收到 VLAN 200。 */
    testHelper.startCapture(StreamPort.B);
    testHelper.addPktSender({
      port: StreamPort.A,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 10, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      transmit_param: {
        mode: TransmitMode.STEP,
        param: {
          step_count: 10,
        },
      },
    });
    testHelper.addPktChecker({
      port: StreamPort.B,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 200, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      expected_count: 10,
    });

    /** StreamPort.B 发送 VLAN 200，StreamPort.A 收到 VLAN 10。 */
    testHelper.startCapture(StreamPort.A);
    testHelper.addPktSender({
      port: StreamPort.B,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:cc",
          src: "00:00:a0:0a:00:cc",
          type: 0x8100,
        })
        .setVLAN({ vlan: 200, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      transmit_param: {
        mode: TransmitMode.STEP,
        param: {
          step_count: 10,
        },
      },
    });
    testHelper.addPktChecker({
      port: StreamPort.A,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:cc",
          src: "00:00:a0:0a:00:cc",
          type: 0x8100,
        })
        .setVLAN({ vlan: 10, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      expected_count: 10,
    });

    testHelper.CleanConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no switchport trunk vlan-translation mapping table",
      "no switchport trunk vlan-translation",
      "switchport mode access",
      "exit",
      `interface ${Port.B}`,
      "switchport mode access",
      "exit",
      "no vlan mapping table vm",
      "no ethernet evc 1",
      "vlan database",
      "no vlan 10,200",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });

  test("双层唯一映射在 ingress 与 egress 方向仅转换外层 VLAN", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 100,200,400",
      "exit",
      "ethernet evc 2",
      "dot1q mapped-vlan 400",
      "exit",
      "vlan mapping table vm",
      "raw-vlan 100 200 evc 2",
      "exit",
      `interface ${Port.A}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk vlan-translation",
      "switchport trunk vlan-translation mapping table vm",
      "switchport trunk allowed vlan all",
      "exit",
      `interface ${Port.B}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk allowed vlan all",
      "end",
    ]);

    /** StreamPort.A 发送外层 200、内层 100，StreamPort.B 收到外层 400、内层 100。 */
    testHelper.startCapture(StreamPort.B);
    testHelper.addPktSender({
      port: StreamPort.A,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 200, type: 0x8100 })
        .setVLAN({ vlan: 100, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      transmit_param: {
        mode: TransmitMode.STEP,
        param: {
          step_count: 10,
        },
      },
    });
    testHelper.addPktChecker({
      port: StreamPort.B,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 400, type: 0x8100 })
        .setVLAN({ vlan: 100, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      expected_count: 10,
    });

    /** StreamPort.B 发送外层 400、内层 100，StreamPort.A 收到外层 200、内层 100。 */
    testHelper.startCapture(StreamPort.A);
    testHelper.addPktSender({
      port: StreamPort.B,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:cc",
          src: "00:00:a0:0a:00:cc",
          type: 0x8100,
        })
        .setVLAN({ vlan: 400, type: 0x8100 })
        .setVLAN({ vlan: 100, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      transmit_param: {
        mode: TransmitMode.STEP,
        param: {
          step_count: 10,
        },
      },
    });
    testHelper.addPktChecker({
      port: StreamPort.A,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:cc",
          src: "00:00:a0:0a:00:cc",
          type: 0x8100,
        })
        .setVLAN({ vlan: 200, type: 0x8100 })
        .setVLAN({ vlan: 100, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      expected_count: 10,
    });

    testHelper.CleanConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no switchport trunk vlan-translation mapping table",
      "no switchport trunk vlan-translation",
      "switchport mode access",
      "exit",
      `interface ${Port.B}`,
      "switchport mode access",
      "exit",
      "no vlan mapping table vm",
      "no ethernet evc 2",
      "vlan database",
      "no vlan 100,200,400",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });

  test("out-of-range 将未匹配 VLAN 转换到指定 EVC 且不影响已匹配 VLAN", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 10,11,200,300",
      "exit",
      "ethernet evc 1",
      "dot1q mapped-vlan 200",
      "exit",
      "ethernet evc 2",
      "dot1q mapped-vlan 300",
      "exit",
      "vlan mapping table vm",
      "raw-vlan 10 evc 1",
      "raw-vlan out-of-range evc 2",
      "exit",
      `interface ${Port.A}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk vlan-translation",
      "switchport trunk vlan-translation mapping table vm",
      "switchport trunk allowed vlan all",
      "exit",
      `interface ${Port.B}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk allowed vlan all",
      "end",
    ]);

    /** 已匹配 VLAN 10 按显式条目转换到 200，不被 out-of-range 覆盖。 */
    testHelper.startCapture(StreamPort.B);
    testHelper.addPktSender({
      port: StreamPort.A,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 10, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      transmit_param: {
        mode: TransmitMode.STEP,
        param: {
          step_count: 10,
        },
      },
    });
    testHelper.addPktChecker({
      port: StreamPort.B,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 200, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      expected_count: 10,
    });

    /** 未匹配 VLAN 11 按 out-of-range 条目转换到 300。 */
    testHelper.startCapture(StreamPort.B);
    testHelper.addPktSender({
      port: StreamPort.A,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 11, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      transmit_param: {
        mode: TransmitMode.STEP,
        param: {
          step_count: 10,
        },
      },
    });
    testHelper.addPktChecker({
      port: StreamPort.B,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 300, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      expected_count: 10,
    });

    testHelper.CleanConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no switchport trunk vlan-translation mapping table",
      "no switchport trunk vlan-translation",
      "switchport mode access",
      "exit",
      `interface ${Port.B}`,
      "switchport mode access",
      "exit",
      "no vlan mapping table vm",
      "no ethernet evc 1",
      "no ethernet evc 2",
      "vlan database",
      "no vlan 10,11,200,300",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });

  test("多个 raw-vlan 映射同一 EVC 时 ingress 均转换为相同 mapped VLAN", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 10,20,200",
      "exit",
      "ethernet evc 1",
      "dot1q mapped-vlan 200",
      "exit",
      "vlan mapping table vm",
      "raw-vlan 10 evc 1",
      "raw-vlan 20 evc 1",
      "exit",
      `interface ${Port.A}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk vlan-translation",
      "switchport trunk vlan-translation mapping table vm",
      "switchport trunk allowed vlan all",
      "exit",
      `interface ${Port.B}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk allowed vlan all",
      "end",
    ]);

    testHelper.startCapture(StreamPort.B);
    testHelper.addPktSender({
      port: StreamPort.A,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 10, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      transmit_param: {
        mode: TransmitMode.STEP,
        param: {
          step_count: 10,
        },
      },
    });
    testHelper.addPktChecker({
      port: StreamPort.B,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 200, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      expected_count: 10,
    });

    testHelper.startCapture(StreamPort.B);
    testHelper.addPktSender({
      port: StreamPort.A,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 20, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      transmit_param: {
        mode: TransmitMode.STEP,
        param: {
          step_count: 10,
        },
      },
    });
    testHelper.addPktChecker({
      port: StreamPort.B,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 200, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      expected_count: 10,
    });

    testHelper.CleanConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no switchport trunk vlan-translation mapping table",
      "no switchport trunk vlan-translation",
      "switchport mode access",
      "exit",
      `interface ${Port.B}`,
      "switchport mode access",
      "exit",
      "no vlan mapping table vm",
      "no ethernet evc 1",
      "vlan database",
      "no vlan 10,20,200",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });

  test("不同 EVC 使用相同 mapped VLAN 时 ingress 均转换为该 mapped VLAN", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 10,20,200",
      "exit",
      "ethernet evc 1",
      "dot1q mapped-vlan 200",
      "exit",
      "ethernet evc 2",
      "dot1q mapped-vlan 200",
      "exit",
      "vlan mapping table vm",
      "raw-vlan 10 evc 1",
      "raw-vlan 20 evc 2",
      "exit",
      `interface ${Port.A}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk vlan-translation",
      "switchport trunk vlan-translation mapping table vm",
      "switchport trunk allowed vlan all",
      "exit",
      `interface ${Port.B}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk allowed vlan all",
      "end",
    ]);

    testHelper.startCapture(StreamPort.B);
    testHelper.addPktSender({
      port: StreamPort.A,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 10, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      transmit_param: {
        mode: TransmitMode.STEP,
        param: {
          step_count: 10,
        },
      },
    });
    testHelper.addPktChecker({
      port: StreamPort.B,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 200, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      expected_count: 10,
    });

    testHelper.startCapture(StreamPort.B);
    testHelper.addPktSender({
      port: StreamPort.A,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 20, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      transmit_param: {
        mode: TransmitMode.STEP,
        param: {
          step_count: 10,
        },
      },
    });
    testHelper.addPktChecker({
      port: StreamPort.B,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:00:01:00:00:ee",
          src: "00:00:a0:0a:00:66",
          type: 0x8100,
        })
        .setVLAN({ vlan: 200, type: 0x0800 })
        .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
      expected_count: 10,
    });

    testHelper.CleanConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no switchport trunk vlan-translation mapping table",
      "no switchport trunk vlan-translation",
      "switchport mode access",
      "exit",
      `interface ${Port.B}`,
      "switchport mode access",
      "exit",
      "no vlan mapping table vm",
      "no ethernet evc 1",
      "no ethernet evc 2",
      "vlan database",
      "no vlan 10,20,200",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });
});
