import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
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
        outputPath: `test-report/test-report-${Date.now()}.html`,
        includeFailureMsg: true,
      },
    ],
  ],
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "html"],

  testRegex: [
    "test/example/example-0001.test.ts",
    "test/example/example-0002.test.ts",
  ],
};

export default config;
