# 测试用例命名规范

本文约定 `test/` 目录下目录与文件的命名规则。目标：

- 从路径即可定位「哪个特性 / 哪个子特性 / 第几条用例」；
- 便于 Jest 按路径精确配置（`config/jest*.cjs` 的 `testRegex`）；
- 便于 CI 用脚本自动校验，避免风格漂移。

校验脚本：[`script/check-test-names.js`](../../script/check-test-names.js)

```shell
node script/check-test-names.js   # 或 npm run check:test-names
```

## 1. 目录结构

```
test/
├── demo.test.ts                          # 根级示例（允许）
├── feature/                              # 特性用例
│   └── <NN-FEATURE>/                     # 一级：特性
│       ├── <NNNN>-<FEATURE>.test.ts      # 直接挂在特性下的用例
│       ├── <NN-sub_feature>/             # 二级：子特性（无后缀＝功能用例）
│       │   └── <NNNN>-<FEATURE>.test.ts
│       └── <NN-sub_feature>_<type>/      # 二级：同一子特性的类型变体（如 _cli，见 §3）
│           └── <NNNN>-<FEATURE>.test.ts
└── misc/                                 # 非特性用例
    ├── bugfix/<缺陷号>/                  # 缺陷回归
    └── stack/<模块>/                     # 其它归类
```

约束：

- `test/` 下只允许 `feature/`、`misc/` 两类目录（外加根级 `demo.test.ts`）。
- `feature/` 最多两级子目录，**禁止三级目录**。
- 用例的「**类型**」（功能 / 仅 CLI / 规格 …）用二级子特性目录名的**后缀**表达（见 §3），**不得**再开三级目录。
- 目录不得为空；暂无用例时用 `.gitkeep` 占位（`.gitignore` 已为该文件名放行）。

## 2. 命名规则

| 对象 | 规则 | 正则 | 示例 |
|---|---|---|---|
| 一级特性目录 | `NN-UPPER_SNAKE` | `^\d{2}-[A-Z][A-Z0-9_]*$` | `10-BGP_EVPN_VXLAN`、`30-MPLS` |
| 二级子特性目录 | `NN-lower_snake[_type]` | `^\d{2}-[a-z0-9]+(_[a-z0-9]+)*$` | `01-mpls_basic`、`05-mpls_bpdu_ac_cli` |
| misc 目录 | 小写单词（可连字符）或缺陷号 | `^(\d+\|[a-z0-9]+(-[a-z0-9]+)*)$` | `bugfix`、`class-map`、`3162` |
| feature 用例文件 | `NNNN-<顶层特性>.test.ts` | `^(\d{4})-([A-Z][A-Z0-9_]*)\.test\.ts$` | `0010-MPLS.test.ts` |
| bugfix 用例文件 | `bug_<缺陷号>[_<序号>].test.ts` | — | `bug_3162_1.test.ts` |
| misc 其它用例文件 | `[NNNN-]lower/hyphen.test.ts` | `^(\d{4}-)?[A-Za-z0-9]+([_-][A-Za-z0-9]+)*\.test\.ts$` | `0010-STACK_STANDBY_SYNC_ACL.test.ts` |

要点：

1. **序号为 4 位、步长 10**：`0010`、`0020`…；插入用例可用区间补号（如 `0051`），同目录内唯一即可，允许留空档。
2. **文件后缀统一等于「顶层特性名」**，不把子特性写进文件名：
   - ✅ `test/feature/60-BGP/01-bgp_multiple_instance/0010-BGP.test.ts`
   - ❌ `.../0010-BGP-Multiple-Instance.test.ts`（子特性已由目录表达）
3. **不用千位数字编码子目录**：早期 `1xxx/2xxx` 方案已废弃，统一从 `0010` 起编。
4. 顶层特性编号沿用现有分组，`40-VLAN_MAPPING` 与 `41-VLAN_DOT1Q_TUNNEL` 视为同一 VLAN 特性族（40 为主号、41 为子号），不强制改为 10 的整数倍。
5. **子特性目录可用「类型后缀」**区分功能 / 仅 CLI / 规格等，同一子特性的各类型共用基号；详见 §3。

## 3. 子特性类型后缀（功能 / 仅 CLI / 规格 …）

同一个被测对象往往有多种「测法」：打流验证功能、只下发并校验 CLI 回显、跑规格/容量、跑反向异常等。
「类型」与「被测对象」是**正交**的两个维度，不应各占一级目录（否则目录组合爆炸）。因此约定：

- **被测对象**由二级子特性目录名的主体表达；
- **类型**由主体之后的**后缀**表达，后缀取自下表固定词表。

| 后缀 | 含义 | 是否打流 |
|---|---|---|
| （无） | 功能 / 行为验证 | 是 |
| `_cli` | 仅 CLI：下发配置并校验回显 / 返回值 | 否 |
| `_neg` | 反向 / 异常用例 | 视情况 |
| `_spec` | 规格 / 容量 / 边界 | 视情况 |
| `_perf` | 性能 | 视情况 |

约定：

1. **同一子特性的各类型变体共用同一个基号**，在目录列表中相邻，一眼可见是「同一个东西的不同测法」：

   ```
   30-MPLS/
   ├── 05-mpls_bpdu_ac/        # 功能（打流）
   ├── 05-mpls_bpdu_ac_cli/    # 仅 CLI（同基号 05）
   └── 05-mpls_bpdu_ac_neg/    # 反向（同基号 05）
   ```

2. 后缀必须来自上表词表，**不要自造**；需要新增类型时先在本文登记。
3. 类型后缀的目的是「**按类型批量筛选**」，而不是手工翻目录。CI / Jest 可用 glob（如 `test/feature/.*_cli/.*\.test\.ts$`）或独立 config 一次筛出，因此**不要**用三级目录表达类型。

## 4. 用例标题

`test()` / `it()` 的标题是报告里的可读信息，必须遵守：

- **禁止空标题**：`test("", ...)` 不允许。
- 使用中文陈述句，建议格式：`被测对象 + 条件/动作 + 预期`。
  - ✅ `"接口配置 Storm Control trap action 后，unicast level 到达限速将触发 Rising Trap"`
  - ✅ `"设备支持创建和删除多个BGP实例"`
- 不加 `******`、`一、` 等装饰字符；分组用 `describe("VLAN trunk translate")`。

## 5. 正反例

```
# ✅
test/feature/20-IP_ROUTE/01-ip_route_basic/0010-IP_ROUTE.test.ts
test/feature/30-MPLS/05-mpls_bpdu_ac/0010-MPLS.test.ts       # 功能（打流）
test/feature/30-MPLS/05-mpls_bpdu_ac_cli/0010-MPLS.test.ts   # 仅 CLI（与主体共用基号 05）
test/feature/30-MPLS/06-mpls_spec/0010-MPLS.test.ts          # 规格
test/feature/80-STORM_CONTROL/01-action_shutdown/0010-STORM_CONTROL.test.ts
test/misc/bugfix/3162/bug_3162_1.test.ts

# ❌
test/feature/30-MPLS/01-mpls-baisc/1010-MPLS.test.ts         # 拼写错误 + 千位前缀
test/feature/30-MPLS/05-mpls_bpdu_ac/cli/0010-MPLS.test.ts   # 类型用三级目录表达
test/feature/30-MPLS/07-mpls_bpdu_ac_cli/0010-MPLS.test.ts   # 类型变体未与主体共用基号（应为 05-）
test/feature/60-BGP/01-bgp_multiple_instance/0010-BGP-Multiple-Instance.test.ts
```

## 6. 新增用例检查清单

1. 目录按上表命名，`feature/` 不超过两级；类型变体用**后缀**表达，且与主体**共用基号**（§3）；
2. 文件 `NNNN-<顶层特性>.test.ts`，序号在所属目录内递增；
3. 标题非空且能说明「测什么、期望什么」；
4. 若该用例要被 `config/jest*.cjs` 的 `testRegex` 精确引用，记得同步新增路径；
5. 运行 `npm run check:test-names` 确认无违规。
