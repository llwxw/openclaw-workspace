---
title: Naming Conventions
type: process
status: active
last_updated: 2026-04-11
tags: [naming, conventions, standards]
---

# 📛 Naming Conventions

> 命名规范详解

## 文件名

| 规则 | ✅ 正确 | ❌ 错误 |
|------|---------|---------|
| 全小写 | `openclaw.md` | `OpenClaw.md` |
| 连字符分隔 | `task-orchestrator.md` | `task_orchestrator.md` |
| 无空格 | `quick-start.md` | `quick start.md` |
| 有意义 | `claude-code.md` | `xxx.md` |
| 日期格式 | `2026-04-11.md` | `4-11.md` |

## 标题 (Frontmatter title)

```
格式: 中文 + 可选 emoji
示例: 
  - title: OpenClaw
  - title: 📂 Raw Sources
```

## Tags

```
格式: 全小写、逗号分隔、中文或英文
示例:
  - tags: [openclaw, ai, assistant]
  - tags: [知识管理, 笔记, wiki]
```

## 链接文本

```
格式: [[小写-连字符]]
示例:
  - [[openclaw]] — 主项目
  - [[llm-wiki]] — 模式概念
```

## 图片路径

```
格式: assets/图片名.png
示例: ![图](assets/wiki-structure.png)
```

---

## 批量重命名

```bash
# 转换大写为小写
for f in *.md; do mv "$f" "$(echo $f | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"; done
```

---

## 相关页面

- [[wiki-schema]] — Schema 规范

---

*最后更新：2026-04-11*