/**
 * 所有 Jest 套件的公共配置。
 *
 * 交换机的特性与规格由「profile」决定（`show stm prefer`），同一批用例在不同 profile
 * 下的可用性/容量不同，因此配置 = profile（设备能力）× suite（跑哪些用例）：
 *
 *   config/profiles/<profile>.json   profile 事实：描述、可用范围、容量
 *   config/suites/<suite>.json       用例范围：include / exclude glob
 *   config/jest.<profile>-<suite>.config.cjs
 *
 * 配置本体只写两行：
 *
 *   const { createJestConfig } = require("./jest.base.cjs");
 *   module.exports = createJestConfig({ profile: "mpls", suite: "regression" });
 *
 * 运行时会把 profile / suite 注入到 `globals`，用例、日志与 HTML 报告都可据此区分场景。
 */
const fs = require("fs");
const path = require("path");

// 仓库根目录：本文件在 <repo>/config/ 下
const REPO_ROOT = path.resolve(__dirname, "..");
const PROFILES_DIR = path.join(__dirname, "profiles");
const SUITES_DIR = path.join(__dirname, "suites");

function readJson(dir, name) {
  const file = path.join(dir, `${name}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`找不到配置文件：${path.relative(REPO_ROOT, file)}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function dedupe(list) {
  return Array.from(new Set(list));
}

/**
 * 合并 suite 与 profile 的用例范围。
 * @param {{profile: string, suite: string}} options
 */
function resolveSpec({ profile, suite }) {
  const profileSpec = readJson(PROFILES_DIR, profile);
  const suiteSpec = readJson(SUITES_DIR, suite);

  if (profileSpec.profile !== profile) {
    throw new Error(`profiles/${profile}.json 的 profile 字段应为 "${profile}"`);
  }
  if (suiteSpec.suite !== suite) {
    throw new Error(`suites/${suite}.json 的 suite 字段应为 "${suite}"`);
  }

  return {
    profile: {
      name: profile,
      description: profileSpec.description || "",
      capacity: profileSpec.capacity || {},
    },
    suite: {
      name: suite,
      description: suiteSpec.description || "",
    },
    include: dedupe([...(suiteSpec.include || []), ...(profileSpec.include || [])]),
    exclude: dedupe([...(suiteSpec.exclude || []), ...(profileSpec.exclude || [])]),
  };
}

/** 把 glob 转成正则字符串；absolute=true 时用于匹配绝对路径（testPathIgnorePatterns）。 */
function globToRegExp(glob, { absolute = false } = {}) {
  let out = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      out += ".*";
      i++;
      if (glob[i + 1] === "/") i++;
    } else if (c === "*") {
      out += "[^/]*";
    } else if (c === "?") {
      out += "[^/]";
    } else {
      out += c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  }
  return `${absolute ? "^.*" : "^"}${out}$`;
}

function timestamp() {
  return new Date().toISOString().replace(/[:]/g, "-").slice(0, 19).replace("T", "_");
}

/**
 * @param {object} options
 * @param {string} [options.profile] profile 名（config/profiles/*.json）
 * @param {string} [options.suite] suite 名（config/suites/*.json）
 * @param {string[]} [options.testRegex] 精确用例路径。与 profile/suite 同时给出时表示
 *   「该场景下的子集」（如失败重跑），profile/suite 仍用于 globals 与报告命名
 * @param {string} [options.reportSuffix] 附加到报告名/标题的后缀（如 "failed"）
 * @param {string} [options.rootDir=".."] 相对 `config/` 的根目录
 * @param {string} [options.envFile] .env 路径，默认仓库根 `.env`
 * @param {object} [options.overrides] 需要覆盖的其它 Jest 配置项
 */
function createJestConfig({
  profile,
  suite,
  testRegex,
  reportSuffix = "",
  rootDir = "..",
  envFile = path.join(REPO_ROOT, ".env"),
  overrides = {},
} = {}) {
  const hasSpec = Boolean(profile || suite);
  if (hasSpec && !(profile && suite)) {
    throw new Error("createJestConfig: profile 与 suite 必须同时提供");
  }
  if (!hasSpec && !testRegex) {
    throw new Error("createJestConfig: 必须提供 profile+suite 或 testRegex");
  }

  const spec = hasSpec ? resolveSpec({ profile, suite }) : null;

  const globals = { ENV_FILE: envFile };
  if (spec) {
    globals.PROFILE = spec.profile.name;
    globals.SUITE = spec.suite.name;
    globals.PROFILE_INFO = spec.profile;
  }
  if (reportSuffix) globals.REPORT_SUFFIX = reportSuffix;

  const labelParts = spec ? [spec.profile.name, spec.suite.name] : ["ad-hoc"];
  if (reportSuffix) labelParts.push(reportSuffix);
  const label = labelParts.join(" / ");
  const reportPrefix = ["test-report", ...labelParts].join("-");

  const config = {
    clearMocks: true,
    setupFiles: ["<rootDir>/script/setup/jest.setup.ts"],
    globals,
    testSequencer: "<rootDir>/script/jest.sequencer.js",
    maxWorkers: "1",
    rootDir,
    roots: ["<rootDir>"],
    // 顶层路径别名：@/xxx -> <rootDir>/xxx（与 tsconfig paths 对应）
    moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
    testPathIgnorePatterns: [
      "/node_modules/",
      ...(spec ? spec.exclude.map((glob) => globToRegExp(glob, { absolute: true })) : []),
    ],
    // uuid v14+ is ESM-only ("type": "module"); un-ignore it so babel-jest converts it to CJS.
    transformIgnorePatterns: ["/node_modules/(?!uuid)/", "\\.pnp\\.[^\\/]+$"],
    testTimeout: 1000 * 60 * 50,
    verbose: true,
    reporters: [
      "default",
      [
        "jest-html-reporter",
        {
          pageTitle: `Test Report - ${label}`,
          outputPath: `test-report/${reportPrefix}-${timestamp()}.html`,
          includeFailureMsg: true,
        },
      ],
    ],
    collectCoverage: false,
    coverageDirectory: "coverage",
    coverageReporters: ["json", "lcov", "text", "html"],

    ...(testRegex ? { testRegex } : { testMatch: spec.include.map((p) => `<rootDir>/${p}`) }),

    ...overrides,
  };

  return config;
}

module.exports = { createJestConfig, resolveSpec, globToRegExp, PROFILES_DIR, SUITES_DIR };
