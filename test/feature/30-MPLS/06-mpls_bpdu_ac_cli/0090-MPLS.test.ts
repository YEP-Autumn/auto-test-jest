import { Port } from "../../../../../utils";
import { TestHelper } from "../../../../../utils/test-helper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("测试每个接口最多配置一个bpdu ac", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "mpls-vpls v1 bpdu-forward",
  ]);

  testHelper.ExecRetMatchDutA(
    "mpls-vpls v2 bpdu-forward",
    "MPLS BPDU forward ac only can config one",
  );
  testHelper.ExecRetMatchDutA(
    "mpls-l2-circuit t1 bpdu-forward",
    "MPLS BPDU forward ac only can config one",
  );

  testHelper.CleanConfigDutA(["end"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no mpls-vpls v1 bpdu-forward",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
