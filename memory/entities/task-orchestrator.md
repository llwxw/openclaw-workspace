---
title: Task Orchestrator
type: entity
status: active
last_updated: 2026-04-11
tags: [orchestrator, task, scoring]
---

# ⚙️ Task Orchestrator

> 任务编排与评分系统

## 概述

| 属性 | 值 |
|------|-----|
| **版本** | v8.0 |
| **路由端口** | localhost:3102 |
| **分类端口** | localhost:3105 |

## 核心组件

### 1. 评分 (v8_scorer)

评分服务：`http://localhost:3103/api/score`

6 因子评分：logic, risk, duration, resource, uncertainty, dependency

### 2. 分类 (v8_classifier)

分类服务：`http://localhost:3105/classify`

场景标签：task_multi_step, fault_recovery, chitchat, vague_request...

### 3. 路由策略

| 分数 | 策略 | 超时 | 内存 |
|------|------|------|------|
| ≤20 | DIRECT | 30s | - |
| 21-40 | STEP_ARCHIVE | 60s | 1024MB |
| 41-60 | SPAWN_SUBAGENT | 60-180s | 2048MB |
| 61-80 | PARALLEL_SHARDS | 120-160s | 2048MB |
| >80 | MEGA_TASK | 7200s | 8192MB |

## 文件位置

- `task_orchestrator/` - v8 完整实现
- `task-orchestrator-v7/` - v7 版本

## 相关页面

- [[llm-wiki]] — LLM Wiki 模式
- [[ai-usage]] — AI 如何使用

- [[task-orchestrator]]
