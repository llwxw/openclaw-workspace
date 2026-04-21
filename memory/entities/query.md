---
title: Query
type: entity
status: active
tags: [query, workflow]
---

# Query

> 问答工作流，根据 LLM Wiki 原文实现

## 原文定义

> "You ask questions against the wiki. The LLM searches for relevant pages, reads them, and synthesizes an answer with citations."

## Query 流程 (5步)

1. **搜索** - 使用 memory_search 查找相关页面
2. **读取** - 读取页面内容
3. **合成** - 生成答案，标注引用
4. **评估** - 判断答案是否值得写回
5. **写回** (可选) - 将好答案沉淀到 wiki

## 写回标准

以下情况应该写回：
- 综合性分析
- 原创性观点
- 可复用的结论
- 连接多个页面的洞察

## 示例

参见 

## 相关页面

- 
- [[lint]]
- [[llm-wiki]]
- 

