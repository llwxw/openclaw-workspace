---
title: Automation Scripts
type: entity
status: reference
last_updated: 2026-04-11
tags: [scripts, automation, tools]
---

# 🤖 Automation Scripts

> Wiki 常用自动化脚本

## 死链检查

```bash
#!/bin/bash
# check-dead-links.sh

cd memory/entities
for link in $(grep -roh '\[\[[^]]*\]\]' *.md | sed 's/\[\[//;s/\]\]//g' | sort -u); do
  if [ ! -f "${link}.md" ]; then
    echo "❌ 死链: [[$link]]"
  fi
done
echo "✅ 检查完成"
```

## 页面统计

```bash
#!/bin/bash
# stats.sh

echo "=== Wiki 统计 ==="
echo "页面数: $(ls *.md | wc -l)"
echo "总链接: $(grep -roh '\[\[' *.md | wc -l)"
echo "最近更新:"
find . -name "*.md" -mtime -7 -ls | tail -5
```

## 批量添加 Tags

```bash
#!/bin/bash
# add-tag.sh

TAG=$1
for file in *.md; do
  if ! grep -q "tags:.*$TAG" "$file"; then
    sed -i "s/tags: \[/tags: [$TAG, /" "$file"
    echo "✅ 添加 $TAG 到 $file"
  fi
done
```

---

## 使用方法

```bash
chmod +x scripts/*.sh
./scripts/check-dead-links.sh
```

---

## 相关页面

- [[wiki-metrics]] — 指标监控

---

*最后更新：2026-04-11*