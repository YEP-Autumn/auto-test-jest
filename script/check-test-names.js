#!/usr/bin/env node
/**
 * 校验 test/ 目录下的目录与文件命名是否符合《测试用例命名规范》
 * （见 docs/spec/naming-convention.md）。
 *
 * 用法：
 *   node script/check-test-names.js
 *
 * 违规时打印明细并以退出码 1 结束，可直接接入 CI / pre-commit。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TEST_DIR = path.join(ROOT, "test");

// 顶层特性目录：NN-UPPER_SNAKE
const RE_FEATURE_DIR = /^\d{2}-[A-Z][A-Z0-9_]*$/;
// 二级子特性目录：NN-lower_snake
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
function bad(target, reason) {
  violations.push(`${path.relative(ROOT, target)}  ->  ${reason}`);
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
function listEntries(dir) {
  return fs.readdirSync(dir);
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
      bad(featurePath, "特性目录应为 NN-UPPER_SNAKE");
      continue; // 名称已不合规就不再推断后缀
    }
    const featureToken = feature.replace(/^\d+-/, ""); // 30-MPLS -> MPLS

    // 直属用例：NNNN-<FEATURE>.test.ts
    for (const file of listTestFiles(featurePath)) {
      const m = file.match(RE_FEATURE_FILE);
      if (!m) bad(path.join(featurePath, file), "用例文件应为 NNNN-UPPER_SNAKE.test.ts");
      else if (m[2] !== featureToken)
        bad(path.join(featurePath, file), `文件后缀应等于特性名 ${featureToken}`);
    }
    // 二级子特性目录
    for (const sub of listDirs(featurePath)) {
      const subPath = path.join(featurePath, sub);
      if (!RE_SUBFEATURE_DIR.test(sub)) {
        bad(subPath, "子特性目录应为 NN-lower_snake");
        continue;
      }
      const nestedDirs = listDirs(subPath);
      if (nestedDirs.length > 0)
        bad(subPath, `不允许三级目录：${nestedDirs.join(", ")}`);
      for (const file of listTestFiles(subPath)) {
        const m = file.match(RE_FEATURE_FILE);
        if (!m) bad(path.join(subPath, file), "用例文件应为 NNNN-UPPER_SNAKE.test.ts");
        else if (m[2] !== featureToken)
          bad(path.join(subPath, file), `文件后缀应等于顶层特性名 ${featureToken}`);
      }
    }
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

// ---- 空目录（.gitkeep 视为占位） ----
const walkDirs = (dir) => {
  for (const name of listDirs(dir)) {
    const p = path.join(dir, name);
    const entries = listEntries(p);
    if (entries.length === 0) bad(p, "空目录，请补用例或添加 .gitkeep 占位");
    walkDirs(p);
  }
};
walkDirs(TEST_DIR);

// ---- 用例标题不允许为空 ----
const walkFiles = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(p);
    else if (entry.name.endsWith(".test.ts")) {
      const text = fs.readFileSync(p, "utf8");
      if (/\b(?:test|it)\s*\(\s*(""|''|``)/.test(text)) bad(p, "存在空的 test()/it() 标题");
    }
  }
};
walkFiles(TEST_DIR);

if (violations.length > 0) {
  console.error(`[check-test-names] 发现 ${violations.length} 处命名违规：`);
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}
console.log("[check-test-names] 命名检查通过");
