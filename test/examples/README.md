# test/examples

可独立运行的测试脚本教程示例。每个文件对应一个完整、可直接执行的示例，不参与 `test/feature` 功能回归。

## 目录结构

```text
test/examples/
├── example-0001.test.ts   # 报文构造与发送
├── example-0002.test.ts   # 抓包与字段校验
└── example-0003.test.ts   # 经 DUTA 二层转发，1ms/5000 包
```

## 用例索引

| 文件                   | 说明                                                                                               | 运行条件      |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ------------- |
| `example-0001.test.ts` | 构造 TCP、ARP、UDP、IPv6 报文并从 `StreamPort.A` 发送                                              | 设备 + 测试仪 |
| `example-0002.test.ts` | 构造期望报文，在 `StreamPort.A` 抓包并按字段校验                                                   | 设备 + 测试仪 |
| `example-0003.test.ts` | `StreamPort.A -> DUTA -> StreamPort.B` 二层转发，`burst_size=1`、`gap=1ms`、5000 包，对端抓包 5000 | 设备 + 测试仪 |

## 运行方式

```bash
# 运行全部教程示例
npm run example

# 运行单个示例
npx jest -i --config=config/jest.default-example.config.cjs \
  test/examples/example-0001.test.ts

# 测试仪经 DUTA 二层转发 1ms burst
npx jest -i --config=config/jest.default-example.config.cjs \
  test/examples/example-0003.test.ts
```

## 命名约定

- 文件名统一为 `example-NNNN[-subject].test.ts`。
- 序号从 `0001` 开始，按新增顺序递增。
- 每个示例只保留一个清晰的测试目标，可直接运行，不依赖其他示例。
- 示例中使用的拓扑、端口和环境要求写在文件顶部注释和本索引中。
- 流量发送示例使用 `LinkConstraint.one_device_topo_links_type_1`，A/B 之间通过 DUTA 二层转发。
