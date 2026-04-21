---
title: Ingest
type: entity
status: active
tags: [ingest, workflow]
---

# Ingest

> 获取新知识的工作流，根据 LLM Wiki 原文实现

## 原文定义

> "You drop a new source into the raw collection and tell the LLM to process it."

## 完整流程 (6步)

### 1. 准备 Source
将新文档放入 docs/ 或 raw-sources/

### 2. 分析 Source
LLM 读取并理解内容

### 3. 提取知识
识别关键概念、实体、关系

### 4. 更新 Wiki
影响 10-15 个相关页面：
- 创建/更新主 entity 页面
- 更新相关概念页面
- 添加链接和引用

### 5. 更新 Index
添加到 memory.md 索引

### 6. 记录 Log
追加到 log.md 时间线

## 质量标准

- 一个 source 触发多个页面更新 (10-15)
- 新知识与现有知识建立链接
- 矛盾之处需要标记

## 相关页面

- 
- [[memory]]
- [[log]]
- [[llm-wiki]]
- 

