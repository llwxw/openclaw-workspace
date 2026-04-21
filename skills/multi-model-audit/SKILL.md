---
name: multi-model-audit
description: 多模型协作审计框架。当用户说"审计"、"评估方案"、"分析计划"、"#审计"或"帮我分析这个方案"时触发。用于对方案进行结构化的多方独立分析、交叉审计和综合决策，输出完整的决策报告。
---

# 多模型协作审计框架 v2.0

当用户提交方案进行审计时，按照以下流程执行。

## 触发条件

用户消息包含以下关键词时激活：
- 审计、评估方案、分析计划
- #审计
- 帮我分析这个方案
- 多模型讨论

## 流程总览

```
用户提交方案
    │
    ├── Phase 1（并行）
    │   ├── StepFun：独立分析报告（≤1500字）
    │   └── DeepSeek：独立分析报告（≤1500字）
    │
    ├── Phase 2（审计）
    │   └── DeepSeek：审计 StepFun 的报告（≤800字）
    │
    ├── Phase 2.5（申诉）
    │   └── StepFun：对审计意见的回应（≤500字）
    │
    └── Phase 3（MiniMax 决策判定）
        ├── 信息足够 → 标准档结束（5条输出）
        └── 信息不够 → 触发增强档（7条输出）
```

## 模型分配

| 模型 | 角色 | API 端点 |
|------|------|---------|
| StepFun | 独立分析师 | `https://api.stepfun.com/step_plan/v1` |
| DeepSeek V3.2 | 审计官 | `https://api.deepseek.com/v1` |
| MiniMax M2.7 | 决策者 | `https://ark.cn-beijing.volces.com/api/coding/v3/v1` |

## Phase 1 Prompt 模板

### StepFun 独立分析
```
你是顶级系统分析师。请对以下方案进行独立分析。

【方案内容】
{user_input}

【输出要求】严格按以下结构输出，总字数 ≤ 1500字

## 一、方案核心（一句话）
不超过30字。

## 二、核心优势（不超过3条）
每条格式：【优势】[20字以内]

## 三、核心风险（不超过5条）
每条格式：
**风险**：[风险描述，不超过30字]
**影响**：[后果，不超过20字]
**严重程度**：[高/中/低]

## 四、可行性评分（1-10分）
X/10 — [一句话理由]
```

### DeepSeek 独立分析
（与 StepFun 相同结构）

## Phase 2 Prompt - DeepSeek 审计
```
你是首席审计官。请严格审查 StepFun 的分析报告，找出其逻辑漏洞和遗漏。

【原始方案】
{original_content}

【StepFun 的分析报告】
{stepfun_report}

【输出要求】严格按以下结构输出，总字数 ≤ 800字

## 一、审计意见
对 StepFun 报告的每个核心风险，逐条给出审计意见：
- **接受**：这个风险判断准确，补充[可选补充]
- **反驳**：这个风险被高估/低估，因为[理由]
- **遗漏**：这个重要风险在 StepFun 报告中完全没提到

## 二、最关键问题（不超过2个）
每个问题格式：
**问题**：[一句话]
**为什么致命**：[不超过40字]
**建议**：[应该如何处理]

## 三、审计结论
【审计评分】X/10 — [一句话理由]
【审计建议】[批准/需修改/建议驳回]
```

## Phase 2.5 Prompt - StepFun 申诉
```
你刚刚收到了 DeepSeek 对你分析报告的审计意见。请逐条回应。

【DeepSeek 审计意见】
{audit_report}

【输出要求】严格按以下结构输出，总字数 ≤ 500字

## 一、对审计意见的回应
- **接受**：承认审计有理，说明你的修正
- **反驳**：说明为什么不成立（不超过30字）
- **保留意见**：双方仍有分歧，但你有补充论据（不超过40字）

## 二、经过审计后的立场更新
- [原风险] → [新风险]：[调整理由]

## 三、最终立场声明
【我的最终立场】[批准/需修改/建议驳回] — [一句话理由]
```

## Phase 3 Prompt - MiniMax 决策判定
```
你是最终决策者。首先判断是否有足够信息做出决策。

【输入材料】
原始方案：{original_content}
StepFun 分析：{stepfun_report}
DeepSeek 分析：{deepseek_report}
DeepSeek 审计：{audit_report}
StepFun 申诉：{stepfun_response}

【前置判断】
## 一、信息充分性判断
现有信息是否足够支撑你做出最终决策？
【信息充分性】：足够 / 不够

如果不够，请继续回答：

## 二、如果不够，需要补充什么？
1. 缺少什么关键信息？
2. 哪些分歧无法在当前信息下判断？

## 三、档位建议
【建议】：继续标准档 / 升级增强档
【理由】：[一句话说明]
```

## Phase 3' Prompt - MiniMax 最终决策（标准档）
```
你是最终决策者。请综合所有材料，做出明确决定。

【输出要求】严格按以下结构输出，总字数 ≤ 1200字

## 一、最终决策
✅ **批准实施**
⚠️ **有条件批准**（需满足以下条件）
❌ **驳回修改**（理由如下）
🚫 **建议中止**

## 二、核心决策依据（不超过3条）
[序号] [一句话核心依据]

## 三、行动计划
**阶段一**：[具体步骤，时间线]
**阶段二**：[具体步骤，时间线]

## 四、风险预案
**风险**：[描述]
**预案**：如果发生，[处理方式]

## 五、监控指标（不超过3个）
- [指标名称]：[正常范围]
```

## 增强档 Prompt

如 MiniMax 判定需要增强，则执行：

### Round A - DeepSeek 追问
```
你刚刚收到了 StepFun 的申诉回应。请继续追问仍然存在的分歧点。

【StepFun 申诉回应】
{stepfun_response}

【输出要求】总字数 ≤ 800字

## 一、仍然存在的核心分歧（不超过2个）
**分歧点**：[一句话描述]
**为什么仍然关键**：[不超过40字]
**你的判断**：[你认为谁更有道理，理由]

## 二、审计结论更新
【审计建议更新】[批准/需修改/建议驳回]
```

### Round B - StepFun 最终回应
```
针对 DeepSeek 的追问，给出最终回应。

【DeepSeek 追问】
{roundA_output}

【输出要求】总字数 ≤ 500字

## 一、对每个仍未解决分歧的最终回应
**分歧**：[描述]
**我的最终立场**：[不超过40字]

## 二、最终立场声明
【我的最终立场】[批准/需修改/建议驳回] — [一句话理由]
```

## 执行规则

1. **Phase 1 并行执行**：StepFun 和 DeepSeek 的 API 调用必须同时发起
2. **每个 Prompt 都要附带原始方案**：确保模型有完整上下文
3. **输出格式必须严格遵守**：字数限制是硬约束
4. **实时推送结果**：每完成一个阶段就输出结果，不要等所有阶段完成

## API 调用示例

```bash
# StepFun
curl -s -X POST "https://api.stepfun.com/step_plan/v1/chat/completions" \
  -H "Authorization: Bearer 3N4n0WKIa2B1lDkMXfDMaHQqTfZ1UA9KGIeh7fueVuC0HhHQazF4daUePgKemwWrH" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "step-3.5-flash-2603",
    "messages": [{"role": "user", "content": "..."}],
    "max_tokens": 16000,
    "temperature": 0.7
  }'

# DeepSeek
curl -s -X POST "https://api.deepseek.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-8e6102d12a394cd1822ee2503d54c137" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "..."}],
    "max_tokens": 8000,
    "temperature": 0.7
  }'

# MiniMax（Anthropic 格式）
curl -s -X POST "https://api.minimaxi.com/anthropic/v1/messages" \
  -H "x-api-key: sk-cp-TVuvlmq_fUfdvSwhbwPgAxgFoBCtPc1acKznw8MU2HeWtkWozK3ruBwFLNV2YKdlaYI5BCuiqQnWaI_kB6rmyrYw37SYXtIR1th4i71CR82WvLFT2kKZ_Ls" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiniMax-M2.7",
    "messages": [{"role": "user", "content": "..."}],
    "max_tokens": 8000
  }'
```

## 档位判定标准

- **标准档**：适用于常规方案评审、低风险决策
- **增强档**：适用于高风险、复杂架构、多方利益冲突、之前被驳回的方案复审
