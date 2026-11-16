# VLAN 转换配置限制

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本验证设备对不支持的映射表条目和重复映射的拒绝行为，不发送流量；配置与回显见 `0010-ETHERNET-VLAN_MAPPING.md`，转发行为见 `0020-ETHERNET-VLAN_MAPPING.md`。

## 0. 用例清单

| 用例编号 | 用例标题                                                    | 脚本                                 | 类型      | 结果 |
| -------- | ----------------------------------------------------------- | ------------------------------------ | --------- | ---- |
| 0030.1   | 带 VLAN tag 的 raw-vlan 不能关联双层 tag 的 EVC             | `0030-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 反向 |      |
| 0030.2   | 含 raw-vlan group 的映射表不能应用到 trunk VLAN 转换接口    | `0030-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 反向 |      |
| 0030.3   | 含 raw-vlan untagged 的映射表不能应用到 trunk VLAN 转换接口 | `0030-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 反向 |      |
| 0030.4   | 含 egress-vlan 的映射表不能应用到 trunk VLAN 转换接口       | `0030-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 反向 |      |
| 0030.5   | 相同的 raw-vlan 不能映射到不同的 EVC                        | `0030-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 反向 |      |

## 1. 基本信息（用例）

- 用例编号：`0030`
- 用例标题：VLAN 转换配置限制
- 所属特性 / 分组：`03-ETHERNET` / `VLAN映射配置` / `VLAN转换`
- 级别 / 类型：P1 / 反向
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 15 分钟（按每条用例 3 分钟估算）
- 关联：`test/feature/03-ETHERNET/09-vlan_mapping/01-vlan_mapping/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC       | 条款                        | 本文档验证的要求                                                           |
| ---------------- | --------------------------- | -------------------------------------------------------------------------- |
| IEEE 802.1Q-2018 | 6.7、8.8                    | VLAN 标记与双层标记的合法组合                                              |
| 设备配置指导 3.9 | 3.9.2 配置 VLAN 转换        | trunk VLAN 转换接口支持的映射表类型                                        |
| 设备命令参考 3.8 | 3.8.3、3.8.5、3.8.6、3.8.17 | `dot1q mapped-double-vlan`、`raw vlan group`、`raw-vlan`、映射表应用的限制 |

### 1.2 能力前提

| 项             | 要求                                  | 说明                   |
| -------------- | ------------------------------------- | ---------------------- |
| 设备 profile   | `default`                             | 确认 VLAN 转换特性可用 |
| License / 单板 | 支持 EVC、raw vlan group 与 VLAN 映射 | 确认功能授权与端口能力 |
| 端口形态       | 至少 1 个可切换为 trunk 的接口        | 本组使用 `<PortA>`     |
| 规格           | raw vlan group 1 可用                 | 组号 1-64              |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。

## 2. 组网与拓扑

本组用例只检测单台设备的配置拒绝行为，不发送流量，也不需要测试仪端口。

```text
          +--------+
          |  DUTA  |--<PortA>
          +--------+
```

| 设备 / 对象 | 端口占位符 | 说明                                                    |
| ----------- | ---------- | ------------------------------------------------------- |
| DUTA        | `<PortA>`  | 被测 trunk 接口，执行前替换为实际接口名，例如 `eth-0-1` |
| 测试仪      | 无         | 本组用例不发送流量                                      |

## 3. 预置条件

### 3.1 协议基线参数

| 参数           | 取值               | 说明                         |
| -------------- | ------------------ | ---------------------------- |
| 接口模式       | trunk              | VLAN 转换只能在 trunk 口开启 |
| EVC 名称       | 数字 `1`、`2`、`5` | 各子用例按需创建             |
| 映射表名称     | `vm`               | 本组用例的映射表名称         |
| raw vlan group | `1`                | 0030.2 使用，成员 VLAN 30-40 |

### 3.2 初始状态

- 接口处于二层默认态或三层默认态，执行配置前不要求预先切换模式。
- 设备上不存在 `vm` 映射表、本组使用的 EVC、raw vlan group 和 VLAN。
- 设备已具备 console、telnet 或 ssh 登录方式，可进入全局配置模式。
- 现场保留：默认清理；保留位置：无。

## 4. 测试步骤与预期结果

本组各子用例的公共执行顺序如下。

| 步骤 | 设备 | 动作                        | 预期                                                 |
| ---- | ---- | --------------------------- | ---------------------------------------------------- |
| 1    | DUTA | 执行基线检查                | 映射表、EVC、raw vlan group、被测 VLAN 均不存在      |
| 2    | DUTA | 按 4.N 的配置块下发基础配置 | 命令均被接受                                         |
| 3    | DUTA | 按 4.N 下发受限命令         | 设备拒绝并返回 4.N 规定的错误信息                    |
| 4    | DUTA | 按 4.N 执行回显校验         | 受限条目未进入映射表或未应用到接口                   |
| 5    | DUTA | 按 4.N 的清理块恢复         | 映射表、EVC、raw vlan group、VLAN 和接口配置均无残留 |

> 受限命令的失败**不**计入脚本失败；脚本判定的是「设备返回了规定错误 + 配置未生效 + 清理成功」。
> 观测面说明见 `test-case-template.md` 附录 A；判定标准见附录 B。

### 4.1 用例 0030.1：带 VLAN tag 的 raw-vlan 不能关联双层 tag 的 EVC

- 级别 / 类型：P1 / 反向
- 预估耗时：约 3 分钟

**配置**

DUTA：

```text
configure terminal
vlan database
vlan 30,100,200
exit
ethernet evc 5
dot1q mapped-double-vlan 100 200
exit
vlan mapping table vm
exit
end
```

**触发**

DUTA：

```text
configure terminal
vlan mapping table vm
raw-vlan 30 evc 5
end
```

**观测与预期**

| 观测命令 / 返回            | 预期                                            |
| -------------------------- | ----------------------------------------------- |
| `raw-vlan 30 evc 5` 的回显 | `% Only untagged packet can be added two tags`  |
| `show vlan mapping table`  | 不含独立的 VLAN `30` 条目；映射表未被新增该条目 |

**清理**

DUTA：

```text
configure terminal
no vlan mapping table vm
no ethernet evc 5
vlan database
no vlan 30,100,200
exit
end
```

### 4.2 用例 0030.2：含 raw-vlan group 的映射表不能应用到 trunk VLAN 转换接口

- 级别 / 类型：P1 / 反向
- 预估耗时：约 3 分钟

**配置**

DUTA：

```text
configure terminal
vlan database
vlan 30-40,200
exit
raw vlan group 1 vlan 30-40
ethernet evc 1
dot1q mapped-vlan 200
exit
vlan mapping table vm
raw-vlan group 1 evc 1
exit
interface <PortA>
switchport
switchport mode trunk
switchport trunk vlan-translation
exit
end
```

**触发**

DUTA：

```text
configure terminal
interface <PortA>
switchport trunk vlan-translation mapping table vm
end
```

**观测与预期**

| 观测命令 / 返回                                           | 预期                                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 应用映射表命令的回显                                      | `% VLAN mapping table owns raw group`                                        |
| `show vlan mapping table applied-interface`               | 不出现 `vm  <PortA>  VLAN Translation`                                       |
| `show interface switchport interface <PortA>`（手工复核） | `VLAN traslation : enable` 仍成立，但 `VLAN mapping table` 为空或未显示 `vm` |

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no switchport trunk vlan-translation
switchport mode access
exit
no vlan mapping table vm
no ethernet evc 1
no raw vlan group 1
vlan database
no vlan 30-40,200
exit
end
```

### 4.3 用例 0030.3：含 raw-vlan untagged 的映射表不能应用到 trunk VLAN 转换接口

- 级别 / 类型：P1 / 反向
- 预估耗时：约 3 分钟

**配置**

DUTA：

```text
configure terminal
vlan database
vlan 200
exit
ethernet evc 1
dot1q mapped-vlan 200
exit
vlan mapping table vm
raw-vlan untagged evc 1
exit
interface <PortA>
switchport
switchport mode trunk
switchport trunk vlan-translation
exit
end
```

**触发**

DUTA：

```text
configure terminal
interface <PortA>
switchport trunk vlan-translation mapping table vm
end
```

**观测与预期**

| 观测命令 / 返回                             | 预期                                                              |
| ------------------------------------------- | ----------------------------------------------------------------- |
| 应用映射表命令的回显                        | `% Can't apply VLAN mapping table, untagged raw vlan entry exist` |
| `show vlan mapping table applied-interface` | 不出现 `vm  <PortA>  VLAN Translation`                            |

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no switchport trunk vlan-translation
switchport mode access
exit
no vlan mapping table vm
no ethernet evc 1
vlan database
no vlan 200
exit
end
```

### 4.4 用例 0030.4：含 egress-vlan 的映射表不能应用到 trunk VLAN 转换接口

- 级别 / 类型：P1 / 反向
- 预估耗时：约 3 分钟

**配置**

DUTA：

```text
configure terminal
vlan database
vlan 100,111,200
exit
vlan mapping table vm
raw-vlan 100 200 egress-vlan 111
exit
interface <PortA>
switchport
switchport mode trunk
switchport trunk vlan-translation
exit
end
```

**触发**

DUTA：

```text
configure terminal
interface <PortA>
switchport trunk vlan-translation mapping table vm
end
```

**观测与预期**

| 观测命令 / 返回                             | 预期                                                                |
| ------------------------------------------- | ------------------------------------------------------------------- |
| 应用映射表命令的回显                        | `% Can't apply VLAN mapping table, egress vlan mapping entry exist` |
| `show vlan mapping table applied-interface` | 不出现 `vm  <PortA>  VLAN Translation`                              |

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no switchport trunk vlan-translation
switchport mode access
exit
no vlan mapping table vm
vlan database
no vlan 100,111,200
exit
end
```

### 4.5 用例 0030.5：相同的 raw-vlan 不能映射到不同的 EVC

- 级别 / 类型：P1 / 反向
- 预估耗时：约 3 分钟

**配置**

DUTA：

```text
configure terminal
vlan database
vlan 10,200,210
exit
ethernet evc 1
dot1q mapped-vlan 200
exit
ethernet evc 2
dot1q mapped-vlan 210
exit
vlan mapping table vm
raw-vlan 10 evc 1
exit
end
```

**触发**

DUTA：

```text
configure terminal
vlan mapping table vm
raw-vlan 10 evc 2
end
```

**观测与预期**

| 观测命令 / 返回                   | 预期                                                   |
| --------------------------------- | ------------------------------------------------------ |
| 第二条 `raw-vlan 10 evc 2` 的回显 | `% VLAN mapping entry exist for raw vlan 10`           |
| `show vlan mapping table`         | 保留 `vm  1  200  10`；不出现 mapped VLAN `210` 的条目 |

**清理**

DUTA：

```text
configure terminal
no vlan mapping table vm
no ethernet evc 1
no ethernet evc 2
vlan database
no vlan 10,200,210
exit
end
```

## 5. 清理与恢复

各子用例的清理命令见第 4 节对应小节。清理必须按以下顺序执行：

1. 接口解绑映射表（若已应用）：`no switchport trunk vlan-translation mapping table`；
2. 关闭 VLAN 转换并恢复二层模式：`no switchport trunk vlan-translation`、`switchport mode access`；
3. 删除映射表：`no vlan mapping table vm`；
4. 删除 EVC：`no ethernet evc <id>`；
5. 删除 raw vlan group：`no raw vlan group 1`；
6. 删除 VLAN：`vlan database`、`no vlan <list>`、`exit`。

清理完成后执行以下命令确认无残留：

```text
show vlan mapping table
show vlan mapping table applied-interface
show running-config | include raw-vlan|ethernet evc|dot1q|vlan mapping table|raw vlan group
show vlan brief
```

预期：映射表查询报 `% VLAN mapping table  not found`，`applied-interface` 无 `vm` 记录，过滤后的 `running-config` 为空。

## 6. 备注 / 标准裁剪

| #   | 项               | 说明                                                                                                      |
| --- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | 反向判定         | 受限命令返回错误属于预期结果，脚本通过自定义动作捕获错误文本，不将命令失败判为用例失败                    |
| 2   | 应用失败后的清理 | 映射表未应用成功时，不执行 `no switchport trunk vlan-translation mapping table`，否则设备会报映射表不存在 |
| 3   | 设备拼写         | 设备回显为 `VLAN traslation`（缺少 `n`），涉及回显校验时按实际值匹配                                      |
| 4   | 脚本与文档一致性 | 本文以当前脚本为事实来源；脚本修改后应同步更新本文                                                        |

## 7. 执行与结果记录

| 项                | 内容                                                   |
| ----------------- | ------------------------------------------------------ |
| 执行时间 / 执行人 |                                                        |
| 结论              | Pass / Fail / Blocked                                  |
| 实际观测          | 按用例编号记录受限命令的错误信息、映射表回显和应用状态 |
| 证据              | 回显文件 / 日志位置                                    |
| 关联缺陷 / 需求   |                                                        |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| -------- | ---- | -------- | ---- |
| 0030.1   |      |          |      |
| 0030.2   |      |          |      |
| 0030.3   |      |          |      |
| 0030.4   |      |          |      |
| 0030.5   |      |          |      |
