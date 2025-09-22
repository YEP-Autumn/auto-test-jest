import { TestHelper } from "../../utils/TestHelper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("配置LDP功能", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "interface eth-0-1",
    "no switchport",
    "label-switching",
    "ip address 11.11.17.1/24",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 1.1.1.1/32",
    "exit",
    "router rip",
    "network 0.0.0.0/0",
    "exit",
    "router ldp",
    "router-id 1.1.1.1",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "interface eth-0-1",
    "no switchport",
    "label-switching",
    "ip address 11.11.17.2/24",
    "enable-ldp",
    "exit",
    "interface eth-0-2",
    "no switchport",
    "label-switching",
    "ip address 11.11.9.1/24",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "exit",
    "router rip",
    "network 0.0.0.0/0",
    "exit",
    "router ldp",
    "router-id 2.2.2.2",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    "interface eth-0-2",
    "no switchport",
    "label-switching",
    "ip address 11.11.9.2/24",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 3.3.3.3/32",
    "exit",
    "router rip",
    "network 0.0.0.0/0",
    "exit",
    "router ldp",
    "router-id 3.3.3.3",
    "end",
  ]);

  testHelper.sleep(25000);

  testHelper.ExecRetMatchDutB("show ldp session", /1.1.1.1.*?OPERATIONAL/g);
  testHelper.ExecRetMatchDutB("show ldp session", /3.3.3.3.*?OPERATIONAL/g);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "interface eth-0-1",
    "switchport",
    "disable-ldp",
    "exit",
    "no interface loopback0",
    "no router ldp",
    "no router rip",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "interface eth-0-1",
    "switchport",
    "disable-ldp",
    "exit",
    "interface eth-0-2",
    "switchport",
    "disable-ldp",
    "exit",
    "no interface loopback0",
    "no router ldp",
    "no router rip",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    "interface eth-0-2",
    "switchport",
    "disable-ldp",
    "exit",
    "no interface loopback0",
    "no router ldp",
    "no router rip",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
}, 300000);
