import { TestHelper } from "../../utils/TestHelper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("使用LDP配置VPWS", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "interface eth-0-1",
    "no switchport",
    "label-switching",
    "ip address 8.8.8.1/24",
    "enable-ldp",
    "exit",
    "interface eth-0-39",
    "mpls-l2-circuit t1 ethernet",
    "exit",
    "interface loopback0",
    "ip address 192.168.10.10/32",
    "exit",
    "router rip",
    "network 0.0.0.0/0",
    "exit",
    "router ldp",
    "router-id 192.168.10.10",
    "targeted-peer 192.168.11.10",
    "exit",
    "mpls l2-circuit t1 200 192.168.11.10 raw",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    "interface eth-0-1",
    "no switchport",
    "label-switching",
    "ip address 8.8.8.2/24",
    "enable-ldp",
    "exit",
    "interface eth-0-9",
    "mpls-l2-circuit t1 ethernet",
    "exit",
    "interface loopback0",
    "ip address 192.168.11.10/32",
    "exit",
    "router rip",
    "network 0.0.0.0/0",
    "exit",
    "router ldp",
    "router-id 192.168.11.10",
    "targeted-peer 192.168.10.10",
    "exit",
    "mpls l2-circuit t1 200 192.168.10.10 raw",
    "end",
  ]);
  testHelper.sleep(25000);

  testHelper.ExecRetMatchDutB("show mpls l2-circuit", /t1.*?200 /g);
  testHelper.ExecRetMatchDutB(
    "show mpls vc-table",
    /200.*?192.168.10.10.*?Active/g
  );

  testHelper.CleanConfigDutA([
    "configure terminal",
    "interface eth-0-1",
    "switchport",
    "disable-ldp",
    "exit",
    "interface eth-0-39",
    "no mpls-l2-circuit t1",
    "exit",
    "no interface loopback 0",
    "no router rip",
    "no router ldp",
    "no mpls l2-circuit t1",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "interface eth-0-1",
    "switchport",
    "disable-ldp",
    "exit",
    "interface eth-0-9",
    "no mpls-l2-circuit t1",
    "exit",
    "no interface loopback 0",
    "no router rip",
    "no router ldp",
    "no mpls l2-circuit t1",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
}, 300000);
