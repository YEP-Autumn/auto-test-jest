import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

/**
 * 多 VRF / 多进程 LFA CLI 用例（不依赖拓扑与邻居）：
 *   1. 创建 vpn1、vpn2 两个 VRF；
 *   2. 在 vpn1 中创建 OSPF 进程 100，在 vpn2 中创建 OSPF 进程 200；
 *   3. 两个进程分别使能 `fast-reroute per-prefix enable`；
 *   4. 校验 running-config、进程数与 VRF 绑定关系；
 *   5. 删除进程与 VRF，校验进程数恢复。
 *
 * 设备实测命令：
 *   ip vrf vpn1
 *   router ospf 100 vrf vpn1
 *   fast-reroute per-prefix enable
 *   show ip ospf 100
 *   no router ospf 100
 */
test("多 VRF 下独立 OSPF 进程可分别使能 LFA 且互不影响", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "ip vrf vpn1",
    "exit",
    "ip vrf vpn2",
    "exit",
    "router ospf 100 vrf vpn1",
    "fast-reroute per-prefix enable",
    "exit",
    "router ospf 200 vrf vpn2",
    "fast-reroute per-prefix enable",
    "exit",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config | include router ospf", [
    "router ospf 100 vrf vpn1",
    "router ospf 200 vrf vpn2",
  ]);

  testHelper.ExecRetMatchDutA("show ip ospf 100", [
    new RegExp('Routing Process "ospf 100"'),
    "Process bound to VRF vpn1",
  ]);
  testHelper.ExecRetMatchDutA("show ip ospf 200", [
    new RegExp('Routing Process "ospf 200"'),
    "Process bound to VRF vpn2",
  ]);

  testHelper.ExecRetMatchDutA("show ip ospf processes-count", [
    new RegExp("OSPF processes current count:\\s*[2-9]\\d*"),
  ]);

  testHelper.ExecRetMatchDutA("show running-config | include fast-reroute", [
    "fast-reroute per-prefix enable",
  ]);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no router ospf 100",
    "no router ospf 200",
    "no ip vrf vpn1",
    "no ip vrf vpn2",
    "end",
  ]);

  testHelper.ExecRetMatchDutA(
    "show running-config | include router ospf",
    "router ospf 100 vrf vpn1",
    true,
  );
  testHelper.ExecRetMatchDutA(
    "show running-config | include router ospf",
    "router ospf 200 vrf vpn2",
    true,
  );

  await testHelper.startTest();

  expect(testHelper.result()).toBeTruthy();
});
