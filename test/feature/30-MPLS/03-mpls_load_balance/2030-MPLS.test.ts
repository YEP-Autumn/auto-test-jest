import { Port } from "../../../../utils";
import {
  ModifierField,
  ModifierMode,
  TransmitMode,
} from "../../../../utils/comm/components";
import { RenixPort } from "../../../../utils/comm/config";
import { PacketBuilder } from "../../../../utils/stream/thrift-packet";
import { TestHelper } from "../../../../utils/test-helper";
import { LinkConstraint } from "../../../../utils/topo/link-constraint";

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
 *
 *                    +--------+                   +--------+
 *  RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
 *                    |        |--PortC <=> PortC--|        |    |
 *                    +--------+                   +--------+    |
 *                                                               |
 *                                                 +--------+    |
 *                               RenixB <=> PortD--|  DUTC  |--PortB
 *                                                 +--------+
 */
test("测试MPLS中间节点支持agg接口对MPLS内层src mac进行负载均衡", async () => {
  testHelper.ExecConfigDutB(["clear counters"]);
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "static-channel-group 1",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "static-channel-group 1",
    "exit",
    "interface agg1",
    "label-switching",
    "ip address 11.11.9.1/24",
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
    "static-channel-group 1",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "static-channel-group 1",
    "exit",
    "interface agg1",
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

  // 配置 DutB 基于macsa的负载均衡
  testHelper.ExecConfigDutB([
    "configure terminal",
    "no mpls parser control-word exist",
    `interface ${Port.B}`,
    "snooping-parser enable",
    "exit",
    "hash-field mpls",
    "mpls inner macsa",
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

  testHelper.ReadyCheckDutB(
    "show ldp session",
    "11.11.1.1.*?OPERATIONAL",
    60_000,
  );
  testHelper.ReadyCheckDutB("show ldp session", "11.11.4.4.*?OPERATIONAL");

  testHelper.ReadyCheckDutA("show ldp vpls", "Up     ethernet", 1000 * 60);
  testHelper.ReadyCheckDutC("show ldp vpls", "Up     ethernet", 1000 * 60);

  /**
   * RneixB发送携带vlan2，源mac变化的报文, DutA的portA和portC均有ingress流量, DutB的portA和portC均有egress流量
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
        modifier_field: ModifierField.EthernetII_MAC_SRC,
        count: 1200,
        mode: ModifierMode.Increment,
        start_value: "00:00:00:01:00:ce",
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

  testHelper.ExecCustomDutB(async (dut) => {
    try {
      let portA_output = await dut.exec(`show interface ${Port.A}`);
      let portC_output = await dut.exec(`show interface ${Port.C}`);

      console.log(portA_output);
      console.log(portC_output);

      // Parse transmitted unicast counts from Port A and Port C outputs
      const matchA = portA_output.match(/Transmitted\s+(\d+)\s+unicast/i);
      const matchC = portC_output.match(/Transmitted\s+(\d+)\s+unicast/i);
      if (!matchA || !matchC) {
        return false;
      }
      const unicastA = parseInt(matchA[1], 10);
      const unicastC = parseInt(matchC[1], 10);
      return unicastA > 500 && unicastC > 500;
    } catch (err) {
      console.error("ExecCustomDutA error:", err);
      return false;
    }
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no static-channel-group",
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "no static-channel-group",
    "switchport",
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

  testHelper.CleanConfigDutB([
    "configure terminal",
    "mpls parser control-word exist",
    `interface ${Port.B}`,
    "no snooping-parser enable",
    "exit",
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
    "no static-channel-group",
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "no static-channel-group",
    "switchport",
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
