---
title: Data Structure
type: concept
status: reference
last_updated: 2026-04-11
tags: [data-structure, storage, format]
---

# 🗃️ Data Structure

> Wiki 数据结构

## 目录结构

```
memory/
├── entities/           # 实体页 (当前: 80+)
│   ├── openclaw.md
│   └── ...
├── knowledge/          # 固化知识
├── projects/           # 项目
├── ontology/           # 知识图谱数据
├── ephemeral/          # 临时文件
├── raw/                # 源文件
│   ├── articles/
│   ├── papers/
│   └── assets/
└── index.md            # 入口
```

---

## 文件格式

### Frontmatter (YAML)

```yaml
---
title: 页面标题
type: entity|concept|process
status: active|draft|stale
last_updated: 2026-04-11
tags: [tag1, tag2]
---
```

### 内容 (Markdown)

```markdown
# 标题

正文...

## 小节

- 列表
- 列表
```

---

## 数据关系

```
MEMORY.md (入口)
  ↓
  entities/*.md (实体页)
    ↓
    [[link]] (链接)
    ↓
    更多实体页
```

---

## 相关页面

- [[wiki-schema]] — Schema 规范

---

*最后更新：2026-04-11*