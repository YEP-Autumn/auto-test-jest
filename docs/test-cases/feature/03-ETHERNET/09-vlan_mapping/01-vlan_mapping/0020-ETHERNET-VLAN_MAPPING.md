# VLAN 转换转发行为

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本验证映射表应用后的报文转发行为，需要测试仪收发报文；配置与回显见 `0010-ETHERNET-VLAN_MAPPING.md`，配置限制见 `0030-ETHERNET-VLAN_MAPPING.md`。

## 0. 用例清单

| 用例编号 | 用例标题                                                        | 脚本                                 | 类型      | 结果 |
| -------- | --------------------------------------------------------------- | ------------------------------------ | --------- | ---- |
| 0020.1   | 单层唯一映射在 ingress 与 egress 方向均转换 VLAN                | `0020-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 功能 |      |
| 0020.2   | 双层唯一映射在 ingress 与 egress 方向仅转换外层 VLAN            | `0020-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 功能 |      |
| 0020.3   | out-of-range 将未匹配 VLAN 转换到指定 EVC 且不影响已匹配 VLAN   | `0020-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 功能 |      |
| 0020.4   | 多个 raw-vlan 映射同一 EVC 时 ingress 均转换为相同 mapped VLAN  | `0020-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 功能 |      |
| 0020.5   | 不同 EVC 使用相同 mapped VLAN 时 ingress 均转换为该 mapped VLAN | `0020-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 功能 |      |

## 1. 基本信息（用例）

- 用例编号：`0020`
- 用例标题：VLAN 转换转发行为
- 所属特性 / 分组：`03-ETHERNET` / `VLAN映射配置` / `VLAN转换`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 仪表 / 自动化脚本
- 预估耗时：约 20 分钟（按每条用例 4 分钟估算）
- 关联：`test/feature/03-ETHERNET/09-vlan_mapping/01-vlan_mapping/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC       | 条款                         | 本文档验证的要求                                                            |
| ---------------- | ---------------------------- | --------------------------------------------------------------------------- |
| IEEE 802.1Q-2018 | 6.7、8.8                     | VLAN 标记在入口、出口方向的识别与改写                                       |
| 设备配置指导 3.9 | 3.9.2 配置 VLAN 转换         | 客户 VLAN 转换为服务商 VLAN，以及反向还原                                   |
| 设备命令参考 3.8 | 3.8.2、3.8.6、3.8.16、3.8.17 | `dot1q mapped-vlan`、`raw-vlan`、`switchport trunk vlan-translation` 的语义 |

### 1.2 能力前提

| 项             | 要求                               | 说明                             |
| -------------- | ---------------------------------- | -------------------------------- |
| 设备 profile   | `default`                          | 确认 VLAN 转换特性可用           |
| License / 单板 | 支持 EVC 与 VLAN 映射              | 确认功能授权与端口能力           |
| 端口形态       | 至少 2 个可切换为 trunk 的接口     | 本组使用 `<PortA>`、`<PortB>`    |
| 测试仪端口     | `StreamPort.A`、`StreamPort.B`       | 确认流量收发端口可用             |
| 规格           | 映射表、EVC、VLAN 数量满足用例要求 | 本组最多使用 2 个 EVC、5 个 VLAN |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。

## 2. 组网与拓扑

```text
                         +--------+
 StreamPort.A <=> PortA--|  DUTA  |--PortB <=> StreamPort.B
                         +--------+
```

内置拓扑：`LinkConstraint.one_device_topo_links_type_1`。

| 设备 / 对象 | 端口占位符                     | 说明                                                            |
| ----------- | ------------------------------ | --------------------------------------------------------------- |
| DUTA        | `<PortA>`、`<PortB>`           | `<PortA>` 开启 VLAN 转换并应用映射表，`<PortB>` 为普通 trunk 口 |
| 测试仪      | ``StreamPort.A``、``StreamPort.B`` | 分别连接 `<PortA>`、`<PortB>`，按实际连接配置                   |

## 3. 预置条件

### 3.1 协议基线参数

| 参数       | 取值               | 说明                                   |
| ---------- | ------------------ | -------------------------------------- |
| 接口模式   | trunk              | VLAN 转换只能在 trunk 口开启           |
| 允许 VLAN  | all                | 避免被测 VLAN 被 trunk 允许列表过滤    |
| EVC 名称   | 数字 `1`、`2`、`5` | 各子用例按需创建                       |
| 映射表名称 | `vm`               | 本组用例的映射表名称                   |
| 发送模式   | `STEP`，步数 10    | 每个方向发送 10 帧，便于按精确计数判定 |
| MTU        | 1500               | 报文为普通以太网帧，不含额外封装       |

### 3.2 初始状态

- 接口处于二层默认态或三层默认态，执行配置前不要求预先切换模式。
- 设备上不存在 `vm` 映射表、本组使用的 EVC 和 VLAN。
- 测试仪端口已连接并可用，收发端口与脚本中的 `StreamPort` 对应。
- 现场保留：默认清理；保留位置：无。

## 4. 测试步骤与预期结果

本组各子用例的公共执行顺序如下。

| 步骤 | 设备   | 动作                          | 预期                                      |
| ---- | ------ | ----------------------------- | ----------------------------------------- |
| 1    | DUTA   | 执行基线检查                  | 映射表、EVC、被测 VLAN 均不存在           |
| 2    | DUTA   | 按 4.N 的配置块下发命令       | 命令均被接受，无 `% Invalid input` 等报错 |
| 3    | 测试仪 | 在接收端口启动抓包            | 抓包启动成功                              |
| 4    | 测试仪 | 从发送端口发送 4.N 规定的报文 | 发送成功，步数 10                         |
| 5    | 测试仪 | 在接收端口校验报文            | 命中 4.N 规定的报文，计数为 10            |
| 6    | DUTA   | 按 4.N 的清理块恢复           | 映射表、EVC、VLAN 和接口配置均无残留      |

> 报文校验由 `addPktChecker` 完成，校验结束时自动停止抓包。
> 观测面说明见 `test-case-template.md` 附录 A；判定标准见附录 B。

### 4.1 用例 0020.1：单层唯一映射在 ingress 与 egress 方向均转换 VLAN

- 级别 / 类型：P1 / 功能
- 预估耗时：约 4 分钟

**配置**

DUTA：

```text
configure terminal
vlan database
vlan 10,200
exit
ethernet evc 1
dot1q mapped-vlan 200
exit
vlan mapping table vm
raw-vlan 10 evc 1
exit
interface <PortA>
switchport
switchport mode trunk
switchport trunk vlan-translation
switchport trunk vlan-translation mapping table vm
switchport trunk allowed vlan all
exit
interface <PortB>
switchport
switchport mode trunk
switchport trunk allowed vlan all
end
```

**触发与等待**

| 方向   | 发送端口      | 发送报文                                                                                            | 接收端口      | 期望报文                    | 期望计数 |
| ------ | ------------- | --------------------------------------------------------------------------------------------------- | ------------- | --------------------------- | -------- |
| A 到 B | `StreamPort.A` | 单层 VLAN 10，目的 MAC `00:00:01:00:00:ee`，源 MAC `00:00:a0:0a:00:66`，IPv4 `1.1.1.1` → `2.2.2.2`  | `StreamPort.B` | 单层 VLAN 200，其余字段相同 | 10       |
| B 到 A | `StreamPort.B` | 单层 VLAN 200，目的 MAC `00:00:01:00:00:cc`，源 MAC `00:00:a0:0a:00:cc`，IPv4 `1.1.1.1` → `2.2.2.2` | `StreamPort.A` | 单层 VLAN 10，其余字段相同  | 10       |

发送模式为 `STEP`，步数 10。

**观测与预期**

- `StreamPort.B` 抓到 10 帧 VLAN 200：入口方向 `10 → 200`。
- `StreamPort.A` 抓到 10 帧 VLAN 10：出口方向 `200 → 10`。
- 脚本判定两个方向各命中期望 VLAN 10 帧；未命中 VLAN 的残留计数为手工复核项。
- 两个方向均无丢包、无重复帧。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no switchport trunk vlan-translation mapping table
no switchport trunk vlan-translation
switchport mode access
exit
interface <PortB>
switchport mode access
exit
no vlan mapping table vm
no ethernet evc 1
vlan database
no vlan 10,200
exit
end
```

### 4.2 用例 0020.2：双层唯一映射在 ingress 与 egress 方向仅转换外层 VLAN

- 级别 / 类型：P1 / 功能
- 预估耗时：约 4 分钟

**配置**

DUTA：

```text
configure terminal
vlan database
vlan 100,200,400
exit
ethernet evc 2
dot1q mapped-vlan 400
exit
vlan mapping table vm
raw-vlan 100 200 evc 2
exit
interface <PortA>
switchport
switchport mode trunk
switchport trunk vlan-translation
switchport trunk vlan-translation mapping table vm
switchport trunk allowed vlan all
exit
interface <PortB>
switchport
switchport mode trunk
switchport trunk allowed vlan all
end
```

**触发与等待**

| 方向   | 发送端口      | 发送报文                                                                                                           | 接收端口      | 期望报文                                   | 期望计数 |
| ------ | ------------- | ------------------------------------------------------------------------------------------------------------------ | ------------- | ------------------------------------------ | -------- |
| A 到 B | `StreamPort.A` | 外层 VLAN 200、内层 VLAN 100，目的 MAC `00:00:01:00:00:ee`，源 MAC `00:00:a0:0a:00:66`，IPv4 `1.1.1.1` → `2.2.2.2` | `StreamPort.B` | 外层 VLAN 400、内层 VLAN 100，其余字段相同 | 10       |
| B 到 A | `StreamPort.B` | 外层 VLAN 400、内层 VLAN 100，目的 MAC `00:00:01:00:00:cc`，源 MAC `00:00:a0:0a:00:cc`，IPv4 `1.1.1.1` → `2.2.2.2` | `StreamPort.A` | 外层 VLAN 200、内层 VLAN 100，其余字段相同 | 10       |

发送模式为 `STEP`，步数 10。

**观测与预期**

- `StreamPort.B` 抓到 10 帧外层 VLAN 400、内层 VLAN 100：入口方向仅改写外层 `200 → 400`。
- `StreamPort.A` 抓到 10 帧外层 VLAN 200、内层 VLAN 100：出口方向仅还原外层 `400 → 200`。
- 两个方向内层 VLAN 均保持 100，无丢包、无重复帧。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no switchport trunk vlan-translation mapping table
no switchport trunk vlan-translation
switchport mode access
exit
interface <PortB>
switchport mode access
exit
no vlan mapping table vm
no ethernet evc 2
vlan database
no vlan 100,200,400
exit
end
```

### 4.3 用例 0020.3：out-of-range 将未匹配 VLAN 转换到指定 EVC 且不影响已匹配 VLAN

- 级别 / 类型：P1 / 功能
- 预估耗时：约 4 分钟

**配置**

DUTA：

```text
configure terminal
vlan database
vlan 10,11,200,300
exit
ethernet evc 1
dot1q mapped-vlan 200
exit
ethernet evc 2
dot1q mapped-vlan 300
exit
vlan mapping table vm
raw-vlan 10 evc 1
raw-vlan out-of-range evc 2
exit
interface <PortA>
switchport
switchport mode trunk
switchport trunk vlan-translation
switchport trunk vlan-translation mapping table vm
switchport trunk allowed vlan all
exit
interface <PortB>
switchport
switchport mode trunk
switchport trunk allowed vlan all
end
```

**触发与等待**

| 次序 | 发送端口      | 发送报文                                                                                           | 接收端口      | 期望报文                    | 期望计数 |
| ---- | ------------- | -------------------------------------------------------------------------------------------------- | ------------- | --------------------------- | -------- |
| 1    | `StreamPort.A` | 单层 VLAN 10，目的 MAC `00:00:01:00:00:ee`，源 MAC `00:00:a0:0a:00:66`，IPv4 `1.1.1.1` → `2.2.2.2` | `StreamPort.B` | 单层 VLAN 200，其余字段相同 | 10       |
| 2    | `StreamPort.A` | 单层 VLAN 11，帧字段同上                                                                           | `StreamPort.B` | 单层 VLAN 300，其余字段相同 | 10       |

发送模式为 `STEP`，步数 10。

**观测与预期**

- VLAN 10 命中显式条目，转换为 `raw-vlan 10` 对应 EVC 的 mapped VLAN 200。
- VLAN 11 未命中显式条目，按 `raw-vlan out-of-range` 转换为 EVC 2 的 mapped VLAN 300。
- 脚本判定两个次序分别命中 VLAN 200 与 VLAN 300 各 10 帧；第 2 次发送后是否残留 VLAN 200 为手工复核项。
- 两个次序均无丢包、无重复帧。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no switchport trunk vlan-translation mapping table
no switchport trunk vlan-translation
switchport mode access
exit
interface <PortB>
switchport mode access
exit
no vlan mapping table vm
no ethernet evc 1
no ethernet evc 2
vlan database
no vlan 10,11,200,300
exit
end
```

### 4.4 用例 0020.4：多个 raw-vlan 映射同一 EVC 时 ingress 均转换为相同 mapped VLAN

- 级别 / 类型：P1 / 功能
- 预估耗时：约 4 分钟

**配置**

DUTA：

```text
configure terminal
vlan database
vlan 10,20,200
exit
ethernet evc 1
dot1q mapped-vlan 200
exit
vlan mapping table vm
raw-vlan 10 evc 1
raw-vlan 20 evc 1
exit
interface <PortA>
switchport
switchport mode trunk
switchport trunk vlan-translation
switchport trunk vlan-translation mapping table vm
switchport trunk allowed vlan all
exit
interface <PortB>
switchport
switchport mode trunk
switchport trunk allowed vlan all
end
```

**触发与等待**

| 次序 | 发送端口      | 发送报文                                                                                           | 接收端口      | 期望报文                    | 期望计数 |
| ---- | ------------- | -------------------------------------------------------------------------------------------------- | ------------- | --------------------------- | -------- |
| 1    | `StreamPort.A` | 单层 VLAN 10，目的 MAC `00:00:01:00:00:ee`，源 MAC `00:00:a0:0a:00:66`，IPv4 `1.1.1.1` → `2.2.2.2` | `StreamPort.B` | 单层 VLAN 200，其余字段相同 | 10       |
| 2    | `StreamPort.A` | 单层 VLAN 20，帧字段同上                                                                           | `StreamPort.B` | 单层 VLAN 200，其余字段相同 | 10       |

发送模式为 `STEP`，步数 10。

**观测与预期**

- VLAN 10 与 VLAN 20 在入口方向均转换为 VLAN 200，各收到 10 帧。
- 脚本判定两个次序各命中 VLAN 200 10 帧；VLAN 10、VLAN 20 的残留计数为手工复核项。
- 无丢包、无重复帧。

本用例只判定 ingress 方向。多个 raw-vlan 共用同一 mapped VLAN 时，出口方向的反向映射不唯一，设备行为不作为本用例判定项；唯一映射的 egress 行为由 0020.1、0020.2 覆盖。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no switchport trunk vlan-translation mapping table
no switchport trunk vlan-translation
switchport mode access
exit
interface <PortB>
switchport mode access
exit
no vlan mapping table vm
no ethernet evc 1
vlan database
no vlan 10,20,200
exit
end
```

### 4.5 用例 0020.5：不同 EVC 使用相同 mapped VLAN 时 ingress 均转换为该 mapped VLAN

- 级别 / 类型：P1 / 功能
- 预估耗时：约 4 分钟

**配置**

DUTA：

```text
configure terminal
vlan database
vlan 10,20,200
exit
ethernet evc 1
dot1q mapped-vlan 200
exit
ethernet evc 2
dot1q mapped-vlan 200
exit
vlan mapping table vm
raw-vlan 10 evc 1
raw-vlan 20 evc 2
exit
interface <PortA>
switchport
switchport mode trunk
switchport trunk vlan-translation
switchport trunk vlan-translation mapping table vm
switchport trunk allowed vlan all
exit
interface <PortB>
switchport
switchport mode trunk
switchport trunk allowed vlan all
end
```

**触发与等待**

| 次序 | 发送端口      | 发送报文                                                                                           | 接收端口      | 期望报文                    | 期望计数 |
| ---- | ------------- | -------------------------------------------------------------------------------------------------- | ------------- | --------------------------- | -------- |
| 1    | `StreamPort.A` | 单层 VLAN 10，目的 MAC `00:00:01:00:00:ee`，源 MAC `00:00:a0:0a:00:66`，IPv4 `1.1.1.1` → `2.2.2.2` | `StreamPort.B` | 单层 VLAN 200，其余字段相同 | 10       |
| 2    | `StreamPort.A` | 单层 VLAN 20，帧字段同上                                                                           | `StreamPort.B` | 单层 VLAN 200，其余字段相同 | 10       |

发送模式为 `STEP`，步数 10。

**观测与预期**

- EVC 1 的 raw VLAN 10 和 EVC 2 的 raw VLAN 20 在入口方向均转换为 VLAN 200，各收到 10 帧。
- 脚本判定两个次序各命中 VLAN 200 10 帧；VLAN 10、VLAN 20 的残留计数为手工复核项。
- 无丢包、无重复帧。

本用例只判定 ingress 方向。两个 EVC 共用同一 mapped VLAN 时，出口方向的反向映射不唯一，设备行为不作为本用例判定项。

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no switchport trunk vlan-translation mapping table
no switchport trunk vlan-translation
switchport mode access
exit
interface <PortB>
switchport mode access
exit
no vlan mapping table vm
no ethernet evc 1
no ethernet evc 2
vlan database
no vlan 10,20,200
exit
end
```

## 5. 清理与恢复

各子用例的清理命令见第 4 节对应小节。清理必须按以下顺序执行，否则 `no` 命令可能因对象被引用而失败：

1. 接口解绑映射表：`no switchport trunk vlan-translation mapping table`；
2. 关闭 VLAN 转换并恢复二层模式：`no switchport trunk vlan-translation`、`switchport mode access`；
3. 删除映射表：`no vlan mapping table vm`；
4. 删除 EVC：`no ethernet evc <id>`；
5. 删除 VLAN：`vlan database`、`no vlan <list>`、`exit`。

清理完成后执行以下命令确认无残留：

```text
show vlan mapping table
show vlan mapping table applied-interface
show running-config | include raw-vlan|ethernet evc|dot1q|vlan mapping table
show vlan brief
```

预期：映射表查询报 `% VLAN mapping table  not found`，`applied-interface` 无 `vm` 记录，过滤后的 `running-config` 为空。

## 6. 备注 / 标准裁剪

| #   | 项               | 说明                                                                                       |
| --- | ---------------- | ------------------------------------------------------------------------------------------ |
| 1   | egress 判定范围  | 只有唯一映射时判定出口还原；mapped VLAN 与 raw VLAN 不是一对一关系时，出口行为不在判定范围 |
| 2   | 计数判据         | 每个方向发送 10 帧，期望命中 10 帧；未命中期望 VLAN 的计数为 0                             |
| 3   | 设备拼写         | 设备回显为 `VLAN traslation`（缺少 `n`），涉及回显校验时按实际值匹配                       |
| 4   | 脚本与文档一致性 | 本文以当前脚本为事实来源；脚本修改后应同步更新本文                                         |

## 7. 执行与结果记录

| 项                | 内容                                             |
| ----------------- | ------------------------------------------------ |
| 执行时间 / 执行人 |                                                  |
| 结论              | Pass / Fail / Blocked                            |
| 实际观测          | 按用例编号记录各方向收发计数与抓包中的 VLAN 字段 |
| 证据              | 抓包文件 / 日志位置                              |
| 关联缺陷 / 需求   |                                                  |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| -------- | ---- | -------- | ---- |
| 0020.1   |      |          |      |
| 0020.2   |      |          |      |
| 0020.3   |      |          |      |
| 0020.4   |      |          |      |
| 0020.5   |      |          |      |
