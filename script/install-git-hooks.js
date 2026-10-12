#!/usr/bin/env node
/**
 * 安装仓库自带的 git hooks（core.hooksPath -> script/git-hooks）。
 *
 * 用法：
 *   node script/install-git-hooks.js
 *
 * 幂等：重复执行只覆盖配置，不会失败；非 git 仓库或 CI 环境自动跳过。
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const HOOKS_DIR = path.join(ROOT, "script", "git-hooks");
const HOOKS_PATH = "script/git-hooks";

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

function main() {
  if (!fs.existsSync(path.join(ROOT, ".git"))) {
    console.log("[install-git-hooks] 非 git 仓库，跳过");
    return;
  }
  if (process.env.CI) {
    console.log("[install-git-hooks] CI 环境，跳过");
    return;
  }

  git(["config", "core.hooksPath", HOOKS_PATH]);
  for (const name of fs.readdirSync(HOOKS_DIR)) {
    const p = path.join(HOOKS_DIR, name);
    if (fs.statSync(p).isFile()) fs.chmodSync(p, 0o755);
  }
  console.log(
    `[install-git-hooks] 已启用 hooks：core.hooksPath=${git([
      "config",
      "core.hooksPath",
    ])}`,
  );
}

try {
  main();
} catch (e) {
  // 安装失败不应阻断 npm install
  console.warn(`[install-git-hooks] 跳过：${e.message}`);
}
