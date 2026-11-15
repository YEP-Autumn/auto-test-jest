/**
 * SNMP v1/v2c BER 编码（发送用）。
 *
 * 引擎的 `snmp` 头只覆盖固定 43B 的 v1/v2c Get/GetNext 模板；SET、Trap、
 * GetBulk、多 varbind 等变长 PDU 没有固定字段表，需要把完整 BER PDU 作为
 * `payload: { type: blob, custom: "0x..." }` 放在 UDP 之后。
 *
 * 这里只负责编码 PDU 本身，IPv4 total_len / UDP len / checksum 仍由引擎计算。
 * v3 的 USM 认证/加密不在当前模型内，暂不支持。
 */

import type { SNMPOptions, VarbindOptions } from "../../packet/model";

function encodeLength(length: number): Buffer {
  if (length < 0x80) return Buffer.from([length]);
  const bytes: number[] = [];
  let value = length;
  while (value > 0) {
    bytes.unshift(value & 0xff);
    value >>>= 8;
  }
  return Buffer.from([0x80 | bytes.length, ...bytes]);
}

function tlv(tag: number, content: Buffer): Buffer {
  return Buffer.concat([
    Buffer.from([tag]),
    encodeLength(content.length),
    content,
  ]);
}

function encodeSignedInteger(value: number): Buffer {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`[snmp] INTEGER 超出安全范围: ${value}`);
  }
  if (value >= 0) {
    const bytes: number[] = [];
    let v = value;
    do {
      bytes.unshift(v & 0xff);
      v = Math.floor(v / 256);
    } while (v > 0);
    if ((bytes[0] & 0x80) !== 0) bytes.unshift(0);
    return Buffer.from(bytes);
  }

  // 负数：取最短补码
  let v = value;
  const bytes: number[] = [];
  do {
    bytes.unshift(v & 0xff);
    v = Math.floor(v / 256);
  } while (v < -1);
  if ((bytes[0] & 0x80) === 0) bytes.unshift(0xff);
  return Buffer.from(bytes);
}

function encodeOid(oid: string): Buffer {
  const parts = oid.split(".").map((part) => Number(part));
  if (
    parts.length < 2 ||
    parts.some((part) => !Number.isInteger(part) || part < 0) ||
    parts[0] > 2 ||
    (parts[0] < 2 && parts[1] > 39)
  ) {
    throw new Error(`[snmp] 无效 OID: ${oid}`);
  }

  const out: number[] = [40 * parts[0] + parts[1]];
  for (const part of parts.slice(2)) {
    const stack = [part & 0x7f];
    let v = Math.floor(part / 128);
    while (v > 0) {
      stack.unshift((v & 0x7f) | 0x80);
      v = Math.floor(v / 128);
    }
    out.push(...stack);
  }
  return Buffer.from(out);
}

function encodeIpv4(text: string): Buffer {
  const parts = text.split(".").map((part) => Number(part));
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    throw new Error(`[snmp] 无效 IPv4: ${text}`);
  }
  return Buffer.from(parts);
}

function encodeVarbind(varbind: VarbindOptions): Buffer {
  if (!varbind.oid || varbind.oid instanceof RegExp) {
    throw new Error("[snmp] 发送的 varbind 必须给出明确的 oid");
  }
  const oid = tlv(0x06, encodeOid(varbind.oid));
  const value = varbind.value instanceof RegExp ? undefined : varbind.value;
  let type = varbind.value_type ?? 0;

  if (type === 0) {
    if (value === undefined || value === "") {
      type = 5; // NULL
    } else if (/^-?\d+$/.test(value)) {
      type = 2;
    } else if (/^\d+(\.\d+)+$/.test(value)) {
      type = 6;
    } else {
      type = 4;
    }
  }

  let valueTlv: Buffer;
  switch (type) {
    case 0:
    case 5:
      valueTlv = tlv(0x05, Buffer.alloc(0));
      break;
    case 2:
      valueTlv = tlv(0x02, encodeSignedInteger(Number(value ?? 0)));
      break;
    case 4:
      valueTlv = tlv(0x04, Buffer.from(String(value ?? ""), "utf8"));
      break;
    case 6:
      valueTlv = tlv(0x06, encodeOid(String(value ?? "")));
      break;
    case 0x40:
      valueTlv = tlv(0x40, encodeIpv4(String(value ?? "0.0.0.0")));
      break;
    case 0x41:
    case 0x42:
    case 0x43:
      valueTlv = tlv(type, encodeSignedInteger(Number(value ?? 0)));
      break;
    default:
      throw new Error(`[snmp] 不支持的 varbind value_type: ${type}`);
  }

  return tlv(0x30, Buffer.concat([oid, valueTlv]));
}

function encodeVarbindList(varbinds: VarbindOptions[]): Buffer {
  return tlv(
    0x30,
    Buffer.concat(varbinds.map((varbind) => encodeVarbind(varbind))),
  );
}

/** 固定 43B 模板能表达的范围：v1/v2c、单 varbind、Get/GetNext、短 community/OID、NULL 值 */
export function canUseFixedSnmpTemplate(options: SNMPOptions): boolean {
  if ((options.version ?? 1) >= 3) return false;
  const pduType = options.pdu_type ?? 0;
  if (pduType !== 0 && pduType !== 1) return false;
  if (!Array.isArray(options.varbinds) || options.varbinds.length !== 1)
    return false;

  const varbind = options.varbinds[0];
  if (!varbind.oid || varbind.oid instanceof RegExp) return false;
  if (
    varbind.value_type !== undefined &&
    varbind.value_type !== 0 &&
    varbind.value_type !== 5
  ) {
    return false;
  }
  if (varbind.value !== undefined && varbind.value !== "") return false;

  const community = Buffer.from(options.community ?? "public", "utf8");
  if (community.length > 6) return false;

  try {
    if (encodeOid(varbind.oid).length > 8) return false;
  } catch {
    return false;
  }
  return true;
}

/**
 * 编码完整 SNMP v1/v2c 消息（含外层 SEQUENCE）。
 */
export function encodeSnmpMessage(options: SNMPOptions): Buffer {
  const version = options.version ?? 1;
  if (version >= 3) {
    throw new Error(
      "[streamcontrol] SNMP v3 的 USM 认证/加密暂不支持；请用 templateString 发送原始帧",
    );
  }

  const pduType = options.pdu_type ?? 0;
  const varbinds = options.varbinds ?? [];
  const varbindList = encodeVarbindList(varbinds);

  let pdu: Buffer;
  if (pduType === 4) {
    // SNMPv1 Trap
    const enterprise = options.enterprise
      ? tlv(0x06, encodeOid(options.enterprise))
      : tlv(0x06, encodeOid("1.3.6.1.4.1"));
    const agentAddr = tlv(0x40, encodeIpv4(options.agent_addr ?? "0.0.0.0"));
    const generic = tlv(0x02, encodeSignedInteger(options.generic_trap ?? 0));
    const specific = tlv(0x02, encodeSignedInteger(options.specific_trap ?? 0));
    const timestamp = tlv(0x43, encodeSignedInteger(options.time_stamp ?? 0));
    pdu = tlv(
      0xa4,
      Buffer.concat([
        enterprise,
        agentAddr,
        generic,
        specific,
        timestamp,
        varbindList,
      ]),
    );
  } else {
    const tags: Record<number, number> = {
      0: 0xa0, // Get
      1: 0xa1, // GetNext
      2: 0xa2, // Response
      3: 0xa3, // Set
      5: 0xa5, // Bulk
      6: 0xa6, // Inform
      7: 0xa7, // Trapv2
    };
    const tag = tags[pduType];
    if (tag === undefined) {
      throw new Error(`[snmp] 不支持的 pdu_type: ${pduType}`);
    }
    const requestId = tlv(0x02, encodeSignedInteger(options.request_id ?? 0));
    const body =
      pduType === 5
        ? Buffer.concat([
            requestId,
            tlv(0x02, encodeSignedInteger(options.non_repeaters ?? 0)),
            tlv(0x02, encodeSignedInteger(options.max_repetitions ?? 0)),
            varbindList,
          ])
        : Buffer.concat([
            requestId,
            tlv(0x02, encodeSignedInteger(options.error ?? 0)),
            tlv(0x02, encodeSignedInteger(options.error_index ?? 0)),
            varbindList,
          ]);
    pdu = tlv(tag, body);
  }

  const versionTlv = tlv(0x02, encodeSignedInteger(version));
  const community = tlv(
    0x04,
    Buffer.from(options.community ?? "public", "utf8"),
  );
  return tlv(0x30, Buffer.concat([versionTlv, community, pdu]));
}
