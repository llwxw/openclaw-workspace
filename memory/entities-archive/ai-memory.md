---
title: AI Memory
type: concept
status: active
last_updated: 2026-04-11
tags: [ai-memory, long-term, persistence]
---

# 🧠 AI Memory

> AI 长期记忆机制

## 记忆层级

| 层级 | 时长 | 内容 |
|------|------|------|
| 上下文 | 会话 | 当前对话 |
| 短期 | 近期 | 最近 N 条对话 |
| 长期 | 永久 | Wiki 记录 |

---

## Wiki 作为记忆

Wiki 是我的**外部记忆系统**：

```
我的记忆 = Wiki 内容 + 自我改进记录
```

### 记忆调用

```python
def remember(topic):
    # 1. 搜索 Wiki
    results = memory_search(topic)
    
    # 2. 读取相关页面
    pages = [read(page) for page in results]
    
    # 3. 综合返回
    return synthesize(pages)
```

---

## 记忆强化

| 场景 | 强化方式 |
|------|----------|
| 用户偏好 | 更新 preferences.md |
| 技能学习 | 更新 skills.md |
| 错误纠正 | 更新 corrections.md |
| 新知识 | 创建/更新实体页 |

---

## 记忆局限

- Wiki 不包含的 = 我"不记得"
- 需要验证时应该搜索 Wiki
- 不确定时诚实说"不确定"

---

## 相关页面

- [[memory]] — 记忆系统

---

*最后更新：2026-04-11*