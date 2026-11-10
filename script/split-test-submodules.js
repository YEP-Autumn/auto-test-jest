#!/usr/bin/env node
/**
 * 按 config/test-split-map.json 把「UG 小节」这一层的扁平用例，下沉到「子功能」层。
 *
 *   test/feature/05-IP_ROUTE/07-bgp/0010-IP_ROUTE.test.ts
 *     -> test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0010-IP_ROUTE.test.ts
 *
 * 用法：
 *   node script/split-test-submodules.js            # dry-run
 *   node script/split-test-submodules.js --write    # git mv + 重新编号 + 清理空目录
 *
 * 目标目录必须已由 scaffold-test-modules.js 创建，避免 map 与实际结构漂移。
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const MAP_FILE = path.join(ROOT, "config", "test-split-map.json");

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const KNOWN = ["--write", "--help", "-h"];
const unknown = args.filter((a) => !KNOWN.includes(a));
if (unknown.length > 0) {
  console.error(`未知参数：${unknown.join(" ")}`);
  process.exit(2);
}
if (args.includes("--help") || args.includes("-h")) {
  console.log("用法：node script/split-test-submodules.js [--write]");
  process.exit(0);
}

const map = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
const { start, step, width } = map.renumber;
const errors = [];
const moves = [];

function listTestFiles(rel) {
  const abs = path.join(ROOT, rel);
  return fs
    .readdirSync(abs, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".test.ts"))
    .map((e) => path.posix.join(rel, e.name))
    .sort((a, b) => {
      const na = parseInt(path.posix.basename(a).slice(0, 4), 10);
      const nb = parseInt(path.posix.basename(b).slice(0, 4), 10);
      return na - nb || (a < b ? -1 : 1);
    });
}

for (const split of map.splits || []) {
  const absFrom = path.join(ROOT, split.from);
  if (!fs.existsSync(absFrom)) {
    errors.push(`源目录不存在：${split.from}`);
    continue;
  }
  const files = listTestFiles(split.from);
  const declared = split.groups
    .filter((g) => typeof g.count === "number")
    .reduce((s, g) => s + g.count, 0);
  const hasPartial = split.groups.some((g) => typeof g.count === "number");
  if (hasPartial && declared !== files.length) {
    errors.push(
      `${split.from} 文件数 ${files.length} 与 groups 声明数 ${declared} 不一致`,
    );
    continue;
  }

  let cursor = 0;
  for (const group of split.groups) {
    const count = typeof group.count === "number" ? group.count : files.length - cursor;
    const picked = files.slice(cursor, cursor + count);
    cursor += count;
    const destDir = group.to.startsWith("test/")
      ? group.to
      : path.posix.join(split.base || split.from, group.to);
    if (!fs.existsSync(path.join(ROOT, destDir))) {
      errors.push(`目标目录不存在（先运行 scaffold --write）：${destDir}`);
      continue;
    }
    picked.forEach((from, i) => {
      const num = String(start + step * i).padStart(width, "0");
      moves.push({
        from,
        to: path.posix.join(destDir, `${num}-${split.token}.test.ts`),
        destDir,
      });
    });
  }
  if (cursor !== files.length) {
    errors.push(`${split.from} 仅分配了 ${cursor}/${files.length} 个文件`);
  }
}

const seen = new Set();
for (const m of moves) {
  if (seen.has(m.to)) errors.push(`目标路径重复：${m.to}`);
  seen.add(m.to);
  if (fs.existsSync(path.join(ROOT, m.to))) errors.push(`目标已存在：${m.to}`);
}

if (errors.length > 0) {
  console.error("split map 校验失败：");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

let currentDir = "";
for (const m of moves) {
  if (m.destDir !== currentDir) {
    currentDir = m.destDir;
    console.log(`\n${currentDir}`);
  }
  console.log(`  ${path.posix.basename(m.from)} -> ${path.posix.basename(m.to)}`);
}
console.log(`\n共 ${moves.length} 个文件，${new Set(moves.map((m) => m.destDir)).size} 个目标目录。`);

if (!WRITE) {
  console.log("\n以上为 dry-run 结果，未写入磁盘。执行 --write 生效。");
  process.exit(0);
}

for (const m of moves) {
  execFileSync("git", ["mv", m.from, m.to], { cwd: ROOT, stdio: "pipe" });
}
console.log(`\n已移动 ${moves.length} 个文件。`);

// 清理空源目录（逐级向上，不越过 test/feature）
let removed = 0;
function prune(dirRel) {
  const abs = path.join(ROOT, dirRel);
  if (!fs.existsSync(abs)) return;
  if (dirRel === "test/feature" || dirRel === "test") return;
  if (fs.readdirSync(abs).length === 0) {
    fs.rmdirSync(abs);
    removed++;
    prune(path.posix.dirname(dirRel));
  }
}
for (const split of map.splits || []) prune(split.from);
console.log(`已清理空目录 ${removed} 个。`);
console.log("\n后续：更新 config/*.cjs 的 testRegex 与 docs。");
