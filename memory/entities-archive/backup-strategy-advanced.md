---
title: Backup Strategy Advanced
type: process
status: active
last_updated: 2026-04-11
tags: [backup, recovery, redundancy]
---

# 💾 Backup Strategy Advanced

> 高级备份策略

## 多层级备份

| 层级 | 位置 | 频率 | 保留 |
|------|------|------|------|
| 本地 | 同磁盘 | 实时 | 无 |
| 本地异盘 | 另一磁盘 | 每天 | 7 天 |
| 远程 | GitHub/Gitea | 每周 | 无限 |

---

## 备份脚本

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR="/path/to/backup"

# 1. Git 备份
cd ~/.openclaw/workspace/memory
git add .
git commit -m "backup $DATE"
git push origin main

# 2. 打包备份
tar -czf $BACKUP_DIR/wiki-$DATE.tar.gz \
  --exclude='.git' \
  memory/

# 3. 清理旧备份 (保留 7 天)
find $BACKUP_DIR -name "wiki-*.tar.gz" -mtime +7 -delete

echo "✅ 备份完成: $DATE"
```

---

## 恢复测试

```bash
# 定期测试恢复
tar -xzf wiki-20260411.tar.gz -C /tmp/test-restore/
ls /tmp/test-restore/memory/entities/ | head -5
```

---

## 灾难恢复

| 灾难 | 恢复方式 |
|------|----------|
| 误删文件 | Git checkout |
| 磁盘损坏 | 解压备份 + Git pull |
| 所有丢失 | Git clone + 解压备份 |

---

## 相关页面

- [[backup-strategy]] — 基础备份

---

*最后更新：2026-04-11*