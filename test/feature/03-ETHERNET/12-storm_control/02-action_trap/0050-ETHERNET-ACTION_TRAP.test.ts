import { Port } from "@/utils";
import {
  BurstGapUnit,
  BurstRateUnit,
  TransmitMode,
} from "@/utils/comm/components";
import { RenixPort } from "@/utils/comm/config";
import { PacketBuilder } from "@/utils/stream/thrift-packet";
import { TestHelper } from "@/utils/test-helper";
import { LinkConstraint } from "@/utils/topo/link-constraint";

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
test("接口配置 Sotrm Control trap action后，broadcast level 到达限速将触发SNMP Storm Control Rising Trap", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "snmp-server enable",
    "snmp-server community public read-only",
    "snmp-server usm-user admin authentication md5 admin123",
    "snmp-server notify notif1 tag trap1 trap",
    "snmp-server target-address targ1 param parm1 1.1.1.2 taglist trap1",
    "snmp-server target-params parm1 user admin security-model v3 message-processing v3 auth",
    // 当前版本社区 Trap 目标默认使用 v2c，不显式配置 version v1 时不会发送 v1。
    "snmp-server trap target-address 1.1.1.2 community public",
    `interface ${Port.A}`,
    "storm-control broadcast level 0.01",
    "storm-control action trap",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 1.1.1.1/24",
    "quit",
    "arp 1.1.1.2 1.1.12",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    `Interface current state: UP`,
  );

  testHelper.ReadyCheckDutA(
    `show interface ${Port.B}`,
    `Interface current state: UP`,
  );

  testHelper.startCapture(RenixPort.B);

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

  // v2c 社区 Trap（version=1）
  testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder().setSNMP({
      version: 1,
      varbinds: [
        { oid: "1.3.6.1.2.1.1.3.0" },
        {
          oid: "1.3.6.1.6.3.1.1.4.1.0",
          value: /^1\.3\.6\.1\.4\.1\.\d+\.5\.2\.1$/,
        },
      ],
    }),
    expected_count: 1,
  });
  testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder().setSNMP({
      version: 3,
      varbinds: [
        { oid: "1.3.6.1.2.1.1.3.0" },
        {
          oid: "1.3.6.1.6.3.1.1.4.1.0",
          value: /^1\.3\.6\.1\.4\.1\.\d+\.5\.2\.1$/,
        },
      ],
    }),
    expected_count: 1,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no snmp-server enable",
    "no snmp-server community public",
    "no snmp-server usm-user admin",
    "no snmp-server notify notif1",
    "no snmp-server trap target-address 1.1.1.2 community public",
    "no snmp-server target-params parm1",
    "no snmp-server target-address targ1",
    "no arp 1.1.1.2",
    `interface ${Port.A}`,
    "no storm-control broadcast",
    "no storm-control action",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
