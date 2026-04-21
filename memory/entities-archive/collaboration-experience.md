---
title: Collaboration Experience
type: concept
status: reference
last_updated: 2026-04-11
tags: [collaboration, teamwork, sharing]
---

# 🤝 Collaboration Experience

> 协作体验

## 协作模式

| 模式 | 说明 | 工具 |
|------|------|------|
| 个人 | 自己用 | 本地文件 |
| 共享 | 读给特定人 | Git 私人仓库 |
| 公开 | 任何人可读 | GitHub 公开 |
| 共创 | 多人编辑 | Git PR + 审核 |

---

## 协作工具

### Git 工作流

```
1. Fork 主仓库
2. 创建分支
3. 编辑内容
4. 提交 PR
5. 审核合并
```

### 实时协作 (未来)

- **Etherpad**: 实时多人编辑
- **HedgeDoc**: Markdown 协作

---

## 冲突解决

```bash
# 合并冲突时
git merge feature-branch
# 手动解决冲突
git add .
git commit -m "resolve conflicts"
```

---

## 相关页面

- [[team-wiki]] — 团队 Wiki
- [[sharing]] — 发布

---

*最后更新：2026-04-11*