---
title: Sharing
type: concept
status: reference
last_updated: 2026-04-11
tags: [sharing, publishing, public]
---

# 📤 Sharing

> Wiki 发布与分享

## 分享方式

| 方式 | 说明 | 隐私 |
|------|------|------|
| 导出 MD | 直接给文件 | 取决于内容 |
| GitHub 公开仓库 | 公开代码/笔记 | 检查敏感信息 |
| 部分页面 | 只分享特定页面 | 完全可控 |
| 静态网站 | 用 Obsidian Publish | 可选择公开内容 |

---

## 导出命令

```bash
# 导出全部
cp -r memory/entities/ /tmp/wiki-export/

# 导出特定页面
cat entities/openclaw.md | grep -v "tags:.*private" > /tmp/export.md

# 导出为 PDF (需要 pandoc)
pandoc entities/openclaw.md -o openclaw.pdf
```

---

## 静态网站

### Obsidian Publish

```bash
# Obsidian 内置
# Settings → Publish → 选择页面 → 发布
```

### 其他方案

| 方案 | 特点 |
|------|------|
| VitePress | Vue 静态站 |
| Docusaurus | React 静态站 |
| MkDocs | Python 静态站 |

---

## 隐私检查

分享前：

```bash
# 检查敏感词
grep -r "password\|secret\|key\|token" memory/entities/ || echo "✅ 无敏感信息"
```

---

## 相关页面

- [[privacy-security]] — 隐私安全

---

*最后更新：2026-04-11*