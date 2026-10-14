import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("接口 trust / qos shape rate / service-policy type traffic-class（05-interface-trust-shape）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "class-map type traffic-class TC_IF_TC",
    "match traffic-class 1",
    "end",
    "configure terminal",
    "policy-map type traffic-class TC_IF_PM",
    "class type traffic-class TC_IF_TC",
    "priority level 1",
    "quit",
    "end",
    "configure terminal",
    "interface eth-0-1",
    "trust dscp",
    "end",
    "configure terminal",
    "interface eth-0-2",
    "trust cos stag-cos",
    "end",
    "configure terminal",
    "interface eth-0-3",
    "trust cos ctag-cos",
    "end",
    "configure terminal",
    "interface eth-0-4",
    "trust port",
    "end",
    "configure terminal",
    "interface eth-0-5",
    "qos shape rate 1000",
    "end",
    "configure terminal",
    "interface eth-0-6",
    "qos shape rate pir 1000",
    "end",
    "configure terminal",
    "interface eth-0-7",
    "qos shape rate 1000 ecn-percentage 60",
    "end",
    "configure terminal",
    "interface eth-0-8",
    "qos shape rate pir 1000 ecn-percentage 60",
    "end",
    "configure terminal",
    "interface eth-0-9",
    "service-policy type traffic-class TC_IF_PM",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "trust dscp",
    "trust cos stag-cos",
    "trust cos ctag-cos",
    "trust port",
    "qos shape rate pir 1000",
    "qos shape rate pir 1000 ecn-percentage 60",
    "service-policy type traffic-class TC_IF_PM",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "interface eth-0-1",
    "no trust",
    "end",
    "configure terminal",
    "interface eth-0-2",
    "no trust",
    "end",
    "configure terminal",
    "interface eth-0-3",
    "no trust",
    "end",
    "configure terminal",
    "interface eth-0-4",
    "no trust",
    "end",
    "configure terminal",
    "interface eth-0-5",
    "no qos shape rate",
    "end",
    "configure terminal",
    "interface eth-0-6",
    "no qos shape rate",
    "end",
    "configure terminal",
    "interface eth-0-7",
    "no qos shape rate",
    "end",
    "configure terminal",
    "interface eth-0-8",
    "no qos shape rate",
    "end",
    "configure terminal",
    "interface eth-0-9",
    "no service-policy type traffic-class",
    "end",
    "configure terminal",
    "no policy-map TC_IF_PM",
    "no class-map TC_IF_TC",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
