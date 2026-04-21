---
title: Review
type: entity
status: active
tags: [review, moderation]
---

# Review

> 内容审核机制

## 审核类型

| 类型 | 说明 | 频率 |
|------|------|------|
| 自动审核 | Lint 检查 | 实时 |
| 定期审核 | 人工检查 | 每周 |
| 抽查 | 随机检查 | 每日 |

## 审核标准

1. **准确性** - 内容是否正确
2. **完整性** - 是否有遗漏
3. **一致性** - 是否矛盾
4. **时效性** - 是否过期

## 审核流程

```
AI 修改 → 标记待审核 → 人类审核 → 批准/拒绝
                                    ↓
                              反馈给 AI
```

## 相关页面

- [[collaboration]]
- [[security]]
- [[testing]]
