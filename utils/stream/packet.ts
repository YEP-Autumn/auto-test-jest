// 假设 Thrift 库和生成的代码已经导入
const thrift = require("thrift");
const ttypes = require("../rpc/gen-nodejs/packet_types");
// 生成的 Thrift JS 代码使用 `Thrift` 全局变量(首字母大写),
// 因此把 thrift 模块挂到全局供生成代码使用
(globalThis as any).Thrift = thrift.Thrift || thrift;

const TCompactProtocol = thrift.TCompactProtocol;
const TBufferedTransport = thrift.TBufferedTransport; // 用于示例

// 从导入的模块中获取 Thrift 生成的类
const { Packet, EthernetII, VLAN, IPv4, FieldMeta, Field, FieldType } = ttypes;

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
const protocol: any = new TCompactProtocol(transport);

// 3. 执行写入操作
packet.write(protocol);
if (typeof transport.flush === "function") {
	transport.flush();
}

// 4. 获取序列化后的 Buffer（优先使用 flush 回调提供的数据）
let serializedBuffer: any = Buffer.alloc(0);
if (capturedFlushBuffer && Buffer.isBuffer(capturedFlushBuffer)) {
	serializedBuffer = capturedFlushBuffer;
} else if (Array.isArray(transport.outBuffers) && transport.outBuffers.length > 0) {
	const bufs = transport.outBuffers.map((b: any) => (Buffer.isBuffer(b) ? b : Buffer.from(b)));
	serializedBuffer = Buffer.concat(bufs);
} else if (Buffer.isBuffer(transport.buffer)) {
	serializedBuffer = transport.buffer;
} else if (typeof transport.getvalue === "function") {
	serializedBuffer = transport.getvalue();
} else if (transport.outBuffer && Buffer.isBuffer(transport.outBuffer)) {
	serializedBuffer = transport.outBuffer;
}

console.log('Serialized length:', serializedBuffer ? serializedBuffer.length : 0);
console.log('Hex Data:', serializedBuffer.toString('hex'));



// 1. 准备 Transport 和 Protocol
// 从序列化得到的 Buffer 中读取
const readTransport: any = new TBufferedTransport();
// 放入序列化的数据到 inBuf，并设置 writeCursor，供读取使用
if (serializedBuffer && serializedBuffer.length > 0) {
	readTransport.inBuf = Buffer.from(serializedBuffer);
	readTransport.readCursor = 0;
	readTransport.writeCursor = serializedBuffer.length;
}
const readProtocol: any = new TCompactProtocol(readTransport);

// 2. 创建一个新的实例来接收数据
const dataReceived = new Packet();

// 3. 执行读取操作
dataReceived.read(readProtocol);

// 4. 验证结果
console.log('Received:', dataReceived);
console.log('Received:', dataReceived.field_list[0]);
console.log('Received:', dataReceived.field_list[1]);
console.log('Received:', dataReceived.field_list[2]);