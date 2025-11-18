import { Port } from "../../utils";
import { TestHelper } from "../../utils/TestHelper";

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

describe("******一、测试 vlan trunk translate 接口模式******", async () => {
  describe("1. 测试支持的配置项", async () => {
    test("1.1 支持配置 raw-vlan VLAN_ID evc", async () => {
      testHelper.ExecConfigDutA(["configure terminal", "end"]);

      testHelper.CleanConfigDutA(["configure terminal", "end"]);

      expect((await testHelper.startTest()).result()).toBeTruthy();
    });

    test("1.2 支持配置 raw-vlan VLAN_ID VLAN_ID evc", async () => {
      testHelper.ExecConfigDutA(["configure terminal", "end"]);

      testHelper.CleanConfigDutA(["configure terminal", "end"]);

      expect((await testHelper.startTest()).result()).toBeTruthy();
    });

    /** 配置 多个 raw-vlan 映射相同 evc 或 evc 中使用相同vlan时，无默认egress规则 */
    test("1.3 测试 raw-vlan VLAN_ID evc egress流量", async () => {});

    test("1.4 测试 raw-vlan VLAN_ID VLAN_ID evc egress流量", async () => {});
  });

  describe("1. 测试不支持的配置项", async () => {
    test("2.1 不支持配置相同的 evc 或者 evc 中使用相同的 vlan", async () => {
      testHelper.ExecConfigDutA(["configure terminal", "end"]);

      testHelper.CleanConfigDutA(["configure terminal", "end"]);

      expect((await testHelper.startTest()).result()).toBeTruthy();
    });

    test("2.2 不支持配置使用双层 tag 的 evc", async () => {
      testHelper.ExecConfigDutA(["configure terminal", "end"]);

      testHelper.CleanConfigDutA(["configure terminal", "end"]);

      expect((await testHelper.startTest()).result()).toBeTruthy();
    });
    test("2.3 不支持配置 raw-vlan group", async () => {
      testHelper.ExecConfigDutA(["configure terminal", "end"]);

      testHelper.CleanConfigDutA(["configure terminal", "end"]);

      expect((await testHelper.startTest()).result()).toBeTruthy();
    });

    test("2.4 不支持配置 raw-vlan untagged", async () => {
      testHelper.ExecConfigDutA(["configure terminal", "end"]);

      testHelper.CleanConfigDutA(["configure terminal", "end"]);

      expect((await testHelper.startTest()).result()).toBeTruthy();
    });

    test("2.5 不支持配置 raw-vlan out-of-range", async () => {
      testHelper.ExecConfigDutA(["configure terminal", "end"]);

      testHelper.CleanConfigDutA(["configure terminal", "end"]);

      expect((await testHelper.startTest()).result()).toBeTruthy();
    });

    test("2.6 不支持配置 raw-vlan VLAN_ID egress-vlan", async () => {
      testHelper.ExecConfigDutA(["configure terminal", "end"]);

      testHelper.CleanConfigDutA(["configure terminal", "end"]);

      expect((await testHelper.startTest()).result()).toBeTruthy();
    });
  });
});
