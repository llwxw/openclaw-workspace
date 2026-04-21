---
title: Performance
type: entity
status: active
tags: [performance, optimization]
---

# Performance

> Wiki 性能优化指南

## 目标

- 高鲁棒: 错误自动恢复
- 高质量: 0 错误状态
- 高性能: 快速响应

## 优化策略

### 1. 并行检查

Lint 脚本使用并行检查提升速度。

### 2. 增量更新

只检查变更的文件，而非全量扫描。

### 3. 缓存机制

热门查询结果缓存。

### 4. 批量操作

合并多次小操作为一次大操作。

## 监控指标

| 指标 | 目标 |
|------|------|
| 响应时间 | < 100ms |
| Lint 耗时 | < 5s |
| 内存使用 | < 100MB |

## 相关页面

- [[framework]]
- [[system-integration]]
