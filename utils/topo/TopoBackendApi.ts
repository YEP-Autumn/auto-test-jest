import axios from "axios";

export interface TopoLink {
  id: number;
  src_device: string;
  src_port_index: number;
  dst_device: string;
  dst_port_index: number;
  is_two_way: boolean;
}

export interface TopoLinkWithStream extends TopoLink {
  stream_id: number | null;
}

export interface Topology {
  id: number;
  name: string;
  links: TopoLink[];
}

export interface TopologyWithStream {
  id: number;
  name: string;
  links: TopoLinkWithStream[];
}

export interface AddLinkParams {
  topology_id: number;
  src_device: string;
  src_port_index: number;
  dst_device: string;
  dst_port_index: number;
  is_two_way?: boolean;
}

export class TopoApi {
  private api = axios.create({
    baseURL: "http://172.16.9.108:8888/topology",
    timeout: 5000,
  });

  /** 获取全部拓扑（包含 links） */
  async list(): Promise<{ topologies: Topology[] }> {
    const response = await this.api.get("/list");
    return response.data;
  }

  /** 获取单个拓扑详情 */
  async get(topologyId: number): Promise<Topology> {
    const response = await this.api.get(`/${topologyId}`);
    return response.data;
  }

  /** 创建拓扑 */
  async add(name: string): Promise<{ id: number; name: string }> {
    const response = await this.api.post("/add", { name });
    return response.data;
  }

  /** 删除拓扑 */
  async del(id: number): Promise<void> {
    await this.api.post("/del", { id });
  }

  /** 新增链路 */
  async linkAdd(params: AddLinkParams): Promise<TopoLink & { topology_id: number }> {
    const response = await this.api.post("/link/add", params);
    return response.data;
  }

  /** 删除链路 */
  async linkDel(id: number): Promise<void> {
    await this.api.post("/link/del", { id });
  }

  /** 获取全部拓扑（links 来自 SDNController，含 stream_id） */
  async controllerList(): Promise<{ topologies: TopologyWithStream[] }> {
    const response = await this.api.get("/controller/list");
    return response.data;
  }

  /** 获取单个拓扑（links 来自 SDNController，含 stream_id） */
  async controllerGet(topologyId: number): Promise<TopologyWithStream> {
    const response = await this.api.get(`/controller/${topologyId}`);
    return response.data;
  }
}
