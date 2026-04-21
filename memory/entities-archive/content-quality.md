---
title: Content Quality
type: concept
status: active
last_updated: 2026-04-11
tags: [quality, standards, content]
---

# ✨ Content Quality

> Wiki 内容质量标准

## 质量级别

| 级别 | 说明 | 特征 |
|------|------|------|
| ⭐ 参考级 | 可靠、完整 | 有来源、结构清晰 |
| 📝 记录级 | 有用但不完美 | 基础信息、有待完善 |
| 🌱 草稿级 | 初始版本 | 只有框架、待填充 |
| 🗑️ 待删 | 已过时/无用 | 应该删除 |

---

## 质量标准

### 必须有

- ✅ frontmatter (title, type, status, last_updated)
- ✅ 至少一个相关链接
- ✅ 有实际内容（非仅模板）

### 最好有

- 📝 tags
- 📝 相关页面链接
- 📝 代码示例（如果是技术类）

### 不应该有

- ❌ 死链
- ❌ 完全空白
- ❌ 重复内容

---

## 质量检查

```bash
# 检查缺失 frontmatter
for f in *.md; do
  head -5 $f | grep -q "title:" || echo "❌ $f 缺失 title"
done

# 检查空页面
find . -name "*.md" -empty -ls
```

---

## 相关页面

- [[lint]] — 健康检查
- [[review-process]] — 审查流程

---

*最后更新：2026-04-11*