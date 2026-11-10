// 设备 profile：default｜套件：example（docs/test_script_tutorials）
const { createJestConfig } = require("./jest.base.cjs");

module.exports = createJestConfig({ profile: "default", suite: "example" });
