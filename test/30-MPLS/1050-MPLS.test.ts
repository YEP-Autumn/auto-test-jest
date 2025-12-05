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
    `interface ${Port.A}`,
    "no switchport",
    "ip address 11.11.9.2/24",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 11.11.13.2/24",
    "exit",
    "end",
  ]);

  testHelper.sleep(880);
  // testHelper.sleep(380);

  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 11.11.13.4/24",
    "end",
  ]);

  testHelper.sleep(8000);

  testHelper.ExecRetMatchDutA("show link", /eth-0-1    5GBASE_T    5Gb\/s/);
  testHelper.ExecRetMatchDutB("show link", /eth-0-1    5GBASE_T    5Gb\/s/);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  testHelper.sleep(500);

  let cnt = 0;
  let test_cnt = 100;
  while (test_cnt-- > 0) {
    console.log(chalk.bgBlueBright.white(`第${++cnt}次测试`));
    await testHelper.startTest();
    expect(testHelper.result()).toBeTruthy();
  }
});
