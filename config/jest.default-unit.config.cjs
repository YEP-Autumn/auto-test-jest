// 无设备单元测试：codec / packet model；不连接 DUT 或流量网关
const { createJestConfig } = require("./jest.base.cjs");

module.exports = createJestConfig({ profile: "default", suite: "unit" });
