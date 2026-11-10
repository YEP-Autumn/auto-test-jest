# 测试用例脚本编写规范

本文约定 `test/**/*.test.ts`（基于 Jest + TypeScript + `TestHelper`）**脚本层**的统一写法。
目标是让所有用例「长得一样」：骨架一致、动作顺序一致、断言方式一致，从而易于阅读、
评审、批量维护与自动筛选。

## 0. 与其它规范的关系

| 文档 | 管什么 | 举例 |
|---|---|---|
| [naming-convention.md](./naming-convention.md) | **放哪里、叫什么** | 目录 `NN-FEATURE/NN-sub_feature`、文件 `NNNN-FEATURE.test.ts`、标题非空 |
| [test-case-template.md](./test-case-template.md) | **用例怎么描述**（面向人、手工可复现，不含框架细节） | 步骤、预期、清理 |
| 本文 | **脚本怎么写**（TestHelper、动作顺序、断言、占位符） | 骨架、`startTest()`、`ExecRetMatchDutA` |

三者的关系：先用模板写描述、评审通过；再按命名规范放好路径；最后按本文落地成脚本。
**本文只写脚本层的约定，不改动命名与描述规则。**

校验脚本：[`script/check-test-names.js`](../../script/check-test-names.js)（命名与空标题）

```shell
node script/check-test-names.js   # 或 npm run check:test-names
```

---

## 1. 标准文件骨架

每个 `.test.ts` 都遵循同一骨架：**导入 → 超时 → 声明 → `beforeAll` → `afterAll` → `test(...)`**。

```ts
import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";
import { LinkConstraint } from "@/utils/topo/link-constraint";

// 1) 超时：设备交互慢，必须显式放宽（仅 CLI 场景常用 30 分钟）
jest.setTimeout(1000 * 60 * 10);

// 2) 模块级单例：一个文件一个 TestHelper
let testHelper: TestHelper;

// 3) 初始化：连设备；传入拓扑则同时创建/启用后端拓扑
beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_4,
  ).init();
});

// 4) 收尾：断开设备、释放打流端口、删除拓扑
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

1. **导入一律用 `@/` 别名**（`tsconfig.json` 中 `@/*` → 仓库根），不要写 `../../..` 相对路径。
2. `jest.setTimeout(...)` 放在导入之后、`beforeAll` 之前；打流/多设备场景建议 `1000 * 60 * 10` 起，
   仅 CLI 用例可 `1000 * 60 * 30`（30 分钟）。
   - **超时优先级**：`test(name, fn, timeout)`（单用例）> 文件内 `jest.setTimeout`（含 `beforeAll`/`afterAll`
     钩子）> config 的 `testTimeout`（本仓库 `config/*.cjs` 均为 50 分钟）> Jest 内置默认 `5000`（5 秒）。
   - 不写 `jest.setTimeout`、且使用**未设 `testTimeout` 的根配置**（`npm test`）时即为 **5 秒**——设备用例
     连设备/下发都远超 5 秒，因此务必显式声明，不要依赖默认值。
3. `let testHelper: TestHelper;` 在**模块作用域**声明，供所有 `test()` 共用；不要在每个 `test` 内 new。
4. `beforeAll` 用 `await ... .init()`；不需要拓扑时传空即可：`new TestHelper().init()`。
5. `afterAll` **只做** `await testHelper.destroy();`，不要在此写断言。
6. 每个 `test()` 标题按命名规范写中文陈述句，**禁止空标题**。

---

## 2. 用例体的固定顺序

一个用例内部的动作按**固定的四段**顺序注册，与 `test-case-template.md` 的
「配置 → 触发/等待 → 校验 → 清理」一一对应：

```
1. 配置    ExecConfigDutX([...])        // 下发配置
2. 等待    ReadyCheckDutX(...) / sleep  // 等邻居/路由/接口就绪
3. 校验    ExecRetMatchDutX(...) / 打流  // 校验回显或报文
4. 清理    CleanConfigDutX([...])       // 恢复初始状态
── 最后 ──  await testHelper.startTest()
           expect(testHelper.result()).toBeTruthy();
```

### 关键执行语义（务必理解）

所有动作方法**只注册、不立即执行**，返回 `this` 可链式调用；由 `startTest()` 按**注册顺序**
依次执行，并把结果累积到内部 `testResult`：

- **配置 / 校验 / 等待**：只有当前面都成功时才执行；
- **`CleanConfigDutX` 与 `ExecCustomDutX(cb, exec_clean = true)`**：**无论前面是否失败都会执行**，
  用于兜底清理现场；
- **打流/抓包类**（`addPktSender` / `startCapture` / `addPktChecker` / `stopStream`）：
  前面一旦失败即跳过；
- 只要有一个动作返回失败，最终 `testHelper.result()` 即为 `false`。

因此：**`startTest()` 在整个用例体末尾调用一次**，且 `expect(result()).toBeTruthy()` 是唯一的
Jest 断言点。不要把 `startTest()` 拆到中间多次调用。

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
| 打流/抓包 | `addPktSender(p)` / `startCapture(port)` / `stopStream(port)` / `addPktChecker(p)` | 见 §6 |
| 延时 | `sleep(ms)` | 固定等待，**优先用就绪等待**（见 §5） |

通用（非便捷）形式：`ExecConfigDut(idx, cmds)`、`ExecRetMatchDut(idx, cmd, expect, notMatch?)` 等，
`idx` 取 `DutIdx.A` ~ `DutIdx.H`。设备序号与 `Config.dut_list` 下标一一对应，越界会 fail-fast 报错。

### 设备端口与占位符

- `Port.A/B/C/D`（值形如 `<PortA>`）是**端口占位符**，命令字符串里直接写
  `` `interface ${Port.A}` ``，执行前会按当前 DUT 的 `portList` 替换为真实端口名。
- 打流端口用 `RenixPort.A/B/C/D`（`StreamPort`），与 DUT 端口无关。

---

## 4. 断言与期望值（`expect` 语义）

**唯一断言**写法：

```ts
await testHelper.startTest();
expect(testHelper.result()).toBeTruthy();
```

也可写成链式形式（等价，二者择一，**不要混用**）：

```ts
expect((await testHelper.startTest()).result()).toBeTruthy();
```

`ExecRetMatchDutX` / `ReadyCheckDutX` 的 `expect` 参数**由类型决定匹配语义**：

| 传入 | 语义 | 例子 |
|---|---|---|
| `string` | **纯文本**匹配（自动转义正则元字符） | `" 0% packet loss"` |
| `RegExp` | **正则**匹配（保留 flags） | `new RegExp("1.1.1.1.*?OPERATIONAL")` |
| `(string \| RegExp)[]` | **数组 = AND**：命令只执行一次，输出须**同时**命中每一条 | ACL 的 `show running-config` 多行校验 |

要点：

- 需要通配/量词等正则能力时**必须显式 `new RegExp(...)`**；
  直接传字符串是纯文本，`${Port.A}.1` 里的 `.` 不再当通配符（这是有意修正）。
- 端口占位符在 string 与 RegExp 两种形式下都会被替换。
- `notMatch = true` 表示「期望**不**命中」，用于反向校验（如确认某配置不在回显中）。
- **数组优先**：同一命令的多条期望合并成数组入参，只下发一次，避免重复执行
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
  `1000 * 3` / `1000 * 20` 这类可读写法，不要写魔法数字。
- 不要用 `sleep` 代替就该探测的就绪条件。

```ts
testHelper.ReadyCheckDutB(
  "show ldp session",
  new RegExp("1.1.1.1.*?OPERATIONAL"),
  60_000, // 超时可单独放宽
);
```

---

## 6. 打流与抓包

用 `PacketBuilder` 逐层拼报文，`addPktSender` 发包、`addPktChecker` 校验。
**`addPktChecker` 会自动 `startCapture`/`stopCapture`**，一般无需手写 `startCapture`。

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
- 需要在发包之间用回显确认时，可在两条打流动作之间插入 `ExecRetMatchDutX` / `ReadyCheckDutX`。

---

## 7. 拓扑

- **优先复用内置拓扑** `LinkConstraint.*`（每个 getter 上方有 ASCII 图 + 紧贴定义，F12 直达）：
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

- `stream_id` 由 `topo()` 按下标自动生成（从 1 起），无需手写。
- 用例文件顶部（`test()` 之前）贴与拓扑一致的 ASCII 图，便于对照。

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

文件内多于 2 个用例、且有分组含义时用 `describe` 组织；标题**不加** `******`、`一、` 等装饰字符。

```ts
describe("VLAN trunk translate 接口模式", () => {
  test("支持配置 raw-vlan VLAN_ID evc", async () => { /* ... */ });
});
```

### 跳过用例

暂不实现/待环境支持的用例用 `test.skip("标题", async () => {});`，**标题仍须非空**并说明原因。

### 失败时保留现场（调试用）

`TestHelper` 支持失败时保留拓扑/现场（内部开关 `_inner_debug_preserve_scene_when_failed`），
仅在本地定位问题时临时开启，**不得提交**。

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

### 9.3 多设备 + 打流用例

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

`CleanConfigDutX` 的清理顺序遵循 `test-case-template.md` §5：**业务路由 → 接口/隧道/loopback
→ 协议 → VRF → 接口回二层**，使设备回到「初始状态」。清理命令要覆盖**全部**新增对象，
否则会污染后续用例（用例按 `script/jest.sequencer.js` 顺序、`maxWorkers: 1` 串行执行）。

---

## 11. 反例 / 禁止项

| 反例 | 问题 |
|---|---|
| `test("", async () => {})` | 空标题，`check:test-names` 直接报错 |
| 用 `../../..` 相对路径导入 | 违反 `@/` 别名约定 |
| 在 `test()` 内 `new TestHelper(...)` | 每个用例重连设备，慢且易残留 |
| 中间多次 `await startTest()` | 破坏「注册顺序 + 一次执行」模型 |
| `await new Promise(r => setTimeout(r, ms))` | 应统一用 `testHelper.sleep(ms)` |
| 用 `sleep` 代替可探测的就绪条件 | 不稳定、拖慢执行 |
| 同一 `show` 命令拆多次 `ExecRetMatch` | 应合并为数组参数，一次下发 |
| `clean` 段缺失或只清一半 | 现场残留污染后续用例 |
| 期望字符串里想用正则却直接传 string | 会按纯文本匹配，`.` 不再通配；应 `new RegExp(...)` |
| 标题加 `******`、`一、` 等装饰 | 命名规范禁止 |

---

## 12. 新增用例检查清单

1. 路径与文件名符合 [naming-convention.md](./naming-convention.md)；类型变体共用基号；
2. 骨架完整：`jest.setTimeout` + 模块级 `testHelper` + `beforeAll` + `afterAll`；
3. 导入用 `@/` 别名；
4. 用例体遵循「配置 → 等待 → 校验 → 清理」；`startTest()` 只在末尾调用一次；
5. 清理段覆盖全部新增对象，顺序安全；
6. `expect` 需要正则能力时显式 `new RegExp(...)`；多行校验合并为数组；
7. 等待优先 `ReadyCheck`，`sleep` 有明确依据；
8. 打流用例：`PacketBuilder` 分层清晰，`expected_count` 不留误判空间（0% 不能把 100% 判通过）；
9. 标题非空、中文陈述句、无装饰字符；
10. 用例落在 `test/feature` 下即自动被 regression 套件收录，无需手工登记路径
    （profile 限制见 `config/profiles/<profile>.json`）；
11. 运行 `npm run check:test-names`、`npm run typecheck`、`npx prettier --write test`（或 `npm run format`）。
