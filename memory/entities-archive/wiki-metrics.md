---
title: Wiki Metrics
type: process
status: draft
last_updated: 2026-04-11
tags: [metrics, monitoring, health]
---

# 📊 Wiki Metrics

> 如何衡量 Wiki 健康

---

## 核心指标

| 指标 | 计算 | 目标 | 警报 |
|------|------|------|------|
| **页面总数** | ls entities/ \| wc -l | 持续增长 | 下降 |
| **平均链接数** | 总链接 / 页面数 | >3/页 | <1/页 |
| **孤儿页面** | 无入链页面 / 总数 | <5% | >20% |
| **死链** | 无效链接数 | 0 | >5 |
| **过时页面** | 30天未更新 / 总数 | <10% | >30% |
| **更新频率** | 过去7天更新数 | >0 | 0 |

---

## 快速检查命令

```bash
# 1. 页面数量
ls memory/entities/*.md | wc -l

# 2. 死链检查
grep -roh '\[\[[^]]*\]\]' memory/entities/ | sed 's/\[\[//;s/\]\]//' | sort -u > /tmp/links.txt
ls memory/entities/*.md | xargs -I{} basename {} .md > /tmp/pages.txt
diff <(sort /tmp/links.txt) <(sort /tmp/pages.txt)

# 3. 过时页面
find memory/entities/ -name "*.md" -mtime +30 -ls

# 4. 孤儿页面
for f in memory/entities/*.md; do 
  page=$(basename $f .md)
  grep -q "\[\[$page\]\]" memory/entities/*.md || echo $page
done
```

---

## Lint 输出格式

```markdown
## 🔍 Wiki 指标 (2026-04-11)

| 指标 | 当前 | 目标 | 状态 |
|------|------|------|------|
| 页面总数 | 44 | ↑ | ✅ |
| 平均链接 | 2.5 | >3 | ⚠️ |
| 孤儿页面 | 3% | <5% | ✅ |
| 死链 | 0 | 0 | ✅ |
| 过时页面 | 8% | <10% | ✅ |
```

---

## 定期检查频率

| 检查 | 频率 |
|------|------|
| 死链 | 每次修改后 |
| 指标 | 每周 |
| 全面 Lint | 每月 |

---

## 目标时间线

| 时间 | 目标 |
|------|------|
| 1周 | 50 页 |
| 1月 | 80 页，平均链接 >3 |
| 3月 | 100+ 页，成熟运作 |

---

## 相关页面

- [[lint]] — 健康检查
- [[wiki-evolution]] — 迭代计划

---

*最后更新：2026-04-11*