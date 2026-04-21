---
title: Reuse
type: entity
status: active
tags: [reuse, template]
---

# Reuse

> 知识复用机制

## 复用方式

### 1. 模板复用

预定义模板:
- [[quick-start]]
- [[case-study]]
- [[api]]

### 2. 片段复用

通用段落:
- 相关页面
- 更新日志
- 标签

### 3. 结构复用

相同结构:
- Entity 页面
- Index 页面
- Workflow 页面

## 模板示例

```markdown
---
title: {title}
type: entity
status: active
tags: [{tags}]
---

# {title}

> {description}

## 概念

{content}

## 相关页面

- [[{related}]]
```

## 相关页面

- [[framework]]
- [[examples]]
