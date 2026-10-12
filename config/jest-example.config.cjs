const path = require("path");

module.exports = {
  clearMocks: true,
  setupFiles: ["<rootDir>/script/setup/jest.setup.ts"],
  globals: { ENV_FILE: path.resolve(__dirname, "../.env") },
  testSequencer: "<rootDir>/script/jest.sequencer.js",
  maxWorkers: "1",
  rootDir: "../",
  roots: ["<rootDir>"],
  // 顶层路径别名：@/xxx -> <rootDir>/xxx（与 tsconfig paths 对应）
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  testPathIgnorePatterns: ["/node_modules/"],
  // uuid v14+ is ESM-only ("type": "module"); un-ignore it so babel-jest converts it to CJS.
  transformIgnorePatterns: ["/node_modules/(?!uuid)/", "\\.pnp\\.[^\\/]+$"],
  testTimeout: 1000 * 60 * 50,
  verbose: true,
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "Test Report",
        outputPath: `test-report/test-report-${new Date().toISOString().replace(/[:]/g, '-').slice(0, 19).replace('T', '_')}.html`,
        includeFailureMsg: true,
      },
    ],
  ],
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "html"],

  testRegex: [
    "docs/test_script_tutorials/example-0001.test.ts",
    "docs/test_script_tutorials/example-0002.test.ts",
  ],
};
