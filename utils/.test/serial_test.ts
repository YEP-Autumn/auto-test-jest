// 假设 Thrift 库和生成的代码已经导入
const thrift = require("thrift");
const ttypes = require("../rpc/gen-nodejs/tutorial_types");
const Work = ttypes.Work;

const TCompactProtocol = thrift.TCompactProtocol;
const TBufferedTransport = thrift.TBufferedTransport; // 用于示例

// 1. 创建 Thrift 实例
const work = new Work();
work.op = ttypes.Operation.DIVIDE;
work.num1 = 1;
work.num2 = 123456789;

// 2. 创建 Transport 和 Protocol (通常需要一个 Transport 来管理字节流)
let capturedFlushBuffer: Buffer | null = null;
const transport: any = new TBufferedTransport(null, (msg: Buffer) => {
	capturedFlushBuffer = msg;
});
const protocol: any = new TCompactProtocol(transport);

// 3. 执行写入操作
work.write(protocol);
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
const readProtocol: any = new TCompactProtocol(readTransport); // 必须匹配写入时的协议

// 2. 创建一个新的实例来接收数据
const dataReceived = new Work();

// 3. 执行读取操作
dataReceived.read(readProtocol);

// 4. 验证结果
console.log('Received:', dataReceived);
console.log('op:', dataReceived.op);
console.log('num1:', dataReceived.num1);
console.log('num2:', dataReceived.num2);