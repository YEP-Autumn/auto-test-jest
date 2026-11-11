# auto-test-jest

基于 [Jest](https://jestjs.io/) + TypeScript 的**交换机（DUT）自动化测试框架**。用例通过
Telnet / SSH 登录真实设备下发配置并校验回显，通过**流量收发后端（stream backend）**使用
Renix 测试仪或 Scapy 网卡收发/抓取报文，通过**拓扑后端（topo backend）**动态创建与销毁
设备间的连线拓扑，最终由 Jest 断言并生成 HTML 测试报告。

> 目标：把「组网 → 配置 DUT → 流量发送/抓包 → 校验结果 → 清理现场」这套人工流程，
> 固化成可重复执行、可 CI 门禁的测试脚本。

## 目录

- [特性](#特性)
- [目录结构](#目录结构)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [Jest 配置组织](#jest-配置组织)
- [配置](#配置)
- [编写测试用例](#编写测试用例)
- [测试报告](#测试报告)
- [npm 脚本](#npm-脚本)
- [代码生成（Thrift）](#代码生成thrift)
- [规范](#规范)
- [CI](#ci)
- [常见问题](#常见问题)

## 特性

- **TestHelper 测试 DSL**：以链式调用组装「配置 / 校验 / 等待 / 流量发送 / 抓包」等动作，
  一次性 `startTest()` 顺序执行并汇总结果。
- **多设备支持**：`DutIdx.A` ~ `DutIdx.H` 对应 `Config.dut_list`，`ExecConfigDutA/B/C/D` 等
  便捷方法覆盖常见场景。
- **Telnet / SSH 双传输**：`Dut` 依据 `protocol` 字段自动选择 `TelnetConnection` 或
  `SshConnection`，对上暴露统一的 `exec` / `safeExec` 接口。
- **声明式拓扑**：用 `dut("A", "D")`、`renix("A")`、`link(...)`、`topo(...)` 描述连线，
  `LinkConstraint` 提供可复用的内置拓扑。
- **报文构造与校验**：`PacketBuilder` 逐步拼装 Ethernet / VLAN / IPv4 / IPv6 / ARP /
  TCP / UDP / ICMP / LLC / SNMP / RAW，配合 `PacketSender`、`PacketChecker` 完成收发校验。
- **自动生成 Thrift 代码**：报文的线格式由 `utils/rpc/thrift/packet.thrift` 定义，
  `postinstall` / `pretest` 自动生成，生成物由脚本自动维护。
- **失败用例重试**：`npm run gen-failed` 从最新 HTML 报告提取失败用例，生成
  `config/jest.failed.config.cjs` 后重新执行。
- **规范与门禁**：用例命名、提交信息均有脚本自动校验，并接入 GitHub Actions。

## 目录结构

```
.
├── config/                     # Jest 配置：profile（设备能力）× suite（用例范围）
│   ├── jest.base.cjs           # 唯一公共配置：setup / 别名 / 超时 / 报告器 / 串行执行
│   ├── profiles/               # 设备 profile：default / extended-buffer / ipv6 / layer3 / mpls
│   ├── suites/                 # 套件范围：regression / stack / example
│   ├── jest.default-regression.config.cjs
│   ├── jest.ipv6-regression.config.cjs
│   ├── jest.mpls-regression.config.cjs
│   ├── jest.default-stack.config.cjs   # 堆叠场景，用例在 test/misc/stack/
│   ├── jest.default-example.config.cjs # 教程用例（docs/test_script_tutorials）
│   ├── jest.failed.config.cjs  # 由 gen-failed 生成（gitignore），仅执行上次失败的用例
│   └── test-module-map.json    # 模块树唯一事实来源
├── docs/
│   ├── local-setup.md          # 本地使用技巧（skip-worktree）
│   ├── spec/                   # 用例命名、提交信息、CI 规范
│   └── test_script_tutorials/  # 可直接运行的示例用例
├── script/
│   ├── gen-thrift.js           # 生成 utils/rpc/gen-nodejs
│   ├── check-test-names.js     # 用例命名规范校验
│   ├── scaffold-test-modules.js # 按 test-module-map.json 生成模块目录
│   ├── jest-suite.js           # profile × suite 清单：--table / --list / --check
│   ├── check-commit-msg.js     # 提交信息规范校验
│   ├── generate-jest-failed-config.js
│   ├── jest.sequencer.js       # 按模块树路径 + 文件序号排序执行
│   ├── install-git-hooks.js    # 安装 commit-msg / pre-commit hook
│   ├── git-hooks/commit-msg
│   ├── git-hooks/pre-commit
│   └── setup/jest.setup.ts     # 加载 .env 到 process.env
├── test/
│   ├── demo.test.ts            # 最小可运行示例
│   ├── feature/                # 特性用例：<NN-模块>/<NN-UG小节>[/<NN-子功能>[_类型]]/NNNN-<模块>[-<子功能>].test.ts
│   └── misc/bugfix/<缺陷号>/   # 缺陷回归用例
├── utils/
│   ├── test-helper.ts          # TestHelper / DutIdx / 报文 MAC 等
│   ├── index.ts                # sleep、Port 占位符、日志前缀
│   ├── comm/                   # 设备通信与配置
│   │   ├── config.ts           # Config：DUT 列表、后端地址、默认会话参数
│   │   ├── dut.ts              # Dut：登录 / exec，自动抛出 % 错误
│   │   ├── transport.ts        # Telnet / SSH 传输实现
│   │   └── components.ts       # Actuator：配置、校验、抓包、流量发送等动作
│   ├── stream/                 # 流量收发后端
│   │   ├── stream-backend-api.ts   # 端口预约/释放、发包、抓包 HTTP API
│   │   ├── thrift-packet.ts        # PacketBuilder / PacketListParser
│   │   └── thrift-protocol.factory.ts
│   ├── topo/                   # 拓扑
│   │   ├── topo-backend-api.ts # 拓扑 CRUD HTTP API
│   │   ├── link-constraint.ts  # 拓扑 DSL 与内置拓扑
│   │   ├── endpoints.ts        # dut()/renix() 端点解析
│   │   └── types.ts
│   └── rpc/                    # Thrift IDL 与生成物（gen-* 被忽略）
├── test-report/                # jest-html-reporter 产物
├── jest.config.cjs             # 根配置（默认仅匹配 test/demo.test.ts）
├── babel.config.js             # babel-jest 的 TS 转译配置
└── tsconfig.json               # 路径别名 @/* -> 仓库根
```

## 环境要求

| 依赖 | 版本 / 说明 |
|---|---|
| Node.js | 22.x（CI 使用 Node 22） |
| npm | 随 Node 安装 |
| Thrift 编译器 | 必需，`apt-get install -y thrift-compiler`（用于生成报文类型代码） |
| 网络 | 能访问 DUT（Telnet/SSH）、拓扑后端、流量收发后端 |

安装：

```bash
# 1) 安装 Thrift 编译器（Debian/Ubuntu）
sudo apt-get update && sudo apt-get install -y thrift-compiler

# 2) 安装依赖；postinstall 会自动生成 Thrift 代码
npm install

# 3) 如需重新生成 Thrift 代码
npm run gen
```

## 快速开始

```bash
# 1) 配置设备与后端连接（见下方「配置」）
cat > .env <<'EOF'
DUT_USERNAME=admin
DUT_PASSWORD=your-password
TOPO_BACKEND_HOST=172.16.9.1
STREAM_BACKEND_HOST=172.16.9.1
EOF

# 2) 按设备 profile 执行功能回归
npm run default   # profile=default
npm run ipv6      # profile=ipv6（IPv6 规格与 default 不同）
npm run mpls      # profile=mpls（MPLS 用例仅在此 profile 生效）

# 3) 其它套件
npm run stack     # 堆叠场景（test/misc/stack）
npm run example   # 教程示例（docs/test_script_tutorials）

# 4) 仅执行单个用例 / 某个子模块
npx jest -i --config=config/jest.default-regression.config.cjs -t "BGP 实例"
npx jest -i --config=config/jest.mpls-regression.config.cjs test/feature/19-MPLS/02-mpls/01-mpls_basic

# 5) 打印某个场景的精确用例清单（复制 / 调试用）
npm run list:suite -- mpls regression

# 6) 重新执行上次失败的用例
npm run gen-failed && npm run failed
```

> `npm test` 会以根目录 `jest.config.cjs` 运行，该配置仅匹配 `test/demo.test.ts`，
> 用于冒烟验证。执行设备用例时使用 `npm run default`。

## Jest 配置组织

交换机的特性与规格由设备 profile 决定（CLI：`show stm prefer`）。同一批用例在不同
profile 下的可用性与规格不同——MPLS 仅在 `mpls` 下生效，IPv6 在 `default` / `ipv6` 下
都生效但规格不同——因此配置按 **profile × suite** 组合：

| 轴 | 位置 | 内容 |
|---|---|---|
| profile | `config/profiles/<profile>.json` | 设备能力：描述、可执行范围、`capacity` 规格 |
| suite | `config/suites/<suite>.json` | 用例范围：`include` / `exclude` glob |
| 组合 | `config/jest.<profile>-<suite>.config.cjs` | 一个具体配置，正文仅包含一条 `createJestConfig` |

profile 全集（`show stm prefer`）：`default`（基线）、`extended-buffer`、`ipv6`、
`layer3`、`mpls`。

现有配置：

| 配置 | profile | suite | 用例数 |
|---|---|---|---|
| `jest.default-regression.config.cjs` | default | regression | 140 |
| `jest.ipv6-regression.config.cjs` | ipv6 | regression | 140 |
| `jest.mpls-regression.config.cjs` | mpls | regression | 203 |
| `jest.default-stack.config.cjs` | default | stack | 34 |
| `jest.default-example.config.cjs` | default | example | 2 |

`regression` = `test/feature/**/*.test.ts`；非 `mpls` profile 通过 `exclude` 排除
`test/feature/19-MPLS/**`。因此新增用例落在 `test/feature` 下即可自动进入对应
profile 的回归，不需要手工登记。

`jest.base.cjs` 是唯一公共配置：setup、`@/` 别名、串行执行、超时、HTML 报告器，并把
`PROFILE` / `SUITE` / `PROFILE_INFO`（含 `capacity`）注入 `globals`，供用例按场景取规格：

```js
const { createJestConfig } = require("./jest.base.cjs");

module.exports = createJestConfig({ profile: "mpls", suite: "regression" });
```

- 新增组合：加一个上述 4 行文件，并在 `package.json` 补 npm 脚本（可选）；
- 新增设备模式：加 `config/profiles/<name>.json`（`default` 为基线）；
- 查看 / 校验清单：

```bash
node script/jest-suite.js --table                 # profile × suite 用例数矩阵
node script/jest-suite.js --list mpls regression  # 精确文件列表（可复制）
node script/jest-suite.js --check                 # 配置与覆盖自检（已接入 npm run check）
```

已知限制：`stack` 套件暂用 `default` profile（堆叠设备实际 profile 待确认）；
`extended-buffer` 与 `layer3` 暂无专属用例，仅保留 profile 定义。

## 配置

### 环境变量（`.env`）

`script/setup/jest.setup.ts` 在测试启动前读取仓库根目录的 `.env` 并写入 `process.env`
（已存在的环境变量优先，`.env` 缺失不报错）。`.env` 已被 `.gitignore` 忽略。

| 变量 | 默认值 | 说明 |
|---|---|---|
| `DUT_USERNAME` | — | 登录 DUT 的账号 |
| `DUT_PASSWORD` | — | 登录 DUT 的密码 |
| `TOPO_BACKEND_HOST` | `172.16.9.1` | 拓扑后端地址 |
| `TOPO_BACKEND_PORT` | `8000` | 拓扑后端端口 |
| `TOPO_BACKEND_USERNAME` | `test` | 拓扑后端账号 |
| `TOPO_BACKEND_PASSWORD` | `autotest` | 拓扑后端密码 |
| `STREAM_BACKEND_HOST` | `172.16.9.1` | 流量收发后端地址 |
| `STREAM_BACKEND_PORT` | `8001` | 流量收发后端端口 |
| `STREAM_BACKEND_USERNAME` | `test` | 流量收发后端账号 |
| `STREAM_BACKEND_PASSWORD` | `autotest` | 流量收发后端密码 |

### DUT 与端口映射（`utils/comm/config.ts`）

- `Config.dut_list` 决定被测设备清单，下标与 `DutIdx.A`(0) ~ `DutIdx.H`(7) 一一对应。
- 每台 DUT 通过 `portList`（如 `eth-0-1 ~ eth-0-4`）和 `portMapping`
  （`{ device, if_index }`，指向拓扑/流量收发后端里的真实端口）描述物理连接。
- `Config.Renix.portList` 定义测试仪/Scapy 端口，`RenixPort.A/B/C/D` 是常用端口的快捷方式。
- `Config.defaultTopoName`（默认 `auto-test-topo`）：`TestHelper.init()` 会先删除同名旧拓扑再重建。
- `Config.default_cfg` 是 Telnet/SSH 会话默认参数（超时、分页、缓冲区、终端宽高等）。

## 编写测试用例

一个用例的结构：

```ts
import { RenixPort } from "@/utils/comm/config";
import { TransmitMode } from "@/utils/comm/components";
import { PacketBuilder } from "@/utils/stream/thrift-packet";
import { LinkConstraint } from "@/utils/topo/link-constraint";
import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 10);

let t: TestHelper;

beforeAll(async () => {
  // 传入拓扑则自动创建/启用后端拓扑；不传则仅连接设备
  t = await new TestHelper(LinkConstraint.two_devices_topo_links_type_1).init();
});

afterAll(async () => {
  await t.destroy();
});

test("DUTA 配置 VLAN 100 后，DUTB 能收到带 VLAN 100 的报文", async () => {
  t.ExecConfigDutA(["vlan 100", "interface <PortA>", "switchport mode access"]);
  t.ReadyCheckDutA("show vlan 100", /VLAN100\s+active/);

  t.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({ dst: "00:00:00:11:22:44", src: "00:00:00:11:22:33" })
      .setVLAN({ vlan: 100 })
      .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" })
      .setUDP({ sport: 1234, dport: 80 }),
    transmit_param: { mode: TransmitMode.STEP, param: { step_count: 10 } },
  });

  t.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder().setEthernet({ dst: "00:00:00:11:22:44" }).setVLAN({ vlan: 100 }),
    expected_count: 1,
  });

  await t.startTest();
  expect(t.result()).toBeTruthy();
});
```

### TestHelper API

所有动作方法都返回 `this`，可链式调用，最后统一 `await t.startTest()`。
`t.result()` 返回整体结果布尔值。执行顺序即注册顺序。

| 分类 | 方法 | 说明 |
|---|---|---|
| 生命周期 | `init()` | 登录拓扑后端、连接全部 DUT、按需重建拓扑 |
| | `destroy()` | 断开 DUT、释放流量收发端口、删除拓扑 |
| | `startTest()` / `result()` | 执行全部动作 / 取值 |
| 配置 | `ExecConfigDut(idx, cmds)`、`ExecConfigDutA..D` | 下发配置命令 |
| 清理 | `CleanConfigDut(idx, cmds)`、`CleanConfigDutA..D` | 清理配置（失败也继续执行） |
| 回显校验 | `ExecRetMatchDut(idx, cmd, expect, notMatch?)`、`..A..D` | 执行命令并校验回显 |
| 就绪等待 | `ReadyCheckDut(idx, cmd, expect, timeout?, notMatch?)`、`..A..D` | 轮询直到匹配或超时 |
| 自定义 | `ExecCustomDut(idx, cb, exec_clean?)`、`..A..D` | 回调内通过 `DutHandle` 安全执行 |
| 流量发送/抓包 | `addPktSender(...)`、`startCapture(port)`、`stopStream(port)`、`addPktChecker(...)` | 见 `components.ts` |
| 延时 | `sleep(ms)` | 固定等待 |

**端口占位符**：命令字符串中的 `<PortA>`、`<PortB>` 等（`Port` 枚举）会在执行前按当前
DUT 的 `portList` 自动替换为真实端口名。`expect` 传入 `string` 按纯文本匹配（自动转义），
传入 `RegExp` 按正则匹配。

### 报文构造（`PacketBuilder`）

支持逐层拼装：`setEthernet` / `setVLAN` / `setIPv4` / `setIPv6` / `setARP` / `setTCP` /
`setUDP` / `setICMP` / `setLLC` / `setSNMP` / `setRaw`。

发送参数 `PacketSendParam`：

- `port`：`RenixPort.A` 等 `StreamPort`；
- `packet`：`PacketBuilder` 实例；
- `modifier_param`（可选）：按 `ModifierField` / `ModifierMode` 做字段递增、递减或随机；
- `transmit_param`：`mode` 取 `TransmitMode.CONTINUOUS | BURST | STEP | TIME`，配合对应参数。

校验参数 `PacketCheckParam`：`port`、待匹配的 `packet`、`expected_count`（数字，或
`GreaterThan(n)` / `LessThan(n)` / `EqualTo(n)`）。

### 拓扑

```ts
import { dut, renix } from "@/utils/topo/endpoints";
import { link, topo, LinkConstraint } from "@/utils/topo/link-constraint";

// 方式一：直接引用内置拓扑
new TestHelper(LinkConstraint.xxx).init();

// 方式二：自定义拓扑
new TestHelper(
  topo(
    link(dut("A", "D"), renix("A")),
    link(dut("A", "A"), dut("B", "A"), { vlan: 100 }),
  ),
).init();
```

`link()` 描述一条连线，`topo()` 组装并自动分配 `stream_id`（从 1 起）。`resolveEndpoint`
在设备/端口未配置时会抛出可读错误（fail-fast）。内置拓扑定义在
`LinkConstraint` 的静态 getter 上，每个 getter 上方附有 ASCII 拓扑图。

## 测试报告

`config/jest.*.config.cjs` 使用 `jest-html-reporter`，每次运行在 `test-report/` 下生成
`test-report-<profile>-<suite>-<时间戳>.html`（标题形如 `Test Report - mpls / regression`）。
根 `jest.config.cjs` 未启用报告器。

重新执行失败用例：

```bash
npm run gen-failed   # 解析 test-report/ 最新报告，生成 config/jest.failed.config.cjs
npm run failed       # 按该配置重新执行（报告名带 -failed）
```

生成器会沿用原报告的 profile / suite，所以失败用例重试的 `PROFILE`、`SUITE` 与首次运行一致；
报告中已不存在的路径会被跳过并警告。

## npm 脚本

| 脚本 | 作用 |
|---|---|
| `npm test` | `jest -i`，使用根配置（仅 `test/demo.test.ts`） |
| `npm run default` | 执行 default profile 的功能回归（`config/jest.default-regression.config.cjs`） |
| `npm run ipv6` | 执行 ipv6 profile 的功能回归 |
| `npm run mpls` | 执行 mpls profile 的功能回归（含 MPLS 用例） |
| `npm run stack` | 执行堆叠场景套件（`config/jest.default-stack.config.cjs`） |
| `npm run example` | 执行教程用例（`config/jest.default-example.config.cjs`） |
| `npm run failed` | 执行上次失败的用例（`config/jest.failed.config.cjs`） |
| `npm run gen-failed` | 从最新 HTML 报告生成失败用例配置 |
| `npm run list:suite -- <profile> <suite>` | 打印精确用例清单（等价 `node script/jest-suite.js --list`） |
| `npm run gen` | 强制重新生成 Thrift 代码 |
| `npm run test -- -i -t "..."` | 透传参数给 Jest（按标题过滤等） |
| `npm run check` | 提交前自检：命名 + 模块树 + 套件清单与覆盖 + 类型检查 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check:test-names` | 校验 `test/` 目录与文件命名 |
| `npm run check:test-modules` | 校验 `test/feature` 目录树与 `config/test-module-map.json` 一致 |
| `npm run check:jest-suites` | 校验 `profiles/`、`suites/`、各配置能展开用例，并检查 `test/feature` 覆盖 |
| `npm run scaffold:test-modules` | 按 map 创建缺失的模块/子模块目录（`.gitkeep` 占位） |
| `npm run check:commit-msg` | 校验最近一条提交信息 |
| `npm run format` | Prettier 格式化 `test` 与 `utils` |
| `npm run hooks:install` | 安装 `commit-msg` / `pre-commit` git hook |

说明：设备用例存在先后依赖，所有配置均设置 `maxWorkers: "1"`，并由
`script/jest.sequencer.js` 按模块树路径排序（模块号 → UG 小节 → 子功能 → 用例序号），
同目录内序号递增、目录之间不交错，设备用例应串行执行。

## 代码生成（Thrift）

- IDL：`utils/rpc/thrift/packet.thrift`；生成物：`utils/rpc/gen-nodejs/packet_types.js`。
- 生成物被 `utils/rpc/.gitignore`（`gen-*`）忽略，因此**全新 clone 上不存在**，
  缺少它会导致 `tsc` 与 Jest 报 `Cannot find module '../rpc/gen-nodejs/packet_types'`。
- 触发时机：`postinstall`、`pretest`、`predefault`、`preipv6`、`prempls`、`prestack`、
  `preexample`、`prefailed` 均会自动执行 `node script/gen-thrift.js`（仅在缺失时生成）；
  `npm run gen` 使用 `--force` 强制重生成。
- 手动生成：`cd utils/rpc && ./gen.sh`（等价于 `thrift --gen js:node thrift/packet.thrift`）。

## 规范

- [文档编写规范](docs/spec/documentation-convention.md)：书面语、陈述句、术语统一、结构要求与评审清单。
- [测试用例命名规范](docs/spec/naming-convention.md)：目录 `NN-FEATURE[/NN-sub_feature]`、
  文件 `NNNN-<模块>[-<子功能>].test.ts`、标题必须非空且为中文陈述句。
- [测试用例脚本编写规范](docs/spec/test-script-convention.md)：文件结构、TestHelper 动作顺序、
  `expect` 语义、流量发送/抓包、清理与反例，编写脚本时对照本文。
- [测试用例设计模板](docs/spec/test-case-template.md)：脚本编写前的用例设计模板，
  含标准依据、能力前提、协议基线参数、观测面与判定标准；独立于测试框架，支持任意手段复测。
- [提交信息规范](docs/spec/commit-convention.md)：Conventional Commits，格式
  `<type>(<scope>): <中文标题>`，由 `script/check-commit-msg.js` 校验。
- [CI 集成说明](docs/spec/ci.md)：门禁范围、自托管 runner 接入方式。
- [本地配置技巧](docs/local-setup.md)：`git update-index --skip-worktree` 忽略本地改动。

`npm install` 后会自动安装 `commit-msg` hook（`core.hooksPath` 指向 `script/git-hooks`），
提交不合规信息会被直接拒绝。

## CI

`.github/workflows/ci.yml` 在 push / PR 上执行两类**离线可判定**的检查：

| Job | 内容 |
|---|---|
| `commit-msg` | 按事件类型计算区间，校验区间内全部提交信息 |
| `static-checks` | 安装 Thrift → `npm ci` → 确认生成物 → 命名规范 → `tsc --noEmit` |

设备用例需要真实 DUT 与后端网络，无法在 GitHub 托管 runner 上运行，应放到**自托管
runner** 上（`workflow_dispatch` 或 nightly 触发），详见 [docs/spec/ci.md](docs/spec/ci.md)。

## 常见问题

| 现象 | 原因 / 处理 |
|---|---|
| `无法执行 thrift 命令` | 未安装 Thrift 编译器，执行 `sudo apt-get install -y thrift-compiler` |
| `Cannot find module '../rpc/gen-nodejs/packet_types'` | 未生成 Thrift 代码，执行 `npm run gen`，或确认 `postinstall` 未被 `--ignore-scripts` 跳过 |
| `DUT X 未配置或未初始化` | `Config.dut_list` 未配置对应设备，检查 `utils/comm/config.ts` |
| `Renix/DUT 未配置端口 X` | `portMapping` 缺少对应端口，补齐后才可解析拓扑端点 |
| Telnet 命令超时 `response not received` | 分页提示未命中；确认 `default_cfg.pageSeparator` 能匹配设备 `--More--` 输出 |
| 回显被按 80 列硬换行导致正则不匹配 | `default_cfg.terminalWidth/Height` 已放大，可进一步调整 |
| 用例改动被 git 跟踪 | 参考 `docs/local-setup.md` 使用 `skip-worktree` |

## License

本仓库未声明开源许可证，默认保留所有权利。如需对外使用，应先与维护者确认。
