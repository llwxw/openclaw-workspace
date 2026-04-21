---
title: OpenClaw
type: project
status: active
last_updated: 2026-04-11
tags: [openclaw, ai-assistant, framework]
---

# 🦐 OpenClaw

> OpenClaw AI 助手核心项目

## 项目概览

| 属性 | 值 |
|------|-----|
| **类型** | AI 助手框架 |
| **工作区** | `/home/ai/.openclaw/workspace` |
| **配置路径** | `~/.openclaw/openclaw.json` |
| **时区** | Asia/Shanghai (GMT+8) |
| **状态** | 活跃运行中 |

## 技术架构

### 核心组件

- **Gateway** (`localhost:18789`) — HTTP API 网关
- **Router** (`localhost:3102`) — 任务评分 + 反向代理
- **Context API** (`localhost:3101`) — 上下文管理
- **Classifier** (`localhost:3105`) — 场景分类服务

### 模型配置

| 模型 | 用途 | 路径 |
|------|------|------|
| `codingplan/minimax-m2.5` | 主模型（当前运行时） | 默认 |
| `volcengine-plan/doubao-seed-2.0-pro` | 备用模型 | 系统默认 |

### 执行策略路由

根据任务评分自动选择执行方式：

| 分数区间 | 策略 | 超时 | 内存 |
|----------|------|------|------|
| ≤20 | DIRECT | 30s | - |
| 21-40 | STEP_ARCHIVE | 60s | 1024MB |
| 41-60 | SPAWN_SUBAGENT | 60-180s | 2048MB |
| 61-80 | PARALLEL_SHARDS | 120-160s | 2048MB |
| >80 | MEGA_TASK | 7200s | 8192MB |

## 消息处理流程

```
用户消息 
  → v8_classifier (场景分类)
  → v8_scorer (任务评分)
  → 策略路由 (执执行方式)
  → 结果返回
```

### 场景标签

- `task_multi_step` — 多步骤任务
- `fault_recovery` — 故障恢复
- `chitchat` — 闲聊
- `vague_request` — 模糊请求
- `novice_user` — 新手用户
- `expert_user` — 专业用户
- `high_risk_automated` — 高风险自动化
- `task_status_query` — 任务状态查询
- `cancel_task` — 取消任务

## 核心文件

| 文件 | 作用 |
|------|------|
| `AGENTS.md` | 任务编排、评分流程定义 |
| `SOUL.md` | 行为约束、风险控制 |
| `MEMORY.md` | 长期记忆入口 |
| `IDENTITY.md` | AI 身份定义 |
| `USER.md` | 用户画像 |

## 常用命令

```bash
openclaw gateway status    # 网关状态
openclaw gateway restart   # 重启网关
openclaw gateway start     # 启动网关
openclaw gateway stop      # 停止网关
openclaw plugins list      # 插件列表
openclaw tasks             # 任务列表
```

## 相关页面

- [[Skills]] — 已安装技能清单
- [[Memory]] — 记忆系统
- [[Model]] — 模型配置
- [[Feishu]] — 飞书集成

---

*最后更新：2026-04-11*- [[query]]
- 
- 
- [[task-orchestrator]]
- 
- [[llm-wiki-implementation]]
- 
- 
- 
- 
- [[framework]]
- 
- 
- [[search]]
- [[wiki-evolution]]
- [[error-handling]]
- 
- 
- 
- 
- 
- 
- 
- 
- [[user]]
- 
- [[config]]
- 
- 
- 
- 
- 
- 
- [[corrections]]
- [[llm-wiki-original]]
- [[skills]]
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
