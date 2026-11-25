/**
 * JSON 配置加载器。
 *
 * 读取顺序：
 *   1. config/env/default.json
 *   2. config/env/local.json（可选，本机覆盖，已被 .gitignore 忽略）
 *
 * local.json 只做深合并，不读取任何环境变量。
 */

import fs from "fs";
import path from "path";
import { PROVIDER_IDS } from "../../domain/traffic/provider";
import { AppConfigJson, StreamControlConfigJson } from "./schema";

const CONFIG_DIR = path.resolve(__dirname, "../../../config/env");
const DEFAULT_FILE = path.join(CONFIG_DIR, "default.json");
const LOCAL_FILE = path.join(CONFIG_DIR, "local.json");

type JsonObject = Record<string, unknown>;

let cached: AppConfigJson | undefined;

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readJson(file: string): JsonObject {
  if (!fs.existsSync(file)) {
    throw new Error(`配置文件不存在：${file}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`配置文件解析失败：${file}\n${String(err)}`);
  }

  if (!isRecord(parsed)) {
    throw new Error(`配置文件顶层必须是对象：${file}`);
  }
  return parsed;
}

function deepMerge(base: JsonObject, override: JsonObject): JsonObject {
  const result: JsonObject = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = result[key];
    result[key] =
      isRecord(current) && isRecord(value) ? deepMerge(current, value) : value;
  }
  return result;
}

function fail(pathName: string, message: string): never {
  throw new Error(`配置校验失败：${pathName} ${message}`);
}

function requireString(value: unknown, pathName: string): string {
  if (typeof value !== "string" || value.length === 0) {
    fail(pathName, "必须是非空字符串");
  }
  return value;
}

function requireBoolean(value: unknown, pathName: string): boolean {
  if (typeof value !== "boolean") {
    fail(pathName, "必须是布尔值");
  }
  return value;
}

function requireNumber(value: unknown, pathName: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(pathName, "必须是数字");
  }
  return value;
}

function optionalBoolean(
  value: unknown,
  pathName: string,
): boolean | undefined {
  return value === undefined ? undefined : requireBoolean(value, pathName);
}

function optionalString(value: unknown, pathName: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") fail(pathName, "必须是字符串");
  return value;
}

function validateTopo(value: unknown): void {
  if (!isRecord(value)) fail("topo", "必须是对象");
  requireString(value.name, "topo.name");
  if (!isRecord(value.backend)) fail("topo.backend", "必须是对象");
  requireString(value.backend.host, "topo.backend.host");
  requireString(value.backend.port, "topo.backend.port");
  requireString(value.backend.username, "topo.backend.username");
  requireString(value.backend.password, "topo.backend.password");
}

/** 逻辑槽位数量：A ~ L */
const DUT_SLOT_COUNT = 12;

function validateDut(value: unknown): void {
  if (!isRecord(value)) fail("dut", "必须是对象");

  if (value.connection !== undefined) {
    if (!isRecord(value.connection)) fail("dut.connection", "必须是对象");
    const protocol = value.connection.protocol;
    if (protocol !== undefined && protocol !== "telnet" && protocol !== "ssh") {
      fail("dut.connection.protocol", '必须是 "telnet" 或 "ssh"');
    }
    optionalString(value.connection.username, "dut.connection.username");
    optionalString(value.connection.password, "dut.connection.password");
  }

  if (!Array.isArray(value.list) || value.list.length === 0) {
    fail("dut.list", "必须是非空数组");
  }

  const names = new Set<string>();
  value.list.forEach((item, index) => {
    const prefix = `dut.list[${index}]`;
    if (!isRecord(item)) fail(prefix, "必须是对象");
    const name = requireString(item.name, `${prefix}.name`);
    if (names.has(name)) fail(`${prefix}.name`, `设备名重复：${name}`);
    names.add(name);
    requireString(item.host, `${prefix}.host`);

    if (!Array.isArray(item.portList) || item.portList.length === 0) {
      fail(`${prefix}.portList`, "必须是非空数组");
    }
    item.portList.forEach((port, portIndex) => {
      requireString(port, `${prefix}.portList[${portIndex}]`);
    });

    if (!Array.isArray(item.portMapping)) {
      fail(`${prefix}.portMapping`, "必须是数组");
    }
    item.portMapping.forEach((mapping, mappingIndex) => {
      const mapPrefix = `${prefix}.portMapping[${mappingIndex}]`;
      if (!isRecord(mapping)) fail(mapPrefix, "必须是对象");
      requireString(mapping.device, `${mapPrefix}.device`);
      requireNumber(mapping.if_index, `${mapPrefix}.if_index`);
    });

    if (item.portList.length !== item.portMapping.length) {
      fail(prefix, "portList 与 portMapping 数量不一致");
    }
  });

  if (value.mapping === undefined) return;

  if (!Array.isArray(value.mapping) || value.mapping.length === 0) {
    fail("dut.mapping", "必须是非空数组");
  }
  if (value.mapping.length > DUT_SLOT_COUNT) {
    fail("dut.mapping", `最多只能映射 ${DUT_SLOT_COUNT} 台设备（A ~ L）`);
  }

  const mappedNames = new Set<string>();
  value.mapping.forEach((item, index) => {
    const prefix = `dut.mapping[${index}]`;
    const name = requireString(item, prefix);
    if (!names.has(name)) {
      fail(prefix, `设备名 ${name} 未在 dut.list 中定义`);
    }
    if (mappedNames.has(name)) {
      fail(prefix, `设备名重复：${name}`);
    }
    mappedNames.add(name);
  });
}

function validateStreamControl(value: unknown): void {
  if (!isRecord(value)) fail("traffic.streamControl", "必须是对象");
  requireString(value.host, "traffic.streamControl.host");
  requireString(value.port, "traffic.streamControl.port");
  optionalBoolean(value.tls, "traffic.streamControl.tls");
  optionalBoolean(value.tlsInsecure, "traffic.streamControl.tlsInsecure");
  optionalString(value.ca, "traffic.streamControl.ca");
  optionalString(value.cert, "traffic.streamControl.cert");
  optionalString(value.key, "traffic.streamControl.key");
  optionalString(value.token, "traffic.streamControl.token");
  optionalBoolean(value.debugCapture, "traffic.streamControl.debugCapture");
  if (value.batchCaptureMin !== undefined) {
    const threshold = requireNumber(
      value.batchCaptureMin,
      "traffic.streamControl.batchCaptureMin",
    );
    if (threshold < 0) {
      fail("traffic.streamControl.batchCaptureMin", "必须大于等于 0");
    }
  }
}

function validateTraffic(value: unknown): void {
  if (!isRecord(value)) fail("traffic", "必须是对象");

  if (!isRecord(value.http)) fail("traffic.http", "必须是对象");
  requireString(value.http.host, "traffic.http.host");
  requireString(value.http.port, "traffic.http.port");
  requireString(value.http.username, "traffic.http.username");
  requireString(value.http.password, "traffic.http.password");

  validateStreamControl(value.streamControl);

  if (!Array.isArray(value.ports) || value.ports.length === 0) {
    fail("traffic.ports", "必须是非空数组");
  }
  value.ports.forEach((port, index) => {
    const prefix = `traffic.ports[${index}]`;
    if (!isRecord(port)) fail(prefix, "必须是对象");
    if (
      typeof port.provider !== "string" ||
      !(PROVIDER_IDS as readonly string[]).includes(port.provider)
    ) {
      fail(`${prefix}.provider`, `必须是 ${PROVIDER_IDS.join(" / ")} 之一`);
    }
    requireString(port.address, `${prefix}.address`);
    if (!isRecord(port.topology)) fail(`${prefix}.topology`, "必须是对象");
    requireString(port.topology.device, `${prefix}.topology.device`);
    requireNumber(port.topology.if_index, `${prefix}.topology.if_index`);
  });
}

export function validateConfig(
  config: unknown,
): asserts config is AppConfigJson {
  if (!isRecord(config)) fail("config", "顶层必须是对象");
  validateTopo(config.topo);
  validateDut(config.dut);
  validateTraffic(config.traffic);
}

/** 读取并合并 default.json + local.json；结果缓存 */
export function loadConfig(): AppConfigJson {
  if (cached) return cached;

  const base = readJson(DEFAULT_FILE);
  const local = fs.existsSync(LOCAL_FILE) ? readJson(LOCAL_FILE) : {};
  const merged = deepMerge(base, local);
  validateConfig(merged);
  cached = merged;
  return cached;
}
