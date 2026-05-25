import { Port } from "../../../../utils";
import { TestHelper } from "../../../../utils/TestHelper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("测试vpws 在access接口配置bpdu-forward ac后无法再配置其他类型AC", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "mpls-l2-circuit t1 bpdu-forward",
  ]);

  testHelper.ExecRetMatchDutA(
    "mpls-l2-circuit t1 ethernet",
    "already bound to VPWS, VPLS or Layer-3 VPN instance",
  );

  testHelper.ExecRetMatchDutA(
    "mpls-vpls v1 ethernet",
    "already bound to VPWS, VPLS or Layer-3 VPN instance",
  );

  testHelper.CleanConfigDutA(["end"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no mpls-l2-circuit t1 bpdu-forward",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
