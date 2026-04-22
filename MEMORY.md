---
version: 2.0
last_updated: 2026-04-23T01:49:00+08:00
maintainer: ai
ttl_days: 90
---

# MEMORY.md - 核心长期记忆库

> 本文件是 OpenClaw 长期记忆系统的入口，每次会话自动加载。

---

## 📁 模块索引

| 模块 | 路径 | 说明 |
|------|------|------|
| 个人偏好 | memory/preferences.md | 用户设置、回答风格 |
| 项目: OpenClaw | memory/projects/openclaw.md | 主项目架构 |
| 固化知识 | memory/knowledge.md | 长期知识库 |
| 临时记忆 | memory/ephemeral/ | 自动清理 |
| **Recall** | memory/recall/last_recall.md | **最近24小时任务摘要** |
| 实体页 | memory/entities/ | 核心实体 (已归档部分到 entities-archive) |

---

## 🧠 记忆系统 v2.0

### 架构

```
ephemeral/ (原始任务数据)
    ↓ [memory-keeper 每日整理]
memory/recall/ (最近24小时可回忆记忆)
    ↓ [memory-recall hook bootstrap 注入]
AI 对话 → 知道之前做过什么
```

### 组件

| 组件 | 位置 | 功能 |
|------|------|------|
| **Memory Recall** | skills/memory-recall/ | 最近任务摘要 |
| **Active Memory** | skills/active-memory/ | 重要实体注入 |
| **Self-Improving** | skills/self-improving/ | 历史错误学习 |
| **QMD** | skills/qmd/ | 记忆搜索 |
| **memory-context** | skills/memory-context/ | 统一上下文 |

### Hook 集成

- `memory-recall` hook: 在 agent:bootstrap 时注入完整上下文
- 配置: openclaw.json hooks.entries.memory-recall

---

## 📊 实体页 (核心)

### 系统基础

| 页面 | 描述 |
|------|------|
| OpenClaw | 主项目、架构、组件 |
| Skills | 已安装技能清单 |
| Memory | 记忆系统本身 |
| Model | 模型配置 |
| User | 用户档案 |
| Preferences | 用户偏好 |

### LLM Wiki 核心

| 页面 | 描述 |
|------|------|
| LLM Wiki | LLM Wiki 模式概念 |
| Ingest | 知识摄取流程 |
| Query Workflow | 问答与写回 |
| Lint | 健康检查 |
| Log | 时间线记录 |
| Raw Sources | 原始文档库 |

### 关键工具

| 页面 | 描述 |
|------|------|
| Obsidian | 推荐 IDE |
| Search | 搜索工具 |
| Git | 版本控制 |
| Backup Strategy | 备份恢复 |

### 归档 (entities-archive/)

不再活跃使用的实体移至 memory/entities-archive/

---

## 🔄 今日操作日志

- 2026-04-23: 部署 Memory Recall + Active Memory + Self-Improving + QMD
- 2026-04-23: 修复 session-summary 路径 (workspace/main → workspace)
- 2026-04-23: 归档 claude-code 相关文档
- 2026-04-23: memory-recall hook 集成到 bootstrap

---

*最后更新: 2026-04-23T01:49:00+08:00*