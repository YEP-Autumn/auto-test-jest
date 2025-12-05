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
test("", async () => {
  // testHelper.ExecConfigDutA([
  //   "configure terminal",
  //   `interface ${Port.A}`,
  //   "no switchport",
  //   "label-switching",
  //   "ip address 11.11.9.1/24",
  //   "enable-ldp",
  //   "end",
  // ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "enable-ldp",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "enable-ldp",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "label-switching",
    "enable-ldp",
    "exit",
    "no interface loopback0",
    "end",
  ]);

  testHelper.sleep(3000);

  // testHelper.ExecRetMatchDutB("show link", /eth-0-4    5GBASE_T    5Gb\/s/);
  testHelper.ExecRetMatchDutC("show link", /eth-0-4    5GBASE_T    5Gb\/s/);
  testHelper.ExecRetMatchDutC("show link", /eth-0-5    5GBASE_T    5Gb\/s/);
  testHelper.ExecRetMatchDutC("show link", /eth-0-6    5GBASE_T    5Gb\/s/);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    "exit",
    "interface loopback0",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.C}`,
    "switchport",
    "disable-ldp",
    "exit",
    "no interface loopback0",
    "end",
  ]);

  // testHelper.ExecConfigDutA([
  //   "configure terminal",
  //   `interface ${Port.A}`,
  //   "switchport",
  //   "disable-ldp",
  //   "end",
  // ]);

  // testHelper.ExecConfigDutB([
  //   "configure terminal",
  //   `interface ${Port.B}`,
  //   "switchport",
  //   "disable-ldp",
  //   "exit",
  //   `interface ${Port.A}`,
  //   "switchport",
  //   "disable-ldp",
  //   "exit",
  //   "no interface loopback 0",
  // "no router rip",
  //   "no router ldp",
  //   "end",
  // ]);

  // testHelper.ExecConfigDutC([
  //   "configure terminal",
  //   `interface ${Port.B}`,
  //   "switchport",
  //   "disable-ldp",
  // "exit",
  // "no mpls vpls v4",
  // "no interface loopback 0",
  // "no router rip",
  // "no router ldp",
  //   "end",
  // ]);

  testHelper.sleep(3000);

  let cnt = 0;
  while (true) {
    console.log(chalk.bgBlueBright.white(`第${++cnt}次测试`));
    await testHelper.startTest();
    expect(testHelper.result()).toBeTruthy();
  }
});
