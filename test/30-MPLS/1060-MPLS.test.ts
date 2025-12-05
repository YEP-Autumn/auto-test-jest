import chalk from "chalk";
import { Port } from "../../utils";
import { TestHelper } from "../../utils/TestHelper";

let testHelper: TestHelper;

beforeAll(async () => {});

afterAll(async () => {});

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
  let cnt = 0;
  while (true) {
    testHelper = await new TestHelper().init();

    testHelper.ExecConfigDutA([
      "configure terminal",
      `interface ${Port.B}`,
      "no switchport",
      // "label-switching",
      "ip address 11.11.12.2/24",
      // "enable-ldp",
      "exit",
      `interface ${Port.A}`,
      "no switchport",
      // "label-switching",
      "ip address 11.11.9.2/24",
      // "enable-ldp",
      "exit",
      "end",
    ]);

    testHelper.sleep(1500);
    // let t = 1000 * Math.random();
    // testHelper.sleep(t > 500 ? t : t + 500);

    testHelper.ExecConfigDutC([
      "configure terminal",
      `interface ${Port.B}`,
      "no switchport",
      // "label-switching",
      "ip address 11.11.12.4/24",
      // "enable-ldp",
      "end",
    ]);

    testHelper.sleep(8000);

    // testHelper.ExecRetMatchDutB("show link", /eth-0-4    5GBASE_T    5Gb\/s/);
    // testHelper.ExecRetMatchDutC("show link", /eth-0-4    5GBASE_T    5Gb\/s/);

    testHelper.ExecRetMatchDutA("show link", /eth-0-19   5GBASE_T    5Gb\/s/);
    testHelper.ExecRetMatchDutC("show link", /eth-0-19   5GBASE_T    5Gb\/s/);

    testHelper.ExecConfigDutA([
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

    testHelper.sleep(1000);

    console.log(chalk.bgBlueBright.white(`第${++cnt}次测试`));
    await testHelper.startTest();
    expect(testHelper.result()).toBeTruthy();
    await testHelper.destroy();
  }
});
