import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("ARP ACL 满参数 rule 组合", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "arp access-list TC_ARP",
    "10 permit request ip host 192.168.1.1 mac 0011.2233.4455 0000.0000.ffff",
    "20 deny response ip 10.0.0.0 0.0.0.255 mac any",
    "30 permit ip any mac any",
    "40 deny ip 10.9.0.0 0.0.0.255 mac host 0011.2233.4466",
    "end",
  ]);

  testHelper.CleanConfigDutA(["stack connect slot 2"]);

  testHelper.ExecRetMatchDutA(
    "show running-config",
    [
      "arp access-list TC_ARP",
      "10 permit request ip host 192.168.1.1 mac 0011.2233.4455 0000.0000.ffff",
      "20 deny response ip 10.0.0.0 0.0.0.255 mac any",
      "40 deny ip 10.9.0.0 0.0.0.255 mac host 0011.2233.4466",
      "30 permit ip any mac any",
    ],
    false,
  );

  testHelper.CleanConfigDutA(["exit"]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no arp access-list TC_ARP",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
