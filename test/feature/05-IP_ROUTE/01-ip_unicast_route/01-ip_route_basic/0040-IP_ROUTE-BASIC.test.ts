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
test("多条静态路由共用同一网关时，远端网络与主机路由均被安装且目的地址可达", async () => {
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
    "ip route 10.10.12.0/24 1.1.1.2",
    "ip route 192.168.0.2/32 1.1.1.2",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 1.1.1.2/24",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 10.10.12.1/24",
    "exit",
    "interface loopback0",
    "ip address 192.168.0.2/32",
    "exit",
    "arp 10.10.12.100 0003.0003.0003",
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
    `show interface ${Port.D}`,
    "Interface current state: UP",
  );

  testHelper.ReadyCheckDutA("show ip route", "10.10.12.0/24");

  testHelper.ExecRetMatchDutA("show ip route", [
    new RegExp("S\\s+10\\.10\\.12\\.0/24\\s+\\[1/0\\] via 1\\.1\\.1\\.2"),
    new RegExp("S\\s+192\\.168\\.0\\.2/32\\s+\\[1/0\\] via 1\\.1\\.1\\.2"),
  ]);

  testHelper.ExecRetMatchDutA("ping 10.10.12.1", " 0% packet loss");
  testHelper.ExecRetMatchDutA("ping 192.168.0.2", " 0% packet loss");

  /** 打流验证: 远端网络路由命中的报文应从 DUTB PortD 转发到 RenixB */
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
        dst: "10.10.12.100",
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
        dst: "10.10.12.100",
      }),
    expected_count: 10,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip route 10.10.12.0/24 1.1.1.2",
    "no ip route 192.168.0.2/32 1.1.1.2",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no interface loopback0",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no arp 10.10.12.100",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
