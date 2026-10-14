import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("组合：control-plane ACL + class-map type control-plane + policy-map type control-plane（03-cp-acl-in-policy）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "control-plane access-list TC_C_CPACL",
    "10 permit exception any",
    "20 permit exception tcp untag-vlan ipv4 tcp any any dst-port eq 22",
    "end",
    "configure terminal",
    "class-map type control-plane TC_C_CM_CP",
    "match access-group TC_C_CPACL",
    "end",
    "configure terminal",
    "policy-map type control-plane TC_C_PM_CP",
    "class type control-plane TC_C_CM_CP",
    "policer cir 100 statistics",
    "quit",
    "end",
  ]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "control-plane access-list TC_C_CPACL",
      "class-map type control-plane TC_C_CM_CP",
      "match access-group TC_C_CPACL",
      "policy-map type control-plane TC_C_PM_CP",
      "policer cir 100",
    ],
    false,
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no policy-map TC_C_PM_CP",
    "no class-map TC_C_CM_CP",
    "no control-plane access-list TC_C_CPACL",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
