/**
 * 经典 pcap 解析（Ethernet linktype）。
 *
 * 引擎默认导出 pcap（`sl_pcap_export`），magic 为 0xa1b2c3d4 / 0xa1b23c4d。
 * pcapng 暂不支持，调用方会退回 ReadByIndex。
 */

import { decodeFrame } from "../codec/frame/decode";
import type { CapturedPacket } from "../../../contracts/traffic-backend";

export function parsePcapFrames(buffer: Buffer): CapturedPacket[] {
  if (buffer.length < 24) {
    throw new Error("[streamcontrol] pcap 文件过短");
  }

  const leMagic = buffer.readUInt32LE(0);
  const beMagic = buffer.readUInt32BE(0);
  let littleEndian: boolean;
  let nanosecond: boolean;

  if (leMagic === 0xa1b2c3d4) {
    littleEndian = true;
    nanosecond = false;
  } else if (beMagic === 0xa1b2c3d4) {
    littleEndian = false;
    nanosecond = false;
  } else if (leMagic === 0xa1b23c4d) {
    littleEndian = true;
    nanosecond = true;
  } else if (beMagic === 0xa1b23c4d) {
    littleEndian = false;
    nanosecond = true;
  } else {
    throw new Error(
      `[streamcontrol] 不支持的 pcap magic 0x${beMagic.toString(16)}`,
    );
  }

  const u32 = (offset: number) =>
    littleEndian ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);

  const linkType = u32(20);
  if (linkType !== 1) {
    throw new Error(`[streamcontrol] 不支持的 pcap linktype ${linkType}`);
  }

  const packets: CapturedPacket[] = [];
  let offset = 24;
  while (offset + 16 <= buffer.length) {
    const tsSec = u32(offset);
    const tsFrac = u32(offset + 4);
    const inclLen = u32(offset + 8);
    offset += 16;

    if (inclLen === 0 || offset + inclLen > buffer.length) break;

    const raw = Buffer.from(buffer.subarray(offset, offset + inclLen));
    offset += inclLen;

    const timestampNs =
      BigInt(tsSec) * 1_000_000_000n +
      (nanosecond ? BigInt(tsFrac) : BigInt(tsFrac) * 1000n);

    packets.push({
      raw,
      timestampNs,
      layers: decodeFrame(raw),
    });
  }

  return packets;
}
