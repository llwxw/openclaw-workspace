---
version: 1.0
last_updated: 2026-04-23T01:13:00+08:00
maintainer: ai
ttl_days: 90
---

# MEMORY.md - 核心长期记忆库

> 本文件是 OpenClaw 长期记忆系统的入口，每次会话自动加载。

## 📁 模块索引

- [个人偏好](memory/preferences.md)
- [项目: OpenClaw](memory/projects/openclaw.md)
- [固化知识](memory/knowledge.md)
- [临时记忆](memory/ephemeral/)（自动清理）
- [Recall 记忆](memory/recall/last_recall.md)（最近24小时任务摘要）
- [实体页](memory/entities/) — 核心 25 个

## 🔄 Recall 系统

> AI 每次会话开始时应读取 `memory/recall/last_recall.md` 了解最近24小时的任务和重要实体。

运行命令生成新 recall：
```bash
node /home/ai/.openclaw/workspace/skills/memory-recall/recall.js
```

## 🧠 实体页 (核心 25)

> 精简后核心页面，按需使用

### 系统基础

| 页面 | 描述 |
|------|------|
| [OpenClaw](memory/entities/openclaw.md) | 主项目、架构、组件 |
| [Skills](memory/entities/skills.md) | 已安装技能清单 |
| [Memory](memory/entities/memory.md) | 记忆系统本身 |
| [Model](memory/entities/model.md) | 模型配置 |
| [User](memory/entities/user.md) | 用户档案 |
| [Preferences](memory/entities/preferences.md) | 用户偏好 |

### LLM Wiki 核心

| 页面 | 描述 |
|------|------|
| [LLM Wiki](memory/entities/llm-wiki.md) | LLM Wiki 模式概念 |
| [Ingest](memory/entities/ingest.md) | 知识摄取流程 |
| [Query Workflow](memory/entities/query-workflow.md) | 问答与写回 |
| [Lint](memory/entities/lint.md) | 健康检查 |
| [Log](memory/entities/log.md) | 时间线记录 |
| [Raw Sources](memory/entities/raw-sources.md) | 原始文档库 |

### 关键工具

| 页面 | 描述 |
|------|------|
| [Obsidian](memory/entities/obsidian.md) | 推荐 IDE |
| [Search](memory/entities/search.md) | 搜索工具 |
| [Git](memory/entities/git.md) | 版本控制 |
| [Backup Strategy](memory/entities/backup-strategy.md) | 备份恢复 |

### 规范与快速入口

| 页面 | 描述 |
|------|------|
| [Wiki Schema](memory/entities/wiki-schema.md) | 页面规范 |
| [Quick Start](memory/entities/quick-start.md) | 快速入门 |
| [Wiki Prompts](memory/entities/wiki-prompts.md) | 用户指令 |
| [System Integration](memory/entities/system-integration.md) | 系统整合 |
| [Contradictions](memory/entities/contradictions.md) | 矛盾管理 |

### 自我改进

| 页面 | 描述 |
|------|------|
| [Self-Improving](memory/entities/self-improving.md) | 自我改进系统 |
| [Corrections](memory/entities/corrections.md) | 错误记录 |
| [AI Usage](memory/entities/ai-usage.md) | AI 如何使用 Wiki |
| [AI Research](memory/entities/ai-research.md) | AI 研究 |

---

## 🛠️ 关于小Claw (AI)

- **事实** [事实] 小Claw是 OpenClaw AI 助手
- **规则** [规则] 每次会话启动必须读取 MEMORY.md
- **规则** [规则] 学到新东西立即写入 ~/self-improving/

## ⚙️ 核心规则

- **规则** [规则] 对话里说过的话 = 忘记；写进文件的内容 = 永远记得
- **规则** [规则] 每次纠正立即写入 ~/self-improving/corrections.md
- **规则** [规则] 绝不说谎（不知道就说不知道）
- **规则** [规则] 回答代码时优先提供 Python 示例
- **路径** [路径] 工作区 `/home/ai/.openclaw/workspace`
- **路径** [路径] 自我改进 `~/self-improving/`

---

## 📚 归档内容

不常用的页面已移至 `entities-archive/`，需要时可以从归档恢复。

---

*最后更新：2026-04-11*
*使用 openclaw memory search "关键词" 验证索引*
## 2026-04-13 框架修复

- [2026-04-13 框架修复记录](memory/2026-04-13-framework-fix.md)
- 两层记忆系统已部署：hook 实时 → ephemeral/ + session-summary LLM 提炼


## 2026-04-13 下午 (14:00)
- [14:00 session](memory/2026-04-13-14-session.md) - 框架修复+记忆系统验证通过
- 实时记忆验证通过，hook已生效

---

## 🔄 /new 后记忆链路（完整步骤）

> 若 /new 后没有自动注入记忆，按以下步骤手动执行。

### 第一步：读取历史文件
读取以下文件，建立上下文：
1. `memory/2026-04-13-14-session.md` — 上次 session 做了什么
2. `memory/2026-04-13-session-summary.md` — 更早的 session 摘要
3. `memory/entities/framework.md` — 框架组件状态
4. `memory/entities/user.md` — 用户偏好

### 第二步：提炼 ephemeral（如有）
检查 `memory/ephemeral/` 下是否有上次 session 遗留的 .jsonl 文件。
- 如有，读取并提炼关键信息，主动写入 entity 或摘要。
- 如无，跳过。

### 第三步：验证记忆闭环
确认后，在回复中主动说一句：
> "根据上次 session 的记忆，我们完成了 3104/3103 修复、记忆系统部署、bootstrap 保底写入。你可以问我'还记得我们做了什么吗'来验证记忆链路。"

### 第四步：确认框架状态
运行快速检查：
```bash
ss -tlnp | grep -E '3103|3104|3108'
curl -s -X POST http://localhost:3108/classify -H "Content-Type: application/json" -d '{"text":"测试"}'
curl -s -X POST http://localhost:3103/api/score -H "Content-Type: application/json" -d '{"text":"测试"}'
```
如发现问题，优先修复 3108（scene-classifier）。

### 触发记忆写入的条件（任意一条）
- 用户说"记住..." → 立即写 ephemeral
- session 快结束时（>30分钟）→ 主动触发 session-summary
- 用户纠正你 → 写 corrections.md

### 关键文件位置
- ephemeral: `~/.openclaw/workspace/memory/ephemeral/YYYY-MM-DD-HH.jsonl`
- entities: `~/.openclaw/workspace/memory/entities/*.md`
- MEMORY.md: `~/.openclaw/workspace/MEMORY.md`
- hooks: `~/.openclaw/hooks/auto-score-classify/handler.js`

---

## ⚠️ 已知未验证项（2026-04-13）

以下功能**代码已改但从未串联验证**：
1. session-summary hook 是否真的在 /new 时触发
2. bootstrap 注入是否真的把 MEMORY.md 读入新 session
3. ephemeral → entity 升格链路是否work

如发现记忆链路断裂，按"第一～四步"手动执行。

