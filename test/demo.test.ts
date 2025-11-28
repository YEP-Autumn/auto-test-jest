import { ControllerApi } from "../utils/sdn-controller/ControllerApi";
import { TestHelper } from "../utils/TestHelper";

let testHelper: TestHelper;
const controller = new ControllerApi();

beforeAll(async () => {
  // testHelper = await new TestHelper().init();
});

afterAll(async () => {
  // await testHelper.destroy();
});

test(
  "test",
  async () => {
    // await controller.topolopyCreate("this field topology_name");

    await controller.streamPacketSend(
      make_packet_buffer(),
      { aaa: 134, bbb: "456" },
      "test_packet"
    );
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

const thrift = require("thrift");
const ttypes = require("..//utils/rpc/gen-nodejs/packet_types");

const { Packet, EthernetII, VLAN, IPv4, FieldMeta, Field, FieldType } = ttypes;

function make_packet_buffer() {
  const TCompactProtocol = thrift.TCompactProtocol;
  const TBufferedTransport = thrift.TBufferedTransport;
  const TFramedTransport = thrift.TFramedTransport;
  const TBinaryProtocol = thrift.TBinaryProtocol;
  let packet = new Packet();

  let ethernet = new EthernetII();
  ethernet.src = "0001.0203.1002";
  ethernet.dst = "0001.0203.1003";
  ethernet.type = 0x8100;
  console.log(ethernet);

  let vlan = new VLAN();
  vlan.vlan = 100;
  vlan.type = 0x0800;
  console.log(vlan);

  let ipv4 = new IPv4();
  ipv4.src_ip = 100000;
  ipv4.dst_ip = 200000;
  console.log(ipv4);

  let fieldMeta = new FieldMeta();
  let fieldMeta2 = new FieldMeta();
  let fieldMeta3 = new FieldMeta();

  let field = new Field();
  let field2 = new Field();
  let field3 = new Field();

  field.ether = ethernet;
  field2.vlan = vlan;
  field3.ipv4 = ipv4;

  fieldMeta.field = field;
  fieldMeta.type = FieldType.EthernetII;

  fieldMeta2.field = field2;
  fieldMeta2.type = FieldType.VLAN;

  fieldMeta3.field = field3;
  fieldMeta3.type = FieldType.IPV4;

  packet.field_list = [fieldMeta, fieldMeta2, fieldMeta3];

  console.log(packet.field_list[0]);

  let capturedFlushBuffer: Buffer | null = null;
  const transport: any = new TBufferedTransport(null, (msg: Buffer) => {
    capturedFlushBuffer = msg;
  });
  // const transport: any = new TFramedTransport(null, (msg: Buffer) => {
  //   capturedFlushBuffer = msg;
  // });
  // const protocol: any = new TCompactProtocol(transport);
  const protocol: any = new TBinaryProtocol(transport);

  // 3. 执行写入操作
  packet.write(protocol);
  if (typeof transport.flush === "function") {
    transport.flush();
  }

  // 4. 获取序列化后的 Buffer（优先使用 flush 回调提供的数据）
  let serializedBuffer: any = Buffer.alloc(0);
  if (capturedFlushBuffer && Buffer.isBuffer(capturedFlushBuffer)) {
    serializedBuffer = capturedFlushBuffer;
  } else if (
    Array.isArray(transport.outBuffers) &&
    transport.outBuffers.length > 0
  ) {
    const bufs = transport.outBuffers.map((b: any) =>
      Buffer.isBuffer(b) ? b : Buffer.from(b)
    );
    serializedBuffer = Buffer.concat(bufs);
  } else if (Buffer.isBuffer(transport.buffer)) {
    serializedBuffer = transport.buffer;
  } else if (typeof transport.getvalue === "function") {
    serializedBuffer = transport.getvalue();
  } else if (transport.outBuffer && Buffer.isBuffer(transport.outBuffer)) {
    serializedBuffer = transport.outBuffer;
  }

  console.log(
    "Serialized length:",
    serializedBuffer ? serializedBuffer.length : 0
  );
  console.log("Hex Data:", serializedBuffer.toString("hex"));
  return serializedBuffer;
}
