#!/usr/bin/env node
/**
 * 生成 thrift 代码（utils/rpc/gen-nodejs/packet_types.js）。
 *
 * gen-nodejs 目录被 .gitignore 忽略，因此全新 clone 或 CI 上缺少该文件会导致
 * Jest 报错：Cannot find module '../rpc/gen-nodejs/packet_types'。
 *
 * 用法：
 *   node script/gen-thrift.js          # 仅在缺失时生成
 *   node script/gen-thrift.js --force  # 强制重新生成
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rpcDir = path.resolve(__dirname, "../utils/rpc");
const thriftFile = "thrift/packet.thrift";
const outputFile = path.join(rpcDir, "gen-nodejs", "packet_types.js");
const force = process.argv.includes("--force");

if (!force && fs.existsSync(outputFile)) {
  process.exit(0);
}

const result = spawnSync("thrift", ["--gen", "js:node", thriftFile], {
  cwd: rpcDir,
  stdio: "pipe",
  encoding: "utf8",
});

if (result.error) {
  console.error(
    "[gen-thrift] 无法执行 thrift 命令，请先安装 Thrift 编译器（例如 apt install thrift）。"
  );
  console.error(result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  console.error(`[gen-thrift] thrift 生成失败，退出码：${result.status}`);
  process.exit(result.status || 1);
}

if (!fs.existsSync(outputFile)) {
  console.error(`[gen-thrift] 生成后仍未找到期望的文件：${outputFile}`);
  process.exit(1);
}
