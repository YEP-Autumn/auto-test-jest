#!/usr/bin/env node
/**
 * 校验 test/ 目录下的目录与文件命名是否符合《测试用例命名规范》
 * （见 docs/spec/naming-convention.md）。
 *
 * 用法：
 *   node script/check-test-names.js
 *
 * 设计原则：命名规范是推荐与最佳实践，脚本只强校验关键规则：
 *   1. test/ 下只允许 feature/、misc/；
 *   2. 一级特性目录 NN-UPPER_SNAKE；
 *   3. feature 下各级子目录 NN-lower_snake[_type]；
 *   4. 用例文件名 NNNN-<顶层特性>.test.ts，且后缀与顶层特性一致；
 *   5. misc 目录/文件命名。
 *
 * 层级深度、类型变体基号、空目录只作为提示（warning），不影响退出码。
 * 违规时打印明细并以退出码 1 结束，可直接接入 CI / pre-commit。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TEST_DIR = path.join(ROOT, "test");

// 推荐的最大层级：feature/<NN-MODULE>/<NN-UG-section>/<NN-子模块>
const RECOMMENDED_MAX_DEPTH = 3;

// 顶层特性目录：NN-UPPER_SNAKE
const RE_FEATURE_DIR = /^\d{2}-[A-Z][A-Z0-9_]*$/;
// 二级及以下子目录：NN-lower_snake（可带 _cli / _neg / _spec / _perf 等类型后缀）
const RE_SUBFEATURE_DIR = /^\d{2}-[a-z0-9]+(_[a-z0-9]+)*$/;
// misc 目录：小写单词（可含连字符）或纯数字缺陷号
const RE_MISC_DIR = /^(\d+|[a-z0-9]+(-[a-z0-9]+)*)$/;
// feature 用例文件：NNNN-FEATURE.test.ts
const RE_FEATURE_FILE = /^(\d{4})-([A-Z][A-Z0-9_]*)\.test\.ts$/;
// misc 用例文件：可带 NNNN- 前缀，词由 _ 或 - 连接
const RE_MISC_FILE = /^(\d{4}-)?[A-Za-z0-9]+([_-][A-Za-z0-9]+)*\.test\.ts$/;
// 根级用例文件
const RE_ROOT_FILE = /^[a-z0-9_-]+\.test\.ts$/;

const violations = [];
const warnings = [];
function bad(target, reason) {
  violations.push(`${path.relative(ROOT, target)}  ->  ${reason}`);
}
function warn(target, reason) {
  warnings.push(`${path.relative(ROOT, target)}  ->  ${reason}`);
}

function listDirs(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}
function listTestFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".test.ts"))
    .map((e) => e.name);
}

// ---- test/ 根 ----
for (const name of listDirs(TEST_DIR)) {
  if (name !== "feature" && name !== "misc") {
    bad(path.join(TEST_DIR, name), "test/ 下只允许 feature/ 与 misc/ 两类目录");
  }
}
for (const name of listTestFiles(TEST_DIR)) {
  if (!RE_ROOT_FILE.test(name)) bad(path.join(TEST_DIR, name), "根级用例文件名不合法");
}

// ---- test/feature ----
const featureDir = path.join(TEST_DIR, "feature");
if (fs.existsSync(featureDir)) {
  for (const feature of listDirs(featureDir)) {
    const featurePath = path.join(featureDir, feature);
    if (!RE_FEATURE_DIR.test(feature)) {
      bad(featurePath, "一级特性目录应为 NN-UPPER_SNAKE");
      continue;
    }
    const featureToken = feature.replace(/^\d+-/, ""); // 05-IP_ROUTE -> IP_ROUTE
    validateFeatureTree(featurePath, featureToken, 1);
  }
}

function validateFeatureTree(dir, featureToken, depth) {
  // 当前目录直属用例：NNNN-<顶层特性>.test.ts
  for (const file of listTestFiles(dir)) {
    const m = file.match(RE_FEATURE_FILE);
    if (!m) bad(path.join(dir, file), "用例文件应为 NNNN-UPPER_SNAKE.test.ts");
    else if (m[2] !== featureToken)
      bad(path.join(dir, file), `文件后缀应等于顶层特性名 ${featureToken}`);
  }

  // 子目录：NN-lower_snake[_type]，允许继续嵌套（仅提示层级）
  for (const name of listDirs(dir)) {
    const p = path.join(dir, name);
    if (!RE_SUBFEATURE_DIR.test(name)) {
      bad(p, "子目录应为 NN-lower_snake[_type]");
      continue;
    }
    if (depth >= RECOMMENDED_MAX_DEPTH) {
      warn(p, `目录层级超过建议上限 ${RECOMMENDED_MAX_DEPTH}，确认是否确有分组必要`);
    }
    validateFeatureTree(p, featureToken, depth + 1);
  }
}

// ---- test/misc ----
const miscDir = path.join(TEST_DIR, "misc");
if (fs.existsSync(miscDir)) {
  const walkMisc = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!RE_MISC_DIR.test(entry.name)) bad(p, "misc 目录命名应为小写单词或缺陷号");
        walkMisc(p);
      } else if (entry.name.endsWith(".test.ts")) {
        if (!RE_MISC_FILE.test(entry.name)) bad(p, "misc 用例文件名不合法");
      }
    }
  };
  walkMisc(miscDir);
}

// ---- 空目录（.gitkeep 视为占位，仅提示） ----
const walkDirs = (dir) => {
  for (const name of listDirs(dir)) {
    const p = path.join(dir, name);
    if (fs.readdirSync(p).length === 0) warn(p, "空目录，建议补用例或添加 .gitkeep 占位");
    walkDirs(p);
  }
};
walkDirs(TEST_DIR);

// ---- 输出 ----
if (warnings.length > 0) {
  console.warn(`[check-test-names] ${warnings.length} 处提示：`);
  for (const w of warnings) console.warn(`  - ${w}`);
}

if (violations.length > 0) {
  console.error(`[check-test-names] 发现 ${violations.length} 处命名违规：`);
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}
console.log("[check-test-names] 命名检查通过。");
