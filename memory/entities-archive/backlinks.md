---
title: Backlinks
type: concept
status: reference
last_updated: 2026-04-11
tags: [backlinks, incoming-links, references]
---

# 🔙 Backlinks

> 反向链接

## 概念

| 链接类型 | 说明 | 示例 |
|----------|------|------|
| 前向链接 | 从 A → B | A 页面链接到 B |
| 反向链接 | B ← A | 链接到 B 的页面 |

---

## 查看反向链接

### 命令行

```bash
# 找所有链接到某页面的链接
grep -roh '\[\[target-page\]\]' *.md | wc -l

# 列出所有反向链接
for page in *.md; do
  target=$(basename $page .md)
  links=$(grep -c "\[\[$target\]\]" *.md)
  if [ $links -gt 0 ]; then
    echo "$page: $links 个反向链接"
  fi
done
```

### Obsidian

- 右键页面 → "Show backlinks"

---

## 反向链接的价值

- 发现隐藏关联
- 评估页面重要性 (入链数)
- 找到孤儿页面

---

## 自动生成反向链接

```python
# 为每个页面生成反向链接章节
for page in *.md; do
  name=$(basename $page .md)
  echo -e "\n## 反向链接\n" >> $page
  grep -l "\[\[$name\]\]" *.md | while read f; do
    echo "- [[$(basename $f .md)]]" >> $page
  done
done
```

---

## 相关页面

- [[knowledge-graph]] — 知识图谱

---

*最后更新：2026-04-11*