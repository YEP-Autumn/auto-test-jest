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
const CLIENT_ASSIGNED_ADDRESS = "2001:1001::1000";

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

/** Solicit：Client ID + IA_NA + Option Request(DNS) + Elapsed Time */
const SOLICIT = hex(
  [
    `01${TRANSACTION_ID}`,
    `0001000a${CLIENT_DUID}`,
    "0003000c000000010000000000000000",
    "000600020017",
    "000800020000",
  ].join(""),
);

/** Relay-Forward：hop-count=0，link-address=客户端侧接口地址，peer-address=客户端地址 */
const RELAY_FORWARD = hex(
  [
    "0c00",
    ipv6Hex(RELAY_CLIENT_SIDE),
    ipv6Hex(CLIENT_ADDRESS),
    // 设备默认插入 Interface-ID(18)，取值为接口索引；DUTA 的 eth-0-1 为 1
    "0012000400000001",
    "0009",
    uint16Hex(SOLICIT.length),
    SOLICIT.toString("hex"),
  ].join(""),
);

/** Reply：Client ID + IA_NA(IAADDR=2001:1001::1000, preferred=100s, valid=112s) */
const REPLY = hex(
  [
    `07${TRANSACTION_ID}`,
    `0001000a${CLIENT_DUID}`,
    "00030028",
    "00000001",
    "00000064",
    "00000070",
    "00050018",
    ipv6Hex(CLIENT_ASSIGNED_ADDRESS),
    "00000064",
    "00000070",
  ].join(""),
);

/** Relay-Reply：服务器返回的中继响应，回显 Interface-ID，option 9 中封装原始 Reply */
const RELAY_REPLY = hex(
  [
    "0d00",
    ipv6Hex(RELAY_CLIENT_SIDE),
    ipv6Hex(CLIENT_ADDRESS),
    "0012000400000001",
    "0009",
    uint16Hex(REPLY.length),
    REPLY.toString("hex"),
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

test("DHCPv6 中继支持客户端与服务器之间的双向报文转发", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ipv6 enable",
    "service dhcpv6 enable",
    "dhcpv6 relay",
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
    "show dhcpv6-server",
    /group 1[\s\S]*2001:1000::1/,
  );
  testHelper.ReadyCheckDutA(
    "show dhcpv6 relay interfaces",
    /DHCPv6 relay service status:\s*enabled/i,
    1000 * 10,
  );

  // 清除历史计数，保证统计校验只覆盖本用例的报文
  testHelper.ExecCustomDutA(async (handle) => {
    await handle.exec("clear dhcpv6 relay statistics");
    return true;
  });

  // 客户端 -> DUTA -> 服务器：校验 DUTA 生成的 Relay-Forward
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
      .setRaw({ payload: rawText(SOLICIT) }),
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
      .setRaw({ payload: rawText(RELAY_FORWARD) }),
    expected_count: 1,
  });

  // 服务器 -> DUTA -> 客户端：校验 DUTA 解封装后的 Reply
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
      .setRaw({ payload: rawText(RELAY_REPLY) }),
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
      .setRaw({ payload: rawText(REPLY) }),
    expected_count: 1,
  });

  testHelper.sleep(1000);

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
    "service dhcpv6 disable",
    "no ipv6 enable",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
