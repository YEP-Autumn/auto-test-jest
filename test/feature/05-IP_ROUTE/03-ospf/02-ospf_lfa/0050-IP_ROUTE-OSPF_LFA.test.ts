import { Port } from "@/utils";
import { TestHelper } from "@/utils/test-helper";
import { LinkConstraint } from "@/utils/topo/link-constraint";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.four_devices_topo_links_type_3,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

function protectedCount(output: string): number {
  const match = /Protected by LFA\s*:\s*(\d+)/.exec(output);
  return match ? Number(match[1]) : -1;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 接口 LFA 角色：候选接口禁用后，该接口不能再作为其他前缀的备份下一跳；
 * 受保护接口禁用后，该接口上的主路径前缀不再被 LFA 保护。
 * 两种操作都应使 DUTA 的 `Protected by LFA` 计数下降，恢复配置后计数回升。
 *
 *    +--------+                   +--------+
 *    |  DUTA  |--PortA <=> PortA--|  DUTB  |
 *    +--------+                   +--------+
 *        |                            |
 *      PortD                        PortB
 *        |                            |
 *      PortD                        PortB
 *        |                            |
 *    +--------+                   +--------+
 *    |  DUTD  |--PortC <=> PortC--|  DUTC  |
 *    +--------+                   +--------+
 *
 * 公共拓扑、地址与开销与 0010 用例一致：A-D 链路开销为 10，
 * A 到 C 的主路径为 A-B-C，备份路径为 A-D-C。
 */
test("禁用候选接口或受保护接口后，LFA 保护计数按预期下降并可恢复", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.0.12.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 1",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 10.0.41.2/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 1.1.1.1/32",
    "exit",
    "router ospf",
    "network 10.0.12.0/24 area 0",
    "network 10.0.41.0/24 area 0",
    "network 1.1.1.1/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "ip address 10.0.12.2/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.23.1/24",
    "ip ospf network point-to-point",
    "exit",
    "interface loopback0",
    "ip address 2.2.2.2/32",
    "exit",
    "router ospf",
    "network 10.0.12.0/24 area 0",
    "network 10.0.23.0/24 area 0",
    "network 2.2.2.2/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "ip address 10.0.23.2/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.0.34.1/24",
    "ip ospf network point-to-point",
    "exit",
    "interface loopback0",
    "ip address 3.3.3.3/32",
    "exit",
    "router ospf",
    "network 10.0.23.0/24 area 0",
    "network 10.0.34.0/24 area 0",
    "network 3.3.3.3/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecConfigDutD([
    "configure terminal",
    `interface ${Port.C}`,
    "no switchport",
    "ip address 10.0.34.2/24",
    "ip ospf network point-to-point",
    "exit",
    `interface ${Port.D}`,
    "no switchport",
    "ip address 10.0.41.1/24",
    "ip ospf network point-to-point",
    "ip ospf cost 10",
    "exit",
    "interface loopback0",
    "ip address 4.4.4.4/32",
    "exit",
    "router ospf",
    "network 10.0.34.0/24 area 0",
    "network 10.0.41.0/24 area 0",
    "network 4.4.4.4/32 area 0",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ReadyCheckDutA("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutB("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutC("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutD("show ip ospf neighbor", "Full", 90_000);
  testHelper.ReadyCheckDutA("show ip ospf route", "3.3.3.3/32", 60_000);
  testHelper.ReadyCheckDutA(
    "show ip ospf fast-reroute per-prefix",
    new RegExp("Protected by LFA\\s*:\\s*[1-9]"),
    60_000,
  );

  testHelper.ExecCustomDutA(async (dut) => {
    const before = protectedCount(
      await dut.safeExec("show ip ospf fast-reroute per-prefix"),
    );
    if (before <= 0) {
      return false;
    }

    // 1) 禁止 PortD 作为备份下一跳，保护计数应下降。
    await dut.safeExec("configure terminal");
    await dut.safeExec(`interface ${Port.D}`);
    await dut.safeExec("ip ospf fast-reroute per-prefix candidate disable");
    await dut.safeExec("end");

    let afterCandidate = before;
    for (let i = 0; i < 15; i++) {
      await wait(2000);
      afterCandidate = protectedCount(
        await dut.safeExec("show ip ospf fast-reroute per-prefix"),
      );
      if (afterCandidate < before) {
        break;
      }
    }
    if (afterCandidate >= before) {
      return false;
    }

    // 2) 恢复候选接口，保护计数应回升。
    await dut.safeExec("configure terminal");
    await dut.safeExec(`interface ${Port.D}`);
    await dut.safeExec("no ip ospf fast-reroute per-prefix candidate disable");
    await dut.safeExec("end");

    let restored = afterCandidate;
    for (let i = 0; i < 15; i++) {
      await wait(2000);
      restored = protectedCount(
        await dut.safeExec("show ip ospf fast-reroute per-prefix"),
      );
      if (restored >= before) {
        break;
      }
    }
    if (restored < before) {
      return false;
    }

    // 3) 禁止 PortA 上的前缀被保护，保护计数应再次下降。
    await dut.safeExec("configure terminal");
    await dut.safeExec(`interface ${Port.A}`);
    await dut.safeExec("ip ospf fast-reroute per-prefix protection disable");
    await dut.safeExec("end");

    let afterProtection = restored;
    for (let i = 0; i < 15; i++) {
      await wait(2000);
      afterProtection = protectedCount(
        await dut.safeExec("show ip ospf fast-reroute per-prefix"),
      );
      if (afterProtection < before) {
        break;
      }
    }
    if (afterProtection >= before) {
      return false;
    }

    // 4) 恢复受保护接口，供后续清理。
    await dut.safeExec("configure terminal");
    await dut.safeExec(`interface ${Port.A}`);
    await dut.safeExec("no ip ospf fast-reroute per-prefix protection disable");
    await dut.safeExec("end");
    return true;
  });

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router ospf",
    `interface ${Port.A}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    "no interface loopback0",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    "no router ospf",
    `interface ${Port.A}`,
    "no shutdown",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.B}`,
    "no shutdown",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    "no interface loopback0",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    "no router ospf",
    `interface ${Port.B}`,
    "no shutdown",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.C}`,
    "no shutdown",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    "no interface loopback0",
    "end",
  ]);

  testHelper.CleanConfigDutD([
    "configure terminal",
    "no router ospf",
    `interface ${Port.C}`,
    "no shutdown",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    `interface ${Port.D}`,
    "no shutdown",
    "no ip ospf cost",
    "no ip ospf network",
    "no ip address",
    "switchport",
    "exit",
    "no interface loopback0",
    "end",
  ]);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
