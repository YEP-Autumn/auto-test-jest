import { Port } from "../../utils";
import { TestHelper } from "../../utils/TestHelper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *                    +--------+                   +--------+ 
 *  RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortD <=> RenixB
 *                    +--------+                   +--------+
 *
 */

test("配置静态VPWS", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 8.8.8.1/24",
    "exit",
    `interface ${Port.D}`,
    "mpls-l2-circuit t2 ethernet",
    "exit",
    "interface loopback0",
    "ip address 192.168.10.10/32",
    "exit",
    "mpls ftn-entry 192.168.11.0/24 111 8.8.8.2",
    "mpls l2-circuit t2 201 192.168.11.10 raw manual",
    "mpls l2-circuit-fib-entry t2 44 33",
    "mpls ilm-entry pop 222",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 8.8.8.2/24",
    "exit",
    `interface ${Port.D}`,
    "mpls-l2-circuit t2 ethernet",
    "exit",
    "interface loopback0",
    "ip address 192.168.11.10/32",
    "exit",
    "mpls ftn-entry 192.168.10.0/24 222 8.8.8.1",
    "mpls l2-circuit t2 201 192.168.10.10 raw manual",
    "mpls l2-circuit-fib-entry t2 33 44",
    "mpls ilm-entry pop 111",
    "end",
  ]);
  testHelper.sleep(5000);

  testHelper.ExecRetMatchDutB("show mpls l2-circuit", /t2.*?201/g);
  testHelper.ExecRetMatchDutB("show mpls vc-table", /201.*?33\/44/g);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "no mpls-l2-circuit t2",
    "exit",
    "no interface loopback0",
    "no mpls ftn-entry 192.168.11.0/24 8.8.8.2",
    "no mpls l2-circuit t2",
    "no mpls ilm-entry 222",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "no mpls-l2-circuit t2",
    "exit",
    "no interface loopback0",
    "no mpls l2-circuit t2",
    "no mpls ftn-entry 192.168.10.0/24 8.8.8.1",
    "no mpls ilm-entry 111",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
