// 设备 profile：default｜套件：example（test/examples）
const { createJestConfig } = require("./jest.base.cjs");

module.exports = createJestConfig({ profile: "default", suite: "example" });
