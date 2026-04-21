---
title: Notifications
type: entity
status: active
tags: [notification, alert]
---

# Notifications

> 通知和告警系统

## 通知类型

| 类型 | 触发条件 | 通知方式 |
|------|----------|----------|
| 死链 | 检测到死链 | 日志 |
| 孤儿 | 孤儿页面 > 3 | 警告 |
| 矛盾 | 检测到矛盾 | 警告 |
| 定期 | 每日/每周 | 报告 |

## 通知内容

- 健康度摘要
- 待处理问题
- 建议操作

## 实现

```bash
# 每日报告
0 9 * * * ./scripts/auto-lint.sh >> reports/daily.md
```

## 相关页面

- [[dashboard]]
- 
- [[error-handling]]
