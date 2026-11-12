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
test("删除静态路由后，路由表中对应条目消失且目的网络恢复不可达", async () => {
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
    "ip route 2.2.2.0/24 1.1.1.2",
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
    "ip address 2.2.2.1/24",
    "exit",
    "arp 2.2.2.100 0003.0003.0003",
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

  testHelper.ReadyCheckDutA(
    "show ip route",
    new RegExp("S\\s+2\\.2\\.2\\.0/24\\s+\\[1/0\\] via 1\\.1\\.1\\.2"),
  );

  testHelper.ExecRetMatchDutA("ping 2.2.2.1", " 0% packet loss");

  /** 打流验证: 删除前报文应命中静态路由并从 DUTB PortD 转发到 RenixB */
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
        dst: "2.2.2.100",
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
        dst: "2.2.2.100",
      }),
    expected_count: 10,
  });

  testHelper.ExecConfigDutA([
    "configure terminal",
    "no ip route 2.2.2.0/24 1.1.1.2",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip route", "2.2.2.0/24", 30_000, true);
  /** 等待 RIB 删除同步到 FIB，避免删除后仍有短时残留转发 */
  testHelper.sleep(1000);

  /** 打流验证: 删除后报文不再命中静态路由，RenixB 不应收到报文 */
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
        dst: "2.2.2.100",
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
        dst: "2.2.2.100",
      }),
    expected_count: 0,
  });

  /** 删除步骤已恢复路由，此处兜底清理，避免前序失败时残留配置 */
  testHelper.ExecCustomDutA(async (dut) => {
    await dut.safeExec("configure terminal");
    await dut.safeExec("no ip route 2.2.2.0/24 1.1.1.2");
    await dut.safeExec(`interface ${Port.A}`);
    await dut.safeExec("switchport");
    await dut.safeExec("exit");
    await dut.safeExec(`interface ${Port.D}`);
    await dut.safeExec("switchport");
    await dut.safeExec("end");
    return true;
  }, true);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "switchport",
    "exit",
    "no arp 2.2.2.100",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
