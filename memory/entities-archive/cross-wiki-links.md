---
title: Cross-Wiki Links
type: concept
status: draft
last_updated: 2026-04-11
tags: [cross-wiki, linking, external]
---

# 🔗 Cross-Wiki Links

> 跨 Wiki 链接

## 场景

| 场景 | 说明 |
|------|------|
| 个人多 Wiki | 工作 Wiki ↔ 生活 Wiki |
| 团队 Wiki | 各团队 Wiki 互链 |
| 公开 Wiki | 链接到外部资源 |

---

## 链接格式

### 内部 Wiki

```markdown
[[openclaw]] — 内部链接
```

### 跨 Wiki

```markdown
[工作 Wiki 主页](file:///path/to/work-wiki/index.md)
[团队 A Wiki](file:///path/to/team-a/)
```

### 外部链接

```markdown
[Claude Code](https://claude.com)
[OpenClaw 文档](https://docs.openclaw.ai)
```

---

## 链接管理

```bash
# 检查跨 Wiki 链接有效性
grep -roh 'file://' *.md | sort -u

# 检查外部链接
grep -roh 'https://' *.md | sort -u | while read url; do
  curl -s -o /dev/null -w "%{http_code} $url\n" --max-time 10
done
```

---

## 相关页面

- [[backlinks]] — 反向链接

---

*最后更新：2026-04-11*