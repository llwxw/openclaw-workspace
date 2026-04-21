---
title: AI Assistant
type: entity
status: active
tags: [ai, assistant]
---

# AI Assistant

> 基于 LLM Wiki 的 AI 助手

## 工作原理

```
用户输入 → 意图识别 → 知识检索 → 答案生成 → 写回(可选)
```

## 组件

| 组件 | 功能 |
|------|------|
| Intent Classifier | 识别用户意图 |
| Knowledge Retriever | 检索 wiki |
| Answer Generator | 生成答案 |
| Write-back Manager | 决定是否写回 |

## 与 LLM Wiki 对应

- Intent → Query 流程
- Retrieval → 搜索
- Generation → 合成
- Write-back → 问答写回

## 相关页面

- [[query]]
- [[auto-qa]]
- [[task-orchestrator]]
