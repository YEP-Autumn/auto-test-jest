#!/usr/bin/env node
/**
 * 生成 / 校验 docs/test-cases/feature 下的 README 索引。
 *
 * 用法：
 *   node script/gen-doc-index.js                  # 只列出需要更新的 README（dry-run）
 *   node script/gen-doc-index.js --write          # 写回 README
 *   node script/gen-doc-index.js --check          # CI 校验，存在差异时退出码 1
 *   node script/gen-doc-index.js --root docs/test-cases/feature/05-IP_ROUTE --write
 *
 * 只更新 README 中以下内容：
 *   - 脚本数量 / 用例文档数量
 *   - ## 子目录索引 表格
 *   - ## 脚本 表格
 *
 * 其余段落（案例说明、文档索引等）原样保留。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DOCS_ROOT = path.join(ROOT, "docs", "test-cases", "feature");
const TEST_ROOT = path.join(ROOT, "test", "feature");

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const CHECK = args.includes("--check");
const rootIdx = args.indexOf("--root");
const ROOT_ARG = rootIdx >= 0 ? args[rootIdx + 1] : null;
const KNOWN = new Set(["--write", "--check", "--root", "--help", "-h"]);
const unknown = args.filter(
  (arg, i) => arg.startsWith("-") && !KNOWN.has(arg) && args[i - 1] !== "--root",
);
if (unknown.length > 0) {
  console.error(`未知参数：${unknown.join(" ")}`);
  process.exit(2);
}
if (args.includes("--help") || args.includes("-h")) {
  console.log(
    "用法：node script/gen-doc-index.js [--write|--check] [--root docs/test-cases/feature/05-IP_ROUTE]",
  );
  process.exit(0);
}
if (WRITE && CHECK) {
  console.error("--write 与 --check 不能同时使用");
  process.exit(2);
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function relToRoot(abs) {
  return toPosix(path.relative(ROOT, abs));
}

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

function listFiles(dir, suffix) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(suffix))
    .map((e) => e.name)
    .sort();
}

function scriptStem(name) {
  return name.replace(/\.test\.ts$/, "");
}

/** 统计一个 test 目录及其子目录的脚本、匹配的用例文档 */
function collect(testDir, docsDir) {
  const directScripts = listFiles(testDir, ".test.ts");
  const directDocs = new Set(listFiles(docsDir, ".md"));
  const directDocCount = directScripts.filter((s) =>
    directDocs.has(`${scriptStem(s)}.md`),
  ).length;

  let scripts = directScripts.length;
  let docs = directDocCount;

  for (const child of listDirs(docsDir)) {
    if (!fs.existsSync(path.join(docsDir, child, "README.md"))) continue;
    const sub = collect(path.join(testDir, child), path.join(docsDir, child));
    scripts += sub.scripts;
    docs += sub.docs;
  }

  return { directScripts, directDocs, directDocCount, scripts, docs };
}

function parseScriptStatuses(text) {
  const start = text.indexOf("## 脚本");
  if (start < 0) return new Map();
  const next = text.indexOf("\n## ", start + 1);
  const section = text.slice(start, next < 0 ? text.length : next);
  const map = new Map();
  for (const line of section.split("\n")) {
    const m = line.match(
      /^\|\s*`([^`]+\.test\.ts)`\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$/,
    );
    if (m) map.set(m[1], m[3]);
  }
  return map;
}

function subdirSection(testDir, docsDir) {
  const children = listDirs(docsDir).filter((child) =>
    fs.existsSync(path.join(docsDir, child, "README.md")),
  );
  if (children.length === 0) return "当前目录无子目录。";

  const lines = [
    "| 子目录 | 目录索引 | 脚本数量 | 用例文档数量 |",
    "| --- | --- | --- | --- |",
  ];
  for (const child of children) {
    const sub = collect(path.join(testDir, child), path.join(docsDir, child));
    lines.push(
      `| \`${child}/\` | [\`${child}/README.md\`](${child}/README.md) | ${sub.scripts} | ${sub.docs} |`,
    );
  }
  return lines.join("\n");
}

function scriptSection(testDir, docsDir, text) {
  const scripts = listFiles(testDir, ".test.ts");
  if (scripts.length === 0) return "当前目录无直属脚本。";

  const statuses = parseScriptStatuses(text);
  const docs = new Set(listFiles(docsDir, ".md"));
  const lines = ["| 脚本 | 用例文档 | 状态 |", "| --- | --- | --- |"];
  for (const script of scripts) {
    const docName = `${scriptStem(script)}.md`;
    const hasDoc = docs.has(docName);
    const previous = statuses.get(script);
    let status;
    if (!hasDoc) status = "缺少文档";
    else if (previous && previous !== "缺少文档") status = previous;
    else status = "已有文档";
    const docCell = hasDoc ? `[${docName}](${docName})` : "—";
    lines.push(`| \`${script}\` | ${docCell} | ${status} |`);
  }
  return lines.join("\n");
}

function canonicalSection(body) {
  return body
    .split("\n")
    .map((line) => {
      if (line.trim().startsWith("|")) {
        const cells = line.split("|").map((cell) => cell.trim());
        const inner = cells.slice(1, -1);
        if (inner.length > 0 && inner.every((cell) => /^:?-{3,}:?$/.test(cell))) {
          return "|" + inner.map(() => "---").join("|") + "|";
        }
        return cells.join("|");
      }
      return line.trim();
    })
    .join("\n")
    .trim();
}

function replaceSection(text, title, body) {
  const marker = `## ${title}`;
  const start = text.indexOf(marker);
  if (start < 0) return text;
  const next = text.indexOf("\n## ", start + 1);
  const sectionEnd = next < 0 ? text.length : next;
  const currentBody = text
    .slice(start + marker.length, sectionEnd)
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");
  if (canonicalSection(currentBody) === canonicalSection(body)) return text;

  const before = text.slice(0, start);
  const section = `${marker}\n\n${body}\n`;
  if (next < 0) return before + section;
  const after = text.slice(next + 1).replace(/^\n+/, "");
  return `${before}${section}\n${after}`;
}

function render(text, testDir, docsDir) {
  const stats = collect(testDir, docsDir);
  let out = text.replace(/^- 脚本数量：\d+$/m, `- 脚本数量：${stats.scripts}`);
  out = out.replace(
    /^- 用例文档数量：\d+$/m,
    `- 用例文档数量：${stats.docs}`,
  );
  out = replaceSection(out, "子目录索引", subdirSection(testDir, docsDir));
  out = replaceSection(out, "脚本", scriptSection(testDir, docsDir, text));
  return out;
}

function walkReadmes(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkReadmes(full, out);
    else if (entry.isFile() && entry.name === "README.md") out.push(full);
  }
}

const docsRoot = ROOT_ARG
  ? path.resolve(ROOT, ROOT_ARG)
  : DOCS_ROOT;
const allowed = path.resolve(DOCS_ROOT);
if (docsRoot !== allowed && !docsRoot.startsWith(`${allowed}${path.sep}`)) {
  console.error(`--root 必须位于 ${relToRoot(DOCS_ROOT)} 下`);
  process.exit(2);
}

const readmes = [];
walkReadmes(docsRoot, readmes);
readmes.sort();

const changed = [];
const skipped = [];
for (const readme of readmes) {
  const text = fs.readFileSync(readme, "utf8");
  if (!text.includes("## 子目录索引") || !text.includes("## 脚本")) {
    skipped.push(readme);
    continue;
  }
  const rel = toPosix(path.relative(DOCS_ROOT, path.dirname(readme)));
  const testDir = path.join(TEST_ROOT, rel);
  const next = render(text, testDir, path.dirname(readme));
  if (next !== text) changed.push({ readme, next });
}

if (CHECK) {
  if (changed.length > 0) {
    console.error("[gen-doc-index] 以下 README 需要更新：");
    for (const item of changed) console.error(`  - ${relToRoot(item.readme)}`);
    process.exit(1);
  }
  console.log("[gen-doc-index] 索引检查通过。");
  process.exit(0);
}

if (WRITE) {
  for (const item of changed) {
    fs.writeFileSync(item.readme, item.next);
    console.log(`[gen-doc-index] 更新 ${relToRoot(item.readme)}`);
  }
  console.log(`[gen-doc-index] 完成，更新 ${changed.length} 个 README。`);
  process.exit(0);
}

if (changed.length === 0) {
  console.log("[gen-doc-index] 无需更新。");
} else {
  console.log("[gen-doc-index] 以下 README 需要更新（使用 --write 写回）：");
  for (const item of changed) console.log(`  - ${relToRoot(item.readme)}`);
}
if (skipped.length > 0) {
  console.log(`[gen-doc-index] 跳过 ${skipped.length} 个非标准 README。`);
}
