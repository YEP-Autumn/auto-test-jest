#!/usr/bin/env node
/**
 * 套件清单工具：查看 / 校验 profile × suite 实际会跑哪些用例。
 *
 * 用法：
 *   node script/jest-suite.js --table                  # profile × suite 用例数矩阵
 *   node script/jest-suite.js --list mpls regression   # 打印精确文件清单（仓库相对路径）
 *   node script/jest-suite.js --check                  # 校验 JSON、配置与覆盖情况（CI 可用）
 *
 * 说明：
 *   - 用例范围 = suites/<suite>.json 的 include/exclude + profiles/<profile>.json 的 include/exclude；
 *   - 只做只读检查，不修改任何文件。
 */
const fs = require("fs");
const path = require("path");
const { resolveSpec, globToRegExp, PROFILES_DIR, SUITES_DIR } = require("../config/jest.base.cjs");

const ROOT = path.resolve(__dirname, "..");
const CONFIG_DIR = path.join(ROOT, "config");

const args = process.argv.slice(2);
const KNOWN = ["--table", "--list", "--check", "--help", "-h"];
const unknown = args.filter((a) => a.startsWith("-") && !KNOWN.includes(a));
if (unknown.length > 0) {
  console.error(`未知参数：${unknown.join(" ")}`);
  process.exit(2);
}
if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  console.log("用法：node script/jest-suite.js [--table | --list <profile> <suite> | --check]");
  process.exit(args.length === 0 ? 2 : 0);
}

// ---------- glob 展开 ----------

function listDir(rel) {
  try {
    return fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true });
  } catch {
    return [];
  }
}

/** 递归收集目录（含自身），repo 相对路径 */
function walkDirs(base, out) {
  out.push(base);
  for (const entry of listDir(base)) {
    if (!entry.isDirectory()) continue;
    walkDirs(path.posix.join(base, entry.name), out);
  }
}

function segmentToRegExp(segment) {
  const body = segment
    .split("*")
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}$`);
}

/**
 * 展开单个 glob（支持 `*`、`**`），返回 repo 相对文件路径。
 * 与 config/jest.base.cjs 的 globToRegExp 规则保持一致。
 */
function expandGlob(pattern) {
  const p = pattern.replace(/^\.\//, "").replace(/\/+$/, "");
  if (!p.includes("*")) {
    const stat = fs.statSync(path.join(ROOT, p), { throwIfNoEntry: false });
    return stat && stat.isFile() ? [p] : [];
  }

  let current = [""];
  for (const segment of p.split("/")) {
    const next = [];
    for (const base of current) {
      if (segment === "**") {
        const dirs = [];
        walkDirs(base, dirs);
        next.push(...dirs);
      } else if (segment.includes("*")) {
        const re = segmentToRegExp(segment);
        for (const entry of listDir(base)) {
          if (entry.isFile() && re.test(entry.name)) {
            next.push(path.posix.join(base, entry.name));
          }
        }
      } else {
        const candidate = path.posix.join(base, segment);
        if (fs.existsSync(path.join(ROOT, candidate))) next.push(candidate);
      }
    }
    current = next;
  }

  return current.filter((file) => {
    const stat = fs.statSync(path.join(ROOT, file), { throwIfNoEntry: false });
    return Boolean(stat && stat.isFile());
  });
}

function expandSpec(spec) {
  const excludes = spec.exclude.map((glob) => new RegExp(globToRegExp(glob, { absolute: true })));
  const seen = new Set();
  for (const glob of spec.include) {
    for (const file of expandGlob(glob)) {
      if (excludes.some((re) => re.test(`/${file}`))) continue;
      seen.add(file);
    }
  }
  return Array.from(seen).sort();
}

// ---------- 枚举 ----------

function readDirJson(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ name: f.replace(/\.json$/, ""), data: JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) }));
}

function listProfiles() {
  return readDirJson(PROFILES_DIR).map((x) => x.name).sort();
}

function listSuites() {
  return readDirJson(SUITES_DIR).map((x) => x.name).sort();
}

/** 找出 config/jest.<profile>-<suite>.config.cjs 形式的配置 */
function listConfigs(profiles, suites) {
  const found = [];
  for (const profile of profiles) {
    for (const suite of suites) {
      const file = path.join(CONFIG_DIR, `jest.${profile}-${suite}.config.cjs`);
      if (fs.existsSync(file)) found.push({ profile, suite, file: path.relative(ROOT, file) });
    }
  }
  return found;
}

// ---------- 命令 ----------

function cmdTable() {
  const profiles = listProfiles();
  const suites = listSuites();
  const configs = listConfigs(profiles, suites);
  const header = ["profile", ...suites];
  const widths = header.map((h, i) => Math.max(h.length, ...profiles.map((p) => {
    if (i === 0) return p.length;
    const hit = configs.find((c) => c.profile === p && c.suite === header[i]);
    return hit ? String(expandSpec(resolveSpec({ profile: p, suite: header[i] })).length).length : 1;
  })));

  const pad = (value, width) => String(value).padEnd(width);
  console.log(header.map((h, i) => pad(h, widths[i])).join("  "));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const profile of profiles) {
    const cells = [pad(profile, widths[0])];
    suites.forEach((suite, i) => {
      const hit = configs.find((c) => c.profile === profile && c.suite === suite);
      const value = hit ? String(expandSpec(resolveSpec({ profile, suite })).length) : "-";
      cells.push(pad(value, widths[i + 1]));
    });
    console.log(cells.join("  "));
  }
  console.log(`\n"-" 表示没有对应的 config 文件。共 ${configs.length} 个配置。`);
}

function cmdList(profile, suite) {
  if (!profile || !suite) {
    console.error("用法：node script/jest-suite.js --list <profile> <suite>");
    process.exit(2);
  }
  const files = expandSpec(resolveSpec({ profile, suite }));
  for (const file of files) console.log(file);
  console.error(`\n${profile} / ${suite}：${files.length} 条用例`);
}

function cmdCheck() {
  const errors = [];
  const warnings = [];
  const profiles = listProfiles();
  const suites = listSuites();

  // 1) JSON 自检
  for (const { name, data } of readDirJson(PROFILES_DIR)) {
    if (data.profile !== name) errors.push(`config/profiles/${name}.json 的 profile 字段应为 "${name}"`);
    if (data.include && !Array.isArray(data.include)) errors.push(`config/profiles/${name}.json: include 必须是数组`);
    if (data.exclude && !Array.isArray(data.exclude)) errors.push(`config/profiles/${name}.json: exclude 必须是数组`);
  }
  for (const { name, data } of readDirJson(SUITES_DIR)) {
    if (data.suite !== name) errors.push(`config/suites/${name}.json 的 suite 字段应为 "${name}"`);
    if (!Array.isArray(data.include) || data.include.length === 0) {
      errors.push(`config/suites/${name}.json: include 不能为空`);
    }
  }

  // 2) 每个配置都能展开出用例
  const configs = listConfigs(profiles, suites);
  const covered = new Set();
  if (configs.length === 0) errors.push("config/ 下没有任何 jest.<profile>-<suite>.config.cjs");

  // 2.1) 配置文件名必须对应已知的 profile × suite，避免手写文件名拼错后被静默忽略
  const knownConfigNames = new Set(configs.map((c) => path.basename(c.file)));
  for (const name of fs.readdirSync(CONFIG_DIR)) {
    if (!/^jest\..+-.+\.config\.cjs$/.test(name)) continue;
    if (!knownConfigNames.has(name)) {
      errors.push(`config/${name}: 文件名不对应任何已知 profile × suite 组合`);
    }
  }

  for (const { profile, suite, file } of configs) {
    const files = expandSpec(resolveSpec({ profile, suite }));
    if (files.length === 0) errors.push(`${file}: 用例范围为空（检查 profiles/${profile}.json 与 suites/${suite}.json）`);
    files.forEach((f) => covered.add(f));
    console.log(`${file.padEnd(46)} ${String(files.length).padStart(4)} 条`);
  }

  // 3) 覆盖情况（只针对 test/feature）
  const allFeature = expandGlob("test/feature/**/*.test.ts").sort();
  const missing = allFeature.filter((f) => !covered.has(f));
  for (const file of missing) warnings.push(`未被任何配置覆盖：${file}`);

  if (warnings.length > 0) {
    console.warn(`\n[提示] ${warnings.length} 项：`);
    for (const w of warnings) console.warn(`  - ${w}`);
  }
  if (errors.length > 0) {
    console.error(`\n[错误] ${errors.length} 项：`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`\n共 ${configs.length} 个配置，覆盖 test/feature 用例 ${allFeature.length - missing.length}/${allFeature.length} 条。`);
}

if (args.includes("--table")) cmdTable();
else if (args.includes("--list")) cmdList(args[args.indexOf("--list") + 1], args[args.indexOf("--list") + 2]);
else cmdCheck();
