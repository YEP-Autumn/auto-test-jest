import { Port } from "../../../utils";
import { TransmitMode } from "../../../utils/comm/components";
import { RenixPort } from "../../../utils/comm/config";
import { PacketBuilder } from "../../../utils/stream/thrift-packet";
import { TestHelper } from "../../../utils/test-helper";
import { LinkConstraint } from "../../../utils/topo/link-constraint";

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
test("设备支持通过VLAN子接口配置MPLS VPLS", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address 11.11.9.1/24",
    "label-switching",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "mpls-vpls v1 vlan 2",
    "exit",
    "interface loopback0",
    "ip address 11.11.1.1/32",
    "exit",
    "mpls vpls v1 100",
    "vpls-peer 11.11.4.4 raw",
    "exit",
    "router ospf",
    "network 11.11.9.0/24 area 0",
    "redistribute connected",
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
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address 11.11.9.2/24",
    "label-switching",
    "enable-ldp",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "exit",
    `interface ${Port.B}.1`,
    "dot1q termination vid 200",
    "ip address 11.11.13.2/24",
    "label-switching",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 11.11.2.2/32",
    "exit",
    "router ospf",
    "network 11.11.9.0/24 area 0",
    "network 11.11.13.0/24 area 0",
    "redistribute connected",
    "exit",
    "router ldp",
    "router-id 11.11.2.2",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "exit",
    `interface ${Port.B}.1`,
    "dot1q termination vid 200",
    "ip address 11.11.13.4/24",
    "label-switching",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "mpls-vpls v1 vlan 2",
    "exit",
    "interface loopback0",
    "ip address 11.11.4.4/32",
    "exit",
    "mpls vpls v1 100",
    "vpls-peer 11.11.1.1 raw",
    "exit",
    "router ospf",
    "network 11.11.13.0/24 area 0",
    "redistribute connected",
    "exit",
    "router ldp",
    "router-id 11.11.4.4",
    "targeted-peer 11.11.1.1",
    "transport-address 11.11.4.4",
    "end",
  ]);

  testHelper.sleep(1000 * 45);

  testHelper.ReadyCheckDutA("show ldp vpls", `Up     ethernet`, 1000 * 60);
  testHelper.ReadyCheckDutC("show ldp vpls", `Up     ethernet`, 1000 * 60);

  testHelper.sleep(1000 * 30);

  testHelper.ReadyCheckDutA(
    "show ldp session",
    new RegExp("11.11.2.2.*?OPERATIONAL"),
    1000 * 45,
  );

  testHelper.ReadyCheckDutA(
    "show ldp session",
    new RegExp("11.11.4.4.*?OPERATIONAL"),
    1000 * 45,
  );

  testHelper.sleep(1000 * 5);

  testHelper.startCapture(RenixPort.B);

  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "1.1.1", dst: "2.2.2", type: 0x8100 })
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({ src: "1.2.3.4", dst: "2.3.4.5" }),
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
      .setEthernet({ src: "1.1.1", dst: "2.2.2", type: 0x8100 })
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({ src: "1.2.3.4", dst: "2.3.4.5" }),
    expected_count: 10,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    `no interface ${Port.A}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "no mpls-vpls v1 vlan 2",
    "switchport mode access",
    "exit",
    "no interface loopback 0",
    "no mpls vpls v1",
    "no router ospf",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `no interface ${Port.A}.1`,
    `no interface ${Port.B}.1`,
    `interface ${Port.B}`,
    "switchport",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    "no interface loopback 0",
    "no router ospf",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    `no interface ${Port.B}.1`,
    `interface ${Port.B}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "no mpls-vpls v1 vlan 2",
    "switchport mode access",
    "exit",
    "no interface loopback 0",
    "no mpls vpls v1",
    "no router ospf",
    "no router ldp",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
