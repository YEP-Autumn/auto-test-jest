import { Port } from "../../../utils";
import { TestHelper } from "../../../utils/TestHelper";
import { LinkConstraint } from "../../../utils/topo/LinkConstraint";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.three_devices_topo_links_type_5,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *                    +--------+                   +--------+
 *  RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
 *                    +--------+                   +--------+    |
 *                                                               |
 *                                                 +--------+    |
 *                               RenixB <=> PortD--|  DUTC  |--PortB
 *                                                 +--------+
 */
test("配置1k MPLS VPLS", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 1.1.1.1/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "mpls-vpls v1 vlan 2",
    "exit",
    "interface loopback1",
    "ip address 11.1.1.1/32",
    "exit",
    "mpls vpls v1 1",
    "vpls-peer 11.3.1.1 raw",
    "exit",
    "router rip",
    "network 1.1.1.0/25",
    "network 11.0.0.0/8",
    "exit",
    "router ldp",
    "router-id 11.1.1.1",
    "targeted-peer 11.3.1.1",
    "transport-address 11.1.1.1",
    "end",
  ]);

  testHelper.ExecConfigDutB([
    "configure terminal",
    `interface ${Port.A}`,
    "no switchport",
    "label-switching",
    "ip address 1.1.1.2/24",
    "enable-ldp",
    "exit",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 2.2.2.2/24",
    "enable-ldp",
    "exit",
    "interface loopback0",
    "ip address 11.2.1.1/32",
    "exit",
    "router rip",
    "network 11.0.0.0/8",
    "network 1.1.1.0/24",
    "network 2.2.2.0/24",
    "exit",
    "router ldp",
    "router-id 11.2.1.1",
    "end",
  ]);

  testHelper.ExecConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "no switchport",
    "label-switching",
    "ip address 2.2.2.1/24",
    "enable-ldp",
    "exit",
    `interface ${Port.D}`,
    "switchport mode trunk",
    "mpls-vpls v1 vlan 2",
    "exit",
    "interface loopback1",
    "ip address 11.3.1.1/32",
    "exit",
    "mpls vpls v1 1",
    "vpls-peer 11.1.1.1 raw",
    "exit",
    "router rip",
    "network 11.0.0.0/8",
    "network 2.2.2.0/24",
    "exit",
    "router ldp",
    "router-id 11.3.1.1",
    "targeted-peer 11.1.1.1",
    "transport-address 11.3.1.1",
    "end",
  ]);

  testHelper.ExecCustomDutA(async (dutA) => {
    await dutA.exec("configure terminal");
    for (let i = 2; i <= 1024; i++) {
      await dutA.exec(`mpls vpls v${i} ${i}`);
      await dutA.exec("vpls-peer 11.3.1.1 raw");
      await dutA.exec(`exit`);
    }
    await dutA.exec("end");

    return true;
  });

  testHelper.ExecCustomDutC(async (dutC) => {
    await dutC.exec("configure terminal");
    for (let i = 2; i <= 1024; i++) {
      await dutC.exec(`mpls vpls v${i} ${i}`);
      await dutC.exec("vpls-peer 11.1.1.1 raw");
      await dutC.exec(`exit`);
    }
    await dutC.exec("end");

    return true;
  });

  testHelper.ExecCustomDutA(async (dutA) => {
    await dutA.exec("configure terminal");
    await dutA.exec(`interface ${Port.D}`);
    for (let i = 2; i <= 1024; i++) {
      await dutA.exec(`mpls-vpls v${i} vlan ${i + 1}`);
    }
    await dutA.exec("end");

    return true;
  });

  testHelper.ExecCustomDutC(async (dutC) => {
    await dutC.exec("configure terminal");
    await dutC.exec(`interface ${Port.D}`);
    for (let i = 2; i <= 1024; i++) {
      await dutC.exec(`mpls-vpls v${i} vlan ${i + 1}`);
    }
    await dutC.exec("end");

    return true;
  });

  testHelper.sleep(25000);

  testHelper.ReadyCheckDutB(
    "show ldp session",
    "11.11.1.1.*?OPERATIONAL",
    60 * 1000,
  );
  testHelper.ReadyCheckDutB("show ldp session", "11.11.4.4.*?OPERATIONAL");

  testHelper.ExecCustomDutA(async (dutA) => {
    await dutA.exec("configure terminal");
    await dutA.safeExec(`interface ${Port.D}`);
    for (let i = 2; i <= 1024; i++) {
      await dutA.safeExec(`no mpls-vpls v${i} vlan ${i + 1}`);
    }
    await dutA.exec("end");

    return true;
  }, true);

  testHelper.ExecCustomDutC(async (dutC) => {
    await dutC.exec("configure terminal");
    await dutC.safeExec(`interface ${Port.D}`);
    for (let i = 2; i <= 1024; i++) {
      await dutC.safeExec(`no mpls-vpls v${i} vlan ${i + 1}`);
    }
    await dutC.exec("end");

    return true;
  }, true);

  testHelper.CleanConfigDutA([
    "configure terminal",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no mpls-vpls v1 vlan 2",
    "switchport mode access",
    "exit",
    "no interface loopback 1",
    "no mpls vpls v1",
    "no router rip",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutB([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.A}`,
    "switchport",
    "disable-ldp",
    "exit",
    "no interface loopback 0",
    "no router rip",
    "no router ldp",
    "end",
  ]);

  testHelper.CleanConfigDutC([
    "configure terminal",
    `interface ${Port.B}`,
    "switchport",
    "disable-ldp",
    "exit",
    `interface ${Port.D}`,
    "no mpls-vpls v1 vlan 2",
    "switchport mode access",
    "exit",
    "no interface loopback 1",
    "no mpls vpls v1",
    "no router rip",
    "no router ldp",
    "end",
  ]);

  testHelper.ExecCustomDutA(async (dutA) => {
    await dutA.safeExec("configure terminal");
    for (let i = 2; i <= 1024; i++) {
      await dutA.safeExec(`no mpls vpls v${i}`);
    }
    await dutA.safeExec("end");

    return true;
  }, true);

  testHelper.ExecCustomDutC(async (dutC) => {
    await dutC.safeExec("configure terminal");
    for (let i = 2; i <= 1024; i++) {
      await dutC.safeExec(`no mpls vpls v${i}`);
    }
    await dutC.safeExec("end");

    return true;
  }, true);

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
