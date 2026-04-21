---
title: Shortcuts
type: process
status: active
last_updated: 2026-04-11
tags: [shortcuts, quick-actions, efficiency]
---

# ⚡ Shortcuts

> 快速操作技巧

## 常用快捷操作

### 命令行

```bash
# 快速搜索
alias ws='openclaw memory search'

# 快速打开 wiki
alias wi='cd ~/.openclaw/workspace/memory/entities && ls'

# 快速 lint
alias wl='./scripts/lint.sh'
```

### Vim/IDE

```
# 快速跳转链接
gd - 跳转到光标下的链接
gb - 返回上次位置
```

---

## 快速创建

```bash
# 从模板创建
new-wiki() {
  cp templates/$1.md entities/$2.md
  sed -i "s/{title}/$2/g" entities/$2.md
}
new-wiki entity my-new-page
```

---

## Obsidian 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+K | 快速插入链接 |
| Ctrl+Shift+F | 全局搜索 |
| Ctrl+G | Graph View |
| Ctrl+P | 快速切换 |

---

## 相关页面

- [[automation-scripts]] — 自动化脚本

---

*最后更新：2026-04-11*