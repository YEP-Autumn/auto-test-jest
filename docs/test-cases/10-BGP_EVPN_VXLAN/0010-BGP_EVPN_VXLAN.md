# 0010 - BGP EVPN VXLAN 双业务实例连通性（普通路由 / VXLAN 隧道）

## 1. 基本信息

- 用例编号：`0010`
- 用例标题：验证 BGP EVPN VXLAN 组网中，同一接入设备下的两个业务实例分别经普通路由与 VXLAN 隧道 ping 通对端
- 所属特性：BGP EVPN VXLAN
- 级别 / 类型：P0 / 功能
- 执行方式：手工 / 自动化
- 预估耗时：约 3 分钟
- 关联：自动化脚本 `test/feature/10-BGP_EVPN_VXLAN/0010-BGP_EVPN_VXLAN.test.ts`（仅追溯）

## 2. 组网与拓扑

```
  DUTA.PortA -- 100.100.100.0/24 -- DUTB.PortA
  DUTB.PortB -- 100.100.101.0/24 -- DUTC.PortA

  DUTA.PortB -- 3.3.3.0/24 -- DUTC.PortB   (pc1 -> v2)
  DUTA.PortC -- 3.3.3.0/24 -- DUTC.PortC   (pc2 -> global)
```

DUTB 只作三层中转；DUTA 与 DUTC 之间通过 DUTB 建立 BGP 邻居。

| 设备 | 接口/对象 | 所属 VRF | 地址或取值 | 连接对端 | 用途 |
| --- | --- | --- | --- | --- | --- |
| DUTA | PortA | 全局 | `100.100.100.1/24` | DUTB PortA | underlay 接口，开启 VXLAN 上行，并作为隧道源接口 |
| DUTA | PortB | `pc1` | `3.3.3.100/24` | DUTC PortB | 业务实例 1 接入 |
| DUTA | PortC | `pc2` | `3.3.3.100/24` | DUTC PortC | 业务实例 2 接入 |
| DUTA | loopback0 | `v1` | `10.1.1.1/32` | — | VXLAN 路径的被 ping 目标 |
| DUTA | loopback1 | 全局 | `11.1.1.1/32` | — | 普通路由路径的被 ping 目标，经 BGP IPv4 发布 |
| DUTA | 隧道接口（nve0） | 关联 `v1` | 源端口 PortA，VNI `1000` | — | VXLAN 隧道端点 |
| DUTB | PortA | 全局 | `100.100.100.2/24` | DUTA PortA | underlay 中转 |
| DUTB | PortB | 全局 | `100.100.101.2/24` | DUTC PortA | underlay 中转 |
| DUTC | PortA | 全局 | `100.100.101.1/24` | DUTB PortB | underlay 接口，开启 VXLAN 上行，并作为隧道源接口 |
| DUTC | PortB | `v2` | `3.3.3.1/24` | DUTA PortB | 业务实例 1 对端（EVPN 业务 VRF） |
| DUTC | PortC | 全局 | `3.3.3.1/24` | DUTA PortC | 业务实例 2 对端（非 EVPN） |
| DUTC | loopback0 | `v2` | `10.1.1.2/32` | — | 业务地址，本用例不 ping |
| DUTC | 隧道接口（nve0） | 关联 `v2` | 源端口 PortA，VNI `1000` | — | VXLAN 隧道端点 |

协议与业务参数：

- 业务 VRF：DUTA `v1`（RD `1000:1`、RT `100:1000`、VNI `1000`）；DUTC `v2`（RD `1000:2`、RT `100:1000`、VNI `1000`）。
- 非 VXLAN VRF：DUTA `pc1`、`pc2`，仅作三层转发，无 EVPN 参数。
- BGP：双方 AS `100`，DUTA（`100.100.100.1`）与 DUTC（`100.100.101.1`）经 DUTB 建立 IPv4 与 L2VPN EVPN 两个地址族；IPv4 中 DUTA 发布 `11.1.1.1/32`、DUTC 发布 `3.3.3.0/24`；EVPN 中双方发送 community；`v1`/`v2` 下发布 EVPN 并重分发直连。
- 静态路由：DUTA `100.100.101.0/24 → 100.100.100.2`、`vrf pc1/pc2 0.0.0.0/0 → 3.3.3.1`；DUTB `3.3.3.0/24 → 100.100.101.1`、`11.1.1.1/32 → 100.100.100.1`、`11.1.1.2/32 → 100.100.101.1`；DUTC `100.100.100.0/24 → 100.100.101.2`。

说明：`3.3.3.0/24` 在 `pc1`、`pc2`、`v2`、全局四个域中复用，属有意设计；DUTA 与 DUTC 各有一个端口接测试仪，本用例不使用。

## 3. 预置条件

- 三台支持 BGP EVPN 与 VXLAN 的交换设备，按第 2 节连线；DUTB 只需三层转发能力。
- 三台设备接口均为二层默认态；无残留 VRF、BGP、EVPN、隧道、loopback 与静态路由配置。
- 具备 console/telnet/ssh 登录方式。
- 建议失败时保留现场以便定位；确认无需保留后再执行清理。

## 4. 测试步骤与预期结果

> 命令中的 `<PortA>` ~ `<PortD>` 为逻辑端口名，执行前替换为实际接口名（如 eth-0-1）。
> 每个命令块的首行为进入配置模式的入口，末行为返回，可整块粘贴执行。

### 步骤 1：检查初始状态

DUTA、DUTB、DUTC 分别执行：

```
show interface <PortA>
show ip route
show running-config ip route
show ip bgp neighbors
show bgp evpn summary
show overlay tunnel
```

**预期结果**：接口为二层默认态且未开启 VXLAN 上行；路由表中无 `100.100.100.0/24`、`100.100.101.0/24`、`3.3.3.0/24`、`10.1.1.1/32`、`10.1.1.2/32` 相关条目；无 BGP 邻居、无 EVPN 邻居、无隧道表项。若存在残留，先按第 5 节清理后再继续。

### 步骤 2：配置 DUTA

**2.1 VRF 与接口**

```
configure terminal
ip vrf v1
 rd 1000:1
 route-target both 100:1000 evpn
 vxlan vni 1000
exit
ip vrf pc1
exit
ip vrf pc2
exit
interface <PortA>
 no switchport
 vxlan uplink enable
 ip address 100.100.100.1/24
exit
interface <PortB>
 no switchport
 ip vrf forwarding pc1
 ip address 3.3.3.100/24
exit
interface <PortC>
 no switchport
 ip vrf forwarding pc2
 ip address 3.3.3.100/24
exit
interface <PortD>
 no switchport
 ip vrf forwarding v1
 ip address 1.1.1.1/24
exit
end
```

**2.2 loopback、隧道与 EVPN**

```
configure terminal
interface loopback0
 ip vrf forwarding v1
 ip address 10.1.1.1/32
exit
interface loopback1
 ip address 11.1.1.1/32
exit
interface nve0
 source <PortA>
 member vni 1000 associate-vrf
exit
evpn
exit
end
```

**2.3 BGP**

```
configure terminal
router bgp 100
 neighbor 100.100.101.1 remote-as 100
 address-family ipv4
  network 11.1.1.1 mask 255.255.255.255
  neighbor 100.100.101.1 activate
 exit
 address-family l2vpn evpn
  neighbor 100.100.101.1 activate
  neighbor 100.100.101.1 send-community both
 exit
 address-family ipv4 vrf v1
  advertise l2vpn evpn
  redistribute connected
 exit
exit
end
```

**2.4 静态路由**

```
configure terminal
ip route 100.100.101.0/24 100.100.100.2
ip route vrf pc1 0.0.0.0/0 3.3.3.1
ip route vrf pc2 0.0.0.0/0 3.3.3.1
end
```

**预期结果**：各命令块均无报错提示；`show interface <PortA>/<PortB>/<PortC>/<PortD>` 显示接口 Up 且地址正确；VRF `v1` 与 VNI `1000` 关联成功；`show overlay tunnel` 中可看到 VNI `1000` 的隧道端点。

### 步骤 3：配置 DUTB

```
configure terminal
interface <PortA>
 no switchport
 ip address 100.100.100.2/24
exit
interface <PortB>
 no switchport
 ip address 100.100.101.2/24
exit
ip route 3.3.3.0/24 100.100.101.1
ip route 11.1.1.1/32 100.100.100.1
ip route 11.1.1.2/32 100.100.101.1
end
```

**预期结果**：无报错提示；DUTB 可 ping 通 `100.100.100.1` 与 `100.100.101.1`，即 DUTA 与 DUTC 的 underlay 三层互通。

```
ping 100.100.100.1
ping 100.100.101.1
```

### 步骤 4：配置 DUTC

**4.1 VRF 与接口**

```
configure terminal
ip vrf v2
 rd 1000:2
 route-target both 100:1000 evpn
 vxlan vni 1000
exit
interface <PortA>
 no switchport
 vxlan uplink enable
 ip address 100.100.101.1/24
exit
interface <PortB>
 no switchport
 ip vrf forwarding v2
 ip address 3.3.3.1/24
exit
interface <PortC>
 no switchport
 ip address 3.3.3.1/24
exit
interface <PortD>
 no switchport
 ip vrf forwarding v2
 ip address 2.2.2.1/24
exit
end
```

**4.2 loopback、隧道与 EVPN**

```
configure terminal
interface loopback0
 ip vrf forwarding v2
 ip address 10.1.1.2/32
exit
interface nve0
 source <PortA>
 member vni 1000 associate-vrf
exit
evpn
exit
end
```

**4.3 BGP**

```
configure terminal
router bgp 100
 neighbor 100.100.100.1 remote-as 100
 address-family ipv4
  network 3.3.3.0 mask 255.255.255.0
  neighbor 100.100.100.1 activate
 exit
 address-family l2vpn evpn
  neighbor 100.100.100.1 activate
  neighbor 100.100.100.1 send-community both
 exit
 address-family ipv4 vrf v2
  advertise l2vpn evpn
  redistribute connected
 exit
exit
end
```

**4.4 静态路由**

```
configure terminal
ip route 100.100.100.0/24 100.100.101.2
end
```

**预期结果**：各命令块均无报错提示；接口 Up 且地址正确；VRF `v2` 与 VNI `1000` 关联成功。

### 步骤 5：触发并等待收敛

在运行 BGP 的两台设备上重置邻居：

```
DUTA：clear bgp *
DUTC：clear bgp *
```

随后等待至 BGP 邻居建立、EVPN 路由出现、VXLAN 隧道建立，最长等待 20 秒（现有脚本为固定等待 20 秒，建议改为轮询下列检查项）。

**预期结果**（用下列命令确认）：

| 设备 | 命令 | 预期 |
| --- | --- | --- |
| DUTA | `show ip bgp neighbors` | 邻居 `100.100.101.1` 状态为 Established |
| DUTA | `show bgp evpn summary` | EVPN 邻居 Up |
| DUTA | `show ip route vrf v1` | 出现对端业务网段 `10.1.1.2/32`（BGP 学到） |
| DUTA | `show overlay tunnel` | VNI `1000`，本端 `100.100.100.1`，对端 `100.100.101.1` |
| DUTC | `show ip bgp neighbors` | 邻居 `100.100.100.1` 状态为 Established |
| DUTC | `show bgp evpn summary` | EVPN 邻居 Up |
| DUTC | `show ip route vrf v2` | 出现对端业务网段 `10.1.1.1/32`（BGP 学到） |
| DUTC | `show overlay tunnel` | VNI `1000`，本端 `100.100.101.1`，对端 `100.100.100.1` |

### 步骤 6：校验普通路由路径

```
DUTA：
ping vrf pc2 11.1.1.1
```

**预期结果**：丢包率为 0%（回显形如 `0% packet loss`），且**不得出现 `100% packet loss`**。

可选辅助确认：

- DUTA：`show ip route vrf pc2` → 存在指向 `3.3.3.1` 的默认路由（静态）
- DUTC：`show ip route` → 存在 `11.1.1.1/32`，下一跳 `100.100.100.1`（BGP 学到）

路径说明：`pc2` 默认路由指向 DUTC PortC（全局 `3.3.3.1`），DUTC 按 IPv4 路由将报文回送至 DUTA loopback1，全程不经 VXLAN。

### 步骤 7：校验 VXLAN 路径

```
DUTA：
ping vrf pc1 10.1.1.1
```

**预期结果**：丢包率为 0%（回显形如 `0% packet loss`），且**不得出现 `100% packet loss`**。

可选辅助确认：

- DUTA：`show ip route vrf v1` → `10.1.1.2/32` 指向隧道/VXLAN 路径
- DUTC：`show ip route vrf v2` → `10.1.1.1/32` 指向隧道/VXLAN 路径
- DUTA：`show overlay tunnel` → ping 期间隧道计数增长

路径说明：`pc1` 默认路由指向 DUTC PortB（`v2`），DUTC 按 EVPN 学到的 `10.1.1.1/32` 经 VXLAN（VNI `1000`）封装回 DUTA，解封装后进入 `v1` 命中 loopback0。

### 判定标准

步骤 2~4 无报错，步骤 5 邻居与隧道正常建立，步骤 6、7 丢包率均为 0，且清理无报错 → Pass；
任一校验不满足或清理失败 → Fail。

## 5. 清理与恢复

顺序为：业务路由 → 隧道接口、loopback → BGP、EVPN → VRF → 接口回二层。
（现有脚本在 DUTA 上为先删 VRF，顺序与本节不同，见备注 2。）

**DUTA**

```
configure terminal
no ip route 100.100.101.0/24
no interface nve0
no interface loopback0
no interface loopback1
no evpn
no router bgp 100
no ip vrf v1
no ip vrf pc1
no ip vrf pc2
interface <PortA>
 switchport
 vxlan uplink disable
exit
interface <PortB>
 switchport
exit
interface <PortC>
 switchport
exit
interface <PortD>
 switchport
end
```

> VRF `pc1`、`pc2` 内的默认路由随 VRF 删除一并清除。

**DUTB**

```
configure terminal
no ip route 3.3.3.0/24
no ip route 11.1.1.1/32
no ip route 11.1.1.2/32
interface <PortA>
 switchport
exit
interface <PortB>
 switchport
end
```

**DUTC**

```
configure terminal
no ip route 100.100.100.0/24
no interface nve0
no interface loopback0
no evpn
no router bgp 100
no ip vrf v2
interface <PortA>
 vxlan uplink disable
 switchport
exit
interface <PortB>
 switchport
exit
interface <PortC>
 switchport
exit
interface <PortD>
 switchport
end
```

**恢复确认**：三台设备重新执行步骤 1 的检查命令，结果与初始状态一致；断开测试连接或移走测试仪。

用例失败时同样应执行清理；仅在需要保留现场定位时例外。

## 6. 备注 / 待确认

| # | 现象 | 影响 | 建议 |
| --- | --- | --- | --- |
| 1 | 现有脚本的收敛触发是对**未运行 BGP** 的 DUTB 执行 `clear bgp *` | 该步无实际作用 | 按步骤 5 作用于 DUTA/DUTC，或去掉该步 |
| 2 | 现有脚本中 DUTA 的清理顺序为「先删 VRF 再删 BGP」，DUTC 相反 | 部分版本可能清理失败并导致用例判 Fail | 统一为第 5 节的顺序 |
| 3 | 固定等待 20 秒 | 收敛慢时易误判，快时浪费时间 | 改为轮询步骤 5 的检查项 |
| 4 | DUTB 配置了 `11.1.1.2/32` 的静态路由，但用例未 ping `11.1.1.2` | 冗余，疑似遗漏验证点 | 确认是否应补一条普通路由路径的 ping 校验 |
