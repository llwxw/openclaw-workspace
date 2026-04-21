---
title: Review Process
type: process
status: draft
last_updated: 2026-04-11
tags: [review, quality, audit]
---

# 🔎 Review Process

> Wiki 内容审查流程

## 何时需要审查

| 场景 | 审查级别 |
|------|----------|
| 用户纠正 | 必须记录 |
| 批量更新 | 建议检查 |
| 自动生成 | 抽查 |
| 手动编辑 | 自己负责 |

---

## 审查清单

```markdown
## 审查 [页面名]

- [ ] 事实正确
- [ ] 无敏感信息
- [ ] 链接有效
- [ ] 格式规范
- [ ] 更新 last_updated
- [ ] 添加相关链接
```

---

## 处理错误

| 错误 | 处理 |
|------|------|
| 事实错误 | 立即修改 + 记录到 corrections.md |
| 死链 | 修复或删除链接 |
| 格式问题 | 修正格式 |
| 过时 | 更新或标记 stale |

---

## 自动化辅助

```bash
# 自动检查清单
./scripts/check-links.sh    # 死链
./scripts/check-frontmatter.sh  # 格式
./scripts/check-stale.sh     # 过时
```

---

## 相关页面

- [[corrections]] — 错误记录
- [[lint]] — 健康检查

---

*最后更新：2026-04-11*