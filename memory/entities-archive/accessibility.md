---
title: Accessibility
type: concept
status: reference
last_updated: 2026-04-11
tags: [accessibility, a11y, usability]
---

# ♿ Accessibility

> 可访问性

## 原则

| 原则 | 说明 |
|------|------|
| 可读 | 文字清晰、字体合适 |
| 可导航 | 易于找到内容 |
| 可理解 | 结构清晰、逻辑通顺 |

---

## 实现建议

### 1. 链接描述

```markdown
✅ [[openclaw]] — 主项目
❌ 点击这里
✅ 详见 [[ingest]] 流程
```

### 2. 标题层级

```markdown
# 一级标题 (页面标题)
## 二级标题 (章节)
### 三级标题 (小节)
```

### 3. 表格可读

```markdown
| 表头1 | 表头2 | 表头3 |
|-------|-------|-------|
| 内容  | 内容  | 内容  |
```

---

## 工具检查

```bash
# 检查标题层级
grep -n "^##" *.md

# 检查链接描述
grep -n "点击这里\|这里\|详情" *.md
```

---

## 相关页面

- [[wiki-overview]] — 概览

---

*最后更新：2026-04-11*