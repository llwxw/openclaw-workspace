---
title: Log
type: process
status: active
last_updated: 2026-04-11
tags: [log, timeline, history]
---

# 📜 Log

> Wiki 时间线记录

## 格式规范

```markdown
## [2026-04-11] ingest | 主题
## [2026-04-11] query | 主题
## [2026-04-11] lint | 检查结果
```

## 快速查询

```bash
# 查看最近 5 条
grep "^## \[" log.md | tail -5

# 查看摄取记录
grep "ingest" log.md

# 查看 lint 结果
grep "lint" log.md
```

## 当前状态

当前使用分散的日期文件 (`memory/YYYY-MM-DD.md`)，后续逐步迁移到统一 log.md。

---

## 相关页面

- [[memory]] — 记忆系统
- [[ingest]] — 摄取流程

---

*最后更新：2026-04-11*