---
title: Tag System
type: process
status: active
last_updated: 2026-04-11
tags: [tag, organization, taxonomy]
---

# 🏷️ Tag System

> 用 Tags 组织内容

## Tag 原则

| 原则 | 说明 |
|------|------|
| 复用 | 尽量用已有 tag |
| 精确 | 每个页面 3-5 个 tag |
| 一致 | 同一概念用同一 tag |

---

## 常用 Tags

| Tag | 用途 |
|-----|------|
| `entity` | 实体页 |
| `concept` | 概念页 |
| `process` | 流程页 |
| `workflow` | 工作流 |
| `tool` | 工具 |
| `learning` | 学习相关 |
| `reference` | 参考资料 |

---

## Tag 查询

### Dataview 查询

```dataview
TABLE title, status, last_updated
FROM "memory/entities"
WHERE contains(tags, "concept")
SORT last_updated DESC
```

### 命令行

```bash
# 查找包含某 tag 的页面
grep -l "tags:.*workflow" memory/entities/*.md
```

---

## Tag 策略

| 场景 | Tag 组合 |
|------|----------|
| 新技能 | [skill, tool, learning] |
| 工作流 | [workflow, process] |
| 概念 | [concept, learning] |
| 工具 | [tool, reference] |

---

## 相关页面

- [[wiki-schema]] — Schema 规范
- [[search]] — 搜索工具

---

*最后更新：2026-04-11*