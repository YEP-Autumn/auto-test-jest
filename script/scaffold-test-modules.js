#!/usr/bin/env node
/**
 * 按 config/test-module-map.json 生成 test/feature 下的模块 / 子模块目录。
 *
 * 用法：
 *   node script/scaffold-test-modules.js            # 只打印将要创建的目录（dry-run）
 *   node script/scaffold-test-modules.js --write    # 实际创建目录并写入 .gitkeep
 *   node script/scaffold-test-modules.js --check    # 只校验 map 与目录是否一致（CI 用）
 *
 * 目录规则见 docs/spec/naming-convention.md：
 *   test/feature/<NN-UPPER_SNAKE>[/<NN-lower_snake>[/<NN-lower_snake>[_类型后缀]]]
 *   - 有 children 的子模块是「容器」，只建目录、不放用例；
 *   - 叶子子模块按 types 展开：func -> ""，cli -> "_cli"，其余见 typeSuffixes。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MAP_FILE = path.join(ROOT, "config", "test-module-map.json");
const FEATURE_DIR = path.join(ROOT, "test", "feature");

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const CHECK_ONLY = args.includes("--check");
const KNOWN_FLAGS = ["--write", "--check", "--help", "-h"];
const unknown = args.filter((a) => !KNOWN_FLAGS.includes(a));
if (unknown.length > 0) {
  console.error(`未知参数：${unknown.join(" ")}`);
  process.exit(2);
}
if (args.includes("--help") || args.includes("-h")) {
  console.log("用法：node script/scaffold-test-modules.js [--write|--check]");
  process.exit(0);
}
if (WRITE && CHECK_ONLY) {
  console.error("--write 与 --check 不能同时使用");
  process.exit(2);
}

const map = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));

// ---- 校验 map ----
const RE_MODULE = /^\d{2}-[A-Z][A-Z0-9_]*$/;
const RE_SUB = /^\d{2}-[a-z0-9]+(_[a-z0-9]+)*$/;
const errors = [];
const warnings = [];
const planned = []; // { rel, kind: "container"|"tests", type? }

const seenModules = new Set();

function collectSubs(parentRel, subs, depth) {
  const seen = new Set();
  for (const sub of subs || []) {
    if (!RE_SUB.test(sub.id)) {
      errors.push(`子模块 id 不合法：${parentRel}/${sub.id}`);
      continue;
    }
    if (seen.has(sub.id)) errors.push(`子模块 id 重复：${parentRel}/${sub.id}`);
    seen.add(sub.id);

    const rel = path.posix.join(parentRel, sub.id);
    if (depth > 3) warnings.push(`目录层级超过建议上限 3：${rel}`);

    if (Array.isArray(sub.children) && sub.children.length > 0) {
      planned.push({ rel, kind: "container" });
      collectSubs(rel, sub.children, depth + 1);
      continue;
    }

    const types = Array.isArray(sub.types) && sub.types.length > 0 ? sub.types : ["func"];
    for (const t of types) {
      if (!(t in map.typeSuffixes)) {
        errors.push(`未知类型 "${t}"：${rel}`);
        continue;
      }
      planned.push({
        rel: `${rel}${map.typeSuffixes[t]}`,
        kind: "tests",
        type: t,
        title: sub.title,
      });
    }
  }
}

for (const mod of map.modules || []) {
  if (!RE_MODULE.test(mod.id)) {
    errors.push(`模块 id 不合法：${mod.id}`);
    continue;
  }
  if (seenModules.has(mod.id)) errors.push(`模块 id 重复：${mod.id}`);
  seenModules.add(mod.id);
  collectSubs(path.posix.join("test/feature", mod.id), mod.submodules, 2);
}

if (errors.length > 0) {
  console.error("test-module-map.json 校验失败：");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
for (const w of warnings) console.warn(`[scaffold] 提示：${w}`);

// ---- 计划创建 / 检查 ----
const toCreate = [];
const existing = [];
for (const item of planned) {
  const abs = path.join(ROOT, item.rel);
  if (fs.existsSync(abs)) existing.push(item);
  else toCreate.push(item);
}

const mode = WRITE ? "write" : CHECK_ONLY ? "check" : "dry-run";
console.log(`模式：${mode}`);
console.log(`模块：${map.modules.length}，目录（含容器与类型变体）：${planned.length}`);
console.log(`已存在：${existing.length}，待创建：${toCreate.length}`);

if (CHECK_ONLY) {
  if (toCreate.length > 0) {
    console.error("以下目录在 map 中定义但尚未创建：");
    for (const item of toCreate) console.error(`  - ${item.rel}`);
    process.exit(1);
  }
  console.log("目录结构与 map 一致。");
  process.exit(0);
}

for (const item of toCreate) {
  const label = item.kind === "container" ? "  (容器)" : item.type === "func" ? "" : `  (${item.type})`;
  console.log(`  + ${item.rel}${label}`);
  if (WRITE) {
    const abs = path.join(ROOT, item.rel);
    fs.mkdirSync(abs, { recursive: true });
    // 容器目录会由子目录填充；叶子先放 .gitkeep 占位
    if (item.kind === "tests") fs.writeFileSync(path.join(abs, ".gitkeep"), "");
  }
}

if (!WRITE) {
  console.log("\n以上为 dry-run 结果，未写入磁盘。执行 `node script/scaffold-test-modules.js --write` 生效。");
}
