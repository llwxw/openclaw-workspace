---
title: Raw Sources
type: entity
status: active
last_updated: 2026-04-20
tags: [raw-sources, documents, input]
---

# 📂 Raw Sources

> 原始文档库（不可变）

## 目录结构

```
memory/
├── raw/              # 原始文档库
│   ├── articles/      # 网络文章（通过 Web Clipper 获取）
│   ├── papers/       # 论文、报告
│   ├── notes/        # 临时笔记（待处理）
│   └── assets/       # 图片等附件
```

## 管理规则

| 规则 | 说明 |
|------|------|
| 不可变 | LLM 只读，不修改原始文件 |
| 精选 | 只放值得处理的源 |
| 带日期 | 文件名加日期前缀 |

## 摄取流程

```
1. 放入 memory/raw/ 目录
2. 执行 Ingest
3. LLM 提取要点 → 写入 wiki
4. 原始文件保留在 raw/
```

## 工具推荐

### Web Clipper
- 使用 Obsidian Web Clipper 浏览器插件
- 一键将网页转为 markdown

### 图片下载
- Obsidian 设置 → Attachment folder path → `raw/assets/`
- 绑定热键 Ctrl+Shift+D 下载所有图片

## 相关页面

- [ingest](ingest.md) — 摄取流程
- [wiki-schema](wiki-schema.md) — Schema 规范
- [llm-wiki](llm-wiki.md) — LLM Wiki 模式

---

*最后更新：2026-04-20*
