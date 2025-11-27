// 假设 Thrift 库和生成的代码已经导入
const thrift = require("thrift");
require("../rpc/gen-js/packet_types");

const TCompactProtocol = thrift.TCompactProtocol;
const TBufferedTransport = thrift.TBufferedTransport; // 用于示例

// 从全局作用域获取 Thrift 生成的类
const { Packet, EthernetII, VLAN, IPv4, FieldMeta, Field } = globalThis as any;

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
let field = new Field();

