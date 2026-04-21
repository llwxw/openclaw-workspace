---
title: Claude Code
type: entity
status: reference
last_updated: 2026-04-11
tags: [claude-code, ai-coding, anthropic]
---

# 📘 Claude Code

> Claude Code AI 编程助手学习资料

## 概览

| 属性 | 值 |
|------|-----|
| **版本** | v2.1.88 |
| **源码位置** | `/mnt/d/aafuzhi/collection-claude-code-source-code-main` |
| **文件数** | 4016 个 |
| **学习状态** | 阶段1-2 完成 |

## 核心架构

### 启动流程

```
src/entrypoints/cli.tsx (39KB)
  ↓ [15+ 快速路径处理]
  ↓ [动态导入]
src/main.tsx (803KB)
  ↓ [cliMain()]
REPL / QueryEngine
```

**关键设计**: 入口点包含 15+ 快速路径，常见操作（如 `--version`）0 模块加载，极快响应。

### 工具系统 (Tool.ts, 792行)

```typescript
type Tool<Input, Output, Progress> = {
  name: string
  aliases?: string[]
  call(args, context, canUseTool, parentMessage, onProgress): Promise<ToolResult<Output>>
  inputSchema: AnyObject
  checkPermissions(input, context): Promise<PermissionResult>
  isEnabled(): boolean
  isReadOnly(input): boolean
  isDestructive?(input): boolean
  isConcurrencySafe(input): boolean
}
```

## 已创建技能

| 技能 | 路径 | 作用 |
|------|------|------|
| claude-code-architecture | skills/ | 架构分析 |
| claude-code-commands | skills/ | 命令系统 |
| claude-code-security | skills/ | 安全机制 |
| claude-code-telemetry | skills/ | 遥测系统 |
| claude-code-tools | skills/ | 工具系统 |

## 学习记录

- `self-improving/claude-code-full-learnings.md` — 完整学习记录
- `self-improving/claude-code-analysis-learnings.md` — 分析学习

## 相关页面

- [[skills]] — 技能系统
- [[openclaw]] — 主项目

---

*最后更新：2026-04-11*