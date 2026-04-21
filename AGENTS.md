# OpenClaw Workspace

This is the workspace for OpenClaw AI assistant.

## Session 启动规则

每次 session 启动时（首轮回复前），按以下顺序加载：

1. **Read `SOUL.md`** — this is who you are
2. **Read `USER.md`** — this is who you're helping
3. **Read `memory/YYYY-MM-DD.md`** — today + yesterday for recent context
4. **Read `MEMORY.md`** — curated long-term memory（仅主 session 加载）
5. **Read `~/.openclaw/sessions/{currentSession}/context.json`** — 如果存在，读入后将其 `classification` 和 `scoring` 字段作为当前消息的预分析，结合到回复策略中
6. **Scan `~/.openclaw/workspace/memory/`** — 找最新带 `<!-- summary-only -->` 标记的摘要文件，提取 `## 主题`、`## 关键决策`、`## 待跟进` 作为上一轮 session 的交接上下文

加载失败时继续运行，不阻塞，但不跳过。

## 核心规则

### 消息预处理：场景分类 + 任务评分

收到用户消息时，按以下流程处理：

**第一步：场景分类** - 调用 `v8_classifier` skill
- 分类服务：`http://localhost:3104/classify`
- 场景标签：task_multi_step, fault_recovery, chitchat, vague_request, novice_user, expert_user, high_risk_automated, task_status_query, cancel_task

**第二步：根据场景处理**
- `chitchat` → 直接 LLM 回应
- `fault_recovery` → 故障恢复模板
- `vague_request` → 澄清意图
- `novice_user` → 带解释的入门指南
- `expert_user` → 直接给要点
- 其他场景 → 继续评分

**第三步：任务评分** - 调用 `v8_scorer` skill（仅任务类型）
- 评分服务：`http://localhost:3103/api/score`
- 6 因子评分：logic, risk, duration, resource, uncertainty, dependency

**第四步：策略路由**

根据评分结果选择执行策略：

| 分数 | 策略 | 超时 | 内存限制 |
|------|------|------|----------|
| ≤20 | DIRECT | 30s | - |
| 21-40 | STEP_ARCHIVE | 60s | 1024MB |
| 41-60 | SPAWN_SUBAGENT | 60-180s | 2048MB |
| 61-80 | PARALLEL_SHARDS | 120-160s | 2048MB |
| >80 | MEGA_TASK | 7200s | 8192MB |

---

### 旧版意图判断（已废弃，用 v8_classifier 替代）

~~**第一步：意图判断** (`POST /api/intent`)
- 判断用户消息是否是任务~~

---

### 任务执行前必做：意图判断 + 复杂度评估

~~**第一步：意图判断** (`POST /api/intent`)
- 判断用户消息是否是任务
- 动作词（写、做、执行、创建、帮我等）→ +2分
- 疑问词（吗、怎么、如何等）→ -2分
- 确认词（好、行、可以等）→ +1分
- 置信度 > 0.5 时触发评分

**第二步：复杂度评分** (`GET /api/score`)
收到任何任务请求时，**必须先使用 task_orchestrator 进行自动评分**，再根据分数选择执行策略：

| 总分 | 执行方式 | 超时 | 内存限制 |
|------|----------|------|----------|
| ≤20 | DIRECT | 30s | - |
| 21-40 | STEP_ARCHIVE | 60s | 1024MB |
| 41-60 | SPAWN_SUBAGENT | 60-180s | 2048MB |
| 61-80 | PARALLEL_SHARDS | 120-160s | 2048MB |
| >80 | MEGA_TASK | 7200s | 8192MB |

评分因子：
- 指令数量 (instructionCount)
- 代码行数 (codeLines)
- 依赖复杂度 (dependencyComplexity)
- CPU 强度 (cpuIntensity)
- IO 强度 (ioIntensity)
- 网络强度 (networkIntensity)
- 预估执行时间 (estimatedDuration)
- 规模指数 (scaleIndex)

### 子代理进度上报 (v2.0)

spawn 子代理时复用进度上报机制：
- 子代理输出 `[PROGRESS] <percent>% | <step>/<total> | <description>` 格式
- 主代理捕获 stdout 解析进度标记，限流转发给用户 (1条/秒)
- 心跳：30秒无输出发送"仍在运行"
- 无产出检测：30秒无输出 → 警告 → 强制终止
- 相关配置：SUBAGENT_MEMORY_LIMIT_MB, PROGRESS_MIN_INTERVAL_MS 等

### 任务编排器 (task_orchestrator v3.0)

整合三大能力：
1. **任务评分路由**: 多维度评分 → DIRECT/STEP_ARCHIVE/SPAWN_SUBAGENT/PARALLEL_SHARDS/MEGA_TASK
2. **上下文保护**: 消息数≥50 或 字符≥100KB 或 token≥80% → 自动压缩写入记忆
3. **子代理进度上报**: 同上 v2.0

技能文件: 
- `~/.openclaw/skills/task_orchestrator/` (核心代码)
- `~/.openclaw/workspace/skills/task_orchestrator/` (工作区副本)

中间件:
- Router: `localhost:3102` (任务评分 + 反向代理)
- Context API: `localhost:3101` (上下文管理)

### 环境变量

```
OPENCLAW_GATEWAY=http://127.0.0.1:18789
ROUTER_PORT=3102
SUBAGENT_MEMORY_LIMIT_MB=2048
PROGRESS_MIN_INTERVAL_MS=1000
```

---