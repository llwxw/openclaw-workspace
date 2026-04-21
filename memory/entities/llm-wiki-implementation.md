---
title: LLM Wiki Implementation
type: entity
status: active
tags: [implementation, guide]
---

# LLM Wiki 实现指南

> 基于 LLM Wiki 原文的完整实现

## 原文要点 vs 实现

| 原文要点 | 实现 | 状态 |
|----------|------|------|
| 不是RAG,是增量构建 | Wiki 持久化 | ✅ |
| 知识编译一次 | 实体页沉淀 | ✅ |
| 10-15页更新 | 融合机制 | ✅ |
| 维护归零 | auto-lint.sh | ✅ |
| 人vsLLM职责 | 人思考,LLM执行 | ✅ |
| 双屏工作 | obsidian.md | ✅ |
| 问答写回 | query流程 | ✅ |
| Memex | wiki-evolution.md | ✅ |

## 架构

```
┌─────────────────────────────────────────┐
│           Raw Sources (docs/)           │
│    不可变文档, LLM 只读                 │
└─────────────────┬───────────────────────┘
                  │ Ingest
                  ▼
┌─────────────────────────────────────────┐
│            Wiki (entities/)             │
│    LLM 维护, 增量构建, 持久化           │
└─────────────────┬───────────────────────┘
                  │ Query
                  ▼
┌─────────────────────────────────────────┐
│     Schema (SOUL.md, AGENTS.md)         │
│    配置约束, 行为规范                   │
└─────────────────────────────────────────┘
```

## 操作流程

### Ingest
1. 添加新 source 到 docs/
2. LLM 读取并提取
3. 更新相关实体页 (10-15 页)
4. 记录到 log.md

### Query
1. 用户提问
2. LLM 搜索相关页面
3. 合成答案
4. (可选) 写回到 wiki

### Lint (定期)
1. 死链检查 - 自动修复
2. 矛盾检查 - 标记
3. 孤儿检查 - 添加链接
4. 数据缺口 - 补充页面

## 自动化

- auto-lint.sh: 定期检查
- wiki-7h-loop.sh: 持续学习

## 相关页面

- [[llm-wiki]]
- [[openclaw]]
- [[memory]]
- 

