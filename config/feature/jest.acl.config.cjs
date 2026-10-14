const path = require("path");

// ACL / QoS 命令用例套件（test/feature/70-ACL_QOS）
module.exports = {
  clearMocks: true,
  setupFiles: ["<rootDir>/script/setup/jest.setup.ts"],
  globals: { ENV_FILE: path.resolve(__dirname, "../../.env") },
  rootDir: "../../",
  roots: ["<rootDir>"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: ["/node_modules/(?!uuid)/", "\\.pnp\\.[^\\/]+$"],
  testTimeout: 1000 * 60 * 50,
  verbose: true,
  maxWorkers: "1",
  // 展开为显式用例文件列表（testRegex 逐项视为正则，故 "." 需转义为 "\\."）
  // 子特性目录均带 _cli 类型后缀：本套件为仅 CLI（下发配置 + 校验回显）
  testRegex: [
    "test/feature/70-ACL_QOS/01-access_list_ipv4_cli/0010-ACL_QOS\\.test\\.ts$",
    "test/feature/70-ACL_QOS/02-access_list_mac_cli/0010-ACL_QOS\\.test\\.ts$",
    "test/feature/70-ACL_QOS/03-access_list_mpls_cli/0010-ACL_QOS\\.test\\.ts$",
    "test/feature/70-ACL_QOS/04-access_list_arp_cli/0010-ACL_QOS\\.test\\.ts$",
    "test/feature/70-ACL_QOS/05-access_list_control_plane_cli/0010-ACL_QOS\\.test\\.ts$",
    "test/feature/70-ACL_QOS/06-access_list_user_define_cli/0010-ACL_QOS\\.test\\.ts$",
    "test/feature/70-ACL_QOS/07-time_range_cli/0010-ACL_QOS\\.test\\.ts$",
    "test/feature/70-ACL_QOS/08-class_map_cli/0010-ACL_QOS\\.test\\.ts$",
    "test/feature/70-ACL_QOS/09-policy_map_cli/0010-ACL_QOS\\.test\\.ts$",
    "test/feature/70-ACL_QOS/10-application_cli/0010-ACL_QOS\\.test\\.ts$",
    "test/feature/70-ACL_QOS/11-combination_cli/0010-ACL_QOS\\.test\\.ts$",
    "test/feature/70-ACL_QOS/12-log_resource_leak_cli/0010-ACL_QOS\\.test\\.ts$",
  ],
};
