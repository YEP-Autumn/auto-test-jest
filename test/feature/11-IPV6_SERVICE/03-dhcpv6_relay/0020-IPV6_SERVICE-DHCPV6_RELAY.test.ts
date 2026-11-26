import {
  DeviceARouteMac,
  LinkConstraint,
  PacketBuilder,
  Port,
  StreamPort,
  TestHelper,
  TransmitMode,
} from "@/utils";

jest.setTimeout(1000 * 60 * 10);

/**
 *
 *                            +------------------------------+
 *                            |             DUTA             |
 *  StreamPort.A <=> PortA ---| 2001:1001::1/64              |
 *  (DHCPv6 Client)           | dhcpv6-server 1              |
 *                            |                              |
 *                            | 2001:1000::2/64 --- PortB <=>|<=> StreamPort.B
 *                            +------------------------------+    (DHCPv6 Server)
 *
 *  DUTA 作为 DHCPv6 Relay，PortA 为客户端侧接口，PortB 为服务器侧接口。
 */
const CLIENT_MAC = "00:00:00:11:22:33";
const SERVER_MAC = "00:00:00:11:22:44";
const CLIENT_ADDRESS = "2001:1001::100";
const SERVER_ADDRESS = "2001:1000::1";
const RELAY_SERVER_SIDE = "2001:1000::2";
const RELAY_CLIENT_SIDE = "2001:1001::1";

/** 固定事务 ID，保证中继前后的 DHCPv6 报文可以逐字节校验 */
const TRANSACTION_ID = "123456";
/** DUID-LL：type=3, hardware=1, MAC=00:00:00:11:22:33 */
const CLIENT_DUID = "00030001020000000011";

function hex(value: string): Buffer {
  return Buffer.from(value.replace(/[^0-9a-fA-F]/g, ""), "hex");
}

/**
 * Renix HTTP 后端的 thrift RAW.payload 是 STRING，服务端按 UTF-8 直接下发。
 * 本用例的 DHCPv6 负载只包含 ASCII 范围内的字节，因此用 latin1 字符串传原始字节；
 * 地址从链路本地地址改为客户端侧全局地址，避免 fe80 等非 UTF-8 字节。
 */
function rawText(value: Buffer): string {
  if (value.some((byte) => byte >= 0x80)) {
    throw new Error(
      "Renix RAW payload 仅支持 ASCII 字节；含 0x80 以上字节时需后端支持二进制负载",
    );
  }
  return value.toString("latin1");
}

/** IPv6 地址转 16 字节十六进制，用于拼装 DHCPv6 中继报文头 */
function ipv6Hex(address: string): string {
  const [head = "", tail] = address.split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail ? tail.split(":") : [];
  const fill = 8 - headParts.length - tailParts.length;
  const parts = [
    ...headParts,
    ...Array.from({ length: fill }, () => "0"),
    ...tailParts,
  ];
  return parts.map((part) => part.padStart(4, "0")).join("");
}

function uint16Hex(value: number): string {
  return value.toString(16).padStart(4, "0");
}

/** Prefix Delegation：客户端请求的 IA_PD 与服务器下发的 IAPREFIX */
const PD_PREFIX = "2003:100:700:7000::";
const PD_IAID = "00000002";

/** Solicit：Client ID + IA_PD(IAID=2, T1=100s, T2=112s) */
const PD_SOLICIT = hex(
  [
    `01${TRANSACTION_ID}`,
    `0001000a${CLIENT_DUID}`,
    "0019000c",
    PD_IAID,
    "00000064",
    "00000070",
  ].join(""),
);

const PD_RELAY_FORWARD = hex(
  [
    "0c00",
    ipv6Hex(RELAY_CLIENT_SIDE),
    ipv6Hex(CLIENT_ADDRESS),
    "0012000400000001",
    "0009",
    uint16Hex(PD_SOLICIT.length),
    PD_SOLICIT.toString("hex"),
  ].join(""),
);

/** Reply：Client ID + IA_PD(IAID=2, T1/T2=100/112s, IAPREFIX=2003:100:700:7000::/64) */
const PD_REPLY = hex(
  [
    `07${TRANSACTION_ID}`,
    `0001000a${CLIENT_DUID}`,
    "00190029",
    PD_IAID,
    "00000064",
    "00000070",
    "001a0019",
    "00000064",
    "00000070",
    "40",
    ipv6Hex(PD_PREFIX),
  ].join(""),
);

const PD_RELAY_REPLY = hex(
  [
    "0d00",
    ipv6Hex(RELAY_CLIENT_SIDE),
    ipv6Hex(CLIENT_ADDRESS),
    "0012000400000001",
    "0009",
    uint16Hex(PD_REPLY.length),
    PD_REPLY.toString("hex"),
  ].join(""),
);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.one_device_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("DHCPv6 中继通过 Prefix Delegation 学习客户端路由", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ipv6 enable",
    "service dhcpv6 enable",
    "dhcpv6 relay",
    "dhcpv6 relay pd route",
    "dhcpv6-server 1 2001:1000::1",
    `interface ${Port.A}`,
    "no switchport",
    "ipv6 address 2001:1001::1/64",
    "dhcpv6-server 1",
    "no shutdown",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ipv6 address 2001:1000::2/64",
    "no shutdown",
    "exit",
    "ipv6 neighbor 2001:1000::1 0000.0011.2244",
    "ipv6 neighbor 2001:1001::100 0000.0011.2233",
    "end",
  ]);

  testHelper.sleep(1000 * 3);

  testHelper.ReadyCheckDutA("show services", /dhcpv6\s+enable/, 1000 * 10);
  testHelper.ExecRetMatchDutA(
    "show running-config | include dhcpv6",
    /dhcpv6 relay pd route/,
  );
  testHelper.ReadyCheckDutA(
    "show dhcpv6 relay interfaces",
    /DHCPv6 relay service status:\s*enabled/i,
    1000 * 10,
  );

  testHelper.ExecCustomDutA(async (handle) => {
    await handle.exec("clear dhcpv6 relay statistics");
    await handle.exec("clear dhcpv6 relay pd route");
    return true;
  });

  // 客户端 -> DUTA -> 服务器：携带 IA_PD 的 Solicit
  testHelper.startCapture(StreamPort.B);

  testHelper.addPktSender({
    port: StreamPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "33:33:00:01:00:02",
        src: CLIENT_MAC,
        type: 0x86dd,
      })
      .setIPv6({
        src: CLIENT_ADDRESS,
        dst: "ff02::1:2",
        nh: 17,
        hlim: 1,
      })
      .setUDP({ sport: 546, dport: 547 })
      .setRaw({ payload: rawText(PD_SOLICIT) }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 1,
      },
    },
  });

  testHelper.addPktChecker({
    port: StreamPort.B,
    packet: new PacketBuilder()
      .setIPv6({ dst: SERVER_ADDRESS, nh: 17 })
      .setUDP({ sport: 547, dport: 547 })
      .setRaw({ payload: rawText(PD_RELAY_FORWARD) }),
    expected_count: 1,
  });

  // 服务器 -> DUTA -> 客户端：携带 IAPREFIX 的 Reply
  testHelper.startCapture(StreamPort.A);

  testHelper.addPktSender({
    port: StreamPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: DeviceARouteMac,
        src: SERVER_MAC,
        type: 0x86dd,
      })
      .setIPv6({
        src: SERVER_ADDRESS,
        dst: RELAY_SERVER_SIDE,
        nh: 17,
        hlim: 64,
      })
      .setUDP({ sport: 547, dport: 547 })
      .setRaw({ payload: rawText(PD_RELAY_REPLY) }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 1,
      },
    },
  });

  testHelper.addPktChecker({
    port: StreamPort.A,
    packet: new PacketBuilder()
      .setIPv6({ dst: CLIENT_ADDRESS, nh: 17 })
      .setUDP({ sport: 547, dport: 546 })
      .setRaw({ payload: rawText(PD_REPLY) }),
    expected_count: 1,
  });

  // DUTA 从 IA_PD 学习客户端路由，并记录到 PD 客户端表
  testHelper.ReadyCheckDutA(
    "show dhcpv6 relay pd client",
    new RegExp(`${PD_PREFIX}/64`),
    1000 * 15,
  );
  testHelper.ReadyCheckDutA(
    "show ipv6 route",
    new RegExp(`${PD_PREFIX}/64`),
    1000 * 15,
  );

  testHelper.ExecRetMatchDutA("show dhcpv6 relay pd client", [
    new RegExp(`Interface\\s*:\\s*${Port.A}`),
    /Client DUID\s*:\s*00030001020000000011/,
    /Client IPv6 address\s*:\s*2001:1001::100/,
    /IA ID\s*:\s*0002/,
    new RegExp(`IA Prefix\\s*:\\s*${PD_PREFIX}/64`),
    /pre(?:fered|ferred)\/max lifetime\s*:\s*100\/112/,
    /route status\s*:\s*success/,
  ]);

  testHelper.ExecRetMatchDutA("show ipv6 route", [
    new RegExp(`S Dr\\s+${PD_PREFIX}/64 \\[254/0\\]`),
    new RegExp(`via\\s+2001:1001::100,\\s*${Port.A}`),
  ]);

  testHelper.ExecRetMatchDutA("show dhcpv6 relay statistics", [
    /Client relayed packets\s*:\s*[1-9]\d*/,
    /Server relayed packets\s*:\s*[1-9]\d*/,
    /Client error packets\s*:\s*0/,
    /Server error packets\s*:\s*0/,
  ]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no ipv6 neighbor 2001:1000::1",
    "no ipv6 neighbor 2001:1001::100",
    `interface ${Port.A}`,
    "no dhcpv6-server",
    "no ipv6 address 2001:1001::1/64",
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "no ipv6 address 2001:1000::2/64",
    "switchport",
    "exit",
    "no dhcpv6-server 1",
    "no dhcpv6 relay",
    "no dhcpv6 relay pd route",
    "service dhcpv6 disable",
    "no ipv6 enable",
    "end",
  ]);

  testHelper.ExecCustomDutA(async (handle) => {
    await handle.exec("clear dhcpv6 relay pd route");
    return true;
  }, true);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
