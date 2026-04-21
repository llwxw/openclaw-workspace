---
title: Content Migration
type: process
status: reference
last_updated: 2026-04-11
tags: [migration, move, reorganize]
---

# 🚚 Content Migration

> 内容迁移与重组

## 迁移场景

| 场景 | 说明 |
|------|------|
| 目录重组 | 移动到新目录 |
| 格式转换 | 从其他格式转 Markdown |
| 结构优化 | 重构页面层级 |

---

## 常用迁移

### A → B 内容移动

```bash
# 1. 移动文件
mv entities/A.md entities/B.md

# 2. 创建 A.md 重定向
echo "# 已迁移
此页面已合并到 [[B]]
请访问新页面。" > entities/A.md

# 3. 更新所有链接
sed -i 's/\[\[A\]\]/[[B]]/g' *.md
```

### 批量更名

```bash
# 批量添加前缀
for f in *.md; do
  mv "$f" "topic-$f"
done
```

---

## 注意事项

- 保持 Git 历史 (`git mv`)
- 及时更新所有引用
- 更新 MEMORY.md 索引

---

## 相关页面

- [[migration]] — 从外部迁移

---

*最后更新：2026-04-11*