import { Port } from "../../utils";
import { TransmitMode } from "../../utils/comm/Components";
import { RenixPort } from "../../utils/stream/StreamBackendApi";
import { PacketBuilder } from "../../utils/stream/thrift_packet";
import {
  DeviceARouteMac,
  DeviceBRouteMac,
  TestHelper,
} from "../../utils/TestHelper";
import { LinkConstraint } from "../../utils/topo/LinkConstraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.two_devices_topo_links_type_1
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *                    +--------+                   +--------+
 *                    |        |--PortA <=> PortA--|        |
 *  RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortD <=> RenixB
 *                    |        |--PortC <=> PortC--|        |
 *                    +--------+                   +--------+
 *
 */
test("支持通过VLAN子接口建立OSPFv3邻居连接", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ipv6 enable",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ipv6 address 2001::1/64",
    "ipv6 router ospf area 0",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "exit",
    `interface ${Port.D}.1`,
    "dot1q termination vid 200",
    "ipv6 address 1001::1/64",
    "exit",
    "router ipv6 ospf",
    "router-id 1.1.1.1",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "ipv6 enable",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    " ipv6 address 2001::2/64",
    "ipv6 router ospf area 0",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "exit",
    `interface ${Port.D}.1`,
    "dot1q termination vid 300",
    "ipv6 address 3001::1/64",
    "exit",
    "router ipv6 ospf",
    "router-id 2.2.2.2",
    "redistribute static",
    "exit",
    "ipv6 neighbor 3001::2 0000.3001.0002",
    "ipv6 route 4000::/64 3001::2",
    "end",
  ]);

  testHelper.sleep(1000 * 40);

  testHelper.ReadyCheckDutA(
    "show ipv6 ospf neighbor",
    `2.2.2.2.*?Full`,
    1000 * 30
  );

  testHelper.ReadyCheckDutA("show ipv6 route", `O E2    4000::\/64`, 1000 * 30);

  testHelper.startCapture(RenixPort.B);

  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x86dd })
      .setIPv6({ dst: "4000::123", src: "1001::100" }),
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
        dst: "0000.3001.0002",
        src: DeviceBRouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 300, type: 0x86dd })
      .setIPv6({ dst: "4000::123", src: "1001::100" }),
    expected_count: 10,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ipv6 enable",
    `no interface ${Port.A}.1`,
    `no interface ${Port.D}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no router ipv6 ospf",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no ipv6 enable",
    `no interface ${Port.A}.1`,
    `no interface ${Port.D}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no router ipv6 ospf",
    "no ipv6 route 4000::/64",
    "no ipv6 neighbor 3001::2",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
