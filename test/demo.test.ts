import { ControllerApi } from "../utils/sdn-controller/ControllerApi";
import { TestHelper } from "../utils/TestHelper";

let testHelper: TestHelper;
const controller = new ControllerApi();

beforeAll(async () => {
  // testHelper = await new TestHelper().init();
  await controller.init();
});

afterAll(async () => {
  // await testHelper.destroy();
});

test("test", async () => {
  await controller.topolopyCreate("aaaaaaaaaaaaaaaaaaaaaaaaa");
});

// test("测试demo功能", async () => {
//   testHelper.ExecConfigDutA(["configure terminal", "end"]);

//   testHelper.sleep(5000);

//   testHelper.ExecRetMatchDutA("ping 127.0.0.1", / 0% packet loss/g);

//   testHelper.CleanConfigDutA(["configure terminal", "end"]);

//   await testHelper.startTest();

//   expect(testHelper.result()).toBeTruthy();
// });
