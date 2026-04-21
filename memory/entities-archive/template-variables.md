---
title: Template Variables
type: concept
status: draft
last_updated: 2026-04-11
tags: [variables, placeholders, dynamic]
---

# 🔢 Template Variables

> 模板变量

## 常用变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `{title}` | 页面标题 | OpenClaw |
| `{date}` | 当前日期 | 2026-04-11 |
| `{type}` | 页面类型 | entity |
| `{tags}` | 标签 | [openclaw] |

---

## 使用方法

### 命令行

```bash
# 批量替换
for f in *.md; do
  sed -i "s/{date}/$(date +%Y-%m-%d)/g" $f
done
```

### 脚本

```python
template = open("template.md").read()
vars = {
    "{title}": "My Page",
    "{date}": "2026-04-11",
    "{type}": "entity"
}
for k, v in vars.items():
    template = template.replace(k, v)
```

---

## 自动化创建

```bash
#!/bin/bash
create_page() {
  cp templates/entity.md "entities/$1.md"
  sed -i "s/{title}/$1/g" "entities/$1.md"
  sed -i "s/{date}/$(date +%Y-%m-%d)/g" "entities/$1.md"
}
create_page "new-tool"
```

---

## 相关页面

- [[page-templates]] — 页面模板

---

*最后更新：2026-04-11*