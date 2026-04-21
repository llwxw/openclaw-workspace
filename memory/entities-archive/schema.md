---
title: Schema
type: entity
status: active
tags: [schema, config]
---

# Schema

> LLM Wiki 的配置文件，告诉 LLM 如何维护 wiki

## 定义

根据 LLM Wiki 原文：
> "Schema — a document that tells the LLM how the wiki is structured"

## 当前实现

| Schema 文件 | 说明 |
|-------------|------|
| SOUL.md | AI 行为约束 |
| AGENTS.md | Agent 配置 |
| USER.md | 用户偏好 |
| MEMORY.md | 入口索引 |

## 对应关系

| 层级 | 原文 | 现状 |
|------|------|------|
| Raw Sources | 不可变文档 | docs/ |
| Wiki | LLM 维护 | entities/ |
| Schema | 配置说明 | SOUL.md, AGENTS.md |

## 相关页面

- [[llm-wiki]] — LLM Wiki 核心
- [[ingest]] — 获取知识
- [[memory]]

