#!/usr/bin/env node
/**
 * 校验 commit message 是否符合《提交信息规范》
 * （见 docs/spec/commit-convention.md）。
 *
 * 用法：
 *   node script/check-commit-msg.js                      # 校验最近一条提交
 *   node script/check-commit-msg.js .git/COMMIT_EDITMSG  # 校验文件（git hook 传入）
 *   node script/check-commit-msg.js --message "fix(x): ..."
 *   node script/check-commit-msg.js --range origin/main..HEAD   # 校验区间内全部提交
 *
 * 违规时打印明细并以退出码 1 结束，可直接接入 git hook / CI。
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

// 允许的 type，与 docs/spec/commit-convention.md §2 保持一致
const TYPES = [
  "feat",
  "fix",
  "refactor",
  "docs",
  "chore",
  "test",
  "style",
  "perf",
  "revert",
];
// 允许的 scope，与 §3 保持一致；新增 scope 需同步登记
const SCOPES = [
  "test",
  "test-helper",
  "config",
  "script",
  "topo",
  "stream",
  "utils",
  "docs",
  "deps",
  "ci",
];

// <type>(<scope>)?(!)?: <subject>
const RE_HEADER =
  /^(?<type>[a-z]+)(?:\((?<scope>[A-Za-z0-9][A-Za-z0-9-]*)\))?(?<breaking>!)?: (?<subject>.+)$/;
// 无信息量/被禁止的标题
const BANNED_SUBJECT =
  /^(update|update some file|update files?|wip|tmp|temp|test|fix|修改|调整|优化|改动|变更|提交|更新|随便|\.+)$/i;
// 允许跳过的自动生成消息
const SKIP = /^(Merge |Revert |fixup!|squash!|amend!|Initial commit)/;

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

/** 去掉注释行与行尾空白，保留正文结构 */
function clean(raw) {
  return raw
    .split("\n")
    .filter((l) => !/^\s*#/.test(l))
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");
}

const cjkCount = (s) => (s.match(/[\u4e00-\u9fa5]/g) || []).length;

/** 校验单条消息，返回 { errors, warns } */
function validate(message) {
  const errors = [];
  const warns = [];
  const text = clean(message);
  if (!text) return { errors: ["提交信息为空"], warns };

  const lines = text.split("\n");
  const header = lines[0];

  if (SKIP.test(header)) return { errors, warns }; // Merge / Revert / fixup 等放行

  const m = header.match(RE_HEADER);
  if (!m) {
    errors.push(
      `标题格式应为 <type>(<scope>): <中文标题>，当前为：${JSON.stringify(header)}`,
    );
    return { errors, warns };
  }

  const { type, scope, breaking, subject } = m.groups;

  if (!TYPES.includes(type))
    errors.push(`未知 type "${type}"，可选：${TYPES.join(" / ")}`);
  if (scope && !SCOPES.includes(scope))
    errors.push(
      `未知 scope "${scope}"，可选：${SCOPES.join(" / ")}（新增请登记到 docs/spec/commit-convention.md §3）`,
    );
  if (type === "chore" && !scope) warns.push("chore 缺少 scope，请尽量写明影响范围");

  if (BANNED_SUBJECT.test(subject.trim()))
    errors.push(`标题过于笼统/无信息量：${JSON.stringify(subject)}`);
  if (/[。．.，,；;：:]$/.test(subject)) errors.push("标题结尾不要加标点符号");
  if (subject.trim().length > 50)
    warns.push(`标题偏长（${subject.trim().length} 字，建议 ≤50）：${subject}`);
  if (cjkCount(subject) === 0)
    warns.push(`标题建议使用中文陈述句：${JSON.stringify(subject)}`);

  // 标题后若接正文，必须空一行
  if (lines.length > 1 && lines[1] !== "")
    errors.push("标题与正文之间需要空一行");

  const body = lines.slice(1).join("\n");
  if (breaking && !/BREAKING CHANGE:/.test(body))
    errors.push("标题带 ! 时，正文/footer 需包含 BREAKING CHANGE: 说明");
  if (!breaking && /BREAKING CHANGE:/.test(body))
    warns.push("正文含 BREAKING CHANGE:，建议标题 type 后加 !");

  return { errors, warns };
}

/** 收集待校验的 { label, message } 列表 */
function collectTargets() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(
      "用法: node script/check-commit-msg.js [--message <text> | --range <rev-range> | <file>]",
    );
    process.exit(0);
  }
  const mIdx = args.indexOf("--message");
  if (mIdx !== -1) return [{ label: null, message: args[mIdx + 1] || "" }];

  const rIdx = args.indexOf("--range");
  if (rIdx !== -1) {
    const range = args[rIdx + 1];
    if (!range) {
      console.error("[check-commit-msg] --range 需要提供 rev-range，如 origin/main..HEAD");
      process.exit(2);
    }
    const hashes = git(["rev-list", range]).split("\n").filter(Boolean);
    return hashes.map((h) => ({
      label: h.slice(0, 8),
      message: execFileSync("git", ["log", "-1", "--pretty=%B", h], {
        cwd: ROOT,
        encoding: "utf8",
      }),
    }));
  }

  const fileArg = args.find((a) => !a.startsWith("-"));
  if (fileArg) {
    return [
      {
        label: fileArg,
        message: fs.existsSync(fileArg) ? fs.readFileSync(fileArg, "utf8") : fileArg,
      },
    ];
  }

  return [{ label: "HEAD", message: git(["log", "-1", "--pretty=%B"]) }];
}

// ---- 主流程 ----
const targets = collectTargets();
const allErrors = [];
const allWarns = [];

for (const { label, message } of targets) {
  const { errors, warns } = validate(message);
  const prefix = label ? `[${label}] ` : "";
  for (const e of errors) allErrors.push(prefix + e);
  for (const w of warns) allWarns.push(prefix + w);
  if (errors.length === 0 && targets.length > 1)
    console.log(`[check-commit-msg] ${prefix}通过`);
}

if (allWarns.length > 0) {
  console.warn(`[check-commit-msg] ${allWarns.length} 条提醒：`);
  for (const w of allWarns) console.warn(`  - ${w}`);
}
if (allErrors.length > 0) {
  console.error(`[check-commit-msg] 发现 ${allErrors.length} 处违规：`);
  for (const e of allErrors) console.error(`  - ${e}`);
  console.error("\n规范见 docs/spec/commit-convention.md");
  process.exit(1);
}
console.log(
  `[check-commit-msg] 提交信息检查通过（${targets.length} 条）`,
);
