#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const CONFIG_DIR = path.join(process.cwd(), "config");

function listNames(dir) {
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

/**
 * 解析报告文件名，兼容两种格式：
 *   test-report-<profile>-<suite>[-failed]-<timestamp>.html   （当前）
 *   test-report-<timestamp>.html                              （历史）
 */
function parseReportName(fileName, profiles, suites) {
  const m = fileName.match(/^test-report-(.*)-(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.html$/);
  if (!m) return { timestamp: "", label: null, profile: null, suite: null };

  const timestamp = m[2];
  const label = m[1].replace(/-failed$/, "");
  for (const profile of profiles) {
    for (const suite of suites) {
      if (label === `${profile}-${suite}`) {
        return { timestamp, label, profile, suite };
      }
    }
  }
  return { timestamp, label: label || null, profile: null, suite: null };
}

function findLatestHtmlReport(reportDir) {
  if (!fs.existsSync(reportDir)) return null;

  const profiles = listNames(path.join(CONFIG_DIR, "profiles"));
  const suites = listNames(path.join(CONFIG_DIR, "suites"));

  const files = fs
    .readdirSync(reportDir)
    .filter((f) => f.startsWith("test-report-") && f.endsWith(".html"))
    .map((f) => ({
      name: f,
      path: path.join(reportDir, f),
      ...parseReportName(f, profiles, suites),
    }));

  if (files.length === 0) return null;

  // 按时间戳降序排序，取第一个
  return files.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1))[0];
}

function extractFailedTestPathsFromHtml(content) {
  const re =
    /<div class="suite-path">([^<]*test\/[^<]*\.test\.ts)<\/div>((?!(<div class="suite-path">))[\s\S])*?class="test-result failed"/g;
  const set = new Set();
  let m;
  while ((m = re.exec(content)) !== null) {
    // Normalize to repository-relative path if possible
    let p = m[1].trim();
    // If path is absolute inside workspace, convert to relative 'test/...'
    const idx = p.indexOf("/test/");
    if (idx !== -1) p = p.slice(idx + 1);
    set.add(p);
  }
  return Array.from(set);
}

/** 路径按正则解释：转义元字符并锚定结尾，避免误匹配同前缀文件。 */
function toTestRegex(p) {
  return `${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`;
}

// 只生成「跑哪些用例」，公共配置统一由 config/jest.base.cjs 提供，避免再次出现多份拷贝。
function buildConfigContent(testPaths, { profile, suite }) {
  const entries = testPaths.map((p) => `    ${JSON.stringify(toTestRegex(p))},`).join("\n");
  const scenario =
    profile && suite
      ? `  // 沿用报告所属的设备场景，保证 globals 与报告命名一致\n  profile: ${JSON.stringify(profile)},\n  suite: ${JSON.stringify(suite)},\n`
      : "";

  return `// 由 script/generate-jest-failed-config.js 生成，勿手工编辑（已 gitignore）。
// 内容来自 test-report/ 最新 HTML 报告中标记为失败的用例。

const { createJestConfig } = require("./jest.base.cjs");

module.exports = createJestConfig({
${scenario}  reportSuffix: "failed",
  testRegex: [
${entries}
  ],
});
`;
}

function main() {
  const cwd = process.cwd();
  const reportDir = path.join(cwd, "test-report");
  const outArg = process.argv[2];
  const outPath = outArg
    ? path.resolve(outArg)
    : path.join(cwd, "config", "jest.failed.config.cjs");

  const latestReport = findLatestHtmlReport(reportDir);

  if (!latestReport) {
    console.error("No valid HTML reports found in", reportDir);
    process.exitCode = 2;
    return;
  }

  console.log("Processing latest report:", latestReport.name);
  if (latestReport.profile && latestReport.suite) {
    console.log(`报告场景：${latestReport.profile} / ${latestReport.suite}`);
  }

  const allPaths = new Set();
  try {
    const content = fs.readFileSync(latestReport.path, "utf8");
    const found = extractFailedTestPathsFromHtml(content);
    found.forEach((p) => allPaths.add(p));
  } catch (err) {
    console.error("Failed to read report", latestReport.path, err && err.message);
  }

  const testPaths = Array.from(allPaths).sort();
  if (!testPaths.length) {
    console.error("No failed test paths found in reports.");
    process.exitCode = 1;
    return;
  }

  // 报告可能早于目录重构，过滤掉已不存在的路径，避免生成一份跑不起来的配置。
  const existing = [];
  for (const p of testPaths) {
    if (fs.existsSync(path.resolve(cwd, p))) existing.push(p);
    else console.warn(`[gen-failed] 跳过已不存在的用例：${p}`);
  }
  if (!existing.length) {
    console.error("报告中的失败用例在当前工作区均不存在，请先重新跑一次用例。");
    process.exitCode = 1;
    return;
  }

  const content = buildConfigContent(existing, latestReport);
  try {
    fs.writeFileSync(outPath, content, "utf8");
    console.log(`已生成 ${path.relative(cwd, outPath)}（${existing.length} 条用例）`);
  } catch (err) {
    console.error("Failed to write config file:", err && err.message);
    process.exitCode = 3;
  }
}

if (require.main === module) main();
