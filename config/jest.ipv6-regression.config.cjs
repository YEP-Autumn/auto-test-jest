// 设备 profile：ipv6｜套件：regression
// IPv6 特性在 default / ipv6 下均生效，用例范围相同、规格不同（capacity 见 config/profiles/ipv6.json）
const { createJestConfig } = require("./jest.base.cjs");

module.exports = createJestConfig({ profile: "ipv6", suite: "regression" });
