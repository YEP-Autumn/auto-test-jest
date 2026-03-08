import { TransmitMode } from "../../utils/comm/Components";
import {
  StreamBackendApi,
  RenixPort,
} from "../../utils/stream/StreamBackendApi";
import { PacketBuilder } from "../../utils/stream/thrift_packet";
import { TestHelper } from "../../utils/TestHelper";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;
const streamBackendApi = new StreamBackendApi();

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("", async () => {
  let packet = new PacketBuilder()
    .setEthernet({
      dst: "00:00:00:11:22:44",
      src: "00:00:00:11:22:33",
    })
    .setVLAN({ vlan: 100 })
    .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" })
    .setTCP({ sport: 1234, dport: 80 });

  let packet1 = new PacketBuilder()
    .setEthernet({
      dst: "00:00:00:11:22:44",
      src: "00:00:00:11:22:33",
    })
    .setVLAN({ vlan: 100 })
    .setARP({
      op: 1,
      hwsrc: "00:00:00:11:22:33",
      pdst: "10.10.10.100",
      psrc: "1.2.3.4",
    });

  let packet2 = new PacketBuilder()
    .setEthernet({
      dst: "00:00:00:11:22:44",
      src: "00:00:00:11:22:33",
    })
    .setVLAN({ vlan: 100 })
    .setIPv4({ dst: "10.10.10.100", src: "1.2.3.4" })
    .setUDP({ sport: 1234, dport: 80 });

  let packet3 = new PacketBuilder()
    .setEthernet({
      dst: "00:00:00:11:22:44",
      src: "00:00:00:11:22:33",
    })
    .setVLAN({ vlan: 100 })
    .setIPv6({ dst: "400::1", src: "300::1" })
    .setUDP({ sport: 1234, dport: 80 });

  testHelper.addPktSender({
    port: RenixPort.A,
    packet: packet3,
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  });

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
