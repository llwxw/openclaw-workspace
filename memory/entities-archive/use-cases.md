---
title: Use Cases
type: concept
status: reference
last_updated: 2026-04-11
tags: [use-cases, examples, scenarios]
---

# 🎯 Use Cases

> Wiki 实际使用案例

## 案例1: 学新技术

```
用户: "帮我看看 Claude Code 的 tools 实现"
我:
  1. 搜索 wiki: "claude-code tools"
  2. 读取 entities/claude-code.md
  3. 综合回答
  4. 如果用户补充了新理解 → 写回 wiki
```

## 案例2: 记录偏好

```
用户: "我喜欢简洁的回答"
我:
  1. 确认 "记住这个偏好"
  2. 更新 entities/preferences.md
  3. 未来自动使用这个偏好
```

## 案例3: 深度研究

```
用户: "我想深入了解 LLM Wiki 模式"
我:
  1. 读取 entities/llm-wiki.md
  2. 读取 entities/ingest.md, entities/lint.md 等相关页
  3. 综合整理
  4. 如果有新的理解 → 建议写回
```

## 案例4: 错误复盘

```
用户: "你之前那个说法不对"
我:
  1. 承认错误
  2. 写入 entities/corrections.md
  3. 如果影响已有 wiki 内容 → 更新
```

---

## 相关页面

- [[ai-usage]] — 使用流程

---

*最后更新：2026-04-11*