---
title: Wiki Schema
type: schema
status: active
last_updated: 2026-04-11
tags: [schema, convention, wiki-structure]
---

# 📋 Wiki Schema

> LLM Wiki 页面规范与工作流定义

---

## 1. 页面类型

| 类型 | 文件名模式 | 示例 |
|------|-----------|------|
| `entity` | `小写-连字符.md` | `openclaw.md`, `feishu.md` |
| `concept` | `小写-连字符.md` | `llm-wiki.md` |
| `process` | `小写-连字符.md` | `ingest.md`, `lint.md` |
| `project` | `小写-连字符.md` | `claude-code.md` |

---

## 2. Frontmatter 规范

```yaml
---
title: 页面标题 (中文)
type: entity|concept|process|project
status: active|draft|archived
last_updated: YYYY-MM-DD
tags: [tag1, tag2, tag3]
---
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 页面标题 |
| `type` | ✅ | 页面类型 |
| `status` | ✅ | 状态：活跃/草稿/归档 |
| `last_updated` | ✅ | 最后更新日期 |
| `tags` | 推荐 | 标签列表，便于检索 |

---

## 3. 页面结构模板

### 3.1 Entity 页

```markdown
---
title: {标题}
type: entity
status: active
last_updated: {日期}
tags: [{标签}]
---

# {emoji} {标题}

> 一句话描述

## 概览

| 属性 | 值 |
|------|-----|
| ... | ... |

## 核心内容

...

## 相关页面

-  — 描述
```

### 3.2 Process 页

```markdown
---
title: {标题}
type: process
status: active|draft
last_updated: {日期}
tags: [{标签}]
---

# 📥 {标题}

> 流程描述

## 触发条件

| 场景 | 频率 |
|------|------|
| ... | ... |

## 操作步骤

```
1. 步骤一
2. 步骤二
3. 步骤三
```

## 输出格式

...
```

---

## 4. 链接规范

### 4.1 内部链接

```markdown
# 使用小写-连字符格式
[[openclaw]] — 主项目
[[memory]] — 记忆系统
[[ingest]] — 摄取流程
```

### 4.2 外部链接

```markdown
[OpenClaw 文档](https://docs.openclaw.ai)
```

---

## 5. Ingest 工作流

### 5.1 触发场景

| 场景 | 动作 |
|------|------|
| 用户说「记住」「记录」 | 立即执行 |
| 发现值得沉淀的新认知 | 询问用户 |
| 学习新技能/工具 | 自动创建 |

### 5.2 执行步骤

```
1. 识别知识类型
2. 找到或创建目标页面
3. 添加内容（追加非覆盖）
4. 如有冲突，标记并存
5. 更新 last_updated
6. 添加相关页面链接
7. 更新 index (MEMORY.md)
```

---

## 6. Lint 检查清单

| 检查项 | 频率 | 处理 |
|--------|------|------|
| 死链 [[]] | 每次修改后 | 立即修复 |
| 矛盾内容 | 每周 | 标记并存 |
| 过时页面 (>30天) | 每周 | 标记 stale |
| 孤儿页面 | 每月 | 添加链接 |
| 缺失 tags | 每月 | 补充 |

---

## 7. 命名规范

### 7.1 文件名

- 全小写
- 用连字符 `-` 分隔
- 不用空格，不用下划线

```
✅ feishu.md, task-orchestrator.md
❌ Feishu.md, task_orchestrator.md
```

### 7.2 标题

- 中文优先
- 可带 emoji
- 保持简洁

### 7.3 Tags

- 全小写
- 用逗号分隔
- 优先使用已有标签

---

## 相关页面

- [[memory]] — 记忆系统
- [[ingest]] — 摄取流程
- [[lint]] — 健康检查
- [[llm-wiki]] — 模式概念

---

*最后更新：2026-04-11*