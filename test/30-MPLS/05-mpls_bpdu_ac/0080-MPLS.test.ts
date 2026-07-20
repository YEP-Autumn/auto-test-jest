import { Port } from "../../../utils";
import {
  ModifierField,
  ModifierMode,
  TransmitMode,
} from "../../../utils/comm/Components";
import { RenixPort } from "../../../utils/comm/Config";
import { PacketBuilder } from "../../../utils/stream/thrift_packet";
import { TestHelper } from "../../../utils/TestHelper";
import { LinkConstraint } from "../../../utils/topo/LinkConstraint";

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
test("支持在agg接口配置bpud ac", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.1/24",
    "enable-ldp",
    "exit",
    `interface ${Port.B}`,
    "static-channel-group 1",
    "exit",
    `interface ${Port.D}`,
    "static-channel-group 1",
    "exit",
    "interface agg1",
    "mpls-vpls v1 bpdu-forward",
    "exit",
    "interface loopback0",
    "ip address 11.11.1.1/32",
    "exit",
    "mpls vpls v1 100",
    "vpls-peer 11.11.4.4 raw",
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

  // 配置 DutA 基于macsa的负载均衡
  testHelper.ExecConfigDutA([
    "configure terminal",
    "no mpls parser control-word exist",
    "hash-field mpls",
    "vpls inner-layer2 macsa",
    "exit",
    "hash-value global",
    "port-channel select mpls",
    "end",
  ]);

  // 配置 DutB 基于macsa的负载均衡
  testHelper.ExecConfigDutB([
    "configure terminal",
    "no mpls parser control-word exist",
    "hash-field mpls",
    "vpls inner-layer2 macsa",
    "exit",
    "hash-value global",
    "port-channel select mpls",
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
    `interface ${Port.B}`,
    "static-channel-group 1",
    "exit",
    `interface ${Port.D}`,
    "static-channel-group 1",
    "exit",
    "interface agg1",
    "mpls-vpls v1 bpdu-forward",
    "exit",
    "interface loopback0",
    "ip address 11.11.4.4/32",
    "exit",
    "mpls vpls v1 100",
    "vpls-peer 11.11.1.1 raw",
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
    "11.11.1.1.*?OPERATIONAL",
    60 * 1000,
  );
  testHelper.ReadyCheckDutB("show ldp session", "11.11.1.1.*?OPERATIONAL");

  testHelper.startCapture(RenixPort.B);
  testHelper.addPktSender({
    packet: new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "00:02:00:02:00:02",
        len: 39,
      })
      .setLLC({ ctrl: 10, dsap: 10, ssap: 10 })
      .setRaw({
        payload: Buffer.from("0000000000000000000000000000000000000000000000"),
      }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
    modifier_param: [
      {
        modifier_field: ModifierField.Dot3_MAC_SRC,
        count: 10,
        mode: ModifierMode.Increment,
        start_value: "00:02:00:02:00:02",
      },
    ],
  });

  testHelper.addPktChecker({
    expected_count: 5,
    packet: new PacketBuilder().setDot3({
      dst: "01:80:c2:00:00:00",
    }),
    port: RenixPort.B,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.B}`,
    "no static-channel-group",
    "exit",
    `interface ${Port.D}`,
    "no static-channel-group",
    "exit",
    "no interface loopback 0",
    "no mpls vpls v1",
    "no router rip",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "mpls parser control-word exist",
    "hash-value global",
    "no port-channel select",
    "exit",
    "no hash-field mpls",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "mpls parser control-word exist",
    "hash-value global",
    "no port-channel select",
    "exit",
    "no hash-field mpls",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.B}`,
    "no static-channel-group",
    "exit",
    `interface ${Port.D}`,
    "no static-channel-group",
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
