#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function getTimestamp(fileName) {
  const match = fileName.match(/test-report-(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.html/);
  return match ? match[1] : '';
}

function findLatestHtmlReport(reportDir) {
  if (!fs.existsSync(reportDir)) return null;

  const files = fs
    .readdirSync(reportDir)
    .filter((f) => f.startsWith("test-report-") && f.endsWith(".html"))
    .map((f) => ({
      name: f,
      path: path.join(reportDir, f),
      time: getTimestamp(f),
    }));

  if (files.length === 0) return null;

  // 按时间戳降序排序，取第一个
  return files.sort((a, b) => (b.time > a.time ? 1 : -1))[0].path;
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
    console.log(p);
    const idx = p.indexOf("/test/");
    if (idx !== -1) p = p.slice(idx + 1);
    set.add(p);
  }
  return Array.from(set);
}

function buildConfigContent(testPaths) {
  const entries = testPaths.map((p) => `    "${p}",`).join("\n");
  return `const path = require("path");

module.exports = {
  clearMocks: true,
  setupFiles: ["<rootDir>/script/setup/jest.setup.ts"],
  globals: { ENV_FILE: path.resolve(__dirname, "../.env") },
  testSequencer: "<rootDir>/script/jest.sequencer.js",
  maxWorkers: "1",
  rootDir: "../",
  roots: ["<rootDir>"],
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^\\/]+$"],
  testTimeout: 1000 * 60 * 50,
  verbose: true,
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "Test Report",
        outputPath: \`test-report/test-report-\${new Date().toISOString().replace(/[:]/g, '-').slice(0, 19).replace('T', '_')}.html\`,
        includeFailureMsg: true,
      },
    ],
  ],
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "html"],

  testRegex: [
${entries}
  ],
};
`;
}

function main() {
  const cwd = process.cwd();
  const reportDir = path.join(cwd, "test-report");
  const outArg = process.argv[2];
  const outPath = outArg
    ? path.resolve(outArg)
    : path.join(cwd, "config", "jest-failed.config.cjs");

  const latestReport = findLatestHtmlReport(reportDir);

  if (!latestReport) {
    console.error("No valid HTML reports found in", reportDir);
    process.exitCode = 2;
    return;
  }

  console.log("Processing latest report:", path.basename(latestReport));

  const allPaths = new Set();
  try {
    const content = fs.readFileSync(latestReport, "utf8");
    const found = extractFailedTestPathsFromHtml(content);
    found.forEach((p) => allPaths.add(p));
  } catch (err) {
    console.error("Failed to read report", latestReport, err && err.message);
  }

  const testPaths = Array.from(allPaths).sort();
  if (!testPaths.length) {
    console.error("No failed test paths found in reports.");
    process.exitCode = 1;
    return;
  }

  const content = buildConfigContent(testPaths);
  try {
    fs.writeFileSync(outPath, content, "utf8");
  } catch (err) {
    console.error("Failed to write config file:", err && err.message);
    process.exitCode = 3;
  }
}

if (require.main === module) main();
