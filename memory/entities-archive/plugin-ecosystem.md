---
title: Plugin Ecosystem
type: concept
status: reference
last_updated: 2026-04-11
tags: [plugins, extensions, obsidian]
---

# 🔌 Plugin Ecosystem

> 插件生态

## Obsidian 插件

### 必备插件

| 插件 | 功能 |
|------|------|
| Dataview | 动态查询 |
| Git | 版本控制 |
| Web Clipper | 网页转 Markdown |

### 推荐插件

| 插件 | 功能 |
|------|------|
| Quick Switcher | 快速跳转 |
| Embedded Search | 内嵌搜索 |
| Paste Image Renamer | 自动重命名图片 |

---

## 工具链插件

| 工具 | 插件 |
|------|------|
| qmd | MCP Server |
| Marp | 幻灯片 |
| Python | Jupyter 连接 |

---

## 自定义插件 (未来)

如果需要特定功能：

```javascript
// example-plugin.js
module.exports = {
  onload() {
    // 注册命令
    this.addCommand({
      id: 'my-command',
      name: 'My Command',
      callback: () => { /* ... */ }
    });
  }
};
```

---

## 相关页面

- [[obsidian]] — IDE

---

*最后更新：2026-04-11*