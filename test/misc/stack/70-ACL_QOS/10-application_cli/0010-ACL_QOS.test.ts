import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("ACL 绑定到接口（access-group input/output）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip access-list TC_ACL_IF",
    "10 permit tcp any any",
    "20 deny udp any any",
    "end",
    "configure terminal",
    `interface ${Port.A}`,
    "access-group input TC_ACL_IF",
    "access-group output TC_ACL_IF",
    "end",
  ]);

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    ["access-group input TC_ACL_IF", "access-group output TC_ACL_IF"],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no access-group input",
    "no access-group output",
    "end",
    "configure terminal",
    "no ip access-list TC_ACL_IF",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
