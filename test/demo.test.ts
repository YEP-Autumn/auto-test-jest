import { ControllerApi } from "../utils/controller/ControllerApi";
import { EthernetPacketBuilder } from "../utils/stream/packet";
import { StreamBackendApi } from "../utils/stream/StreamBackendApi";
import { ThriftPresets } from "../utils/stream/thrift-protocol.factory";
import { TestHelper } from "../utils/TestHelper";

let testHelper: TestHelper;
const streamBackendApi = new StreamBackendApi();

beforeAll(async () => {
  // testHelper = await new TestHelper().init();
});

afterAll(async () => {
  // await testHelper.destroy();
});

test(
  "test",
  async () => {
    let pkt_buff = new EthernetPacketBuilder()
      .setEthernet("00aa.bbcc.ddee", "1122.3344.5566", 0x0800)
      .setVLAN(100, 0x0800)
      .setIPv4(0xc0a80001, 0xc0a80002)
      .build();

    await streamBackendApi.streamPacketSend(pkt_buff, {
      count: 5,
      interval: 1000,
    });
  },
  1000 * 60 * 10
);

// test("测试demo功能", async () => {
//   testHelper.ExecConfigDutA(["configure terminal", "end"]);

//   testHelper.sleep(5000);

//   testHelper.ExecRetMatchDutA("ping 127.0.0.1", / 0% packet loss/g);

//   testHelper.CleanConfigDutA(["configure terminal", "end"]);

//   await testHelper.startTest();

//   expect(testHelper.result()).toBeTruthy();
// });
