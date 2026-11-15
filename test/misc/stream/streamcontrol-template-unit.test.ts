import { parsePcapFrames } from "@/utils/backends/grpc/pcap";
import {
  durationFromOptions,
  framesFromOptions,
} from "@/utils/backends/grpc/template";
import { FieldType } from "@/utils/packet/model";
import { TransmitMode } from "@/utils/packet/types";

function pcapWithFrame(frame: Buffer): Buffer {
  const header = Buffer.alloc(24);
  header.writeUInt32LE(0xa1b2c3d4, 0);
  header.writeUInt16LE(2, 4);
  header.writeUInt16LE(4, 6);
  header.writeUInt32LE(65535, 16);
  header.writeUInt32LE(1, 20); // Ethernet

  const record = Buffer.alloc(16);
  record.writeUInt32LE(1, 0);
  record.writeUInt32LE(2, 4);
  record.writeUInt32LE(frame.length, 8);
  record.writeUInt32LE(frame.length, 12);

  return Buffer.concat([header, record, frame]);
}

function ethernetIPv4Udp(): Buffer {
  const eth = Buffer.from("00112233445566778899aabb0800", "hex");
  const ip = Buffer.alloc(20);
  ip[0] = 0x45;
  ip.writeUInt16BE(20 + 8, 2);
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
  udp.writeUInt16BE(1234, 0);
  udp.writeUInt16BE(5678, 2);
  udp.writeUInt16BE(8, 4);
  return Buffer.concat([eth, ip, udp]);
}

describe("streamcontrol template helpers", () => {
  test("STEP / BURST / count derive the expected frame count", () => {
    expect(
      framesFromOptions({
        transmit: { mode: TransmitMode.STEP, param: { step_count: 3 } } as any,
      }),
    ).toBe(3);
    expect(
      framesFromOptions({
        transmit: {
          mode: TransmitMode.BURST,
          param: { burst_size: 5, burst_count: 3 },
        } as any,
      }),
    ).toBe(15);
    expect(framesFromOptions({ count: 7 })).toBe(7);
  });

  test("TIME derives duration in milliseconds", () => {
    expect(
      durationFromOptions({
        transmit: {
          mode: TransmitMode.TIME,
          param: { time_seconds: 1.5 },
        } as any,
      }),
    ).toBe(1500);
  });

  test("parsePcapFrames decodes a classic Ethernet pcap", () => {
    const frame = ethernetIPv4Udp();
    const packets = parsePcapFrames(pcapWithFrame(frame));
    expect(packets).toHaveLength(1);
    expect(packets[0].raw).toEqual(frame);
    expect(packets[0].timestampNs).toBe(1_000_002_000n);
    expect(packets[0].layers.map((layer) => layer.type)).toEqual([
      FieldType.EthernetII,
      FieldType.IPv4,
      FieldType.UDP,
    ]);
  });
});
