---
title: Dataview
type: entity
status: active
tags: [dataview, query]
---

# Dataview

> 原文提到: "Dataview"

## 什么是 Dataview

Obsidian 的数据查询插件。

## 查询示例

```dataview
LIST
FROM "workspace"
WHERE tags contains "framework"
SORT file.mtime DESC
```

## 查询类型

| 类型 | 说明 |
|------|------|
| LIST | 列表 |
| TABLE | 表格 |
| CALENDAR | 日历 |

## 应用场景

- 按标签查询页面
- 按日期统计
- 关系查询

## 相关页面

- [[search]]
- [[advanced-search]]
