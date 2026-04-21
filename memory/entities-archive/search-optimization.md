---
title: Search Optimization
type: process
status: draft
last_updated: 2026-04-11
tags: [search, optimization, performance]
---

# 🔍 Search Optimization

> 搜索优化

## 当前搜索方式

| 工具 | 优点 | 缺点 |
|------|------|------|
| grep | 快速、简单 | 仅关键词 |
| memory_search | 语义搜索 | 依赖外部 API |
| qmd | 本地 + 语义 | 需安装 |

---

## 优化策略

### 1. 文件命名

```
✅ descriptive-page-name.md
❌ untitled.md
✅ 2026-04-11-notes.md
❌ notes.md
```

### 2. 内容结构

```markdown
# 一级标题 (重要关键词)
## 二级标题 (长尾关键词)
内容包含更多关键词...
```

### 3. 添加索引词

```markdown
---
title: Docker
tags: [docker, container, devops]
---
# 🐳 Docker

关键词: 容器化, 镜像, Dockerfile, containerd
```

---

## 搜索技巧

```bash
# 精确匹配
grep -w "Docker" *.md

# 不区分大小写
grep -i "docker" *.md

# 上下文
grep -C 3 "关键词" *.md

# 正则
grep -E "(Docker|Kubernetes)" *.md
```

---

## 相关页面

- [[search]] — 搜索工具

---

*最后更新：2026-04-11*