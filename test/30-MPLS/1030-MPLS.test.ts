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
  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.13.2/24",
    // "enable-ldp",
    "exit",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.9.2/24",
    // "enable-ldp",
    "exit",
    "end",
  ]);

  testHelper.sleep(880);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 11.11.13.4/24",
    // "enable-ldp",
    "end",
  ]);

  testHelper.sleep(8000);

  testHelper.ExecRetMatchDutB("show link", /eth-0-4    5GBASE_T    5Gb\/s/);
  testHelper.ExecRetMatchDutC("show link", /eth-0-4    5GBASE_T    5Gb\/s/);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    // "disable-ldp",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    // "disable-ldp",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    // "disable-ldp",
    "end",
  ]);

  testHelper.sleep(500);

  let cnt = 0;
  while (true) {
    console.log(chalk.bgBlueBright.white(`第${++cnt}次测试`));
    await testHelper.startTest();
    expect(testHelper.result()).toBeTruthy();
  }
});
