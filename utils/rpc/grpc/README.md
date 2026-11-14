# streamcontrol.v1：对外 gRPC 契约

> 状态：现行（重构期；完整目标契约，非全部已实现） · 最后更新：2026-11-07
> 读者：GUI/客户端开发者、网关维护者、引擎接口维护者

## 1. 边界

| 层 | 是否公开 | 说明 |
|---|---|---|
| gRPC `streamcontrol.v1` | **是，唯一公开契约** | GUI、脚本、自动化、第三方客户端 |
| SLNX/2 | 否 | 仅 `streamd-gateway` ↔ 引擎内部 ABI |
| YAML | 是（配置文件） | 人类编辑/导入导出；不是对象 API |

> **完整契约不等于全部已实现。** 当前网关只映射了已实现的 17 个 service；
> 其余 service 已定义、可生成 stub，但运行时会返回 `UNIMPLEMENTED`，直到引擎/网关补齐。

## 2. 文件布局

```
api/streamcontrol.proto          # manifest：import public 所有域
api/streamcontrol/v1/
  common.proto                   # Result/FieldError/Limits/Clock/ResourceRef/PropertyBag
  packet.proto                   # 报文头/字段/跳变/字段元数据
  system.proto                   # System / Hardware / License
  port.proto                     # 端口、PHY、FEC、LAG、SFP、采样、端口统计
  interface.proto                # 接口/协议栈/邻居/路由/Ping
  traffic.proto                  # 流模板/通道/负载/发送/隧道/错误帧/PCAP 导入
  resource.proto                 # 通用对象 CRUD/Watch/Batch/Clone/Reset
  protocol.proto                 # 通用 Protocol 资源（聚合各协议）
  bgp.proto                      # BGP4/BGP4+/EVPN/FlowSpec/BGP-LS
  ospf.proto                     # OSPFv2/v3 查询、配置、动作
  isis.proto / rip.proto         # IS-IS / RIP
  multicast.proto                # PIM / IGMP / MLD
  mpls.proto / sr.proto          # MPLS/LDP/VPLS/PWE / SR/SRv6
  bfd.proto                      # BFD / SBFD
  switching.proto                # STP/RSTP/MSTP / LACP / SRP
  tunnel.proto                   # VXLAN / GRE / TRILL
  controller.proto               # OpenFlow / NETCONF / OVSDB / PCEP
  access.proto                   # DHCPv4/v6 / PPPoE / L2TP / IPTV / 802.1X
  oam.proto                      # CFM/Y.1731/EFM/gPTP/TWAMP/SAA/SRv6 OAM
  benchmark.proto                # RFC2544/2889/3918/Y.1564/非对称/Smart Scripter
  l47.proto                      # HTTP/DNS/TLS
  config.proto                   # Draft/Config + 用例/套件/工作区/文件
  capture.proto                  # 抓包/过滤/下载/实时
  stats.proto                    # 实时统计 + 结果视图/图表/报告
  event.proto                    # 事件
  run.proto / job.proto          # 运行与作业
  scenario.proto                 # TSN / MPLS / SRv6 向导
  extension.proto                # 自定义头增删改查/动态类/动态属性
```

## 3. 规模

当前定义：

| 指标 | 数量 |
|---|---:|
| service | 55 |
| RPC | 561 |
| message | 496 |

按域：

| 域 | service |
|---|---|
| 系统/硬件 | `SystemService` `HardwareService` `LicenseService` |
| 端口 | `PortService` |
| 接口/邻居/路由 | `InterfaceService` `NeighborService` `RouteService` `PingService` |
| 流量 | `TrafficService` |
| 通用对象 | `ResourceService` |
| 协议 | `ProtocolService` `BgpService` `OspfService` `Ospfv2Service` `Ospfv3Service` `IsisService` `RipService` `MulticastService` `MplsService` `SrService` `BfdService` `SwitchingService` `TunnelService` `ControllerService` |
| 接入 | `DhcpService` `PppoeService` `L2tpService` `IptvService` `Dot1xService` |
| OAM | `CfmService` `Y1731Service` `EfmService` `GptpService` `TwampService` `SaaService` `Srv6OamService` |
| 基准 | `BenchmarkService` `SmartScripterService` |
| L4–L7 | `L47Service` `CertificateService` |
| 配置/文件 | `ConfigService` `TestCaseService` `TestSuiteService` `WorkspaceService` `FileService` |
| 统计/结果 | `StatsService` `ResultService` `ChartService` `ReportService` `EventService` |
| 抓包 | `CaptureService` |
| 场景向导 | `ScenarioService` |
| 扩展 | `ExtensionService` |
| 运行/作业 | `RunService` `JobService` |

## 4. 接口功能与支持状态（详细）
> 状态以“网关是否已映射到引擎”为准，不以 proto 是否存在为准。

| 标记 | 含义 |
|---|---|
| ✅ | 已映射到引擎，RPC 可用 |
| 🟡 | 已映射，但有前置条件或字段/能力不完整 |
| ⛔ | proto 已定义，网关未映射；调用返回 `UNIMPLEMENTED` |
| ⚙️ | 依赖专用硬件；通用 Linux 只能返回不支持或能力受限 |

**汇总：171 / 561 RPC 已映射；17 个 service 类可用，37 个 service 仅有契约。**

### 4.1 按域汇总

| 域 | service | 已支持 RPC | 总 RPC | 结论 |
|---|---|---:|---:|---|
| 系统/机框/硬件 | `SystemService`, `HardwareService`, `LicenseService` | 2 | 20 | 🟡 部分 |
| 端口 | `PortService` | 22 | 27 | 🟡 能力/配置/统计/采样/SFP/QBU gate |
| 接口/邻居/路由 | `InterfaceService`, `NeighborService`, `RouteService`, `PingService` | 19 | 19 | ✅ 可用 |
| 流量 | `TrafficService` | 19 | 19 | ✅ 配置/启停/Encode/ImportPcap 可用 |
| 通用对象 | `ResourceService` | 10 | 10 | ✅ |
| 路由/交换协议 | `ProtocolService`, `BgpService`, `OspfService`, `Ospfv2Service`, `Ospfv3Service`, `IsisService`, `RipService`, `MulticastService`, `MplsService`, `SrService`, `BfdService`, `SwitchingService`, `TunnelService`, `ControllerService` | 19 | 194 | 🟡 部分 |
| 接入/会话 | `DhcpService`, `PppoeService`, `L2tpService`, `IptvService`, `Dot1xService` | 0 | 58 | ⛔ 未支持 |
| OAM/时间同步 | `CfmService`, `Y1731Service`, `EfmService`, `GptpService`, `TwampService`, `SaaService`, `Srv6OamService` | 0 | 74 | ⛔ 未支持 |
| 性能/基准 | `BenchmarkService`, `SmartScripterService` | 0 | 23 | ⛔ 未支持 |
| L4–L7 | `L47Service`, `CertificateService` | 0 | 15 | ⛔ 未支持 |
| 配置/用例/文件 | `ConfigService`, `TestCaseService`, `TestSuiteService`, `WorkspaceService`, `FileService` | 19 | 33 | 🟡 部分 |
| 统计/结果 | `StatsService`, `ResultService`, `ChartService`, `ReportService`, `EventService` | 29 | 29 | 🟡 基础视图/导出 |
| 捕获 | `CaptureService` | 14 | 14 | ✅ 可用（引擎有界队列实时推送） |
| 场景向导 | `ScenarioService` | 0 | 7 | ⛔ 未支持 |
| 运行/作业 | `RunService`, `JobService` | 9 | 9 | ✅ 可用 |
| 自定义扩展 | `ExtensionService` | 9 | 10 | 🟡 schema/读回/头增删/动态类+属性已接；动态网络层未支持 |

### 4.2 逐 service 明细

#### 系统/机框/硬件

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `SystemService` | 🟡 2/4（仅 Hello/Shutdown） | `Hello`, `Shutdown` | `GetSystemInfo`, `SetLogLevel` |
| `HardwareService` | ⛔ 0/11 | — | `ListChassis`, `ListCards`, `ListPorts`, `GetSfp`, `GetSfpRaw`, `ReadRegister`, `WriteRegister`, `Reboot`, `Upgrade`, `SwitchMode`, `QueryCapabilities` |
| `LicenseService` | ⛔ 0/5 | — | `Get`, `Install`, `Remove`, `Download`, `ClearExpired` |

#### 端口

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `PortService` | 🟡 22/27 | `ListPorts`, `GetPort`, `OpenPort`, `ClosePort`, `OnlinePort`, `OfflinePort`, `SetPort`, `ConfigurePorts`, `SetLinks`, `SendLinkFault`, `RestartAutoneg`, `SwitchMedia`, `GetStats`, `VerifyProperties`, `CreateOfflinePorts`, `StartSampling`, `StopSampling`, `TriggerSampling`, `ShowSampling`, `GetAvgLatency`, `GetSfp`, `GetQbuStats` | `AggregatePorts`, `AddLagMember`, `DeleteLagMember`, `StartLacp`, `StopLacp` |

#### 接口/邻居/路由

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `InterfaceService` | ✅ 12/12 | `Create`, `Get`, `List`, `Delete`, `BuildStack`, `SelectProtocol`, `UnselectProtocol`, `CreateLink`, `EditLink`, `DeleteLink`, `ReplaceStack`, `ExpandWizard` | — |
| `NeighborService` | ✅ 2/2 | `List`, `Action` | — |
| `RouteService` | ✅ 4/4 | `List`, `Add`, `Delete`, `Lookup` | — |
| `PingService` | ✅ 1/1 | `Ping` | — |

#### 流量

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `TrafficService` | ✅ 19/19 | `CreateTemplate`, `GetTemplate`, `ListTemplates`, `UpdateTemplate`, `DeleteTemplate`, `CreateChannel`, `UpdateEndpoint`, `CreateLoadProfile`, `SetPortConfig`, `Start`, `Stop`, `Restart`, `StartAll`, `StopAll`, `Wait`, `CalculateRate`, `Encode`, `ImportPcap`, `AddTunnel` | — |

#### 通用对象

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `ResourceService` | ✅ 10/10 | `Get`, `List`, `Create`, `Update`, `Delete`, `Query`, `Batch`, `Watch`, `Clone`, `Reset` | `Watch`, `Create`, `Update`, `Delete`, `Clone`, `Reset`, `Batch`, `Query` |

#### 路由/交换协议

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `ProtocolService` | ⛔ 0/15 | — | `Create`, `Get`, `List`, `Update`, `Delete`, `Start`, `Stop`, `StartAll`, `StopAll`, `WaitForUp`, `Advertise`, `Withdraw`, `Restart`, `GetStats`, `ListSessions` |
| `BgpService` | ⛔ 0/16 | — | `Create`, `Get`, `List`, `Update`, `Delete`, `Establish`, `Connect`, `Disconnect`, `AdvertiseRoutes`, `WithdrawRoutes`, `ReadvertiseRoutes`, `Refresh`, `GracefulRestart`, `ListSessions`, `ViewRoutes`, `ViewLsTopology` |
| `OspfService` | ✅ 10/10（需 CLI 实例） | `GetCaps`, `GetStats`, `GetScale`, `ListPeers`, `ListLsdb`, `GetRoutes`, `SetRoutes`, `Measure`, `SetFault`, `ListFaults` | — |
| `Ospfv2Service` | 🟡 9/9（GR 显式 NOTSUP） | `Create`, `Get`, `List`, `Update`, `Delete`, `Establish`, `Advertise`, `Withdraw`, `GracefulRestart` | — |
| `Ospfv3Service` | ⛔ 0/9 | — | `Create`, `Get`, `List`, `Update`, `Delete`, `Establish`, `Advertise`, `Withdraw`, `GracefulRestart` |
| `IsisService` | ⛔ 0/13 | — | `Create`, `Get`, `List`, `Update`, `Delete`, `Start`, `Stop`, `Establish`, `LspAdvertise`, `LspWithdraw`, `GracefulRestart`, `SendInSyncPdus`, `SendOutOfSyncPdus` |
| `RipService` | ⛔ 0/11 | — | `Create`, `Get`, `List`, `Update`, `Delete`, `Start`, `Stop`, `Advertise`, `Withdraw`, `Suspend`, `Resume` |
| `MulticastService` | ⛔ 0/20 | — | `CreatePim`, `CreateIgmp`, `CreateIgmpQuerier`, `CreateMld`, `CreateMldQuerier`, `Get`, `List`, `Update`, `Delete`, `PimStart`, `PimJoin`, `PimLeave`, `PimBootstrap`, `PimRegister`, `IgmpApply`, `IgmpJoin`, `IgmpLeave`, `IgmpSendReport`, `MldApply`, `MldSendReport` |
| `MplsService` | ⛔ 0/20 | — | `CreateLdp`, `CreateVpls`, `CreatePw`, `List`, `Get`, `Delete`, `LdpStart`, `LdpStop`, `LdpEstablish`, `LdpRequestLabel`, `LdpRestart`, `LdpWithdrawLsps`, `CreateStaticLabel`, `CreateVpnLabel`, `LspPingStart`, `LspPingStop`, `LspPingPause`, `LspPingResume`, `LspTracePause`, `LspTraceResume` |
| `SrService` | ⛔ 0/12 | — | `CreateSr`, `CreateSrv6`, `Get`, `List`, `Delete`, `SegmentListImport`, `SegmentListExport`, `SegmentListPreview`, `SegmentListValidate`, `PreviewTunnelSid`, `Srv6OamStart`, `Srv6OamStop` |
| `BfdService` | ⛔ 0/15 | — | `Create`, `Get`, `List`, `Update`, `Delete`, `Start`, `Stop`, `AdminUp`, `AdminDown`, `EnableDemand`, `DisableDemand`, `InitiatePoll`, `ResumePdus`, `StopPdus`, `SetDiagnostic` |
| `SwitchingService` | ⛔ 0/13 | — | `CreateStp`, `CreateLacp`, `CreateSrp`, `Get`, `List`, `Delete`, `StpStartCist`, `StpStartMsti`, `StpStartBridge`, `StpStop`, `StpSendTopoChange`, `StartAllLacp`, `SrpControl` |
| `TunnelService` | ⛔ 0/14 | — | `CreateVxlan`, `CreateGre`, `CreateTrill`, `Get`, `List`, `Delete`, `VxlanSelectVtep`, `VxlanSelectVm`, `VxlanSelectMulticastGroup`, `VxlanStartPing`, `VxlanPing`, `TrillStart`, `TrillStop`, `TrillReadvertiseLsps` |
| `ControllerService` | ⛔ 0/17 | — | `CreateOpenFlow`, `CreateNetconf`, `CreateOvsdb`, `CreatePcep`, `Get`, `List`, `Delete`, `OpenFlowStart`, `OpenFlowStop`, `OpenFlowExecute`, `NetconfStart`, `NetconfGetYang`, `OvsdbQuery`, `OvsdbStartRefresh`, `PcepEstablish`, `PcepInitiateLsp`, `PcepReportLsp` |

#### 接入/会话

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `DhcpService` | ⛔ 0/24 | — | `CreateV4Client`, `CreateV4Server`, `CreateV4Relay`, `CreateV6Client`, `CreateV6Server`, `Get`, `List`, `Delete`, `Bind`, `Renew`, `Rebind`, `Release`, `Reboot`, `Inform`, `ForceRenew`, `WaitForState`, `StartServer`, `StopServer`, `StartReplyingNak`, `StopReplyingNak`, `LeaseQuery`, `BulkLeaseQuery`, `ActiveLeaseQuery`, `StartTls` |
| `PppoeService` | ⛔ 0/11 | — | `CreateClient`, `CreateServer`, `Get`, `List`, `Delete`, `Connect`, `Disconnect`, `Abort`, `ChangeMode`, `WaitForState`, `SessionInfo` |
| `L2tpService` | ⛔ 0/8 | — | `Create`, `Get`, `List`, `Delete`, `Connect`, `Disconnect`, `Abort`, `WaitForState` |
| `IptvService` | ⛔ 0/7 | — | `Create`, `Get`, `List`, `Delete`, `StartTest`, `StopTest`, `WaitForCompletion` |
| `Dot1xService` | ⛔ 0/8 | — | `Create`, `Get`, `List`, `Delete`, `UploadCertificate`, `DeleteCertificate`, `Abort`, `WaitForAuthState` |

#### OAM/时间同步

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `CfmService` | ⛔ 0/11 | — | `Create`, `Get`, `List`, `Delete`, `StartCc`, `StopCc`, `StartLinkTrace`, `StopLinkTrace`, `StartLoopBack`, `StopLoopBack`, `ExpandWizard` |
| `Y1731Service` | ⛔ 0/14 | — | `Create`, `Get`, `List`, `Delete`, `StartCcm`, `StartLbm`, `StartLtm`, `StartDmm`, `StartLmm`, `Start1Dm`, `StartAis`, `StartLck`, `StartCfm`, `Stop` |
| `EfmService` | ⛔ 0/11 | — | `Create`, `Get`, `List`, `Delete`, `Apply`, `StartLoopBack`, `StartLinkTrace`, `StartVarReq`, `StartEventNotification`, `StartOrgSpec`, `Stop` |
| `GptpService` | ⛔ 0/14 | — | `Create`, `Get`, `List`, `Delete`, `SendPacket`, `SendSignaling`, `SendErrorSync`, `ResumeAnnounce`, `ResumeSync`, `ResumeFollowUp`, `StopAnnounce`, `StopSync`, `StopFollowUp`, `ConfigureClockSync` |
| `TwampService` | ⛔ 0/12 | — | `Create`, `Get`, `List`, `Delete`, `Control`, `RequestSession`, `StartSession`, `StopSession`, `PauseSession`, `ResumeSession`, `Start`, `Stop` |
| `SaaService` | ⛔ 0/6 | — | `Create`, `Get`, `List`, `Delete`, `Start`, `Stop` |
| `Srv6OamService` | ⛔ 0/6 | — | `Create`, `Get`, `List`, `Delete`, `Start`, `Stop` |

#### 性能/基准

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `BenchmarkService` | ⛔ 0/15 | — | `GetWizard`, `Create`, `Get`, `List`, `Update`, `Delete`, `Start`, `Stop`, `UpdateConfig`, `Expand`, `WriteDb`, `ListResults`, `CreateTrafficGroup`, `AssignTrafficGroup`, `ParallelSearch` |
| `SmartScripterService` | ⛔ 0/8 | — | `Create`, `Get`, `Update`, `Delete`, `Start`, `Stop`, `Pause`, `GetState` |

#### L4–L7

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `L47Service` | ⛔ 0/11 | — | `CreateClient`, `CreateServer`, `Get`, `List`, `Update`, `Delete`, `Start`, `Stop`, `StartAll`, `StopAll`, `GetStats` |
| `CertificateService` | ⛔ 0/4 | — | `UploadCertificate`, `UploadPrivateKey`, `UploadCaCertificate`, `DeleteCertificates` |

#### 配置/用例/文件

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `ConfigService` | ✅ 14/14（YAML 文本） | `DraftOpen`, `DraftGet`, `DraftPut`, `DraftDiscard`, `DraftValidate`, `DraftCreate`, `DraftUpdate`, `DraftDelete`, `DraftDiff`, `ConfigApply`, `ConfigGet`, `ConfigRevert`, `ResGet`, `ResList` | — |
| `TestCaseService` | ⛔ 0/4 | — | `Save`, `Load`, `List`, `Delete` |
| `TestSuiteService` | ⛔ 0/8 | — | `Load`, `Start`, `Stop`, `Pause`, `Resume`, `Skip`, `Unload`, `List` |
| `WorkspaceService` | ⛔ 0/2 | — | `Save`, `Load` |
| `FileService` | 🟡 5/5（需 `state_dir`；上传/下载均分块） | `List`, `Delete`, `Stat`, `Upload`, `Download` | — |

#### 统计/结果

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `StatsService` | 🟡 4/4（行 v2：bytes/FCS/p50/p99/时间戳） | `Subscribe`, `Snapshot`, `GetAlert`, `SetAlert` | — |
| `ResultService` | ✅ 13/13 | `CreateView`, `CreateColumn`, `GetView`, `ListViews`, `Subscribe`, `Unsubscribe`, `UnsubscribeAll`, `Refresh`, `Pause`, `Resume`, `Clear`, `GetByKey`, `Export` | — |
| `ChartService` | ✅ 6/6 | `Create`, `Update`, `RemoveSeries`, `StartHistory`, `StopHistory`, `ListHistory` | — |
| `ReportService` | ✅ 4/4 | `Generate`, `ExportResult`, `ImportResult`, `DeleteResult` | — |
| `EventService` | ✅ 2/2 | `Subscribe`, `Ack` | — |

#### 捕获

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `CaptureService` | ✅ 14/14 | `Create`, `Get`, `List`, `Delete`, `Update`, `Start`, `Stop`, `StartAll`, `StopAll`, `Download`, `AbortDownload`, `ReadByIndex`, `SubscribeRealtime`, `ResetParser` | — |

#### 场景向导

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `ScenarioService` | ⛔ 0/7 | — | `Create`, `Get`, `List`, `Update`, `Delete`, `Expand`, `Save` |

#### 运行/作业

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `RunService` | ✅ 6/6（需先 apply/开端口） | `StartTest`, `StopTest`, `PauseTest`, `ResumeTest`, `GetRun`, `ListRuns` | — |
| `JobService` | ✅ 3/3 | `GetJob`, `ListJobs`, `CancelJob` | — |

#### 自定义扩展

| Service | 状态 | 已支持 RPC | 未支持 RPC |
|---|---|---|---|
| `ExtensionService` | 🟡 9/10 | `ListHeaderTypes`, `ListHeaderProperties`, `ListHeaders`, `CreateHeader`, `InsertHeader`, `UpdateHeader`, `DeleteHeader`, `CreateDynamicClass`, `CreateDynamicProperty` | `CreateDynamicNetwork` |

### 4.3 能力备注（避免误读）

- **基础打流**：`TrafficService` 19/19 已映射；模板/通道/负载/端口配置存引擎 Resource registry（`stream_template` / `stream_channel` / `load_profile` / `stream_port_config`），随 `state_dir/current` 与 `revisions/` 持久化、重启恢复；`Start/Stop/Restart/StartAll/StopAll/Wait` 通过生成 YAML `blocks/streams` + `ConfigService` draft/apply + `RunService` 执行；`CalculateRate` 用模板帧长估算；`Encode` 走引擎 `traffic.encode` Action（内置报文模板）；`AddTunnel` 只保存通道隧道配置；gateway 重启后 `Stop/Wait` 可从引擎 `RUN_LIST` 恢复 active traffic run；`Start` 会临时 CLOSE/OPEN 端口以满足 `CONFIG_APPLY` 的端口限制；`tests/fixtures/gateway_traffic_veth.sh` 覆盖 netns veth 上的 gateway↔engine 闭环。`ImportPcap` 已接 pcap/pcapng 解析：pcap 归档到 File Store `traffic/pcap/`，每帧优先调用引擎 `traffic.packet.decode` 转成结构化 template（layers/fields/options/payload 可编辑），引擎无法逐字节还原时退回 raw `templateString`；结构化时也能识别动态自定义头（`proto_name`）；超过 16000B 的帧跳过，最多导入 64 帧。
- **报文头扩展（ExtensionService 9/10）**：`ListHeaderTypes` / `ListHeaderProperties` 调用引擎 `traffic.packet.schema` Action，返回 23 种协议 / 157 个字段的类型、offset、width、shift、mask、flags；`ListHeaders` 读 `stream_template[].headers`；`CreateHeader` / `InsertHeader` / `DeleteHeader` 维护完整层栈（`StreamTemplate.headers` → YAML `layers:`）；`UpdateHeader` 把字段更新合并回 `StreamTemplate.headers`。`topLayerType` 非空的模板走“字段覆盖”模式，`InsertHeader`/`DeleteHeader` 不会假装改层；`CreateDynamicClass`/`CreateDynamicProperty` 会把自定义头和字段落成 `dynamic_class`/`dynamic_property` Resource，引擎 reconcile 后注册到 pkt 协议表，YAML/Encode/Start 可直接使用；`CreateDynamicNetwork`（动态网络层）仍明确 `UNIMPLEMENTED`，地址生成请用 `fields` 的 list/incr。
- **报文编辑（分阶段落地）**：`packet.proto` 定义 `HeaderInstance` / `PacketField` / `PacketFieldModifier` / `HeaderProperty`；`StreamTemplate.headers`、`PayloadSpec`、`ErrorInjectionSpec` 与 `EncodeStreamRequest.headers` 已进入契约。当前 `headers[].fields` 的固定值/递增/递减/随机/列表已由 gateway 生成 YAML `fields`，并由引擎在 `Start` 前应用（支持 157 个已建模字段、MAC/IPv4/IPv6/bytes raw 值、`scope=frame/burst/stream`）。`HeaderInstance` 的层增删/自定义层栈和 `header_length` 已接入；`EncodeStreamRequest.headers` 已支持预览（引擎 `traffic.encode` 接受 `layers`/`fields`/`layer_options`、完整 `frame_length` 策略、`payload_fill`、`error_injection`、`signature`、`templateString`）；`HeaderInstance.options` 支持 IPv4/TCP 选项、IPv6 hop/dst 选项与 ICMPv6 NDP 选项（`HeaderOption.type/data`，IHL/data_off/8B 对齐自动同步）；新增 `DOT3`/`LLC`/`SNAP`/`SNMP` 头类型：前三个用于 IEEE 802.3 + LLC/SNAP 层栈，SNMP 是固定 43B 的 v1/v2c Get/GetNext 报文模板；新增 `IPV6_HOPOPTS`/`IPV6_ROUTING`/`IPV6_FRAGMENT`/`IPV6_DSTOPTS` 扩展头，next_header 自动串联；新增 `VXLAN` 头（UDP 4789，后接内层 Ethernet）、`PPPOE` 头（Session）、`GTPU` 头（UDP 2152）与 `IGMP` 头（IPv4 proto 2）；`PayloadSpec` 已接入 payload 填充（cycle/incr/decr/random/custom/PRBS）；`StreamTemplate.repeat_count` 已展开为多条 YAML stream，配合 `scope=stream` 生成不同五元组，并自动分配签名 `stream_id`；`ErrorInjectionSpec` 已支持 checksum/TTL/undersize/oversize/VLAN malformed，CRC/FCS/IP option 在 AF_PACKET 上明确 `NOTSUP`。
- **三层/OSPF**：`InterfaceService` 12/12 已映射，可创建带 IPv4 的三层接口；`PingService`、`NeighborService.List`、`RouteService` 已接引擎 L3 运行态。Link 当前是 Resource registry 配置对象，ExpandWizard 先展开为 L2 interface/资源，复杂层组合仍需后续补齐。OSPF 配置可由 `Ospfv2Service.Create/Get/List/Update/Delete` 落到引擎 `ospf` Resource，`Establish` 通过 `proto.ospf.ensure` 幂等启动；运行中 Update 会先销毁运行时再重建，gateway 启动时按 `desiredRunning` 恢复；`Advertise/Withdraw` 通过 `proto.ospf.advertise/withdraw` 修改外部 LSA（默认 metric 20、Type-2）。`OspfService` 继续负责运行时查询/测量/故障注入。`Ospfv3Service` 仍保持 0/9，等待 OSPFv3 插件；`GracefulRestart` 已接契约但协议层无 GR，明确返回 NOTSUP。
- **抓包**：`CaptureService` 14/14；引擎用独立 AF_PACKET 收包线程，导出到 `state_dir/captures`（通过 `files/captures/`），`Download` 返回逻辑文件路径，客户端再用 `FileService.Download` 取 pcap。实时订阅走捕获线程的独立有界队列（256 帧，满时丢最旧并累计 `realtimeDropped`），控制层用 PUSH 帧推给网关；停止时先排空队列再发 FINAL。`List` 已支持 port 过滤和 `page_size/page_token` 分页；`Download` 已改为异步导出 job，`AbortDownload` 置取消标志后 worker 尽快停止并删除未完成文件。
- **统计**：`StatsService` 4/4；行格式 v2 已补端口 bytes/FCS/drop、流 bytes、lat min/max/p50/p99，快照/推送带 mono/wall 时间戳；仍缺 QBU、端口 short/long/jumbo 分类计数。Result/Chart 视图配置已落引擎 Resource registry，重启恢复；Chart history 已由后台采样器写入 `charts/history/*.jsonl`，gateway 启动时会恢复 enabled 的 history 任务；`GetByKey` 使用规范 `result_row` JSON（`schema/view/rows[].primaryKey/values`，兼容 `rows/results/items` 和顶层对象），gateway 建立 `(view, primaryKey) → result id` 索引；首次查询扫描一次，之后只取命中的 result 文档，Result 写入后 revision 变化会触发索引重建。
- **端口**：`PortService` 22/27；`GetPort` 已返回 media/duplex/autoneg/flow/sfp/maxQueues 与 capability（veth/dummy 报 `virtual`）；`ConfigurePorts`/`VerifyProperties` 走 `port.configure`/`port.verify` Action，支持 MTU 和现有 promisc/offload/ipv6/cpu 子集；`SetLinks` 为管理面 link，`SendLinkFault` 仅对虚拟端口做软件模拟；`RestartAutoneg`/`SwitchMedia` 仅驱动支持时成功，否则 `NOTSUP`；`GetStats` 返回累计字节/FCS/drop 和窗口 fps/L1；`CreateOfflinePorts` 创建纯 Resource 离线端口；`StartSampling/StopSampling/TriggerSampling/ShowSampling` 是 AF_PACKET 软件采样（pcap 数据，最多 16 帧/端口）；`GetAvgLatency` 按端口聚合流的时延直方图（同机时戳，跨机不可用）；`GetSfp` 读取 SFF-8472 SFP/SFP+ EEPROM（identity + 温度/电压/偏置/光功率），虚拟端口和无模块网卡返回 `NOTSUP`，不伪造；`GetQbuStats` 已按能力门禁接好，当前 Linux 后端没有 TSN/Qbv 统计源，返回 `NOTSUP`，不把 tc/Qdisc 配置当成硬件计数。LAG/LACP 产品决定不做。
- **硬件**：`HardwareService`/`LicenseService` 契约完整，但通用 Linux 无机框/板卡/PHY/许可，实际会按 capability 返回不支持；不要按“proto 有”判断“机器能做”。
- **文件**：`FileService` 已接引擎 `state_dir/files`；逻辑路径由引擎映射，不返回本地绝对路径。未配置 `state_dir` 时返回 `UNIMPLEMENTED`；下载按 64KiB 分块（引擎 `FILE_GET` 带 offset），上传按客户端 chunk 写入 `.uploads/` 临时文件，`eof` 时原子提交到 Store；单文件上限 64MiB。`List`/`Stat` 的 `crc32c` 暂为 0，`Get`/`Put` 返回实际 CRC。

### 4.4 用户视角：现在能用 / 不能用

**现在能用（gRPC）**

- 端口：`ListPorts/GetPort/OpenPort/ClosePort/OnlinePort/OfflinePort/SetPort/ConfigurePorts/SetLinks/SendLinkFault/RestartAutoneg/SwitchMedia/GetStats/VerifyProperties`（能力/配置/统计基础）；
- 配置：YAML draft 的 `Open/Get/Put/Discard/Validate/Create/Update/Delete/Diff`，`ConfigApply/Get/Revert`，`ResGet/ResList`；
- 打流：通过 YAML `blocks/streams` + `RunService.StartTest/StopTest/PauseTest/ResumeTest/GetRun/ListRuns`，支持现有模板、帧长、速率、连续/突发/定时、签名统计；`TrafficService` 的 `StreamTemplate.headers[].fields` 可做字段固定/递增/递减/随机/列表编辑；
- 报文头：`ExtensionService.ListHeaderTypes/ListHeaderProperties/ListHeaders/CreateHeader/InsertHeader/UpdateHeader/DeleteHeader`（schema/读回/层增删/字段更新）；动态类 3 个 RPC 仍返回 `UNIMPLEMENTED`；
- 统计：`StatsService.Subscribe/Snapshot/GetAlert/SetAlert`；行格式 v2 已补端口 bytes/FCS/drop、流 bytes、lat min/max/p50/p99，快照/推送带 mono/wall 时间戳；仍缺 QBU、端口级 FCS 分类计数（short/long/jumbo）；
- 抓包：`CaptureService.Create/Get/List/Delete/Update/Start/Stop/StartAll/StopAll/Download/AbortDownload/ReadByIndex/SubscribeRealtime/ResetParser`（导出到 Store；实时订阅为有界队列 PUSH）；
- 结果文件：`ReportService.ExportResult/ImportResult/DeleteResult`（结果 JSON 按 uint64 id 归档，文件走逻辑路径）；
- OSPF：`Ospfv2Service` 可直接 Create/Get/List/Update/Delete/Establish/Advertise/Withdraw，并按 `desiredRunning` 恢复；`OspfService` 的 caps/stats/scale/peers/lsdb/routes/measure/fault 查询运行时；
- 事件/作业：`EventService.Subscribe/Ack`、`JobService.GetJob/ListJobs/CancelJob`；
- 系统：`SystemService.Hello/Shutdown`；
- 文件：`FileService.List/Stat/Upload/Download/Delete`（引擎 `state_dir/files`，逻辑路径；上传/下载分块）。

**现在不能用（gRPC）**

- 复杂 Link 转发行为/Wizard 层组合：当前只落 Resource registry 配置，数据面行为未实现；
- 细粒度流对象操作：mesh 复杂模式；
- 抓包 `Download` 为异步导出；`AbortDownload` 可取消进行中的导出；`ResetParser` 目前等价于清空捕获缓冲；
- 端口高级能力：PHY/FEC/自协商/介质/SFP/采样；LAG/LACP 产品决定不做；
- BGP/OSPFv3/IS-IS/RIP/PIM/IGMP/MLD/MPLS/LDP/SR/BFD/STP/LACP/VXLAN/GRE/OpenFlow/NETCONF/OVSDB/PCEP；
- DHCP/PPPoE/L2TP/IPTV/802.1X；
- CFM/Y.1731/EFM/gPTP/TWAMP/SAA/SRv6 OAM；
- RFC2544/2889/3918/Y.1564/非对称/Smart Scripter；
- HTTP/DNS/TLS；
- 测试用例/套件/工作区/报告生成；
- 通用对象 CRUD、动态类/属性、自定义报文头、TSN/MPLS/SRv6 向导；
- 机框/板卡/License/PHY 寄存器等硬件能力（通用 Linux 通常也不具备）。

## 5. 契约规则

### 5.1 版本

- 包名 `streamcontrol.v1`；首次对外冻结后只增不改。
- 字段号永不复用；删除必须 `reserved`。
- 枚举 0 值保留给 `*_UNSPECIFIED` 或明确的 `UNKNOWN`。
- 破坏性变更开 `v2`，不在 `v1` 内改语义。

### 5.2 错误

- 业务失败：gRPC OK + `Result.code != 0`（当前实现）。
- 传输/鉴权失败：gRPC status（`UNAVAILABLE`/`DEADLINE_EXCEEDED`/`UNAUTHENTICATED`/`PERMISSION_DENIED`）。
- `Result` 必须能定位：`path`、`fields[]`、`retryable`、`retry_after_ms`。
- 后续若改为标准 `ErrorInfo`，按 `v2` 处理。

### 5.3 单位与时间

- 字段名带单位：`_ms` / `_us` / `_ns` / `_frames` / `_bytes` / `_bps` / `_pps` / `_x100`。
- 墙钟：`*_wall_us`；单调时钟：`*_mono_us`。
- 百分比统一 `_x100`（0.01% 单位）。
- 速率 `_bps` 默认 L1；L2/L3 口径必须另起字段名。

### 5.4 资源

- 核心对象用强类型消息（`Port`、`InterfaceSpec`、`StreamTemplate`、`BgpConfig`…）。
- 长尾/动态对象用 `Resource` + `google.protobuf.Struct` + `ResourceService`。
- `ResourceRef` 当前以 `path` 为主；`id`/`revision` 已预留。
- 配置修改带 `expected_revision`；冲突返回 `Result` + 当前 revision。

### 5.5 限额与能力

- 客户端必须读 `HelloReply.limits`，不得硬编码。
- `HelloReply.features` / `Capability` 是能力发现入口。
- 不支持的功能返回 `UNIMPLEMENTED` 或明确错误，不静默降级。

### 5.6 流式

- 统计/事件/抓包/文件下载使用 server-streaming。
- `StatsFrame.seq` 单调；`snapshot_id` 变化表示快照切换；`gap=true` 表示丢批。
- 文件/抓包分块用 `offset` + `eof` + `crc32c`，不在单帧里塞大对象。
- `FileService` 引擎侧是 `LIST/GET/PUT/DELETE/STAT`；`GET` 支持 offset/limit 分块，`PUT` 支持 uploadId + offset + eof 分块，最终原子提交。

## 6. 实现状态

基线已由网关映射的 17 个 service 类：

```
SystemService  ConfigService  RunService     JobService
StatsService   EventService   PortService    OspfService
Ospfv2Service  ResourceService FileService   ReportService
CaptureService ResultService  ChartService   TrafficService
ExtensionService
```

注意：这些 service 里**新加的 RPC**（如 `PortService.ConfigurePorts`、`SystemService.GetSystemInfo`）
以及其余 37 个 service 仍是目标契约，当前返回 `UNIMPLEMENTED`。
下一步按 `api/README` 的域顺序补齐，不在 proto 里加“假实现”。

## 7. 当前已知债务

1. `Result.code` 是引擎数字错误码，缺稳定字符串枚举。
2. `Draft*` 仍以整份 YAML 文本为载体；`ResourceService` 已接 `Get/List/Create/Update/Delete/Query/Batch/Watch/Clone/Reset`（A2 port registry + 旧 session 合并）。Reset 当前对 port 是空 patch：name 是身份字段，没有可变属性；后续 kind 需按 schema 物化默认值。
3. `ListRuns` / `ListJobs` / `ResList` 无分页。
4. `StatsService` 无 `since_seq`；断线只能全量 Snapshot。
5. `StreamRow` / `PortRow` 字段不足（字节、时延分位、端口错误计数）。
6. 新增的完整契约 service 需要逐域补网关映射与引擎实现。
7. `FileService` 上传使用 `state_dir/.uploads/` 临时文件，单文件上限 64MiB；未做临时文件超时清理。
8. `ReportService.ExportResult/ImportResult` 只处理 JSON + uint64 结果 id；`Generate`、`ResultService` 的视图/列/图表仍未实现。
9. `CaptureService` 的实时订阅已用有界队列；`Download` 为异步导出，`AbortDownload` 可取消，导出文件依赖 `state_dir`。

## 8. 校验

```bash
# 生成 C# 并让 Grpc.Tools 跑 protoc（当前 CI 入口）
cd gateway && dotnet build -c Release

# 调网关（manifest 入口）
grpcurl -insecure -import-path api -proto streamcontrol.proto \
  -d '{"client":"smoke","protocolMajor":2}' \
  127.0.0.1:5443 streamcontrol.v1.SystemService/Hello
```
