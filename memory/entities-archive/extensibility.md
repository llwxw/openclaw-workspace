---
title: Extensibility
type: entity
status: active
tags: [extension, plugin]
---

# Extensibility

> Wiki 扩展机制

## 扩展点

| 扩展点 | 说明 |
|--------|------|
| Ingest | 自定义获取方式 |
| Query | 自定义搜索 |
| Lint | 自定义检查 |
| Output | 自定义输出格式 |

## 插件示例

```python
# custom_lint.py
def lint_hook(wiki):
    # 自定义检查
    pass
```

## 相关页面

- [[framework]]
- [[api]]
