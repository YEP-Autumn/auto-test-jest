import { Port } from "../../utils";
import { TransmitMode } from "../../utils/comm/Components";
import { RenixPort } from "../../utils/stream/StreamBackendApi";
import { PacketBuilder } from "../../utils/stream/thrift_packet";
import { DeviceARouteMac, TestHelper } from "../../utils/TestHelper";
import { LinkConstraint } from "../../utils/topo/LinkConstraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.one_device_topo_links_type_1
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
test("测试设备支持配置VLAN子接口MTU", async () => {
  testHelper.ExecConfigDutA([
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
    "exit",
    `interface ${Port.B}.1`,
    "dot1q termination vid 200",
    "ip address 2.2.2.1/24",
    "mtu 500",
    "exit",
    "arp 2.2.2.2 a.b.c",
    "ip route 10.10.10.10/24 2.2.2.2",
    "end",
  ]);

  /** For wait interface up */
  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    /Interface current state: UP/g,
    1000 * 10
  );
  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}.1`,
    /Interface current state: UP/g,
    1000 * 10
  );
  testHelper.ReadyCheckDutA(
    `show interface ${Port.B}`,
    /Interface current state: UP/g,
    1000 * 10
  );
  testHelper.ReadyCheckDutA(
    `show interface ${Port.B}.1`,
    /Interface current state: UP/g,
    1000 * 10
  );

  testHelper.sleep(3000);

  testHelper.startCapture(RenixPort.B);

  testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:44:55:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({
        src: "100.100.100.1",
        dst: "10.10.10.100",
      }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: { step_count: 10 },
      fixed_len: 1000,
    },
  });

  testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "a.b.c",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({
        src: "100.100.100.1",
        dst: "10.10.10.100",
      }),
    expected_count: 20,
  });

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
    "no ip route 10.10.10.0/24",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
