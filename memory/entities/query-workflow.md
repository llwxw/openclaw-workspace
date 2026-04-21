---
title: Query Workflow
type: process
status: active
last_updated: 2026-04-20
tags: [query, question, synthesis]
---

# ❓ Query Workflow

> 问答也是知识积累

## 核心理念

> "The wiki keeps getting richer with every source you add **and every question you ask**."

## 问答让 Wiki 变丰富的场景

| 场景 | Wiki 如何变丰富 |
|------|-----------------|
| 综合多页面 | 产生新洞察 → 写回 |
| 发现知识 gap | 触发新页面创建 |
| 验证假设 | 产生对比/结论页 |
| 探索关联 | 发现新链接 |

## 完整流程

```
1. 用户提问
      ↓
2. Wiki 搜索 (index + 实体页)
      ↓
3. 读取相关页面
      ↓
4. 合成答案
      ↓
5. 判断价值
      ├─ 有洞见 → 询问"是否写回"
      └─ 常规问答 → 忽略
      ↓
6. 如需写回 → 创建/更新页面
```

## 何时写回

| 信号 | 应该写回 |
|------|----------|
| 综合了多个来源 | ✅ |
| 有独特洞见 | ✅ |
| 首次回答某类问题 | ✅ |
| 发现新关联 | ✅ |
| 简单事实查询 | ❌ |
| 日常闲聊 | ❌ |

## 写回格式

```markdown
# 主题：X vs Y 对比

## 问题
用户问：X 和 Y 有什么区别？

## 结论
| 维度 | X | Y |
|------|---|---|

## 相关页面
- [llm-wiki](llm-wiki.md)
- [ingest](ingest.md)
```

## 相关页面

- [ingest](ingest.md) — 摄取流程
- [llm-wiki](llm-wiki.md) — LLM Wiki 模式
- [memory](memory.md) — 记忆系统

---

*最后更新：2026-04-20*
