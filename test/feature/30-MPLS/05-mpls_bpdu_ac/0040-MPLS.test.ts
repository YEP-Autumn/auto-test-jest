import { Port } from "../../../../utils";
import { TransmitMode } from "../../../../utils/comm/components";
import { RenixPort } from "../../../../utils/comm/config";
import { PacketBuilder } from "../../../../utils/stream/thrift-packet";
import { TestHelper } from "../../../../utils/test-helper";
import { LinkConstraint } from "../../../../utils/topo/link-constraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.two_devices_topo_links_type_1,
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
test("支持vpls bpdu ac和ethernet ac同时使用", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.1/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "mpls-vpls v1 bpdu-forward",
    "mpls-vpls v1 ethernet",
    "exit",
    "interface loopback0",
    "ip address 11.11.1.1/32",
    "exit",
    "mpls vpls v1 100",
    "vpls-peer 11.11.4.4 tagged",
    "exit",
    "router rip",
    "network 11.11.0.0/16",
    "exit",
    "router ldp",
    "router-id 11.11.1.1",
    "targeted-peer 11.11.4.4",
    "transport-address 11.11.1.1",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.2/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "mpls-vpls v1 ethernet",
    "mpls-vpls v1 bpdu-forward",
    "exit",
    "interface loopback0",
    "ip address 11.11.4.4/32",
    "exit",
    "mpls vpls v1 100",
    "vpls-peer 11.11.1.1 tagged",
    "exit",
    "router rip",
    "network 11.11.0.0/16",
    "exit",
    "router ldp",
    "router-id 11.11.4.4",
    "targeted-peer 11.11.1.1",
    "transport-address 11.11.4.4",
    "end",
  ]);

  testHelper.sleep(25000);

  testHelper.ReadyCheckDutB(
    "show ldp session",
    new RegExp("11.11.1.1.*?OPERATIONAL"),
    60 * 1000,
  );
  testHelper.ReadyCheckDutB(
    "show ldp session",
    new RegExp("11.11.1.1.*?OPERATIONAL"),
  );

  testHelper.startCapture(RenixPort.B);
  testHelper.addPktSender({
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
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
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "2.2.2",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 }),
    port: RenixPort.B,
  });

  testHelper.startCapture(RenixPort.B);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 2, type: 0x0800 })
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
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no mpls-vpls v1 bpdu-forward",
    "no mpls-vpls v1",
    "exit",
    "no interface loopback 0",
    "no mpls vpls v1",
    "no router rip",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no mpls-vpls v1 bpdu-forward",
    "no mpls-vpls v1",
    "exit",
    "no interface loopback 0",
    "no mpls vpls v1",
    "no router rip",
    "no router ldp",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
