---
title: Obsidian
type: entity
status: reference
last_updated: 2026-04-11
tags: [obsidian, editor, markdown]
---

# 📓 Obsidian

> 推荐的本地的 Wiki IDE

## 为什么用 Obsidian

- 实时浏览 LLM 修改的结果
- Graph View 查看页面连接
- 本地存储，数据可控

## 配置步骤

### 1. 核心设置

```bash
# 库指向工作区
vault: /home/ai/.openclaw/workspace/memory
```

### 2. 附件设置

```
Settings → Files and links
→ Attachment folder path: raw/assets/
```

### 3. 图片下载热键

```
Settings → Hotkeys
搜索 "Download"
→ Ctrl+Shift+D
```

 clippings 时自动下载图片到本地

## 推荐插件

| 插件 | 用途 |
|------|------|
| Dataview | 动态查询（根据 frontmatter） |
| Marp | 幻灯片生成 |
| Web Clipper | 网页转 markdown（必装） |

## Graph View

查看 wiki 结构：
- 页面间的链接关系
- 发现孤儿页面
- 识别 hub 页面（连接多的）

**快捷键**: Ctrl+G

### 筛选技巧
- 只看某个文件夹
- 过滤 tag
- 隐藏孤立节点

## Dataview

动态查询 frontmatter：

```dataview
TABLE title, status, last_updated 
FROM "memory/entities"
WHERE status = "active"
SORT last_updated DESC
```

生成：
- 活跃页面清单
- 按标签分类
- 最近更新列表

---

## 相关页面

- [[memory]] — 记忆系统
-  — 原始文档

---

*最后更新：2026-04-11*