---
title: Analytics
type: entity
status: active
tags: [analytics, data]
---

# Analytics

> Wiki 数据分析

## 分析维度

### 1. 内容分析

- 页面数量趋势
- 链接密度
- 更新频率

### 2. 使用分析

- Query 频率
- 热门页面
- 搜索词

### 3. 健康分析

- 死链趋势
- 孤儿趋势
- 矛盾趋势

## 数据收集

```bash
# 统计页面
wc -l entities/*.md

# 统计链接
grep -roh '\[\[' entities/*.md | wc -l
```

## 报告生成

- 每日摘要
- 每周报告
- 月度分析

## 相关页面

- [[dashboard]]
- [[knowledge-graph]]
