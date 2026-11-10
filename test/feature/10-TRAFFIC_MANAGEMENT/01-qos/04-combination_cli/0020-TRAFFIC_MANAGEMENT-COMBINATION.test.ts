import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("组合：MAC ACL 用于 class-map match access-group", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "mac access-list TC_C_MAC",
    "10 permit src-mac any vlan 10",
    "end",
    "configure terminal",
    "class-map type qos TC_C_CM_MAC",
    "match access-group TC_C_MAC",
    "end",
  ]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "mac access-list TC_C_MAC",
      "10 permit src-mac any dest-mac any vlan 10",
      "class-map type qos TC_C_CM_MAC",
      "match access-group TC_C_MAC",
    ],
    false,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no class-map TC_C_CM_MAC",
    "no mac access-list TC_C_MAC",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
