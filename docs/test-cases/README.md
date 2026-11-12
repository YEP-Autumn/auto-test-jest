# 测试用例描述（docs/test-cases）

存放文本化测试用例，模块目录与 `test/` 下的用例目录对应。

## 目录结构

- 特性模块目录与 `test/feature/<模块>/` 对应，位于 `docs/test-cases/feature/<模块>/`。
- misc 目录与 `test/misc/` 对应，位于 `docs/test-cases/misc/`，包含 `bugfix` 与 `stack`。
- 特性模块总索引见 [`feature/README.md`](feature/README.md)；misc 总索引见 [`misc/README.md`](misc/README.md)。
- 每个模块目录的 `README.md` 列出子目录索引、直属脚本和用例文档状态。
- 模板与写作要求见 [`docs/spec/test-case-template.md`](../spec/test-case-template.md)。
- 命名规则见 [`docs/spec/naming-convention.md`](../spec/naming-convention.md)。

## 模块索引

| 模块 | 目录索引 | 脚本数量 | 用例文档数量 |
| --- | --- | --- | --- |
| 02-BASIC 基础配置 | [`feature/02-BASIC/README.md`](feature/02-BASIC/README.md) | 0 | 0 |
| 03-ETHERNET 以太网 | [`feature/03-ETHERNET/README.md`](feature/03-ETHERNET/README.md) | 64 | 64 |
| 04-IP_SERVICE IP业务 | [`feature/04-IP_SERVICE/README.md`](feature/04-IP_SERVICE/README.md) | 0 | 0 |
| 05-IP_ROUTE IP路由 | [`feature/05-IP_ROUTE/README.md`](feature/05-IP_ROUTE/README.md) | 55 | 55 |
| 06-MULTICAST 组播 | [`feature/06-MULTICAST/README.md`](feature/06-MULTICAST/README.md) | 0 | 0 |
| 07-SECURITY 安全性 | [`feature/07-SECURITY/README.md`](feature/07-SECURITY/README.md) | 12 | 12 |
| 08-DEVICE_MANAGEMENT 设备管理 | [`feature/08-DEVICE_MANAGEMENT/README.md`](feature/08-DEVICE_MANAGEMENT/README.md) | 0 | 0 |
| 09-NETWORK_MANAGEMENT 网络管理 | [`feature/09-NETWORK_MANAGEMENT/README.md`](feature/09-NETWORK_MANAGEMENT/README.md) | 0 | 0 |
| 10-TRAFFIC_MANAGEMENT 流量管理 | [`feature/10-TRAFFIC_MANAGEMENT/README.md`](feature/10-TRAFFIC_MANAGEMENT/README.md) | 23 | 23 |
| 11-IPV6_SERVICE IPv6业务 | [`feature/11-IPV6_SERVICE/README.md`](feature/11-IPV6_SERVICE/README.md) | 0 | 0 |
| 12-IPV6_SECURITY IPv6安全 | [`feature/12-IPV6_SECURITY/README.md`](feature/12-IPV6_SECURITY/README.md) | 0 | 0 |
| 13-IPV6_ROUTE IPv6路由 | [`feature/13-IPV6_ROUTE/README.md`](feature/13-IPV6_ROUTE/README.md) | 0 | 0 |
| 14-IPV6_MULTICAST IPv6组播 | [`feature/14-IPV6_MULTICAST/README.md`](feature/14-IPV6_MULTICAST/README.md) | 0 | 0 |
| 15-VPN VPN | [`feature/15-VPN/README.md`](feature/15-VPN/README.md) | 0 | 0 |
| 16-RELIABILITY 可靠性 | [`feature/16-RELIABILITY/README.md`](feature/16-RELIABILITY/README.md) | 0 | 0 |
| 17-NETWORK_VIRTUALIZATION 网络虚拟化 | [`feature/17-NETWORK_VIRTUALIZATION/README.md`](feature/17-NETWORK_VIRTUALIZATION/README.md) | 5 | 5 |
| 18-INTELLIGENT_LOSSLESS 智能无损网络 | [`feature/18-INTELLIGENT_LOSSLESS/README.md`](feature/18-INTELLIGENT_LOSSLESS/README.md) | 0 | 0 |
| 19-MPLS MPLS | [`feature/19-MPLS/README.md`](feature/19-MPLS/README.md) | 63 | 63 |
| 20-STACKING 堆叠 | [`feature/20-STACKING/README.md`](feature/20-STACKING/README.md) | 0 | 0 |
| misc | [`misc/README.md`](misc/README.md) | 60 | 34 |

## 约定

一个测试文档对应一个测试脚本；文档中的子用例与脚本中的 `test()` 一一对应。

用例描述独立于测试框架与脚本实现：使用设备 CLI 命令、拓扑参数和可观测现象描述；
框架、工具、函数、代码、匹配模式等实现细节写入脚本。任何人依据文档即可手工复现，
也可使用任意自动化框架实现。脚本路径仅作为元数据用于追溯。

## 用途

1. **设计先行**：先编写用例描述，评审通过后编写脚本。
2. **回归基线**：脚本改动时同步更新描述，两者不一致即为需要处理的差异。
