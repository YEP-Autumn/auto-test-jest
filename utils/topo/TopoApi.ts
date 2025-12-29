import axios from "axios";
import { Topolinks } from "./LinkConstraint";

export class TopoApi {
  private api = axios.create({
    baseURL: "http://172.16.9.108:8888",
    timeout: 5000,
  });

  async topoLinksAdd(links: Topolinks) {
    const response = await this.api.post(
      "/stream/link/add",
      _tmp_set_topo_links_two_way(links)
    );
    console.log("✓ TopoApi /stream/link/add:", response.data);
    return response.data;
  }

  async topoLinksDelete(
    links: Topolinks
  ) {
    const response = await this.api.post(
      "/stream/link/delete",
      _tmp_set_topo_links_two_way(links)
    );
    console.log("✓ TopoApi /stream/link/delete:", response.data);
    return response.data;
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
