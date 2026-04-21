---
title: Monitoring
type: entity
status: active
tags: [monitoring, alert]
---

# Monitoring

> 监控告警系统

## 监控指标

| 指标 | 说明 | 阈值 |
|------|------|------|
| 响应时间 | API 响应 | < 100ms |
| 错误率 | 失败请求 | < 1% |
| 内存使用 | RAM 占用 | < 80% |
| 磁盘使用 | 存储占用 | < 90% |

## 告警级别

- ✅ INFO - 信息
- ⚠️ WARNING - 警告
- 🔴 CRITICAL - 严重

## 告警通知

- 邮件
- 飞书
- Slack

## 实现

```bash
# 监控脚本
./scripts/monitor.sh
```

## 相关页面

- [[dashboard]]
- [[notifications]]
- [[performance]]
