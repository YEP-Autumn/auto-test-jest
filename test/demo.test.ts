import { ControllerApi } from "../utils/controller/ControllerApi";
import {
  EthernetPacketBuilder,
  EthernetPacketParser,
  PacketListBuilder,
  PacketListParser,
} from "../utils/stream/thrift_packet";
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

// test(
//   "test",
//   async () => {
//     let pkt_buff = new EthernetPacketBuilder()
//       // .setEthernet("00:aa:bb:cc:dd:ee", "11:22:33:44:55:66", 0x8100)
//       .setEthernet("00:00:00:00:00:ee", "00:00:00:00:00:66", 0x8100)
//       .setVLAN(2, 0x0800)
//       .setIPv4(0xc0a80001, 0xc0a80002)
//       .build(ThriftPresets.DEFAULT);
//     const parser = new EthernetPacketParser();
//     const packet = parser.parse(pkt_buff);
//     console.log(JSON.stringify(packet)); // true
//     // 或直接获取校验器
//     const validator = parser.parseToValidator(pkt_buff);
//     console.log(validator.hasEthernet()); // true
//     console.log(validator.validateEthernet("00:00:00:00:00:ee"));
//     await streamBackendApi.streamPacketSendStart(pkt_buff, {
//       port: RenixPort.A,
//       count: 100,
//     });
//   },
//   1000 * 60 * 10
// );

/**
 * 演示代码：报文列表的序列化和反序列化
 */
test("演示：报文列表序列化和反序列化", async () => {
  // 1. 构建多个报文
  const packetBuilder1 = new EthernetPacketBuilder()
    .setEthernet("00:00:00:00:00:11", "00:00:00:00:00:22", 0x8100)
    .setVLAN(100, 0x0800)
    .setIPv4(0xc0a80001, 0xc0a80002);

  const packetBuilder2 = new EthernetPacketBuilder()
    .setEthernet("00:00:00:00:00:33", "00:00:00:00:00:44", 0x8100)
    .setVLAN(200, 0x0800)
    .setIPv4(0xc0a81001, 0xc0a81002);

  const packetBuilder3 = new EthernetPacketBuilder()
    .setEthernet("00:00:00:00:00:55", "00:00:00:00:00:66", 0x0800)
    .setIPv4(0xc0a82001, 0xc0a82002);

  // 2. 使用 PacketListBuilder 构建报文列表
  const packetListBuilder = new PacketListBuilder()
    .addFromBuilder(packetBuilder1)
    .addFromBuilder(packetBuilder2)
    .addFromBuilder(packetBuilder3);

  console.log("报文列表中的报文数量:", packetListBuilder.getPacketCount());

  // 3. 序列化为 Buffer
  const packetListBuffer = packetListBuilder.build(ThriftPresets.DEFAULT);
  console.log("报文列表序列化后的大小:", packetListBuffer.length, "字节");

  await streamBackendApi.streamPacketListSendStart(packetListBuffer, {
    port: RenixPort.A,
    count: 100,
  });

  // // 4. 使用 PacketListParser 解析报文列表
  // const listParser = new PacketListParser();

  // // 获取报文总数
  // const count = listParser.getPacketCount(packetListBuffer);
  // console.log("解析得到的报文数量:", count);

  // // 5. 逐个验证报文
  // for (let i = 0; i < count; i++) {
  //   const validator = listParser.getValidatorAt(packetListBuffer, i);
  //   if (validator) {
  //     console.log(`报文 ${i}:`, {
  //       hasEthernet: validator.hasEthernet(),
  //       hasVLAN: validator.hasVLAN(),
  //       hasIPv4: validator.hasIPv4(),
  //       fieldCount: validator.getFieldCount(),
  //     });
  //   }
  // }

  // // 6. 批量获取所有校验器
  // const allValidators = listParser.getAllValidators(packetListBuffer);
  // console.log("获取所有校验器数量:", allValidators.length);

  // // 验证第一个报文的 VLAN ID
  // const result1 = allValidators[0].validateVLAN(100);
  // console.log("报文 1 的 VLAN 验证:", result1.message);

  // // 验证第二个报文的 VLAN ID
  // const result2 = allValidators[1].validateVLAN(200);
  // console.log("报文 2 的 VLAN 验证:", result2.message);

  // // 验证第三个报文（无 VLAN）
  // const result3 = allValidators[2].validateVLAN();
  // console.log("报文 3 的 VLAN 验证:", result3.message);

  // expect(count).toBe(3);
  // expect(allValidators.length).toBe(3);
  // expect(result1.passed).toBe(true);
  // expect(result2.passed).toBe(true);
  // expect(result3.passed).toBe(false); // 第三个报文没有 VLAN
});

// test("测试demo功能", async () => {
//   testHelper.ExecConfigDutA(["configure terminal", "end"]);

//   testHelper.sleep(5000);

//   testHelper.ExecRetMatchDutA("ping 127.0.0.1", / 0% packet loss/g);

//   testHelper.CleanConfigDutA(["configure terminal", "end"]);

//   await testHelper.startTest();

//   expect(testHelper.result()).toBeTruthy();
// });
