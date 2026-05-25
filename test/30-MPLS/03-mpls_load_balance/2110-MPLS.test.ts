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
    LinkConstraint.three_devices_topo_links_type_2,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *                    +--------+                   +--------+
 *  RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
 *             PortC--|        |                   |        |    |
 *                    +--------+                   +--------+    |
 *                                                               |
 *                                                 +--------+    |
 *                               RenixB <=> PortD--|  DUTC  |--PortB
 *                                                 +--------+
 */
test("测试MPLS AC出口支持agg接口对MPLS内层dst ip进行负载均衡", async () => {
  testHelper.ExecConfigDutA(["clear counters"]);
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.1/24",
    "enable-ldp",
    "exit",
    `interface ${Port.C}`,
    "switchport mode trunk",
    "static-channel-group 1",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "static-channel-group 1",
    "exit",
    "interface agg1",
    "mpls-vpls v1 vlan 2",
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

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.13.2/24",
    "enable-ldp",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.2/24",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 11.11.2.2/32",
    "exit",
    "router rip",
    "network 11.11.0.0/16",
    "exit",
    "router ldp",
    "router-id 11.11.2.2",
    "end",
  ]);

  // 配置 DutA 基于ipda的负载均衡
  testHelper.ExecConfigDutA([
    "configure terminal",
    "no mpls parser control-word exist",
    "hash-field mpls",
    "vpls inner-layer3 ipda",
    "exit",
    "hash-value global",
    "port-channel select mpls",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.13.4/24",
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
    "router rip",
    "network 11.11.0.0/16",
    "exit",
    "router ldp",
    "router-id 11.11.4.4",
    "targeted-peer 11.11.1.1",
    "transport-address 11.11.4.4",
    "end",
  ]);

  testHelper.sleep(1000 * 30);

  testHelper.ReadyCheckDutA("show ldp vpls", "Up     ethernet", 1000 * 60);
  testHelper.ReadyCheckDutC("show ldp vpls", "Up     ethernet", 1000 * 60);

  /** 当 vpls up 后, 等待 30s，将配置同步到芯片 */
  testHelper.sleep(1000 * 30);

  /**
   * RneixB发送携带vlan2，目的IP变化的报文, DutA的portC和portD均有Egress流量
   */

  testHelper.addPktSender({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:00:00:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    modifier_param: [
      {
        modifier_field: ModifierField.IPv4_IP_DST,
        count: 1200,
        mode: ModifierMode.Increment,
        start_value: "100.100.100.1",
        step: 1,
      },
    ],
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 1200,
      },
    },
  });

  testHelper.ExecCustomDutA(async (dut) => {
    try {
      let portC_output = await dut.exec(`show interface ${Port.C}`);
      let portD_output = await dut.exec(`show interface ${Port.D}`);

      console.log(portC_output);
      console.log(portD_output);

      // Parse transmitted unicast counts from Port A and Port C outputs
      const matchC = portC_output.match(/Transmitted\s+(\d+)\s+unicast/i);
      const matchD = portD_output.match(/Transmitted\s+(\d+)\s+unicast/i);
      if (!matchC || !matchD) {
        return false;
      }
      const unicastC = parseInt(matchC[1], 10);
      const unicastD = parseInt(matchD[1], 10);
      return unicastC > 500 && unicastD > 500;
    } catch (err) {
      console.error("ExecCustomDutA error:", err);
      return false;
    }
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.C}`,
    "no static-channel-group",
    "switchport mode access",
    "exit",
    `interface ${Port.D}`,
    "no static-channel-group",
    "switchport mode access",
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
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    "no interface loopback 0",
    "no router rip",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no mpls-vpls v1 vlan 2",
    "switchport mode access",
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
