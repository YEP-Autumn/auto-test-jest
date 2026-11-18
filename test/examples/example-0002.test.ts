import { PacketBuilder, StreamPort, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("抓包并按字段校验报文", async () => {
  testHelper.addPktChecker({
    port: StreamPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:00:11:22:44",
        src: "00:00:00:11:22:33",
      })
      .setVLAN({ vlan: 100 })
      .setIPv6({ dst: "400::1" }),
    expected_count: 1,
  });

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
