# 提交信息（Commit Message）规范

本文约定本仓库 commit message 的写法。目标：

- 清晰呈现改动类型、影响范围与影响程度，便于评审与回溯；
- 支持 `git log --oneline`、changelog、`git blame` 等按类型/scope 过滤；
- 保持与现有历史一致，提交信息包含有效信息。

本规范基于 [Conventional Commits 1.0.0](https://www.conventionalcommits.org/zh-hans/v1.0.0/)，并结合本仓库实际使用的类型与 scope。

校验脚本：[`script/check-commit-msg.js`](../../script/check-commit-msg.js)（零依赖，与 `check:test-names` 同风格）

```shell
node script/check-commit-msg.js            # 校验最近一条提交
npm run check:commit-msg                   # 同上
npm run hooks:install                      # 安装 git hook（npm install 时自动执行）
```

安装后，`git commit` 由 commit-msg hook 自动校验；不符合规范的提交将被拒绝。

## 1. 基本格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

- `type`、`scope`、`subject` 为必填；`body`、`footer` 按需。
- 整条消息用 **UTF-8 中文**书写（专有名词、代码标识、路径保持英文原文）。
- `type` 与 `scope` 用 **英文小写**，`subject` 用中文。

### 1.1 单行示例

```
refactor(test): import 统一改为 @/utils 顶层路径
feat(test): 新增 thrift 代码生成脚本与 static route recursive-lookup 用例
chore(config): 支持 @/ 顶层路径别名
docs(test): 新增测试用例命名规范
```

### 1.2 带 body 示例

```
refactor(config): topo 后端地址与 auto-test-topo 名称统一抽到 config.ts

- config.ts 新增 TopoBackendConfig，集中维护 topo 后端 IP/端口/账号
- topo-backend-api.ts 改用 TopoBackendConfig，登录走完整 loginURL
- Config 新增 defaultTopoName 常量，test-helper 不再硬编码 "auto-test-topo"
```

## 2. type（提交类型）

| type | 含义 | 典型场景 |
|---|---|---|
| `feat` | 新增功能 | 新用例、新脚本、新的可复用能力 |
| `fix` | 修复缺陷 | 用例断言错误、脚本缺陷、配置错误导致执行失败 |
| `refactor` | 重构 | 行为不变的结构调整：目录/文件重命名、抽配置、消除重复 |
| `docs` | 仅文档变更 | `README.md`、`docs/**`、注释文档 |
| `chore` | 杂项维护 | 构建/依赖/配置/占位文件等不影响功能的改动 |
| `test` | 测试本身增删改 | 用例与测试辅助代码的调整（也可并入上面的 `feat/fix/refactor` 的 scope，见 §4） |
| `style` | 纯格式 | Prettier 格式化、空白、分号，不影响逻辑 |
| `perf` | 性能优化 | 用例执行变快、脚本耗时下降 |
| `revert` | 回滚 | 回滚某次提交，body 中注明被回滚的 commit hash |

选择原则：

- **优先按改动意图选择类型，文件类型作为辅助判断**：修改测试用例且目标为修复缺陷时，使用 `fix`。
- 一次提交仅包含一类改动。功能改动与格式化操作应拆分为两个提交。
- 有破坏性变更时，在 type 后加 `!`，如 `refactor(config)!: 重命名 config 导出`，并在 footer 写 `BREAKING CHANGE: ...`。
- 提交信息应包含有效信息；`update`、`update some file`、`修改`、`.`、`wip` 等无信息量写法不作为提交信息。

## 3. scope（影响范围）

scope 表示改动所在的模块或范围，用小写、可带连字符（如 `test-helper`）。本仓库常用 scope：

| scope | 覆盖范围 |
|---|---|
| `test` | `test/**` 用例目录与用例文件 |
| `test-helper` | `utils/test-helper.ts` 等测试辅助封装 |
| `config` | `config/**`、`jest.config.cjs`、`tsconfig.json`、`package.json` 中的配置 |
| `script` | `script/**` 工具脚本（代码生成、用例校验等） |
| `topo` | `utils/` 下拓扑定义与 topo 后端接口 |
| `stream` | stream 后端接口相关 |
| `utils` | `utils/` 下其它通用能力 |
| `docs` | `docs/**`、`README.md` |
| `deps` | 依赖升级、增删（配合 `chore`） |
| `ci` | CI/CD 流程与流水线配置 |

规则：

- 优先使用具体 scope；仅当改动无法归类时，使用无 scope 的 `chore: ...`。
- 改动横跨多个模块时，选择**主要影响面**作为 scope；若无法明确归类，可省略 scope，并在正文说明原因。
- 新增 scope 时，同步登记到本文表格，保持 scope 命名一致。

## 4. subject（标题行）

- 标题行概括**改动内容**；实现细节写入 body。
- 采用**中文陈述句**，使用动宾或主谓结构，例如：`统一 VLAN DOT1Q TUNNEL 用例文件名`、`为空目录添加 .gitkeep 占位`。
- 标题行末尾不使用句号；选择具体、有信息量的词汇。
  - ✅ `补充 STORM_CONTROL trap action 用例`
  - 信息量不足的示例：`优化代码`、`修改了一些东西`
- 长度建议 ≤ 50 个字符（中文按 1 计），确保 `git log --oneline` 输出不折行。
- 需要限定范围时写明对象，例如「MPLS 用例文件名」。

## 5. body（正文）

- 标题不足以说明改动原因时，body 必填；纯机械改动可省略。
- 每行以 `-` 开头列点，一行一条，写明**改动动机与影响范围**，文件清单作为辅助信息。
- 涉及批量改动时给出量化信息与边界，例如：

```
- 860 处相对 import (`../..` 逐级) 改为 @/utils，覆盖 test/ 与 docs/ 教程用例
- 修复因目录层级变化而失效的 18 处 import
```

- 说明改动原因，便于后续维护人员判断可复原性与可扩展性。
- 引用 issue / 用例编号时用 `#` 或路径，如 `#3162`、`docs/spec/naming-convention.md`。

## 6. footer（页脚）

- 关联 issue：`Refs: #3162`、`Closes: #3162`。
- 破坏性变更：`BREAKING CHANGE: 说明影响与迁移方式`。
- 共同作者：`Co-authored-by: name <email>`。

## 7. 提交粒度与拆分

1. **一次提交解决一个问题**，可独立回滚、独立评审。
2. 批量重命名与批量内容修改分开提交：先执行重命名（`refactor`），再修改内容（`fix/feat`），便于阅读历史记录。
3. 生成代码与生成脚本一起提交（如 thrift 生成物），确保可复现。
4. 本地临时改动保留在工作区，不纳入提交（见 `docs/local-setup.md` 的 `skip-worktree` 用法）。
5. 提交前确认已有用例保持通过；CI 相关改动（如 `check:test-names`）应能通过。

## 8. 完整示例

```
fix(config): 修正 example 套件的用例路径

教程文件实际位于 docs/test_script_tutorials/，此前 suites/example.json
误写成 test/test_script_tutorials/，导致 npm run example 无法匹配用例。

- 修正 config/suites/example.json 的 include
- 本地执行 npm run example 验证可正常发现用例

Refs: docs/spec/naming-convention.md
```

```
feat(test): 新增 thrift 代码生成脚本与 static route recursive-lookup 用例

- script/gen-thrift.js 按 idl 生成 utils/rpc 下代码，支持 --force 覆盖
- 新增 recursive-lookup 用例，覆盖下一跳递归解析场景
- package.json 增加 gen / pretest 钩子，保证用例执行前代码已生成
```

## 9. 提交前检查清单

1. `<type>(<scope>): <中文标题>` 格式正确，type 属于 §2 表格；
2. scope 可归类，新增 scope 已登记到 §3；
3. 标题写明改动内容，标题行末尾不使用句号，词汇具体且有信息量；
4. 仅包含一类改动，可独立回滚；
5. 涉及改动原因或批量改动时，body 已列点说明；
6. 有破坏性变更时已加 `!` 与 `BREAKING CHANGE`；
7. 提交信息包含有效内容，`update some file`、`wip` 等写法不作为提交信息；
8. 运行 `npm run check:commit-msg` 或依赖 commit-msg hook 自动校验通过。

## 10. 自动校验说明

- `type` 必须属于 §2；`scope` 必须属于 §3，新增 scope 需同步登记到本文档与
  [`script/check-commit-msg.js`](../../script/check-commit-msg.js) 的 `SCOPES`。
- `Merge` / `Revert` / `fixup!` / `squash!` / `Initial commit` 开头的消息自动放行。
- 标题过长（>50 字）、缺少中文、`chore` 缺 scope 等情况仅**提醒，不阻断提交**；格式错误、未知类型的
  type/scope、标题信息量不足、结尾带标点、标题与正文未空行等情况将**阻断提交**。
- 校验最近一条提交：`npm run check:commit-msg`；CI 中用 `--range <base>..<head>` 校验整个 PR，
  接入方式见 [CI 集成说明](./ci.md)。
