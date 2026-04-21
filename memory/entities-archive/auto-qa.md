---
title: Auto QA
type: entity
status: active
tags: [automation, qa]
---

# Auto QA

> 自动化问答系统

## 设计目标

根据 LLM Wiki 原文的 Query 流程实现自动化。

## 架构

```
用户 → 问题 → 搜索 → 读取 → 合成 → 回答
                    ↓
              评估是否写回
                    ↓
              写回到 wiki
```

## 自动触发

当检测到高质量答案时自动写回。

## 与 LLM Wiki 原文对应

原文: "good answers can be filed back into the wiki as new pages"

本系统实现这一机制。

## 相关页面

- [[query]]
- [[examples]]
- [[framework]]
