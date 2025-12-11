import { ControllerApi } from "../utils/controller/ControllerApi";
import {
  EthernetPacketBuilder,
  EthernetPacketParser,
} from "../utils/stream/packet";
import { RenixPort, StreamBackendApi } from "../utils/stream/StreamBackendApi";
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
      // .setEthernet("00:aa:bb:cc:dd:ee", "11:22:33:44:55:66", 0x8100)
      .setEthernet("00:00:00:00:00:ee", "00:00:00:00:00:66", 0x8100)
      .setVLAN(2, 0x0800)
      .setIPv4(0xc0a80001, 0xc0a80002)
      .build(ThriftPresets.STREAMING);

    const parser = new EthernetPacketParser();
    const packet = parser.parse(pkt_buff);
    console.log(JSON.stringify(packet)); // true
    // 或直接获取校验器
    const validator = parser.parseToValidator(pkt_buff);
    console.log(validator.hasEthernet()); // true
    console.log(validator.validateEthernet("00:00:00:00:00:ee"));

    // await streamBackendApi.streamPacketSendStart(pkt_buff, {
    //   port: RenixPort.A,
    //   count: 100,
    // });
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
