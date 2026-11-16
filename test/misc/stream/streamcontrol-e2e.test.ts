import {
  BurstGapUnit,
  createTrafficSession,
  PacketBuilder,
  StreamPort,
  TransmitMode,
} from "@/utils";
import { FieldType } from "@/utils/domain/packet/model";
import type { TrafficSession } from "@/utils/runtime/traffic/session";

// 显式开关仅用于决定是否运行 E2E；连接参数统一在 config/env/local.json。
const enabled = process.env.STREAM_CONTROL_E2E === "true";
const describeE2E = enabled ? describe : describe.skip;

// E2E 只关心逻辑端口 A/B；运行前需把 traffic.ports 配成 stream-linux，
// 并在 traffic.streamControl 中配置可用网关。

const myMac = (frame: any) =>
  frame.layers.some(
    (layer: any) =>
      layer.type === 1 && layer.field.ether?.src === "66:77:88:99:aa:bb",
  );

function packet() {
  return new PacketBuilder()
    .setEthernet({
      dst: "00:11:22:33:44:55",
      src: "66:77:88:99:aa:bb",
      type: 0x0800,
    })
    .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2", ttl: 64, proto: 17 })
    .setUDP({ sport: 1234, dport: 5678 });
}

describeE2E("streamcontrol TrafficService inline start", () => {
  let session: TrafficSession;

  beforeAll(async () => {
    session = createTrafficSession();
    expect(session.resolve(StreamPort.A).endpoint.provider).toBe(
      "stream-linux",
    );
    await session.init([StreamPort.A, StreamPort.B]);
  }, 120_000);

  afterAll(async () => {
    if (!session) return;
    await session.close();
  }, 120_000);

  test("STEP sends exactly the requested frames and captures them", async () => {
    await session.startCapture(StreamPort.B);
    await session.sendPacket(StreamPort.A, packet().toSpec(), {
      wait: true,
      transmit: { mode: TransmitMode.STEP, param: { step_count: 3 } },
    });
    await session.stopCapture(StreamPort.B);
    const frames = (await session.readCapture(StreamPort.B)).filter(myMac);
    expect(frames).toHaveLength(3);
  }, 120_000);

  test("Dot3 RAW payload and SNMP SET use the same TrafficService path", async () => {
    const pdu = Buffer.from(
      Array.from({ length: 36 }, (_, i) => (i * 7) & 0xff),
    );
    const dot3 = new PacketBuilder()
      .setDot3({
        dst: "01:80:c2:00:00:00",
        src: "66:77:88:99:aa:bb",
        len: 39,
      })
      .setLLC({ dsap: 10, ssap: 10, ctrl: 10 })
      .setRaw({ payload: pdu });

    await session.startCapture(StreamPort.B);
    await session.sendPacket(StreamPort.A, dot3.toSpec(), {
      wait: true,
      transmit: { mode: TransmitMode.STEP, param: { step_count: 1 } },
    });
    await session.stopCapture(StreamPort.B);
    const dot3Frame = (await session.readCapture(StreamPort.B)).find((frame) =>
      frame.layers.some((layer: any) => layer.type === FieldType.Dot3),
    );
    const dot3Raw = dot3Frame?.layers.find(
      (layer: any) => layer.type === FieldType.RAW,
    )?.field.raw?.payload;
    expect(
      Buffer.from(String(dot3Raw ?? ""), "base64").subarray(0, pdu.length),
    ).toEqual(pdu);
    expect(
      dot3Frame?.layers.find((layer: any) => layer.type === FieldType.Dot3)
        ?.field.dot3?.len,
    ).toBe(39);

    const snmp = new PacketBuilder()
      .setEthernet({
        dst: "00:11:22:33:44:55",
        src: "66:77:88:99:aa:bb",
        type: 0x0800,
      })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2", ttl: 64, proto: 17 })
      .setUDP({ sport: 161, dport: 162 })
      .setSNMP({
        version: 1,
        community: "public",
        pdu_type: 3,
        request_id: 42,
        varbinds: [
          { oid: "1.3.6.1.2.1.1.5.0", value: "x", value_type: 4 },
          { oid: "1.3.6.1.2.1.1.3.0", value: "1", value_type: 2 },
        ],
      });

    await session.startCapture(StreamPort.B);
    await session.sendPacket(StreamPort.A, snmp.toSpec(), {
      wait: true,
      transmit: { mode: TransmitMode.STEP, param: { step_count: 1 } },
    });
    await session.stopCapture(StreamPort.B);
    const snmpLayer = (await session.readCapture(StreamPort.B))
      .flatMap((frame) => frame.layers)
      .find((layer: any) => layer.type === FieldType.SNMP);
    expect(snmpLayer?.field.snmp).toMatchObject({
      version: 1,
      pdu_type: 3,
      request_id: 42,
    });
    expect(snmpLayer?.field.snmp?.varbinds).toHaveLength(2);
  }, 120_000);

  test("BURST gap inserts an idle gap between bursts", async () => {
    await session.startCapture(StreamPort.B);
    await session.sendPacket(StreamPort.A, packet().toSpec(), {
      wait: true,
      transmit: {
        mode: TransmitMode.BURST,
        param: {
          burst_size: 5,
          burst_count: 3,
          gap: 50,
          gap_unit: BurstGapUnit.MS,
        },
      },
    });
    await session.stopCapture(StreamPort.B);
    const frames = (await session.readCapture(StreamPort.B))
      .filter(myMac)
      .map((frame) => Number(frame.timestampNs ?? 0n))
      .sort((a, b) => a - b);
    expect(frames).toHaveLength(15);
    const gaps = frames
      .slice(1)
      .map((ts, i) => (ts - frames[i]) / 1e6)
      .filter((ms) => ms >= 30);
    // 3 组 burst -> 2 个组间 gap；最后一组之后不再等待
    expect(gaps).toHaveLength(2);
  }, 120_000);
  test("different tx ports can run concurrently and stop independently", async () => {
    const first = await session.startTransmit(StreamPort.A, packet().toSpec(), {
      transmit: {
        mode: TransmitMode.CONTINUOUS,
        param: { percent_rate: 1 },
      },
    });
    const second = await session.startTransmit(
      StreamPort.B,
      packet().toSpec(),
      {
        transmit: {
          mode: TransmitMode.CONTINUOUS,
          param: { percent_rate: 1 },
        },
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(await first.state()).toBe(3);
    expect(await second.state()).toBe(3);

    await first.stop();
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(await second.state()).toBe(3);

    await second.stop();
  }, 120_000);
});
