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
  is_enabled: boolean;
  links: TopoLink[];
}

export interface TopologyWithStream {
  id: number;
  name: string;
  is_enabled: boolean;
  links: TopoLinkWithStream[];
}

export interface AddLinkParams {
  src_device: string;
  src_port_index: number;
  dst_device: string;
  dst_port_index: number;
  is_two_way?: boolean;
}

export class TopoApi {
  private api = axios.create({
    baseURL: "http://172.16.9.1:8000",
    timeout: 5000,
  });

  /** 列出全部拓扑（含 links）；传 source="controller" 时每条 link 附加 stream_id */
  async list(source?: "controller"): Promise<Topology[] | TopologyWithStream[]> {
    const params = source === "controller" ? { source: "controller" } : {};
    const response = await this.api.get("/topology/topologies/", { params });
    return response.data;
  }

  /** 获取单个拓扑详情；传 source="controller" 时附加 stream_id */
  async get(
    id: number,
    source?: "controller",
  ): Promise<Topology | TopologyWithStream> {
    const params = source === "controller" ? { source: "controller" } : {};
    const response = await this.api.get(`/topology/topologies/${id}/`, {
      params,
    });
    return response.data;
  }

  /** 创建拓扑 */
  async create(name: string): Promise<Topology> {
    const response = await this.api.post("/topology/topologies/", { name });
    return response.data;
  }

  /** 删除拓扑（级联删除所有链路） */
  async delete(id: number): Promise<void> {
    await this.api.delete(`/topology/topologies/${id}/`);
  }

  /** 列出拓扑下的所有链路 */
  async listLinks(topologyId: number): Promise<TopoLink[]> {
    const response = await this.api.get(
      `/topology/topologies/${topologyId}/links/`,
    );
    return response.data;
  }

  /** 新增单条链路 */
  async addLink(topologyId: number, params: AddLinkParams): Promise<TopoLink> {
    const response = await this.api.post(
      `/topology/topologies/${topologyId}/links/`,
      params,
    );
    return response.data;
  }

  /** 批量新增链路（all-or-nothing） */
  async bulkAddLinks(
    topologyId: number,
    links: AddLinkParams[],
  ): Promise<{ topology_id: number; links: TopoLink[] }> {
    const response = await this.api.post(
      `/topology/topologies/${topologyId}/links/bulk/`,
      { links },
    );
    return response.data;
  }

  /** 删除链路 */
  async deleteLink(topologyId: number, linkId: number): Promise<void> {
    await this.api.delete(
      `/topology/topologies/${topologyId}/links/${linkId}/`,
    );
  }

  /** 启用拓扑：校验端口冲突并将链路推到 SDNController */
  async enable(id: number): Promise<Topology> {
    const response = await this.api.post(`/topology/topologies/${id}/enable/`);
    return response.data;
  }

  /** 停用拓扑：从 SDNController 移除链路 */
  async disable(id: number): Promise<Topology> {
    const response = await this.api.post(`/topology/topologies/${id}/disable/`);
    return response.data;
  }
}
