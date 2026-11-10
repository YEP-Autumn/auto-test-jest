import { Port } from "@/utils";
import { TransmitMode } from "@/utils/comm/components";
import { RenixPort } from "@/utils/comm/config";
import { PacketBuilder } from "@/utils/stream/thrift-packet";
import { DeviceARouteMac, TestHelper } from "@/utils/test-helper";
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
test("支持配置IPv6静态路由指定下一跳为VLAN子接口邻居", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ipv6 enable",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ipv6 address 2001::1/64",
    "exit",
    `interface ${Port.B}.1`,
    "dot1q termination vid 200",
    "ipv6 address 3001::1/64",
    "exit",
    "ipv6 neighbor 3001::2 a.b.c",
    "ipv6 route 4000::0/64 3001::2",
    "end",
  ]);

  /** For wait interface up */
  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    `Interface current state: UP`,
    1000 * 10,
  );
  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}.1`,
    `Interface current state: UP`,
    1000 * 10,
  );
  testHelper.ReadyCheckDutA(
    `show interface ${Port.B}`,
    `Interface current state: UP`,
    1000 * 10,
  );
  testHelper.ReadyCheckDutA(
    `show interface ${Port.B}.1`,
    `Interface current state: UP`,
    1000 * 10,
  );

  testHelper.sleep(3000);

  testHelper.startCapture(RenixPort.B);

  testHelper.addPktSender({
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:44:55:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x86dd })
      .setIPv6({
        src: "2001::100",
        dst: "4000::1234",
      }),
    port: RenixPort.A,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: { step_count: 10 },
    },
  });

  testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "a.b.c",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x86dd })
      .setIPv6({
        src: "2001::100",
        dst: "4000::1234",
      }),
    expected_count: 10,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    `no interface ${Port.A}.1`,
    `no interface ${Port.B}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    "no ipv6 neighbor 3001::2",
    "no ipv6 route 4000::0/64",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
