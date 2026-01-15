
import { Port } from "../../utils";
import { TransmitMode } from "../../utils/comm/Components";
import { RenixPort } from "../../utils/stream/StreamBackendApi";
import { PacketBuilder } from "../../utils/stream/thrift_packet";
import { DeviceARouteMac, DeviceBRouteMac, TestHelper } from "../../utils/TestHelper";
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
test("支持通过VLAN子接口建立RIP邻居连接", async () => {

  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address 1.1.1.1/24",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "exit",
    `interface ${Port.D}.1`,
    "dot1q termination vid 200",
    "ip address 2.2.2.1/24",
    "exit",
    "router rip",
    "network 1.1.1.0/24",
    "network 2.2.2.0/24",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address 1.1.1.2/24",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "exit",
    `interface ${Port.D}.1`,
    "dot1q termination vid 300",
    "ip address 3.3.3.1/24",
    "exit",
    "router rip",
    "network 1.1.1.0/24",
    "network 3.3.3.0/24",
    "redistribute static",
    "exit",
    "arp 3.3.3.3 0003.0003.0003",
    "ip route 10.10.10.0/24 3.3.3.3",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip route", `10.10.10.0\/24`, 1000 * 60);

  testHelper.sleep(3000);

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
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
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
        dst: "3.3.3",
        src: DeviceBRouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 300, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
    expected_count: 10,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    `no interface ${Port.A}.1`,
    `no interface ${Port.D}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no router rip",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `no interface ${Port.A}.1`,
    `no interface ${Port.D}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no router rip",
    "no ip route 10.10.10.0/24",
    "no arp 3.3.3.3",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
