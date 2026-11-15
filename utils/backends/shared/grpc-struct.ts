/**
 * google.protobuf.Struct 编码辅助。
 *
 * 注意：@grpc/proto-loader/protobufjs 不会把普通 JS 对象自动转成 Struct，
 * 必须显式给出 { fields: { key: { stringValue/numberValue/... } } }。
 * 否则 CaptureService.Create 会收到空 spec（实测表现为 "capture 需要 port"）。
 */

export function toStructValue(value: unknown): any {
  if (value === null) return { nullValue: 0 };
  switch (typeof value) {
    case "string":
      return { stringValue: value };
    case "number":
      return { numberValue: value };
    case "boolean":
      return { boolValue: value };
    default:
      break;
  }
  if (Array.isArray(value)) {
    return { listValue: { values: value.map(toStructValue) } };
  }
  if (Buffer.isBuffer(value)) {
    // Struct 没有 bytes 类型；二进制请改用 typed message，不要走 Struct。
    return { stringValue: value.toString("base64") };
  }
  return {
    structValue: {
      fields: Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, toStructValue(v)]),
      ),
    },
  };
}

export function toStruct(obj: Record<string, unknown>): any {
  return {
    fields: Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, toStructValue(v)]),
    ),
  };
}
