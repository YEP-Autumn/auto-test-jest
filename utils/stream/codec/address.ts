/**
 * MAC/IPv4/IPv6 与网络序字节之间的转换。
 *
 * packet.proto 的 PacketFieldValue.raw 要求网络序字节，而测试里既有冒号 MAC、
 * 点分 IPv4，也有压缩写法的 IPv6；发包映射和抓包解码共用这里的实现，保证
 * 期望值与实际值能按同样格式比较。
 */

export function macToBuffer(mac: string): Buffer {
  const parts = mac.includes(":") ? mac.split(":") : mac.split(".");
  if (parts.length !== 6 && parts.length !== 3) {
    throw new Error(`无效的 MAC 地址: ${mac}`);
  }
  const bytes =
    parts.length === 6
      ? parts.map((p) => parseInt(p, 16))
      : parts
          .map((p) => p.padStart(4, "0"))
          .flatMap((p) => [parseInt(p.slice(0, 2), 16), parseInt(p.slice(2, 4), 16)]);
  if (bytes.some((b) => !Number.isInteger(b) || b < 0 || b > 255)) {
    throw new Error(`无效的 MAC 地址: ${mac}`);
  }
  return Buffer.from(bytes);
}

export function bufferToMac(buf: Buffer, offset = 0): string {
  return Array.from(buf.subarray(offset, offset + 6))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(":");
}

export function ipv4ToBuffer(ip: string): Buffer {
  const parts = ip.split(".");
  if (parts.length !== 4) throw new Error(`无效的 IPv4 地址: ${ip}`);
  const bytes = parts.map((p) => parseInt(p, 10));
  if (bytes.some((b) => !Number.isInteger(b) || b < 0 || b > 255)) {
    throw new Error(`无效的 IPv4 地址: ${ip}`);
  }
  return Buffer.from(bytes);
}

export function bufferToIpv4(buf: Buffer, offset = 0): string {
  return Array.from(buf.subarray(offset, offset + 4)).join(".");
}

export function ipv6ToBuffer(ip: string): Buffer {
  const parseGroups = (part: string): number[] => {
    if (part === "") return [];
    return part.split(":").flatMap((group) => {
      if (group.includes(".")) {
        const v4 = ipv4ToBuffer(group);
        return [v4.readUInt16BE(0), v4.readUInt16BE(2)];
      }
      const value = parseInt(group, 16);
      if (!Number.isInteger(value) || value < 0 || value > 0xffff) {
        throw new Error(`无效的 IPv6 地址: ${ip}`);
      }
      return [value];
    });
  };

  let groups: number[];
  if (ip.includes("::")) {
    const [left, right] = ip.split("::");
    const leftGroups = parseGroups(left);
    const rightGroups = parseGroups(right);
    const zeros = 8 - leftGroups.length - rightGroups.length;
    if (zeros < 0) throw new Error(`无效的 IPv6 地址: ${ip}`);
    groups = [...leftGroups, ...new Array(zeros).fill(0), ...rightGroups];
  } else {
    groups = parseGroups(ip);
  }

  if (groups.length !== 8) throw new Error(`无效的 IPv6 地址: ${ip}`);
  const buf = Buffer.alloc(16);
  groups.forEach((g, i) => buf.writeUInt16BE(g, i * 2));
  return buf;
}

/** RFC 5952 压缩格式，保证与测试里 "4000::123" 这类写法可直接比较 */
export function bufferToIpv6(buf: Buffer, offset = 0): string {
  const groups: number[] = [];
  for (let i = 0; i < 8; i++) groups.push(buf.readUInt16BE(offset + i * 2));

  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;
  for (let i = 0; i < 8; i++) {
    if (groups[i] === 0) {
      if (curStart < 0) curStart = i;
      curLen++;
      if (curLen > bestLen) {
        bestLen = curLen;
        bestStart = curStart;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }

  const hex = groups.map((g) => g.toString(16));
  if (bestLen < 2) return hex.join(":");
  const left = hex.slice(0, bestStart).join(":");
  const right = hex.slice(bestStart + bestLen).join(":");
  return `${left}::${right}`;
}
