import { Port } from "@/utils";
import { TransmitMode } from "@/utils/comm/components";
import { RenixPort } from "@/utils/comm/config";
import { PacketBuilder } from "@/utils/stream/thrift-packet";
import {
  DeviceARouteMac,
  DeviceBRouteMac,
  TestHelper,
} from "@/utils/test-helper";
import { LinkConstraint } from "@/utils/topo/link-constraint";

jest.setTimeout(1000 * 60 * 10);

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
test("配置默认静态路由后，未匹配明细路由的流量经默认网关转发且路由表显示默认路由", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.1/24",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 200.200.200.1/24",
    "exit",
    "ip route 0.0.0.0/0 1.1.1.2",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.2/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 2.2.2.1/24",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 100.100.100.1/24",
    "exit",
    "arp 100.100.100.100 0003.0003.0003",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    "Interface current state: UP",
  );

  testHelper.ReadyCheckDutA(
    `show interface ${Port.D}`,
    "Interface current state: UP",
  );

  testHelper.ReadyCheckDutB(
    `show interface ${Port.A}`,
    "Interface current state: UP",
  );

  testHelper.ReadyCheckDutB(
    `show interface ${Port.B}`,
    "Interface current state: UP",
  );

  testHelper.ReadyCheckDutB(
    `show interface ${Port.D}`,
    "Interface current state: UP",
  );

  testHelper.ReadyCheckDutA("show ip route", "0.0.0.0/0");

  testHelper.ExecRetMatchDutA("show ip route", [
    new RegExp("Gateway of last resort is 1\\.1\\.1\\.2"),
    new RegExp("S\\*\\s+0\\.0\\.0\\.0/0\\s+\\[1/0\\] via 1\\.1\\.1\\.2"),
  ]);

  testHelper.ExecRetMatchDutA("ping 2.2.2.1", " 0% packet loss");

  /** 打流验证: 未匹配明细路由的报文经默认路由从 DUTB PortD 转发到 RenixB */
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
        src: "200.200.200.100",
        dst: "100.100.100.100",
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
        dst: "00:03:00:03:00:03",
        src: DeviceBRouteMac,
        type: 0x0800,
      })
      .setIPv4({
        src: "200.200.200.100",
        dst: "100.100.100.100",
      }),
    expected_count: 10,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip route 0.0.0.0/0 1.1.1.2",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no arp 100.100.100.100",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
