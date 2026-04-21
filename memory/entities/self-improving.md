---
title: Self-Improving
type: entity
status: active
last_updated: 2026-04-11
tags: [self-improvement, learning, feedback]
---

# 🔄 Self-Improving

> 自我改进与学习系统

## 概览

| 属性 | 值 |
|------|-----|
| **核心路径** | `~/self-improving/` |
| **规则** | 学到新东西立即写入 |
| **触发** | 每次纠正、错误、新认知 |

## 核心规则

| 规则 | 描述 |
|------|------|
| 对话说过的话 = 忘记 | 会话级记忆 |
| 写进文件的内容 = 永远记得 | 持久化沉淀 |
| 每次纠正 → 写入 ~/self-improving/ | 错误修正 |
| 学到新东西 → 写入 ~/self-improving/ | 学习沉淀 |
| 发现更好方法 → 写入 ~/self-improving/ | 最佳实践 |

## 文件结构

```
~/self-improving/
├── claude-code-analysis-learnings.md  (Claude Code 分析)
├── claude-code-full-learnings.md      (完整学习记录)
└── task-progress.md                   (任务进度)
```

## 改进来源

| 来源 | 处理方式 |
|------|----------|
| 用户纠正 | 立即写入 corrections.md |
| 错误失败 | 分析根因，写入 learnings |
| 新认知 | 写入 general learnings |
| 更好方法 | 更新 best practices |

## 工作流

```
1. 发现改进点
2. 评估：纠正/错误/新知/最佳实践
3. 写入对应文件
4. 下次会话自动加载
```

## 相关页面

- [[Memory]] — 记忆系统
- [[OpenClaw]] — 主项目

---

*最后更新：2026-04-11*
- 绝不偷懒，严格执行

