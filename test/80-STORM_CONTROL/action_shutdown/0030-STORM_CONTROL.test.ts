import { Port } from "../../../utils";
import {
  BurstGapUnit,
  BurstRateUnit,
  TransmitMode,
} from "../../../utils/comm/components";
import { RenixPort } from "../../../utils/comm/config";
import { PacketBuilder } from "../../../utils/stream/thrift-packet";
import { TestHelper } from "../../../utils/test-helper";
import { LinkConstraint } from "../../../utils/topo/link-constraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.one_device_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *                    +--------+
 *  RenixA <=> PortA--|  DUTA  |--PortB <=> RenixB
 *                    +--------+
 *
 */
test("接口配置 Sotrm Control shtudown action后，broadcast level 到达限速将导致接口errdisable", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "storm-control broadcast level 0.01",
    "storm-control action shutdown",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    `Interface current state: UP`,
  );

  // 先发送非限速类型报文(unicast), 校验不会导致接口errdisable
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "0.0.2" })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  });

  testHelper.ExecRetMatchDutA(
    `show interface ${Port.A}`,
    "Error Disabled",
    true,
  );

  // 再发送限速类型报文(broadcast), 校验接口errdisable
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ src: "0.0.1", dst: "ff:ff:ff:ff:ff:ff" })
      .setIPv4({ src: "1.1.1.1", dst: "255.255.255.255" }),
    transmit_param: {
      mode: TransmitMode.BURST,
      param: {
        burst_count: 1000000,
        burst_size: 1,
        gap: 1,
        gap_unit: BurstGapUnit.NS,
        step_count: 1,
        rate: 100,
        rate_unit: BurstRateUnit.PERCENT,
      },
    },
  });

  testHelper.ExecRetMatchDutA(`show interface ${Port.A}`, "Error Disabled");

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no storm-control broadcast",
    "no storm-control action",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
