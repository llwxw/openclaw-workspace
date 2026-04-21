---
title: Index Optimization
type: process
status: draft
last_updated: 2026-04-11
tags: [index, optimization, navigation]
---

# 📑 Index Optimization

> 索引优化

## MEMORY.md 优化

### 分类清晰

```markdown
## 核心系统 (10)
- [[openclaw]]
- [[skills]]

## LLM Wiki 模式 (8)
- [[llm-wiki]]
- [[ingest]]
```

### 添加目录

```markdown
# 目录
- [核心系统](#核心系统)
- [工作流](#工作流)
- [工具](#工具)
```

---

## 自动化索引

```bash
#!/bin/bash
# generate-index.sh

echo "# Index" > index.md
echo "" >> index.md

for dir in */; do
  count=$(ls $dir/*.md 2>/dev/null | wc -l)
  if [ $count -gt 0 ]; then
    echo "## $dir ($count)" >> index.md
    for f in $dir*.md; do
      title=$(head -1 $f | sed 's/# //')
      echo "- [[$title]]" >> index.md
    done
  fi
done
```

---

## Dataview 索引

```dataview
TABLE title, type, status
FROM "memory/entities"
WHERE status = "active"
SORT title ASC
```

---

## 相关页面

- [[wiki-metrics]] — 指标

---

*最后更新：2026-04-11*