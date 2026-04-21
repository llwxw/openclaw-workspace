---
title: Team Wiki
type: concept
status: reference
last_updated: 2026-04-11
tags: [team, collaboration, business]
---

# 👥 Team Wiki

> 团队知识库

## 适用场景

- 内部知识库维护
- 团队成员协作
- 客服记录、项目文档、会议纪要

## 数据输入

| 来源 | 处理方式 |
|------|----------|
| Slack 线程 | 定期 Ingest 总结 |
| 会议录音 | 转录 → 提取要点 |
| 项目文档 | 原始放入 raw/ |
| 客户反馈 | 分类整理 |

## 角色分工

```
┌─────────────────┐
│  人类团队成员    │ ← 提供来源、审核更新
├─────────────────┤
│  LLM (我)       │ ← 维护 wiki、处理更新
└─────────────────┘
      ↑
 Human in the loop (审核环节)
```

## 页面结构

```
team/
├── index.md
├── projects/
│   └── project-x.md
├── meetings/
│   └── 2026-04.md
├── decisions.md
├── onboading.md
└── knowledge/
    └── topic-x.md
```

## 与个人 wiki 的区别

| 维度 | 个人 Wiki | Team Wiki |
|------|-----------|-----------|
| 所有者 | 自己 | 团队 |
| 审核 | 无需 | 需要 human-in-the-loop |
| 隐私 | 完全私有 | 部分公开 |
| 更新源 | 自己挑选 | 多人贡献 |

---

## 相关页面

- [[llm-wiki]] — 模式概念
- [[human-role]] — 人的职责

---

*最后更新：2026-04-11*