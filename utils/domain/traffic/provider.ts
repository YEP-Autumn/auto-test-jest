/**
 * 流量后端的领域词汇。
 *
 * provider 与 endpoint 是端口配置、能力表和适配器契约共同使用的类型，
 * 因此放在 domain 层，而不是某一个适配器目录里。
 */

/** 支持的流量后端；顺序即配置校验时的提示顺序 */
export const PROVIDER_IDS = ["renix", "scapy", "stream-linux"] as const;

/** 后端标识；与配置中的 provider 一一对应 */
export type ProviderId = (typeof PROVIDER_IDS)[number];

/** 后端内部的最小端口参数 */
export interface BackendEndpoint {
  provider: ProviderId;
  address: string;
}
