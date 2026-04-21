---
title: Task Orchestrator
type: entity
status: active
last_updated: 2026-04-11
tags: [orchestrator, task, scoring, router]
---

# ⚙️ Task Orchestrator

> 任务编排与评分系统

## 概览

| 属性 | 值 |
|------|-----|
| **版本** | v8.0 |
| **路由端口** | localhost:3102 |
| **上下文端口** | localhost:3101 |
| **分类端口** | localhost:3104 |

## 核心能力

### 1. 任务评分路由

根据 6 因子评分自动选择执行策略：

| 因子 | 描述 |
|------|------|
| `logic` | 逻辑复杂度 |
| `risk` | 风险等级 |
| `duration` | 预估时长 |
| `resource` | 资源需求 |
| `uncertainty` | 不确定性 |
| `dependency` | 依赖复杂度 |

### 评分结果路由

| 分数 | 策略 | 超时 | 内存 |
|------|------|------|------|
| ≤20 | DIRECT | 30s | - |
| 21-40 | STEP_ARCHIVE | 60s | 1024MB |
| 41-60 | SPAWN_SUBAGENT | 60-180s | 2048MB |
| 61-80 | PARALLEL_SHARDS | 120-160s | 2048MB |
| >80 | MEGA_TASK | 7200s | 8192MB |

### 2. 上下文保护

触发条件：
- 消息数 ≥ 50
- 字符数 ≥ 100KB
- token 使用 ≥ 80%

处理：自动压缩写入记忆

### 3. 子代理进度上报

```
[PROGRESS] <percent>% | <step>/<total> | <description>
```

- 心跳间隔：30秒
- 无产出检测：60秒警告

## 组件

| 组件 | 路径 |
|------|------|
| v8_classifier | skills/v8_classifier/ |
| v8_scorer | skills/v8_scorer/ |
| task_orchestrator | skills/task_orchestrator/ |
| task-orchestrator-v7 | skills/task-orchestrator-v7/ |

## 相关页面

- [[OpenClaw]] — 主项目
- [[Model]] — 模型配置

---

*最后更新：2026-04-11*