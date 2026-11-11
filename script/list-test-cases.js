#!/usr/bin/env node
/**
 * 列出仓库内所有测试用例（静态解析，不连接设备、不执行 Jest）。
 *
 * 用法：
 *   node script/list-test-cases.js                          # 全部用例，文本列表
 *   node script/list-test-cases.js --json                   # JSON
 *   node script/list-test-cases.js --csv --out cases.csv    # CSV 文件
 *   node script/list-test-cases.js --md --out cases.md      # Markdown 文件
 *   node script/list-test-cases.js --files                  # 只列用例文件
 *   node script/list-test-cases.js --profile default --suite regression
 *   node script/list-test-cases.js --status skip,failing    # 只看指定状态
 *
 * 说明：
 *   - 解析 test/ 与 docs/ 下的 *.test.ts，识别 describe / test / it 及其
 *     .skip / .only / .todo / .failing 等修饰符；
 *   - 按一级模块分组（test/feature/03-ETHERNET、test/misc/bugfix 等），模块标题
 *     取自 config/test-module-map.json；JSON / CSV 同时保留子模块路径；
 *   - --profile + --suite 复用 config/ 下的 include/exclude 规则，只列该组合会执行的用例；
 *   - 静态解析拿不到 test.each 展开后的运行时参数，只输出模板名称。
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const { resolveSpec, globToRegExp } = require("../config/jest.base.cjs");

const ROOT = path.resolve(__dirname, "..");
const SCAN_ROOTS = ["test", "docs"];
const SKIP_DIRS = new Set(["node_modules", ".git", "test-report", "coverage"]);
const MODULE_MAP_FILE = path.join(ROOT, "config", "test-module-map.json");

const KNOWN_FORMATS = new Set(["text", "json", "csv", "md"]);
const STATUS_ORDER = ["active", "only", "skip", "todo", "failing"];

// 只有一级模块来自 config/test-module-map.json；其它根目录使用固定/目录名作为模块。
const MISC_MODULE_TITLES = {
  bugfix: "缺陷回归",
  stack: "堆叠场景",
};
const DOC_MODULE_TITLES = {
  test_script_tutorials: "教程示例",
};

// ---------- 参数 ----------

function parseArgs(argv) {
  const options = {
    format: "text",
    out: null,
    profile: null,
    suite: null,
    filesOnly: false,
    statuses: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--json":
        options.format = "json";
        break;
      case "--csv":
        options.format = "csv";
        break;
      case "--md":
      case "--markdown":
        options.format = "md";
        break;
      case "--text":
        options.format = "text";
        break;
      case "--format":
        options.format = argv[++i];
        break;
      case "--out":
      case "-o":
        options.out = argv[++i];
        break;
      case "--profile":
        options.profile = argv[++i];
        break;
      case "--suite":
        options.suite = argv[++i];
        break;
      case "--files":
        options.filesOnly = true;
        break;
      case "--status":
        options.statuses = String(argv[++i] || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      default:
        throw new Error(`未知参数：${arg}`);
    }
  }

  if (!KNOWN_FORMATS.has(options.format)) {
    throw new Error(
      `未知输出格式：${options.format}（可选 text / json / csv / md）`,
    );
  }
  if (Boolean(options.profile) !== Boolean(options.suite)) {
    throw new Error("--profile 与 --suite 必须同时提供");
  }
  if (options.statuses) {
    const unknown = options.statuses.filter((s) => !STATUS_ORDER.includes(s));
    if (unknown.length > 0) {
      throw new Error(
        `未知状态：${unknown.join(", ")}（可选 ${STATUS_ORDER.join(" / ")}）`,
      );
    }
  }

  return options;
}

function usage() {
  console.log(`用法：node script/list-test-cases.js [选项]

选项：
  --json | --csv | --md | --text   输出格式（默认 text）
  --format <text|json|csv|md>      同上
  -o, --out <文件>                 写入文件；缺省输出到 stdout
  --profile <名字> --suite <名字>  按 config/ 下的 profile × suite 过滤
  --status <状态,...>              active / only / skip / todo / failing
  --files                          只列出用例文件（不分组）
  -h, --help                       显示帮助

说明：text / md 按一级模块分组；json 含 modules 与每条用例的 module；
csv 含 moduleKind / moduleId / moduleTitle / modulePath 列。`);
}

// ---------- 模块 ----------

function loadModuleMap() {
  try {
    const data = JSON.parse(fs.readFileSync(MODULE_MAP_FILE, "utf8"));
    return new Map((data.modules || []).map((module) => [module.id, module]));
  } catch {
    // 缺少模块表时仍可按目录名输出，不阻断清单生成。
    return new Map();
  }
}

const MODULE_MAP = loadModuleMap();

function makeModule({ key, kind, id, title, hierarchy }) {
  return {
    key,
    kind,
    id,
    title,
    label: `${id} ${title}`,
    hierarchy,
    modulePath: hierarchy.map((item) => item.title).join(" / "),
    submoduleId: hierarchy[1] ? hierarchy[1].id : "",
    submoduleTitle: hierarchy[1] ? hierarchy[1].title : "",
    submodulePath: hierarchy
      .slice(1)
      .map((item) => item.title)
      .join(" / "),
  };
}

/**
 * 从用例路径推导模块：一级模块取目录（如 test/feature/03-ETHERNET），
 * 模块标题来自 config/test-module-map.json；子模块标题也按同一份模块树解析。
 */
function resolveModule(relPath) {
  const parts = relPath.split("/");
  const dirs = parts.slice(0, -1);

  if (dirs[0] === "test" && dirs[1] === "feature") {
    const id = dirs[2] || "feature";
    const meta = MODULE_MAP.get(id);
    const hierarchy = [{ id, title: (meta && meta.title) || id }];

    let children = (meta && meta.submodules) || [];
    for (const dir of dirs.slice(3)) {
      const hit = children.find((item) => item.id === dir);
      hierarchy.push({ id: dir, title: (hit && hit.title) || dir });
      children = (hit && hit.children) || [];
    }

    return makeModule({
      key: `feature:${id}`,
      kind: "feature",
      id,
      title: hierarchy[0].title,
      hierarchy,
    });
  }

  if (dirs[0] === "test" && dirs[1] === "misc") {
    const id = dirs[2] || "misc";
    const title = MISC_MODULE_TITLES[id] || id;
    const hierarchy = [{ id, title }];
    for (const dir of dirs.slice(3)) hierarchy.push({ id: dir, title: dir });
    return makeModule({
      key: `misc:${id}`,
      kind: "misc",
      id: `misc/${id}`,
      title,
      hierarchy,
    });
  }

  if (dirs[0] === "docs") {
    const id = dirs[1] || "docs";
    const title = DOC_MODULE_TITLES[id] || id;
    const hierarchy = [{ id, title }];
    for (const dir of dirs.slice(2)) hierarchy.push({ id: dir, title: dir });
    return makeModule({
      key: `docs:${id}`,
      kind: "docs",
      id: `docs/${id}`,
      title,
      hierarchy,
    });
  }

  const id = dirs.join("/") || "root";
  return makeModule({
    key: `root:${id}`,
    kind: "root",
    id,
    title: "根级用例",
    hierarchy: [{ id, title: "根级用例" }],
  });
}

function groupByModule(cases) {
  const groups = new Map();

  for (const item of cases) {
    let group = groups.get(item.module.key);
    if (!group) {
      group = { module: item.module, files: new Set(), cases: [] };
      groups.set(item.module.key, group);
    }
    group.files.add(item.file);
    group.cases.push(item);
  }

  return Array.from(groups.values()).map((group) => {
    const byStatus = statusCounts(group.cases);
    const module = group.module;
    return {
      // 分组只保留一级模块信息；子模块路径随每条用例变化，放在 case.module 中。
      module: {
        key: module.key,
        kind: module.kind,
        id: module.id,
        title: module.title,
        label: module.label,
      },
      files: Array.from(group.files),
      cases: group.cases,
      byStatus,
    };
  });
}

function statusCounts(cases) {
  const byStatus = {};
  for (const status of STATUS_ORDER) {
    const count = cases.filter((item) => item.status === status).length;
    if (count > 0) byStatus[status] = count;
  }
  return byStatus;
}

// ---------- 文件遍历 ----------

/** 按模块树路径自然排序，与 script/jest.sequencer.js 保持一致。 */
function compareSegment(a, b) {
  if (a === b) return 0;
  const numA = a.match(/^(\d+)/);
  const numB = b.match(/^(\d+)/);
  if (numA && numB) {
    const diff = Number(numA[1]) - Number(numB[1]);
    if (diff !== 0) return diff;
  }
  return a < b ? -1 : 1;
}

function comparePath(a, b) {
  const left = a.split("/");
  const right = b.split("/");
  const len = Math.min(left.length, right.length);
  for (let i = 0; i < len; i++) {
    const diff = compareSegment(left[i], right[i]);
    if (diff !== 0) return diff;
  }
  return left.length - right.length;
}

function walkTestFiles(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      walkTestFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith(".test.ts")) {
      out.push(path.relative(ROOT, full).split(path.sep).join("/"));
    }
  }
}

function collectAllTestFiles() {
  const files = [];
  for (const dir of SCAN_ROOTS) walkTestFiles(path.join(ROOT, dir), files);
  return dedupe(files).sort(comparePath);
}

function dedupe(list) {
  return Array.from(new Set(list));
}

/** 按 profile × suite 的 include / exclude 过滤（与 Jest 配置语义一致）。 */
function filterBySpec(files, profile, suite) {
  const spec = resolveSpec({ profile, suite });
  const includes = spec.include.map((glob) => new RegExp(globToRegExp(glob)));
  const excludes = spec.exclude.map((glob) => new RegExp(globToRegExp(glob)));
  return files.filter(
    (file) =>
      includes.some((re) => re.test(file)) &&
      !excludes.some((re) => re.test(file)),
  );
}

// ---------- 解析 ----------

function getCalleeInfo(callee) {
  const modifiers = [];
  let current = callee;

  while (true) {
    if (ts.isIdentifier(current)) {
      return {
        name: current.text,
        modifiers,
        each: modifiers.includes("each"),
      };
    }
    if (ts.isPropertyAccessExpression(current)) {
      modifiers.unshift(current.name.text);
      current = current.expression;
      continue;
    }
    if (ts.isCallExpression(current)) {
      // test.each(...)(name, fn) / describe.each(...)(name, fn)
      modifiers.unshift("each");
      current = current.expression;
      continue;
    }
    return null;
  }
}

function literalName(node, sourceFile) {
  if (!node) return "<未命名>";
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text.trim() ? node.text : "<未命名>";
  }
  return `<动态名称：${node.getText(sourceFile).replace(/\s+/g, " ")}>`;
}

function statusOf(modifiers) {
  if (modifiers.includes("only")) return "only";
  if (modifiers.includes("skip")) return "skip";
  if (modifiers.includes("todo")) return "todo";
  if (modifiers.includes("failing")) return "failing";
  return "active";
}

function isTestFunction(name) {
  return name === "test" || name === "it" || name === "fit" || name === "xit";
}

function isDescribeFunction(name) {
  return name === "describe" || name === "fdescribe" || name === "xdescribe";
}

function parseTestFile(relPath) {
  const absPath = path.join(ROOT, relPath);
  const source = fs.readFileSync(absPath, "utf8");
  const sourceFile = ts.createSourceFile(
    absPath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const cases = [];

  function visit(node, describeStack) {
    if (ts.isCallExpression(node)) {
      const info = getCalleeInfo(node.expression);
      if (info && isTestFunction(info.name)) {
        const modifiers = [...info.modifiers];
        if (info.name === "fit") modifiers.push("only");
        if (info.name === "xit") modifiers.push("skip");

        const nameNode = node.arguments[0];
        const name = literalName(nameNode, sourceFile);
        const position = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(sourceFile),
        );
        const describes = describeStack.map((item) => item.name);
        const focusedByAncestor = describeStack.some((item) => item.only);
        const skippedByAncestor = describeStack.some((item) => item.skipped);

        let status = statusOf(modifiers);
        if (status === "active" && skippedByAncestor) status = "skip";
        else if (status === "active" && focusedByAncestor) status = "only";

        cases.push({
          file: relPath,
          line: position.line + 1,
          column: position.character + 1,
          kind: info.name === "it" ? "it" : "test",
          status,
          name,
          fullName: [...describes, name].join(" > "),
          describe: describes,
          each: info.each,
          focusedByAncestor,
          skippedByAncestor,
        });
        return;
      }

      if (info && isDescribeFunction(info.name)) {
        const focused =
          info.name === "fdescribe" || info.modifiers.includes("only");
        const skipped =
          info.name === "xdescribe" || info.modifiers.includes("skip");
        const nextStack = [
          ...describeStack,
          {
            name: literalName(node.arguments[0], sourceFile),
            only: focused,
            skipped,
          },
        ];

        for (const arg of node.arguments) {
          if (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)) {
            visit(arg.body, nextStack);
          } else {
            visit(arg, nextStack);
          }
        }
        return;
      }
    }

    ts.forEachChild(node, (child) => visit(child, describeStack));
  }

  visit(sourceFile, []);

  // 静态解析可能漏掉某些动态注册方式，至少让调用方知道文件存在但没有识别到用例。
  const hasParseErrors = Boolean(
    sourceFile.parseDiagnostics && sourceFile.parseDiagnostics.length > 0,
  );

  return {
    file: relPath,
    cases,
    parseErrors: hasParseErrors
      ? sourceFile.parseDiagnostics.map((d) =>
          ts.flattenDiagnosticMessageText(d.messageText, " "),
        )
      : [],
  };
}

function collectCases(files, statuses) {
  const results = [];
  const emptyFiles = [];
  const parseErrorFiles = [];

  for (const file of files) {
    const parsed = parseTestFile(file);
    if (parsed.parseErrors.length > 0)
      parseErrorFiles.push({ file, errors: parsed.parseErrors });
    const matched = statuses
      ? parsed.cases.filter((item) => statuses.includes(item.status))
      : parsed.cases;
    if (parsed.cases.length === 0) emptyFiles.push(file);

    const module = resolveModule(file);
    for (const item of matched) item.module = module;
    results.push(...matched);
  }

  return { cases: results, emptyFiles, parseErrorFiles };
}

// ---------- 输出 ----------

function summarize(cases, files, groups) {
  const byStatus = statusCounts(cases);
  const matchedFiles = new Set(cases.map((item) => item.file)).size;
  return {
    files: files.length,
    matchedFiles,
    cases: cases.length,
    modules: groups.length,
    byStatus,
  };
}

function statusBreakdown(byStatus) {
  return STATUS_ORDER.filter((status) => byStatus[status])
    .map((status) => `${status} ${byStatus[status]}`)
    .join(" / ");
}

function scopeLabel(options) {
  if (options.profile && options.suite)
    return `${options.profile} / ${options.suite}`;
  return "全部（test/、docs/）";
}

function renderText(files, summary, options, meta, groups) {
  const lines = [
    "# 测试用例列表",
    `# 生成时间：${meta.generatedAt}`,
    `# 范围：${scopeLabel(options)}`,
    `# 文件：${summary.files}${summary.matchedFiles !== summary.files ? `（命中 ${summary.matchedFiles}）` : ""}  用例：${summary.cases}  模块：${summary.modules}`,
  ];
  const breakdown = statusBreakdown(summary.byStatus);
  if (breakdown) lines.push(`# 状态：${breakdown}`);
  if (meta.emptyFiles.length > 0) {
    lines.push(
      `# 提示：${meta.emptyFiles.length} 个文件未静态识别到用例（可能使用动态注册）：${meta.emptyFiles.join(", ")}`,
    );
  }
  if (meta.parseErrorFiles.length > 0) {
    lines.push(
      `# 警告：${meta.parseErrorFiles.length} 个文件存在 TypeScript 解析错误`,
    );
  }

  if (groups.length === 0) {
    lines.push("", "# 无匹配用例。");
    return lines.join("\n");
  }

  lines.push("", "# 模块划分：");
  for (const group of groups) {
    const status = statusBreakdown(group.byStatus);
    lines.push(
      `# - ${group.module.label}：${group.files.length} 文件 / ${group.cases.length} 用例${status ? `（${status}）` : ""}`,
    );
  }

  for (const group of groups) {
    const status = statusBreakdown(group.byStatus);
    lines.push(
      "",
      `## ${group.module.label}  —  ${group.files.length} 文件 / ${group.cases.length} 用例${status ? `（${status}）` : ""}`,
    );

    let lastFile = null;
    for (const item of group.cases) {
      if (item.file !== lastFile) {
        if (lastFile !== null) lines.push("");
        lines.push(item.file);
        lastFile = item.file;
      }
      const flags = [
        item.status === "active" ? "" : item.status,
        item.each ? "each" : "",
      ]
        .filter(Boolean)
        .join(",");
      lines.push(
        `  ${String(item.line).padEnd(6)}${(flags || "-").padEnd(10)}${item.fullName}`,
      );
    }
  }

  return lines.join("\n");
}

function renderJson(cases, files, summary, options, meta, groups) {
  return JSON.stringify(
    {
      generatedAt: meta.generatedAt,
      root: ROOT,
      scope: {
        profile: options.profile,
        suite: options.suite,
        status: options.statuses,
        roots: SCAN_ROOTS,
      },
      summary,
      modules: groups.map((group) => ({
        key: group.module.key,
        kind: group.module.kind,
        id: group.module.id,
        title: group.module.title,
        label: group.module.label,
        files: group.files.length,
        cases: group.cases.length,
        byStatus: group.byStatus,
      })),
      files,
      emptyFiles: meta.emptyFiles,
      parseErrorFiles: meta.parseErrorFiles,
      cases,
    },
    null,
    2,
  );
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function renderCsv(cases) {
  const header = [
    "moduleKind",
    "moduleId",
    "moduleTitle",
    "modulePath",
    "file",
    "line",
    "column",
    "kind",
    "status",
    "each",
    "describe",
    "name",
    "fullName",
  ];
  const rows = cases.map((item) => [
    item.module.kind,
    item.module.id,
    item.module.title,
    item.module.modulePath,
    item.file,
    item.line,
    item.column,
    item.kind,
    item.status,
    item.each ? "true" : "false",
    item.describe.join(" > "),
    item.name,
    item.fullName,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function renderMarkdown(summary, options, meta, groups) {
  const escape = (value) =>
    String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
  const lines = [
    "# 测试用例列表",
    "",
    `- 生成时间：${meta.generatedAt}`,
    `- 范围：${scopeLabel(options)}`,
    `- 文件：${summary.files} 个${summary.matchedFiles !== summary.files ? `（命中 ${summary.matchedFiles} 个）` : ""}；用例：${summary.cases} 条；模块：${summary.modules} 个`,
  ];
  const breakdown = statusBreakdown(summary.byStatus);
  if (breakdown) lines.push(`- 状态：${breakdown}`);
  if (meta.emptyFiles.length > 0) {
    lines.push(
      `- 未识别到用例的文件：${meta.emptyFiles.map((f) => `\`${f}\``).join("、")}`,
    );
  }
  if (meta.parseErrorFiles.length > 0) {
    lines.push(
      `- 解析警告：${meta.parseErrorFiles.length} 个文件存在 TypeScript 解析错误`,
    );
  }

  if (groups.length === 0) {
    lines.push("", "无匹配用例。");
    return lines.join("\n");
  }

  lines.push(
    "",
    "## 模块划分",
    "",
    "| 模块 | 文件 | 用例 | 状态 |",
    "|---|---:|---:|---|",
  );
  for (const group of groups) {
    lines.push(
      `| \`${escape(group.module.id)}\` ${escape(group.module.title)} | ${group.files.length} | ${group.cases.length} | ${escape(statusBreakdown(group.byStatus))} |`,
    );
  }

  for (const group of groups) {
    lines.push(
      "",
      `## \`${escape(group.module.id)}\` ${escape(group.module.title)}`,
      "",
      `- 文件：${group.files.length} 个；用例：${group.cases.length} 条${statusBreakdown(group.byStatus) ? `（${escape(statusBreakdown(group.byStatus))}）` : ""}`,
      "",
      "| # | 子模块 | 文件 | 行 | 状态 | 用例 |",
      "|---:|---|---|---:|---|---|",
    );
    group.cases.forEach((item, index) => {
      const status = item.status === "active" ? "" : `**${item.status}**`;
      const submodule = item.module.submodulePath
        ? escape(item.module.submodulePath)
        : "-";
      lines.push(
        `| ${index + 1} | ${submodule} | \`${escape(item.file)}\` | ${item.line} | ${status} | ${escape(item.fullName)} |`,
      );
    });
  }

  return lines.join("\n");
}

function renderFiles(files, options) {
  const header =
    options.profile && options.suite
      ? `# ${options.profile} / ${options.suite}：${files.length} 个用例文件`
      : `# 全部用例文件：${files.length} 个`;
  return [header, ...files].join("\n");
}

// ---------- main ----------

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    console.error("使用 --help 查看用法。");
    process.exit(2);
  }

  if (options.help) {
    usage();
    return;
  }

  let files = collectAllTestFiles();
  if (options.profile && options.suite) {
    files = filterBySpec(files, options.profile, options.suite);
  }

  if (options.filesOnly) {
    const content = renderFiles(files, options);
    if (!writeOutput(content, options.out)) return;
    return;
  }

  const { cases, emptyFiles, parseErrorFiles } = collectCases(
    files,
    options.statuses,
  );
  const groups = groupByModule(cases);
  const summary = summarize(cases, files, groups);
  const meta = {
    generatedAt: new Date().toISOString(),
    emptyFiles,
    parseErrorFiles,
  };

  let content;
  switch (options.format) {
    case "json":
      content = renderJson(cases, files, summary, options, meta, groups);
      break;
    case "csv":
      content = renderCsv(cases);
      break;
    case "md":
      content = renderMarkdown(summary, options, meta, groups);
      break;
    default:
      content = renderText(files, summary, options, meta, groups);
      break;
  }

  if (!writeOutput(content, options.out)) return;

  // JSON / CSV 保持 stdout 可被程序直接消费；提示信息写到 stderr。
  if ((options.format === "json" || options.format === "csv") && !options.out) {
    console.error(
      `[list-test-cases] ${summary.files} 个文件，${summary.cases} 条用例`,
    );
  }
}

function writeOutput(content, outPath) {
  if (!outPath) {
    process.stdout.write(content.endsWith("\n") ? content : `${content}\n`);
    return true;
  }

  const target = path.resolve(process.cwd(), outPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(
    target,
    content.endsWith("\n") ? content : `${content}\n`,
    "utf8",
  );
  console.log(`已生成 ${path.relative(process.cwd(), target)}`);
  return true;
}

// 被 `| head` 之类提前关闭管道时静默退出，避免打印无意义的 EPIPE 堆栈。
process.stdout.on("error", (error) => {
  if (error.code === "EPIPE") process.exit(0);
  throw error;
});

if (require.main === module) main();
