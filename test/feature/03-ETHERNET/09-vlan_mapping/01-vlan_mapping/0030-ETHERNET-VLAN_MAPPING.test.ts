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

describe("VLAN trunk translate 配置限制", () => {
  test("带 VLAN tag 的 raw-vlan 不能关联双层 tag 的 EVC", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 30,100,200",
      "exit",
      "ethernet evc 5",
      "dot1q mapped-double-vlan 100 200",
      "exit",
      "vlan mapping table vm",
      "exit",
      "end",
    ]);

    testHelper.ExecCustomDutA(async (dut) => {
      await dut.safeExec("configure terminal");
      await dut.safeExec("vlan mapping table vm");
      const out = await dut.safeExec("raw-vlan 30 evc 5");
      await dut.safeExec("end");
      return out.includes("% Only untagged packet can be added two tags");
    });

    testHelper.ExecRetMatchDutA(
      "show vlan mapping table",
      new RegExp("\\b30\\b"),
      true,
    );

    testHelper.CleanConfigDutA([
      "configure terminal",
      "no vlan mapping table vm",
      "no ethernet evc 5",
      "vlan database",
      "no vlan 30,100,200",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });

  test("含 raw-vlan group 的映射表不能应用到 trunk VLAN 转换接口", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 30-40,200",
      "exit",
      "raw vlan group 1 vlan 30-40",
      "ethernet evc 1",
      "dot1q mapped-vlan 200",
      "exit",
      "vlan mapping table vm",
      "raw-vlan group 1 evc 1",
      "exit",
      `interface ${Port.A}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk vlan-translation",
      "exit",
      "end",
    ]);

    testHelper.ExecCustomDutA(async (dut) => {
      await dut.safeExec("configure terminal");
      await dut.safeExec(`interface ${Port.A}`);
      const out = await dut.safeExec(
        "switchport trunk vlan-translation mapping table vm",
      );
      await dut.safeExec("end");
      return out.includes("% VLAN mapping table owns raw group");
    });

    testHelper.ExecRetMatchDutA(
      "show vlan mapping table applied-interface",
      new RegExp(Port.A),
      true,
    );

    testHelper.CleanConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no switchport trunk vlan-translation",
      "switchport mode access",
      "exit",
      "no vlan mapping table vm",
      "no ethernet evc 1",
      "no raw vlan group 1",
      "vlan database",
      "no vlan 30-40,200",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });

  test("含 raw-vlan untagged 的映射表不能应用到 trunk VLAN 转换接口", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 200",
      "exit",
      "ethernet evc 1",
      "dot1q mapped-vlan 200",
      "exit",
      "vlan mapping table vm",
      "raw-vlan untagged evc 1",
      "exit",
      `interface ${Port.A}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk vlan-translation",
      "exit",
      "end",
    ]);

    testHelper.ExecCustomDutA(async (dut) => {
      await dut.safeExec("configure terminal");
      await dut.safeExec(`interface ${Port.A}`);
      const out = await dut.safeExec(
        "switchport trunk vlan-translation mapping table vm",
      );
      await dut.safeExec("end");
      return out.includes(
        "% Can't apply VLAN mapping table, untagged raw vlan entry exist",
      );
    });

    testHelper.ExecRetMatchDutA(
      "show vlan mapping table applied-interface",
      new RegExp(Port.A),
      true,
    );

    testHelper.CleanConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no switchport trunk vlan-translation",
      "switchport mode access",
      "exit",
      "no vlan mapping table vm",
      "no ethernet evc 1",
      "vlan database",
      "no vlan 200",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });

  test("含 egress-vlan 的映射表不能应用到 trunk VLAN 转换接口", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 100,111,200",
      "exit",
      "vlan mapping table vm",
      "raw-vlan 100 200 egress-vlan 111",
      "exit",
      `interface ${Port.A}`,
      "switchport",
      "switchport mode trunk",
      "switchport trunk vlan-translation",
      "exit",
      "end",
    ]);

    testHelper.ExecCustomDutA(async (dut) => {
      await dut.safeExec("configure terminal");
      await dut.safeExec(`interface ${Port.A}`);
      const out = await dut.safeExec(
        "switchport trunk vlan-translation mapping table vm",
      );
      await dut.safeExec("end");
      return out.includes(
        "% Can't apply VLAN mapping table, egress vlan mapping entry exist",
      );
    });

    testHelper.ExecRetMatchDutA(
      "show vlan mapping table applied-interface",
      new RegExp(Port.A),
      true,
    );

    testHelper.CleanConfigDutA([
      "configure terminal",
      `interface ${Port.A}`,
      "no switchport trunk vlan-translation",
      "switchport mode access",
      "exit",
      "no vlan mapping table vm",
      "vlan database",
      "no vlan 100,111,200",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });

  test("相同的 raw-vlan 不能映射到不同的 EVC", async () => {
    testHelper.ExecConfigDutA([
      "configure terminal",
      "vlan database",
      "vlan 10,200,210",
      "exit",
      "ethernet evc 1",
      "dot1q mapped-vlan 200",
      "exit",
      "ethernet evc 2",
      "dot1q mapped-vlan 210",
      "exit",
      "vlan mapping table vm",
      "raw-vlan 10 evc 1",
      "exit",
      "end",
    ]);

    testHelper.ExecCustomDutA(async (dut) => {
      await dut.safeExec("configure terminal");
      await dut.safeExec("vlan mapping table vm");
      const out = await dut.safeExec("raw-vlan 10 evc 2");
      await dut.safeExec("end");
      return out.includes("% VLAN mapping entry exist for raw vlan 10");
    });

    testHelper.ExecCustomDutA(async (dut) => {
      const out = await dut.safeExec("show vlan mapping table");
      return /vm\s+1\s+200\s+10/.test(out) && !/210/.test(out);
    });

    testHelper.CleanConfigDutA([
      "configure terminal",
      "no vlan mapping table vm",
      "no ethernet evc 1",
      "no ethernet evc 2",
      "vlan database",
      "no vlan 10,200,210",
      "exit",
      "end",
    ]);

    await testHelper.startTest();

    expect(testHelper.result()).toBeTruthy();
  });
});
