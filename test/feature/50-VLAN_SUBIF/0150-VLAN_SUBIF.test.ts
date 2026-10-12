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
test("支持在VLAN子接口上配置PBR", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip access-list test",
    "10 permit any host 1.2.3.4 any",
    "exit",
    "route-map rm permit 10",
    "match ip address test",
    "set ip next-hop 2.2.2.2",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "exit",
    `interface ${Port.A}.1`,
    "dot1q termination vid 100",
    "ip address 1.1.1.1/24",
    "ip policy route-map rm",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "exit",
    `interface ${Port.B}.1`,
    "dot1q termination vid 200",
    "ip address 2.2.2.1/24",
    "exit",
    "arp 2.2.2.2 2.2.2",
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

  /** 1. 测试源mac为1.2.3.4的报文可以被路由转发 */
  testHelper.startCapture(RenixPort.B);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:00:11:22:33",
        type: 0x8100,
      })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
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
        dst: "2.2.2",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" }),
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
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.5" }),
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
        dst: "2.2.2",
        src: DeviceARouteMac,
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.5" }),
    expected_count: 0,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip access-list test",
    "no route-map rm",
    `no interface ${Port.A}.1`,
    `no interface ${Port.B}.1`,
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    "no arp 2.2.2.2",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
