/**
 * 原始以太网帧 -> 中立 PacketLayer（抓包方向）。
 *
 * 发送方向不再需要本地编码（走 packet.proto headers），这里只负责把
 * CaptureService.ReadByIndex 返回的原始帧解析成和 PacketBuilder 一致的层结构，
 * 供 packet-utils 的 match* 直接复用。
 *
 * 当前覆盖：Ethernet / VLAN / IPv4 / IPv6 / TCP / UDP / ICMP / ARP / Dot3 / LLC，
 * 以及 IPv4/IPv6 之上常见端口的 SNMP v1/v2c/v3（用于 Storm Control Trap 用例）。
 */

import { bufferToIpv4, bufferToIpv6, bufferToMac } from "./address";
import { FieldType, PacketLayer } from "../packet/model";

const ETHERTYPE_IPV4 = 0x0800;
const ETHERTYPE_IPV6 = 0x86dd;
const ETHERTYPE_ARP = 0x0806;
const ETHERTYPE_VLAN = 0x8100;
const ETHERTYPE_QINQ = 0x88a8;

const IPPROTO_ICMP = 1;
const IPPROTO_TCP = 6;
const IPPROTO_UDP = 17;

function layer(type: FieldType, field: Record<string, any>): PacketLayer {
  return { type, field };
}

function rawLayer(payload: Buffer): PacketLayer | null {
  if (payload.length === 0) return null;
  return layer(FieldType.RAW, {
    raw: { payload: payload.toString("base64") },
  });
}

const TCP_FLAG_BITS: Array<[string, number]> = [
  ["fin", 0x01],
  ["syn", 0x02],
  ["rst", 0x04],
  ["psh", 0x08],
  ["ack_flag", 0x10],
  ["urg", 0x20],
  ["ece", 0x40],
  ["cwr", 0x80],
  ["ns", 0x100],
];

function decodeTcp(buf: Buffer): PacketLayer {
  const dataOffset = ((buf[12] >> 4) & 0x0f) * 4;
  let flags = 0;
  for (const [name, bit] of TCP_FLAG_BITS) {
    if (name === "ns") {
      if ((buf[12] & 0x01) !== 0) flags |= bit;
    } else if ((buf[13] & (bit & 0xff)) !== 0) {
      flags |= bit;
    }
  }
  return layer(FieldType.TCP, {
    tcp: {
      sport: buf.readUInt16BE(0),
      dport: buf.readUInt16BE(2),
      seq: buf.readUInt32BE(4),
      ack: buf.readUInt32BE(8),
      dataofs: buf[12] >> 4,
      rsv: (buf[12] >> 1) & 0x07,
      flags,
      window: buf.readUInt16BE(14),
      chksum: buf.readUInt16BE(16),
      urgptr: buf.readUInt16BE(18),
      options: dataOffset > 20 ? buf.subarray(20, dataOffset).toString("hex") : undefined,
    },
  });
}

function decodeUdp(buf: Buffer): PacketLayer {
  return layer(FieldType.UDP, {
    udp: {
      sport: buf.readUInt16BE(0),
      dport: buf.readUInt16BE(2),
      len: buf.readUInt16BE(4),
      chksum: buf.readUInt16BE(6),
    },
  });
}

function decodeIcmp(buf: Buffer): PacketLayer {
  return layer(FieldType.ICMP, {
    icmp: {
      type: buf[0],
      code: buf[1],
      chksum: buf.readUInt16BE(2),
      id: buf.length >= 6 ? buf.readUInt16BE(4) : undefined,
      seq: buf.length >= 8 ? buf.readUInt16BE(6) : undefined,
    },
  });
}

function decodeArp(buf: Buffer): PacketLayer {
  const hwlen = buf.length >= 5 ? buf[4] : 6;
  const plen = buf.length >= 6 ? buf[5] : 4;
  let off = 8;
  const hwsrc = hwlen === 6 ? bufferToMac(buf, off) : buf.subarray(off, off + hwlen).toString("hex");
  off += hwlen;
  const psrc = plen === 4 ? bufferToIpv4(buf, off) : buf.subarray(off, off + plen).toString("hex");
  off += plen;
  const hwdst = hwlen === 6 ? bufferToMac(buf, off) : buf.subarray(off, off + hwlen).toString("hex");
  off += hwlen;
  const pdst = plen === 4 ? bufferToIpv4(buf, off) : buf.subarray(off, off + plen).toString("hex");
  return layer(FieldType.ARP, {
    arp: {
      hwtype: buf.readUInt16BE(0),
      ptype: buf.readUInt16BE(2),
      hwlen,
      plen,
      op: buf.readUInt16BE(6),
      hwsrc,
      psrc,
      hwdst,
      pdst,
    },
  });
}

// ------------------------------------------------------------------ IPv4/IPv6

function decodeIpv4Payload(
  buf: Buffer,
  protocol: number,
  payload: Buffer,
): PacketLayer[] {
  const layers: PacketLayer[] = [];
  try {
    if (protocol === IPPROTO_TCP && payload.length >= 20) {
      layers.push(decodeTcp(payload));
    } else if (protocol === IPPROTO_UDP && payload.length >= 8) {
      const udpLayer = decodeUdp(payload);
      layers.push(udpLayer);
      const snmp = decodeSnmpFromUdp(payload, udpLayer);
      if (snmp) layers.push(snmp);
    } else if (protocol === IPPROTO_ICMP && payload.length >= 4) {
      layers.push(decodeIcmp(payload));
    } else {
      const raw = rawLayer(payload);
      if (raw) layers.push(raw);
    }
  } catch {
    const raw = rawLayer(payload);
    if (raw) layers.push(raw);
  }
  return layers;
}

function decodeIpv4(frame: Buffer, offset: number): PacketLayer[] {
  const versionIhl = frame[offset];
  const ihl = (versionIhl & 0x0f) * 4;
  const totalLen = frame.readUInt16BE(offset + 2);
  const flagsFrag = frame.readUInt16BE(offset + 6);
  const protocol = frame[offset + 9];
  const src = bufferToIpv4(frame, offset + 12);
  const dst = bufferToIpv4(frame, offset + 16);

  const ipLayer = layer(FieldType.IPv4, {
    ipv4: {
      version: (versionIhl >> 4) & 0x0f,
      ihl: versionIhl & 0x0f,
      tos: frame[offset + 1],
      len: totalLen,
      id: frame.readUInt16BE(offset + 4),
      frag: ((flagsFrag >> 13) & 0x07) * 0x2000 + (flagsFrag & 0x1fff),
      ttl: frame[offset + 8],
      proto: protocol,
      chksum: frame.readUInt16BE(offset + 10),
      src,
      dst,
    },
  });

  const end = Math.min(frame.length, offset + Math.max(totalLen, ihl));
  const payload = frame.subarray(offset + ihl, end);
  return [ipLayer, ...decodeIpv4Payload(frame, protocol, payload)];
}

function decodeIpv6(frame: Buffer, offset: number): PacketLayer[] {
  const first = frame.readUInt32BE(offset);
  const payloadLen = frame.readUInt16BE(offset + 4);
  let nextHeader = frame[offset + 6];
  const hopLimit = frame[offset + 7];
  const src = bufferToIpv6(frame, offset + 8);
  const dst = bufferToIpv6(frame, offset + 24);

  const ipLayer = layer(FieldType.IPv6, {
    ipv6: {
      version: (first >> 28) & 0x0f,
      tc: (first >> 20) & 0xff,
      fl: first & 0x000fffff,
      plen: payloadLen,
      nh: nextHeader,
      hlim: hopLimit,
      src,
      dst,
    },
  });

  let payloadOffset = offset + 40;
  const end = Math.min(frame.length, payloadOffset + payloadLen);
  // 简单跳过常见扩展头（hop-by-hop / routing / fragment / destination options）
  while ([0, 43, 44, 60].includes(nextHeader) && payloadOffset + 2 <= end) {
    const extensionNext = frame[payloadOffset];
    const extensionLen = (frame[payloadOffset + 1] + 1) * 8;
    payloadOffset += extensionLen;
    nextHeader = extensionNext;
  }
  const payload = frame.subarray(payloadOffset, end);
  return [ipLayer, ...decodeIpv4Payload(frame, nextHeader, payload)];
}

// ------------------------------------------------------------------ Dot3/LLC

function decodeDot3(frame: Buffer, length: number): PacketLayer[] {
  const end = Math.min(frame.length, 14 + length);
  const layers: PacketLayer[] = [
    layer(FieldType.Dot3, {
      dot3: {
        dst: bufferToMac(frame, 0),
        src: bufferToMac(frame, 6),
        len: length,
      },
    }),
  ];

  let offset = 14;
  if (offset + 3 > end) return layers;
  const dsap = frame[offset];
  const ssap = frame[offset + 1];
  const controlLen = (dsap & 0x03) === 0x03 ? 2 : 1;
  const ctrl = controlLen === 1 ? frame[offset + 2] : frame.readUInt16BE(offset + 2);
  layers.push(
    layer(FieldType.LLC, {
      llc: { dsap, ssap, ctrl },
    }),
  );
  offset += 2 + controlLen;

  // SNAP：AA AA 03 + OUI(3) + PID(2)；PID 即内层 ethertype
  if (dsap === 0xaa && ssap === 0xaa && controlLen === 1 && ctrl === 0x03 && offset + 5 <= end) {
    const oui = frame.readUIntBE(offset, 3);
    const pid = frame.readUInt16BE(offset + 3);
    layers.push(
      layer(FieldType.SNAP, {
        snap: { oui, pid },
      }),
    );
    offset += 5;

    if (pid === ETHERTYPE_IPV4) {
      layers.push(...decodeIpv4(frame, offset));
      return layers;
    }
    if (pid === ETHERTYPE_IPV6) {
      layers.push(...decodeIpv6(frame, offset));
      return layers;
    }
    if (pid === ETHERTYPE_ARP && offset + 28 <= end) {
      layers.push(decodeArp(frame.subarray(offset)));
      return layers;
    }
  }

  // 802.3 的 length 字段决定有效载荷长度；后面的以太网最小帧填充不算 payload
  const raw = rawLayer(frame.subarray(offset, end));
  if (raw) layers.push(raw);
  return layers;
}

// ------------------------------------------------------------------ SNMP BER

interface BerTlv {
  tag: number;
  start: number;
  end: number;
  next: number;
}

function readBerTlv(buf: Buffer, offset: number): BerTlv | null {
  if (offset + 2 > buf.length) return null;
  const tag = buf[offset];
  let len = buf[offset + 1];
  let cursor = offset + 2;
  if ((len & 0x80) !== 0) {
    const n = len & 0x7f;
    if (n === 0 || n > 4 || cursor + n > buf.length) return null;
    len = 0;
    for (let i = 0; i < n; i++) len = (len << 8) | buf[cursor++];
  }
  const start = cursor;
  const end = cursor + len;
  if (end > buf.length) return null;
  return { tag, start, end, next: end };
}

function berChildren(buf: Buffer, parent: BerTlv): BerTlv[] {
  const result: BerTlv[] = [];
  let offset = parent.start;
  while (offset < parent.end) {
    const tlv = readBerTlv(buf, offset);
    if (!tlv || tlv.next > parent.end) break;
    result.push(tlv);
    offset = tlv.next;
  }
  return result;
}

function berInt(buf: Buffer, tlv: BerTlv): number {
  let value = 0;
  for (let i = tlv.start; i < tlv.end; i++) value = (value << 8) | buf[i];
  // 负数（最高位为 1）按二进制补码处理
  if (tlv.end > tlv.start && (buf[tlv.start] & 0x80) !== 0) {
    value -= Math.pow(2, (tlv.end - tlv.start) * 8);
  }
  return value;
}

function berOid(buf: Buffer, tlv: BerTlv): string {
  if (tlv.end <= tlv.start) return "";
  const first = buf[tlv.start];
  const parts: number[] = [Math.floor(first / 40), first % 40];
  let value = 0;
  for (let i = tlv.start + 1; i < tlv.end; i++) {
    value = (value << 7) | (buf[i] & 0x7f);
    if ((buf[i] & 0x80) === 0) {
      parts.push(value);
      value = 0;
    }
  }
  return parts.join(".");
}

function berValue(buf: Buffer, tlv: BerTlv): { value: string; value_type: number } {
  switch (tlv.tag) {
    case 0x02:
      return { value: String(berInt(buf, tlv)), value_type: 2 };
    case 0x04:
      return { value: buf.subarray(tlv.start, tlv.end).toString("utf8"), value_type: 4 };
    case 0x05:
      return { value: "", value_type: 5 };
    case 0x06:
      return { value: berOid(buf, tlv), value_type: 6 };
    case 0x40:
      return { value: bufferToIpv4(buf, tlv.start), value_type: 4 };
    case 0x41:
    case 0x42:
    case 0x43:
      return { value: String(berInt(buf, tlv)), value_type: 2 };
    default:
      return {
        value: buf.subarray(tlv.start, tlv.end).toString("hex"),
        value_type: 4,
      };
  }
}

function parseVarbinds(buf: Buffer, list: BerTlv | undefined): any[] {
  if (!list) return [];
  const result: any[] = [];
  for (const vb of berChildren(buf, list)) {
    const children = berChildren(buf, vb);
    if (children.length < 1) continue;
    const oid = berOid(buf, children[0]);
    const valueTlv = children[1];
    const value = valueTlv ? berValue(buf, valueTlv) : { value: "", value_type: 0 };
    result.push({ oid, value: value.value, value_type: value.value_type });
  }
  return result;
}

function parsePdu(buf: Buffer, pdu: BerTlv): any {
  const snmp: any = { pdu_type: pdu.tag - 0xa0 };
  if (pdu.tag === 0xa4) {
    // SNMPv1 Trap
    const children = berChildren(buf, pdu);
    if (children[0]) snmp.enterprise = berOid(buf, children[0]);
    if (children[1] && children[1].tag === 0x40)
      snmp.agent_addr = bufferToIpv4(buf, children[1].start);
    if (children[2]) snmp.generic_trap = berInt(buf, children[2]);
    if (children[3]) snmp.specific_trap = berInt(buf, children[3]);
    if (children[4]) snmp.time_stamp = berInt(buf, children[4]);
    snmp.varbinds = parseVarbinds(buf, children[5]);
    return snmp;
  }
  const children = berChildren(buf, pdu);
  if (children[0]) snmp.request_id = berInt(buf, children[0]);
  if (children[1]) snmp.error = berInt(buf, children[1]);
  if (children[2]) snmp.error_index = berInt(buf, children[2]);
  snmp.varbinds = parseVarbinds(buf, children[3]);
  return snmp;
}

function decodeSnmp(buf: Buffer): PacketLayer | null {
  const outer = readBerTlv(buf, 0);
  if (!outer || outer.tag !== 0x30) return null;
  const top = berChildren(buf, outer);
  if (top.length < 2) return null;

  const version = berInt(buf, top[0]);
  const snmp: any = { version };

  if (version < 3) {
    if (top[1].tag !== 0x04) return null;
    snmp.community = buf.subarray(top[1].start, top[1].end).toString("utf8");
    const pdu = top[2];
    if (!pdu || pdu.tag < 0xa0 || pdu.tag > 0xa8) return null;
    Object.assign(snmp, parsePdu(buf, pdu));
  } else {
    // v3：children = [version, msgGlobalData(SEQ), msgSecurityParameters(OCTET),
    //                scopedPduData(SEQ 明文 / OCTET 加密)]
    // 不能直接取第一个 SEQUENCE（那是 msgGlobalData），要找到内部含 PDU 的那个。
    let scoped: BerTlv | undefined;
    for (const tlv of top.slice(1)) {
      if (tlv.tag !== 0x30) continue;
      const children = berChildren(buf, tlv);
      if (children.some((t) => t.tag >= 0xa0 && t.tag <= 0xa8)) {
        scoped = tlv;
        break;
      }
    }
    if (!scoped) return null;
    const scopedChildren = berChildren(buf, scoped);
    // scopedPDU: contextEngineID, contextName, PDU
    const pdu = scopedChildren.find((t) => t.tag >= 0xa0 && t.tag <= 0xa8);
    if (!pdu) return null;
    Object.assign(snmp, parsePdu(buf, pdu));
  }

  return layer(FieldType.SNMP, { snmp });
}

function decodeSnmpFromUdp(
  udpPayload: Buffer,
  udpLayer: PacketLayer,
): PacketLayer | null {
  const udp = udpLayer.field.udp;
  const isSnmpPort = udp.sport === 161 || udp.dport === 161 || udp.sport === 162 || udp.dport === 162;
  const isSnmpLike = udpPayload.length > 2 && udpPayload[0] === 0x30;
  if (!isSnmpPort && !isSnmpLike) return null;
  const payload = udpPayload.subarray(8, Math.min(udpPayload.length, udp.len || udpPayload.length));
  try {
    return decodeSnmp(payload);
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ 入口

export function decodeFrame(frame: Buffer): PacketLayer[] {
  try {
    if (frame.length < 14) {
      const raw = rawLayer(frame);
      return raw ? [raw] : [];
    }

    const etherTypeOrLen = frame.readUInt16BE(12);
    if (etherTypeOrLen <= 1500) {
      return decodeDot3(frame, etherTypeOrLen);
    }

    const layers: PacketLayer[] = [
      layer(FieldType.EthernetII, {
        ether: {
          dst: bufferToMac(frame, 0),
          src: bufferToMac(frame, 6),
          type: etherTypeOrLen,
        },
      }),
    ];

    let offset = 14;
    let etherType = etherTypeOrLen;
    while ((etherType === ETHERTYPE_VLAN || etherType === ETHERTYPE_QINQ) && offset + 4 <= frame.length) {
      const tci = frame.readUInt16BE(offset);
      const innerType = frame.readUInt16BE(offset + 2);
      layers.push(
        layer(FieldType.VLAN, {
          vlan: {
            prio: (tci >> 13) & 0x07,
            dei: (tci >> 12) & 0x01,
            vlan: tci & 0x0fff,
            type: innerType,
          },
        }),
      );
      offset += 4;
      etherType = innerType;
    }

    if (etherType === ETHERTYPE_IPV4) {
      layers.push(...decodeIpv4(frame, offset));
    } else if (etherType === ETHERTYPE_IPV6) {
      layers.push(...decodeIpv6(frame, offset));
    } else if (etherType === ETHERTYPE_ARP) {
      layers.push(decodeArp(frame.subarray(offset)));
    } else {
      const raw = rawLayer(frame.subarray(offset));
      if (raw) layers.push(raw);
    }
    return layers;
  } catch {
    const raw = rawLayer(frame);
    return raw ? [raw] : [];
  }
}
