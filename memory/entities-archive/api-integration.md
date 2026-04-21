---
title: API Integration
type: concept
status: draft
last_updated: 2026-04-11
tags: [api, integration, mcp]
---

# 🔌 API Integration

> Wiki 与外部系统集成

## 当前可用 API

| API | 用途 |
|-----|------|
| `memory_search` | Wiki 语义搜索 |
| `memory_get` | 读取页面 |
| `openclaw memory search` | 命令行搜索 |

---

## MCP 集成 (未来)

如果需要更深度集成：

```json
{
  "mcpServers": {
    "qmd": {
      "command": "qmd",
      "args": ["serve", "--path", "memory/entities"]
    }
  }
}
```

---

## 外部工具调用

### 搜索

```bash
# 用 qmd 搜索
qmd search "关键词" memory/entities/

# 用 grep
grep -r "关键词" memory/entities/
```

### 生成

```python
# 自动创建页面
python3 << EOF
template = open("templates/entity.md").read()
content = template.replace("{title}", "新页面")
open("entities/new.md", "w").write(content)
EOF
```

---

## 相关页面

- [[search]] — 搜索工具

---

*最后更新：2026-04-11*