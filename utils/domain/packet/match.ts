/**
 * PacketChecker 的字段匹配：期望 PacketLayer 与实际抓包层逐字段比较。
 */

/**
 * 将IP地址字符串转换为32位整数
 * 例如: "192.168.1.1" -> 3232235777
 */
export function ipStringToNumber(ipString: string): number {
  const parts = ipString.split(".");
  if (parts.length !== 4) {
    throw new Error(`无效的IP地址格式: ${ipString}`);
  }

  const octets = parts.map((part) => {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) {
      throw new Error(`无效的IP八位组: ${part} (必须是0-255之间的数字)`);
    }
    return num;
  });

  return (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
}

/** 比较单个字段的期望值与实际值；不一致时输出单行提示。仅当期望值已设置时才比较(与原逻辑一致) */
function fieldEq(label: string, expected: any, actual: any): boolean {
  if (expected !== undefined && expected !== null && expected !== actual) {
    console.log(`[mismatch] ${label}: expected=${expected}, actual=${actual}`);
    return false;
  }
  return true;
}

// 报文字段匹配函数（由 PacketChecker.fieldsMatch 分发调用，逐一比较期望字段与实际捕获字段）

/**
 * 比较 EthernetII 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchEthernetII(field: any, actualField: any): boolean {
  if (field.ether == null || actualField.ether == null) {
    console.log("EthernetII field is null.");
    return false;
  }
  return (
    fieldEq("EthernetII.type", field.ether.type, actualField.ether.type) &&
    fieldEq("EthernetII.dst", field.ether.dst, actualField.ether.dst) &&
    fieldEq("EthernetII.src", field.ether.src, actualField.ether.src)
  );
}

/**
 * 比较 VLAN 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchVLAN(field: any, actualField: any): boolean {
  if (field.vlan == null || actualField.vlan == null) {
    console.log("VLAN field is null.");
    return false;
  }
  return (
    fieldEq("VLAN.prio", field.vlan.prio, actualField.vlan.prio) &&
    fieldEq("VLAN.dei", field.vlan.dei, actualField.vlan.dei) &&
    fieldEq("VLAN.vlan", field.vlan.vlan, actualField.vlan.vlan) &&
    fieldEq("VLAN.type", field.vlan.type, actualField.vlan.type)
  );
}

/**
 * 比较 IPv4 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchIPv4(field: any, actualField: any): boolean {
  if (field.ipv4 == null || actualField.ipv4 == null) {
    console.log("IPv4 field is null.");
    return false;
  }
  return (
    fieldEq("IPv4.version", field.ipv4.version, actualField.ipv4.version) &&
    fieldEq("IPv4.ihl", field.ipv4.ihl, actualField.ipv4.ihl) &&
    fieldEq("IPv4.tos", field.ipv4.tos, actualField.ipv4.tos) &&
    fieldEq("IPv4.len", field.ipv4.len, actualField.ipv4.len) &&
    fieldEq("IPv4.id", field.ipv4.id, actualField.ipv4.id) &&
    fieldEq("IPv4.frag", field.ipv4.frag, actualField.ipv4.frag) &&
    fieldEq("IPv4.flags", field.ipv4.flags, actualField.ipv4.flags) &&
    fieldEq("IPv4.ttl", field.ipv4.ttl, actualField.ipv4.ttl) &&
    fieldEq("IPv4.proto", field.ipv4.proto, actualField.ipv4.proto) &&
    fieldEq("IPv4.chksum", field.ipv4.chksum, actualField.ipv4.chksum) &&
    fieldEq("IPv4.src", field.ipv4.src, actualField.ipv4.src) &&
    fieldEq("IPv4.dst", field.ipv4.dst, actualField.ipv4.dst) &&
    fieldEq("IPv4.option", field.ipv4.option, actualField.ipv4.option)
  );
}

/**
 * 比较 IPv6 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchIPv6(field: any, actualField: any): boolean {
  if (field.ipv6 == null || actualField.ipv6 == null) {
    console.log("IPv6 field is null.");
    return false;
  }
  return (
    fieldEq("IPv6.version", field.ipv6.version, actualField.ipv6.version) &&
    fieldEq("IPv6.tc", field.ipv6.tc, actualField.ipv6.tc) &&
    fieldEq("IPv6.fl", field.ipv6.fl, actualField.ipv6.fl) &&
    fieldEq("IPv6.plen", field.ipv6.plen, actualField.ipv6.plen) &&
    fieldEq("IPv6.nh", field.ipv6.nh, actualField.ipv6.nh) &&
    fieldEq("IPv6.hlim", field.ipv6.hlim, actualField.ipv6.hlim) &&
    fieldEq("IPv6.src", field.ipv6.src, actualField.ipv6.src) &&
    fieldEq("IPv6.dst", field.ipv6.dst, actualField.ipv6.dst)
  );
}

/**
 * 比较 TCP 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchTCP(field: any, actualField: any): boolean {
  if (field.tcp == null || actualField.tcp == null) {
    console.log("TCP field is null.");
    return false;
  }
  return (
    fieldEq("TCP.sport", field.tcp.sport, actualField.tcp.sport) &&
    fieldEq("TCP.dport", field.tcp.dport, actualField.tcp.dport) &&
    fieldEq("TCP.seq", field.tcp.seq, actualField.tcp.seq) &&
    fieldEq("TCP.ack", field.tcp.ack, actualField.tcp.ack) &&
    fieldEq("TCP.dataofs", field.tcp.dataofs, actualField.tcp.dataofs) &&
    fieldEq("TCP.rsv", field.tcp.rsv, actualField.tcp.rsv) &&
    fieldEq("TCP.flags", field.tcp.flags, actualField.tcp.flags) &&
    fieldEq("TCP.window", field.tcp.window, actualField.tcp.window) &&
    fieldEq("TCP.chksum", field.tcp.chksum, actualField.tcp.chksum) &&
    fieldEq("TCP.urgptr", field.tcp.urgptr, actualField.tcp.urgptr) &&
    fieldEq("TCP.option", field.tcp.option, actualField.tcp.option)
  );
}

/**
 * 比较 UDP 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchUDP(field: any, actualField: any): boolean {
  if (field.udp == null || actualField.udp == null) {
    console.log("UDP field is null.");
    return false;
  }
  return (
    fieldEq("UDP.sport", field.udp.sport, actualField.udp.sport) &&
    fieldEq("UDP.dport", field.udp.dport, actualField.udp.dport) &&
    fieldEq("UDP.len", field.udp.len, actualField.udp.len) &&
    fieldEq("UDP.chksum", field.udp.chksum, actualField.udp.chksum)
  );
}

/**
 * 比较 ICMP 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchICMP(field: any, actualField: any): boolean {
  if (field.icmp == null || actualField.icmp == null) {
    console.log("ICMP field is null.");
    return false;
  }
  return (
    fieldEq("ICMP.type", field.icmp.type, actualField.icmp.type) &&
    fieldEq("ICMP.code", field.icmp.code, actualField.icmp.code) &&
    fieldEq("ICMP.chksum", field.icmp.chksum, actualField.icmp.chksum) &&
    fieldEq("ICMP.id", field.icmp.id, actualField.icmp.id) &&
    fieldEq("ICMP.seq", field.icmp.seq, actualField.icmp.seq)
  );
}

/**
 * 比较 ARP 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchARP(field: any, actualField: any): boolean {
  if (field.arp == null || actualField.arp == null) {
    console.log("ARP field is null.");
    return false;
  }
  return (
    fieldEq("ARP.hwtype", field.arp.hwtype, actualField.arp.hwtype) &&
    fieldEq("ARP.ptype", field.arp.ptype, actualField.arp.ptype) &&
    fieldEq("ARP.hwlen", field.arp.hwlen, actualField.arp.hwlen) &&
    fieldEq("ARP.plen", field.arp.plen, actualField.arp.plen) &&
    fieldEq("ARP.op", field.arp.op, actualField.arp.op) &&
    fieldEq("ARP.hwsrc", field.arp.hwsrc, actualField.arp.hwsrc) &&
    fieldEq("ARP.psrc", field.arp.psrc, actualField.arp.psrc) &&
    fieldEq("ARP.hwdst", field.arp.hwdst, actualField.arp.hwdst) &&
    fieldEq("ARP.pdst", field.arp.pdst, actualField.arp.pdst)
  );
}

/**
 * 比较 Raw 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchRaw(field: any, actualField: any): boolean {
  if (field.raw == null || actualField.raw == null) {
    console.log("RAW field is null.");
    return false;
  }
  if (field.raw.payload !== actualField.raw.payload) {
    console.log(
      `[mismatch] RAW.payload: expected=${field.raw.payload}, actual=${actualField.raw.payload}`,
    );
    return false;
  }
  return true;
}

/**
 * 比较 Dot3 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchDot3(field: any, actualField: any): boolean {
  if (field.dot3 == null || actualField.dot3 == null) {
    console.log("Dot3 field is null.");
    return false;
  }
  return (
    fieldEq("Dot3.dst", field.dot3.dst, actualField.dot3.dst) &&
    fieldEq("Dot3.src", field.dot3.src, actualField.dot3.src) &&
    fieldEq("Dot3.len", field.dot3.len, actualField.dot3.len)
  );
}

/**
 * 比较 LLC 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchLLC(field: any, actualField: any): boolean {
  if (field.llc == null || actualField.llc == null) {
    console.log("LLC field is null.");
    return false;
  }
  return (
    fieldEq("LLC.dsap", field.llc.dsap, actualField.llc.dsap) &&
    fieldEq("LLC.ssap", field.llc.ssap, actualField.llc.ssap) &&
    fieldEq("LLC.ctrl", field.llc.ctrl, actualField.llc.ctrl)
  );
}

/**
 * 比较 SNAP 字段是否匹配
 */
export function matchSNAP(field: any, actualField: any): boolean {
  if (field.snap == null || actualField.snap == null) {
    console.log("SNAP field is null.");
    return false;
  }
  return (
    fieldEq("SNAP.oui", field.snap.oui, actualField.snap.oui) &&
    fieldEq("SNAP.pid", field.snap.pid, actualField.snap.pid)
  );
}

/**
 * 比较期望值与实际值。
 * 期望值未指定时跳过；期望值为 RegExp 时按正则匹配，否则严格相等。
 */
function expectedMatches(expected: any, actual: any): boolean {
  if (expected === undefined || expected === null) return true;
  if (expected instanceof RegExp) {
    if (actual === undefined || actual === null) return false;
    expected.lastIndex = 0;
    return expected.test(String(actual));
  }
  return expected === actual;
}

/**
 * 比较 SNMP 字段是否匹配
 * @param field 期望的字段内容
 * @param actualField 实际捕获的字段内容
 * @returns 是否匹配
 */
export function matchSNMP(field: any, actualField: any): boolean {
  if (field.snmp == null || actualField.snmp == null) {
    console.log("SNMP field is null.");
    return false;
  }
  const snmp = field.snmp;
  const actualSnmp = actualField.snmp;

  if (!fieldEq("SNMP.version", snmp.version, actualSnmp.version)) return false;
  if (!fieldEq("SNMP.community", snmp.community, actualSnmp.community))
    return false;
  if (!fieldEq("SNMP.pdu_type", snmp.pdu_type, actualSnmp.pdu_type))
    return false;
  if (!fieldEq("SNMP.request_id", snmp.request_id, actualSnmp.request_id))
    return false;

  // varbinds 列表比较：期望的每条 varbind 需按顺序存在于实际 varbinds 中，实际可以有多余的 varbind
  if (snmp.varbinds && snmp.varbinds.length > 0) {
    if (!actualSnmp.varbinds || actualSnmp.varbinds.length === 0) {
      console.log(
        `[mismatch] SNMP.varbinds length: expected=${snmp.varbinds.length}, actual=${
          actualSnmp.varbinds ? actualSnmp.varbinds.length : 0
        }`,
      );
      return false;
    }

    // 在 actualSnmp.varbinds 中按顺序查找每条期望的 varbind，找到后从下一个位置继续
    // 比较规则：仅比较 expectedVb 中已指定的字段，未指定（null/undefined）的字段不参与比较
    let actualStart = 0;
    for (let i = 0; i < snmp.varbinds.length; i++) {
      const expectedVb = snmp.varbinds[i];
      let found = false;
      for (let j = actualStart; j < actualSnmp.varbinds.length; j++) {
        const actualVb = actualSnmp.varbinds[j];
        const oidOk = expectedMatches(expectedVb.oid, actualVb.oid);
        const valueOk = expectedMatches(expectedVb.value, actualVb.value);
        const typeOk =
          expectedVb.value_type === undefined ||
          expectedVb.value_type === null ||
          expectedVb.value_type === actualVb.value_type;
        if (oidOk && valueOk && typeOk) {
          actualStart = j + 1;
          found = true;
          break;
        }
      }
      if (!found) {
        console.log(
          `[mismatch] SNMP.varbinds[${i}] not found in order in actual: oid=${expectedVb.oid}, value=${expectedVb.value}`,
        );
        return false;
      }
    }
  }

  if (!fieldEq("SNMP.error", snmp.error, actualSnmp.error)) return false;
  if (!fieldEq("SNMP.error_index", snmp.error_index, actualSnmp.error_index))
    return false;
  if (!fieldEq("SNMP.enterprise", snmp.enterprise, actualSnmp.enterprise))
    return false;
  if (!fieldEq("SNMP.agent_addr", snmp.agent_addr, actualSnmp.agent_addr))
    return false;
  if (!fieldEq("SNMP.generic_trap", snmp.generic_trap, actualSnmp.generic_trap))
    return false;
  if (
    !fieldEq("SNMP.specific_trap", snmp.specific_trap, actualSnmp.specific_trap)
  )
    return false;

  // time_stamp 为 i64，反序列化后是 Int64 对象，统一转为 number 比较
  if (snmp.time_stamp) {
    const expectedTime =
      typeof snmp.time_stamp.toNumber === "function"
        ? snmp.time_stamp.toNumber()
        : snmp.time_stamp;
    const actualTime =
      typeof actualSnmp.time_stamp?.toNumber === "function"
        ? actualSnmp.time_stamp.toNumber()
        : actualSnmp.time_stamp;
    if (expectedTime !== actualTime) {
      console.log(
        `[mismatch] SNMP.time_stamp: expected=${expectedTime}, actual=${actualTime}`,
      );
      return false;
    }
  }

  if (
    !fieldEq("SNMP.non_repeaters", snmp.non_repeaters, actualSnmp.non_repeaters)
  )
    return false;
  if (
    !fieldEq(
      "SNMP.max_repetitions",
      snmp.max_repetitions,
      actualSnmp.max_repetitions,
    )
  )
    return false;

  // v3 头字段：仅比较期望中已指定的字段，未指定（null/undefined）不比较
  if (!fieldEq("SNMP.msg_id", snmp.msg_id, actualSnmp.msg_id)) return false;
  if (!fieldEq("SNMP.msg_max_size", snmp.msg_max_size, actualSnmp.msg_max_size))
    return false;
  if (!fieldEq("SNMP.msg_flags", snmp.msg_flags, actualSnmp.msg_flags))
    return false;
  if (
    !fieldEq(
      "SNMP.msg_security_model",
      snmp.msg_security_model,
      actualSnmp.msg_security_model,
    )
  )
    return false;
  if (!fieldEq("SNMP.engine_id", snmp.engine_id, actualSnmp.engine_id))
    return false;
  if (!fieldEq("SNMP.engine_boots", snmp.engine_boots, actualSnmp.engine_boots))
    return false;
  if (!fieldEq("SNMP.engine_time", snmp.engine_time, actualSnmp.engine_time))
    return false;
  if (!fieldEq("SNMP.user_name", snmp.user_name, actualSnmp.user_name))
    return false;
  if (!fieldEq("SNMP.auth_params", snmp.auth_params, actualSnmp.auth_params))
    return false;
  if (
    !fieldEq(
      "SNMP.privacy_params",
      snmp.privacy_params,
      actualSnmp.privacy_params,
    )
  )
    return false;
  if (
    !fieldEq(
      "SNMP.context_engine_id",
      snmp.context_engine_id,
      actualSnmp.context_engine_id,
    )
  )
    return false;
  if (!fieldEq("SNMP.context_name", snmp.context_name, actualSnmp.context_name))
    return false;

  return true;
}
