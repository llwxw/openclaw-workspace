---
title: AI Usage
type: process
status: active
last_updated: 2026-04-11
tags: [ai-usage, how-i-use, workflow]
---

# 🤖 How I Use Wiki

> 我(AI)如何使用这个 Wiki

## 启动时

```
1. 读取 MEMORY.md (已配置)
      ↓
2. 搜索相关实体页 (根据用户问题)
      ↓
3. 调用 memory_search 找相关知识
      ↓
4. 综合回答
```

---

## 回答问题时

```
用户提问
      ↓
1. 搜索 wiki (memory_search)
      ↓
2. 读取相关实体页
      ↓
3. 综合答案
      ↓
4. 判断是否写回:
   - 有洞见 → 询问用户
   - 常规 → 忽略
```

---

## 发现新知识时

```
识别到值得沉淀的内容
      ↓
判断类型:
- 用户偏好 → preferences.md
- 错误/纠正 → corrections.md
- 新技能 → skills.md + 创建新页
- 新洞察 → 实体页更新
      ↓
更新页面 + 交叉引用
      ↓
更新 MEMORY.md 索引
```

---

## 我的记忆调用

| 工具 | 用途 |
|------|------|
| memory_search | 语义搜索知识库 |
| memory_get | 读取特定页面 |
| 直接读文件 | 读取实体页 |

---

## 约束

| 约束 | 说明 |
|------|------|
| 不臆造 | 需要验证时查 wiki 或说明不确定 |
| 记住写过的 | 回答前先搜 wiki |
| 持续学习 | 每次交互都可能更新 wiki |

---

## 实际效果

- 用户不需要重复告诉我偏好
- 我能记住之前学过的技能
- 回答更准确（基于积累）

---

## 相关页面

- [[memory]] — 记忆系统
- [[ai-usage]] — 知识来源
-  — AI 研究

---

*最后更新：2026-04-11*- [[task-orchestrator]]
