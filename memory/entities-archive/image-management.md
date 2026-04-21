---
title: Image Management
type: process
status: reference
last_updated: 2026-04-11
tags: [image, asset, media]
---

# 🖼️ Image Management

> 图片与媒体管理

## 存储位置

```
raw/assets/          # 原始素材
memory/entities/     # 尽量不放这里
```

---

## 引用方式

```markdown
![描述](../../raw/assets/image.png)

或使用绝对路径
![描述](/home/ai/.openclaw/workspace/raw/assets/image.png)
```

---

## 获取图片

### 方式1: Web Clipper 自动下载

Obsidian Web Clipper 设置：
- Settings → Files and links → Attachment folder path: `raw/assets/`
- 绑定热键 Ctrl+Shift+D

### 方式2: 手动下载

```bash
# 批量下载图片
curl -O https://example.com/image.png
mv image.png raw/assets/
```

---

## 注意事项

- LLMs 不能在一 pass 中读取内联图片
- 先读文本，再单独看图
- 图片路径尽量用相对路径

---

## 相关页面

- [[raw-sources]] — 原始文档
- [[obsidian]] — IDE 配置

---

*最后更新：2026-04-11*