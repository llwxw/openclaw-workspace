# Session: 2026-04-11 12:32:23 UTC

- **Session Key**: agent:main:main
- **Session ID**: acc0ccca-178c-4f18-8906-c9fe0c2caa60
- **Source**: webchat

## Conversation Summary

user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-11 19:55 GMT+8] 检索一下记忆，我们的对话有什么偏好吗
assistant: 



assistant: 



assistant: 


## 你的对话偏好

| 偏好 | 内容 |
|------|------|
| **回答风格** | 简洁直接，避免冗长 |
| **代码语言** | Python、JavaScript、Shell |
| **操作系统** | Linux |
| **工作目录** | ~/projects |
| **身份** | 个人开发者，不涉及企业级复杂度 |
| **技术等级** | 默认具备基础技术知识（除非说"新手"） |

---

**总结：**
- 喜欢简洁直接的回复，不要绕弯
- 给代码示例优先用 Python
- 保持简短，不说废话
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-11 19:57 GMT+8] 是需要用minimax2.5和deepseekv3.2做一个openclaw自动路由，现在需要知道偏好来进行架构设计
assistant: 



assistant: 

## 自动路由架构设计

### 路由策略

| 任务类型 | 模型 | 原因 |
|----------|------|------|
| 编程/代码 | MiniMax 2.5 | 强代码能力 |
| 复杂逻辑 | MiniMax 2.5 | 推理能力强 |
| 日常问答 | DeepSeek V3 | 对话成本低 |
| 简单查询 | DeepSeek V3 | 速度快 |

### 简单架构

```
用户请求 → 分类器 → 路由
                   ↓
         ┌─────────┴─────────┐
         ↓                   ↓
    MiniMax 2.5          DeepSeek V3
         ↓                   ↓
         └─────────┬─────────┘
                   ↓
               返回结果
```

### 判断规则 (关键词)

| → MiniMax | → DeepSeek |
|-----------|------------|
| 代码、编程 | 是什么 |
| 写一个 | 怎么做 |
| 分析 | 解释 |
| 构建 | 简单问题 |

**要继续细化具体实现吗？**
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-11 20:03 GMT+8] 先不管这个
assistant: 

好的，还有什么需要做的？
user: Sender (untrusted metadata):
```json
{
  "label": "openclaw-control-ui",
  "id": "openclaw-control-ui"
}
```

[Sat 2026-04-11 20:03 GMT+8] 给我openclaw的超级详细全面的框架展示
user: Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.
When reading HEARTBEAT.md, use workspace file /home/ai/.openclaw/workspace/HEARTBEAT.md (exact case). Do not read docs/heartbeat.md.
Current time: Saturday, April 11th, 2026 - 8:08 PM (Asia/Shanghai) / 2026-04-11 12:08 UTC
assistant: 



assistant: 



assistant: 



assistant: 

上面就是 OpenClaw 的完整框架。

**一句话总结：**

```
用户消息 → v8分类 → v8评分 → 路由到5种执行策略 → 返回结果
```

**核心就是：**
- 分类 (9种场景) → 评分 (6因子) → 路由 (5种策略)
- 安全分层：系统层硬拦截 + 模型层软约束
- 29个Skills支持各种能力
- 自带LLM Wiki知识库
