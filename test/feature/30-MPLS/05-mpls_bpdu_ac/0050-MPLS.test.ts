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
test("支持tagged模式vpws配置bpdu ac", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 8.8.8.1/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "mpls-l2-circuit t1 bpdu-forward",
    "exit",
    "interface loopback0",
    "ip address 192.168.10.10/32",
    "exit",
    "router rip",
    "network 0.0.0.0/0",
    "exit",
    "router ldp",
    "router-id 192.168.10.10",
    "targeted-peer 192.168.11.10",
    "exit",
    "mpls l2-circuit t1 200 192.168.11.10 tagged",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 8.8.8.2/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "mpls-l2-circuit t1 bpdu-forward",
    "exit",
    "interface loopback0",
    "ip address 192.168.11.10/32",
    "exit",
    "router rip",
    "network 0.0.0.0/0",
    "exit",
    "router ldp",
    "router-id 192.168.11.10",
    "targeted-peer 192.168.10.10",
    "exit",
    "mpls l2-circuit t1 200 192.168.10.10 tagged",
    "end",
  ]);
  testHelper.sleep(25000);

  testHelper.ReadyCheckDutB("show ldp session", "OPERATIONAL", 60 * 1000);
  testHelper.ReadyCheckDutB("show ldp session", "OPERATIONAL");

  testHelper.ExecRetMatchDutB("show mpls l2-circuit", new RegExp("t1.*?200 "));
  testHelper.ExecRetMatchDutB(
    "show mpls vc-table",
    new RegExp("200.*?192.168.10.10.*?Active"),
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

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no mpls-l2-circuit t1 bpdu-forward",
    "exit",
    "no interface loopback 0",
    "no router rip",
    "no router ldp",
    "no mpls l2-circuit t1",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no mpls-l2-circuit t1 bpdu-forward",
    "exit",
    "no interface loopback 0",
    "no router rip",
    "no router ldp",
    "no mpls l2-circuit t1",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
