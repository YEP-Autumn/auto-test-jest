#!/usr/bin/env node
/**
 * 按 config/test-migration-map.json 把旧用例迁移到 UG 模块树。
 *
 * 用法：
 *   node script/migrate-test-modules.js            # dry-run，打印完整迁移映射
 *   node script/migrate-test-modules.js --write    # 用 git mv 实际迁移，并清理空目录
 *   node script/migrate-test-modules.js --json     # 以 JSON 输出映射（便于审阅/二次处理）
 *
 * 行为：
 *   - groups 的先后顺序决定同一目标目录内的编号顺序；
 *   - 目标文件名统一重排为 <NNNN>-<token>.test.ts（start/step/width 见 map）；
 *   - 任何「源文件未被映射、且不在 exclude 中」的情况都会报错退出；
 *   - 目标文件已存在、目标目录不存在、重名等情况均会报错，不静默覆盖。
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const MAP_FILE = path.join(ROOT, "config", "test-migration-map.json");
const MODULE_MAP_FILE = path.join(ROOT, "config", "test-module-map.json");

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const JSON_OUT = args.includes("--json");
const KNOWN = ["--write", "--json", "--help", "-h"];
const unknown = args.filter((a) => !KNOWN.includes(a));
if (unknown.length > 0) {
  console.error(`未知参数：${unknown.join(" ")}`);
  process.exit(2);
}
if (args.includes("--help") || args.includes("-h")) {
  console.log("用法：node script/migrate-test-modules.js [--write] [--json]");
  process.exit(0);
}

const migrateMap = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
const moduleMap = JSON.parse(fs.readFileSync(MODULE_MAP_FILE, "utf8"));
const { start, step, width } = migrateMap.renumber;

const errors = [];
const warnings = [];
const moves = []; // { from, to, group }

// ---- 已知模块目录集合，用于校验目标 ----
const knownDirs = new Set();
for (const mod of moduleMap.modules) {
  for (const sub of mod.submodules) {
    const types = Array.isArray(sub.types) && sub.types.length > 0 ? sub.types : ["func"];
    for (const t of types) {
      knownDirs.add(
        path.posix.join("test/feature", mod.id, `${sub.id}${moduleMap.typeSuffixes[t]}`),
      );
    }
  }
}

const exclude = new Set((migrateMap.exclude || []).map((e) => e.path));

function walkTestFiles(p) {
  const abs = path.join(ROOT, p);
  if (!fs.existsSync(abs)) {
    errors.push(`源路径不存在：${p}`);
    return [];
  }
  const stat = fs.statSync(abs);
  if (stat.isFile()) return p.endsWith(".test.ts") ? [p] : [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.posix.join(p, entry.name);
    if (entry.isDirectory()) out.push(...walkTestFiles(rel));
    else if (entry.name.endsWith(".test.ts")) out.push(rel);
  }
  return out;
}

// 按「原编号 -> 原文件名」排序，保证同一旧目录内顺序稳定
function naturalKey(rel) {
  const base = path.posix.basename(rel);
  const m = base.match(/^(\d+)/);
  return [m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER, base, rel];
}
function compareNatural(a, b) {
  const ka = naturalKey(a);
  const kb = naturalKey(b);
  for (let i = 0; i < 2; i++) {
    if (ka[i] < kb[i]) return -1;
    if (ka[i] > kb[i]) return 1;
  }
  return ka[2] < kb[2] ? -1 : ka[2] > kb[2] ? 1 : 0;
}

const covered = new Set();

for (const group of migrateMap.groups || []) {
  if (!knownDirs.has(group.to)) {
    errors.push(`目标目录未在 test-module-map.json 中定义：${group.to}`);
    continue;
  }
  if (!fs.existsSync(path.join(ROOT, group.to))) {
    errors.push(`目标目录不存在（先运行 scaffold --write）：${group.to}`);
    continue;
  }
  // 保持 from 的目录顺序：先按目录分组，再在目录内按原编号排序
  const files = [];
  for (const src of group.from || []) files.push(...walkTestFiles(src).sort(compareNatural));

  const kept = [];
  for (const f of files) {
    if (exclude.has(f)) {
      warnings.push(`排除：${f}（见 migration-map.exclude）`);
      continue;
    }
    covered.add(f);
    kept.push(f);
  }
  kept.forEach((from, i) => {
    const num = String(start + step * i).padStart(width, "0");
    moves.push({
      from,
      to: path.posix.join(group.to, `${num}-${group.token}.test.ts`),
      group: group.to,
    });
  });
}

// ---- 覆盖率检查：test/feature 下所有用例都必须被映射或显式排除 ----
const allFeatureFiles = walkTestFiles("test/feature");
const uncovered = allFeatureFiles.filter((f) => !covered.has(f) && !exclude.has(f));
if (uncovered.length > 0) {
  errors.push(`以下用例未出现在 migration-map 中（新增用例请补映射或 exclude）：`);
  for (const f of uncovered) errors.push(`  - ${f}`);
}

// ---- 冲突检查 ----
const seenTo = new Map();
for (const m of moves) {
  if (seenTo.has(m.to)) {
    errors.push(`目标路径重复：${m.to}（${seenTo.get(m.to)} 与 ${m.from}）`);
  }
  seenTo.set(m.to, m.from);
  if (fs.existsSync(path.join(ROOT, m.to))) {
    errors.push(`目标文件已存在，拒绝覆盖：${m.to}`);
  }
}

if (errors.length > 0) {
  console.error("迁移映射校验失败：");
  for (const e of errors) console.error(e.startsWith("  ") ? e : `  - ${e}`);
  process.exit(1);
}

// ---- 输出 ----
if (JSON_OUT) {
  console.log(JSON.stringify({ moves, warnings }, null, 2));
  process.exit(0);
}

let currentGroup = "";
for (const m of moves) {
  if (m.group !== currentGroup) {
    currentGroup = m.group;
    console.log(`\n${currentGroup}`);
  }
  console.log(`  ${m.from}`);
  console.log(`    -> ${path.posix.basename(m.to)}`);
}
console.log(`\n共 ${moves.length} 个文件，${(migrateMap.groups || []).length} 个目标目录。`);
for (const w of warnings) console.log(`  ! ${w}`);

if (!WRITE) {
  console.log("\n以上为 dry-run 结果，未写入磁盘。执行 --write 生效。");
  process.exit(0);
}

// ---- 执行 git mv ----
for (const m of moves) {
  execFileSync("git", ["mv", m.from, m.to], { cwd: ROOT, stdio: "pipe" });
}
console.log(`\n已迁移 ${moves.length} 个文件。`);

// ---- 清理空目录（只删 test/feature 下的空目录，保留 .gitkeep 所在目录） ----
let removed = 0;
function pruneEmpty(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.isDirectory()) pruneEmpty(path.posix.join(dir, entry.name));
  }
  if (dir === "test/feature") return; // 不删根
  const rest = fs.readdirSync(abs);
  if (rest.length === 0) {
    fs.rmdirSync(abs);
    removed++;
  }
}
for (const group of migrateMap.groups || []) {
  for (const src of group.from || []) {
    const abs = path.join(ROOT, src);
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) pruneEmpty(src);
  }
}
console.log(`已清理空目录 ${removed} 个。`);
console.log("\n后续：更新 config/*.cjs 的 testRegex、docs/test-cases 映射与 README 目录树。");
