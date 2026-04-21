---
title: Dashboard
type: entity
status: active
tags: [monitor, dashboard]
---

# Dashboard

> Wiki 健康监控仪表盘

## 核心指标

| 指标 | 当前值 | 目标 |
|------|--------|------|
| 实体页数量 | 46 | 30-50 |
| 死链 | 0 | 0 |
| 孤儿 | 0 | 0 |
| 矛盾 | 0 | 0 |

## 监控脚本

运行 `scripts/auto-lint.sh` 获取完整报告。

## 自动化

- 定时检查: wiki-trigger.sh
- 持续学习: wiki-7h-loop.sh

## 相关页面

- [[performance]]
- [[error-handling]]
- [[lint]]
