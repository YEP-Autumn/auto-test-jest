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
├── demo.test.ts                     # 根级示例（允许）
├── feature/                         # 特性用例
│   └── <NN-FEATURE>/                # 一级：特性
│       ├── <NNNN>-<FEATURE>.test.ts # 直接挂在特性下的用例
│       └── <NN-sub_feature>/        # 二级：子特性（可选）
│           └── <NNNN>-<FEATURE>.test.ts
└── misc/                            # 非特性用例
    ├── bugfix/<缺陷号>/             # 缺陷回归
    └── stack/<模块>/                # 其它归类
```

约束：

- `test/` 下只允许 `feature/`、`misc/` 两类目录（外加根级 `demo.test.ts`）。
- `feature/` 最多两级子目录，**禁止三级目录**。
- 目录不得为空；暂无用例时用 `.gitkeep` 占位（`.gitignore` 已为该文件名放行）。

## 2. 命名规则

| 对象 | 规则 | 正则 | 示例 |
|---|---|---|---|
| 一级特性目录 | `NN-UPPER_SNAKE` | `^\d{2}-[A-Z][A-Z0-9_]*$` | `10-BGP_EVPN_VXLAN`、`30-MPLS` |
| 二级子特性目录 | `NN-lower_snake` | `^\d{2}-[a-z0-9]+(_[a-z0-9]+)*$` | `01-mpls_basic`、`02-ip_route_rnh` |
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

## 3. 用例标题

`test()` / `it()` 的标题是报告里的可读信息，必须遵守：

- **禁止空标题**：`test("", ...)` 不允许。
- 使用中文陈述句，建议格式：`被测对象 + 条件/动作 + 预期`。
  - ✅ `"接口配置 Storm Control trap action 后，unicast level 到达限速将触发 Rising Trap"`
  - ✅ `"设备支持创建和删除多个BGP实例"`
- 不加 `******`、`一、` 等装饰字符；分组用 `describe("VLAN trunk translate")`。

## 4. 正反例

```
# ✅
test/feature/20-IP_ROUTE/01-ip_route_basic/0010-IP_ROUTE.test.ts
test/feature/30-MPLS/06-mpls_bpdu_ac_cli/0010-MPLS.test.ts
test/feature/80-STORM_CONTROL/01-action_shutdown/0010-STORM_CONTROL.test.ts
test/misc/bugfix/3162/bug_3162_1.test.ts

# ❌
test/feature/30-MPLS/01-mpls-baisc/1010-MPLS.test.ts        # 拼写错误 + 千位前缀
test/feature/30-MPLS/05-mpls_bpdu_ac/cli/0010-MPLS.test.ts  # 三级目录
test/feature/60-BGP/01-bgp_multiple_instance/0010-BGP-Multiple-Instance.test.ts
```

## 5. 新增用例检查清单

1. 目录按上表命名，`feature/` 不超过两级；
2. 文件 `NNNN-<顶层特性>.test.ts`，序号在所属目录内递增；
3. 标题非空且能说明「测什么、期望什么」；
4. 若该用例要被 `config/jest*.cjs` 的 `testRegex` 精确引用，记得同步新增路径；
5. 运行 `npm run check:test-names` 确认无违规。
