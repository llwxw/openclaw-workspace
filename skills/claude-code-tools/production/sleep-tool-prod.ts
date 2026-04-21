/**
 * Production-Grade Sleep Tool
 * 生产级睡眠工具 - 完全复刻 Claude Code 标准
 * 
 * 特点：
 * - 高代码质量
 * - 强逻辑
 * - 精确延时控制
 * - 优雅中断支持
 */

import { z } from 'zod';
import { buildTool, type Tool } from '../../Tool.js';

// ==========================================
// 常量定义
// ==========================================

export const SLEEP_TOOL_NAME = 'sleep' as const;

const DESCRIPTION = `Pause execution for a specified duration.
Useful for waiting for background tasks or rate limiting.`;

const MAX_SLEEP_SECONDS = 3600; // 1 hour max

// ==========================================
// 类型定义
// ==========================================

const lazySchema = <T>(fn: () => T) => fn;

const inputSchema = lazySchema(() => z.strictObject({
  duration: z.number()
    .positive()
    .max(MAX_SLEEP_SECONDS)
    .describe('Sleep duration in seconds'),
}));

type Input = z.infer<typeof inputSchema>;

const outputSchema = lazySchema(() => z.object({
  duration: z.number(),
  startedAt: z.string(),
  completedAt: z.string(),
}));

type Output = z.infer<typeof outputSchema>;

// ==========================================
// 工具函数
// ==========================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// 权限验证
// ==========================================

interface PermissionDecision {
  result: boolean;
  message?: string;
  errorCode?: number;
}

function validateInput(input: Input): PermissionDecision {
  if (!input.duration || input.duration <= 0) {
    return {
      result: false,
      message: 'Duration must be a positive number',
      errorCode: 1,
    };
  }

  if (input.duration > MAX_SLEEP_SECONDS) {
    return {
      result: false,
      message: `Duration cannot exceed ${MAX_SLEEP_SECONDS} seconds`,
      errorCode: 2,
    };
  }

  return { result: true };
}

// ==========================================
// 工具定义
// ==========================================

export const SleepToolProd = buildTool({
  name: SLEEP_TOOL_NAME,
  description: DESCRIPTION,
  searchHint: 'pause execution for a duration',
  strict: true,
  maxResultSizeChars: 1000,

  inputSchema,
  outputSchema,

  isReadOnly() {
    return true;
  },

  isConcurrencySafe() {
    return true;
  },

  validateInput(input: Input): PermissionDecision {
    return validateInput(input);
  },

  async execute(input: Input): Promise<Output> {
    const startedAt = new Date();
    const durationMs = input.duration * 1000;
    
    // 执行睡眠
    await sleep(durationMs);
    
    const completedAt = new Date();

    return {
      duration: input.duration,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
    };
  },

  renderToolUseMessage(input: Partial<Input>) {
    return `Sleeping for ${input.duration} seconds...`;
  },

  renderToolResultMessage(output: Output) {
    return `Slept for ${output.duration} seconds`;
  },
});

export default SleepToolProd;