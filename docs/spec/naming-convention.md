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
│   └── <NN-MODULE>/                      # 一级：UG 章节（如 05-IP_ROUTE）
│       ├── <NN-section>/                 # 二级：UG 小节（如 07-bgp）
│       │   ├── <NNNN>-<MODULE>.test.ts   #   小节直属用例（无子功能时）
│       │   ├── <NN-sub_function>/        #   三级：子功能（如 01-bgp_multiple_instance）
│       │   │   └── <NNNN>-<MODULE>.test.ts
│       │   └── <NN-sub_function>_<type>/ #   三级：同一子功能的类型变体（如 _cli）
│       │       └── <NNNN>-<MODULE>.test.ts
│       └── <NN-section>_<type>/          # 小节无子功能时的类型变体（如 03-ospf_cli）
│           └── <NNNN>-<MODULE>.test.ts
└── misc/                                 # 非特性用例
    ├── bugfix/<缺陷号>/                  # 缺陷回归
    └── stack/<模块>/                     # 其它归类
```

约束：

- `test/` 下只允许 `feature/`、`misc/` 两类目录（外加根级 `demo.test.ts`）。
- `feature/` **建议最多三层**：模块 → UG 小节 → 子功能；脚本对更深层级只提示、不报错。
- **容器不放用例**：有子目录的目录只做分组（如 `07-bgp/`），用例放在叶子目录。
- **类型后缀加在叶子上**：`_cli` / `_neg` / `_spec` / `_perf` 与其功能主体同级、共用基号（见 §3）。
- 空目录建议用 `.gitkeep` 占位（`.gitignore` 已放行）；脚本仅提示，不阻断。

## 2. 命名规则

| 对象 | 规则 | 正则 | 示例 |
|---|---|---|---|
| 一级特性目录 | `NN-UPPER_SNAKE` | `^\d{2}-[A-Z][A-Z0-9_]*$` | `03-ETHERNET`、`19-MPLS` |
| 二级小节目录 | `NN-lower_snake[_type]` | `^\d{2}-[a-z0-9]+(_[a-z0-9]+)*$` | `07-bgp`、`03-ospf_cli` |
| 三级子功能目录 | `NN-lower_snake[_type]` | 同上 | `01-bgp_multiple_instance`、`05-mpls_bpdu_ac_spec` |
| misc 目录 | 小写单词（可连字符）或缺陷号 | `^(\d+\|[a-z0-9]+(-[a-z0-9]+)*)$` | `bugfix`、`class-map`、`3162` |
| feature 用例文件 | `NNNN-<顶层特性>.test.ts` | `^(\d{4})-([A-Z][A-Z0-9_]*)\.test\.ts$` | `0010-MPLS.test.ts` |
| bugfix 用例文件 | `bug_<缺陷号>[_<序号>].test.ts` | — | `bug_3162_1.test.ts` |
| misc 其它用例文件 | `[NNNN-]lower/hyphen.test.ts` | `^(\d{4}-)?[A-Za-z0-9]+([_-][A-Za-z0-9]+)*\.test\.ts$` | `0010-STACK_STANDBY_SYNC_ACL.test.ts` |

要点：

1. **序号为 4 位、步长 10**：`0010`、`0020`…；插入用例可用区间补号（如 `0051`），同目录内唯一即可，允许留空档。
2. **文件后缀统一等于「顶层特性名」**，不把子功能写进文件名：
   - ✅ `test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0010-IP_ROUTE.test.ts`
   - ❌ `.../0010-BGP-Multiple-Instance.test.ts`（子功能已由目录表达）
3. **编号沿用《E530 配置指导》**：一级模块号 = UG 章号（`02`…`20`），二级小节目号 = UG 小节号（如 `5.7` → `07-bgp`）；三级子功能在小节内重新从 `01` 编号。
4. 一级模块的 **19 个有效章节**与全部二级子模块以 [`config/test-module-map.json`](../../config/test-module-map.json) 为唯一事实来源，目录由 `script/scaffold-test-modules.js` 生成，不要手工新开模块。
5. **类型后缀加在叶子目录上**：功能 / 仅 CLI / 规格等用后缀区分，层级由“模块 → 小节 → 子功能”决定；详见 §3。

## 3. 子特性类型后缀（功能 / 仅 CLI / 规格 …）

同一个被测对象往往有多种「测法」：打流验证功能、只下发并校验 CLI 回显、跑规格/容量、跑反向异常等。
「类型」与「被测对象」是**正交**的两个维度，不应各占一级目录（否则目录组合爆炸）。因此约定：

- **被测对象**由叶子目录（二级小节或三级子功能）名的主体表达；
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
   19-MPLS/02-mpls/
   ├── 05-mpls_bpdu_ac/        # 功能（打流）
   ├── 05-mpls_bpdu_ac_cli/    # 仅 CLI（同基号 05）
   └── 05-mpls_bpdu_ac_spec/   # 规格（同基号 05）
   ```

2. 后缀必须来自上表词表，**不要自造**；需要新增类型时先在本文登记。
3. 类型后缀的目的是「**按类型批量筛选**」，而不是手工翻目录。CI / Jest 可用 glob（如 `**/*_cli/**/*.test.ts`）或独立 config 一次筛出。
4. **同一被测对象的类型变体建议共用基号**，只是为了目录排序时相邻；脚本不再强制校验这一点。

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
test/feature/05-IP_ROUTE/01-ip_unicast_route/02-ip_route_rnh/0010-IP_ROUTE.test.ts
test/feature/05-IP_ROUTE/07-bgp/01-bgp_multiple_instance/0010-IP_ROUTE.test.ts
test/feature/19-MPLS/02-mpls/01-mpls_basic/0010-MPLS.test.ts          # 功能（打流）
test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac_cli/0010-MPLS.test.ts    # 仅 CLI（同基号 05）
test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac_spec/0010-MPLS.test.ts   # 规格（同基号 05）
test/feature/03-ETHERNET/12-storm_control/02-action_trap/0010-ETHERNET.test.ts
test/misc/bugfix/3162/bug_3162_1.test.ts

# ❌
test/feature/19-MPLS/02-mpls/0010-MPLS.test.ts                # 小节下已有子功能，容器不放直属用例
test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac/cli/0010-MPLS.test.ts   # 类型再开一层，应为 _cli 后缀
test/feature/19-MPLS/01-mpls-baisc/1010-MPLS.test.ts          # 拼写错误 + 千位前缀
test/feature/05-IP_ROUTE/07-bgp/0010-BGP-Multiple-Instance.test.ts
```

## 6. 新增用例检查清单

1. 目录按上表命名：模块 → UG 小节 → 子功能（可选）；有子目录的容器不放直属用例（§1）；
2. 类型变体用**后缀**表达（`_cli` 等），加在叶子目录上（§3）；
3. 文件 `NNNN-<顶层特性>.test.ts`，序号在所属目录内递增；
4. 标题非空且能说明「测什么、期望什么」；
5. 若该用例要被 `config/jest*.cjs` 的 `testRegex` 精确引用，记得同步新增路径；
6. 运行 `npm run check:test-names` 确认无违规（层级、基号、空目录只提示）。

## 7. 模块树生成与迁移

- 模块/子模块清单：[`config/test-module-map.json`](../../config/test-module-map.json)（19 个 UG 章节 + 149 个二级小节；小节可用 `children` 定义三级子功能，`types` 决定要生成哪些类型变体）。
- 生成目录：
  ```shell
  node script/scaffold-test-modules.js           # dry-run
  node script/scaffold-test-modules.js --write   # 创建容器/叶子目录与 .gitkeep
  node script/scaffold-test-modules.js --check   # CI：目录与 map 不一致则退出 1
  ```
- 旧路径迁移（两步，均已执行，保留作追溯）：
  1. [`config/test-migration-map.json`](../../config/test-migration-map.json) → `script/migrate-test-modules.js`：旧目录归入 UG 小节；
  2. [`config/test-split-map.json`](../../config/test-split-map.json) → `script/split-test-submodules.js`：小节按子功能下沉一层。
- 新增子模块时：先改 `test-module-map.json` → `scaffold --write` → 再写用例。

> 校验脚本只强校验「目录/文件命名、文件后缀、misc 命名」等关键规则；
> 层级深度、类型基号、空目录属于最佳实践提示，不作为 CI 失败项。
