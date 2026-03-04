import { sleep } from "../utils";
import { StreamBackendApi } from "../utils/stream/StreamBackendApi";
import { TestHelper } from "../utils/TestHelper";
import { LinkConstraint } from "../utils/topo/LinkConstraint";

jest.setTimeout(1000 * 60 * 10);

let testHelper: TestHelper;
const streamBackendApi = new StreamBackendApi();

beforeAll(async () => {
  testHelper = await new TestHelper(
    LinkConstraint.two_devices_topo_links_type_1,
  ).init();
});

afterAll(async () => {
  await testHelper.destroy();
});

test.only("demo test example", async () => {
  await sleep(1000 * 5);
});
