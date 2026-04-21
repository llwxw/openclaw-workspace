---
title: Audit
type: entity
status: active
tags: [audit, log]
---

# Audit

> 审计日志

## 记录内容

- 用户操作
- 系统变更
- 错误异常

## 审计字段

| 字段 | 说明 |
|------|------|
| timestamp | 时间 |
| user | 用户 |
| action | 操作 |
| resource | 资源 |
| result | 结果 |

## 查询

```bash
# 查询审计日志
grep "ERROR" audit.log
```

## 保留策略

- 30 天在线
- 1 年归档

## 相关页面

- [[log]]
- [[security]]
- [[version-control]]
