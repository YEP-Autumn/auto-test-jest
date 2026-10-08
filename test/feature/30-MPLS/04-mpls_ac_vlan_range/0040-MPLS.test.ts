import { Port } from "../../../../utils";
import { TransmitMode } from "../../../../utils/comm/components";
import { RenixPort } from "../../../../utils/comm/config";
import { PacketBuilder } from "../../../../utils/stream/thrift-packet";
import { TestHelper } from "../../../../utils/test-helper";
import { LinkConstraint } from "../../../../utils/topo/link-constraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_2,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/*
 *                    +--------+                   +--------+
 *  RenixA <=> PortD--|        |                   |        |
 *                    |  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
 *  RenixC <=> PortB--|        |                   |        |    |
 *                    +--------+                   +--------+    |
 *                                                               |
 *                                                 +--------+    |
 *                               RenixB <=> PortD--|  DUTC  |--PortB
 *                                                 +--------+
 */
test("vlan range ac可以和qinq flex mode模式同时使用", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "raw vlan group 1 flex-vlan 30-40,50-60",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.1/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "switchport mode dot1q-tunnel",
    "switchport dot1q-tunnel type flex",
    "mpls-vpls v1 flex-vlan-range-group 1",
    "exit",
    "interface loopback0",
    "ip address 11.11.1.1/32",
    "exit",
    "mpls vpls v1 100",
    "vpls-peer 11.11.4.4 raw",
    "exit",
    "router rip",
    "network 11.11.0.0/16",
    "exit",
    "router ldp",
    "router-id 11.11.1.1",
    "targeted-peer 11.11.4.4",
    "transport-address 11.11.1.1",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.13.2/24",
    "enable-ldp",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.2/24",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 11.11.2.2/32",
    "exit",
    "router rip",
    "network 11.11.0.0/16",
    "exit",
    "router ldp",
    "router-id 11.11.2.2",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.13.4/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "mpls-vpls v1 vlan 2",
    "exit",
    "interface loopback0",
    "ip address 11.11.4.4/32",
    "exit",
    "mpls vpls v1 100",
    "vpls-peer 11.11.1.1 raw",
    "exit",
    "router rip",
    "network 11.11.0.0/16",
    "exit",
    "router ldp",
    "router-id 11.11.4.4",
    "targeted-peer 11.11.1.1",
    "transport-address 11.11.4.4",
    "end",
  ]);

  /** 配置 flex dotq-tunnel */
  testHelper.ExecConfigDutA([
    "configure terminal",
    "vlan database",
    "vlan 2-500",
    "exit",
    "ethernet evc 1",
    "dot1q mapped-vlan 400",
    "exit",
    "ethernet evc 2",
    "dot1q mapped-vlan 401",
    "exit",
    "ethernet evc 3",
    "dot1q mapped-vlan 402",
    "exit",
    "ethernet evc 4",
    "dot1q mapped-vlan 403",
    "exit",
    "ethernet evc 6",
    "dot1q mapped-vlan 500",
    "exit",
    "vlan mapping table vm",
    "raw-vlan-translate 200 evc 1",
    "raw-vlan-translate 201 202 evc 2",
    "raw-vlan 203 evc 3",
    "raw-vlan untagged evc 4",
    "raw-vlan out-of-range evc 6",
    "raw-vlan 100 200 egress-vlan untagged",
    "raw-vlan 200 300 egress-vlan 123",
    "exit",
    `interface ${Port.D}`,
    "switchport dot1q-tunnel vlan mapping table vm",
    "switchport dot1q-tunnel allowed vlan add 200,300,400-404,500",
    "exit",
    `interface ${Port.B}`,
    "switchport mode trunk",
    "switchport trunk allowed vlan add 200,300,400-404,500",
    "end",
  ]);

  testHelper.sleep(1000 * 45);

  testHelper.ReadyCheckDutA("show ldp vpls", "Up     ethernet", 1000 * 60);
  testHelper.ReadyCheckDutC("show ldp vpls", "Up     ethernet", 1000 * 60);

  testHelper.sleep(1000 * 10);

  testHelper.ReadyCheckDutA(
    "show ldp session",
    new RegExp("11.11.2.2.*?OPERATIONAL"),
    1000 * 45,
  );

  testHelper.ReadyCheckDutA(
    "show ldp session",
    new RegExp("11.11.4.4.*?OPERATIONAL"),
    1000 * 45,
  );

  testHelper.ReadyCheckDutC(
    "show ldp session",
    new RegExp("11.11.1.1.*?OPERATIONAL"),
    1000 * 45,
  );

  testHelper.ReadyCheckDutC(
    "show ldp session",
    new RegExp("11.11.2.2.*?OPERATIONAL"),
    1000 * 45,
  );

  // RenixA 发送 vlan 30-40 或 50-60 之间的报文时, RenixB能够收到报文
  testHelper.startCapture(RenixPort.B);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 33, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  });
  testHelper.addPktChecker({
    port: RenixPort.B,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 2, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  });

  // RenixA 发送 vlan 200的报文时, RenixC能够收到vlan 400的报文
  testHelper.startCapture(RenixPort.C);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  });
  testHelper.addPktChecker({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 400, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  });

  // RenixA 发送 vlan 201 202的报文时, RenixC能够收到vlan 201 401的报文
  testHelper.startCapture(RenixPort.C);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 202, type: 0x8100 })
      .setVLAN({ vlan: 201, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  });
  testHelper.addPktChecker({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 401, type: 0x8100 })
      .setVLAN({ vlan: 201, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  });

  // RenixA 发送 vlan 203的报文时, RenixC能够收到vlan 203 402的报文
  testHelper.startCapture(RenixPort.C);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 203, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  });
  testHelper.addPktChecker({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 402, type: 0x8100 })
      .setVLAN({ vlan: 203, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  });

  // RenixA 发送 vlan 不带vlan的报文时, RenixC能够收到vlan 403的报文
  testHelper.startCapture(RenixPort.C);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x0800,
      })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  });
  testHelper.addPktChecker({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 403, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  });

  // RenixA 发送 vlan 其他vlan的报文时, RenixC能够收到 报文原vlan + 外层 vlan 500的报文 (需要portB和portD都配置允许该vlan通行)
  testHelper.startCapture(RenixPort.C);
  testHelper.addPktSender({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 44, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  });
  testHelper.addPktChecker({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ee",
        src: "00:00:a0:0a:00:66",
        type: 0x8100,
      })
      .setVLAN({ vlan: 500, type: 0x8100 })
      .setVLAN({ vlan: 44, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  });

  // (携带vlan 100 200的报文从PortD接口出时, 会剥离两层tag)
  testHelper.startCapture(RenixPort.A);
  testHelper.addPktSender({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ec",
        src: "00:00:a0:0a:00:6c",
        type: 0x8100,
      })
      .setVLAN({ vlan: 200, type: 0x8100 })
      .setVLAN({ vlan: 100, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  });
  testHelper.addPktChecker({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ec",
        src: "00:00:a0:0a:00:6c",
        type: 0x0800,
      })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  });

  // (携带vlan 200 300的报文从PortD接口出时, 会替换为vlan 123)
  testHelper.startCapture(RenixPort.A);
  testHelper.addPktSender({
    port: RenixPort.C,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ec",
        src: "00:00:a0:0a:00:6c",
        type: 0x8100,
      })
      .setVLAN({ vlan: 300, type: 0x8100 })
      .setVLAN({ vlan: 200, type: 0x0800 })
      .setIPv4({ src: "1.1.1.1", dst: "2.2.2.2" }),
    transmit_param: {
      mode: TransmitMode.STEP,
      param: {
        step_count: 10,
      },
    },
  });
  testHelper.addPktChecker({
    port: RenixPort.A,
    packet: new PacketBuilder()
      .setEthernet({
        dst: "00:00:01:00:00:ec",
        src: "00:00:a0:0a:00:6c",
        type: 0x8100,
      })
      .setVLAN({ vlan: 123, type: 0x0800 })
      .setIPv4({
        src: "1.1.1.1",
        dst: "2.2.2.2",
      }),
    expected_count: 10,
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    "vlan database",
    "no vlan 2-500",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no mpls-vpls v1 flex-vlan-range-group 1",
    "switchport mode access",
    "exit",
    `interface ${Port.B}`,
    "switchport mode access",
    "exit",
    "no vlan mapping table vm",
    "no ethernet evc 1",
    "no ethernet evc 2",
    "no ethernet evc 3",
    "no ethernet evc 4",
    "no ethernet evc 6",
    "no raw vlan group 1",
    "no interface loopback 0",
    "no mpls vpls v1",
    "no router rip",
    "no router ldp",
    "no raw vlan group 1",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    "no interface loopback 0",
    "no router rip",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no mpls-vpls v1 vlan 2",
    "switchport mode access",
    "exit",
    "no interface loopback 0",
    "no mpls vpls v1",
    "no router rip",
    "no router ldp",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
