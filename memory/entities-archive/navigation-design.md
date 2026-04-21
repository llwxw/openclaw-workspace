---
title: Navigation Design
type: concept
status: reference
last_updated: 2026-04-11
tags: [navigation, ux, layout]
---

# 🧭 Navigation Design

> 导航设计

## 导航层次

### 1. 全局导航 (MEMORY.md)

```
MEMORY.md ← 顶层入口
  ├── 核心系统
  ├── LLM Wiki 模式
  └── 工作流
```

### 2. 分类导航 (目录页)

```
目录页 ← 某类内容的索引
  ├── 页面1
  ├── 页面2
  └── 页面3
```

### 3. 页面导航 (内容内)

```
页面内
  ├── 目录 (Table of Contents)
  ├── 顶部链接
  └── 底部"相关页面"
```

---

## 导航元素

| 元素 | 位置 | 作用 |
|------|------|------|
| MEMORY.md | 根目录 | 全局入口 |
| 面包屑 | 页面顶部 | 当前位置 |
| 目录 | 页面开头 | 快速跳转 |
| 相关页面 | 页面底部 | 关联内容 |
| 上一页/下一页 | 页面底部 | 顺序浏览 |

---

## 快速导航命令

```bash
# 列出所有页面
ls *.md | head -20

# 随机打开一个页面
shuf -n 1 -e *.md | xargs open
```

---

## 相关页面

- [[index-optimization]] — 索引优化

---

*最后更新：2026-04-11*