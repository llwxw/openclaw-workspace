---
title: Backup Strategy
type: process
status: active
last_updated: 2026-04-18
tags: [backup, recovery, safety]
---

# 💾 备份与恢复

---

## 已部署的备份方案

### 本地滚动备份 ✅

- **脚本**: `scripts/backup-openclaw.sh`
- **频率**: 每日凌晨 3:00 (cron)
- **保留**: 最近 7 份
- **位置**: `~/.openclaw/backups/rotate/`
- **大小**: ~31MB/份

**备份内容**:
- `config.json` - 主配置
- `workspace/memory/` - Wiki 和记忆
- `agents/` - Agent 配置
- `hooks/` - Hook 配置
- `workspace/skills/` - 安装的 skills

---

### 恢复命令

```bash
# 1. 找到最新备份
ls -t ~/.openclaw/backups/rotate/openclaw-backup-*.tar.gz | head -1

# 2. 解压到临时目录
tar -xzf ~/.openclaw/backups/rotate/openclaw-backup-20260418-223119.tar.gz -C /tmp/

# 3. 恢复指定文件
cp /tmp/.openclaw/config.json ~/.openclaw/config.json

# 4. 恢复 memory
cp -r /tmp/.openclaw/workspace/memory/* ~/.openclaw/workspace/memory/
```

---

## 备份状态

| 内容 | 本地备份 | 远程备份 |
|------|----------|----------|
| 核心配置 | ✅ 每日 | ❌ 待配置 |
| Memory/Wiki | ✅ 每日 | ❌ 待配置 |
| Agents | ✅ 每日 | ❌ 待配置 |
| Hooks | ✅ 每日 | ❌ 待配置 |
| Skills | ✅ 每日 | ❌ 待配置 |
| Session 历史 | ❌ 不备份 | ❌ — |
| Gateway 日志 | ❌ 不备份 | ❌ — |

---

## 远程备份（待完成）

当前 GitHub token 只有读权限，无法推送。

**方案 A**: 用有 write 权限的 token
```bash
# 1. 创建 personal access token (需要 repo:write scope)
# 2. 添加 remote
git remote add origin https://github.com/USER/openclaw-backup.git

# 3. 手动 push
git push origin main

# 4. 在 backup-openclaw.sh 末尾加上:
# BACKUP_REMOTE_PATH=~/.openclaw/backups/rotate
# cp $BACKUP_FILE $BACKUP_REMOTE_PATH/openclaw-backup-latest.tar.gz
```

**方案 B**: NAS / 外部磁盘
```bash
# 挂载外部存储后设置 BACKUP_REMOTE_PATH
```

**方案 C**: 自建 Gitea
```bash
# 在一台有公网IP的机器上跑 Gitea，然后 git push
```

---

## Session 历史不备份

Session 文件（`agents/main/sessions/*.jsonl`）很大且不重要，不加入备份。 Wiki 的 session-summary 文件（ephemeral）已包含关键上下文。

---

## 验证备份可用性

```bash
# 检查备份是否存在
ls -la ~/.openclaw/backups/rotate/

# 检查最近一份备份内容
tar -tzf $(ls -t ~/.openclaw/backups/rotate/openclaw-backup-*.tar.gz | head -1) | head -20

# 检查 cron 是否生效
grep backup /var/log/cron.log 2>/dev/null || \
  tail -20 ~/.openclaw/backups/backup.log
```

---

*最后更新：2026-04-18*
