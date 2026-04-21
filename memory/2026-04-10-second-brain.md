# 2026-04-11 第二大脑

> LLM Wiki 模式实践

## 开篇：Wiki 化重构

根据 [LLM Wiki](./2026-04-10-second-brain.md) 理念，开始实体页重构。

### 完成内容

1. **创建 entities/ 目录**
   - 路径：`memory/entities/`

2. **创建 5 个实体页**
   - openclaw.md — 主项目
   - skills.md — 技能清单
   - memory.md — 记忆系统
   - model.md — 模型配置
   - feishu.md — 飞书集成

3. **更新 MEMORY.md 索引**
   - 新增实体页章节
   - 保留旧结构兼容性

### 页面规格

每个实体页包含：
- YAML frontmatter (title, type, status, tags)
- 概览表格
- 详细说明
- 相关页面链接

### 后续计划

- [ ] 迁移更多内容到实体页
- [ ] 建立跨引用链接
- [ ] 制定 ingest 流程
- [ ] 定期 lint