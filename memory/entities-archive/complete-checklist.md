---
title: Complete Checklist
type: process
status: active
last_updated: 2026-04-11
tags: [checklist, final, complete]
---

# ✅ Complete Checklist

> 完整检查清单

## 新建 Wiki 检查

- [ ] 创建 `memory/` 目录
- [ ] 创建 MEMORY.md 入口
- [ ] 创建 `entities/` 目录
- [ ] 添加 frontmatter 模板
- [ ] 初始化 Git

---

## 内容检查

- [ ] 每页有 title
- [ ] 每页有 type
- [ ] 每页有 status
- [ ] 每页有 last_updated
- [ ] 每页有相关链接
- [ ] 无死链

---

## 维护检查

- [ ] 每周运行 Lint
- [ ] 每月备份
- [ ] 每季度审核质量

---

## 快速命令

```bash
# 一键检查清单
echo "=== Wiki 健康检查 ==="
echo "页面数: $(ls *.md | wc -l)"
echo "死链: $(./check-dead-links.sh | wc -l)"
echo "过期: $(find . -name '*.md' -mtime +30 | wc -l)"
echo "备份: $(ls -la ../backups/ | tail -1)"
```

---

## 相关页面

- [[wiki-metrics]] — 指标
- [[lint]] — 健康检查

---

*最后更新：2026-04-11*