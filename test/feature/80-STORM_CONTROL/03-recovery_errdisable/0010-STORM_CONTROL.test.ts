import { Port } from "../../../../utils";
import {
  BurstGapUnit,
  BurstRateUnit,
  TransmitMode,
} from "../../../../utils/comm/components";
import { RenixPort } from "../../../../utils/comm/config";
import { PacketBuilder } from "../../../../utils/stream/thrift-packet";
import { TestHelper } from "../../../../utils/test-helper";
import { LinkConstraint } from "../../../../utils/topo/link-constraint";

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
test("errdisable支持配置storm-control reason", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "errdisable recovery reason storm-control",
    "errdisable recovery interval 30",
    `interface ${Port.A}`,
    "storm-control unicast level 0.01",
    "storm-control action shutdown",
    "end",
  ]);

  // 再发送限速类型报文(unicast), 校验接口errdisable
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

  testHelper.stopStream(RenixPort.A);

  testHelper.ExecRetMatchDutA(`show interface ${Port.A}`, "Error Disabled");
  testHelper.ExecRetMatchDutA(
    "show errdisable recovery",
    "storm-control            Enabled",
  );

  testHelper.sleep(1000 * 35);
  testHelper.ExecRetMatchDutA(
    `show interface ${Port.A}`,
    "Error Disabled",
    true,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no errdisable recovery interval",
    "no errdisable recovery reason storm-control",
    `interface ${Port.A}`,
    "no storm-control unicast",
    "no storm-control action",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
