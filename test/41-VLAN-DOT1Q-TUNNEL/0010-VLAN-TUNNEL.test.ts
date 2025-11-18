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
 *                    +--------+
 *  RenixA <=> PortA--|  DUTA  |--PortB <=> RenixB
 *                    +--------+
 */

test("支持配置 1 to 1 vlan translate", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "vlan database",
    "vlan 2-200",
    "exit",
    "ethernet evc 1",
    "dot1q mapped-vlan 200",
    "exit",
    "vlan mapping table vm",
    "raw-vlan-translate 10 evc 1",
    "exit",
    `interface ${Port.A}`,
    `switchport mode dot1q-tunnel`,
    `switchport dot1q-tunnel allowed vlan all`,
    `switchport dot1q-tunnel type flex`,
    `switchport dot1q-tunnel vlan mapping table vm`,
    `exit`,
    `interface ${Port.B}`,
    `switchport mode trunk`,
    `switchport trunk allowed vlan all`,
    "end",
  ]);

  testHelper.sleep(5000);

  /**
   * RenixA发送vlan 10的报文，RenixB能够收到vlan 200的报文
   * RenixB发送vlan 200的报文，RenixB能够收到vlan 10的报文
   */

  testHelper.CleanConfigDutA([
    "configure terminal",
    "vlan database",
    "no vlan 2-200",
    "exit",
    `interface ${Port.A}`,
    `switchport mode access`,
    `exit`,
    `interface ${Port.B}`,
    `switchport mode access`,
    "exit",
    "no vlan mapping table vm",
    "no ethernet evc 1",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});

test("配置不同vlan映射到相同vlan后, egress方向不会还原vlan tag", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "vlan database",
    "vlan 2-200",
    "exit",
    "ethernet evc 1",
    "dot1q mapped-vlan 200",
    "exit",
    "vlan mapping table vm",
    "raw-vlan-translate 10 evc 1",
    "raw-vlan-translate 20 evc 1",
    "exit",
    `interface ${Port.A}`,
    `switchport mode dot1q-tunnel`,
    `switchport dot1q-tunnel allowed vlan all`,
    `switchport dot1q-tunnel type flex`,
    `switchport dot1q-tunnel vlan mapping table vm`,
    `exit`,
    `interface ${Port.B}`,
    `switchport mode trunk`,
    `switchport trunk allowed vlan all`,
    "end",
  ]);

  testHelper.sleep(5000);

  /**
   * RenixA发送vlan 10的报文，RenixB能够收到vlan 200的报文
   * RenixA发送vlan 20的报文，RenixB能够收到vlan 200的报文
   * RenixB发送vlan 200的报文，RenixB能够收到vlan 200的报文
   */

  testHelper.CleanConfigDutA([
    "configure terminal",
    "vlan database",
    "no vlan 2-200",
    "exit",
    `interface ${Port.A}`,
    `switchport mode access`,
    `exit`,
    `interface ${Port.B}`,
    `switchport mode access`,
    "exit",
    "no vlan mapping table vm",
    "no ethernet evc 1",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
