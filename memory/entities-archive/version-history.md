---
title: Version History
type: process
status: active
last_updated: 2026-04-11
tags: [git, history, rollback]
---

# 📜 Version History

> Git 版本历史使用

## 查看历史

```bash
# 看修改历史
cd memory
git log --oneline -20

# 看某个文件的修改
git log --oneline entities/openclaw.md

# 看具体变化
git diff HEAD~5 entities/openclaw.md
```

---

## 恢复场景

| 场景 | 命令 |
|------|------|
| 误删页面 | `git checkout HEAD~1 -- entities/deleted.md` |
| 改错了 | `git checkout HEAD -- entities/xxx.md` |
| 想看旧版 | `git show HEAD~3:entities/xxx.md > /tmp/old.md` |

---

## 版本标注

每次重要更新添加有意义的 commit：

```bash
# 好
git commit -m "feat: add query-workflow, improve ingest"

# 不好
git commit -m "update"
git commit -m "changes"
```

---

## 分支实验

```bash
# 创建实验分支
git checkout -b experiment/new-structure

# 实验成功合并
git checkout main
git merge experiment/new-structure

# 实验失败删除
git branch -d experiment/new-structure
```

---

## 相关页面

- [[git]] — 版本控制
- [[backup-strategy]] — 备份策略

---

*最后更新：2026-04-11*