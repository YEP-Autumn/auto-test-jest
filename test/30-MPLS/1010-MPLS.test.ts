import chalk from "chalk";
import { Port } from "../../utils";
import { TestHelper } from "../../utils/TestHelper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *                    +--------+                   +--------+
 *  RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
 *                    +--------+                   +--------+    |
 *                                                               |
 *                                                 +--------+    |
 *                               RenixB <=> PortD--|  DUTC  |--PortB
 *                                                 +--------+
 */
test("配置MPLS VPLS", async () => {
  // testHelper.ExecConfigDutA([
  //   "configure terminal",
  //   `interface ${Port.A}`,
  //   "no switchport",
  //   "label-switching",
  //   "ip address 11.11.9.1/24",
  //   "enable-ldp",
  //   "exit",
  //   `interface ${Port.D}`,
  //   "switchport mode trunk",
  //   "mpls-vpls v1 vlan 2",
  //   "exit",
  //   "interface loopback0",
  //   "ip address 11.11.1.1/32",
  //   "exit",
  //   "mpls vpls v1 100",
  //   "vpls-peer 11.11.4.4 raw",
  //   "exit",
  //   "router rip",
  //   "network 11.11.0.0/16",
  //   "exit",
  //   "router ldp",
  //   "router-id 11.11.1.1",
  //   "targeted-peer 11.11.4.4",
  //   "transport-address 11.11.1.1",
  //   "end",
  // ]);

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
    // "interface loopback0",
    // "ip address 11.11.2.2/32",
    // "exit",
    // "router rip",
    // "network 11.11.0.0/16",
    // "exit",
    // "router ldp",
    // "router-id 11.11.2.2",
    "end",
  ]);

  testHelper.sleep(750);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.13.4/24",
    "enable-ldp",
    // "exit",
    // `interface ${Port.D}`,
    // "switchport mode trunk",
    // "mpls-vpls v4 vlan 2",
    // "exit",
    // "interface loopback0",
    // "ip address 11.11.4.4/32",
    // "exit",
    // "mpls vpls v4 100",
    // "vpls-peer 11.11.1.1 raw",
    // "exit",
    // "router rip",
    // "network 11.11.0.0/16",
    // "exit",
    // "router ldp",
    // "router-id 11.11.4.4",
    // "targeted-peer 11.11.1.1",
    // "transport-address 11.11.4.4",
    "end",
  ]);

  testHelper.sleep(8000);

  testHelper.ExecRetMatchDutB("show link", /eth-0-4    5GBASE_T    5Gb\/s/);
  testHelper.ExecRetMatchDutC("show link", /eth-0-4    5GBASE_T    5Gb\/s/);

  // testHelper.ExecConfigDutA([
  //   "configure terminal",
  //   `interface ${Port.A}`,
  //   "switchport",
  //   "disable-ldp",
  //   "exit",
  //   `interface ${Port.D}`,
  //   "no mpls-vpls v1 vlan 2",
  //   "switchport mode access",
  //   "exit",
  //   "no interface loopback 0",
  //   "no mpls vpls v1",
  //   "no router rip",
  //   "no router ldp",
  //   "end",
  // ]);

  let clear_str_b = [
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    // "exit",
    // "no interface loopback 0",
    // "no router rip",
    // "no router ldp",
    "end",
  ];

  let clear_str_c = [
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    // "exit",
    // `interface ${Port.D}`,
    // "no mpls-vpls v4 vlan 2",
    // "switchport mode access",
    // "exit",
    // "no interface loopback 0",
    // "no mpls vpls v4",
    // "no router rip",
    // "no router ldp",
    "end",
  ];

  let clear = false;
  // clear = true;
  if (clear) {
    testHelper.CleanConfigDutB(clear_str_b);
    testHelper.CleanConfigDutC(clear_str_c);
  } else {
    testHelper.ExecConfigDutB(clear_str_b);
    testHelper.ExecConfigDutC(clear_str_c);
  }

  testHelper.sleep(1000);

  let cnt = 0;
  while (true) {
    console.log(chalk.bgBlueBright.white(`第${++cnt}次测试`));
    await testHelper.startTest();
    expect(testHelper.result()).toBeTruthy();
  }
});
