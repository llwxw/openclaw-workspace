---
title: Memex
type: concept
status: reference
last_updated: 2026-04-11
tags: [memex, history, vision]
---

# 📜 Memex

> 远见之源：Vannevar Bush (1945)

## 背景

1945 年，Vannevar Bush 在《As We May Think》中提出了 **Memex** 的构想：

> 一种个人化的、关联化的知识存储设备，让人们可以对文件进行联想式检索。

## 核心思想

| Memex 概念 | LLM Wiki 实现 |
|------------|---------------|
| 关联检索 | [[Wiki 链接]] |
| 个人 curated | 精选 raw sources |
| 持续积累 | 每次 Ingest 丰富 wiki |
| 联想路径 | Graph View 可视化 |

## 关键区别

Bush 无法解决的是：**谁来维护？**

- 人类：维护不动 → 放弃
- LLM：不知疲倦 → 完全可行

> "The part he couldn't solve was who does the maintenance. The LLM handles that."

— LLM Wiki Pattern

---

## 哲学对应

```
Memex (1945)     → 私人图书馆，每个文档有关联路径
LLM Wiki (2026)  → LLM 维护的关联知识库
Web (现在)       → 公开链接，但无个人视角
```

## 相关页面

- [[llm-wiki]] — 模式概念
- [[human-role]] — 人的职责

---

*最后更新：2026-04-11*