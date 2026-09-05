import { Port } from "../../utils";
import {
    ModifierField,
    ModifierMode,
    TransmitMode,
} from "../../utils/comm/components";
import { RenixPort } from "../../utils/comm/config";
import { PacketBuilder } from "../../utils/stream/thrift-packet";
import { TestHelper } from "../../utils/test-helper";
import { LinkConstraint } from "../../utils/topo/link-constraint";

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
test("[GX-链路聚合] 修改链路聚合的hash-field值不生效，不能按配置的的值进行负载分担", async () => {
  testHelper.ExecConfigDutA(["clear counters"]);
  testHelper.ExecConfigDutB(["clear counters"]);
  testHelper.ExecConfigDutA([
    "configure terminal",
    "hash-field port-channel",
    "ip disable",
    "exit",
    `interface ${Port.A}`,
    "static-channel-group 1",
    "exit",
    `interface ${Port.C}`,
    "static-channel-group 1",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    "Interface current state: UP",
  );
  testHelper.ReadyCheckDutA(
    `show interface ${Port.C}`,
    "Interface current state: UP",
  );

  /**
   * RneixA发送 src ip变化的流量, 流量应该从agg接口中选择一个走
   */
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:00:00:00:66",
      })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    modifier_param: [
      {
        modifier_field: ModifierField.IPv4_IP_SRC,
        count: 1200,
        mode: ModifierMode.Increment,
        start_value: "2.2.2.2",
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

      return unicastA == 1200 || unicastC == 500;
    } catch (err) {
      console.error("ExecCustomDutA error:", err);
      return false;
    }
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    "hash-field port-channel",
    "no ip disable",
    "exit",
    `interface ${Port.A}`,
    "no static-channel-group",
    "exit",
    `interface ${Port.C}`,
    "no static-channel-group",
    "exit",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
