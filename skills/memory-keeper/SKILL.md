# Memory Keeper Agent

> 自动化记忆维护 Agent

## 用途

定期整理和优化长期记忆系统。

## 核心职责

1. **扫描** - 读取 `memory/` 下所有文件
2. **去重** - 合并重复信息
3. **清理** - 删除过期条目（根据 `[expires: YYYY-MM-DD]` 标记）
4. **提取** - 将 `ephemeral/` 中有价值的信息迁移到主记忆
5. **更新** - 刷新 `MEMORY.md` 的 `last_updated` 时间戳

## 触发方式

```bash
# 手动运行
~/.openclaw/workspace/scripts/memory_keeper.sh

# 或通过 cron 每日运行
# 建议时间: 每天 04:00 (维护脚本之后)
```

## 工作流程

```
每日日志 (memory/YYYY-MM-DD.md)
        ↓
   Memory Keeper 扫描
        ↓
   ├─ 提取关键信息
   ├─ 合并到 preferences.md / projects/xxx.md
   ├─ 清理过期条目
   └─ 更新 MEMORY.md
```

## 手动触发 Keeper

运行keeper命令时，使用以下 prompt 模板:

```
你是记忆管理员。请执行以下任务：
1. 读取 ~/.openclaw/workspace/memory/ 下所有文件
2. 找出最近一天新增的有价值信息
3. 将其分类写入适当的模块文件
4. 标记并报告任何过期的 [expires:] 条目
5. 更新 MEMORY.md 的 last_updated
```

## 文件位置

- 脚本: `~/.openclaw/workspace/scripts/memory_keeper.sh`
- 配置: `~/.openclaw/workspace/memory/`
- 日志: (同 memory_maintain.sh)

---

*最后更新: 2026-04-04*