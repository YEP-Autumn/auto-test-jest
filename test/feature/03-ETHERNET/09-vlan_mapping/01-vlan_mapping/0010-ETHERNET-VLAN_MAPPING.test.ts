import { Port, TestHelper } from "@/utils";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *          +--------+
 *          |  DUTA  |--PortA
 *          +--------+
 */

describe("VLAN trunk translate 映射表配置", () => {
  test("支持配置单层 raw-vlan 映射并在映射表中显示", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 10,200",
      "exit",
      "ethernet evc 1",
      "dot1q mapped-vlan 200",
      "exit",
      "vlan mapping table vm",
      "raw-vlan 10 evc 1",
      "exit",
      `interface ${Port.A}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk vlan-translation",
      "switchport trunk vlan-translation mapping table vm",
      "switchport trunk allowed vlan all",
      "end",
    ]);

    testHelper.ExecRetMatchDutA(
      "show vlan mapping table",
      new RegExp("vm\\s+1\\s+200\\s+10"),
    );
    testHelper.ExecRetMatchDutA(
      "show vlan mapping table applied-interface",
      new RegExp(`vm\\s+${Port.A}\\s+VLAN Translation`),
    );
    testHelper.ExecRetMatchDutA(
      `show interface switchport interface ${Port.A}`,
      [
        new RegExp("Switchport mode\\s*:\\s*trunk"),
        new RegExp("VLAN traslation\\s*:\\s*enable"),
        new RegExp("VLAN mapping table\\s*:\\s*vm"),
      ],
    );
    testHelper.ExecRetMatchDutA("show running-config", [
      "raw-vlan 10 evc 1",
      "dot1q mapped-vlan 200",
      "switchport trunk vlan-translation",
      "switchport trunk vlan-translation mapping table vm",
    ]);

    testHelper.CleanConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no switchport trunk vlan-translation mapping table",
      "no switchport trunk vlan-translation",
      "switchport mode access",
      "exit",
      "no vlan mapping table vm",
      "no ethernet evc 1",
      "vlan database",
      "no vlan 10,200",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });

  test("支持配置双层 raw-vlan 映射并在映射表中显示", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 100,200,400",
      "exit",
      "ethernet evc 2",
      "dot1q mapped-vlan 400",
      "exit",
      "vlan mapping table vm",
      "raw-vlan 100 200 evc 2",
      "exit",
      `interface ${Port.A}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk vlan-translation",
      "switchport trunk vlan-translation mapping table vm",
      "switchport trunk allowed vlan all",
      "end",
    ]);

    testHelper.ExecRetMatchDutA(
      "show vlan mapping table",
      new RegExp("vm\\s+2\\s+400\\s+200\\(100\\)"),
    );
    testHelper.ExecRetMatchDutA("show running-config", [
      "raw-vlan 100 200 evc 2",
      "dot1q mapped-vlan 400",
    ]);
    testHelper.ExecRetMatchDutA(
      "show vlan mapping table applied-interface",
      new RegExp(`vm\\s+${Port.A}\\s+VLAN Translation`),
    );

    testHelper.CleanConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no switchport trunk vlan-translation mapping table",
      "no switchport trunk vlan-translation",
      "switchport mode access",
      "exit",
      "no vlan mapping table vm",
      "no ethernet evc 2",
      "vlan database",
      "no vlan 100,200,400",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });

  test("支持配置 raw-vlan out-of-range 映射并显示 out-of-range 条目", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 10,11,200,300",
      "exit",
      "ethernet evc 1",
      "dot1q mapped-vlan 200",
      "exit",
      "ethernet evc 2",
      "dot1q mapped-vlan 300",
      "exit",
      "vlan mapping table vm",
      "raw-vlan 10 evc 1",
      "raw-vlan out-of-range evc 2",
      "exit",
      `interface ${Port.A}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk vlan-translation",
      "switchport trunk vlan-translation mapping table vm",
      "switchport trunk allowed vlan all",
      "end",
    ]);

    testHelper.ExecRetMatchDutA("show vlan mapping table", [
      new RegExp("vm\\s+1\\s+200\\s+10"),
      new RegExp("\\b2\\s+300\\s+out-of-range"),
    ]);
    testHelper.ExecRetMatchDutA("show running-config", [
      "raw-vlan 10 evc 1",
      "raw-vlan out-of-range evc 2",
    ]);
    testHelper.ExecRetMatchDutA(
      "show vlan mapping table applied-interface",
      new RegExp(`vm\\s+${Port.A}\\s+VLAN Translation`),
    );

    testHelper.CleanConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no switchport trunk vlan-translation mapping table",
      "no switchport trunk vlan-translation",
      "switchport mode access",
      "exit",
      "no vlan mapping table vm",
      "no ethernet evc 1",
      "no ethernet evc 2",
      "vlan database",
      "no vlan 10,11,200,300",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });

  test("支持多个 raw-vlan 映射同一 EVC 并在配置中合并显示", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 10,20,200",
      "exit",
      "ethernet evc 1",
      "dot1q mapped-vlan 200",
      "exit",
      "vlan mapping table vm",
      "raw-vlan 10 evc 1",
      "raw-vlan 20 evc 1",
      "exit",
      `interface ${Port.A}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk vlan-translation",
      "switchport trunk vlan-translation mapping table vm",
      "switchport trunk allowed vlan all",
      "end",
    ]);

    testHelper.ExecRetMatchDutA(
      "show vlan mapping table",
      new RegExp("vm\\s+1\\s+200\\s+10,\\s+20"),
    );
    testHelper.ExecRetMatchDutA("show running-config", "raw-vlan 10,20 evc 1");
    testHelper.ExecRetMatchDutA(
      "show vlan mapping table applied-interface",
      new RegExp(`vm\\s+${Port.A}\\s+VLAN Translation`),
    );

    testHelper.CleanConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no switchport trunk vlan-translation mapping table",
      "no switchport trunk vlan-translation",
      "switchport mode access",
      "exit",
      "no vlan mapping table vm",
      "no ethernet evc 1",
      "vlan database",
      "no vlan 10,20,200",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });

  test("支持不同 EVC 使用相同 mapped VLAN 并分别显示映射条目", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 10,20,200",
      "exit",
      "ethernet evc 1",
      "dot1q mapped-vlan 200",
      "exit",
      "ethernet evc 2",
      "dot1q mapped-vlan 200",
      "exit",
      "vlan mapping table vm",
      "raw-vlan 10 evc 1",
      "raw-vlan 20 evc 2",
      "exit",
      `interface ${Port.A}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk vlan-translation",
      "switchport trunk vlan-translation mapping table vm",
      "switchport trunk allowed vlan all",
      "end",
    ]);

    testHelper.ExecRetMatchDutA("show vlan mapping table", [
      new RegExp("vm\\s+1\\s+200\\s+10"),
      new RegExp("\\b2\\s+200\\s+20"),
    ]);
    testHelper.ExecRetMatchDutA("show running-config", [
      "raw-vlan 10 evc 1",
      "raw-vlan 20 evc 2",
    ]);
    testHelper.ExecRetMatchDutA(
      "show vlan mapping table applied-interface",
      new RegExp(`vm\\s+${Port.A}\\s+VLAN Translation`),
    );

    testHelper.CleanConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no switchport trunk vlan-translation mapping table",
      "no switchport trunk vlan-translation",
      "switchport mode access",
      "exit",
      "no vlan mapping table vm",
      "no ethernet evc 1",
      "no ethernet evc 2",
      "vlan database",
      "no vlan 10,20,200",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });
});
