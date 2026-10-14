import { TestHelper } from "@/utils/test-helper";

jest.setTimeout(1000 * 60 * 20);

let testHelper: TestHelper;

beforeAll(async () => {
  testHelper = await new TestHelper().init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test("policy-map type qos 全部标记/动作变体（01-pm-qos-actions）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "table-map TC_TM_C",
    "map from 0 to 1",
    "map from 1 2 3 4 5 6 7 to 7",
    "default copy",
    "end",
    "configure terminal",
    "table-map TC_TM_D",
    "map from 0 to 8",
    "map from 1 2 3 4 5 6 7 to 16",
    "default copy",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_0",
    "match cos 0",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_1",
    "match cos 1",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_2",
    "match cos 2",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_3",
    "match cos 3",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_4",
    "match cos 4",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_5",
    "match cos 5",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_6",
    "match cos 6",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_7",
    "match cos 7",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_D1",
    "match dscp af11",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_D2",
    "match dscp af12",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_D3",
    "match dscp af13",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_D4",
    "match dscp af21",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_D5",
    "match dscp af22",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_D6",
    "match dscp af23",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_D7",
    "match dscp af31",
    "end",
    "configure terminal",
    "class-map type qos TC_Q_D8",
    "match dscp af32",
    "end",
    "configure terminal",
    "qos aggregate-policer TC_AGG color-blind cir 2000 cbs 20000 statistics",
    "policy-map type qos TC_PM_QOS",
    "class type qos TC_Q_0",
    "set cos 5",
    "set cos inner 5",
    "quit",
    "class type qos TC_Q_1",
    "set dscp af11",
    "quit",
    "class type qos TC_Q_2",
    "set cos cos table TC_TM_C",
    "quit",
    "class type qos TC_Q_4",
    "set dscp dscp table TC_TM_D",
    "quit",
    "class type qos TC_Q_5",
    "set dscp cos table TC_TM_C",
    "quit",
    "class type qos TC_Q_6",
    "set traffic-class 2",
    "quit",
    "class type qos TC_Q_7",
    "set priority 5",
    "quit",
    "class type qos TC_Q_D1",
    "set exp 3",
    "quit",
    "class type qos TC_Q_D2",
    "set color yellow",
    "quit",
    "class type qos TC_Q_D3",
    "set color red",
    "quit",
    "class type qos TC_Q_D4",
    "statistics enable",
    "quit",
    "class type qos TC_Q_D5",
    "policer color-blind cir 1000 cbs 10000 eir 2000 ebs 20000 conform transmit set-traffic-class 1 exceed transmit violate drop statistics",
    "quit",
    "class type qos TC_Q_D6",
    "policer pps color-aware cir 1000 cbs 100 eir 2000 ebs 200 conform drop exceed drop violate drop statistics",
    "quit",
    "class type qos TC_Q_D7",
    "aggregate-policer TC_AGG",
    "quit",
    "class type qos TC_Q_D8",
    "set traffic-class-all 4",
    "quit",
    "class type qos class-default",
    "set cos 3",
    "quit",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "policy-map type qos TC_PM_QOS",
    "class type qos TC_Q_0",
    "set cos 5",
    "set cos inner 5",
    "class type qos TC_Q_1",
    "set dscp af11",
    "class type qos TC_Q_2",
    "set cos cos table TC_TM_C",
    "class type qos TC_Q_4",
    "set dscp dscp table TC_TM_D",
    "class type qos TC_Q_5",
    "set dscp cos table TC_TM_C",
    "class type qos TC_Q_6",
    "set traffic-class 2",
    "class type qos TC_Q_7",
    "set priority 5",
    "class type qos TC_Q_D1",
    "set exp 3",
    "set color yellow",
    "set color red",
    "class type qos TC_Q_D4",
    "statistics enable",
    "class type qos TC_Q_D5",
    "policer color-blind cir 1000",
    "class type qos TC_Q_D6",
    "policer pps color-aware cir 1000",
    "class type qos TC_Q_D7",
    "aggregate-policer TC_AGG",
    "class type qos TC_Q_D8",
    "set traffic-class 4",
    "class type qos class-default",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no policy-map TC_PM_QOS",
    "no class-map TC_Q_0",
    "no class-map TC_Q_1",
    "no class-map TC_Q_2",
    "no class-map TC_Q_3",
    "no class-map TC_Q_4",
    "no class-map TC_Q_5",
    "no class-map TC_Q_6",
    "no class-map TC_Q_7",
    "no class-map TC_Q_D1",
    "no class-map TC_Q_D2",
    "no class-map TC_Q_D3",
    "no class-map TC_Q_D4",
    "no class-map TC_Q_D5",
    "no class-map TC_Q_D6",
    "no class-map TC_Q_D7",
    "no class-map TC_Q_D8",
    "no qos aggregate-policer TC_AGG",
    "no table-map TC_TM_C",
    "no table-map TC_TM_D",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});

test("policy-map type qos policer 全参数 + aggregate-policer（02-pm-qos-policer-agg）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "qos aggregate-policer TC_AGG color-blind cir 2000 cbs 20000 statistics",
    "class-map type qos TC_CM_AGG",
    "match cos 2",
    "end",
    "configure terminal",
    "class-map type qos TC_CM_POL",
    "match cos 4",
    "end",
    "configure terminal",
    "class-map type qos TC_CM_PPS",
    "match cos 5",
    "end",
    "configure terminal",
    "policy-map type qos TC_PM_AGG",
    "class type qos TC_CM_AGG",
    "aggregate-policer TC_AGG",
    "set traffic-class 2",
    "quit",
    "class type qos TC_CM_POL",
    "policer color-aware cir 1000 cbs 10000 eir 2000 ebs 20000 conform transmit exceed drop violate drop statistics",
    "quit",
    "class type qos TC_CM_PPS",
    "policer pps color-blind cir 1000 cbs 100 conform transmit set-traffic-class 3 exceed drop violate drop statistics",
    "quit",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "qos aggregate-policer TC_AGG",
    "policy-map type qos TC_PM_AGG",
    "class type qos TC_CM_AGG",
    "aggregate-policer TC_AGG",
    "class type qos TC_CM_POL",
    "policer color-aware cir 1000",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no policy-map TC_PM_AGG",
    "no class-map TC_CM_AGG",
    "no class-map TC_CM_POL",
    "no class-map TC_CM_PPS",
    "no qos aggregate-policer TC_AGG",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});

test("policy-map type traffic-class 全部队列/调度动作（03-pm-traffic-class）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "class-map type traffic-class TC_TC_1",
    "match traffic-class 1",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_2",
    "match traffic-class 2",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_3",
    "match traffic-class 3",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_4",
    "match traffic-class 4",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_5",
    "match traffic-class 5",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_6",
    "match traffic-class 6",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_7",
    "match traffic-class 7",
    "end",
    "configure terminal",
    "class-map type traffic-class TC_TC_8",
    "match traffic-class-all 0",
    "end",
    "configure terminal",
    "policy-map type traffic-class TC_PM_TC",
    "class type traffic-class TC_TC_1",
    "priority level 1",
    "quit",
    "class type traffic-class TC_TC_2",
    "bandwidth percentage 10",
    "quit",
    "class type traffic-class TC_TC_3",
    "queue-limit 100",
    "quit",
    "class type traffic-class TC_TC_4",
    "queue-limit 100 ecn-threshold 80",
    "quit",
    "class type traffic-class TC_TC_5",
    "queue-limit maximum",
    "quit",
    "class type traffic-class TC_TC_6",
    "queue-limit maximum ecn-threshold maximum",
    "quit",
    "class type traffic-class TC_TC_7",
    "queue-limit dynamic 1",
    "quit",
    "class type traffic-class TC_TC_8",
    "random-detect maximum-threshold 100",
    "quit",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "policy-map type traffic-class TC_PM_TC",
    "priority level 1",
    "bandwidth percentage 10",
    "queue-limit 100",
    "queue-limit maximum",
    "queue-limit dynamic 1",
    "random-detect maximum-threshold 100",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no policy-map TC_PM_TC",
    "no class-map TC_TC_1",
    "no class-map TC_TC_2",
    "no class-map TC_TC_3",
    "no class-map TC_TC_4",
    "no class-map TC_TC_5",
    "no class-map TC_TC_6",
    "no class-map TC_TC_7",
    "no class-map TC_TC_8",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});

test("policy-map type control-plane 动作（04-pm-control-plane）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "control-plane access-list TC_ACL_PMCP",
    "10 permit exception any",
    "end",
    "configure terminal",
    "class-map type control-plane TC_CM_PMCP",
    "match access-group TC_ACL_PMCP",
    "end",
    "configure terminal",
    "policy-map type control-plane TC_PM_CP",
    "class type control-plane TC_CM_PMCP",
    "policer cir 100 statistics",
    "policer cir 100 cbs 1000 statistics",
    "statistics enable",
    "quit",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "policy-map type control-plane TC_PM_CP",
    "policer cir 100",
    "statistics enable",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no policy-map TC_PM_CP",
    "no class-map TC_CM_PMCP",
    "no control-plane access-list TC_ACL_PMCP",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});

test("table-map 映射表参数（05-table-map）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "table-map TC_TM",
    "map from 1 to 2",
    "map from 3 4 5 6 7 8 to 9",
    "map from 10 11 12 13 14 15 16 17 to 63",
    "default copy",
    "end",
    "configure terminal",
    "table-map TC_TM2",
    "map from 20 to 21",
    "default 7",
    "end",
    "configure terminal",
    "table-map TC_TM3",
    "default ignore",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", [
    "table-map TC_TM",
    "map from 1 to 2",
    "map from 3 to 9",
    "default copy",
    "table-map TC_TM2",
    "default 7",
    "table-map TC_TM3",
    "default ignore",
  ], false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no table-map TC_TM",
    "no table-map TC_TM2",
    "no table-map TC_TM3",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});

test("policy-map type performance-monitor 创建与 class（06-performance-monitor）", async () => {
  testHelper.ExecConfigDutA([
    "configure terminal",
    "class-map type qos TC_PMF_C",
    "match cos 0",
    "end",
    "configure terminal",
    "policy-map type performance-monitor TC_PM_PERF",
    "class type qos TC_PMF_C",
    "end",
  ]);

  testHelper.ExecRetMatchDutA("show running-config", "policy-map type performance-monitor TC_PM_PERF", false);

  testHelper.CleanConfigDutA([
    "configure terminal",
    "no policy-map TC_PM_PERF",
    "no class-map TC_PMF_C",
    "end",
  ]);

  await testHelper.startTest();
  expect(testHelper.result()).toBeTruthy();
});
