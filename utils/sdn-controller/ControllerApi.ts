import axios, { isCancel, AxiosError } from "axios";

class ControllerApi {
  static test() {
    axios({
      method: "post",
      url: "http://localhost:8000/topology/",
      data: {
        test: "test",
      },
    });
  }
}

ControllerApi.test();
