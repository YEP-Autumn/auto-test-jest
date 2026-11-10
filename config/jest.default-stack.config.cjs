// 设备 profile：default（堆叠设备的 profile 待确认）｜套件：stack（test/misc/stack）
const { createJestConfig } = require("./jest.base.cjs");

module.exports = createJestConfig({ profile: "default", suite: "stack" });
