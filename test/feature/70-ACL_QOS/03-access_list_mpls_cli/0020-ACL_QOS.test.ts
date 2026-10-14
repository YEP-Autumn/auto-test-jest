import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("MPLS ACL extend 满参数 rule 组合（02-mpls-acl-extend）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "time-range TC_TR_MAX",
    "periodic 08:00 daily to 18:00",
    "end",
    "configure terminal",
    "mpls access-list TC_MPLS_EXT extend",
    "10 permit topmost-label 100 exp 5 ttl 10 next-label 200 exp 3 ttl 8 next-label 300 exp 2 ttl 4 stack-bottom time-range TC_TR_MAX",
    "20 permit src-mac host 0011.2233.4455 dest-mac host 0011.2233.4466 vlan 10 cos 3 inner-vlan 20 inner-cos 4 time-range TC_TR_MAX",
    "30 deny src-mac any dest-mac any vlan 10 cos 3",
    "end",
  ]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "mpls access-list TC_MPLS_EXT extend",
      "10 permit topmost-label 100 exp 5 ttl 10 next-label 200 exp 3 ttl 8 next-label 300 exp 2 ttl 4 stack-bottom time-range TC_TR_MAX",
      "20 permit src-mac host 0011.2233.4455 dest-mac host 0011.2233.4466 vlan 10 cos 3 inner-vlan 20 inner-cos 4 time-range TC_TR_MAX",
      "30 deny src-mac any dest-mac any vlan 10 cos 3",
    ],
    false,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no mpls access-list TC_MPLS_EXT extend",
    "no time-range TC_TR_MAX",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
