---
title: Version Control
type: entity
status: active
tags: [git, backup]
---

# Version Control

> 原文提到: "Git for version control"

## 目的

- 追踪 wiki 变化历史
- 多人协作 (Business 场景)
- 备份与回滚

## 当前实现

已通过 backup-strategy.md 记录备份策略。

## Git 流程

```bash
# 初始化
cd memory/entities
git init

# 添加变更
git add .
git commit -m "Update: 添加 task-analysis"

# 查看历史
git log --oneline
```

## 相关页面

- [[backup-strategy]]
- 

