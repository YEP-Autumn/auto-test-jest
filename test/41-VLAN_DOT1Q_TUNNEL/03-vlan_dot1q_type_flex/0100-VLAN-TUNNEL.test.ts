import { Port } from "../../../utils";
import { TransmitMode } from "../../../utils/comm/Components";
import { RenixPort } from "../../../utils/comm/Config";
import { PacketBuilder } from "../../../utils/stream/thrift_packet";
import { TestHelper } from "../../../utils/TestHelper";
import { LinkConstraint } from "../../../utils/topo/LinkConstraint";

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
 *                    +--------+
 *  RenixA <=> PortA--|  DUTA  |--PortB <=> RenixB
 *                    +--------+
 */

test("支持配置miss-forward命令", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "vlan database",
    "vlan 2-200",
    "exit",
    "ethernet evc 1",
    "dot1q mapped-vlan 200",
    "exit",
    "vlan mapping table vm",
    "raw-vlan 10 evc 1",
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
   * RenixA发送vlan 101的报文，RenixB不能收到
   */
  testHelper.startCapture(RenixPort.B);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 101, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  });
  testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 101, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 0,
  });

  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport dot1q-tunnel vlan mapping miss-forward",
    "end",
  ]);
  /**
   * RenixA发送vlan 101的报文，RenixB能够收到
   */
  testHelper.startCapture(RenixPort.B);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 101, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  });
  testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 101, type: 0x0800 })
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
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
