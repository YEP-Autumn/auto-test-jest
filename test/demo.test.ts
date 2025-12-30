import { RenixPort, StreamBackendApi } from "../utils/stream/StreamBackendApi";
import { PacketBuilder } from "../utils/stream/thrift_packet";
import { TestHelper } from "../utils/TestHelper";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;
const streamBackendApi = new StreamBackendApi();

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test.only("demo test example", async () => {
  await streamBackendApi.streamPacketCaptureGet(RenixPort.B);

  testHelper.addPktChecker({
    pkt: new PacketBuilder().setEthernet({
      dst: "ff:ff:ff:ff:ff:ff",
      src: "00:11:22:33:44:55",
      type: 0x0800,
    }),
  });
});
