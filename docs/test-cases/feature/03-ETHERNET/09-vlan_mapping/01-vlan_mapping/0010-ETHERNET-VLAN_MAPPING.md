# VLAN 转换映射表配置与回显

> 本文依据 `docs/spec/test-case-template.md` 编写，覆盖本脚本的测试用例；文档中的子用例与脚本中的 `test()` 一一对应。
> 本脚本只验证配置、回显与清理，不发送流量；转发行为见同目录 `0020-ETHERNET-VLAN_MAPPING.md`，配置限制见 `0030-ETHERNET-VLAN_MAPPING.md`。

## 0. 用例清单

| 用例编号 | 用例标题                                                    | 脚本                                 | 类型      | 结果 |
| -------- | ----------------------------------------------------------- | ------------------------------------ | --------- | ---- |
| 0010.1   | 支持配置单层 raw-vlan 映射并在映射表中显示                  | `0010-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 功能 |      |
| 0010.2   | 支持配置双层 raw-vlan 映射并在映射表中显示                  | `0010-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 功能 |      |
| 0010.3   | 支持配置 raw-vlan out-of-range 映射并显示 out-of-range 条目 | `0010-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 功能 |      |
| 0010.4   | 支持多个 raw-vlan 映射同一 EVC 并在配置中合并显示           | `0010-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 功能 |      |
| 0010.5   | 支持不同 EVC 使用相同 mapped VLAN 并分别显示映射条目        | `0010-ETHERNET-VLAN_MAPPING.test.ts` | P1 / 功能 |      |

## 1. 基本信息（用例）

- 用例编号：`0010`
- 用例标题：VLAN 转换映射表配置与回显
- 所属特性 / 分组：`03-ETHERNET` / `VLAN映射配置` / `VLAN转换`
- 级别 / 类型：P1 / 功能
- 执行方式：手工 / 自动化脚本
- 预估耗时：约 15 分钟（按每条用例 3 分钟估算）
- 关联：`test/feature/03-ETHERNET/09-vlan_mapping/01-vlan_mapping/`；设计模板见 [test-case-template.md](../../../../../spec/test-case-template.md)

### 1.1 标准依据

| 标准 / RFC       | 条款                                       | 本文档验证的要求                                                                                             |
| ---------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| IEEE 802.1Q-2018 | 6.7、8.8                                   | VLAN 标记识别、VLAN 成员与 Trunk 转发                                                                        |
| 设备配置指导 3.9 | 3.9.2 配置 VLAN 转换                       | EVC、VLAN 映射表与 trunk VLAN 转换接口的配置顺序                                                             |
| 设备命令参考 3.8 | 3.8.2、3.8.6、3.8.8、3.8.9、3.8.16、3.8.17 | `dot1q mapped-vlan`、`raw-vlan`、`show vlan mapping table`、`switchport trunk vlan-translation` 的语法与回显 |

### 1.2 能力前提

| 项             | 要求                               | 说明                             |
| -------------- | ---------------------------------- | -------------------------------- |
| 设备 profile   | `default`                          | 确认 VLAN 转换特性可用           |
| License / 单板 | 支持 EVC 与 VLAN 映射              | 确认功能授权与端口能力           |
| 端口形态       | 至少 1 个可切换为 trunk 的接口     | 本组用例只使用 `<PortA>`         |
| 规格           | 映射表、EVC、VLAN 数量满足用例要求 | 本组最多使用 2 个 EVC、5 个 VLAN |

能力不匹配时，用例结果标记为 `Blocked`，记录缺失项；环境具备后补测。

## 2. 组网与拓扑

本组用例只检测单台设备的配置与回显，不发送流量，也不需要测试仪端口。

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

| 参数       | 取值          | 说明                                |
| ---------- | ------------- | ----------------------------------- |
| 接口模式   | trunk         | VLAN 转换只能在 trunk 口开启        |
| 允许 VLAN  | all           | 避免被测 VLAN 被 trunk 允许列表过滤 |
| EVC 名称   | 数字 `1`、`2` | 本组用例的 EVC 名称                 |
| 映射表名称 | `vm`          | 本组用例的映射表名称                |
| 定时器     | 设备默认值    | 本组无协议收敛等待                  |

### 3.2 初始状态

- 接口处于二层默认态或三层默认态，执行配置前不要求预先切换模式。
- 设备上不存在 `vm` 映射表、EVC `1`/`2` 以及本组用例使用的 VLAN。
- 设备已具备 console、telnet 或 ssh 登录方式，可进入全局配置模式。
- 现场保留：默认清理；保留位置：无。

## 4. 测试步骤与预期结果

本组各子用例的公共执行顺序如下。

| 步骤 | 设备 | 动作                    | 预期                                          |
| ---- | ---- | ----------------------- | --------------------------------------------- |
| 1    | DUTA | 执行基线检查            | 映射表 `vm`、EVC `1`/`2` 和被测 VLAN 均不存在 |
| 2    | DUTA | 按 4.N 的配置块下发命令 | 命令均被接受，无 `% Invalid input` 等报错     |
| 3    | DUTA | 按 4.N 执行 `show` 校验 | 回显与预期逐条一致                            |
| 4    | DUTA | 按 4.N 的清理块恢复     | 映射表、EVC、VLAN 和接口配置均无残留          |

> 命令中的 `<PortA>` 为逻辑端口名，执行前替换为实际接口名。
> 观测面说明见 `test-case-template.md` 附录 A；判定标准见附录 B。

### 4.1 用例 0010.1：支持配置单层 raw-vlan 映射并在映射表中显示

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟

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
end
```

**观测与预期**

| 观测命令                                      | 预期                                                                                                                                             |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `show vlan mapping table`                     | 存在 `vm  1  200  10` 一行：表名 `vm`、EVC `1`、mapped VLAN `200`、raw VLAN `10`                                                                 |
| `show vlan mapping table applied-interface`   | 存在 `vm  <PortA>  VLAN Translation`                                                                                                             |
| `show interface switchport interface <PortA>` | `Switchport mode : trunk`、`VLAN traslation : enable`、`VLAN mapping table : vm` 三项同时成立                                                    |
| `show running-config`                         | 同时存在 `raw-vlan 10 evc 1`、`dot1q mapped-vlan 200`、`switchport trunk vlan-translation`、`switchport trunk vlan-translation mapping table vm` |

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no switchport trunk vlan-translation mapping table
no switchport trunk vlan-translation
switchport mode access
exit
no vlan mapping table vm
no ethernet evc 1
vlan database
no vlan 10,200
exit
end
```

### 4.2 用例 0010.2：支持配置双层 raw-vlan 映射并在映射表中显示

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟

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
end
```

**观测与预期**

| 观测命令                                    | 预期                                                                               |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `show vlan mapping table`                   | 存在 `vm  2  400  200(100)` 一行，括号内为内层 VLAN `100`，括号外为外层 VLAN `200` |
| `show vlan mapping table applied-interface` | 存在 `vm  <PortA>  VLAN Translation`                                               |
| `show running-config`                       | 同时存在 `raw-vlan 100 200 evc 2` 与 `dot1q mapped-vlan 400`                       |

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no switchport trunk vlan-translation mapping table
no switchport trunk vlan-translation
switchport mode access
exit
no vlan mapping table vm
no ethernet evc 2
vlan database
no vlan 100,200,400
exit
end
```

### 4.3 用例 0010.3：支持配置 raw-vlan out-of-range 映射并显示 out-of-range 条目

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟

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
end
```

**观测与预期**

| 观测命令                                    | 预期                                                                                |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| `show vlan mapping table`                   | 第一行 `vm  1  200  10`，第二行 `2  300  out-of-range`；第二行沿用上一行的表名 `vm` |
| `show running-config`                       | 同时存在 `raw-vlan 10 evc 1` 与 `raw-vlan out-of-range evc 2`                       |
| `show vlan mapping table applied-interface` | 存在 `vm  <PortA>  VLAN Translation`                                                |

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no switchport trunk vlan-translation mapping table
no switchport trunk vlan-translation
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

### 4.4 用例 0010.4：支持多个 raw-vlan 映射同一 EVC 并在配置中合并显示

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟

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
end
```

**观测与预期**

| 观测命令                                    | 预期                                                              |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `show vlan mapping table`                   | 存在 `vm  1  200  10, 20` 一行，两个 raw VLAN 以 `, ` 分隔        |
| `show running-config`                       | 存在 `raw-vlan 10,20 evc 1`，两条 raw-vlan 配置在回显中合并为一条 |
| `show vlan mapping table applied-interface` | 存在 `vm  <PortA>  VLAN Translation`                              |

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no switchport trunk vlan-translation mapping table
no switchport trunk vlan-translation
switchport mode access
exit
no vlan mapping table vm
no ethernet evc 1
vlan database
no vlan 10,20,200
exit
end
```

### 4.5 用例 0010.5：支持不同 EVC 使用相同 mapped VLAN 并分别显示映射条目

- 级别 / 类型：P1 / 功能
- 预估耗时：约 3 分钟

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
end
```

**观测与预期**

| 观测命令                                    | 预期                                                                          |
| ------------------------------------------- | ----------------------------------------------------------------------------- |
| `show vlan mapping table`                   | 两行：`vm  1  200  10` 与 `2  200  20`；两个 EVC 使用相同的 mapped VLAN `200` |
| `show running-config`                       | 同时存在 `raw-vlan 10 evc 1` 与 `raw-vlan 20 evc 2`                           |
| `show vlan mapping table applied-interface` | 存在 `vm  <PortA>  VLAN Translation`                                          |

**清理**

DUTA：

```text
configure terminal
interface <PortA>
no switchport trunk vlan-translation mapping table
no switchport trunk vlan-translation
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

| #   | 项               | 说明                                                                                      |
| --- | ---------------- | ----------------------------------------------------------------------------------------- |
| 1   | 仅配置面         | 本组用例不校验转发结果，避免与 0020 的流量用例重复                                        |
| 2   | 设备拼写         | 设备回显为 `VLAN traslation`（缺少 `n`），用例按实际回显匹配                              |
| 3   | 多 raw-vlan 合并 | 设备将同一 EVC 下的多个 raw-vlan 在 `show running-config` 中合并为 `raw-vlan 10,20 evc 1` |
| 4   | 脚本与文档一致性 | 本文以当前脚本为事实来源；脚本修改后应同步更新本文                                        |

## 7. 执行与结果记录

| 项                | 内容                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| 执行时间 / 执行人 |                                                                                                         |
| 结论              | Pass / Fail / Blocked                                                                                   |
| 实际观测          | 按用例编号记录 `show vlan mapping table`、`show interface switchport`、`show running-config` 的实际回显 |
| 证据              | 回显文件 / 日志位置                                                                                     |
| 关联缺陷 / 需求   |                                                                                                         |

逐条结果：

| 用例编号 | 结论 | 实际观测 | 证据 |
| -------- | ---- | -------- | ---- |
| 0010.1   |      |          |      |
| 0010.2   |      |          |      |
| 0010.3   |      |          |      |
| 0010.4   |      |          |      |
| 0010.5   |      |          |      |
