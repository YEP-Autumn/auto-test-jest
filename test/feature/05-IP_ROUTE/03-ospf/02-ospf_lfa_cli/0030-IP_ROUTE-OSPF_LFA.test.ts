import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * unnumbered 接口能力探测：当前软件版本不提供 `ip unnumbered` 命令。
 * 本用例验证命令被明确拒绝，且不产生残留配置；能力具备后应改为
 * 正向功能用例，验证 unnumbered 接口上的 OSPF 邻居与 LFA 备份路径。
 *
 * 设备实测：
 *   Switch(config-if)# ip unnumbered ?
 *   % Unrecognized command
 */
test("当前版本不支持 unnumbered 接口时，ip unnumbered 命令被明确拒绝", async () => {
  testHelper.ExecCustomDutA(async (dut) => {
    await dut.safeExec("configure terminal");
    await dut.safeExec(`interface ${Port.A}`);
    await dut.safeExec("no switchport");

    const helpOutput = await dut.safeExec("ip unnumbered ?");
    const cmdOutput = await dut.safeExec("ip unnumbered loopback0");

    await dut.safeExec("switchport");
    await dut.safeExec("end");

    const rejected = (text: string) =>
      text.includes("Unrecognized command") ||
      text.includes("Invalid input detected");
    return rejected(helpOutput) && rejected(cmdOutput);
  });

  testHelper.ExecRetMatchDutA(
    "show running-config | include ip unnumbered",
    "ip unnumbered",
    true,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
