/**
 * 报文模型与校验工具的公共入口。
 *
 * 这里只导出“测试侧构造/校验报文”需要的内容，不加载 HTTP/gRPC 后端，
 * 避免普通用例 import PacketBuilder 时把 axios/grpc 一并拉起来。
 *
 * 目录结构：
 *   packet/    报文模型、发送参数、匹配与格式化
 *   codec/     地址、thrift、raw frame、SNMP、gRPC header 编解码
 *   backend/   Renix HTTP / stream-linux gRPC 后端
 *
 * 兼容入口：
 *   thrift-packet.ts      -> 旧测试的 PacketBuilder / thrift 导入
 *   packet-utils.ts       -> 旧 packet 匹配/格式化导入
 *   stream-backend-api.ts -> 旧 HTTP backend 导入
 */

export * from "./packet/model";
export * from "./packet/types";
export * from "./packet/match";
export * from "./packet/format";
