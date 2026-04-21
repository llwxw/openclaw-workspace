---
title: Case Study
type: entity
status: active
tags: [case, practice]
---

# Case Study

> 实践案例，记录 wiki 构建过程

## 案例 1: 构建 OpenClaw AI 助手知识库

### 背景
使用 LLM Wiki 模式构建 OpenClaw 的完整知识库。

### 步骤

1. **定义 Schema** - 创建 SOUL.md, AGENTS.md, USER.md
2. **收集 Raw Sources** - 9 个 Claude Code 文档
3. **创建核心页面** - 40 个实体页
4. **自动化维护** - auto-lint.sh, 定时运行

### 结果

| 指标 | 值 |
|------|-----|
| 核心实体页 | 40 |
| 死链 | 0 |
| 孤儿 | 0 |
| 矛盾 | 0 |

### 学到的经验

- 融合优先：30+页面后不创建新实体页
- 自动化 Lint：定期检查健康度
- 深度对照：每次迭代对照原文

## 案例 2: Query 写回实践

### 问题
用户问："OpenClaw 如何实现任务编排？"

### Answer 过程
1. 搜索 task-orchestrator 相关页面
2. 阅读 v8_classifier, v8_scorer
3. 合成答案

### 写回
生成 [[task-analysis.md]] 永久保存

## 相关页面

- [[practice]]
- [[llm-wiki-implementation]]
- [[query]]

