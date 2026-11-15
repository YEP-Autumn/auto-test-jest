import { PacketBuilder, FieldType } from "@/utils/packet/model";
import {
  HeaderType,
  headerOptionBytesLength,
  packetToHeaders,
} from "@/utils/backends/codec/grpc/headers";
import { encodeSnmpMessage } from "@/utils/backends/codec/snmp";
import { decodeFrame } from "@/utils/backends/codec/frame/decode";

function wrapSnmp(pdu: Buffer, sport = 161, dport = 162): Buffer {
  const eth = Buffer.from("00112233445566778899aabb0800", "hex");
  const ip = Buffer.alloc(20);
  ip[0] = 0x45;
  ip.writeUInt16BE(20 + 8 + pdu.length, 2);
  ip[8] = 64;
  ip[9] = 17;
  ip[12] = 1;
  ip[13] = 1;
  ip[14] = 1;
  ip[15] = 1;
  ip[16] = 2;
  ip[17] = 2;
  ip[18] = 2;
  ip[19] = 2;
  const udp = Buffer.alloc(8);
  udp.writeUInt16BE(sport, 0);
  udp.writeUInt16BE(dport, 2);
  udp.writeUInt16BE(8 + pdu.length, 4);
  return Buffer.concat([eth, ip, udp, pdu]);
}

describe("stream packet model", () => {
  test("IPv4 options are mapped as HeaderOption[]", () => {
    const headers = packetToHeaders(
      new PacketBuilder()
        .setIPv4({
          options: [
            { type: 148, data: "0000" }, // Router Alert
            { type: 1 }, // NOP
          ],
        })
        .toSpec(),
    );
    const ipv4 = headers.find((h) => h.type === HeaderType.IPV4);
    expect(ipv4).toBeDefined();
    expect(ipv4?.options).toEqual([
      { type: 148, data: Buffer.from("0000", "hex") },
      { type: 1, data: undefined },
    ]);
    expect(headerOptionBytesLength(ipv4?.options)).toBe(8);
  });

  test("TCP options include length and 4-byte alignment", () => {
    const headers = packetToHeaders(
      new PacketBuilder()
        .setTCP({
          options: [
            { type: 2, data: "05b4" }, // MSS
            { type: 4 }, // SACK permitted
            { type: 8, data: "0000000100000002" }, // Timestamp
            { type: 1 }, // NOP
            { type: 1 }, // NOP
          ],
        })
        .toSpec(),
    );
    const tcp = headers.find((h) => h.type === HeaderType.TCP);
    expect(tcp?.options?.map((o) => o.type)).toEqual([2, 4, 8, 1, 1]);
    expect(headerOptionBytesLength(tcp?.options)).toBe(20);
  });

  test("non-array IPv4 options fail explicitly", () => {
    expect(() =>
      packetToHeaders(
        new PacketBuilder().setIPv4({ options: 4 as any }).toSpec(),
      ),
    ).toThrow(/options 现在需要数组/);
  });

  test("IPv4 options over 40 bytes are rejected", () => {
    const options = Array.from({ length: 11 }, () => ({
      type: 148,
      data: "0000",
    }));
    expect(() =>
      packetToHeaders(new PacketBuilder().setIPv4({ options }).toSpec()),
    ).toThrow(/超过 40B/);
  });

  test("SNAP layer maps OUI and PID", () => {
    const headers = packetToHeaders(
      new PacketBuilder()
        .setLLC({ dsap: 0xaa, ssap: 0xaa, ctrl: 3 })
        .setSNAP({ oui: 0, pid: 0x0800 })
        .toSpec(),
    );
    const snap = headers.find((h) => h.type === HeaderType.SNAP);
    expect(snap?.fields.find((f) => f.name === "oui")?.fixed?.raw?.toString("hex")).toBe(
      "000000",
    );
    expect(snap?.fields.find((f) => f.name === "pid")?.fixed?.u64).toBe(2048);
  });
});

describe("SNMP BER encoder", () => {
  test("v2c SET multi-varbind round-trips through the frame decoder", () => {
    const pdu = encodeSnmpMessage({
      version: 1,
      community: "public",
      pdu_type: 3,
      request_id: 1234,
      varbinds: [
        { oid: "1.3.6.1.2.1.1.5.0", value: "test-name", value_type: 4 },
        { oid: "1.3.6.1.2.1.1.3.0", value: "42", value_type: 2 },
      ],
    });
    const layers = decodeFrame(wrapSnmp(pdu));
    const snmp = layers.find((l) => l.type === FieldType.SNMP)?.field.snmp;
    expect(snmp).toMatchObject({
      version: 1,
      community: "public",
      pdu_type: 3,
      request_id: 1234,
    });
    expect(snmp?.varbinds).toHaveLength(2);
    expect(snmp?.varbinds[0]).toMatchObject({
      oid: "1.3.6.1.2.1.1.5.0",
      value: "test-name",
      value_type: 4,
    });
    expect(snmp?.varbinds[1]).toMatchObject({
      oid: "1.3.6.1.2.1.1.3.0",
      value: "42",
      value_type: 2,
    });
  });

  test("v2c GetBulk round-trips non-repeaters and max-repetitions", () => {
    const pdu = encodeSnmpMessage({
      version: 1,
      community: "public",
      pdu_type: 5,
      request_id: 7,
      non_repeaters: 0,
      max_repetitions: 10,
      varbinds: [{ oid: "1.3.6.1.2.1.2.2.1" }],
    });
    const layers = decodeFrame(wrapSnmp(pdu));
    const snmp = layers.find((l) => l.type === FieldType.SNMP)?.field.snmp;
    expect(snmp).toMatchObject({
      pdu_type: 5,
      non_repeaters: 0,
      max_repetitions: 10,
    });
  });
});
