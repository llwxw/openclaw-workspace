---
title: Model
type: entity
status: active
last_updated: 2026-04-11
tags: [model, llm, ai]
---

# 🤖 Model

> OpenClaw 模型配置

## 当前配置

| 属性 | 值 |
|------|-----|
| **运行时模型** | `codingplan/minimax-m2.5` |
| **默认模型** | `volcengine-plan/doubao-seed-2.0-pro` |
| **模型类型** | coding (编程优先) |

## 模型别名

在配置中可使用简洁别名：

| 别名 | 完整路径 |
|------|----------|
| `cloud` | `deepseek/deepseek-chat` |
| `coding` | `codingplan/minimax-m2.5` |
| `local` | `ollama/qwen2.5:14b` |

## 运行时信息

```json
{
  "runtime": "agent=main",
  "host": "ai",
  "repo": "/home/ai/.openclaw/workspace",
  "os": "Linux 6.6.87.2-microsoft-standard-WSL2",
  "node": "v22.22.2",
  "shell": "bash",
  "channel": "webchat",
  "capabilities": "none",
  "thinking": "adaptive"
}
```

## 模型选择原则

| 场景 | 推荐模型 |
|------|----------|
| 代码生成、调试 | `coding` (minimax-m2.5) |
| 通用对话、总结 | `cloud` (deepseek) |
| 本地离线 | `local` (ollama) |
| 快速确认 | 默认模型 |

## 会话级覆盖

可在会话中临时切换模型：

```
/status model=coding    # 切换到 coding 模型
/status model=default   # 恢复默认
```

或通过 session_status 工具查看当前配置。

---

## 相关页面

- [[OpenClaw]] — 主项目

---

*最后更新：2026-04-11*