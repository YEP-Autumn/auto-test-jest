/**
 * streamcontrol gRPC 连接与调用封装。
 *
 * 只负责：proto 加载、TLS/credentials、metadata、客户端实例、unary/stream
 * 调用。不涉及端口、模板、运行或抓包语义。
 */

import * as fs from "fs";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import type { StreamControlSettings } from "../../config/backends";

export class StreamControlClient {
  private readonly metadata = new grpc.Metadata();
  private clients: Record<string, any> = {};
  private connected = false;

  constructor(private readonly settings: StreamControlSettings) {}

  get system(): any {
    return this.clients.system;
  }
  get port(): any {
    return this.clients.port;
  }
  get capture(): any {
    return this.clients.capture;
  }
  get traffic(): any {
    return this.clients.traffic;
  }
  get run(): any {
    return this.clients.run;
  }
  get job(): any {
    return this.clients.job;
  }
  get files(): any {
    return this.clients.files;
  }
  get resource(): any {
    return this.clients.resource;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    if (this.settings.authorization) {
      this.metadata.set("authorization", this.settings.authorization);
    }

    const packageDefinition = protoLoader.loadSync(this.settings.protoFile, {
      includeDirs: [this.settings.protoRoot],
      keepCase: true,
      longs: Number,
      enums: Number,
      defaults: false,
      oneofs: true,
    });
    const loaded = grpc.loadPackageDefinition(packageDefinition) as any;
    const v1 = loaded?.streamcontrol?.v1;
    if (!v1) {
      throw new Error(
        `[streamcontrol] proto 加载失败，未找到 streamcontrol.v1: ${this.settings.protoFile}`,
      );
    }

    const credentials = this.createCredentials();
    const address = this.settings.address;

    this.clients = {
      system: new v1.SystemService(address, credentials),
      port: new v1.PortService(address, credentials),
      capture: new v1.CaptureService(address, credentials),
      traffic: new v1.TrafficService(address, credentials),
      run: new v1.RunService(address, credentials),
      job: new v1.JobService(address, credentials),
      files: new v1.FileService(address, credentials),
      resource: new v1.ResourceService(address, credentials),
    };
    this.connected = true;
  }

  close(): void {
    for (const client of Object.values(this.clients)) {
      client?.close?.();
    }
    this.clients = {};
    this.connected = false;
  }

  unary<T>(
    client: any,
    method: string,
    request: any,
    timeoutMs = 10_000,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const fn = client?.[method];
      if (typeof fn !== "function") {
        reject(
          new Error(
            `[streamcontrol] gRPC 方法不存在: ${method}（网关版本可能不支持）`,
          ),
        );
        return;
      }
      fn.call(
        client,
        request,
        this.metadata,
        { deadline: new Date(Date.now() + timeoutMs) },
        (err: any, response: T) => {
          if (err) reject(err);
          else resolve(response);
        },
      );
    });
  }

  serverStream<T>(
    client: any,
    method: string,
    request: any,
    timeoutMs = 30_000,
  ): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      const fn = client?.[method];
      if (typeof fn !== "function") {
        reject(
          new Error(
            `[streamcontrol] gRPC 流式方法不存在: ${method}（网关版本可能不支持）`,
          ),
        );
        return;
      }

      const chunks: T[] = [];
      let settled = false;
      const call = fn.call(client, request, this.metadata, {
        deadline: new Date(Date.now() + timeoutMs),
      });

      call.on("data", (chunk: T) => chunks.push(chunk));
      call.on("end", () => {
        if (settled) return;
        settled = true;
        resolve(chunks);
      });
      call.on("error", (err: any) => {
        if (settled) return;
        settled = true;
        reject(err);
      });
    });
  }

  private createCredentials(): grpc.ChannelCredentials {
    if (!this.settings.tls) {
      return grpc.credentials.createInsecure();
    }
    const read = (file?: string) => (file ? fs.readFileSync(file) : undefined);
    return grpc.credentials.createSsl(
      read(this.settings.ca),
      read(this.settings.key),
      read(this.settings.cert),
      this.settings.tlsInsecure
        ? { rejectUnauthorized: false }
        : undefined,
    );
  }
}
