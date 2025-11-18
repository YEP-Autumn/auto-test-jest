import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  collectCoverage: false,
  testSequencer: "<rootDir>/script/jest.sequencer.js",
  coverageDirectory: "coverage",
  maxWorkers: "1",
  rootDir: "../",
  roots: ["<rootDir>"],
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^\\/]+$"],
  testTimeout: 1000 * 60 * 5,

  testRegex: [
    // "test/10-BGP_EVPN_VXLAN/0010-BGP_EVPN_VXLAN.test.ts",
    // "test/10-BGP_EVPN_VXLAN/0020-BGP_EVPN_VXLAN.test.ts",
    // "test/10-BGP_EVPN_VXLAN/0030-BGP_EVPN_VXLAN.test.ts",
    // "test/10-BGP_EVPN_VXLAN/0040-BGP_EVPN_VXLAN.test.ts",
    // "test/10-BGP_EVPN_VXLAN/0050-BGP_EVPN_VXLAN.test.ts",
    // "test/30-MPLS/0010-MPLS.test.ts",
    // "test/30-MPLS/0020-MPLS.test.ts",
    // "test/30-MPLS/0030-MPLS.test.ts",
    // "test/30-MPLS/0040-MPLS.test.ts",
    // "test/30-MPLS/0050-MPLS.test.ts",
    // "test/30-MPLS/0060-MPLS.test.ts",
    // "test/41-VLAN-DOT1Q-TUNNEL/0010-VLAN-TUNNEL.test.ts",
    // "test/41-VLAN-DOT1Q-TUNNEL/0020-VLAN-TUNNEL.test.ts",
    // "test/41-VLAN-DOT1Q-TUNNEL/0030-VLAN-TUNNEL.test.ts",
    // "test/41-VLAN-DOT1Q-TUNNEL/0040-VLAN-TUNNEL.test.ts",
    // "test/41-VLAN-DOT1Q-TUNNEL/0050-VLAN-TUNNEL.test.ts",
    // "test/41-VLAN-DOT1Q-TUNNEL/0060-VLAN-TUNNEL.test.ts",
    // "test/41-VLAN-DOT1Q-TUNNEL/0070-VLAN-TUNNEL.test.ts",
    // "test/41-VLAN-DOT1Q-TUNNEL/0080-VLAN-TUNNEL.test.ts",
    // "test/41-VLAN-DOT1Q-TUNNEL/0090-VLAN-TUNNEL.test.ts",
    "test/41-VLAN-DOT1Q-TUNNEL/0100-VLAN-TUNNEL.test.ts",
  ],
};

export default config;
