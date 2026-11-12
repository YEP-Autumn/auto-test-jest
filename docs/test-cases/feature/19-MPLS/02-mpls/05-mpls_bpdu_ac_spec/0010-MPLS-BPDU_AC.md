# MPLS BPDU AC 测试用例

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 同一目录的脚本共用公共拓扑、预置条件与判定口径；各子用例仅描述配置、触发、观测与清理差异。

## 0. 用例清单

| 用例编号 | 用例标题 | 脚本 | 类型 | 结果 |
| --- | --- | --- | --- | --- |
| 0010 | 配置1k MPLS VPLS | `0010-MPLS-BPDU_AC.test.ts` | P1 / 规格 | |

## 1. 基本信息（用例）

- 用例编号：`0010`
- 用例标题：MPLS BPDU AC 测试用例
- 所属特性 / 分组：`19-MPLS` / `MPLS配置` / `BPDU AC`
- 级别 / 类型：P1 / 规格
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 2 分钟（按每条用例 2 至 3 分钟估算）
- 关联：`test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac_spec/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC | 条款 | 本文档验证的要求 |
| --- | --- | --- |
| 设备配置指导 19.2 | 19.2 | BPDU AC配置与回显 |
| 设备命令参考 19.2 | MPLS配置 | 命令参数、回显与删除 |
| RFC 3031 / RFC 5036 | MPLS 标签与 LDP | 标签分发与 LSP 建立 |
| RFC 4762 / RFC 4364 | VPLS 与 L3VPN | VPLS 转发与 L3VPN 路由 |
| IEEE 802.1Q / IEEE 802.1D | 生成树 | 拓扑计算与端口角色 |

### 1.2 能力前提

| 项 | 要求 | 说明 |
| --- | --- | --- |
| 设备 profile | `mpls` | 确认特性可用范围 |
| License / 单板 | 支持BPDU AC相关命令 | 确认功能授权与端口能力 |
| 端口形态 | 至少 3 个可配置接口 | 确认接口类型与数量 |
| 规格 | 表项、实例或邻居数满足用例要求 | 确认数量上限 |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。规格低于用例要求时，仅执行基线用例，并记录规格差异。

## 2. 组网与拓扑

脚本注释中给出的拓扑如下。执行前按对应拓扑完成设备与测试仪连线。

### 2.1 拓扑 1

```text
                   +--------+                   +--------+
 RenixA <=> PortD--|  DUTA  |--PortA <=> PortA--|  DUTB  |--PortB
                   +--------+                   +--------+    |
                                                              |
                                                +--------+    |
                              RenixB <=> PortD--|  DUTC  |--PortB
                                                +--------+
```

适用用例：0010。

内置拓扑：`LinkConstraint.three_devices_topo_links_type_5`。

| 设备 / 对象 | 端口占位符 | 说明 |
| --- | --- | --- |
| DUTA ~ DUTD | `<PortA>`、`<PortB>`、`<PortD>` | 被测设备端口，执行前替换为实际接口名 |

## 3. 预置条件

### 3.1 协议基线参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| Router ID | 11.1.1.1 / 11.2.1.1 / 11.3.1.1 | 全局唯一 |
| 定时器 | 设备默认值 | 用例另有说明时以用例配置为准 |
| MTU | 1500 | 邻居建立前确认一致 |
| 收敛等待 | 优先使用就绪检查 | 固定等待见各子用例 |

### 3.2 初始状态

- 设备接口处于默认二层或三层状态；本文档涉及的 VLAN、VRF、协议进程、静态路由、隧道、ACL、QoS 对象均为空。
- 设备已具备 console、telnet 或 ssh 登录方式，可进入全局配置模式。
- 现场保留：默认清理；保留位置：...

## 4. 测试步骤与预期结果

本文档各子用例的公共执行顺序如下。

| 步骤 | 设备 | 动作 | 预期 |
| --- | --- | --- | --- |
| 1 | 全部 DUT | 执行基线检查命令 | 初始状态符合 3.2 |
| 2 | 各 DUT | 按 4.N 的配置块下发命令 | 命令均被接受，无 `% Invalid input` 等报错 |
| 3 | 各 DUT / 测试仪 | 按 4.N 的触发与等待执行 | 就绪条件满足 |
| 4 | 各 DUT / 测试仪 | 按 4.N 的观测与预期校验 | 全部预期满足 |
| 5 | 各 DUT | 按 4.N 的清理块恢复 | 无本用例残留 |

> 命令中的 `<PortA>` 至 `<PortD>` 为逻辑端口名，执行前替换为实际接口名。
> 观测面说明见 `test-case-template.md` 附录 A；判定标准与常用定时器见附录 B。

### 4.1 用例 0010：配置1k MPLS VPLS

- 级别 / 类型：P1 / 规格
- 预估耗时：约 2 分钟
- 脚本：`test/feature/19-MPLS/02-mpls/05-mpls_bpdu_ac_spec/0010-MPLS-BPDU_AC.test.ts`

**执行顺序**

| 顺序 | 动作 | 对象 |
| --- | --- | --- |
| 1 | 配置 | DUTA |
| 2 | 配置 | DUTB |
| 3 | 配置 | DUTC |
| 4 | 自定义校验 | DUTA |
| 5 | 自定义校验 | DUTC |
| 6 | 自定义校验 | DUTA |
| 7 | 自定义校验 | DUTC |
| 8 | 固定等待 | — |
| 9 | 等待就绪 | DUTB |
| 10 | 等待就绪 | DUTB |
| 11 | 自定义校验 | DUTA |
| 12 | 自定义校验 | DUTC |
| 13 | 清理 | DUTA |
| 14 | 清理 | DUTB |
| 15 | 清理 | DUTC |
| 16 | 自定义校验 | DUTA |
| 17 | 自定义校验 | DUTC |

**配置**

DUTA：

```text
configure terminal
interface <PortA>
no switchport
label-switching
ip address 1.1.1.1/24
enable-ldp
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 vlan 2
exit
interface loopback1
ip address 11.1.1.1/32
exit
mpls vpls v1 1
vpls-peer 11.3.1.1 raw
exit
router rip
network 1.1.1.0/25
network 11.0.0.0/8
exit
router ldp
router-id 11.1.1.1
targeted-peer 11.3.1.1
transport-address 11.1.1.1
end
```

DUTB：

```text
configure terminal
interface <PortA>
no switchport
label-switching
ip address 1.1.1.2/24
enable-ldp
exit
interface <PortB>
no switchport
label-switching
ip address 2.2.2.2/24
enable-ldp
exit
interface loopback0
ip address 11.2.1.1/32
exit
router rip
network 11.0.0.0/8
network 1.1.1.0/24
network 2.2.2.0/24
exit
router ldp
router-id 11.2.1.1
end
```

DUTC：

```text
configure terminal
interface <PortB>
no switchport
label-switching
ip address 2.2.2.1/24
enable-ldp
exit
interface <PortD>
switchport mode trunk
mpls-vpls v1 vlan 2
exit
interface loopback1
ip address 11.3.1.1/32
exit
mpls vpls v1 1
vpls-peer 11.1.1.1 raw
exit
router rip
network 11.0.0.0/8
network 2.2.2.0/24
exit
router ldp
router-id 11.3.1.1
targeted-peer 11.1.1.1
transport-address 11.3.1.1
end
```

**触发与等待**

- DUTA：执行批量配置动作（循环 1024 次），并按脚本中的断言检查配置结果。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
async (dutA) => {
    await dutA.exec("configure terminal");
    for (let i = 2; i <= 1024; i++) {
      await dutA.exec(`mpls vpls v${i} ${i}`);
      await dutA.exec("vpls-peer 11.3.1.1 raw");
      await dutA.exec(`exit`);
    }
    await dutA.exec("end");

    return true;
  }
```

</details>

- DUTC：执行批量配置动作（循环 1024 次），并按脚本中的断言检查配置结果。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
async (dutC) => {
    await dutC.exec("configure terminal");
    for (let i = 2; i <= 1024; i++) {
      await dutC.exec(`mpls vpls v${i} ${i}`);
      await dutC.exec("vpls-peer 11.1.1.1 raw");
      await dutC.exec(`exit`);
    }
    await dutC.exec("end");

    return true;
  }
```

</details>

- DUTA：执行批量配置动作（循环 1024 次），并按脚本中的断言检查配置结果。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
async (dutA) => {
    await dutA.exec("configure terminal");
    await dutA.exec(`interface ${Port.D}`);
    for (let i = 2; i <= 1024; i++) {
      await dutA.exec(`mpls-vpls v${i} vlan ${i + 1}`);
    }
    await dutA.exec("end");

    return true;
  }
```

</details>

- DUTC：执行批量配置动作（循环 1024 次），并按脚本中的断言检查配置结果。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
async (dutC) => {
    await dutC.exec("configure terminal");
    await dutC.exec(`interface ${Port.D}`);
    for (let i = 2; i <= 1024; i++) {
      await dutC.exec(`mpls-vpls v${i} vlan ${i + 1}`);
    }
    await dutC.exec("end");

    return true;
  }
```

</details>

- 固定等待 25 秒；等待依据见脚本注释。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.1.1.*?OPERATIONAL/`；超时 60 秒。
- DUTB：轮询 `show ldp session`，回显应匹配正则 `/11.11.4.4.*?OPERATIONAL/`；超时 30 秒。
- DUTA：执行批量配置动作（循环 1024 次），并按脚本中的断言检查配置结果。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
async (dutA) => {
    await dutA.exec("configure terminal");
    await dutA.safeExec(`interface ${Port.D}`);
    for (let i = 2; i <= 1024; i++) {
      await dutA.safeExec(`no mpls-vpls v${i} vlan ${i + 1}`);
    }
    await dutA.exec("end");

    return true;
  }
```

</details>

- DUTC：执行批量配置动作（循环 1024 次），并按脚本中的断言检查配置结果。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
async (dutC) => {
    await dutC.exec("configure terminal");
    await dutC.safeExec(`interface ${Port.D}`);
    for (let i = 2; i <= 1024; i++) {
      await dutC.safeExec(`no mpls-vpls v${i} vlan ${i + 1}`);
    }
    await dutC.exec("end");

    return true;
  }
```

</details>

- DUTA：执行批量配置动作（循环 1024 次），并按脚本中的断言检查配置结果。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
async (dutA) => {
    await dutA.safeExec("configure terminal");
    for (let i = 2; i <= 1024; i++) {
      await dutA.safeExec(`no mpls vpls v${i}`);
    }
    await dutA.safeExec("end");

    return true;
  }
```

</details>

- DUTC：执行批量配置动作（循环 1024 次），并按脚本中的断言检查配置结果。

<details>
<summary>脚本片段（仅追溯）</summary>

```ts
async (dutC) => {
    await dutC.safeExec("configure terminal");
    for (let i = 2; i <= 1024; i++) {
      await dutC.safeExec(`no mpls vpls v${i}`);
    }
    await dutC.safeExec("end");

    return true;
  }
```

</details>

**清理**

DUTA：

```text
configure terminal
interface <PortA>
switchport
disable-ldp
exit
interface <PortD>
no mpls-vpls v1 vlan 2
switchport mode access
exit
no interface loopback 1
no mpls vpls v1
no router rip
no router ldp
end
```

DUTB：

```text
configure terminal
interface <PortB>
switchport
disable-ldp
exit
interface <PortA>
switchport
disable-ldp
exit
no interface loopback 0
no router rip
no router ldp
end
```

DUTC：

```text
configure terminal
interface <PortB>
switchport
disable-ldp
exit
interface <PortD>
no mpls-vpls v1 vlan 2
switchport mode access
exit
no interface loopback 1
no mpls vpls v1
no router rip
no router ldp
end
```

**判定**

配置命令均被接受，观测项全部满足，清理后无本用例残留 → `Pass`；任一必检项不满足 → `Fail`；环境或能力不足 → `Blocked`。

## 5. 清理与恢复

各子用例的清理命令见第 4 节对应小节。用例执行完毕后，按设备执行以下检查，确认本文档新增对象均已删除。

```text
show running-config
show mpls
show ldp session
show ip route
```

清理顺序：业务路由 → 接口、隧道与 loopback → 协议进程 → VRF → 接口回二层。清理完成后重新执行上述命令，确认无本文档对象残留。

## 6. 备注 / 标准裁剪

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | 标准裁剪 | 设备支持可选特性时执行对应测试点；能力未覆盖时标记 `Blocked` 并注明原因 |
| 2 | 脚本与文档一致性 | 本文以当前脚本为事实来源；脚本修改后应同步更新本文 |

## 7. 执行与结果记录

| 项 | 内容 |
| --- | --- |
| 执行时间 / 执行人 | |
| 结论 | Pass / Fail / Blocked |
| 实际观测 | 按用例编号记录实际回显或抓包结果 |
| 证据 | 回显文件 / 抓包文件 / 日志位置 |
| 关联缺陷 / 需求 | |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| --- | --- | --- | --- |
| 0010 | | | |

