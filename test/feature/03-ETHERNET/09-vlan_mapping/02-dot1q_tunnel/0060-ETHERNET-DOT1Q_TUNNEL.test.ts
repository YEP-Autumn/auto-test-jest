import {
  LinkConstraint,
  PacketBuilder,
  Port,
  StreamPort,
  TestHelper,
  TransmitMode,
} from "@/utils";

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

test("支持为指定VLAN范围的报文添加不同的外层VLAN Tag", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "vlan database",
    "vlan 2-200",
    "exit",
    `raw vlan group 1 flex-vlan 13-41`,
    "ethernet evc 1",
    "dot1q mapped-vlan 200",
    "exit",
    "vlan mapping table vm",
    "raw-vlan group 1 evc 1",
    "exit",
    `interface ${Port.A}`,
    `switchport mode dot1q-tunnel`,
    `switchport dot1q-tunnel allowed vlan all`,
    `switchport dot1q-tunnel type flex`,
    `switchport dot1q-tunnel vlan mapping table vm`,
    `exit`,
    `interface ${Port.B}`,
    `switchport mode trunk`,
    `switchport trunk allowed vlan all`,
    "end",
  ]);

  /**
   * StreamPort.A 发送带vlan 13~41 的报文，StreamPort.B 能够收到vlan 13~41/200的报文
   * StreamPort.B 发送带vlan 200 的报文，StreamPort.A 能够收到vlan 200被去掉的报文
   */
  testHelper.startCapture(StreamPort.B);
  testHelper.addPktSender({
    port: StreamPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:cc",
        src: "00:00:a0:0a:00:cc",
        type: 0x8100,
      })
      .setVLAN({ vlan: 13, type: 0x0800 })
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
        dst: "00:00:01:00:00:cc",
        src: "00:00:a0:0a:00:cc",
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x8100 })
      .setVLAN({ vlan: 13, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  });
  testHelper.startCapture(StreamPort.B);
  testHelper.addPktSender({
    port: StreamPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:cc",
        src: "00:00:a0:0a:00:cc",
        type: 0x8100,
      })
      .setVLAN({ vlan: 40, type: 0x0800 })
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
        dst: "00:00:01:00:00:cc",
        src: "00:00:a0:0a:00:cc",
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x8100 })
      .setVLAN({ vlan: 40, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  });

  testHelper.startCapture(StreamPort.A);
  testHelper.addPktSender({
    port: StreamPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:cc",
        src: "00:00:a0:0a:00:cc",
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x8100 })
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
    port: StreamPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:cc",
        src: "00:00:a0:0a:00:cc",
        type: 0x8100,
      })
      .setVLAN({ vlan: 10, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    "vlan database",
    "no vlan 2-200",
    "exit",
    `interface ${Port.A}`,
    `switchport mode access`,
    `exit`,
    `interface ${Port.B}`,
    `switchport mode access`,
    "exit",
    "no vlan mapping table vm",
    "no ethernet evc 1",
    "no raw vlan group 1",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
