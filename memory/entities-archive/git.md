---
title: Git
type: entity
status: active
last_updated: 2026-04-11
tags: [git, version-control, collaboration]
---

# 🔧 Git

> Wiki 即 Git 仓库

## 核心理念

> "The wiki is just a git repo of markdown files. You get version history, branching, and collaboration for free."

— LLM Wiki Pattern

---

## 优势

| 特性 | 价值 |
|------|------|
| **版本历史** | 任意时刻回滚 |
| **分支** | 试验性修改不影响主分支 |
| **协作** | PR 流程审核 |
| **备份** | 推送远程，双重保险 |

---

## 工作流

```bash
# 1. 创建新分支
git checkout -b feature/new-entity

# 2. 修改 wiki
vim entities/new.md

# 3. 提交
git add . && git commit -m "add: new entity page"

# 4. (可选) PR 审核
git push origin feature/new-entity
```

---

## 远程备份

```bash
# 添加远程
git remote add origin https://github.com/user/wiki.git

# 推送
git push -u origin main
```

---

## 协作模式 (Team Wiki)

```
1. 每个成员 fork 主仓库
2. 在分支上修改
3. 提交 PR
4. 审核后合并
```

---

## 相关工具

| 工具 | 用途 |
|------|------|
| GitHub / Gitea | 托管 |
| GitHub Desktop | 图形化 |
| Obsidian Git | Obsidian 内置 Git |

---

## 相关页面

- [[llm-wiki]] — 模式概念
- [[workflows]] — 团队 Wiki

---

*最后更新：2026-04-11*