---
title: Page Templates
type: process
status: active
last_updated: 2026-04-11
tags: [templates, starting-point, boilerplate]
---

# 📋 Page Templates

> 创建新页面模板

## Entity 模板

```markdown
---
title: {标题}
type: entity
status: active
last_updated: {YYYY-MM-DD}
tags: [{标签1}, {标签2}]
---

# {emoji} {标题}

> 一句话描述

## 概览

| 属性 | 值 |
|------|-----|
| ... | ... |

## 核心内容

...

## 相关页面

- [[entity]] — 描述
```

## Concept 模板

```markdown
---
title: {概念}
type: concept
status: active
last_updated: {YYYY-MM-DD}
tags: [{标签}]
---

# 💡 {概念}

> 一句话定义

## 核心理念

...

## 相关页面

- [[related]] — 相关概念
```

## Process 模板

```markdown
---
title: {流程名}
type: process
status: active
last_updated: {YYYY-MM-DD}
tags: [{标签}]
---

# 📥 {流程名}

> 流程描述

## 触发条件

| 场景 | 处理 |
|------|------|
| ... | ... |

## 操作步骤

```
1. 步骤一
2. 步骤二
3. 步骤三
```

## 相关页面

- [[related]]
```

## 相关页面

- [[wiki-schema]] — Schema 规范

---

*最后更新：2026-04-11*