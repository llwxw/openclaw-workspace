# OpenClaw Hook 系统架构文档

> 范围：`~/.openclaw/hooks/` 下所有 Hook  
> 生成时间：2026-04-18  
> 状态：部分活跃（auto-score-classify 已验证），session-summary 部分验证，其他多为历史遗留

---

## 一、概览

| Hook 目录 | 文件 | 事件类型 | 状态 | 用途 |
|-----------|------|----------|------|------|
| `auto-score-classify` | `handler.js` | `message:preprocessed` | ✅ 活跃 | 每条消息调用 3105 分类 + 3103 评分 |
| `session-summary` | `handler.js` | `command:new`, `command:reset` | ⚠️ 部分验证 | session 结束时生成摘要 |
| `context-hook.js` | `context-hook.js` | 未知（legacy） | ❌ 未验证 | 消息记录到保护层 context |
| `on-message.sh` | `on-message.sh` | 未知 | ❌ 历史遗留 | HTTP 发送到 3101 |
| `on-command-error.sh` | `on-command-error.sh` | 未知 | ❌ 历史遗留 | 错误日志写入 .learnings |
| `auto-router/` | `HOOK.md` | 未配置 | ❌ 未部署 | 自动派发子 agent |
| `context-monitor/` | `HOOK.md` | 未配置 | ❌ 未部署 | 上下文压缩监控 |

---

## 二、活跃 Hook 详解

### 2.1 auto-score-classify

**功能**：每条入站消息自动经过意图分类 + 复杂度评分，结果写入 session 目录。

**文件**：
- `~/.openclaw/hooks/auto-score-classify/handler.js`
- `~/.openclaw/hooks/auto-score-classify/HOOK.md`
- 软链接：`~/.openclaw/workspace/hooks/auto-score-classify`（gateway 加载点）

**事件**：`message:preprocessed`

**依赖服务**：
- 3105（场景分类器）：`http://127.0.0.1:3105/classify`
- 3103（复杂度评分器）：`http://127.0.0.1:3103/api/score`

**行为流程**：
```
用户消息 → gateway → [hook: message:preprocessed]
  → 并发调用 3105 分类 + 3103 评分
  → 写入 ~/.openclaw/sessions/{sessionKey}/context.json
  → 评分 >= 40 → 注入 [AUTO_ROUTE] 前缀到 bodyForAgent
  → 主 agent 收到消息，SOUL.md 检测到前缀 → sessions_spawn → NO_REPLY
```

**关键代码逻辑**（v4 版本）：
```javascript
if (text.startsWith("[AUTO_ROUTE]")) return; // 跳过已注入的消息
const score = scoring?.score ?? 0;
if (score >= SCORE_THRESHOLD) {
  event.context.bodyForAgent = `[AUTO_ROUTE] ${text}`;
}
```

**输出文件**：`~/.openclaw/sessions/{sessionKey}/context.json`
```json
{
  "classification": { "scene": "task_multi_step", "confidence": 0.81 },
  "scoring": { "score": 57, "recommendedStrategy": "SPAWN_SUBAGENT" },
  "timestamp": "2026-04-18T03:00:00.000Z"
}
```

**已知问题**：
- 3103 scorer 服务当前不可用（需要手动启动 v8）
- 中文 pattern 识别较弱，评分偏低

**配置**：`~/.openclaw/openclaw.json`
```json
{
  "hooks": {
    "internal": {
      "entries": {
        "auto-score-classify": { "enabled": true }
      }
    }
  }
}
```

---

### 2.2 session-summary

**功能**：`/new` 或 `/reset` 时自动生成刚结束 session 的结构化摘要，写入 `memory/` 供下次 bootstrap 读取。

**文件**：`~/.openclaw/hooks/session-summary/handler.js`

**事件**：`command:new`, `command:reset`

**依赖**：
- LLM API（session-summary handler 内部调用）
- `workspace.dir` 配置

**行为流程**：
```
用户执行 /new → gateway 触发 command:new 事件 → session-summary hook
  → 异步读取 session 历史
  → 调用 LLM 生成结构化摘要
  → 写入 memory/YYYY-MM-DD-{slug}.md
  → 下次 /new 时 bootstrap 读取
```

**输出文件格式**：
```markdown
# Session: 2026-04-18 10:00

<!-- summary-only -->

## 主题
{一句话概括，少于20字}

## AI 决策模式
{基于 scene/score/strategy 数据分析}

## 关键决策
{决策列表}

## 待跟进
{待办列表}
```

**已知问题**：
- handler.js 调用外部 LLM API，依赖认证配置
- 历史上曾有 401 错误（已修复 auth-profiles.json）

---

## 三、已部署但非活跃 Hook

### 3.1 context-hook.js（legacy）

**文件**：`~/.openclaw/hooks/context-hook.js`

**事件**：未知（代码中有 `message:receive`, `message:send`, `agent:response`）

**功能**：将用户消息和 AI 回复记录到保护层的 context 模块。

**状态**：❌ 未验证是否实际注册到 gateway

---

### 3.2 on-message.sh

**文件**：`~/.openclaw/hooks/on-message.sh`

**功能**：将消息通过 HTTP 发送到 `http://127.0.0.1:3101/api/context`

**状态**：❌ 历史遗留代码，依赖 3101 端口服务

---

### 3.3 on-command-error.sh

**文件**：`~/.openclaw/hooks/on-command-error.sh`

**功能**：命令执行失败时记录到 `~/.openclaw/workspace/.learnings/ERRORS.md`

**状态**：❌ 历史遗留，未注册到 gateway

---

## 四、未部署 Hook

### 4.1 auto-router

**文件**：`~/.openclaw/hooks/auto-router/HOOK.md`, `handler.js`

**功能**：自动派发子 agent（设计文档阶段，未完成实现）

**原因**：被 `auto-score-classify` 的 AUTO_ROUTE 注入方案取代，未独立部署

---

### 4.2 context-monitor

**文件**：`~/.openclaw/hooks/context-monitor/HOOK.md`, `handler.js`

**功能**：监控 session token 数量，超阈值自动压缩

**状态**：未注册到 gateway，未部署

---

## 五、Hook 配置加载机制

Gateway 通过以下顺序加载 hook：

1. **Directory-based discovery**：扫描 `~/.openclaw/workspace/hooks/` 下每个子目录
   - 读取 `HOOK.md` 获取 metadata
   - 加载同名的 `handler.js`（ESM 支持）
   - 读取 metadata 中的 `events` 数组注册事件

2. **Legacy config**：`~/.openclaw/openclaw.json` 中 `hooks.internal.entries`
   - 适用路径：`~/.openclaw/hooks/` 下带 `module` 字段的 legacy 配置

**当前活跃 hooks** 通过 **workspace directory** 加载：
```
~/.openclaw/workspace/hooks/auto-score-classify → gateway 扫描 workspace/hooks/ 时发现 → 加载
```

---

## 六、事件流与调用关系

```
用户消息
  │
  ▼
gateway get-reply 入口
  │
  ▼
fireAndForgetHook(triggerInternalHook("message", "preprocessed", sessionKey, toInternalMessagePreprocessedContext(...)))
  │
  ├──► auto-score-classify (handler.js)
  │      ├─► 3105 分类器 → context.json.classification
  │      ├─► 3103 评分器 → context.json.scoring
  │      └─► score >= 40 → 注入 [AUTO_ROUTE] 到 bodyForAgent
  │
  ├──► session-memory (internal)
  ├──► command-logger (internal)
  ├──► self-improvement (internal)
  └──► context_hook (legacy config)
         │
         ▼
   主 agent 启动（bodyForAgent 可能已被修改）
         │
         ▼
   agent 响应
         │
         ▼
   gateway 组装回复 → 发送到渠道
```

---

## 七、Hook 与 SOUL.md 的联动

**AUTO_ROUTE 自动化派发链路**：

```
1. auto-score-classify hook 注入 [AUTO_ROUTE] 前缀
         ↓
2. 主 agent 的 SOUL.md 检测到 [AUTO_ROUTE] 开头
         ↓
3. SOUL.md 规则触发：
   - 停止 <thinking> 流程
   - 立即调用 sessions_spawn
   - 输出 NO_REPLY
         ↓
4. 子 agent 执行任务
         ↓
5. 任务结果通过 subagent_announce 推送回渠道
```

**相关文件**：
- `~/.openclaw/workspace/SOUL.md` — 包含 `[!!] AUTO_ROUTE 自动派发规则`
- `~/.openclaw/hooks/auto-score-classify/handler.js` — 注入前缀

---

## 八、3103 评分服务管理

**状态**：3103 端口当前无监听进程，scorer 需要手动启动。

**启动方式**：
```bash
# v8 scorer 内置评分函数可直接调用
node -e "const s = require('/home/ai/.openclaw/v8/src/scoring/scoring.js'); console.log(s.scoreTask('分析所有hook代码'))}"
```

**启动长期服务**（需要时）：
```bash
# 检查是否有启动脚本
ls /home/ai/.openclaw/v8/scripts/  # 当前为空
# 需要可写一个简单的 HTTP 服务器包装 scoring.js
```

---

## 九、维护建议

| 优先级 | 建议 | 原因 |
|--------|------|------|
| 高 | 修复 3103 scorer 服务化 | 当前每次评分需要手动 node 调用 |
| 高 | 增强 scorer 中文 pattern | "分析"、"架构"、"文档" 等词 pattern 缺失 |
| 中 | 清理 legacy hooks | context-hook.js, on-message.sh 已无对应服务 |
| 中 | 完善 auto-router 部署 | 设计已完成，未完成代码实现 |
| 低 | 完善 context-monitor | token 压缩需求低 |

---

*本文档由 OpenClaw agent 自动生成，如有不实之处请指正。*
