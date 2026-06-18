import { Port } from "../../../utils";
import { TransmitMode } from "../../../utils/comm/Components";
import { RenixPort } from "../../../utils/comm/Config";
import { PacketBuilder } from "../../../utils/stream/thrift_packet";
import { DeviceARouteMac, DeviceCRouteMac, TestHelper } from "../../../utils/TestHelper";
import { LinkConstraint } from "../../../utils/topo/LinkConstraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *                    +--------+                   +--------+
 *                    |        |--PortA <=> PortA--|        |
 *  RenixA <=> PortD--|  DUTA  |                   |  DUTB  |--PortB
 *                    |        |--PortC <=> PortC--|        |    |
 *                    +--------+                   +--------+    |
 *                                                               |
 *                                                 +--------+    |
 *                               RenixB <=> PortD--|  DUTC  |--PortB
 *                                                 +--------+
 */
test("配置静态MPLS LSP", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.1/24",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "label-switching",
    "ip address 10.10.10.1/24",
    "exit",
    "mpls ftn-entry 172.22.4.0/24 100 11.11.9.2",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.2/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.17.2/24",
    "exit",
    "mpls ilm-entry swap 100 11.11.17.3 200",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.17.3/24",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "label-switching",
    "ip address 20.20.20.1/24",
    "exit",
    "mpls ilm-entry php 200 20.20.20.2",
    "arp 20.20.20.2 0002.0002.0002",
    "end",
  ]);

  testHelper.sleep(5000);

  /**
   * TODO:
   * Send packet dst ip: 172.22.4.200, dst mac: DutA routemac,
   * then packet while output from DutC Port4
   */

  testHelper.startCapture(RenixPort.B);

  testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({ dst: DeviceARouteMac, src: "2.2.2" })
      .setIPv4({ dst: "172.22.4.200", src: "2.2.2.2" }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  });

  testHelper.addPktChecker({
    expected_count: 10,
    packet: new PacketBuilder()
      .setEthernet({ dst: "2.2.2", src: DeviceCRouteMac })
      .setIPv4({ dst: "172.22.4.200", src: "2.2.2.2" }),
    port: RenixPort.B,
  });

  testHelper.ExecRetMatchDutA(
    "show mpls ftn-database",
    "172.22.4.0\/24(.*?)100(.*?)11.11.9.2",
  );
  testHelper.ExecRetMatchDutB(
    "show mpls ilm-database",
    "0.0.0.0\/0(.*?)100\/200(.*?)11.11.17.3",
  );

  testHelper.ExecRetMatchDutC(
    "show mpls ilm-database",
    "0.0.0.0\/0(.*?)200\/3(.*?)20.20.20.2",
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no mpls ftn-entry 172.22.4.0/24 11.11.9.2",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    "no mpls ilm-entry 100",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no mpls ilm-entry 200",
    "no arp 20.20.20.2",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
