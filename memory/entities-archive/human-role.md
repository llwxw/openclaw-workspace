---
title: Human Role
type: concept
status: active
last_updated: 2026-04-11
tags: [human-role, curation, strategy]
---

# 👤 Human Role

> 人在 LLM Wiki 中的职责

## 核心理念

> "The human's job is to curate sources, direct the analysis, ask good questions, and think about what it all means. The LLM's job is everything else."

— LLM Wiki Pattern

---

## 人的职责

| 职责 | 说明 | 示例 |
|------|------|------|
| **精选来源** | 什么值得放入 raw/ | 高质量文章、论文、笔记 |
| **方向引导** | 分析目标是什么 | "我想了解 X 领域" |
| **提问** | 问好问题是关键 | "X 和 Y 有什么异同？" |
| **思考总结** | 连接点、意义 | "这说明什么？" |

## LLM 的职责

| 职责 | 说明 |
|------|------|
| 读取与提取 | 从原始文档中抽取要点 |
| 维护更新 | 写页面、改链接、更新矛盾 |
| 跨引用 | 建立页面间的连接 |
| 例行检查 | 每周 lint、健康检查 |

---

## 协作模式

```
┌─────────────────┐     ┌─────────────────┐
│   你 (人)        │     │   LLM (我)       │
├─────────────────┤     ├─────────────────┤
│ 放入 raw/       │ ←── │ 读取源文件       │
│ 提问/分析目标   │ ──→ │ 提取要点         │
│ 思考 + 追问     │ ←── │ 合成答案         │
│ 决定是否写回    │ ──→ │ 更新 wiki        │
└─────────────────┘     └─────────────────┘
```

---

## 实践建议

1. **不要** 让 LLM 读所有东西 → 只读精选的
2. **多问** 开放性问题 → "X 是什么？", "X 和 Y 有什么不同？"
3. **好的答案** → 主动写回 wiki
4. **定期** → 打开 Obsidian 看看 wiki 长什么样

---

## 相关页面

- [[llm-wiki]] — 模式概念
- [[ingest]] — 知识摄取

---

*最后更新：2026-04-11*