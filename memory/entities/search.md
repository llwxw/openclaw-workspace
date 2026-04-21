---
title: Search
type: entity
status: reference
last_updated: 2026-04-11
tags: [search, qmd, retrieval]
---

# 🔎 Search

> Wiki 搜索工具

## 当前方案

### memory_search（已集成）

```bash
openclaw memory search "关键词"
```

- provider: openai
- model: text-embedding-3-small
- mode: hybrid (关键词 + 向量)

### 簡易 grep

```bash
# 全文搜索
grep -r "关键词" memory/entities/

# 搜索标题
grep -l "title:" memory/entities/*.md
```

---

## 进阶方案：qmd

> 本地 markdown 搜索引擎

### 特点

- BM25 + 向量混合搜索
- LLM 重排序
- 纯本地，离线可用
- CLI + MCP server

### 安装

```bash
cargo install qmd
```

### 使用

```bash
# CLI 搜索
qmd search "知识管理" /path/to/wiki

# MCP server
qmd serve --mcp
```

---

## 推荐工作流

| 规模 | 方案 |
|------|------|
| <100 页 | index.md + grep |
| 100-1000 页 | memory_search |
| >1000 页 | qmd |

---

## 相关页面

- [[memory]] — 记忆系统
-  — 原始文档

---

*最后更新：2026-04-11*