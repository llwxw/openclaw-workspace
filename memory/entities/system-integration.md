---
title: System Integration
type: concept
status: active
last_updated: 2026-04-11
tags: [integration, agents, soul, system]
---

# 🔗 System Integration

> Wiki 与现有系统的整合

## 现有系统文件

| 文件 | 作用 | 与 Wiki 的关系 |
|------|------|----------------|
| `AGENTS.md` | 任务编排、评分流程 | Wiki 是知识沉淀层 |
| `SOUL.md` | 行为约束、风险控制 | Wiki 记录规则演进 |
| `MEMORY.md` | 记忆入口 | 已是 Wiki Index |
| `IDENTITY.md` | AI 身份定义 | Wiki 记录学习历程 |
| `USER.md` | 用户画像 | Wiki 的 preferences.md |

---

## 关系示意

```
┌─────────────────────────────────────────┐
│           用户对话                       │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  AGENTS.md (触发)                        │
│  - 评分 → 策略路由                       │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Wiki (知识层)                           │
│  - 回答问题                              │
│  - 沉淀知识                              │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  SOUL.md (约束层)                        │
│  - 行为约束                              │
│  - 风险控制                              │
└─────────────────────────────────────────┘
```

---

## 协同工作

### 回答问题时

```
用户问题
      ↓
AGENTS.md 流程 (评分)
      ↓
Wiki 搜索答案 ← MEMORY.md 索引
      ↓
SOUL.md 检查 (是否安全)
      ↓
返回答案 + 决定是否写回
```

### 知识沉淀时

```
新知识
      ↓
判断类型:
  - 偏好 → preferences.md + USER.md
  - 错误 → corrections.md + SOUL.md 潜在更新
  - 技能 → skills.md + AGENTS.md 潜在更新
      ↓
写入 Wiki
      ↓
更新 MEMORY.md
```

---

## 整合原则

| 原则 | 说明 |
|------|------|
| Wiki 不重复 | 已存在 AGENTS.md 的不重复写 |
| Schema 互补 | Wiki 用实体页，AGENTS 用配置 |
| SOUL 优先 | 行为约束优先于 wiki 内容 |

---

## 未来可能

- Wiki 内容可以影响 AGENTS.md 配置
- Wiki 学习到的偏好可以更新 USER.md
- SOUL.md 的规则可以从 wiki 错误中迭代

---

## 相关页面

- [[memory]] — 记忆系统
- [[ai-usage]] — AI 如何使用

---

*最后更新：2026-04-11*- [[task-orchestrator]]
