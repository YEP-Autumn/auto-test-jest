/**
 * 抓包列表的紧凑打印：PacketChecker 日志用。
 */

// ---- 紧凑打印 pkt_list：结构化缩进；数组每个元素一行，层级缩进一致 ----
const PRINT_WIDTH = 100; // 单行最大宽度，超过自动折行
const PRINT_BODY = "      "; // 层字段续行缩进（6 空格）
const PRINT_INDENT = "  "; // 每加深一层的缩进

/** 一次渲染结果：first 为无缩进前缀的首行（拼接在调用方前缀后），cont 为已完成缩进的续行 */
interface Rendered {
  first: string;
  cont: string[];
}

/** 标量渲染：含控制字符(如 agent_addr)的字符串只留长度 */
function renderScalar(v: any): string {
  if (typeof v === "string") {
    for (let i = 0; i < v.length; i++) {
      if (v.charCodeAt(i) < 32) return `<bytes:${v.length}>`;
    }
  }
  return String(v);
}

/** 单行紧凑渲染（仅用于长度估算，不实际输出） */
function inlineRender(v: any): string {
  if (v == null) return "";
  if (Array.isArray(v)) return `[${v.map(inlineRender).join(", ")}]`;
  if (typeof v === "object") {
    if (v.type === "Buffer") return `<Buffer:${v.data?.length ?? 0}B>`;
    const parts: string[] = [];
    for (const [k, val] of Object.entries(v)) {
      const s = inlineRender(val);
      if (s) parts.push(`${k}=${s}`);
    }
    return `{${parts.join(" ")}}`;
  }
  return renderScalar(v);
}

/** 数组：能单行则单行，否则每个元素独占一行（首元素前换行），] 收回到父级缩进 */
function renderArray(arr: any[], indent: string): Rendered {
  if (arr.length === 0) return { first: "[]", cont: [] };
  const elemIndent = indent + PRINT_INDENT;
  const oneLine = `[${arr.map(inlineRender).join(", ")}]`;
  if (indent.length + oneLine.length <= PRINT_WIDTH) {
    return { first: oneLine, cont: [] };
  }
  const cont: string[] = [];
  arr.forEach((e, i) => {
    const er = renderValue(e, elemIndent);
    const sep = i < arr.length - 1 ? "," : "";
    cont.push(elemIndent + er.first + sep);
    cont.push(...er.cont);
  });
  cont.push(indent + "]");
  return { first: "[", cont };
}

/** 渲染值。indent：数组 ] 行 / 嵌套对象续行所在层的缩进 */
function renderValue(v: any, indent: string): Rendered {
  if (v == null) return { first: "", cont: [] };
  if (Array.isArray(v)) return renderArray(v, indent);
  if (typeof v === "object") {
    if (v.type === "Buffer")
      return { first: `<Buffer:${v.data?.length ?? 0}B>`, cont: [] };
    return renderObject(v, indent + PRINT_INDENT);
  }
  return { first: renderScalar(v), cont: [] };
}

/**
 * 对象：字段尽量打包到一行；遇到多行字段(数组块)则先换行，块内各行按层级缩进，
 * 块后字段续拼到 "]" 行。首行预算用 firstBudget（其余行用 PRINT_WIDTH - contIndent）。
 */
function renderObject(
  obj: any,
  contIndent: string,
  firstBudget?: number,
): Rendered {
  const entries = Object.entries(obj).filter(([, v]) => v != null);
  if (entries.length === 0) return { first: "{}", cont: [] };

  const fields = entries.map(([k, v]) => {
    const vr = renderValue(v, contIndent);
    return {
      full: `${k}=${vr.first}`,
      cont: vr.cont,
      isMulti: vr.cont.length > 0,
    };
  });

  // 单行尝试
  if (fields.every((f) => !f.isMulti)) {
    const oneLine = "{" + fields.map((f) => f.full).join(" ") + "}";
    const budget = firstBudget ?? PRINT_WIDTH - contIndent.length;
    if (oneLine.length <= budget) return { first: oneLine, cont: [] };
  }

  // 多行打包
  const lines: string[] = [];
  let cur = "{";
  let curIndent = "";
  let curBudget = firstBudget ?? PRINT_WIDTH - contIndent.length;
  const flush = () => {
    if (cur.length) {
      lines.push(curIndent + cur);
      cur = "";
      curIndent = contIndent;
      curBudget = PRINT_WIDTH - contIndent.length;
    }
  };

  for (const f of fields) {
    if (f.isMulti) {
      // 数组块独占一行，块后字段续拼到 "]" 行
      if (cur.length && cur !== "{") flush();
      lines.push(curIndent + cur + f.full); // "varbinds=["（或首行 "{varbinds=["）
      lines.push(...f.cont);
      lines.pop(); // 移除 "]" 行
      cur = "]";
      curIndent = contIndent;
      curBudget = PRINT_WIDTH - contIndent.length;
      continue;
    }
    // 拼字段到当前行；行首 "{" 或换行后的新行不加前导空格
    const sep = cur === "" || cur === "{" ? "" : " ";
    if (cur && cur !== "{" && cur.length + 1 + f.full.length > curBudget) {
      flush();
      cur = f.full;
    } else {
      cur = cur + sep + f.full;
    }
  }
  cur += "}";
  flush();

  return { first: lines[0], cont: lines.slice(1) };
}

/** 渲染单个协议层为多行文本：name({...}) */
function renderLayer(name: string, layer: any, prefix: string): string {
  const open = `${prefix}${name}(`;
  const r = renderObject(layer, PRINT_BODY, PRINT_WIDTH - open.length);
  if (r.cont.length === 0) return `${open}${r.first})`;
  r.cont[r.cont.length - 1] += ")";
  return `${open}${r.first}\n${r.cont.join("\n")}`;
}

/** 提取 field 中唯一非空的协议层 */
function formatField(f: any, prefix: string): string {
  for (const [name, layer] of Object.entries(f?.field ?? {})) {
    if (layer != null) return renderLayer(name, layer, prefix);
  }
  return "";
}

/**
 * 每个报文一层一行（首层带 [i] 前缀，后续层缩进 4 空格）；
 * 超长层按层级结构化折行，数组每个元素独占一行。
 */
export function formatPktList(pktList: any[]): string {
  return pktList
    .map((pkt, i) => {
      const layers = (pkt?.field_list ?? [])
        .map((fl: any, idx: number) =>
          formatField(fl, idx === 0 ? `[${i}] ` : `    `),
        )
        .filter(Boolean);
      if (layers.length === 0) return `[${i}] (empty)`;
      return layers.join("\n");
    })
    .join("\n");
}
