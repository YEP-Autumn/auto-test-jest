# utils 分层约定

```text
utils/index.ts                 测试用例唯一入口
        │
        ▼
     runtime                   配置、动作、会话、拓扑目录、TestHelper
        │
        ├──────────────► adapters        DUT、Renix、streamcontrol、TopoApi
        │                    │
        │                    ▼
        │                contracts      后端/传输契约
        │                    │
        │                    ▼
        └──────────────► domain         纯领域模型
                             │
                             ▼
                          shared         零依赖基础工具
```

依赖方向只能从左到右：

- `shared`：`sleep`、`Port` 占位符、日志前缀。
- `domain`：报文模型、`StreamPort`、拓扑类型；不读配置、不做 I/O。
- `contracts`：`TrafficBackend`、`ITransport` 等接口。
- `adapters`：Telnet/SSH、Renix HTTP、streamcontrol gRPC、codec、`TopoApi`。
- `runtime`：JSON 配置、测试动作、`TrafficSession`、拓扑 DSL/目录、`TestHelper`、组合根。
- `rpc`：proto/thrift 契约与生成代码，保持独立。

## 目录职责

| 目录              | 职责                                             | 允许依赖                          |
| ----------------- | ------------------------------------------------ | --------------------------------- |
| `utils/shared`    | `sleep` / `Port` / 日志前缀                      | 无                                |
| `utils/domain`    | `packet`、`traffic`、`topology` 的纯模型与规则   | `shared`                          |
| `utils/contracts` | 流量后端、DUT 传输契约                           | `domain`                          |
| `utils/adapters`  | 设备、流量后端、拓扑服务的具体实现               | `contracts`、`domain`             |
| `utils/runtime`   | 配置、动作、会话、拓扑目录、`TestHelper`、组合根 | `adapters`、`contracts`、`domain` |
| `utils/rpc`       | gRPC / Thrift 契约与生成代码                     | 无                                |

## 规则

1. 测试用例只 import `@/utils`，不感知 provider / address / codec，也不关心工具模块如何拆分。
2. `domain`、`contracts`、`shared` 不 import `adapters` / `runtime`。
3. `adapters` 只负责“怎么连、怎么发、怎么抓”，不负责逻辑端口解析和测试编排。
4. `runtime` 是唯一读取 `config/env/*.json` 的层。
5. 子目录不再维护无引用 `index.ts`；公共入口只有 `utils/index.ts`。
6. 环境配置在 `config/env/default.json` + `config/env/local.json`，由
   `utils/runtime/config/loader.ts` 读取；不再使用环境变量。
7. 旧入口（`utils/stream/**`、`utils/test-helper.ts`、`utils/controller/**`、`RenixPort`）已删除。

## 当前遗留

配置注入还没有完全收敛：`adapters/device/dut.ts`、`adapters/traffic/**`、
`adapters/topology/api.ts` 仍直接读取 `runtime/config` 的默认值。
后续应改为由 `runtime/create-session.ts` / `runtime/test-helper.ts` 构造时注入，
让 `adapters` 完全不依赖 `runtime`。

另外两个大文件暂时保留单文件，后续可再拆：

- `runtime/actions/index.ts`：配置、校验、抓包、发包动作仍在一个文件；
- `runtime/topologies/catalog.ts`：拓扑 DSL 与 26 个内置拓扑仍在一个文件，
  拆分时需要注意 `LinkConstraint.xxx` 的 F12 跳转体验。
