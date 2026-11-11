# CI 集成说明

本文说明本仓库 CI 门禁的搭建与扩展方法，配套实现见
[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)。

## 1. 设备用例由自托管 runner 执行

本仓库的 `test/feature/**` 用例通过 `TestHelper` 连接真实 DUT / 拓扑后端
（`utils/test-helper.ts`；具体执行的用例由 `config/jest.<profile>-<suite>.config.cjs`
对应的 `profiles/`、`suites/` JSON 决定），需要真实网络与设备条件。GitHub 托管 runner
提供离线环境，适合承载静态检查。

GitHub Actions 承载两类**离线可判定**的检查：

| Job | 内容 | 触发 | 是否阻断 |
|---|---|---|---|
| `commit-msg` | 提交信息规范（`docs/spec/commit-convention.md`） | push / PR | 是 |
| `static-checks` | 命名规范、TypeScript 类型检查、thrift 生成可复现 | push / PR | 是 |

设备用例由**自托管 runner** 执行（见 §5）。

## 2. 关键前置：`utils/rpc/gen-nodejs` 是生成物

`utils/rpc/gen-nodejs/packet_types.js` 由 `script/gen-thrift.js` 生成，且被
`utils/rpc/.gitignore` 的 `gen-*` 规则忽略。全新 clone 上它不存在，会导致：

- `tsc` 报 `Cannot find module '../rpc/gen-nodejs/packet_types'`；
- Jest 运行时同样报模块缺失。

因此 CI 应先安装 Thrift 编译器，再执行 `npm ci`（`postinstall` 会自动触发生成）：

```yaml
- run: sudo apt-get update && sudo apt-get install -y thrift-compiler
- run: npm ci
- run: test -f utils/rpc/gen-nodejs/packet_types.js
```

> 若所在环境无法装系统包，可改为 `npm ci --ignore-scripts`，并把预生成的
> `gen-nodejs` 作为构建产物缓存/传递，但需保证与 `utils/rpc/thrift/packet.thrift` 版本一致。

## 3. 提交信息校验的区间选择

`script/check-commit-msg.js` 支持 `--range <rev-range>`，一次校验区间内**全部**提交：

```bash
node script/check-commit-msg.js --range origin/main..HEAD
```

workflow 中按事件类型取区间，降低漏检与误检风险：

| 事件 | 区间 | 说明 |
|---|---|---|
| `pull_request` | `github.event.pull_request.base.sha..github.sha` | 校验 PR 内所有新提交 |
| `push` | `github.event.before..github.sha` | 校验本次推送的新提交 |
| 首次 push（`before` 全 0） | `HEAD~1..HEAD` | 仅校验最新一条提交，减少历史记录干扰 |

要点：

- PR 校验需要完整历史，checkout 必须 `fetch-depth: 0`。
- `Merge ...` / `Revert ...` / `fixup!` / `squash!` 开头的消息脚本会自动跳过，
  GitHub 的 "Update branch" 合并提交不会误报。
- 标题过长、无中文、`chore` 缺 scope 仅**提醒**，不阻断 CI。

## 4. 本地等价命令

提交前可在本地执行一次，与 CI 保持一致：

```bash
npm run check                   # 本地全量：命名 + 模块树 + 套件清单/覆盖 + 类型检查
npm run check:test-names        # 测试用例命名规范
npm run check:test-modules      # test/feature 目录树与 test-module-map.json 一致
npm run check:jest-suites       # profiles/suites 可展开、test/feature 全覆盖
npm run typecheck               # tsc --noEmit
npm run check:commit-msg        # 校验最近一条提交
npm run hooks:install           # 安装 commit-msg / pre-commit hook（npm install 时也会自动装）
```

> CI 的 `static-checks` 目前执行命名规范与 `tsc` 检查；`npm run check` 是其超集，
> 额外包含模块树与套件清单校验。这两项暂未接入 CI。

`npm install` 后 `prepare` 会自动执行 `hooks:install`，之后 `git commit` 会依次经过：

| hook | 校验内容 | 对应 CI |
|---|---|---|
| `pre-commit` | `script/check-test-names.js`；`tsc --noEmit`（`utils/rpc/gen-nodejs` 缺失时提示并跳过） | `static-checks` |
| `commit-msg` | `script/check-commit-msg.js` | `commit-msg` |

即提交前即可发现命名/类型问题，减少对 CI 结果的依赖。**新增的 CI 离线检查项应同步加进
`script/git-hooks/pre-commit`**，保持本地与 CI 一致。

跳过校验的方式：`git commit --no-verify`（跳过全部校验）或 `SKIP_TYPECHECK=1 git commit ...`（仅跳过类型检查）。

## 5. 扩展：把设备用例接入自托管 runner

准备一台能访问 DUT 与拓扑后端的机器，注册为 self-hosted runner，打上标签（如 `dut`），
再补一个 job：

```yaml
  device-tests:
    name: device tests
    if: github.event_name == 'workflow_dispatch'
    runs-on: [self-hosted, dut]
    steps:
      - uses: actions/checkout@v4

      - name: 准备设备连接配置
        run: |
          cat > .env <<'EOF'
          ${{ secrets.DUT_ENV }}
          EOF

      - name: 安装依赖
        run: npm ci

      - name: 生成 Thrift 代码
        run: npm run gen

      - name: 执行用例
        run: npm run default   # 按设备实际 profile 换成 npm run ipv6 / npm run mpls

      - name: 上传测试报告
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-report
          path: test-report/
```

要点：

- 设备地址与账号的取值保存在 `secrets`（`DUT_ENV`）中，仓库仅保留变量名；`jest.setup.ts` 读取的
  `ENV_FILE` 指向仓库根 `.env`，而 `.env` 已被 `.gitignore` 忽略。
- 设备用例耗时长且有状态，建议用 `workflow_dispatch` 或 nightly 定时触发，
  仅在需要设备环境时触发。
- 失败时上传 `test-report/`（`jest-html-reporter` 产物）与 `jest-junit` 结果便于定位。
- 用例执行有先后依赖（`script/jest.sequencer.js`、`maxWorkers: 1`），自托管 runner
  同一时间仅运行一个设备用例任务，必要时限制 `concurrency`。

## 6. 常见问题

| 现象 | 原因 / 处理 |
|---|---|
| `无法执行 thrift 命令` | 未装 `thrift-compiler`；`apt-get install -y thrift-compiler` |
| `Cannot find module '../rpc/gen-nodejs/packet_types'` | 未执行代码生成；运行 `npm run gen`，或检查 `postinstall` 是否被 `--ignore-scripts` 跳过 |
| PR 仅校验一条提交 | checkout 未设 `fetch-depth: 0` |
| `Merge branch ...` 报错 | 预期不会发生；脚本已跳过自动生成消息，若仍报错，检查消息是否被改写 |
| 新增 scope 被 CI 拒绝 | 先登记到 `docs/spec/commit-convention.md` §3 与 `script/check-commit-msg.js` 的 `SCOPES` |
