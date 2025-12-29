import { RenixPort, StreamBackendApi } from "../utils/stream/StreamBackendApi";
import { TestHelper } from "../utils/TestHelper";
import { LinkConstraint } from "../utils/topo/LinkConstraint";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;
const streamBackendApi = new StreamBackendApi();

beforeAll(async () => {
  testHelper = await new TestHelper(LinkConstraint.test).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test.only("demo test example", async () => {
  testHelper.addPktChecker({
    port: RenixPort.B,
    receive_cnt: 100,
    // validator: ,
  });
});
