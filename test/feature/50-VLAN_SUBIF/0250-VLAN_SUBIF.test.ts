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
test("支持在VLAN子接口上配置IPv6 PBR", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ipv6 enable",
    "ipv6 access-list test",
    "permit any any host 6789::100",
    "exit",
    "route-map rm permit 10",
    "match ipv6 address test",
    "set ipv6 next-hop 3001::2",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ipv6 address 2001::1/24",
    "ip policy route-map rm",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "exit",
    `interface ${Port.B}.1`,
    "dot1q termination vid 200",
    "ipv6 address 3001::1/24",
    "exit",
    "ipv6 neighbor 3001::2 1.2.3",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}.1`,
    `Interface current state: UP`,
    1000 * 10,
  );
  testHelper.ReadyCheckDutA(
    `show interface ${Port.B}.1`,
    `Interface current state: UP`,
    1000 * 10,
  );

  /** 1. 测试匹配路由策略的报文能被正确路由转发 */
  testHelper.startCapture(RenixPort.B);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x86dd })
      .setIPv6({ dst: "6789::100", src: "2001::100" }),
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
      .setEthernet({
        dst: "1.2.3",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x86dd })
      .setIPv6({ dst: "6789::100", src: "2001::100" }),
    expected_count: 10,
  });

  /** 2. 测试其他报文不能被路由转发 */
  testHelper.startCapture(RenixPort.B);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x86dd })
      .setIPv6({ dst: "6789::101", src: "2001::100" }),
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
      .setEthernet({
        dst: "1.2.3",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x86dd })
      .setIPv6({ dst: "6789::101", src: "2001::100" }),
    expected_count: 0,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ipv6 enable",
    "no ipv6 access-list test",
    "no route-map rm",
    `no interface ${Port.A}.1`,
    `no interface ${Port.B}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    "no ipv6 neighbor 3001::2",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
