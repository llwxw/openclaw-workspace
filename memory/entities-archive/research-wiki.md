---
title: Research Wiki
type: concept
status: active
last_updated: 2026-04-11
tags: [research, deep-dive, thesis]
---

# 🔬 Research Wiki

> 深度研究知识库

## 适用场景

- 几周/几个月深入一个主题
- 阅读论文、文章、报告
- 逐步构建综合知识体系
- 形成自己的 thesis（论点）

## 结构示例

```
topic-xxx/
├── index.md           # 主题索引
├── sources/           # 源文件 (raw/)
│   ├── paper-1.md
│   └── article-1.md
├── notes/             # 笔记
├── synthesis.md       # 综合结论
├── timeline.md        # 研究时间线
└── questions.md       # 待回答的问题
```

## 研究流程

```
1. 定义研究问题
      ↓
2. 收集 sources → 放入 raw/
      ↓
3. Ingest → 提取要点到 notes/
      ↓
4. 定期综合 → 写 synthesis.md
      ↓
5. 修正 thesis → 更新 questions.md
```

## 与普通 wiki 的区别

| 维度 | 普通 Wiki | Research Wiki |
|------|-----------|---------------|
| 目标 | 广泛积累 | 单一主题深入 |
| 结构 | 扁平 | 按主题目录 |
| 周期 | 持续 | 阶段性 |

---

## 相关页面

- [[llm-wiki]] — 模式概念
- [[raw-sources]] — 源文件管理
- [[ingest]] — 摄取流程

---

*最后更新：2026-04-11*