---
title: Backup Strategy
type: process
status: active
last_updated: 2026-04-11
tags: [backup, recovery, safety]
---

# 💾 Backup Strategy

> Wiki 备份与恢复

---

## 备份方式

### 1. Git 备份 (推荐)

```bash
# 在 memory/ 初始化
cd ~/.openclaw/workspace/memory
git init
git add .
git commit -m "wiki: initial commit"

# 定期推送
git add .
git commit -m "wiki: update $(date +%Y-%m-%d)"
git push origin main
```

### 2. 手动备份

```bash
# 打包
tar -czf wiki-backup-$(date +%Y%m%d).tar.gz memory/

# 恢复
tar -xzf wiki-backup-20260411.tar.gz
```

---

## 备份频率

| 类型 | 频率 | 保留 |
|------|------|------|
| Git 自动 | 每次重要更新 | 无限 |
| 手动打包 | 每周 | 4 周 |
| 完整镜像 | 每月 | 12 月 |

---

## 恢复场景

| 场景 | 恢复方式 |
|------|----------|
| 误删页面 | Git checkout |
| 误改内容 | Git checkout 历史 |
| 磁盘损坏 | 解压备份 |
| 整体丢失 | Git clone / 解压 |

---

## 快速恢复命令

```bash
# 恢复单个文件
git checkout HEAD -- memory/entities/xxx.md

# 恢复删除的文件
git checkout HEAD~1 -- memory/entities/deleted.md

# 查看历史
git log --oneline memory/entities/
```

---

## 多重保护

| 层级 | 保护 |
|------|------|
| 本地 | 日常使用 |
| Git 本地 | 后悔药 |
| GitHub/Gitea | 异地容灾 |

---

## 注意事项

- Wiki 不含敏感信息，可公开
- 建议用私人仓库
- 定期验证备份可用性

---

## 相关页面

-  — 版本控制
-  — 隐私安全

---

*最后更新：2026-04-11*