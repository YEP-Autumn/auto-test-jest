/**
 * 本地原始帧编码（Dot3/LLC + RAW payload）。
 *
 * 普通 Dot3+LLC 已走 packet.proto headers（配合 YAML `payload` 长度，引擎会
 * 正确区分 MAC client data 和最小帧 padding）；只有带 `setRaw()` 的报文没有
 * 对应 HeaderType 能表达 payload，才用这里拼原始帧 + templateString。
 */

import { FieldType, PacketSpec } from "../packet/model";
import { macToBuffer } from "./address";

function layerOf(packet: PacketSpec, type: FieldType): any | undefined {
  return packet.layers.find((layer) => layer.type === type)?.field;
}

/**
 * 802.3 + LLC (+ RAW payload) -> 原始以太网帧。
 * 没有 Dot3 层时返回 null。
 */
export function encodeDot3Llc(packet: PacketSpec): Buffer | null {
  const dot3Layer = layerOf(packet, FieldType.Dot3);
  if (!dot3Layer) return null;

  const dot3 = dot3Layer.dot3;
  if (!dot3?.dst || !dot3?.src) {
    throw new Error("[streamcontrol] Dot3 需要 dst/src");
  }

  const llcLayer = layerOf(packet, FieldType.LLC);
  const llc = llcLayer?.llc;
  const snap = layerOf(packet, FieldType.SNAP)?.snap;
  const rawLayer = layerOf(packet, FieldType.RAW);
  const payload = rawLayer?.raw?.payload
    ? Buffer.from(rawLayer.raw.payload, "base64")
    : Buffer.alloc(0);

  const llcLen = llc ? ((llc.dsap & 0x03) === 0x03 ? 4 : 3) : 0;
  const snapLen = snap ? 5 : 0;
  const declaredLen =
    dot3.len !== undefined && dot3.len !== null
      ? Number(dot3.len)
      : llcLen + snapLen + payload.length;

  // 802.3 length 字段只覆盖 LLC + SNAP + payload；不足补 0，避免把以太网填充算进去
  const bodyLen = Math.max(declaredLen, llcLen + snapLen + payload.length);
  const body = Buffer.alloc(bodyLen);
  let offset = 0;

  if (llc) {
    const controlLen = (llc.dsap & 0x03) === 0x03 ? 2 : 1;
    body[offset++] = llc.dsap & 0xff;
    body[offset++] = llc.ssap & 0xff;
    if (controlLen === 2) {
      body.writeUInt16BE(Number(llc.ctrl ?? 0) & 0xffff, offset);
      offset += 2;
    } else {
      body[offset++] = Number(llc.ctrl ?? 0) & 0xff;
    }
  }

  if (snap) {
    const oui = Number(snap.oui ?? 0) & 0xffffff;
    body[offset++] = (oui >> 16) & 0xff;
    body[offset++] = (oui >> 8) & 0xff;
    body[offset++] = oui & 0xff;
    body.writeUInt16BE(Number(snap.pid ?? 0) & 0xffff, offset);
    offset += 2;
  }

  payload.copy(body, offset);

  const header = Buffer.alloc(14);
  macToBuffer(dot3.dst).copy(header, 0);
  macToBuffer(dot3.src).copy(header, 6);
  header.writeUInt16BE(declaredLen & 0xffff, 12);
  return Buffer.concat([header, body]);
}
