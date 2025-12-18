import axios from "axios";
import { Topolinks } from "./LinkConstraint";

export class TopoApi {
  api = axios.create({ baseURL: "http://172.16.9.108:8888" });

  async topoLinksAdd(links: Topolinks) {
    const response = await this.api.post(
      "/stream/link/add",
      _tmp_set_topo_links_two_way(links)
    );
    const result = response.data;
    console.log("C 端响应:", result);
    return result;
  }

  async topoLinksDelete(links: Topolinks) {
    const response = await this.api.post(
      "/stream/link/delete",
      _tmp_set_topo_links_two_way(links)
    );
    const result = response.data;
    console.log("C 端响应:", result);
    return result;
  }
}

function _tmp_set_topo_links_two_way(links: Topolinks): Topolinks {
  let new_links: Topolinks = { links: [] };
  links.links.forEach((link) => {
    new_links.links.push(link);
    new_links.links.push({
      stream_id: 1 << (8 + link.stream_id),
      in_port: link.out_port,
      out_port: link.in_port,
    });
  });

  return new_links;
}
