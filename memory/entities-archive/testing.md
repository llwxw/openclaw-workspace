---
title: Testing
type: entity
status: active
tags: [testing, quality]
---

# Testing

> Wiki 质量测试框架

## 测试类型

### 1. 单元测试
测试单个脚本功能。

### 2. 集成测试
测试整体流程 (Ingest→Query→Lint)。

### 3. 回归测试
确保修改不破坏现有功能。

## 测试脚本

```bash
# 运行所有测试
./scripts/test.sh

# 运行 Lint 测试
./scripts/auto-lint.sh
```

## 质量门禁

| 指标 | 阈值 |
|------|------|
| 死链 | 0 |
| 孤儿 | < 3 |
| 矛盾 | 0 |

## 相关页面

- [[performance]]
- [[error-handling]]
