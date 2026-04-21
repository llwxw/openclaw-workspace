---
title: Knowledge Graph
type: entity
status: active
tags: [knowledge, graph]
---

# Knowledge Graph

> 知识图谱构建和维护

## 概念

根据 LLM Wiki 原文:
> "checking the graph view"

知识图谱展示页面间的链接关系。

## 图谱结构

```
        memory (中心)
           │
    ┌──────┼──────┐
    │      │      │
llm-wiki  query  ingest
    │      │      │
    └──────┼──────┘
           │
       framework
```

## 中心节点

- memory.md (入口)
- llm-wiki.md (核心概念)
- framework.md (架构)

## 边缘节点

新创建且链接较少的页面。

## 分析工具

- Obsidian Graph View
- 手动检查链接

## 相关页面

- [[graph-view]]
- [[llm-wiki]]
- [[framework]]
