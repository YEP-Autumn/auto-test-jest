/**
 * 流量端口配置（组合根输入）。
 *
 * 数组顺序就是逻辑端口：
 *   [0] -> StreamPort.A
 *   [1] -> StreamPort.B
 *   ...
 *
 * 调整测试实际使用的端口时，只调整数组顺序；测试代码不需要改。
 * 每个条目只配置一个 provider + address，换后端时直接改这两个字段。
 */

import type { StreamPortConfig } from "../traffic/model";

export const streamPorts: StreamPortConfig[] = [
  {
    // A
    provider: "renix",
    address: "//172.16.254.11/3/13",
    topology: { device: "172.16.9.110", if_index: 305 },
  },
  {
    // B
    provider: "renix",
    address: "//172.16.254.11/3/14",
    topology: { device: "172.16.9.110", if_index: 561 },
  },
  {
    // C
    provider: "renix",
    address: "//172.16.254.11/3/15",
    topology: { device: "172.16.9.110", if_index: 817 },
  },
  {
    // D
    provider: "renix",
    address: "//172.16.254.11/3/16",
    topology: { device: "172.16.9.110", if_index: 1073 },
  },
  {
    // E
    provider: "scapy",
    address: "\\Device\\NPF_{D0DB71B0-1C1E-419C-8360-20C25AF8A6E1}",
    topology: { device: "172.16.9.110", if_index: 23 },
  },
  {
    // F
    provider: "scapy",
    address: "\\Device\\NPF_{02DCC5B0-C8A6-4440-9362-21B78C286280}",
    topology: { device: "172.16.9.110", if_index: 24 },
  },
  {
    // G
    provider: "scapy",
    address: "\\Device\\NPF_{CD6CB24F-5008-4F71-8D48-2E92DB1DAA88}",
    topology: { device: "172.16.9.106", if_index: 32 },
  },
  {
    // H
    provider: "renix",
    address: "//172.16.254.11/5/1",
    topology: { device: "172.16.9.106", if_index: 25 },
  },
  {
    // I
    provider: "renix",
    address: "//172.16.254.11/5/2",
    topology: { device: "172.16.9.106", if_index: 25 },
  },
  {
    // J
    provider: "renix",
    address: "//172.16.254.11/3/15",
    topology: { device: "172.16.9.106", if_index: 25 },
  },
];
