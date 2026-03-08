import { TransmitMode } from "../../utils/comm/Components";
import {
  StreamBackendApi,
  RenixPort,
} from "../../utils/stream/StreamBackendApi";
import { PacketBuilder } from "../../utils/stream/thrift_packet";
import { TestHelper } from "../../utils/TestHelper";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;
const streamBackendApi = new StreamBackendApi();

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("", async () => {
  testHelper.addPktChecker({
    port: RenixPort.A,
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
