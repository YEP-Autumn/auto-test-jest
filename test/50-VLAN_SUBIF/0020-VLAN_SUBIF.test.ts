import { Port } from "../../utils";
import { TransmitMode } from "../../utils/comm/Components";
import { RenixPort } from "../../utils/stream/StreamBackendApi";
import { PacketBuilder } from "../../utils/stream/thrift_packet";
import { DeviceARouteMac, TestHelper } from "../../utils/TestHelper";
import { LinkConstraint } from "../../utils/topo/LinkConstraint";

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
 *
 */
test("设备支持查看和清除子接口统计信息", async () => {
  testHelper.ExecConfigDutA([
    "clear counters",
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address 1.1.1.1/24",
    "statistic enable both",
    "exit",
    `interface ${Port.B}.1`,
    "dot1q termination vid 200",
    "ip address 2.2.2.1/24",
    "statistic enable both",
    "exit",
    "arp 2.2.2.2 2.2.2",
    "end",
  ]);

  /** For wait interface up */
  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}.1`,
    `Interface current state: UP`,
    1000 * 10,
  );

  /** For wait route install */
  testHelper.sleep(2000);

  testHelper.startCapture(RenixPort.B);

  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ dst: "2.2.2.2", src: "1.2.3.4" }),
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
        dst: "2.2.2",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({ dst: "2.2.2.2", src: "1.2.3.4" }),
    expected_count: 10,
  });

  testHelper.ExecRetMatchDutA(`show interface ${Port.A}.1`, `10 packets input`);

  testHelper.ExecRetMatchDutA(
    `show interface ${Port.B}.1`,
    `10 packets output`,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    `no interface ${Port.A}.1`,
    `no interface ${Port.B}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    "no arp 2.2.2.2",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
