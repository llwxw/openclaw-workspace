---
title: Scheduled Tasks
type: process
status: draft
last_updated: 2026-04-11
tags: [cron, schedule, automation]
---

# ⏰ Scheduled Tasks

> 定时自动任务

## Wiki 维护任务

| 任务 | 频率 | 命令 |
|------|------|------|
| 死链检查 | 每次修改后 | `grep -roh '\[\['` |
| Lint | 每周 | 手动执行 |
| 备份 | 每天 | Git push |
| 清理临时文件 | 每周 | `rm memory/ephemeral/*` |

---

## Cron 示例

```bash
# 每天凌晨 2 点自动备份
0 2 * * * cd ~/memory && git add . && git commit -m "backup $(date +%Y-%m-%d)" && git push

# 每周日凌晨运行 lint
0 3 * * 0 cd ~/memory && ./scripts/lint.sh >> logs/lint.log
```

---

## OpenClaw Cron

使用 OpenClaw 自带的 cron：

```bash
openclaw cron add \
  --schedule "0 2 * * *" \
  --command "cd memory && git add . && git commit -m 'backup' && git push"
```

---

## 相关页面

- [[backup-strategy]] — 备份策略
- [[lint]] — 健康检查

---

*最后更新：2026-04-11*