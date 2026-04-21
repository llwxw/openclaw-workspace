---
title: Stale Content
type: process
status: active
last_updated: 2026-04-11
tags: [stale, outdated, cleanup]
---

# 🍂 Stale Content

> 过时内容处理

## 识别标准

| 标准 | 阈值 |
|------|------|
| 最后更新 | > 30 天 |
| 引用失效 | 外部链接 404 |
| 技术过时 | 工具/版本已废弃 |

---

## 处理方式

| 状态 | 操作 |
|------|------|
| 仍有用但旧 | 标记 + 添加说明 |
| 需要更新 | 重新编辑 |
| 完全无用 | 移至 archive/ 或删除 |

---

## 标记格式

```markdown
---
status: stale
last_updated: 2026-03-01
---

> ⚠️ 此页面可能过时，最后更新于 2026-03
> 如有需要，请更新
```

---

## 批量检查

```bash
# 找 30 天未更新的页面
find . -name "*.md" -mtime +30 -ls

# 找标记为 stale 的页面
grep -l "status: stale" *.md
```

---

## 相关页面

- [[lint]] — 健康检查
- [[content-quality]] — 质量标准

---

*最后更新：2026-04-11*