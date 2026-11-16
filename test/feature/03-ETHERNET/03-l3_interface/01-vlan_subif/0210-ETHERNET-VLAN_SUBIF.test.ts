import { LinkConstraint, TestHelper } from "@/utils";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.one_device_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 *
 *                          +--------+
 *  StreamPort.A <=> PortA--|  DUTA  |--PortB <=> StreamPort.B
 *                          +--------+
 *
 */
test.skip("支持在VLAN子接口上配置DHCPv6 Relay", async () => {});
