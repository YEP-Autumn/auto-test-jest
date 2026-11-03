# 测试用例描述（docs/test-cases）

存放「文本化测试用例」，与 `test/` 下的脚本一一对应：

- 目录结构与 `test/feature/` 保持一致：`<NN-FEATURE>[/<NN-sub_feature>]/<NNNN>-<FEATURE>.md`
- 模板：[`docs/spec/test-case-template.md`](../spec/test-case-template.md)
- 命名规则参见 [`docs/spec/naming-convention.md`](../spec/naming-convention.md)

## 约定

用例描述**与测试框架、脚本实现无关**：不含框架/工具/函数/代码/匹配模式等实现细节，
任何人只依据文档即可手工复现，也可用任意自动化框架落地。脚本路径只作为元数据用于追溯。

## 用途

1. **设计先行**：先写用例描述、评审通过后再落地为脚本。
2. **回归基线**：脚本改动时同步更新描述，两者不一致即为需要处理的差异。

## 已收录用例

| 用例编号 | 特性 | 描述 | 对应脚本 |
| --- | --- | --- | --- |
| 0010 | `10-BGP_EVPN_VXLAN` | [0010-BGP_EVPN_VXLAN.md](10-BGP_EVPN_VXLAN/0010-BGP_EVPN_VXLAN.md) | `test/feature/10-BGP_EVPN_VXLAN/0010-BGP_EVPN_VXLAN.test.ts` |
| 0010 | `misc/stack/70-acl-qos` | [0010-ACL_QOS.md](misc/stack/70-acl-qos/0010-ACL_QOS.md)<br>（合集，34 条用例 0010~0340） | `test/misc/stack/70-acl-qos/{01-…,11-…}/*-ACL_QOS.test.ts` |
