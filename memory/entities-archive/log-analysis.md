---
title: Log Analysis
type: process
status: draft
last_updated: 2026-04-11
tags: [log, analytics, insights]
---

# 📊 Log Analysis

> 日志分析

## Log 格式

```markdown
## [2026-04-11] ingest | 主题
## [2026-04-11] query | 主题
## [2026-04-11] lint | 检查结果
```

---

## 分析命令

### 统计 ingest 次数

```bash
grep "ingest" log.md | wc -l
```

### 最近的修改

```bash
grep "^## " log.md | tail -10
```

### 按类型统计

```bash
echo "Ingest: $(grep -c 'ingest' log.md)"
echo "Query: $(grep -c 'query' log.md)"
echo "Lint: $(grep -c 'lint' log.md)"
```

---

## 趋势分析

| 指标 | 说明 |
|------|------|
| ingest 频率 | 是否在持续学习 |
| query 类型 | 用户关心什么 |
| lint 问题 | 健康度变化 |

---

## 可视化 (可选)

```python
# 生成简单的活动图
import matplotlib.pyplot as plt

dates = []
ingests = []
queries = []

# 解析 log.md 统计
# 绘制趋势图
```

---

## 相关页面

- [[log]] — 日志
- [[wiki-metrics]] — 指标

---

*最后更新：2026-04-11*