import { Port } from "../../../../utils";
import { TransmitMode } from "../../../../utils/comm/components";
import { RenixPort } from "../../../../utils/comm/config";
import { PacketBuilder } from "../../../../utils/stream/thrift-packet";
import { DeviceARouteMac, TestHelper } from "../../../../utils/test-helper";
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
test("测试无 VRF 静态路由配置recursive-lookup host-route", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.1/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 2.2.2.1/24",
    "exit",
    "arp 2.2.2.100 2.2.100",
    "ip route 99.99.99.0/24 2.2.2.100",
    "ip route 99.99.99.100/32 2.2.2.100",
    "ip route 10.10.10.0/24 99.99.99.99",
    "ip route 11.11.11.0/24 99.99.99.99 recursive-lookup host-route",
    "ip route 12.12.12.0/24 99.99.99.100 recursive-lookup host-route",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    "Interface current state: UP",
  );

  testHelper.sleep(3000);

  testHelper.ExecRetMatchDutA("show ip route", "10.10.10.0/24");
  testHelper.ExecRetMatchDutA("show ip route", "11.11.11.0/24", true);
  testHelper.ExecRetMatchDutA("show ip route", "12.12.12.0/24");
  testHelper.ExecRetMatchDutA(
    "show ip route database",
    new RegExp("11.11.11.0/24.*?inactive"),
  );

  /** 打流验证: 10.10.10.0/24路由生效(递归解析成功), RenixB应收到对应报文 */
  testHelper.startCapture(RenixPort.B);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:a0:0a:00:66",
        type: 0x0800,
      })
      .setIPv4({
        src: "1.1.1.2",
        dst: "10.10.10.100",
      }),
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
        dst: "00:02:00:02:01:00",
        src: DeviceARouteMac,
      })
      .setIPv4({
        src: "1.1.1.2",
        dst: "10.10.10.100",
      }),
    expected_count: 10,
  });

  /** 打流验证: 11.11.11.0/24路由inactive(recursive-lookup host-route未生效), RenixB不应收到报文 */
  testHelper.startCapture(RenixPort.B);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:a0:0a:00:66",
        type: 0x0800,
      })
      .setIPv4({
        src: "1.1.1.2",
        dst: "11.11.11.100",
      }),
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
        dst: "00:02:00:02:01:00",
        src: DeviceARouteMac,
      })
      .setIPv4({
        src: "1.1.1.2",
        dst: "11.11.11.100",
      }),
    expected_count: 0,
  });

  /** 打流验证: 12.12.12.0/24路由生效(recursive-lookup host-route生效), RenixB应收到对应报文 */
  testHelper.startCapture(RenixPort.B);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: "00:00:a0:0a:00:66",
        type: 0x0800,
      })
      .setIPv4({
        src: "1.1.1.2",
        dst: "12.12.12.100",
      }),
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
        dst: "00:02:00:02:01:00",
        src: DeviceARouteMac,
      })
      .setIPv4({
        src: "1.1.1.2",
        dst: "12.12.12.100",
      }),
    expected_count: 10,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    "no arp 2.2.2.100",
    "no ip route 99.99.99.0/24",
    "no ip route 99.99.99.100/32",
    "no ip route 10.10.10.0/24",
    "no ip route 11.11.11.0/24",
    "no ip route 12.12.12.0/24",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
