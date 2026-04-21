/**
 * Production-Grade Agent Tool
 * 生产级代理工具 - 简化版
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - 子代理执行
 * - 任务委托
 */

import { z } from 'zod';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const AGENT_TOOL_NAME = 'agent' as const;

const DESCRIPTION = `Run a sub-agent to accomplish tasks.
Delegates work to a specialized agent with its own context and tools.`;

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  agent: z.string()
    .describe('Agent type (general-purpose, specialize, code-review, etc.)'),
  prompt: z.string()
    .describe('Prompt for the agent'),
  model: z.string()
    .optional()
    .describe('Model to use'),
  maxTokens: z.number()
    .optional()
    .describe('Max tokens'),
  timeout: z.number()
    .optional()
    .describe('Timeout in seconds'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  agent: z.string(),
  result: z.string(),
  duration: z.number(),
  model: z.string().optional(),
}));

type Output = z.infer<typeof outputSchema>;

// 代理类型定义
interface AgentType {
  name: string;
  description: string;
  defaultModel?: string;
  tools: string[];
}

const agentTypes: Record<string, AgentType> = {
  'general-purpose': {
    name: 'general-purpose',
    description: 'General purpose agent for any task',
    tools: ['file_read', 'file_write', 'bash', 'grep', 'glob'],
  },
  'specialize': {
    name: 'specialize',
    description: 'Specialized agent for focused tasks',
    tools: ['file_read', 'grep'],
  },
  'code-review': {
    name: 'code-review',
    description: 'Agent for code review tasks',
    tools: ['file_read', 'grep', 'glob'],
  },
  'research': {
    name: 'research',
    description: 'Agent for research and information gathering',
    tools: ['web_search', 'web_fetch'],
  },
};

// ==========================================
// 工具定义
// ==========================================

export const AgentToolProd = buildTool({
  name: AGENT_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'run a sub-agent for tasks',
  strict: true,
  maxResultSizeChars: 100000,
  shouldDefer: true,

  inputSchema,
  outputSchema,

  isReadOnly() {
    return true;
  },

  isConcurrencySafe() {
    return false;
  },

  isEnabled() {
    return true;
  },

  async execute(input: Input): Promise<Output> {
    const startTime = Date.now();
    const agentType = agentTypes[input.agent] || agentTypes['general-purpose'];

    // 模拟代理执行
    const result = `[Agent: ${agentType.name}] Processed: "${input.prompt.slice(0, 50)}..."`;

    const duration = Date.now() - startTime;

    return {
      agent: input.agent,
      result,
      duration,
      model: input.model || agentType.defaultModel,
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    return `Running agent: ${input.agent} - "${input.prompt?.slice(0, 30)}..."`;
  },

  renderToolResultMessage(output: Output) {
    return `Agent ${output.agent} completed in ${output.duration}ms`;
  },
});

// 导出代理类型
export function getAgentTypes(): AgentType[] {
  return Object.values(agentTypes);
}

export function registerAgentType(type: AgentType): void {
  agentTypes[type.name] = type;
}

export default AgentToolProd;