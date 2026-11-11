# 测试用例脚本编写规范

本文约定 `test/**/*.test.ts`（基于 Jest + TypeScript + `TestHelper`）**脚本层**的统一写法。
目标是统一用例结构：文件结构一致、动作顺序一致、断言方式一致，便于阅读、
评审、批量维护与自动筛选。

## 0. 与其它规范的关系

| 文档 | 职责 | 示例 |
|---|---|---|
| [naming-convention.md](./naming-convention.md) | **目录与文件命名** | 目录 `NN-FEATURE/NN-sub_feature`、文件 `NNNN-FEATURE.test.ts`、标题非空 |
| [test-case-template.md](./test-case-template.md) | **用例设计**（脚本编写前，面向人、任意手段可复现） | 步骤、预期、清理、标准依据、观测面 |
| 本文 | **脚本编写**（TestHelper、动作顺序、断言、占位符） | 文件结构、`startTest()`、`ExecRetMatchDutA` |

三份文档的分工：先按模板完成用例设计，评审通过后按命名规范确定路径，最后按本文编写脚本。
**本文约定脚本层写法；命名与用例设计分别由前两份文档约定。**

校验脚本：[`script/check-test-names.js`](../../script/check-test-names.js)（命名与空标题）

```shell
node script/check-test-names.js   # 或 npm run check:test-names
```

---

## 1. 标准文件结构

每个 `.test.ts` 都遵循同一结构：**导入 → 超时 → 声明 → `beforeAll` → `afterAll` → `test(...)`**。

```ts
import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";
import { LinkConstraint } from "@/utils/topo/link-constraint";

// 1) 超时：设备交互耗时较长，应显式放宽（仅 CLI 场景常用 30 分钟）
jest.setTimeout(1000 * 60 * 10);

// 2) 模块级单例：每个文件使用一个 TestHelper
let testHelper: TestHelper;

// 3) 初始化：连接设备；传入拓扑时同时创建或启用后端拓扑
beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_4,
  ).init();
});

// 4) 清理：断开设备、释放流量收发端口、删除拓扑
afterAll(async () => {
  await testHelper.destroy();
});

test("配置 LDP 后邻居进入 OPERATIONAL", async () => {
  // 注册动作……（见 §2）
  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
```

约定：

1. **导入统一使用 `@/` 别名**（`tsconfig.json` 中 `@/*` → 仓库根）。
2. `jest.setTimeout(...)` 放在导入之后、`beforeAll` 之前；流量收发/多设备场景建议 `1000 * 60 * 10` 起，
   仅 CLI 用例可 `1000 * 60 * 30`（30 分钟）。
   - **超时优先级**：`test(name, fn, timeout)`（单用例）> 文件内 `jest.setTimeout`（含 `beforeAll`/`afterAll`
     钩子）> config 的 `testTimeout`（本仓库 `config/*.cjs` 均为 50 分钟）> Jest 内置默认 `5000`（5 秒）。
   - 未设置 `jest.setTimeout` 且使用**未设 `testTimeout` 的根配置**（`npm test`）时，超时为 **5 秒**；设备用例
     连接设备与下发配置的耗时远超 5 秒，因此应显式声明超时时间。
3. `let testHelper: TestHelper;` 在**模块作用域**声明一次，供所有 `test()` 共用。
4. `beforeAll` 使用 `await ... .init()`；无拓扑需求时传空即可：`new TestHelper().init()`。
5. `afterAll` 仅执行 `await testHelper.destroy();`，断言放置在 `test()` 内。
6. 每个 `test()` 标题按命名规范编写中文陈述句，**标题必须非空**。

---

## 2. 用例体的固定顺序

一个用例内部的动作按**固定的四段**顺序注册，与 `test-case-template.md` 模板中的
「配置 → 触发/等待 → 观测/校验 → 清理」对应：

```
1. 配置    ExecConfigDutX([...])        // 下发配置
2. 等待    ReadyCheckDutX(...) / sleep  // 等待邻居/路由/接口就绪
3. 校验    ExecRetMatchDutX(...) / 流量发送  // 校验回显或报文
4. 清理    CleanConfigDutX([...])       // 恢复初始状态
── 最后 ──  await testHelper.startTest()
           expect(testHelper.result()).toBeTruthy();
```

### 关键执行语义

所有动作方法**仅注册、不立即执行**，返回 `this` 以支持链式调用；由 `startTest()` 按**注册顺序**
依次执行，并将结果累积到内部 `testResult`：

- **配置 / 校验 / 等待**：当前序动作全部成功时执行；
- **`CleanConfigDutX` 与 `ExecCustomDutX(cb, exec_clean = true)`**：**无论前序动作是否失败均执行**，
  用于兜底清理现场；
- **流量发送/抓包类**（`addPktSender` / `startCapture` / `addPktChecker` / `stopStream`）：
  前序动作失败时跳过执行；
- 任一动作返回失败时，最终 `testHelper.result()` 为 `false`。

因此，**`startTest()` 在用例体末尾调用一次**，Jest 断言点统一为 `expect(result()).toBeTruthy()`。

---

## 3. TestHelper 动作 API

所有方法都返回 `this`，执行顺序 = 注册顺序。`X` 可替换为 `A/B/C/D`（对应 `DutIdx`）。

| 分类 | 方法 | 说明 |
|---|---|---|
| 配置 | `ExecConfigDutX(cmds: string[])` | 下发配置命令；失败后自动 `end` 并标记失败 |
| 清理 | `CleanConfigDutX(cmds: string[])` | 逐条下发，**失败继续**，用于恢复现场 |
| 回显校验 | `ExecRetMatchDutX(cmd, expect, notMatch?)` | 执行命令并校验回显 |
| 就绪等待 | `ReadyCheckDutX(cmd, expect, timeout?, notMatch?)` | 轮询直到命中或超时（默认 30s） |
| 自定义 | `ExecCustomDutX(cb, exec_clean?)` | 回调内用 `DutHandle` 安全执行；`exec_clean=true` 时始终执行 |
| 流量发送/抓包 | `addPktSender(p)` / `startCapture(port)` / `stopStream(port)` / `addPktChecker(p)` | 见 §6 |
| 延时 | `sleep(ms)` | 固定等待，**优先用就绪等待**（见 §5） |

通用（非便捷）形式：`ExecConfigDut(idx, cmds)`、`ExecRetMatchDut(idx, cmd, expect, notMatch?)` 等，
`idx` 取 `DutIdx.A` ~ `DutIdx.H`。设备序号与 `Config.dut_list` 下标一一对应，越界会 fail-fast 报错。

### 设备端口与占位符

- `Port.A/B/C/D`（值形如 `<PortA>`）是**端口占位符**，命令字符串里直接写
  `` `interface ${Port.A}` ``，执行前会按当前 DUT 的 `portList` 替换为真实端口名。
- 流量收发端口使用 `RenixPort.A/B/C/D`（`StreamPort`），与 DUT 端口无关。

---

## 4. 断言与期望值（`expect` 语义）

**唯一断言**写法：

```ts
await testHelper.startTest();
expect(testHelper.result()).toBeTruthy();
```

也可写成链式形式（两种写法等价，择一使用）：

```ts
expect((await testHelper.startTest()).result()).toBeTruthy();
```

`ExecRetMatchDutX` / `ReadyCheckDutX` 的 `expect` 参数**由类型决定匹配语义**：

| 传入 | 语义 | 例子 |
|---|---|---|
| `string` | **纯文本**匹配（自动转义正则元字符） | `" 0% packet loss"` |
| `RegExp` | **正则**匹配（保留 flags） | `new RegExp("1.1.1.1.*?OPERATIONAL")` |
| `(string \| RegExp)[]` | **数组 = AND**：命令仅执行一次，输出须**同时**命中每一条 | ACL 的 `show running-config` 多行校验 |

要点：

- 需要通配/量词等正则能力时**必须显式 `new RegExp(...)`**；
  直接传字符串时按纯文本匹配，`${Port.A}.1` 中的 `.` 不具备通配符能力（按纯文本处理）。
- 端口占位符在 string 与 RegExp 两种形式下都会被替换。
- `notMatch = true` 表示「期望**不**命中」，用于反向校验（如确认某配置不在回显中）。
- **数组优先**：同一命令的多条期望合并成数组入参，仅下发一次，减少重复执行
  （如 `show running-config` 一次校验多行）。

```ts
// ✅ 一次下发，多行 AND
testHelper.ExecRetMatchDutA("show running-config", [
  "ip access-list TC_IP_PLAIN",
  "10 deny tcp any any",
  "20 permit tcp host 10.1.1.1 src-port range 1024 2048",
]);

// ❌ 同一命令拆成多次调用：会重复下发、浪费时间
// testHelper.ExecRetMatchDutA("show running-config", "ip access-list TC_IP_PLAIN");
// testHelper.ExecRetMatchDutA("show running-config", "10 deny tcp any any");
```

---

## 5. 等待：优先就绪检查，慎用固定 sleep

- **首选 `ReadyCheckDutX(cmd, expect, timeout?)`**：轮询直到条件满足（邻居 Up、路由出现、
  接口 UP），既稳定又比固定时长快。
- `sleep(ms)` 仅在**协议收敛没有可探测信号**时使用，并写明依据；数值用
  `1000 * 3` / `1000 * 20` 这类可读写法。
- 使用 `ReadyCheckDutX` 轮询可探测的就绪条件；`sleep` 仅用于无探测信号的场景，并说明依据。

```ts
testHelper.ReadyCheckDutB(
  "show ldp session",
  new RegExp("1.1.1.1.*?OPERATIONAL"),
  60_000, // 超时可单独放宽
);
```

---

## 6. 流量发送与抓包

用 `PacketBuilder` 逐层拼报文，`addPktSender` 发包、`addPktChecker` 校验。
**`addPktChecker` 会自动执行 `startCapture`/`stopCapture`**，通常由该动作完成抓包起止。

```ts
import { TransmitMode } from "@/utils/comm/components";
import { RenixPort } from "@/utils/comm/config";
import { PacketBuilder } from "@/utils/stream/thrift-packet";

testHelper.startCapture(RenixPort.B);

testHelper.addPktSender({
  port: RenixPort.A,
  packet: new PacketBuilder()
    .setEthernet({ dst: "00:00:01:00:00:ee", src: "00:00:a0:0a:00:66", type: 0x8100 })
    .setVLAN({ vlan: 10, type: 0x0800 })
    .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
  transmit_param: { mode: TransmitMode.STEP, param: { step_count: 10 } },
});

testHelper.addPktChecker({
  port: RenixPort.B,
  packet: new PacketBuilder()
    .setEthernet({ dst: "00:00:01:00:00:ee", src: "00:00:a0:0a:00:66", type: 0x8100 })
    .setVLAN({ vlan: 200, type: 0x0800 })
    .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
  expected_count: 10,
});
```

要点：

- 支持的层：`setEthernet` / `setVLAN` / `setIPv4` / `setIPv6` / `setARP` / `setTCP` /
  `setUDP` / `setICMP` / `setLLC` / `setSNMP` / `setRaw`。
- 发送模式 `TransmitMode.CONTINUOUS | BURST | STEP | TIME`，配对应参数
  （`TransmitStepParam` / `TransmitBurstParam` 等）；Burst 的 `gap_unit` / `rate_unit`
  用 `BurstGapUnit` / `BurstRateUnit` 枚举。
- 计数用数字精确值，或 `GreaterThan(n)` / `LessThan(n)` / `EqualTo(n)`。
- 先 `startCapture` 再 `addPktSender` 再 `addPktChecker`，顺序即抓包/发包的实际时序。
- 需要在发包之间用回显确认时，可在两条流量发送动作之间插入 `ExecRetMatchDutX` / `ReadyCheckDutX`。

---

## 7. 拓扑

- **优先复用内置拓扑** `LinkConstraint.*`（每个 getter 上方附 ASCII 图，紧邻定义，编辑器可跳转到定义）：
  `new TestHelper(LinkConstraint.three_devices_topo_links_type_4).init();`
- 需要自定义时用声明式 DSL：

```ts
import { dut, renix } from "@/utils/topo/endpoints";
import { link, topo } from "@/utils/topo/link-constraint";

new TestHelper(
  topo(
    link(dut("A", "D"), renix("A")),
    link(dut("A", "A"), dut("B", "A"), { vlan: 100 }),
  ),
).init();
```

- `stream_id` 由 `topo()` 按下标自动生成（从 1 起）。
- 用例文件顶部（`test()` 之前）放置与拓扑一致的 ASCII 图，便于对照。

---

## 8. 高级写法

### ExecCustomDutX：无法用通用动作表达时

```ts
import { DutHandle } from "@/utils/comm/components";

testHelper.ExecCustomDutA(async (dut) => {
  await dut.safeExec("end");
  const out = await dut.safeExec("show running-config");
  return /10 permit tcp any any log/.test(out);
});
```

- `DutHandle` 提供 `exec` / `safeExec` / `match(cmd, regexp)`；命令里的端口占位符同样会被替换。
- 回调返回 `true/false`（或 `Promise<boolean>`）决定成败；抛异常按失败处理。
- `exec_clean = true` 时该动作**始终执行**，适合放在清理段兜底。

### test.failing：固化已知缺陷

当设备缺陷已确认、期望「断言应当失败」时，用 `test.failing("标题", ...)`，
让 Jest 在断言失败时记为通过；**固件修复后该用例会转为失败**，届时改回普通 `test(...)`。

```ts
test.failing("反复创建并删除含 log 规则的 ACL 不应耗尽 log 表项（当前固件会泄漏）", async () => {
  // ...
  await testHelper.startTest();
  expect(failedAt).toBe(-1);
});
```

### `describe` 分组

文件内多于 2 个用例、且有分组含义时使用 `describe` 组织；标题使用纯文本，不使用 `******`、`一、` 等装饰字符。

```ts
describe("VLAN trunk translate 接口模式", () => {
  test("支持配置 raw-vlan VLAN_ID evc", async () => { /* ... */ });
});
```

### 跳过用例

暂缓实现或待环境支持的用例使用 `test.skip("标题", async () => {});`，**标题必须非空**并说明原因。

### 失败时保留现场（调试用）

`TestHelper` 支持失败时保留拓扑/现场（内部开关 `_inner_debug_preserve_scene_when_failed`），
该开关仅用于本地定位问题；提交前恢复默认关闭状态。

---

## 9. 用例模板

### 9.1 最小示例

```ts
import { TestHelper } from "@/utils/test-helper";
import { LinkConstraint } from "@/utils/topo/link-constraint";

jest.setTimeout(1000 * 60 * 10);
let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.two_devices_topo_links_type_1,
  ).init();
});
afterAll(async () => {
  await testHelper.destroy();
});

test("<被测对象 + 条件 + 预期>", async () => {
  testHelper.ExecConfigDutA(["configure terminal", "end"]);
  testHelper.CleanConfigDutA(["configure terminal", "end"]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
```

### 9.2 CLI / 回显校验用例

```ts
test("IPv4 ACL 满参数 rule 可配置且在 show running-config 中显示", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip access-list TC_IP_PLAIN",
    "10 deny tcp any any",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "ip access-list TC_IP_PLAIN",
    "10 deny tcp any any",
  ]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ip access-list TC_IP_PLAIN",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
```

### 9.3 多设备 + 流量用例

```ts
test("DUTA 配置 VXLAN 后，DUTB/DUTC 间 loopback 可达", async () => {
  testHelper.ExecConfigDutA([/* 配置 A */]);
  testHelper.ExecConfigDutB([/* 配置 B */]);
  testHelper.ExecConfigDutC([/* 配置 C */]);

  testHelper.ReadyCheckDutA(
    "show bgp l2vpn evpn summary",
    new RegExp("100.100.101.1.*?Established"),
  );
  testHelper.ExecRetMatchDutA("ping vrf pc2 11.1.1.1", " 0% packet loss");

  testHelper.CleanConfigDutA([/* 清理 A */]);
  testHelper.CleanConfigDutB([/* 清理 B */]);
  testHelper.CleanConfigDutC([/* 清理 C */]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
```

---

## 10. 前后端共用清理顺序

`CleanConfigDutX` 的清理顺序遵循 `test-case-template.md` 模板中的「5. 清理与恢复」：**业务路由 → 接口/隧道/loopback
→ 协议 → VRF → 接口回二层**，使设备回到「初始状态」。清理命令要覆盖**全部**新增对象，
否则会污染后续用例（用例按 `script/jest.sequencer.js` 顺序、`maxWorkers: 1` 串行执行）。

---

## 11. 反例与约束

| 反例 | 问题 |
|---|---|
| `test("", async () => {})` | 标题为空，`check:test-names` 校验报错 |
| 使用 `../../..` 相对路径导入 | 不符合 `@/` 别名约定 |
| 在 `test()` 内 `new TestHelper(...)` | 每个用例重复连接设备，执行效率低且易残留现场 |
| 中间多次 `await startTest()` | 不符合「注册顺序 + 一次执行」模型 |
| `await new Promise(r => setTimeout(r, ms))` | 统一使用 `testHelper.sleep(ms)` |
| 使用 `sleep` 代替可探测的就绪条件 | 稳定性不足，执行时间增加 |
| 同一 `show` 命令拆多次 `ExecRetMatch` | 合并为数组参数，一次下发 |
| 清理段缺失或未覆盖全部对象 | 现场残留影响后续用例 |
| 需要正则匹配时直接传入 string | string 按纯文本匹配，`.` 不具备通配能力；使用 `new RegExp(...)` |
| 标题使用 `******`、`一、` 等装饰字符 | 不符合命名规范 |

---

## 12. 新增用例检查清单

1. 路径与文件名符合 [naming-convention.md](./naming-convention.md)；类型变体共用基号；
2. 结构完整：`jest.setTimeout` + 模块级 `testHelper` + `beforeAll` + `afterAll`；
3. 导入用 `@/` 别名；
4. 用例体遵循「配置 → 等待 → 校验 → 清理」；`startTest()` 仅在末尾调用一次；
5. 清理段覆盖全部新增对象，顺序安全；
6. `expect` 需要正则能力时显式 `new RegExp(...)`；多行校验合并为数组；
7. 等待优先 `ReadyCheck`，`sleep` 有明确依据；
8. 流量用例：`PacketBuilder` 分层清晰，`expected_count` 判据明确（0% 丢包率不能将 100% 丢包判为通过）；
9. 标题非空、中文陈述句、无装饰字符；
10. 用例落在 `test/feature` 下即自动被 regression 套件收录，脚本路径由目录自动识别
    （profile 限制见 `config/profiles/<profile>.json`）；
11. 运行 `npm run check:test-names`、`npm run typecheck`、`npx prettier --write test`（或 `npm run format`）。
