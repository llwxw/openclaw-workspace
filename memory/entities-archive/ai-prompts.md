---
title: AI Prompts
type: process
status: active
last_updated: 2026-04-11
tags: [prompts, ai-guidance, instructions]
---

# 🗣️ AI Prompts

> 有效指挥 AI 操作 Wiki 的 Prompt

## 基础 Prompt

```
"在 wiki 中搜索关于 X 的内容"
"把这段记录到 wiki"
"检查 wiki 是否有死链"
```

## 高级 Prompt

```
"我刚学到了 X，它和 Y 有关，请：
1. 创建 entities/x.md
2. 更新 entities/y.md 添加链接
3. 更新 MEMORY.md 索引"

"我接下来要学习 Z，请帮我：
1. 在 wiki 中搜索 Z 相关内容
2. 告诉我已经知道什么
3. 建议我可以从哪里开始"
```

## Prompt 模板

### 知识摄取
```
"记住以下内容并按 wiki 格式整理：
[内容]
类型: (概念/工具/流程)
相关: (已有的相关页面)"
```

### 综合查询
```
"综合 wiki 中关于 X 的所有内容，
给我一个完整的回答。
如果 wiki 不够，告诉我还缺什么。"
```

### 批量操作
```
"帮我更新以下页面，统一添加 [tag] 标签：
- page1.md
- page2.md"
```

---

## 相关页面

- [[wiki-prompts]] — 用户指令

---

*最后更新：2026-04-11*