// 设备 profile：default（基线）｜套件：regression（test/feature 全量，MPLS 由 profile 排除）
const { createJestConfig } = require("./jest.base.cjs");

module.exports = createJestConfig({ profile: "default", suite: "regression" });
