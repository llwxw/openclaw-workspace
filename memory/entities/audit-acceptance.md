---
title: Audit Acceptance Criteria
type: process
status: active
last_updated: 2026-04-20
tags: [audit, acceptance, quality-gate]
---

# ✅ 审计验收标准

> 来源：多模型协作审计 - 行动方案必须满足的闭环标准

## 1. P0 诊断链路验收

| 动作 | 验收标准 | 验证方法 |
|------|----------|----------|
| /new 链路验证 | session 第一轮回复包含记忆上下文（不是泛泛问候） | 检查消息内容是否提及具体主题 |
| AGENTS.md 语法 | 无解析错误，markdown 结构完整 | 文件可正常读取 |
| middleware 3101/3102 | `/health` 端点返回 200 | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3101/health` |

## 2. P1 验证验收

| 动作 | 验收标准 | 验证方法 |
|------|----------|----------|
| 3103 scorer | 评分 API 正常返回 | `curl -s -X POST http://localhost:3103/api/score -d '{"text":"x"}'` |
| 3104 ws-proxy | 健康端返回 ok | `curl -s http://localhost:3104/health` |
| 3105 classifier | 分类 API 正常返回 | `curl -s -X POST http://localhost:3105/classify -d '{"text":"x"}'` |
| session-summary | 最近 session-summary 文件存在且非空 | `ls -la memory/*-session-summary.md` |

## 3. 配置变更风险等级

| 等级 | 定义 | 变更要求 |
|------|------|----------|
| **低风险** | 可立即回滚，不需要重启 | 直接执行，保留回滚命令 |
| **中风险** | 需要重启服务，但有明确回滚步骤 | 先备份，测试环境验证，再执行 |
| **高风险** | 可能引发级联故障 | 必须通过预发环境 + 混沌测试 + 架构师评审 |

### 本次涉及配置项

| 配置项 | 风险等级 | 理由 |
|--------|----------|------|
| AGENTS.md 内容修改 | 低风险 | 仅影响 LLM 上下文解析，不改变运行时行为 |
| MEMORY.md 更新 | 低风险 | 同上 |
| middleware 端口配置 | **高风险** | 改变服务间连接，可能引发连锁中断 |
| SRE 参数调整 | **高风险** | 影响任务调度，可能导致队列阻塞 |
| 新增/删除 hook | **高风险** | 改变核心处理流程 |

## 4. P0 备用诊断方案（CLI 不可用时）

```bash
# 进程检查
ps aux | grep openclaw

# 端口检查
ss -tlnp | grep 18789

# Gateway API
curl -s http://127.0.0.1:18789/

# Middleware 健康检查
for port in 3101 3102 3103 3104 3105; do
  echo -n ":$port "; curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health
  echo ""
done
```

## 5. 闭环标准

每阶段完成后必须输出：
```
## 验收结果
✅ [动作] — [验证方法和结果]
❌ [动作] — [失败原因 + 处理方式]
```

---

*最后更新：2026-04-20*
