import {
  BurstGapUnit,
  BurstRateUnit,
  LinkConstraint,
  PacketBuilder,
  Port,
  StreamPort,
  TestHelper,
  TransmitMode,
} from "@/utils";

jest.setTimeout(1000 * 60 * 10);

describe("StreamPort.A -> StreamPort.B 1ms burst", () => {
  let testHelper: TestHelper;

  beforeAll(async () => {
    // A/B 通过 DUTA 的二层转发互通。
    testHelper = new TestHelper(LinkConstraint.one_device_topo_links_type_1);
    await testHelper.init();
  }, 120_000);

  afterAll(async () => {
    if (testHelper) await testHelper.destroy();
  }, 120_000);

  test("burst_size=1, gap=1ms, burst_count=5000 时对端抓到 5000 个报文", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "switchport",
      "no shutdown",
      "exit",
      `interface ${Port.B}`,
      "switchport",
      "no shutdown",
      "exit",
      "end",
    ]);

    testHelper.startCapture(StreamPort.B);

    testHelper.addPktSender({
      port: StreamPort.A,
      packet: new PacketBuilder()
        .setEthernet({
          dst: "00:11:22:33:44:55",
          src: "00:00:00:44:55:66",
          type: 0x0800,
        })
        .setIPv4({ src: "198.51.100.2", dst: "203.0.113.2", proto: 17 })
        .setUDP({ sport: 1234, dport: 5678 }),
      transmit_param: {
        mode: TransmitMode.BURST,
        param: {
          burst_size: 1,
          burst_count: 5000,
          gap: 1,
          gap_unit: BurstGapUnit.MS,
          rate: 5000,
          rate_unit: BurstRateUnit.FRAME_PER_SEC,
        },
      },
      wait_time: 1000,
      wait_for_completion: false,
    });

    // 发送不等待完成，留足时间让 5000 个 burst 全部发完。
    testHelper.sleep(12_000);
    testHelper.stopStream(StreamPort.A);

    testHelper.addPktChecker({
      port: StreamPort.B,
      packet: new PacketBuilder().setIPv4({
        src: "198.51.100.2",
        dst: "203.0.113.2",
      }),
      expected_count: 5000,
    });

    await testHelper.startTest();
    expect(testHelper.result()).toBeTruthy();
  }, 120_000);
});
