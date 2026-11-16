import {
  DeviceARouteMac,
  LinkConstraint,
  PacketBuilder,
  Port,
  StreamPort,
  TestHelper,
  TransmitMode,
} from "@/utils";

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
 *                          +--------+
 *  StreamPort.A <=> PortA--|  DUTA  |--PortB <=> StreamPort.B
 *                          +--------+
 *
 */
test("测试当主机路由消失后，recursive-lookup host-route路由失效", async () => {
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
    "ip route 12.12.12.0/24 99.99.99.100 recursive-lookup host-route",
    "end",
  ]);

  testHelper.ReadyCheckDutA(
    `show interface ${Port.A}`,
    "Interface current state: UP",
  );

  testHelper.sleep(3000);

  testHelper.ExecRetMatchDutA("show ip route", "12.12.12.0/24");

  /** 打流验证: 主机路由99.99.99.100/32存在, 12.12.12.0/24路由生效, StreamPort.B 应收到对应报文 */
  testHelper.startCapture(StreamPort.B);
  testHelper.addPktSender({
    port: StreamPort.A,
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
    port: StreamPort.B,
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
    "no ip route 99.99.99.100/32",
    "end",
  ]);

  testHelper.sleep(3000);

  testHelper.ExecRetMatchDutA("show ip route", "12.12.12.0/24", true);

  /** 打流验证: 主机路由99.99.99.100/32消失后, 12.12.12.0/24路由inactive, StreamPort.B 不应收到报文 */
  testHelper.startCapture(StreamPort.B);
  testHelper.addPktSender({
    port: StreamPort.A,
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
    port: StreamPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:02:00:02:01:00",
        src: DeviceARouteMac,
      })
      .setIPv4({
        src: "1.1.1.2",
        dst: "12.12.12.100",
      }),
    expected_count: 0,
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
    "no ip route 12.12.12.0/24",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
