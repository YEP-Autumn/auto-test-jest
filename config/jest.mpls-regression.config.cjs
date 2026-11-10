// 设备 profile：mpls｜套件：regression
// MPLS 特性仅在 mpls profile 生效，因此只有本配置会执行 test/feature/19-MPLS
const { createJestConfig } = require("./jest.base.cjs");

module.exports = createJestConfig({ profile: "mpls", suite: "regression" });
