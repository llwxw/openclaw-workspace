---
title: LLM Wiki Pattern
type: concept
status: active
last_updated: 2026-04-11
tags: [llm-wiki, knowledge-base, pattern]
---

# 📚 LLM Wiki Pattern

> LLM 驱动的个人知识库模式

## 核心理念

**不采用 RAG 模式，而是编译 (Compilation)**

| RAG | LLM Wiki |
|-----|----------|
| 每次查询重新发现 | 知识已编译、持续积累 |
| 无积累 | 交叉引用已建立 |
| 无法处理复杂综合问题 | 多文档综合已有答案 |

## 三层架构

```
┌─────────────────────────────────────┐
│ Raw Sources (不可变)                 │
│ 文章、论文、对话、笔记               │
└─────────────────────────────────────┘
                   ↓ LLM 摄取
┌─────────────────────────────────────┐
│ Wiki (LLM 维护)                     │
│ 实体页 + 概念页 + 交叉引用           │
└─────────────────────────────────────┘
                   ↓ LLM 维护
┌─────────────────────────────────────┐
│ Schema (CLAUDE.md / AGENTS.md)      │
│ 页面格式、workflow、约定            │
└─────────────────────────────────────┘
```

## Operations

### 1. Ingest (摄取)

1. 放入新 source 到 raw/
2. LLM 读取，提取关键信息
3. 写 summary 到 wiki
4. 更新相关 entity/concept 页 (10-15 个)
5. 追加 log

### 2. Query (查询)

1. 读 index 找相关页
2. 读取页面内容
3. 合成答案
4. 好答案可写回 wiki

### 3. Lint (检查)

- 矛盾点检测
- 过时信息标记
- 孤儿页面检测
- 缺失跨引用

## 工具链建议

| 工具 | 用途 |
|------|------|
| Obsidian | 本地 IDE |
| Obsidian Web Clipper | 网页转 markdown |
| qmd | 本地搜索 (BM25 + 向量) |
| Marp | 幻灯片生成 |
| Dataview | 动态查询 |

## 与我的集成

本次 (2026-04-11) 实践：

| 阶段 | 完成 |
|------|------|
| 实体页创建 | 13 个 |
| Wiki 结构 | ✅ 已搭建 |
| Ingest 流程 | 定义完成 |
| Lint 机制 | 待实现 |

---

## 相关页面

- [[memory]] — 记忆系统
- [[ingest]] — 摄取流程
- [[Claude Code]] — 参考的学习项目

---

*最后更新：2026-04-11*- [[query]]
- 
- 
- 
- [[llm-wiki-implementation]]
- 
- 
- 
- 
- [[framework]]
- 
- 
- [[search]]
- [[wiki-evolution]]
- [[error-handling]]
- 
- 
- 
- 
- 
- 
- 
- 
- [[user]]
- 
- [[config]]
- 
- 
- 
- 
- 
- 
- [[corrections]]
- [[llm-wiki-original]]
- [[skills]]
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
